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
  Search,
  FileText,
  Target,
  CheckCircle,
  Clock,
  BookOpen,
  Lightbulb,
  Users,
} from 'lucide-react';

interface Scenario {
  id: number;
  title: string;
  description: string;
  situation: string;
  options: {
    id: string;
    text: string;
    methodology: string;
    correct: boolean;
    explanation: string;
  }[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const RESEARCH_SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: 'Estudio sobre Hábitos de Lectura',
    description: 'Una escuela quiere saber cuántos libros leen sus estudiantes al mes.',
    situation: 'El director necesita datos confiables para mejorar el programa de lectura. ¿Qué método de investigación recomiendas?',
    options: [
      {
        id: 'a',
        text: 'Enviar una encuesta a todos los estudiantes',
        methodology: 'Encuesta cuantitativa',
        correct: true,
        explanation: 'Correcto. Una encuesta permite recopilar datos numéricos de muchos estudiantes de forma eficiente y confiable.'
      },
      {
        id: 'b',
        text: 'Entrevistar solo a 5 estudiantes destacados',
        methodology: 'Entrevista cualitativa (muestra sesgada)',
        correct: false,
        explanation: 'Incorrecto. Esta muestra es muy pequeña y sesgada, no representa a toda la población estudiantil.'
      },
      {
        id: 'c',
        text: 'Observar a los estudiantes en la biblioteca',
        methodology: 'Observación directa',
        correct: false,
        explanation: 'Incorrecto. La observación no revela cuántos libros leen en casa o el tiempo total de lectura.'
      }
    ],
    category: 'Métodos Cuantitativos',
    difficulty: 'easy'
  },
  {
    id: 2,
    title: 'Efectividad de un Nuevo Método de Enseñanza',
    description: 'Un profesor quiere probar si su nuevo método mejora las calificaciones en matemáticas.',
    situation: 'Necesita comparar el rendimiento antes y después de implementar el método. ¿Cuál es el mejor diseño de investigación?',
    options: [
      {
        id: 'a',
        text: 'Comparar las calificaciones del año pasado con las actuales',
        methodology: 'Estudio retrospectivo',
        correct: false,
        explanation: 'Incorrecto. Muchas variables pueden haber cambiado entre un año y otro (estudiantes diferentes, etc.).'
      },
      {
        id: 'b',
        text: 'Usar un grupo experimental y un grupo control simultáneamente',
        methodology: 'Experimento controlado',
        correct: true,
        explanation: 'Correcto. Un experimento controlado permite comparar directamente y controlar variables externas.'
      },
      {
        id: 'c',
        text: 'Aplicar el método a todos y medir solo al final',
        methodology: 'Estudio post-test únicamente',
        correct: false,
        explanation: 'Incorrecto. Sin grupo control o medición previa, no se puede determinar si el método causó las mejoras.'
      }
    ],
    category: 'Diseño Experimental',
    difficulty: 'medium'
  },
  {
    id: 3,
    title: 'Experiencias de Estudiantes con Discapacidad',
    description: 'Una universidad quiere entender las experiencias de estudiantes con discapacidad.',
    situation: 'Se busca comprender las barreras, emociones y necesidades de este grupo. ¿Qué enfoque es más apropiado?',
    options: [
      {
        id: 'a',
        text: 'Entrevistas en profundidad con estudiantes voluntarios',
        methodology: 'Investigación cualitativa',
        correct: true,
        explanation: 'Correcto. Las entrevistas cualitativas permiten explorar experiencias complejas y emociones en profundidad.'
      },
      {
        id: 'b',
        text: 'Encuesta con preguntas de sí/no a todos los estudiantes',
        methodology: 'Encuesta cuantitativa simple',
        correct: false,
        explanation: 'Incorrecto. Las preguntas cerradas no capturan la complejidad de las experiencias personales.'
      },
      {
        id: 'c',
        text: 'Revisar solo las calificaciones y estadísticas existentes',
        methodology: 'Análisis de datos secundarios',
        correct: false,
        explanation: 'Incorrecto. Los datos cuantitativos no revelan las experiencias subjetivas ni las barreras percibidas.'
      }
    ],
    category: 'Métodos Cualitativos',
    difficulty: 'medium'
  },
  {
    id: 4,
    title: 'Relación entre Ejercicio y Rendimiento Académico',
    description: 'Un investigador quiere saber si existe relación entre la actividad física y las calificaciones.',
    situation: 'Se tienen datos de horas de ejercicio semanal y promedios académicos de 500 estudiantes. ¿Qué análisis es apropiado?',
    options: [
      {
        id: 'a',
        text: 'Calcular la correlación entre ambas variables',
        methodology: 'Análisis de correlación',
        correct: true,
        explanation: 'Correcto. La correlación mide la fuerza y dirección de la relación entre dos variables continuas.'
      },
      {
        id: 'b',
        text: 'Comparar solo los promedios de cada grupo',
        methodology: 'Comparación de medias',
        correct: false,
        explanation: 'Incorrecto. Esto no considera la naturaleza continua de ambas variables ni mide la relación.'
      },
      {
        id: 'c',
        text: 'Hacer entrevistas sobre motivación para ejercitarse',
        methodology: 'Investigación cualitativa',
        correct: false,
        explanation: 'Incorrecto. Aunque valiosa, esta aproximación no responde la pregunta sobre la relación estadística.'
      }
    ],
    category: 'Análisis Estadístico',
    difficulty: 'hard'
  },
  {
    id: 5,
    title: 'Selección de Muestra para Estudio Nacional',
    description: 'Se realizará un estudio sobre hábitos alimentarios en adolescentes mexicanos.',
    situation: 'El presupuesto permite encuestar a 2000 personas. ¿Cómo debería seleccionarse la muestra?',
    options: [
      {
        id: 'a',
        text: 'Encuestar en centros comerciales de la Ciudad de México',
        methodology: 'Muestreo por conveniencia',
        correct: false,
        explanation: 'Incorrecto. Esto sesgaría hacia adolescentes urbanos de cierto nivel socioeconómico.'
      },
      {
        id: 'b',
        text: 'Selección aleatoria estratificada por región y nivel socioeconómico',
        methodology: 'Muestreo aleatorio estratificado',
        correct: true,
        explanation: 'Correcto. Esto asegura representatividad de diferentes regiones y niveles socioeconómicos.'
      },
      {
        id: 'c',
        text: 'Publicar la encuesta en redes sociales y esperar voluntarios',
        methodology: 'Muestreo voluntario',
        correct: false,
        explanation: 'Incorrecto. Los voluntarios pueden no ser representativos de la población general.'
      }
    ],
    category: 'Muestreo',
    difficulty: 'hard'
  },
  {
    id: 6,
    title: 'Ética en Investigación con Menores',
    description: 'Un psicólogo quiere estudiar el impacto del bullying en niños de primaria.',
    situation: 'La investigación involucra temas sensibles con menores de edad. ¿Qué consideraciones éticas son prioritarias?',
    options: [
      {
        id: 'a',
        text: 'Solo obtener el consentimiento de los padres',
        methodology: 'Consentimiento parental únicamente',
        correct: false,
        explanation: 'Incorrecto. Aunque necesario, también se debe considerar el asentimiento de los niños y su bienestar.'
      },
      {
        id: 'b',
        text: 'Consentimiento parental + asentimiento infantil + protocolo de protección',
        methodology: 'Ética integral en investigación',
        correct: true,
        explanation: 'Correcto. Investigar con menores requiere múltiples capas de protección ética y consideración del bienestar.'
      },
      {
        id: 'c',
        text: 'Proceder sin avisar para obtener datos más naturales',
        methodology: 'Investigación encubierta',
        correct: false,
        explanation: 'Incorrecto. Esto viola principios éticos fundamentales, especialmente con poblaciones vulnerables.'
      }
    ],
    category: 'Ética en Investigación',
    difficulty: 'hard'
  }
];

