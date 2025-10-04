'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, RotateCcw } from 'lucide-react';

interface Question {
  q: string;
  options: string[];
  correct: number[]; // Array de índices de respuestas correctas
}

interface MCQSimpleProps {
  questions: Question[];
  onSubmit?: (result: { score: number; total: number }) => void;
  title?: string;
  showResults?: boolean;
}

const MCQSimple: React.FC<MCQSimpleProps> = ({
  questions,
  onSubmit,
  title = 'Quiz',
  showResults = true,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[][]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasMultipleCorrect = currentQuestion?.correct.length > 1;

  const handleOptionSelect = (optionIndex: number) => {
    if (showFeedback) return;

    if (hasMultipleCorrect) {
      // Múltiples respuestas permitidas
      setSelectedAnswers(prev =>
        prev.includes(optionIndex)
          ? prev.filter(idx => idx !== optionIndex)
          : [...prev, optionIndex]
      );
    } else {
      // Solo una respuesta permitida
      setSelectedAnswers([optionIndex]);
    }
  };

  const isCorrectAnswer = (userAnswer: number[], correctAnswer: number[]) => {
    if (userAnswer.length !== correctAnswer.length) return false;
    return userAnswer.sort().every((val, idx) => val === correctAnswer.sort()[idx]);
  };

  const handleSubmitAnswer = () => {
    setShowFeedback(true);

    // Guardar la respuesta del usuario
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = [...selectedAnswers];
    setUserAnswers(newUserAnswers);

    // Verificar si es correcta
    const isCorrect = isCorrectAnswer(selectedAnswers, currentQuestion.correct);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Quiz completado
      setIsQuizComplete(true);
      const finalScore = score + (isCorrectAnswer(selectedAnswers, currentQuestion.correct) ? 1 : 0);

      if (onSubmit) {
        onSubmit({
          score: finalScore,
          total: questions.length
        });
      }
    } else {
      // Siguiente pregunta
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setShowFeedback(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setUserAnswers([]);
    setShowFeedback(false);
    setIsQuizComplete(false);
    setScore(0);
  };

  const getOptionStyle = (optionIndex: number) => {
    if (!showFeedback) {
      return selectedAnswers.includes(optionIndex)
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50';
    }

    const isCorrect = currentQuestion.correct.includes(optionIndex);
    const isSelected = selectedAnswers.includes(optionIndex);

    if (isCorrect) {
      return 'border-green-500 bg-green-50 text-green-700';
    } else if (isSelected) {
      return 'border-red-500 bg-red-50 text-red-700';
    }
    return 'border-gray-200 bg-gray-50 text-gray-500';
  };

  const getOptionIcon = (optionIndex: number) => {
    if (!showFeedback) return null;

    const isCorrect = currentQuestion.correct.includes(optionIndex);
    const isSelected = selectedAnswers.includes(optionIndex);

    if (isCorrect) {
      return <Check className="w-5 h-5 text-green-600" />;
    } else if (isSelected) {
      return <X className="w-5 h-5 text-red-600" />;
    }
    return null;
  };

  if (isQuizComplete && showResults) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">¡Quiz Completado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-blue-600">
              {score}/{questions.length}
            </div>
            <div className="text-lg text-gray-600">
              {percentage}% de respuestas correctas
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            percentage >= 70
              ? 'bg-green-50 text-green-800'
              : percentage >= 50
                ? 'bg-yellow-50 text-yellow-800'
                : 'bg-red-50 text-red-800'
          }`}>
            {percentage >= 70 && '🎉 ¡Excelente trabajo!'}
            {percentage >= 50 && percentage < 70 && '👍 ¡Buen esfuerzo!'}
            {percentage < 50 && '💪 ¡Sigue practicando!'}
          </div>

          <Button
            onClick={handleRestart}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No hay preguntas disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="text-sm text-gray-500">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-lg font-medium text-gray-900">
          {currentQuestion.q}
        </div>

        {hasMultipleCorrect && !showFeedback && (
          <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            💡 Esta pregunta tiene múltiples respuestas correctas
          </p>
        )}

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between ${getOptionStyle(index)}`}
            >
              <span className="font-medium">{option}</span>
              {getOptionIcon(index)}
            </button>
          ))}
        </div>

        {showFeedback && (
          <div className={`p-4 rounded-lg ${
            isCorrectAnswer(selectedAnswers, currentQuestion.correct)
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <p className="font-medium">
              {isCorrectAnswer(selectedAnswers, currentQuestion.correct)
                ? '✅ ¡Correcto!'
                : '❌ Incorrecto'
              }
            </p>
            {!isCorrectAnswer(selectedAnswers, currentQuestion.correct) && (
              <p className="mt-1 text-sm">
                La respuesta correcta es: {currentQuestion.correct.map(idx => currentQuestion.options[idx]).join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500">
            Puntuación: {score}/{currentQuestionIndex + (showFeedback ? 1 : 0)}
          </div>

          {!showFeedback ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswers.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Verificar Respuesta
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLastQuestion ? 'Finalizar Quiz' : 'Siguiente Pregunta'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MCQSimple;