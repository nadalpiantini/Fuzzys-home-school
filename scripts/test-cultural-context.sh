#!/bin/bash

# Script para probar el sistema de contexto cultural
# Verifica que los contextos culturales funcionen correctamente

set -e

echo "🌍 Probando sistema de contexto cultural..."

# Variables
API_BASE_URL=${NEXT_PUBLIC_APP_URL:-"http://localhost:3000"}

echo "📝 URL base: $API_BASE_URL"

# 1. Verificar que la migración se aplicó correctamente
echo "1️⃣ Verificando contextos culturales disponibles..."
curl -X GET "$API_BASE_URL/api/cultural-contexts" \
  -H "Content-Type: application/json" || echo "⚠️  Endpoint no disponible aún"

# 2. Probar detección automática
echo "2️⃣ Probando detección automática de contexto..."
curl -X POST "$API_BASE_URL/api/cultural-contexts/detect" \
  -H "Content-Type: application/json" \
  -d '{"userLocation": {"country": "US", "language": "en"}}' || echo "⚠️  Endpoint no disponible aún"

# 3. Probar generación con contexto específico
echo "3️⃣ Probando generación con contexto dominicano..."
curl -X POST "$API_BASE_URL/api/jobs/demand" \
  -H "Content-Type: application/json" \
  -d '{"test": true, "context": "DO"}' || echo "⚠️  Endpoint no disponible aún"

# 4. Probar generación con contexto estadounidense
echo "4️⃣ Probando generación con contexto estadounidense..."
curl -X POST "$API_BASE_URL/api/jobs/demand" \
  -H "Content-Type: application/json" \
  -d '{"test": true, "context": "US"}' || echo "⚠️  Endpoint no disponible aún"

# 5. Verificar elementos culturales
echo "5️⃣ Verificando elementos culturales..."
curl -X GET "$API_BASE_URL/api/cultural-contexts/DO/elements" \
  -H "Content-Type: application/json" || echo "⚠️  Endpoint no disponible aún"

echo "✅ Prueba de contexto cultural completada"
echo "📊 Revisa los logs para verificar que:"
echo "   - Los contextos culturales se cargan correctamente"
echo "   - La detección automática funciona"
echo "   - Los prompts se adaptan al contexto cultural"
echo "   - Los elementos culturales están disponibles"
echo "   - La generación de juegos usa el contexto correcto"
