'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import type { TrueFalseGame } from '@fuzzy/game-engine';

interface TrueFalseProps {
  game: TrueFalseGame;
  onAnswer: (answer: boolean) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    correctAnswer?: boolean;
  };
}

export const TrueFalse: React.FC<TrueFalseProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

  const handleSelect = (answer: boolean) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onAnswer(selectedAnswer);
    }
  };

  const getButtonStyle = (answer: boolean) => {
    if (!showFeedback) {
      return selectedAnswer === answer
        ? answer
          ? 'border-green-500 bg-green-50'
          : 'border-red-500 bg-red-50'
        : 'hover:border-gray-400';
    }

    if (feedback?.correctAnswer === answer) {
      return 'border-green-500 bg-green-50';
    } else if (selectedAnswer === answer) {
      return 'border-red-500 bg-red-50';
    }
    return 'opacity-50';
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-lg font-medium text-gray-900">
          {game.statement}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSelect(true)}
            disabled={showFeedback}
            className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${getButtonStyle(true)}`}
          >
            <Check className="w-8 h-8" />
            <span className="text-lg font-medium">Verdadero</span>
          </button>

          <button
            onClick={() => handleSelect(false)}
            disabled={showFeedback}
            className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${getButtonStyle(false)}`}
          >
            <X className="w-8 h-8" />
            <span className="text-lg font-medium">Falso</span>
          </button>
        </div>

        {showFeedback && feedback && (
          <div className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-medium">
              {feedback.correct ? '¡Correcto!' : 'Incorrecto'}
            </p>
            {feedback.explanation && (
              <p className="mt-1 text-sm">{feedback.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-between">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
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