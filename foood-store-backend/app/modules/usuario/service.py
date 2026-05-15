from fastapi import HTTPException, status
from datetime import datetime, timezone
from sqlmodel import Session, select 
from core.security import get_password_hash, verify_password, create_access_token
from .models import Usuario, Rol 
from .schemas import UsuarioCreate, UsuarioUpdate, Token, UsuarioPublic
from .unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def registrar_usuario(self, data: UsuarioCreate) -> UsuarioPublic:
        with UsuarioUnitOfWork(self._session) as uow:
            if uow.usuarios.get_by_email(data.email):
                raise HTTPException(status_code=400, detail="El email ya está registrado")
            
            nuevo_usuario = Usuario(
                **data.model_dump(exclude={"password", "role_ids"}), # Excluimos role_ids aquí
                password=get_password_hash(data.password)
            )

            # --- LÓGICA DE ASIGNACIÓN DE ROLES ---
            if data.role_ids:
                # Si enviamos IDs, buscamos esos roles y los asignamos
                for r_id in data.role_ids:
                    rol = self._session.get(Rol, r_id)
                    if rol:
                        nuevo_usuario.roles.append(rol)
            else:
                # Si no enviamos nada, asignamos CLIENTE por defecto (como antes)
                rol_cliente = self._session.exec(select(Rol).where(Rol.nombre == "CLIENTE")).first()
                if rol_cliente:
                    nuevo_usuario.roles.append(rol_cliente)
            # ---------------------------------------

            uow.usuarios.add(nuevo_usuario)
            self._session.flush()
            self._session.refresh(nuevo_usuario)
            return UsuarioPublic.model_validate(nuevo_usuario)

    def login(self, email: str, password_plana: str) -> dict:
        with UsuarioUnitOfWork(self._session) as uow:
            usuario = uow.usuarios.get_by_email(email)
            if not usuario or not verify_password(password_plana, usuario.password):
                raise HTTPException(status_code=401, detail="Credenciales incorrectas")
            
            if not usuario.activo:
                raise HTTPException(status_code=400, detail="Usuario inactivo")

            #  EL CAMBIO CLAVE PARA EL LOGIN 
            # Transformamos la lista de objetos Rol en una lista de strings (Ej: ["ADMIN", "CLIENTE"])
            roles_del_usuario = [rol.nombre for rol in usuario.roles]
            
            # Enviamos esa lista de strings a nuestro creador de tokens
            token = create_access_token(subject=str(usuario.id), roles=roles_del_usuario)
            
            # Empaquetamos al usuario en Pydantic ANTES de que UoW cierre la sesión
            usuario_pydantic = UsuarioPublic.model_validate(usuario)
            
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": usuario_pydantic  # Devolvemos el objeto seguro
            }

    def listar_usuarios(self, offset: int, limit: int):
        with UsuarioUnitOfWork(self._session) as uow:
            usuarios_orm = uow.usuarios.get_all_activos(offset, limit)
            total = uow.usuarios.count_activos()
            
            usuarios_pydantic = [UsuarioPublic.model_validate(u) for u in usuarios_orm]
            
            return {"data": usuarios_pydantic, "total": total}
        
    def eliminar_logicamente(self, usuario_id: int) -> dict:
        with UsuarioUnitOfWork(self._session) as uow:
            usuario = self._session.get(Usuario, usuario_id)
            
            if not usuario:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            if usuario.eliminado_en is not None:
                raise HTTPException(status_code=400, detail="El usuario ya se encuentra eliminado")

            usuario.eliminado_en = datetime.now(timezone.utc)
            usuario.activo = False
            
            uow.usuarios.add(usuario)
            
            return {"message": f"Usuario {usuario_id} eliminado lógicamente con éxito"}

    def reactivar_usuario(self, usuario_id: int) -> UsuarioPublic:
        with UsuarioUnitOfWork(self._session) as uow:
            usuario = self._session.get(Usuario, usuario_id)
            
            if not usuario:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            if usuario.eliminado_en is None:
                raise HTTPException(status_code=400, detail="El usuario no está eliminado")

            usuario.eliminado_en = None
            usuario.activo = True
            
            uow.usuarios.add(usuario)
            
            self._session.flush()
            self._session.refresh(usuario)
            
            return UsuarioPublic.model_validate(usuario)
        
    def listar_para_gestion(self, offset: int, limit: int):
        with UsuarioUnitOfWork(self._session) as uow:
            usuarios_orm = uow.usuarios.get_all_incluyendo_eliminados(offset, limit)
            total = uow.usuarios.count_total()
            
            data = [UsuarioPublic.model_validate(u) for u in usuarios_orm]
            
            return {"data": data, "total": total}