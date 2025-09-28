# 🚀 Configuración Manual del Sistema Hooked

## 📋 Pasos para Completar la Configuración

### 1. **Configurar Supabase**

#### A. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota tu `PROJECT_REF` y `API_KEY`

#### B. Aplicar Migración
Ejecuta este SQL en el **SQL Editor** de Supabase:

```sql
-- Copia y pega todo el contenido de:
-- supabase/migrations/009_hooked_system.sql
```

### 2. **Desplegar Edge Function**

#### A. Configurar Variables de Entorno
En tu proyecto Supabase, ve a **Settings > Edge Functions** y agrega:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

#### B. Crear Edge Function
1. Ve a **Edge Functions** en tu dashboard
2. Crea una nueva función llamada `create_daily_quest`
3. Copia el contenido de `supabase/functions/create_daily_quest/index.ts`

### 3. **Configurar Cron Job**

Ejecuta este SQL en el **SQL Editor** de Supabase:

```sql
-- Reemplaza YOUR_PROJECT_REF con tu referencia de proyecto
SELECT cron.schedule(
  'daily-quest-7am',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create_daily_quest',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.edge_secret', true)
    )
  );
  $$
);
```

### 4. **Configurar Variables de Entorno**

Crea un archivo `.env.local` en `apps/web/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 5. **Crear Datos de Prueba**

Ejecuta este SQL para crear un reto de prueba:

```sql
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
```

### 6. **Verificar Funcionamiento**

#### A. Probar la App
1. Ejecuta `npm run dev` en `apps/web/`
2. Ve a `/student`
3. Deberías ver el tour de onboarding
4. Completa el tour y verifica que aparezca el MessageBar

#### B. Probar Reto
1. Ve a `/quest/[id]` (reemplaza con el ID del reto creado)
2. Completa el reto drag & drop
3. Verifica que aparezca confetti y se actualice el progreso

#### C. Verificar Perfil
1. Ve a `/profile`
2. Verifica que se muestren badges, streak y diario
3. Agrega una entrada al diario

### 7. **Troubleshooting**

#### Si el tour no aparece:
```javascript
// En la consola del navegador:
localStorage.removeItem('onboarding-tour-completed');
localStorage.removeItem('onboarding-tour-skipped');
// Recarga la página
```

#### Si no aparecen retos:
1. Verifica que la migración se aplicó correctamente
2. Verifica que el reto de prueba se creó
3. Revisa la consola del navegador para errores

#### Si el cron no funciona:
1. Verifica que pg_cron esté habilitado
2. Verifica la URL del Edge Function
3. Revisa los logs en Supabase

## 🎉 ¡Listo!

Una vez completados todos los pasos, tendrás:

✅ **Sistema Hooked completo**
✅ **Tour de onboarding**
✅ **Retos drag & drop**
✅ **Sistema de badges**
✅ **Mensajes sutiles**
✅ **Diario personal**
✅ **Streaks automáticos**

### URLs Importantes:
- Dashboard: `/student`
- Perfil: `/profile`
- Bandeja: `/inbox`
- Reto: `/quest/[id]`

¡El sistema está listo para enganchar a los estudiantes! 🚀
