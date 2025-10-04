# 🧪 Guía de Testing - Sistema de Puntos y Adaptativo

## 📋 Checklist General

- [ ] TypeScript compila sin errores
- [ ] Migraciones SQL aplicadas en Supabase
- [ ] RESEND_API_KEY configurado
- [ ] Servidor de desarrollo corriendo
- [ ] Usuario de prueba creado (padre y estudiante)

---

## 1️⃣ Test: Sistema de Puntos Avanzado

### Preparación

```bash
# Iniciar servidor dev
npm run dev

# Abrir en navegador
http://localhost:3000
```

### Test A: Award Points API

**Endpoint:** `POST /api/points/award`

```bash
# Test con dificultad media, buen score, tiempo rápido
curl -X POST http://localhost:3000/api/points/award \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "tu-student-uuid-aqui",
    "subjectCode": "math",
    "basePoints": 100,
    "difficulty": "medium",
    "score": 90,
    "time_spent": 120,
    "creativity": 15
  }'
```

**Resultado esperado:**

```json
{
  "ok": true,
  "data": {
    "totalAwarded": 150,
    "newTotalPoints": 150,
    "newStreak": 1,
    "breakdown": {
      "base": 100,
      "difficultyMultiplier": 1.25,
      "streakBonus": 0,
      "scoreBonus": 20,
      "timeBonus": 10,
      "creativityBonus": 15
    }
  }
}
```

**Cálculo esperado:**
- Base: 100 puntos
- Multiplicador (medium): ×1.25 = 125
- Score bonus (≥90%): +20
- Time bonus (<3min): +10
- Creativity: +15
- **Total: 170 puntos**

### Test B: Diferentes Dificultades

```bash
# Easy (×1.0)
curl -X POST http://localhost:3000/api/points/award \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "uuid",
    "subjectCode": "math",
    "difficulty": "easy",
    "basePoints": 100
  }'
# Esperar: 100 puntos

# Hard (×1.5)
curl -X POST http://localhost:3000/api/points/award \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "uuid",
    "subjectCode": "math",
    "difficulty": "hard",
    "basePoints": 100
  }'
# Esperar: 150 puntos
```

### Test C: Streak Bonus

**Día 1:** Completar actividad → streak = 1
**Día 2:** Completar actividad → streak = 2, bonus = 5%
**Día 3:** Completar actividad → streak = 3, bonus = 10%
**Día 4:** Completar actividad → streak = 4, bonus = 15%
**Día 5:** Completar actividad → streak = 5, bonus = 20%
**Día 6:** Completar actividad → streak = 6, bonus = 25% (max)

### Test D: Leaderboard

```sql
-- Ejecutar en Supabase SQL Editor
SELECT * FROM public.get_points_leaderboard(10);
```

**Resultado esperado:** Lista de top 10 estudiantes ordenados por puntos totales.

---

## 2️⃣ Test: Motor Adaptativo de Dificultad

### Test A: Analyze Performance API

**Endpoint:** `GET /api/adaptive/recommendations`

```bash
curl "http://localhost:3000/api/adaptive/recommendations?studentId=tu-uuid&subjectCode=math"
```

**Resultado esperado:**

```json
{
  "ok": true,
  "data": {
    "avgScore": 85.5,
    "completionRate": 0.8,
    "avgTimePerChapter": 180,
    "struggleIndicators": 2,
    "masteryIndicators": 5,
    "recommendedDifficulty": "medium",
    "analysis": {
      "performance": "good",
      "trend": "improving"
    }
  }
}
```

### Test B: Suggest Difficulty Adjustment

**Endpoint:** `POST /api/adaptive/recommendations`

```bash
# Scenario: Estudiante con buen rendimiento
curl -X POST http://localhost:3000/api/adaptive/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "action": "adjust_difficulty",
    "studentId": "uuid",
    "curriculumId": "literacy_level1",
    "currentDifficulty": "easy",
    "recentScore": 95,
    "timeSpent": 100
  }'
```

**Resultado esperado:**

```json
{
  "ok": true,
  "suggestion": {
    "currentDifficulty": "easy",
    "suggestedDifficulty": "medium",
    "reason": "Excelente rendimiento - aumentar desafío",
    "confidence": 0.85
  }
}
```

### Test C: Adaptive Profile View

