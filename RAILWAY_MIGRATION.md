# 🚂 Guía de Migración de Datos a Railway - SILP

**Fecha:** 17 de noviembre de 2025

Esta guía te ayudará a migrar los datos de tu base de datos local/Docker a Railway.

## 📋 Prerrequisitos

1. **Railway CLI instalado** (opcional, pero recomendado):
   ```bash
   npm i -g @railway/cli
   ```

2. **PostgreSQL client** (`psql`) instalado localmente:
   ```bash
   # macOS
   brew install postgresql
   
   # Linux
   sudo apt-get install postgresql-client
   ```

3. **Acceso a tu proyecto en Railway**:
   - URL del proyecto
   - Variables de entorno configuradas
   - Base de datos PostgreSQL creada

## 📦 Paso 1: Crear Dump de la Base de Datos

### Opción A: Desde Docker (Recomendado)

Si estás usando Docker localmente:

```bash
# Crear dump desde Docker
docker-compose exec -T db pg_dump -U silp_user -d db_provida_uf \
  --clean --if-exists --no-owner --no-acl \
  > railway_migration_$(date +%Y%m%d_%H%M%S).sql
```

### Opción B: Desde Base de Datos Local

Si tienes PostgreSQL local:

```bash
# Obtener contraseña del .env
export PGPASSWORD=$(grep "^LOCAL_POSTGRES_PASSWORD=" .env | cut -d'=' -f2)

# Crear dump
pg_dump -h localhost -p 5432 -U postgres -d db_provida_uf \
  --clean --if-exists --no-owner --no-acl \
  > railway_migration_$(date +%Y%m%d_%H%M%S).sql
```

El archivo de dump se creará en la raíz del proyecto con el formato: `railway_migration_YYYYMMDD_HHMMSS.sql`

## 🔑 Paso 2: Obtener DATABASE_URL de Railway

### Opción A: Desde Railway Dashboard

1. Ve a tu proyecto en [Railway Dashboard](https://railway.app)
2. Selecciona el servicio de PostgreSQL
3. Ve a **Settings** > **Variables**
4. Copia el valor de `DATABASE_URL` o `POSTGRES_URL`

### Opción B: Desde Railway CLI

```bash
# Login en Railway
railway login

# Conectar a tu proyecto
railway link

# Obtener DATABASE_URL
railway variables
```

### Opción C: Desde la interfaz web

1. En el servicio PostgreSQL, ve a la pestaña **Connect**
2. Copia la **Connection String** (formato: `postgresql://user:password@host:port/dbname`)

## 🚀 Paso 3: Restaurar Datos en Railway

### Método 1: Usando el Script Automatizado (Recomendado)

```bash
# Opción A: Pasar DATABASE_URL como argumento
./scripts/restore_to_railway.sh "postgresql://user:pass@host:port/dbname"

# Opción B: Usar variable de entorno
export DATABASE_URL="postgresql://user:pass@host:port/dbname"
./scripts/restore_to_railway.sh
```

El script:
- ✅ Verifica que el archivo de dump exista
- ✅ Limpia el esquema público de Railway
- ✅ Restaura todos los datos
- ✅ Verifica que los datos se copiaron correctamente

### Método 2: Manual con psql

```bash
# 1. Limpiar esquema
psql "$DATABASE_URL" -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

# 2. Restaurar dump
psql "$DATABASE_URL" < railway_migration_YYYYMMDD_HHMMSS.sql
```

### Método 3: Desde Railway CLI

```bash
# Conectar a la base de datos
railway connect postgres

# Dentro de psql, restaurar el dump
\i railway_migration_YYYYMMDD_HHMMSS.sql
```

## ✅ Paso 4: Verificar Datos

Después de restaurar, verifica que los datos se copiaron correctamente:

```bash
# Conectar a Railway
psql "$DATABASE_URL"

# Verificar conteos
SELECT 'Usuarios' as tabla, COUNT(*) FROM users
UNION ALL
SELECT 'Contactos', COUNT(*) FROM contacts
UNION ALL
SELECT 'Municipios', COUNT(*) FROM municipalities
UNION ALL
SELECT 'Ocupaciones', COUNT(*) FROM occupations;

# Ver algunos usuarios
SELECT email, first_name, last_name, role FROM users LIMIT 5;
```

## 📊 Datos Esperados

Después de la migración, deberías tener:

- **Usuarios:** 5
- **Contactos:** 363
- **Municipios:** 40
- **Ocupaciones:** 6

## ⚙️ Paso 5: Configurar Variables de Entorno en Railway

Asegúrate de que todas las variables de entorno estén configuradas en Railway:

### Backend (FastAPI)

```env
DATABASE_URL=<ya configurado automáticamente por Railway>
SECRET_KEY=tu-clave-secreta-muy-segura-minimo-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60
MAIL_USERNAME=tu-usuario-smtp
MAIL_PASSWORD=tu-contraseña-smtp
MAIL_FROM=noreply@silp.com
MAIL_PORT=587
MAIL_SERVER=smtp.mailtrap.io
MAIL_FROM_NAME=SILP Sistema
CORS_ORIGINS=https://tu-app.railway.app,https://tu-frontend.railway.app
FRONTEND_URL=https://tu-frontend.railway.app
```

### Frontend

```env
VITE_API_URL=https://tu-backend.railway.app
VITE_APP_NAME=SILP
VITE_ENV=production
```

## 🔧 Troubleshooting

### Error: "connection refused"

**Problema:** No puedes conectar a Railway.

**Solución:**
1. Verifica que el servicio PostgreSQL esté corriendo en Railway
2. Verifica que `DATABASE_URL` sea correcta
3. Verifica que no haya restricciones de firewall

### Error: "permission denied"

**Problema:** No tienes permisos para restaurar.

**Solución:**
1. Verifica que el usuario en `DATABASE_URL` tenga permisos de superusuario
2. Railway normalmente crea un usuario con permisos completos

### Error: "database does not exist"

**Problema:** La base de datos no existe en Railway.

**Solución:**
1. Crea la base de datos desde Railway Dashboard
2. O usa el nombre de base de datos que Railway creó automáticamente

### Error: "unrecognized configuration parameter"

**Problema:** Algunos parámetros de configuración no son reconocidos.

**Solución:**
- Este es un warning normal, no afecta la restauración
- Los datos se restauran correctamente a pesar del warning

## 📝 Notas Importantes

1. **Backup:** Siempre haz backup de Railway antes de restaurar:
   ```bash
   pg_dump "$DATABASE_URL" > backup_railway_$(date +%Y%m%d).sql
   ```

2. **Datos en Producción:** Si ya tienes datos en producción en Railway, considera:
   - Hacer merge de datos en lugar de reemplazar
   - Usar migraciones incrementales
   - Validar datos antes de restaurar

3. **Contraseñas:** Nunca commitees archivos con `DATABASE_URL` que contengan contraseñas

4. **Tamaño del Dump:** El archivo de dump es pequeño (~72KB), pero puede crecer con más datos

## 🔄 Actualizar Datos en Railway

Si necesitas actualizar datos después de la migración inicial:

```bash
# 1. Crear nuevo dump
docker-compose exec -T db pg_dump -U silp_user -d db_provida_uf \
  --clean --if-exists --no-owner --no-acl \
  > railway_migration_$(date +%Y%m%d_%H%M%S).sql

# 2. Restaurar en Railway
./scripts/restore_to_railway.sh "$DATABASE_URL"
```

## 📚 Referencias

- [Railway Documentation](https://docs.railway.app)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)

