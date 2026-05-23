from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import BigInteger, DateTime
from typing import List, Optional
from datetime import datetime, timezone

# Función auxiliar para obtener la fecha y hora actual en UTC
def get_utc_now():
    return datetime.now(timezone.utc)

# ==============================================================================
# 1. TABLA INTERMEDIA: usuarios_roles
# ==============================================================================
class UsuarioRol(SQLModel, table=True):
    __tablename__ = "usuarios_roles"
    
    usuario_id: int = Field(
        default=None, 
        foreign_key="usuarios.id", 
        primary_key=True,
        sa_type=BigInteger  
    )
    rol_codigo: str = Field(
        default=None, 
        foreign_key="roles.codigo", 
        primary_key=True,
        max_length=20
    )
    
    asignado_por_id: Optional[int] = Field(
        default=None, 
        foreign_key="usuarios.id",
        sa_type=BigInteger,  
        nullable=True
    )
    
    expires_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))

    usuario: "Usuario" = Relationship(
        back_populates="roles_enlaces",
        sa_relationship_kwargs={"foreign_keys": "[UsuarioRol.usuario_id]"}
    )
    asignador: Optional["Usuario"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[UsuarioRol.asignado_por_id]"}
    )
    rol: "Rol" = Relationship(back_populates="usuarios_enlaces")


# ==============================================================================
# 2. TABLA INTERMEDIA: roles_permisos
# ==============================================================================
class RolPermiso(SQLModel, table=True):
    __tablename__ = "roles_permisos"
    
    rol_codigo: str = Field(default=None, foreign_key="roles.codigo", primary_key=True, max_length=20)
    permiso_id: int = Field(default=None, foreign_key="permisos.id", primary_key=True)


# ==============================================================================
# 3. TABLA: permisos
# ==============================================================================
class Permiso(SQLModel, table=True):
    __tablename__ = "permisos"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, max_length=50)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    
    roles: List["Rol"] = Relationship(back_populates="permisos", link_model=RolPermiso)


# ==============================================================================
# 4. TABLA: roles
# ==============================================================================
class Rol(SQLModel, table=True):
    __tablename__ = "roles"
    
    codigo: str = Field(primary_key=True, max_length=20)
    nombre: str = Field(unique=True, index=True, max_length=50)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    
    usuarios_enlaces: List[UsuarioRol] = Relationship(back_populates="rol")
    permisos: List[Permiso] = Relationship(back_populates="roles", link_model=RolPermiso)


# ==============================================================================
# 5. TABLA: usuarios
# ==============================================================================
class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"
    
    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    email: str = Field(unique=True, index=True, max_length=100)
    password: str = Field(max_length=255)
    nombre: str = Field(max_length=50)
    apellido: str = Field(max_length=50)
    cel: Optional[str] = Field(default=None, max_length=20)
    activo: bool = Field(default=True)
    
    # Campos de auditoría y soft-delete con soporte timezone
    creado_en: datetime = Field(default_factory=get_utc_now, sa_type=DateTime(timezone=True))
    actualizado_en: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    eliminado_en: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    
    roles_enlaces: List[UsuarioRol] = Relationship(
        back_populates="usuario",
        sa_relationship_kwargs={"foreign_keys": "[UsuarioRol.usuario_id]", "cascade": "all, delete-orphan"}
    )
    direcciones: List["DireccionEntrega"] = Relationship(back_populates="usuario", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


# ==============================================================================
# 6. TABLA: direcciones_entrega
# ==============================================================================
class DireccionEntrega(SQLModel, table=True):
    __tablename__ = "direcciones_entrega"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    calle: str = Field(max_length=100)
    numero: str = Field(max_length=20)
    piso: Optional[str] = Field(default=None, max_length=10)
    departamento: Optional[str] = Field(default=None, max_length=10)
    ciudad: str = Field(max_length=100)
    codigo_postal: str = Field(max_length=20)
    predeterminada: bool = Field(default=False)
    
    usuario_id: int = Field(foreign_key="usuarios.id", sa_type=BigInteger)
    
    # Auditoría también para direcciones
    creado_en: datetime = Field(default_factory=get_utc_now, sa_type=DateTime(timezone=True))
    actualizado_en: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    
    usuario: Usuario = Relationship(back_populates="direcciones")