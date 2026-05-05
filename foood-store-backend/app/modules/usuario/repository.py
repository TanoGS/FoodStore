import datetime

from sqlmodel import Session, select
from core.repository import BaseRepository
from .models import Usuario
from typing import Optional

class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_email(self, email: str) -> Optional[Usuario]:
        return self.session.exec(
            select(Usuario).where(
                Usuario.email == email,
                Usuario.eliminado_en == None
            )
        ).first()

    def get_all_activos(self, offset: int = 0, limit: int = 20) -> list[Usuario]:
        return list(self.session.exec(
            select(Usuario).where(Usuario.eliminado_en == None).offset(offset).limit(limit)
        ).all())

    def count_activos(self) -> int:
        return len(self.session.exec(
            select(Usuario).where(Usuario.eliminado_en == None)
        ).all())
    
    def get_all_incluyendo_eliminados(self, offset: int = 0, limit: int = 20) -> list[Usuario]:
        """Trae absolutamente todos los usuarios sin filtros de eliminación."""
        return list(
            self.session.exec(
                select(Usuario)
                .offset(offset)
                .limit(limit)
            ).all()
        )

    def count_total(self) -> int:
        """Cuenta el total absoluto de usuarios en la base de datos."""
        return len(self.session.exec(select(Usuario)).all())
    
    # Cuando ELIMINAS a un usuario:
    def eliminar_usuario(self, usuario: Usuario):
     usuario.eliminado_en = datetime.utcnow()
     usuario.activo = False 
     self.session.add(usuario)
     # self.session.commit() 
     # (o el uow.commit() según como lo tengas)

     # Cuando REACTIVAS a un usuario:
    def reactivar_usuario(self, usuario: Usuario):
     usuario.eliminado_en = None
     usuario.activo = True #  Asegurarnos de que vuelva a estar activo
     self.session.add(usuario)
     #self.session.commit()