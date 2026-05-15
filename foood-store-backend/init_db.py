from sqlmodel import Session, SQLModel, select
from core.database import engine
from app.modules.usuario.models import Usuario, Rol, UsuarioRol, DireccionEntrega
from core.security import get_password_hash

def init_db():
    # 1. Borramos todo y creamos las tablas desde cero
    print("OJO: Borrando y creando tablas...")
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # 2. CREACIÓN DE ROLES BASE
        print("Sembrando roles...")
        rol_admin = Rol(nombre="ADMIN", descripcion="Acceso total al sistema")
        rol_cliente = Rol(nombre="CLIENTE", descripcion="Usuario final")
        rol_stock = Rol(nombre="GESTOR_STOCK", descripcion="Gestiona catálogo e inventario")
        rol_pedidos = Rol(nombre="GESTOR_PEDIDOS", descripcion="Gestiona el ciclo de pedidos")
        
        session.add_all([rol_admin, rol_cliente, rol_stock, rol_pedidos])
        session.commit()
        
        # Refrescamos para obtener los IDs
        session.refresh(rol_admin)
        session.refresh(rol_cliente)

        # 3. CREACIÓN DE USUARIO ADMINISTRADOR INICIAL
        print("Creando usuario administrador de prueba...")
        admin_user = Usuario(
            email="admin@foodstore.com",
            password=get_password_hash("admin123"), # Usa tu función de hasheo
            nombre="Admin",
            apellido="Principal",
            activo=True
        )
        # Asociamos el rol ADMIN al usuario (Muchos a Muchos)
        admin_user.roles.append(rol_admin)
        
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)

        # 4. CREACIÓN DE DIRECCIÓN DE PRUEBA
        print("Agregando dirección de entrega...")
        direccion = DireccionEntrega(
            calle="Av. Siempre Viva",
            numero="742",
            localidad="Mendoza",
            es_principal=True,
            usuario_id=admin_user.id
        )
        
        session.add(direccion)
        session.commit()

    print("¡Base de Datos inicializada con éxito! 🚀")

if __name__ == "__main__":
    init_db()