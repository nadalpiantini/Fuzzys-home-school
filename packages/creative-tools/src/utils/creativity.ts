import type { BlocklyGameData } from '../components/BlocklyEditor';
import type { MusicActivity } from '../components/MusicBlocksEditor';
import { BLOCKLY_GAMES } from '../components/BlocklyEditor';
import { MUSIC_ACTIVITIES } from '../components/MusicBlocksEditor';

// Creative learning pathways
export interface CreativeLearningPath {
  id: string;
  title: string;
  description: string;
  targetAge: [number, number];
  duration: string;
  skills: string[];
  activities: {
    type: 'blockly' | 'music' | 'art' | 'storytelling';
    id: string;
    order: number;
    optional: boolean;
  }[];
}

export const CREATIVE_LEARNING_PATHS: CreativeLearningPath[] = [
  {
    id: 'programming-fundamentals',
    title: 'Fundamentos de Programación',
    description: 'Introducción a la programación a través de herramientas visuales y creativas.',
    targetAge: [6, 12],
    duration: '6-8 semanas',
    skills: [
      'Pensamiento lógico',
      'Resolución de problemas',
      'Secuencias y patrones',
      'Depuración básica',
    ],
    activities: [
      { type: 'blockly', id: 'puzzle', order: 1, optional: false },
      { type: 'blockly', id: 'maze', order: 2, optional: false },
      { type: 'music', id: 'rhythm-patterns', order: 3, optional: true },
      { type: 'blockly', id: 'bird', order: 4, optional: false },
      { type: 'blockly', id: 'turtle', order: 5, optional: false },
    ],
  },
  {
    id: 'music-math-connection',
    title: 'Conexión Música-Matemáticas',
    description: 'Explora cómo las matemáticas se manifiestan en la música a través de la programación.',
    targetAge: [8, 16],
    duration: '4-6 semanas',
    skills: [
      'Fracciones musicales',
      'Patrones y secuencias',
      'Proporciones y razones',
      'Pensamiento algorítmico',
    ],
    activities: [
      { type: 'music', id: 'rhythm-patterns', order: 1, optional: false },
      { type: 'music', id: 'melody-maker', order: 2, optional: false },
      { type: 'music', id: 'math-rhythms', order: 3, optional: false },
      { type: 'blockly', id: 'music', order: 4, optional: true },
      { type: 'music', id: 'composing-suite', order: 5, optional: true },
    ],
  },
  {
    id: 'advanced-programming',
    title: 'Programación Avanzada',
    description: 'Conceptos avanzados de programación para estudiantes experimentados.',
    targetAge: [12, 18],
    duration: '8-10 semanas',
    skills: [
      'Funciones y parámetros',
      'Variables y estado',
      'Eventos y paralelismo',
      'Estructuras de datos básicas',
    ],
    activities: [
      { type: 'blockly', id: 'turtle', order: 1, optional: false },
      { type: 'blockly', id: 'movie', order: 2, optional: false },
      { type: 'music', id: 'tone-explorer', order: 3, optional: true },
      { type: 'blockly', id: 'pond', order: 4, optional: false },
      { type: 'music', id: 'composing-suite', order: 5, optional: true },
    ],
  },
  {
    id: 'creative-expression',
    title: 'Expresión Creativa Digital',
    description: 'Usa la tecnología como medio para la expresión artística y creativa.',
    targetAge: [8, 16],
    duration: '6-8 semanas',
    skills: [
      'Diseño visual',
      'Composición musical',
      'Narrativa digital',
      'Estética computacional',
    ],
    activities: [
      { type: 'blockly', id: 'turtle', order: 1, optional: false },
      { type: 'music', id: 'melody-maker', order: 2, optional: false },
      { type: 'blockly', id: 'movie', order: 3, optional: false },
      { type: 'music', id: 'composing-suite', order: 4, optional: false },
    ],
  },
];

// Assessment rubrics for creative skills
export interface CreativeSkillRubric {
  skill: string;
  description: string;
  levels: {
    level: 1 | 2 | 3 | 4;
    title: string;
    description: string;
    indicators: string[];
  }[];
}

