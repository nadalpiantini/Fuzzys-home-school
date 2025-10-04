# 🌳 Árbol de Navegación Completo - Fuzzy's Home School

## 📱 Estructura Principal de Navegación

### 🏠 **PÁGINA PRINCIPAL** (`/`)
```
┌─────────────────────────────────────────────────────────────┐
│                    FUZZY'S HOME SCHOOL                      │
│  [Logo Fuzzy] + [Bell Notifications] + [Language Toggle]    │
├─────────────────────────────────────────────────────────────┤
│  🎯 HERO SECTION                                            │
│  • Quest del Día (Today's Quest)                           │
│  • Mensajes del Sistema                                     │
│  • Tour de Onboarding                                       │
├─────────────────────────────────────────────────────────────┤
│  🎮 SECCIONES PRINCIPALES                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   STUDENT   │ │   TEACHER   │ │    PARENT   │           │
│  │  Dashboard  │ │  Dashboard  │ │  Dashboard  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    GAMES    │ │   LIBRARY   │ │     AI      │           │
│  │   Portal    │ │   Portal    │ │  Dashboard  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 **ESTUDIANTE** (`/student`)

### Dashboard Principal
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Dashboard del Estudiante" + [Bell] + [Language]  │
├─────────────────────────────────────────────────────────────┤
│  📊 PROGRESO GENERAL                                        │
│  • Puntos Totales: 1,250                                    │
│  • Racha Actual: 7 días                                     │
│  • Nivel: 5                                                 │
│  • Progreso General: 65%                                    │
├─────────────────────────────────────────────────────────────┤
│  🎯 ACCIONES RÁPIDAS                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Preguntar │ │   Jugar     │ │  Biblioteca │           │
│  │   al Tutor  │ │   Juegos    │ │   Digital   │           │
│  │     IA      │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Ver       │ │   Unirse    │ │  Explorar   │           │
│  │  Progreso   │ │   Rally     │ │   Mundos   │           │
│  │             │ │  Colonial   │ │Aprendizaje │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  🌍 MUNDOS DE APRENDIZAJE DISPONIBLES (6)                  │
│  • Mundo de Matemáticas                                     │
│  • Mundo de Ciencias                                        │
│  • Mundo de Lengua                                          │
│  • Mundo de Historia                                        │
│  • Mundo de Arte                                            │
│  • Mundo de Música                                          │
└─────────────────────────────────────────────────────────────┘
```

### Sub-navegación del Estudiante
```
/student/
├── /tutor/                    # Tutor IA
└── /progress/                 # Progreso del Estudiante
```

---

## 👨‍🏫 **PROFESOR** (`/teacher`)

### Dashboard Principal
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Dashboard del Profesor" + [Settings] + [Bell]    │
├─────────────────────────────────────────────────────────────┤
│  📊 ESTADÍSTICAS GENERALES                                  │
│  • Estudiantes Activos: 25                                 │
│  • Contenido Creado: 45                                    │
│  • Juegos Disponibles: 120                                │
│  • Reportes Generados: 8                                   │
├─────────────────────────────────────────────────────────────┤
│  🎯 ACCIONES PRINCIPALES                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Ver       │ │   Crear     │ │   Ver       │           │
│  │  Clases     │ │ Contenido   │ │Analíticas   │           │
│  │             │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Ver       │ │   Crear     │ │   Ver       │           │
│  │  Reportes   │ │  Reportes   │ │ Recursos   │           │
│  │             │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  🛠️ RECURSOS PARA USAR EN CLASE                            │
│  • Scratch (Programación)                                  │
│  • Blockly (Lógica)                                        │
│  • H5P (Contenido Interactivo)                             │
│  • Juegos Externos                                          │
└─────────────────────────────────────────────────────────────┘
```

### Sub-navegación del Profesor
```
/teacher/
├── /classes/                 # Gestión de Clases
├── /content/                 # Gestión de Contenido
│   ├── /create/              # Crear Contenido
│   └── /[id]/                # Ver/Editar Contenido
│       └── /edit/
├── /analytics/               # Analíticas
│   └── /adaptive/            # Analíticas Adaptativas
├── /reports/                 # Reportes
│   └── /create/              # Crear Reportes
├── /resources/               # Recursos
├── /settings/                # Configuración
└── /tasks/                   # Tareas
```

---

## 👨‍👩‍👧‍👦 **PADRES** (`/parent`)

### Dashboard Principal
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Dashboard de Padres" + [Settings] + [Bell]      │
├─────────────────────────────────────────────────────────────┤
│  👨‍👩‍👧‍👦 MIS HIJOS                                        │
│  • María González (Nivel 3, 2,450 pts, Racha 12)         │
│  • Carlos Rodríguez (Nivel 2, 1,890 pts, Racha 8)         │
├─────────────────────────────────────────────────────────────┤
│  📊 PROGRESO GENERAL                                        │
│  • Tiempo Total de Estudio: 45 horas                       │
│  • Actividades Completadas: 120                            │
│  • Puntos Totales: 4,340                                   │
│  • Medallas Ganadas: 15                                    │
├─────────────────────────────────────────────────────────────┤
│  🎯 ACCIONES DISPONIBLES                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Ver       │ │   Ver       │ │   Ver       │           │
│  │  Progreso   │ │  Reportes   │ │  Analíticas │           │
│  │ Individual  │ │ Semanales   │ │    de IA    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Sub-navegación de Padres
```
/parent/
├── /dashboard/               # Dashboard Principal
└── /reports/                 # Reportes de Progreso
```

---

## 🎮 **JUEGOS** (`/games`)

### Portal Principal de Juegos
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Portal de Juegos" + [Search] + [Filter]         │
├─────────────────────────────────────────────────────────────┤
│  🔍 BÚSQUEDA Y FILTROS                                      │
│  • Buscar por nombre                                        │
│  • Filtrar por materia                                      │
│  • Filtrar por dificultad                                   │
│  • Filtrar por tipo de juego                                │
├─────────────────────────────────────────────────────────────┤
│  🎯 CATEGORÍAS DE JUEGOS                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Lógica    │ │  Matemáticas │ │   Lengua    │           │
│  │  y Puzzle   │ │              │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Ciencias  │ │   Historia   │ │   Arte     │           │
│  │             │ │              │ │            │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  🎮 JUEGOS DISPONIBLES (120+)                               │
│  • Memory Cards, Drag & Drop, Quiz, True/False            │
│  • Word Search, Crossword, Timeline                        │
│  • Blockly Games, Scratch Projects                         │
│  • Live Quiz, Team Challenges                              │
└─────────────────────────────────────────────────────────────┘
```

