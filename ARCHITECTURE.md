# Arquitectura del Sistema SILP

Este documento describe en detalle la arquitectura, diseño y decisiones técnicas del sistema SILP.

## 📐 Visión General de la Arquitectura

SILP sigue una arquitectura de **cliente-servidor** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Frontend)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React + Material-UI                                  │  │
│  │  - Gestión de estado local                            │  │
│  │  - Enrutamiento con React Router                      │  │
│  │  - Autenticación con JWT                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST
                            │ JSON
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVIDOR (Backend)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  FastAPI                                              │  │
│  │  - Endpoints REST                                     │  │
│  │  - Validación con Pydantic                           │  │
│  │  - Autenticación JWT                                 │  │
│  │  - Middleware CORS                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SQLAlchemy ORM                                       │  │
│  │  - Abstracción de base de datos                       │  │
│  │  - Relaciones entre modelos                           │  │
│  │  - Queries optimizadas                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  PostgreSQL                                           │  │
│  │  - Datos relacionales                                 │  │
│  │  - Integridad referencial                             │  │
│  │  - Índices para optimización                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🏛 Capas de la Aplicación

### Capa de Presentación (Frontend)

**Tecnologías:**
- React 18 con Hooks
- Material-UI para componentes
- React Router para navegación
- Axios para comunicación HTTP

**Responsabilidades:**
- Renderizado de interfaz de usuario
- Gestión de estado local (useState, useEffect)
- Validación de formularios del lado del cliente
- Manejo de autenticación (almacenamiento de tokens)
- Enrutamiento y protección de rutas

**Componentes Principales:**
```
App.jsx                    # Router principal y gestión de auth
├── Login.jsx             # Autenticación
├── Layout.jsx            # Layout con navegación
├── ContactsPage.jsx      # Gestión de contactos (muestra inactivos en rojo)
├── UsersPage.jsx         # Gestión de usuarios (muestra inactivos en rojo)
├── ContactForm.jsx       # Formulario de contactos (incluye is_active y mdv)
├── AddUserForm.jsx       # Formulario de usuarios (incluye is_active y mdv)
└── [Componentes auxiliares]
```

### Capa de Aplicación (Backend)

**Tecnologías:**
- FastAPI
- Pydantic para validación
- SQLAlchemy ORM
- JWT para autenticación

**Responsabilidades:**
- Procesamiento de peticiones HTTP
- Validación de datos de entrada
- Lógica de negocio
- Autenticación y autorización
- Transformación de datos

**Estructura:**
```
app/
├── main.py              # Aplicación FastAPI y configuración
├── routers/             # Endpoints de la API
│   ├── auth.py         # Autenticación
│   ├── users.py        # CRUD usuarios
│   ├── contacts.py     # CRUD contactos
│   └── ...
├── models.py           # Modelos de base de datos (SQLAlchemy)
├── schemas.py          # Esquemas de validación (Pydantic)
├── crud.py             # Operaciones de base de datos
├── security.py         # Autenticación JWT y hash
└── database.py         # Configuración de conexión
```

### Capa de Datos

**Tecnologías:**
- PostgreSQL
- SQLAlchemy ORM

**Responsabilidades:**
- Almacenamiento persistente
- Integridad referencial
- Optimización con índices

**Modelos de Datos:**
```
Municipality (municipalities)
├── id: Integer (PK)
├── name: String
└── department: String

Occupation (occupations)
├── id: Integer (PK)
└── name: String

User (users)
├── id: UUID (PK)
├── first_name: String
├── last_name: String
├── email: String (unique)
├── password_hash: String
├── phone: String
├── role: String (superadmin|admin|lider)
├── address: String (nullable)
├── municipality_id: Integer (FK)
├── occupation_id: Integer (FK, nullable)
├── is_active: Boolean (default: True)
└── mdv: String(255) (nullable)

Contact (contacts)
├── id: UUID (PK)
├── first_name: String
├── last_name: String
├── email: String
├── phone: String
├── address: String (nullable)
├── created_at: Timestamp
├── user_id: UUID (FK)
├── municipality_id: Integer (FK)
├── occupation_id: Integer (FK, nullable)
├── is_active: Boolean (default: True)
└── mdv: String(255) (nullable)
```

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