export const CREATIVE_SKILL_RUBRICS: CreativeSkillRubric[] = [
  {
    skill: 'Pensamiento Computacional',
    description: 'Capacidad de descomponer problemas y crear soluciones algorítmicas.',
    levels: [
      {
        level: 1,
        title: 'Emergente',
        description: 'Comienza a reconocer patrones y secuencias simples',
        indicators: [
          'Puede seguir instrucciones paso a paso',
          'Reconoce secuencias repetitivas básicas',
          'Entiende causa y efecto en acciones simples',
        ],
      },
      {
        level: 2,
        title: 'Desarrollándose',
        description: 'Identifica patrones y crea secuencias básicas',
        indicators: [
          'Crea secuencias de comandos cortas',
          'Identifica y corrige errores simples',
          'Reconoce patrones en diferentes contextos',
        ],
      },
      {
        level: 3,
        title: 'Competente',
        description: 'Descompone problemas y usa estructuras de control',
        indicators: [
          'Usa bucles y condicionales apropiadamente',
          'Descompone problemas complejos en partes',
          'Planifica antes de implementar soluciones',
        ],
      },
      {
        level: 4,
        title: 'Avanzado',
        description: 'Crea soluciones elegantes y optimizadas',
        indicators: [
          'Optimiza código para eficiencia',
          'Crea funciones reutilizables',
          'Anticipa y maneja casos extremos',
        ],
      },
    ],
  },
  {
    skill: 'Creatividad Musical',
    description: 'Habilidad para crear, experimentar y expresarse a través de la música.',
    levels: [
      {
        level: 1,
        title: 'Explorador',
        description: 'Experimenta con sonidos y ritmos básicos',
        indicators: [
          'Produce sonidos usando herramientas digitales',
          'Reconoce diferencias entre sonidos',
          'Muestra curiosidad por experimentar',
        ],
      },
      {
        level: 2,
        title: 'Creador',
        description: 'Crea patrones rítmicos y melódicos simples',
        indicators: [
          'Crea patrones rítmicos repetitivos',
          'Compone melodías cortas',
          'Combina diferentes elementos sonoros',
        ],
      },
      {
        level: 3,
        title: 'Compositor',
        description: 'Desarrolla ideas musicales coherentes y estructuradas',
        indicators: [
          'Crea composiciones con estructura clara',
          'Experimenta con dinámicas y texturas',
          'Integra conceptos matemáticos en la música',
        ],
      },
      {
        level: 4,
        title: 'Artista',
        description: 'Crea obras musicales originales con intención expresiva',
        indicators: [
          'Desarrolla un estilo personal reconocible',
          'Usa la tecnología de manera innovadora',
          'Comunica emociones e ideas a través de la música',
        ],
      },
    ],
  },
];

// Utility functions for creative learning management
export function getRecommendedPath(age: number, interests: string[]): CreativeLearningPath | null {
  const suitablePaths = CREATIVE_LEARNING_PATHS.filter(
    path => age >= path.targetAge[0] && age <= path.targetAge[1]
  );

  if (suitablePaths.length === 0) return null;

  // Score paths based on interests
  const scoredPaths = suitablePaths.map(path => {
    const interestScore = interests.reduce((score, interest) => {
      if (path.skills.some(skill => skill.toLowerCase().includes(interest.toLowerCase()))) {
        return score + 1;
      }
      if (path.title.toLowerCase().includes(interest.toLowerCase())) {
        return score + 2;
      }
      return score;
    }, 0);

    return { path, score: interestScore };
  });

  // Return path with highest score, or first if tied
  scoredPaths.sort((a, b) => b.score - a.score);
  return scoredPaths[0].path;
}

export function getPathProgress(
  pathId: string,
  completedActivities: { type: string; id: string }[]
): {
  totalActivities: number;
  completedActivities: number;
  currentActivity: { type: string; id: string } | null;
  nextActivity: { type: string; id: string } | null;
  progress: number;
} {
  const path = CREATIVE_LEARNING_PATHS.find(p => p.id === pathId);
  if (!path) {
    return {
      totalActivities: 0,
      completedActivities: 0,
      currentActivity: null,
      nextActivity: null,
      progress: 0,
    };
  }

  const requiredActivities = path.activities.filter(a => !a.optional);
  const completedCount = requiredActivities.filter(activity =>
    completedActivities.some(
      completed => completed.type === activity.type && completed.id === activity.id
    )
  ).length;

  // Find current/next activity
  const nextRequiredActivity = requiredActivities
    .sort((a, b) => a.order - b.order)
    .find(activity =>
      !completedActivities.some(
        completed => completed.type === activity.type && completed.id === activity.id
      )
    );

  return {
    totalActivities: requiredActivities.length,
    completedActivities: completedCount,
    currentActivity: nextRequiredActivity || null,
    nextActivity: nextRequiredActivity || null,
    progress: (completedCount / requiredActivities.length) * 100,
  };
}

