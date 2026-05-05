from fastapi import HTTPException
from sqlmodel import Session, select
from .models import Pedido, DetallePedido
from .repository import PedidoRepository
from app.modules.producto.models import Producto # Asegúrate de que esta ruta sea correcta

class PedidoService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = PedidoRepository(session)

    def crear_pedido(self, usuario_id: int, datos: any) -> Pedido:
        total_acumulado = 0
        detalles_objetos = []

        # 1. Validar productos y capturar precios (Snapshot)
        for item in datos.detalles:
            producto = self.session.get(Producto, item.producto_id)
            if not producto or not producto.activo:
                raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no disponible")
            
            precio_momento = producto.precio_base
            subtotal = precio_momento * item.cantidad
            total_acumulado += subtotal

            # Creamos el objeto detalle con el precio congelado
            nuevo_detalle = DetallePedido(
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio_unitario=precio_momento
            )
            detalles_objetos.append(nuevo_detalle)

        # 2. Crear el encabezado del Pedido
        nuevo_pedido = Pedido(
            usuario_id=usuario_id,
            direccion_envio=datos.direccion_envio,
            total=total_acumulado,
            detalles=detalles_objetos
        )

        return self.repo.guardar_pedido(nuevo_pedido)