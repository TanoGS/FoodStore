from ast import List

from fastapi import APIRouter, Depends, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from core.database import get_session
from .schemas import UsuarioCreate, UsuarioPublic, UsuarioList, UsuarioUpdate
from .service import UsuarioService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

def get_usuario_service(session: Session = Depends(get_session)) -> UsuarioService:
    return UsuarioService(session)

# ==============================================================================
# 1. AUTENTICACIÓN Y REGISTRO
# ==============================================================================

@router.post("/registro", response_model=UsuarioPublic, status_code=status.HTTP_201_CREATED)
def registrar(data: UsuarioCreate, svc: UsuarioService = Depends(get_usuario_service)):
    return svc.registrar_usuario(data)

@router.post("/login", response_model=UsuarioPublic)
def login(
    response: Response,  # 👈 FastAPI inyecta la respuesta HTTP aquí
    form_data: OAuth2PasswordRequestForm = Depends(), 
    svc: UsuarioService = Depends(get_usuario_service)
):
    # Pasamos el objeto 'response' al servicio para que construya la Cookie
    return svc.login(form_data.username, form_data.password, response)

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    response: Response, 
    svc: UsuarioService = Depends(get_usuario_service)
):
    # Llamamos al servicio para que elimine la cookie del navegador
    return svc.logout(response)

# ==============================================================================
# 2. GESTIÓN DE PERFILES Y USUARIOS
# ==============================================================================
@router.get("/", response_model=UsuarioList)
def listar(offset: int = 0, limit: int = 20, svc: UsuarioService = Depends(get_usuario_service)):
    return svc.listar_usuarios(offset, limit)

@router.patch("/{id}", response_model=UsuarioPublic, status_code=status.HTTP_200_OK, summary="Actualizar perfil de usuario")
def actualizar_usuario(
    id: int, 
    data: UsuarioUpdate, 
    svc: UsuarioService = Depends(get_usuario_service)
):
    return svc.actualizar_usuario(id, data)

@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Eliminar usuario (Soft Delete)")
def eliminar_usuario(
    id: int, 
    svc: UsuarioService = Depends(get_usuario_service)
):
    return svc.eliminar_logicamente(id)

@router.patch("/{id}/reactivar", response_model=UsuarioPublic, status_code=status.HTTP_200_OK, summary="Reactivar usuario eliminado")
def reactivar_usuario(
    id: int, 
    svc: UsuarioService = Depends(get_usuario_service)
):
    return svc.reactivar_usuario(id)

@router.get("/gestion", response_model=list[UsuarioPublic], tags=["Usuarios - Gestión"])
def listar_todos_los_usuarios(
    svc: UsuarioService = Depends(get_usuario_service)
    # Aquí en el futuro puedes agregar la protección RBAC: 
    # current_user: TokenData = Depends(requiere_admin)
):
    """
    Lista todos los usuarios del sistema. 
    Ideal para el Panel de Control del Administrador.
    """
    return svc.obtener_todos_los_usuarios()
