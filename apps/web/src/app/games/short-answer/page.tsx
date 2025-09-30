'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Brain,
  Timer,
  Target,
  Sparkles,
  Heart,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Clock,
} from 'lucide-react';

interface Question {
  id: number;
  subject: string;
  question: string;
  keywords: string[];
  partialKeywords: string[];
  fullAnswer: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxPoints: number;
}

interface Answer {
  questionId: number;
  answer: string;
  score: number;
  feedback: string;
  isCorrect: boolean;
  showFeedback: boolean;
  hintsUsed: number;
}

interface GameStats {
  currentQuestion: number;
  totalScore: number;
  maxPossibleScore: number;
  timeElapsed: number;
  questionsAnswered: number;
  hintsUsed: number;
  accuracy: number;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    subject: 'Ciencias',
    question: '¿Cuál es el proceso por el cual las plantas producen su propio alimento usando la luz solar?',
    keywords: ['fotosíntesis', 'fotosintesis'],
    partialKeywords: ['luz', 'solar', 'plantas', 'alimento', 'energía', 'energia', 'clorofila', 'hojas'],
    fullAnswer: 'La fotosíntesis es el proceso por el cual las plantas usan la luz solar, agua y dióxido de carbono para producir glucosa y oxígeno.',
    hint: 'Las plantas verdes usan la luz del sol y algo que está en sus hojas verdes...',
    difficulty: 'easy',
    maxPoints: 100,
  },
  {
    id: 2,
    subject: 'Matemáticas',
    question: 'Si un triángulo tiene ángulos de 45° y 90°, ¿cuánto mide el tercer ángulo?',
    keywords: ['45', '45°', '45 grados'],
    partialKeywords: ['ángulo', 'angulo', 'triángulo', 'triangulo', 'suma', '180', 'grados'],
    fullAnswer: 'El tercer ángulo mide 45°. Los ángulos de un triángulo siempre suman 180°, entonces: 180° - 45° - 90° = 45°.',
    hint: 'Recuerda que los tres ángulos de cualquier triángulo siempre suman 180 grados...',
    difficulty: 'medium',
    maxPoints: 150,
  },
  {
    id: 3,
    subject: 'Geografía',
    question: '¿Cuál es la capital de Francia?',
    keywords: ['parís', 'paris'],
    partialKeywords: ['francia', 'ciudad', 'capital', 'europa'],
    fullAnswer: 'París es la capital y ciudad más poblada de Francia.',
    hint: 'Es conocida como la "Ciudad de la Luz" y tiene una famosa torre de hierro...',
    difficulty: 'easy',
    maxPoints: 100,
  },
  {
    id: 4,
    subject: 'Historia',
    question: '¿En qué año llegó Cristóbal Colón a América?',
    keywords: ['1492'],
    partialKeywords: ['colón', 'colon', 'cristóbal', 'cristobal', 'américa', 'america', 'descubrimiento', 'siglo XV', 'siglo 15'],
    fullAnswer: 'Cristóbal Colón llegó a América el 12 de octubre de 1492.',
    hint: 'Fue en el siglo XV, un año que termina en 92...',
    difficulty: 'medium',
    maxPoints: 150,
  },
  {
    id: 5,
    subject: 'Ciencias',
    question: '¿Cuál es la fórmula química del agua?',
    keywords: ['h2o', 'h₂o'],
    partialKeywords: ['hidrógeno', 'hidrogeno', 'oxígeno', 'oxigeno', 'agua', 'molécula', 'molecula', 'átomos', 'atomos'],
    fullAnswer: 'La fórmula química del agua es H₂O, que indica que cada molécula de agua tiene 2 átomos de hidrógeno y 1 átomo de oxígeno.',
    hint: 'Contiene dos átomos de un elemento muy ligero y uno de un elemento que respiramos...',
    difficulty: 'hard',
    maxPoints: 200,
  },
];

const TOTAL_QUESTIONS = QUESTIONS.length;
const MAX_POSSIBLE_SCORE = QUESTIONS.reduce((sum, q) => sum + q.maxPoints, 0);

