from fastapi import HTTPException
from sqlmodel import Session
from .repository import DireccionRepository
from .models import DireccionEntrega
from .schemas import DireccionCreate

class DireccionService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = DireccionRepository(session)

    def agregar_direccion(self, usuario_id: int, datos: DireccionCreate) -> DireccionEntrega:
        # Verificamos si el usuario ya tiene direcciones
        direcciones_previas = self.repo.get_by_usuario(usuario_id)
        
        # Si es la primera, la forzamos a ser predeterminada
        if not direcciones_previas:
            datos.es_predeterminada = True
            
        # Si esta nueva dirección viene como predeterminada, limpiamos las anteriores
        if datos.es_predeterminada and direcciones_previas:
            self.repo.quitar_predeterminadas(usuario_id)

        # Creamos la entidad
        nueva_direccion = DireccionEntrega(
            **datos.model_dump(),
            usuario_id=usuario_id
        )
        return self.repo.crear(nueva_direccion)

    def listar_mis_direcciones(self, usuario_id: int):
        return self.repo.get_by_usuario(usuario_id)