```sql
-- Ejecutar en Supabase SQL Editor
SELECT * FROM public.v_student_adaptive_profile
WHERE student_id = 'tu-uuid';
```

**Resultado esperado:** Perfil adaptativo con métricas de rendimiento.

---

## 3️⃣ Test: Sesiones Adaptativas en Tiempo Real

### Test Flow Completo

#### Paso 1: Iniciar Sesión Adaptativa

```bash
curl -X POST http://localhost:3000/api/adaptive/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "uuid",
    "curriculumId": "math_level1",
    "chapterId": "chapter_1",
    "difficulty": "medium"
  }'
```

**Guardar el `sessionId` del response.**

#### Paso 2: Registrar Evento (Respuesta Correcta)

```bash
curl -X POST http://localhost:3000/api/adaptive/session/event \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid-aqui",
    "eventType": "question_submitted",
    "correct": true,
    "responseMs": 5000,
    "payload": {"questionId": "q1", "score": 100}
  }'
```

#### Paso 3: Registrar Evento (Respuesta Incorrecta)

```bash
curl -X POST http://localhost:3000/api/adaptive/session/event \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid-aqui",
    "eventType": "question_submitted",
    "correct": false,
    "responseMs": 15000,
    "payload": {"questionId": "q2", "score": 0}
  }'
```

#### Paso 4: Obtener Estado de Sesión

```bash
curl "http://localhost:3000/api/adaptive/session/state?sessionId=session-uuid-aqui"
```

**Resultado esperado:**

```json
{
  "ok": true,
  "state": {
    "sessionId": "uuid",
    "currentDifficulty": "medium",
    "totalCorrect": 1,
    "totalIncorrect": 1,
    "avgResponseTime": 10000,
    "suggestionsPending": 0,
    "newDifficulty": "easy"
  }
}
```

### Test D: Integración con StoryLesson

1. **Navega a una lección:** `http://localhost:3000/student/literacy/level1`
2. **Completa una actividad**
3. **Observa el badge de dificultad** en el header del capítulo
4. **Después de 3-5 actividades**, el sistema debería ajustar la dificultad
5. **Verifica notificación visual** de cambio de dificultad

**Indicadores visuales esperados:**
- 🎯 Badge "Fácil" (verde) para `easy`
- ⚡ Badge "Moderado" (amarillo) para `medium`
- 🚀 Badge "Difícil" (rojo) para `hard`
- Notificación animada cuando cambia la dificultad

---

## 4️⃣ Test: Sistema de Family Links

### Test A: Crear Link Padre-Estudiante

**UI Flow:**
1. Login como padre
2. Ir a `/parent/dashboard`
3. Clic en "Vincular Estudiante"
4. Ingresar Student ID
5. Seleccionar relación (madre/padre/tutor)
6. Guardar

**API Test:**

```bash
curl -X POST http://localhost:3000/api/parents/weekly-report \
  -H "Content-Type: application/json" \
  -d '{
    "parentId": "parent-uuid",
    "studentId": "student-uuid",
    "relationship": "parent"
  }'
```

### Test B: Ver Progreso Semanal

```sql
-- Ejecutar en Supabase SQL Editor
SELECT * FROM public.get_family_progress_summary('parent-uuid');
```

---

## 5️⃣ Test: Email Reports

### Test A: Enviar Reporte Semanal

**Prerequisitos:**
- RESEND_API_KEY configurado
- Parent profile con email válido
- Al menos un estudiante vinculado

**UI Flow:**
1. Login como padre
2. Ir a `/parent/dashboard`
3. Clic en "Enviar Reporte"
4. Esperar toast de confirmación
5. Revisar bandeja de entrada

**API Test:**

```bash
curl -X POST http://localhost:3000/api/parents/send-report \
  -H "Content-Type: application/json" \
  -d '{"parentId": "parent-uuid"}'
```

**Email esperado:**
- Subject: `📊 Reporte Semanal - [fecha inicio] a [fecha fin]`
- From: `Fuzzy's Home School <onboarding@resend.dev>`
- Contenido:
  - Header con gradiente morado
  - Stats cards (Puntos, Racha, Capítulos, Promedio)
  - Progreso por materia con progress bars
  - CTA button al dashboard

### Test B: Verificar en Resend Dashboard

1. Ir a: https://resend.com/emails
2. Buscar el email recién enviado
3. Verificar:
   - Status: `Delivered`
   - No errores
   - Preview del HTML

