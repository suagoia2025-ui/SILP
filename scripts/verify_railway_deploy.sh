#!/bin/bash

# Script para verificar que los cambios se aplicaron en Railway
# Uso: ./scripts/verify_railway_deploy.sh

RAILWAY_URL="https://backend-production-6970.up.railway.app"
VERCEL_ORIGIN="https://silp-hl605x8iu-suagoia2025-3244s-projects.vercel.app"

echo "🔍 Verificando deploy en Railway..."
echo "📍 URL: $RAILWAY_URL"
echo ""

# 1. Verificar que el servidor responde
echo "1️⃣ Verificando que el servidor está activo..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/docs" 2>/dev/null)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo "   ✅ Servidor activo"
else
    echo "   ❌ Servidor no responde (HTTP $HEALTH_CHECK)"
    exit 1
fi

echo ""

# 2. Probar OPTIONS request
echo "2️⃣ Probando petición OPTIONS (preflight)..."
OPTIONS_RESPONSE=$(curl -s -X OPTIONS "$RAILWAY_URL/api/v1/login" \
    -H "Origin: $VERCEL_ORIGIN" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type" \
    -w "\nHTTP_CODE:%{http_code}" \
    -o /dev/null 2>&1)

HTTP_CODE=$(echo "$OPTIONS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
echo "   HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ OPTIONS retorna 200 (correcto)"
else
    echo "   ❌ OPTIONS retorna $HTTP_CODE (debería ser 200)"
fi

echo ""

# 3. Verificar headers CORS
echo "3️⃣ Verificando headers CORS..."
CORS_HEADERS=$(curl -s -X OPTIONS "$RAILWAY_URL/api/v1/login" \
    -H "Origin: $VERCEL_ORIGIN" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type" \
    -I 2>&1 | grep -i "access-control")

if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Origin"; then
    echo "   ✅ Headers CORS presentes:"
    echo "$CORS_HEADERS" | sed 's/^/      /'
else
    echo "   ❌ Headers CORS no encontrados"
fi

echo ""
echo "📝 Para ver los logs de Railway, ejecuta:"
echo "   railway logs"
echo ""
echo "📝 O verifica en el dashboard de Railway:"
echo "   https://railway.app"