### Sub-navegación de Juegos
```
/games/
├── /drag-drop/               # Drag & Drop
├── /memory-cards/            # Memory Cards
├── /word-search/             # Word Search
├── /crossword/               # Crossword
├── /timeline/                # Timeline
├── /true-false/              # True/False
├── /short-answer/            # Short Answer
├── /gap-fill/                # Gap Fill
├── /match/                   # Matching
├── /hotspot/                 # Hotspot
├── /flashcards/              # Flashcards
├── /math-solver/             # Math Solver
├── /mind-map/                # Mind Map
├── /live-quiz/               # Live Quiz
├── /team-challenge/          # Team Challenge
├── /leadership/              # Leadership
├── /critical-thinking/       # Critical Thinking
├── /research-methods/        # Research Methods
├── /code-challenge/          # Code Challenge
├── /branching-scenario/      # Branching Scenario
├── /blockly-maze/            # Blockly Maze
├── /blockly-bird/            # Blockly Bird
├── /blockly-pond/            # Blockly Pond
├── /blockly-turtle/          # Blockly Turtle
├── /image-sequence/          # Image Sequence
└── /external/                # Juegos Externos
```

---

## 📚 **BIBLIOTECA** (`/library`)

### Portal Principal de Biblioteca
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Biblioteca Digital" + [Search] + [Filter]       │
├─────────────────────────────────────────────────────────────┤
│  🔍 BÚSQUEDA Y FILTROS                                      │
│  • Buscar por título                                        │
│  • Filtrar por materia                                      │
│  • Filtrar por nivel                                        │
│  • Filtrar por tipo de recurso                              │
├─────────────────────────────────────────────────────────────┤
│  📖 MATERIAS DISPONIBLES                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Matemáticas │ │   Ciencias  │ │   Lengua   │           │
│  │             │ │             │ │            │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Historia  │ │     Arte    │ │   Música    │           │
│  │             │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  🎯 ACCESO RÁPIDO                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Juegos    │ │   Tutor     │ │  Recursos   │           │
│  │             │ │     IA      │ │  Externos   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐                                             │
│  │   Rally     │                                             │
│  │  Colonial   │                                             │
│  └─────────────┘                                             │
└─────────────────────────────────────────────────────────────┘
```

### Sub-navegación de Biblioteca
```
/library/
├── /subject/[subjectId]/      # Materia Específica
└── /resource/[subjectId]/[resourceName]/  # Recurso Específico
```

---

## 🧠 **IA DASHBOARD** (`/ai-dashboard`)

### Dashboard de Inteligencia Artificial
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Dashboard de IA" + [Settings] + [Back]          │
├─────────────────────────────────────────────────────────────┤
│  👨‍🎓 SELECCIONAR ESTUDIANTE                                │
│  • María González (Nivel 3, 2,450 pts, Racha 12)         │
│  • Carlos Rodríguez (Nivel 2, 1,890 pts, Racha 8)         │
├─────────────────────────────────────────────────────────────┤
│  📊 TABS DE IA                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Insights  │ │ Análisis de │ │ Contenido   │           │
│  │     de IA   │ │   Perfil    │ │Personalizado│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  🤖 FUNCIONALIDADES DE IA                                   │
│  • Análisis de Patrones de Aprendizaje                     │
│  • Recomendaciones Personalizadas                          │
│  • Detección de Dificultades                               │
│  • Generación de Contenido Adaptativo                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗺️ **MUNDOS DE APRENDIZAJE** (`/learn`)

### Mapa de Mundos de Aprendizaje
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Mundos de Aprendizaje" + [Progress] + [Map]      │
├─────────────────────────────────────────────────────────────┤
│  🌍 MUNDOS DISPONIBLES                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Matemáticas │ │   Ciencias  │ │   Lengua    │           │
│  │   (65%)     │ │    (45%)    │ │   (80%)     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Historia  │ │     Arte    │ │   Música    │           │
│  │   (30%)     │ │    (55%)    │ │   (25%)     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  📊 PROGRESO GENERAL                                        │
│  • Nivel General: 5                                         │
│  • Puntos Totales: 1,250                                    │
│  • Actividades Completadas: 45                              │
│  • Medallas Ganadas: 12                                     │
└─────────────────────────────────────────────────────────────┘
```

