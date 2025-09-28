'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Brain,
  Clock,
  TrendingUp,
  Star,
} from 'lucide-react';

interface SRSCard {
  id: string;
  front: string;
  back: string;
  difficulty?: number;
  image?: string;
  // SRS specific fields
  easeFactor: number; // Starting at 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  dueDate: Date;
  lastReview?: Date;
  quality?: number; // Last quality rating (0-5)
  leechCount: number; // Times failed consecutively
}

interface FlashcardsSRSGame {
  type: 'flashcards-srs';
  cards: SRSCard[];
  subject?: string;
  reviewMode?: 'due' | 'new' | 'all';
  sessionTarget?: number; // Target cards for this session
}

interface FlashcardsSRSProps {
  game: FlashcardsSRSGame;
  onAnswer: (
    results: { cardId: string; quality: number; nextDue: Date }[],
  ) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    mastery?: number;
  };
}

// SM-2 Algorithm implementation
const calculateNextReview = (
  card: SRSCard,
  quality: number,
): { easeFactor: number; interval: number; repetitions: number } => {
  let { easeFactor, interval, repetitions } = card;

  // If quality < 3, reset repetitions
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  return { easeFactor, interval, repetitions };
};

const getDifficultyColor = (easeFactor: number) => {
  if (easeFactor >= 2.5) return 'bg-green-100 text-green-800';
  if (easeFactor >= 2.0) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getDifficultyLabel = (easeFactor: number) => {
  if (easeFactor >= 2.5) return 'Easy';
  if (easeFactor >= 2.0) return 'Medium';
  return 'Hard';
};

const getIntervalColor = (interval: number) => {
  if (interval >= 30) return 'text-green-600';
  if (interval >= 7) return 'text-blue-600';
  if (interval >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

export const FlashcardsSRS: React.FC<FlashcardsSRSProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<
    { cardId: string; quality: number; nextDue: Date }[]
  >([]);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [sessionCards, setSessionCards] = useState<SRSCard[]>([]);

  // Filter cards based on review mode
  useEffect(() => {
    const now = new Date();
    let filteredCards: SRSCard[] = [];

    switch (game.reviewMode) {
      case 'due':
        filteredCards = game.cards.filter((card) => card.dueDate <= now);
        break;
      case 'new':
        filteredCards = game.cards.filter((card) => card.repetitions === 0);
        break;
      default:
        filteredCards = [...game.cards];
    }

    // Limit to session target if specified
    if (game.sessionTarget && filteredCards.length > game.sessionTarget) {
      // Prioritize due cards, then by difficulty (lower ease factor first)
      filteredCards.sort((a, b) => {
        if (a.dueDate <= now && b.dueDate > now) return -1;
        if (a.dueDate > now && b.dueDate <= now) return 1;
        return a.easeFactor - b.easeFactor;
      });
      filteredCards = filteredCards.slice(0, game.sessionTarget);
    }

    setSessionCards(filteredCards);
  }, [game.cards, game.reviewMode, game.sessionTarget]);

  const currentCard = sessionCards[currentIndex];
  const progress = (reviewedCards.size / sessionCards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleQualityRating = (quality: number) => {
    if (!currentCard) return;

    const { easeFactor, interval, repetitions } = calculateNextReview(
      currentCard,
      quality,
    );
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + interval);

    const newResults = [
      ...results,
      {
        cardId: currentCard.id,
        quality,
        nextDue: nextDueDate,
      },
    ];

    setResults(newResults);
    setReviewedCards(new Set([...reviewedCards, currentCard.id]));

    // Update card locally for this session
    const updatedCard = {
      ...currentCard,
      easeFactor,
      interval,
      repetitions,
      dueDate: nextDueDate,
      lastReview: new Date(),
      quality,
      leechCount: quality < 3 ? currentCard.leechCount + 1 : 0,
    };

    // Replace in sessionCards for immediate UI updates
    const updatedSessionCards = [...sessionCards];
    updatedSessionCards[currentIndex] = updatedCard;
    setSessionCards(updatedSessionCards);

    if (currentIndex < sessionCards.length - 1) {
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
    if (currentIndex < sessionCards.length - 1) {
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

  const getSessionStats = () => {
    const now = new Date();
    const dueCards = sessionCards.filter((card) => card.dueDate <= now).length;
    const newCards = sessionCards.filter(
      (card) => card.repetitions === 0,
    ).length;
    const averageEase =
      sessionCards.reduce((sum, card) => sum + card.easeFactor, 0) /
      sessionCards.length;

    return { dueCards, newCards, averageEase };
  };

  const stats = getSessionStats();

  if (sessionCards.length === 0) {
    return (
      <Card className="p-6 max-w-2xl mx-auto text-center">
        <div className="space-y-4">
          <Star className="w-16 h-16 mx-auto text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-900">¡Todo al día!</h3>
          <p className="text-gray-600">
            No hay tarjetas programadas para revisar en este momento.
          </p>
          <div className="text-sm text-gray-500">
            Vuelve más tarde o cambia el modo de revisión.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              SRS - Repetición Espaciada
            </h3>
            {game.subject && (
              <p className="text-sm text-gray-600">Tema: {game.subject}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              {currentIndex + 1} de {sessionCards.length}
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

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {stats.dueCards}
            </div>
            <div className="text-xs text-gray-600">Pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {stats.newCards}
            </div>
            <div className="text-xs text-gray-600">Nuevas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {stats.averageEase.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">Ease Promedio</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card Info */}
        {!showFeedback && currentCard && (
          <div className="flex justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Próxima: {currentCard.interval}d</span>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs ${getDifficultyColor(currentCard.easeFactor)}`}
            >
              {getDifficultyLabel(currentCard.easeFactor)}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Rep: {currentCard.repetitions}</span>
            </div>
          </div>
        )}

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
              <Card
                className={`absolute inset-0 backface-hidden ${!isFlipped ? '' : 'invisible'}`}
              >
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
                  {currentCard.leechCount > 0 && (
                    <div className="absolute top-4 left-4 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                      Difícil: {currentCard.leechCount}x
                    </div>
                  )}
                </div>
              </Card>

              {/* Back of card */}
              <Card
                className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? '' : 'invisible'}`}
              >
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <Brain className="w-8 h-8 mb-4 text-green-500" />
                  <p className="text-xl font-medium text-center">
                    {currentCard.back}
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    ¿Qué tal lo recordaste?
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Quality Rating Buttons */}
        {!showFeedback && isFlipped && (
          <div className="space-y-2">
            <p className="text-sm text-center text-gray-600 font-medium">
              Califica tu respuesta:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleQualityRating(1)}
                variant="outline"
                className="bg-red-50 hover:bg-red-100 text-red-700 text-xs py-2"
              >
                <span className="font-bold">1</span> - Muy Difícil
                <br />
                <span className="text-xs opacity-75">No recordé nada</span>
              </Button>
              <Button
                onClick={() => handleQualityRating(2)}
                variant="outline"
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs py-2"
              >
                <span className="font-bold">2</span> - Difícil
                <br />
                <span className="text-xs opacity-75">
                  Recordé con mucha ayuda
                </span>
              </Button>
              <Button
                onClick={() => handleQualityRating(3)}
                variant="outline"
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs py-2"
              >
                <span className="font-bold">3</span> - Normal
                <br />
                <span className="text-xs opacity-75">Recordé con esfuerzo</span>
              </Button>
              <Button
                onClick={() => handleQualityRating(4)}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-2"
              >
                <span className="font-bold">4</span> - Bien
                <br />
                <span className="text-xs opacity-75">
                  Recordé sin problemas
                </span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleQualityRating(5)}
                className="bg-green-50 hover:bg-green-100 text-green-700 text-xs py-2"
              >
                <span className="font-bold">5</span> - Perfecto
                <br />
                <span className="text-xs opacity-75">
                  Respuesta inmediata y correcta
                </span>
              </Button>
              <Button
                onClick={() => handleQualityRating(0)}
                variant="outline"
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs py-2"
              >
                <span className="font-bold">0</span> - Omitir
                <br />
                <span className="text-xs opacity-75">No intenté responder</span>
              </Button>
            </div>
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
            <Button onClick={handleFlip} className="flex items-center gap-2">
              Voltear Tarjeta
            </Button>
            <Button
              onClick={handleNext}
              variant="outline"
              disabled={currentIndex === sessionCards.length - 1}
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
              <h4 className="font-semibold mb-2">Sesión de SRS Completada</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tarjetas revisadas</p>
                  <p className="text-2xl font-bold">{results.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Calidad promedio</p>
                  <p className="text-2xl font-bold">
                    {(
                      results.reduce((sum, r) => sum + r.quality, 0) /
                      results.length
                    ).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dificultades</p>
                  <p className="text-2xl font-bold">
                    {results.filter((r) => r.quality < 3).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Next review schedule */}
            <div className="space-y-2">
              <h4 className="font-semibold">Próximas revisiones:</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {results
                  .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime())
                  .map((result, index) => {
                    const card = sessionCards.find(
                      (c) => c.id === result.cardId,
                    );
                    const daysUntil = Math.ceil(
                      (result.nextDue.getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    );

                    return (
                      <div
                        key={result.cardId}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                      >
                        <span className="font-medium truncate flex-1">
                          {card?.front.substring(0, 30)}...
                        </span>
                        <span className={`ml-2 ${getIntervalColor(daysUntil)}`}>
                          {daysUntil === 0
                            ? 'Hoy'
                            : daysUntil === 1
                              ? 'Mañana'
                              : `${daysUntil}d`}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {feedback && (
              <div className="p-4 rounded-lg bg-green-50 text-green-800">
                <p className="font-medium">¡Sesión completada!</p>
                {feedback.mastery && (
                  <p className="text-sm">
                    Dominio general: {Math.round(feedback.mastery * 100)}%
                  </p>
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
            <Button onClick={onNext}>Siguiente</Button>
          </div>
        )}
      </div>
    </Card>
  );
};
