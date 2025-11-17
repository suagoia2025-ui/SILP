#!/bin/bash
# ============================================================================
# Script para restaurar datos de SILP en Railway
# ============================================================================
# 
# Uso:
#   ./scripts/restore_to_railway.sh [DATABASE_URL]
#
# Ejemplo:
#   ./scripts/restore_to_railway.sh postgresql://user:pass@host:port/dbname
#
# O usar variable de entorno:
#   export DATABASE_URL="postgresql://user:pass@host:port/dbname"
#   ./scripts/restore_to_railway.sh
#
# ============================================================================

set -e

echo "🚂 Restaurando datos de SILP en Railway..."
echo ""

# Obtener DATABASE_URL
if [ -n "$1" ]; then
    DATABASE_URL="$1"
elif [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no proporcionado"
    echo ""
    echo "Opciones:"
    echo "  1. Pasar como argumento: ./scripts/restore_to_railway.sh 'postgresql://...'"
    echo "  2. Usar variable de entorno: export DATABASE_URL='postgresql://...'"
    echo ""
    echo "💡 Para obtener DATABASE_URL de Railway:"
    echo "   railway variables"
    echo "   O desde el dashboard de Railway: Settings > Variables"
    exit 1
fi

# Buscar el archivo de dump más reciente
DUMP_FILE=$(ls -t railway_migration_*.sql 2>/dev/null | head -1)

if [ -z "$DUMP_FILE" ]; then
    echo "❌ Error: No se encontró archivo de dump (railway_migration_*.sql)"
    echo "💡 Ejecuta primero el script de creación de dump"
    exit 1
fi

echo "📁 Archivo de dump: $DUMP_FILE"
echo "📊 Tamaño: $(du -h ${DUMP_FILE} | cut -f1)"
echo ""

# Extraer componentes de la URL para verificación
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "🔍 Información de conexión:"
echo "   Host: ${DB_HOST:-'N/A'}"
echo "   Usuario: ${DB_USER:-'N/A'}"
echo "   Base de datos: ${DB_NAME:-'N/A'}"
echo ""

# Confirmar antes de proceder
read -p "⚠️  ¿Estás seguro de restaurar los datos? Esto reemplazará los datos existentes. (s/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "🗑️  Limpiando esquema público..."
psql "$DATABASE_URL" -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;" 2>&1 || {
    echo "⚠️  Advertencia: No se pudo limpiar el esquema (puede que no exista)"
}

echo ""
echo "📥 Restaurando dump..."
psql "$DATABASE_URL" < "$DUMP_FILE" 2>&1 | grep -v "ERROR:  unrecognized configuration parameter" || {
    echo "⚠️  Algunos warnings pueden aparecer (normal si hay parámetros no reconocidos)"
}

echo ""
echo "✅ Restauración completada"
echo ""

# Verificar datos
echo "🔍 Verificando datos restaurados..."
USER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
CONTACT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM contacts;" 2>/dev/null | tr -d ' ')
MUNICIPALITY_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM municipalities;" 2>/dev/null | tr -d ' ')
OCCUPATION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM occupations;" 2>/dev/null | tr -d ' ')

echo ""
echo "📊 Resumen de datos:"
echo "   👥 Usuarios: ${USER_COUNT}"
echo "   📇 Contactos: ${CONTACT_COUNT}"
echo "   🏘️  Municipios: ${MUNICIPALITY_COUNT}"
echo "   💼 Ocupaciones: ${OCCUPATION_COUNT}"
echo ""
echo "✅ Migración a Railway completada exitosamente"