export default function ResearchMethodsGame() {
  const router = useRouter();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [scenarioStartTime, setScenarioStartTime] = useState(0);

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

    const scenario = RESEARCH_SCENARIOS[currentScenario];
    const selectedOptionData = scenario.options.find(opt => opt.id === optionId);
    
    if (selectedOptionData?.correct) {
      setCorrectAnswers(prev => prev + 1);
      
      // Calculate score based on difficulty and time
      const timeTaken = (Date.now() - scenarioStartTime) / 1000;
      const basePoints = {
        easy: 100,
        medium: 150,
        hard: 200
      }[scenario.difficulty];
      
      const timeBonus = Math.max(0, Math.floor((120 - timeTaken) / 10) * 10); // Bonus for quick answers
      const totalPoints = basePoints + timeBonus;
      
      setScore(prev => prev + totalPoints);
    }

    // Auto advance after showing result
    setTimeout(() => {
      nextScenario();
    }, 5000);
  };

  const nextScenario = () => {
    if (currentScenario < RESEARCH_SCENARIOS.length - 1) {
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
    setCorrectAnswers(0);
    setGameStarted(false);
    setGameCompleted(false);
    setTimeElapsed(0);
    setScenarioStartTime(0);
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
      'Métodos Cuantitativos': 'bg-blue-100 text-blue-800',
      'Métodos Cualitativos': 'bg-purple-100 text-purple-800',
      'Diseño Experimental': 'bg-green-100 text-green-800',
      'Análisis Estadístico': 'bg-orange-100 text-orange-800',
      'Muestreo': 'bg-pink-100 text-pink-800',
      'Ética en Investigación': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const accuracy = RESEARCH_SCENARIOS.length > 0 
    ? Math.round((correctAnswers / Math.min(currentScenario + 1, RESEARCH_SCENARIOS.length)) * 100)
    : 0;

  const currentScenarioData = RESEARCH_SCENARIOS[currentScenario];

  if (!gameStarted && currentScenario === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Métodos de Investigación
            </h1>
            <p className="text-gray-600 mb-6">
              ¡Aprende a diseñar estudios como un científico!
            </p>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 text-left">
                • {RESEARCH_SCENARIOS.length} scenarios de investigación<br/>
                • Métodos cuantitativos y cualitativos<br/>
                • Diseño experimental y ética<br/>
                • Puntos por velocidad y precisión
              </div>
              <Button
                onClick={() => setGameStarted(true)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                ¡Empezar Investigación!
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Resultados de Investigación</h1>
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
            {/* Final Score */}
            <Card className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">¡Investigación Completada!</h2>
                <div className="text-xl mb-4">Puntuación: {score} puntos</div>
                <div className="text-lg">Precisión: {accuracy}%</div>
              </CardContent>
            </Card>

            {/* Performance Analysis */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Análisis de Rendimiento
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Correctas</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {correctAnswers}/{RESEARCH_SCENARIOS.length}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Target className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">Precisión</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
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
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Nivel de Investigador</div>
                    <div className="text-xl font-bold text-indigo-600">
                      {accuracy >= 90 ? '🎓 Investigador Experto' :
                       accuracy >= 75 ? '🔍 Investigador Competente' :
                       accuracy >= 60 ? '📚 Investigador en Formación' :
                       '🌱 Investigador Novato'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Retroalimentación
                </h3>
                <div className="space-y-3">
                  {accuracy >= 85 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-800">
                        ¡Excelente! Demuestras un sólido entendimiento de los métodos de investigación. 
                        Estás listo para diseñar estudios rigurosos.
                      </p>
                    </div>
                  )}
                  {accuracy >= 60 && accuracy < 85 && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800">
                        Buen trabajo. Tienes una base sólida, pero podrías beneficiarte de repasar 
                        algunos conceptos sobre diseño experimental y muestreo.
                      </p>
                    </div>
                  )}
                  {accuracy < 60 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800">
                        Sigue practicando. La metodología de investigación requiere tiempo para dominarla. 
                        Revisa los conceptos básicos de investigación cuantitativa y cualitativa.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nueva Investigación
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🔍 Métodos de Investigación
                </h1>
                <p className="text-sm text-gray-600">
                  Escenario {currentScenario + 1} de {RESEARCH_SCENARIOS.length}
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
        <Progress value={((currentScenario + 1) / RESEARCH_SCENARIOS.length) * 100} className="h-3" />
      </section>

      {/* Game Stats */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Correctas</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Precisión</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
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
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Progreso</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {currentScenario + 1}/{RESEARCH_SCENARIOS.length}
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
                  {currentScenario + 1}/{RESEARCH_SCENARIOS.length}
                </div>
              </div>

              {/* Scenario Content */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                {currentScenarioData.title}
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-3">
                  <span className="font-semibold">Contexto:</span> {currentScenarioData.description}
                </p>
                <p className="text-gray-800">
                  <span className="font-semibold">Situación:</span> {currentScenarioData.situation}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 mb-3">¿Cuál es tu recomendación?</h3>
                {currentScenarioData.options.map((option) => (
                  <Button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={selectedOption !== null}
                    className={`w-full p-4 h-auto text-left justify-start transition-all ${
                      showResult
                        ? selectedOption === option.id
                          ? option.correct
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : option.correct
                          ? 'bg-green-100 text-green-800 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-600'
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                    variant="outline"
                  >
                    <div className="text-left">
                      <div className="font-semibold mb-1">{option.text}</div>
                      <div className="text-sm opacity-75">
                        Método: {option.methodology}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Result Explanation */}
              {showResult && selectedOption && (
                <div className="mt-6 space-y-4">
                  {currentScenarioData.options.map((option) => {
                    if (selectedOption === option.id || option.correct) {
                      return (
                        <div key={option.id} className={`p-4 rounded-lg border ${
                          option.correct 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {option.correct ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Target className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-semibold ${
                              option.correct ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {option.id.toUpperCase()}) {option.text}
                            </span>
                          </div>
                          <p className={option.correct ? 'text-green-700' : 'text-red-700'}>
                            {option.explanation}
                          </p>
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