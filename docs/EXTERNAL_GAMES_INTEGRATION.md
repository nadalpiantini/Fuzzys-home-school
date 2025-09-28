# External Games Integration - Fuzzy's Home School

Esta documentación describe la integración completa de recursos educativos open source en Fuzzy's Home School. Hemos añadido soporte para **100+ actividades educativas** de alta calidad, incluyendo simulaciones STEM, programación visual, música creativa y realidad aumentada.

## 🎯 Resumen de la Integración

### Packages Añadidos

| Package | Descripción | Recursos Incluidos |
|---------|-------------|-------------------|
| `@fuzzy/external-games` | Sistema base de tracking y wrapper | Sistema unificado de eventos y progreso |
| `@fuzzy/simulation-engine` | Simulaciones PhET | 20+ simulaciones de física, química y matemáticas |
| `@fuzzy/creative-tools` | Herramientas creativas | Blockly Games + Music Blocks |
| `@fuzzy/vr-ar-adapter` | Experiencias inmersivas | AR Zona Colonial + aulas VR |

### Arquitectura de 3 Capas

```
┌─────────────────────────────────────────────────────┐
│                Integration Layer                    │
│  Sistema unificado de tracking y progreso          │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│                Wrapper Layer                        │
│  Componentes React para embeber recursos           │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│                Package Layer                        │
│  Packages especializados por tipo de recurso       │
└─────────────────────────────────────────────────────┘
```

## 🧪 PhET Simulations (@fuzzy/simulation-engine)

### Simulaciones Disponibles

- **Fuerzas y Movimiento**: Explorar conceptos de física básica
- **Fracciones**: Representaciones visuales de matemáticas
- **Circuitos Eléctricos**: Construcción y análisis de circuitos
- **Ecuaciones Químicas**: Balanceo y conservación de masa
- **Movimiento de Proyectiles**: Análisis de trayectorias

### Uso

```tsx
import { PhETSimulation } from '@fuzzy/simulation-engine';

<PhETSimulation
  simId="forces-and-motion-basics"
  studentId="student-123"
  onEvent={handleEvent}
  onComplete={handleComplete}
  showInfo={true}
/>
```

### Características

- ✅ Objetivos de aprendizaje automáticos
- ✅ Tracking de interacciones
- ✅ Recomendaciones personalizadas
- ✅ Integración curricular
- ✅ Soporte multiidioma (ES/EN)

## 🧩 Creative Tools (@fuzzy/creative-tools)

### Blockly Games

Programación visual progresiva a través de juegos:

- **Rompecabezas**: Introducción a bloques (4-8 años)
- **Laberinto**: Secuencias y repetición (6-12 años)
- **Pájaro**: Condicionales y lógica (8-14 años)
- **Tortuga**: Geometría y bucles (8-16 años)
- **Película**: Eventos y paralelismo (10-16 años)
- **Música**: Patrones matemáticos (10-18 años)

### Music Blocks

Actividades que combinan música y matemáticas:

- **Patrones Rítmicos**: Fracciones musicales
- **Creador de Melodías**: Escalas e intervalos
- **Ritmos Matemáticos**: Polirritmos y divisiones
- **Explorador de Tonos**: Frecuencias y ondas
- **Suite de Composición**: Proyectos completos

### Uso

```tsx
import { BlocklyEditor, MusicBlocksEditor } from '@fuzzy/creative-tools';

// Blockly Games
<BlocklyEditor
  gameId="maze"
  studentId="student-123"
  showInstructions={true}
  language="es"
/>

// Music Blocks
<MusicBlocksEditor
  activityId="rhythm-patterns"
  studentId="student-123"
  freePlay={false}
/>
```

## 🏛️ VR/AR Experiences (@fuzzy/vr-ar-adapter)

### AR Zona Colonial

Experiencia inmersiva de la Zona Colonial de Santo Domingo:

#### Sitios Históricos Incluidos

1. **Catedral Primada de América** (1540)
   - Primera catedral del Nuevo Mundo
   - Modelo 3D interactivo
   - Quiz histórico integrado

