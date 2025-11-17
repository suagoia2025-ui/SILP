# PROMPT TÉCNICO: Sistema SILP - Visualización de Red de Propietarios

> **Última actualización**: 16 de noviembre de 2025

## CONTEXTO DEL PROYECTO ACTUAL

### Descripción General
SILP (Sistema de Integración de Líderes Privada) es una aplicación web full-stack para la gestión de contactos y usuarios con un sistema robusto de roles y permisos. El sistema permite a líderes, administradores y superadministradores gestionar contactos de manera eficiente y segura.

### Arquitectura Actual

**Stack Tecnológico:**
- **Backend**: FastAPI (Python 3.13), SQLAlchemy ORM, PostgreSQL, JWT Authentication
- **Frontend**: React 18, Material-UI (MUI), React Router, Axios, Vite
- **Base de Datos**: PostgreSQL 12+ (nombre: `db_provida_uf`)

**Estructura del Proyecto:**
```
SILP/
├── silp_backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS config
│   │   ├── config.py            # Validación de variables de entorno
│   │   ├── database.py           # SQLAlchemy engine y session
│   │   ├── models.py            # Modelos SQLAlchemy
│   │   ├── schemas.py           # Schemas Pydantic
│   │   ├── crud.py             # Operaciones CRUD
│   │   ├── security.py          # JWT, bcrypt, autenticación
│   │   ├── email_utils.py      # Envío de correos
│   │   └── routers/
│   │       ├── auth.py          # Login, refresh-token
│   │       ├── users.py          # CRUD usuarios
│   │       ├── contacts.py       # CRUD contactos, download-csv
│   │       ├── admin.py          # Carga masiva de contactos
│   │       ├── municipalities.py
│   │       ├── occupations.py
│   │       └── password_recovery.py
│   ├── requirements.txt         # 45 dependencias exactas
│   └── .env                     # Variables de entorno
│
└── silp-frontend/
    ├── src/
    │   ├── App.jsx              # Router principal, gestión de auth
    │   ├── config.js            # API_URL desde variables de entorno
    │   ├── Login.jsx
    │   ├── Layout.jsx           # Navegación principal
    │   ├── ContactsPage.jsx     # Lista y gestión de contactos
    │   ├── UsersPage.jsx        # Lista y gestión de usuarios
    │   ├── ContactForm.jsx      # Formulario de contactos
    │   ├── AddUserForm.jsx      # Formulario de usuarios
    │   ├── UploadContactsPage.jsx    # Carga masiva
    │   ├── DownloadContactsPage.jsx  # Descarga masiva
    │   └── [otros componentes]
    └── .env.development         # VITE_API_URL
```

### Modelos de Datos (SQLAlchemy)

**Relación Principal: User → Contact (Propietario)**

```python
# Modelo User (Nodo Raíz)
class User(Base):
    __tablename__ = "users"
    id: UUID (PK)
    first_name: String(100)
    last_name: String(100)
    email: String(255, unique=True, nullable=True)
    password_hash: String
    phone: String(20, nullable=True)
    role: String(20)  # 'superadmin', 'admin', 'lider'
    cedula: String(20, unique=True, nullable=True)
    address: String(255, nullable=True)
    is_active: Boolean (default=True)
    mdv: String(255, nullable=True)  # Referencia personalizada
    municipality_id: Integer (FK → municipalities.id, nullable=True)
    occupation_id: Integer (FK → occupations.id, nullable=True)
    
    # Relaciones
    municipality: Relationship → Municipality
    occupation: Relationship → Occupation
    # NOTA: No hay relación explícita User.contacts, pero existe en Contact

# Modelo Contact (Nodo Hijo)
class Contact(Base):
    __tablename__ = "contacts"
    id: UUID (PK)
    first_name: String(100)
    last_name: String(100)
    email: String(255, nullable=True)
    phone: String(20, nullable=True)
    cedula: String(20, unique=True, nullable=True)
    address: String(255, nullable=True)
    is_active: Boolean (default=True)
    mdv: String(255, nullable=True)
    created_at: Timestamp
    
    # RELACIÓN DE PROPIEDAD (clave para la visualización)
    user_id: UUID (FK → users.id, NOT NULL)  # Propietario del contacto
    municipality_id: Integer (FK → municipalities.id, nullable=True)
    occupation_id: Integer (FK → occupations.id, nullable=True)
    
    # Relaciones
    owner: Relationship → User  # El usuario propietario
    municipality: Relationship → Municipality
    occupation: Relationship → Occupation
```