### Sub-navegación de Mundos
```
/learn/
├── /map/                     # Mapa de Mundos
│   └── /student/             # Vista del Estudiante
├── /math/                    # Mundo de Matemáticas
│   ├── /level1/              # Nivel 1
│   ├── /level2/              # Nivel 2
│   └── /level3/              # Nivel 3
├── /science/                 # Mundo de Ciencias
│   ├── /level1/              # Nivel 1
│   └── /level2/              # Nivel 2
├── /literacy/                # Mundo de Lengua
│   ├── /level1/              # Nivel 1
│   └── /level2/              # Nivel 2
└── /quest/[id]/              # Quest Específica
```

---

## 🎯 **QUESTS** (`/quest/[id]`)

### Sistema de Quests
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Quest: [Nombre]" + [Progress] + [Timer]         │
├─────────────────────────────────────────────────────────────┤
│  🎯 INFORMACIÓN DE LA QUEST                                │
│  • Título: "Aventura en el Mundo de las Matemáticas"       │
│  • Descripción: "Resuelve problemas y desbloquea secretos" │
│  • Tiempo Límite: 30 minutos                               │
│  • Dificultad: Intermedio                                   │
├─────────────────────────────────────────────────────────────┤
│  🎮 ACTIVIDADES DE LA QUEST                                 │
│  • Actividad 1: Resolver ecuaciones (Completada)          │
│  • Actividad 2: Juego de memoria (En progreso)            │
│  • Actividad 3: Quiz de geometría (Bloqueada)             │
├─────────────────────────────────────────────────────────────┤
│  🏆 RECOMPENSAS                                             │
│  • Puntos: 150                                              │
│  • Medalla: "Matemático Junior"                            │
│  • Desbloqueo: Nuevo mundo                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ **RALLY COLONIAL** (`/colonial-rally`)

### Juego de Rally Colonial
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Rally Colonial" + [Teams] + [Leaderboard]        │
├─────────────────────────────────────────────────────────────┤
│  🗺️ MAPA DEL RALLY                                         │
│  • Punto de Partida: Puerto de Veracruz                   │
│  • Destino: Ciudad de México                               │
│  • Paradas Intermedias: 5                                  │
│  • Distancia Total: 300 km                                 │
├─────────────────────────────────────────────────────────────┤
│  🏃‍♂️ EQUIPOS PARTICIPANTES                                │
│  • Equipo A: "Exploradores" (Líder)                       │
│  • Equipo B: "Conquistadores"                             │
│  • Equipo C: "Pioneros"                                   │
├─────────────────────────────────────────────────────────────┤
│  🎯 ACTIVIDADES POR PARADA                                 │
│  • Parada 1: Quiz de Historia                              │
│  • Parada 2: Juego de Geografía                           │
│  • Parada 3: Timeline de Eventos                           │
│  • Parada 4: Simulación de Viaje                          │
│  • Parada 5: Examen Final                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 **TUTOR IA** (`/tutor`)

