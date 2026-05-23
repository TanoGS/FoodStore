from pydantic import BaseModel, Field
from typing import Optional


class CategoriaBase(BaseModel):
    nombre: str = Field(..., max_length=50)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    activo: bool = True
    parent_id: Optional[int] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, max_length=50)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    activo: Optional[bool] = None
    parent_id: Optional[int] = None


class CategoriaPublic(CategoriaBase):
    id: int

    class Config:
        from_attributes = True
