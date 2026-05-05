from typing import Optional
from pydantic import BaseModel

class DireccionBase(BaseModel):
    calle: str
    numero: str
    piso: Optional[str] = None
    departamento: Optional[str] = None
    localidad: str = "Mendoza"
    referencias: Optional[str] = None
    es_predeterminada: bool = False

class DireccionCreate(DireccionBase):
    pass

class DireccionPublic(DireccionBase):
    id: int
    usuario_id: int