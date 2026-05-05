from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

STOCK_ALERTA = 3  # Umbral de alerta de stock bajo

class Ingrediente(SQLModel, table=True):
    __tablename__ = "ingrediente"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True, max_length=100)
    es_alergeno: bool = Field(default=False)
    cantidad: int = Field(default=0, ge=0)  # Stock del ingrediente

    # Soft Delete
    eliminado_en: Optional[datetime] = Field(default=None)