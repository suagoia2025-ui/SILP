# SILP Backend - Documentación para Desarrolladores

> **Última actualización**: 17 de noviembre de 2025

**Nota**: Esta documentación incluye el nuevo endpoint `/api/v1/network/graph-data` para la visualización de red de contactos.

Backend del sistema SILP construido con FastAPI, SQLAlchemy y PostgreSQL.

## 📋 Tabla de Contenidos

- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelos de Datos](#-modelos-de-datos)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Autenticación](#-autenticación)
- [Desarrollo](#-desarrollo)
- [Testing](#-testing)

## 📦 Requisitos

- Python 3.13 o superior
- PostgreSQL 12 o superior
- pip (gestor de paquetes de Python)

## 🚀 Instalación

### 1. Crear Entorno Virtual

```bash
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate
```

### 2. Instalar Dependencias

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv python-jose[cryptography] passlib[bcrypt] pydantic[email] fastapi-mail
```

O crear un archivo `requirements.txt`:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-dotenv==1.0.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic[email]==2.5.0
fastapi-mail==1.4.1
```

Y luego:

```bash
pip install -r requirements.txt
```

### 3. Configurar Base de Datos

La base de datos `db_provida_uf` ya debe existir en PostgreSQL. Si necesitas ejecutar el script de inicialización:

```bash
# Ejecutar script SQL en la base de datos existente
psql -d db_provida_uf -f db_provida_uf.sql
```

**Nota**: Si la base de datos no existe, créala primero con:
```bash
createdb db_provida_uf
```

**Migración de campos nuevos (`is_active` y `mdv`):**

Si ya tienes una base de datos existente y necesitas agregar los campos `is_active` y `mdv` a las tablas `users` y `contacts`, ejecuta:

```bash
# Con contraseña en variable de entorno
PGPASSWORD='tu_contraseña' psql -d db_provida_uf -U tu_usuario -f add_is_active_mdv_columns.sql

# O proporciona la contraseña cuando se solicite
psql -d db_provida_uf -U tu_usuario -f add_is_active_mdv_columns.sql
```

Este script:
- Agrega la columna `is_active` (Boolean, NOT NULL, DEFAULT TRUE) a `users` y `contacts`
- Agrega la columna `mdv` (VARCHAR(255), NULLABLE) a `users` y `contacts`
- Actualiza registros existentes para asegurar que `is_active` sea TRUE por defecto

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del directorio `silp_backend/`:

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/db_provida_uf

# JWT
SECRET_KEY=tu-clave-secreta-muy-segura-aqui-minimo-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60

# Correo Electrónico (para recuperación de contraseña)
MAIL_USERNAME=tu-usuario-mailtrap
MAIL_PASSWORD=tu-contraseña-mailtrap
MAIL_FROM=tu-email@ejemplo.com
MAIL_PORT=587
MAIL_SERVER=smtp.mailtrap.io
MAIL_FROM_NAME=SILP Sistema
```

**⚠️ Importante**: 
- `SECRET_KEY` debe ser una cadena segura y aleatoria (mínimo 32 caracteres)
- Nunca commitees el archivo `.env` al repositorio
- Usa diferentes valores para desarrollo y producción

### Generar SECRET_KEY

Puedes generar una clave segura con Python:

```python
import secrets
print(secrets.token_urlsafe(32))
```

## 📁 Estructura del Proyecto

```
silp_backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Aplicación FastAPI principal
│   ├── database.py             # Configuración de SQLAlchemy
│   ├── models.py               # Modelos de base de datos
│   ├── schemas.py              # Esquemas Pydantic (validación)
│   ├── crud.py                 # Operaciones CRUD
│   ├── security.py             # Autenticación JWT y hash
│   ├── email_utils.py          # Utilidades de correo
│   └── routers/                # Endpoints de la API
│       ├── __init__.py
│       ├── auth.py             # Autenticación (login)
│       ├── users.py            # CRUD usuarios
│       ├── contacts.py         # CRUD contactos
│       ├── municipalities.py   # Listar municipios
│       ├── occupations.py     # Listar ocupaciones
│       ├── password_recovery.py # Recuperación de contraseña
│       └── network.py          # Visualización de red (grafo de usuarios/contactos)
├── db_provida_uf.sql           # Script de inicialización de BD
├── add_is_active_mdv_columns.sql  # Script de migración para campos is_active y mdv
├── .env                        # Variables de entorno (no commiteado)
└── README.md                   # Este archivo
```

## 🗄 Modelos de Datos

### Municipality (Municipio)

```python
class Municipality(Base):
    id: Integer (PK)
    name: String(100) (unique)
    department: String(100)
```

### Occupation (Ocupación)

```python
class Occupation(Base):
    id: Integer (PK)
    name: String(100) (unique)
```

### User (Usuario)

```python
class User(Base):
    id: UUID (PK)
    first_name: String(100)
    last_name: String(100)
    email: String(255) (unique, indexed)
    password_hash: String
    phone: String(20)
    role: String(20)  # 'superadmin', 'admin', 'lider'
    address: String(255) (nullable)
    municipality_id: Integer (FK → municipalities.id)
    occupation_id: Integer (FK → occupations.id, nullable)
    is_active: Boolean (default: True)  # Estado activo/inactivo
    mdv: String(255) (nullable)  # Referencia alfanumérica personalizada
    
    # Relaciones
    municipality: Relationship → Municipality
    occupation: Relationship → Occupation
```

### Contact (Contacto)

```python
class Contact(Base):
    id: UUID (PK)
    first_name: String(100)
    last_name: String(100)
    email: String(255)
    phone: String(20)
    address: String(255) (nullable)
    created_at: Timestamp
    user_id: UUID (FK → users.id)
    municipality_id: Integer (FK → municipalities.id)
    occupation_id: Integer (FK → occupations.id, nullable)
    is_active: Boolean (default: True)  # Estado activo/inactivo
    mdv: String(255) (nullable)  # Referencia alfanumérica personalizada
    
    # Relaciones
    owner: Relationship → User
    municipality: Relationship → Municipality
    occupation: Relationship → Occupation
```

## 🔌 Endpoints de la API

### Autenticación

#### `POST /api/v1/login`
Iniciar sesión y obtener token JWT.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Nota:** El token expira después de `ACCESS_TOKEN_EXPIRE_MINUTES` (por defecto: 30 minutos).

#### `POST /api/v1/refresh-token`
Renovar el token de acceso del usuario actual.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Nota:** 
- Requiere un token válido (aunque esté próximo a expirar)
- Genera un nuevo token con la misma duración (30 minutos por defecto)
- Si el token ya expiró, retorna error 401

### Usuarios

#### `GET /api/v1/users/me`
Obtener información del usuario actual.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "1234567890",
  "role": "lider",
  "address": "Calle 123",
  "municipality": { "id": 1, "name": "Cúcuta", "department": "Norte de Santander" },
  "occupation": { "id": 1, "name": "Ingeniero" }
}
```

#### `GET /api/v1/users/`
Listar todos los usuarios (solo superadmin).

**Query Parameters:**
- `skip`: Número de registros a saltar (default: 0)
- `limit`: Número máximo de registros (default: 100)
- `search`: Término de búsqueda (opcional)

#### `POST /api/v1/users/`
Crear nuevo usuario (solo superadmin).

**Request:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña123",
  "first_name": "María",
  "last_name": "González",
  "phone": "9876543210",
  "role": "lider",
  "municipality_id": 1,
  "occupation_id": 2,
  "address": "Av. Principal",
  "is_active": true,
  "mdv": "REF-001"
}
```

#### `PUT /api/v1/users/{user_id}`
Actualizar usuario (solo superadmin).

**Request:** (todos los campos opcionales)
```json
{
  "email": "nuevo@ejemplo.com",
  "first_name": "María",
  "role": "admin",
  ...
}
```

#### `DELETE /api/v1/users/{user_id}`
Eliminar usuario (solo superadmin).

### Contactos

#### `GET /api/v1/contacts/`
Listar contactos.

**Comportamiento por rol:**
- **superadmin**: Ve todos los contactos
- **admin/lider**: Solo ve sus propios contactos

**Query Parameters:**
- `search`: Término de búsqueda (opcional)

#### `POST /api/v1/contacts/`
Crear nuevo contacto.

**Request:**
```json
{
  "first_name": "Carlos",
  "last_name": "Rodríguez",
  "email": "carlos@ejemplo.com",
  "phone": "5551234567",
  "municipality_id": 1,
  "occupation_id": 3,
  "address": "Calle 456",
  "is_active": true,
  "mdv": "CONT-001"
}
```

#### `PUT /api/v1/contacts/{contact_id}`
Actualizar contacto.

**Permisos:**
- El dueño del contacto puede editarlo
- El superadmin puede editar cualquier contacto

#### `DELETE /api/v1/contacts/{contact_id}`
Eliminar contacto.

**Permisos:**
- El dueño del contacto puede eliminarlo
- El superadmin puede eliminar cualquier contacto

### Datos de Referencia

#### `GET /api/v1/municipalities/`
Listar todos los municipios.

#### `GET /api/v1/occupations/`
Listar todas las ocupaciones.

### Visualización de Red

#### `GET /api/v1/network/graph-data`
Obtener datos del grafo de usuarios y contactos para visualización.

**Headers:**
```
Authorization: Bearer <token>
```

**Permisos:**
- **Superadmin**: Ve todos los usuarios y contactos del sistema
- **Admin/Líder**: Ve solo a sí mismo y sus contactos

**Response:**
```json
{
  "nodes": [
    {
      "id": "user-{uuid}",
      "type": "user",
      "data": {
        "label": "Nombre Completo",
        "first_name": "Juan",
        "last_name": "Pérez",
        "email": "juan@ejemplo.com",
        "phone": "1234567890",
        "role": "lider",
        "is_active": true,
        "mdv": "REF001",
        "municipality": "Cúcuta",
        "occupation": "Ingeniero",
        "contact_count": 5
      },
      "position": { "x": 0, "y": 0 }
    },
    {
      "id": "contact-{uuid}",
      "type": "contact",
      "data": {
        "label": "Nombre Completo",
        "first_name": "María",
        "last_name": "González",
        "email": "maria@ejemplo.com",
        "phone": "0987654321",
        "is_active": true,
        "mdv": "REF002",
        "municipality": "Bucaramanga",
        "occupation": "Médico",
        "owner_name": "Juan Pérez"
      },
      "position": { "x": 0, "y": 0 }
    }
  ],
  "edges": [
    {
      "id": "edge-{user_id}-{contact_id}",
      "source": "user-{uuid}",
      "target": "contact-{uuid}",
      "type": "default"
    }
  ]
}
```

**Notas:**
- Las posiciones (`x`, `y`) se calculan en el frontend usando d3-force
- El endpoint usa `joinedload` para optimizar las queries y evitar N+1
- Los campos `municipality` y `occupation` pueden ser `null` si no están asignados

### Recuperación de Contraseña

#### `POST /api/v1/password-recovery`
Solicitar recuperación de contraseña.

**Request:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response:**
```json
{
  "message": "Si existe una cuenta con este correo, se ha enviado un enlace..."
}
```

#### `POST /api/v1/reset-password`
Restablecer contraseña con token.

**Request:**
```json
{
  "token": "token-jwt-de-recuperacion",
  "new_password": "nueva-contraseña-segura"
}
```

## 🔐 Autenticación

### Flujo de Autenticación

1. Usuario envía credenciales a `/api/v1/login`
2. Backend valida email y contraseña
3. Si es válido, genera token JWT con expiración (30 minutos por defecto)
4. Token se incluye en header `Authorization: Bearer <token>`
5. Backend valida token en cada request protegido
6. Si el token está próximo a expirar, el frontend puede llamar a `/api/v1/refresh-token` para renovarlo
7. El nuevo token tiene la misma duración que el original

### Implementación

El token JWT contiene:
- `sub`: Email del usuario
- `exp`: Timestamp de expiración

La validación se hace mediante la dependencia `get_current_user`:

```python
from app.security import get_current_user

@router.get("/endpoint-protegido")
def mi_endpoint(current_user: User = Depends(get_current_user)):
    # current_user está disponible aquí
    return current_user
```

### Hash de Contraseñas

Las contraseñas se hashean con **bcrypt** antes de almacenarse:

```python
from app.security import get_password_hash, verify_password

# Al crear usuario
hashed = get_password_hash("contraseña-plana")

# Al verificar login
is_valid = verify_password("contraseña-plana", hashed)
```

## 💻 Desarrollo

### Ejecutar Servidor de Desarrollo

```bash
# Activar entorno virtual
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Ejecutar con recarga automática
uvicorn app.main:app --reload
```

El servidor estará disponible en `http://127.0.0.1:8000`

### Documentación Interactiva

Una vez iniciado el servidor:

- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

### Estructura de un Endpoint

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, security, models
from app.database import get_db

router = APIRouter()

@router.post("/mi-endpoint", response_model=schemas.MiSchema)
def crear_algo(
    data: schemas.MiSchemaCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # Validar permisos
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado"
        )
    
    # Lógica de negocio
    nuevo_item = crud.crear_item(db, data)
    
    return nuevo_item
```

### Agregar Nuevo Endpoint

1. Crear/escribir esquema en `schemas.py`
2. Agregar función CRUD en `crud.py` (si es necesario)
3. Crear endpoint en el router correspondiente
4. Registrar router en `main.py`

### Validación de Datos

Los esquemas Pydantic validan automáticamente:

```python
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr  # Valida formato de email
    password: str
    first_name: str
    # ...
```

### Manejo de Errores

```python
from fastapi import HTTPException, status

# Error 404
raise HTTPException(status_code=404, detail="Recurso no encontrado")

# Error 403
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="No tiene permisos"
)

# Error 400
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Datos inválidos"
)
```

## 🧪 Testing

### Estructura de Tests (Recomendado)

```
tests/
├── __init__.py
├── conftest.py          # Configuración de pytest
├── test_auth.py         # Tests de autenticación
├── test_users.py        # Tests de usuarios
├── test_contacts.py     # Tests de contactos
└── test_security.py     # Tests de seguridad
```

### Ejemplo de Test

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login():
    response = client.post(
        "/api/v1/login",
        json={"email": "test@ejemplo.com", "password": "test123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
```

