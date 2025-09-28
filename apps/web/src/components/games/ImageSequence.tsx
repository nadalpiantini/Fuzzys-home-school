'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, RefreshCw } from 'lucide-react';
import type { ImageSequenceGame } from '@/types/game-types';

interface ImageSequenceProps {
  game: ImageSequenceGame;
  onAnswer: (order: number[]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    correctOrder?: number[];
  };
}

export const ImageSequence: React.FC<ImageSequenceProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback,
}) => {
  // defaults seguros (no cambian el tipo, solo evitan undefined en build)
  const safeItems = game.items ?? [];
  const safeOrder = game.correctOrder ?? [];
  const getId = (i: number) => safeItems[i]?.id;
  const [items, setItems] = useState(game.items);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    // Shuffle items on mount
    if (!showFeedback) {
      const shuffled = [...safeItems].sort(() => Math.random() - 0.5);
      setItems(shuffled);
    }
  }, [game.items, showFeedback]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
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
    if (!draggedItem || showFeedback || !items) return;

    const draggedIndex = items.findIndex((it) => it?.id === draggedItem);
    if (draggedIndex === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    setItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleSubmit = () => {
    const currentOrder = (items ?? []).map((it) =>
      (game.items ?? []).findIndex((o) => o?.id === it?.id),
    );
    onAnswer(currentOrder);
  };

  const handleReset = () => {
    const shuffled = [...safeItems].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  };

  const getItemStyle = (index: number) => {
    if (!showFeedback) {
      if (dragOverIndex === index) {
        return 'border-blue-500 bg-blue-50 scale-105';
      }
      return 'hover:border-gray-400';
    }

    const itemId = getId(index);
    const originalIndex = (game.items ?? []).findIndex(
      (it) => it?.id === itemId,
    );
    const isCorrectPosition = safeOrder[index] === originalIndex;

    if (isCorrectPosition) {
      return 'border-green-500 bg-green-50';
    } else {
      return 'border-red-500 bg-red-50';
    }
  };

  const getItemIcon = (index: number) => {
    if (!showFeedback) return null;

    const itemId = getId(index);
    const originalIndex = (game.items ?? []).findIndex(
      (it) => it?.id === itemId,
    );
    const isCorrectPosition = safeOrder[index] === originalIndex;

    if (isCorrectPosition) {
      return <Check className="w-5 h-5 text-green-600" />;
    } else {
      return <X className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Ordena las imágenes en la secuencia correcta
          </h3>
          {!showFeedback && (
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Mezclar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items?.map((item, index) => (
            <div
              key={item.id}
              draggable={!showFeedback}
              onDragStart={(e) => item.id && handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative group cursor-move transition-all ${getItemStyle(index)}`}
            >
              <Card className="overflow-hidden border-2">
                <div className="relative">
                  <div className="absolute top-2 left-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  {getItemIcon(index) && (
                    <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1">
                      {getItemIcon(index)}
                    </div>
                  )}
                  <img
                    src={item.image}
                    alt={item.caption || `Image ${index + 1}`}
                    className="w-full h-32 object-cover"
                    draggable={false}
                  />
                  {item.caption && (
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-600 text-center">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>

        {showFeedback && feedback && (
          <div
            className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
          >
            <p className="font-medium">
              {feedback.correct
                ? '¡Perfecto! La secuencia es correcta.'
                : 'No es la secuencia correcta.'}
            </p>
            {feedback.explanation && (
              <p className="mt-1 text-sm">{feedback.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          {!showFeedback ? (
            <Button onClick={handleSubmit} className="ml-auto">
              Verificar Secuencia
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