**Estructura de la Red:**
- **Nodos Raíz**: Users (usuarios del sistema)
- **Nodos Hijos**: Contacts (contactos pertenecientes a cada usuario)
- **Enlaces**: Cada Contact tiene un `user_id` que apunta a su User propietario
- **Tipo de Grafo**: Árbol dirigido (cada contacto tiene exactamente un propietario)

### Endpoints API Relevantes

**Backend (FastAPI):**
- `GET /api/v1/users/` - Lista usuarios (solo superadmin)
- `GET /api/v1/users/me` - Usuario actual autenticado
- `GET /api/v1/contacts/` - Lista contactos (filtrados por usuario o todos si superadmin)
- `GET /api/v1/contacts/{contact_id}` - Detalle de contacto
- `GET /api/v1/contacts/download-csv` - Exportar contactos (superadmin/admin)

**Autenticación:**
- `POST /api/v1/login` - Obtener token JWT
- `POST /api/v1/refresh-token` - Renovar token
- Headers requeridos: `Authorization: Bearer <token>`

**Sistema de Roles:**
- `superadmin`: Acceso completo, ve todos los contactos
- `admin`: Gestiona contactos, descarga CSV
- `lider`: Solo ve y gestiona sus propios contactos

### Estado Actual del Frontend

**Tecnologías Frontend:**
- React 18 con Hooks (useState, useEffect, useCallback)
- Material-UI v5 para componentes
- React Router v6 para navegación
- Axios para peticiones HTTP
- Vite como build tool

**Configuración:**
- API URL configurada en `src/config.js` usando `import.meta.env.VITE_API_URL`
- Token JWT almacenado en `localStorage` como `authToken`
- Rutas protegidas basadas en roles

**Componentes Principales:**
- `ContactsPage.jsx`: Lista de contactos con búsqueda, CRUD
- `UsersPage.jsx`: Lista de usuarios (solo superadmin)
- `Layout.jsx`: Navegación lateral con menú según roles

---

## REQUERIMIENTOS PARA VISUALIZACIÓN DE RED

### Objetivo
Implementar una visualización interactiva de la red de propietarios usando un **gráfico de fuerza dirigida (force-directed graph)** que muestre la relación jerárquica entre Users (nodos raíz) y sus Contacts (nodos hijos).

### Especificaciones Técnicas

#### 1. Tipo de Visualización
- **Gráfico de Fuerza Dirigida (Force-Directed Graph)**
- **Algoritmo de Física**: Implementar simulación de fuerzas donde:
  - **Repulsión**: Todos los nodos se repelen entre sí para evitar superposición
  - **Atracción**: Los nodos conectados (User → Contact) se atraen entre sí
  - **Gravedad**: Fuerza centrípeta hacia el centro para mantener el grafo visible
  - **Carga**: Los nodos raíz (Users) pueden tener mayor "masa" que los nodos hijos (Contacts)

#### 2. Estructura de Nodos

**Nodos Raíz (Users):**
- Tipo: `user`
- Visualización:
  - Círculo más grande
  - Color distintivo (ej: azul)
  - Etiqueta: `{first_name} {last_name} ({role})`
  - Icono o badge indicando rol
  - Tooltip con información completa (email, phone, municipality, etc.)

**Nodos Hijos (Contacts):**
- Tipo: `contact`
- Visualización:
  - Círculo más pequeño
  - Color diferente (ej: verde o gris)
  - Etiqueta: `{first_name} {last_name}`
  - Tooltip con información del contacto
  - Indicador visual si `is_active === false` (color rojo o borde)

**Enlaces (Edges):**
- Tipo: `ownership` (User → Contact)
- Visualización:
  - Línea dirigida (flecha) desde User hacia Contact
  - Color sutil (ej: gris claro)
  - Grosor opcional según cantidad de contactos
  - Opcional: mostrar etiqueta con fecha de creación

#### 3. Funcionalidades Interactivas

**Interacción del Usuario:**
- **Drag & Drop**: Arrastrar nodos para reposicionarlos
- **Zoom**: Rueda del mouse o gestos para acercar/alejar
- **Pan**: Arrastrar el canvas para mover la vista
- **Click en Nodo**: Mostrar detalles en panel lateral o modal
- **Hover**: Resaltar nodo y sus conexiones
- **Selección**: Click para seleccionar nodo (cambiar color)
- **Filtros**: 
  - Filtrar por rol de usuario
  - Filtrar por estado activo/inactivo
  - Filtrar por municipio
  - Buscar por nombre

