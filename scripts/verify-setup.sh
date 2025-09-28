#!/bin/bash

echo "🔍 VERIFICANDO CONFIGURACIÓN DEL GAME POOL SYSTEM"
echo "=================================================="

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para verificar archivo
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $description${NC}"
        return 0
    else
        echo -e "${RED}❌ $description - FALTA${NC}"
        return 1
    fi
}

# Función para verificar variable de entorno
check_env_var() {
    local var=$1
    local description=$2
    
    if grep -q "^$var=" apps/web/.env.local 2>/dev/null; then
        echo -e "${GREEN}✅ $description${NC}"
        return 0
    else
        echo -e "${RED}❌ $description - FALTA${NC}"
        return 1
    fi
}

echo -e "\n${BLUE}📁 VERIFICANDO ARCHIVOS DEL SISTEMA${NC}"
echo "----------------------------------------"

check_file "supabase/migrations/005_game_pool_system.sql" "Esquema de base de datos"
check_file "supabase/migrations/007_fix_hash_conflict.sql" "Migración corregida"
check_file "apps/web/src/app/api/games/next/route.ts" "API endpoint /api/games/next"
check_file "apps/web/src/app/api/pool/ensure/route.ts" "API endpoint /api/pool/ensure"
check_file "apps/web/src/app/api/jobs/run/route.ts" "API endpoint /api/jobs/run"
check_file "apps/web/src/hooks/useGamePool.ts" "Hook useGamePool"
check_file "apps/web/src/components/games/InstantGameSelector.tsx" "Componente InstantGameSelector"
check_file "apps/web/src/app/games/demo/page.tsx" "Página demo de juegos"
check_file "vercel.json" "Configuración de Vercel con cron jobs"

echo -e "\n${BLUE}🔧 VERIFICANDO VARIABLES DE ENTORNO${NC}"
echo "----------------------------------------"

check_env_var "NEXT_PUBLIC_POOL_MIN_READY" "Pool mínimo configurado"
check_env_var "POOL_TARGET_LIBRARY" "Objetivo de librería configurado"
check_env_var "POOL_BACKGROUND_BATCH" "Batch de background configurado"
check_env_var "DEEPSEEK_API_KEY" "API key de DeepSeek"
check_env_var "DEEPSEEK_BASE_URL" "URL base de DeepSeek"
check_env_var "NEXT_PUBLIC_SUPABASE_URL" "URL de Supabase"
check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Anon key de Supabase"
check_env_var "SUPABASE_SERVICE_KEY" "Service key de Supabase"

echo -e "\n${BLUE}🌐 VERIFICANDO CONECTIVIDAD${NC}"
echo "----------------------------------------"

# Verificar si el servidor está corriendo
if curl -s http://localhost:3003 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Servidor Next.js corriendo en puerto 3003${NC}"
    
    # Probar endpoints
    echo -e "\n${YELLOW}🧪 PROBANDO ENDPOINTS${NC}"
    echo "-------------------"
    
    # Test /api/games/next
    echo -n "Probando /api/games/next... "
    response=$(curl -s -w "%{http_code}" http://localhost:3003/api/games/next 2>/dev/null)
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    elif [ "$http_code" = "500" ]; then
        echo -e "${YELLOW}⚠️  Error 500 - Probablemente falta configurar Supabase${NC}"
    else
        echo -e "${RED}❌ Error $http_code${NC}"
    fi
    
    # Test /api/pool/ensure
    echo -n "Probando /api/pool/ensure... "
    response=$(curl -s -w "%{http_code}" -X POST http://localhost:3003/api/pool/ensure 2>/dev/null)
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    elif [ "$http_code" = "500" ]; then
        echo -e "${YELLOW}⚠️  Error 500 - Probablemente falta configurar Supabase${NC}"
    else
        echo -e "${RED}❌ Error $http_code${NC}"
    fi
    
else
    echo -e "${RED}❌ Servidor Next.js no está corriendo${NC}"
    echo "Ejecuta: cd apps/web && npm run dev"
fi

echo -e "\n${BLUE}📋 PRÓXIMOS PASOS${NC}"
echo "-------------------"
echo "1. 🔑 Configura las API keys reales en apps/web/.env.local"
echo "2. 🗄️  Aplica la migración 007_fix_hash_conflict.sql en Supabase"
echo "3. 🧪 Ejecuta: ./scripts/test-game-pool.sh"
echo "4. 🚀 Despliega en Vercel: vercel deploy"

echo -e "\n${GREEN}🎉 VERIFICACIÓN COMPLETADA${NC}"
