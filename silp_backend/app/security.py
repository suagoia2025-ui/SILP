import os
import bcrypt
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_MINUTES", "30"))

def _truncate_password(password: str) -> str:
    """
    Trunca la contraseña a 72 bytes (límite de bcrypt) de forma segura.
    
    Esta función es necesaria porque bcrypt tiene una limitación de 72 bytes.
    Si una contraseña fue hasheada siendo >72 bytes, bcrypt la truncó automáticamente
    al hashearla, por lo que debemos truncar también al verificar para que coincida.
    """
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncamos a 72 bytes y decodificamos de vuelta
        # Usamos 'ignore' para evitar errores si el truncamiento corta un carácter UTF-8
        return password_bytes[:72].decode('utf-8', errors='ignore')
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica una contraseña contra su hash usando bcrypt directamente.
    """
    try:
        if not hashed_password or not isinstance(hashed_password, str):
            return False
        
        # Convertir la contraseña a bytes si es necesario
        password_bytes = plain_password.encode('utf-8') if isinstance(plain_password, str) else plain_password
        hash_bytes = hashed_password.encode('utf-8') if isinstance(hashed_password, str) else hashed_password
        
        # Verificar la contraseña usando bcrypt
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except (ValueError, TypeError, Exception) as e:
        # Si hay un error, la contraseña no coincide
        return False

def get_password_hash(password: str) -> str:
    """
    Genera el hash de una contraseña usando bcrypt directamente.
    """
    # Convertir la contraseña a bytes
    password_bytes = password.encode('utf-8')
    
    # Generar el hash usando bcrypt
    # bcrypt.gensalt() genera un salt automáticamente
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    
    # Devolver como string
    return hashed.decode('utf-8')

# Leemos la configuración desde el entorno
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme)):
    # Importar aquí para evitar import circular
    from app import crud, database
    db = next(database.get_db())
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

def create_password_reset_token(email: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": email, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password_reset_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

def require_roles(allowed_roles: list[str]):
    """
    Dependencia para validar que el usuario tenga uno de los roles permitidos.
    
    Uso:
        @router.post("/endpoint")
        def my_endpoint(current_user: User = Depends(require_roles(["superadmin", "admin"]))):
            ...
    """
    from app import models
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los siguientes roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker