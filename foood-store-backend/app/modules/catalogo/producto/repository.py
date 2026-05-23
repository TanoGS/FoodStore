from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import Sequence

from core.repository import BaseRepository
from .models import Producto
from app.modules.catalogo.shared_models import ProductoIngrediente


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_activo(self, producto_id: int) -> Producto | None:
        return self.session.exec(
            select(Producto)
            .options(
                selectinload(Producto.categorias),
                selectinload(Producto.ingredientes_enlaces).selectinload(
                    ProductoIngrediente.ingrediente
                ),
            )
            .where(
                Producto.id == producto_id,
                Producto.eliminado_en == None,  # noqa: E711
            )
        ).first()

    def get_all_activos(self) -> Sequence[Producto]:
        return self.session.exec(
            select(Producto)
            .options(
                selectinload(Producto.categorias),
                selectinload(Producto.ingredientes_enlaces).selectinload(
                    ProductoIngrediente.ingrediente
                ),
            )
            .where(Producto.eliminado_en == None)  # noqa: E711
        ).unique().all()
