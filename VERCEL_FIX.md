# 🔧 Solución de Problemas en Vercel - SILP

## Problemas Detectados

1. **404 en rutas como `/login`** - Routing SPA no funciona
2. **Peticiones a rutas incorrectas** - `VITE_API_URL` no configurada

## ✅ Soluciones

### 1. Configurar Variable de Entorno en Vercel

**CRÍTICO:** Debes agregar la variable `VITE_API_URL` en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Agrega:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://backend-production-6970.up.railway.app` (tu URL de Railway)
   - **Environment:** Selecciona `Production`, `Preview`, y `Development`
4. Click en **Save**

**⚠️ IMPORTANTE:**
- La URL debe empezar con `https://` (no `http://`)
- No debe terminar con `/`
- Debe ser la URL completa del backend en Railway

### 2. Verificar vercel.json

El archivo `vercel.json` ya está actualizado en el repositorio. Si hiciste cambios, haz un nuevo deploy.

### 3. Hacer Nuevo Deploy

Después de agregar la variable de entorno:

1. Vercel debería detectar el cambio y hacer un nuevo deploy automáticamente
2. O puedes hacer un redeploy manual:
   - Ve a **Deployments**
   - Click en los tres puntos (...) del último deployment
   - Selecciona **Redeploy**

## 🔍 Verificación

Después del nuevo deploy:

1. Abre la URL de Vercel: `https://silp-taupe.vercel.app`
2. Debería cargar la página de login (no 404)
3. Abre la consola del navegador (F12)
4. Intenta hacer login
5. Verifica que las peticiones vayan a: `https://backend-production-6970.up.railway.app/api/v1/login`

## 📝 Variables de Entorno Necesarias en Vercel

```env
VITE_API_URL=https://backend-production-6970.up.railway.app
VITE_APP_NAME=SILP
VITE_ENV=production
```

## 🐛 Si Persisten los Problemas

### Error 404 en rutas

1. Verifica que `vercel.json` esté en `silp-frontend/`
2. Verifica que el archivo esté commiteado en GitHub
3. Haz un redeploy completo

### Peticiones incorrectas

1. Verifica que `VITE_API_URL` esté configurada correctamente
2. Verifica que no tenga trailing slash (`/`)
3. Verifica que use `https://` (no `http://`)
4. Haz un redeploy después de cambiar variables

