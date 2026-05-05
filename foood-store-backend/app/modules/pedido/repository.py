from sqlmodel import Session, select
from .models import Pedido, DetallePedido

class PedidoRepository:
    def __init__(self, session: Session):
        self.session = session

    def guardar_pedido(self, pedido: Pedido) -> Pedido:
        self.session.add(pedido)
        self.session.commit()
        self.session.refresh(pedido)
        return pedido

    def get_por_usuario(self, usuario_id: int):
        statement = select(Pedido).where(Pedido.usuario_id == usuario_id).order_by(Pedido.creado_en.desc())
        return self.session.exec(statement).all()