```
1. Usuario → POST /api/v1/login
   { email, password }
   
2. Backend valida credenciales
   ├── Busca usuario por email
   ├── Verifica hash de contraseña (bcrypt)
   └── Genera token JWT (expira en 30 minutos)
   
3. Backend → Token JWT
   { access_token, token_type: "bearer" }
   
4. Frontend almacena token en localStorage
   
5. Frontend incluye token en headers
   Authorization: Bearer <token>
   
6. Backend valida token en cada request
   ├── Decodifica JWT
   ├── Verifica expiración
   ├── Obtiene usuario de BD
   └── Inyecta current_user en endpoint

7. Frontend verifica expiración cada minuto
   ├── Si faltan ≤5 minutos → Muestra advertencia
   └── Usuario puede renovar token

8. Renovación de token (opcional)
   ├── Usuario → POST /api/v1/refresh-token
   ├── Backend valida token actual
   ├── Genera nuevo token (30 minutos más)
   └── Frontend actualiza token en localStorage
```

### Seguridad

**Contraseñas:**
- Hash con bcrypt (algoritmo de hash unidireccional)
- Salt automático incluido
- Nunca se almacenan en texto plano

**Tokens JWT:**
- Firma con clave secreta (SECRET_KEY)
- Expiración configurable (ACCESS_TOKEN_EXPIRE_MINUTES, por defecto: 30 minutos)
- Algoritmo: HS256
- Payload: `{ "sub": email, "exp": timestamp }`
- Renovación mediante endpoint `/api/v1/refresh-token`
- Advertencia en frontend 5 minutos antes de expirar

**Protección de Endpoints:**
```python
# Ejemplo de endpoint protegido
@router.get("/users/me")
def read_current_user(
    current_user: User = Depends(get_current_user)
):
    return current_user
```

La dependencia `get_current_user`:
1. Extrae el token del header Authorization
2. Valida y decodifica el JWT
3. Busca el usuario en la base de datos
4. Retorna el usuario o lanza excepción 401

## 🔑 Sistema de Autorización (Roles y Permisos)

### Roles

1. **superadmin**
   - Acceso completo al sistema
   - Puede crear, editar y eliminar usuarios
   - Puede ver todos los contactos
   - Puede editar/eliminar cualquier contacto

2. **admin**
   - Puede gestionar contactos
   - No puede gestionar usuarios
   - No puede ver contactos de otros usuarios

3. **lider**
   - Solo puede gestionar sus propios contactos
   - No puede ver contactos de otros usuarios
   - No puede gestionar usuarios

### Implementación de Permisos

**En Backend:**
```python
# Verificación de rol en endpoint
if current_user.role != "superadmin":
    raise HTTPException(status_code=403, detail="No autorizado")

# Verificación de propiedad
is_owner = db_contact.user_id == current_user.id
is_superadmin = current_user.role == "superadmin"

if not is_superadmin and not is_owner:
    raise HTTPException(status_code=403, detail="No autorizado")
```

**En Frontend:**
```jsx
// Protección de rutas
<Route 
  path="users" 
  element={
    currentUser?.role === 'superadmin' 
      ? <UsersPage /> 
      : <Navigate to="/contacts" />
  } 
/>
```

## 📡 API REST

### Convenciones

- **Base URL**: `/api/v1`
- **Métodos HTTP**:
  - `GET`: Obtener recursos
  - `POST`: Crear recursos
  - `PUT`: Actualizar recursos completos
  - `DELETE`: Eliminar recursos

### Endpoints Principales

#### Autenticación
- `POST /api/v1/login` - Iniciar sesión
- `POST /api/v1/refresh-token` - Renovar token de acceso
- `POST /api/v1/password-recovery` - Solicitar recuperación
- `POST /api/v1/reset-password` - Restablecer contraseña

#### Usuarios
- `GET /api/v1/users/me` - Obtener usuario actual
- `GET /api/v1/users/` - Listar usuarios (solo superadmin)
- `POST /api/v1/users/` - Crear usuario (solo superadmin)
- `PUT /api/v1/users/{id}` - Actualizar usuario (solo superadmin)
- `DELETE /api/v1/users/{id}` - Eliminar usuario (solo superadmin)

#### Contactos
- `GET /api/v1/contacts/` - Listar contactos (filtrado por rol)
- `POST /api/v1/contacts/` - Crear contacto
- `PUT /api/v1/contacts/{id}` - Actualizar contacto
- `DELETE /api/v1/contacts/{id}` - Eliminar contacto

#### Datos de Referencia
- `GET /api/v1/municipalities/` - Listar municipios
- `GET /api/v1/occupations/` - Listar ocupaciones

### Respuestas

**Éxito:**
```json
{
  "id": "uuid",
  "first_name": "Juan",
  "last_name": "Pérez",
  ...
}
```

