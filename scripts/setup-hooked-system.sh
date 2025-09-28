#!/bin/bash

# Script para configurar el sistema Hooked completo
# Ejecutar desde la raíz del proyecto

echo "🚀 Configurando sistema Hooked para Fuzzy's Home School..."

# 1. Aplicar migración de base de datos
echo "📊 Aplicando migración de base de datos..."
supabase db push

# 2. Desplegar Edge Function
echo "⚡ Desplegando Edge Function para retos diarios..."
supabase functions deploy create_daily_quest

# 3. Configurar cron job (requiere ejecutar manualmente en Supabase SQL Editor)
echo "⏰ Configurando cron job para retos diarios..."
echo "⚠️  IMPORTANTE: Ejecuta el siguiente script en Supabase SQL Editor:"
echo "   scripts/setup-daily-quest-cron.sql"
echo ""
echo "   Reemplaza 'YOUR_PROJECT_REF' con tu referencia de proyecto de Supabase"

# 4. Verificar que las dependencias estén instaladas
echo "📦 Verificando dependencias..."
cd apps/web
npm list @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-rewards canvas-confetti

if [ $? -eq 0 ]; then
    echo "✅ Todas las dependencias están instaladas"
else
    echo "❌ Instalando dependencias faltantes..."
    npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-rewards canvas-confetti
fi

# 5. Crear datos de prueba (opcional)
echo "🎯 ¿Quieres crear datos de prueba? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "📝 Creando datos de prueba..."
    
    # Crear un reto de prueba para hoy
    cat << 'EOF' > /tmp/test-quest.sql
-- Crear un reto de prueba para hoy
INSERT INTO public.quests (
  title,
  description,
  prompt,
  payload,
  type,
  difficulty,
  points,
  time_limit,
  available_on,
  is_active
) VALUES (
  'Reto de Prueba - Sistema Solar',
  'Aprende sobre los planetas del sistema solar',
  'Arrastra cada planeta a su órbita correcta según la distancia al sol',
  '{
    "type": "drag_drop",
    "instruction": "Arrastra cada planeta a su órbita correcta según la distancia al sol",
    "items": [
      {"id": "mercurio", "name": "Mercurio", "emoji": "☿️", "correct_position": 1},
      {"id": "venus", "name": "Venus", "emoji": "♀️", "correct_position": 2},
      {"id": "tierra", "name": "Tierra", "emoji": "🌍", "correct_position": 3},
      {"id": "marte", "name": "Marte", "emoji": "♂️", "correct_position": 4}
    ],
    "drop_zones": [
      {"id": "orbit-1", "label": "Órbita 1 (más cerca del sol)"},
      {"id": "orbit-2", "label": "Órbita 2"},
      {"id": "orbit-3", "label": "Órbita 3"},
      {"id": "orbit-4", "label": "Órbita 4 (más lejos del sol)"}
    ]
  }'::jsonb,
  'drag_drop',
  'easy',
  100,
  300,
  CURRENT_DATE,
  true
) ON CONFLICT DO NOTHING;
EOF

    echo "📝 Ejecuta este SQL en Supabase para crear un reto de prueba:"
    cat /tmp/test-quest.sql
    rm /tmp/test-quest.sql
fi

echo ""
echo "🎉 ¡Sistema Hooked configurado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ejecuta el script SQL en Supabase para configurar el cron job"
echo "2. Verifica que la Edge Function esté desplegada"
echo "3. Prueba el sistema creando un usuario y completando un reto"
echo ""
echo "🔗 URLs importantes:"
echo "- Dashboard: /student"
echo "- Perfil: /profile"
echo "- Bandeja: /inbox"
echo "- Reto: /quest/[id]"
echo ""
echo "🎯 El sistema está listo para enganchar a los estudiantes con:"
echo "✅ Mensajes sutiles (sin push notifications molestos)"
echo "✅ Retos diarios automáticos"
echo "✅ Drag & drop interactivo"
echo "✅ Recompensas variables (confetti + badges)"
echo "✅ Sistema de inversión (diario + avatar)"
echo "✅ Streaks y gamificación"
