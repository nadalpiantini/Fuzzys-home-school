#!/bin/bash

echo "🗄️ CONFIGURANDO SUPABASE CON CLI"
echo "================================="

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${BLUE}📋 INSTRUCCIONES PARA CONFIGURAR SUPABASE${NC}"
echo "=============================================="

echo -e "\n${YELLOW}1. OBTENER ACCESS TOKEN${NC}"
echo "----------------------------"
echo "Ve a: https://supabase.com/dashboard/account/tokens"
echo "Crea un nuevo token y cópialo"
echo ""

echo -e "${YELLOW}2. CONFIGURAR SUPABASE CLI${NC}"
echo "-------------------------------"
echo "Ejecuta estos comandos:"
echo ""
echo "export SUPABASE_ACCESS_TOKEN=tu_token_aqui"
echo "supabase login --token \$SUPABASE_ACCESS_TOKEN"
echo "supabase link --project-ref tu_project_ref"
echo ""

echo -e "${YELLOW}3. APLICAR MIGRACIONES${NC}"
echo "----------------------------"
echo "Una vez linkeado, ejecuta:"
echo ""
echo "supabase db push"
echo ""

echo -e "${YELLOW}4. VERIFICAR CONFIGURACIÓN${NC}"
echo "--------------------------------"
echo "Verifica que las tablas se crearon:"
echo ""
echo "supabase db diff"
echo ""

echo -e "\n${BLUE}🔧 CONFIGURACIÓN MANUAL ALTERNATIVA${NC}"
echo "=========================================="
echo ""
echo "Si prefieres configurar manualmente:"
echo ""
echo "1. Ve a tu Supabase Dashboard"
echo "2. SQL Editor"
echo "3. Copia y pega el contenido de:"
echo "   - supabase/migrations/005_game_pool_system.sql"
echo "   - supabase/migrations/007_fix_hash_conflict.sql"
echo "4. Ejecuta las migraciones"
echo ""

echo -e "\n${BLUE}🔑 CONFIGURAR VARIABLES DE ENTORNO${NC}"
echo "=========================================="
echo ""
echo "Una vez configurado Supabase, actualiza apps/web/.env.local:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key"
echo "SUPABASE_SERVICE_KEY=tu_service_key"
echo ""

echo -e "\n${GREEN}✅ CONFIGURACIÓN COMPLETADA${NC}"
echo "Una vez completados estos pasos, ejecuta:"
echo "./scripts/test-game-pool.sh"
