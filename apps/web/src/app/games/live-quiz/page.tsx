'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Clock,
  Users,
  Zap,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Player {
  id: string;
  name: string;
  score: number;
  correct: number;
  wrong: number;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: '¿Cuál es la capital de España?',
    options: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
    correct: 0,
    explanation: 'Madrid es la capital y ciudad más poblada de España.',
    difficulty: 'easy'
  },
  {
    id: 2,
    question: '¿En qué año llegó Cristóbal Colón a América?',
    options: ['1490', '1491', '1492', '1493'],
    correct: 2,
    explanation: 'Colón llegó a América el 12 de octubre de 1492.',
    difficulty: 'medium'
  },
  {
    id: 3,
    question: '¿Cuántos continentes hay en el mundo?',
    options: ['5', '6', '7', '8'],
    correct: 2,
    explanation: 'Los 7 continentes son: Asia, África, América del Norte, América del Sur, Europa, Oceanía y la Antártida.',
    difficulty: 'easy'
  },
  {
    id: 4,
    question: '¿Qué gas es más abundante en la atmósfera terrestre?',
    options: ['Oxígeno', 'Nitrógeno', 'Dióxido de carbono', 'Argón'],
    correct: 1,
    explanation: 'El nitrógeno constituye aproximadamente el 78% de la atmósfera.',
    difficulty: 'medium'
  },
  {
    id: 5,
    question: '¿Cuál es el planeta más grande del sistema solar?',
    options: ['Saturno', 'Júpiter', 'Neptuno', 'Urano'],
    correct: 1,
    explanation: 'Júpiter es el planeta más grande, con una masa mayor que todos los demás planetas combinados.',
    difficulty: 'easy'
  },
  {
    id: 6,
    question: '¿Quién escribió "Don Quijote de la Mancha"?',
    options: ['Lope de Vega', 'Miguel de Cervantes', 'Federico García Lorca', 'Calderón de la Barca'],
    correct: 1,
    explanation: 'Miguel de Cervantes Saavedra escribió esta obra maestra de la literatura española.',
    difficulty: 'hard'
  }
];

const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'Ana', score: 850, correct: 4, wrong: 1 },
  { id: '2', name: 'Carlos', score: 720, correct: 3, wrong: 2 },
  { id: '3', name: 'María', score: 680, correct: 3, wrong: 2 },
  { id: '4', name: 'Luis', score: 540, correct: 2, wrong: 3 }
];

export default function LiveQuizGame() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [players, setPlayers] = useState(MOCK_PLAYERS);
  const [playerName] = useState('Tú');
  const [playerScore, setPlayerScore] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !showResult && !gameFinished && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, showResult, gameFinished, timeLeft]);

  const handleTimeUp = () => {
    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === QUIZ_QUESTIONS[currentQuestion].correct;
    if (isCorrect) {
      const points = Math.max(100, (timeLeft * 10));
      setScore(prev => prev + points);
      setPlayerScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
    }

    // Auto advance after showing result
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(15);
    } else {
      setGameFinished(true);
      // Add player to leaderboard
      const newPlayer: Player = {
        id: 'player',
        name: playerName,
        score: playerScore,
        correct: correctAnswers,
        wrong: QUIZ_QUESTIONS.length - correctAnswers
      };
      setPlayers(prev => [...prev, newPlayer].sort((a, b) => b.score - a.score));
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(15);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(15);
    setGameStarted(false);
    setGameFinished(false);
    setCorrectAnswers(0);
    setPlayerScore(0);
    setPlayers(MOCK_PLAYERS);
  };

  const getOptionColor = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-50';
    }
    
    if (index === QUIZ_QUESTIONS[currentQuestion].correct) {
      return 'bg-green-500 text-white';
    }
    
    if (selectedAnswer === index && index !== QUIZ_QUESTIONS[currentQuestion].correct) {
      return 'bg-red-500 text-white';
    }
    
    return 'bg-gray-100';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Quiz en Vivo
            </h1>
            <p className="text-gray-600 mb-6">
              ¡Responde rápido y obtén más puntos!
            </p>
            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                • {QUIZ_QUESTIONS.length} preguntas<br/>
                • 15 segundos por pregunta<br/>
                • Más puntos por responder rápido
              </div>
              <Button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                ¡Empezar Quiz!
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

  if (gameFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
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
            <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">¡Quiz Completado!</h2>
                <div className="text-xl mb-4">Tu puntuación: {score} puntos</div>
                <div className="text-lg">Respuestas correctas: {correctAnswers}/{QUIZ_QUESTIONS.length}</div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Tabla de Líderes
                </h3>
                <div className="space-y-3">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.id === 'player' ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-sm text-gray-600">
                            {player.correct} correctas, {player.wrong} incorrectas
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-lg">{player.score}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🎯 Quiz en Vivo
                </h1>
                <p className="text-sm text-gray-600">
                  Pregunta {currentQuestion + 1} de {QUIZ_QUESTIONS.length}
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
        <Progress value={((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100} className="h-3" />
      </section>

      {/* Timer and Question */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          {/* Timer */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Tiempo restante:</span>
              </div>
              <div className={`text-2xl font-bold ${
                timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-blue-600'
              }`}>
                {timeLeft}s
              </div>
            </div>
            <Progress 
              value={(timeLeft / 15) * 100} 
              className={`h-2 mt-2 ${
                timeLeft <= 5 ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'
              }`} 
            />
          </div>

          {/* Question */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(QUIZ_QUESTIONS[currentQuestion].difficulty)}`}>
                  {QUIZ_QUESTIONS[currentQuestion].difficulty === 'easy' && 'Fácil'}
                  {QUIZ_QUESTIONS[currentQuestion].difficulty === 'medium' && 'Medio'}
                  {QUIZ_QUESTIONS[currentQuestion].difficulty === 'hard' && 'Difícil'}
                </div>
                <div className="text-sm text-gray-600">
                  {currentQuestion + 1}/{QUIZ_QUESTIONS.length}
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                {QUIZ_QUESTIONS[currentQuestion].question}
              </h2>

              {/* Options */}
              <div className="grid gap-3">
                {QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 h-auto text-left justify-start transition-all ${
                      getOptionColor(index)
                    }`}
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg">{option}</span>
                      {showResult && index === QUIZ_QUESTIONS[currentQuestion].correct && (
                        <CheckCircle className="w-5 h-5 ml-auto" />
                      )}
                      {showResult && selectedAnswer === index && index !== QUIZ_QUESTIONS[currentQuestion].correct && (
                        <XCircle className="w-5 h-5 ml-auto" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              {/* Explanation */}
              {showResult && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Explicación:</span>
                  </div>
                  <p className="text-blue-700">{QUIZ_QUESTIONS[currentQuestion].explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}