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
  Check,
  X,
  Clock,
  Target,
  Brain,
  Lightbulb,
} from 'lucide-react';

interface Question {
  id: number;
  statement: string;
  correct: boolean;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const TRUE_FALSE_QUESTIONS: Question[] = [
  {
    id: 1,
    statement: 'El sol es una estrella.',
    correct: true,
    explanation: 'Correcto. El Sol es una estrella de tamaño mediano que se encuentra en el centro de nuestro sistema solar.',
    category: 'Ciencias',
    difficulty: 'easy'
  },
  {
    id: 2,
    statement: 'Los pingüinos pueden volar.',
    correct: false,
    explanation: 'Falso. Los pingüinos son aves que no pueden volar, pero son excelentes nadadores.',
    category: 'Naturaleza',
    difficulty: 'easy'
  },
  {
    id: 3,
    statement: 'La capital de Francia es París.',
    correct: true,
    explanation: 'Correcto. París es la capital y la ciudad más poblada de Francia.',
    category: 'Geografía',
    difficulty: 'easy'
  },
  {
    id: 4,
    statement: 'El agua hierve a 50 grados Celsius.',
    correct: false,
    explanation: 'Falso. El agua hierve a 100 grados Celsius (212 grados Fahrenheit) al nivel del mar.',
    category: 'Ciencias',
    difficulty: 'medium'
  },
  {
    id: 5,
    statement: 'Miguel de Cervantes escribió "Romeo y Julieta".',
    correct: false,
    explanation: 'Falso. "Romeo y Julieta" fue escrita por William Shakespeare. Cervantes escribió "Don Quijote de la Mancha".',
    category: 'Literatura',
    difficulty: 'medium'
  },
  {
    id: 6,
    statement: 'Los murciélagos son mamíferos.',
    correct: true,
    explanation: 'Correcto. Los murciélagos son los únicos mamíferos capaces de volar.',
    category: 'Naturaleza',
    difficulty: 'medium'
  },
  {
    id: 7,
    statement: 'El ADN fue descubierto en el siglo XXI.',
    correct: false,
    explanation: 'Falso. El ADN fue descubierto por Friedrich Miescher en 1869, aunque su estructura fue determinada por Watson y Crick en 1953.',
    category: 'Ciencias',
    difficulty: 'hard'
  },
  {
    id: 8,
    statement: 'La Gran Muralla China es visible desde el espacio.',
    correct: false,
    explanation: 'Falso. Contrario a la creencia popular, la Gran Muralla China no es visible desde el espacio a simple vista.',
    category: 'Historia',
    difficulty: 'hard'
  },
  {
    id: 9,
    statement: 'El corazón humano tiene cuatro cámaras.',
    correct: true,
    explanation: 'Correcto. El corazón humano tiene cuatro cámaras: dos aurículas y dos ventrículos.',
    category: 'Ciencias',
    difficulty: 'medium'
  },
  {
    id: 10,
    statement: 'Júpiter es el planeta más pequeño del sistema solar.',
    correct: false,
    explanation: 'Falso. Júpiter es el planeta más grande del sistema solar. Mercurio es el más pequeño.',
    category: 'Ciencias',
    difficulty: 'easy'
  }
];

export default function TrueFalseGame() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

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

