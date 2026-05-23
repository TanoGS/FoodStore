from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from typing import List

from core.database import get_session
from .schemas import ProductoCreate, ProductoUpdate, ProductoPublic
from .service import ProductoService

router = APIRouter(prefix="/productos", tags=["Catálogo - Productos"])


def get_service(session: Session = Depends(get_session)) -> ProductoService:
    return ProductoService(session)


@router.post("", response_model=ProductoPublic, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, svc: ProductoService = Depends(get_service)):
    """
    Crea un plato final con escandallo automático:
    calcula costo de producción y precio de venta desde la receta enviada.
    """
    return svc.crear_producto(data)


@router.get("", response_model=List[ProductoPublic])
def listar_productos(svc: ProductoService = Depends(get_service)):
    """Lista todo el catálogo activo con recetas y costos."""
    return svc.listar_productos()


@router.get("/{producto_id}", response_model=ProductoPublic)
def obtener_producto(producto_id: int, svc: ProductoService = Depends(get_service)):
    """Obtiene un producto por ID con su receta completa."""
    return svc.obtener_producto(producto_id)


@router.patch("/{producto_id}", response_model=ProductoPublic)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    svc: ProductoService = Depends(get_service),
):
    """
    Actualiza un producto. Si se envía una nueva `receta`,
    el escandallo financiero se recalcula automáticamente.
    """
    return svc.actualizar_producto(producto_id, data)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int, svc: ProductoService = Depends(get_service)
):
    """Soft-delete: oculta el producto del catálogo sin borrarlo de la DB."""
    svc.eliminar_producto(producto_id)
