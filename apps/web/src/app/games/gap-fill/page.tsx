'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Target,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  Lightbulb,
  Award,
  Timer,
} from 'lucide-react';

interface GapFillSentence {
  id: number;
  sentence: string;
  blanks: {
    position: number;
    correctAnswer: string;
    options: string[];
  }[];
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
}

interface UserAnswer {
  sentenceId: number;
  blankIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

interface GameStats {
  currentSentence: number;
  totalSentences: number;
  correctAnswers: number;
  totalAnswers: number;
  score: number;
  timeElapsed: number;
  accuracy: number;
}

const GAP_FILL_SENTENCES: GapFillSentence[] = [
  {
    id: 1,
    sentence: "El Sol es una _____ que nos da luz y calor durante el _____.",
    blanks: [
      {
        position: 13,
        correctAnswer: "estrella",
        options: ["planeta", "estrella", "luna"]
      },
      {
        position: 50,
        correctAnswer: "día",
        options: ["noche", "día", "año"]
      }
    ],
    subject: "Ciencias",
    difficulty: "easy",
    emoji: "☀️"
  },
  {
    id: 2,
    sentence: "Los dinosaurios vivieron hace millones de _____ y algunos eran _____ mientras otros eran herbívoros.",
    blanks: [
      {
        position: 45,
        correctAnswer: "años",
        options: ["días", "meses", "años"]
      },
      {
        position: 67,
        correctAnswer: "carnívoros",
        options: ["pequeños", "carnívoros", "voladores"]
      }
    ],
    subject: "Historia",
    difficulty: "medium",
    emoji: "🦕"
  },
  {
    id: 3,
    sentence: "Para sumar fracciones con el mismo denominador, sumamos los _____ y mantenemos el mismo _____.",
    blanks: [
      {
        position: 66,
        correctAnswer: "numeradores",
        options: ["denominadores", "numeradores", "enteros"]
      },
      {
        position: 95,
        correctAnswer: "denominador",
        options: ["numerador", "denominador", "resultado"]
      }
    ],
    subject: "Matemáticas",
    difficulty: "hard",
    emoji: "🔢"
  },
  {
    id: 4,
    sentence: "El agua se evapora cuando se calienta y se convierte en _____, luego se condensa y forma las _____.",
    blanks: [
      {
        position: 63,
        correctAnswer: "vapor",
        options: ["hielo", "vapor", "lluvia"]
      },
      {
        position: 96,
        correctAnswer: "nubes",
        options: ["estrellas", "montañas", "nubes"]
      }
    ],
    subject: "Ciencias",
    difficulty: "medium",
    emoji: "💧"
  },
  {
    id: 5,
    sentence: "Cristóbal Colón llegó a América en el año _____ navegando hacia el _____ en busca de una nueva ruta.",
    blanks: [
      {
        position: 43,
        correctAnswer: "1492",
        options: ["1485", "1492", "1500"]
      },
      {
        position: 63,
        correctAnswer: "oeste",
        options: ["norte", "este", "oeste"]
      }
    ],
    subject: "Historia",
    difficulty: "hard",
    emoji: "🚢"
  }
];

export default function GapFillGame() {
  const router = useRouter();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [gameStats, setGameStats] = useState<GameStats>({
    currentSentence: 1,
    totalSentences: GAP_FILL_SENTENCES.length,
    correctAnswers: 0,
    totalAnswers: 0,
    score: 0,
    timeElapsed: 0,
    accuracy: 0,
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answersChecked, setAnswersChecked] = useState(false);

  const currentSentence = GAP_FILL_SENTENCES[currentSentenceIndex];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setCurrentSentenceIndex(0);
    setUserAnswers([]);
    setSelectedAnswers({});
    setGameStats({
      currentSentence: 1,
      totalSentences: GAP_FILL_SENTENCES.length,
      correctAnswers: 0,
      totalAnswers: 0,
      score: 0,
      timeElapsed: 0,
      accuracy: 0,
    });
    setGameStarted(false);
    setGameCompleted(false);
    setShowResults(false);
    setAnswersChecked(false);
  }, []);

  // Handle option selection
  const handleOptionSelect = (blankIndex: number, option: string) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    const key = `${currentSentence.id}-${blankIndex}`;
    setSelectedAnswers(prev => ({
      ...prev,
      [key]: option
    }));

