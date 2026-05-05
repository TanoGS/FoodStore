from fastapi import APIRouter, Depends
from sqlmodel import Session
from core.database import get_session
from app.modules.auth.dependencies import get_current_user
from app.modules.usuario.models import Usuario
from .schemas import PedidoCreate, PedidoPublic
from .service import PedidoService
from typing import List

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

def get_pedido_service(session: Session = Depends(get_session)):
    return PedidoService(session)

@router.post("/", response_model=PedidoPublic)
def realizar_pedido(
    datos: PedidoCreate,
    current_user: Usuario = Depends(get_current_user),
    svc: PedidoService = Depends(get_pedido_service)
):
    """Crea un nuevo pedido capturando precios actuales."""
    return svc.crear_pedido(current_user.id, datos)

@router.get("/mis-pedidos", response_model=List[PedidoPublic])
def listar_mis_pedidos(
    current_user: Usuario = Depends(get_current_user),
    svc: PedidoService = Depends(get_pedido_service)
):
    """Historial de pedidos del cliente logueado."""
    return svc.repo.get_por_usuario(current_user.id)