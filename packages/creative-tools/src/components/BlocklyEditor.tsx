import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalGameWrapper } from '@fuzzy/external-games';
import type { ExternalGameConfig, ExternalGameEvent } from '@fuzzy/external-games';

// Blockly Games collection
export interface BlocklyGameData {
  gameId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  programmingConcepts: string[];
  minAge: number;
  maxAge: number;
  estimatedTime: string;
  icon: string;
}

export const BLOCKLY_GAMES: Record<string, BlocklyGameData> = {
  puzzle: {
    gameId: 'puzzle',
    title: 'Rompecabezas',
    description: 'Aprende a arrastrar y conectar bloques para formar un programa.',
    difficulty: 'beginner',
    programmingConcepts: ['Secuencias', 'Arrastrar y soltar'],
    minAge: 4,
    maxAge: 8,
    estimatedTime: '10-15 minutos',
    icon: '🧩',
  },
  maze: {
    gameId: 'maze',
    title: 'Laberinto',
    description: 'Guía al personaje a través del laberinto usando comandos de programación.',
    difficulty: 'beginner',
    programmingConcepts: ['Secuencias', 'Repetición', 'Condicionales'],
    minAge: 6,
    maxAge: 12,
    estimatedTime: '20-30 minutos',
    icon: '🌀',
  },
  bird: {
    gameId: 'bird',
    title: 'Pájaro',
    description: 'Programa un pájaro para que atrape gusanos y evite enemigos.',
    difficulty: 'intermediate',
    programmingConcepts: ['Condicionales', 'Comparaciones', 'Operadores lógicos'],
    minAge: 8,
    maxAge: 14,
    estimatedTime: '30-45 minutos',
    icon: '🐦',
  },
  turtle: {
    gameId: 'turtle',
    title: 'Tortuga Gráfica',
    description: 'Crea arte y formas geométricas programando una tortuga.',
    difficulty: 'intermediate',
    programmingConcepts: ['Bucles', 'Parámetros', 'Funciones', 'Geometría'],
    minAge: 8,
    maxAge: 16,
    estimatedTime: '30-60 minutos',
    icon: '🐢',
  },
  movie: {
    gameId: 'movie',
    title: 'Película',
    description: 'Programa una película corta con actores que se mueven y hablan.',
    difficulty: 'advanced',
    programmingConcepts: ['Eventos', 'Paralelismo', 'Sincronización'],
    minAge: 10,
    maxAge: 16,
    estimatedTime: '45-60 minutos',
    icon: '🎬',
  },
  music: {
    gameId: 'music',
    title: 'Música',
    description: 'Compón música usando bloques de programación y conceptos matemáticos.',
    difficulty: 'advanced',
    programmingConcepts: ['Patrones', 'Matemáticas', 'Bucles anidados'],
    minAge: 10,
    maxAge: 18,
    estimatedTime: '45-90 minutos',
    icon: '🎵',
  },
  pond: {
    gameId: 'pond-tutor',
    title: 'Estanque: Tutorial',
    description: 'Programa un robot para que nade y compita en batallas (modo tutorial).',
    difficulty: 'advanced',
    programmingConcepts: ['Funciones', 'Variables', 'Matemáticas avanzadas'],
    minAge: 12,
    maxAge: 18,
    estimatedTime: '60+ minutos',
    icon: '🤖',
  },
};

