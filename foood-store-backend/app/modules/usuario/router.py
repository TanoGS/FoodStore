from fastapi import APIRouter, Depends, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from core.database import get_session
from .schemas import UsuarioCreate, UsuarioPublic, UsuarioList, Token
from .service import UsuarioService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

def get_usuario_service(session: Session = Depends(get_session)) -> UsuarioService:
    return UsuarioService(session)

@router.post("/registro", response_model=UsuarioPublic, status_code=status.HTTP_201_CREATED)
def registrar(data: UsuarioCreate, svc: UsuarioService = Depends(get_usuario_service)):
    return svc.registrar_usuario(data)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), svc: UsuarioService = Depends(get_usuario_service)):
    return svc.login(form_data.username, form_data.password)

@router.get("/", response_model=UsuarioList)
def listar(offset: int = 0, limit: int = 20, svc: UsuarioService = Depends(get_usuario_service)):
    return svc.listar_usuarios(offset, limit)

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

@router.get("/gestion", response_model=UsuarioList)
def listar_gestion(
    offset: int = 0, 
    limit: int = 100, 
    svc: UsuarioService = Depends(get_usuario_service)
):
    """Endpoint exclusivo para el panel de administración."""
    return svc.listar_para_gestion(offset, limit)