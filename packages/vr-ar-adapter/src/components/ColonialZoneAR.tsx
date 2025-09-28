import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalGameWrapper } from '@fuzzy/external-games';
import type { ExternalGameConfig, ExternalGameEvent } from '@fuzzy/external-games';

// Colonial Zone historical sites and AR markers
export interface ColonialSite {
  id: string;
  name: string;
  description: string;
  category: 'religious' | 'governmental' | 'residential' | 'defensive' | 'cultural';
  yearBuilt: number;
  architecturalStyle: string;
  historicalSignificance: string;
  funFacts: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  arMarker: {
    type: 'pattern' | 'barcode' | 'location';
    value: string;
    size?: number;
  };
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  virtualContent: {
    model3D?: string;
    audio?: string;
    video?: string;
    images: string[];
  };
}

export const COLONIAL_SITES: Record<string, ColonialSite> = {
  'catedral-primada': {
    id: 'catedral-primada',
    name: 'Catedral Primada de América',
    description: 'La primera catedral construida en las Américas, símbolo del poder religioso colonial.',
    category: 'religious',
    yearBuilt: 1540,
    architecturalStyle: 'Gótico tardío y Renacentista',
    historicalSignificance: 'Primera sede episcopal del Nuevo Mundo, albergó los restos de Cristóbal Colón.',
    funFacts: [
      'Fue la primera catedral construida en América',
      'Albergó los restos de Cristóbal Colón por más de 300 años',
      'Su construcción tomó 70 años en completarse',
      'Es Patrimonio de la Humanidad de la UNESCO',
    ],
    coordinates: { lat: 18.4734, lng: -69.8825 },
    arMarker: { type: 'pattern', value: 'catedral-pattern', size: 1 },
    quiz: [
      {
        question: '¿En qué año se completó la construcción de la Catedral?',
        options: ['1510', '1540', '1580', '1600'],
        correctAnswer: 1,
        explanation: 'La Catedral Primada se completó en 1540, siendo la primera catedral terminada en América.',
      },
      {
        question: '¿Qué estilo arquitectónico predomina en la Catedral?',
        options: ['Barroco', 'Gótico tardío', 'Colonial', 'Neoclásico'],
        correctAnswer: 1,
        explanation: 'La Catedral combina elementos góticos tardíos con influencias renacentistas.',
      },
    ],
    virtualContent: {
      model3D: '/models/catedral-primada.glb',
      audio: '/audio/catedral-bells.mp3',
      images: ['/images/catedral-interior.jpg', '/images/catedral-facade.jpg'],
    },
  },
  'alcazar-colon': {
    id: 'alcazar-colon',
    name: 'Alcázar de Colón',
    description: 'Palacio virreinal construido por Diego Colón, hijo de Cristóbal Colón.',
    category: 'residential',
    yearBuilt: 1514,
    architecturalStyle: 'Mudéjar tardío',
    historicalSignificance: 'Residencia del primer virrey de América y centro del poder colonial.',
    funFacts: [
      'Fue construido sin usar un solo clavo',
      'Diego Colón vivió aquí con su esposa María de Toledo',
      'Es el primer palacio virreinal de América',
      'Tiene 22 habitaciones distribuidas en dos plantas',
    ],
    coordinates: { lat: 18.4737, lng: -69.8823 },
    arMarker: { type: 'pattern', value: 'alcazar-pattern', size: 1 },
    quiz: [
      {
        question: '¿Quién construyó el Alcázar de Colón?',
        options: ['Cristóbal Colón', 'Diego Colón', 'Bartolomé Colón', 'Fernando Colón'],
        correctAnswer: 1,
        explanation: 'Diego Colón, hijo de Cristóbal Colón, construyó este palacio como su residencia virreinal.',
      },
      {
        question: '¿Qué característica constructiva tiene el Alcázar?',
        options: ['Uso de clavos de oro', 'Construido sin clavos', 'Hecho de mármol', 'Con torres defensivas'],
        correctAnswer: 1,
        explanation: 'El Alcázar fue construido usando técnicas de ensamblaje sin clavos, típicas de la arquitectura mudéjar.',
      },
    ],
    virtualContent: {
      model3D: '/models/alcazar-colon.glb',
      audio: '/audio/colonial-music.mp3',
      images: ['/images/alcazar-courtyard.jpg', '/images/alcazar-rooms.jpg'],
    },
  },
  'fortaleza-ozama': {
    id: 'fortaleza-ozama',
    name: 'Fortaleza Ozama',
    description: 'La más antigua fortificación europea en América, guardiana del río Ozama.',
    category: 'defensive',
    yearBuilt: 1502,
    architecturalStyle: 'Militar medieval',
    historicalSignificance: 'Primera fortaleza europea en América, protegía la entrada a la ciudad.',
    funFacts: [
      'Es la fortaleza europea más antigua de América',
      'Su Torre del Homenaje mide 18 metros de altura',
      'Servía como prisión para piratas y enemigos',
      'Nicolás de Ovando ordenó su construcción',
    ],
    coordinates: { lat: 18.4741, lng: -69.8817 },
    arMarker: { type: 'pattern', value: 'fortaleza-pattern', size: 1 },
    quiz: [
      {
        question: '¿En qué año se comenzó la construcción de la Fortaleza Ozama?',
        options: ['1500', '1502', '1505', '1510'],
        correctAnswer: 1,
        explanation: 'La construcción de la Fortaleza Ozama comenzó en 1502 por orden de Nicolás de Ovando.',
      },
      {
        question: '¿Cuál era la función principal de la fortaleza?',
        options: ['Residencia real', 'Proteger el puerto', 'Centro religioso', 'Mercado'],
        correctAnswer: 1,
        explanation: 'La Fortaleza Ozama protegía la entrada al puerto y a la ciudad desde el río Ozama.',
      },
    ],
    virtualContent: {
      model3D: '/models/fortaleza-ozama.glb',
      audio: '/audio/cannon-sounds.mp3',
      images: ['/images/fortaleza-tower.jpg', '/images/fortaleza-walls.jpg'],
    },
  },
  'casa-cordón': {
    id: 'casa-cordón',
    name: 'Casa del Cordón',
    description: 'La casa de piedra más antigua del continente americano.',
    category: 'residential',
    yearBuilt: 1503,
    architecturalStyle: 'Gótico isabelino',
    historicalSignificance: 'Primera casa de piedra de América, residencia de familias nobles.',
    funFacts: [
      'Es la casa de piedra más antigua de América',
      'Diego Colón vivió aquí antes del Alcázar',
      'Su nombre viene del cordón franciscano tallado en la fachada',
      'Albergó la primera audiencia real de América',
    ],
    coordinates: { lat: 18.4728, lng: -69.8830 },
    arMarker: { type: 'pattern', value: 'casa-cordon-pattern', size: 1 },
    quiz: [
      {
        question: '¿Por qué se llama Casa del Cordón?',
        options: ['Por un cordón de oro', 'Por el cordón franciscano en su fachada', 'Por estar cerca del puerto', 'Por su forma'],
        correctAnswer: 1,
        explanation: 'Su nombre proviene del cordón franciscano tallado en piedra en su fachada principal.',
      },
    ],
    virtualContent: {
      model3D: '/models/casa-cordon.glb',
      images: ['/images/casa-cordon-facade.jpg', '/images/casa-cordon-interior.jpg'],
    },
  },
  'panteon-patria': {
    id: 'panteon-patria',
    name: 'Panteón de la Patria',
    description: 'Mausoleo nacional que guarda los restos de los héroes dominicanos.',
    category: 'cultural',
    yearBuilt: 1714,
    architecturalStyle: 'Barroco colonial (originalmente iglesia jesuita)',
    historicalSignificance: 'Transformado de iglesia a panteón nacional, símbolo de la identidad dominicana.',
    funFacts: [
      'Originalmente fue la Iglesia de los Jesuitas',
      'Se convirtió en Panteón Nacional en 1958',
      'Guarda los restos de Juan Pablo Duarte',
      'Tiene una llama eterna que nunca se apaga',
    ],
    coordinates: { lat: 18.4743, lng: -69.8835 },
    arMarker: { type: 'pattern', value: 'panteon-pattern', size: 1 },
    quiz: [
      {
        question: '¿Qué era originalmente el Panteón de la Patria?',
        options: ['Un palacio', 'Una iglesia jesuita', 'Una fortaleza', 'Un mercado'],
        correctAnswer: 1,
        explanation: 'El Panteón era originalmente la Iglesia de los Jesuitas, construida en 1714.',
      },
    ],
    virtualContent: {
      model3D: '/models/panteon-patria.glb',
      audio: '/audio/solemn-music.mp3',
      images: ['/images/panteon-interior.jpg', '/images/panteon-flame.jpg'],
    },
  },
};

