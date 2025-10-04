'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, BookOpen, Lightbulb } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ReadingComprehensionProps {
  text: string;
  questions: Question[];
  onComplete?: (score: number, total: number) => void;
  onNext?: () => void;
}

export function ReadingComprehension({
  text,
  questions,
  onComplete,
  onNext,
}: ReadingComprehensionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null),
  );
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const correctAnswers = selectedAnswers.filter(
        (answer, index) => answer === questions[index].correct,
      ).length;
      const finalScore = correctAnswers;
      setScore(finalScore);
      setShowResults(true);
      onComplete?.(finalScore, questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
    setScore(0);
  };

  const currentQ = questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== null;

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Resultados de Comprensión Lectora
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-2xl font-semibold text-gray-700 mb-4">
              {percentage}% de respuestas correctas
            </div>
            <Badge
              variant={
                percentage >= 80
                  ? 'default'
                  : percentage >= 60
                    ? 'secondary'
                    : 'destructive'
              }
              className="text-lg px-4 py-2"
            >
              {percentage >= 80
                ? '¡Excelente!'
                : percentage >= 60
                  ? '¡Bien hecho!'
                  : '¡Sigue practicando!'}
            </Badge>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Revisión de respuestas:
            </h3>
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correct;

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-2">
                        {question.question}
                      </p>
                      <div className="space-y-1">
                        {question.options.map((option, optionIndex) => {
                          const isSelected = userAnswer === optionIndex;
                          const isCorrectOption =
                            optionIndex === question.correct;

                          return (
                            <div
                              key={optionIndex}
                              className={`p-2 rounded text-sm ${
                                isCorrectOption
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : isSelected && !isCorrectOption
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              {option}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestart} variant="outline">
              Intentar de nuevo
            </Button>
            {onNext && <Button onClick={onNext}>Continuar</Button>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Comprensión Lectora
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reading Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Lee el texto cuidadosamente:
            </span>
          </div>
          <div className="text-gray-800 leading-relaxed whitespace-pre-line">
            {text}
          </div>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Pregunta {currentQuestion + 1} de {questions.length}
            </h3>
            <Badge variant="outline">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              completado
            </Badge>
          </div>

          <p className="text-lg text-gray-700 font-medium">
            {currentQ.question}
          </p>

          <div className="space-y-2">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {currentQuestion + 1} de {questions.length} preguntas
          </div>
          <Button onClick={handleNext} disabled={!isAnswered} className="px-6">
            {currentQuestion < questions.length - 1 ? 'Siguiente' : 'Finalizar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
