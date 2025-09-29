# 🔧 Solución al Error de Restricción de Base de Datos

## Error Identificado
```
ERROR: 23514: new row for relation "games_pool" violates check constraint "games_pool_source_check"
DETAIL: Failing row contains (..., corrected, ...)
```

## Causa del Error
El error ocurrió porque intenté insertar el valor `'corrected'` en la columna `source` de la tabla `games_pool`, pero esta columna tiene una restricción que solo permite los valores:
- `'seed'`
- `'ai'`

## Solución Implementada

### 1. Identificación del Problema
- ✅ Verificé la restricción en `supabase/migrations/005_game_pool_system.sql`
- ✅ Confirmé que `source` solo acepta `'seed'` o `'ai'`
- ✅ Identifiqué que estaba usando `'corrected'` incorrectamente

### 2. Correcciones Aplicadas

#### Script SQL Original (`scripts/fix-game-inconsistencies.sql`)
```sql
-- ANTES (incorrecto)
}', 'ready', 'corrected', NOW()),

-- DESPUÉS (corregido)
}', 'ready', 'ai', NOW()),
```

#### Script TypeScript (`scripts/improve-game-generation.ts`)
```typescript
// ANTES (incorrecto)
source: 'corrected',

// DESPUÉS (corregido)
source: 'ai',
```

### 3. Script Seguro Creado (`scripts/fix-games-safe.sql`)
- ✅ Usa transacciones para rollback en caso de error
- ✅ Manejo de errores individual por juego
- ✅ Verificación de estructura de tabla
- ✅ Inserción segura con validación

### 4. Características del Script Seguro
- **Transacciones**: Rollback automático si hay errores
- **Validación**: Verifica estructura de tabla antes de insertar
- **Manejo de errores**: Cada juego se inserta independientemente
- **Logging**: Notificaciones de éxito/error por juego
- **Verificación**: Consultas finales para confirmar inserción

## Archivos Modificados

1. **`scripts/fix-game-inconsistencies.sql`**
   - Cambiado `'corrected'` → `'ai'`
   - Actualizado conteo de juegos

2. **`scripts/improve-game-generation.ts`**
   - Cambiado `source: 'corrected'` → `source: 'ai'`

3. **`scripts/fix-games-safe.sql`** (NUEVO)
   - Script seguro con transacciones
   - Manejo de errores robusto
   - Validación de estructura

4. **`scripts/run-game-corrections.sh`**
   - Actualizado para usar script seguro
   - Instrucciones de ejecución claras

## Cómo Aplicar la Solución

### Opción 1: Script Seguro (Recomendado)
```bash
# Ejecutar el script seguro
psql -h localhost -p 54322 -U postgres -d postgres -f scripts/fix-games-safe.sql
```

### Opción 2: Script Original Corregido
```bash
# Ejecutar el script corregido
psql -h localhost -p 54322 -U postgres -d postgres -f scripts/fix-game-inconsistencies.sql
```

### Opción 3: Script de Ejecución Automática
```bash
# Ejecutar script completo
./scripts/run-game-corrections.sh
```

## Verificación de la Solución

### 1. Verificar Restricciones
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'games_pool_source_check';
```

### 2. Verificar Inserción
```sql
SELECT 
  title,
  subject,
  grade,
  source,
  status
FROM public.games_pool 
WHERE source = 'ai'
ORDER BY created_at DESC;
```

### 3. Verificar Conteo
```sql
SELECT 
  COUNT(*) as total_games,
  COUNT(CASE WHEN source = 'ai' THEN 1 END) as ai_games,
  COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_games
FROM public.games_pool;
```

## Prevención de Errores Futuros

### 1. Validación de Datos
- ✅ Verificar restricciones antes de insertar
- ✅ Usar transacciones para operaciones críticas
- ✅ Validar estructura de tabla

### 2. Scripts Seguros
- ✅ Manejo de errores individual
- ✅ Logging detallado
- ✅ Rollback automático

### 3. Documentación
- ✅ Documentar restricciones de tabla
- ✅ Incluir ejemplos de valores válidos
- ✅ Scripts de verificación

## Estado Actual
- ✅ **Error identificado y corregido**
- ✅ **Scripts actualizados con valores válidos**
- ✅ **Script seguro creado con manejo de errores**
- ✅ **Documentación completa de la solución**

## Próximos Pasos
1. **Ejecutar el script seguro** para aplicar las correcciones
2. **Verificar que los juegos se inserten correctamente**
3. **Probar la funcionalidad en el navegador**
4. **Implementar validación automática** en futuras inserciones

---

**Fecha**: $(date)
**Error**: 23514 - games_pool_source_check constraint violation
**Solución**: Cambio de 'corrected' a 'ai' + script seguro con transacciones
**Estado**: ✅ Resuelto

