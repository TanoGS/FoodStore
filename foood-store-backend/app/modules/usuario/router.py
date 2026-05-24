<<<<<<< Updated upstream
from ast import List

from fastapi import APIRouter, Depends, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from core.database import get_session
from .schemas import UsuarioCreate, UsuarioPublic, UsuarioList, UsuarioUpdate
=======
from fastapi import APIRouter, Depends, status, Response, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from typing import List, Optional

from core.database import get_session
# Importamos las utilidades de seguridad que construimos antes
from core.security import get_current_user_token, RoleChecker, TokenData 
from .schemas import UsuarioCreate, UsuarioPublic, UsuarioList, UsuarioUpdate, AsignarRolesInput
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
@router.get("/", response_model=UsuarioList)
def listar(offset: int = 0, limit: int = 20, svc: UsuarioService = Depends(get_usuario_service)):
    return svc.listar_usuarios(offset, limit)
=======

@router.get("/me", response_model=UsuarioPublic, summary="Obtener perfil propio")
def obtener_mi_perfil(
    current_user: TokenData = requiere_auth,
    svc: UsuarioService = Depends(get_usuario_service)
):
    """Devuelve los datos del usuario actualmente logueado según su Token."""
    return svc.obtener_usuario_por_id(int(current_user.id))


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
def listar_activos(
    offset: int = 0,
    limit: int = 20,
    rol: Optional[str] = Query(default=None, description="Filtrar por código de rol (ej: CLIENTE, ADMIN)"),
    svc: UsuarioService = Depends(get_usuario_service),
):
    """Lista usuarios activos con paginación. Acepta filtro opcional por código de rol. Solo ADMIN."""
    return svc.listar_usuarios(offset, limit, rol)
>>>>>>> Stashed changes

@router.patch("/{id}", response_model=UsuarioPublic, status_code=status.HTTP_200_OK, summary="Actualizar perfil de usuario")
def actualizar_usuario(
    id: int, 
    data: UsuarioUpdate, 
    svc: UsuarioService = Depends(get_usuario_service)
):
    return svc.actualizar_usuario(id, data)

<<<<<<< Updated upstream
@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Eliminar usuario (Soft Delete)")
def eliminar_usuario(
    id: int, 
    svc: UsuarioService = Depends(get_usuario_service)
):
=======
@router.get("/gestion", response_model=List[UsuarioPublic], tags=["Usuarios - Gestión"], dependencies=[Depends(requiere_admin)])
def listar_todos_los_usuarios(svc: UsuarioService = Depends(get_usuario_service)):
    """
    Lista TODOS los usuarios (activos e inactivos). 
    Ideal para el Panel de Control.
    """
    return svc.obtener_todos_los_usuarios()


@router.get("/{id}", response_model=UsuarioPublic, dependencies=[Depends(requiere_admin)])
def obtener_usuario_por_id(id: int, svc: UsuarioService = Depends(get_usuario_service)):
    """Obtiene un usuario por ID incluyendo sus roles. Solo ADMIN."""
    return svc.obtener_usuario_por_id(id)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Eliminar usuario (Soft Delete)", dependencies=[Depends(requiere_admin)])
def eliminar_usuario(id: int, svc: UsuarioService = Depends(get_usuario_service)):
    """Da de baja a un usuario. Operación exclusiva de administradores."""
>>>>>>> Stashed changes
    return svc.eliminar_logicamente(id)

@router.patch("/{id}/reactivar", response_model=UsuarioPublic, status_code=status.HTTP_200_OK, summary="Reactivar usuario eliminado")
def reactivar_usuario(
    id: int, 
    svc: UsuarioService = Depends(get_usuario_service)
):
    return svc.reactivar_usuario(id)

<<<<<<< Updated upstream
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
=======
@router.patch("/{id}/reactivar", response_model=UsuarioPublic, status_code=status.HTTP_200_OK, summary="Reactivar usuario eliminado", dependencies=[Depends(requiere_admin)])
def reactivar_usuario(id: int, svc: UsuarioService = Depends(get_usuario_service)):
    """Reactiva a un usuario dado de baja. Operación exclusiva de administradores."""
    return svc.reactivar_usuario(id)


@router.patch("/{id}/roles", response_model=UsuarioPublic, summary="Asignar roles a usuario")
def asignar_roles(
    id: int,
    data: AsignarRolesInput,
    token: TokenData = Depends(requiere_admin),
    svc: UsuarioService = Depends(get_usuario_service),
):
    """Reemplaza completamente los roles de un usuario por los indicados. Solo ADMIN."""
    return svc.asignar_roles(id, data.role_codigos, asignado_por_id=int(token.id))


@router.patch("/{id}", response_model=UsuarioPublic, summary="Actualizar usuario (Admin)", dependencies=[Depends(requiere_admin)])
def actualizar_usuario_admin(
    id: int,
    data: UsuarioUpdate,
    svc: UsuarioService = Depends(get_usuario_service),
):
    """Actualiza datos de cualquier usuario. Solo ADMIN."""
    return svc.actualizar_usuario(id, data)
>>>>>>> Stashed changes
