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
  Target,
  Timer,
  Sparkles,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface DragItem {
  id: string;
  name: string;
  emoji: string;
  category: 'animales' | 'frutas' | 'colores';
  isPlaced: boolean;
}

interface DropZone {
  id: string;
  name: string;
  category: 'animales' | 'frutas' | 'colores';
  emoji: string;
  items: DragItem[];
}

interface GameStats {
  correctPlacements: number;
  incorrectPlacements: number;
  totalItems: number;
  timeElapsed: number;
  score: number;
}

const GAME_ITEMS: Omit<DragItem, 'isPlaced'>[] = [
  // Animales
  { id: 'perro', name: 'Perro', emoji: '🐶', category: 'animales' },
  { id: 'gato', name: 'Gato', emoji: '🐱', category: 'animales' },
  { id: 'pez', name: 'Pez', emoji: '🐠', category: 'animales' },

  // Frutas
  { id: 'manzana', name: 'Manzana', emoji: '🍎', category: 'frutas' },
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'frutas' },
  { id: 'naranja', name: 'Naranja', emoji: '🍊', category: 'frutas' },

  // Colores
  { id: 'rojo', name: 'Rojo', emoji: '🔴', category: 'colores' },
  { id: 'azul', name: 'Azul', emoji: '🔵', category: 'colores' },
  { id: 'verde', name: 'Verde', emoji: '🟢', category: 'colores' },
];

const DROP_ZONES: DropZone[] = [
  { id: 'animales', name: 'Animales', category: 'animales', emoji: '🐾', items: [] },
  { id: 'frutas', name: 'Frutas', category: 'frutas', emoji: '🍇', items: [] },
  { id: 'colores', name: 'Colores', category: 'colores', emoji: '🎨', items: [] },
];

