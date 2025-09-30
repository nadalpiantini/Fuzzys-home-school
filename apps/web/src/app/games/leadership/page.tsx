'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Crown,
  Users,
  Target,
  CheckCircle,
  Clock,
  Lightbulb,
  TrendingUp,
  Heart,
  Shield,
  Zap,
} from 'lucide-react';

interface Scenario {
  id: number;
  title: string;
  context: string;
  situation: string;
  challenge: string;
  options: {
    id: string;
    action: string;
    leadership_style: string;
    consequences: string;
    effectiveness: 'low' | 'medium' | 'high';
    explanation: string;
  }[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const LEADERSHIP_SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: 'Conflicto en el Equipo',
    context: 'Eres líder de un proyecto escolar con 5 miembros.',
    situation: 'Dos miembros del equipo, Ana y Carlos, tienen ideas muy diferentes sobre cómo proceder y han comenzado a discutir en las reuniones.',
    challenge: 'La tensión está afectando la productividad del equipo. ¿Cómo manejas esta situación?',
    options: [
      {
        id: 'a',
        action: 'Organizar una reunión mediada donde ambos puedan expresar sus ideas',
        leadership_style: 'Democrático/Colaborativo',
        consequences: 'El equipo encuentra una solución híbrida y mejora la comunicación',
        effectiveness: 'high',
        explanation: 'Excelente. El liderazgo colaborativo fomenta la participación y ayuda a resolver conflictos de manera constructiva.'
      },
      {
        id: 'b',
        action: 'Decidir tú mismo cuál idea seguir para evitar más conflictos',
        leadership_style: 'Autocrático',
        consequences: 'Se resuelve rápido pero alguien queda insatisfecho',
        effectiveness: 'medium',
        explanation: 'Funcional pero no ideal. Aunque resuelve el conflicto inmediato, puede generar resentimiento y no aprovecha la diversidad de ideas.'
      },
      {
        id: 'c',
        action: 'Ignorar el problema esperando que se resuelva solo',
        leadership_style: 'Laissez-faire',
        consequences: 'El conflicto empeora y el proyecto se retrasa',
        effectiveness: 'low',
        explanation: 'Inadecuado. Evitar los conflictos raramente los resuelve y puede llevar a problemas mayores.'
      }
    ],
    category: 'Resolución de Conflictos',
    difficulty: 'easy'
  },
  {
    id: 2,
    title: 'Motivando a un Equipo Desanimado',
    context: 'Tu equipo de voleibol ha perdido los últimos tres partidos.',
    situation: 'Los jugadores están desmoralizados y algunos están considerando abandonar.',
    challenge: 'Como capitán, necesitas restaurar la confianza y motivación del equipo.',
    options: [
      {
        id: 'a',
        action: 'Enfocarte en los aspectos positivos y celebrar pequeñas mejoras',
        leadership_style: 'Transformacional',
        consequences: 'El equipo recupera la confianza gradualmente',
        effectiveness: 'high',
        explanation: 'Excelente. El liderazgo transformacional inspira y motiva a través del reconocimiento y la visión positiva.'
      },
      {
        id: 'b',
        action: 'Ser muy crítico con los errores para que mejoren',
        leadership_style: 'Directivo',
        consequences: 'Algunos mejoran pero otros se sienten peor',
        effectiveness: 'medium',
        explanation: 'Parcialmente efectivo. Aunque puede motivar a algunos, el exceso de crítica puede dañar la autoestima del equipo.'
      },
      {
        id: 'c',
        action: 'Dejar que los jugadores se motiven entre ellos',
        leadership_style: 'Delegativo',
        consequences: 'Algunos se motivan pero el problema persiste',
        effectiveness: 'low',
        explanation: 'Insuficiente. En momentos difíciles, el equipo necesita liderazgo activo y dirección clara.'
      }
    ],
    category: 'Motivación de Equipos',
    difficulty: 'medium'
  },
  {
    id: 3,
    title: 'Tomando una Decisión Difícil',
    context: 'Eres presidente del consejo estudiantil y hay presupuesto limitado.',
    situation: 'Debes elegir entre financiar un festival de talentos (muy popular) o equipos de laboratorio (necesarios para ciencias).',
    challenge: 'La comunidad estudiantil está dividida y necesitas tomar una decisión justa.',
    options: [
      {
        id: 'a',
        action: 'Organizar una votación estudiantil democrática',
        leadership_style: 'Democrático',
        consequences: 'La decisión es aceptada por la mayoría',
        effectiveness: 'high',
        explanation: 'Excelente. La participación democrática genera legitimidad y aceptación de las decisiones.'
      },
      {
        id: 'b',
        action: 'Elegir los equipos de laboratorio por ser más importante académicamente',
        leadership_style: 'Visionario',
        consequences: 'Decisión correcta a largo plazo pero genera resistencia inicial',
        effectiveness: 'medium',
        explanation: 'Buena visión a largo plazo, pero sin consulta puede generar resistencia. La comunicación de la decisión es clave.'
      },
      {
        id: 'c',
        action: 'Posponer la decisión indefinidamente',
        leadership_style: 'Evasivo',
        consequences: 'Se pierde la oportunidad y aumenta la frustración',
        effectiveness: 'low',
        explanation: 'Inadecuado. Los líderes deben tomar decisiones difíciles; la procrastinación empeora los problemas.'
      }
    ],
    category: 'Toma de Decisiones',
    difficulty: 'hard'
  },
  {
    id: 4,
    title: 'Desarrollando Talento en el Equipo',
    context: 'Lideras un club de robótica con miembros de diferentes niveles de experiencia.',
    situation: 'Tienes miembros muy experimentados y otros que apenas están aprendiendo.',
    challenge: 'Necesitas asegurar que todos contribuyan y se desarrollen sin que los menos experimentados se sientan excluidos.',
    options: [
      {
        id: 'a',
        action: 'Crear equipos mixtos donde los experimentados mentoren a los novatos',
        leadership_style: 'Desarrollador',
        consequences: 'Todos aprenden y el equipo se fortalece',
        effectiveness: 'high',
        explanation: 'Excelente. El liderazgo de desarrollo crea oportunidades de crecimiento para todos y fortalece las relaciones del equipo.'
      },
      {
        id: 'b',
        action: 'Asignar tareas simples a los novatos y complejas a los experimentados',
        leadership_style: 'Situacional',
        consequences: 'Eficiente pero los novatos aprenden poco',
        effectiveness: 'medium',
        explanation: 'Funcional pero limitado. Aunque es eficiente, no maximiza el potencial de desarrollo de los miembros novatos.'
      },
      {
        id: 'c',
        action: 'Dejar que cada quien trabaje en lo que prefiera',
        leadership_style: 'Permisivo',
        consequences: 'Los experimentados dominan y los novatos se marginan',
        effectiveness: 'low',
        explanation: 'Inadecuado. Sin dirección, los desequilibrios de experiencia pueden llevar a exclusión y pérdida de talento.'
      }
    ],
    category: 'Desarrollo de Talento',
    difficulty: 'medium'
  },
  {
    id: 5,
    title: 'Gestionando una Crisis',
    context: 'Eres líder de un evento escolar importante.',
    situation: 'El día del evento, el equipo de sonido falla y tienes 200 personas esperando.',
    challenge: 'Necesitas manejar esta crisis manteniendo la calma y encontrando soluciones rápidas.',
    options: [
      {
        id: 'a',
        action: 'Mantener la calma, comunicar la situación y coordinar un plan B',
        leadership_style: 'Crisis Management',
        consequences: 'El evento continúa con adaptaciones exitosas',
        effectiveness: 'high',
        explanation: 'Excelente. El liderazgo en crisis requiere calma, comunicación clara y adaptabilidad rápida.'
      },
      {
        id: 'b',
        action: 'Cancelar el evento para evitar un desastre mayor',
        leadership_style: 'Conservador',
        consequences: 'Se evita el problema pero hay mucha decepción',
        effectiveness: 'medium',
        explanation: 'Seguro pero no ideal. A veces es necesario tomar riesgos calculados y buscar soluciones creativas.'
      },
      {
        id: 'c',
        action: 'Culpar al equipo técnico y mostrar frustración públicamente',
        leadership_style: 'Reactivo',
        consequences: 'La situación empeora y se pierde credibilidad',
        effectiveness: 'low',
        explanation: 'Muy inadecuado. Los líderes deben mostrar compostura en crisis y enfocarse en soluciones, no en culpas.'
      }
    ],
    category: 'Gestión de Crisis',
    difficulty: 'hard'
  },
  {
    id: 6,
    title: 'Comunicación Efectiva',
    context: 'Lideras un proyecto comunitario de reciclaje.',
    situation: 'Necesitas convencer a personas escépticas de participar en el programa.',
    challenge: 'Algunos vecinos creen que el reciclaje es innecesario y una pérdida de tiempo.',
    options: [
      {
        id: 'a',
        action: 'Escuchar sus preocupaciones y presentar beneficios concretos y locales',
        leadership_style: 'Persuasivo/Empático',
        consequences: 'Gradualmente ganas apoyo y participación',
        effectiveness: 'high',
        explanation: 'Excelente. El liderazgo persuasivo combina empatía con argumentos sólidos para generar cambio de actitud.'
      },
      {
        id: 'b',
        action: 'Presentar estadísticas y datos científicos sobre el medio ambiente',
        leadership_style: 'Racional',
        consequences: 'Convences a algunos pero no a todos',
        effectiveness: 'medium',
        explanation: 'Parcialmente efectivo. Los datos son importantes pero deben combinarse con conexión emocional y beneficios personales.'
      },
      {
        id: 'c',
        action: 'Insistir que es su responsabilidad moral participar',
        leadership_style: 'Moralizante',
        consequences: 'Generas resistencia y defensividad',
        effectiveness: 'low',
        explanation: 'Contraproducente. Los enfoques moralizantes suelen generar resistencia en lugar de cooperación.'
      }
    ],
    category: 'Comunicación y Persuasión',
    difficulty: 'medium'
  }
];