  const handleAnswer = (answer: boolean) => {
    if (selectedAnswer !== null || showResult) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    setSelectedAnswer(answer);
    setShowResult(true);

    const question = TRUE_FALSE_QUESTIONS[currentQuestion];
    const isCorrect = answer === question.correct;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });
      
      // Calculate score with streak bonus
      const basePoints = 100;
      const difficultyBonus = {
        easy: 0,
        medium: 25,
        hard: 50
      }[question.difficulty];
      const streakBonus = Math.min(streak * 10, 100);
      const totalPoints = basePoints + difficultyBonus + streakBonus;
      
      setScore(prev => prev + totalPoints);
    } else {
      setWrongAnswers(prev => prev + 1);
      setStreak(0);
    }

    // Auto advance after showing result
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestion < TRUE_FALSE_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setGameStarted(false);
    setGameCompleted(false);
    setTimeElapsed(0);
    setStreak(0);
    setMaxStreak(0);
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
      'Ciencias': 'bg-blue-100 text-blue-800',
      'Naturaleza': 'bg-green-100 text-green-800',
      'Geografía': 'bg-purple-100 text-purple-800',
      'Literatura': 'bg-pink-100 text-pink-800',
      'Historia': 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const accuracy = (correctAnswers + wrongAnswers) > 0 
    ? Math.round((correctAnswers / (correctAnswers + wrongAnswers)) * 100)
    : 0;

  const currentQuestionData = TRUE_FALSE_QUESTIONS[currentQuestion];

  if (!gameStarted && currentQuestion === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Verdadero o Falso
            </h1>
            <p className="text-gray-600 mb-6">
              ¡Pon a prueba tus conocimientos!
            </p>
            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                • {TRUE_FALSE_QUESTIONS.length} preguntas<br/>
                • Gana puntos por respuestas correctas<br/>
                • Bonus por rachas consecutivas
              </div>
              <Button
                onClick={() => setGameStarted(true)}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                size="lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                ¡Empezar!
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
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Resultados Finales</h1>
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
            <Card className="mb-6 bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">¡Juego Completado!</h2>
                <div className="text-xl mb-4">Puntuación Final: {score} puntos</div>
                <div className="text-lg">Precisión: {accuracy}%</div>
              </CardContent>
            </Card>

            {/* Detailed Stats */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Estadísticas Detalladas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Correctas</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <X className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">Incorrectas</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Racha Máxima</div>
                      <div className="text-xl font-bold text-yellow-600">{maxStreak} consecutivas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Promedio por Pregunta</div>
                      <div className="text-xl font-bold text-blue-600">
                        {Math.round(score / TRUE_FALSE_QUESTIONS.length)} pts
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Rating */}
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-8 h-8 ${
                        accuracy >= 90
                          ? 'text-yellow-400 fill-yellow-400'
                          : accuracy >= 70
                          ? i < 2 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          : i < 1 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xl font-semibold text-gray-700">
                  {accuracy >= 90
                    ? '¡Excelente! Dominas estos temas' 
                    : accuracy >= 70 
                    ? '¡Muy bien! Conocimiento sólido' 
                    : accuracy >= 50
                    ? '¡Buen intento! Sigue practicando'
                    : '¡No te rindas! La práctica hace al maestro'}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Jugar de Nuevo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  ✅ Verdadero o Falso
                </h1>
                <p className="text-sm text-gray-600">
                  Pregunta {currentQuestion + 1} de {TRUE_FALSE_QUESTIONS.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg">{score}</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-800">{streak}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <section className="container mx-auto px-4 sm:px-6 py-4">
        <Progress value={((currentQuestion + 1) / TRUE_FALSE_QUESTIONS.length) * 100} className="h-3" />
      </section>

      {/* Game Stats */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Correctas</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <X className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-700">Incorrectas</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
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
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Racha</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{streak}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Question */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(currentQuestionData.difficulty)}>
                    {currentQuestionData.difficulty === 'easy' && 'Fácil'}
                    {currentQuestionData.difficulty === 'medium' && 'Medio'}
                    {currentQuestionData.difficulty === 'hard' && 'Difícil'}
                  </Badge>
                  <Badge className={getCategoryColor(currentQuestionData.category)}>
                    {currentQuestionData.category}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {currentQuestion + 1}/{TRUE_FALSE_QUESTIONS.length}
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 text-center">
                {currentQuestionData.statement}
              </h2>

              {/* Answer Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleAnswer(true)}
                  disabled={selectedAnswer !== null}
                  className={`px-8 py-6 text-lg font-semibold transition-all ${
                    showResult
                      ? selectedAnswer === true
                        ? currentQuestionData.correct
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : currentQuestionData.correct
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-600'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  size="lg"
                >
                  <Check className="w-6 h-6 mr-2" />
                  Verdadero
                </Button>

                <Button
                  onClick={() => handleAnswer(false)}
                  disabled={selectedAnswer !== null}
                  className={`px-8 py-6 text-lg font-semibold transition-all ${
                    showResult
                      ? selectedAnswer === false
                        ? !currentQuestionData.correct
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : !currentQuestionData.correct
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-600'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  size="lg"
                >
                  <X className="w-6 h-6 mr-2" />
                  Falso
                </Button>
              </div>

              {/* Explanation */}
              {showResult && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Explicación:</span>
                  </div>
                  <p className="text-blue-700">{currentQuestionData.explanation}</p>
                  
                  {selectedAnswer === currentQuestionData.correct && streak > 1 && (
                    <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-800">
                          ¡Racha de {streak}! +{Math.min(streak * 10, 100)} puntos bonus
                        </span>
                      </div>
                    </div>
                  )}
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