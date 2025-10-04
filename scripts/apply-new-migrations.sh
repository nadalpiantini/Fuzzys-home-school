#!/bin/bash

# Script para aplicar las nuevas migraciones del sistema de puntos y adaptativo
# directamente a Supabase usando psql

set -e

echo "🔧 Aplicando migraciones nuevas a Supabase..."

# Obtener credenciales de .env.local
ENV_FILE="apps/web/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: No se encuentra $ENV_FILE"
  exit 1
fi

SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL "$ENV_FILE" | cut -d '=' -f2)
SUPABASE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY "$ENV_FILE" | cut -d '=' -f2)

# Extraer host de la URL (ejemplo: ggntuptvqxditgxtnsex.supabase.co)
SUPABASE_HOST=$(echo "$SUPABASE_URL" | sed -E 's|https://([^/]+).*|\1|')
SUPABASE_PROJECT_ID=$(echo "$SUPABASE_HOST" | cut -d '.' -f1)

echo "📡 Conectando a proyecto: $SUPABASE_PROJECT_ID"

# Construcción de la cadena de conexión PostgreSQL
# Formato: postgresql://postgres.[project-id]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
read -sp "Ingresa la contraseña de la base de datos (postgres): " DB_PASSWORD
echo ""

DB_CONNECTION="postgresql://postgres.${SUPABASE_PROJECT_ID}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Aplicar migraciones una por una
echo ""
echo "🔄 Aplicando migración: 20241004e_points_system.sql"
psql "$DB_CONNECTION" < supabase/migrations/20241004e_points_system.sql

echo "🔄 Aplicando migración: 20241004f_adaptive_engine.sql"
psql "$DB_CONNECTION" < supabase/migrations/20241004f_adaptive_engine.sql

echo "🔄 Aplicando migración: 20241004g_adaptive_sessions.sql"
psql "$DB_CONNECTION" < supabase/migrations/20241004g_adaptive_sessions.sql

echo ""
echo "✅ Todas las migraciones aplicadas exitosamente!"
echo ""
echo "📋 Migraciones aplicadas:"
echo "  - Sistema de puntos avanzado"
echo "  - Motor adaptativo de dificultad"
echo "  - Sesiones adaptativas en tiempo real"
