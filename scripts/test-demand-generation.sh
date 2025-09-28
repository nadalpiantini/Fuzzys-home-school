#!/bin/bash

# Script para probar el sistema de generación por demanda
# Simula un usuario completando un juego y verifica que se generen 3 juegos más

set -e

echo "🧪 Probando sistema de generación por demanda..."

# Variables
API_BASE_URL=${NEXT_PUBLIC_APP_URL:-"http://localhost:3000"}
TEST_USER_ID="test-user-$(date +%s)"
TEST_GAME_ID="test-game-$(date +%s)"

echo "📝 Usuario de prueba: $TEST_USER_ID"
echo "🎮 Juego de prueba: $TEST_GAME_ID"

# 1. Crear un juego de prueba en el pool
echo "1️⃣ Creando juego de prueba en el pool..."
curl -X POST "$API_BASE_URL/api/pool/usage" \
  -H "Content-Type: application/json" \
  -d "{
    \"game_id\": \"$TEST_GAME_ID\",
    \"user_id\": \"$TEST_USER_ID\",
    \"user_grade\": 5,
    \"completed\": false
  }" || echo "⚠️  Error creando juego de prueba"

# 2. Simular que el usuario completa el juego (esto debería activar el trigger)
echo "2️⃣ Simulando completación del juego..."
curl -X PUT "$API_BASE_URL/api/pool/usage" \
  -H "Content-Type: application/json" \
  -d "{
    \"game_id\": \"$TEST_GAME_ID\",
    \"user_id\": \"$TEST_USER_ID\",
    \"score\": 85,
    \"time_spent\": 120,
    \"completed\": true
  }" || echo "⚠️  Error completando juego"

echo "⏳ Esperando 2 segundos para que se procese el trigger..."
sleep 2

# 3. Verificar que se creó un job de generación por demanda
echo "3️⃣ Verificando jobs de generación por demanda..."
curl -X GET "$API_BASE_URL/api/jobs/demand?category=5-6" \
  -H "Content-Type: application/json" || echo "⚠️  Error obteniendo estadísticas"

# 4. Ejecutar el procesamiento de jobs
echo "4️⃣ Ejecutando procesamiento de jobs..."
curl -X POST "$API_BASE_URL/api/jobs/demand" \
  -H "Content-Type: application/json" || echo "⚠️  Error ejecutando jobs"

echo "⏳ Esperando 5 segundos para que se procesen los jobs..."
sleep 5

# 5. Verificar que se generaron juegos nuevos
echo "5️⃣ Verificando juegos generados..."
curl -X GET "$API_BASE_URL/api/pool/category?category=5-6&limit=5" \
  -H "Content-Type: application/json" || echo "⚠️  Error obteniendo juegos"

# 6. Obtener estadísticas finales
echo "6️⃣ Obteniendo estadísticas finales..."
curl -X GET "$API_BASE_URL/api/jobs/demand" \
  -H "Content-Type: application/json" || echo "⚠️  Error obteniendo estadísticas finales"

echo "✅ Prueba completada"
echo "📊 Revisa los logs para verificar que:"
echo "   - Se creó un job de generación por demanda"
echo "   - Se procesaron los jobs correctamente"
echo "   - Se generaron 3 juegos nuevos"
echo "   - Los juegos están disponibles para la categoría 5-6"
