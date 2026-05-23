from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from typing import List

from core.database import get_session
from .schemas import CategoriaCreate, CategoriaUpdate, CategoriaPublic
from .service import CategoriaService

router = APIRouter(prefix="/categorias", tags=["Catálogo - Categorías"])


def get_service(session: Session = Depends(get_session)) -> CategoriaService:
    return CategoriaService(session)


@router.post("", response_model=CategoriaPublic, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, svc: CategoriaService = Depends(get_service)):
    """Crea una nueva sección para el menú (ej: 'Hamburguesas', 'Bebidas')."""
    return svc.crear_categoria(data)


@router.get("", response_model=List[CategoriaPublic])
def listar_categorias(
    solo_raiz: bool = True, svc: CategoriaService = Depends(get_service)
):
    """Devuelve categorías. Con `solo_raiz=true` solo las principales (sin padre)."""
    if solo_raiz:
        return svc.listar_categorias_raiz()
    return svc.listar_todas()


@router.get("/{categoria_id}", response_model=CategoriaPublic)
def obtener_categoria(categoria_id: int, svc: CategoriaService = Depends(get_service)):
    """Obtiene una categoría por ID."""
    return svc.obtener_categoria(categoria_id)


@router.patch("/{categoria_id}", response_model=CategoriaPublic)
def actualizar_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    svc: CategoriaService = Depends(get_service),
):
    """Actualiza los campos enviados de una categoría."""
    return svc.actualizar_categoria(categoria_id, data)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    categoria_id: int, svc: CategoriaService = Depends(get_service)
):
    """Soft-delete: marca la categoría como eliminada (no la borra de la DB)."""
    svc.eliminar_categoria(categoria_id)
