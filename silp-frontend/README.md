# SILP Frontend - Documentación para Desarrolladores

> **Última actualización**: 17 de noviembre de 2025

**Nota**: Esta documentación incluye el nuevo componente **NetworkVisualization** para visualización interactiva de la red de contactos.

Frontend del sistema SILP construido con React, Material-UI y Vite.

## 📋 Tabla de Contenidos

- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Componentes Principales](#-componentes-principales)
- [Gestión de Estado](#-gestión-de-estado)
- [Autenticación](#-autenticación)
- [Rutas](#-rutas)
- [Desarrollo](#-desarrollo)
- [Construcción](#-construcción)

## 📦 Requisitos

- Node.js 18 o superior
- npm 9 o superior (o yarn)

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

O con yarn:

```bash
yarn install
```

### 2. Configurar URL del Backend

Por defecto, el frontend se conecta a `http://127.0.0.1:8000`. Si necesitas cambiar esto, modifica las URLs en los archivos de componentes que hacen peticiones al backend.

## 📁 Estructura del Proyecto

```
silp-frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/              # Recursos estáticos
│   │   └── react.svg
│   ├── App.jsx              # Componente principal y router
│   ├── main.jsx             # Punto de entrada
│   ├── index.css            # Estilos globales
│   ├── App.css              # Estilos del componente App
│   ├── theme.js             # Tema de Material-UI
│   │
│   ├── Login.jsx            # Página de login
│   ├── Layout.jsx           # Layout con navegación
│   │
│   ├── ContactsPage.jsx     # Página de gestión de contactos
│   ├── ContactForm.jsx      # Formulario crear/editar contacto
│   ├── ContactDetail.jsx   # Vista detalle de contacto
│   │
│   ├── UsersPage.jsx        # Página de gestión de usuarios (solo superadmin)
│   ├── AddUserForm.jsx      # Formulario crear/editar usuario
│   ├── UserDetail.jsx       # Vista detalle de usuario
│   │
│   ├── RequestPasswordReset.jsx  # Solicitar recuperación de contraseña
│   ├── ResetPassword.jsx         # Restablecer contraseña
│   │
│   ├── NetworkVisualization.jsx  # Visualización de red de contactos
│   │
│   ├── ConfirmationDialog.jsx   # Diálogo de confirmación
│   ├── SessionWarningDialog.jsx # Advertencia de sesión (con contador de tiempo)
│   └── Dashboard.jsx         # Dashboard (legacy, ver ContactsPage)
│
├── index.html               # HTML principal
├── vite.config.js          # Configuración de Vite
├── package.json            # Dependencias y scripts
└── README.md               # Este archivo
```

## 🧩 Componentes Principales

### App.jsx

Componente raíz que maneja:
- Enrutamiento con React Router
- Estado de autenticación global
- Validación de tokens JWT
- Verificación de expiración de tokens
- Advertencia de sesión antes de expirar
- Renovación automática de tokens
- Redirección según estado de autenticación

**Funcionalidades clave:**
- `handleLoginSuccess`: Maneja el login exitoso
- `handleLogout`: Cierra sesión y limpia estado
- `checkTokenExpiration`: Verifica el tiempo de expiración cada minuto
- `handleExtendSession`: Renueva el token cuando el usuario lo solicita
- Validación de token al cargar la aplicación

### Login.jsx

Página de autenticación.

**Funcionalidades:**
- Formulario de login (email y contraseña)
- Validación de campos
- Manejo de errores
- Redirección después de login exitoso

### Layout.jsx

Layout principal con navegación.

**Incluye:**
- Barra de navegación (AppBar)
- Menú lateral (Drawer)
- Enlaces a diferentes secciones
- Botón de cerrar sesión
- Información del usuario actual

### ContactsPage.jsx

Página principal de gestión de contactos.

**Características:**
- Lista de contactos con búsqueda
- Vista de detalle del contacto seleccionado
- Crear, editar y eliminar contactos
- Búsqueda en tiempo real con debounce
- Permisos según rol del usuario
- **Visualización en rojo para contactos inactivos** (`is_active === false`)

**Estado:**
- `contacts`: Lista de contactos
- `selectedContact`: Contacto seleccionado para ver detalles
- `isCreating`: Estado de creación
- `editingContact`: Contacto en edición
- `searchTerm`: Término de búsqueda

### UsersPage.jsx

Página de gestión de usuarios (solo visible para superadmin).

**Características:**
- Lista de usuarios con búsqueda
- Vista de detalle del usuario seleccionado
- Crear, editar y eliminar usuarios
- Validación de permisos (solo superadmin)
- **Visualización en rojo para usuarios inactivos** (`is_active === false`)

### ContactForm.jsx

Formulario reutilizable para crear/editar contactos.

**Props:**
- `open`: Controla visibilidad del diálogo
- `onClose`: Callback al cerrar
- `onSave`: Callback al guardar
- `existingContact`: Contacto existente (para edición)
- `municipalities`: Lista de municipios
- `occupations`: Lista de ocupaciones

**Campos:**
- Campos básicos: nombre, apellido, email, teléfono, dirección
- `is_active`: Switch para activar/desactivar contacto
- `mdv`: Campo de texto para referencia alfanumérica personalizada

### AddUserForm.jsx

Formulario reutilizable para crear/editar usuarios.

**Props:**
- `open`: Controla visibilidad del diálogo
- `onClose`: Callback al cerrar
- `onSave`: Callback al guardar
- `existingUser`: Usuario existente (para edición)
- `municipalities`: Lista de municipios
- `occupations`: Lista de ocupaciones

**Campos:**
- Campos básicos: nombre, apellido, email, contraseña, teléfono, dirección, rol
- `is_active`: Switch para activar/desactivar usuario
- `mdv`: Campo de texto para referencia alfanumérica personalizada

### NetworkVisualization.jsx

Componente de visualización interactiva de la red de contactos usando ReactFlow y d3-force.

**Características:**
- **Layout con simulación de fuerzas**: Cada usuario está rodeado por una nube compacta de sus contactos
- **Búsqueda en tiempo real**: Por nombre, email o teléfono
- **Filtros dinámicos**: Por tipo (usuario/contacto), rol y estado
- **Interactividad**:
  - Click en nodo abre drawer con detalles completos
  - Zoom automático al nodo seleccionado
  - Drag & drop de nodos
  - Zoom y pan del canvas
- **Visualización**:
  - Colores diferenciados por rol (superadmin: fucsia, admin: azul oscuro, líder: azul cielo)
  - Colores por estado (activo: verde, inactivo: rojo)
  - Tamaños diferenciados (usuarios: 8px, contactos: 6px)
  - Tooltips informativos
  - MiniMap opcional
- **Optimización**: Renderizado eficiente para 10,000+ nodos

**Dependencias:**
- `reactflow`: Visualización de grafos
- `d3-force`: Simulación de fuerzas para layout

**Ruta:** `/network` (requiere autenticación, accesible para superadmin, admin y lider)

## 🔄 Gestión de Estado

El proyecto usa **estado local de React** (useState, useEffect) sin librerías de estado global.

### Estado Global (App.jsx)

```javascript
const [token, setToken] = useState(localStorage.getItem('authToken'));
const [currentUser, setCurrentUser] = useState(null);
```

### Estado Local por Componente

Cada página/componente maneja su propio estado:

```javascript
// Ejemplo en ContactsPage.jsx
const [contacts, setContacts] = useState([]);
const [selectedContact, setSelectedContact] = useState(null);
const [isCreating, setIsCreating] = useState(false);
```

### Persistencia

- **Token JWT**: Almacenado en `localStorage`
- **Estado de sesión**: Validado al cargar la aplicación

## 🔐 Autenticación

### Flujo de Autenticación

1. Usuario ingresa credenciales en `Login.jsx`
2. Se envía petición a `POST /api/v1/login`
3. Si es exitoso, se recibe token JWT
4. Token se guarda en `localStorage`
5. Se obtiene información del usuario con `GET /api/v1/users/me`
6. Token se incluye en todas las peticiones subsecuentes

### Incluir Token en Peticiones

```javascript
axios.get('http://127.0.0.1:8000/api/v1/contacts/', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Validación de Token

Al cargar la aplicación, se valida el token:

```javascript
useEffect(() => {
  const activeToken = localStorage.getItem('authToken');
  if (!activeToken) {
    setAuthLoading(false);
    return;
  }

  axios.get('http://127.0.0.1:8000/api/v1/users/me', {
    headers: { Authorization: `Bearer ${activeToken}` }
  })
    .then(response => {
      setCurrentUser(response.data);
      setToken(activeToken);
    })
    .catch(() => handleLogout())
    .finally(() => setAuthLoading(false));
}, [handleLogout]);
```

### Renovación de Token y Advertencia de Sesión

El sistema incluye un mecanismo de renovación automática de tokens y advertencia de sesión:

**Advertencia de Sesión:**
- Se muestra automáticamente 5 minutos antes de que expire el token
- Muestra un contador en tiempo real del tiempo restante
- El usuario puede elegir "Permanecer Conectado" o "Cerrar Sesión"

**Renovación de Token:**
- Cuando el usuario hace clic en "Permanecer Conectado", se llama a `/api/v1/refresh-token`
- Se obtiene un nuevo token con 30 minutos de validez
- El token se actualiza automáticamente en `localStorage`
- La advertencia se oculta y se volverá a mostrar cuando falten 5 minutos del nuevo token

**Implementación:**
```javascript
// Verificación automática cada minuto
useEffect(() => {
  if (!token) return;
  
  const checkTokenExpiration = () => {
    const decoded = jwtDecode(token);
    const expirationTime = decoded.exp * 1000;
    const timeUntilExpiry = expirationTime - Date.now();
    const warningTime = 5 * 60 * 1000; // 5 minutos
    
    if (timeUntilExpiry <= warningTime) {
      setSessionWarning(true);
    }
  };
  
  checkTokenExpiration();
  const interval = setInterval(checkTokenExpiration, 60000);
  return () => clearInterval(interval);
}, [token]);

// Renovación de token
const handleExtendSession = async () => {
  const response = await axios.post(
    'http://127.0.0.1:8000/api/v1/refresh-token',
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const newToken = response.data.access_token;
  localStorage.setItem('authToken', newToken);
  setToken(newToken);
  setSessionWarning(false);
};
```

### Protección de Rutas

```jsx
<Route 
  path="users" 
  element={
    currentUser?.role === 'superadmin' 
      ? <UsersPage token={token} /> 
      : <Navigate to="/contacts" />
  } 
/>
```

## 🛣 Rutas

### Rutas Públicas

- `/login` - Página de login
- `/request-password-reset` - Solicitar recuperación de contraseña
- `/reset-password` - Restablecer contraseña

### Rutas Protegidas

Todas las demás rutas requieren autenticación:

- `/contacts` - Gestión de contactos (default)
- `/users` - Gestión de usuarios (solo superadmin)
- `/network` - Visualización de red de contactos (superadmin, admin, lider)

### Redirecciones

- Usuario no autenticado → `/login`
- Usuario autenticado en `/login` → `/contacts`
- Usuario sin permisos en `/users` → `/contacts`

## 💻 Desarrollo

### Ejecutar Servidor de Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5173`

### Hot Module Replacement (HMR)

Vite proporciona HMR automático. Los cambios se reflejan instantáneamente sin recargar la página.

### Estructura de un Componente

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography } from '@mui/material';

function MiComponente({ token }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        'http://127.0.0.1:8000/api/v1/endpoint',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Typography variant="h4">Mi Componente</Typography>
      {/* Contenido */}
    </Container>
  );
}

export default MiComponente;
```

### Material-UI

El proyecto usa Material-UI para componentes de interfaz.

**Tema personalizado:**
- Configurado en `theme.js`
- Puedes modificar colores, tipografía, etc.

**Componentes comunes:**
- `Container`: Contenedor principal
- `Typography`: Texto con variantes
- `Button`: Botones
- `TextField`: Campos de texto
- `Dialog`: Diálogos modales
- `Snackbar`: Notificaciones
- `List`, `ListItem`: Listas

### Manejo de Errores

```javascript
try {
  const response = await axios.post(url, data, { headers });
  // Éxito
} catch (error) {
  if (error.response) {
    // Error del servidor
    console.error('Error:', error.response.data.detail);
    setSnackbar({
      open: true,
      message: error.response.data.detail || 'Error al procesar la solicitud',
      severity: 'error'
    });
  } else {
    // Error de red
    console.error('Error de red:', error.message);
  }
}
```

### Notificaciones (Snackbar)

```javascript
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' // 'success' | 'error' | 'warning' | 'info'
});

// Mostrar notificación
setSnackbar({
  open: true,
  message: 'Operación exitosa',
  severity: 'success'
});

// En el JSX
<Snackbar 
  open={snackbar.open} 
  autoHideDuration={4000} 
  onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
>
  <Alert severity={snackbar.severity}>
    {snackbar.message}
  </Alert>
</Snackbar>
```

### Búsqueda con Debounce

```javascript
const [searchTerm, setSearchTerm] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    fetchData(); // Hacer petición después de 500ms sin cambios
  }, 500);
  
  return () => clearTimeout(timer); // Limpiar timer si cambia searchTerm
}, [searchTerm]);
```

## 🏗 Construcción

### Construir para Producción

```bash
npm run build
```

Esto genera una carpeta `dist/` con los archivos optimizados.

### Previsualizar Build de Producción

```bash
npm run preview
```

### Configuración de Vite

El archivo `vite.config.js` contiene la configuración de Vite. Puedes modificar:
- Puerto del servidor de desarrollo
- Proxy para API
- Plugins
- Optimizaciones de build

## 🎨 Estilos

### CSS Global

- `index.css`: Estilos globales y reset
- `App.css`: Estilos específicos del componente App

### Material-UI

Los componentes usan el sistema de estilos de Material-UI (sx prop):

```jsx
<Box sx={{ 
  display: 'flex', 
  justifyContent: 'center',
  mt: 2  // margin-top: 16px
}}>
  <Typography variant="h4">Título</Typography>
