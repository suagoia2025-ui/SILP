from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, schemas, security, models
from app.database import get_db

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=user_credentials.email)

    if not user or not security.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Crear y devolver el token
    access_token = security.create_access_token(
        data={"sub": user.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh-token", response_model=schemas.Token, tags=["Authentication"])
def refresh_token(
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Renueva el token de acceso del usuario actual.
    Requiere un token válido (aunque esté próximo a expirar).
    """
    # Crear un nuevo token con el mismo email
    access_token = security.create_access_token(
        data={"sub": current_user.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}
