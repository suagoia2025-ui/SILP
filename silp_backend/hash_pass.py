"""
Script de utilidad para generar hashes de contraseñas.
Útil para crear usuarios directamente en la base de datos o para pruebas.

Uso:
    python hash_pass.py                    # Pide la contraseña de forma interactiva
    python hash_pass.py "mi_contraseña"    # Pasa la contraseña como argumento
"""
import sys
import getpass
from app.security import get_password_hash

def main():
    if len(sys.argv) > 1:
        # Si se pasa como argumento
        password = sys.argv[1]
    else:
        # Si no, pedirla de forma interactiva (no se muestra en pantalla)
        password = getpass.getpass("Ingresa la contraseña a hashear: ")
    
    if not password:
        print("Error: La contraseña no puede estar vacía")
        sys.exit(1)
    
    hashed = get_password_hash(password)
    print(f"\nHash generado:")
    print(hashed)
    print(f"\nPara usar en SQL:")
    print(f"UPDATE users SET hashed_password = '{hashed}' WHERE email = 'tu_email@ejemplo.com';")

if __name__ == "__main__":
    main()
