import type { PhETSimulationData } from '../components/PhETSimulation';
import { PHET_SIMULATIONS } from '../components/PhETSimulation';

// Curriculum organization for Dominican Republic education system
export interface CurriculumUnit {
  id: string;
  title: string;
  description: string;
  gradeLevel: string;
  subject: string;
  duration: string; // e.g., "2 weeks", "1 month"
  simulations: string[]; // PhET simulation IDs
  learningObjectives: string[];
  prerequisites: string[];
  assessmentSuggestions: string[];
}

// Dominican Republic Science Curriculum Units
export const SCIENCE_CURRICULUM: CurriculumUnit[] = [
  {
    id: 'forces-motion-3rd',
    title: 'Fuerzas y Movimiento',
    description: 'Exploración básica de cómo las fuerzas afectan el movimiento de objetos.',
    gradeLevel: '3',
    subject: 'Ciencias Naturales',
    duration: '3 semanas',
    simulations: ['forces-and-motion-basics'],
    learningObjectives: [
      'Identificar que los objetos se mueven cuando se les aplica una fuerza',
      'Reconocer que diferentes fuerzas producen diferentes tipos de movimiento',
      'Explicar cómo la fricción afecta el movimiento',
      'Predecir el movimiento de objetos bajo diferentes condiciones de fuerza',
    ],
    prerequisites: [
      'Concepto básico de empujar y tirar',
      'Observación de objetos en movimiento',
    ],
    assessmentSuggestions: [
      'Simulación guiada con preguntas dirigidas',
      'Dibujo de situaciones de fuerza y movimiento',
      'Experimentos físicos complementarios',
    ],
  },
  {
    id: 'electricity-circuits-6th',
    title: 'Electricidad y Circuitos',
    description: 'Introducción a los conceptos básicos de electricidad y construcción de circuitos simples.',
    gradeLevel: '6',
    subject: 'Ciencias Naturales',
    duration: '4 semanas',
    simulations: ['circuit-construction-kit-dc'],
    learningObjectives: [
      'Identificar los componentes básicos de un circuito eléctrico',
      'Construir circuitos simples con baterías, cables y focos',
      'Explicar la diferencia entre circuitos abiertos y cerrados',
      'Predecir qué sucede cuando se agregan más componentes',
    ],
    prerequisites: [
      'Concepto de energía',
      'Seguridad eléctrica básica',
    ],
    assessmentSuggestions: [
      'Construcción virtual de circuitos específicos',
      'Resolución de problemas de circuitos "rotos"',
      'Diseño de circuitos para situaciones reales',
    ],
  },
  {
    id: 'projectile-motion-9th',
    title: 'Movimiento de Proyectiles',
    description: 'Análisis del movimiento parabólico y factores que lo afectan.',
    gradeLevel: '9',
    subject: 'Física',
    duration: '3 semanas',
    simulations: ['projectile-motion'],
    learningObjectives: [
      'Analizar los componentes horizontal y vertical del movimiento de proyectiles',
      'Predecir el alcance basado en ángulo y velocidad inicial',
      'Explicar por qué la trayectoria es parabólica',
      'Aplicar conceptos a situaciones deportivas y de ingeniería',
    ],
    prerequisites: [
      'Vectores básicos',
      'Cinemática unidimensional',
      'Trigonometría básica',
    ],
    assessmentSuggestions: [
      'Cálculos de alcance y altura máxima',
      'Análisis de deportes como basquetbol o fútbol',
      'Diseño de experimentos de verificación',
    ],
  },
  {
    id: 'chemical-equations-10th',
    title: 'Balanceo de Ecuaciones Químicas',
    description: 'Aplicación de la conservación de la masa en reacciones químicas.',
    gradeLevel: '10',
    subject: 'Química',
    duration: '2 semanas',
    simulations: ['balancing-chemical-equations'],
    learningObjectives: [
      'Aplicar el principio de conservación de la masa',
      'Balancear ecuaciones químicas sistemáticamente',
      'Interpretar coeficientes en términos de moléculas y moles',
      'Predecir productos de reacciones simples',
    ],
    prerequisites: [
      'Símbolos químicos',
      'Concepto de átomo y molécula',
      'Aritmética básica',
    ],
    assessmentSuggestions: [
      'Balanceo de ecuaciones progresivamente más complejas',
      'Interpretación de reacciones de la vida cotidiana',
      'Cálculos estequiométricos básicos',
    ],
  },
];