### Chat con Tutor IA
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Tutor IA" + [Settings] + [History]             │
├─────────────────────────────────────────────────────────────┤
│  💬 CHAT CON EL TUTOR                                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Estudiante: "¿Puedes ayudarme con las ecuaciones?"     │ │
│  │                                                         │ │
│  │ Tutor IA: "¡Por supuesto! Las ecuaciones son como     │ │
│  │          resolver un misterio. Empecemos con..."      │ │
│  │                                                         │ │
│  │ [Escribir mensaje...]                                   │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  🎯 FUNCIONALIDADES DEL TUTOR                              │
│  • Explicaciones paso a paso                               │
│  • Ejemplos interactivos                                   │
│  • Generación de ejercicios                                │
│  • Análisis de dificultades                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ **ADMINISTRACIÓN** (`/admin`)

### Dashboard de Administración
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] + "Panel de Administración" + [Settings] + [Logout] │
├─────────────────────────────────────────────────────────────┤
│  👥 GESTIÓN DE USUARIOS                                    │
│  • Total de Usuarios: 1,250                               │
│  • Estudiantes Activos: 1,100                            │
│  • Profesores: 100                                         │
│  • Padres: 50                                              │
├─────────────────────────────────────────────────────────────┤
│  📊 ESTADÍSTICAS DEL SISTEMA                               │
│  • Contenido Creado: 500+                                 │
│  • Juegos Disponibles: 120+                               │
│  • Reportes Generados: 1,000+                             │
│  • Uso de IA: 95%                                          │
├─────────────────────────────────────────────────────────────┤
│  🛠️ HERRAMIENTAS DE ADMIN                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Ver       │ │   Ver       │ │   Ver       │           │
│  │  Usuarios   │ │Configuración│ │  Reportes   │           │
│  │             │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Sub-navegación de Administración
```
/admin/
├── /users/                   # Gestión de Usuarios
└── /settings/                # Configuración del Sistema
```

---

## 📱 **DISTRIBUCIÓN DE LA UI ACTUAL**

### Layout Principal
```
┌─────────────────────────────────────────────────────────────┐
│                    HEADER (Fijo)                           │
│  [Logo Fuzzy] + [Título] + [Notificaciones] + [Idioma]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    CONTENIDO PRINCIPAL                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │              ÁREA DE CONTENIDO                          │ │
│  │                                                         │ │
│  │  • Cards de Navegación                                  │ │
│  │  • Secciones Principales                               │ │
│  │  • Contenido Dinámico                                   │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    FOOTER (Opcional)                        │
│  • Enlaces de Ayuda                                        │
│  • Información de Contacto                                │
└─────────────────────────────────────────────────────────────┘
```

### Características de la UI

#### 🎨 **Diseño Visual**
- **Colores Principales**: Verde Barney (Barney Green) + Azul Cielo
- **Tipografías**: Alan Sans (Principal), Caveat Brush (Títulos), Schoolbell (Decorativa)
- **Estilo**: Gamificado, Colorido, Amigable para Niños

#### 📱 **Responsive Design**
- **Mobile First**: Optimizado para dispositivos móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Botones de mínimo 44px, gestos optimizados

#### 🎯 **Componentes Principales**
- **Cards**: Navegación principal, información de progreso
- **Buttons**: Acciones principales, navegación secundaria
- **Progress Bars**: Indicadores de progreso
- **Badges**: Medallas, logros, estados
- **Modals**: Información detallada, configuraciones

#### 🔔 **Sistema de Notificaciones**
- **Bell Icon**: Notificaciones del sistema
- **Message Bar**: Mensajes importantes
- **Toast Messages**: Feedback de acciones
- **Onboarding Tour**: Guía de uso

#### 🌐 **Internacionalización**
- **Idiomas**: Español (Principal), Inglés (Secundario)
- **Language Toggle**: Cambio de idioma en header
- **Contenido Adaptativo**: Textos según idioma seleccionado

---

## 🚀 **FLUJO DE NAVEGACIÓN TÍPICO**

### Para Estudiantes
```
Página Principal → Dashboard Estudiante → Mundo de Aprendizaje → Juego/Actividad → Progreso
```

### Para Profesores
```
Página Principal → Dashboard Profesor → Crear Contenido → Ver Analíticas → Generar Reportes
```

### Para Padres
```
Página Principal → Dashboard Padres → Ver Progreso de Hijos → Reportes → Analíticas de IA
```

---

## 📊 **MÉTRICAS DE NAVEGACIÓN**

- **Total de Páginas**: 50+ páginas principales
- **Total de Juegos**: 120+ juegos disponibles
- **Total de Mundos**: 6 mundos de aprendizaje
- **Total de APIs**: 30+ endpoints
- **Niveles de Navegación**: 3-4 niveles máximo
- **Tiempo de Carga**: < 2 segundos (optimizado)
- **Responsive**: 100% compatible móvil/desktop
