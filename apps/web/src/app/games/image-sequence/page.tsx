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
  Timer,
  Target,
  Sparkles,
  CheckCircle,
  XCircle,
  Lightbulb,
  Shuffle,
  BookOpen,
} from 'lucide-react';

interface SequenceItem {
  id: string;
  emoji: string;
  description: string;
  correctPosition: number;
  currentPosition: number;
}

interface Sequence {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  items: Omit<SequenceItem, 'currentPosition'>[];
  explanation: string;
}

interface GameStats {
  attempts: number;
  correctSequences: number;
  timeElapsed: number;
  score: number;
  hintsUsed: number;
}

const SEQUENCES: Sequence[] = [
  {
    id: 'butterfly',
    name: 'Ciclo de Vida de la Mariposa',
    description: 'Ordena las etapas del ciclo de vida de una mariposa',
    category: 'Biología',
    emoji: '🦋',
    items: [
      { id: 'egg', emoji: '🥚', description: 'Huevo', correctPosition: 1 },
      { id: 'caterpillar', emoji: '🐛', description: 'Oruga', correctPosition: 2 },
      { id: 'chrysalis', emoji: '🛡️', description: 'Crisálida', correctPosition: 3 },
      { id: 'butterfly', emoji: '🦋', description: 'Mariposa', correctPosition: 4 },
    ],
    explanation: 'El ciclo de vida de la mariposa comienza con un huevo, que se convierte en oruga. La oruga forma una crisálida donde se transforma, y finalmente emerge como una hermosa mariposa.',
  },
  {
    id: 'plant',
    name: 'Crecimiento de una Planta',
    description: 'Ordena las etapas del crecimiento de una planta',
    category: 'Botánica',
    emoji: '🌱',
    items: [
      { id: 'seed', emoji: '🌰', description: 'Semilla', correctPosition: 1 },
      { id: 'sprout', emoji: '🌱', description: 'Brote', correctPosition: 2 },
      { id: 'sapling', emoji: '🌿', description: 'Plántula', correctPosition: 3 },
      { id: 'flower', emoji: '🌸', description: 'Flor', correctPosition: 4 },
      { id: 'tree', emoji: '🌳', description: 'Árbol', correctPosition: 5 },
    ],
    explanation: 'Una planta comienza como semilla, germina en un brote, crece como plántula, desarrolla flores para reproducirse, y finalmente se convierte en un árbol maduro.',
  },
  {
    id: 'water-cycle',
    name: 'Ciclo del Agua',
    description: 'Ordena las etapas del ciclo del agua',
    category: 'Geografía',
    emoji: '💧',
    items: [
      { id: 'evaporation', emoji: '☀️', description: 'Evaporación', correctPosition: 1 },
      { id: 'cloud', emoji: '☁️', description: 'Formación de Nubes', correctPosition: 2 },
      { id: 'precipitation', emoji: '🌧️', description: 'Precipitación', correctPosition: 3 },
      { id: 'collection', emoji: '🌊', description: 'Recolección', correctPosition: 4 },
    ],
    explanation: 'El ciclo del agua comienza con la evaporación del agua por el calor del sol, forma nubes en la atmósfera, precipita como lluvia, y se recolecta en océanos y ríos para repetir el ciclo.',
  },
  {
    id: 'moon-phases',
    name: 'Fases de la Luna',
    description: 'Ordena las fases principales de la luna',
    category: 'Astronomía',
    emoji: '🌙',
    items: [
      { id: 'new-moon', emoji: '🌑', description: 'Luna Nueva', correctPosition: 1 },
      { id: 'crescent', emoji: '🌒', description: 'Cuarto Creciente', correctPosition: 2 },
      { id: 'full-moon', emoji: '🌕', description: 'Luna Llena', correctPosition: 3 },
      { id: 'waning', emoji: '🌘', description: 'Cuarto Menguante', correctPosition: 4 },
    ],
    explanation: 'Las fases lunares siguen un ciclo regular: Luna Nueva (invisible), Cuarto Creciente (iluminada por la derecha), Luna Llena (completamente iluminada), y Cuarto Menguante (iluminada por la izquierda).',
  },
  {
    id: 'food-chain',
    name: 'Cadena Alimentaria',
    description: 'Ordena los niveles de una cadena alimentaria',
    category: 'Ecología',
    emoji: '🍃',
    items: [
      { id: 'sun', emoji: '☀️', description: 'Sol', correctPosition: 1 },
      { id: 'grass', emoji: '🌿', description: 'Hierba', correctPosition: 2 },
      { id: 'rabbit', emoji: '🐰', description: 'Conejo', correctPosition: 3 },
      { id: 'fox', emoji: '🦊', description: 'Zorro', correctPosition: 4 },
    ],
    explanation: 'En una cadena alimentaria, la energía fluye desde el sol hacia las plantas (productores), luego a herbívoros como el conejo (consumidores primarios), y finalmente a carnívoros como el zorro (consumidores secundarios).',
  },
];