2. **Alcázar de Colón** (1514)
   - Palacio virreinal de Diego Colón
   - Arquitectura mudéjar
   - Recorrido virtual

3. **Fortaleza Ozama** (1502)
   - Primera fortificación europea
   - Experiencia defensiva
   - Audio histórico

4. **Casa del Cordón** (1503)
   - Primera casa de piedra
   - Realidad aumentada
   - Contexto arquitectónico

5. **Panteón de la Patria** (1714)
   - De iglesia jesuita a mausoleo
   - Llama eterna virtual
   - Historia dominicana

#### Modos de Experiencia

- **Exploración Libre**: Descubrimiento autónomo
- **Búsqueda del Tesoro**: Misiones guiadas
- **Viaje en el Tiempo**: Múltiples épocas
- **Desafío de Historia**: Quiz interactivo

### Uso

```tsx
import { ColonialZoneAR } from '@fuzzy/vr-ar-adapter';

<ColonialZoneAR
  mode="exploration"
  studentId="student-123"
  language="es"
  enableGPS={false}
  onEvent={handleEvent}
/>
```

## 📊 Sistema de Tracking Unificado

### ExternalGameWrapper Base

Todos los recursos utilizan un wrapper común que proporciona:

- **Tracking de Eventos**: Registro automático de interacciones
- **Sistema de Progreso**: Seguimiento unificado de avance
- **Objetivos Adaptativos**: Metas personalizadas por edad
- **Almacenamiento Persistent**: Integración con Supabase

### Eventos Tracked

```typescript
interface ExternalGameEvent {
  source: ExternalGameSource; // phet, blockly, musicblocks, arjs
  gameId: string;
  action: string; // start, complete, interaction, achievement
  score?: number;
  duration: number;
  timestamp: Date;
  studentId?: string;
  metadata: Record<string, any>;
}
```

### Base de Datos

```sql
-- Nuevas tablas agregadas a Supabase
external_game_configs      -- Configuraciones de juegos
external_game_sessions     -- Sesiones de estudiantes
external_game_events       -- Eventos detallados
student_external_game_progress -- Progreso agregado
external_game_analytics    -- Métricas globales
```

## 🚀 Setup e Instalación

### Instalación Automática

```bash
npm run setup:external-games
```

Este script:
1. Instala dependencias de todos los packages
2. Actualiza configuración de Turbo
3. Ejecuta migraciones de Supabase
4. Genera tipos TypeScript
5. Crea archivos de ejemplo

### Instalación Manual

1. **Instalar dependencias**:
```bash
npm install
```

2. **Construir packages**:
```bash
npm run build
```

3. **Ejecutar migraciones**:
```bash
cd apps/web
npx supabase migration up
```

4. **Configurar variables de entorno**:
```env
NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED=true
NEXT_PUBLIC_PHET_ENABLED=true
NEXT_PUBLIC_BLOCKLY_ENABLED=true
NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED=true
NEXT_PUBLIC_AR_ENABLED=true
```

## 📖 Uso en la Aplicación

### Página de Demostración

Visita `/games/external` para ver todos los recursos integrados en acción.

### Integración en Componentes

```tsx
import {
  PhETSimulation,
  BlocklyEditor,
  MusicBlocksEditor,
  ColonialZoneAR
} from '@fuzzy/external-games';

// Usar en cualquier componente de la app
export function LessonComponent() {
  return (
    <div>
      <PhETSimulation simId="forces-and-motion-basics" />
      <BlocklyEditor gameId="maze" />
      <MusicBlocksEditor activityId="rhythm-patterns" />
      <ColonialZoneAR mode="exploration" />
    </div>
  );
}
```

### Hooks para React Query

```tsx
import {
  useExternalGameConfigs,
  useStudentProgress,
  useGameAnalytics
} from '@fuzzy/external-games';

function StudentDashboard() {
  const { data: configs } = useExternalGameConfigs();
  const { data: progress } = useStudentProgress(studentId);
  const { data: analytics } = useGameAnalytics();

  // Renderizar dashboard...
}
```

