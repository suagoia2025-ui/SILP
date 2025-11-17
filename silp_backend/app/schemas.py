from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import uuid

# --- SCHEMAS DE AUTENTICACIÓN ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    # NOTA: No validamos la longitud aquí para mantener compatibilidad
    # con contraseñas existentes que fueron hasheadas sin truncar.
    # La validación se aplica solo en creación/reset de contraseñas.

class Token(BaseModel):
    access_token: str
    token_type: str



# --- SCHEMAS DE DATOS (MUNICIPIO Y OCUPACIÓN) ---
class MunicipalityBase(BaseModel):
    name: str
    department: str

class Municipality(MunicipalityBase):
    id: int
    class Config:
        from_attributes = True

class Occupation(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

# --- SCHEMAS DE CONTACTO ---
class ContactBase(BaseModel):
    first_name: str
    last_name: str
    cedula: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    municipality_id: Optional[int] = None
    address: str | None = None
    occupation_id: int | None = None
    is_active: bool = True
    mdv: str | None = None
    
    @field_validator('cedula')
    @classmethod
    def validate_cedula(cls, v: Optional[str]) -> Optional[str]:
        """Valida que la cédula contenga solo dígitos y tenga longitud válida, o permitir valores TEMP para datos históricos"""
        if v is None or v == '':
            return None
        # Remover espacios en blanco
        v = v.strip()
        # Permitir valores que empiecen con 'TEMP' (datos históricos)
        if v.startswith('TEMP'):
            return v
        # Validar que solo contenga dígitos
        if not v.isdigit():
            raise ValueError("La cédula solo puede contener dígitos numéricos")
        # Validar longitud (mínimo 5, máximo 15 dígitos)
        if len(v) < 5:
            raise ValueError("La cédula debe tener al menos 5 dígitos")
        if len(v) > 15:
            raise ValueError("La cédula no puede tener más de 15 dígitos")
        return v

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    """Schema para actualizar contactos. Todos los campos son opcionales."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    cedula: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    municipality_id: Optional[int] = None
    address: Optional[str] = None
    occupation_id: Optional[int] = None
    is_active: Optional[bool] = None
    mdv: Optional[str] = None
    
    @field_validator('cedula')
    @classmethod
    def validate_cedula(cls, v: Optional[str]) -> Optional[str]:
        """Valida que la cédula contenga solo dígitos y tenga longitud válida, o permitir valores TEMP para datos históricos"""
        if v is None or v == '':
            return None
        # Remover espacios en blanco
        v = v.strip()
        # Permitir valores que empiecen con 'TEMP' (datos históricos)
        if v.startswith('TEMP'):
            return v
        # Validar que solo contenga dígitos
        if not v.isdigit():
            raise ValueError("La cédula solo puede contener dígitos numéricos")
        # Validar longitud (mínimo 5, máximo 15 dígitos)
        if len(v) < 5:
            raise ValueError("La cédula debe tener al menos 5 dígitos")
        if len(v) > 15:
            raise ValueError("La cédula no puede tener más de 15 dígitos")
        return v

class Contact(ContactBase):
    id: uuid.UUID
    user_id: uuid.UUID
    # --- LÍNEAS A AÑADIR ---
    municipality: Municipality | None = None
    occupation: Occupation | None = None
    
    class Config:
        from_attributes = True


#CREACION DE USUARIOS

class User(BaseModel):
    id: uuid.UUID
    email: Optional[EmailStr] = None
    first_name: str
    last_name: str
    cedula: Optional[str] = None
    phone: Optional[str] = None
    role: str
    address: str | None = None
    is_active: bool = True
    mdv: str | None = None
    municipality: Municipality | None = None
    occupation: Occupation | None = None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    first_name: str
    last_name: str
    cedula: Optional[str] = None
    phone: Optional[str] = None
    role: str # Aquí el superadmin podrá poner 'admin' o 'lider'
    municipality_id: Optional[int] = None
    address: str | None = None
    occupation_id: int | None = None
    is_active: bool = True
    mdv: str | None = None
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v: Optional[str]) -> Optional[str]:
        """Valida que la contraseña no exceda 72 bytes (límite de bcrypt)"""
        if v is None:
            return None
        password_bytes = v.encode('utf-8')
        if len(password_bytes) > 72:
            raise ValueError(
                f"La contraseña no puede exceder 72 bytes. "
                f"Tu contraseña tiene {len(password_bytes)} bytes. "
                f"Por favor, usa una contraseña más corta."
            )
        return v
    
    @field_validator('cedula')
    @classmethod
    def validate_cedula(cls, v: Optional[str]) -> Optional[str]:
        """Valida que la cédula contenga solo dígitos y tenga longitud válida, o permitir valores TEMP para datos históricos"""
        if v is None or v == '':
            return None
        # Remover espacios en blanco
        v = v.strip()
        # Permitir valores que empiecen con 'TEMP' (datos históricos)
        if v.startswith('TEMP'):
            return v
        # Validar que solo contenga dígitos
        if not v.isdigit():
            raise ValueError("La cédula solo puede contener dígitos numéricos")
        # Validar longitud (mínimo 5, máximo 15 dígitos)
        if len(v) < 5:
            raise ValueError("La cédula debe tener al menos 5 dígitos")
        if len(v) > 15:
            raise ValueError("La cédula no puede tener más de 15 dígitos")
        return v

#molde para cambiar datos por el superadmin
class UserUpdate(BaseModel):
    """Schema para actualizar usuarios. Todos los campos son opcionales."""
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    cedula: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    address: Optional[str] = None
    municipality_id: Optional[int] = None
    occupation_id: Optional[int] = None
    is_active: Optional[bool] = None
    mdv: Optional[str] = None
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v: Optional[str]) -> Optional[str]:
        """Valida que la contraseña no exceda 72 bytes (límite de bcrypt)"""
        if v is None:
            return None
        password_bytes = v.encode('utf-8')
        if len(password_bytes) > 72:
            raise ValueError(
                f"La contraseña no puede exceder 72 bytes. "
                f"Tu contraseña tiene {len(password_bytes)} bytes. "
                f"Por favor, usa una contraseña más corta."
            )
        return v
    
    @field_validator('cedula')
    @classmethod
    def validate_cedula(cls, v: Optional[str]) -> Optional[str]:
        """Valida que la cédula contenga solo dígitos y tenga longitud válida, o permitir valores TEMP para datos históricos"""
        if v is None or v == '':
            return None
        # Remover espacios en blanco
        v = v.strip()
        # Permitir valores que empiecen con 'TEMP' (datos históricos)
        if v.startswith('TEMP'):
            return v
        # Validar que solo contenga dígitos
        if not v.isdigit():
            raise ValueError("La cédula solo puede contener dígitos numéricos")
        # Validar longitud (mínimo 5, máximo 15 dígitos)
        if len(v) < 5:
            raise ValueError("La cédula debe tener al menos 5 dígitos")
        if len(v) > 15:
            raise ValueError("La cédula no puede tener más de 15 dígitos")
        return v


