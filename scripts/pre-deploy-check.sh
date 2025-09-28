#!/bin/bash

# 🛡️ PRE-DEPLOY VERIFICATION SCRIPT
# Verifica que todo esté listo antes de hacer deploy

set -e  # Exit on any error

echo "🚀 Iniciando verificación pre-deploy..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ No se encontró package.json. Ejecuta desde la raíz del proyecto.${NC}"
    exit 1
fi

# 2. Verificar que no hay dependencias externas problemáticas
echo "🔍 Verificando dependencias externas..."
if grep -r "import.*@fuzzy" apps/web/src/ 2>/dev/null; then
    print_warning "Se encontraron dependencias @fuzzy. Verificar que no causen problemas de build."
else
    print_status "No se encontraron dependencias @fuzzy problemáticas" 0
fi

# 3. Verificar que no hay archivos .disabled
echo "🔍 Verificando archivos deshabilitados..."
if find apps/web/src -name "*.disabled" -type d 2>/dev/null | grep -q .; then
    print_warning "Se encontraron directorios .disabled. Considerar limpiar antes de deploy."
else
    print_status "No se encontraron archivos deshabilitados" 0
fi

# 4. Verificar configuración de Vercel
echo "🔍 Verificando vercel.json..."
if [ -f "apps/web/vercel.json" ]; then
    # Verificar que no hay runtime edge inválido
    if grep -q '"runtime": "edge"' apps/web/vercel.json; then
        print_warning "Se encontró runtime edge en vercel.json. Verificar compatibilidad."
    else
        print_status "Configuración de Vercel OK" 0
    fi
else
    print_warning "No se encontró vercel.json"
fi

# 5. Verificar que el build funciona
echo "🔍 Verificando build local..."
cd apps/web
if npm run build > /dev/null 2>&1; then
    print_status "Build local exitoso" 0
else
    print_status "Build local falló" 1
fi

# 6. Verificar tipos TypeScript
echo "🔍 Verificando tipos TypeScript..."
if npm run typecheck > /dev/null 2>&1; then
    print_status "Verificación de tipos exitosa" 0
else
    print_status "Errores de TypeScript encontrados" 1
fi

# 7. Verificar que no hay cambios sin commitear
echo "🔍 Verificando estado de Git..."
if git diff --quiet && git diff --cached --quiet; then
    print_status "No hay cambios sin commitear" 0
else
    print_warning "Hay cambios sin commitear. Considerar hacer commit antes de deploy."
fi

# 8. Verificar que estamos en la rama correcta
echo "🔍 Verificando rama actual..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    print_status "Estás en la rama principal: $CURRENT_BRANCH" 0
else
    print_warning "Estás en la rama: $CURRENT_BRANCH. Considerar hacer merge a main."
fi

# 9. Verificar que no hay procesos de desarrollo corriendo
echo "🔍 Verificando procesos de desarrollo..."
if pgrep -f "next dev" > /dev/null; then
    print_warning "Hay procesos de desarrollo corriendo. Considerar detenerlos antes de deploy."
else
    print_status "No hay procesos de desarrollo corriendo" 0
fi

# 10. Verificar variables de entorno
echo "🔍 Verificando variables de entorno..."
if [ -f ".env.local" ]; then
    print_status "Archivo .env.local encontrado" 0
else
    print_warning "No se encontró .env.local. Verificar que las variables estén en Vercel."
fi

echo ""
echo -e "${GREEN}🎉 Verificación pre-deploy completada exitosamente!${NC}"
echo -e "${GREEN}✅ El proyecto está listo para deploy.${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "1. git add . && git commit -m 'mensaje'"
echo "2. git push origin main"
echo "3. vercel --prod --force"
echo ""
echo "🛡️ Si algo falla, revisa TROUBLESHOOTING_GUIDE.md"