## 🎨 Personalización

### Agregar Nuevos Recursos

1. **Definir configuración**:
```tsx
const newGameConfig: ExternalGameConfig = {
  source: 'custom',
  gameId: 'my-game',
  title: 'Mi Juego Educativo',
  url: 'https://mi-juego.com',
  trackingEnabled: true,
  objectives: [...],
};
```

2. **Usar el wrapper**:
```tsx
<ExternalGameWrapper
  config={newGameConfig}
  onEvent={handleEvent}
  onComplete={handleComplete}
/>
```

### Crear Actividades Personalizadas

```tsx
import { PHET_SIMULATIONS } from '@fuzzy/simulation-engine';
import { BLOCKLY_GAMES } from '@fuzzy/creative-tools';
import { COLONIAL_SITES } from '@fuzzy/vr-ar-adapter';

// Acceder a catálogos de recursos
const availableSimulations = PHET_SIMULATIONS;
const availableGames = BLOCKLY_GAMES;
const historicalSites = COLONIAL_SITES;
```

## 📊 Analytics y Reportes

### Dashboard de Progreso

El sistema proporciona métricas detalladas:

- **Tiempo dedicado** por tipo de recurso
- **Objetivos completados** por estudiante
- **Patrones de uso** y preferencias
- **Efectividad educativa** por actividad

### Exportación de Datos

```tsx
import { externalGamesService } from '@fuzzy/external-games';

// Exportar datos de estudiante
const studentData = await externalGamesService.exportStudentData(studentId);

// Obtener analytics globales
const analytics = await externalGamesService.getGameAnalytics();
```

## 🌟 Beneficios Educativos

### Para Estudiantes

- **100+ actividades** educativas de alta calidad
- **Aprendizaje multimodal**: Visual, auditivo, kinestésico
- **Progresión adaptativa** basada en rendimiento
- **Experiencias inmersivas** con AR/VR
- **Conexión interdisciplinaria** (STEAM)

### Para Educadores

- **Tracking automático** de progreso
- **Reportes detallados** de aprendizaje
- **Recursos listos para usar** sin preparación
- **Diferenciación automática** por nivel
- **Integración curricular** completa

### Para la Plataforma

- **Biblioteca expandida** exponencialmente
- **Diversidad de recursos** educativos
- **Calidad garantizada** (recursos curados)
- **Escalabilidad** y sostenibilidad
- **Innovación pedagógica** continua

## 🔧 Troubleshooting

### Problemas Comunes

**Error: "AR no soportado"**
- Verificar permisos de cámara
- Usar HTTPS en producción
- Comprobar compatibilidad del navegador

**Simulaciones PhET no cargan**
- Verificar conexión a internet
- Comprobar configuración de CORS
- Revisar bloqueadores de contenido

**Eventos no se registran**
- Verificar configuración de Supabase
- Comprobar políticas RLS
- Revisar configuración de tracking

### Performance

**Optimización para móviles**:
- Usar `renderScale: 0.8` para AR
- Limitar modelos 3D complejos
- Implementar lazy loading

**Optimización de memoria**:
- Limpiar sesiones antiguas
- Usar `clearOldSessions()` periódicamente
- Configurar límites de eventos

## 🚀 Próximos Pasos

### Roadmap

1. **Q1 2024**: Integración con más recursos de Sugar Labs
2. **Q2 2024**: Soporte para Minetest Education Edition
3. **Q3 2024**: Aulas VR colaborativas con Hubs
4. **Q4 2024**: IA adaptativa para recomendaciones

### Contribuir

Las contribuciones son bienvenidas:

1. Fork del repositorio
2. Crear rama para nueva característica
3. Agregar tests
4. Enviar pull request

## 📞 Soporte

Para soporte técnico:
- Crear issue en GitHub
- Consultar documentación técnica
- Contactar al equipo de desarrollo

---

**¡Disfruta explorando más de 100 recursos educativos de calidad mundial integrados en Fuzzy's Home School! 🌟**