export default function ImageSequenceGame() {
  const router = useRouter();
  const [currentSequence, setCurrentSequence] = useState<Sequence>(SEQUENCES[0]);
  const [items, setItems] = useState<SequenceItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    attempts: 0,
    correctSequences: 0,
    timeElapsed: 0,
    score: 0,
    hintsUsed: 0,
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize game
  const initializeGame = useCallback(() => {
    const gameItems: SequenceItem[] = currentSequence.items.map(item => ({
      ...item,
      currentPosition: 0,
    }));

    // Shuffle items
    const shuffledItems = gameItems.sort(() => Math.random() - 0.5);
    shuffledItems.forEach((item, index) => {
      item.currentPosition = index + 1;
    });

    setItems(shuffledItems);
    setGameStats(prev => ({
      ...prev,
      attempts: 0,
      timeElapsed: 0,
      hintsUsed: 0,
    }));
    setGameStarted(false);
    setIsComplete(false);
    setShowHint(false);
    setShowExplanation(false);
    setDraggedItem(null);
    setDragOverPosition(null);
    setFeedback(null);
  }, [currentSequence]);

  // Initialize game when sequence changes
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !isComplete) {
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
  }, [gameStarted, isComplete]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPosition(position);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetPosition: number) => {
    e.preventDefault();
    setDragOverPosition(null);

    const itemId = e.dataTransfer.getData('text/plain');
    const draggedItemData = items.find(item => item.id === itemId);
    const targetItem = items.find(item => item.currentPosition === targetPosition);

    if (!draggedItemData || !targetItem) return;

    // Swap positions
    setItems(prev => prev.map(item => {
      if (item.id === draggedItemData.id) {
        return { ...item, currentPosition: targetPosition };
      }
      if (item.id === targetItem.id) {
        return { ...item, currentPosition: draggedItemData.currentPosition };
      }
      return item;
    }));

    setDraggedItem(null);
  };

  // Check sequence
  const checkSequence = () => {
    const isCorrect = items.every(item => item.currentPosition === item.correctPosition);

    setGameStats(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
    }));

    if (isCorrect) {
      const timeBonus = Math.max(0, 500 - gameStats.timeElapsed * 2);
      const hintPenalty = gameStats.hintsUsed * 50;
      const attemptBonus = Math.max(0, 200 - gameStats.attempts * 20);
      const finalScore = timeBonus + attemptBonus - hintPenalty;

      setGameStats(prev => ({
        ...prev,
        correctSequences: prev.correctSequences + 1,
        score: prev.score + finalScore,
      }));

      setIsComplete(true);
      setShowExplanation(true);
      setFeedback({ type: 'success', message: '¡Secuencia correcta!' });
    } else {
      setFeedback({ type: 'error', message: '¡Inténtalo de nuevo!' });
    }

    setTimeout(() => setFeedback(null), 2000);
  };

  // Show hint
  const useHint = () => {
    setShowHint(true);
    setGameStats(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
    }));
  };

  // Change sequence
  const changeSequence = (sequenceId: string) => {
    const newSequence = SEQUENCES.find(seq => seq.id === sequenceId);
    if (newSequence) {
      setCurrentSequence(newSequence);
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
    if (gameStats.attempts === 1 && gameStats.hintsUsed === 0) return { stars: 3, text: '¡Perfecto!' };
    if (gameStats.attempts <= 2 && gameStats.hintsUsed <= 1) return { stars: 2, text: '¡Muy bien!' };
    return { stars: 1, text: '¡Bien hecho!' };
  };

  // Sort items by current position for display
  const sortedItems = [...items].sort((a, b) => a.currentPosition - b.currentPosition);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-red-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white">
                <Shuffle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🔄 Secuencia de Imágenes
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Ordena las imágenes en la secuencia correcta!
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

      {/* Sequence Selector */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {currentSequence.emoji} {currentSequence.name}
              </h2>
              <p className="text-sm text-gray-600">{currentSequence.description}</p>
              <Badge variant="secondary" className="mt-2">
                {currentSequence.category}
              </Badge>
            </div>

            <select
              value={currentSequence.id}
              onChange={(e) => changeSequence(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              disabled={gameStarted && !isComplete}
            >
              {SEQUENCES.map((sequence) => (
                <option key={sequence.id} value={sequence.id}>
                  {sequence.emoji} {sequence.name}
                </option>
              ))}
            </select>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Intentos</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{gameStats.attempts}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Completas</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{gameStats.correctSequences}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Timer className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(gameStats.timeElapsed)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Pistas</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{gameStats.hintsUsed}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Puntos</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{gameStats.score}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Board */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
            Arrastra para reordenar la secuencia
          </h3>

          {/* Sequence Items */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
            {sortedItems.map((item, index) => (
              <div
                key={item.currentPosition}
                className={`relative transition-all duration-300 ${
                  dragOverPosition === item.currentPosition ? 'scale-105' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, item.currentPosition)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.currentPosition)}
              >
                <Card
                  className={`cursor-move transition-all duration-300 transform hover:scale-105 ${
                    draggedItem === item.id
                      ? 'opacity-50 scale-95'
                      : 'bg-white/80 hover:bg-white/90'
                  } ${
                    isComplete && item.currentPosition === item.correctPosition
                      ? 'ring-4 ring-green-300 ring-opacity-60'
                      : ''
                  } ${
                    dragOverPosition === item.currentPosition
                      ? 'border-amber-400 shadow-lg'
                      : 'border-gray-200'
                  }`}
                  draggable={!isComplete}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="absolute top-2 left-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {item.currentPosition}
                    </div>

                    <div className="text-4xl sm:text-5xl mb-3">{item.emoji}</div>
                    <div className="text-sm font-medium text-gray-800">{item.description}</div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Hint Section */}
          {showHint && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Pista:</span>
              </div>
              <div className="text-sm text-yellow-700 mb-2">
                <strong>Primer elemento:</strong> {currentSequence.items[0].description} {currentSequence.items[0].emoji}
              </div>
              <div className="text-sm text-yellow-700">
                <strong>Último elemento:</strong> {currentSequence.items[currentSequence.items.length - 1].description} {currentSequence.items[currentSequence.items.length - 1].emoji}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              onClick={checkSequence}
              disabled={isComplete}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
              size="lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Verificar Secuencia
            </Button>

            <Button
              onClick={useHint}
              disabled={showHint || isComplete}
              variant="outline"
              size="lg"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Usar Pista
            </Button>

            <Button
              onClick={initializeGame}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reiniciar
            </Button>
          </div>
        </div>
      </section>

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl border border-white/20">
            <div className="text-center">
              {/* Celebration Animation */}
              <div className="text-6xl mb-4 animate-bounce">
                🎉
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ¡Secuencia Correcta!
              </h2>

              {/* Performance Rating */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
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
                <div className="text-lg font-semibold text-amber-600 mb-2">
                  {getPerformanceRating().text}
                </div>

                {/* Final Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <div className="text-gray-600">Intentos</div>
                    <div className="font-bold text-blue-600">{gameStats.attempts}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tiempo</div>
                    <div className="font-bold text-purple-600">
                      {formatTime(gameStats.timeElapsed)}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-gray-600">Puntuación Total</div>
                  <div className="text-2xl font-bold text-orange-600">{gameStats.score}</div>
                </div>
              </div>

              {/* Educational Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">¿Sabías que...?</span>
                </div>
                <p className="text-sm text-blue-700">
                  {currentSequence.explanation}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    setShowExplanation(false);
                    initializeGame();
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
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

      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className={`px-6 py-3 rounded-full shadow-lg border-2 transition-all duration-500 ${
            feedback.type === 'success'
              ? 'bg-green-100 border-green-300 text-green-800'
              : 'bg-red-100 border-red-300 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}