export function assessCreativeSkill(
  skill: string,
  evidence: {
    blocksUsed?: number;
    levelsCompleted?: number;
    compositionsCreated?: number;
    timeSpent?: number;
    errorsFixed?: number;
    originalityScore?: number;
  }
): { level: number; feedback: string; nextSteps: string[] } {
  const rubric = CREATIVE_SKILL_RUBRICS.find(r => r.skill === skill);
  if (!rubric) {
    return {
      level: 1,
      feedback: 'Habilidad no encontrada en el sistema de evaluación.',
      nextSteps: ['Continúa practicando y experimentando.'],
    };
  }

  let level = 1;

  // Assess based on evidence
  if (skill === 'Pensamiento Computacional') {
    if (evidence.blocksUsed && evidence.blocksUsed >= 20 && evidence.levelsCompleted && evidence.levelsCompleted >= 10) {
      level = 4;
    } else if (evidence.blocksUsed && evidence.blocksUsed >= 10 && evidence.levelsCompleted && evidence.levelsCompleted >= 5) {
      level = 3;
    } else if (evidence.levelsCompleted && evidence.levelsCompleted >= 3) {
      level = 2;
    }
  } else if (skill === 'Creatividad Musical') {
    if (evidence.compositionsCreated && evidence.compositionsCreated >= 5 && evidence.originalityScore && evidence.originalityScore >= 0.8) {
      level = 4;
    } else if (evidence.compositionsCreated && evidence.compositionsCreated >= 3) {
      level = 3;
    } else if (evidence.compositionsCreated && evidence.compositionsCreated >= 1) {
      level = 2;
    }
  }

  const levelData = rubric.levels.find(l => l.level === level);
  const nextLevel = rubric.levels.find(l => l.level === level + 1);

  return {
    level,
    feedback: `${levelData?.title}: ${levelData?.description}`,
    nextSteps: nextLevel?.indicators.slice(0, 2) || ['Continúa practicando para mejorar.'],
  };
}

export function generateCreativeChallenge(
  type: 'blockly' | 'music',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  theme?: string
): {
  title: string;
  description: string;
  objectives: string[];
  timeLimit?: number;
  resources: string[];
} {
  const challenges = {
    blockly: {
      beginner: [
        {
          title: 'Laberinto Mágico',
          description: 'Crea un programa para guiar al personaje a través de un laberinto usando solo movimientos básicos.',
          objectives: [
            'Llegar al final del laberinto',
            'Usar máximo 15 bloques',
            'No repetir código innecesariamente',
          ],
          timeLimit: 20,
          resources: ['Bloques de movimiento', 'Bloques de repetición'],
        },
        {
          title: 'Artista Geométrico',
          description: 'Programa la tortuga para dibujar figuras geométricas perfectas.',
          objectives: [
            'Dibujar un cuadrado perfecto',
            'Dibujar un triángulo equilátero',
            'Usar bucles para eficiencia',
          ],
          timeLimit: 25,
          resources: ['Bloques de movimiento', 'Bloques de giro', 'Bloques de repetición'],
        },
      ],
      intermediate: [
        {
          title: 'Cazador Inteligente',
          description: 'Programa un pájaro que tome decisiones inteligentes para cazar gusanos.',
          objectives: [
            'Capturar todos los gusanos',
            'Evitar obstáculos',
            'Usar condicionales efectivamente',
          ],
          timeLimit: 30,
          resources: ['Bloques condicionales', 'Bloques de sensores', 'Bloques de movimiento'],
        },
      ],
      advanced: [
        {
          title: 'Director de Cine',
          description: 'Crea una animación corta con múltiples personajes y sincronización.',
          objectives: [
            'Coordinar al menos 3 personajes',
            'Usar eventos para sincronización',
            'Crear una historia coherente',
          ],
          timeLimit: 45,
          resources: ['Bloques de eventos', 'Bloques de apariencia', 'Bloques de sonido'],
        },
      ],
    },
    music: {
      beginner: [
        {
          title: 'Compositor de Ritmos',
          description: 'Crea un ritmo pegajoso usando diferentes duraciones de nota.',
          objectives: [
            'Usar al menos 3 duraciones diferentes',
            'Crear un patrón que se repita',
            'Duración mínima de 8 compases',
          ],
          timeLimit: 20,
          resources: ['Bloques de nota', 'Bloques de duración', 'Bloques de repetición'],
        },
      ],
      intermediate: [
        {
          title: 'Matemático Musical',
          description: 'Explora la relación entre fracciones y duraciones musicales.',
          objectives: [
            'Crear patrones usando fracciones (1/2, 1/4, 1/8)',
            'Experimentar con polirritmos',
            'Explicar la relación matemática',
          ],
          timeLimit: 35,
          resources: ['Bloques de división', 'Múltiples voces', 'Calculadora de ritmos'],
        },
      ],
      advanced: [
        {
          title: 'Sinfonía Digital',
          description: 'Compón una pieza musical completa con múltiples instrumentos.',
          objectives: [
            'Usar al menos 4 instrumentos diferentes',
            'Crear estructura con intro, desarrollo y final',
            'Implementar variaciones temáticas',
          ],
          timeLimit: 60,
          resources: ['Múltiples voces', 'Efectos de audio', 'Bloques de control de volumen'],
        },
      ],
    },
  };

  const typeChallenges = challenges[type][difficulty];
  const selectedChallenge = typeChallenges[Math.floor(Math.random() * typeChallenges.length)];

  // Customize based on theme if provided
  if (theme) {
    selectedChallenge.title = `${selectedChallenge.title} - ${theme}`;
    selectedChallenge.description = `${selectedChallenge.description} Tema: ${theme}.`;
  }

  return selectedChallenge;
}

