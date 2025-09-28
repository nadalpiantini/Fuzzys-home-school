'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalGameWrapper } from '@fuzzy/external-games';
import type { ExternalGameConfig, ExternalGameEvent } from '@fuzzy/external-games';

// PhET-specific simulation types
export interface PhETSimulationData {
  simId: string;
  title: string;
  description: string;
  subjects: string[];
  gradeLevel: string;
  topics: string[];
  learningGoals: string[];
  accessibility: {
    screenReader: boolean;
    keyboard: boolean;
    sound: boolean;
  };
}

// Popular PhET simulations database
export const PHET_SIMULATIONS: Record<string, PhETSimulationData> = {
  'forces-and-motion-basics': {
    simId: 'forces-and-motion-basics',
    title: 'Fuerzas y Movimiento: Fundamentos',
    description: 'Explora las fuerzas, el movimiento y la fricción en una divertida simulación interactiva.',
    subjects: ['Física', 'Ciencias'],
    gradeLevel: '3-8',
    topics: ['Fuerzas', 'Movimiento', 'Fricción', 'Aceleración'],
    learningGoals: [
      'Identificar cuando las fuerzas están equilibradas vs desequilibradas',
      'Determinar la suma de fuerzas sobre un objeto',
      'Predecir el movimiento de un objeto con fuerzas equilibradas o desequilibradas',
      'Usar diagramas de fuerza para mostrar fuerzas relativas',
    ],
    accessibility: {
      screenReader: true,
      keyboard: true,
      sound: true,
    },
  },
  'fractions-intro': {
    simId: 'fractions-intro',
    title: 'Introducción a las Fracciones',
    description: 'Construye fracciones con formas y números para explorar diferentes representaciones.',
    subjects: ['Matemáticas'],
    gradeLevel: '3-5',
    topics: ['Fracciones', 'Equivalencias', 'Decimales'],
    learningGoals: [
      'Explicar equivalencia de fracciones usando modelos visuales',
      'Comparar fracciones usando <, =, >',
      'Reconocer fracciones equivalentes',
      'Generar representaciones de fracciones',
    ],
    accessibility: {
      screenReader: true,
      keyboard: true,
      sound: false,
    },
  },
  'area-model-algebra': {
    simId: 'area-model-algebra',
    title: 'Modelo de Área: Álgebra',
    description: 'Usa el modelo de área para explorar álgebra básica y factorización.',
    subjects: ['Matemáticas', 'Álgebra'],
    gradeLevel: '6-12',
    topics: ['Álgebra', 'Factorización', 'Polinomios', 'Área'],
    learningGoals: [
      'Reconocer que área = base × altura',
      'Determinar productos de polinomios geométricamente',
      'Factorizar expresiones algebraicas',
      'Aplicar propiedades de operaciones',
    ],
    accessibility: {
      screenReader: true,
      keyboard: true,
      sound: false,
    },
  },
  'circuit-construction-kit-dc': {
    simId: 'circuit-construction-kit-dc',
    title: 'Kit de Construcción de Circuitos: DC',
    description: 'Experimenta con un kit de electrónica! Construye circuitos con resistores, focos y baterías.',
    subjects: ['Física', 'Ciencias'],
    gradeLevel: '6-12',
    topics: ['Circuitos eléctricos', 'Corriente', 'Voltaje', 'Resistencia'],
    learningGoals: [
      'Discutir conceptos básicos de electricidad',
      'Construir circuitos simples',
      'Usar un amperímetro y voltímetro',
      'Aplicar la ley de Ohm para analizar circuitos',
    ],
    accessibility: {
      screenReader: true,
      keyboard: true,
      sound: true,
    },
  },
  'balancing-chemical-equations': {
    simId: 'balancing-chemical-equations',
    title: 'Balanceando Ecuaciones Químicas',
    description: 'Balancea ecuaciones químicas para descubrir patrones y estrategias.',
    subjects: ['Química', 'Ciencias'],
    gradeLevel: '9-12',
    topics: ['Ecuaciones químicas', 'Conservación de la masa', 'Reacciones'],
    learningGoals: [
      'Balancear ecuaciones químicas',
      'Reconocer que el número de átomos de cada elemento se conserva',
      'Describir la diferencia entre coeficientes y subíndices',
      'Traducir representaciones simbólicas de moléculas',
    ],
    accessibility: {
      screenReader: true,
      keyboard: true,
      sound: false,
    },
  },
  'projectile-motion': {
    simId: 'projectile-motion',
    title: 'Movimiento de Proyectiles',
    description: 'Dispara un cañón para explorar el movimiento de proyectiles.',
    subjects: ['Física', 'Ciencias'],
    gradeLevel: '9-12',
    topics: ['Movimiento de proyectiles', 'Vectores', 'Trayectoria'],
    learningGoals: [
      'Determinar que la distancia horizontal depende de la velocidad inicial y el ángulo',
      'Predecir cómo varía el alcance cuando se cambia el ángulo inicial',
      'Explicar conceptos comunes de proyectiles',
      'Usar evidencia para apoyar afirmaciones',
    ],
    accessibility: {
      screenReader: true,
      keyboard: true,
      sound: true,
    },
  },
};