    setAnswersChecked(false);
  };

  // Check answers for current sentence
  const checkAnswers = () => {
    const currentAnswers: UserAnswer[] = [];
    let correctCount = 0;

    currentSentence.blanks.forEach((blank, index) => {
      const key = `${currentSentence.id}-${index}`;
      const selectedAnswer = selectedAnswers[key];
      const isCorrect = selectedAnswer === blank.correctAnswer;

      if (selectedAnswer) {
        currentAnswers.push({
          sentenceId: currentSentence.id,
          blankIndex: index,
          selectedAnswer,
          isCorrect
        });

        if (isCorrect) {
          correctCount++;
        }
      }
    });

    setUserAnswers(prev => [...prev, ...currentAnswers]);
    setGameStats(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + correctCount,
      totalAnswers: prev.totalAnswers + currentAnswers.length,
      accuracy: Math.round(((prev.correctAnswers + correctCount) / (prev.totalAnswers + currentAnswers.length)) * 100),
      score: prev.score + (correctCount * 10) + (correctCount === currentSentence.blanks.length ? 5 : 0), // Bonus for perfect sentence
    }));

    setAnswersChecked(true);
  };

  // Move to next sentence
  const nextSentence = () => {
    if (currentSentenceIndex < GAP_FILL_SENTENCES.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setGameStats(prev => ({
        ...prev,
        currentSentence: prev.currentSentence + 1,
      }));
      setAnswersChecked(false);

      // Clear selected answers for new sentence
      const newSelectedAnswers = { ...selectedAnswers };
      currentSentence.blanks.forEach((_, index) => {
        const key = `${currentSentence.id}-${index}`;
        delete newSelectedAnswers[key];
      });
      setSelectedAnswers(newSelectedAnswers);
    } else {
      // Game completed
      setGameCompleted(true);
      setShowResults(true);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get performance rating
  const getPerformanceRating = () => {
    if (gameStats.accuracy >= 90) return { stars: 3, text: '¡Excelente!', color: 'text-green-600' };
    if (gameStats.accuracy >= 70) return { stars: 2, text: '¡Muy bien!', color: 'text-yellow-600' };
    return { stars: 1, text: '¡Sigue practicando!', color: 'text-blue-600' };
  };

  // Render sentence with blanks
  const renderSentenceWithBlanks = () => {
    if (!currentSentence) return null;

    let sentence = currentSentence.sentence;
    const parts = [];
    let lastIndex = 0;

    // Sort blanks by position to process them in order
    const sortedBlanks = [...currentSentence.blanks].sort((a, b) => a.position - b.position);

    sortedBlanks.forEach((blank, blankIndex) => {
      const originalBlankIndex = currentSentence.blanks.findIndex(b => b.position === blank.position);

      // Add text before blank
      if (blank.position > lastIndex) {
        parts.push(
          <span key={`text-${blankIndex}`} className="text-gray-800">
            {sentence.substring(lastIndex, blank.position)}
          </span>
        );
      }

      // Add blank (dropdown or selected answer)
      const key = `${currentSentence.id}-${originalBlankIndex}`;
      const selectedAnswer = selectedAnswers[key];
      const userAnswer = userAnswers.find(a => a.sentenceId === currentSentence.id && a.blankIndex === originalBlankIndex);

      let blankContent;
      if (answersChecked && userAnswer) {
        // Show result after checking
        blankContent = (
          <span
            key={`blank-${blankIndex}`}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-semibold ${
              userAnswer.isCorrect
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-red-100 text-red-800 border-2 border-red-300'
            }`}
          >
            {userAnswer.isCorrect ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {selectedAnswer}
            {!userAnswer.isCorrect && (
              <span className="text-xs ml-2 text-green-700">
                ({blank.correctAnswer})
              </span>
            )}
          </span>
        );
      } else if (selectedAnswer) {
        // Show selected answer
        blankContent = (
          <span
            key={`blank-${blankIndex}`}
            className="inline-flex items-center px-3 py-1 rounded-lg font-semibold bg-blue-100 text-blue-800 border-2 border-blue-300"
          >
            {selectedAnswer}
          </span>
        );
      } else {
        // Show placeholder
        blankContent = (
          <span
            key={`blank-${blankIndex}`}
            className="inline-flex items-center px-3 py-1 rounded-lg font-semibold bg-gray-100 text-gray-500 border-2 border-gray-300 border-dashed"
          >
            _____
          </span>
        );
      }

      parts.push(blankContent);

      // Find the end of the blank word
      const words = sentence.substring(blank.position).split(' ');
      const blankWord = words[0];
      lastIndex = blank.position + blankWord.length;
    });

    // Add remaining text
    if (lastIndex < sentence.length) {
      parts.push(
        <span key="text-end" className="text-gray-800">
          {sentence.substring(lastIndex)}
        </span>
      );
    }

    return <div className="text-lg leading-relaxed">{parts}</div>;
  };

  // Check if all blanks are filled
  const allBlanksFilled = currentSentence?.blanks.every((_, index) => {
    const key = `${currentSentence.id}-${index}`;
    return selectedAnswers[key];
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🧩 Completa las Oraciones
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Llena los espacios en blanco con las respuestas correctas!
                </p>
              </div>
            </div>

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

      {/* Progress and Stats */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progreso: {gameStats.currentSentence}/{gameStats.totalSentences}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round((currentSentenceIndex / GAP_FILL_SENTENCES.length) * 100)}%
              </span>
            </div>
            <Progress
              value={(currentSentenceIndex / GAP_FILL_SENTENCES.length) * 100}
              className="h-3"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Precisión</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{gameStats.accuracy}%</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Correctas</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{gameStats.correctAnswers}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Puntos</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{gameStats.score}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Timer className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(gameStats.timeElapsed)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Area */}
      {!showResults && currentSentence && (
        <section className="container mx-auto px-4 sm:px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            {/* Sentence Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentSentence.emoji}</span>
                <div>
                  <Badge className={getDifficultyColor(currentSentence.difficulty)}>
                    {currentSentence.difficulty === 'easy' && 'Fácil'}
                    {currentSentence.difficulty === 'medium' && 'Medio'}
                    {currentSentence.difficulty === 'hard' && 'Difícil'}
                  </Badge>
                  <Badge variant="outline" className="ml-2 bg-white/50">
                    {currentSentence.subject}
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Oración {currentSentenceIndex + 1} de {GAP_FILL_SENTENCES.length}
              </div>
            </div>

            {/* Sentence with Blanks */}
            <Card className="mb-6 bg-white/70 backdrop-blur-sm border border-white/30">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  {renderSentenceWithBlanks()}
                </div>
              </CardContent>
            </Card>

            {/* Answer Options */}
            {!answersChecked && (
              <div className="space-y-6">
                {currentSentence.blanks.map((blank, blankIndex) => {
                  const key = `${currentSentence.id}-${blankIndex}`;
                  const selectedAnswer = selectedAnswers[key];

                  return (
                    <Card key={blankIndex} className="bg-white/70 backdrop-blur-sm border border-white/30">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Espacio en blanco #{blankIndex + 1}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {blank.options.map((option, optionIndex) => (
                            <Button
                              key={optionIndex}
                              variant={selectedAnswer === option ? "default" : "outline"}
                              onClick={() => handleOptionSelect(blankIndex, option)}
                              className={`p-4 h-auto text-left justify-start transition-all ${
                                selectedAnswer === option
                                  ? 'bg-indigo-500 text-white hover:bg-indigo-600 ring-2 ring-indigo-300'
                                  : 'bg-white/50 hover:bg-white/80 hover:border-indigo-300'
                              }`}
                            >
                              <span className="w-6 h-6 rounded-full border-2 border-current mr-3 flex items-center justify-center text-xs">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              {option}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {!answersChecked ? (
                <Button
                  onClick={checkAnswers}
                  disabled={!allBlanksFilled}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
                  size="lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Verificar Respuestas
                </Button>
              ) : (
                <Button
                  onClick={nextSentence}
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                  size="lg"
                >
                  {currentSentenceIndex < GAP_FILL_SENTENCES.length - 1 ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Siguiente Oración
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Ver Resultados
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={initializeGame}
                variant="outline"
                className="bg-white/50 hover:bg-white/80"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reiniciar Juego
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full mx-auto shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              {/* Celebration Animation */}
              <div className="text-6xl mb-4 animate-bounce">
                🎉
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ¡Juego Completado!
              </h2>

              <p className="text-gray-600 mb-6">
                Has completado todas las oraciones
              </p>

              {/* Performance Rating */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="flex justify-center gap-1 mb-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-8 h-8 ${
                        i < getPerformanceRating().stars
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className={`text-xl font-semibold mb-4 ${getPerformanceRating().color}`}>
                  {getPerformanceRating().text}
                </div>

                {/* Final Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="text-center">
                    <div className="text-gray-600">Precisión</div>
                    <div className="text-2xl font-bold text-blue-600">{gameStats.accuracy}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Puntos</div>
                    <div className="text-2xl font-bold text-yellow-600">{gameStats.score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Correctas</div>
                    <div className="text-2xl font-bold text-green-600">
                      {gameStats.correctAnswers}/{gameStats.totalAnswers}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Tiempo</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatTime(gameStats.timeElapsed)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentence Review */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Resumen por Materia</h3>
                <div className="space-y-2">
                  {['Ciencias', 'Historia', 'Matemáticas'].map(subject => {
                    const subjectSentences = GAP_FILL_SENTENCES.filter(s => s.subject === subject);
                    const subjectAnswers = userAnswers.filter(a =>
                      subjectSentences.some(s => s.id === a.sentenceId)
                    );
                    const correctSubject = subjectAnswers.filter(a => a.isCorrect).length;
                    const totalSubject = subjectAnswers.length;
                    const subjectAccuracy = totalSubject > 0 ? Math.round((correctSubject / totalSubject) * 100) : 0;

                    return (
                      <div key={subject} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>
                            {subject === 'Ciencias' && '🔬'}
                            {subject === 'Historia' && '📚'}
                            {subject === 'Matemáticas' && '🔢'}
                          </span>
                          <span>{subject}</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          subjectAccuracy >= 80
                            ? 'bg-green-100 text-green-800'
                            : subjectAccuracy >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subjectAccuracy}% ({correctSubject}/{totalSubject})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={initializeGame}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Jugar de Nuevo
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}