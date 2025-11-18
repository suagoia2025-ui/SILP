# 🚀 Guía de Deploy del Frontend en Vercel - SILP

**Fecha:** 17 de noviembre de 2025

Esta guía te ayudará a desplegar el frontend de SILP en Vercel.

## 📋 Prerrequisitos

1. **Cuenta en Vercel**: [https://vercel.com](https://vercel.com)
2. **Backend funcionando en Railway**: URL del backend disponible
3. **Repositorio en GitHub**: Código del frontend en GitHub

## 🚀 Opción 1: Deploy desde GitHub (Recomendado)

### Paso 1: Conectar Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. Selecciona el repositorio `SILP`
4. Vercel detectará automáticamente que es un proyecto Vite

### Paso 2: Configurar Proyecto

**Root Directory:**
- Establece: `silp-frontend`

**Framework Preset:**
- Vercel detectará automáticamente: **Vite**

**Build Settings:**
- Build Command: `npm run build` (automático)
- Output Directory: `dist` (automático)
- Install Command: `npm install` (automático)

### Paso 3: Configurar Variables de Entorno

En la sección **Environment Variables**, agrega:

```env
VITE_API_URL=https://tu-backend.railway.app
VITE_APP_NAME=SILP
VITE_ENV=production
```

**⚠️ IMPORTANTE:**
- Reemplaza `https://tu-backend.railway.app` con la URL real de tu backend en Railway
- Todas las variables deben tener el prefijo `VITE_` para ser accesibles en el código

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Vercel construirá y desplegará automáticamente
3. Obtendrás una URL como: `https://silp-frontend.vercel.app`

## 🔧 Opción 2: Deploy desde CLI

### Instalación de Vercel CLI

```bash
npm i -g vercel
```

### Login

```bash
vercel login
```

### Deploy

```bash
# Desde la raíz del proyecto
cd silp-frontend

# Deploy a producción
vercel --prod

# O deploy a preview
vercel
```

### Configurar Variables de Entorno desde CLI

```bash
vercel env add VITE_API_URL production
# Ingresa: https://tu-backend.railway.app

vercel env add VITE_APP_NAME production
# Ingresa: SILP

vercel env add VITE_ENV production
# Ingresa: production
```

## ⚙️ Configuración de Variables de Entorno

### Variables Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend en Railway | `https://silp-backend.railway.app` |
| `VITE_APP_NAME` | Nombre de la aplicación | `SILP` |
| `VITE_ENV` | Entorno (production/development) | `production` |

### Configurar en Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega cada variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://tu-backend.railway.app`
   - **Environment**: Selecciona `Production`, `Preview`, y `Development`
4. Click en **Save**

## 🔗 Configurar CORS en Backend

Asegúrate de que el backend en Railway tenga configurado `CORS_ORIGINS` con la URL de Vercel:

```env
CORS_ORIGINS=https://tu-frontend.vercel.app,https://tu-frontend-git-main.vercel.app
```

**Nota:** Vercel genera múltiples URLs:
- URL de producción: `https://tu-proyecto.vercel.app`
- URLs de preview: `https://tu-proyecto-git-rama.vercel.app`

Agrega todas las URLs necesarias separadas por comas.

## ✅ Verificaciones Post-Deploy

### 1. Verificar Build

```bash
# Localmente, antes de deploy
cd silp-frontend
npm run build
```

Debería generar la carpeta `dist/` sin errores.

### 2. Verificar Variables de Entorno

En Vercel Dashboard:
- **Settings** → **Environment Variables**
- Verifica que todas las variables estén configuradas

### 3. Verificar URL del Backend

1. Abre la aplicación desplegada en Vercel
2. Abre la consola del navegador (F12)
3. Intenta hacer login
4. Verifica que las peticiones vayan a la URL correcta del backend

### 4. Verificar CORS

Si ves errores de CORS:
1. Verifica que `CORS_ORIGINS` en Railway incluya la URL de Vercel
2. Verifica que la URL sea exacta (con `https://`, sin trailing slash)

## 🐛 Troubleshooting

### Error: "Failed to fetch"

**Problema:** El frontend no puede conectar al backend.

**Solución:**
1. Verifica que `VITE_API_URL` esté configurada correctamente
2. Verifica que el backend esté funcionando en Railway
3. Verifica CORS en el backend

### Error: "CORS policy blocked"

**Problema:** El backend bloquea las peticiones del frontend.

**Solución:**
1. Agrega la URL de Vercel a `CORS_ORIGINS` en Railway
2. Reinicia el servicio backend en Railway
3. Verifica que la URL sea exacta

### Error: "Build failed"

**Problema:** El build falla en Vercel.

**Solución:**
1. Verifica los logs de build en Vercel
2. Prueba el build localmente: `npm run build`
3. Verifica que todas las dependencias estén en `package.json`

### Error: "404 on routes"

**Problema:** Las rutas de React Router no funcionan.

**Solución:**
- El archivo `vercel.json` ya está configurado con `rewrites` para SPA
- Si persiste, verifica que `vercel.json` esté en `silp-frontend/`

## 📝 Archivos de Configuración

### `vercel.json`

Ya está creado en `silp-frontend/vercel.json` con:
- ✅ Configuración de SPA (rewrites)
- ✅ Headers de cache para assets
- ✅ Framework detectado como Vite

### `vite.config.js`

No requiere cambios adicionales para Vercel.

## 🔄 Actualizaciones

Cada vez que hagas push a la rama principal:
- Vercel automáticamente hará un nuevo deploy
- Para otras ramas, creará un preview deployment

## 📊 Monitoreo

### Ver Logs

1. En Vercel Dashboard → **Deployments**
2. Click en un deployment
3. Ve a la pestaña **Functions** o **Logs**

### Ver Analytics

Vercel proporciona analytics básicos:
- **Analytics** → Ver métricas de rendimiento

## 🎯 Checklist Final

Antes de considerar el deploy completo:

- [ ] Proyecto conectado a GitHub
- [ ] Root directory configurado (`silp-frontend`)
- [ ] `VITE_API_URL` configurada con URL del backend de Railway
- [ ] `CORS_ORIGINS` en Railway incluye URL de Vercel
- [ ] Build exitoso en Vercel
- [ ] Aplicación accesible en la URL de Vercel
- [ ] Login funciona correctamente
- [ ] Peticiones al backend funcionan
- [ ] No hay errores de CORS

## 🔗 URLs Importantes

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentación Vercel**: https://vercel.com/docs
- **Vite + Vercel**: https://vercel.com/docs/frameworks/vite

## 📚 Referencias

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)