interface PhETSimulationProps {
  simId: string;
  studentId?: string;
  onEvent?: (event: ExternalGameEvent) => void;
  onComplete?: (data: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
  autoStart?: boolean;
  showInfo?: boolean;
}

export function PhETSimulation({
  simId,
  studentId,
  onEvent,
  onComplete,
  onError,
  className,
  style,
  autoStart = true,
  showInfo = true,
}: PhETSimulationProps) {
  const [simData, setSimData] = useState<PhETSimulationData | null>(null);
  const [config, setConfig] = useState<ExternalGameConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionIdRef = useRef<string | null>(null);

  // Initialize simulation data and config
  useEffect(() => {
    const simulation = PHET_SIMULATIONS[simId];
    if (!simulation) {
      onError?.(new Error(`PhET simulation '${simId}' not found`));
      return;
    }

    setSimData(simulation);

    // Create ExternalGameConfig for this simulation
    const gameConfig: ExternalGameConfig = {
      source: 'phet',
      gameId: simId,
      title: simulation.title,
      description: simulation.description,
      url: `https://phet.colorado.edu/sims/html/${simId}/latest/${simId}_es.html`,
      allowedOrigins: ['https://phet.colorado.edu'],
      trackingEnabled: true,
      sandbox: true,
      ageRange: simulation.gradeLevel.includes('-')
        ? simulation.gradeLevel.split('-').map(Number) as [number, number]
        : undefined,
      subjects: simulation.subjects,
      difficulty: 'intermediate',
      objectives: simulation.learningGoals.map((goal, index) => ({
        id: `learning-goal-${index + 1}`,
        title: `Objetivo ${index + 1}`,
        description: goal,
        required: index < 2, // Primeros 2 objetivos son requeridos
        points: 10,
        completionCriteria: { action: 'interaction', minCount: 5 },
      })),
    };

    setConfig(gameConfig);
    setIsLoading(false);
  }, [simId, onError]);

  // Enhanced event handler for PhET-specific tracking
  const handlePhETEvent = useCallback((event: ExternalGameEvent) => {
    // Track PhET-specific interactions
    if (event.action === 'phet-interaction') {
      // Log valuable educational interactions
      console.log('PhET Interaction:', {
        simulation: simId,
        component: event.metadata.component,
        value: event.metadata.value,
        timestamp: event.timestamp,
      });

      // Check for learning milestone achievements
      const interactions = event.metadata.totalInteractions || 0;
      if (interactions > 0 && interactions % 10 === 0) {
        // Student has made 10, 20, 30... interactions
        const milestoneEvent: ExternalGameEvent = {
          ...event,
          action: 'milestone',
          metadata: {
            ...event.metadata,
            milestone: `${interactions}_interactions`,
            message: `¡Excelente! Has explorado ${interactions} aspectos de la simulación.`,
          },
        };
        onEvent?.(milestoneEvent);
      }
    }

    // Forward all events
    onEvent?.(event);
  }, [simId, onEvent]);

  // Custom completion handler for PhET simulations
  const handlePhETComplete = useCallback((progress: any) => {
    const completionData = {
      ...progress,
      simId,
      learningGoalsAchieved: simData?.learningGoals.length || 0,
      accessibilityFeaturesUsed: simData?.accessibility || {},
      recommendations: generateRecommendations(simId, progress),
    };

    onComplete?.(completionData);
  }, [simId, simData, onComplete]);

  if (isLoading || !config || !simData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando simulación PhET...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`phet-simulation-container ${className || ''}`} style={style}>
      {/* Información de la simulación */}
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 rounded-full p-2">
              🧪
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">{simData.title}</h3>
              <p className="text-blue-700 text-sm mt-1">{simData.description}</p>

              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Grado:</span>{' '}
                  <span className="text-blue-600">{simData.gradeLevel}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Temas:</span>{' '}
                  <span className="text-blue-600">{simData.topics.join(', ')}</span>
                </div>
              </div>

              {/* Objetivos de aprendizaje */}
              <details className="mt-3">
                <summary className="cursor-pointer text-blue-800 font-medium text-sm">
                  Objetivos de aprendizaje 📚
                </summary>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  {simData.learningGoals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </details>

              {/* Características de accesibilidad */}
              <div className="flex gap-3 mt-3">
                {simData.accessibility.screenReader && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    🔊 Lector de pantalla
                  </span>
                )}
                {simData.accessibility.keyboard && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    ⌨️ Navegación por teclado
                  </span>
                )}
                {simData.accessibility.sound && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    🔈 Audio
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wrapper de simulación */}
      <ExternalGameWrapper
        config={config}
        studentId={studentId}
        onEvent={handlePhETEvent}
        onComplete={handlePhETComplete}
        onError={onError}
        className="rounded-lg border border-gray-200 overflow-hidden"
        style={{ minHeight: '600px' }}
      />

