from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from . import models, schemas
import uuid
from .security import get_password_hash


# --- FUNCIONES DE USUARIO ---

def get_user_by_email(db: Session, email: str):
    # Añadimos joinedload para que siempre traiga los datos relacionados
    return db.query(models.User).options(
        joinedload(models.User.municipality),
        joinedload(models.User.occupation)
    ).filter(models.User.email == email).first()

def get_user_by_cedula(db: Session, cedula: str):
    """Obtiene un usuario por su cédula"""
    return db.query(models.User).options(
        joinedload(models.User.municipality),
        joinedload(models.User.occupation)
    ).filter(models.User.cedula == cedula).first()

def get_contact_by_cedula(db: Session, cedula: str):
    """Obtiene un contacto por su cédula"""
    return db.query(models.Contact).options(
        joinedload(models.Contact.municipality),
        joinedload(models.Contact.occupation)
    ).filter(models.Contact.cedula == cedula).first()

def get_user_by_id(db: Session, user_id: uuid.UUID):
    # Añadimos joinedload aquí también
    return db.query(models.User).options(
        joinedload(models.User.municipality),
        joinedload(models.User.occupation)
    ).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100, search: str = ""):
    query = db.query(models.User).options(
        joinedload(models.User.municipality),
        joinedload(models.User.occupation)
    )
    if search:
        query = query.filter(or_(
            models.User.first_name.ilike(f"%{search}%"),
            models.User.last_name.ilike(f"%{search}%"),
            models.User.email.ilike(f"%{search}%"),
            models.User.cedula.ilike(f"%{search}%")
        ))
    return query.offset(skip).limit(limit).all()


#----------
def create_user(db: Session, user: schemas.UserCreate):
    existing_user = get_user_by_email(db, email=user.email)
    if existing_user:
        return None
    # Verificar si la cédula ya existe (solo si se proporciona)
    if user.cedula:
        existing_cedula = get_user_by_cedula(db, cedula=user.cedula)
        if existing_cedula:
            return None
    hashed_password = get_password_hash(user.password)
    
    # FORMA CORRECTA Y EXPLÍCITA DE CREAR EL USUARIO
    db_user = models.User(
        id=uuid.uuid4(),
        email=user.email,
        password_hash=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        cedula=user.cedula,
        phone=user.phone,
        role=user.role,
        municipality_id=user.municipality_id,
        address=user.address,
        occupation_id=user.occupation_id,
        is_active=user.is_active,
        mdv=user.mdv
    )
    
    db.add(db_user)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        # Verificar si es error de cédula duplicada
        if 'cedula' in str(e.orig).lower() or 'users_cedula_unique' in str(e.orig):
            raise ValueError("La cédula ya está registrada en el sistema")
        raise
    # Volvemos a buscar el usuario para devolverlo con las relaciones cargadas
    return get_user_by_id(db, user_id=db_user.id)
#----------

