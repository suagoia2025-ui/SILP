# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, security, models, crud
from app.database import get_db
import uuid

router = APIRouter()

@router.get("/users/me", response_model=schemas.User)
def read_current_user(current_user: models.User = Depends(security.get_current_user)):
    # Gracias a la dependencia, esta función solo se ejecutará si el token es válido.
    # 'current_user' será el objeto del usuario obtenido de la base de datos.
    return current_user


@router.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_a_new_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # 1. Verificamos que el usuario actual sea superadmin
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene los permisos necesarios para crear usuarios"
        )
    
    # 2. Verificamos que el rol a asignar sea válido
    if user_data.role not in ["admin", "lider"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El rol asignado no es válido. Debe ser 'admin' o 'lider'."
        )

    # 3. Intentamos crear el usuario
    db_user = crud.create_user(db=db, user=user_data)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un usuario con este correo electrónico ya existe"
        )
    
    return db_user

# PIEZA PARA ASEGURAR QUE SOLO SUPERADMIN PUEDA ACCEDER A LOS DATOS DE LOS USUARIOS
@router.get("/users/", response_model=list[schemas.User], tags=["Users"])
def read_all_users(
    skip: int = 0, 
    limit: int = 100, 
    search: str = "",
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    # Verificamos que el usuario actual sea superadmin
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene los permisos necesarios para ver la lista de usuarios"
        )
    
    users = crud.get_users(db, skip=skip, limit=limit, search=search)
    return users

#Verificar que solo el superadmin pueda acceder
@router.put("/users/{user_id}", response_model=schemas.User, tags=["Users"])
def update_a_user(
    user_id: uuid.UUID,
    user_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # 1. Verificar que quien hace la petición es superadmin
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene los permisos necesarios para actualizar usuarios"
        )
    
    # 2. (Opcional) Verificar que el rol a asignar sea válido
    if user_data.role and user_data.role not in ["admin", "lider"]:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El rol asignado no es válido. Debe ser 'admin' o 'lider'."
        )

    # 3. Intentar actualizar el usuario
    updated_user = crud.update_user(db=db, user_id=user_id, user_data=user_data)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return updated_user


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK, tags=["Users"])
def delete_a_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # 1. Verificar que quien hace la petición es superadmin
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene los permisos necesarios para eliminar usuarios"
        )
    
    # 2. Prevenir que un superadmin se borre a sí mismo
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El superadministrador no puede eliminar su propia cuenta a través de la API"
        )

    # 3. Intentar eliminar el usuario
    deleted_user = crud.delete_user(db=db, user_id=user_id)
    
    if not deleted_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado para eliminar")

    return {"detail": f"Usuario {deleted_user.email} El usuario fue eliminado exitosamente"}