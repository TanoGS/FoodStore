from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import BigInteger, Numeric, DateTime, String  # 👈 Importamos String
from typing import List, Optional
from datetime import datetime
import app

# ==============================================================================
# 0. ENUMS NATIVOS DE NEGOCIO
# ==============================================================================
class UnidadMedida(str, Enum):
    UNIDAD = "UNIDAD"
    KILOGRAMO = "KILOGRAMO"
    LITRO = "LITRO"


# ==============================================================================
# 1. TABLAS INTERMEDIAS / ASOCIATIVAS (Muchos a Muchos)
# ==============================================================================
class ProductoCategoria(SQLModel, table=True):
    __tablename__ = "productos_categorias"
    
    producto_id: int = Field(default=None, foreign_key="productos.id", primary_key=True, sa_type=BigInteger)
    categoria_id: int = Field(default=None, foreign_key="categorias.id", primary_key=True, sa_type=BigInteger)


class ProductoIngrediente(SQLModel, table=True):
    __tablename__ = "productos_ingredientes"
    
    producto_id: int = Field(default=None, foreign_key="productos.id", primary_key=True, sa_type=BigInteger)
    ingrediente_id: int = Field(default=None, foreign_key="ingredientes.id", primary_key=True, sa_type=BigInteger)
    
    # 👈 CORREGIDO: sa_type en lugar de sa_column_kwargs
    cantidad_requerida: float = Field(sa_type=Numeric(10, 3))
    es_removible: bool = Field(default=True)

    producto: "Producto" = Relationship(back_populates="ingredientes_enlaces")
    ingrediente: "Ingrediente" = Relationship(back_populates="productos_enlaces")


# ==============================================================================
# 2. TABLA: categorias (Menú Público)
# ==============================================================================
class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"
    
    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    nombre: str = Field(unique=True, index=True, max_length=50)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    activo: bool = Field(default=True)
    eliminado_en: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    
    parent_id: Optional[int] = Field(default=None, foreign_key="categorias.id", sa_type=BigInteger, nullable=True)

    parent: Optional["Categoria"] = Relationship(
        back_populates="subcategorias",
        sa_relationship_kwargs={"remote_side": "Categoria.id"}
    )
    subcategorias: List["Categoria"] = Relationship(back_populates="parent")
    productos: List["Producto"] = Relationship(back_populates="categorias", link_model=ProductoCategoria)


# ==============================================================================
# 3. TABLA: categorias_ingredientes (Grupos de Depósito)
# ==============================================================================
class CategoriaIngrediente(SQLModel, table=True):
    __tablename__ = "categorias_ingredientes"
    
    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    nombre: str = Field(unique=True, index=True, max_length=50)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    
    ingredientes: List["Ingrediente"] = Relationship(back_populates="categoria_ingrediente")


# ==============================================================================
# 4. TABLA: ingredientes (Insumos Base de Cocina y Costos)
# ==============================================================================
class Ingrediente(SQLModel, table=True):
    __tablename__ = "ingredientes"
    
    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    nombre: str = Field(unique=True, index=True, max_length=50)
    
    # 👈 CORREGIDOS: sa_type=Numeric y sa_type=String
    stock: float = Field(default=0.0, sa_type=Numeric(10, 3))
    stock_seguridad: float = Field(default=0.0, sa_type=Numeric(10, 3))
    unidad_medida: UnidadMedida = Field(sa_type=String(20))
    es_alergeno: bool = Field(default=False)
    costo_unitario: float = Field(default=0.0, sa_type=Numeric(10, 2))
    
    eliminado_en: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    categoria_ingrediente_id: int = Field(foreign_key="categorias_ingredientes.id", sa_type=BigInteger)
    
    categoria_ingrediente: CategoriaIngrediente = Relationship(back_populates="ingredientes")
    productos_enlaces: List[ProductoIngrediente] = Relationship(back_populates="ingrediente")


# ==============================================================================
# 5. TABLA: productos (Platos Finales y Margen de Rentabilidad)
# ==============================================================================
class Producto(SQLModel, table=True):
    __tablename__ = "productos"
    
    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    nombre: str = Field(index=True, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    imagen_url: Optional[str] = Field(default=None, max_length=255)
    stock: int = Field(default=0)
    activo: bool = Field(default=True)
    
    # 👈 CORREGIDOS: sa_type=Numeric
    costo_produccion: float = Field(default=0.0, sa_type=Numeric(10, 2))
    margen_ganancia: float = Field(default=90.0, sa_type=Numeric(5, 2)) 
    precio: float = Field(default=0.0, sa_type=Numeric(10, 2))
    
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    actualizado_en: Optional[datetime] = Field(default=None)
    eliminado_en: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))
    
    categorias: List[Categoria] = Relationship(back_populates="productos", link_model=ProductoCategoria)
    ingredientes_enlaces: List[ProductoIngrediente] = Relationship(back_populates="producto")