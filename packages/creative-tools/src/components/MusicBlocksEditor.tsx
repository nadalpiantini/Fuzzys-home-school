import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalGameWrapper } from '@fuzzy/external-games';
import type { ExternalGameConfig, ExternalGameEvent } from '@fuzzy/external-games';

// Music concepts and activities
export interface MusicActivity {
  id: string;
  title: string;
  description: string;
  musicConcepts: string[];
  mathConcepts: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  ageRange: [number, number];
  instructions: string[];
  icon: string;
}

export const MUSIC_ACTIVITIES: Record<string, MusicActivity> = {
  'rhythm-patterns': {
    id: 'rhythm-patterns',
    title: 'Patrones Rítmicos',
    description: 'Crea patrones rítmicos usando bloques y explora fracciones musicales.',
    musicConcepts: ['Ritmo', 'Tempo', 'Compás', 'Duración de notas'],
    mathConcepts: ['Fracciones', 'Patrones', 'Secuencias', 'División'],
    difficulty: 'beginner',
    estimatedTime: '20-30 minutos',
    ageRange: [6, 12],
    instructions: [
      'Arrastra bloques de nota al espacio de trabajo',
      'Experimenta con diferentes duraciones (1/4, 1/2, 1/8)',
      'Crea un patrón que se repita',
      'Escucha tu creación y ajústala',
    ],
    icon: '🥁',
  },
  'melody-maker': {
    id: 'melody-maker',
    title: 'Creador de Melodías',
    description: 'Compón melodías simples y aprende sobre escalas y intervalos.',
    musicConcepts: ['Melodía', 'Escalas', 'Intervalos', 'Tono'],
    mathConcepts: ['Secuencias', 'Progresiones', 'Relaciones numéricas'],
    difficulty: 'beginner',
    estimatedTime: '30-45 minutos',
    ageRange: [8, 14],
    instructions: [
      'Selecciona una escala musical (Do mayor es buena para empezar)',
      'Arrastra notas para crear una melodía',
      'Experimenta subiendo y bajando las notas',
      'Combina con ritmos para crear una canción completa',
    ],
    icon: '🎵',
  },
  'math-rhythms': {
    id: 'math-rhythms',
    title: 'Ritmos Matemáticos',
    description: 'Explora la relación entre matemáticas y música a través de divisiones rítmicas.',
    musicConcepts: ['Subdivisiones', 'Polirritmos', 'Métrica'],
    mathConcepts: ['Divisiones', 'Múltiplos', 'MCM', 'Proporciones'],
    difficulty: 'intermediate',
    estimatedTime: '45-60 minutos',
    ageRange: [10, 16],
    instructions: [
      'Crea ritmos usando diferentes divisiones (2, 3, 4)',
      'Superpón ritmos para crear polirritmos',
      'Observa cómo se relacionan matemáticamente',
      'Experimenta con el mínimo común múltiplo',
    ],
    icon: '➗',
  },
  'tone-explorer': {
    id: 'tone-explorer',
    title: 'Explorador de Tonos',
    description: 'Explora frecuencias, ondas sonoras y la física del sonido.',
    musicConcepts: ['Frecuencia', 'Amplitud', 'Timbre', 'Armonía'],
    mathConcepts: ['Ondas', 'Funciones periódicas', 'Logaritmos', 'Razones'],
    difficulty: 'advanced',
    estimatedTime: '60+ minutos',
    ageRange: [12, 18],
    instructions: [
      'Experimenta con osciladores y generadores de onda',
      'Observa cómo la frecuencia afecta el tono',
      'Crea armonías combinando diferentes frecuencias',
      'Explora el concepto de octavas (duplicar frecuencia)',
    ],
    icon: '🌊',
  },
  'composing-suite': {
    id: 'composing-suite',
    title: 'Suite de Composición',
    description: 'Crea composiciones completas combinando múltiples instrumentos y voces.',
    musicConcepts: ['Arreglo', 'Orquestación', 'Armonía', 'Forma musical'],
    mathConcepts: ['Patrones complejos', 'Estructuras', 'Simetría'],
    difficulty: 'advanced',
    estimatedTime: '60-90 minutos',
    ageRange: [12, 18],
    instructions: [
      'Planifica la estructura de tu composición (intro, desarrollo, final)',
      'Asigna diferentes instrumentos a diferentes voces',
      'Crea variaciones de tus temas principales',
      'Experimenta con dinámicas y articulación',
    ],
    icon: '🎼',
  },
};

