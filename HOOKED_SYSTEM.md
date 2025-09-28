# 🎯 Sistema Hooked - Fuzzy's Home School

Implementación del modelo Hooked de Nir Eyal para crear hábitos de aprendizaje sostenibles en estudiantes.

## 🧠 Filosofía del Sistema

**"Aprender debe sentirse como jugar, no como una obligación"**

El sistema Hooked está diseñado para:
- ✅ **Respetar al usuario**: Sin push notifications molestos
- ✅ **Crear hábitos**: Retos diarios sutiles y atractivos
- ✅ **Gamificar el aprendizaje**: Badges, streaks, recompensas variables
- ✅ **Fomentar la reflexión**: Diario personal del progreso

## 🏗️ Arquitectura del Sistema

### 1. **TRIGGERS** (Disparadores Sutiles)
- **MessageBar**: Notificación discreta en-app
- **Bell**: Campana con indicador de mensajes no leídos
- **Daily Quest**: Reto automático cada día a las 7:00 AM
- **Cron Job**: Generación automática de contenido

### 2. **ACTIONS** (Acciones Simples)
- **Drag & Drop**: Interacciones intuitivas con dnd-kit
- **Retos Visuales**: Sistema solar, hábitats, matemáticas
- **Cero Fricción**: Un clic para comenzar

### 3. **VARIABLE REWARDS** (Recompensas Variables)
- **Confetti**: Celebración visual al completar retos
- **Badges**: Sistema Open Badges 3.0 compatible
- **Streaks**: Rachas de días consecutivos
- **Puntos**: Sistema de puntuación progresivo

### 4. **INVESTMENT** (Inversión Personal)
- **Diario**: Reflexiones personales del progreso
- **Avatar**: Personalización con DiceBear
- **Perfil**: Historial de logros y estadísticas
- **Badges**: Colección de logros verificables

## 📁 Estructura de Archivos

```
apps/web/src/
├── components/hooked/
│   ├── MessageBar.tsx          # Notificaciones sutiles
│   ├── Bell.tsx                # Campana con indicador
│   ├── Inbox.tsx               # Bandeja de mensajes
│   └── QuestGame.tsx           # Juego drag & drop
├── hooks/
│   └── useHookedSystem.ts      # Hook principal del sistema
├── app/
│   ├── quest/[id]/page.tsx     # Página de retos
│   ├── profile/page.tsx        # Perfil del usuario
│   └── inbox/page.tsx          # Bandeja de mensajes
└── lib/
    └── supabase/client.ts      # Cliente Supabase

supabase/
├── migrations/
│   └── 009_hooked_system.sql   # Esquema de base de datos
└── functions/
    └── create_daily_quest/     # Edge Function para retos diarios
        └── index.ts

scripts/
├── setup-hooked-system.sh      # Script de configuración
└── setup-daily-quest-cron.sql  # Configuración del cron job
```

## 🗄️ Base de Datos

### Tablas Principales

#### `quests` - Retos Diarios
```sql
- id: UUID (PK)
- title: TEXT
- description: TEXT
- payload: JSONB (datos del reto)
- type: drag_drop | quiz | memory
- difficulty: easy | medium | hard
- points: INTEGER
- time_limit: INTEGER (segundos)
- available_on: DATE
- is_active: BOOLEAN
```

#### `quest_progress` - Progreso de Usuarios
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- quest_id: UUID (FK)
- status: started | completed | abandoned
- score: INTEGER
- time_spent: INTEGER
- answers: JSONB
- started_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
```

#### `streaks` - Rachas de Usuarios
```sql
- user_id: UUID (PK)
- current_streak: INTEGER
- longest_streak: INTEGER
- last_activity_date: DATE
- total_days_active: INTEGER
```

#### `badges` - Sistema de Insignias
```sql
- id: UUID (PK)
- code: TEXT (único)
- name: TEXT
- description: TEXT
- icon: TEXT (emoji)
- category: quest | streak | achievement
- points: INTEGER
- rarity: common | rare | epic | legendary
```

#### `messages` - Notificaciones Sutiles
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- kind: quest | badge | achievement | reminder
- title: TEXT
- body: TEXT
- cta_url: TEXT
- seen_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ
```

## 🚀 Configuración

### 1. Instalar Dependencias
```bash
cd apps/web
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-rewards canvas-confetti
```

### 2. Aplicar Migración
```bash
supabase db push
```

### 3. Desplegar Edge Function
```bash
supabase functions deploy create_daily_quest
```

