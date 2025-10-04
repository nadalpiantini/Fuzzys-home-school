'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DragDropGame } from '@/types/game-types';
import {
  useMobileDetection,
  triggerHapticFeedback,
} from '@/lib/hooks/useMobileDetection';
import {
  useTouchDragDrop,
  type TouchPoint,
  type GestureState,
} from '@/lib/hooks/useTouchGestures';

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

const DragDrop: React.FC<DragDropProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback,
}) => {
  const { isTouchDevice, isMobile } = useMobileDetection();
  const safeItems = game.items ?? [];
  const safeZones = game.zones ?? [];

  const [zones, setZones] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    safeZones.forEach((zone) => {
      if (zone?.id) {
        initial[zone.id] = [];
      }
    });
    return initial;
  });

  const [unplacedItems, setUnplacedItems] = useState<string[]>(() =>
    safeItems.map((it) => it?.id).filter((id): id is string => Boolean(id)),
  );

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(
    null,
  );
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // HTML5 Drag handlers (for desktop)
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
    moveItemToZone(draggedItem, zoneId);
  };

  const handleDropToUnplaced = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || showFeedback) return;
    moveItemToUnplaced(draggedItem);
  };

  // Unified move functions
  const moveItemToZone = (itemId: string, zoneId: string) => {
    // Remove from previous location
    const newZones = { ...zones };
    Object.keys(newZones).forEach((zone) => {
      newZones[zone] = newZones[zone].filter((item) => item !== itemId);
    });

    // Add to new zone
    newZones[zoneId] = [...newZones[zoneId], itemId];
    setZones(newZones);

    // Update unplaced items
    setUnplacedItems((prev) => prev.filter((item) => item !== itemId));
    setDraggedItem(null);
    setIsDraggingTouch(false);

    if (isTouchDevice) {
      triggerHapticFeedback('light');
    }
  };

  const moveItemToUnplaced = (itemId: string) => {
    // Remove from zones
    const newZones = { ...zones };
    Object.keys(newZones).forEach((zone) => {
      newZones[zone] = newZones[zone].filter((item) => item !== itemId);
    });
    setZones(newZones);

    // Add back to unplaced
    if (!unplacedItems.includes(itemId)) {
      setUnplacedItems([...unplacedItems, itemId]);
    }

    setDraggedItem(null);
    setIsDraggingTouch(false);

    if (isTouchDevice) {
      triggerHapticFeedback('light');
    }
  };

  // Touch drag and drop handler
  const { dragState, gestureState, touchHandlers } = useTouchDragDrop({
    enableHaptics: true,
    dragThreshold: 10,
    onDragStart: (point, element) => {
      if (showFeedback) return;

      const itemId = (element as HTMLElement).dataset.itemId;
      if (itemId) {
        setDraggedItem(itemId);
        setDraggedElement(element as HTMLElement);
        setIsDraggingTouch(true);

        // Calculate offset from touch point to element center
        const rect = element.getBoundingClientRect();
        setDragOffset({
          x: point.x - rect.left - rect.width / 2,
          y: point.y - rect.top - rect.height / 2,
        });

        // Add visual feedback
        (element as HTMLElement).style.transform = 'scale(1.05)';
        (element as HTMLElement).style.zIndex = '1000';
        (element as HTMLElement).style.transition = 'transform 0.2s';
      }
    },
    onDragMove: (state, element) => {
      if (!state.currentPoint || !draggedElement) return;

      // Move element with touch
      draggedElement.style.position = 'fixed';
      draggedElement.style.left = `${state.currentPoint.x - dragOffset.x}px`;
      draggedElement.style.top = `${state.currentPoint.y - dragOffset.y}px`;
      draggedElement.style.pointerEvents = 'none';
    },
    onDrop: (dragElement, dropElement, state) => {
      if (!draggedItem || !draggedElement) return;

      // Reset element styles
      draggedElement.style.transform = '';
      draggedElement.style.position = '';
      draggedElement.style.left = '';
      draggedElement.style.top = '';
      draggedElement.style.zIndex = '';
      draggedElement.style.pointerEvents = '';
      draggedElement.style.transition = '';

      // Find drop zone
      let dropZoneId: string | null = null;
      let isUnplacedArea = false;

      if (dropElement) {
        // Check if dropped on a zone
        const zoneElement = dropElement.closest('[data-zone-id]');
        if (zoneElement) {
          dropZoneId = (zoneElement as HTMLElement).dataset.zoneId || null;
        }

        // Check if dropped on unplaced area
        const unplacedElement = dropElement.closest('[data-unplaced-area]');
        if (unplacedElement) {
          isUnplacedArea = true;
        }
      }

      if (dropZoneId) {
        moveItemToZone(draggedItem, dropZoneId);
      } else if (isUnplacedArea) {
        moveItemToUnplaced(draggedItem);
      } else {
        // Dropped in invalid area, reset
        setDraggedItem(null);
        setIsDraggingTouch(false);
      }

      setDraggedElement(null);
    },
  });

  // Effect to handle touch interactions
  useEffect(() => {
    if (!containerRef.current || !isTouchDevice) return;

    const container = containerRef.current;
    const { onTouchStart, onTouchMove, onTouchEnd } = touchHandlers;

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchHandlers, isTouchDevice]);

  const handleSubmit = () => {
    onAnswer(zones);
  };

  const getItemStyle = (itemId: string) => {
    if (!showFeedback) return '';

    const item = safeItems.find((i) => i?.id === itemId);
    if (!item) return '';

    const placedZone = Object.keys(zones).find((zone) =>
      zones[zone].includes(itemId),
    );

    if (placedZone === item.targetZone) {
      return 'bg-green-100 border-green-500';
    } else if (placedZone) {
      return 'bg-red-100 border-red-500';
    }
    return 'bg-gray-100';
  };

  const getItemContent = (itemId: string) => {
    const item = safeItems.find((i) => i?.id === itemId);
    return item?.content || '';
  };

  return (
    <Card className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div
        ref={containerRef}
        className="space-y-4 sm:space-y-6"
        style={{ touchAction: 'none' }} // Prevent default touch behaviors
      >
        <div className="text-base sm:text-lg font-medium text-gray-900 text-center">
          {isTouchDevice
            ? 'Toca y arrastra los elementos a las zonas correctas'
            : 'Arrastra los elementos a las zonas correctas'}
        </div>

        {isTouchDevice && (
          <div className="text-xs sm:text-sm text-gray-600 text-center bg-blue-50 p-2 rounded-lg">
            💡 Mantén presionado un elemento para arrastrarlo
          </div>
        )}

        {/* Unplaced Items */}
        <div
          className="min-h-[80px] sm:min-h-[100px] p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
          onDragOver={handleDragOver}
          onDrop={handleDropToUnplaced}
          data-unplaced-area="true"
        >
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
            Elementos sin colocar:
          </p>
          <div className="flex flex-wrap gap-2">
            {unplacedItems.map((itemId) => (
              <div
                key={itemId}
                data-item-id={itemId}
                draggable={!showFeedback && !isTouchDevice}
                onDragStart={() => handleDragStart(itemId)}
                className={`px-3 py-2 sm:px-4 sm:py-2 bg-white rounded-lg border-2 transition-all select-none min-h-[44px] flex items-center justify-center text-sm sm:text-base ${
                  isTouchDevice
                    ? 'touch-manipulation'
                    : 'cursor-move hover:shadow-md'
                } ${getItemStyle(itemId)} ${
                  isDraggingTouch && draggedItem === itemId
                    ? 'opacity-50 transform scale-105'
                    : ''
                }`}
                style={{
                  // Ensure minimum touch target size on mobile
                  minWidth: isMobile ? '44px' : 'auto',
                  minHeight: '44px',
                }}
              >
                {getItemContent(itemId)}
              </div>
            ))}
          </div>
        </div>

        {/* Drop Zones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {safeZones.map((zone) => (
            <div
              key={zone.id}
              data-zone-id={zone.id}
              className="p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
              onDragOver={handleDragOver}
              onDrop={(e) => zone?.id && handleDrop(e, zone.id)}
            >
              <h3 className="font-medium text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">
                {zone?.label}
              </h3>
              <div className="min-h-[60px] sm:min-h-[80px] space-y-2">
                {zone?.id &&
                  zones[zone.id]?.map((itemId) => (
                    <div
                      key={itemId}
                      data-item-id={itemId}
                      draggable={!showFeedback && !isTouchDevice}
                      onDragStart={() => handleDragStart(itemId)}
                      className={`px-3 py-2 sm:px-4 sm:py-2 bg-white rounded-lg border-2 transition-all select-none min-h-[44px] flex items-center justify-center text-sm sm:text-base ${
                        isTouchDevice
                          ? 'touch-manipulation'
                          : 'cursor-move hover:shadow-md'
                      } ${getItemStyle(itemId)} ${
                        isDraggingTouch && draggedItem === itemId
                          ? 'opacity-50 transform scale-105'
                          : ''
                      }`}
                      style={{
                        minWidth: isMobile ? '44px' : 'auto',
                        minHeight: '44px',
                      }}
                    >
                      {getItemContent(itemId)}
                    </div>
                  ))}
                {zone?.id && (zones[zone.id]?.length ?? 0) === 0 && (
                  <p className="text-xs sm:text-sm text-blue-600 italic text-center py-4">
                    {isTouchDevice
                      ? 'Suelta elementos aquí'
                      : 'Arrastra elementos aquí'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {showFeedback && feedback && (
          <div
            className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}
          >
            <p className="font-medium">
              {feedback.correct
                ? '¡Perfecto!'
                : `${feedback.score}/${feedback.maxScore} elementos correctos`}
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
              className="ml-auto min-h-[44px] px-6"
              size={isMobile ? 'lg' : 'default'}
            >
              Verificar Respuesta
            </Button>
          ) : (
            onNext && (
              <Button
                onClick={onNext}
                className="ml-auto min-h-[44px] px-6"
                size={isMobile ? 'lg' : 'default'}
              >
                Siguiente
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  );
};

export default DragDrop;
