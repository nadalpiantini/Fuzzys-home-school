# 🌍 Sistema de Contexto Cultural

## 📋 Resumen

El **Sistema de Contexto Cultural** permite que la plataforma se adapte automáticamente a diferentes países y culturas, manteniendo relevancia local mientras escala globalmente.

## 🎯 Objetivos

- ✅ **Escalabilidad Global**: Soporte para múltiples países y culturas
- ✅ **Auto-detección**: Detección automática de contexto cultural
- ✅ **Personalización**: Usuarios pueden elegir su contexto preferido
- ✅ **Contenido Adaptativo**: Juegos con elementos culturales específicos
- ✅ **Fallback Inteligente**: Contexto global neutro como respaldo

## 🏗️ Arquitectura

### Base de Datos

```sql
-- Contextos culturales
cultural_contexts (
  country_code, country_name, language_code, region,
  cultural_elements, educational_context, is_default
)

-- Elementos culturales específicos
cultural_elements (
  context_id, category, elements
)

-- Preferencias culturales de usuario
user_cultural_preferences (
  user_id, preferred_context_id, auto_detect, manual_override
)
```

### Contextos Soportados

| País | Código | Idioma | Elementos Culturales |
|------|--------|--------|----------------------|
| 🇩🇴 República Dominicana | DO | es | Colmado, sancocho, merengue, béisbol |
| 🇺🇸 Estados Unidos | US | en | Hamburgers, football, Thanksgiving |
| 🇲🇽 México | MX | es | Tacos, Día de los Muertos, mariachi |
| 🇪🇸 España | ES | es | Paella, flamenco, Feria de Abril |
| 🌍 Global | GLOBAL | en | Elementos universales neutros |

## 🔧 Componentes

### 1. Servicio de Contexto Cultural

**Archivo**: `lib/cultural-context/CulturalContextService.ts`

- Detección automática por IP
- Gestión de preferencias de usuario
- Generación de prompts culturales
- Cache de contextos

### 2. Hook de Contexto Cultural

**Archivo**: `hooks/useCulturalContext.ts`

- Estado reactivo del contexto
- Funciones para cambiar contexto
- Auto-detección
- Gestión de preferencias

### 3. Componente Selector

**Archivo**: `components/cultural/CulturalContextSelector.tsx`

- Interfaz para seleccionar contexto
- Auto-detección
- Lista de contextos disponibles
- Información del contexto actual

### 4. Integración con Generación

**Archivo**: `api/jobs/demand/route.ts`

- Prompts adaptativos por contexto
- Elementos culturales específicos
- Generación personalizada

## 🚀 Uso

### 1. Aplicar Migración

```bash
# Aplicar migración de contexto cultural
supabase db push

# O aplicar manualmente
psql -f supabase/migrations/009_cultural_context_system.sql
```

### 2. Usar en Componentes

```typescript
// Hook para contexto cultural
const { currentContext, changeContext, enableAutoDetection } = useCulturalContext(userId);

// Cambiar contexto manualmente
await changeContext('US', true);

// Habilitar auto-detección
await enableAutoDetection();
```

### 3. Generación Adaptativa

```typescript
// El sistema automáticamente usa el contexto del usuario
const games = await generateGamesForUser(userId, category);
// Los juegos incluirán elementos culturales del contexto del usuario
```

## 📊 Funcionalidades

### Auto-detección

1. **Por IP**: Detecta país automáticamente
2. **Por Ubicación**: Usa coordenadas del navegador
3. **Por Idioma**: Detecta idioma del navegador
4. **Fallback**: Contexto global neutro

### Contextos Culturales

#### República Dominicana (Por defecto)
```json
{
  "food": ["colmado", "sancocho", "mangú", "tostones"],
  "places": ["Zona Colonial", "Malecón", "Playa Bávaro"],
  "traditions": ["Carnaval", "Semana Santa", "Día de la Independencia"],
  "sports": ["béisbol", "basketball"],
  "music": ["merengue", "bachata", "reggaeton"]
}
```

#### Estados Unidos
```json
{
  "food": ["hamburgers", "pizza", "hot dogs", "apple pie"],
  "places": ["New York", "Los Angeles", "Chicago"],
  "traditions": ["Thanksgiving", "Halloween", "Independence Day"],
  "sports": ["football", "basketball", "baseball"],
  "music": ["rock", "pop", "country", "hip-hop"]
}
```

### Prompts Adaptativos

El sistema genera prompts específicos para cada contexto:

```
// República Dominicana
"Genera un juego educativo para niños dominicanos. 
Incluye elementos como: colmado, sancocho, merengue, béisbol..."

// Estados Unidos  
"Generate an educational game for American children.
Include elements like: hamburgers, football, Thanksgiving..."
```

## 🔍 Monitoreo

### Endpoints de API

- `GET /api/cultural-contexts` - Lista contextos disponibles
- `POST /api/cultural-contexts/detect` - Detectar contexto
- `GET /api/cultural-contexts/{id}/elements` - Elementos culturales
- `PUT /api/cultural-contexts/preferences` - Actualizar preferencias

### Logs Importantes

```bash
# Ver contexto actual del usuario
curl -X GET "https://your-app.vercel.app/api/cultural-contexts/user/USER_ID"

# Detectar contexto por ubicación
curl -X POST "https://your-app.vercel.app/api/cultural-contexts/detect" \
  -d '{"userLocation": {"country": "US"}}'
```

## 🎯 Beneficios

1. **Escalabilidad**: Fácil agregar nuevos países
2. **Relevancia**: Contenido culturalmente apropiado
3. **Flexibilidad**: Usuarios pueden elegir contexto
4. **Automatización**: Detección automática
5. **Fallback**: Siempre funciona, incluso sin contexto

## 🔮 Futuras Mejoras

- **Machine Learning**: Mejorar detección automática
- **Contextos Regionales**: Sub-regiones dentro de países
- **Idiomas Múltiples**: Soporte para múltiples idiomas por país
- **Elementos Dinámicos**: Contextos que evolucionan con el tiempo
- **Colaboración**: Contextos creados por la comunidad

## 🛠️ Agregar Nuevo Contexto

### 1. Insertar en Base de Datos

```sql
INSERT INTO cultural_contexts (
  country_code, country_name, language_code,
  cultural_elements, educational_context
) VALUES (
  'AR', 'Argentina', 'es',
  '{"food": ["asado", "empanadas", "dulce de leche"], "places": ["Buenos Aires", "Córdoba"], "traditions": ["Tango", "Día de la Independencia"]}',
  '{"curriculum": "Currículo argentino", "subjects": ["matemáticas", "lengua", "ciencias"]}'
);
```

### 2. Agregar Elementos Culturales

```sql
INSERT INTO cultural_elements (context_id, category, elements)
SELECT id, 'food', '["asado", "empanadas", "dulce de leche"]'::jsonb
FROM cultural_contexts WHERE country_code = 'AR';
```

### 3. Probar Contexto

```bash
# Probar nuevo contexto
./scripts/test-cultural-context.sh
```

El sistema está diseñado para ser completamente escalable y permitir la expansión a cualquier país o cultura del mundo.
