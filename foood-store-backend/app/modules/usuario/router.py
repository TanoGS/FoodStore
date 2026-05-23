from fastapi import APIRouter, Depends, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from typing import List

from core.database import get_session
# Importamos las utilidades de seguridad que construimos antes
from core.security import get_current_user_token, RoleChecker, TokenData 
from .schemas import UsuarioCreate, UsuarioPublic, UsuarioList, UsuarioUpdate
from .service import UsuarioService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

def get_usuario_service(session: Session = Depends(get_session)) -> UsuarioService:
    return UsuarioService(session)

# Instanciamos los chequeadores de roles
requiere_admin = RoleChecker(["ADMIN"])
requiere_auth = Depends(get_current_user_token) # Solo estar logueado

# ==============================================================================
# 1. AUTENTICACIÓN Y REGISTRO (Rutas Públicas)
# ==============================================================================

@router.post("/registro", response_model=UsuarioPublic, status_code=status.HTTP_201_CREATED)
def registrar(data: UsuarioCreate, svc: UsuarioService = Depends(get_usuario_service)):
    return svc.registrar_usuario(data)


@router.post("/login", response_model=UsuarioPublic)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    svc: UsuarioService = Depends(get_usuario_service)
):
    return svc.login(form_data.username, form_data.password, response)


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    response: Response, 
    svc: UsuarioService = Depends(get_usuario_service)
):
    return svc.logout(response)


# ==============================================================================
# 2. PERFIL DE USUARIO (Rutas Protegidas - Solo Logueados)
# ==============================================================================

@router.get("/me", response_model=UsuarioPublic, summary="Obtener perfil propio")
def obtener_mi_perfil(
    current_user: TokenData = requiere_auth,
    svc: UsuarioService = Depends(get_usuario_service)
):
    """Devuelve los datos del usuario actualmente logueado según su Token."""
    # Como el token guarda el ID en formato string, lo pasamos a int
    usuario_id = int(current_user.id)
    
    # Reutilizamos el servicio para buscarlo. 
    # (Nota: En un proyecto real podrías agregar un método 'obtener_por_id' al servicio)
    with svc._session as session:
        # Importación local para evitar ciclos si es necesario, 
        # o puedes agregar `get_usuario_por_id` en tu service.py
        from .models import Usuario 
        from sqlalchemy.orm import selectinload
        from sqlmodel import select
        
        statement = select(Usuario).where(Usuario.id == usuario_id).options(selectinload(Usuario.roles_enlaces))
        usuario = session.exec(statement).first()
        return UsuarioPublic.model_validate(usuario)


@router.patch("/me", response_model=UsuarioPublic, summary="Actualizar perfil propio")
def actualizar_mi_perfil(
    data: UsuarioUpdate,
    current_user: TokenData = requiere_auth,
    svc: UsuarioService = Depends(get_usuario_service)
):
    """Permite al usuario logueado actualizar su propia información."""
    usuario_id = int(current_user.id)
    return svc.actualizar_usuario(usuario_id, data)


# ==============================================================================
# 3. GESTIÓN ADMINISTRATIVA (Rutas Protegidas - Solo ADMIN)
# ==============================================================================

@router.get("/", response_model=UsuarioList, dependencies=[Depends(requiere_admin)])
def listar_activos(offset: int = 0, limit: int = 20, svc: UsuarioService = Depends(get_usuario_service)):
    """Lista usuarios activos. Solo disponible para administradores."""
    return svc.listar_usuarios(offset, limit)


@router.get("/gestion", response_model=List[UsuarioPublic], tags=["Usuarios - Gestión"], dependencies=[Depends(requiere_admin)])
def listar_todos_los_usuarios(svc: UsuarioService = Depends(get_usuario_service)):
    """
    Lista TODOS los usuarios (activos e inactivos). 
    Ideal para el Panel de Control.
    """
    return svc.obtener_todos_los_usuarios()


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Eliminar usuario (Soft Delete)", dependencies=[Depends(requiere_admin)])
def eliminar_usuario(id: int, svc: UsuarioService = Depends(get_usuario_service)):
    """Da de baja a un usuario. Operación exclusiva de administradores."""
    return svc.eliminar_logicamente(id)


@router.patch("/{id}/reactivar", response_model=UsuarioPublic, status_code=status.HTTP_200_OK, summary="Reactivar usuario eliminado", dependencies=[Depends(requiere_admin)])
def reactivar_usuario(id: int, svc: UsuarioService = Depends(get_usuario_service)):
    """Reactiva a un usuario dado de baja. Operación exclusiva de administradores."""
    return svc.reactivar_usuario(id)