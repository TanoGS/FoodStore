from fastapi import HTTPException, status
from datetime import datetime, timezone
from sqlmodel import Session
from core.security import get_password_hash, verify_password, create_access_token
from .models import Usuario
from .schemas import UsuarioCreate, UsuarioUpdate, Token, UsuarioPublic
from .unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def registrar_usuario(self, data: UsuarioCreate) -> UsuarioPublic:
        with UsuarioUnitOfWork(self._session) as uow:
            # 1. Validamos que el email no exista
            if uow.usuarios.get_by_email(data.email):
                raise HTTPException(status_code=400, detail="El email ya está registrado")
            
            # 2. Creamos el objeto ORM con la contraseña encriptada
            nuevo_usuario = Usuario(
                **data.model_dump(exclude={"password"}),
                password=get_password_hash(data.password)
            )
            uow.usuarios.add(nuevo_usuario)
            
            # 👇 LA SOLUCIÓN 👇
            # 3. Forzamos a la BD a generar el "id" y "creado_en" sin cerrar la sesión
            self._session.flush()
            self._session.refresh(nuevo_usuario)
            
            # 4. Lo empaquetamos de forma segura en Pydantic ANTES de salir del bloque "with"
            return UsuarioPublic.model_validate(nuevo_usuario)

    def login(self, email: str, password_plana: str) -> dict:
        with UsuarioUnitOfWork(self._session) as uow:
            usuario = uow.usuarios.get_by_email(email)
            if not usuario or not verify_password(password_plana, usuario.password):
                raise HTTPException(status_code=401, detail="Credenciales incorrectas")
            
            if not usuario.activo:
                raise HTTPException(status_code=400, detail="Usuario inactivo")

            token = create_access_token(subject=usuario.id, roles=usuario.rol.value)
            
            # 👇 AQUÍ ESTÁ LA MAGIA 👇
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
            
            # 👇 LA MAGIA ESTÁ AQUÍ 👇
            # Convertimos cada usuario de BD a un esquema de Pydantic ANTES de que se cierre la sesión
            usuarios_pydantic = [UsuarioPublic.model_validate(u) for u in usuarios_orm]
            
            # Devolvemos los datos ya empaquetados
            return {"data": usuarios_pydantic, "total": total}
        
    def eliminar_logicamente(self, usuario_id: int) -> dict:
        """Marca un usuario como eliminado sin borrarlo de la base de datos."""
        with UsuarioUnitOfWork(self._session) as uow:
            # 1. Buscamos al usuario (usamos session.get para encontrarlo incluso si ya está borrado)
            usuario = self._session.get(Usuario, usuario_id)
            
            if not usuario:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            if usuario.eliminado_en is not None:
                raise HTTPException(status_code=400, detail="El usuario ya se encuentra eliminado")

            # 2. Le ponemos la fecha de eliminación y lo desactivamos
            usuario.eliminado_en = datetime.now(timezone.utc)
            usuario.activo = False
            
            # 3. Guardamos los cambios
            uow.usuarios.add(usuario)
            
            return {"message": f"Usuario {usuario_id} eliminado lógicamente con éxito"}

    def reactivar_usuario(self, usuario_id: int) -> UsuarioPublic:
        """Revierte el soft delete y vuelve a activar al usuario."""
        with UsuarioUnitOfWork(self._session) as uow:
            # 1. Buscamos al usuario
            usuario = self._session.get(Usuario, usuario_id)
            
            if not usuario:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            if usuario.eliminado_en is None:
                raise HTTPException(status_code=400, detail="El usuario no está eliminado")

            # 2. Le quitamos la fecha de eliminación y lo volvemos a activar
            usuario.eliminado_en = None
            usuario.activo = True
            
            uow.usuarios.add(usuario)
            
            # 3. Forzamos la actualización en BD y lo devolvemos limpio
            self._session.flush()
            self._session.refresh(usuario)
            
            return UsuarioPublic.model_validate(usuario)
        
    def listar_para_gestion(self, offset: int, limit: int):
        """Lista todos los usuarios (activos e inactivos) para el panel de Admin."""
        with UsuarioUnitOfWork(self._session) as uow:
            usuarios_orm = uow.usuarios.get_all_incluyendo_eliminados(offset, limit)
            total = uow.usuarios.count_total()
            
            # Convertimos a Pydantic antes de cerrar la sesión
            data = [UsuarioPublic.model_validate(u) for u in usuarios_orm]
            
            return {"data": data, "total": total}