from typing import Optional, List
from sqlmodel import SQLModel
from datetime import datetime
from .models import RolUsuario

class UsuarioBase(SQLModel):
    email: str
    nombre: str
    apellido: str
    rol: RolUsuario = RolUsuario.CLIENTE

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(SQLModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    rol: Optional[RolUsuario] = None
    activo: Optional[bool] = None

class UsuarioPublic(UsuarioBase):
    id: int
    activo: bool
    creado_en: datetime

class UsuarioList(SQLModel):
    data: List[UsuarioPublic]
    total: int

class Token(SQLModel):
    access_token: str
    token_type: str
    user: UsuarioPublic