'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Brain,
  BookOpen,
  Beaker,
  Clock,
  MapPin,
  Award,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Globe,
  Scroll,
  Shield,
  Users,
  Scale,
  Check,
  X,
} from 'lucide-react';

interface Choice {
  id: string;
  text: string;
  consequence: string;
  points: number;
  nextScenario: string | null;
  educational?: string;
  type: 'good' | 'neutral' | 'bad';
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  choices: Choice[];
  category: 'science' | 'history' | 'critical-thinking' | 'ethics';
  difficulty: 'easy' | 'medium' | 'hard';
  location?: string;
  character?: string;
  emoji: string;
  backgroundImage?: string;
}

interface GameState {
  currentScenario: string;
  visitedScenarios: string[];
  totalPoints: number;
  decisions: { scenarioId: string; choiceId: string; points: number }[];
  gameComplete: boolean;
  endingType: 'great' | 'good' | 'neutral' | 'poor' | null;
  startTime: Date;
  playTime: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  condition: (state: GameState, scenarios: Scenario[]) => boolean;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'lab-start',
    title: 'El Laboratorio Misterioso',
    description: 'Aventura Científica',
    situation: 'Eres un estudiante de ciencias que ha sido seleccionado para un proyecto especial. Te encuentras frente a un laboratorio avanzado con equipos que nunca has visto. Tu supervisor te da las llaves y te dice: "Tienes 2 horas para realizar un experimento importante. ¿Qué haces primero?"',
    choices: [
      {
        id: 'read-protocols',
        text: '📖 Leer todos los protocolos de seguridad',
        consequence: 'Excelente decisión. Dedicas 20 minutos a leer los manuales de seguridad. Descubres procedimientos importantes que evitarán accidentes.',
        points: 15,
        nextScenario: 'lab-experiment',
        educational: 'La seguridad en el laboratorio es lo más importante. Siempre debemos leer los protocolos antes de usar equipos nuevos.',
        type: 'good'
      },
      {
        id: 'start-immediately',
        text: '⚡ Comenzar el experimento inmediatamente',
        consequence: 'Te apresuras a comenzar sin preparación. Aunque tienes más tiempo, cometes errores básicos que podrían ser peligrosos.',
        points: -5,
        nextScenario: 'lab-accident',
        educational: 'La prisa en la ciencia puede llevar a errores costosos. La preparación siempre es clave.',
        type: 'bad'
      },
      {
        id: 'ask-colleague',
        text: '🤝 Buscar un colega con experiencia',
        consequence: 'Encuentras a una científica senior que te da consejos valiosos sobre el experimento. Te sientes más confiado.',
        points: 10,
        nextScenario: 'lab-mentorship',
        educational: 'Colaborar y buscar mentores es fundamental en la ciencia. Nadie tiene que trabajar solo.',
        type: 'good'
      }
    ],
    category: 'science',
    difficulty: 'medium',
    location: 'Laboratorio Central',
    character: 'Estudiante de Ciencias',
    emoji: '🔬'
  },
  {
    id: 'lab-experiment',
    title: 'El Experimento Crucial',
    description: 'Decisiones en el Laboratorio',
    situation: 'Después de leer los protocolos, tienes que decidir qué tipo de experimento realizar. Tienes tres opciones importantes que podrían cambiar el rumbo de tu investigación.',
    choices: [
      {
        id: 'innovative-approach',
        text: '💡 Probar una metodología innovadora',
        consequence: '¡Increíble! Tu enfoque innovador produce resultados inesperados pero prometedores. Has hecho un descubrimiento preliminar.',
        points: 20,
        nextScenario: 'discovery',
        educational: 'La innovación científica a menudo requiere tomar riesgos calculados.',
        type: 'good'
      },
      {
        id: 'standard-procedure',
        text: '📋 Seguir el procedimiento estándar',
        consequence: 'Obtienes resultados consistentes y confiables. Aunque no hay sorpresas, tu trabajo es sólido y reproducible.',
        points: 15,
        nextScenario: 'consistent-results',
        educational: 'Los procedimientos estándar son la base de la ciencia confiable.',
        type: 'good'
      },
      {
        id: 'rush-experiment',
        text: '⏰ Acelerar para terminar rápido',
        consequence: 'La prisa causa errores en las mediciones. Tus resultados son inconsistentes y necesitarás repetir el experimento.',
        points: 5,
        nextScenario: 'data-problems',
        educational: 'En ciencia, la precisión es más importante que la velocidad.',
        type: 'neutral'
      }
    ],
    category: 'science',
    difficulty: 'medium',
    location: 'Laboratorio Central',
    character: 'Estudiante de Ciencias',
    emoji: '🧪'
  },
  {
    id: 'history-start',
    title: 'El Archivo Secreto',
    description: 'Aventura Histórica',
    situation: 'Eres un historiador joven que ha descubierto un archivo secreto en la biblioteca de una universidad. Los documentos parecen contener información sobre eventos históricos importantes que podrían cambiar nuestra comprensión del pasado. ¿Qué haces?',
    choices: [
      {
        id: 'authenticate-first',
        text: '🔍 Verificar la autenticidad de los documentos',
        consequence: 'Dedicas tiempo a verificar las fechas, el papel y la tinta. Confirmas que los documentos son auténticos y de gran valor histórico.',
        points: 20,
        nextScenario: 'historical-discovery',
        educational: 'La verificación de fuentes es fundamental en la investigación histórica.',
        type: 'good'
      },
      {
        id: 'publish-immediately',
        text: '📰 Publicar el hallazgo inmediatamente',
        consequence: 'Publicas sin verificar. Más tarde se descubre que algunos documentos eran falsificaciones. Tu reputación se ve afectada.',
        points: -10,
        nextScenario: 'reputation-damage',
        educational: 'La verificación debe preceder a la publicación en investigación histórica.',
        type: 'bad'
      },
      {
        id: 'consult-experts',
        text: '👥 Consultar con otros historiadores',
        consequence: 'Formas un equipo de expertos. Juntos, analizan los documentos meticulosamente y hacen un descubrimiento responsable.',
        points: 25,
        nextScenario: 'collaborative-discovery',
        educational: 'La colaboración en academia fortalece la investigación y reduce errores.',
        type: 'good'
      }
    ],
    category: 'history',
    difficulty: 'hard',
    location: 'Biblioteca Universitaria',
    character: 'Historiador Joven',
    emoji: '📜'
  },
  {
    id: 'ethics-dilemma',
    title: 'El Dilema Ético',
    description: 'Decisiones Morales',
    situation: 'Trabajas en una empresa de tecnología y descubres que un nuevo algoritmo de IA que tu equipo está desarrollando tiene un sesgo que podría discriminar contra ciertos grupos de personas. El proyecto tiene una fecha límite muy ajustada y tu jefe dice que "arreglaremos eso después del lanzamiento".',
    choices: [
      {
        id: 'refuse-launch',
        text: '🛑 Rechazar el lanzamiento hasta corregir el sesgo',
        consequence: 'Tu posición firme convence al equipo de retrasar el lanzamiento. Se corrige el sesgo y el producto es más justo, aunque llegue tarde al mercado.',
        points: 30,
        nextScenario: 'ethical-victory',
        educational: 'Los principios éticos deben prevalecer sobre las presiones comerciales.',
        type: 'good'
      },
      {
        id: 'document-concerns',
        text: '📝 Documentar tus preocupaciones por escrito',
        consequence: 'Documentas el problema y lo envías a tu jefe. Aunque el producto se lanza con problemas, tienes evidencia de que alertaste sobre el sesgo.',
        points: 15,
        nextScenario: 'documentation-path',
        educational: 'Documentar preocupaciones éticas es importante para la responsabilidad.',
        type: 'neutral'
      },
      {
        id: 'stay-silent',
        text: '🤐 Mantenerte en silencio y seguir órdenes',
        consequence: 'El producto se lanza con sesgo. Más tarde, cuando el problema se hace público, te sientes culpable por no haber actuado.',
        points: -15,
        nextScenario: 'regret-path',
        educational: 'El silencio ante problemas éticos puede llevar a consecuencias negativas duraderas.',
        type: 'bad'
      }
    ],
    category: 'ethics',
    difficulty: 'hard',
    location: 'Oficina Corporativa',
    character: 'Desarrollador de IA',
    emoji: '⚖️'
  },
  {
    id: 'discovery',
    title: '¡Descubrimiento Científico!',
    description: 'El Resultado de la Innovación',
    situation: 'Tu enfoque innovador ha llevado a un descubrimiento inesperado. Los datos muestran patrones que nadie había observado antes. Esto podría ser el comienzo de una nueva línea de investigación, pero necesitas decidir qué hacer con esta información.',
    choices: [
      {
        id: 'peer-review',
        text: '🔬 Someter a revisión por pares inmediatamente',
        consequence: 'El proceso de revisión valida tu descubrimiento. Publicas en una revista prestigiosa y tu carrera científica despega.',
        points: 25,
        nextScenario: null,
        educational: 'La revisión por pares es esencial para validar descubrimientos científicos.',
        type: 'good'
      },
      {
        id: 'more-research',
        text: '📊 Realizar más experimentos para confirmar',
        consequence: 'Tus experimentos adicionales confirman y expanden el descubrimiento. Cuando publicas, tu trabajo es más sólido y completo.',
        points: 30,
        nextScenario: null,
        educational: 'La replicación y confirmación fortalecen la credibilidad científica.',
        type: 'good'
      }
    ],
    category: 'science',
    difficulty: 'medium',
    location: 'Laboratorio Central',
    character: 'Estudiante de Ciencias',
    emoji: '🌟'
  },
  {
    id: 'historical-discovery',
    title: 'Documentos Auténticos',
    description: 'Un Hallazgo Histórico Real',
    situation: 'Has confirmado que los documentos son auténticos y contienen correspondencia entre líderes históricos que revela nuevos detalles sobre eventos importantes. Este descubrimiento podría reescribir parte de la historia.',
    choices: [
      {
        id: 'careful-publication',
        text: '📚 Publicar con análisis completo',
        consequence: 'Tu publicación cuidadosa y bien documentada es aclamada por la comunidad académica. Cambias la comprensión de un período histórico importante.',
        points: 35,
        nextScenario: null,
        educational: 'Los grandes descubrimientos históricos requieren análisis meticuloso y presentación cuidadosa.',
        type: 'good'
      },
      {
        id: 'museum-exhibition',
        text: '🏛️ Organizar una exhibición en museo',
        consequence: 'Creas una exhibición que educa al público sobre el descubrimiento. Tu trabajo llega a miles de personas y despierte el interés en la historia.',
        points: 30,
        nextScenario: null,
        educational: 'Compartir descubrimientos históricos con el público amplia el impacto educativo.',
        type: 'good'
      }
    ],
    category: 'history',
    difficulty: 'hard',
    location: 'Biblioteca Universitaria',
    character: 'Historiador Joven',
    emoji: '🏆'
  }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'safety-first',
    title: 'Seguridad Primero',
    description: 'Priorizar la seguridad en el laboratorio',
    icon: <Shield className="w-5 h-5" />,
    unlocked: false,
    condition: (state) => state.decisions.some(d => d.choiceId === 'read-protocols')
  },
  {
    id: 'innovative-thinker',
    title: 'Pensador Innovador',
    description: 'Elegir enfoques creativos e innovadores',
    icon: <Lightbulb className="w-5 h-5" />,
    unlocked: false,
    condition: (state) => state.decisions.some(d => d.choiceId === 'innovative-approach')
  },
  {
    id: 'ethical-champion',
    title: 'Campeón Ético',
    description: 'Tomar decisiones éticamente correctas',
    icon: <Award className="w-5 h-5" />,
    unlocked: false,
    condition: (state) => state.decisions.some(d => d.choiceId === 'refuse-launch')
  },
  {
    id: 'collaboration-master',
    title: 'Maestro de Colaboración',
    description: 'Buscar ayuda y trabajar en equipo',
    icon: <Users className="w-5 h-5" />,
    unlocked: false,
    condition: (state) => state.decisions.some(d => ['ask-colleague', 'consult-experts'].includes(d.choiceId))
  },
  {
    id: 'perfectionist',
    title: 'Perfeccionista',
    description: 'Obtener más de 100 puntos totales',
    icon: <Target className="w-5 h-5" />,
    unlocked: false,
    condition: (state) => state.totalPoints >= 100
  }
];

