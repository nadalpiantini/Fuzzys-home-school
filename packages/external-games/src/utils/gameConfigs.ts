import type { ExternalGameConfig } from '../types';

// Configuraciones predefinidas para juegos populares
export const GAME_CONFIGS: Record<string, ExternalGameConfig> = {
  // PhET Simulations
  'phet-forces-motion': {
    source: 'phet',
    gameId: 'forces-and-motion-basics',
    title: 'Fuerzas y Movimiento Básico',
    description: 'Explora las fuerzas, el movimiento y la fricción',
    url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_es.html',
    allowedOrigins: ['https://phet.colorado.edu'],
    trackingEnabled: true,
    ageRange: [8, 14],
    subjects: ['Física', 'Ciencias'],
    difficulty: 'beginner',
    objectives: [
      {
        id: 'understand-force',
        title: 'Entender el concepto de fuerza',
        description: 'Aplicar fuerzas a objetos y observar el movimiento',
        required: true,
        points: 10,
        completionCriteria: { action: 'force-applied', minCount: 5 },
      },
      {
        id: 'friction-experiment',
        title: 'Experimentar con fricción',
        description: 'Cambiar las superficies y observar el efecto en el movimiento',
        required: true,
        points: 15,
        completionCriteria: { action: 'surface-changed', minCount: 3 },
      },
    ],
  },

  'phet-math-fractions': {
    source: 'phet',
    gameId: 'fractions-intro',
    title: 'Introducción a Fracciones',
    description: 'Aprende fracciones con representaciones visuales',
    url: 'https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_es.html',
    allowedOrigins: ['https://phet.colorado.edu'],
    trackingEnabled: true,
    ageRange: [6, 12],
    subjects: ['Matemáticas'],
    difficulty: 'beginner',
    objectives: [
      {
        id: 'create-fractions',
        title: 'Crear fracciones',
        description: 'Crear diferentes fracciones usando formas',
        required: true,
        points: 10,
        completionCriteria: { action: 'fraction-created', minCount: 10 },
      },
    ],
  },

  // Blockly Games
  'blockly-maze': {
    source: 'blockly',
    gameId: 'maze',
    title: 'Laberinto Blockly',
    description: 'Programa al personaje para encontrar la salida del laberinto',
    url: 'https://blockly.games/maze?lang=es',
    allowedOrigins: ['https://blockly.games'],
    trackingEnabled: true,
    ageRange: [8, 16],
    subjects: ['Programación', 'Lógica'],
    difficulty: 'beginner',
    objectives: [
      {
        id: 'complete-level-1',
        title: 'Completar nivel 1',
        description: 'Resolver el primer laberinto',
        required: true,
        points: 5,
        completionCriteria: { action: 'level-completed', level: 1 },
      },
      {
        id: 'complete-level-5',
        title: 'Completar nivel 5',
        description: 'Resolver 5 laberintos consecutivos',
        required: false,
        points: 25,
        completionCriteria: { action: 'level-completed', level: 5 },
      },
    ],
  },

  'blockly-turtle': {
    source: 'blockly',
    gameId: 'turtle',
    title: 'Tortuga Gráfica',
    description: 'Crea arte y formas geométricas programando una tortuga',
    url: 'https://blockly.games/turtle?lang=es',
    allowedOrigins: ['https://blockly.games'],
    trackingEnabled: true,
    ageRange: [8, 16],
    subjects: ['Programación', 'Arte', 'Geometría'],
    difficulty: 'intermediate',
    objectives: [
      {
        id: 'draw-square',
        title: 'Dibujar un cuadrado',
        description: 'Programar la tortuga para dibujar un cuadrado perfecto',
        required: true,
        points: 10,
        completionCriteria: { action: 'shape-drawn', shape: 'square' },
      },
      {
        id: 'draw-star',
        title: 'Dibujar una estrella',
        description: 'Crear una estrella de 5 puntas',
        required: false,
        points: 20,
        completionCriteria: { action: 'shape-drawn', shape: 'star' },
      },
    ],
  },

  // Music Blocks
  'musicblocks-intro': {
    source: 'musicblocks',
    gameId: 'music-blocks',
    title: 'Music Blocks - Introducción',
    description: 'Crea música y aprende conceptos matemáticos',
    url: 'https://musicblocks.sugarlabs.org',
    allowedOrigins: ['https://musicblocks.sugarlabs.org'],
    trackingEnabled: true,
    ageRange: [6, 16],
    subjects: ['Música', 'Matemáticas', 'Programación'],
    difficulty: 'beginner',
    objectives: [
      {
        id: 'first-melody',
        title: 'Crear primera melodía',
        description: 'Componer una melodía simple con bloques',
        required: true,
        points: 15,
        completionCriteria: { action: 'melody-created', minNotes: 4 },
      },
      {
        id: 'rhythm-pattern',
        title: 'Crear patrón rítmico',
        description: 'Experimentar con diferentes duraciones de notas',
        required: false,
        points: 20,
        completionCriteria: { action: 'rhythm-created', complexity: 'medium' },
      },
    ],
  },

  // GCompris Activities
  'gcompris-math': {
    source: 'gcompris',
    gameId: 'gcompris-math-suite',
    title: 'GCompris - Matemáticas',
    description: 'Colección de actividades matemáticas para niños',
    url: 'https://gcompris.net/activity/math',
    allowedOrigins: ['https://gcompris.net'],
    trackingEnabled: true,
    ageRange: [3, 8],
    subjects: ['Matemáticas'],
    difficulty: 'beginner',
    objectives: [
      {
        id: 'counting-exercise',
        title: 'Ejercicio de conteo',
        description: 'Contar objetos correctamente',
        required: true,
        points: 5,
        completionCriteria: { action: 'counting-completed', accuracy: 0.8 },
      },
    ],
  },

  // Sugarizer Activities
  'sugarizer-paint': {
    source: 'sugarizer',
    gameId: 'paint-activity',
    title: 'Sugarizer - Pintura',
    description: 'Actividad de dibujo y pintura digital',
    url: 'https://sugarizer.org/activities/Paint.activity',
    allowedOrigins: ['https://sugarizer.org'],
    trackingEnabled: true,
    ageRange: [4, 12],
    subjects: ['Arte', 'Creatividad'],
    difficulty: 'beginner',
    objectives: [
      {
        id: 'create-drawing',
        title: 'Crear un dibujo',
        description: 'Usar diferentes herramientas para crear arte',
        required: true,
        points: 10,
        completionCriteria: { action: 'drawing-saved', minStrokes: 10 },
      },
    ],
  },
};

// Helper functions
export function getGameConfig(gameId: string): ExternalGameConfig | undefined {
  return GAME_CONFIGS[gameId];
}

export function getGamesBySource(source: string): ExternalGameConfig[] {
  return Object.values(GAME_CONFIGS).filter(config => config.source === source);
}

export function getGamesBySubject(subject: string): ExternalGameConfig[] {
  return Object.values(GAME_CONFIGS).filter(config =>
    config.subjects?.includes(subject)
  );
}

export function getGamesByAgeRange(minAge: number, maxAge: number): ExternalGameConfig[] {
  return Object.values(GAME_CONFIGS).filter(config => {
    if (!config.ageRange) return true;
    const [gameMinAge, gameMaxAge] = config.ageRange;
    return gameMinAge >= minAge && gameMaxAge <= maxAge;
  });
}

export function getGamesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): ExternalGameConfig[] {
  return Object.values(GAME_CONFIGS).filter(config => config.difficulty === difficulty);
}