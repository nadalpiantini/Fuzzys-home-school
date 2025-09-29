import { GameTemplate, GameContent, GameType } from './types';

// Game Templates based on the educational repositories mentioned
export const gameTemplates: Record<GameType, GameTemplate> = {
  // Traditional Quiz Types
  'multiple-choice': {
    type: 'multiple-choice',
    name: 'Opción Múltiple',
    description: 'Preguntas con múltiples opciones de respuesta',
    category: 'Assessment',
    ageRange: '6-18',
    subjects: ['math', 'science', 'language', 'history', 'geography'],
    features: ['scoring', 'explanation', 'difficulty-levels'],
    template: () => ({
      type: 'multiple-choice',
      theme: 'quiz',
      difficulty: 'medium',
      questions: [
        {
          id: '1',
          question: '¿Cuál es la capital de Francia?',
          type: 'multiple-choice',
          options: ['Londres', 'París', 'Madrid', 'Roma'],
          correct: 1,
          explanation: 'París es la capital de Francia',
          points: 10,
          difficulty: 'easy',
          tags: ['geography', 'capitals'],
        },
      ],
    }),
  },

  'true-false': {
    type: 'true-false',
    name: 'Verdadero o Falso',
    description: 'Preguntas de verdadero o falso',
    category: 'Assessment',
    ageRange: '6-18',
    subjects: ['math', 'science', 'language', 'history'],
    features: ['quick-assessment', 'binary-choice'],
    template: () => ({
      type: 'true-false',
      theme: 'quiz',
      difficulty: 'medium',
      questions: [
        {
          id: '1',
          question: 'El agua hierve a 100°C a nivel del mar',
          type: 'true-false',
          correct: 'true',
          explanation: 'Correcto, el agua hierve a 100°C a nivel del mar',
          points: 5,
          difficulty: 'easy',
          tags: ['science', 'physics'],
        },
      ],
    }),
  },

  'fill-blank': {
    type: 'fill-blank',
    name: 'Completar Espacios',
    description: 'Completar espacios en blanco en textos',
    category: 'Language',
    ageRange: '8-18',
    subjects: ['language', 'literature', 'grammar'],
    features: ['text-completion', 'context-learning'],
    template: () => ({
      type: 'fill-blank',
      theme: 'language',
      difficulty: 'medium',
      questions: [
        {
          id: '1',
          question: 'La ___ es el astro rey que ilumina nuestro planeta',
          type: 'fill-blank',
          correct: 'sol',
          explanation: 'El sol es la estrella que ilumina la Tierra',
          points: 10,
          difficulty: 'easy',
          tags: ['language', 'vocabulary'],
        },
      ],
    }),
  },

  'short-answer': {
    type: 'short-answer',
    name: 'Respuesta Corta',
    description: 'Preguntas que requieren respuestas cortas',
    category: 'Assessment',
    ageRange: '8-18',
    subjects: ['math', 'science', 'language', 'history'],
    features: ['open-ended', 'creative-thinking'],
    template: () => ({
      type: 'short-answer',
      theme: 'quiz',
      difficulty: 'medium',
      questions: [
        {
          id: '1',
          question: '¿Qué es la fotosíntesis?',
          type: 'short-answer',
          correct:
            'proceso por el cual las plantas convierten la luz solar en energía',
          explanation:
            'La fotosíntesis es el proceso que permite a las plantas crear su alimento',
          points: 15,
          difficulty: 'medium',
          tags: ['science', 'biology'],
        },
      ],
    }),
  },

  // Interactive Types
  'drag-drop': {
    type: 'drag-drop',
    name: 'Arrastrar y Soltar',
    description: 'Clasificar elementos arrastrándolos a categorías',
    category: 'Interactive',
    ageRange: '4-16',
    subjects: ['math', 'science', 'language', 'art'],
    features: ['visual-learning', 'categorization', 'motor-skills'],
    template: () => ({
      type: 'drag-drop',
      theme: 'classification',
      difficulty: 'medium',
      items: [
        { id: '1', name: 'Círculo', type: 'shape', category: 'redondas' },
        { id: '2', name: 'Cuadrado', type: 'shape', category: 'cuadradas' },
        { id: '3', name: 'Triángulo', type: 'shape', category: 'puntas' },
      ],
      categories: ['redondas', 'cuadradas', 'puntas'],
    }),
  },

  hotspot: {
    type: 'hotspot',
    name: 'Zonas Interactivas',
    description: 'Hacer clic en áreas específicas de una imagen',
    category: 'Interactive',
    ageRange: '6-18',
    subjects: ['science', 'geography', 'history', 'anatomy'],
    features: ['visual-identification', 'spatial-learning'],
    template: () => ({
      type: 'hotspot',
      theme: 'anatomy',
      difficulty: 'medium',
      items: [
        { id: '1', name: 'Corazón', type: 'organ', position: { x: 50, y: 30 } },
        {
          id: '2',
          name: 'Pulmones',
          type: 'organ',
          position: { x: 30, y: 40 },
        },
        { id: '3', name: 'Hígado', type: 'organ', position: { x: 60, y: 50 } },
      ],
    }),
  },

  sequence: {
    type: 'sequence',
    name: 'Ordenar Secuencias',
    description: 'Ordenar elementos en secuencia lógica',
    category: 'Logic',
    ageRange: '6-18',
    subjects: ['math', 'science', 'history', 'language'],
    features: ['logical-thinking', 'chronology', 'process-understanding'],
    template: () => ({
      type: 'sequence',
      theme: 'process',
      difficulty: 'medium',
      items: [
        { id: '1', name: 'Plantar semilla', order: 1 },
        { id: '2', name: 'Regar', order: 2 },
        { id: '3', name: 'Ver crecer', order: 3 },
        { id: '4', name: 'Cosechar', order: 4 },
      ],
    }),
  },

  matching: {
    type: 'matching',
    name: 'Emparejar',
    description: 'Conectar elementos relacionados',
    category: 'Interactive',
    ageRange: '6-18',
    subjects: ['language', 'math', 'science', 'history'],
    features: ['association', 'pattern-recognition'],
    template: () => ({
      type: 'matching',
      theme: 'vocabulary',
      difficulty: 'medium',
      items: [
        { id: '1', name: 'Perro', match: 'dog' },
        { id: '2', name: 'Gato', match: 'cat' },
        { id: '3', name: 'Casa', match: 'house' },
      ],
    }),
  },

  'memory-cards': {
    type: 'memory-cards',
    name: 'Memoria',
    description: 'Juego de memoria con tarjetas',
    category: 'Memory',
    ageRange: '4-16',
    subjects: ['language', 'math', 'science', 'art'],
    features: ['memory-training', 'visual-recognition'],
    template: () => ({
      type: 'memory-cards',
      theme: 'animals',
      difficulty: 'easy',
      cards: [
        { id: '1', front: '🐶', back: 'Perro', pair: 1 },
        { id: '2', front: '🐱', back: 'Gato', pair: 2 },
        { id: '3', front: '🐶', back: 'Perro', pair: 1 },
        { id: '4', front: '🐱', back: 'Gato', pair: 2 },
      ],
    }),
  },

  // Programming Types (Blockly Games inspired)
  'blockly-puzzle': {
    type: 'blockly-puzzle',
    name: 'Rompecabezas de Bloques',
    description: 'Resolver puzzles usando bloques de programación',
    category: 'Programming',
    ageRange: '6-16',
    subjects: ['programming', 'logic', 'math'],
    features: ['visual-programming', 'problem-solving', 'algorithmic-thinking'],
    template: () => ({
      type: 'blockly-puzzle',
      theme: 'programming',
      difficulty: 'medium',
      blocks: [
        { id: '1', type: 'move', color: 'blue', function: 'moveForward' },
        { id: '2', type: 'turn', color: 'green', function: 'turnLeft' },
        { id: '3', type: 'repeat', color: 'orange', function: 'repeat' },
      ],
    }),
  },

  'blockly-maze': {
    type: 'blockly-maze',
    name: 'Laberinto de Bloques',
    description: 'Navegar por un laberinto usando bloques',
    category: 'Programming',
    ageRange: '6-16',
    subjects: ['programming', 'logic', 'spatial'],
    features: ['spatial-reasoning', 'algorithmic-thinking'],
    template: () => ({
      type: 'blockly-maze',
      theme: 'maze',
      difficulty: 'medium',
      blocks: [
        { id: '1', type: 'move', color: 'blue', function: 'moveForward' },
        { id: '2', type: 'turn', color: 'green', function: 'turnRight' },
        { id: '3', type: 'if', color: 'purple', function: 'ifPath' },
      ],
    }),
  },

  'scratch-project': {
    type: 'scratch-project',
    name: 'Proyecto Scratch',
    description: 'Crear animaciones y juegos con Scratch',
    category: 'Programming',
    ageRange: '8-18',
    subjects: ['programming', 'art', 'math', 'science'],
    features: ['creative-programming', 'multimedia', 'storytelling'],
    template: () => ({
      type: 'scratch-project',
      theme: 'animation',
      difficulty: 'medium',
      blocks: [
        { id: '1', type: 'motion', color: 'blue', function: 'move' },
        { id: '2', type: 'looks', color: 'purple', function: 'changeCostume' },
        { id: '3', type: 'sound', color: 'pink', function: 'playSound' },
      ],
    }),
  },

  'turtle-blocks': {
    type: 'turtle-blocks',
    name: 'Bloques de Tortuga',
    description: 'Dibujar con programación de tortuga',
    category: 'Programming',
    ageRange: '6-16',
    subjects: ['programming', 'art', 'math', 'geometry'],
    features: ['geometric-programming', 'artistic-expression'],
    template: () => ({
      type: 'turtle-blocks',
      theme: 'drawing',
      difficulty: 'medium',
      blocks: [
        { id: '1', type: 'forward', color: 'blue', function: 'forward' },
        { id: '2', type: 'turn', color: 'green', function: 'turn' },
        { id: '3', type: 'pen', color: 'red', function: 'penDown' },
      ],
    }),
  },

  // Creative Types (Music Blocks inspired)
  'music-blocks': {
    type: 'music-blocks',
    name: 'Bloques Musicales',
    description: 'Crear música con bloques de programación',
    category: 'Creative',
    ageRange: '8-18',
    subjects: ['music', 'programming', 'math'],
    features: ['musical-creation', 'rhythm-learning', 'mathematical-patterns'],
    template: () => ({
      type: 'music-blocks',
      theme: 'music',
      difficulty: 'medium',
      blocks: [
        { id: '1', type: 'note', color: 'blue', function: 'playNote' },
        { id: '2', type: 'rhythm', color: 'green', function: 'setRhythm' },
        { id: '3', type: 'scale', color: 'purple', function: 'setScale' },
      ],
    }),
  },

  'story-creator': {
    type: 'story-creator',
    name: 'Creador de Historias',
    description: 'Crear historias interactivas',
    category: 'Creative',
    ageRange: '8-18',
    subjects: ['language', 'literature', 'creativity'],
    features: ['storytelling', 'creative-writing', 'narrative-structure'],
    template: () => ({
      type: 'story-creator',
      theme: 'storytelling',
      difficulty: 'medium',
      scenarios: [
        {
          id: '1',
          title: 'Aventura en el Bosque',
          description: 'Crea una historia sobre una aventura en el bosque',
          environment: 'forest',
          characters: [
            {
              id: '1',
              name: 'Protagonista',
              role: 'hero',
              personality: 'valiente',
            },
          ],
          objectives: [
            {
              id: '1',
              title: 'Encontrar el tesoro',
              description: 'Buscar el tesoro perdido',
              type: 'collect',
              points: 100,
              completed: false,
            },
          ],
          resources: [
            {
              id: '1',
              name: 'Mapa',
              type: 'document',
              url: '/resources/map.png',
            },
          ],
        },
      ],
    }),
  },

  // Simulation Types (PhET inspired)
  'physics-sim': {
    type: 'physics-sim',
    name: 'Simulación de Física',
    description: 'Experimentar con conceptos de física',
    category: 'Simulation',
    ageRange: '10-18',
    subjects: ['physics', 'science', 'math'],
    features: [
      'interactive-experiments',
      'visual-learning',
      'concept-exploration',
    ],
    template: () => ({
      type: 'physics-sim',
      theme: 'physics',
      difficulty: 'medium',
      scenarios: [
        {
          id: '1',
          title: 'Gravedad y Movimiento',
          description: 'Explora cómo la gravedad afecta el movimiento',
          environment: 'physics-lab',
          objectives: [
            {
              id: '1',
              title: 'Lanzar objeto',
              description: 'Lanza un objeto y observa su trayectoria',
              type: 'explore',
              points: 50,
              completed: false,
            },
          ],
          resources: [
            {
              id: '1',
              name: 'Simulador de Gravedad',
              type: 'simulation',
              url: '/sims/gravity',
            },
          ],
        },
      ],
    }),
  },

  'chemistry-lab': {
    type: 'chemistry-lab',
    name: 'Laboratorio de Química',
    description: 'Experimentar con reacciones químicas',
    category: 'Simulation',
    ageRange: '12-18',
    subjects: ['chemistry', 'science'],
    features: ['safe-experimentation', 'reaction-visualization'],
    template: () => ({
      type: 'chemistry-lab',
      theme: 'chemistry',
      difficulty: 'medium',
      scenarios: [
        {
          id: '1',
          title: 'Reacción Ácido-Base',
          description: 'Mezcla diferentes sustancias y observa las reacciones',
          environment: 'chemistry-lab',
          objectives: [
            {
              id: '1',
              title: 'Crear reacción',
              description: 'Mezcla ácido con base',
              type: 'explore',
              points: 75,
              completed: false,
            },
          ],
          resources: [
            {
              id: '1',
              name: 'Simulador de Química',
              type: 'simulation',
              url: '/sims/chemistry',
            },
          ],
        },
      ],
    }),
  },

  // AR/VR Types
  'ar-explorer': {
    type: 'ar-explorer',
    name: 'Explorador AR',
    description: 'Explorar el mundo con realidad aumentada',
    category: 'AR/VR',
    ageRange: '8-18',
    subjects: ['geography', 'history', 'science', 'art'],
    features: [
      'immersive-learning',
      'spatial-exploration',
      'real-world-connection',
    ],
    template: () => ({
      type: 'ar-explorer',
      theme: 'exploration',
      difficulty: 'medium',
      scenarios: [
        {
          id: '1',
          title: 'Exploración Histórica',
          description: 'Explora lugares históricos con AR',
          environment: 'historical-site',
          objectives: [
            {
              id: '1',
              title: 'Encontrar monumentos',
              description: 'Localiza 5 monumentos históricos',
              type: 'explore',
              points: 100,
              completed: false,
            },
          ],
          resources: [
            {
              id: '1',
              name: 'Cámara AR',
              type: 'simulation',
              url: '/ar/camera',
            },
          ],
        },
      ],
    }),
  },

  // Assessment Types
  'adaptive-quiz': {
    type: 'adaptive-quiz',
    name: 'Quiz Adaptativo',
    description: 'Quiz que se adapta al nivel del estudiante',
    category: 'Assessment',
    ageRange: '8-18',
    subjects: ['math', 'science', 'language', 'history'],
    features: [
      'adaptive-difficulty',
      'personalized-learning',
      'progress-tracking',
    ],
    template: () => ({
      type: 'adaptive-quiz',
      theme: 'adaptive',
      difficulty: 'dynamic',
      questions: [
        {
          id: '1',
          question: 'Pregunta adaptativa',
          type: 'multiple-choice',
          options: ['A', 'B', 'C', 'D'],
          correct: 1,
          explanation: 'Explicación adaptativa',
          points: 10,
          difficulty: 'adaptive',
          tags: ['adaptive', 'personalized'],
        },
      ],
    }),
  },

  competition: {
    type: 'competition',
    name: 'Competencia en Vivo',
    description: 'Competir con otros estudiantes en tiempo real',
    category: 'Social',
    ageRange: '8-18',
    subjects: ['math', 'science', 'language', 'history'],
    features: ['real-time-competition', 'leaderboards', 'social-learning'],
    template: () => ({
      type: 'competition',
      theme: 'competition',
      difficulty: 'medium',
      questions: [
        {
          id: '1',
          question: 'Pregunta de competencia',
          type: 'multiple-choice',
          options: ['A', 'B', 'C', 'D'],
          correct: 1,
          explanation: 'Explicación rápida',
          points: 10,
          difficulty: 'medium',
          tags: ['competition', 'real-time'],
        },
      ],
    }),
  },

  // Language Learning
  'vocabulary-builder': {
    type: 'vocabulary-builder',
    name: 'Constructor de Vocabulario',
    description: 'Aprender vocabulario de manera interactiva',
    category: 'Language',
    ageRange: '6-18',
    subjects: ['language', 'vocabulary'],
    features: ['spaced-repetition', 'visual-learning', 'audio-support'],
    template: () => ({
      type: 'vocabulary-builder',
      theme: 'vocabulary',
      difficulty: 'medium',
      cards: [
        {
          id: '1',
          front: 'Casa',
          back: 'House',
          audio: '/audio/casa.mp3',
          category: 'basic',
        },
        {
          id: '2',
          front: 'Perro',
          back: 'Dog',
          audio: '/audio/perro.mp3',
          category: 'animals',
        },
      ],
    }),
  },

  // STEM Types
  'coding-challenge': {
    type: 'coding-challenge',
    name: 'Desafío de Programación',
    description: 'Resolver problemas de programación',
    category: 'STEM',
    ageRange: '10-18',
    subjects: ['programming', 'computer-science', 'logic'],
    features: ['problem-solving', 'algorithmic-thinking', 'code-execution'],
    template: () => ({
      type: 'coding-challenge',
      theme: 'programming',
      difficulty: 'medium',
      challenges: [
        {
          id: '1',
          title: 'Suma de Números',
          description: 'Escribe una función que sume dos números',
          type: 'coding',
          difficulty: 'easy',
          timeLimit: 300,
          hints: ['Usa el operador +', 'Retorna el resultado'],
          solution: 'function suma(a, b) { return a + b; }',
        },
      ],
    }),
  },

  // Social Learning
  'discussion-forum': {
    type: 'discussion-forum',
    name: 'Foro de Discusión',
    description: 'Participar en discusiones educativas',
    category: 'Social',
    ageRange: '12-18',
    subjects: ['language', 'history', 'science', 'philosophy'],
    features: ['collaborative-learning', 'critical-thinking', 'communication'],
    template: () => ({
      type: 'discussion-forum',
      theme: 'discussion',
      difficulty: 'medium',
      scenarios: [
        {
          id: '1',
          title: 'Debate sobre Cambio Climático',
          description: 'Participa en un debate sobre el cambio climático',
          environment: 'virtual-classroom',
          objectives: [
            {
              id: '1',
              title: 'Presentar argumentos',
              description: 'Presenta 3 argumentos sólidos',
              type: 'collaborate',
              points: 100,
              completed: false,
            },
          ],
          resources: [
            {
              id: '1',
              name: 'Recursos sobre Cambio Climático',
              type: 'document',
              url: '/resources/climate-change.pdf',
            },
          ],
        },
      ],
    }),
  },

  // Gamification
  'achievement-system': {
    type: 'achievement-system',
    name: 'Sistema de Logros',
    description: 'Ganar logros por completar actividades',
    category: 'Gamification',
    ageRange: '6-18',
    subjects: ['all'],
    features: ['motivation', 'progress-tracking', 'recognition'],
    template: () => ({
      type: 'achievement-system',
      theme: 'achievements',
      difficulty: 'variable',
      challenges: [
        {
          id: '1',
          title: 'Primer Quiz Completado',
          description: 'Completa tu primer quiz',
          type: 'creative',
          difficulty: 'easy',
          timeLimit: undefined,
          hints: ['Completa cualquier quiz'],
          solution: null,
        },
      ],
    }),
  },
};

export function getGameTemplate(type: GameType): GameTemplate {
  return gameTemplates[type];
}

export function getAllTemplates(): GameTemplate[] {
  return Object.values(gameTemplates);
}

export function getTemplatesByCategory(category: string): GameTemplate[] {
  return Object.values(gameTemplates).filter(
    (template) => template.category === category,
  );
}

export function getTemplatesBySubject(subject: string): GameTemplate[] {
  return Object.values(gameTemplates).filter((template) =>
    template.subjects.includes(subject),
  );
}
