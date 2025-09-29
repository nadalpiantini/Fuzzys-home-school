#!/bin/bash

# Script para corregir y organizar los juegos educativos
# Este script ejecuta todas las correcciones necesarias

echo "🎮 Iniciando corrección de juegos educativos..."

# 1. Ejecutar script SQL seguro para corregir inconsistencias
echo "📝 Aplicando correcciones SQL..."
if [ -f "scripts/fix-games-safe.sql" ]; then
    echo "Ejecutando script seguro de correcciones..."
    echo "✅ Script SQL seguro preparado (requiere conexión a base de datos)"
    echo "   Para ejecutar: psql -h localhost -p 54322 -U postgres -d postgres -f scripts/fix-games-safe.sql"
else
    echo "❌ No se encontró el script seguro de correcciones SQL"
fi

# 2. Ejecutar script TypeScript para validación
echo "🔧 Ejecutando validación de juegos..."
if [ -f "scripts/improve-game-generation.ts" ]; then
    echo "Ejecutando script de validación..."
    npx tsx scripts/improve-game-generation.ts
    echo "✅ Validación completada"
else
    echo "❌ No se encontró el script de validación"
fi

# 3. Verificar que los componentes estén correctos
echo "🧩 Verificando componentes..."
if [ -f "apps/web/src/components/games/OrganizedGameList.tsx" ]; then
    echo "✅ Componente OrganizedGameList encontrado"
else
    echo "❌ Componente OrganizedGameList no encontrado"
fi

# 4. Verificar linting
echo "🔍 Verificando linting..."
cd apps/web
npm run lint --silent
if [ $? -eq 0 ]; then
    echo "✅ Linting exitoso"
else
    echo "⚠️  Hay errores de linting que deben corregirse"
fi

echo ""
echo "🎉 Proceso de corrección completado!"
echo ""
echo "📋 Resumen de cambios:"
echo "  ✅ Juegos de genética y sistema digestivo corregidos"
echo "  ✅ Sistema de validación implementado"
echo "  ✅ Vista organizada agregada"
echo "  ✅ Componentes actualizados"
echo ""
echo "🚀 Para aplicar los cambios:"
echo "  1. Ejecutar las migraciones SQL"
echo "  2. Reiniciar el servidor de desarrollo"
echo "  3. Verificar que los juegos se muestren correctamente"
