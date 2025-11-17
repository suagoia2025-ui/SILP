# Guía para Probar el Endpoint de Network en Postman

## 📋 Configuración Inicial

### 1. Verificar que el servidor esté corriendo

```bash
cd silp_backend
uvicorn app.main:app --reload
```

El servidor debe estar disponible en: `http://127.0.0.1:8000`

---

## 🔐 Paso 1: Obtener Token de Autenticación

### Request en Postman:

**Método:** `POST`

**URL:** `http://127.0.0.1:8000/api/v1/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "tu-email@ejemplo.com",
  "password": "tu-contraseña"
}
```

### Respuesta Esperada:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**⚠️ IMPORTANTE:** Copia el valor de `access_token` para usarlo en el siguiente paso.

---

## 📊 Paso 2: Llamar al Endpoint de Network

### Request en Postman:

**Método:** `GET`

**URL:** `http://127.0.0.1:8000/api/v1/network/graph-data`

**Headers:**
```
Authorization: Bearer {tu-access-token-aqui}
Content-Type: application/json
```

**Ejemplo completo del header Authorization:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBzaWxwLmNvbSIsImV4cCI6MTcwMDAwMDAwMH0.abc123...
```

### Respuesta Esperada:

#### Si eres Superadmin:
```json
{
  "nodes": [
    {
      "id": "user-123e4567-e89b-12d3-a456-426614174000",
      "type": "user",
      "data": {
        "label": "Juan Pérez",
        "first_name": "Juan",
        "last_name": "Pérez",
        "email": "juan@ejemplo.com",
        "phone": "1234567890",
        "role": "admin",
        "is_active": true,
        "mdv": "MDV-001",
        "municipality": "Bogotá",
        "occupation": "Líder",
        "contact_count": 5
      },
      "position": {"x": 0, "y": 0}
    },
    {
      "id": "contact-223e4567-e89b-12d3-a456-426614174001",
      "type": "contact",
      "data": {
        "label": "María García",
        "first_name": "María",
        "last_name": "García",
        "email": "maria@ejemplo.com",
        "phone": "0987654321",
        "is_active": true,
        "mdv": "MDV-002",
        "municipality": "Medellín",
        "occupation": "Contacto",
        "owner_name": "Juan Pérez"
      },
      "position": {"x": 0, "y": 0}
    }
  ],
  "edges": [
    {
      "id": "edge-123e4567-e89b-12d3-a456-426614174000-223e4567-e89b-12d3-a456-426614174001",
      "source": "user-123e4567-e89b-12d3-a456-426614174000",
      "target": "contact-223e4567-e89b-12d3-a456-426614174001",
      "type": "default"
    }
  ]
}
```

#### Si eres Admin/Líder:
Solo verás tu propio usuario y tus contactos.

---

## 🔍 Verificación de Permisos

### Superadmin:
- ✅ Ve TODOS los usuarios del sistema
- ✅ Ve TODOS los contactos de todos los usuarios
- ✅ Puede ver la red completa

### Admin/Líder:
- ✅ Ve solo su propio usuario
- ✅ Ve solo sus propios contactos
- ✅ No ve otros usuarios ni sus contactos

---

## ❌ Errores Comunes

### 401 Unauthorized
**Causa:** Token inválido o expirado
**Solución:** Obtén un nuevo token con el endpoint de login

### 422 Validation Error
**Causa:** Formato de request incorrecto
**Solución:** Verifica que el header `Authorization` tenga el formato correcto: `Bearer {token}`

### 500 Internal Server Error
**Causa:** Error en el servidor o base de datos
**Solución:** Revisa los logs del servidor uvicorn

---

## 📝 Notas Adicionales

1. **Token Expiración:** Los tokens expiran después de 30 minutos (configurable en `.env`)

2. **Renovar Token:** Puedes usar el endpoint `/api/v1/refresh-token` para renovar tu token sin hacer login nuevamente

3. **Swagger UI:** También puedes probar el endpoint en:
   - http://127.0.0.1:8000/docs
   - Busca la sección "Network" → `GET /api/v1/network/graph-data`
   - Haz clic en "Try it out" y agrega el token en el botón "Authorize"

---

## 🎯 Checklist de Prueba

- [ ] Servidor uvicorn corriendo en `http://127.0.0.1:8000`
- [ ] Login exitoso y token obtenido
- [ ] Token copiado correctamente
- [ ] Header `Authorization` configurado con formato `Bearer {token}`
- [ ] Request GET a `/api/v1/network/graph-data` exitoso
- [ ] Respuesta contiene `nodes` y `edges`
- [ ] Los nodos tienen la estructura correcta
- [ ] Las conexiones (edges) están correctamente formateadas



