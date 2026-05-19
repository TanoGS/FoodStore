from fastapi import HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timezone
from .models import (
    Producto, Ingrediente, Categoria, CategoriaIngrediente, ProductoIngrediente
)
from sqlmodel import select
from sqlalchemy.orm import selectinload
from app.modules.catalogo.models import Producto

from .schemas import (
    ProductoCreate, ProductoUpdate, ProductoPublic,
    IngredienteCreate, IngredienteUpdate, IngredientePublic,
    CategoriaCreate, CategoriaUpdate, CategoriaPublic
)

class CatalogoService:
    def __init__(self, session: Session):
        self.session = session

    # ====================================================================
    # 1. GESTIÓN DE PRODUCTOS Y ESCANDALLO (COSTOS Y RECETAS)
    # ====================================================================
    def crear_producto(self, data: ProductoCreate) -> ProductoPublic:
        # 1. Extraemos los datos base ignorando las relaciones complejas
        producto = Producto(**data.model_dump(exclude={"categoria_ids", "receta", "precio_manual"}))

        # 2. Asignar Categorías del Menú
        for cat_id in data.categoria_ids:
            categoria = self.session.get(Categoria, cat_id)
            if not categoria:
                raise HTTPException(status_code=404, detail=f"Categoría {cat_id} no encontrada")
            producto.categorias.append(categoria)

        # 3. 🧮 Lógica de Escandallo (Cálculo de Costo de Producción)
        costo_total_produccion = 0.0
        
        for item in data.receta:
            ingrediente = self.session.get(Ingrediente, item.ingrediente_id)
            if not ingrediente:
                raise HTTPException(status_code=404, detail=f"Ingrediente {item.ingrediente_id} no encontrado")

            # Matemáticas: Cantidad usada * Costo unitario del insumo
            costo_item = item.cantidad_requerida * ingrediente.costo_unitario
            costo_total_produccion += costo_item

            # Creamos el enlace de la receta
            enlace_receta = ProductoIngrediente(
                ingrediente_id=ingrediente.id,
                cantidad_requerida=item.cantidad_requerida,
                es_removible=item.es_removible
            )
            producto.ingredientes_enlaces.append(enlace_receta)

        # Guardamos el costo neto calculado
        producto.costo_produccion = costo_total_produccion

        # 4. 📈 Cálculo de Rentabilidad y Precio Final
        if data.precio_manual is not None:
            # Si el admin forzó un precio, lo respetamos
            producto.precio = data.precio_manual
        else:
            # Si no, aplicamos la fórmula: Precio = Costo * (1 + Margen/100)
            margen_multiplicador = 1 + (producto.margen_ganancia / 100)
            producto.precio = costo_total_produccion * margen_multiplicador

        self.session.add(producto)
        self.session.commit()
        self.session.refresh(producto)
        
        return ProductoPublic.model_validate(producto)


    def actualizar_producto(self, producto_id: int, data: ProductoUpdate) -> ProductoPublic:
        producto = self.session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        update_data = data.model_dump(exclude_unset=True)
        
        # Si la receta cambia, debemos recalcular TODO
        if "receta" in update_data:
            # Limpiamos la receta actual
            producto.ingredientes_enlaces.clear()
            costo_total_produccion = 0.0
            
            for item in data.receta:
                ingrediente = self.session.get(Ingrediente, item.ingrediente_id)
                if not ingrediente:
                    raise HTTPException(status_code=404, detail=f"Ingrediente {item.ingrediente_id} no existe")
                    
                costo_item = item.cantidad_requerida * ingrediente.costo_unitario
                costo_total_produccion += costo_item
                
                enlace = ProductoIngrediente(
                    ingrediente_id=ingrediente.id,
                    cantidad_requerida=item.cantidad_requerida,
                    es_removible=item.es_removible
                )
                producto.ingredientes_enlaces.append(enlace)
                
            producto.costo_produccion = costo_total_produccion
            
            # Recalculamos el precio si no nos enviaron uno manual
            if data.precio_manual is not None:
                producto.precio = data.precio_manual
            else:
                margen_multiplicador = 1 + (producto.margen_ganancia / 100)
                producto.precio = costo_total_produccion * margen_multiplicador

        # Actualizamos el resto de campos (nombre, activo, etc)
        for key, value in update_data.items():
            if key not in ["receta", "categoria_ids", "precio_manual"]:
                setattr(producto, key, value)

        producto.actualizado_en = datetime.now(timezone.utc)
        self.session.add(producto)
        self.session.commit()
        self.session.refresh(producto)
        return ProductoPublic.model_validate(producto)

    # ====================================================================
    # 2. GESTIÓN DE INGREDIENTES (INVENTARIO BASE)
    # ====================================================================
    def crear_ingrediente(self, data: IngredienteCreate) -> IngredientePublic:
        # Validamos que la categoría de depósito exista
        cat = self.session.get(CategoriaIngrediente, data.categoria_ingrediente_id)
        if not cat:
            raise HTTPException(status_code=404, detail="Categoría de ingrediente no encontrada")
            
        ingrediente = Ingrediente(**data.model_dump())
        self.session.add(ingrediente)
        self.session.commit()
        self.session.refresh(ingrediente)
        return IngredientePublic.model_validate(ingrediente)

    def listar_ingredientes(self, offset: int = 0, limit: int = 50):
        statement = select(Ingrediente).where(Ingrediente.eliminado_en == None).offset(offset).limit(limit)
        ingredientes = self.session.exec(statement).all()
        return [IngredientePublic.model_validate(i) for i in ingredientes]

    # ====================================================================
    # 3. GESTIÓN DE CATEGORÍAS (MENÚ PÚBLICO)
    # ====================================================================
    def crear_categoria(self, data: CategoriaCreate) -> CategoriaPublic:
        # Si nos envían un parent_id, validamos que la categoría padre exista
        if data.parent_id:
            parent = self.session.get(Categoria, data.parent_id)
            if not parent:
                raise HTTPException(status_code=404, detail="Categoría padre no encontrada")
                
        categoria = Categoria(**data.model_dump())
        self.session.add(categoria)
        self.session.commit()
        self.session.refresh(categoria)
        return CategoriaPublic.model_validate(categoria)

    def listar_categorias_raiz(self):
        """Devuelve solo las categorías principales (las que no tienen padre)"""
        statement = select(Categoria).where(Categoria.parent_id == None, Categoria.eliminado_en == None)
        categorias = self.session.exec(statement).all()
        return [CategoriaPublic.model_validate(c) for c in categorias]
    
    def obtener_todos_los_productos(self):
        """
        Devuelve la lista de todos los productos, cargando sus relaciones
        para que Pydantic pueda calcular los costos en el frontend.
        """
        statement = select(Producto).options(
            selectinload(Producto.categorias),
            selectinload(Producto.ingredientes_enlaces)
        )
        resultados = self.session.exec(statement).unique().all()
        return resultados