</Box>
```

### Visualización de Usuarios/Contactos Inactivos

Los usuarios y contactos con `is_active === false` se muestran en color rojo en las listas. Esto se implementa usando estilos condicionales en `ListItemText`:

```jsx
<ListItemText 
  primary={`${user.first_name} ${user.last_name} (${user.role})`} 
  secondary={user.email}
  sx={{
    '& .MuiListItemText-primary': {
      color: user.is_active === false ? 'error.main' : 'inherit'
    },
    '& .MuiListItemText-secondary': {
      color: user.is_active === false ? 'error.main' : 'inherit'
    }
  }}
/>
```

El color `error.main` es el rojo estándar del tema de Material-UI, proporcionando una indicación visual clara del estado inactivo.

## 📦 Dependencias Principales

- **react**: Biblioteca de UI
- **react-dom**: Renderizado de React
- **react-router-dom**: Enrutamiento
- **@mui/material**: Componentes Material-UI
- **@mui/icons-material**: Iconos Material-UI
- **axios**: Cliente HTTP
- **jwt-decode**: Decodificación de tokens JWT
- **vite**: Herramienta de construcción

## 🔧 Configuración

### Cambiar URL del Backend

Busca y reemplaza todas las ocurrencias de:
```javascript
'http://127.0.0.1:8000'
```

Por la URL de tu backend.

O mejor, crea un archivo de configuración:

```javascript
// src/config.js
export const API_BASE_URL = 'http://127.0.0.1:8000';
```

Y úsalo en los componentes:

```javascript
import { API_BASE_URL } from './config';