// Math Curriculum Units
export const MATH_CURRICULUM: CurriculumUnit[] = [
  {
    id: 'fractions-basics-3rd',
    title: 'Introducción a las Fracciones',
    description: 'Comprensión visual y conceptual de las fracciones.',
    gradeLevel: '3',
    subject: 'Matemáticas',
    duration: '4 semanas',
    simulations: ['fractions-intro'],
    learningObjectives: [
      'Representar fracciones con modelos visuales',
      'Comparar fracciones con el mismo denominador',
      'Identificar fracciones equivalentes simples',
      'Relacionar fracciones con situaciones de la vida real',
    ],
    prerequisites: [
      'División básica de objetos en partes iguales',
      'Números enteros',
    ],
    assessmentSuggestions: [
      'Creación de modelos visuales de fracciones',
      'Comparación de fracciones usando <, =, >',
      'Problemas contextualizados con fracciones',
    ],
  },
  {
    id: 'algebra-area-model-8th',
    title: 'Álgebra con Modelos de Área',
    description: 'Uso de representaciones geométricas para comprender álgebra.',
    gradeLevel: '8',
    subject: 'Matemáticas',
    duration: '3 semanas',
    simulations: ['area-model-algebra'],
    learningObjectives: [
      'Conectar álgebra con geometría',
      'Multiplicar polinomios usando modelos de área',
      'Factorizar expresiones algebraicas',
      'Visualizar la propiedad distributiva',
    ],
    prerequisites: [
      'Operaciones con números enteros',
      'Conceptos básicos de variables',
      'Área de rectángulos',
    ],
    assessmentSuggestions: [
      'Representación geométrica de expresiones algebraicas',
      'Factorización de trinomios',
      'Conexión entre área y álgebra',
    ],
  },
];

// Utility functions for curriculum management
export function getCurriculumByGrade(grade: string): CurriculumUnit[] {
  return [...SCIENCE_CURRICULUM, ...MATH_CURRICULUM].filter(
    unit => unit.gradeLevel === grade
  );
}

export function getCurriculumBySubject(subject: string): CurriculumUnit[] {
  return [...SCIENCE_CURRICULUM, ...MATH_CURRICULUM].filter(
    unit => unit.subject.toLowerCase().includes(subject.toLowerCase())
  );
}

export function getSimulationsForUnit(unitId: string): PhETSimulationData[] {
  const unit = [...SCIENCE_CURRICULUM, ...MATH_CURRICULUM].find(
    u => u.id === unitId
  );

  if (!unit) return [];

  return unit.simulations
    .map(simId => PHET_SIMULATIONS[simId])
    .filter(Boolean);
}

export function getRecommendedSequence(gradeLevel: string, subject: string): CurriculumUnit[] {
  const units = [...SCIENCE_CURRICULUM, ...MATH_CURRICULUM].filter(
    unit => unit.gradeLevel === gradeLevel &&
           unit.subject.toLowerCase().includes(subject.toLowerCase())
  );

  // Sort by complexity and prerequisites
  return units.sort((a, b) => {
    // Units with fewer prerequisites come first
    if (a.prerequisites.length !== b.prerequisites.length) {
      return a.prerequisites.length - b.prerequisites.length;
    }

    // Then sort by title
    return a.title.localeCompare(b.title, 'es');
  });
}

export function validatePrerequisites(
  unitId: string,
  completedUnits: string[]
): { isReady: boolean; missingPrerequisites: string[] } {
  const unit = [...SCIENCE_CURRICULUM, ...MATH_CURRICULUM].find(
    u => u.id === unitId
  );

  if (!unit) {
    return { isReady: false, missingPrerequisites: ['Unit not found'] };
  }

  // For this demo, we'll assume prerequisites are met if they're basic concepts
  // In a real implementation, you'd check against completed curriculum units
  const basicConcepts = [
    'concepto básico',
    'números enteros',
    'aritmética básica',
    'observación',
    'seguridad',
  ];

  const missingPrerequisites = unit.prerequisites.filter(
    prereq => !basicConcepts.some(basic =>
      prereq.toLowerCase().includes(basic.toLowerCase())
    ) && !completedUnits.some(completed =>
      prereq.toLowerCase().includes(completed.toLowerCase())
    )
  );

  return {
    isReady: missingPrerequisites.length === 0,
    missingPrerequisites,
  };
}

// Assessment rubric generator
export function generateAssessmentRubric(unitId: string): {
  criteria: string;
  excellent: string;
  proficient: string;
  developing: string;
  beginning: string;
}[] {
  const unit = [...SCIENCE_CURRICULUM, ...MATH_CURRICULUM].find(
    u => u.id === unitId
  );

  if (!unit) return [];

  return unit.learningObjectives.map(objective => ({
    criteria: objective,
    excellent: 'Demuestra comprensión completa y puede aplicar el concepto en situaciones nuevas',
    proficient: 'Demuestra comprensión sólida y puede aplicar el concepto en situaciones similares',
    developing: 'Demuestra comprensión parcial pero necesita apoyo para aplicar el concepto',
    beginning: 'Muestra comprensión limitada y necesita instrucción adicional',
  }));
}