### Ejecutar Tests

```bash
pytest
pytest tests/test_auth.py  # Ejecutar test específico
pytest -v  # Modo verbose
```

## 🔍 Debugging

### Logs

FastAPI usa el sistema de logging de Python:

```python
import logging

logger = logging.getLogger(__name__)

@router.get("/endpoint")
def mi_endpoint():
    logger.info("Endpoint llamado")
    logger.error("Error ocurrido")
```

### Base de Datos

Conectar directamente a PostgreSQL:

```bash
psql -d db_provida_uf
```

Consultas útiles:

```sql
-- Ver todos los usuarios
SELECT * FROM users;

-- Ver contactos de un usuario
SELECT * FROM contacts WHERE user_id = 'uuid-del-usuario';

-- Ver estructura de tabla
\d users
```

## 📝 Convenciones de Código

- **Nombres de funciones**: snake_case
- **Nombres de clases**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Comentarios**: En español para lógica compleja
- **Docstrings**: En español para funciones públicas

## 🚀 Despliegue

### Producción

1. Configurar variables de entorno de producción
2. Usar servidor ASGI (uvicorn con workers)
3. Configurar HTTPS
4. Configurar CORS para dominio de producción
5. Usar base de datos de producción
6. Configurar logging apropiado

### Ejemplo con uvicorn en producción

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 Recursos Adicionales

- [Documentación de FastAPI](https://fastapi.tiangolo.com/)
- [Documentación de SQLAlchemy](https://docs.sqlalchemy.org/)
- [Documentación de Pydantic](https://docs.pydantic.dev/)
- [Documentación de JWT](https://jwt.io/)

---

**Última actualización**: 17 de noviembre de 2025

**¿Preguntas?** Consulta la documentación principal del proyecto o contacta al equipo de desarrollo.

