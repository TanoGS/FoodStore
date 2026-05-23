from fastapi import HTTPException, status
from datetime import datetime, timezone
from sqlmodel import Session

from .unit_of_work import CategoriaUnitOfWork
from .models import Categoria
from .schemas import CategoriaCreate, CategoriaUpdate, CategoriaPublic


class CategoriaService:
    def __init__(self, session: Session) -> None:
        self._session = session

    # ------------------------------------------------------------------
    def crear_categoria(self, data: CategoriaCreate) -> CategoriaPublic:
        uow = CategoriaUnitOfWork(self._session)
        with uow:
            if data.parent_id:
                parent = uow.categorias.get_by_id(data.parent_id)
                if not parent:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Categoría padre no encontrada",
                    )
            categoria = Categoria(**data.model_dump())
            result = uow.categorias.add(categoria)
        return CategoriaPublic.model_validate(result)

    # ------------------------------------------------------------------
    def listar_categorias_raiz(self) -> list[CategoriaPublic]:
        uow = CategoriaUnitOfWork(self._session)
        with uow:
            categorias = uow.categorias.get_all_raiz()
        return [CategoriaPublic.model_validate(c) for c in categorias]

    def listar_todas(self) -> list[CategoriaPublic]:
        uow = CategoriaUnitOfWork(self._session)
        with uow:
            categorias = uow.categorias.get_all_activos()
        return [CategoriaPublic.model_validate(c) for c in categorias]

    # ------------------------------------------------------------------
    def obtener_categoria(self, categoria_id: int) -> CategoriaPublic:
        uow = CategoriaUnitOfWork(self._session)
        with uow:
            categoria = uow.categorias.get_activo(categoria_id)
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada",
            )
        return CategoriaPublic.model_validate(categoria)

    # ------------------------------------------------------------------
    def actualizar_categoria(
        self, categoria_id: int, data: CategoriaUpdate
    ) -> CategoriaPublic:
        uow = CategoriaUnitOfWork(self._session)
        with uow:
            categoria = uow.categorias.get_activo(categoria_id)
            if not categoria:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoría no encontrada",
                )
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(categoria, key, value)
            result = uow.categorias.add(categoria)
        return CategoriaPublic.model_validate(result)

    # ------------------------------------------------------------------
    def eliminar_categoria(self, categoria_id: int) -> None:
        uow = CategoriaUnitOfWork(self._session)
        with uow:
            categoria = uow.categorias.get_activo(categoria_id)
            if not categoria:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoría no encontrada",
                )
            categoria.eliminado_en = datetime.now(timezone.utc)
            uow.categorias.add(categoria)
