'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DragDropGame } from '@fuzzy/game-engine';

interface DragDropProps {
  game: DragDropGame;
  onAnswer: (answer: Record<string, string[]>) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    score: number;
    maxScore: number;
    explanation?: string;
  };
}

interface DragItem {
  id: string;
  content: string;
}

export const DragDrop: React.FC<DragDropProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback
}) => {
  const safeItems = game.items ?? [];
  const safeZones = game.zones ?? [];
  const [zones, setZones] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    safeZones.forEach(zone => {
      if (zone?.id) {
        initial[zone.id] = [];
      }
    });
    return initial;
  });

  const [unplacedItems, setUnplacedItems] = useState<string[]>(
    () => safeItems.map(it => it?.id).filter((id): id is string => Boolean(id))
  );

  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (itemId: string) => {
    if (showFeedback) return;
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (!draggedItem || showFeedback) return;

    // Remove from previous location
    const newZones = { ...zones };
    Object.keys(newZones).forEach(zone => {
      newZones[zone] = newZones[zone].filter(item => item !== draggedItem);
    });

    // Add to new zone
    newZones[zoneId] = [...newZones[zoneId], draggedItem];
    setZones(newZones);

    // Update unplaced items
    setUnplacedItems(prev => prev.filter(item => item !== draggedItem));
    setDraggedItem(null);
  };

  const handleDropToUnplaced = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || showFeedback) return;

    // Remove from zones
    const newZones = { ...zones };
    Object.keys(newZones).forEach(zone => {
      newZones[zone] = newZones[zone].filter(item => item !== draggedItem);
    });
    setZones(newZones);

    // Add back to unplaced
    if (!unplacedItems.includes(draggedItem)) {
      setUnplacedItems([...unplacedItems, draggedItem]);
    }

    setDraggedItem(null);
  };

  const handleSubmit = () => {
    onAnswer(zones);
  };

  const getItemStyle = (itemId: string) => {
    if (!showFeedback) return '';

    const item = safeItems.find(i => i?.id === itemId);
    if (!item) return '';

    const placedZone = Object.keys(zones).find(zone =>
      zones[zone].includes(itemId)
    );

    if (placedZone === item.targetZone) {
      return 'bg-green-100 border-green-500';
    } else if (placedZone) {
      return 'bg-red-100 border-red-500';
    }
    return 'bg-gray-100';
  };

  const getItemContent = (itemId: string) => {
    const item = safeItems.find(i => i?.id === itemId);
    return item?.content || '';
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="text-lg font-medium text-gray-900">
          Arrastra los elementos a las zonas correctas
        </div>

        {/* Unplaced Items */}
        <div
          className="min-h-[100px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
          onDragOver={handleDragOver}
          onDrop={handleDropToUnplaced}
        >
          <p className="text-sm text-gray-600 mb-3">Elementos sin colocar:</p>
          <div className="flex flex-wrap gap-2">
            {unplacedItems.map(itemId => (
              <div
                key={itemId}
                draggable={!showFeedback}
                onDragStart={() => handleDragStart(itemId)}
                className={`px-4 py-2 bg-white rounded-lg border-2 cursor-move hover:shadow-md transition-all ${getItemStyle(itemId)}`}
              >
                {getItemContent(itemId)}
              </div>
            ))}
          </div>
        </div>

        {/* Drop Zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeZones.map(zone => (
            <div
              key={zone.id}
              className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
              onDragOver={handleDragOver}
              onDrop={(e) => zone?.id && handleDrop(e, zone.id)}
            >
              <h3 className="font-medium text-blue-900 mb-3">{zone?.label}</h3>
              <div className="min-h-[80px] space-y-2">
                {zone?.id && zones[zone.id]?.map(itemId => (
                  <div
                    key={itemId}
                    draggable={!showFeedback}
                    onDragStart={() => handleDragStart(itemId)}
                    className={`px-4 py-2 bg-white rounded-lg border-2 cursor-move hover:shadow-md transition-all ${getItemStyle(itemId)}`}
                  >
                    {getItemContent(itemId)}
                  </div>
                ))}
                {zone?.id && (zones[zone.id]?.length ?? 0) === 0 && (
                  <p className="text-sm text-blue-600 italic">Arrastra elementos aquí</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {showFeedback && feedback && (
          <div className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
            <p className="font-medium">
              {feedback.correct ? '¡Perfecto!' : `${feedback.score}/${feedback.maxScore} elementos correctos`}
            </p>
            {feedback.explanation && (
              <p className="mt-1 text-sm">{feedback.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-between">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={unplacedItems.length > 0}
              className="ml-auto"
            >
              Verificar Respuesta
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