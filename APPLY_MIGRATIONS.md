# 📋 Guía de Aplicación de Migraciones

## ⚠️ IMPORTANTE: Aplicar estas migraciones en Supabase SQL Editor

Las siguientes migraciones necesitan ser aplicadas manualmente en el Supabase SQL Editor debido a conflictos con migraciones existentes.

### 🔗 Acceso al SQL Editor

1. Ve a: https://supabase.com/dashboard/project/ggntuptvqxditgxtnsex/sql
2. Inicia sesión con tus credenciales
3. Copia y pega cada migración en orden

---

## 📝 Migraciones a Aplicar (en orden)

### 1️⃣ Sistema de Puntos Avanzado

**Archivo:** `supabase/migrations/20241004e_points_system.sql`

**Descripción:** Sistema de puntos con multiplicadores por dificultad, bonos por streak, bonos por score, y bonos/penalizaciones por tiempo.

**Características:**
- Multiplicadores: easy ×1.0, medium ×1.25, hard ×1.5
- Streak bonus: 5% por día (max 25%)
- Score bonuses: +20 puntos para ≥90%, +10 para ≥70%
- Time bonuses: +10 si <3min, -5 si >20min
- Tabla `family_links` para conectar padres y estudiantes
- Funciones: `award_points_advanced()`, `get_points_leaderboard()`, `get_family_progress_summary()`

**Ejecutar:**
```bash
cat supabase/migrations/20241004e_points_system.sql
```
Copiar todo el contenido y pegarlo en SQL Editor.

---

### 2️⃣ Motor Adaptativo de Dificultad

**Archivo:** `supabase/migrations/20241004f_adaptive_engine.sql`

**Descripción:** Motor de IA para ajustar la dificultad de los contenidos en tiempo real basado en el rendimiento del estudiante.

**Características:**
- Análisis de rendimiento: avg_score, completion_rate, tiempo promedio
- Indicadores de struggle y mastery
- Recomendaciones automáticas de dificultad
- Vista `v_student_adaptive_profile` para dashboard
- Funciones: `analyze_student_performance()`, `suggest_difficulty_adjustment()`

**Ejecutar:**
```bash
cat supabase/migrations/20241004f_adaptive_engine.sql
```
Copiar todo el contenido y pegarlo en SQL Editor.

---

### 3️⃣ Sesiones Adaptativas en Tiempo Real

**Archivo:** `supabase/migrations/20241004g_adaptive_sessions.sql`

**Descripción:** Sistema de tracking de sesiones adaptativas con eventos y ajustes dinámicos de dificultad.

**Características:**
- Tabla `adaptive_sessions` para sesiones activas
- Tabla `adaptive_events` para log de eventos (respuestas, ajustes, etc.)
- Funciones para iniciar sesión, registrar eventos, y obtener estado actual
- Triggers automáticos para actualizar metadatos

**Ejecutar:**
```bash
cat supabase/migrations/20241004g_adaptive_sessions.sql
```
Copiar todo el contenido y pegarlo en SQL Editor.

---

## ✅ Verificación

Después de aplicar todas las migraciones, ejecuta esta query para verificar:

```sql
-- Verificar que las funciones existan
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'award_points_advanced',
    'analyze_student_performance',
    'suggest_difficulty_adjustment'
  );

-- Verificar que las tablas existan
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'family_links',
    'adaptive_sessions',
    'adaptive_events'
  );

-- Verificar que las vistas existan
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'v_student_adaptive_profile'
  );
```

Deberías ver:
- 3 funciones
- 3 tablas
- 1 vista

---

## 🚀 Siguiente Paso

Una vez aplicadas las migraciones, continuar con:
1. Configurar `RESEND_API_KEY` en `.env.local`
2. Probar el sistema de puntos
3. Probar el sistema adaptativo
4. Enviar email de reporte semanal de prueba
