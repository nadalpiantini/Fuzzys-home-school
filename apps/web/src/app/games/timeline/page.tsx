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
  Calendar,
  CheckCircle,
  XCircle,
  Target,
  Clock,
  Sparkles,
  GripVertical,
  ArrowRight,
  History,
  BookOpen,
} from 'lucide-react';

interface HistoricalEvent {
  id: number;
  title: string;
  year: number;
  description: string;
  emoji: string;
  category: 'discovery' | 'invention' | 'war' | 'founding' | 'independence' | 'space';
  importance: 'high' | 'medium' | 'low';
}

interface GameStats {
  attempts: number;
  correctPositions: number;
  timeElapsed: number;
  score: number;
  completed: boolean;
}

interface DraggedEvent extends HistoricalEvent {
  currentPosition: number;
  correctPosition: number;
  isCorrect: boolean;
}

const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: 1,
    title: 'Descubrimiento de América',
    year: 1492,
    description: 'Cristóbal Colón llega a América',
    emoji: '🌎',
    category: 'discovery',
    importance: 'high',
  },
  {
    id: 2,
    title: 'Invención de la Imprenta',
    year: 1440,
    description: 'Gutenberg inventa la imprenta moderna',
    emoji: '📚',
    category: 'invention',
    importance: 'high',
  },
  {
    id: 3,
    title: 'Primera Guerra Mundial',
    year: 1914,
    description: 'Comienza la Gran Guerra',
    emoji: '⚔️',
    category: 'war',
    importance: 'high',
  },
  {
    id: 4,
    title: 'Llegada a la Luna',
    year: 1969,
    description: 'Neil Armstrong camina en la Luna',
    emoji: '🌙',
    category: 'space',
    importance: 'high',
  },
  {
    id: 5,
    title: 'Independencia de Estados Unidos',
    year: 1776,
    description: 'Declaración de Independencia',
    emoji: '🗽',
    category: 'independence',
    importance: 'high',
  },
  {
    id: 6,
    title: 'Fundación de Roma',
    year: -753,
    description: 'Según la leyenda, Rómulo funda Roma',
    emoji: '🏛️',
    category: 'founding',
    importance: 'medium',
  },
];

const EVENT_SETS = [
  // Set 1: Exploración y Descubrimientos
  [
    { ...HISTORICAL_EVENTS[1] }, // Imprenta 1440
    { ...HISTORICAL_EVENTS[0] }, // América 1492
    { ...HISTORICAL_EVENTS[4] }, // Independencia USA 1776
    { ...HISTORICAL_EVENTS[2] }, // WWI 1914
    { ...HISTORICAL_EVENTS[3] }, // Luna 1969
    { ...HISTORICAL_EVENTS[5] }, // Roma -753
  ],
  // Set 2: Más eventos (para resetear)
  [
    {
      id: 7,
      title: 'Caída del Imperio Romano',
      year: 476,
      description: 'Fin del Imperio Romano de Occidente',
      emoji: '🏺',
      category: 'founding',
      importance: 'high',
    },
    {
      id: 8,
      title: 'Revolución Francesa',
      year: 1789,
      description: 'Comienza la Revolución Francesa',
      emoji: '🇫🇷',
      category: 'independence',
      importance: 'high',
    },
    {
      id: 9,
      title: 'Invención del Teléfono',
      year: 1876,
      description: 'Alexander Graham Bell inventa el teléfono',
      emoji: '📞',
      category: 'invention',
      importance: 'medium',
    },
    {
      id: 10,
      title: 'Segunda Guerra Mundial',
      year: 1939,
      description: 'Comienza la Segunda Guerra Mundial',
      emoji: '🌍',
      category: 'war',
      importance: 'high',
    },
    {
      id: 11,
      title: 'Invención de Internet',
      year: 1969,
      description: 'ARPANET, precursor de Internet',
      emoji: '💻',
      category: 'invention',
      importance: 'high',
    },
    {
      id: 12,
      title: 'Descubrimiento de Machu Picchu',
      year: 1911,
      description: 'Hiram Bingham redescubre Machu Picchu',
      emoji: '🏔️',
      category: 'discovery',
      importance: 'medium',
    },
  ],
];

