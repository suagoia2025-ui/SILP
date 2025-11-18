# ============================================================================
# SILP Backend - Dockerfile
# Sistema de Integración de Líderes Privada
# ============================================================================
# 
# Imagen base: Python 3.11-slim (optimizada para tamaño)
# Optimizado para producción con cache de layers
# ============================================================================

FROM python:3.11-slim as base

# Metadatos de la imagen
LABEL maintainer="SILP Development Team"
LABEL description="SILP Backend - FastAPI Application"
LABEL version="1.0"

# Variables de entorno para Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependencias del sistema necesarias
# - libpq-dev: Para psycopg2 (PostgreSQL)
# - gcc, g++: Para compilar extensiones Python
# - libffi-dev: Para cryptography
# - libxml2-dev, libxslt1-dev: Para procesamiento XML (pandas/openpyxl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    g++ \
    libffi-dev \
    libxml2-dev \
    libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no-root para seguridad
RUN useradd --create-home --shell /bin/bash silp

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivo de dependencias primero (para cache de layers)
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Cambiar ownership al usuario silp
RUN chown -R silp:silp /app

# Cambiar a usuario no-root
USER silp

# Exponer puerto de la aplicación
EXPOSE 8000

# Health check para verificar que el servicio está funcionando
# Usar curl que está disponible en python:3.11-slim o wget
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/').read()" || exit 1

# Comando por defecto: ejecutar uvicorn
# Usar 0.0.0.0 para escuchar en todas las interfaces (necesario en Docker)
# Railway inyecta $PORT automáticamente, usar 8000 como fallback
# Usar formato shell para que ${PORT} se resuelva en runtime
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

