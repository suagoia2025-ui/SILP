# 🔧 Solución de Problemas CORS - SILP

## Error: `OPTIONS /api/v1/login HTTP/1.1" 400 Bad Request`

Este error indica que el backend está rechazando las peticiones preflight (OPTIONS) del frontend.

## ✅ Solución

### 1. Verificar CORS_ORIGINS en Railway

**CRÍTICO:** Asegúrate de que `CORS_ORIGINS` en Railway incluya la URL exacta de Vercel:

1. Ve a Railway Dashboard → Tu servicio backend
2. **Variables** → Busca `CORS_ORIGINS`
3. El valor debe ser algo como:

```
https://silp-taupe.vercel.app,https://silp-taupe-git-main.vercel.app
```

**⚠️ IMPORTANTE:**
- Debe incluir `https://` (no `http://`)
- No debe tener trailing slash (`/`)
- Si tienes múltiples URLs, sepáralas por comas
- Incluye tanto la URL de producción como las de preview si las usas

### 2. Verificar Formato de la URL

La URL debe ser exacta. Ejemplos:

✅ **Correcto:**
```
https://silp-taupe.vercel.app
```

❌ **Incorrecto:**
```
silp-taupe.vercel.app          (falta https://)
https://silp-taupe.vercel.app/  (tiene trailing slash)
http://silp-taupe.vercel.app    (usa http en lugar de https)
```

### 3. Reiniciar el Servicio Backend

Después de cambiar `CORS_ORIGINS`:

1. En Railway, ve a tu servicio backend
2. Click en **...** (menú) → **Restart**
3. O simplemente espera a que Railway reinicie automáticamente

### 4. Verificar en los Logs

Después de reiniciar, verifica en los logs de Railway que no haya errores.

Si configuraste `DEBUG=true`, deberías ver:
```
🔍 CORS Origins configurados: ['https://silp-taupe.vercel.app', ...]
```

## 🔍 Verificación

### Desde el Navegador

1. Abre la aplicación en Vercel
2. Abre la consola del navegador (F12)
3. Intenta hacer login
4. Verifica en la pestaña **Network**:
   - La petición OPTIONS debe retornar **200 OK** (no 400)
   - Debe tener headers `Access-Control-Allow-Origin`
   - La petición POST a `/api/v1/login` debe funcionar

### Desde la Terminal

```bash
# Probar CORS con curl
curl -X OPTIONS https://tu-backend.railway.app/api/v1/login \
  -H "Origin: https://silp-taupe.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

Deberías ver headers como:
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: https://silp-taupe.vercel.app
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
< Access-Control-Allow-Headers: *
```

## 🐛 Problemas Comunes

### Problema: "CORS policy blocked"

**Causa:** La URL de Vercel no está en `CORS_ORIGINS`

**Solución:**
1. Agrega la URL exacta a `CORS_ORIGINS` en Railway
2. Reinicia el servicio

### Problema: "400 Bad Request en OPTIONS"

**Causa:** El backend no está manejando correctamente las peticiones OPTIONS

**Solución:**
- El código ya está actualizado para manejar OPTIONS correctamente
- Asegúrate de que `CORS_ORIGINS` esté configurado
- Reinicia el servicio

### Problema: "Credentials mode is 'include' but Access-Control-Allow-Credentials is 'false'"

**Causa:** `allow_credentials=True` pero el origen no está permitido

**Solución:**
- Verifica que la URL de Vercel esté en `CORS_ORIGINS`
- Asegúrate de que use `https://` (no `http://`)

## 📝 Checklist

- [ ] `CORS_ORIGINS` configurado en Railway
- [ ] URL incluye `https://`
- [ ] URL no tiene trailing slash
- [ ] Servicio backend reiniciado después de cambiar variables
- [ ] Petición OPTIONS retorna 200 (no 400)
- [ ] Headers CORS presentes en la respuesta

## 🔗 Referencias

- [FastAPI CORS Documentation](https://fastapi.tiangolo.com/tutorial/cors/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

