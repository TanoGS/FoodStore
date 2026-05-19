from pydantic import BaseModel, Field, model_validator
from typing import List, Optional
from datetime import datetime
from .models import UnidadMedida

# ==============================================================================
# 1. ESQUEMAS: Categorías de Menú (Públicas)
# ==============================================================================
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


# ==============================================================================
# 2. ESQUEMAS: Categorías de Ingredientes (Depósito)
# ==============================================================================
class CategoriaIngredienteBase(BaseModel):
    nombre: str = Field(..., max_length=50)
    descripcion: Optional[str] = Field(default=None, max_length=255)

class CategoriaIngredienteCreate(CategoriaIngredienteBase):
    pass

class CategoriaIngredientePublic(CategoriaIngredienteBase):
    id: int

    class Config:
        from_attributes = True


# ==============================================================================
# 3. ESQUEMAS: Ingredientes (Materia Prima)
# ==============================================================================
class IngredienteBase(BaseModel):
    nombre: str = Field(..., max_length=50)
    stock: float = Field(default=0.0)
    stock_seguridad: float = Field(default=0.0)
    unidad_medida: UnidadMedida
    es_alergeno: bool = False
    costo_unitario: float = Field(..., description="Costo por unidad de medida base")
    categoria_ingrediente_id: int

class IngredienteCreate(IngredienteBase):
    pass

class IngredienteUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, max_length=50)
    stock: Optional[float] = None
    stock_seguridad: Optional[float] = None
    unidad_medida: Optional[UnidadMedida] = None
    es_alergeno: Optional[bool] = None
    costo_unitario: Optional[float] = None
    categoria_ingrediente_id: Optional[int] = None

class IngredientePublic(IngredienteBase):
    id: int

    class Config:
        from_attributes = True


# ==============================================================================
# 4. ESQUEMAS: Recetas (Productos <-> Ingredientes)
# ==============================================================================
class RecetaItemCreate(BaseModel):
    """Estructura del ingrediente al momento de crear un producto (JSON del Frontend)"""
    ingrediente_id: int
    cantidad_requerida: float
    es_removible: bool = True

class IngredienteBreve(BaseModel):
    """Información resumida del ingrediente para mostrar dentro del producto"""
    id: int
    nombre: str
    unidad_medida: UnidadMedida
    es_alergeno: bool

class RecetaItemPublic(BaseModel):
    """Estructura de salida para detallar de qué está hecho el plato"""
    ingrediente_id: int
    cantidad_requerida: float
    es_removible: bool
    ingrediente: IngredienteBreve

    class Config:
        from_attributes = True


# ==============================================================================
# 5. ESQUEMAS: Productos (Platos Finales)
# ==============================================================================
class ProductoBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    imagen_url: Optional[str] = Field(default=None, max_length=255)
    stock: int = Field(default=0)
    activo: bool = True
    margen_ganancia: float = Field(default=90.0)

class ProductoCreate(ProductoBase):
    categoria_ids: List[int] = []  # Para asignarle secciones del menú (ej: Promociones, Hamburguesas)
    receta: List[RecetaItemCreate] = []  # La lista de ingredientes y cantidades
    precio_manual: Optional[float] = Field(default=None, description="Si se envía, sobreescribe el cálculo automático")

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    imagen_url: Optional[str] = Field(default=None, max_length=255)
    stock: Optional[int] = None
    activo: Optional[bool] = None
    margen_ganancia: Optional[float] = None
    precio_manual: Optional[float] = None
    categoria_ids: Optional[List[int]] = None
    receta: Optional[List[RecetaItemCreate]] = None

class ProductoPublic(ProductoBase):
    id: int
    costo_produccion: float
    precio: float
    creado_en: datetime
    actualizado_en: Optional[datetime] = None
    categorias: List[CategoriaPublic] = []
    receta_detallada: List[RecetaItemPublic] = []

    class Config:
        from_attributes = True

    #  INTERCEPTOR: Aplana la receta para que el JSON sea limpio
    @model_validator(mode="before")
    @classmethod
    def preparar_receta(cls, data):
        # Si 'data' es un objeto de la BD (SQLModel), extraemos la receta de sus enlaces
        if hasattr(data, "ingredientes_enlaces"):
            enlaces = getattr(data, "ingredientes_enlaces", [])
            # Convertimos la tabla intermedia a la lista que espera el frontend
            receta_mapeada = [
                {
                    "ingrediente_id": enlace.ingrediente_id,
                    "cantidad_requerida": enlace.cantidad_requerida,
                    "es_removible": enlace.es_removible,
                    "ingrediente": enlace.ingrediente # Pydantic validará esto con IngredienteBreve
                }
                for enlace in enlaces if enlace.ingrediente
            ]
            
            return {
                "id": data.id,
                "nombre": data.nombre,
                "descripcion": data.descripcion,
                "imagen_url": data.imagen_url,
                "stock": data.stock,
                "activo": data.activo,
                "margen_ganancia": data.margen_ganancia,
                "costo_produccion": data.costo_produccion,
                "precio": data.precio,
                "creado_en": data.creado_en,
                "actualizado_en": data.actualizado_en,
                "categorias": getattr(data, "categorias", []),
                "receta_detallada": receta_mapeada
            }
        return data


# ==============================================================================
# 6. ESQUEMAS: Paginación
# ==============================================================================
class ProductoList(BaseModel):
    data: List[ProductoPublic]
    total: int
    
class IngredienteList(BaseModel):
    data: List[IngredientePublic]
    total: int