def update_user(db: Session, user_id: uuid.UUID, user_data: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        # Usar exclude_unset=True para solo incluir campos que fueron enviados explícitamente
        # Esto permite omitir campos del JSON sin que se establezcan como None
        update_data = user_data.model_dump(exclude_unset=True)
        
        # Si se está actualizando la contraseña, hashearla
        if 'password' in update_data and update_data['password']:
            from .security import get_password_hash
            update_data['password_hash'] = get_password_hash(update_data['password'])
            del update_data['password']  # Eliminar 'password' ya que el modelo usa 'password_hash'
        
        # Si se está actualizando la cédula, verificar que no exista otra con la misma cédula (solo si se proporciona)
        if 'cedula' in update_data:
            # Si cedula es None o string vacío, establecer como None
            if update_data['cedula'] is None or update_data['cedula'] == '':
                update_data['cedula'] = None
            elif update_data['cedula']:
                existing_cedula = get_user_by_cedula(db, cedula=update_data['cedula'])
                if existing_cedula and existing_cedula.id != user_id:
                    raise ValueError("La cédula ya está registrada en el sistema")
        
        # Aplicar solo los campos que fueron enviados
        for key, value in update_data.items():
            setattr(db_user, key, value)
        
        try:
            db.commit()
        except IntegrityError as e:
            db.rollback()
            # Verificar si es error de cédula duplicada
            if 'cedula' in str(e.orig).lower() or 'users_cedula_unique' in str(e.orig):
                raise ValueError("La cédula ya está registrada en el sistema")
            raise
        # Volvemos a buscar el usuario para devolverlo con las relaciones actualizadas
        return get_user_by_id(db, user_id=user_id)
    return None

def delete_user(db: Session, user_id: uuid.UUID):
    db_user = get_user_by_id(db, user_id=user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# --- FUNCIONES DE CONTACTO ---

def get_contact_by_id(db: Session, contact_id: uuid.UUID):
    return db.query(models.Contact).options(
        joinedload(models.Contact.municipality),
        joinedload(models.Contact.occupation)
    ).filter(models.Contact.id == contact_id).first()

def get_user_contacts(db: Session, user_id: uuid.UUID, search: str = ""):
    query = db.query(models.Contact).options(
        joinedload(models.Contact.municipality),
        joinedload(models.Contact.occupation)
    ).filter(models.Contact.user_id == user_id)
    
    if search:
        query = query.filter(or_(
            models.Contact.first_name.ilike(f"%{search}%"),
            models.Contact.last_name.ilike(f"%{search}%"),
            models.Contact.email.ilike(f"%{search}%"),
            models.Contact.cedula.ilike(f"%{search}%")
        ))
    return query.all()

def get_all_contacts(db: Session, search: str = ""):
    query = db.query(models.Contact).options(
        joinedload(models.Contact.municipality),
        joinedload(models.Contact.occupation)
    )
    
    if search:
        query = query.filter(or_(
            models.Contact.first_name.ilike(f"%{search}%"),
            models.Contact.last_name.ilike(f"%{search}%"),
            models.Contact.email.ilike(f"%{search}%"),
            models.Contact.cedula.ilike(f"%{search}%")
        ))
    return query.all()

def create_user_contact(db: Session, contact: schemas.ContactCreate, user_id: uuid.UUID):
    # Verificar si la cédula ya existe (solo si se proporciona)
    if contact.cedula:
        existing_cedula = get_contact_by_cedula(db, cedula=contact.cedula)
        if existing_cedula:
            raise ValueError("La cédula ya está registrada en el sistema")
    db_contact = models.Contact(**contact.model_dump(), user_id=user_id)
    db.add(db_contact)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        # Verificar si es error de cédula duplicada
        if 'cedula' in str(e.orig).lower() or 'contacts_cedula_unique' in str(e.orig):
            raise ValueError("La cédula ya está registrada en el sistema")
        raise
    db.refresh(db_contact)
    # Después de crear, lo volvemos a buscar para cargar las relaciones
    return get_contact_by_id(db, contact_id=db_contact.id)


def update_contact(db: Session, contact_id: uuid.UUID, contact_data: schemas.ContactUpdate):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if db_contact:
        # Usar exclude_unset=True para solo incluir campos que fueron enviados explícitamente
        # Esto permite omitir campos del JSON sin que se establezcan como None
        update_data = contact_data.model_dump(exclude_unset=True)
        
        # Si se está actualizando la cédula, verificar que no exista otra con la misma cédula (solo si se proporciona)
        if 'cedula' in update_data:
            # Si cedula es None o string vacío, establecer como None
            if update_data['cedula'] is None or update_data['cedula'] == '':
                update_data['cedula'] = None
            elif update_data['cedula']:
                existing_cedula = get_contact_by_cedula(db, cedula=update_data['cedula'])
                if existing_cedula and existing_cedula.id != contact_id:
                    raise ValueError("La cédula ya está registrada en el sistema")
        
        # Aplicar solo los campos que fueron enviados
        for key, value in update_data.items():
            setattr(db_contact, key, value)
        
        try:
            db.commit()
        except IntegrityError as e:
            db.rollback()
            # Verificar si es error de cédula duplicada
            if 'cedula' in str(e.orig).lower() or 'contacts_cedula_unique' in str(e.orig):
                raise ValueError("La cédula ya está registrada en el sistema")
            raise
        # Después de actualizar, lo volvemos a buscar para cargar las relaciones
        return get_contact_by_id(db, contact_id=contact_id)
    return None

def delete_contact(db: Session, contact_id: uuid.UUID):
    db_contact = get_contact_by_id(db, contact_id=contact_id)
    if db_contact:
        db.delete(db_contact)
        db.commit()
    return db_contact

def get_municipalities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Municipality).offset(skip).limit(limit).all()

def get_occupations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Occupation).offset(skip).limit(limit).all()