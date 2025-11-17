# Docker - Documentación Completa para SILP

> **Última actualización**: 17 de noviembre de 2025

Guía completa para desplegar y gestionar SILP usando Docker y Docker Compose.

## 📋 Tabla de Contenidos

- [Arquitectura de Contenedores](#-arquitectura-de-contenedores)
- [Servicios](#-servicios)
- [Variables de Entorno](#-variables-de-entorno)
- [Desarrollo vs Producción](#-desarrollo-vs-producción)
- [Optimizaciones](#-optimizaciones)
- [Seguridad](#-seguridad)
- [Despliegue en Cloud](#-despliegue-en-cloud)
- [Troubleshooting Avanzado](#-troubleshooting-avanzado)

## 🏗 Arquitectura de Contenedores

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Frontend   │───▶│   Backend    │───▶│  PostgreSQL  │ │
│  │  (nginx)     │    │  (FastAPI)   │    │   (db)       │ │
│  │  Port 3000   │    │  Port 8000   │    │  Port 5432   │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Comunicación

1. **Usuario** → Frontend (nginx) en puerto 3000
2. **Frontend** → Backend (FastAPI) en puerto 8000 (interno)
3. **Backend** → PostgreSQL en puerto 5432 (interno)

Todos los servicios están en la misma red Docker (`silp_network`) y se comunican por nombre de servicio.

## 🐳 Servicios

### 1. Base de Datos (db)

**Imagen**: `postgres:15-alpine`

**Características:**
- PostgreSQL 15 en imagen Alpine (ligera)
- Volumen persistente para datos
- Health check con `pg_isready`
- Scripts de inicialización automática

**Configuración:**
```yaml
environment:
  POSTGRES_USER: silp_user
  POSTGRES_PASSWORD: (desde .env)
  POSTGRES_DB: db_provida_uf
```

**Volúmenes:**
- `postgres_data`: Datos persistentes de la BD
- Scripts SQL montados en `/docker-entrypoint-initdb.d/`

**Puerto**: 5432 (solo expuesto en desarrollo)

### 2. Backend (backend)

**Imagen**: Construida desde `silp_backend/Dockerfile`

**Características:**
- Python 3.11-slim
- FastAPI con uvicorn
- Usuario no-root (`silp`)
- Health check HTTP
- Hot-reload en desarrollo (volumen montado)

**Configuración:**
- Variables de entorno desde `.env`
- Depende de `db` (espera health check)
- CORS configurado según `CORS_ORIGINS`

**Puerto**: 8000

**Comandos útiles:**
```bash
# Acceder al shell
docker-compose exec backend bash

# Ver logs
docker-compose logs -f backend

# Reiniciar
docker-compose restart backend
```

### 3. Frontend (frontend)

**Imagen**: Construida desde `silp-frontend/Dockerfile` (multi-stage)

**Características:**
- Stage 1: Node 18-alpine (build con Vite)
- Stage 2: nginx:alpine (servir archivos estáticos)
- Configuración nginx optimizada para SPA
- Gzip compression
- Cache headers para assets

**Configuración:**
- `VITE_API_URL` como build arg
- Nginx configurado para React Router
- Health check HTTP

**Puerto**: 3000 (mapeado a 80 interno)

**Comandos útiles:**
```bash
# Ver logs
docker-compose logs -f frontend

# Reconstruir después de cambios
docker-compose up -d --build frontend
```

## ⚙️ Variables de Entorno

### Variables de PostgreSQL

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `POSTGRES_USER` | Usuario de PostgreSQL | `silp_user` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | (requerido) |
| `POSTGRES_DB` | Nombre de la base de datos | `db_provida_uf` |
| `POSTGRES_PORT` | Puerto expuesto | `5432` |

### Variables del Backend

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | (generado automáticamente) |
| `SECRET_KEY` | Clave secreta para JWT | (requerido) |
| `ALGORITHM` | Algoritmo de JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de token | `30` |
| `CORS_ORIGINS` | Orígenes permitidos CORS | `http://localhost:3000,http://localhost:5173` |
| `DEBUG` | Modo debug | `True` (dev) / `False` (prod) |

### Variables del Frontend

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL del backend | `http://localhost:8000` |
| `FRONTEND_PORT` | Puerto del frontend | `3000` |

### Generar SECRET_KEY Segura

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSL
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔄 Desarrollo vs Producción

### Desarrollo (`docker-compose.yml`)

**Características:**
- ✅ Volúmenes montados para hot-reload
- ✅ Logs verbose
- ✅ Debug activado
- ✅ Puertos expuestos públicamente
- ✅ Scripts SQL automáticos

**Uso:**
```bash
docker-compose up -d
```

### Producción (`docker-compose.prod.yml`)

**Características:**
- ✅ Código dentro de la imagen (sin volúmenes)
- ✅ Restart policy: `always`
- ✅ Sin puertos expuestos innecesarios
- ✅ Variables de entorno desde `.env.prod`
- ✅ Límites de recursos opcionales

**Uso:**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

**Diferencias clave:**

| Aspecto | Desarrollo | Producción |
|---------|------------|------------|
| Volúmenes | Montados | No montados |
| Debug | `True` | `False` |
| Restart | `unless-stopped` | `always` |
| Logs | Verbose | Optimizados |
| Puertos DB | Expuestos | Internos |

## 🚀 Optimizaciones

### 1. Cache de Layers en Dockerfile

**Backend:**
```dockerfile
# Copiar requirements.txt primero (cambia menos frecuentemente)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copiar código después (cambia frecuentemente)
COPY . .
```

**Frontend:**
```dockerfile
# Copiar package.json primero
COPY package*.json ./
RUN npm ci

# Copiar código después
COPY . .
```

### 2. Multi-stage Build (Frontend)

Reduce tamaño final de imagen:
- Stage 1: ~500MB (Node + dependencias)
- Stage 2: ~50MB (nginx + archivos estáticos)

### 3. Health Checks

Permiten que Docker detecte servicios no saludables y los reinicie automáticamente.

### 4. Volúmenes Nombrados

Los volúmenes nombrados persisten aunque se eliminen los contenedores.

### 5. Redes Aisladas

Cada servicio solo puede comunicarse con otros en la misma red.

## 🔒 Seguridad

### Mejores Prácticas Implementadas

1. **Usuario no-root**: Backend corre como usuario `silp`
2. **Secrets en .env**: Nunca en el código
3. **Red interna**: PostgreSQL no expuesto en producción
4. **Health checks**: Detección temprana de problemas
5. **Imágenes oficiales**: De Docker Hub oficial

### Recomendaciones Adicionales

1. **HTTPS en Producción:**
   ```yaml
   # Agregar reverse proxy (nginx/traefik) con SSL
   ```

2. **Backup de Base de Datos:**
   ```bash
   # Backup manual
   docker-compose exec db pg_dump -U silp_user db_provida_uf > backup.sql
   
   # Restaurar
   docker-compose exec -T db psql -U silp_user db_provida_uf < backup.sql
   ```

3. **Rotación de Logs:**
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

4. **Límites de Recursos:**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

## ☁️ Despliegue en Cloud

### Railway

1. **Conectar repositorio** en Railway
2. **Configurar variables de entorno** en el dashboard
3. **Railway detecta** `docker-compose.yml` automáticamente
4. **Deploy automático** en cada push

**Variables requeridas:**
- `POSTGRES_PASSWORD`
- `SECRET_KEY`
- `CORS_ORIGINS` (tu dominio Railway)
- `VITE_API_URL` (URL del backend Railway)

### Render

1. **Crear servicios** manualmente:
   - Web Service (backend)
   - Web Service (frontend)
   - PostgreSQL Database

2. **Configurar Dockerfile** en cada servicio

3. **Variables de entorno** en el dashboard

### DigitalOcean App Platform

1. **Conectar repositorio**
2. **Detectar servicios** automáticamente
3. **Configurar variables** de entorno
4. **Deploy**

### AWS ECS / Google Cloud Run

Requiere configuración adicional:
- Push de imágenes a registro (ECR/GCR)
- Configuración de servicios
- Load balancer
- Variables de entorno

## 🐛 Troubleshooting Avanzado

### Problema: Backend no puede conectar a BD

**Diagnóstico:**
```bash
# Verificar que db esté healthy
docker-compose ps

# Verificar DATABASE_URL
docker-compose exec backend env | grep DATABASE_URL

# Probar conexión manual
docker-compose exec backend python -c "from sqlalchemy import create_engine; engine = create_engine('postgresql://...'); engine.connect()"
```

**Solución:**
- Verificar que `depends_on` con `condition: service_healthy` esté configurado
- Verificar variables de entorno de PostgreSQL
- Verificar que la red Docker esté correcta

### Problema: Frontend no carga assets

**Diagnóstico:**
```bash
# Verificar que nginx esté sirviendo archivos
docker-compose exec frontend ls -la /usr/share/nginx/html

# Verificar logs de nginx
docker-compose logs frontend

# Verificar configuración nginx
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

**Solución:**
- Reconstruir imagen del frontend
- Verificar que el build se completó correctamente
- Verificar permisos de archivos

### Problema: CORS errors

**Diagnóstico:**
```bash
# Verificar CORS_ORIGINS
docker-compose exec backend env | grep CORS

# Verificar que el frontend esté en la lista
```

**Solución:**
- Agregar URL del frontend a `CORS_ORIGINS`
- Reiniciar backend después de cambiar variables

### Problema: Volúmenes no persisten

**Diagnóstico:**
```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect silp_postgres_data
```

**Solución:**
- Verificar que el volumen esté definido en `docker-compose.yml`
- No usar `docker-compose down -v` (elimina volúmenes)

### Problema: Build lento

**Optimizaciones:**
1. Usar cache de Docker BuildKit:
   ```bash
   DOCKER_BUILDKIT=1 docker-compose build
   ```

2. Verificar `.dockerignore` (excluir archivos innecesarios)

3. Usar `npm ci` en lugar de `npm install` (más rápido)

4. Cache de layers (copiar dependencias antes que código)

## 📊 Monitoreo

### Ver uso de recursos

```bash
# Tiempo real
docker stats

# De un servicio específico
docker stats silp_backend
```

### Ver logs estructurados

```bash
# Todos los servicios
docker-compose logs -f

# Con timestamps
docker-compose logs -f -t

# Últimas 100 líneas
docker-compose logs --tail=100
```

### Health checks

```bash
# Verificar estado de health checks
docker inspect --format='{{.State.Health.Status}}' silp_backend
```

## 🔄 Actualizaciones

### Actualizar código

```bash
# 1. Hacer pull de cambios
git pull

# 2. Reconstruir imágenes
docker-compose up -d --build

# 3. Verificar que todo funcione
docker-compose ps
docker-compose logs -f
```

### Actualizar dependencias

**Backend:**
```bash
# Editar requirements.txt
# Reconstruir
docker-compose up -d --build backend
```

**Frontend:**
```bash
# Editar package.json
# Reconstruir
docker-compose up -d --build frontend
```

## 📝 Checklist de Producción

Antes de desplegar en producción:

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Generar `SECRET_KEY` segura
- [ ] Configurar `CORS_ORIGINS` con dominio real
- [ ] Configurar HTTPS (reverse proxy)
- [ ] Configurar backup de base de datos
- [ ] Configurar monitoreo y alertas
- [ ] Revisar logs de seguridad
- [ ] Configurar límites de recursos
- [ ] Probar restore de backup
- [ ] Documentar procedimientos de emergencia

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Deployment](https://react.dev/learn/start-a-new-react-project#production-builds)

---

**Última actualización**: 17 de noviembre de 2025

**¿Preguntas?** Consulta el README.md principal o contacta al equipo de desarrollo.

