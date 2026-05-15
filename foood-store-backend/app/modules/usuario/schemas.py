from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# 1. Molde para mostrar los roles del usuario
class RolPublic(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True

# 2. Base del usuario
class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str
    apellido: str

# 3. Datos necesarios para registrarse
class UsuarioCreate(UsuarioBase):
    password: str
    # Nota: No pedimos el rol aquí. El servicio le asignará "CLIENTE" por defecto.

# 4. Datos que devolvemos al frontend (SIN la contraseña)
class UsuarioPublic(UsuarioBase):
    id: int
    activo: bool
    creado_en: datetime
    # 👇 EL CAMBIO CLAVE: Ahora devolvemos una lista de roles
    roles: List[RolPublic] = []

    class Config:
        from_attributes = True

class UsuarioList(BaseModel):
    data: List[UsuarioPublic]
    total: int

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UsuarioPublic

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    activo: Optional[bool] = None

class UsuarioCreate(UsuarioBase):
    password: str
    #  Agregamos esto para poder pasar IDs de roles al crear
    role_ids: Optional[List[int]] = None