      {/* Footer con créditos PhET */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>
          Simulación proporcionada por{' '}
          <a
            href="https://phet.colorado.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            PhET Interactive Simulations
          </a>{' '}
          - Universidad de Colorado Boulder
        </p>
        <p className="text-xs mt-1">
          Licenciado bajo{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            CC BY 4.0
          </a>
        </p>
      </div>
    </div>
  );
}

// Helper function to generate personalized recommendations
function generateRecommendations(simId: string, progress: any): string[] {
  const recommendations: string[] = [];
  const simulation = PHET_SIMULATIONS[simId];

  if (!simulation) return recommendations;

  // Base recommendations on completion and interaction patterns
  const completionRate = progress.objectivesCompleted?.length / simulation.learningGoals.length || 0;
  const totalTime = progress.totalTimeSpent / (1000 * 60); // minutes

  if (completionRate < 0.5) {
    recommendations.push('Intenta explorar más componentes de la simulación para completar los objetivos de aprendizaje.');
  }

  if (totalTime < 10) {
    recommendations.push('Dedica más tiempo a experimentar con diferentes configuraciones para comprender mejor los conceptos.');
  }

  // Subject-specific recommendations
  if (simulation.subjects.includes('Física')) {
    recommendations.push('Intenta predecir qué pasará antes de hacer cambios en la simulación.');
    recommendations.push('Observa cómo cambian los gráficos cuando modificas las variables.');
  }

  if (simulation.subjects.includes('Matemáticas')) {
    recommendations.push('Conecta lo que ves en la simulación con las ecuaciones matemáticas.');
    recommendations.push('Prueba casos extremos para entender mejor los patrones.');
  }

  if (simulation.subjects.includes('Química')) {
    recommendations.push('Observa cómo se conserva la masa en las reacciones.');
    recommendations.push('Intenta predecir los productos antes de ver los resultados.');
  }

  // General learning recommendations
  recommendations.push('Discute lo que descubriste con tus compañeros o maestros.');
  recommendations.push('Aplica estos conceptos a situaciones de la vida real.');

  return recommendations.slice(0, 3); // Return top 3 recommendations
}