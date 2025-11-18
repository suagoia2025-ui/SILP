# ✅ Checklist de Deploy del Backend en Railway - SILP

**Fecha:** 17 de noviembre de 2025

## 📋 Estado Actual del Backend

### ✅ Archivos Listos

- [x] **Dockerfile** - Configurado correctamente (`silp_backend/Dockerfile`)
  - ✅ Usa Python 3.11-slim
  - ✅ Instala dependencias del sistema (libpq-dev, gcc, etc.)
  - ✅ Usuario no-root (silp)
  - ✅ Health check configurado
  - ✅ CMD con uvicorn en 0.0.0.0:8000

- [x] **requirements.txt** - Dependencias definidas
- [x] **Código del backend** - Lee variables de entorno correctamente
- [x] **Base de datos** - Datos migrados a Railway

### ⚠️ Pendiente: Configuración en Railway

## 🚀 Pasos para Deploy en Railway

### 1. Crear Servicio Backend en Railway

1. Ve a tu proyecto en [Railway Dashboard](https://railway.app)
2. Click en **"New"** → **"GitHub Repo"**
3. Selecciona el repositorio `SILP`
4. Selecciona la rama `deploy/railway-migration` (o la que quieras usar)
5. Railway detectará automáticamente el `Dockerfile` en `silp_backend/`

### 2. Configurar Root Directory

Railway necesita saber que el Dockerfile está en `silp_backend/`:

**Opción A: Desde Railway Dashboard**
1. Ve a **Settings** del servicio backend
2. En **Root Directory**, establece: `silp_backend`

**Opción B: Crear `railway.json`** (recomendado)
Crear archivo `railway.json` en la raíz del proyecto:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "silp_backend/Dockerfile"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3. Configurar Variables de Entorno en Railway

Ve a **Settings** → **Variables** y agrega:

#### Variables Críticas (REQUERIDAS)

```env
# Base de Datos (Railway lo crea automáticamente, pero verifica)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT - GENERA UNA CLAVE SEGURA
SECRET_KEY=tu-clave-secreta-muy-segura-minimo-32-caracteres-generada-aleatoriamente

# Algoritmo JWT
ALGORITHM=HS256

# Expiración de tokens
ACCESS_TOKEN_EXPIRE_MINUTES=30
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60
```

#### Variables de CORS (REQUERIDAS)

```env
# URLs permitidas para CORS (separadas por comas)
# Reemplaza con la URL de tu frontend en Railway
CORS_ORIGINS=https://tu-frontend.railway.app,https://tu-frontend.up.railway.app

# URL del frontend para links en correos
FRONTEND_URL=https://tu-frontend.railway.app
```

#### Variables de Email (OPCIONAL pero recomendado)

```env
# Configuración SMTP
MAIL_USERNAME=tu-usuario-smtp
MAIL_PASSWORD=tu-contraseña-smtp
MAIL_FROM=noreply@silp.com
MAIL_PORT=587
MAIL_SERVER=smtp.mailtrap.io
MAIL_FROM_NAME=SILP Sistema
MAIL_TLS=True
MAIL_SSL=False
```

### 4. Conectar Base de Datos PostgreSQL

1. En Railway, ve a tu servicio PostgreSQL
2. Ve a **Settings** → **Connect**
3. Copia la variable `DATABASE_URL`
4. En el servicio backend, agrega la variable:
   - Nombre: `DATABASE_URL`
   - Valor: `${{Postgres.DATABASE_URL}}` (Railway lo resuelve automáticamente)

### 5. Generar SECRET_KEY Segura

```bash
# Desde tu terminal local
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copia el resultado y úsalo como `SECRET_KEY` en Railway.

### 6. Configurar Puerto

Railway asigna un puerto dinámicamente. El código ya está configurado para usar `$PORT` si está disponible, pero el Dockerfile usa el puerto 8000 por defecto.

**Verificar que Railway use el puerto correcto:**
- Railway automáticamente inyecta `$PORT` como variable de entorno
- El Dockerfile usa puerto 8000, pero Railway puede asignar otro
- **Solución:** Railway maneja esto automáticamente, pero puedes verificar en los logs

### 7. Verificar Deploy

1. Railway construirá la imagen automáticamente
2. Revisa los logs en **Deployments** → **View Logs**
3. Verifica que el servicio esté **Healthy**
4. Prueba el endpoint: `https://tu-backend.railway.app/`
5. Deberías ver: `{"Proyecto": "SILP - Sistema Integración de Líderes Privada"}`

## 🔍 Verificaciones Post-Deploy

### 1. Health Check

```bash
curl https://tu-backend.railway.app/
```

Debería retornar:
```json
{"Proyecto": "SILP - Sistema Integración de Líderes Privada"}
```

### 2. API Docs

```bash
curl https://tu-backend.railway.app/docs
```

Debería mostrar la documentación interactiva de FastAPI.

### 3. Conexión a Base de Datos

Revisa los logs de Railway para verificar:
- ✅ "Database connection successful"
- ❌ NO debería haber errores de conexión

### 4. Variables de Entorno

Verifica en los logs que todas las variables estén configuradas:
- `DATABASE_URL` está presente
- `SECRET_KEY` está presente
- `CORS_ORIGINS` está configurado

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

**Problema:** El backend no puede conectar a PostgreSQL.

**Solución:**
1. Verifica que `DATABASE_URL` esté configurada correctamente
2. Verifica que el servicio PostgreSQL esté corriendo
3. Verifica que la variable use `${{Postgres.DATABASE_URL}}`

### Error: "CORS policy blocked"

**Problema:** El frontend no puede hacer peticiones al backend.

**Solución:**
1. Verifica que `CORS_ORIGINS` incluya la URL exacta del frontend
2. Asegúrate de incluir el protocolo (`https://`)
3. No incluyas trailing slash (`/`)

### Error: "SECRET_KEY not set"

**Problema:** La variable `SECRET_KEY` no está configurada.

**Solución:**
1. Genera una nueva clave segura
2. Agrega la variable en Railway
3. Reinicia el servicio

### Error: "Port already in use"

**Problema:** Conflicto de puertos.

**Solución:**
- Railway maneja esto automáticamente
- Si persiste, verifica que el Dockerfile use `$PORT` o deja que Railway lo inyecte

## 📝 Archivos Necesarios para Railway

### Opcional: `railway.json`

Si quieres más control sobre el deploy, crea `railway.json` en la raíz:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "silp_backend/Dockerfile"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Opcional: `.railwayignore`

Para excluir archivos del build:

```
node_modules/
venv/
__pycache__/
*.pyc
.env
*.log
```

## ✅ Checklist Final

Antes de considerar el deploy completo:

- [ ] Servicio backend creado en Railway
- [ ] Root directory configurado (`silp_backend/`)
- [ ] `DATABASE_URL` configurada y conectada a PostgreSQL
- [ ] `SECRET_KEY` generada y configurada
- [ ] `CORS_ORIGINS` configurado con URL del frontend
- [ ] Variables de email configuradas (opcional)
- [ ] Health check pasando
- [ ] Endpoint `/` responde correctamente
- [ ] API docs accesible en `/docs`
- [ ] Logs sin errores críticos
- [ ] Base de datos accesible (datos migrados)

## 🎯 Estado Actual

- ✅ **Dockerfile:** Listo
- ✅ **Código:** Listo
- ✅ **Base de datos:** Datos migrados
- ⚠️ **Configuración Railway:** Pendiente (variables de entorno)
- ⚠️ **railway.json:** Opcional, no creado aún

## 📚 Referencias

- [Railway Documentation](https://docs.railway.app)
- [Railway Docker Guide](https://docs.railway.app/deploy/dockerfiles)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

