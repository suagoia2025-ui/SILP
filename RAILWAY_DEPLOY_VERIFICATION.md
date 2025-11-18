# 🔍 Guía de Verificación de Deploy en Railway

## Cómo Railway Detecta Cambios

Railway detecta cambios automáticamente cuando:
1. **Git Push**: Haces `git push` al repositorio conectado
2. **Branch conectado**: Railway está conectado al branch correcto (ej: `deploy/railway-migration`)
3. **Auto-deploy activado**: Railway tiene auto-deploy habilitado

## ✅ Pasos para Verificar que los Cambios se Aplicaron

### 1. Verificar en Railway Dashboard

1. Ve a https://railway.app
2. Selecciona tu proyecto
3. Ve a la pestaña **"Deployments"**
4. Verifica que el último deploy tenga:
   - ✅ Commit hash correcto (ej: `34ef445`)
   - ✅ Estado: "Success" o "Active"
   - ✅ Tiempo reciente (últimos minutos)

### 2. Verificar Branch Conectado

1. En Railway Dashboard → Settings → Source
2. Verifica que el branch sea `deploy/railway-migration`
3. Si no, cambia el branch o haz push al branch correcto

### 3. Verificar Logs de Railway

```bash
# Si tienes Railway CLI instalado
railway logs

# O en el dashboard:
# Railway → Tu proyecto → Logs
```

Busca en los logs:
- `✅ OPTIONS preflight permitido para: ...`
- `✅ Headers CORS agregados para: ...`
- `🔍 CORS Origins configurados: ...`

### 4. Probar Manualmente

```bash
# Ejecutar el script de verificación
./scripts/verify_railway_deploy.sh

# O probar directamente con curl
curl -X OPTIONS https://backend-production-6970.up.railway.app/api/v1/login \
  -H "Origin: https://silp-hl605x8iu-suagoia2025-3244s-projects.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Resultado esperado:**
- HTTP Status: `200` (no 400)
- Headers: `Access-Control-Allow-Origin: https://silp-...vercel.app`

### 5. Verificar Código en Railway

Si los cambios no se aplican, verifica:

1. **Branch correcto**: Railway debe estar conectado a `deploy/railway-migration`
2. **Auto-deploy**: Debe estar activado en Railway
3. **Build exitoso**: El deploy debe completarse sin errores
4. **Caché**: Railway puede estar usando caché, intenta:
   - Forzar redeploy en Railway Dashboard
   - O hacer un commit vacío: `git commit --allow-empty -m "force redeploy" && git push`

## 🔧 Solución de Problemas

### Problema: Cambios no se aplican

**Solución 1: Verificar branch**
```bash
# Ver branch actual
git branch

# Verificar que Railway esté conectado al branch correcto
# En Railway Dashboard → Settings → Source
```

**Solución 2: Forzar redeploy**
```bash
# Commit vacío para forzar redeploy
git commit --allow-empty -m "force redeploy"
git push origin deploy/railway-migration
```

**Solución 3: Verificar logs de build**
- Railway Dashboard → Deployments → Último deploy → Logs
- Busca errores de build o import

### Problema: OPTIONS sigue retornando 400

**Posibles causas:**
1. El middleware no se está ejecutando
2. Hay un error en el código que impide que se ejecute
3. Railway está usando una versión en caché

**Solución:**
1. Verificar logs de Railway para errores
2. Verificar que el código se desplegó correctamente
3. Probar con un endpoint simple primero

## 📝 Checklist de Verificación

- [ ] Railway está conectado al branch correcto
- [ ] Último commit está en Railway (verificar hash)
- [ ] Deploy completó exitosamente
- [ ] Logs muestran que el servidor inició correctamente
- [ ] Script de verificación retorna 200 para OPTIONS
- [ ] Headers CORS están presentes en la respuesta

## 🚀 Comandos Útiles

```bash
# Ver commits recientes
git log --oneline -5

# Verificar que el push se hizo
git log origin/deploy/railway-migration --oneline -5

# Probar OPTIONS request
curl -X OPTIONS https://backend-production-6970.up.railway.app/api/v1/login \
  -H "Origin: https://silp-hl605x8iu-suagoia2025-3244s-projects.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Verificar que el servidor responde
curl https://backend-production-6970.up.railway.app/docs
```

