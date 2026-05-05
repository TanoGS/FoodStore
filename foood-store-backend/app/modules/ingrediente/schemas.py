from typing import Optional, List
from sqlmodel import SQLModel, Field
from datetime import datetime


# ── Entrada ─────────────────────────────────────────────────────────────────────────────

class IngredienteCreate(SQLModel):
    """Body para POST /ingredientes/"""
    nombre: str = Field(max_length=100)
    es_alergeno: bool = False
    cantidad: int = Field(default=0, ge=0)


class IngredienteUpdate(SQLModel):
    """Body para PATCH /ingredientes/{id} — todos los campos opcionales."""
    nombre: Optional[str] = Field(default=None, max_length=100)
    es_alergeno: Optional[bool] = None
    cantidad: Optional[int] = Field(default=None, ge=0)


# ── Salida ─────────────────────────────────────────────────────────────────────────────

class IngredientePublic(SQLModel):
    """Response model: campos que se exponen al cliente."""
    id: int
    nombre: str
    es_alergeno: bool
    cantidad: int
    sin_stock: bool = False
    stock_bajo: bool = False
    eliminado_en: Optional[datetime] = None

    @classmethod
    def from_model(cls, ing: "Ingrediente") -> "IngredientePublic":  # type: ignore[name-defined]
        from app.modules.ingrediente.models import STOCK_ALERTA
        return cls(
            id=ing.id,
            nombre=ing.nombre,
            es_alergeno=ing.es_alergeno,
            cantidad=ing.cantidad,
            sin_stock=ing.cantidad == 0,
            stock_bajo=0 < ing.cantidad < STOCK_ALERTA,
            eliminado_en=ing.eliminado_en,
        )


class IngredienteList(SQLModel):
    """Response model paginado para GET /ingredientes/"""
    data: List[IngredientePublic]
    total: int