**Controles de Visualización:**
- Botón "Reset Layout" para reiniciar posición de nodos
- Slider para ajustar fuerza de repulsión
- Slider para ajustar fuerza de atracción
- Toggle para mostrar/ocultar etiquetas
- Toggle para mostrar/ocultar nodos inactivos
- Botón "Centrar" para centrar la vista
- Botón "Exportar" para guardar imagen del grafo

#### 4. Algoritmo de Física

**Parámetros Sugeridos:**
```javascript
{
  // Fuerzas de repulsión
  charge: -300,              // Fuerza de repulsión entre nodos (negativo = repulsión)
  chargeDistance: Infinity,   // Distancia máxima de repulsión
  
  // Fuerzas de atracción (links)
  linkDistance: 100,          // Distancia ideal entre nodos conectados
  linkStrength: 0.5,          // Fuerza de atracción (0-1)
  
  // Gravedad
  centerStrength: 0.1,        // Fuerza hacia el centro
  
  // Colisiones
  collisionRadius: 20,        // Radio de colisión para evitar superposición
  
  // Simulación
  alpha: 1,                   // Energía inicial de la simulación
  alphaDecay: 0.0228,         // Decaimiento de energía (más bajo = más tiempo)
  alphaTarget: 0,             // Energía objetivo
  velocityDecay: 0.4          // Fricción (0-1)
}
```

**Diferenciación por Tipo de Nodo:**
- Nodos User (raíz): Mayor masa, menor repulsión entre sí
- Nodos Contact (hijos): Menor masa, mayor repulsión
- Enlaces User-Contact: Fuerza de atracción fuerte
- Enlaces entre Contacts del mismo User: Opcional, si se implementa agrupación

#### 5. Tecnologías Recomendadas

**Opción 1: D3.js + React**
- `d3-force`: Algoritmo de simulación de fuerzas
- `d3-zoom`: Zoom y pan
- `d3-drag`: Drag & drop de nodos
- `react-d3-graph`: Wrapper React para D3 (opcional)

**Opción 2: React Flow**
- `reactflow`: Biblioteca moderna para gráficos dirigidos
- Incluye simulación de fuerzas, zoom, pan, drag
- Más fácil de integrar con React
- Menos control sobre el algoritmo de física

**Opción 3: Vis.js Network**
- `vis-network`: Biblioteca especializada en visualización de redes
- Algoritmos de física avanzados incluidos
- Requiere integración manual con React

**Recomendación**: **React Flow** para facilidad de integración, o **D3.js** para máximo control.

#### 6. Estructura de Datos para el Grafo

**Formato de Datos (JSON):**
```typescript
interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface Node {
  id: string;              // UUID del User o Contact
  type: 'user' | 'contact';
  label: string;           // Nombre completo
  data: {
    // Datos completos del User o Contact
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    role?: string;         // Solo para Users
    is_active: boolean;
    municipality?: string;
    occupation?: string;
    mdv?: string;
    created_at?: string;   // Solo para Contacts
  };
  // Propiedades visuales
  size: number;           // Radio del nodo
  color: string;          // Color del nodo
  x?: number;             // Posición inicial X
  y?: number;             // Posición inicial Y
}

interface Edge {
  id: string;             // UUID único del edge
  source: string;         // ID del User (nodo raíz)
  target: string;         // ID del Contact (nodo hijo)
  type: 'ownership';
  // Propiedades visuales
  color?: string;
  width?: number;
}
```

#### 7. Endpoint Backend Necesario

**Nuevo Endpoint:**
```
GET /api/v1/network/graph-data
```

**Respuesta:**
```json
{
  "nodes": [
    {
      "id": "uuid-user-1",
      "type": "user",
      "label": "Juan Pérez (admin)",
      "data": { /* User completo */ }
    },
    {
      "id": "uuid-contact-1",
      "type": "contact",
      "label": "María González",
      "data": { /* Contact completo */ }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "uuid-user-1",
      "target": "uuid-contact-1",
      "type": "ownership"
    }
  ]
}
```

**Lógica Backend:**
- Si `current_user.role === 'superadmin'`: Retornar todos los Users y sus Contacts
- Si `current_user.role === 'admin'` o `'lider'`: Retornar solo el usuario actual y sus Contacts
- Incluir relaciones `joinedload` para optimizar queries
- Filtrar opcionalmente por `is_active` si se requiere

