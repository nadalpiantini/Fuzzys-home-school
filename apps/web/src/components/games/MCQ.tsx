'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import type { MCQGame } from '@/types/game-types';

interface MCQProps {
  game: MCQGame;
  onAnswer: (answer: string | string[]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    correctAnswer?: string[];
  };
}

export const MCQ: React.FC<MCQProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);

  // Shuffle choices to randomize order
  const shuffledChoices = useMemo(() => {
    if (!game.choices) return [];
    return [...game.choices].sort(() => Math.random() - 0.5);
  }, [game.choices]);

  const isMultiple =
    game.multipleAnswers ||
    (game.choices?.filter((c) => c.correct).length || 0) > 1;

  const handleSelect = (choiceId: string) => {
    if (showFeedback) return;

    if (isMultiple) {
      setSelectedAnswers((prev) =>
        prev.includes(choiceId)
          ? prev.filter((id) => id !== choiceId)
          : [...prev, choiceId],
      );
    } else {
      setSelectedAnswers([choiceId]);
    }
  };

  const handleSubmit = () => {
    onAnswer(isMultiple ? selectedAnswers : selectedAnswers[0]);
  };

  const getChoiceStyle = (choiceId: string) => {
    if (!showFeedback) {
      return selectedAnswers.includes(choiceId)
        ? 'border-blue-500 bg-blue-50'
        : 'hover:border-gray-400';
    }

    const isCorrect = feedback?.correctAnswer?.includes(choiceId);
    const isSelected = selectedAnswers.includes(choiceId);

    if (isCorrect) {
      return 'border-green-500 bg-green-50';
    } else if (isSelected) {
      return 'border-red-500 bg-red-50';
    }
    return '';
  };

  const getChoiceIcon = (choiceId: string) => {
    if (!showFeedback) return null;

    const isCorrect = feedback?.correctAnswer?.includes(choiceId);
    const isSelected = selectedAnswers.includes(choiceId);

    if (isCorrect) {
      return <Check className="w-5 h-5 text-green-600" />;
    } else if (isSelected) {
      return <X className="w-5 h-5 text-red-600" />;
    }
    return null;
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-900">{game.stem}</div>

        {isMultiple && !showFeedback && (
          <p className="text-sm text-gray-500">
            Selecciona todas las respuestas correctas
          </p>
        )}

        <div className="space-y-3">
          {shuffledChoices
            ?.filter((choice) => choice?.id)
            .map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleSelect(choice.id!)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between ${getChoiceStyle(choice.id!)}`}
              >
                <span>{choice.text}</span>
                {getChoiceIcon(choice.id!)}
              </button>
            ))}
        </div>

        {showFeedback && feedback && (
          <div
            className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
          >
            <p className="font-medium">
              {feedback.correct ? '¡Correcto!' : 'Incorrecto'}
            </p>
            {feedback.explanation && (
              <p className="mt-1 text-sm">{feedback.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswers.length === 0}
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
