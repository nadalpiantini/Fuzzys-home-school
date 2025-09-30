'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Target,
  Clock,
  Zap,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface MatchPair {
  id: number;
  spanish: string;
  english: string;
  emoji: string;
  category: string;
}

interface Card {
  id: string;
  content: string;
  type: 'spanish' | 'english';
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const MATCH_PAIRS: MatchPair[] = [
  { id: 1, spanish: 'Perro', english: 'Dog', emoji: '🐶', category: 'Animales' },
  { id: 2, spanish: 'Gato', english: 'Cat', emoji: '🐱', category: 'Animales' },
  { id: 3, spanish: 'Casa', english: 'House', emoji: '🏠', category: 'Lugares' },
  { id: 4, spanish: 'Escuela', english: 'School', emoji: '🏫', category: 'Lugares' },
  { id: 5, spanish: 'Manzana', english: 'Apple', emoji: '🍎', category: 'Comida' },
  { id: 6, spanish: 'Agua', english: 'Water', emoji: '💧', category: 'Bebidas' },
  { id: 7, spanish: 'Libro', english: 'Book', emoji: '📚', category: 'Objetos' },
  { id: 8, spanish: 'Sol', english: 'Sun', emoji: '☀️', category: 'Naturaleza' },
];

export default function MatchGame() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const [peekTimeLeft, setPeekTimeLeft] = useState(0);

  // Initialize cards
  useEffect(() => {
    initializeGame();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted]);

  // Peek timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (showPeek && peekTimeLeft > 0) {
      interval = setInterval(() => {
        setPeekTimeLeft(prev => {
          if (prev <= 1) {
            setShowPeek(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showPeek, peekTimeLeft]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = () => {
    const gameCards: Card[] = [];
    
    MATCH_PAIRS.forEach(pair => {
      gameCards.push({
        id: `${pair.id}-spanish`,
        content: pair.spanish,
        type: 'spanish',
        pairId: pair.id,
        isFlipped: false,
        isMatched: false
      });
      gameCards.push({
        id: `${pair.id}-english`,
        content: pair.english,
        type: 'english',
        pairId: pair.id,
        isFlipped: false,
        isMatched: false
      });
    });

    setCards(shuffleArray(gameCards));
    setFlippedCards([]);
    setMatchedPairs([]);
    setScore(0);
    setAttempts(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setGameCompleted(false);
    setShowPeek(false);
    setPeekTimeLeft(0);
  };

  const handleCardClick = (cardId: string) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isMatched || flippedCards.includes(cardId) || flippedCards.length >= 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setAttempts(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found!
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, firstCard.pairId]);
          setCards(prev => prev.map(c => 
            c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
          ));
          setFlippedCards([]);
          
          // Calculate score based on time and attempts
          const timeBonus = Math.max(0, 100 - timeElapsed);
          const attemptBonus = Math.max(0, 50 - (attempts * 5));
          const basePoints = 100;
          const totalPoints = basePoints + timeBonus + attemptBonus;
          setScore(prev => prev + totalPoints);

          // Check if game completed
          if (matchedPairs.length + 1 === MATCH_PAIRS.length) {
            setGameCompleted(true);
          }
        }, 1000);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 1500);
      }
    }
  };

  const handlePeek = () => {
    if (peekTimeLeft > 0 || showPeek) return;
    
    setShowPeek(true);
    setPeekTimeLeft(3);
    
    // Show all cards temporarily
    setCards(prev => prev.map(c => ({ ...c, isFlipped: true })));
    
    // Hide cards after peek time
    setTimeout(() => {
      setCards(prev => prev.map(c => ({
        ...c, 
        isFlipped: c.isMatched || flippedCards.includes(c.id)
      })));
    }, 3000);
  };

  const resetGame = () => {
    initializeGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCardContent = (card: Card) => {
    const pair = MATCH_PAIRS.find(p => p.id === card.pairId);
    if (!pair) return card.content;
    
    return (
      <div className="text-center">
        <div className="text-2xl mb-2">{pair.emoji}</div>
        <div className="font-semibold">{card.content}</div>
        <div className={`text-xs mt-1 px-2 py-1 rounded ${
          card.type === 'spanish' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {card.type === 'spanish' ? 'Español' : 'English'}
        </div>
      </div>
    );
  };

  const accuracy = attempts > 0 ? Math.round((matchedPairs.length / attempts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🎯 Juego de Parejas
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Encuentra las parejas en español e inglés!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg">{score}</span>
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
        </div>
      </header>

      {/* Game Stats */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Parejas</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {matchedPairs.length}/{MATCH_PAIRS.length}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Intentos</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{attempts}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Precisión</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(timeElapsed)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Puntos</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{score}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Controls */}
      <section className="container mx-auto px-4 sm:px-6 pb-4">
        <div className="flex justify-center gap-4">
          <Button
            onClick={handlePeek}
            disabled={showPeek || peekTimeLeft > 0 || gameCompleted}
            variant="outline"
            className="bg-white/50 hover:bg-white/80"
          >
            {showPeek ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Viendo... {peekTimeLeft}s
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Echar un Vistazo
              </>
            )}
          </Button>
          
          <Button
            onClick={resetGame}
            variant="outline"
            className="bg-white/50 hover:bg-white/80"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`aspect-square cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                card.isMatched
                  ? 'bg-green-100 border-green-300 scale-95'
                  : card.isFlipped || flippedCards.includes(card.id)
                  ? 'bg-white border-blue-300 shadow-lg'
                  : 'bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-100 hover:to-gray-200'
              }`}
              onClick={() => handleCardClick(card.id)}
            >
              <CardContent className="h-full flex items-center justify-center p-2 sm:p-4">
                {card.isMatched || card.isFlipped || flippedCards.includes(card.id) || showPeek ? (
                  getCardContent(card)
                ) : (
                  <div className="text-4xl sm:text-6xl text-gray-400">
                    ?
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Completion Modal */}
      {gameCompleted && (
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
                Has encontrado todas las parejas
              </p>

              {/* Final Stats */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Tiempo Total</div>
                    <div className="font-bold text-orange-600">{formatTime(timeElapsed)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Intentos</div>
                    <div className="font-bold text-blue-600">{attempts}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Precisión</div>
                    <div className="font-bold text-purple-600">{accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Puntuación</div>
                    <div className="font-bold text-yellow-600">{score}</div>
                  </div>
                </div>
              </div>

              {/* Performance Rating */}
              <div className="mb-6">
                <div className="flex justify-center gap-1 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        accuracy >= 80 && timeElapsed < 120
                          ? 'text-yellow-400 fill-yellow-400'
                          : accuracy >= 60
                          ? i < 2 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          : i < 1 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  {accuracy >= 80 && timeElapsed < 120
                    ? '¡Excelente!' 
                    : accuracy >= 60 
                    ? '¡Muy bien!' 
                    : '¡Buen intento!'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
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