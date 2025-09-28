'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface GameData {
  id: string;
  title: string;
  subject: string;
  grade: string;
  content: {
    type: string;
    questions?: any[];
    missions?: any[];
    words?: any[];
    regions?: any[];
    cards?: any[];
    problems?: any[];
    pairs?: any[];
    theme: string;
    difficulty: string;
  };
}

export default function GameDemoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameType = searchParams.get('game') || 'quiz';
  const gameId = searchParams.get('id') || 'demo';

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Simular datos del juego (en producción vendría de la API)
  useEffect(() => {
    const mockGameData: GameData = {
      id: gameId,
      title: 'Demo Game',
      subject: 'math',
      grade: 'K-2',
      content: {
        type: gameType,
        theme: 'demo',
        difficulty: 'easy',
        questions: [
          {
            id: 1,
            question: '¿Cuánto es 2 + 3?',
            options: ['4', '5', '6', '7'],
            correct: 1,
            explanation: '2 + 3 = 5',
          },
          {
            id: 2,
            question: '¿Cuánto es 4 + 1?',
            options: ['3', '4', '5', '6'],
            correct: 2,
            explanation: '4 + 1 = 5',
          },
        ],
      },
    };
    setGameData(mockGameData);
  }, [gameType, gameId]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !gameData) return;

    const question = gameData.content.questions?.[currentQuestion];
    if (!question) return;

    const isCorrect = selectedAnswer === question.correct;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (!gameData) return;

    if (currentQuestion < (gameData.content.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCompleted(false);
  };

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-600">Cargando juego...</p>
        </div>
      </div>
    );
  }

  const currentQuestionData = gameData.content.questions?.[currentQuestion];
  const totalQuestions = gameData.content.questions?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {gameData.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {gameData.subject.charAt(0).toUpperCase() +
                    gameData.subject.slice(1)}{' '}
                  • Grado {gameData.grade}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {gameData.content.difficulty === 'easy'
                  ? 'Fácil'
                  : gameData.content.difficulty === 'medium'
                    ? 'Medio'
                    : 'Difícil'}
              </Badge>
              <div className="text-right">
                <div className="text-sm text-gray-600">Puntuación</div>
                <div className="text-lg font-bold text-purple-600">
                  {score}/{totalQuestions}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!isCompleted ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">
                Pregunta {currentQuestion + 1} de {totalQuestions}
              </CardTitle>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
                  }}
                ></div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentQuestionData && (
                <>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      {currentQuestionData.question}
                    </h3>
                  </div>

                  <div className="grid gap-3">
                    {currentQuestionData.options?.map(
                      (option: string, index: number) => (
                        <Button
                          key={index}
                          variant={
                            selectedAnswer === index ? 'default' : 'outline'
                          }
                          className={`w-full p-4 text-left justify-start ${
                            showResult
                              ? index === currentQuestionData.correct
                                ? 'bg-green-100 border-green-500 text-green-800'
                                : selectedAnswer === index
                                  ? 'bg-red-100 border-red-500 text-red-800'
                                  : 'bg-gray-50'
                              : selectedAnswer === index
                                ? 'bg-purple-100 border-purple-500 text-purple-800'
                                : 'hover:bg-purple-50'
                          }`}
                          onClick={() =>
                            !showResult && handleAnswerSelect(index)
                          }
                          disabled={showResult}
                        >
                          <span className="font-medium mr-3">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {option}
                          {showResult &&
                            index === currentQuestionData.correct && (
                              <CheckCircle className="w-5 h-5 ml-auto text-green-600" />
                            )}
                          {showResult &&
                            selectedAnswer === index &&
                            index !== currentQuestionData.correct && (
                              <XCircle className="w-5 h-5 ml-auto text-red-600" />
                            )}
                        </Button>
                      ),
                    )}
                  </div>

                  {showResult && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 font-medium">
                        {selectedAnswer === currentQuestionData.correct
                          ? '¡Correcto!'
                          : 'Incorrecto'}
                      </p>
                      <p className="text-blue-700 text-sm mt-1">
                        {
                          currentQuestionData.content.questions?.[
                            currentQuestion
                          ]?.explanation
                        }
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center">
                    {!showResult ? (
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === null}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Responder
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {currentQuestion < totalQuestions - 1
                          ? 'Siguiente'
                          : 'Finalizar'}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-3xl text-green-600">
                ¡Juego Completado!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-6xl">🎉</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Puntuación: {score}/{totalQuestions}
                </h3>
                <p className="text-gray-600 mt-2">
                  {score === totalQuestions
                    ? '¡Perfecto! 🏆'
                    : score >= totalQuestions * 0.8
                      ? '¡Muy bien! 👏'
                      : score >= totalQuestions * 0.6
                        ? '¡Bien hecho! 👍'
                        : '¡Sigue practicando! 💪'}
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Jugar de Nuevo
                </Button>
                <Button
                  onClick={() => router.push('/games')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Volver a Juegos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