interface BlocklyEditorProps {
  gameId: string;
  studentId?: string;
  onEvent?: (event: ExternalGameEvent) => void;
  onComplete?: (data: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
  showInstructions?: boolean;
  autoStart?: boolean;
  language?: 'es' | 'en';
}

export function BlocklyEditor({
  gameId,
  studentId,
  onEvent,
  onComplete,
  onError,
  className,
  style,
  showInstructions = true,
  autoStart = true,
  language = 'es',
}: BlocklyEditorProps) {
  const [gameData, setGameData] = useState<BlocklyGameData | null>(null);
  const [config, setConfig] = useState<ExternalGameConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [codeGenerated, setCodeGenerated] = useState<string>('');

  // Initialize game data and config
  useEffect(() => {
    const game = BLOCKLY_GAMES[gameId];
    if (!game) {
      onError?.(new Error(`Blockly game '${gameId}' not found`));
      return;
    }

    setGameData(game);

    // Create ExternalGameConfig for this Blockly game
    const gameConfig: ExternalGameConfig = {
      source: 'blockly',
      gameId: gameId,
      title: game.title,
      description: game.description,
      url: `https://blockly.games/${gameId}?lang=${language}`,
      allowedOrigins: ['https://blockly.games'],
      trackingEnabled: true,
      sandbox: true,
      ageRange: [game.minAge, game.maxAge],
      subjects: ['Programación', 'Lógica', 'Matemáticas'],
      difficulty: game.difficulty,
      objectives: generateObjectives(game),
    };

    setConfig(gameConfig);
    setIsLoading(false);
  }, [gameId, language, onError]);

  // Enhanced event handler for Blockly-specific tracking
  const handleBlocklyEvent = useCallback((event: ExternalGameEvent) => {
    // Track Blockly-specific programming events
    if (event.metadata.blocklyEvent) {
      const blocklyEventType = event.metadata.blocklyEvent;

      switch (blocklyEventType) {
        case 'level_complete':
          setCurrentLevel(prev => prev + 1);
          break;
        case 'code_generated':
          setCodeGenerated(event.metadata.code || '');
          break;
        case 'block_added':
          console.log('Block added:', event.metadata.blockType);
          break;
        case 'program_run':
          console.log('Program executed with', event.metadata.blockCount, 'blocks');
          break;
      }
    }

    // Generate achievement events
    if (event.action === 'level_complete') {
      const level = event.metadata.level || currentLevel;
      if (level === 1) {
        onEvent?.({
          ...event,
          action: 'achievement',
          metadata: {
            ...event.metadata,
            achievement: 'first_level',
            message: '¡Felicitaciones! Completaste tu primer nivel de programación.',
          },
        });
      } else if (level === 5) {
        onEvent?.({
          ...event,
          action: 'achievement',
          metadata: {
            ...event.metadata,
            achievement: 'problem_solver',
            message: '¡Eres un solucionador de problemas! 5 niveles completados.',
          },
        });
      }
    }

    // Forward all events
    onEvent?.(event);
  }, [currentLevel, onEvent]);

  // Custom completion handler for Blockly games
  const handleBlocklyComplete = useCallback((progress: any) => {
    const completionData = {
      ...progress,
      gameId,
      programmingConcepts: gameData?.programmingConcepts || [],
      levelsCompleted: currentLevel - 1,
      codeGenerated,
      recommendations: generateRecommendations(gameId, progress),
    };

    onComplete?.(completionData);
  }, [gameId, gameData, currentLevel, codeGenerated, onComplete]);

  if (isLoading || !config || !gameData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor Blockly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`blockly-editor-container ${className || ''}`} style={style}>
      {/* Game Information Panel */}
      {showInstructions && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-white rounded-full p-3 text-2xl">
              {gameData.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 text-lg">{gameData.title}</h3>
              <p className="text-green-700 mt-1">{gameData.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span className="font-medium text-green-800">Dificultad:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <DifficultyBadge difficulty={gameData.difficulty} />
                  </div>
                </div>
                <div>
                  <span className="font-medium text-green-800">Tiempo:</span>
                  <div className="text-green-600 mt-1">{gameData.estimatedTime}</div>
                </div>
                <div>
                  <span className="font-medium text-green-800">Edades:</span>
                  <div className="text-green-600 mt-1">{gameData.minAge}-{gameData.maxAge} años</div>
                </div>
                <div>
                  <span className="font-medium text-green-800">Nivel actual:</span>
                  <div className="text-green-600 mt-1 font-semibold">{currentLevel}</div>
                </div>
              </div>

              {/* Programming concepts */}
              <div className="mt-3">
                <span className="font-medium text-green-800 text-sm">Conceptos de programación:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {gameData.programmingConcepts.map((concept, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <details className="mt-3">
                <summary className="cursor-pointer text-green-800 font-medium text-sm">
                  Instrucciones de uso 📖
                </summary>
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <p>• Arrastra los bloques desde la caja de herramientas al espacio de trabajo</p>
                  <p>• Conecta los bloques como piezas de rompecabezas</p>
                  <p>• Presiona el botón "Ejecutar" para ver tu programa en acción</p>
                  <p>• Si algo no funciona, revisa las conexiones entre bloques</p>
                  <p>• ¡Experimenta! Puedes deshacer cambios y probar diferentes soluciones</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Progreso:</span>
          <div className="flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < currentLevel - 1
                    ? 'bg-green-500'
                    : i === currentLevel - 1
                    ? 'bg-yellow-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {codeGenerated && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(codeGenerated);
              // Show success feedback
            }}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
            title="Copiar código generado"
          >
            📋 Copiar código
          </button>
        )}
      </div>

      {/* Blockly Game Wrapper */}
      <ExternalGameWrapper
        config={config}
        studentId={studentId}
        onEvent={handleBlocklyEvent}
        onComplete={handleBlocklyComplete}
        onError={onError}
        className="rounded-lg border border-gray-200 overflow-hidden"
        style={{ minHeight: '600px' }}
      />

      {/* Footer with Blockly credits and tips */}
      <div className="mt-4 space-y-2">
        <div className="text-center text-sm text-gray-500">
          <p>
            Creado con{' '}
            <a
              href="https://blockly.games"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Blockly Games
            </a>{' '}
            por Google
          </p>
        </div>

        {/* Programming tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-medium text-yellow-900 text-sm mb-2">💡 Consejos de programación:</h4>
          <div className="text-xs text-yellow-800 space-y-1">
            <p>• Divide problemas grandes en pasos pequeños</p>
            <p>• Lee cuidadosamente las instrucciones de cada nivel</p>
            <p>• Si te atascas, intenta una solución más simple primero</p>
            <p>• Los errores son normales - ¡son oportunidades de aprender!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for difficulty badge
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const labels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty as keyof typeof colors]}`}>
      {labels[difficulty as keyof typeof labels]}
    </span>
  );
}

// Generate objectives based on game type
function generateObjectives(game: BlocklyGameData) {
  const baseObjectives = [
    {
      id: 'complete-tutorial',
      title: 'Completar tutorial',
      description: 'Aprender los controles básicos y completar la introducción',
      required: true,
      points: 5,
      completionCriteria: { action: 'level_complete', level: 1 },
    },
    {
      id: 'use-all-blocks',
      title: 'Explorar bloques',
      description: 'Usar diferentes tipos de bloques en tus programas',
      required: false,
      points: 10,
      completionCriteria: { action: 'block_variety', minTypes: 3 },
    },
  ];

  // Add game-specific objectives
  const gameSpecificObjectives = {
    maze: [
      {
        id: 'complete-5-levels',
        title: 'Completar 5 niveles',
        description: 'Resolver 5 laberintos consecutivos',
        required: false,
        points: 25,
        completionCriteria: { action: 'level_complete', level: 5 },
      },
    ],
    turtle: [
      {
        id: 'draw-shape',
        title: 'Dibujar forma geométrica',
        description: 'Crear un cuadrado, triángulo o estrella',
        required: false,
        points: 15,
        completionCriteria: { action: 'shape_drawn', complexity: 'medium' },
      },
    ],
    bird: [
      {
        id: 'use-conditionals',
        title: 'Usar condicionales',
        description: 'Implementar lógica if-then en tu programa',
        required: false,
        points: 20,
        completionCriteria: { action: 'conditional_used', count: 1 },
      },
    ],
  };

  return [
    ...baseObjectives,
    ...(gameSpecificObjectives[game.gameId as keyof typeof gameSpecificObjectives] || []),
  ];
}

// Generate personalized recommendations
function generateRecommendations(gameId: string, progress: any): string[] {
  const recommendations: string[] = [];
  const game = BLOCKLY_GAMES[gameId];

  if (!game) return recommendations;

  const levelsCompleted = progress.levelsCompleted || 0;
  const timeSpent = progress.totalTimeSpent / (1000 * 60); // minutes

  // Base recommendations
  if (levelsCompleted < 3) {
    recommendations.push('Continúa practicando para dominar los conceptos básicos.');
  } else if (levelsCompleted >= 5) {
    recommendations.push('¡Excelente progreso! Considera probar un juego más avanzado.');
  }

  // Game-specific recommendations
  if (gameId === 'maze' && levelsCompleted >= 3) {
    recommendations.push('Intenta resolver los niveles usando el menor número de bloques posible.');
  }

  if (gameId === 'turtle' && levelsCompleted >= 2) {
    recommendations.push('Experimenta creando tus propios diseños artísticos.');
  }

  // Time-based recommendations
  if (timeSpent > 60) {
    recommendations.push('Has dedicado mucho tiempo - toma un descanso y vuelve con ideas frescas.');
  }

  // Next steps
  const nextGames = {
    puzzle: ['maze'],
    maze: ['bird', 'turtle'],
    bird: ['movie', 'music'],
    turtle: ['movie', 'music'],
    movie: ['pond'],
    music: ['pond'],
  };

  const suggested = nextGames[gameId as keyof typeof nextGames];
  if (suggested && levelsCompleted >= 3) {
    recommendations.push(`Cuando estés listo, prueba: ${suggested.map(id => BLOCKLY_GAMES[id]?.title).join(', ')}`);
  }

  return recommendations.slice(0, 3);
}