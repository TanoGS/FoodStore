import sys
import os

# 👇 Estas dos líneas le dicen a Python que busque en la carpeta actual
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select

from core.database import engine
from core.security import get_password_hash
# Ajusta esta importación si tu modelo Usuario está en otra ruta
from app.modules.usuario.models import Usuario

def crear_super_admin():
    with Session(engine) as session:
        # 1. Revisamos si ya existe para no duplicarlo
        statement = select(Usuario).where(Usuario.email == "admin@foodstore.com")
        admin_existente = session.exec(statement).first()
        
        if admin_existente:
            print("⚠️ El administrador ya existe en la base de datos.")
            return

        # 2. Encriptamos la contraseña "admin123"
        hashed_pw = get_password_hash("admin123")
        
        # 3. Creamos el objeto del usuario
        nuevo_admin = Usuario(
            email="admin@foodstore.com",
            nombre="Super",
            apellido="Admin",
            password=hashed_pw,
            rol="ADMIN",  # Rol con acceso total
            activo=True
        )
        
        # 4. Lo guardamos en la base de datos
        session.add(nuevo_admin)
        session.commit()
        
        print("✅ ¡Súper Administrador creado con éxito!")
        print("📧 Email: admin@foodstore.com")
        print("🔑 Password: admin123")
        print("🔒 Hash guardado en BD:", hashed_pw[:20] + "...")

if __name__ == "__main__":
    print("Iniciando creación de administrador...")
    crear_super_admin()