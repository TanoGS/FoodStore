import enum
from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship

# --- MÁQUINA DE ESTADOS DEL PEDIDO ---
class EstadoPedido(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    CONFIRMADO = "CONFIRMADO"
    EN_PREPARACION = "EN_PREPARACION"
    EN_CAMINO = "EN_CAMINO"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"

# --- MODELO: PEDIDO ---
class Pedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id")
    estado: EstadoPedido = Field(default=EstadoPedido.PENDIENTE)
    total: float = Field(default=0.0)
    direccion_envio: str = Field(max_length=255)
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    
    # Relaciones
    detalles: List["DetallePedido"] = Relationship(back_populates="pedido")
    
    # Relación con el Usuario (Opcional pero muy útil para el admin)
    # Nota: Asegúrate de que en tu modelo Usuario tengas: pedidos: List["Pedido"] = Relationship(back_populates="usuario")
    # usuario: "Usuario" = Relationship(back_populates="pedidos") 

# --- MODELO: DETALLE DE PEDIDO (Snapshot) ---
class DetallePedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    producto_id: int = Field(foreign_key="productos.id")
    
    cantidad: int
    precio_unitario: float  # ¡CRÍTICO! Guardamos el precio en este momento exacto
    
    # Relaciones
    pedido: Pedido = Relationship(back_populates="detalles")