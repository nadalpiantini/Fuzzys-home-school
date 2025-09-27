'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Check, X, Eye, EyeOff } from 'lucide-react';
import type { TimelineGame } from '@fuzzy/game-engine';

interface TimelineProps {
  game: TimelineGame;
  onAnswer: (order: string[]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    correctOrder?: string[];
  };
}

export const Timeline: React.FC<TimelineProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback
}) => {
  const [events, setEvents] = useState(game.events);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showDates, setShowDates] = useState(game.displayDates || false);

  useEffect(() => {
    // Shuffle events on mount
    if (!showFeedback) {
      const shuffled = [...game.events].sort(() => Math.random() - 0.5);
      setEvents(shuffled);
    }
  }, [game.events, showFeedback]);

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    setDraggedEvent(eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedEvent || showFeedback) return;

    const draggedIndex = events.findIndex(event => event.id === draggedEvent);
    if (draggedIndex === dropIndex) {
      setDraggedEvent(null);
      setDragOverIndex(null);
      return;
    }

    const newEvents = [...events];
    const [removed] = newEvents.splice(draggedIndex, 1);
    newEvents.splice(dropIndex, 0, removed);

    setEvents(newEvents);
    setDraggedEvent(null);
    setDragOverIndex(null);
  };

  const handleSubmit = () => {
    const currentOrder = events.map(event => event.id);
    onAnswer(currentOrder);
  };

  const toggleDates = () => {
    setShowDates(!showDates);
  };

  const getEventStyle = (index: number) => {
    if (!showFeedback) {
      if (dragOverIndex === index) {
        return 'border-blue-500 bg-blue-50 scale-105';
      }
      return 'hover:border-gray-400';
    }

    const eventId = events[index].id;
    const correctOrder = [...game.events].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const correctIndex = correctOrder.findIndex(event => event.id === eventId);

    if (correctIndex === index) {
      return 'border-green-500 bg-green-50';
    } else {
      return 'border-red-500 bg-red-50';
    }
  };

  const getEventIcon = (index: number) => {
    if (!showFeedback) return null;

    const eventId = events[index].id;
    const correctOrder = [...game.events].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const correctIndex = correctOrder.findIndex(event => event.id === eventId);

    if (correctIndex === index) {
      return <Check className="w-5 h-5 text-green-600" />;
    } else {
      return <X className="w-5 h-5 text-red-600" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Ordena los eventos cronológicamente
          </h3>
          {!showFeedback && (
            <Button
              onClick={toggleDates}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {showDates ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Ocultar Fechas
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Mostrar Fechas
                </>
              )}
            </Button>
          )}
        </div>

        {/* Timeline Visualization */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300" />

          {/* Events */}
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={event.id}
                draggable={!showFeedback}
                onDragStart={(e) => handleDragStart(e, event.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative cursor-move transition-all ${getEventStyle(index)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Timeline Marker */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center">
                      <span className="font-bold text-blue-600">{index + 1}</span>
                    </div>
                    {getEventIcon(index) && (
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                        {getEventIcon(index)}
                      </div>
                    )}
                  </div>

                  {/* Event Card */}
                  <Card className="flex-1 p-4 hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                      {event.image && (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-24 h-24 object-cover rounded"
                          draggable={false}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-lg">{event.title}</h4>
                          {(showDates || showFeedback) && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showFeedback && feedback && (
          <div className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-medium">
              {feedback.correct ? '¡Perfecto! Los eventos están en el orden correcto.' : 'El orden no es correcto.'}
            </p>
            {feedback.explanation && (
              <p className="mt-1 text-sm">{feedback.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              className="ml-auto"
            >
              Verificar Orden
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