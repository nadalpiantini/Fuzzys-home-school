'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Brain,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  BookOpen,
  Target,
  Sparkles,
} from 'lucide-react';

interface FlashCard {
  id: number;
  spanish: string;
  english: string;
  emoji: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CardProgress {
  id: number;
  known: boolean;
  attempts: number;
  lastSeen?: Date;
}

interface GameStats {
  totalCards: number;
  currentCard: number;
  masteredCards: number;
  needsPractice: number;
  accuracy: number;
  studyTime: number;
}

const FLASHCARDS: FlashCard[] = [
  {
    id: 1,
    spanish: 'Perro',
    english: 'Dog',
    emoji: '🐶',
    category: 'Animales',
    difficulty: 'easy',
  },
  {
    id: 2,
    spanish: 'Gato',
    english: 'Cat',
    emoji: '🐱',
    category: 'Animales',
    difficulty: 'easy',
  },
  {
    id: 3,
    spanish: 'Casa',
    english: 'House',
    emoji: '🏠',
    category: 'Lugares',
    difficulty: 'easy',
  },
  {
    id: 4,
    spanish: 'Escuela',
    english: 'School',
    emoji: '🏫',
    category: 'Lugares',
    difficulty: 'medium',
  },
  {
    id: 5,
    spanish: 'Manzana',
    english: 'Apple',
    emoji: '🍎',
    category: 'Comida',
    difficulty: 'easy',
  },
  {
    id: 6,
    spanish: 'Agua',
    english: 'Water',
    emoji: '💧',
    category: 'Bebidas',
    difficulty: 'easy',
  },
  {
    id: 7,
    spanish: 'Libro',
    english: 'Book',
    emoji: '📚',
    category: 'Objetos',
    difficulty: 'medium',
  },
  {
    id: 8,
    spanish: 'Familia',
    english: 'Family',
    emoji: '👨‍👩‍👧‍👦',
    category: 'Personas',
    difficulty: 'medium',
  },
  {
    id: 9,
    spanish: 'Feliz',
    english: 'Happy',
    emoji: '😊',
    category: 'Emociones',
    difficulty: 'medium',
  },
  {
    id: 10,
    spanish: 'Hermoso',
    english: 'Beautiful',
    emoji: '✨',
    category: 'Adjetivos',
    difficulty: 'hard',
  },
];

export default function FlashcardsGame() {
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalCards: FLASHCARDS.length,
    currentCard: 1,
    masteredCards: 0,
    needsPractice: 0,
    accuracy: 0,
    studyTime: 0,
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [studyMode, setStudyMode] = useState<'all' | 'practice' | 'new'>('all');

  // Initialize card progress
  useEffect(() => {
    const initialProgress = FLASHCARDS.map(card => ({
      id: card.id,
      known: false,
      attempts: 0,
    }));
    setCardProgress(initialProgress);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !showSummary) {
      interval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          studyTime: prev.studyTime + 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, showSummary]);

  // Update game stats when card progress changes
  useEffect(() => {
    if (cardProgress.length > 0) {
      const mastered = cardProgress.filter(p => p.known && p.attempts >= 2).length;
      const practiced = cardProgress.filter(p => p.attempts > 0).length;
      const accuracy = practiced > 0
        ? (cardProgress.filter(p => p.known).length / practiced) * 100
        : 0;

      setGameStats(prev => ({
        ...prev,
        masteredCards: mastered,
        needsPractice: cardProgress.filter(p => !p.known && p.attempts > 0).length,
        accuracy: Math.round(accuracy),
      }));
    }
  }, [cardProgress]);

  const currentCard = FLASHCARDS[currentCardIndex];

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
    if (!gameStarted) {
      setGameStarted(true);
    }
  };

