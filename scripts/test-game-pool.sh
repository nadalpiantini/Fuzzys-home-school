#!/bin/bash

echo "🎮 TESTING GAME POOL SYSTEM"
echo "=============================="

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para probar endpoint
test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local data=$3
    
    echo -e "\n${YELLOW}Testing $method $endpoint${NC}"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST -H "Content-Type: application/json" -d "$data" "http://localhost:3003$endpoint")
    else
        response=$(curl -s -X GET "http://localhost:3003$endpoint")
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Success${NC}"
        echo "Response: $response"
        
        # Verificar si la respuesta es JSON válido
        if echo "$response" | jq . > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Valid JSON response${NC}"
            
            # Verificar si hay errores en la respuesta
            if echo "$response" | jq -e '.ok == true' > /dev/null 2>&1; then
                echo -e "${GREEN}✅ API returned success${NC}"
            else
                echo -e "${YELLOW}⚠️  API returned error: $(echo "$response" | jq -r '.error // "Unknown error"')${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Response is not valid JSON${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to connect${NC}"
    fi
}

# Verificar si el servidor está corriendo
echo -e "\n${BLUE}🌐 VERIFICANDO SERVIDOR${NC}"
echo "----------------------"

if curl -s http://localhost:3003 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Servidor Next.js corriendo en puerto 3003${NC}"
else
    echo -e "${RED}❌ Servidor no está corriendo${NC}"
    echo "Ejecuta: cd apps/web && npm run dev"
    exit 1
fi

# Test 1: Obtener juegos
echo -e "\n${BLUE}🎮 PROBANDO ENDPOINTS${NC}"
echo "====================="

test_endpoint "/api/games/next"

# Test 2: Verificar salud del pool
test_endpoint "/api/pool/ensure" "POST" "{}"

# Test 3: Ejecutar job de generación (solo si hay jobs pendientes)
test_endpoint "/api/jobs/run" "POST" "{}"

# Test 4: Probar página de juegos
echo -e "\n${BLUE}🌐 PROBANDO PÁGINAS${NC}"
echo "==================="

echo -n "Probando página de juegos... "
if curl -s http://localhost:3003/games > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "Probando página demo... "
if curl -s "http://localhost:3003/games/demo?game=quiz&id=test" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -e "\n${BLUE}📊 RESUMEN DE PRUEBAS${NC}"
echo "====================="

echo -e "\n${GREEN}🎉 Testing completed!${NC}"
echo ""
echo "Si ves errores de 'fetch failed', significa que:"
echo "1. ❌ Supabase no está configurado correctamente"
echo "2. ❌ Las variables de entorno no son válidas"
echo "3. ❌ Las migraciones no se aplicaron"
echo ""
echo "Para solucionarlo:"
echo "1. 🔧 Ejecuta: ./scripts/setup-supabase.sh"
echo "2. 🔑 Configura las variables de entorno reales"
echo "3. 🗄️  Aplica las migraciones en Supabase"
echo "4. 🧪 Vuelve a ejecutar este script"