from sqlalchemy import text
from passlib.context import CryptContext
from core.database import engine

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

EMAIL_ADMIN = "admin@foodstore.com"
PASSWORD_ADMIN = "admin123"


def inicializar_datos():
    with engine.connect() as conn:
        # Verificar si el admin ya existe
        result = conn.execute(
            text("SELECT id FROM usuario WHERE email = :email"),
            {"email": EMAIL_ADMIN},
        ).fetchone()

        if result:
            print("⚠️  El usuario Admin ya existía en la base de datos.")
        else:
            hashed = _pwd.hash(PASSWORD_ADMIN)
            conn.execute(
                text(
                    """
                    INSERT INTO usuario (email, password, nombre, apellido, activo, rol, creado_en)
                    VALUES (:email, :password, :nombre, :apellido, true, 'ADMIN', NOW())
                    """
                ),
                {
                    "email": EMAIL_ADMIN,
                    "password": hashed,
                    "nombre": "Super",
                    "apellido": "Admin",
                },
            )
            conn.commit()
            print("✅ Usuario Admin creado exitosamente!")
            print(f"   -> Email:    {EMAIL_ADMIN}")
            print(f"   -> Password: {PASSWORD_ADMIN}")


if __name__ == "__main__":
    print("Iniciando la carga de datos (Seed)...")
    inicializar_datos()
    print("¡Proceso finalizado!")
