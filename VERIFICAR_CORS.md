# 🔍 Verificar Configuración CORS en Railway

## Problema Actual

El backend no está enviando el header `Access-Control-Allow-Origin`, lo que significa que:

1. **La variable `CORS_ORIGINS` no está configurada** en Railway, O
2. **La URL no coincide exactamente** con la configurada

## ✅ Pasos para Verificar y Corregir

### Paso 1: Verificar Variable en Railway

1. Ve a Railway Dashboard → Tu servicio backend
2. **Variables** → Busca `CORS_ORIGINS`
3. **Verifica que el valor sea exactamente:**

```
https://silp-taupe.vercel.app
```

**⚠️ IMPORTANTE:**
- Debe ser **exactamente** `https://silp-taupe.vercel.app`
- Sin trailing slash (`/`)
- Con `https://` (no `http://`)
- Sin espacios al inicio o final

### Paso 2: Verificar en los Logs

Después de reiniciar, en los logs de Railway deberías ver:

```
🔍 CORS Origins configurados: ['https://silp-taupe.vercel.app']
🔍 CORS_ORIGINS variable: https://silp-taupe.vercel.app
```

**Si ves algo diferente**, significa que la variable no está configurada correctamente.

### Paso 3: Si la Variable No Existe

1. En Railway → Variables
2. Click en **"+ New Variable"** o **"Add Variable"**
3. **Name:** `CORS_ORIGINS`
4. **Value:** `https://silp-taupe.vercel.app`
5. Click en **Add** o **Save**
6. **Reinicia el servicio** (esto es crítico)

### Paso 4: Si la Variable Existe pero No Funciona

1. **Elimina la variable** `CORS_ORIGINS`
2. **Reinicia el servicio**
3. **Vuelve a agregar** la variable con el valor correcto
4. **Reinicia nuevamente**

### Paso 5: Verificar Múltiples URLs

Si necesitas soportar múltiples URLs (producción + preview), usa:

```
https://silp-taupe.vercel.app,https://silp-taupe-git-main.vercel.app
```

**Formato:**
- Separadas por comas
- Sin espacios (o con espacios que se eliminarán automáticamente)
- Cada una con `https://`

## 🔍 Verificación con curl

Puedes probar desde tu terminal:

```bash
curl -X OPTIONS https://backend-production-6970.up.railway.app/api/v1/login \
  -H "Origin: https://silp-taupe.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

**Deberías ver:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: https://silp-taupe.vercel.app
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
< Access-Control-Allow-Headers: *
```

Si **NO** ves `Access-Control-Allow-Origin`, significa que:
- La variable no está configurada, O
- La URL no coincide exactamente

## 🐛 Troubleshooting

### Si los logs muestran origins vacíos o incorrectos:

1. Verifica que la variable se llame exactamente `CORS_ORIGINS` (mayúsculas)
2. Verifica que no haya espacios extra
3. Verifica que use `https://` (no `http://`)

### Si los logs muestran la URL correcta pero aún falla:

1. Verifica que el servicio se haya reiniciado después de cambiar la variable
2. Espera 1-2 minutos después del reinicio
3. Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)

## 📝 Checklist Final

- [ ] Variable `CORS_ORIGINS` existe en Railway
- [ ] Valor es exactamente `https://silp-taupe.vercel.app`
- [ ] Servicio reiniciado después de configurar/actualizar la variable
- [ ] Logs muestran los origins correctos
- [ ] Petición OPTIONS retorna 200 con headers CORS