  const handleKnowCard = (known: boolean) => {
    const updatedProgress = cardProgress.map(p =>
      p.id === currentCard.id
        ? {
            ...p,
            known,
            attempts: p.attempts + 1,
            lastSeen: new Date(),
          }
        : p
    );

    setCardProgress(updatedProgress);

    // Auto-advance to next card
    setTimeout(() => {
      if (currentCardIndex < FLASHCARDS.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
        setGameStats(prev => ({
          ...prev,
          currentCard: prev.currentCard + 1,
        }));
      } else {
        // End of deck, show summary
        setShowSummary(true);
      }
    }, 500);
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      setGameStats(prev => ({
        ...prev,
        currentCard: prev.currentCard - 1,
      }));
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < FLASHCARDS.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setGameStats(prev => ({
        ...prev,
        currentCard: prev.currentCard + 1,
      }));
    }
  };

  const resetGame = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
    setGameStarted(false);
    setGameStats({
      totalCards: FLASHCARDS.length,
      currentCard: 1,
      masteredCards: 0,
      needsPractice: 0,
      accuracy: 0,
      studyTime: 0,
    });
    const resetProgress = FLASHCARDS.map(card => ({
      id: card.id,
      known: false,
      attempts: 0,
    }));
    setCardProgress(resetProgress);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    const progress = (currentCardIndex / FLASHCARDS.length) * 100;
    if (progress < 33) return 'bg-red-500';
    if (progress < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceRating = () => {
    if (gameStats.accuracy >= 90) return { stars: 3, text: '¡Excelente!', color: 'text-green-600' };
    if (gameStats.accuracy >= 70) return { stars: 2, text: '¡Muy bien!', color: 'text-yellow-600' };
    return { stars: 1, text: '¡Sigue practicando!', color: 'text-blue-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  📚 Tarjetas de Vocabulario
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Aprende nuevas palabras en inglés!
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

      {/* Progress and Stats */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progreso: {gameStats.currentCard}/{gameStats.totalCards}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round((currentCardIndex / FLASHCARDS.length) * 100)}%
              </span>
            </div>
            <Progress
              value={(currentCardIndex / FLASHCARDS.length) * 100}
              className="h-3"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Precisión</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{gameStats.accuracy}%</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Dominadas</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{gameStats.masteredCards}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Brain className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Practicar</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{gameStats.needsPractice}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatTime(gameStats.studyTime)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flashcard */}
      {!showSummary && (
        <section className="container mx-auto px-4 sm:px-6 pb-6">
          <div className="max-w-md mx-auto">
            {/* Card Info */}
            <div className="flex justify-between items-center mb-4">
              <Badge className={getDifficultyColor(currentCard.difficulty)}>
                {currentCard.difficulty === 'easy' && 'Fácil'}
                {currentCard.difficulty === 'medium' && 'Medio'}
                {currentCard.difficulty === 'hard' && 'Difícil'}
              </Badge>
              <Badge variant="outline" className="bg-white/50">
                {currentCard.category}
              </Badge>
            </div>

            {/* Main Card */}
            <div
              className="relative w-full h-80 mb-6 cursor-pointer perspective-1000"
              onClick={handleCardFlip}
            >
              <div
                className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front of card */}
                <Card className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-200 to-purple-200 border-2 border-blue-300 hover:shadow-xl transition-shadow">
                  <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-6xl mb-4 animate-pulse">
                      {currentCard.emoji}
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">
                      {currentCard.spanish}
                    </div>
                    <div className="text-gray-600 text-sm mb-4">
                      (Español)
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-sm">Toca para voltear</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Back of card */}
                <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-green-200 to-teal-200 border-2 border-green-300 hover:shadow-xl transition-shadow">
                  <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-6xl mb-4">
                      {currentCard.emoji}
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">
                      {currentCard.english}
                    </div>
                    <div className="text-gray-600 text-sm mb-6">
                      (English)
                    </div>

                    {/* Know/Don't Know Buttons */}
                    <div className="flex gap-3 w-full">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleKnowCard(false);
                        }}
                        variant="outline"
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                      >
                        <X className="w-4 h-4 mr-2" />
                        No sé
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleKnowCard(true);
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Ya sé
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Button
                onClick={handlePreviousCard}
                disabled={currentCardIndex === 0}
                variant="outline"
                className="bg-white/50 hover:bg-white/80"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              <div className="text-center">
                <div className="text-sm text-gray-600">
                  {currentCardIndex + 1} de {FLASHCARDS.length}
                </div>
              </div>

              <Button
                onClick={handleNextCard}
                disabled={currentCardIndex === FLASHCARDS.length - 1}
                variant="outline"
                className="bg-white/50 hover:bg-white/80"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Reset Button */}
      {!showSummary && (
        <section className="container mx-auto px-4 sm:px-6 pb-6">
          <div className="text-center">
            <Button
              onClick={resetGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
              size="lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reiniciar
            </Button>
          </div>
        </section>
      )}

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              {/* Celebration Animation */}
              <div className="text-6xl mb-4 animate-bounce">
                🎉
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ¡Sesión Completada!
              </h2>

              <p className="text-gray-600 mb-6">
                Has revisado todas las tarjetas de vocabulario
              </p>

              {/* Performance Rating */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
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
                <div className={`text-lg font-semibold mb-2 ${getPerformanceRating().color}`}>
                  {getPerformanceRating().text}
                </div>

                {/* Final Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-gray-600">Precisión</div>
                    <div className="font-bold text-blue-600">{gameStats.accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tiempo Total</div>
                    <div className="font-bold text-yellow-600">
                      {formatTime(gameStats.studyTime)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Dominadas</div>
                    <div className="font-bold text-green-600">{gameStats.masteredCards}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Necesitan Práctica</div>
                    <div className="font-bold text-orange-600">{gameStats.needsPractice}</div>
                  </div>
                </div>
              </div>

              {/* Card Review */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Resumen de Tarjetas</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {FLASHCARDS.map((card) => {
                    const progress = cardProgress.find(p => p.id === card.id);
                    return (
                      <div key={card.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{card.emoji}</span>
                          <span>{card.spanish}</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          progress?.known
                            ? 'bg-green-100 text-green-800'
                            : (progress?.attempts ?? 0) > 0
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {progress?.known ? 'Dominada' : (progress?.attempts ?? 0) > 0 ? 'Practicar' : 'Nueva'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Estudiar de Nuevo
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