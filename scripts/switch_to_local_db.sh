#!/bin/bash
# Script para cambiar de base de datos Docker a base de datos local
# Uso: ./scripts/switch_to_local_db.sh

set -e

echo "🔄 Cambiando a base de datos local..."

# Verificar que LOCAL_POSTGRES_PASSWORD esté configurada
if ! grep -q "LOCAL_POSTGRES_PASSWORD=" .env || grep -q "LOCAL_POSTGRES_PASSWORD=$" .env; then
    echo "❌ Error: LOCAL_POSTGRES_PASSWORD no está configurada en .env"
    echo "💡 Abre .env y completa: LOCAL_POSTGRES_PASSWORD=tu_contraseña"
    exit 1
fi

# Verificar que PostgreSQL local esté corriendo
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ Error: PostgreSQL local no está corriendo en el puerto 5432"
    echo "💡 Inicia PostgreSQL local primero"
    exit 1
fi

echo "✅ PostgreSQL local está corriendo"

# Detener servicios actuales
echo "🛑 Deteniendo servicios actuales..."
docker compose down

# Levantar servicios con configuración de BD local
echo "🚀 Levantando servicios con base de datos local..."
docker compose -f docker-compose.localdb.yml up -d

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend se conecte a la BD local..."
sleep 5

# Verificar conexión
echo "🔍 Verificando conexión..."
if docker compose -f docker-compose.localdb.yml logs backend 2>&1 | grep -qi "database\|connection\|connected"; then
    echo "✅ Backend conectado a la base de datos local"
else
    echo "⚠️  Revisa los logs: docker compose -f docker-compose.localdb.yml logs backend"
fi

echo ""
echo "✅ Proceso completado"
echo "📊 Servicios corriendo:"
docker compose -f docker-compose.localdb.yml ps

echo ""
echo "💡 Para ver logs: docker compose -f docker-compose.localdb.yml logs -f backend"
echo "💡 Para detener: docker compose -f docker-compose.localdb.yml down"