axios.get(`${API_BASE_URL}/api/v1/contacts/`, ...)
```

## 🐛 Debugging

### React DevTools

Instala la extensión React DevTools en tu navegador para inspeccionar componentes y estado.

### Console Logs

```javascript
console.log('Estado:', state);
console.error('Error:', error);
```

### Network Tab

Usa las herramientas de desarrollador del navegador para inspeccionar peticiones HTTP.

## 📝 Convenciones de Código

- **Nombres de componentes**: PascalCase
- **Nombres de funciones**: camelCase
- **Nombres de archivos**: PascalCase para componentes
- **Hooks**: Siempre al inicio del componente
- **Comentarios**: En español para lógica compleja

## 🚀 Despliegue

### Build de Producción

1. Ejecutar `npm run build`
2. La carpeta `dist/` contiene los archivos estáticos
3. Servir con cualquier servidor web estático (nginx, Apache, etc.)

### Variables de Entorno

Para producción, considera usar variables de entorno para la URL del backend. Puedes usar `import.meta.env` en Vite.

## 📚 Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Documentación de Material-UI](https://mui.com/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de React Router](https://reactrouter.com/)

---

**Última actualización**: 17 de noviembre de 2025

**¿Preguntas?** Consulta la documentación principal del proyecto o contacta al equipo de desarrollo.
