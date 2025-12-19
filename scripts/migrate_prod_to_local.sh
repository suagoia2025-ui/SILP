#!/bin/bash
# ============================================================================
# Script para migrar base de datos de producción (Railway) a local (Docker)
# ============================================================================

set -e  # Salir si hay algún error

echo "🔄 Migración de Base de Datos: Producción → Local"
echo "=================================================="

# Verificar que DATABASE_URL esté configurada
if [ -z "$1" ] && [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no proporcionado"
    echo ""
    echo "Uso:"
    echo "  ./scripts/migrate_prod_to_local.sh 'postgresql://user:pass@host:port/dbname'"
    echo ""
    echo "O usar variable de entorno:"
    echo "  export DATABASE_URL='postgresql://user:pass@host:port/dbname'"
    echo "  ./scripts/migrate_prod_to_local.sh"
    exit 1
fi

# Obtener DATABASE_URL
if [ -n "$1" ]; then
    DATABASE_URL="$1"
elif [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no proporcionado"
    exit 1
fi

# Configuración local
LOCAL_DB_USER="${POSTGRES_USER:-silp_user}"
LOCAL_DB_PASSWORD="${POSTGRES_PASSWORD:-silp_password}"
LOCAL_DB_NAME="${POSTGRES_DB:-db_provida_uf}"
LOCAL_DB_PORT="${POSTGRES_PORT:-5433}"
LOCAL_DB_HOST="localhost"

DUMP_FILE="production_dump_$(date +%Y%m%d_%H%M%S).sql"

echo ""
echo "📋 Configuración:"
echo "  Producción: ${DATABASE_URL%%@*}@***"  # Ocultar contraseña
echo "  Local: ${LOCAL_DB_USER}@${LOCAL_DB_HOST}:${LOCAL_DB_PORT}/${LOCAL_DB_NAME}"
echo ""

# Paso 1: Crear dump de producción
echo "📥 Paso 1: Creando dump de producción..."
pg_dump "$DATABASE_URL" \
    --verbose \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    --format=plain \
    --file="$DUMP_FILE" 2>&1 | grep -v "ERROR:  unrecognized configuration parameter" || {
    echo "❌ Error al crear dump de producción"
    exit 1
}

if [ ! -f "$DUMP_FILE" ] || [ ! -s "$DUMP_FILE" ]; then
    echo "❌ Error: El archivo de dump está vacío o no se creó"
    exit 1
fi

DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "✅ Dump creado: $DUMP_FILE ($DUMP_SIZE)"
echo ""

# Paso 2: Detener base de datos local
echo "🛑 Paso 2: Deteniendo base de datos local..."
cd "$(dirname "$0")/.."
docker-compose stop db
echo "✅ Base de datos local detenida"
echo ""

# Paso 3: Eliminar volumen de datos local
echo "🗑️  Paso 3: Eliminando datos locales..."
docker-compose down -v db 2>/dev/null || true
docker volume rm silp_postgres_data 2>/dev/null || true
echo "✅ Datos locales eliminados"
echo ""

# Paso 4: Iniciar base de datos local limpia
echo "🚀 Paso 4: Iniciando base de datos local limpia..."
docker-compose up -d db

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
timeout=30
counter=0
while ! docker-compose exec -T db pg_isready -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" > /dev/null 2>&1; do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -ge $timeout ]; then
        echo "❌ Error: La base de datos no está respondiendo después de ${timeout}s"
        exit 1
    fi
done
echo "✅ Base de datos local lista"
echo ""

# Paso 5: Restaurar dump en local
echo "📤 Paso 5: Restaurando dump en base de datos local..."
PGPASSWORD="$LOCAL_DB_PASSWORD" psql \
    -h "$LOCAL_DB_HOST" \
    -p "$LOCAL_DB_PORT" \
    -U "$LOCAL_DB_USER" \
    -d "$LOCAL_DB_NAME" \
    -f "$DUMP_FILE" 2>&1 | grep -v "ERROR:  unrecognized configuration parameter" || {
    echo "⚠️  Algunos warnings durante la restauración (pueden ser normales)"
}

echo "✅ Dump restaurado"
echo ""

# Paso 6: Verificar migración
echo "🔍 Paso 6: Verificando migración..."
USER_COUNT=$(PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
CONTACT_COUNT=$(PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -t -c "SELECT COUNT(*) FROM contacts;" 2>/dev/null | tr -d ' ')
MUNICIPALITY_COUNT=$(PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -t -c "SELECT COUNT(*) FROM municipalities;" 2>/dev/null | tr -d ' ')
OCCUPATION_COUNT=$(PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -t -c "SELECT COUNT(*) FROM occupations;" 2>/dev/null | tr -d ' ')

echo ""
echo "📊 Resumen de datos migrados:"
echo "  👥 Usuarios: $USER_COUNT"
echo "  📇 Contactos: $CONTACT_COUNT"
echo "  🏛️  Municipios: $MUNICIPALITY_COUNT"
echo "  💼 Ocupaciones: $OCCUPATION_COUNT"
echo ""

# Verificar que el super usuario existe
SUPERUSER=$(PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -t -c "SELECT email FROM users WHERE role = 'superadmin' LIMIT 1;" 2>/dev/null | tr -d ' ')
if [ -n "$SUPERUSER" ]; then
    echo "✅ Super usuario encontrado: $SUPERUSER"
else
    echo "⚠️  Advertencia: No se encontró super usuario con role 'superadmin'"
fi
echo ""

echo "✅ Migración completada exitosamente!"
echo ""
echo "📝 Archivo de dump guardado en: $DUMP_FILE"
echo "💡 Puedes eliminar este archivo después de verificar que todo funciona correctamente"
echo ""
echo "🔄 Para reiniciar todos los servicios:"
echo "   docker-compose up -d"