### 4. Configurar Cron Job
Ejecutar en Supabase SQL Editor:
```sql
-- Reemplazar YOUR_PROJECT_REF con tu referencia de proyecto
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

### 5. Script Automático
```bash
./scripts/setup-hooked-system.sh
```

## 🎮 Flujo de Usuario

### 1. **Primera Visita**
- Usuario ve MessageBar con reto del día
- Campana muestra indicador de notificaciones
- Un clic lleva al reto

### 2. **Completar Reto**
- Drag & drop interactivo
- Confetti al completar
- Badge automático si cumple criterios
- Streak se actualiza automáticamente

### 3. **Inversión Personal**
- Diario para reflexiones
- Avatar personalizable
- Perfil con estadísticas
- Colección de badges

### 4. **Retención**
- Reto diario automático
- Mensajes sutiles de Fuzzy
- Streaks y gamificación
- Progreso visible

## 🎯 Tipos de Retos

### Drag & Drop
- **Sistema Solar**: Ordenar planetas por distancia
- **Hábitats**: Conectar animales con su entorno
- **Clasificación**: Categorizar elementos

### Quiz
- **Matemáticas**: Operaciones básicas
- **Ciencias**: Preguntas de conocimiento
- **Historia**: Eventos y fechas

### Memory
- **Tarjetas**: Emparejar conceptos
- **Secuencias**: Ordenar eventos
- **Asociaciones**: Conectar ideas

## 🏆 Sistema de Badges

### Por Categoría
- **Quest**: Completar retos
- **Streak**: Rachas de días
- **Achievement**: Logros especiales
- **Special**: Eventos únicos

### Por Rareza
- **Común**: Fácil de obtener
- **Rara**: Requiere esfuerzo
- **Épica**: Logros significativos
- **Legendaria**: Logros excepcionales

## 📊 Analytics y Métricas

### Eventos Rastreados
- `quest_started`: Inicio de reto
- `quest_completed`: Reto completado
- `badge_earned`: Badge obtenido
- `streak_incremented`: Racha actualizada
- `message_seen`: Mensaje visto
- `message_dismissed`: Mensaje descartado

### Métricas Clave
- **Retención 7 días**: % usuarios activos
- **Quest Completion Rate**: % retos completados
- **Streak Average**: Racha promedio
- **Badge Collection**: Badges por usuario

## 🔧 Personalización

### Configurar Retos
Editar `supabase/functions/create_daily_quest/index.ts`:
```typescript
const questTemplates = [
  {
    title: "Tu Reto Personalizado",
    type: "drag_drop",
    payload: { /* datos del reto */ }
  }
];
```

### Agregar Badges
```sql
INSERT INTO public.badges (code, name, description, icon, category, points, rarity)
VALUES ('custom_badge', 'Badge Personalizado', 'Descripción', '🏆', 'special', 50, 'rare');
```

### Personalizar Mensajes
```typescript
// En create_daily_quest/index.ts
const messages = activeUsers.map(user => ({
  user_id: user.id,
  kind: 'quest',
  title: '¡Tu mensaje personalizado!',
  body: 'Contenido del mensaje',
  cta_url: `/quest/${newQuest.id}`
}));
```

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. **Cron Job No Funciona**
- Verificar que pg_cron esté habilitado
- Comprobar URL del Edge Function
- Revisar logs en Supabase

#### 2. **Edge Function Error**
- Verificar variables de entorno
- Comprobar permisos de RLS
- Revisar logs de función

#### 3. **DnD No Funciona**
- Verificar que @dnd-kit esté instalado
- Comprobar imports en QuestGame.tsx
- Revisar consola del navegador

#### 4. **Badges No Se Otorgan**
- Verificar triggers en base de datos
- Comprobar criterios de badges
- Revisar logs de aplicación

## 🚀 Próximas Mejoras

### Fase 2: Onboarding
- Tour guiado con react-joyride
- Tutorial interactivo
- Onboarding personalizado

### Fase 3: Analytics
- Integración con PostHog
- Métricas avanzadas
- A/B testing de retos

### Fase 4: Social
- Compartir badges
- Leaderboards
- Colaboración entre estudiantes

## 📚 Recursos Adicionales

- [Modelo Hooked - Nir Eyal](https://www.nirandfar.com/hooked)
- [dnd-kit Documentation](https://dndkit.com/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Open Badges 3.0](https://www.1edtech.org/standards/open-badges/)

---

**🎯 El sistema Hooked está diseñado para crear hábitos de aprendizaje sostenibles, respetando al usuario y fomentando el amor por el conocimiento.**
