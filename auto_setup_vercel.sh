#!/bin/bash

# Script automatizado para configurar Vercel con GitHub Actions
# Autor: Claude AI Assistant

echo "🚀 Configurando Vercel con GitHub Actions automáticamente..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Información del proyecto Vercel
PROJECT_ID="prj_3aNmgvAUdU3nBJCpIRn7EnYHTF4O"
ORG_ID="team_seGJ6iISQxrrc5YlXeRfkltH"
PROJECT_NAME="fuzzys-home-school"

echo -e "${BLUE}📋 Información del Proyecto Vercel:${NC}"
echo "   Project ID: $PROJECT_ID"
echo "   Org ID: $ORG_ID"
echo "   Project Name: $PROJECT_NAME"
echo ""

# Verificar autenticación en Vercel
echo -e "${YELLOW}🔐 Verificando autenticación en Vercel...${NC}"
if vercel whoami > /dev/null 2>&1; then
    USER=$(vercel whoami)
    echo -e "${GREEN}✅ Autenticado como: $USER${NC}"
else
    echo -e "${RED}❌ No estás autenticado en Vercel. Ejecuta: vercel login${NC}"
    exit 1
fi

# Verificar proyecto vinculado
echo -e "${YELLOW}🔗 Verificando proyecto vinculado...${NC}"
if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✅ Proyecto vinculado correctamente${NC}"
else
    echo -e "${RED}❌ Proyecto no vinculado. Ejecuta: vercel link${NC}"
    exit 1
fi

# Verificar GitHub CLI
echo -e "${YELLOW}🔍 Verificando GitHub CLI...${NC}"
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI no está instalado. Instálalo con: brew install gh${NC}"
    exit 1
fi

if ! gh auth status > /dev/null 2>&1; then
    echo -e "${RED}❌ No estás autenticado en GitHub CLI. Ejecuta: gh auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI configurado correctamente${NC}"

# Verificar si ya existen los secrets
echo -e "${YELLOW}🔍 Verificando secrets existentes...${NC}"
if gh secret list | grep -q "VERCEL_TOKEN"; then
    echo -e "${GREEN}✅ VERCEL_TOKEN ya existe${NC}"
    if gh secret list | grep -q "VERCEL_ORG_ID"; then
        echo -e "${GREEN}✅ VERCEL_ORG_ID ya existe${NC}"
        if gh secret list | grep -q "VERCEL_PROJECT_ID"; then
            echo -e "${GREEN}✅ VERCEL_PROJECT_ID ya existe${NC}"
            echo -e "${GREEN}🎉 ¡Todos los secrets ya están configurados!${NC}"
            exit 0
        fi
    fi
fi

echo ""
echo -e "${YELLOW}⚠️  PASO MANUAL REQUERIDO:${NC}"
echo "1. Ve a https://vercel.com/account/tokens"
echo "2. Haz clic en 'Create Token'"
echo "3. Nombra el token: 'GitHub Actions CI/CD'"
echo "4. Selecciona el scope apropiado"
echo "5. Copia el token generado"
echo ""

# Solicitar el token al usuario
read -p "Ingresa el token de Vercel: " VERCEL_TOKEN

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ Token no proporcionado${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Configurando GitHub Secrets automáticamente...${NC}"

# Configurar VERCEL_TOKEN
echo -e "${BLUE}📝 Configurando VERCEL_TOKEN...${NC}"
if gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ VERCEL_TOKEN configurado${NC}"
else
    echo -e "${RED}❌ Error al configurar VERCEL_TOKEN${NC}"
    exit 1
fi

# Configurar VERCEL_ORG_ID
echo -e "${BLUE}📝 Configurando VERCEL_ORG_ID...${NC}"
if gh secret set VERCEL_ORG_ID --body "$ORG_ID" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ VERCEL_ORG_ID configurado${NC}"
else
    echo -e "${RED}❌ Error al configurar VERCEL_ORG_ID${NC}"
    exit 1
fi

# Configurar VERCEL_PROJECT_ID
echo -e "${BLUE}📝 Configurando VERCEL_PROJECT_ID...${NC}"
if gh secret set VERCEL_PROJECT_ID --body "$PROJECT_ID" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ VERCEL_PROJECT_ID configurado${NC}"
else
    echo -e "${RED}❌ Error al configurar VERCEL_PROJECT_ID${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 ¡Configuración completada automáticamente!${NC}"
echo ""
echo -e "${BLUE}📋 Resumen de la configuración:${NC}"
echo "   ✅ Vercel CLI autenticado"
echo "   ✅ Proyecto vinculado"
echo "   ✅ GitHub CLI configurado"
echo "   ✅ GitHub Secrets configurados automáticamente"
echo ""
echo -e "${YELLOW}🔍 Para verificar los secrets:${NC}"
echo "   gh secret list"
echo ""
echo -e "${YELLOW}🧪 Para probar el workflow:${NC}"
echo "   git push origin main"
echo ""
echo -e "${GREEN}✨ ¡Todo listo para el despliegue automático!${NC}"
