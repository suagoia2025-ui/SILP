from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import uuid
import pandas as pd
import io
from datetime import datetime

from app import crud, models, schemas, security
from app.database import get_db

router = APIRouter()

@router.post("/contacts/", response_model=schemas.Contact, tags=["Contacts"])
def create_contact_for_user(
    contact: schemas.ContactCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    try:
        return crud.create_user_contact(db=db, contact=contact, user_id=current_user.id)
    except ValueError as e:
        # Capturar errores de cédula duplicada
        if "cédula" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/contacts/", response_model=List[schemas.Contact], tags=["Contacts"])
def read_contacts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
    search: str = ""
):
    if current_user.role == "superadmin":
        contacts = crud.get_all_contacts(db=db, search=search)
    else:
        contacts = crud.get_user_contacts(db=db, user_id=current_user.id, search=search)
    
    return contacts

@router.put("/contacts/{contact_id}", response_model=schemas.Contact, tags=["Contacts"])
def update_a_contact(
    contact_id: uuid.UUID,
    contact_data: schemas.ContactUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_contact = crud.get_contact_by_id(db, contact_id=contact_id)
    
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
        
    is_superadmin = current_user.role == "superadmin"
    is_owner = db_contact.user_id == current_user.id
    
    if not is_superadmin and not is_owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos para editar este contacto")
    
    try:
        return crud.update_contact(db=db, contact_id=contact_id, contact_data=contact_data)
    except ValueError as e:
        # Capturar errores de cédula duplicada
        if "cédula" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/contacts/{contact_id}", status_code=status.HTTP_200_OK, tags=["Contacts"])
def delete_a_contact(
    contact_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_contact = crud.get_contact_by_id(db, contact_id=contact_id)
    
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
        
    is_superadmin = current_user.role == "superadmin"
    is_owner = db_contact.user_id == current_user.id
    
    if not is_superadmin and not is_owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos para eliminar este contacto")
        
    crud.delete_contact(db=db, contact_id=contact_id)
    return {"detail": "Contacto eliminado exitosamente"}

@router.get("/contacts/download-csv", tags=["Contacts"])
def download_contacts_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles(["superadmin", "admin"]))
):
    """
    Descarga contactos en formato CSV.
    Solo accesible para usuarios con rol 'superadmin' o 'admin'.
    - superadmin: descarga todos los contactos del sistema
    - admin: descarga solo sus propios contactos
    """
    # Obtener contactos según el rol
    if current_user.role == "superadmin":
        # Para superadmin, cargar también la relación owner
        from sqlalchemy.orm import joinedload
        contacts = db.query(models.Contact).options(
            joinedload(models.Contact.municipality),
            joinedload(models.Contact.occupation),
            joinedload(models.Contact.owner)
        ).all()
    else:
        # admin descarga solo sus propios contactos
        contacts = crud.get_user_contacts(db=db, user_id=current_user.id, search="")
    
    if not contacts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron contactos para descargar"
        )
    
    # Preparar datos para el DataFrame
    data = []
    for contact in contacts:
        contact_data = {
            'first_name': contact.first_name,
            'last_name': contact.last_name,
            'cedula': contact.cedula or '',
            'email': contact.email,
            'phone': contact.phone,
            'address': contact.address or '',
            'municipality_id': contact.municipality_id,
            'municipality_name': contact.municipality.name if contact.municipality else '',
            'occupation_id': contact.occupation_id or '',
            'occupation_name': contact.occupation.name if contact.occupation else '',
            'mdv': contact.mdv or '',
            'is_active': contact.is_active,
            'created_at': contact.created_at.strftime('%Y-%m-%d %H:%M:%S') if contact.created_at else ''
        }
        
        # Agregar información del propietario solo si es superadmin
        if current_user.role == "superadmin" and contact.owner:
            contact_data['owner_id'] = str(contact.owner.id)
            contact_data['owner_name'] = f"{contact.owner.first_name} {contact.owner.last_name}"
            contact_data['owner_email'] = contact.owner.email
        
        data.append(contact_data)
    
    # Crear DataFrame
    df = pd.DataFrame(data)
    
    # Ordenar por fecha de creación (más recientes primero)
    if 'created_at' in df.columns:
        df = df.sort_values('created_at', ascending=False)
    
    # Generar CSV en memoria
    output = io.StringIO()
    df.to_csv(output, index=False, encoding='utf-8')
    output.seek(0)
    
    # Generar nombre de archivo con fecha
    fecha = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"contactos_{fecha}.csv"
    
    # Retornar como StreamingResponse
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "text/csv; charset=utf-8"
        }
    )