// Portfolio and showcase utilities
export function generateCreativePortfolio(
  studentId: string,
  completedActivities: {
    type: 'blockly' | 'music';
    id: string;
    completedAt: Date;
    score?: number;
    timeSpent: number;
    artifacts?: string[]; // URLs to saved projects
  }[]
): {
  summary: {
    totalProjects: number;
    totalTimeSpent: number;
    favoriteType: 'blockly' | 'music' | 'balanced';
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  highlights: {
    type: 'blockly' | 'music';
    title: string;
    description: string;
    completedAt: Date;
    artifact?: string;
  }[];
  recommendations: string[];
} {
  const totalTimeSpent = completedActivities.reduce((sum, activity) => sum + activity.timeSpent, 0);
  const blocklyCount = completedActivities.filter(a => a.type === 'blockly').length;
  const musicCount = completedActivities.filter(a => a.type === 'music').length;

  const favoriteType = blocklyCount > musicCount ? 'blockly' : musicCount > blocklyCount ? 'music' : 'balanced';

  // Determine skill level based on variety and complexity
  let skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  if (completedActivities.length >= 10 && totalTimeSpent > 5 * 60 * 60 * 1000) { // 5+ hours
    skillLevel = 'advanced';
  } else if (completedActivities.length >= 5) {
    skillLevel = 'intermediate';
  }

  // Generate highlights (best projects)
  const highlights = completedActivities
    .filter(activity => activity.score && activity.score > 80)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 3)
    .map(activity => {
      const data = activity.type === 'blockly' ? BLOCKLY_GAMES[activity.id] : MUSIC_ACTIVITIES[activity.id];
      return {
        type: activity.type,
        title: data?.title || activity.id,
        description: data?.description || 'Proyecto completado exitosamente',
        completedAt: activity.completedAt,
        artifact: activity.artifacts?.[0],
      };
    });

  // Generate recommendations
  const recommendations: string[] = [];
  if (skillLevel === 'beginner') {
    recommendations.push('Continúa explorando los fundamentos de programación y música.');
  } else if (skillLevel === 'intermediate') {
    recommendations.push('Considera trabajar en proyectos más complejos y colaborativos.');
  } else {
    recommendations.push('¡Excelente trabajo! Considera enseñar a otros estudiantes.');
  }

  if (favoriteType === 'blockly') {
    recommendations.push('Explora cómo la programación se conecta con la música y el arte.');
  } else if (favoriteType === 'music') {
    recommendations.push('Investiga cómo la programación puede expandir tus posibilidades musicales.');
  }

  return {
    summary: {
      totalProjects: completedActivities.length,
      totalTimeSpent,
      favoriteType,
      skillLevel,
    },
    highlights,
    recommendations,
  };
}