'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Brain,
  Timer,
  Target,
  Sparkles,
  Heart,
} from 'lucide-react';

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: number;
}

interface GameStats {
  moves: number;
  matches: number;
  timeElapsed: number;
  score: number;
}

const CARD_PAIRS = [
  { emoji: '🐶', name: 'Perrito' },
  { emoji: '🐱', name: 'Gatito' },
  { emoji: '🐭', name: 'Ratoncito' },
  { emoji: '🐹', name: 'Hámster' },
];

const TOTAL_PAIRS = CARD_PAIRS.length;
const TOTAL_CARDS = TOTAL_PAIRS * 2;

export default function MemoryCardsGame() {
  const router = useRouter();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    moves: 0,
    matches: 0,
    timeElapsed: 0,
    score: 0,
  });
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [canFlip, setCanFlip] = useState(true);

  // Initialize game
  const initializeGame = useCallback(() => {
    const gameCards: MemoryCard[] = [];

    // Create pairs of cards
    CARD_PAIRS.forEach((pair, index) => {
      // First card of the pair
      gameCards.push({
        id: index * 2,
        emoji: pair.emoji,
        isFlipped: false,
        isMatched: false,
        pairId: index,
      });

      // Second card of the pair
      gameCards.push({
        id: index * 2 + 1,
        emoji: pair.emoji,
        isFlipped: false,
        isMatched: false,
        pairId: index,
      });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setFlippedCards([]);
    setGameStats({
      moves: 0,
      matches: 0,
      timeElapsed: 0,
      score: 0,
    });
    setGameWon(false);
    setGameStarted(false);
    setCanFlip(true);
  }, []);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameWon]);

  // Handle card flip
  const handleCardFlip = (cardId: number) => {
    if (!canFlip || gameWon) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // Start game on first card flip
    if (!gameStarted) {
      setGameStarted(true);
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setCanFlip(false);
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      // Increment moves
      setGameStats(prev => ({
        ...prev,
        moves: prev.moves + 1,
      }));

      setTimeout(() => {
        if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
          // Match found!
          setCards(prev => prev.map(c =>
            c.id === firstCardId || c.id === secondCardId
              ? { ...c, isMatched: true }
              : c
          ));

          const newMatches = gameStats.matches + 1;
          const newScore = Math.max(0, 1000 - (gameStats.moves * 10) - (gameStats.timeElapsed * 2));

          setGameStats(prev => ({
            ...prev,
            matches: newMatches,
            score: newScore,
          }));

          // Check if game is won
          if (newMatches === TOTAL_PAIRS) {
            setGameWon(true);
          }
        } else {
          // No match, flip cards back
          setCards(prev => prev.map(c =>
            c.id === firstCardId || c.id === secondCardId
              ? { ...c, isFlipped: false }
              : c
          ));
        }

        setFlippedCards([]);
        setCanFlip(true);
      }, 1000);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get performance rating
  const getPerformanceRating = () => {
    if (gameStats.moves <= 8) return { stars: 3, text: '¡Excelente!' };
    if (gameStats.moves <= 12) return { stars: 2, text: '¡Muy bien!' };
    return { stars: 1, text: '¡Bien hecho!' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🧠 Memoria de Animales
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Encuentra las parejas de animales!
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/games')}
              className="bg-white/50 hover:bg-white/80"
            >
              <Home className="w-4 h-4 mr-2" />
              Volver a Juegos
            </Button>
          </div>
        </div>
      </header>

      {/* Game Stats */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Movimientos</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{gameStats.moves}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-medium text-gray-700">Parejas</span>
              </div>
              <div className="text-2xl font-bold text-pink-600">
                {gameStats.matches}/{TOTAL_PAIRS}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Timer className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatTime(gameStats.timeElapsed)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Puntos</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{gameStats.score}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Board */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto">
            {cards.map((card) => (
              <Card
                key={card.id}
                className={`aspect-square cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                  card.isFlipped || card.isMatched
                    ? 'bg-gradient-to-br from-purple-200 to-pink-200 border-purple-300'
                    : 'bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400'
                } ${card.isMatched ? 'ring-4 ring-green-300 ring-opacity-60' : ''}`}
                onClick={() => handleCardFlip(card.id)}
              >
                <CardContent className="p-0 h-full flex items-center justify-center">
                  <div className="text-center">
                    {card.isFlipped || card.isMatched ? (
                      <div className="text-4xl sm:text-5xl transform transition-transform duration-300 hover:scale-110">
                        {card.emoji}
                      </div>
                    ) : (
                      <div className="text-2xl sm:text-3xl text-gray-500 transform transition-transform duration-300">
                        🃏
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reset Button */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="text-center">
          <Button
            onClick={initializeGame}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Juego Nuevo
          </Button>
        </div>
      </section>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl border border-white/20">
            <div className="text-center">
              {/* Celebration Animation */}
              <div className="text-6xl mb-4 animate-bounce">
                🎉
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ¡Felicitaciones!
              </h2>

              <p className="text-gray-600 mb-6">
                ¡Has encontrado todas las parejas de animales!
              </p>

              {/* Performance Rating */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                <div className="flex justify-center gap-1 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < getPerformanceRating().stars
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-lg font-semibold text-purple-600 mb-2">
                  {getPerformanceRating().text}
                </div>

                {/* Final Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Movimientos</div>
                    <div className="font-bold text-blue-600">{gameStats.moves}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tiempo</div>
                    <div className="font-bold text-green-600">
                      {formatTime(gameStats.timeElapsed)}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-gray-600">Puntuación Final</div>
                  <div className="text-2xl font-bold text-yellow-600">{gameStats.score}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={initializeGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Jugar de Nuevo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/games')}
                  size="lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Otros Juegos
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}