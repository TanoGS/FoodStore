from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
import app.modules.usuario.models

# 1. Tabla Intermedia: Usuario_Rol (Muchos a Muchos)
class UsuarioRol(SQLModel, table=True):
    __tablename__ = "usuarios_roles"
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuarios.id", primary_key=True)
    rol_id: Optional[int] = Field(default=None, foreign_key="roles.id", primary_key=True)

# 2. Tabla: Rol
class Rol(SQLModel, table=True):
    __tablename__ = "roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True) # Ej: "ADMIN", "CLIENTE", "GESTOR_PEDIDOS"
    descripcion: Optional[str] = None
    
    # Relación inversa con Usuarios a través de la tabla intermedia
    usuarios: List["Usuario"] = Relationship(back_populates="roles", link_model=UsuarioRol)

# 3. Tabla: Usuario
class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password: str
    nombre: str
    apellido: str
    activo: bool = Field(default=True)
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    eliminado_en: Optional[datetime] = Field(default=None)
    
    # Relación Muchos a Muchos con Roles
    roles: List[Rol] = Relationship(back_populates="usuarios", link_model=UsuarioRol)
    
    # Relación con Direcciones
    direcciones: List["app.modules.usuario.models.DireccionEntrega"] = Relationship(back_populates="usuario")

# 4. Tabla: Direccion_Entrega
class DireccionEntrega(SQLModel, table=True):
    __tablename__ = "direcciones_entrega"
    id: Optional[int] = Field(default=None, primary_key=True)
    calle: str
    numero: str
    piso: Optional[str] = None
    departamento: Optional[str] = None
    localidad: str = Field(default="Mendoza")
    referencias: Optional[str] = None
    es_principal: bool = Field(default=False)
    
    # Relación con Usuario
    usuario_id: int = Field(foreign_key="usuarios.id")
    usuario: Usuario = Relationship(back_populates="direcciones")