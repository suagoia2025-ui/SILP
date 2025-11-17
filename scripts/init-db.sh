#!/bin/bash
# ============================================================================
# SILP - Database Initialization Script
# Sistema de Integración de Líderes Privada
# ============================================================================
# 
# Script para inicializar la base de datos PostgreSQL con:
# - Esquema inicial (db_provida_uf.sql)
# - Migraciones (add_is_active_mdv_columns.sql)
# 
# Uso:
#   docker-compose exec db psql -U silp_user -d db_provida_uf < scripts/init-db.sh
#   O ejecutar manualmente dentro del contenedor
# ============================================================================

set -e  # Salir si hay algún error

echo "============================================================================"
echo "SILP - Inicialización de Base de Datos"
echo "============================================================================"
echo ""

# Variables de entorno (se pueden pasar como argumentos)
DB_USER=${POSTGRES_USER:-silp_user}
DB_NAME=${POSTGRES_DB:-db_provida_uf}
SQL_DIR="/docker-entrypoint-initdb.d"

# Verificar que PostgreSQL esté listo
echo "⏳ Esperando que PostgreSQL esté listo..."
until pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
    echo "   PostgreSQL no está listo aún, esperando..."
    sleep 2
done
echo "✅ PostgreSQL está listo"
echo ""

# Ejecutar script de inicialización principal
if [ -f "$SQL_DIR/01-init.sql" ]; then
    echo "📄 Ejecutando script de inicialización principal..."
    psql -U "$DB_USER" -d "$DB_NAME" -f "$SQL_DIR/01-init.sql"
    echo "✅ Script de inicialización completado"
    echo ""
else
    echo "⚠️  Archivo 01-init.sql no encontrado, saltando..."
    echo ""
fi

# Ejecutar migraciones
if [ -f "$SQL_DIR/02-migration.sql" ]; then
    echo "📄 Ejecutando migraciones (add_is_active_mdv_columns)..."
    psql -U "$DB_USER" -d "$DB_NAME" -f "$SQL_DIR/02-migration.sql"
    echo "✅ Migraciones completadas"
    echo ""
else
    echo "⚠️  Archivo 02-migration.sql no encontrado, saltando..."
    echo ""
fi

echo "============================================================================"
echo "✅ Inicialización de base de datos completada"
echo "============================================================================"

