#!/bin/bash

# Script para reemplazar sprites de Blockly con Fuzzy
# Uso: ./scripts/customize-blockly-fuzzy.sh

set -e

echo "🎮 Customizando Blockly Games con Fuzzy..."

BLOCKLY_DIR="apps/web/public/games/blockly"
FUZZY_ASSETS="$BLOCKLY_DIR/assets/fuzzy"

# Verificar que existen los assets de Fuzzy
if [ ! -d "$FUZZY_ASSETS" ]; then
    echo "❌ Error: No se encontró la carpeta de assets de Fuzzy"
    echo "Crea la carpeta: $FUZZY_ASSETS"
    echo "Y agrega las imágenes de Fuzzy ahí"
    exit 1
fi

# Función para reemplazar sprite con backup
replace_sprite() {
    local game=$1
    local original=$2
    local fuzzy=$3
    local backup_dir="$BLOCKLY_DIR/$game/backup"

    # Crear directorio de backup si no existe
    mkdir -p "$backup_dir"

    if [ -f "$FUZZY_ASSETS/$fuzzy" ] && [ -f "$BLOCKLY_DIR/$game/$original" ]; then
        # Hacer backup del original si no existe
        if [ ! -f "$backup_dir/$original" ]; then
            cp "$BLOCKLY_DIR/$game/$original" "$backup_dir/$original"
            echo "  📄 Backup: $original → backup/$original"
        fi

        # Reemplazar con Fuzzy
        cp "$FUZZY_ASSETS/$fuzzy" "$BLOCKLY_DIR/$game/$original"
        echo "  ✅ $game/$original → $fuzzy"
    elif [ ! -f "$FUZZY_ASSETS/$fuzzy" ]; then
        echo "  ⚠️  Falta: $fuzzy"
    elif [ ! -f "$BLOCKLY_DIR/$game/$original" ]; then
        echo "  ⚠️  No existe: $game/$original"
    fi
}

# MAZE - Reemplazar jugador
echo "🧩 Customizando MAZE..."
replace_sprite "maze" "marker.png" "fuzzy-player-20x34.png"

# BIRD - Nota: Bird usa sprite sheet, necesitará customización manual
echo "🐦 Customizando BIRD..."
if [ -f "$BLOCKLY_DIR/bird/birds-120.png" ]; then
    echo "  ⚠️  Bird usa sprite sheet (birds-120.png) - requiere edición manual"
    echo "  💡 Considera usar fuzzy-medium-32x32.png como referencia"
fi

# TURTLE - Buscar sprites de tortuga
echo "🐢 Customizando TURTLE..."
echo "  💡 Turtle no usa sprites PNG directos - los gráficos son generados por código"
echo "  🎨 Se puede customizar modificando el código JavaScript en turtle/src/"

# POND - Reemplazar avatar si existe
echo "🦆 Customizando POND..."
echo "  💡 Pond genera gráficos dinámicamente - customización requiere modificar código"

# Verificar si hay otros sprites que pueden ser reemplazados
echo ""
echo "🔍 Buscando otros sprites para personalizar..."

# Buscar imágenes pequeñas que podrían ser avatares
find "$BLOCKLY_DIR" -name "*.png" -exec sh -c '
    size=$(file "$1" | grep -o "[0-9]* x [0-9]*" | head -1)
    if [ ! -z "$size" ]; then
        width=$(echo "$size" | cut -d" " -f1)
        height=$(echo "$size" | cut -d" " -f3)
        if [ "$width" -le 100 ] && [ "$height" -le 100 ] && [ "$width" -ge 16 ] && [ "$height" -ge 16 ]; then
            echo "  🖼️  Candidato: $(basename $(dirname $1))/$(basename $1) ($size)"
        fi
    fi
' sh {} \;

echo ""
echo "✨ ¡Customización de Maze completada!"
echo ""
echo "📋 Próximos pasos manuales:"
echo "1. Para Bird: Editar birds-120.png sprite sheet manualmente"
echo "2. Para Turtle: Modificar código en turtle/src/ para usar sprites de Fuzzy"
echo "3. Para Pond: Modificar código en pond/src/ para avatares de Fuzzy"
echo ""
echo "🎯 Sprites de Fuzzy disponibles:"
echo "   - fuzzy-player-20x34.png (para jugadores pequeños)"
echo "   - fuzzy-medium-32x32.png (tamaño medio)"
echo "   - fuzzy-avatar-64x64.png (avatares grandes)"
echo "   - fuzzy-happy-64x64.png (para celebraciones)"