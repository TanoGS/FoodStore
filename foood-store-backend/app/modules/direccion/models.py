from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class DireccionEntrega(SQLModel, table=True):
    __tablename__ = "direccion_entrega"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id")
    
    calle: str = Field(max_length=100)
    numero: str = Field(max_length=10)
    piso: Optional[str] = Field(default=None, max_length=10)
    departamento: Optional[str] = Field(default=None, max_length=10)
    localidad: str = Field(max_length=100, default="Mendoza") # O tu ciudad base
    referencias: Optional[str] = Field(default=None, max_length=255)
    
    # RN-DE01: Para marcar cuál usar por defecto
    es_predeterminada: bool = Field(default=False)
    
    # Relación (Opcional, ayuda a traer las direcciones del usuario)
    # usuario: "Usuario" = Relationship(back_populates="direcciones")