export default function LeadershipGame() {
  const router = useRouter();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalEffectiveness, setTotalEffectiveness] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [scenarioStartTime, setScenarioStartTime] = useState(0);
  const [leadershipStyles, setLeadershipStyles] = useState<string[]>([]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted]);

  // Scenario timer
  useEffect(() => {
    if (gameStarted && !showResult) {
      setScenarioStartTime(Date.now());
    }
  }, [currentScenario, gameStarted]);

  const handleOptionSelect = (optionId: string) => {
    if (selectedOption !== null || showResult) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    setSelectedOption(optionId);
    setShowResult(true);

    const scenario = LEADERSHIP_SCENARIOS[currentScenario];
    const selectedOptionData = scenario.options.find(opt => opt.id === optionId);
    
    if (selectedOptionData) {
      // Calculate score based on effectiveness and time
      const timeTaken = (Date.now() - scenarioStartTime) / 1000;
      const effectivenessPoints = {
        low: 50,
        medium: 100,
        high: 150
      }[selectedOptionData.effectiveness];
      
      const timeBonus = Math.max(0, Math.floor((120 - timeTaken) / 10) * 5); // Small time bonus
      const difficultyBonus = {
        easy: 0,
        medium: 25,
        hard: 50
      }[scenario.difficulty];
      
      const totalPoints = effectivenessPoints + timeBonus + difficultyBonus;
      setScore(prev => prev + totalPoints);
      
      // Track effectiveness for overall rating
      const effectivenessValue = {
        low: 1,
        medium: 2,
        high: 3
      }[selectedOptionData.effectiveness];
      setTotalEffectiveness(prev => prev + effectivenessValue);
      
      // Track leadership styles used
      setLeadershipStyles(prev => [...prev, selectedOptionData.leadership_style]);
    }

    // Auto advance after showing result
    setTimeout(() => {
      nextScenario();
    }, 6000);
  };

  const nextScenario = () => {
    if (currentScenario < LEADERSHIP_SCENARIOS.length - 1) {
      setCurrentScenario(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setCurrentScenario(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setTotalEffectiveness(0);
    setGameStarted(false);
    setGameCompleted(false);
    setTimeElapsed(0);
    setScenarioStartTime(0);
    setLeadershipStyles([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Resolución de Conflictos': 'bg-red-100 text-red-800',
      'Motivación de Equipos': 'bg-green-100 text-green-800',
      'Toma de Decisiones': 'bg-blue-100 text-blue-800',
      'Desarrollo de Talento': 'bg-purple-100 text-purple-800',
      'Gestión de Crisis': 'bg-orange-100 text-orange-800',
      'Comunicación y Persuasión': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEffectivenessIcon = (effectiveness: string) => {
    switch (effectiveness) {
      case 'high': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-600" />;
      case 'low': return <Shield className="w-4 h-4 text-red-600" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const averageEffectiveness = LEADERSHIP_SCENARIOS.length > 0 
    ? (totalEffectiveness / Math.min(currentScenario + 1, LEADERSHIP_SCENARIOS.length))
    : 0;

  const getLeadershipRating = () => {
    if (averageEffectiveness >= 2.5) return { level: 'Líder Excelente', icon: Crown, color: 'text-yellow-600' };
    if (averageEffectiveness >= 2.0) return { level: 'Líder Competente', icon: Star, color: 'text-blue-600' };
    if (averageEffectiveness >= 1.5) return { level: 'Líder en Desarrollo', icon: TrendingUp, color: 'text-green-600' };
    return { level: 'Líder Novato', icon: Users, color: 'text-gray-600' };
  };

  const currentScenarioData = LEADERSHIP_SCENARIOS[currentScenario];

  if (!gameStarted && currentScenario === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">👑</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Liderazgo en Acción
            </h1>
            <p className="text-gray-600 mb-6">
              ¡Desarrolla tus habilidades de liderazgo!
            </p>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 text-left">
                • {LEADERSHIP_SCENARIOS.length} escenarios de liderazgo<br/>
                • Diferentes estilos y situaciones<br/>
                • Toma de decisiones y gestión de equipos<br/>
                • Retroalimentación personalizada
              </div>
              <Button
                onClick={() => setGameStarted(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                size="lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                ¡Empezar a Liderar!
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/games')}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver a Juegos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameCompleted) {
    const rating = getLeadershipRating();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-red-100">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Evaluación de Liderazgo</h1>
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
        </header>

        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Leadership Rating */}
            <Card className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <CardContent className="p-6 text-center">
                <rating.icon className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">¡Evaluación Completada!</h2>
                <div className="text-xl mb-4">Puntuación: {score} puntos</div>
                <div className="text-lg">Nivel: {rating.level}</div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Métricas de Liderazgo
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Efectividad</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(averageEffectiveness * 100 / 3)}%
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Tiempo</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatTime(timeElapsed)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Decisiones</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {LEADERSHIP_SCENARIOS.length}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Estilo de Liderazgo Predominante</div>
                    <div className="text-lg font-bold text-amber-600">
                      {leadershipStyles.length > 0 
                        ? leadershipStyles[Math.floor(Math.random() * leadershipStyles.length)]
                        : 'Adaptativo'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leadership Skills Breakdown */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Áreas de Liderazgo Evaluadas</h3>
                <div className="space-y-3">
                  {[
                    { category: 'Resolución de Conflictos', icon: Heart, description: 'Manejo de tensiones interpersonales' },
                    { category: 'Motivación de Equipos', icon: Users, description: 'Inspirar y energizar grupos' },
                    { category: 'Toma de Decisiones', icon: Target, description: 'Decisiones efectivas bajo presión' },
                    { category: 'Desarrollo de Talento', icon: TrendingUp, description: 'Cultivar potencial en otros' },
                    { category: 'Gestión de Crisis', icon: Shield, description: 'Liderazgo en situaciones difíciles' },
                    { category: 'Comunicación y Persuasión', icon: Lightbulb, description: 'Influencia positiva y comunicación' }
                  ].map((skill) => {
                    const scenariosInCategory = LEADERSHIP_SCENARIOS.filter(s => s.category === skill.category);
                    const completed = scenariosInCategory.length > 0;
                    
                    return (
                      <div key={skill.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <skill.icon className="w-5 h-5 text-amber-600" />
                          <div>
                            <div className="font-medium">{skill.category}</div>
                            <div className="text-sm text-gray-600">{skill.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Personalized Feedback */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Retroalimentación Personalizada
                </h3>
                <div className="space-y-3">
                  {averageEffectiveness >= 2.5 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-800">
                        ¡Excelente liderazgo! Demuestras habilidades sólidas para tomar decisiones efectivas, 
                        motivar equipos y manejar situaciones complejas. Continúa desarrollando tu capacidad de 
                        adaptarte a diferentes contextos de liderazgo.
                      </p>
                    </div>
                  )}
                  {averageEffectiveness >= 2.0 && averageEffectiveness < 2.5 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800">
                        Muestras competencia en liderazgo con buenas decisiones en la mayoría de situaciones. 
                        Podrías beneficiarte de practicar más la comunicación empática y el desarrollo de talento en tu equipo.
                      </p>
                    </div>
                  )}
                  {averageEffectiveness >= 1.5 && averageEffectiveness < 2.0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800">
                        Tu liderazgo está en desarrollo. Enfoca tu crecimiento en la toma de decisiones colaborativas 
                        y en desarrollar más confianza para manejar conflictos y crisis.
                      </p>
                    </div>
                  )}
                  {averageEffectiveness < 1.5 && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-orange-800">
                        Estás comenzando tu journey de liderazgo. Sigue practicando y observando a líderes efectivos. 
                        Enfoca en desarrollar empatía, comunicación clara y la capacidad de tomar decisiones reflexivas.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nuevos Escenarios
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-red-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  👑 Liderazgo en Acción
                </h1>
                <p className="text-sm text-gray-600">
                  Escenario {currentScenario + 1} de {LEADERSHIP_SCENARIOS.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg">{score}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <section className="container mx-auto px-4 sm:px-6 py-4">
        <Progress value={((currentScenario + 1) / LEADERSHIP_SCENARIOS.length) * 100} className="h-3" />
      </section>

      {/* Game Stats */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Efectividad</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {currentScenario > 0 ? Math.round(averageEffectiveness * 100 / 3) : 0}%
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">Puntos</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">{score}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(timeElapsed)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Progreso</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {currentScenario + 1}/{LEADERSHIP_SCENARIOS.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scenario */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              {/* Scenario Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(currentScenarioData.difficulty)}>
                    {currentScenarioData.difficulty === 'easy' && 'Fácil'}
                    {currentScenarioData.difficulty === 'medium' && 'Medio'}
                    {currentScenarioData.difficulty === 'hard' && 'Difícil'}
                  </Badge>
                  <Badge className={getCategoryColor(currentScenarioData.category)}>
                    {currentScenarioData.category}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {currentScenario + 1}/{LEADERSHIP_SCENARIOS.length}
                </div>
              </div>

              {/* Scenario Content */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                {currentScenarioData.title}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-amber-800">Contexto:</span>
                  </div>
                  <p className="text-amber-700">{currentScenarioData.context}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Situación:</span>
                  </div>
                  <p className="text-blue-700">{currentScenarioData.situation}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-red-600" />
                    <span className="font-semibold text-red-800">Desafío:</span>
                  </div>
                  <p className="text-red-700">{currentScenarioData.challenge}</p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 mb-3">¿Cómo lideras esta situación?</h3>
                {currentScenarioData.options.map((option) => (
                  <Button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={selectedOption !== null}
                    className={`w-full p-4 h-auto text-left justify-start transition-all ${
                      showResult
                        ? selectedOption === option.id
                          ? option.effectiveness === 'high'
                            ? 'bg-green-500 text-white'
                            : option.effectiveness === 'medium'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                          : option.effectiveness === 'high'
                          ? 'bg-green-100 text-green-800 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-600'
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                    variant="outline"
                  >
                    <div className="text-left w-full">
                      <div className="font-semibold mb-1">
                        {option.id.toUpperCase()}) {option.action}
                      </div>
                      <div className="text-sm opacity-75">
                        Estilo: {option.leadership_style}
                      </div>
                      {showResult && (
                        <div className="flex items-center gap-2 mt-2">
                          {getEffectivenessIcon(option.effectiveness)}
                          <span className="text-xs">
                            Efectividad: {option.effectiveness === 'high' ? 'Alta' : option.effectiveness === 'medium' ? 'Media' : 'Baja'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              {/* Result Analysis */}
              {showResult && selectedOption && (
                <div className="mt-6 space-y-4">
                  {currentScenarioData.options.map((option) => {
                    if (selectedOption === option.id) {
                      return (
                        <div key={option.id} className={`p-4 rounded-lg border ${
                          option.effectiveness === 'high' 
                            ? 'bg-green-50 border-green-200' 
                            : option.effectiveness === 'medium'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                {getEffectivenessIcon(option.effectiveness)}
                                <span className={`font-semibold ${
                                  option.effectiveness === 'high' ? 'text-green-800' : 
                                  option.effectiveness === 'medium' ? 'text-yellow-800' : 'text-red-800'
                                }`}>
                                  Tu Elección: {option.leadership_style}
                                </span>
                              </div>
                              <p className={`mb-3 ${
                                option.effectiveness === 'high' ? 'text-green-700' : 
                                option.effectiveness === 'medium' ? 'text-yellow-700' : 'text-red-700'
                              }`}>
                                <span className="font-semibold">Consecuencias:</span> {option.consequences}
                              </p>
                              <p className={`${
                                option.effectiveness === 'high' ? 'text-green-700' : 
                                option.effectiveness === 'medium' ? 'text-yellow-700' : 'text-red-700'
                              }`}>
                                <span className="font-semibold">Análisis:</span> {option.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Reset Button */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="text-center">
          <Button
            onClick={resetGame}
            variant="outline"
            className="bg-white/50 hover:bg-white/80"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar
          </Button>
        </div>
      </section>
    </div>
  );
}