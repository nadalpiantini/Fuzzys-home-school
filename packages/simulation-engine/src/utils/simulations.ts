import type { PhETSimulationData } from '../components/PhETSimulation';
import { PHET_SIMULATIONS } from '../components/PhETSimulation';

// Simulation categories for organization
export interface SimulationCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  simulations: string[];
}

export const SIMULATION_CATEGORIES: SimulationCategory[] = [
  {
    id: 'physics-motion',
    title: 'Física: Movimiento',
    description: 'Explora fuerzas, movimiento, velocidad y aceleración',
    icon: '🏃‍♂️',
    color: 'bg-blue-100 text-blue-800',
    simulations: ['forces-and-motion-basics', 'projectile-motion'],
  },
  {
    id: 'physics-electricity',
    title: 'Física: Electricidad',
    description: 'Experimenta con circuitos, corriente y voltaje',
    icon: '⚡',
    color: 'bg-yellow-100 text-yellow-800',
    simulations: ['circuit-construction-kit-dc'],
  },
  {
    id: 'chemistry-reactions',
    title: 'Química: Reacciones',
    description: 'Balancea ecuaciones y explora reacciones químicas',
    icon: '🧪',
    color: 'bg-green-100 text-green-800',
    simulations: ['balancing-chemical-equations'],
  },
  {
    id: 'math-numbers',
    title: 'Matemáticas: Números',
    description: 'Trabaja con fracciones, decimales y operaciones',
    icon: '🔢',
    color: 'bg-purple-100 text-purple-800',
    simulations: ['fractions-intro'],
  },
  {
    id: 'math-algebra',
    title: 'Matemáticas: Álgebra',
    description: 'Explora variables, ecuaciones y funciones',
    icon: '📐',
    color: 'bg-indigo-100 text-indigo-800',
    simulations: ['area-model-algebra'],
  },
];

// Difficulty levels
export type DifficultyLevel = 'elementary' | 'middle' | 'high' | 'advanced';

export interface DifficultyInfo {
  level: DifficultyLevel;
  label: string;
  description: string;
  gradeRange: string;
  color: string;
}

export const DIFFICULTY_LEVELS: Record<DifficultyLevel, DifficultyInfo> = {
  elementary: {
    level: 'elementary',
    label: 'Elemental',
    description: 'Conceptos básicos e introductorios',
    gradeRange: '1-5',
    color: 'bg-green-100 text-green-800',
  },
  middle: {
    level: 'middle',
    label: 'Intermedio',
    description: 'Conceptos de nivel medio con mayor complejidad',
    gradeRange: '6-8',
    color: 'bg-yellow-100 text-yellow-800',
  },
  high: {
    level: 'high',
    label: 'Secundaria',
    description: 'Conceptos avanzados de secundaria',
    gradeRange: '9-12',
    color: 'bg-orange-100 text-orange-800',
  },
  advanced: {
    level: 'advanced',
    label: 'Avanzado',
    description: 'Conceptos universitarios o especializados',
    gradeRange: '12+',
    color: 'bg-red-100 text-red-800',
  },
};

// Utility functions
export function getSimulationsByCategory(categoryId: string): PhETSimulationData[] {
  const category = SIMULATION_CATEGORIES.find(cat => cat.id === categoryId);
  if (!category) return [];

  return category.simulations
    .map(simId => PHET_SIMULATIONS[simId])
    .filter(Boolean);
}

export function getSimulationsBySubject(subject: string): PhETSimulationData[] {
  return Object.values(PHET_SIMULATIONS).filter(sim =>
    sim.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))
  );
}

export function getSimulationsByGradeLevel(gradeLevel: string): PhETSimulationData[] {
  return Object.values(PHET_SIMULATIONS).filter(sim => {
    if (!sim.gradeLevel.includes('-')) {
      return sim.gradeLevel === gradeLevel;
    }

    const [min, max] = sim.gradeLevel.split('-').map(Number);
    const grade = Number(gradeLevel);
    return grade >= min && grade <= max;
  });
}

export function getDifficultyLevel(simulation: PhETSimulationData): DifficultyLevel {
  if (!simulation.gradeLevel.includes('-')) {
    const grade = Number(simulation.gradeLevel);
    if (grade <= 5) return 'elementary';
    if (grade <= 8) return 'middle';
    if (grade <= 12) return 'high';
    return 'advanced';
  }

  const [min] = simulation.gradeLevel.split('-').map(Number);
  if (min <= 5) return 'elementary';
  if (min <= 8) return 'middle';
  if (min <= 12) return 'high';
  return 'advanced';
}

export function searchSimulations(query: string): PhETSimulationData[] {
  const lowercaseQuery = query.toLowerCase();

  return Object.values(PHET_SIMULATIONS).filter(sim =>
    sim.title.toLowerCase().includes(lowercaseQuery) ||
    sim.description.toLowerCase().includes(lowercaseQuery) ||
    sim.topics.some(topic => topic.toLowerCase().includes(lowercaseQuery)) ||
    sim.subjects.some(subject => subject.toLowerCase().includes(lowercaseQuery)) ||
    sim.learningGoals.some(goal => goal.toLowerCase().includes(lowercaseQuery))
  );
}

