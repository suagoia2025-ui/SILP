#!/usr/bin/env python3
"""
Script para crear un usuario inicial (superadmin) en la base de datos.
Este script se puede ejecutar manualmente o como parte de la inicialización.

Uso:
    python scripts/create_initial_user.py
    O desde Docker:
    docker compose exec backend python scripts/create_initial_user.py
"""

import sys
import os
from pathlib import Path

# Agregar el directorio raíz del proyecto al path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models, security, crud, schemas

def create_initial_user():
    """
    Crea un usuario superadmin inicial si no existe.
    """
    db: Session = SessionLocal()
    
    try:
        # Verificar si ya existe un superadmin
        existing_superadmin = db.query(models.User).filter(
            models.User.role == "superadmin"
        ).first()
        
        if existing_superadmin:
            print(f"✅ Ya existe un usuario superadmin: {existing_superadmin.email}")
            return existing_superadmin
        
        # Verificar que existan municipios y ocupaciones
        municipality = db.query(models.Municipality).first()
        if not municipality:
            print("⚠️  No hay municipios en la base de datos. Creando uno por defecto...")
            municipality = models.Municipality(
                name="Cúcuta",
                department="Norte de Santander"
            )
            db.add(municipality)
            db.commit()
            db.refresh(municipality)
            print(f"✅ Municipio creado: {municipality.name}")
        
        occupation = db.query(models.Occupation).first()
        if not occupation:
            print("⚠️  No hay ocupaciones en la base de datos. Creando una por defecto...")
            occupation = models.Occupation(name="Administrador")
            db.add(occupation)
            db.commit()
            db.refresh(occupation)
            print(f"✅ Ocupación creada: {occupation.name}")
        
        # Crear usuario superadmin
        user_data = schemas.UserCreate(
            first_name="Super",
            last_name="Administrador",
            email="admin@silp.com",
            password="admin123",  # Contraseña por defecto - ¡CAMBIA ESTO EN PRODUCCIÓN!
            phone="3000000000",
            role="superadmin",
            municipality_id=municipality.id,
            occupation_id=occupation.id,
            address="Sistema SILP",
            cedula=None,
            is_active=True,
            mdv=None
        )
        
        # Verificar que municipality_id no sea None (requerido por la BD)
        if not user_data.municipality_id:
            print("❌ Error: municipality_id es requerido")
            return None
        
        # Usar crud para crear el usuario (que maneja el hash de la contraseña)
        new_user = crud.create_user(db=db, user=user_data)
        
        if new_user:
            print(f"✅ Usuario superadmin creado exitosamente:")
            print(f"   Email: {new_user.email}")
            print(f"   Contraseña: admin123")
            print(f"   ⚠️  IMPORTANTE: Cambia la contraseña después del primer login")
            return new_user
        else:
            print("❌ Error: No se pudo crear el usuario superadmin")
            return None
            
    except Exception as e:
        print(f"❌ Error al crear usuario inicial: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Creando usuario inicial (superadmin)...")
    user = create_initial_user()
    if user:
        print("\n✅ Proceso completado exitosamente")
        sys.exit(0)
    else:
        print("\n❌ Proceso falló")
        sys.exit(1)