**Error:**
```json
{
  "detail": "Mensaje de error descriptivo"
}
```

**Códigos de Estado:**
- `200`: Éxito
- `201`: Creado
- `400`: Solicitud inválida
- `401`: No autenticado
- `403`: No autorizado
- `404`: No encontrado
- `500`: Error del servidor

## 🗄 Diseño de Base de Datos

### Relaciones

```
Municipality (1) ──< (N) User
Municipality (1) ──< (N) Contact

Occupation (1) ──< (N) User (opcional)
Occupation (1) ──< (N) Contact (opcional)

User (1) ──< (N) Contact
```

### Índices

- `users.email` - Búsqueda rápida por email
- `contacts.user_id` - Búsqueda de contactos por usuario

### Constraints

- `users.role` - CHECK (role IN ('superadmin', 'admin', 'lider'))
- `users.email` - UNIQUE
- `municipalities.name` - UNIQUE
- `occupations.name` - UNIQUE
- Foreign Keys con integridad referencial

## 🔄 Flujos de Datos

### Crear Contacto

```
1. Usuario completa formulario en Frontend
   ↓
2. Frontend valida datos localmente
   ↓
3. Frontend → POST /api/v1/contacts/
   Headers: { Authorization: Bearer <token> }
   Body: { first_name, last_name, email, ... }
   ↓
4. Backend valida token JWT
   ↓
5. Backend valida datos con Pydantic
   ↓
6. Backend crea contacto en BD (SQLAlchemy)
   ↓
7. Backend retorna contacto creado
   ↓
8. Frontend actualiza lista de contactos
```

### Búsqueda de Contactos

```
1. Usuario escribe en campo de búsqueda
   ↓
2. Frontend aplica debounce (500ms)
   ↓
3. Frontend → GET /api/v1/contacts/?search=termino
   ↓
4. Backend valida token
   ↓
5. Backend determina permisos:
   - Si superadmin → get_all_contacts()
   - Si no → get_user_contacts(user_id)
   ↓
6. Backend aplica filtro ILIKE en SQL
   ↓
7. Backend retorna resultados
   ↓
8. Frontend renderiza lista actualizada
```

## 🎨 Patrones de Diseño

### Backend

1. **Repository Pattern** (CRUD)
   - `crud.py` contiene todas las operaciones de BD
   - Separación entre lógica de negocio y acceso a datos

2. **Dependency Injection**
   - FastAPI inyecta dependencias automáticamente
   - `get_db()` para sesiones de BD
   - `get_current_user()` para autenticación

3. **Schema Validation**
   - Pydantic valida datos de entrada/salida
   - Separación entre modelos de BD y esquemas de API

### Frontend

1. **Component Composition**
   - Componentes reutilizables
   - Separación de responsabilidades

2. **Container/Presentational Pattern**
   - Páginas como contenedores
   - Componentes de formulario como presentacionales

3. **Controlled Components**
   - Estado controlado por React
   - Validación en tiempo real

## 🚀 Optimizaciones

### Backend

- **Eager Loading**: `joinedload()` para evitar N+1 queries
- **Índices**: En campos de búsqueda frecuente
- **Paginación**: Parámetros `skip` y `limit` en listados

### Frontend

- **Debounce**: En búsquedas para reducir peticiones
- **Lazy Loading**: Componentes cargados bajo demanda
- **Memoización**: React.memo para componentes pesados

## 🔧 Configuración y Despliegue

### Variables de Entorno

**Backend (.env):**
- `DATABASE_URL`: Conexión a PostgreSQL
- `SECRET_KEY`: Clave para JWT
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Expiración de tokens
- `MAIL_*`: Configuración de correo

### CORS

Configurado para permitir:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (alternativa)

### Base de Datos

- PostgreSQL 12+
- Script de inicialización: `db_provida_uf.sql`
- Script de migración: `add_is_active_mdv_columns.sql` (para agregar campos `is_active` y `mdv`)
- Migraciones manuales (considerar Alembic para futuro)

## 📈 Consideraciones Futuras

1. **Migraciones de BD**: Implementar Alembic
2. **Testing**: Unit tests y integration tests
3. **Caché**: Redis para sesiones y datos frecuentes
4. **Logging**: Sistema de logs estructurado
5. **Monitoreo**: Health checks y métricas
6. **Documentación API**: OpenAPI/Swagger mejorado
7. **TypeScript**: Migrar frontend a TypeScript
8. **Estado Global**: Redux o Context API para estado compartido

---

**Última actualización**: 14 de noviembre de 2025