export function getRecommendedSimulations(
  currentSimId: string,
  studentGrade?: string
): PhETSimulationData[] {
  const currentSim = PHET_SIMULATIONS[currentSimId];
  if (!currentSim) return [];

  // Find simulations with similar subjects or topics
  const related = Object.values(PHET_SIMULATIONS).filter(sim => {
    if (sim.simId === currentSimId) return false;

    // Same subject
    const hasCommonSubject = sim.subjects.some(subject =>
      currentSim.subjects.includes(subject)
    );

    // Similar topics
    const hasCommonTopic = sim.topics.some(topic =>
      currentSim.topics.includes(topic)
    );

    // Appropriate grade level
    let gradeAppropriate = true;
    if (studentGrade) {
      const simGrades = sim.gradeLevel.includes('-')
        ? sim.gradeLevel.split('-').map(Number)
        : [Number(sim.gradeLevel), Number(sim.gradeLevel)];

      const grade = Number(studentGrade);
      gradeAppropriate = grade >= simGrades[0] && grade <= simGrades[1];
    }

    return (hasCommonSubject || hasCommonTopic) && gradeAppropriate;
  });

  // Sort by relevance (more common subjects/topics first)
  return related.sort((a, b) => {
    const aRelevance = a.subjects.filter(s => currentSim.subjects.includes(s)).length +
                      a.topics.filter(t => currentSim.topics.includes(t)).length;
    const bRelevance = b.subjects.filter(s => currentSim.subjects.includes(s)).length +
                      b.topics.filter(t => currentSim.topics.includes(t)).length;

    return bRelevance - aRelevance;
  }).slice(0, 3); // Top 3 recommendations
}

export function generateStudyPlan(
  studentGrade: string,
  subjects: string[],
  duration: 'week' | 'month' | 'semester'
): {
  title: string;
  description: string;
  simulations: { sim: PhETSimulationData; week: number; estimatedTime: string }[];
} {
  const availableSimulations = subjects.flatMap(subject =>
    getSimulationsBySubject(subject)
  ).filter(sim => {
    const simGrades = sim.gradeLevel.includes('-')
      ? sim.gradeLevel.split('-').map(Number)
      : [Number(sim.gradeLevel), Number(sim.gradeLevel)];

    const grade = Number(studentGrade);
    return grade >= simGrades[0] && grade <= simGrades[1];
  });

  // Remove duplicates
  const uniqueSimulations = Array.from(
    new Map(availableSimulations.map(sim => [sim.simId, sim])).values()
  );

  // Sort by difficulty (easier first)
  const sortedSimulations = uniqueSimulations.sort((a, b) => {
    const aDifficulty = getDifficultyLevel(a);
    const bDifficulty = getDifficultyLevel(b);

    const difficultyOrder = ['elementary', 'middle', 'high', 'advanced'];
    return difficultyOrder.indexOf(aDifficulty) - difficultyOrder.indexOf(bDifficulty);
  });

  // Assign to weeks based on duration
  const weeksAvailable = duration === 'week' ? 1 : duration === 'month' ? 4 : 16;
  const simulationsPerWeek = Math.ceil(sortedSimulations.length / weeksAvailable);

  const plan = sortedSimulations.map((sim, index) => ({
    sim,
    week: Math.floor(index / simulationsPerWeek) + 1,
    estimatedTime: getDifficultyLevel(sim) === 'elementary' ? '30-45 minutos' :
                   getDifficultyLevel(sim) === 'middle' ? '45-60 minutos' : '60-90 minutos',
  }));

  return {
    title: `Plan de Estudio - ${subjects.join(', ')} (Grado ${studentGrade})`,
    description: `Plan personalizado de ${duration === 'week' ? '1 semana' : duration === 'month' ? '1 mes' : '1 semestre'}
                  con ${sortedSimulations.length} simulaciones interactivas para reforzar conceptos clave.`,
    simulations: plan,
  };
}

// Analytics helpers
export function getSimulationStats(simId: string): {
  averageTime: number;
  completionRate: number;
  difficulty: DifficultyLevel;
  prerequisites: string[];
  followUps: string[];
} {
  const sim = PHET_SIMULATIONS[simId];
  if (!sim) {
    return {
      averageTime: 0,
      completionRate: 0,
      difficulty: 'elementary',
      prerequisites: [],
      followUps: [],
    };
  }

  const difficulty = getDifficultyLevel(sim);
  const recommendations = getRecommendedSimulations(simId);

  return {
    averageTime: difficulty === 'elementary' ? 35 :
                 difficulty === 'middle' ? 50 : 75, // minutes
    completionRate: 0.85, // 85% average completion rate
    difficulty,
    prerequisites: sim.learningGoals.slice(0, 2), // First 2 as prerequisites
    followUps: recommendations.map(r => r.simId),
  };
}