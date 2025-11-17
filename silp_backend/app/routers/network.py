from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any

from app.database import get_db
from app.models import User, Contact
from app.security import get_current_user

router = APIRouter()

@router.get("/network/graph-data")
def get_graph_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna datos del grafo de usuarios y contactos para visualización.
    
    Permisos:
    - Superadmin: Ve TODOS los usuarios y contactos del sistema
    - Admin/Líder: Ve solo a sí mismo y sus contactos
    
    Returns:
        {
            "nodes": [...],  # Lista de nodos (usuarios y contactos)
            "edges": [...]   # Lista de conexiones
        }
    """
    nodes = []
    edges = []
    
    # Determinar qué usuarios mostrar según el rol
    if current_user.role == "superadmin":
        # Superadmin ve todos los usuarios
        users = db.query(User).options(
            joinedload(User.municipality),
            joinedload(User.occupation)
        ).all()
    else:
        # Admin/Líder solo se ve a sí mismo
        # Necesitamos recargar el usuario con sus relaciones
        users = db.query(User).options(
            joinedload(User.municipality),
            joinedload(User.occupation)
        ).filter(User.id == current_user.id).all()
    
    # Procesar usuarios como nodos
    for user in users:
        # Obtener contactos de este usuario primero para contar
        contacts = db.query(Contact).filter(
            Contact.user_id == user.id
        ).options(
            joinedload(Contact.municipality),
            joinedload(Contact.occupation)
        ).all()
        
        user_node = {
            "id": f"user-{str(user.id)}",
            "type": "user",
            "data": {
                "label": f"{user.first_name} {user.last_name}",
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "is_active": user.is_active,
                "mdv": user.mdv,
                "municipality": user.municipality.name if user.municipality else None,
                "occupation": user.occupation.name if user.occupation else None,
                "contact_count": len(contacts)
            },
            "position": {"x": 0, "y": 0}  # Se calculará en el frontend
        }
        nodes.append(user_node)
        
        # Procesar contactos como nodos
        for contact in contacts:
            contact_node = {
                "id": f"contact-{str(contact.id)}",
                "type": "contact",
                "data": {
                    "label": f"{contact.first_name} {contact.last_name}",
                    "first_name": contact.first_name,
                    "last_name": contact.last_name,
                    "email": contact.email,
                    "phone": contact.phone,
                    "is_active": contact.is_active,
                    "mdv": contact.mdv,
                    "municipality": contact.municipality.name if contact.municipality else None,
                    "occupation": contact.occupation.name if contact.occupation else None,
                    "owner_name": f"{user.first_name} {user.last_name}"
                },
                "position": {"x": 0, "y": 0}  # Se calculará en el frontend
            }
            nodes.append(contact_node)
            
            # Crear conexión entre usuario y contacto
            edge = {
                "id": f"edge-{str(user.id)}-{str(contact.id)}",
                "source": f"user-{str(user.id)}",
                "target": f"contact-{str(contact.id)}",
                "type": "default"
            }
            edges.append(edge)
    
    return {
        "nodes": nodes,
        "edges": edges
    }

