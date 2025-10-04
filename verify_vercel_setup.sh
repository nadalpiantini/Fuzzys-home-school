#!/bin/bash

# Script de verificación para Vercel + GitHub Actions
# Autor: Claude AI Assistant

echo "🔍 Verificando configuración de Vercel + GitHub Actions..."

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
    echo -e "${RED}❌ No estás autenticado en Vercel${NC}"
    exit 1
fi

# Verificar proyecto vinculado
echo -e "${YELLOW}🔗 Verificando proyecto vinculado...${NC}"
if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✅ Proyecto vinculado correctamente${NC}"
    echo "   $(cat .vercel/project.json | jq -r '.projectName')"
else
    echo -e "${RED}❌ Proyecto no vinculado${NC}"
    exit 1
fi

# Verificar variables de entorno
echo -e "${YELLOW}🌍 Verificando variables de entorno...${NC}"
if vercel env ls > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Variables de entorno accesibles${NC}"
    ENV_COUNT=$(vercel env ls | grep -c "Encrypted")
    echo "   $ENV_COUNT variables de entorno configuradas"
else
    echo -e "${RED}❌ Error al acceder a las variables de entorno${NC}"
    exit 1
fi

# Verificar GitHub CLI
echo -e "${YELLOW}🔍 Verificando GitHub CLI...${NC}"
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI no está instalado${NC}"
    exit 1
fi

if ! gh auth status > /dev/null 2>&1; then
    echo -e "${RED}❌ No estás autenticado en GitHub CLI${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI configurado correctamente${NC}"

# Verificar secrets de GitHub
echo -e "${YELLOW}🔐 Verificando GitHub Secrets...${NC}"
SECRETS_OK=true

if gh secret list | grep -q "VERCEL_TOKEN"; then
    echo -e "${GREEN}✅ VERCEL_TOKEN configurado${NC}"
else
    echo -e "${RED}❌ VERCEL_TOKEN no configurado${NC}"
    SECRETS_OK=false
fi

if gh secret list | grep -q "VERCEL_ORG_ID"; then
    echo -e "${GREEN}✅ VERCEL_ORG_ID configurado${NC}"
else
    echo -e "${RED}❌ VERCEL_ORG_ID no configurado${NC}"
    SECRETS_OK=false
fi

if gh secret list | grep -q "VERCEL_PROJECT_ID"; then
    echo -e "${GREEN}✅ VERCEL_PROJECT_ID configurado${NC}"
else
    echo -e "${RED}❌ VERCEL_PROJECT_ID no configurado${NC}"
    SECRETS_OK=false
fi

# Verificar pull de Vercel
echo -e "${YELLOW}🔄 Verificando pull de Vercel...${NC}"
if vercel pull --yes --environment=production > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Pull de Vercel funcionando${NC}"
else
    echo -e "${RED}❌ Error en pull de Vercel${NC}"
    SECRETS_OK=false
fi

echo ""
if [ "$SECRETS_OK" = true ]; then
    echo -e "${GREEN}🎉 ¡Configuración completa y funcionando!${NC}"
    echo ""
    echo -e "${BLUE}📋 Resumen de la configuración:${NC}"
    echo "   ✅ Vercel CLI autenticado"
    echo "   ✅ Proyecto vinculado"
    echo "   ✅ Variables de entorno accesibles"
    echo "   ✅ GitHub CLI configurado"
    echo "   ✅ GitHub Secrets configurados"
    echo "   ✅ Pull de Vercel funcionando"
    echo ""
    echo -e "${GREEN}✨ ¡Todo listo para el despliegue automático!${NC}"
    echo ""
    echo -e "${YELLOW}🧪 Para probar el workflow:${NC}"
    echo "   git push origin main"
else
    echo -e "${RED}❌ Hay problemas en la configuración${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Para solucionar:${NC}"
    echo "   1. Ejecuta: ./auto_setup_vercel.sh"
    echo "   2. O configura manualmente los secrets faltantes"
    exit 1
fi