// AR Experience modes
export type ARExperienceMode = 'exploration' | 'treasure-hunt' | 'time-travel' | 'quiz-challenge';

interface ColonialZoneARProps {
  mode?: ARExperienceMode;
  studentId?: string;
  onEvent?: (event: ExternalGameEvent) => void;
  onComplete?: (data: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
  language?: 'es' | 'en';
  enableGPS?: boolean;
}

export function ColonialZoneAR({
  mode = 'exploration',
  studentId,
  onEvent,
  onComplete,
  onError,
  className,
  style,
  language = 'es',
  enableGPS = false,
}: ColonialZoneARProps) {
  const [config, setConfig] = useState<ExternalGameConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sitesVisited, setSitesVisited] = useState<string[]>([]);
  const [currentQuizScore, setCurrentQuizScore] = useState(0);
  const [arSupported, setArSupported] = useState(true);

  // Initialize AR experience config
  useEffect(() => {
    // Check AR support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setArSupported(false);
      onError?.(new Error('AR no está soportado en este dispositivo'));
      return;
    }

    // Create configuration based on mode
    const gameConfig: ExternalGameConfig = {
      source: 'arjs',
      gameId: `colonial-zone-ar-${mode}`,
      title: `Zona Colonial AR - ${getModeTitle(mode)}`,
      description: getModeDescription(mode),
      url: createARExperienceURL(mode, language, enableGPS),
      allowedOrigins: ['http://localhost:3000', 'https://yourapp.com'], // Update with your domain
      trackingEnabled: true,
      sandbox: false, // AR needs full permissions
      ageRange: [8, 18],
      subjects: ['Historia', 'Cultura', 'Geografía', 'Arte'],
      difficulty: mode === 'exploration' ? 'beginner' : mode === 'quiz-challenge' ? 'advanced' : 'intermediate',
      objectives: generateObjectives(mode),
    };

    setConfig(gameConfig);
    setIsLoading(false);
  }, [mode, language, enableGPS, onError]);

  // Enhanced event handler for AR-specific tracking
  const handleAREvent = useCallback((event: ExternalGameEvent) => {
    // Track AR-specific events
    if (event.metadata.arEvent) {
      const arEventType = event.metadata.arEvent;

      switch (arEventType) {
        case 'marker_detected':
          const siteId = event.metadata.siteId;
          if (siteId && !sitesVisited.includes(siteId)) {
            setSitesVisited(prev => [...prev, siteId]);

            // Achievement for discovering new site
            onEvent?.({
              ...event,
              action: 'achievement',
              metadata: {
                ...event.metadata,
                achievement: 'site_discovered',
                siteName: COLONIAL_SITES[siteId]?.name,
                message: `¡Has descubierto ${COLONIAL_SITES[siteId]?.name}!`,
              },
            });
          }
          break;

        case 'quiz_answered':
          const isCorrect = event.metadata.isCorrect;
          if (isCorrect) {
            setCurrentQuizScore(prev => prev + 1);
          }
          break;

        case 'model_viewed':
          console.log('3D model viewed:', event.metadata.modelId);
          break;

        case 'audio_played':
          console.log('Audio content played:', event.metadata.audioId);
          break;
      }
    }

    // Generate milestone events
    if (sitesVisited.length > 0 && sitesVisited.length % 3 === 0) {
      onEvent?.({
        ...event,
        action: 'milestone',
        metadata: {
          ...event.metadata,
          milestone: `${sitesVisited.length}_sites_explored`,
          message: `¡Excelente! Has explorado ${sitesVisited.length} sitios históricos.`,
        },
      });
    }

    // Forward all events
    onEvent?.(event);
  }, [sitesVisited, onEvent]);

  // Custom completion handler for AR experience
  const handleARComplete = useCallback((progress: any) => {
    const completionData = {
      ...progress,
      mode,
      sitesVisited: sitesVisited.length,
      totalSites: Object.keys(COLONIAL_SITES).length,
      explorationRate: (sitesVisited.length / Object.keys(COLONIAL_SITES).length) * 100,
      quizScore: currentQuizScore,
      historicalKnowledge: generateHistoricalAssessment(sitesVisited, currentQuizScore),
      recommendations: generateRecommendations(mode, sitesVisited),
    };

    onComplete?.(completionData);
  }, [mode, sitesVisited, currentQuizScore, onComplete]);

  if (!arSupported) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="font-semibold text-red-900 mb-2">AR no disponible</h3>
          <p className="text-red-700 text-sm">
            Tu dispositivo no soporta realidad aumentada o necesitas permitir el acceso a la cámara.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Iniciando experiencia AR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`colonial-zone-ar-container ${className || ''}`} style={style}>
      {/* AR Experience Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="bg-white rounded-full p-3 text-2xl">
            🏛️
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 text-lg">{config.title}</h3>
            <p className="text-amber-700 mt-1">{config.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div>
                <span className="font-medium text-amber-800">Modo:</span>
                <div className="text-amber-600 mt-1">{getModeTitle(mode)}</div>
              </div>
              <div>
                <span className="font-medium text-amber-800">Sitios visitados:</span>
                <div className="text-amber-600 mt-1">{sitesVisited.length}/5</div>
              </div>
              <div>
                <span className="font-medium text-amber-800">Puntuación quiz:</span>
                <div className="text-amber-600 mt-1">{currentQuizScore}</div>
              </div>
              <div>
                <span className="font-medium text-amber-800">GPS:</span>
                <div className="text-amber-600 mt-1">{enableGPS ? '✅ Activo' : '❌ Desactivado'}</div>
              </div>
            </div>

            {/* Mode-specific instructions */}
            <div className="mt-3 p-3 bg-amber-100 rounded-lg">
              <h4 className="font-medium text-amber-900 text-sm mb-2">📱 Instrucciones:</h4>
              <div className="text-xs text-amber-800 space-y-1">
                {getModeInstructions(mode).map((instruction, index) => (
                  <p key={index}>• {instruction}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Progress Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {Object.values(COLONIAL_SITES).map((site) => (
          <div
            key={site.id}
            className={`p-2 rounded-lg border text-center ${
              sitesVisited.includes(site.id)
                ? 'bg-green-100 border-green-300'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            <div className="text-lg">{getCategoryIcon(site.category)}</div>
            <div className="text-xs font-medium mt-1">{site.name.split(' ')[0]}</div>
            {sitesVisited.includes(site.id) && (
              <div className="text-green-600 text-xs mt-1">✅</div>
            )}
          </div>
        ))}
      </div>

      {/* AR Experience Wrapper */}
      <ExternalGameWrapper
        config={config}
        studentId={studentId}
        onEvent={handleAREvent}
        onComplete={handleARComplete}
        onError={onError}
        className="rounded-lg border border-gray-200 overflow-hidden"
        style={{ minHeight: '600px', position: 'relative' }}
      />

      {/* AR Tips and Safety */}
      <div className="mt-4 space-y-3">
        {/* Safety Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-medium text-yellow-900 text-sm mb-2">⚠️ Consejos de seguridad AR:</h4>
          <div className="text-xs text-yellow-800 space-y-1">
            <p>• Mantente consciente de tu entorno al usar AR</p>
            <p>• No uses AR mientras caminas en calles transitadas</p>
            <p>• Asegúrate de tener buena iluminación para detectar marcadores</p>
            <p>• Mantén tu dispositivo estable para mejor experiencia</p>
          </div>
        </div>

        {/* Historical Context */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 text-sm mb-2">🏛️ Contexto histórico:</h4>
          <p className="text-xs text-blue-800">
            La Zona Colonial de Santo Domingo fue la primera ciudad europea en América,
            fundada en 1496. Sus edificaciones representan más de 500 años de historia
            y son Patrimonio de la Humanidad de la UNESCO desde 1990.
          </p>
        </div>

        {/* Credits */}
        <div className="text-center text-sm text-gray-500">
          <p>Experiencia AR desarrollada con AR.js</p>
          <p className="text-xs mt-1">
            Modelos 3D cortesía del Ministerio de Cultura de República Dominicana
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getModeTitle(mode: ARExperienceMode): string {
  const titles = {
    exploration: 'Exploración Libre',
    'treasure-hunt': 'Búsqueda del Tesoro',
    'time-travel': 'Viaje en el Tiempo',
    'quiz-challenge': 'Desafío de Historia',
  };
  return titles[mode];
}

function getModeDescription(mode: ARExperienceMode): string {
  const descriptions = {
    exploration: 'Explora los sitios históricos de la Zona Colonial a tu propio ritmo.',
    'treasure-hunt': 'Encuentra pistas históricas siguiendo un mapa del tesoro.',
    'time-travel': 'Viaja través del tiempo y ve cómo era la ciudad en diferentes épocas.',
    'quiz-challenge': 'Demuestra tus conocimientos históricos en desafíos interactivos.',
  };
  return descriptions[mode];
}

function getModeInstructions(mode: ARExperienceMode): string[] {
  const instructions = {
    exploration: [
      'Apunta tu cámara a los marcadores AR en cada sitio histórico',
      'Toca los elementos 3D para obtener más información',
      'Escucha las grabaciones de audio cuando estén disponibles',
      'Toma capturas de pantalla para tu portafolio',
    ],
    'treasure-hunt': [
      'Sigue las pistas en el mapa para encontrar los sitios',
      'Escanea cada marcador para obtener la siguiente pista',
      'Resuelve acertijos históricos para avanzar',
      'Encuentra todos los sitios para completar la búsqueda',
    ],
    'time-travel': [
      'Selecciona diferentes períodos históricos',
      'Observa cómo cambiaban los edificios a través del tiempo',
      'Interactúa con personajes históricos virtuales',
      'Compara la época colonial con la actualidad',
    ],
    'quiz-challenge': [
      'Responde preguntas sobre cada sitio histórico',
      'Usa las pistas AR para encontrar las respuestas',
      'Acumula puntos por respuestas correctas',
      'Desbloquea contenido especial con altas puntuaciones',
    ],
  };
  return instructions[mode];
}

function getCategoryIcon(category: string): string {
  const icons = {
    religious: '⛪',
    governmental: '🏛️',
    residential: '🏠',
    defensive: '🏰',
    cultural: '🎭',
  };
  return icons[category as keyof typeof icons] || '🏛️';
}

function createARExperienceURL(mode: ARExperienceMode, language: string, enableGPS: boolean): string {
  // This would be your custom AR.js application URL
  const baseUrl = '/ar-experience'; // Update with your AR app path
  const params = new URLSearchParams({
    mode,
    lang: language,
    gps: enableGPS.toString(),
  });
  return `${baseUrl}?${params.toString()}`;
}

function generateObjectives(mode: ARExperienceMode) {
  const baseObjectives = [
    {
      id: 'discover-site',
      title: 'Descubrir primer sitio',
      description: 'Encuentra y escanea tu primer marcador AR',
      required: true,
      points: 10,
      completionCriteria: { action: 'marker_detected', count: 1 },
    },
  ];

  const modeObjectives = {
    exploration: [
      {
        id: 'visit-all-sites',
        title: 'Gran explorador',
        description: 'Visita todos los sitios históricos',
        required: false,
        points: 50,
        completionCriteria: { action: 'all_sites_visited', count: 5 },
      },
    ],
    'treasure-hunt': [
      {
        id: 'complete-hunt',
        title: 'Cazador de tesoros',
        description: 'Completa toda la búsqueda del tesoro',
        required: true,
        points: 40,
        completionCriteria: { action: 'treasure_found', final: true },
      },
    ],
    'time-travel': [
      {
        id: 'visit-all-eras',
        title: 'Viajero temporal',
        description: 'Explora todas las épocas históricas',
        required: false,
        points: 45,
        completionCriteria: { action: 'eras_visited', count: 3 },
      },
    ],
    'quiz-challenge': [
      {
        id: 'quiz-master',
        title: 'Maestro de historia',
        description: 'Responde correctamente el 80% de las preguntas',
        required: false,
        points: 60,
        completionCriteria: { action: 'quiz_score', percentage: 80 },
      },
    ],
  };

  return [...baseObjectives, ...(modeObjectives[mode] || [])];
}

function generateHistoricalAssessment(sitesVisited: string[], quizScore: number): {
  level: 'beginner' | 'intermediate' | 'advanced';
  knowledge: string[];
  gaps: string[];
} {
  const totalSites = Object.keys(COLONIAL_SITES).length;
  const explorationRate = sitesVisited.length / totalSites;

  let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  if (explorationRate >= 0.8 && quizScore >= 8) {
    level = 'advanced';
  } else if (explorationRate >= 0.6 && quizScore >= 5) {
    level = 'intermediate';
  }

  const visitedSites = sitesVisited.map(id => COLONIAL_SITES[id]).filter(Boolean);
  const knowledge = visitedSites.map(site => `${site.name} (${site.yearBuilt})`);

  const unvisitedSites = Object.values(COLONIAL_SITES).filter(
    site => !sitesVisited.includes(site.id)
  );
  const gaps = unvisitedSites.map(site => site.name);

  return { level, knowledge, gaps };
}

function generateRecommendations(mode: ARExperienceMode, sitesVisited: string[]): string[] {
  const recommendations: string[] = [];

  if (sitesVisited.length < 3) {
    recommendations.push('Continúa explorando más sitios para obtener una visión completa de la historia colonial.');
  }

  if (mode === 'exploration') {
    recommendations.push('Intenta el modo "Búsqueda del Tesoro" para una experiencia más desafiante.');
  }

  recommendations.push('Visita físicamente la Zona Colonial para ver estos sitios en persona.');
  recommendations.push('Investiga más sobre la época colonial dominicana en libros y documentales.');

  return recommendations;
}