interface MusicBlocksEditorProps {
  activityId?: string;
  studentId?: string;
  onEvent?: (event: ExternalGameEvent) => void;
  onComplete?: (data: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
  showInstructions?: boolean;
  freePlay?: boolean;
}

export function MusicBlocksEditor({
  activityId = 'rhythm-patterns',
  studentId,
  onEvent,
  onComplete,
  onError,
  className,
  style,
  showInstructions = true,
  freePlay = false,
}: MusicBlocksEditorProps) {
  const [activity, setActivity] = useState<MusicActivity | null>(null);
  const [config, setConfig] = useState<ExternalGameConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [compositionSaved, setCompositionSaved] = useState(false);
  const [blocksUsed, setBlocksUsed] = useState<string[]>([]);

  // Initialize activity data and config
  useEffect(() => {
    if (freePlay) {
      // Free play mode - use Music Blocks directly
      const gameConfig: ExternalGameConfig = {
        source: 'musicblocks',
        gameId: 'music-blocks-free',
        title: 'Music Blocks - Modo Libre',
        description: 'Explora música y programación sin restricciones.',
        url: 'https://musicblocks.sugarlabs.org',
        allowedOrigins: ['https://musicblocks.sugarlabs.org'],
        trackingEnabled: true,
        sandbox: true,
        subjects: ['Música', 'Matemáticas', 'Programación'],
        difficulty: 'intermediate',
        objectives: [
          {
            id: 'create-composition',
            title: 'Crear composición',
            description: 'Componer una pieza musical original',
            required: true,
            points: 20,
            completionCriteria: { action: 'composition_saved', minBlocks: 5 },
          },
        ],
      };

      setConfig(gameConfig);
      setIsLoading(false);
      return;
    }

    const activityData = MUSIC_ACTIVITIES[activityId];
    if (!activityData) {
      onError?.(new Error(`Music activity '${activityId}' not found`));
      return;
    }

    setActivity(activityData);

    // Create ExternalGameConfig for this activity
    const gameConfig: ExternalGameConfig = {
      source: 'musicblocks',
      gameId: `music-blocks-${activityId}`,
      title: `Music Blocks - ${activityData.title}`,
      description: activityData.description,
      url: 'https://musicblocks.sugarlabs.org',
      allowedOrigins: ['https://musicblocks.sugarlabs.org'],
      trackingEnabled: true,
      sandbox: true,
      ageRange: activityData.ageRange,
      subjects: ['Música', 'Matemáticas', 'Programación'],
      difficulty: activityData.difficulty,
      objectives: generateObjectives(activityData),
    };

    setConfig(gameConfig);
    setIsLoading(false);
  }, [activityId, freePlay, onError]);

  // Enhanced event handler for Music Blocks specific tracking
  const handleMusicBlocksEvent = useCallback((event: ExternalGameEvent) => {
    // Track Music Blocks specific events
    if (event.metadata.musicBlocksEvent) {
      const musicEvent = event.metadata.musicBlocksEvent;

      switch (musicEvent) {
        case 'block_added':
          const blockType = event.metadata.blockType;
          if (blockType && !blocksUsed.includes(blockType)) {
            setBlocksUsed(prev => [...prev, blockType]);
          }
          break;
        case 'composition_played':
          console.log('Composition played with', event.metadata.noteCount, 'notes');
          break;
        case 'composition_saved':
          setCompositionSaved(true);
          break;
        case 'tempo_changed':
          console.log('Tempo changed to', event.metadata.tempo, 'BPM');
          break;
      }
    }

    // Generate achievement events for musical milestones
    if (event.action === 'composition_played') {
      const noteCount = event.metadata.noteCount || 0;
      if (noteCount >= 10) {
        onEvent?.({
          ...event,
          action: 'achievement',
          metadata: {
            ...event.metadata,
            achievement: 'composer',
            message: '¡Felicitaciones! Has creado tu primera composición musical.',
          },
        });
      }
    }

    // Track musical learning milestones
    if (blocksUsed.length >= 5 && blocksUsed.length % 5 === 0) {
      onEvent?.({
        ...event,
        action: 'milestone',
        metadata: {
          ...event.metadata,
          milestone: `${blocksUsed.length}_blocks_mastered`,
          message: `¡Excelente! Has explorado ${blocksUsed.length} tipos diferentes de bloques musicales.`,
        },
      });
    }

    // Forward all events
    onEvent?.(event);
  }, [blocksUsed, onEvent]);

  // Custom completion handler
  const handleMusicBlocksComplete = useCallback((progress: any) => {
    const completionData = {
      ...progress,
      activityId: freePlay ? 'free-play' : activityId,
      musicConcepts: activity?.musicConcepts || [],
      mathConcepts: activity?.mathConcepts || [],
      blocksExplored: blocksUsed.length,
      compositionSaved,
      recommendations: generateRecommendations(activityId, progress, blocksUsed),
    };

    onComplete?.(completionData);
  }, [activityId, activity, blocksUsed, compositionSaved, freePlay, onComplete]);

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando Music Blocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`music-blocks-container ${className || ''}`} style={style}>
      {/* Activity Information Panel */}
      {showInstructions && !freePlay && activity && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-white rounded-full p-3 text-2xl">
              {activity.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 text-lg">{activity.title}</h3>
              <p className="text-purple-700 mt-1">{activity.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <span className="font-medium text-purple-800">Dificultad:</span>
                  <div className="mt-1">
                    <DifficultyBadge difficulty={activity.difficulty} />
                  </div>
                </div>
                <div>
                  <span className="font-medium text-purple-800">Tiempo:</span>
                  <div className="text-purple-600 mt-1">{activity.estimatedTime}</div>
                </div>
                <div>
                  <span className="font-medium text-purple-800">Edades:</span>
                  <div className="text-purple-600 mt-1">{activity.ageRange[0]}-{activity.ageRange[1]} años</div>
                </div>
              </div>

              {/* Concepts learned */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <span className="font-medium text-purple-800 text-sm">Conceptos musicales:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {activity.musicConcepts.map((concept, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800"
                      >
                        🎵 {concept}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-purple-800 text-sm">Conceptos matemáticos:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {activity.mathConcepts.map((concept, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        🔢 {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <details className="mt-3">
                <summary className="cursor-pointer text-purple-800 font-medium text-sm">
                  Instrucciones paso a paso 📝
                </summary>
                <ol className="mt-2 text-sm text-purple-700 space-y-1">
                  {activity.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Free Play Mode Header */}
      {freePlay && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="text-center">
            <h3 className="font-semibold text-purple-900 text-lg">🎼 Modo de Exploración Libre</h3>
            <p className="text-purple-700 mt-1">
              Explora Music Blocks sin restricciones. Crea música, experimenta con sonidos y descubre la conexión entre matemáticas y música.
            </p>
          </div>
        </div>
      )}

      {/* Progress and Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{blocksUsed.length}</div>
          <div className="text-sm text-gray-600">Bloques explorados</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-pink-600">
            {compositionSaved ? '✅' : '⏳'}
          </div>
          <div className="text-sm text-gray-600">Composición guardada</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">🎵</div>
          <div className="text-sm text-gray-600">Creando música</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-green-600">📚</div>
          <div className="text-sm text-gray-600">Aprendiendo</div>
        </div>
      </div>

      {/* Music Blocks Wrapper */}
      <ExternalGameWrapper
        config={config}
        studentId={studentId}
        onEvent={handleMusicBlocksEvent}
        onComplete={handleMusicBlocksComplete}
        onError={onError}
        className="rounded-lg border border-gray-200 overflow-hidden"
        style={{ minHeight: '700px' }}
      />

      {/* Footer with Music theory tips and credits */}
      <div className="mt-4 space-y-3">
        {/* Musical tips */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
          <h4 className="font-medium text-purple-900 text-sm mb-2">🎼 Consejos musicales:</h4>
          <div className="text-xs text-purple-800 space-y-1">
            <p>• Comienza con ritmos simples antes de agregar melodías</p>
            <p>• Escucha tu creación frecuentemente para detectar errores</p>
            <p>• No tengas miedo de experimentar - ¡la música es exploración!</p>
            <p>• Las matemáticas están en todas partes: tempo, duración, frecuencias</p>
          </div>
        </div>

        {/* Credits */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Desarrollado por{' '}
            <a
              href="https://musicblocks.sugarlabs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Music Blocks
            </a>{' '}
            - Sugar Labs
          </p>
          <p className="text-xs mt-1">
            Licenciado bajo{' '}
            <a
              href="https://www.gnu.org/licenses/agpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              AGPL v3
            </a>
          </p>
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

// Generate objectives based on activity
function generateObjectives(activity: MusicActivity) {
  const baseObjectives = [
    {
      id: 'explore-interface',
      title: 'Explorar interfaz',
      description: 'Familiarizarse con los controles y herramientas de Music Blocks',
      required: true,
      points: 5,
      completionCriteria: { action: 'blocks_explored', minTypes: 3 },
    },
    {
      id: 'create-sound',
      title: 'Crear sonido',
      description: 'Producir el primer sonido usando bloques',
      required: true,
      points: 10,
      completionCriteria: { action: 'sound_generated', count: 1 },
    },
  ];

  // Activity-specific objectives
  const specificObjectives = {
    'rhythm-patterns': [
      {
        id: 'create-pattern',
        title: 'Crear patrón rítmico',
        description: 'Componer un patrón rítmico que se repita',
        required: true,
        points: 15,
        completionCriteria: { action: 'pattern_created', type: 'rhythm' },
      },
    ],
    'melody-maker': [
      {
        id: 'compose-melody',
        title: 'Componer melodía',
        description: 'Crear una melodía de al menos 8 notas',
        required: true,
        points: 20,
        completionCriteria: { action: 'melody_created', minNotes: 8 },
      },
    ],
    'math-rhythms': [
      {
        id: 'polyrhythm',
        title: 'Crear polirritmo',
        description: 'Superponer dos ritmos diferentes simultáneamente',
        required: false,
        points: 25,
        completionCriteria: { action: 'polyrhythm_created', layers: 2 },
      },
    ],
  };

  return [
    ...baseObjectives,
    ...(specificObjectives[activity.id as keyof typeof specificObjectives] || []),
  ];
}

// Generate personalized recommendations
function generateRecommendations(activityId: string, progress: any, blocksUsed: string[]): string[] {
  const recommendations: string[] = [];
  const activity = MUSIC_ACTIVITIES[activityId];

  if (!activity) return recommendations;

  // Base recommendations
  if (blocksUsed.length < 5) {
    recommendations.push('Explora más tipos de bloques para ampliar tus posibilidades musicales.');
  }

  if (progress.totalTimeSpent && progress.totalTimeSpent < 1000 * 60 * 20) { // less than 20 minutes
    recommendations.push('Dedica más tiempo a experimentar con diferentes combinaciones de sonidos.');
  }

  // Activity-specific recommendations
  if (activityId === 'rhythm-patterns') {
    recommendations.push('Intenta crear ritmos más complejos usando subdivisiones como 1/8 y 1/16.');
  }

  if (activityId === 'melody-maker') {
    recommendations.push('Experimenta con diferentes escalas musicales (menor, pentatónica).');
  }

  if (activityId === 'math-rhythms') {
    recommendations.push('Explora cómo los múltiplos comunes crean patrones repetitivos interesantes.');
  }

  // General musical development
  recommendations.push('Intenta recrear canciones que conozcas para practicar tu oído musical.');
  recommendations.push('Combina ritmo y melodía para crear composiciones más completas.');

  return recommendations.slice(0, 3);
}