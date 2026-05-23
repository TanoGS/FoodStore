from sqlmodel import Session, SQLModel
from core.database import engine  # Verifica que apunte correctamente a tu archivo de conexión
from app.modules.usuario.models import Usuario, Rol, UsuarioRol
from core.security import get_password_hash
from datetime import datetime

from app.modules.catalogo.models import Categoria, CategoriaIngrediente, Ingrediente, Producto, ProductoCategoria, ProductoIngrediente

def inicializar_sistema():
    print("⏳ Detectando modelos y recreando la estructura completa de la BD...")
    # Borra todas las tablas existentes para evitar conflictos de columnas viejas
    SQLModel.metadata.drop_all(engine)
    # Crea el nuevo esquema estructurado con tipos BIGINT, VARCHAR(20) y TIMESTAMPTZ
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        print("🌱 Sembrando catálogo maestro de Roles con Claves Naturales...")
        roles_maestros = [
            Rol(codigo="ADMIN", nombre="Administrador", descripcion="Control total y auditoría global del sistema"),
            Rol(codigo="CLIENTE", nombre="Cliente Tienda", descripcion="Usuario final consumidor del catálogo"),
            Rol(codigo="GESTOR_STOCK", nombre="Gestor de Stock", descripcion="Administrador del inventario e ingredientes"),
            Rol(codigo="GESTOR_PEDIDOS", nombre="Gestor de Pedidos", descripcion="Operador encargado de la máquina de estados de las órdenes"),
        ]
        
        for rol in roles_maestros:
            session.add(rol)
        session.commit() # Guardamos los roles primero para que existan las FKs

        print("👤 Registrando Super Usuario Administrador inicial...")
        admin_user = Usuario(
            email="admin@foodstore.com",
            nombre="Admin",
            apellido="FoodStore",
            cel="2615551234", 
            password=get_password_hash("admin123"),
            activo=True,
            creado_en=datetime.utcnow()
        )
        session.add(admin_user)
        session.flush() # Ejecuta en Postgres para generar el ID sin cerrar la transacción

        print("🔗 Vinculando credenciales de acceso (Usuario <-> Rol)...")
        # Creamos el registro en la tabla asociativa usuarios_roles usando el rol_codigo de texto
        enlace_rol = UsuarioRol(
            usuario_id=admin_user.id,
            rol_codigo="ADMIN",
            asignado_por_id=admin_user.id, # El mismo admin inicial firma su alta de manera auto-referencial
            expires_at=None # Rol permanente
        )
        session.add(enlace_rol)
        session.commit()
        
    print("\n=======================================================================")
    print("¡Base de Datos FoodStore inicializada con éxito bajo el nuevo esquema ERD! 🚀")
    print("Usuario Admin: admin@foodstore.com | Clave: admin123")
    print("=======================================================================")

if __name__ == "__main__":
    inicializar_sistema()