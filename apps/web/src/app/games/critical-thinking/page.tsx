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
  Brain,
  Lightbulb,
  Target,
  CheckCircle,
  Clock,
  Eye,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface Exercise {
  id: number;
  title: string;
  type: 'logical-fallacy' | 'argument-analysis' | 'pattern-recognition' | 'assumption-testing';
  problem: string;
  question: string;
  options: {
    id: string;
    text: string;
    correct: boolean;
    explanation: string;
  }[];
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

const CRITICAL_THINKING_EXERCISES: Exercise[] = [
  {
    id: 1,
    title: 'Falacia Ad Hominem',
    type: 'logical-fallacy',
    problem: 'En un debate sobre cambio climático, Juan dice: "No debemos creer en los argumentos de María sobre el calentamiento global porque ella siempre ha sido una persona muy negativa y pesimista."',
    question: '¿Qué error lógico comete Juan?',
    options: [
      {
        id: 'a',
        text: 'Ataca la personalidad de María en lugar de sus argumentos',
        correct: true,
        explanation: 'Correcto. Juan comete una falacia ad hominem al atacar el carácter de María en lugar de evaluar la validez de sus argumentos sobre el cambio climático.'
      },
      {
        id: 'b',
        text: 'Usa demasiados datos científicos',
        correct: false,
        explanation: 'Incorrecto. Juan no presenta datos científicos, sino que hace un ataque personal.'
      },
      {
        id: 'c',
        text: 'Generaliza a partir de un solo caso',
        correct: false,
        explanation: 'Incorrecto. Aunque podría haber generalización, el error principal es el ataque personal.'
      }
    ],
    difficulty: 'easy',
    hint: 'Piensa en si Juan evalúa las ideas o a la persona.'
  },
  {
    id: 2,
    title: 'Análisis de Correlación vs. Causalidad',
    type: 'argument-analysis',
    problem: 'Un estudio muestra que las ciudades con más iglesias tienen más crimen. El alcalde concluye: "Debemos cerrar iglesias para reducir el crimen."',
    question: '¿Qué problema tiene este razonamiento?',
    options: [
      {
        id: 'a',
        text: 'Confunde correlación con causalidad',
        correct: true,
        explanation: 'Correcto. El alcalde asume que las iglesias causan crimen, cuando probablemente ambas variables están relacionadas con el tamaño de la población.'
      },
      {
        id: 'b',
        text: 'No considera suficientes datos',
        correct: false,
        explanation: 'Incorrecto. El problema no es la cantidad de datos, sino la interpretación de la relación entre variables.'
      },
      {
        id: 'c',
        text: 'Usa un lenguaje demasiado técnico',
        correct: false,
        explanation: 'Incorrecto. El lenguaje no es el problema; es la lógica del argumento.'
      }
    ],
    difficulty: 'medium',
    hint: '¿Las iglesias realmente causan crimen, o hay otra explicación?'
  },
  {
    id: 3,
    title: 'Reconocimiento de Patrones',
    type: 'pattern-recognition',
    problem: 'Secuencia: 2, 6, 18, 54, ?',
    question: '¿Cuál es el siguiente número en la secuencia?',
    options: [
      {
        id: 'a',
        text: '162',
        correct: true,
        explanation: 'Correcto. Cada número se multiplica por 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162.'
      },
      {
        id: 'b',
        text: '108',
        correct: false,
        explanation: 'Incorrecto. 108 sería si sumáramos 54, pero el patrón es multiplicativo.'
      },
      {
        id: 'c',
        text: '216',
        correct: false,
        explanation: 'Incorrecto. 216 sería si multiplicáramos por 4, pero el patrón es multiplicar por 3.'
      }
    ],
    difficulty: 'easy',
    hint: 'Observa la relación entre números consecutivos.'
  },
  {
    id: 4,
    title: 'Suposiciones Ocultas',
    type: 'assumption-testing',
    problem: 'Laura dice: "Todos los estudiantes que sacan buenas calificaciones estudian mucho. Como Pedro saca buenas calificaciones, debe estudiar mucho."',
    question: '¿Qué suposición implícita hace Laura?',
    options: [
      {
        id: 'a',
        text: 'Que estudiar mucho es la única forma de sacar buenas calificaciones',
        correct: true,
        explanation: 'Correcto. Laura asume que estudiar mucho es la única causa de buenas calificaciones, ignorando otros factores como inteligencia natural o métodos de estudio eficientes.'
      },
      {
        id: 'b',
        text: 'Que Pedro es un estudiante promedio',
        correct: false,
        explanation: 'Incorrecto. Laura no hace ninguna asunción sobre si Pedro es promedio o no.'
      },
      {
        id: 'c',
        text: 'Que las calificaciones no son importantes',
        correct: false,
        explanation: 'Incorrecto. Laura claramente considera que las calificaciones son relevantes.'
      }
    ],
    difficulty: 'medium',
    hint: '¿Hay otras razones por las que alguien podría tener buenas calificaciones?'
  },
  {
    id: 5,
    title: 'Falacia de Falsa Dicotomía',
    type: 'logical-fallacy',
    problem: 'En una reunión escolar, el director dice: "O implementamos uniformes escolares, o tendremos problemas de disciplina graves."',
    question: '¿Qué error lógico comete el director?',
    options: [
      {
        id: 'a',
        text: 'Presenta solo dos opciones cuando podría haber más alternativas',
        correct: true,
        explanation: 'Correcto. El director crea una falsa dicotomía al presentar solo dos opciones extremas, ignorando soluciones intermedias o alternativas.'
      },
      {
        id: 'b',
        text: 'No presenta evidencia suficiente',
        correct: false,
        explanation: 'Incorrecto. Aunque podría necesitar más evidencia, el error principal es limitar las opciones.'
      },
      {
        id: 'c',
        text: 'Usa un lenguaje demasiado formal',
        correct: false,
        explanation: 'Incorrecto. El estilo de lenguaje no es el problema lógico.'
      }
    ],
    difficulty: 'medium',
    hint: '¿Realmente solo hay dos opciones posibles?'
  },
  {
    id: 6,
    title: 'Análisis de Evidencia',
    type: 'argument-analysis',
    problem: 'Una empresa de vitaminas afirma: "El 90% de nuestros clientes reporta sentirse mejor después de tomar nuestro producto." Este testimonio aparece en su página web.',
    question: '¿Por qué deberíamos ser cautelosos con esta afirmación?',
    options: [
      {
        id: 'a',
        text: 'Posible sesgo en la selección y presentación de testimonios',
        correct: true,
        explanation: 'Correcto. La empresa tiene motivos para presentar solo testimonios positivos, y "sentirse mejor" es subjetivo y puede estar influenciado por efecto placebo.'
      },
      {
        id: 'b',
        text: 'El porcentaje es demasiado alto para ser creíble',
        correct: false,
        explanation: 'Incorrecto. Un 90% podría ser posible, pero el problema es la metodología y posible sesgo.'
      },
      {
        id: 'c',
        text: 'No incluye información sobre el precio del producto',
        correct: false,
        explanation: 'Incorrecto. El precio no es relevante para evaluar la validez de la afirmación sobre efectividad.'
      }
    ],
    difficulty: 'hard',
    hint: 'Piensa en quién presenta la información y sus intereses.'
  },
  {
    id: 7,
    title: 'Razonamiento Deductivo',
    type: 'pattern-recognition',
    problem: 'Premisa 1: Todos los mamíferos tienen corazón. Premisa 2: Los perros son mamíferos. Conclusión: ?',
    question: '¿Qué conclusión se puede deducir lógicamente?',
    options: [
      {
        id: 'a',
        text: 'Los perros tienen corazón',
        correct: true,
        explanation: 'Correcto. Usando razonamiento deductivo: si todos los mamíferos tienen corazón y los perros son mamíferos, entonces los perros tienen corazón.'
      },
      {
        id: 'b',
        text: 'Todos los animales con corazón son perros',
        correct: false,
        explanation: 'Incorrecto. Esto invierte la lógica y crearía una conclusión demasiado amplia.'
      },
      {
        id: 'c',
        text: 'Solo los mamíferos tienen corazón',
        correct: false,
        explanation: 'Incorrecto. Las premisas no excluyen que otros animales también tengan corazón.'
      }
    ],
    difficulty: 'easy',
    hint: 'Sigue la lógica paso a paso desde las premisas.'
  },
  {
    id: 8,
    title: 'Sesgo de Confirmación',
    type: 'assumption-testing',
    problem: 'Roberto cree que los jóvenes de hoy son irresponsables. Solo lee artículos que hablan de problemas juveniles y evita noticias sobre jóvenes exitosos.',
    question: '¿Qué sesgo cognitivo muestra Roberto?',
    options: [
      {
        id: 'a',
        text: 'Sesgo de confirmación: busca información que confirme sus creencias',
        correct: true,
        explanation: 'Correcto. Roberto muestra sesgo de confirmación al buscar selectivamente información que apoya su creencia preexistente.'
      },
      {
        id: 'b',
        text: 'Exceso de confianza en fuentes de noticias',
        correct: false,
        explanation: 'Incorrecto. El problema no es confiar demasiado en las fuentes, sino seleccionar información sesgadamente.'
      },
      {
        id: 'c',
        text: 'Falta de interés en temas juveniles',
        correct: false,
        explanation: 'Incorrecto. Roberto sí muestra interés, pero de manera sesgada.'
      }
    ],
    difficulty: 'hard',
    hint: '¿Cómo selecciona Roberto la información que consume?'
  }
];

export default function CriticalThinkingGame() {
  const router = useRouter();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [exerciseStartTime, setExerciseStartTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

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

  // Exercise timer
  useEffect(() => {
    if (gameStarted && !showResult) {
      setExerciseStartTime(Date.now());
    }
  }, [currentExercise, gameStarted]);

  const handleOptionSelect = (optionId: string) => {
    if (selectedOption !== null || showResult) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    setSelectedOption(optionId);
    setShowResult(true);

    const exercise = CRITICAL_THINKING_EXERCISES[currentExercise];
    const selectedOptionData = exercise.options.find(opt => opt.id === optionId);
    
    if (selectedOptionData?.correct) {
      setCorrectAnswers(prev => prev + 1);
      
      // Calculate score based on difficulty, time, and hint usage
      const timeTaken = (Date.now() - exerciseStartTime) / 1000;
      const basePoints = {
        easy: 100,
        medium: 150,
        hard: 200
      }[exercise.difficulty];
      
      const timeBonus = Math.max(0, Math.floor((90 - timeTaken) / 10) * 10);
      const hintPenalty = showHint ? 25 : 0;
      const totalPoints = Math.max(basePoints - hintPenalty + timeBonus, basePoints / 2);
      
      setScore(prev => prev + totalPoints);
    }

    // Auto advance after showing result
    setTimeout(() => {
      nextExercise();
    }, 5000);
  };

  const handleShowHint = () => {
    if (!showHint) {
      setShowHint(true);
      setHintsUsed(prev => prev + 1);
    }
  };

  const nextExercise = () => {
    if (currentExercise < CRITICAL_THINKING_EXERCISES.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setCurrentExercise(0);
    setSelectedOption(null);
    setShowResult(false);
    setShowHint(false);
    setScore(0);
    setCorrectAnswers(0);
    setGameStarted(false);
    setGameCompleted(false);
    setTimeElapsed(0);
    setExerciseStartTime(0);
    setHintsUsed(0);
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

  const getTypeColor = (type: string) => {
    const colors = {
      'logical-fallacy': 'bg-red-100 text-red-800',
      'argument-analysis': 'bg-blue-100 text-blue-800',
      'pattern-recognition': 'bg-green-100 text-green-800',
      'assumption-testing': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'logical-fallacy': 'Falacia Lógica',
      'argument-analysis': 'Análisis de Argumentos',
      'pattern-recognition': 'Reconocimiento de Patrones',
      'assumption-testing': 'Prueba de Suposiciones'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const accuracy = CRITICAL_THINKING_EXERCISES.length > 0 
    ? Math.round((correctAnswers / Math.min(currentExercise + 1, CRITICAL_THINKING_EXERCISES.length)) * 100)
    : 0;

  const currentExerciseData = CRITICAL_THINKING_EXERCISES[currentExercise];

  if (!gameStarted && currentExercise === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🧠</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Pensamiento Crítico
            </h1>
            <p className="text-gray-600 mb-6">
              ¡Desarrolla tus habilidades de razonamiento lógico!
            </p>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 text-left">
                • {CRITICAL_THINKING_EXERCISES.length} ejercicios de razonamiento<br/>
                • Falacias lógicas y análisis de argumentos<br/>
                • Reconocimiento de patrones<br/>
                • Pistas disponibles (con penalización)
              </div>
              <Button
                onClick={() => setGameStarted(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                size="lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                ¡Empezar a Pensar!
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
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Resultados del Pensamiento Crítico</h1>
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
            <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">¡Ejercicios Completados!</h2>
                <div className="text-xl mb-4">Puntuación: {score} puntos</div>
                <div className="text-lg">Precisión: {accuracy}%</div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Análisis de Habilidades
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Correctas</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {correctAnswers}/{CRITICAL_THINKING_EXERCISES.length}
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

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">Pistas</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{hintsUsed}</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Nivel de Pensador Crítico</div>
                    <div className="text-xl font-bold text-purple-600">
                      {accuracy >= 90 ? '🏆 Pensador Magistral' :
                       accuracy >= 75 ? '🧠 Pensador Avanzado' :
                       accuracy >= 60 ? '📝 Pensador Competente' :
                       '🌱 Pensador en Desarrollo'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Breakdown */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Áreas de Habilidad</h3>
                <div className="space-y-3">
                  {[
                    { type: 'logical-fallacy', label: 'Identificación de Falacias', icon: AlertCircle },
                    { type: 'argument-analysis', label: 'Análisis de Argumentos', icon: Eye },
                    { type: 'pattern-recognition', label: 'Reconocimiento de Patrones', icon: Target },
                    { type: 'assumption-testing', label: 'Evaluación de Suposiciones', icon: Brain }
                  ].map((skill) => {
                    const exercises = CRITICAL_THINKING_EXERCISES.filter(ex => ex.type === skill.type);
                    const correctInType = exercises.slice(0, currentExercise + 1)
                      .filter((ex, idx) => {
                        const exerciseIdx = CRITICAL_THINKING_EXERCISES.findIndex(e => e.id === ex.id);
                        return exerciseIdx <= currentExercise && exerciseIdx < correctAnswers;
                      }).length;
                    const accuracyInType = exercises.length > 0 ? Math.round((correctInType / exercises.length) * 100) : 0;
                    
                    return (
                      <div key={skill.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <skill.icon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">{skill.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{correctInType}/{exercises.length}</span>
                          <Badge className={getTypeColor(skill.type)}>
                            {accuracyInType}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Retroalimentación
                </h3>
                <div className="space-y-3">
                  {accuracy >= 85 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsUp className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Excelente Pensamiento Crítico</span>
                      </div>
                      <p className="text-green-700">
                        Demuestras habilidades sólidas para identificar falacias, analizar argumentos y evaluar evidencia. 
                        ¡Sigue desarrollando estas habilidades!
                      </p>
                    </div>
                  )}
                  {accuracy >= 60 && accuracy < 85 && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800">
                        Tienes una buena base en pensamiento crítico. Podrías beneficiarte de practicar más el 
                        reconocimiento de sesgos cognitivos y falacias lógicas.
                      </p>
                    </div>
                  )}
                  {accuracy < 60 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800">
                        Sigue practicando. El pensamiento crítico se desarrolla con el tiempo. Enfréntate en 
                        identificar suposiciones ocultas y evaluar la calidad de la evidencia.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nuevos Ejercicios
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🧠 Pensamiento Crítico
                </h1>
                <p className="text-sm text-gray-600">
                  Ejercicio {currentExercise + 1} de {CRITICAL_THINKING_EXERCISES.length}
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
        <Progress value={((currentExercise + 1) / CRITICAL_THINKING_EXERCISES.length) * 100} className="h-3" />
      </section>

      {/* Game Stats */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Pistas</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{hintsUsed}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Brain className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Progreso</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {currentExercise + 1}/{CRITICAL_THINKING_EXERCISES.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exercise */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              {/* Exercise Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(currentExerciseData.difficulty)}>
                    {currentExerciseData.difficulty === 'easy' && 'Fácil'}
                    {currentExerciseData.difficulty === 'medium' && 'Medio'}
                    {currentExerciseData.difficulty === 'hard' && 'Difícil'}
                  </Badge>
                  <Badge className={getTypeColor(currentExerciseData.type)}>
                    {getTypeLabel(currentExerciseData.type)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {currentExercise + 1}/{CRITICAL_THINKING_EXERCISES.length}
                </div>
              </div>

              {/* Exercise Content */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                {currentExerciseData.title}
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 leading-relaxed">
                  {currentExerciseData.problem}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">
                  {currentExerciseData.question}
                </h3>
              </div>

              {/* Hint */}
              {currentExerciseData.hint && (
                <div className="mb-6">
                  {!showHint ? (
                    <Button
                      onClick={handleShowHint}
                      variant="outline"
                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Mostrar Pista (-25 puntos)
                    </Button>
                  ) : (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">Pista:</span>
                      </div>
                      <p className="text-yellow-700">{currentExerciseData.hint}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                {currentExerciseData.options.map((option) => (
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
                      <div className="font-semibold mb-1">
                        {option.id.toUpperCase()}) {option.text}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Result Explanation */}
              {showResult && selectedOption && (
                <div className="mt-6">
                  {currentExerciseData.options.map((option) => {
                    if (selectedOption === option.id || option.correct) {
                      return (
                        <div key={option.id} className={`p-4 rounded-lg border mb-3 ${
                          option.correct 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {option.correct ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
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