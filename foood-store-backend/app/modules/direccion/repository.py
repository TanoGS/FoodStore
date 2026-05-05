from sqlmodel import Session, select
from typing import List
from .models import DireccionEntrega

class DireccionRepository:
    def __init__(self, session: Session):
        self.session = session

    def crear(self, direccion: DireccionEntrega) -> DireccionEntrega:
        self.session.add(direccion)
        self.session.commit()
        self.session.refresh(direccion)
        return direccion

    def get_by_usuario(self, usuario_id: int) -> List[DireccionEntrega]:
        """Trae todas las direcciones de un cliente específico."""
        statement = select(DireccionEntrega).where(DireccionEntrega.usuario_id == usuario_id)
        return list(self.session.exec(statement).all())

    def quitar_predeterminadas(self, usuario_id: int):
        """Pone en False todas las direcciones de un usuario (útil al elegir una nueva por defecto)."""
        direcciones = self.get_by_usuario(usuario_id)
        for dir in direcciones:
            dir.es_predeterminada = False
            self.session.add(dir)
        self.session.commit()