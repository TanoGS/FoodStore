from fastapi import APIRouter, Depends
from typing import List
from sqlmodel import Session
from core.database import get_session
# 👇 Importamos la seguridad real
from app.modules.auth.dependencies import get_current_user
from app.modules.usuario.models import Usuario
from .schemas import DireccionCreate, DireccionPublic
from .service import DireccionService

router = APIRouter(prefix="/direcciones", tags=["Direcciones"])

def get_direccion_service(session: Session = Depends(get_session)):
    return DireccionService(session)

@router.post("/", response_model=DireccionPublic)
def crear_direccion(
    datos: DireccionCreate,
    # 👇 Cambiamos el ID hardcodeado por el usuario del Token
    current_user: Usuario = Depends(get_current_user),
    svc: DireccionService = Depends(get_direccion_service)
):
    """Crea una nueva dirección para el usuario autenticado (requiere Token)."""
    return svc.agregar_direccion(current_user.id, datos)

@router.get("/", response_model=List[DireccionPublic])
def mis_direcciones(
    # 👇 Solo un usuario logueado puede ver sus direcciones
    current_user: Usuario = Depends(get_current_user),
    svc: DireccionService = Depends(get_direccion_service)
):
    """Lista todas las direcciones guardadas por el usuario logueado."""
    return svc.listar_mis_direcciones(current_user.id)