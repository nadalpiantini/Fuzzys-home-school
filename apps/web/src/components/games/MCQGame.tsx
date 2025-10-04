'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Trophy, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { useGameProgress } from '@/hooks/useGameProgress';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: string;
}

interface MCQGameData {
  title: string;
  description: string;
  questions: MCQQuestion[];
  metadata: {
    subject: string;
    grade: number;
    estimatedTime: string;
    learningObjectives: string[];
  };
}

interface MCQGameProps {
  gameData: MCQGameData;
  onComplete: (
    score: number,
    totalQuestions: number,
    timeSpent: number,
  ) => void;
}

export default function MCQGame({ gameData, onComplete }: MCQGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const { addGameSession } = useGameProgress();

  const currentQuestion = gameData.questions[currentQuestionIndex];

  // Shuffle options for each question to randomize order
  const shuffledOptions = useMemo(() => {
    if (!currentQuestion?.options) return [];
    return [...currentQuestion.options].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  // Create mapping from shuffled index to original index
  const originalIndexMap = useMemo(() => {
    if (!currentQuestion?.options) return {};
    const map: Record<number, number> = {};
    shuffledOptions.forEach((option, shuffledIndex) => {
      const originalIndex = currentQuestion.options.indexOf(option);
      map[shuffledIndex] = originalIndex;
    });
    return map;
  }, [currentQuestion, shuffledOptions]);

  const progress =
    ((currentQuestionIndex + 1) / gameData.questions.length) * 100;

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Por favor selecciona una respuesta');
      return;
    }

    // Convert shuffled index back to original index for comparison
    const originalAnswerIndex = originalIndexMap[selectedAnswer];
    const isCorrect = originalAnswerIndex === currentQuestion.correct;
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: originalAnswerIndex,
    };
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
      toast.success('¡Correcto! 🎉');
    } else {
      toast.error('Incorrecto. Revisa la explicación.');
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < gameData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Game completed
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const finalScore =
        score + (selectedAnswer === currentQuestion.correct ? 1 : 0);
      setGameCompleted(true);

      // Save game session to progress
      addGameSession({
        gameId: `mcq-${Date.now()}`,
        gameType: 'mcq',
        subject: gameData.metadata.subject,
        grade: gameData.metadata.grade,
        score: finalScore,
        totalQuestions: gameData.questions.length,
        timeSpent,
        difficulty: currentQuestion.difficulty,
      });

      onComplete(finalScore, gameData.questions.length, timeSpent);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Medio';
      case 'hard':
        return 'Difícil';
      default:
        return 'Medio';
    }
  };

  if (gameCompleted) {
    const finalScore =
      score + (selectedAnswer === currentQuestion.correct ? 1 : 0);
    const percentage = Math.round(
      (finalScore / gameData.questions.length) * 100,
    );
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {percentage >= 80 ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : percentage >= 60 ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <Brain className="h-16 w-16 text-blue-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {percentage >= 80
                ? '¡Excelente trabajo!'
                : percentage >= 60
                  ? '¡Bien hecho!'
                  : '¡Sigue practicando!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {finalScore}/{gameData.questions.length}
                </div>
                <div className="text-sm text-blue-800">Preguntas correctas</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {percentage}%
                </div>
                <div className="text-sm text-green-800">Puntuación</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.floor(timeSpent / 60)}:
                  {(timeSpent % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-purple-800">Tiempo</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Objetivos de aprendizaje:
              </h3>
              <div className="flex flex-wrap gap-2">
                {gameData.metadata.learningObjectives.map(
                  (objective, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {objective}
                    </Badge>
                  ),
                )}
              </div>
            </div>

            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              size="lg"
            >
              Jugar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{gameData.title}</h1>
            <p className="text-gray-600">{gameData.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm text-gray-600">
                {gameData.metadata.estimatedTime}
              </span>
            </div>
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {getDifficultyText(currentQuestion.difficulty)}
            </Badge>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Pregunta {currentQuestionIndex + 1} de {gameData.questions.length}
            </span>
            <span>
              Puntuación: {score}/{currentQuestionIndex}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shuffledOptions.map((option, shuffledIndex) => {
              const originalIndex = originalIndexMap[shuffledIndex];
              const isCorrectAnswer = originalIndex === currentQuestion.correct;
              const isSelected = selectedAnswer === shuffledIndex;

              return (
                <button
                  key={shuffledIndex}
                  onClick={() => handleAnswerSelect(shuffledIndex)}
                  disabled={showExplanation}
                  className={`w-full p-8 text-center rounded-lg border-2 transition-all min-h-[120px] flex items-center justify-center ${
                    isSelected
                      ? showExplanation
                        ? isCorrectAnswer
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : 'border-red-500 bg-red-50 text-red-800'
                        : 'border-blue-500 bg-blue-50 text-blue-800'
                      : showExplanation && isCorrectAnswer
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? showExplanation
                            ? isCorrectAnswer
                              ? 'border-green-500 bg-green-500'
                              : 'border-red-500 bg-red-500'
                            : 'border-blue-500 bg-blue-500'
                          : showExplanation && isCorrectAnswer
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                      {showExplanation && isCorrectAnswer && !isSelected && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Explicación:</h4>
              <p className="text-blue-700">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex justify-end mt-6">
            {!showExplanation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                size="lg"
              >
                Responder
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="lg">
                {currentQuestionIndex < gameData.questions.length - 1
                  ? 'Siguiente'
                  : 'Finalizar'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