#### 8. Componente React Propuesto

**Estructura:**
```
src/
├── NetworkVisualization/
│   ├── NetworkGraph.jsx          # Componente principal
│   ├── NetworkControls.jsx        # Controles (filtros, sliders)
│   ├── NodeTooltip.jsx           # Tooltip al hover
│   ├── NodeDetailsPanel.jsx      # Panel lateral con detalles
│   └── useNetworkData.js          # Hook para fetch y transformación de datos
```

**Integración:**
- Nueva ruta en `App.jsx`: `/network` o `/visualizacion-red`
- Agregar enlace en `Layout.jsx` (visible para todos los roles autenticados)
- Usar `API_URL` de `config.js` para peticiones

#### 9. Consideraciones de Rendimiento

**Optimizaciones:**
- **Lazy Loading**: Cargar datos del grafo solo cuando se accede a la página
- **Virtualización**: Si hay muchos nodos (>1000), considerar renderizado parcial
- **Debounce**: En filtros y búsquedas
- **Memoización**: Usar `React.memo` para nodos y edges
- **Web Workers**: Opcional, para cálculos de física en segundo plano

**Límites Sugeridos:**
- Mostrar máximo 500-1000 nodos simultáneamente
- Implementar paginación o agrupación si hay más nodos
- Opción de "colapsar" grupos de contactos por usuario

#### 10. Diseño Visual

**Estilo Material-UI:**
- Usar tema existente de MUI
- Colores consistentes con el resto de la aplicación
- Panel lateral con Material-UI Drawer para detalles
- Botones y controles con Material-UI components

**Responsive:**
- Adaptar a móviles (zoom inicial más cercano, controles simplificados)
- Touch gestures para pan y zoom en móviles

---

## TAREAS DE IMPLEMENTACIÓN

### Fase 1: Backend
1. Crear endpoint `GET /api/v1/network/graph-data` en nuevo router `network.py`
2. Implementar lógica de filtrado por rol
3. Optimizar queries con `joinedload` para evitar N+1
4. Agregar parámetros opcionales: `?include_inactive=true`, `?municipality_id=...`

### Fase 2: Frontend - Preparación
1. Instalar dependencias: `reactflow` o `d3` + `d3-force`
2. Crear estructura de carpetas `NetworkVisualization/`
3. Crear hook `useNetworkData` para fetch y transformación
4. Configurar nueva ruta en `App.jsx`

### Fase 3: Frontend - Visualización Base
1. Implementar componente `NetworkGraph` con canvas básico
2. Renderizar nodos y edges
3. Implementar algoritmo de física básico
4. Agregar zoom y pan

### Fase 4: Frontend - Interactividad
1. Implementar drag & drop de nodos
2. Agregar tooltips al hover
3. Implementar panel de detalles al click
4. Agregar filtros y controles

### Fase 5: Frontend - Pulido
1. Ajustar parámetros de física para mejor visualización
2. Agregar animaciones suaves
3. Implementar exportación de imagen
4. Optimizar rendimiento
5. Agregar tests básicos

---

## NOTAS TÉCNICAS ADICIONALES

### Seguridad
- El endpoint debe validar autenticación JWT
- Filtrar datos según rol del usuario
- No exponer información sensible en tooltips (ej: password_hash)

### Compatibilidad
- Asegurar compatibilidad con navegadores modernos (Chrome, Firefox, Safari, Edge)
- Considerar polyfills si se usa D3.js en navegadores antiguos

### Testing
- Tests unitarios para transformación de datos
- Tests de integración para el endpoint
- Tests E2E para interacciones básicas del grafo

### Documentación
- Actualizar `README.md` con nueva funcionalidad
- Agregar screenshots de la visualización
- Documentar parámetros de física ajustables

---

## PREGUNTAS PARA CLARIFICACIÓN

1. ¿Deben mostrarse todos los usuarios y contactos, o solo los del usuario autenticado?
2. ¿Se requiere agrupación visual de contactos por usuario (clusters)?
3. ¿Deben mostrarse relaciones adicionales (ej: contactos compartidos entre usuarios)?
4. ¿Qué información debe mostrarse en el tooltip vs. panel de detalles?
5. ¿Se requiere persistencia de posiciones de nodos (guardar layout)?
6. ¿Hay límite máximo de nodos a visualizar simultáneamente?

---

**Este prompt proporciona toda la información técnica necesaria para implementar la visualización de red de propietarios en el sistema SILP.**

