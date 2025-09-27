'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { GapFillGame } from '@fuzzy/game-engine';

interface GapFillProps {
  game: GapFillGame;
  onAnswer: (answer: string[]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    score: number;
    maxScore: number;
    explanation?: string;
    correctAnswer?: string[][];
  };
}

export const GapFill: React.FC<GapFillProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback
}) => {
  // Split text by gaps and create input state
  const textParts = game.text.split('_____');
  const [answers, setAnswers] = useState<string[]>(
    new Array(textParts.length - 1).fill('')
  );

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    onAnswer(answers);
  };

  const getInputStyle = (index: number) => {
    if (!showFeedback) return '';

    const userAnswer = answers[index] || '';
    const acceptableAnswers = feedback?.correctAnswer?.[index] || [];
    const isCorrect = game.caseSensitive
      ? acceptableAnswers.includes(userAnswer)
      : acceptableAnswers.some(a => a.toLowerCase() === userAnswer.toLowerCase());

    return isCorrect
      ? 'border-green-500 bg-green-50'
      : 'border-red-500 bg-red-50';
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-900">
          Completa los espacios en blanco
        </div>

        {!game.caseSensitive && (
          <p className="text-sm text-gray-500">
            Las respuestas no distinguen entre mayúsculas y minúsculas
          </p>
        )}

        <div className="text-base leading-relaxed">
          {textParts.map((part, index) => (
            <React.Fragment key={index}>
              <span>{part}</span>
              {index < textParts.length - 1 && (
                <Input
                  type="text"
                  value={answers[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  disabled={showFeedback}
                  className={`inline-flex w-32 mx-1 px-2 py-1 ${getInputStyle(index)}`}
                  placeholder="..."
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {showFeedback && feedback && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
              <p className="font-medium">
                {feedback.correct ? '¡Perfecto!' : `${feedback.score}/${feedback.maxScore} espacios correctos`}
              </p>
              {feedback.explanation && (
                <p className="mt-1 text-sm">{feedback.explanation}</p>
              )}
            </div>

            {!feedback.correct && feedback.correctAnswer && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">Respuestas correctas:</p>
                <ul className="space-y-1">
                  {feedback.correctAnswer.map((acceptableAnswers, index) => (
                    <li key={index} className="text-sm text-blue-800">
                      Espacio {index + 1}: {acceptableAnswers.join(' o ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={answers.some(a => !a.trim())}
              className="ml-auto"
            >
              Verificar Respuesta
            </Button>
          ) : (
            onNext && (
              <Button onClick={onNext} className="ml-auto">
                Siguiente
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  );
};