---

## 6️⃣ Test: Parent Dashboard UI

### Test A: Navegación y UI

**Checklist:**
- [ ] Dashboard carga sin errores
- [ ] Tabs de estudiantes funcionan
- [ ] Stats cards muestran datos correctos
- [ ] Actividad reciente se ordena por fecha
- [ ] Progreso por materia muestra barras correctas
- [ ] Botones de email/PDF responden

### Test B: Múltiples Estudiantes

**Scenario:**
1. Vincular 2-3 estudiantes al mismo padre
2. Cada estudiante completa actividades diferentes
3. Verificar que las tabs muestran datos únicos para cada estudiante
4. Verificar que el email incluye todos los estudiantes

### Test C: Empty States

**Scenario:**
1. Padre sin estudiantes vinculados
2. Verificar mensaje: "No hay estudiantes vinculados"
3. Verificar botón "Vincular Estudiante"

---

## 7️⃣ Test de Integración End-to-End

### Scenario Completo: "Día en la vida de un estudiante"

1. **Login estudiante** → `/student/dashboard`
2. **Seleccionar currículo** → `/student/literacy/level1`
3. **Completar Capítulo 1:**
   - Sesión adaptativa se inicia (medium)
   - Actividad 1: 95% correcto, 2min → +puntos, streak +1
   - Actividad 2: 100% correcto, 1.5min → +puntos más bonos
   - Actividad 3: 85% correcto, 4min → +puntos, sin bono tiempo
   - **Sistema ajusta a "hard"** → notificación visible
4. **Logout estudiante**
5. **Login padre** → `/parent/dashboard`
6. **Verificar stats actualizados:**
   - Puntos totales reflejan todos los puntos ganados
   - Racha muestra 1 día
   - Capítulo 1 aparece como completado
   - Promedio calcula correctamente
7. **Enviar email report** → verificar recepción

---

## 🐛 Debugging

### Logs a revisar

```bash
# Development server logs
npm run dev

# Vercel production logs
vercel logs

# Supabase logs
# Dashboard > Logs > Postgrest/Realtime
```

### Queries útiles para debugging

```sql
-- Ver puntos de un estudiante
SELECT * FROM student_progress WHERE student_id = 'uuid';

-- Ver sesiones adaptativas activas
SELECT * FROM adaptive_sessions WHERE student_id = 'uuid' AND ended_at IS NULL;

-- Ver eventos adaptativos recientes
SELECT * FROM adaptive_events ORDER BY created_at DESC LIMIT 50;

-- Ver family links
SELECT * FROM family_links WHERE parent_id = 'uuid' OR student_id = 'uuid';

-- Ver datos semanales
SELECT * FROM v_parent_weekly WHERE student_id = 'uuid';
```

---

## ✅ Acceptance Criteria

### Sistema de Puntos
- ✅ Puntos se otorgan correctamente con todos los bonos
- ✅ Streak aumenta por días consecutivos
- ✅ Leaderboard funciona correctamente
- ✅ API responde en <500ms

### Motor Adaptativo
- ✅ Análisis de rendimiento es preciso
- ✅ Ajustes de dificultad son apropiados
- ✅ Sesiones adaptativas persisten estado
- ✅ Notificaciones visuales aparecen correctamente

### Family Links & Reports
- ✅ Parents pueden vincular múltiples estudiantes
- ✅ Dashboard muestra datos correctos por estudiante
- ✅ Emails se envían exitosamente
- ✅ HTML email renderiza bien en Gmail/Outlook

---

## 📊 Performance Benchmarks

| Operación | Target | Actual |
|-----------|--------|--------|
| Award Points API | <300ms | ___ |
| Adaptive Analysis | <500ms | ___ |
| Send Email | <2s | ___ |
| Dashboard Load | <1s | ___ |
| Session Start | <200ms | ___ |

---

## 🚀 Production Readiness

Antes de desplegar a producción:

- [ ] Todos los tests pasan
- [ ] TypeScript compila sin errores
- [ ] Migraciones aplicadas en prod
- [ ] RESEND_API_KEY configurado en Vercel
- [ ] Dominio verificado en Resend
- [ ] Email from address actualizado
- [ ] Error tracking configurado (Sentry)
- [ ] Rate limiting habilitado
- [ ] SQL índices verificados
- [ ] Backup de base de datos configurado
