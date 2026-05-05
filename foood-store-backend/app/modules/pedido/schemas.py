from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .models import EstadoPedido

class DetallePedidoCreate(BaseModel):
    producto_id: int
    cantidad: int

class PedidoCreate(BaseModel):
    direccion_envio: str # Aquí el front envía la dirección ya formateada como texto
    detalles: List[DetallePedidoCreate]

class DetallePedidoPublic(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float

class PedidoPublic(BaseModel):
    id: int
    estado: EstadoPedido
    total: float
    direccion_envio: str
    creado_en: datetime
    detalles: List[DetallePedidoPublic]