export default function ShortAnswerGame() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [gameStats, setGameStats] = useState<GameStats>({
    currentQuestion: 0,
    totalScore: 0,
    maxPossibleScore: MAX_POSSIBLE_SCORE,
    timeElapsed: 0,
    questionsAnswered: 0,
    hintsUsed: 0,
    accuracy: 0,
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsedForCurrentQuestion, setHintsUsedForCurrentQuestion] = useState(0);

  // Initialize game
  const initializeGame = useCallback(() => {
    setAnswers([]);
    setCurrentAnswer('');
    setGameStats({
      currentQuestion: 0,
      totalScore: 0,
      maxPossibleScore: MAX_POSSIBLE_SCORE,
      timeElapsed: 0,
      questionsAnswered: 0,
      hintsUsed: 0,
      accuracy: 0,
    });
    setGameStarted(false);
    setGameFinished(false);
    setShowHint(false);
    setHintsUsedForCurrentQuestion(0);
  }, []);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !gameFinished) {
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
  }, [gameStarted, gameFinished]);

  // AI Grading Function
  const gradeAnswer = (userAnswer: string, question: Question): { score: number; feedback: string; isCorrect: boolean } => {
    const normalizedAnswer = userAnswer.toLowerCase().trim();

    // Check for exact keyword matches (full credit)
    const hasExactMatch = question.keywords.some(keyword =>
      normalizedAnswer.includes(keyword.toLowerCase())
    );

    if (hasExactMatch) {
      return {
        score: question.maxPoints,
        feedback: '¡Excelente! Respuesta completamente correcta.',
        isCorrect: true,
      };
    }

    // Check for partial keyword matches (partial credit)
    const partialMatches = question.partialKeywords.filter(keyword =>
      normalizedAnswer.includes(keyword.toLowerCase())
    );

    if (partialMatches.length > 0) {
      const partialScore = Math.round((partialMatches.length / question.partialKeywords.length) * question.maxPoints * 0.6);
      return {
        score: Math.max(partialScore, 20), // Minimum 20 points for partial answers
        feedback: `Bien, tu respuesta tiene elementos correctos. Palabras clave encontradas: ${partialMatches.join(', ')}. La respuesta completa es: ${question.fullAnswer}`,
        isCorrect: false,
      };
    }

    // No matches found
    return {
      score: 0,
      feedback: `Respuesta incorrecta. La respuesta correcta es: ${question.fullAnswer}`,
      isCorrect: false,
    };
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    const currentQuestion = QUESTIONS[gameStats.currentQuestion];
    const gradingResult = gradeAnswer(currentAnswer, currentQuestion);

    // Apply hint penalty
    const hintPenalty = hintsUsedForCurrentQuestion * 10;
    const finalScore = Math.max(0, gradingResult.score - hintPenalty);

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      score: finalScore,
      feedback: gradingResult.feedback,
      isCorrect: gradingResult.isCorrect,
      showFeedback: true,
      hintsUsed: hintsUsedForCurrentQuestion,
    };

    setAnswers(prev => [...prev, newAnswer]);

    // Update game stats
    setGameStats(prev => {
      const newQuestionsAnswered = prev.questionsAnswered + 1;
      const newTotalScore = prev.totalScore + finalScore;
      const newAccuracy = (newTotalScore / (newQuestionsAnswered * (MAX_POSSIBLE_SCORE / TOTAL_QUESTIONS))) * 100;

      return {
        ...prev,
        totalScore: newTotalScore,
        questionsAnswered: newQuestionsAnswered,
        accuracy: Math.round(newAccuracy),
      };
    });

    // Clear current answer and hint state
    setCurrentAnswer('');
    setShowHint(false);
    setHintsUsedForCurrentQuestion(0);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (gameStats.currentQuestion < TOTAL_QUESTIONS - 1) {
      setGameStats(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));

      // Hide feedback for the current answer
      setAnswers(prev => prev.map(answer => ({ ...answer, showFeedback: false })));
    } else {
      setGameFinished(true);
    }
  };

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (gameStats.currentQuestion > 0) {
      setGameStats(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));

      // Show feedback for the previous answer
      setAnswers(prev => prev.map((answer, index) => ({
        ...answer,
        showFeedback: index === gameStats.currentQuestion - 1
      })));
    }
  };

  // Handle hint request
  const handleShowHint = () => {
    if (!showHint) {
      setShowHint(true);
      setHintsUsedForCurrentQuestion(prev => prev + 1);
      setGameStats(prev => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
      }));
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get performance rating
  const getPerformanceRating = () => {
    const percentage = (gameStats.totalScore / gameStats.maxPossibleScore) * 100;
    if (percentage >= 90) return { stars: 3, text: '¡Excelente!', color: 'text-yellow-500' };
    if (percentage >= 70) return { stars: 2, text: '¡Muy bien!', color: 'text-blue-500' };
    if (percentage >= 50) return { stars: 1, text: '¡Bien hecho!', color: 'text-green-500' };
    return { stars: 0, text: 'Sigue practicando', color: 'text-gray-500' };
  };

  const currentQuestion = QUESTIONS[gameStats.currentQuestion];
  const currentQuestionAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const isCurrentQuestionAnswered = currentQuestionAnswer !== undefined;
  const progress = ((gameStats.currentQuestion + (isCurrentQuestionAnswered ? 1 : 0)) / TOTAL_QUESTIONS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🤖 Preguntas con IA
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Responde preguntas y la IA te califica al instante!
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

      {/* Game Progress */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Pregunta {gameStats.currentQuestion + 1} de {TOTAL_QUESTIONS}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}% completado
              </span>
            </div>
            <Progress value={progress} className="w-full h-3" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Puntuación</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {gameStats.totalScore}/{gameStats.maxPossibleScore}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Precisión</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{gameStats.accuracy}%</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Timer className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatTime(gameStats.timeElapsed)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Lightbulb className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Pistas</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{gameStats.hintsUsed}</div>
            </div>
          </div>
        </div>
      </section>

      {!gameFinished ? (
        /* Current Question */
        <section className="container mx-auto px-4 sm:px-6 pb-6">
          <Card className="bg-white/60 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  {currentQuestion.subject}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700 border-green-300' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                    'bg-red-100 text-red-700 border-red-300'
                  }`}
                >
                  {currentQuestion.difficulty === 'easy' ? 'Fácil' :
                   currentQuestion.difficulty === 'medium' ? 'Medio' : 'Difícil'}
                </Badge>
              </div>
              <CardTitle className="text-xl sm:text-2xl text-gray-900 mt-4">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Answer Input */}
              <div className="space-y-4">
                <Textarea
                  placeholder="Escribe tu respuesta aquí..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={isCurrentQuestionAnswered}
                  className="min-h-[100px] bg-white/70 border-gray-300 focus:border-blue-500"
                />

                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <Button
                    onClick={handleShowHint}
                    variant="outline"
                    disabled={showHint || isCurrentQuestionAnswered}
                    className="bg-white/50 hover:bg-purple-100 border-purple-300 text-purple-700"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    {showHint ? 'Pista mostrada' : 'Mostrar pista (-10 puntos)'}
                  </Button>

                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim() || isCurrentQuestionAnswered}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Enviar Respuesta
                  </Button>
                </div>
              </div>

              {/* Hint Display */}
              {showHint && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-purple-700 mb-1">Pista:</div>
                      <div className="text-purple-600">{currentQuestion.hint}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Display */}
              {currentQuestionAnswer && currentQuestionAnswer.showFeedback && (
                <div className={`border rounded-lg p-4 ${
                  currentQuestionAnswer.isCorrect
                    ? 'bg-green-50 border-green-200'
                    : currentQuestionAnswer.score > 0
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {currentQuestionAnswer.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          Puntuación: {currentQuestionAnswer.score}/{currentQuestion.maxPoints}
                        </span>
                        {currentQuestionAnswer.hintsUsed > 0 && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-700">
                            {currentQuestionAnswer.hintsUsed} pista(s) usada(s)
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-700">{currentQuestionAnswer.feedback}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={gameStats.currentQuestion === 0}
                  variant="outline"
                  className="bg-white/50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                <Button
                  onClick={handleNextQuestion}
                  disabled={!isCurrentQuestionAnswered}
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                >
                  {gameStats.currentQuestion === TOTAL_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        /* Results Screen */
        <section className="container mx-auto px-4 sm:px-6 pb-12">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <CardTitle className="text-3xl text-gray-900 mb-2">
                ¡Juego Completado!
              </CardTitle>
              <p className="text-gray-600">
                Has respondido todas las preguntas. ¡Revisa tu desempeño!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Performance Rating */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 text-center">
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
                <div className={`text-xl font-bold mb-2 ${getPerformanceRating().color}`}>
                  {getPerformanceRating().text}
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {gameStats.totalScore}/{gameStats.maxPossibleScore} puntos
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{gameStats.accuracy}%</div>
                  <div className="text-sm text-gray-600">Precisión</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatTime(gameStats.timeElapsed)}</div>
                  <div className="text-sm text-gray-600">Tiempo total</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{gameStats.hintsUsed}</div>
                  <div className="text-sm text-gray-600">Pistas usadas</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {answers.filter(a => a.isCorrect).length}/{TOTAL_QUESTIONS}
                  </div>
                  <div className="text-sm text-gray-600">Respuestas correctas</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={initializeGame}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
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
            </CardContent>
          </Card>
        </section>
      )}

      {/* Reset Button (always visible) */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="text-center">
          <Button
            onClick={initializeGame}
            variant="outline"
            className="bg-white/50 hover:bg-white/80"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar Juego
          </Button>
        </div>
      </section>
    </div>
  );
}