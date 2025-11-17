# SILP - Sistema de Integración de Líderes Privada

> **Última actualización**: 16 de noviembre de 2025

SILP es una aplicación web completa para la gestión de contactos y usuarios con un sistema robusto de roles y permisos. El sistema permite a líderes, administradores y superadministradores gestionar contactos de manera eficiente y segura.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación Adicional](#-documentación-adicional)
- [Contribución](#-contribución)

## ✨ Características

### Sistema de Autenticación
- ✅ Autenticación basada en JWT (JSON Web Tokens)
- ✅ Recuperación de contraseña por correo electrónico
- ✅ Gestión de sesiones con tokens de acceso
- ✅ Renovación automática de tokens
- ✅ Advertencia de sesión antes de expirar (5 minutos antes)
- ✅ Protección de rutas basada en roles

### Gestión de Usuarios
- ✅ Sistema de roles: `superadmin`, `admin`, `lider`
- ✅ CRUD completo de usuarios (solo para superadmin)
- ✅ Búsqueda y filtrado de usuarios
- ✅ Validación de permisos en backend y frontend
- ✅ Campo `is_active` para activar/desactivar usuarios
- ✅ Campo `mdv` para referencia alfanumérica personalizada
- ✅ Visualización en rojo para usuarios inactivos

### Gestión de Contactos
- ✅ CRUD completo de contactos
- ✅ Búsqueda en tiempo real con debounce
- ✅ Permisos granulares:
  - **Líderes**: Solo pueden ver y gestionar sus propios contactos
  - **Superadmin**: Acceso a todos los contactos del sistema
- ✅ Información completa: nombre, email, teléfono, dirección, municipio, ocupación
- ✅ Campo `is_active` para activar/desactivar contactos
- ✅ Campo `mdv` para referencia alfanumérica personalizada
- ✅ Visualización en rojo para contactos inactivos

### Datos de Referencia
- ✅ Gestión de municipios y departamentos
- ✅ Catálogo de ocupaciones
- ✅ Relaciones entre entidades

## 🛠 Tecnologías

### Backend
- **FastAPI**: Framework web moderno y rápido para Python
- **SQLAlchemy**: ORM para gestión de base de datos
- **PostgreSQL**: Base de datos relacional
- **JWT**: Autenticación con tokens
- **Bcrypt**: Hash de contraseñas
- **Pydantic**: Validación de datos
- **FastAPI-Mail**: Envío de correos electrónicos

### Frontend
- **React 18**: Biblioteca de JavaScript para interfaces de usuario
- **Material-UI (MUI)**: Componentes de interfaz modernos
- **React Router**: Enrutamiento del lado del cliente
- **Axios**: Cliente HTTP para peticiones API
- **Vite**: Herramienta de construcción rápida
- **JWT-Decode**: Decodificación de tokens JWT

## 🏗 Arquitectura

El proyecto sigue una arquitectura de **cliente-servidor** con separación clara entre frontend y backend:

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │────────▶│    Backend       │
│   (React)       │  HTTP   │   (FastAPI)      │
│   Puerto 5173   │         │   Puerto 8000    │
└─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │   PostgreSQL    │
                            │   Base de Datos │
                            └─────────────────┘
```

### Flujo de Autenticación

1. Usuario inicia sesión con email y contraseña
2. Backend valida credenciales y genera token JWT
3. Frontend almacena token en localStorage
4. Token se incluye en todas las peticiones subsecuentes
5. Backend valida token en cada request protegido

Para más detalles sobre la arquitectura, consulta [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.13** o superior
- **Node.js 18** o superior
- **PostgreSQL 12** o superior
- **npm** o **yarn**
- **Git**

## 🚀 Instalación y Configuración

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.8+** (recomendado 3.13)
- **Node.js 18+** y npm
- **PostgreSQL 12+**
- **Git**

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd SILP
```

### 2. Configurar Backend

```bash
# Desde la raíz del proyecto SILP:
cd silp_backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Mac/Linux:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales (usando tu editor favorito)
```

**Nota**: El archivo `requirements.txt` contiene todas las dependencias necesarias con versiones específicas para garantizar compatibilidad.

### 3. Configurar Base de Datos

```bash
# Crear la base de datos (si no existe)
createdb db_provida_uf

# Inicializar la base de datos con el esquema
# Desde silp_backend:
cd silp_backend
psql -U postgres -d db_provida_uf -f db_provida_uf.sql

# O con contraseña:
PGPASSWORD='tu_contraseña' psql -U postgres -d db_provida_uf -f db_provida_uf.sql
```

**Migración de campos nuevos (`is_active` y `mdv`):**

Si ya tienes una base de datos existente y necesitas agregar los campos `is_active` y `mdv`:

```bash
cd silp_backend
psql -U postgres -d db_provida_uf -f add_is_active_mdv_columns.sql
```

### 4. Configurar Variables de Entorno del Backend

El archivo `.env.example` contiene todas las variables necesarias. Después de copiarlo a `.env`, edítalo con tus valores:

**Variables críticas a configurar:**

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `SECRET_KEY`: Clave secreta para JWT (genera una segura: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- `MAIL_*`: Configuración SMTP para correos (usa Mailtrap para desarrollo)

### 5. Configurar Frontend

```bash
# Desde la raíz del proyecto SILP:
cd silp-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Verificar que VITE_API_URL apunte al backend (http://127.0.0.1:8000)
```

**Nota**: Todas las variables de entorno en el frontend deben tener el prefijo `VITE_` para ser accesibles en el código.

## ⚙️ Configuración Detallada

### Variables de Entorno del Backend

Consulta `silp_backend/.env.example` para ver todas las variables disponibles. Las más importantes son:

- **`DATABASE_URL`**: URL de conexión a PostgreSQL
- **`SECRET_KEY`**: Clave secreta para firmar tokens JWT (debe ser segura, mínimo 32 caracteres)
- **`ALGORITHM`**: Algoritmo de encriptación (HS256 por defecto)
- **`ACCESS_TOKEN_EXPIRE_MINUTES`**: Tiempo de expiración del token de acceso (30 minutos por defecto)
- **`PASSWORD_RESET_TOKEN_EXPIRE_MINUTES`**: Tiempo de expiración del token de recuperación (60 minutos por defecto)
- **`MAIL_*`**: Configuración del servidor SMTP para correos electrónicos
- **`CORS_ORIGINS`**: URLs permitidas para peticiones CORS (separadas por comas)
- **`FRONTEND_URL`**: URL del frontend para links en correos

### Variables de Entorno del Frontend

Consulta `silp-frontend/.env.example` para ver todas las variables disponibles:

- **`VITE_API_URL`**: URL del backend FastAPI (http://127.0.0.1:8000 en desarrollo)
- **`VITE_APP_NAME`**: Nombre de la aplicación
- **`VITE_ENV`**: Entorno (development | production)

**Importante**: Todas las variables del frontend deben tener el prefijo `VITE_` para ser accesibles en el código.

### Configuración de CORS

El backend está configurado para aceptar peticiones desde las URLs especificadas en `CORS_ORIGINS` en el archivo `.env`. Por defecto incluye:
- `http://localhost:5173` (Vite por defecto)
- `http://localhost:3000` (alternativa)

Para producción, actualiza `CORS_ORIGINS` con las URLs de tu dominio.

## 🎯 Uso

### 6. Iniciar el Backend

```bash
# Desde silp_backend:
cd silp_backend

# Asegúrate de tener el entorno virtual activado
# En Mac/Linux:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Ejecutar el servidor
uvicorn app.main:app --reload
```

El backend estará disponible en `http://127.0.0.1:8000`

**Documentación de la API:**
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

### 7. Iniciar el Frontend

```bash
# Desde silp-frontend:
cd silp-frontend

# Ejecutar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### 8. Acceso Inicial

Una vez que ambos servidores estén corriendo:

1. Abre el navegador en `http://localhost:5173`
2. Inicia sesión con las credenciales de un usuario existente en la base de datos
3. Si no tienes usuarios, créalos manualmente en la base de datos o usa el endpoint de creación de usuarios (requiere autenticación de superadmin)

**Nota**: Para crear el primer usuario superadmin, puedes usar un script SQL o el endpoint `/api/v1/users/` si ya tienes acceso.

## 📁 Estructura del Proyecto

```
SILP/
├── silp_backend/              # Backend FastAPI
│   ├── app/
│   │   ├── main.py           # Aplicación principal
│   │   ├── models.py         # Modelos SQLAlchemy
│   │   ├── schemas.py        # Esquemas Pydantic
│   │   ├── crud.py           # Operaciones de base de datos
│   │   ├── security.py       # Autenticación y seguridad
│   │   ├── database.py       # Configuración de BD
│   │   ├── email_utils.py    # Utilidades de correo
│   │   └── routers/          # Endpoints de la API
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── contacts.py
│   │       ├── municipalities.py
│   │       ├── occupations.py
│   │       └── password_recovery.py
│   ├── db_provida_uf.sql     # Script de base de datos
│   ├── add_is_active_mdv_columns.sql  # Script de migración para nuevos campos
│   └── README.md             # Documentación del backend
│
├── silp-frontend/            # Frontend React
│   ├── src/
│   │   ├── App.jsx           # Componente principal
│   │   ├── Login.jsx         # Página de login
│   │   ├── Layout.jsx        # Layout principal
│   │   ├── ContactsPage.jsx  # Gestión de contactos
│   │   ├── UsersPage.jsx     # Gestión de usuarios
│   │   └── ...               # Otros componentes
│   └── README.md             # Documentación del frontend
│
├── ARCHITECTURE.md           # Documentación de arquitectura
└── README.md                 # Este archivo
```

## 📚 Documentación Adicional

- [Documentación del Backend](./silp_backend/README.md)
- [Documentación del Frontend](./silp-frontend/README.md)
- [Documentación de Arquitectura](./ARCHITECTURE.md)

## 👥 Roles y Permisos

### Superadmin
- ✅ Crear, leer, actualizar y eliminar usuarios
- ✅ Ver todos los contactos del sistema
- ✅ Gestionar sus propios contactos
- ✅ Acceso completo al sistema

### Admin
- ✅ Gestionar contactos
- ❌ No puede gestionar usuarios

### Líder
- ✅ Gestionar solo sus propios contactos
- ❌ No puede ver contactos de otros usuarios
- ❌ No puede gestionar usuarios

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración configurable (30 minutos por defecto)
- Renovación automática de tokens mediante endpoint `/api/v1/refresh-token`
- Advertencia de sesión 5 minutos antes de expirar
- Validación de permisos en cada endpoint
- CORS configurado para orígenes específicos
- Validación de datos con Pydantic
- Protección contra SQL injection (SQLAlchemy ORM)
- Validación de longitud de contraseñas (máximo 72 bytes)

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue las convenciones de código existentes
- Añade comentarios en español para código complejo
- Actualiza la documentación según sea necesario
- Prueba tus cambios antes de hacer commit

## 📝 Licencia

Este proyecto es privado y de uso interno.

## 📧 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.

---

**Última actualización**: 16 de noviembre de 2025

**Desarrollado con ❤️ para la gestión eficiente de contactos y líderes**

