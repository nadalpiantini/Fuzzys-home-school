# 🗺️ Curriculum Map System - Setup Guide

## 📋 Pasos de Implementación

### 1️⃣ **Aplicar Migración en Supabase**

```bash
# Opción A: Via Supabase Dashboard
1. Ve a https://supabase.com/dashboard/project/ggntuptvqxditgxtnsex/sql
2. Copia el contenido de: supabase/migrations/20250104_curriculum_map_system.sql
3. Pega y ejecuta en el SQL Editor

# Opción B: Via CLI (si tienes supabase CLI)
supabase db push
```

### 2️⃣ **Poblar Datos desde Curriculums Existentes**

```bash
# Instalar dependencia tsx si no la tienes
npm install -D tsx

# Ejecutar script de población
npx tsx scripts/populate-curriculum-map.ts
```

**Qué hace el script:**
- ✅ Lee todos los JSON de `/apps/web/src/curriculum/**/*.json`
- ✅ Crea nodos en `curriculum_nodes` por cada capítulo
- ✅ Crea links **lineales** (secuencia normal: cap1 → cap2 → cap3)
- ✅ Crea links **alternativos** (saltos: cap1 → cap3 si score≥80%)
- ✅ Crea links **de refuerzo** (retroceso: cap2 → cap1 si score<70%)

### 3️⃣ **Verificar Datos Poblados**

```sql
-- Ver todos los nodos
SELECT curriculum_id, chapter_id, title, difficulty, order_index
FROM curriculum_nodes
ORDER BY curriculum_id, order_index;

-- Ver todos los links
SELECT
  cn1.chapter_id as from_chapter,
  cn2.chapter_id as to_chapter,
  cl.type,
  cl.condition
FROM curriculum_links cl
JOIN curriculum_nodes cn1 ON cl.from_node = cn1.id
JOIN curriculum_nodes cn2 ON cl.to_node = cn2.id
ORDER BY cn1.curriculum_id, cn1.order_index;
```

### 4️⃣ **Personalizar Links (Opcional)**

El script crea links básicos. Puedes ajustarlos manualmente:

```sql
-- Ejemplo: Agregar camino alternativo personalizado
INSERT INTO curriculum_links (from_node, to_node, condition, type)
SELECT
  (SELECT id FROM curriculum_nodes WHERE chapter_id = 'numeros-01'),
  (SELECT id FROM curriculum_nodes WHERE chapter_id = 'sumas-01'),
  'score>=90',
  'alternative'
WHERE NOT EXISTS (
  SELECT 1 FROM curriculum_links
  WHERE from_node = (SELECT id FROM curriculum_nodes WHERE chapter_id = 'numeros-01')
    AND to_node = (SELECT id FROM curriculum_nodes WHERE chapter_id = 'sumas-01')
);

-- Ejemplo: Agregar refuerzo específico
INSERT INTO curriculum_links (from_node, to_node, condition, type)
SELECT
  (SELECT id FROM curriculum_nodes WHERE chapter_id = 'multiplicacion-01'),
  (SELECT id FROM curriculum_nodes WHERE chapter_id = 'tablas-repaso'),
  'score<60',
  'reinforcement'
WHERE NOT EXISTS (
  SELECT 1 FROM curriculum_links
  WHERE from_node = (SELECT id FROM curriculum_nodes WHERE chapter_id = 'multiplicacion-01')
    AND to_node = (SELECT id FROM curriculum_nodes WHERE chapter_id = 'tablas-repaso')
);
```

## 🎨 **Uso del Sistema**

### Mapa del Estudiante
```
URL: /learn/map/student
```
- Verde = Completado ✅
- Morado = Desbloqueado 🔓
- Gris = Bloqueado 🔒

### Ruta Personalizada
```javascript
// Botón "Mi Camino" carga:
const response = await fetch(`/api/curriculum/route/suggest?studentId=${id}`);
// Prioriza: 1) Refuerzo, 2) Lineal, 3) Alternativa
```

### Bonus de Exploración
```javascript
// Automático al completar capítulo vía camino alternativo/refuerzo
// StoryLesson.tsx lo detecta y otorga +40 pts
```

## 🔧 **Estructura de Datos**

### `curriculum_nodes`
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `curriculum_id` | ID del mundo | `"math-level1"` |
| `chapter_id` | ID único del capítulo | `"numeros-01"` |
| `title` | Título legible | `"Números 0-10"` |
| `order_index` | Orden sugerido | `0, 1, 2...` |
| `difficulty` | Nivel | `easy/medium/hard` |

### `curriculum_links`
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `from_node` | UUID nodo origen | `uuid` |
| `to_node` | UUID nodo destino | `uuid` |
| `type` | Tipo de link | `linear/alternative/reinforcement` |
| `condition` | Condición unlock | `always/completed/score>=70` |

## 🎯 **Ejemplos de Condiciones**

```typescript
// Siempre desbloqueado
condition: 'always'

// Requiere completar anterior
condition: 'completed'

// Requiere score mínimo
condition: 'score>=70'
condition: 'score>=80'
condition: 'score>=90'

// Requiere score bajo (para refuerzo)
condition: 'score<70'
condition: 'score<60'
```

## 🚀 **Próximos Pasos (Fuera de este Sprint)**

1. **Dashboard de Administración**
   - UI para editar nodos/links sin SQL
   - Vista de grafo visual para diseñar rutas

2. **Algoritmos Avanzados**
   - Machine learning para optimizar rutas
   - A/B testing de diferentes caminos

3. **Analytics**
   - Qué caminos son más efectivos
   - Dónde se atascan los estudiantes

4. **Gamificación**
   - Bonus extra por explorar todos los caminos
   - Achievements por rutas especiales
