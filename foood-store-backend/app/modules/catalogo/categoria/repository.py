from sqlmodel import Session, select
from typing import Sequence

from core.repository import BaseRepository
from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_activo(self, categoria_id: int) -> Categoria | None:
        return self.session.exec(
            select(Categoria).where(
                Categoria.id == categoria_id,
                Categoria.eliminado_en == None,  # noqa: E711
            )
        ).first()

    def get_all_raiz(self) -> Sequence[Categoria]:
        return self.session.exec(
            select(Categoria).where(
                Categoria.parent_id == None,  # noqa: E711
                Categoria.eliminado_en == None,  # noqa: E711
            )
        ).all()

    def get_all_activos(self) -> Sequence[Categoria]:
        return self.session.exec(
            select(Categoria).where(Categoria.eliminado_en == None)  # noqa: E711
        ).all()
