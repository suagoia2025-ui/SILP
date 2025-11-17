# ============================================================================
# SILP Frontend - Dockerfile (Multi-stage Build)
# Sistema de Integración de Líderes Privada
# ============================================================================
# 
# Stage 1: Builder - Compila la aplicación React con Vite
# Stage 2: Production - Sirve la aplicación con nginx
# ============================================================================

# ============================================================================
# STAGE 1: Builder
# ============================================================================
FROM node:18-alpine AS builder

# Metadatos de la imagen
LABEL maintainer="SILP Development Team"
LABEL description="SILP Frontend - React Application Builder"

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para cache de layers)
COPY package*.json ./

# Instalar dependencias de Node.js
# Usar npm ci para instalación determinística (más rápido y confiable)
RUN npm ci --only=production=false

# Copiar código fuente
COPY . .

# Variables de entorno para el build
# VITE_API_URL se puede sobrescribir en docker-compose
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Construir la aplicación para producción
RUN npm run build

# ============================================================================
# STAGE 2: Production
# ============================================================================
FROM nginx:alpine

# Metadatos de la imagen
LABEL maintainer="SILP Development Team"
LABEL description="SILP Frontend - Production Nginx Server"

# Instalar wget para health checks
RUN apk add --no-cache wget

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos construidos desde el stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear usuario no-root (nginx ya corre como nginx por defecto en alpine)
# Pero asegurémonos de que los permisos sean correctos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Health check para verificar que nginx está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comando por defecto: nginx ya está configurado para ejecutarse
CMD ["nginx", "-g", "daemon off;"]

