#!/bin/bash

# Script para configurar Vercel con GitHub Actions
# Autor: Claude AI Assistant
# Fecha: $(date)

echo "🚀 Configurando Vercel con GitHub Actions..."

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

# Verificar si estamos autenticados en Vercel
echo -e "${YELLOW}🔐 Verificando autenticación en Vercel...${NC}"
if vercel whoami > /dev/null 2>&1; then
    USER=$(vercel whoami)
    echo -e "${GREEN}✅ Autenticado como: $USER${NC}"
else
    echo -e "${RED}❌ No estás autenticado en Vercel. Ejecuta: vercel login${NC}"
    exit 1
fi

# Verificar si el proyecto está vinculado
echo -e "${YELLOW}🔗 Verificando proyecto vinculado...${NC}"
if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✅ Proyecto vinculado correctamente${NC}"
else
    echo -e "${RED}❌ Proyecto no vinculado. Ejecuta: vercel link${NC}"
    exit 1
fi

# Verificar variables de entorno
echo -e "${YELLOW}🌍 Verificando variables de entorno...${NC}"
if vercel env ls > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Variables de entorno configuradas${NC}"
else
    echo -e "${RED}❌ Error al acceder a las variables de entorno${NC}"
    exit 1
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
echo -e "${YELLOW}🔧 Configurando GitHub Secrets...${NC}"

# Verificar si gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI no está instalado. Instálalo con: brew install gh${NC}"
    exit 1
fi

# Verificar si estamos autenticados en GitHub
if ! gh auth status > /dev/null 2>&1; then
    echo -e "${RED}❌ No estás autenticado en GitHub CLI. Ejecuta: gh auth login${NC}"
    exit 1
fi

# Configurar secrets en GitHub
echo -e "${BLUE}📝 Configurando secrets en GitHub...${NC}"

# VERCEL_TOKEN
if gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ VERCEL_TOKEN configurado${NC}"
else
    echo -e "${RED}❌ Error al configurar VERCEL_TOKEN${NC}"
fi

# VERCEL_ORG_ID
if gh secret set VERCEL_ORG_ID --body "$ORG_ID" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ VERCEL_ORG_ID configurado${NC}"
else
    echo -e "${RED}❌ Error al configurar VERCEL_ORG_ID${NC}"
fi

# VERCEL_PROJECT_ID
if gh secret set VERCEL_PROJECT_ID --body "$PROJECT_ID" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ VERCEL_PROJECT_ID configurado${NC}"
else
    echo -e "${RED}❌ Error al configurar VERCEL_PROJECT_ID${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo ""
echo -e "${BLUE}📋 Resumen de la configuración:${NC}"
echo "   ✅ Vercel CLI autenticado"
echo "   ✅ Proyecto vinculado"
echo "   ✅ Variables de entorno verificadas"
echo "   ✅ GitHub Secrets configurados"
echo ""
echo -e "${YELLOW}🔍 Para verificar los secrets:${NC}"
echo "   gh secret list"
echo ""
echo -e "${YELLOW}🧪 Para probar el workflow:${NC}"
echo "   git push origin main"
echo ""
echo -e "${GREEN}✨ ¡Todo listo para el despliegue automático!${NC}"