export default function TimelineGame() {
  const router = useRouter();
  const [currentEventSet, setCurrentEventSet] = useState(0);
  const [events, setEvents] = useState<DraggedEvent[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    attempts: 0,
    correctPositions: 0,
    timeElapsed: 0,
    score: 0,
    completed: false,
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [draggedEventId, setDraggedEventId] = useState<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);

  // Initialize game
  const initializeGame = useCallback(() => {
    const selectedEvents = EVENT_SETS[currentEventSet];
    const correctOrder = [...selectedEvents].sort((a, b) => a.year - b.year);
    const shuffledEvents = [...selectedEvents].sort(() => Math.random() - 0.5);

    const gameEvents: DraggedEvent[] = shuffledEvents.map((event, index) => ({
      ...event,
      currentPosition: index,
      correctPosition: correctOrder.findIndex(e => e.id === event.id),
      isCorrect: false,
    } as DraggedEvent));

    setEvents(gameEvents);
    setGameStats({
      attempts: 0,
      correctPositions: 0,
      timeElapsed: 0,
      score: 0,
      completed: false,
    });
    setGameStarted(false);
    setShowResults(false);
  }, [currentEventSet]);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !gameStats.completed) {
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
  }, [gameStarted, gameStats.completed]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, eventId: number) => {
    setDraggedEventId(eventId);
    setGameStarted(true);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDragOverPosition(position);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, dropPosition: number) => {
    e.preventDefault();

    if (draggedEventId === null) return;

    const draggedEvent = events.find(event => event.id === draggedEventId);
    const targetEvent = events.find(event => event.currentPosition === dropPosition);

    if (!draggedEvent || !targetEvent) return;

    // Swap positions
    const newEvents = events.map(event => {
      if (event.id === draggedEventId) {
        return { ...event, currentPosition: dropPosition };
      }
      if (event.currentPosition === dropPosition) {
        return { ...event, currentPosition: draggedEvent.currentPosition };
      }
      return event;
    });

    setEvents(newEvents);
    setDraggedEventId(null);
    setDragOverPosition(null);
  };

  // Check answers
  const checkAnswers = () => {
    const updatedEvents = events.map(event => ({
      ...event,
      isCorrect: event.currentPosition === event.correctPosition,
    }));

    const correctCount = updatedEvents.filter(event => event.isCorrect).length;
    const maxScore = 1000;
    const timeBonus = Math.max(0, maxScore - (gameStats.timeElapsed * 5));
    const attemptPenalty = gameStats.attempts * 50;
    const accuracyBonus = (correctCount / events.length) * 500;
    const finalScore = Math.max(0, timeBonus - attemptPenalty + accuracyBonus);

    setEvents(updatedEvents);
    setGameStats(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      correctPositions: correctCount,
      score: Math.round(finalScore),
      completed: correctCount === events.length,
    }));
    setShowResults(true);
  };

  // Reset to try different events
  const resetWithNewEvents = () => {
    setCurrentEventSet((prev) => (prev + 1) % EVENT_SETS.length);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get performance rating
  const getPerformanceRating = () => {
    const accuracy = gameStats.correctPositions / events.length;
    if (accuracy === 1 && gameStats.attempts === 1) return { stars: 3, text: '¡Perfecto!' };
    if (accuracy >= 0.8) return { stars: 2, text: '¡Muy bien!' };
    return { stars: 1, text: '¡Sigue intentando!' };
  };

  // Sort events by current position for display
  const sortedEvents = [...events].sort((a, b) => a.currentPosition - b.currentPosition);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  📅 Aventura en el Tiempo
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Ordena los eventos históricos en secuencia cronológica!
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
                <span className="text-sm font-medium text-gray-700">Intentos</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{gameStats.attempts}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Correctas</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {gameStats.correctPositions}/{events.length}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
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

      {/* Instructions */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Instrucciones</h3>
          </div>
          <p className="text-blue-800 text-sm">
            Arrastra los eventos históricos para ordenarlos cronológicamente desde el más antiguo hasta el más reciente.
            ¡Usa las fechas como pista!
          </p>
        </div>
      </section>

      {/* Timeline Game Board */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          {/* Timeline Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Línea de Tiempo Histórica
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <ArrowRight className="w-4 h-4" />
              <span>Más Antiguo</span>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-purple-300 mx-4"></div>
              <span>Más Reciente</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Events to Arrange */}
          <div className="space-y-4 mb-8">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline connector */}
                {index < sortedEvents.length - 1 && (
                  <div className="absolute left-6 top-16 w-px h-8 bg-gradient-to-b from-blue-300 to-purple-300 z-0"></div>
                )}

                <Card
                  className={`cursor-move transition-all duration-300 transform hover:scale-105 ${
                    showResults && event.isCorrect
                      ? 'bg-gradient-to-r from-green-100 to-green-200 border-green-400 ring-2 ring-green-300'
                      : showResults && !event.isCorrect
                      ? 'bg-gradient-to-r from-red-100 to-red-200 border-red-400 ring-2 ring-red-300'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100'
                  } ${
                    dragOverPosition === index ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, event.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Drag Handle */}
                      <div className="text-gray-400">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{event.emoji}</span>
                          <div>
                            <h3 className="font-bold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600">{event.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-white/50">
                            <Calendar className="w-3 h-3 mr-1" />
                            {event.year > 0 ? `${event.year} d.C.` : `${Math.abs(event.year)} a.C.`}
                          </Badge>

                          {showResults && (
                            <Badge
                              className={event.isCorrect
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                              }
                            >
                              {event.isCorrect ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Correcto
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Posición {event.correctPosition + 1}
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Position Indicator */}
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          #{index + 1}
                        </div>
                        <div className="text-xs text-gray-500">Posición</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={checkAnswers}
              disabled={showResults && gameStats.completed}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
              size="lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Verificar Orden
            </Button>

            <Button
              onClick={initializeGame}
              variant="outline"
              className="bg-white/50 hover:bg-white/80"
              size="lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reiniciar
            </Button>

            <Button
              onClick={resetWithNewEvents}
              variant="outline"
              className="bg-white/50 hover:bg-white/80"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Nuevos Eventos
            </Button>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showResults && gameStats.completed && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl border border-white/20">
            <div className="text-center">
              {/* Celebration Animation */}
              <div className="text-6xl mb-4 animate-bounce">
                🎉
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ¡Línea de Tiempo Completa!
              </h2>

              <p className="text-gray-600 mb-6">
                ¡Has ordenado correctamente todos los eventos históricos!
              </p>

              {/* Performance Rating */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
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
                <div className="text-lg font-semibold text-blue-600 mb-2">
                  {getPerformanceRating().text}
                </div>

                {/* Final Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
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

                <div className="mt-3">
                  <div className="text-gray-600">Puntuación Final</div>
                  <div className="text-2xl font-bold text-yellow-600">{gameStats.score}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={resetWithNewEvents}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Nuevos Eventos
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