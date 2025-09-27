'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen, Brain } from 'lucide-react';

interface FlashcardsGame {
  type: 'flashcards';
  cards: {
    id: string;
    front: string;
    back: string;
    difficulty?: number;
    image?: string;
  }[];
  subject?: string;
  reviewMode?: 'sequential' | 'random' | 'spaced';
}

interface FlashcardsProps {
  game: FlashcardsGame;
  onAnswer: (results: { cardId: string; knew: boolean }[]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    mastery?: number;
  };
}

export const Flashcards: React.FC<FlashcardsProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ cardId: string; knew: boolean }[]>([]);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());

  const currentCard = game.cards[currentIndex];
  const progress = ((reviewedCards.size) / game.cards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnew = (knew: boolean) => {
    const newResults = [...results, { cardId: currentCard.id, knew }];
    setResults(newResults);
    setReviewedCards(new Set([...reviewedCards, currentCard.id]));

    if (currentIndex < game.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // All cards reviewed
      onAnswer(newResults);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < game.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults([]);
    setReviewedCards(new Set());
  };

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'bg-gray-200';
    if (difficulty < 0.3) return 'bg-green-200';
    if (difficulty < 0.7) return 'bg-yellow-200';
    return 'bg-red-200';
  };

  const getCardResult = (cardId: string) => {
    const result = results.find(r => r.cardId === cardId);
    return result?.knew;
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Tarjetas de Estudio</h3>
            {game.subject && (
              <p className="text-sm text-gray-600">Tema: {game.subject}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Tarjeta {currentIndex + 1} de {game.cards.length}
            </div>
            {!showFeedback && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard */}
        {!showFeedback && currentCard && (
          <div className="relative h-64">
            <div
              className={`absolute inset-0 transition-all duration-500 transform-gpu preserve-3d cursor-pointer ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={handleFlip}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front of card */}
              <Card className={`absolute inset-0 backface-hidden ${!isFlipped ? '' : 'invisible'}`}>
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <BookOpen className="w-8 h-8 mb-4 text-blue-500" />
                  {currentCard.image && (
                    <img
                      src={currentCard.image}
                      alt="Card visual"
                      className="w-32 h-32 object-cover mb-4 rounded"
                    />
                  )}
                  <p className="text-xl font-medium text-center">
                    {currentCard.front}
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    Click para voltear
                  </p>
                  {currentCard.difficulty && (
                    <div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs ${getDifficultyColor(currentCard.difficulty)}`}>
                      Dificultad: {Math.round(currentCard.difficulty * 100)}%
                    </div>
                  )}
                </div>
              </Card>

              {/* Back of card */}
              <Card className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? '' : 'invisible'}`}>
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <Brain className="w-8 h-8 mb-4 text-green-500" />
                  <p className="text-xl font-medium text-center">
                    {currentCard.back}
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    Click para voltear
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!showFeedback && isFlipped && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => handleKnew(false)}
              variant="outline"
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-700"
            >
              No lo sabía
            </Button>
            <Button
              onClick={() => handleKnew(true)}
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700"
            >
              Lo sabía
            </Button>
          </div>
        )}

        {/* Navigation */}
        {!showFeedback && !isFlipped && (
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Button
              onClick={handleFlip}
              className="flex items-center gap-2"
            >
              Voltear Tarjeta
            </Button>
            <Button
              onClick={handleNext}
              variant="outline"
              disabled={currentIndex === game.cards.length - 1}
              className="flex items-center gap-2"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Results Summary */}
        {showFeedback && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Resumen de Estudio</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tarjetas revisadas</p>
                  <p className="text-2xl font-bold">{results.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dominio</p>
                  <p className="text-2xl font-bold">
                    {Math.round((results.filter(r => r.knew).length / results.length) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Card by card results */}
            <div className="space-y-2">
              <h4 className="font-semibold">Resultados por tarjeta:</h4>
              <div className="grid grid-cols-1 gap-2">
                {game.cards.map((card, index) => {
                  const knew = getCardResult(card.id);
                  return (
                    <div
                      key={card.id}
                      className={`p-2 rounded border ${
                        knew === true
                          ? 'bg-green-50 border-green-300'
                          : knew === false
                          ? 'bg-red-50 border-red-300'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {index + 1}. {card.front}
                        </span>
                        <span className="text-xs">
                          {knew === true ? '✓ Sabía' : knew === false ? '✗ No sabía' : 'No revisado'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {feedback && (
              <div className="p-4 rounded-lg bg-blue-50 text-blue-800">
                <p className="font-medium">Sesión de estudio completada</p>
                {feedback.mastery && (
                  <p className="text-sm">Nivel de dominio: {Math.round(feedback.mastery * 100)}%</p>
                )}
                {feedback.explanation && (
                  <p className="mt-1 text-sm">{feedback.explanation}</p>
                )}
              </div>
            )}
          </div>
        )}

        {showFeedback && onNext && (
          <div className="flex justify-end mt-6">
            <Button onClick={onNext}>
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};