from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from core.database import get_session
from typing import List
from core.security import get_current_user_token, TokenData, RoleChecker

# Importamos nuestros esquemas
from .schemas import (
    ProductoCreate, ProductoUpdate, ProductoPublic, ProductoList,
    IngredienteCreate, IngredientePublic, IngredienteList,
    CategoriaCreate, CategoriaPublic,
    CategoriaIngredienteCreate, CategoriaIngredientePublic
)
# Importamos el cerebro matemático
from .service import CatalogoService

requiere_admin_o_stock = RoleChecker(["ADMIN", "GESTOR_STOCK"])

# Creamos el router principal del módulo
router = APIRouter(prefix="/catalogo")

# Dependencia para inyectar el servicio limpiamente
def get_catalogo_service(session: Session = Depends(get_session)) -> CatalogoService:
    return CatalogoService(session)

# ==============================================================================
# 1. ENDPOINTS: CATEGORÍAS DEL MENÚ PÚBLICO
# ==============================================================================
@router.post("/categorias", response_model=CategoriaPublic, status_code=status.HTTP_201_CREATED, tags=["Catálogo - Categorías"])
def crear_categoria(data: CategoriaCreate, svc: CatalogoService = Depends(get_catalogo_service)):
    """Crea una nueva sección para el menú (ej: 'Hamburguesas', 'Bebidas')"""
    return svc.crear_categoria(data)

@router.get("/categorias", response_model=List[CategoriaPublic], tags=["Catálogo - Categorías"])
def listar_categorias_principales(svc: CatalogoService = Depends(get_catalogo_service)):
    """Devuelve las categorías raíz para armar el menú del cliente"""
    return svc.listar_categorias_raiz()


# ==============================================================================
# 2. ENDPOINTS: INGREDIENTES Y DEPÓSITO
# ==============================================================================
# Nota: Este endpoint es muy sencillo, lo hacemos directo aquí para agilizar
@router.post("/categorias-ingredientes", response_model=CategoriaIngredientePublic, status_code=status.HTTP_201_CREATED, tags=["Inventario - Depósito"])
def crear_grupo_deposito(data: CategoriaIngredienteCreate, session: Session = Depends(get_session)):
    """Crea un grupo para organizar el depósito (ej: 'Carnes', 'Verduras')"""
    from .models import CategoriaIngrediente
    nueva_cat = CategoriaIngrediente(**data.model_dump())
    session.add(nueva_cat)
    session.commit()
    session.refresh(nueva_cat)
    return nueva_cat

@router.post("/ingredientes", response_model=IngredientePublic, status_code=status.HTTP_201_CREATED, tags=["Inventario - Depósito"])
def crear_ingrediente(data: IngredienteCreate, svc: CatalogoService = Depends(get_catalogo_service)):
    """Da de alta un insumo con su costo y unidad de medida"""
    return svc.crear_ingrediente(data)

@router.get("/ingredientes", response_model=List[IngredientePublic], tags=["Inventario - Depósito"])
def listar_inventario(offset: int = 0, limit: int = 50, svc: CatalogoService = Depends(get_catalogo_service)):
    """Lista la materia prima disponible en la cocina"""
    return svc.listar_ingredientes(offset, limit)


# ==============================================================================
# 3. ENDPOINTS: PRODUCTOS Y RECETAS (EL CORE)
# ==============================================================================
@router.post("/productos", response_model=ProductoPublic, status_code=status.HTTP_201_CREATED, tags=["Catálogo - Productos"])
def crear_producto_con_receta(
    data: ProductoCreate, 
    svc: CatalogoService = Depends(get_catalogo_service),
    current_user: TokenData = Depends(get_current_user_token)
    ):
    """
    Crea un plato final. 
    ¡Magia incluida!: Calcula el costo de producción y el precio de venta en base a los ingredientes enviados.
    """
    return svc.crear_producto(data)

@router.patch("/productos/{id}", response_model=ProductoPublic, tags=["Catálogo - Productos"])
def actualizar_producto(id: int, data: ProductoUpdate, svc: CatalogoService = Depends(get_catalogo_service)):
    """
    Modifica un plato. 
    Si envías una nueva lista en 'receta', se recalcula automáticamente todo el escandallo financiero.
    """
    return svc.actualizar_producto(id, data)

@router.get("/productos", response_model=list[ProductoPublic], tags=["Catálogo - Productos"])
def listar_todos_los_productos(
    svc: CatalogoService = Depends(get_catalogo_service)
):
    """
    Obtiene todo el catálogo de productos con sus recetas y cálculos financieros.
    """
    return svc.obtener_todos_los_productos()