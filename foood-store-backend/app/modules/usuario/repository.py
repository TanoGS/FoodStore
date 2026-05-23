from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from core.repository import BaseRepository
from .models import Usuario, UsuarioRol
from typing import Optional

class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_email(self, email: str) -> Optional[Usuario]:
        statement = (
            select(Usuario)
            .where(Usuario.email == email, Usuario.eliminado_en == None)
            .options(
                selectinload(Usuario.roles_enlaces).selectinload(UsuarioRol.rol)
            )
        )
        return self.session.exec(statement).first()

    def get_all_activos(self, offset: int = 0, limit: int = 20) -> list[Usuario]:
        statement = (
            select(Usuario)
            .where(Usuario.eliminado_en == None)
            .offset(offset)
            .limit(limit)
            .options(
                selectinload(Usuario.roles_enlaces).selectinload(UsuarioRol.rol)
            )
        )
        return list(self.session.exec(statement).all())

    def count_activos(self) -> int:
        # CORREGIDO: Conteo optimizado directamente en el motor SQL
        statement = select(func.count(Usuario.id)).where(Usuario.eliminado_en == None)
        return self.session.exec(statement).one()
    
    def get_all_incluyendo_eliminados(self, offset: int = 0, limit: int = 20) -> list[Usuario]:
        statement = (
            select(Usuario)
            .offset(offset)
            .limit(limit)
            .options(
                selectinload(Usuario.roles_enlaces).selectinload(UsuarioRol.rol)
            )
        )
        return list(self.session.exec(statement).all())

    def count_total(self) -> int:
        # CORREGIDO: Conteo optimizado directamente en el motor SQL
        statement = select(func.count(Usuario.id))
        return self.session.exec(statement).one()
    
    def eliminar_usuario(self, usuario: Usuario):
        usuario.eliminado_en = datetime.now(timezone.utc)
        usuario.activo = False 
        self.session.add(usuario)