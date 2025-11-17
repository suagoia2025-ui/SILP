#!/bin/bash
# Script para sincronizar la base de datos local (postgres) con la base de datos de Docker
# Uso: ./scripts/sync_db_to_docker.sh [password]
#
# Si no proporcionas la contraseña como argumento, se pedirá interactivamente
# O puedes configurar PGPASSWORD como variable de entorno

set -e

echo "🔄 Sincronizando base de datos local -> Docker..."

# Variables
LOCAL_DB="db_provida_uf"
LOCAL_USER="postgres"
LOCAL_HOST="localhost"
LOCAL_PORT="5432"

DOCKER_DB="db_provida_uf"
DOCKER_USER="silp_user"
DOCKER_CONTAINER="silp_db"

DUMP_FILE="/tmp/silp_db_dump_$(date +%Y%m%d_%H%M%S).sql"

# Obtener contraseña (argumento, variable de entorno, o pedirla)
if [ -n "$1" ]; then
    export PGPASSWORD="$1"
elif [ -z "$PGPASSWORD" ]; then
    echo "🔐 Ingresa la contraseña de PostgreSQL para el usuario 'postgres':"
    read -s PGPASSWORD
    export PGPASSWORD
fi

# Paso 1: Verificar que el contenedor de Docker esté corriendo
if ! docker compose ps | grep -q "${DOCKER_CONTAINER}.*Up"; then
    echo "❌ Error: El contenedor ${DOCKER_CONTAINER} no está corriendo"
    echo "💡 Ejecuta: docker compose up -d"
    exit 1
fi

# Paso 2: Hacer dump de la base de datos local
echo "📦 Creando dump de la base de datos local..."
pg_dump -h ${LOCAL_HOST} -p ${LOCAL_PORT} -U ${LOCAL_USER} -d ${LOCAL_DB} \
    --clean --if-exists --no-owner --no-acl \
    -f ${DUMP_FILE} 2>&1 || {
    echo "❌ Error: No se pudo hacer dump de la base de datos local"
    echo "💡 Verifica que PostgreSQL esté corriendo y que tengas acceso"
    rm -f ${DUMP_FILE}
    exit 1
}

echo "✅ Dump creado: ${DUMP_FILE} ($(du -h ${DUMP_FILE} | cut -f1))"

# Paso 3: Limpiar la base de datos de Docker (opcional)
echo "🗑️  Limpiando esquema público de la base de datos de Docker..."
docker compose exec -T ${DOCKER_CONTAINER} psql -U ${DOCKER_USER} -d ${DOCKER_DB} \
    -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" 2>&1 || {
    echo "⚠️  Advertencia: No se pudo limpiar el esquema (puede que no exista)"
}

# Paso 4: Restaurar el dump en Docker
echo "📥 Restaurando dump en Docker..."
docker compose exec -T ${DOCKER_CONTAINER} psql -U ${DOCKER_USER} -d ${DOCKER_DB} < ${DUMP_FILE} 2>&1 || {
    echo "❌ Error: No se pudo restaurar el dump en Docker"
    rm -f ${DUMP_FILE}
    exit 1
}

echo "✅ Base de datos sincronizada exitosamente"

# Paso 5: Verificar datos
echo "🔍 Verificando datos sincronizados..."
USER_COUNT=$(docker compose exec -T ${DOCKER_CONTAINER} psql -U ${DOCKER_USER} -d ${DOCKER_DB} -t -c "SELECT COUNT(*) FROM users;" 2>&1 | tr -d ' ')
CONTACT_COUNT=$(docker compose exec -T ${DOCKER_CONTAINER} psql -U ${DOCKER_USER} -d ${DOCKER_DB} -t -c "SELECT COUNT(*) FROM contacts;" 2>&1 | tr -d ' ')

echo "   👥 Usuarios: ${USER_COUNT}"
echo "   📇 Contactos: ${CONTACT_COUNT}"

# Paso 6: Limpiar archivo temporal
rm -f ${DUMP_FILE}
echo "🧹 Archivo temporal eliminado"

echo ""
echo "✅ Proceso completado. La base de datos de Docker ahora tiene los mismos datos que la local."
