'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ShortAnswerProps {
  question: string;
  onAnswer: (answer: string) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    score: number;
    maxScore: number;
    explanation?: string;
    modelAnswer?: string;
  };
  maxLength?: number;
  placeholder?: string;
}

export const ShortAnswer: React.FC<ShortAnswerProps> = ({
  question,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback,
  maxLength = 500,
  placeholder = 'Escribe tu respuesta aquí...',
}) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onAnswer(answer);
    }
  };

  const remainingChars = maxLength - answer.length;

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-900">{question}</div>

        <div className="space-y-2">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={placeholder}
            className="min-h-[150px] resize-none"
            maxLength={maxLength}
            disabled={showFeedback}
          />

          {!showFeedback && (
            <p className="text-sm text-gray-500 text-right">
              {remainingChars} caracteres restantes
            </p>
          )}
        </div>

        {showFeedback && feedback && (
          <div className="space-y-3">
            <div
              className={`p-4 rounded-lg ${feedback.score === feedback.maxScore ? 'bg-green-50' : feedback.score > 0 ? 'bg-yellow-50' : 'bg-red-50'}`}
            >
              <p className="font-medium">
                Puntuación: {feedback.score}/{feedback.maxScore}
              </p>
              {feedback.explanation && (
                <p className="mt-1 text-sm">{feedback.explanation}</p>
              )}
            </div>

            {feedback.modelAnswer && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">
                  Respuesta modelo:
                </p>
                <p className="text-sm text-blue-800">{feedback.modelAnswer}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="ml-auto"
            >
              Enviar Respuesta
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
