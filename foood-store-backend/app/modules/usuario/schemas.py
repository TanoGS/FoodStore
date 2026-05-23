from pydantic import BaseModel, EmailStr, model_validator, Field
from typing import List, Optional
from datetime import datetime

# ==============================================================================
# 1. ESQUEMA: RolPublic
# ==============================================================================
class RolPublic(BaseModel):
    codigo: str  
    nombre: str  
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True


# ==============================================================================
# 2. ESQUEMAS: Usuario (Estructura de Datos e Inputs)
# ==============================================================================
class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str = Field(..., max_length=50)
    apellido: str = Field(..., max_length=50)
    cel: Optional[str] = Field(default=None, max_length=20)


class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=8)
    # Lista de códigos de roles a asignar (Ej: ["GESTOR_STOCK"])
    role_codigos: Optional[List[str]] = None  


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, max_length=50)
    apellido: Optional[str] = Field(default=None, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8)
    cel: Optional[str] = Field(default=None, max_length=20)
    activo: Optional[bool] = None


class UsuarioPublic(UsuarioBase):
    id: int
    activo: bool
    creado_en: datetime
    actualizado_en: Optional[datetime] = None  
    roles: List[RolPublic] = []

    class Config:
        from_attributes = True

    @model_validator(mode="before")
    @classmethod
    def aplanar_roles_enlaces(cls, data):
        """
        Intercepta la instancia del modelo SQLAlchemy antes de que Pydantic la procese.
        Extrae la entidad Rol pura desde la tabla asociativa UsuarioRol.
        """
        # Verificamos si data es un objeto SQLAlchemy (tiene el atributo) o un diccionario
        if hasattr(data, "roles_enlaces"):
            roles_reales = [enlace.rol for enlace in data.roles_enlaces if enlace.rol]
            
            return {
                "id": data.id,
                "email": data.email,
                "nombre": data.nombre,
                "apellido": data.apellido,
                "cel": data.cel,
                "activo": data.activo,
                "creado_en": data.creado_en,
                "actualizado_en": data.actualizado_en,
                "roles": roles_reales
            }
        return data


# ==============================================================================
# 3. ESQUEMAS: Respuestas de Colecciones
# ==============================================================================
class UsuarioList(BaseModel):
    data: List[UsuarioPublic]
    total: int