export default function DragDropGame() {
  const router = useRouter();
  const [items, setItems] = useState<DragItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>(DROP_ZONES);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    correctPlacements: 0,
    incorrectPlacements: 0,
    totalItems: GAME_ITEMS.length,
    timeElapsed: 0,
    score: 0,
  });
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'correct' | 'incorrect'; item: string } | null>(null);

  // Initialize game
  const initializeGame = useCallback(() => {
    const gameItems: DragItem[] = GAME_ITEMS.map(item => ({
      ...item,
      isPlaced: false,
    }));

    // Shuffle items
    const shuffledItems = gameItems.sort(() => Math.random() - 0.5);

    setItems(shuffledItems);
    setDropZones(DROP_ZONES.map(zone => ({ ...zone, items: [] })));
    setGameStats({
      correctPlacements: 0,
      incorrectPlacements: 0,
      totalItems: GAME_ITEMS.length,
      timeElapsed: 0,
      score: 0,
    });
    setGameWon(false);
    setGameStarted(false);
    setDraggedItem(null);
    setDragOverZone(null);
    setShowFeedback(null);
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
  const handleDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverZone(zoneId);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    setDragOverZone(null);

    const itemId = e.dataTransfer.getData('text/plain');
    const item = items.find(item => item.id === itemId);
    const zone = dropZones.find(zone => zone.id === zoneId);

    if (!item || !zone || item.isPlaced) return;

    const isCorrect = item.category === zone.category;

    // Update items
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, isPlaced: true } : i
    ));

    // Update drop zones
    setDropZones(prev => prev.map(z =>
      z.id === zoneId ? { ...z, items: [...z.items, item] } : z
    ));

    // Update stats
    setGameStats(prev => {
      const newStats = {
        ...prev,
        correctPlacements: isCorrect ? prev.correctPlacements + 1 : prev.correctPlacements,
        incorrectPlacements: isCorrect ? prev.incorrectPlacements : prev.incorrectPlacements + 1,
      };

      // Calculate score based on correct placements and time
      const scoreMultiplier = isCorrect ? 100 : -20;
      const timeBonus = Math.max(0, 500 - prev.timeElapsed * 2);
      newStats.score = Math.max(0, prev.score + scoreMultiplier + (isCorrect ? timeBonus : 0));

      return newStats;
    });

    // Show feedback
    setShowFeedback({ type: isCorrect ? 'correct' : 'incorrect', item: item.name });
    setTimeout(() => setShowFeedback(null), 2000);

    // Check if game is won (all items placed correctly)
    const totalCorrect = gameStats.correctPlacements + (isCorrect ? 1 : 0);
    if (totalCorrect === GAME_ITEMS.length) {
      setTimeout(() => setGameWon(true), 500);
    }

    setDraggedItem(null);
  };

  // Handle item removal from zone (double click)
  const handleRemoveFromZone = (itemId: string, zoneId: string) => {
    const item = dropZones.find(z => z.id === zoneId)?.items.find(i => i.id === itemId);
    if (!item) return;

    // Remove from zone
    setDropZones(prev => prev.map(z =>
      z.id === zoneId
        ? { ...z, items: z.items.filter(i => i.id !== itemId) }
        : z
    ));

    // Return to items list
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, isPlaced: false } : i
    ));

    // Update stats (reverse the placement)
    setGameStats(prev => {
      const wasCorrect = item.category === zoneId;
      return {
        ...prev,
        correctPlacements: wasCorrect ? prev.correctPlacements - 1 : prev.correctPlacements,
        incorrectPlacements: wasCorrect ? prev.incorrectPlacements : prev.incorrectPlacements - 1,
        score: Math.max(0, prev.score - (wasCorrect ? 50 : -10)),
      };
    });
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get performance rating
  const getPerformanceRating = () => {
    const accuracy = gameStats.correctPlacements / gameStats.totalItems;
    const timeBonus = gameStats.timeElapsed < 120 ? 1 : 0;

    if (accuracy === 1 && timeBonus) return { stars: 3, text: '¡Perfecto!' };
    if (accuracy >= 0.8) return { stars: 2, text: '¡Muy bien!' };
    return { stars: 1, text: '¡Bien hecho!' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🎯 Arrastra y Clasifica
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Arrastra cada elemento a su categoría correcta!
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
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Correctos</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {gameStats.correctPlacements}/{gameStats.totalItems}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-700">Incorrectos</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{gameStats.incorrectPlacements}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Timer className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items to Drag */}
          <div className="lg:col-span-2">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Elementos para Arrastrar
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {items.filter(item => !item.isPlaced).map((item) => (
                  <Card
                    key={item.id}
                    className={`cursor-move transition-all duration-300 transform hover:scale-105 bg-white/80 hover:bg-white/90 border-2 ${
                      draggedItem === item.id ? 'border-blue-400 shadow-lg scale-105' : 'border-gray-200'
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl sm:text-4xl mb-2">{item.emoji}</div>
                      <div className="text-sm font-medium text-gray-800">{item.name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {items.filter(item => !item.isPlaced).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                  <p>¡Todos los elementos han sido clasificados!</p>
                </div>
              )}
            </div>
          </div>

          {/* Drop Zones */}
          <div className="space-y-4">
            {dropZones.map((zone) => (
              <div
                key={zone.id}
                className={`bg-white/40 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all duration-300 min-h-[120px] ${
                  dragOverZone === zone.id
                    ? 'border-blue-400 bg-blue-50/50 shadow-lg'
                    : 'border-white/20'
                }`}
                onDragOver={(e) => handleDragOver(e, zone.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, zone.id)}
              >
                <div className="text-center mb-3">
                  <div className="text-2xl mb-1">{zone.emoji}</div>
                  <h3 className="font-semibold text-gray-800">{zone.name}</h3>
                </div>

                <div className="space-y-2">
                  {zone.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        item.category === zone.category
                          ? 'bg-green-100 border border-green-300'
                          : 'bg-red-100 border border-red-300'
                      }`}
                      onDoubleClick={() => handleRemoveFromZone(item.id, zone.id)}
                      title="Doble clic para remover"
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-sm font-medium flex-1">{item.name}</span>
                      {item.category === zone.category ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  ))}

                  {zone.items.length === 0 && dragOverZone !== zone.id && (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      Arrastra elementos aquí
                    </div>
                  )}

                  {dragOverZone === zone.id && (
                    <div className="text-center py-4 text-blue-500 text-sm font-medium">
                      ¡Suelta aquí!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reset Button */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="text-center">
          <Button
            onClick={initializeGame}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Juego Nuevo
          </Button>
        </div>
      </section>

      {/* Feedback Toast */}
      {showFeedback && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className={`px-6 py-3 rounded-full shadow-lg border-2 transition-all duration-500 ${
            showFeedback.type === 'correct'
              ? 'bg-green-100 border-green-300 text-green-800'
              : 'bg-red-100 border-red-300 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {showFeedback.type === 'correct' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-medium">
                {showFeedback.type === 'correct'
                  ? `¡Correcto! ${showFeedback.item}`
                  : `¡Incorrecto! ${showFeedback.item}`}
              </span>
            </div>
          </div>
        </div>
      )}

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
                ¡Excelente trabajo!
              </h2>

              <p className="text-gray-600 mb-6">
                ¡Has clasificado todos los elementos correctamente!
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
                <div className="text-lg font-semibold text-purple-600 mb-2">
                  {getPerformanceRating().text}
                </div>

                {/* Final Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Precisión</div>
                    <div className="font-bold text-green-600">
                      {Math.round((gameStats.correctPlacements / gameStats.totalItems) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tiempo</div>
                    <div className="font-bold text-blue-600">
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
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
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