export default function BranchingScenarioGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    currentScenario: '',
    visitedScenarios: [],
    totalPoints: 0,
    decisions: [],
    gameComplete: false,
    endingType: null,
    startTime: new Date(),
    playTime: 0
  });

  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showChoice, setShowChoice] = useState(false);
  const [lastChoice, setLastChoice] = useState<Choice | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [showAchievements, setShowAchievements] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !gameState.gameComplete) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          playTime: Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameState.gameComplete]);

  // Check achievements
  useEffect(() => {
    const updatedAchievements = achievements.map(achievement => ({
      ...achievement,
      unlocked: achievement.unlocked || achievement.condition(gameState, SCENARIOS)
    }));

    setAchievements(updatedAchievements);
  }, [gameState.decisions]);

  const currentScenario = SCENARIOS.find(s => s.id === gameState.currentScenario);

  const startGame = (scenarioId: string) => {
    setGameState({
      currentScenario: scenarioId,
      visitedScenarios: [scenarioId],
      totalPoints: 0,
      decisions: [],
      gameComplete: false,
      endingType: null,
      startTime: new Date(),
      playTime: 0
    });
    setGameStarted(true);
    setSelectedScenario(null);
    setShowChoice(false);
    setLastChoice(null);
  };

  const makeChoice = (choice: Choice) => {
    const newDecision = {
      scenarioId: gameState.currentScenario,
      choiceId: choice.id,
      points: choice.points
    };

    setLastChoice(choice);
    setShowChoice(true);

    setTimeout(() => {
      setGameState(prev => {
        const newTotalPoints = prev.totalPoints + choice.points;
        let endingType: 'great' | 'good' | 'neutral' | 'poor' | null = null;
        let gameComplete = false;

        if (!choice.nextScenario) {
          gameComplete = true;
          if (newTotalPoints >= 80) endingType = 'great';
          else if (newTotalPoints >= 50) endingType = 'good';
          else if (newTotalPoints >= 20) endingType = 'neutral';
          else endingType = 'poor';
        }

        return {
          ...prev,
          currentScenario: choice.nextScenario || prev.currentScenario,
          visitedScenarios: choice.nextScenario
            ? [...prev.visitedScenarios, choice.nextScenario]
            : prev.visitedScenarios,
          totalPoints: newTotalPoints,
          decisions: [...prev.decisions, newDecision],
          gameComplete,
          endingType
        };
      });

      setShowChoice(false);
      setLastChoice(null);
    }, 3000);
  };

  const resetGame = () => {
    setGameState({
      currentScenario: '',
      visitedScenarios: [],
      totalPoints: 0,
      decisions: [],
      gameComplete: false,
      endingType: null,
      startTime: new Date(),
      playTime: 0
    });
    setGameStarted(false);
    setSelectedScenario(null);
    setShowChoice(false);
    setLastChoice(null);
    setAchievements(INITIAL_ACHIEVEMENTS);
  };

  const getScenariosByCategory = (category: string) => {
    return SCENARIOS.filter(s => s.category === category && !s.id.includes('-'));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEndingMessage = (type: string) => {
    switch (type) {
      case 'great':
        return {
          title: '¡Excelente Aventurero!',
          message: 'Has tomado decisiones excepcionales que demuestran sabiduría, ética y pensamiento crítico.',
          emoji: '🏆',
          color: 'text-yellow-600'
        };
      case 'good':
        return {
          title: '¡Buen Trabajo!',
          message: 'Has tomado decisiones sólidas y aprendido lecciones valiosas en tu aventura.',
          emoji: '🌟',
          color: 'text-green-600'
        };
      case 'neutral':
        return {
          title: 'Aventura Completada',
          message: 'Has completado la aventura con resultados mixtos. ¡Siempre hay oportunidades para mejorar!',
          emoji: '📚',
          color: 'text-blue-600'
        };
      case 'poor':
        return {
          title: 'Aprende de la Experiencia',
          message: 'Esta aventura te ha enseñado lecciones importantes. ¡Inténtalo de nuevo con lo que has aprendido!',
          emoji: '🎯',
          color: 'text-orange-600'
        };
      default:
        return {
          title: 'Aventura',
          message: 'Continúa tu viaje de aprendizaje.',
          emoji: '🎮',
          color: 'text-gray-600'
        };
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'science':
        return {
          title: 'Aventura Científica',
          description: 'Explora el mundo de la ciencia y toma decisiones como un verdadero científico',
          icon: <Beaker className="w-6 h-6" />,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50'
        };
      case 'history':
        return {
          title: 'Aventura Histórica',
          description: 'Vive experiencias del pasado y aprende lecciones de la historia',
          icon: <Scroll className="w-6 h-6" />,
          color: 'from-amber-500 to-orange-500',
          bgColor: 'bg-amber-50'
        };
      case 'ethics':
        return {
          title: 'Dilemas Éticos',
          description: 'Enfrenta decisiones morales complejas y desarrolla tu brújula ética',
          icon: <Scale className="w-6 h-6" />,
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50'
        };
      case 'critical-thinking':
        return {
          title: 'Pensamiento Crítico',
          description: 'Desarrolla habilidades de análisis y resolución de problemas complejos',
          icon: <Brain className="w-6 h-6" />,
          color: 'from-green-500 to-teal-500',
          bgColor: 'bg-green-50'
        };
      default:
        return {
          title: 'Aventura',
          description: 'Una aventura educativa',
          icon: <BookOpen className="w-6 h-6" />,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🌳 Aventura de Decisiones
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Elige tu propia aventura educativa!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {gameStarted && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>{formatTime(gameState.playTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="font-bold">{gameState.totalPoints}</span>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => router.push('/games')}
                className="bg-white/50 hover:bg-white/80"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver a Juegos
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Game Progress */}
      {gameStarted && !gameState.gameComplete && (
        <section className="container mx-auto px-4 sm:px-6 py-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progreso de Aventura
              </span>
              <span className="text-sm text-gray-600">
                {gameState.visitedScenarios.length} escenarios visitados
              </span>
            </div>
            <Progress
              value={(gameState.visitedScenarios.length / 5) * 100}
              className="h-2"
            />
          </div>
        </section>
      )}

      {/* Game Selection */}
      {!gameStarted && (
        <section className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Elige Tu Aventura Educativa
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cada aventura te llevará por un camino diferente lleno de decisiones importantes.
              Tus elecciones determinarán el resultado y las lecciones que aprenderás.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['science', 'history', 'ethics'].map(category => {
              const categoryInfo = getCategoryInfo(category);
              const scenarios = getScenariosByCategory(category);

              return (
                <Card
                  key={category}
                  className={`${categoryInfo.bgColor} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                  onClick={() => {
                    if (scenarios.length > 0) {
                      startGame(scenarios[0].id);
                    }
                  }}
                >
                  <CardHeader className="text-center">
                    <div className={`mx-auto p-3 rounded-full bg-gradient-to-r ${categoryInfo.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                      {categoryInfo.icon}
                    </div>
                    <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                      {categoryInfo.title}
                    </CardTitle>
                    <p className="text-gray-600">
                      {categoryInfo.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {scenarios.map(scenario => (
                      <div key={scenario.id} className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{scenario.emoji}</span>
                        <div>
                          <div className="font-medium text-sm">{scenario.title}</div>
                          <div className="text-xs text-gray-600">{scenario.description}</div>
                        </div>
                      </div>
                    ))}
                    <Button className={`w-full mt-4 bg-gradient-to-r ${categoryInfo.color} text-white hover:opacity-90`}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Comenzar Aventura
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Achievements Preview */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🏆 Logros Disponibles
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {INITIAL_ACHIEVEMENTS.map(achievement => (
                <div
                  key={achievement.id}
                  className="bg-white/60 rounded-xl p-4 text-center border border-white/20"
                >
                  <div className="text-gray-400 mb-2">
                    {achievement.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {achievement.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Current Scenario */}
      {gameStarted && currentScenario && !gameState.gameComplete && !showChoice && (
        <section className="container mx-auto px-4 sm:px-6 py-6">
          <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-2 border-white/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{currentScenario.emoji}</div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">
                    {currentScenario.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="bg-white/50">
                      {getCategoryInfo(currentScenario.category).title}
                    </Badge>
                    {currentScenario.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {currentScenario.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <p className="text-gray-800 leading-relaxed text-lg">
                  {currentScenario.situation}
                </p>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ¿Qué decides hacer?
              </h3>

              <div className="space-y-4">
                {currentScenario.choices.map(choice => (
                  <Button
                    key={choice.id}
                    onClick={() => makeChoice(choice)}
                    className={`w-full p-4 h-auto text-left justify-start ${
                      choice.type === 'good' ? 'bg-green-50 hover:bg-green-100 text-green-800 border-green-300' :
                      choice.type === 'bad' ? 'bg-red-50 hover:bg-red-100 text-red-800 border-red-300' :
                      'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'
                    } border-2`}
                    variant="outline"
                  >
                    <div className="text-left">
                      <div className="font-medium mb-1">{choice.text}</div>
                      <div className="text-sm opacity-80">
                        {choice.points > 0 ? '+' : ''}{choice.points} puntos
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Choice Consequence */}
      {showChoice && lastChoice && (
        <section className="container mx-auto px-4 sm:px-6 py-6">
          <Card className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border-2 border-white/20">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">
                {lastChoice.type === 'good' ? '✅' : lastChoice.type === 'bad' ? '❌' : '⚠️'}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Consecuencia de tu Decisión
              </h3>

              <p className="text-gray-800 text-lg mb-6 leading-relaxed">
                {lastChoice.consequence}
              </p>

              {lastChoice.educational && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <div className="font-medium text-yellow-800 mb-1">
                        Lección Aprendida:
                      </div>
                      <div className="text-yellow-700 text-sm">
                        {lastChoice.educational}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  lastChoice.points > 0 ? 'bg-green-100 text-green-800' :
                  lastChoice.points < 0 ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  <Star className="w-4 h-4" />
                  {lastChoice.points > 0 ? '+' : ''}{lastChoice.points} puntos
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Game Complete */}
      {gameState.gameComplete && (
        <section className="container mx-auto px-4 sm:px-6 py-8">
          <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border-2 border-white/20">
            <CardContent className="p-8 text-center">
              <div className="text-8xl mb-6">
                {getEndingMessage(gameState.endingType || '').emoji}
              </div>

              <h2 className={`text-3xl font-bold mb-4 ${getEndingMessage(gameState.endingType || '').color}`}>
                {getEndingMessage(gameState.endingType || '').title}
              </h2>

              <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
                {getEndingMessage(gameState.endingType || '').message}
              </p>

              {/* Final Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {gameState.totalPoints}
                  </div>
                  <div className="text-sm text-blue-700">Puntos Totales</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {gameState.decisions.length}
                  </div>
                  <div className="text-sm text-green-700">Decisiones</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {gameState.visitedScenarios.length}
                  </div>
                  <div className="text-sm text-purple-700">Escenarios</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {formatTime(gameState.playTime)}
                  </div>
                  <div className="text-sm text-yellow-700">Tiempo</div>
                </div>
              </div>

              {/* Achievements Unlocked */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🏆 Logros Desbloqueados
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {achievements.map(achievement => (
                    <div
                      key={achievement.id}
                      className={`rounded-xl p-4 text-center border-2 transition-all ${
                        achievement.unlocked
                          ? 'bg-yellow-50 border-yellow-300 transform scale-105'
                          : 'bg-gray-50 border-gray-200 opacity-50'
                      }`}
                    >
                      <div className={`mb-2 ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`}>
                        {achievement.icon}
                      </div>
                      <div className={`text-sm font-medium mb-1 ${
                        achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </div>
                      <div className={`text-xs ${
                        achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Nueva Aventura
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/games')}
                  size="lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Otros Juegos
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Call to Action */}
      {!gameStarted && (
        <section className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm text-white py-12">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¡Cada Decisión Cuenta!
            </h2>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
              En estas aventuras educativas, aprenderás que cada decisión tiene consecuencias.
              Desarrolla tu pensamiento crítico y habilidades para la vida mientras vives emocionantes historias.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm">Aventuras Únicas</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">15+</div>
                <div className="text-sm">Decisiones Importantes</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm">Logros Especiales</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}