from sqlmodel import Session, select
from typing import Sequence

from core.repository import BaseRepository
from .models import Ingrediente
class IngredienteRepository(BaseRepository[Ingrediente]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Ingrediente)

    def get_activo(self, ingrediente_id: int) -> Ingrediente | None:
        return self.session.exec(
            select(Ingrediente).where(
                Ingrediente.id == ingrediente_id,
                Ingrediente.eliminado_en == None,  # noqa: E711
            )
        ).first()

    def get_all_activos(self, offset: int = 0, limit: int = 50) -> Sequence[Ingrediente]:
        return self.session.exec(
            select(Ingrediente)
            .where(Ingrediente.eliminado_en == None)  # noqa: E711
            .offset(offset)
            .limit(limit)
        ).all()
