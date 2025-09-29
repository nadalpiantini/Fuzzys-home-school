'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Timer, RotateCcw } from 'lucide-react';
import type { MemoryCardsGame } from '@/types/game-types';
import {
  useMobileDetection,
  triggerHapticFeedback,
} from '@/lib/hooks/useMobileDetection';
import { useTouchGestures } from '@/lib/hooks/useTouchGestures';

interface MemoryCardsProps {
  game: MemoryCardsGame;
  onAnswer: (moves: number, time: number) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    score?: number;
  };
}

interface CardItem {
  id: string;
  content: string;
  image?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryCards: React.FC<MemoryCardsProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback,
}) => {
  const { isTouchDevice, isMobile, hasHapticFeedback } = useMobileDetection();
  const safePairs = useMemo(() => game.pairs ?? [], [game.pairs]);
  const safeGridSize = game.gridSize ?? { cols: 4, rows: 4 };
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Initialize and shuffle cards
    const cardPairs: CardItem[] = [];
    safePairs.forEach((pair) => {
      // Add front card
      cardPairs.push({
        id: (pair?.id || '') + '-front',
        content: pair?.front || '',
        image: pair?.image,
        isFlipped: false,
        isMatched: false,
      });
      // Add back card (matching pair)
      cardPairs.push({
        id: (pair?.id || '') + '-back',
        content: pair?.back || '',
        image: pair?.image,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setStartTime(Date.now());
  }, [game.pairs, safePairs]);

  useEffect(() => {
    if (!isComplete && matchedPairs < safePairs.length) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, isComplete, matchedPairs, safePairs.length]);

  useEffect(() => {
    if (matchedPairs === safePairs.length && matchedPairs > 0) {
      setIsComplete(true);
      onAnswer(moves, elapsedTime);
    }
  }, [matchedPairs, safePairs.length, moves, elapsedTime, onAnswer]);

  const handleCardClick = (index: number) => {
    if (showFeedback || isComplete) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedCards.length === 2) return;

    // Haptic feedback for card flip
    if (isTouchDevice && hasHapticFeedback) {
      triggerHapticFeedback('light');
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      checkForMatch(newFlippedCards[0], newFlippedCards[1]);
    }
  };

  // Touch gesture handlers
  const { gestureState, touchHandlers } = useTouchGestures({
    enableHaptics: true,
    onTap: (point, event) => {
      const cardElement = (event.target as Element).closest(
        '[data-card-index]',
      );
      if (cardElement) {
        const index = parseInt(
          (cardElement as HTMLElement).dataset.cardIndex || '0',
        );
        handleCardClick(index);
      }
    },
    onSwipe: (direction, velocity) => {
      // Optional: Add swipe gestures for card navigation or game controls
      if (direction === 'down' && velocity > 0.5) {
        // Maybe show hint or pause game
      }
    },
  });

  const checkForMatch = (index1: number, index2: number) => {
    const card1 = cards[index1];
    const card2 = cards[index2];

    // Extract pair ID from card ID (remove -front or -back suffix)
    const pairId1 = card1.id.replace('-front', '').replace('-back', '');
    const pairId2 = card2.id.replace('-front', '').replace('-back', '');

    if (pairId1 === pairId2) {
      // Match found
      setTimeout(() => {
        const newCards = [...cards];
        newCards[index1].isMatched = true;
        newCards[index2].isMatched = true;
        setCards(newCards);
        setMatchedPairs(matchedPairs + 1);
        setFlippedCards([]);
      }, 500);
    } else {
      // No match - flip cards back
      setTimeout(() => {
        const newCards = [...cards];
        newCards[index1].isFlipped = false;
        newCards[index2].isFlipped = false;
        setCards(newCards);
        setFlippedCards([]);
      }, 1000);
    }
  };

  const handleReset = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const reset = shuffled.map((card) => ({
      ...card,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(reset);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCardContent = (card: CardItem) => {
    if (!card.isFlipped && !card.isMatched) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-white text-4xl font-bold">?</span>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-2">
        {card.image && (
          <img
            src={card.image}
            alt={card.content}
            className="w-16 h-16 object-cover mb-2"
          />
        )}
        <span className="text-sm font-medium text-center">{card.content}</span>
      </div>
    );
  };

  return (
    <Card className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div
        className="space-y-4"
        {...(isTouchDevice
          ? {
              onTouchStart: (e) => touchHandlers.onTouchStart(e.nativeEvent),
              onTouchMove: (e) => touchHandlers.onTouchMove(e.nativeEvent),
              onTouchEnd: (e) => touchHandlers.onTouchEnd(e.nativeEvent),
              onTouchCancel: (e) => touchHandlers.onTouchCancel(e.nativeEvent),
            }
          : {})}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Header - Responsive Layout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Juego de Memoria
          </h3>

          {/* Stats - Mobile Optimized */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 px-2 py-1 rounded">
              <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
            <div className="bg-blue-100 px-2 py-1 rounded">
              Movimientos: <span className="font-bold">{moves}</span>
            </div>
            <div className="bg-green-100 px-2 py-1 rounded">
              Pares:{' '}
              <span className="font-bold">
                {matchedPairs}/{safePairs.length}
              </span>
            </div>
            {!showFeedback && !isComplete && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 min-h-[32px] text-xs"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                {isMobile ? 'Reset' : 'Reiniciar'}
              </Button>
            )}
          </div>
        </div>

        {/* Instructions for mobile */}
        {isTouchDevice && !isComplete && (
          <div className="text-xs text-center text-gray-600 bg-blue-50 p-2 rounded">
            🎯 Toca las cartas para voltearlas y encuentra los pares
          </div>
        )}

        {/* Cards Grid - Mobile Responsive */}
        <div
          className={`grid gap-2 sm:gap-3 lg:gap-4 ${
            isMobile ? 'max-w-sm mx-auto' : ''
          }`}
          style={{
            gridTemplateColumns: isMobile
              ? `repeat(${Math.min(safeGridSize.cols, 4)}, minmax(0, 1fr))`
              : `repeat(${safeGridSize.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${safeGridSize.rows}, minmax(0, 1fr))`,
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              data-card-index={index}
              onClick={isTouchDevice ? undefined : () => handleCardClick(index)}
              className={`
                relative aspect-square transition-all duration-300 transform select-none
                ${
                  isTouchDevice
                    ? 'active:scale-95 touch-manipulation'
                    : 'cursor-pointer hover:scale-105'
                }
                ${card.isFlipped || card.isMatched ? 'rotate-0' : ''}
                ${card.isMatched ? 'opacity-50' : ''}
                ${flippedCards.includes(index) ? 'ring-2 ring-blue-400' : ''}
              `}
              style={{
                minHeight: isMobile ? '60px' : '80px',
                minWidth: isMobile ? '60px' : '80px',
              }}
            >
              <Card className="w-full h-full overflow-hidden">
                {getCardContent(card)}
              </Card>
            </div>
          ))}
        </div>

        {isComplete && !showFeedback && (
          <div className="p-4 rounded-lg bg-green-50 text-green-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <p className="font-medium">
                ¡Felicidades! Completaste el juego en {moves} movimientos y{' '}
                {formatTime(elapsedTime)}.
              </p>
            </div>
          </div>
        )}

        {showFeedback && feedback && (
          <div
            className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}
          >
            <p className="font-medium">Juego completado</p>
            {feedback.score && (
              <p className="text-sm">Puntuación: {feedback.score} puntos</p>
            )}
            {feedback.explanation && (
              <p className="mt-1 text-sm">{feedback.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          {showFeedback && onNext && (
            <Button onClick={onNext} className="ml-auto">
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
