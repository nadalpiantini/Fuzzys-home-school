'use client';

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import type { DragDropGame } from '@/types/game-types';
import {
  useMobileDetection,
  triggerHapticFeedback,
} from '@/lib/hooks/useMobileDetection';
import { useOptimizedTouch, useOptimizedDragDrop } from '@/lib/hooks/useOptimizedTouch';

interface DragDropProps {
  game: DragDropGame;
  onAnswer: (answer: Record<string, string[]>, feedback?: {
    correct: boolean;
    score: number;
    maxScore: number;
    explanation?: string;
  }) => void;
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
  
  // Auto-generate zones from items if no zones provided
  const safeZones = game.zones ?? safeItems.map((item, index) => ({
    id: `zone-${index}`,
    label: `${item.image} ${item.target}`
  }));

  const [zones, setZones] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    safeZones.forEach((zone) => {
      if (zone?.id) {
        initial[zone.id] = [];
      }
    });
    return initial;
  });

  // Banco de sílabas infinito - siempre disponible
  const syllableBank = game.syllableBank || [
    { text: "ña", available: true },
    { text: "ñe", available: true },
    { text: "ñi", available: true },
    { text: "ño", available: true },
    { text: "ñu", available: true }
  ];

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
    // For syllable items, create a new unique ID to allow multiple copies
    let finalItemId = itemId;
    if (itemId.startsWith('syllable-')) {
      // Create a new unique ID for this instance
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substr(2, 5);
      finalItemId = `${itemId}-${timestamp}-${randomSuffix}`;
    } else {
      // For regular items, remove from previous location first
      const newZones = { ...zones };
      Object.keys(newZones).forEach((zone) => {
        newZones[zone] = newZones[zone].filter((item) => item !== itemId);
      });
      setZones(newZones);
    }

    // Add to new zone
    setZones(prevZones => ({
      ...prevZones,
      [zoneId]: [...(prevZones[zoneId] || []), finalItemId]
    }));

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

  // Auto-verify disabled - user must click "Verificar Respuestas" button
  // useEffect(() => {
  //   if (!showFeedback && Object.values(zones).some(zone => zone.length > 0)) {
  //     // Check if all zones that should have items actually have them
  //     const allZonesHaveItems = safeZones.every(zone => {
  //       const expectedItems = safeItems.filter(item => item.target === (zone.label.split(' ')[1] || zone.label));
  //       return expectedItems.length === 0 || zones[zone.id]?.length > 0;
  //     });
      
  //     // Only auto-verify if ALL zones that need items have them
  //     const totalZonesWithItems = safeZones.filter(zone => {
  //       const expectedItems = safeItems.filter(item => item.target === (zone.label.split(' ')[1] || zone.label));
  //       return expectedItems.length > 0;
  //     }).length;
      
  //     const zonesWithItems = safeZones.filter(zone => {
  //       const expectedItems = safeItems.filter(item => item.target === (zone.label.split(' ')[1] || zone.label));
  //       return expectedItems.length > 0 && zones[zone.id]?.length > 0;
  //     }).length;
      
  //     if (allZonesHaveItems && zonesWithItems === totalZonesWithItems && totalZonesWithItems > 0) {
  //       // Small delay to ensure UI updates are complete
  //       setTimeout(() => {
  //         handleSubmit();
  //       }, 2000);
  //     }
  //   }
  // }, [zones, showFeedback, safeZones, safeItems]);

  const handleSubmit = () => {
    // Validate the answers
    let correctCount = 0;
    let totalItems = 0;
    const validationResults: Record<string, { correct: boolean; expected: string; actual: string }> = {};
    
    console.log('🔍 Starting validation...');
    console.log('Zones:', zones);
    console.log('SafeZones:', safeZones);
    console.log('SafeItems:', safeItems);
    
    // Check each zone
    Object.keys(zones).forEach(zoneId => {
      const zone = safeZones.find(z => z.id === zoneId);
      if (!zone) {
        console.log(`❌ Zone not found for ID: ${zoneId}`);
        return;
      }
      
      console.log(`🔍 Checking zone: ${zone.label}`);
      const itemsInZone = zones[zoneId];
      console.log(`Items in zone ${zoneId}:`, itemsInZone);
      
      itemsInZone.forEach(itemId => {
        console.log(`🔍 Checking item: ${itemId}`);
        
        // Handle syllable items from the infinite bank
        if (itemId.startsWith('syllable-')) {
          // Extract the original syllable text from the unique ID
          const parts = itemId.split('-');
          const syllableText = parts.length >= 2 ? parts[1] : itemId.replace('syllable-', '').split('-')[0];
          const zoneWord = zone.label.split(' ')[1] || zone.label;
          
          console.log(`Syllable text: ${syllableText}, Zone word: ${zoneWord}`);
          
          // Find the correct syllable for this zone by matching zone index
          const zoneIndex = parseInt(zoneId.replace('zone-', ''));
          const correctSyllable = safeItems[zoneIndex]?.text;
          console.log(`Looking for target: ${zoneWord}`);
          console.log(`Available items:`, safeItems.map(item => ({ target: item.target, text: item.text })));
          console.log(`Found correct syllable: ${correctSyllable}`);
          
          const isCorrect = syllableText === correctSyllable;
          
          console.log(`Correct syllable: ${correctSyllable}, Is correct: ${isCorrect}`);
          
          totalItems++;
          if (isCorrect) {
            correctCount++;
          }
          
          validationResults[itemId] = {
            correct: isCorrect,
            expected: correctSyllable || '',
            actual: syllableText
          };
        } else {
          // Handle regular items
          const item = safeItems.find(i => i.id === itemId);
          if (!item) {
            console.log(`❌ Item not found: ${itemId}`);
            return;
          }
          
          totalItems++;
          
          const zoneWord = zone.label.split(' ')[1] || zone.label;
          const isCorrect = item.target === zoneWord;
          
          if (isCorrect) {
            correctCount++;
          }
          
          validationResults[itemId] = {
            correct: isCorrect,
            expected: item.target || '',
            actual: zoneWord
          };
        }
      });
    });
    
    console.log('📊 Validation results:', validationResults);
    console.log(`✅ Final count: ${correctCount}/${totalItems}`);
    
    // Calculate score and provide feedback
    const score = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
    const isCorrect = correctCount === totalItems && totalItems > 0;
    
    // Create feedback object
    const feedbackData = {
      correct: isCorrect,
      score: correctCount,
      maxScore: totalItems,
      explanation: isCorrect 
        ? '¡Perfecto! Has colocado todas las sílabas correctamente.' 
        : `Has colocado ${correctCount} de ${totalItems} sílabas correctamente. Revisa las respuestas incorrectas.`
    };
    
    console.log('📤 Sending feedback:', feedbackData);
    
    // Pass feedback to parent component
    onAnswer(zones, feedbackData);
  };

  const getItemStyle = (itemId: string) => {
    if (!showFeedback) return '';

    // Handle syllable items from the infinite bank
    if (itemId.startsWith('syllable-')) {
      // Extract the original syllable text from the unique ID
      const parts = itemId.split('-');
      const syllableText = parts.length >= 2 ? parts[1] : itemId.replace('syllable-', '').split('-')[0];
      const placedZone = Object.keys(zones).find((zone) =>
        zones[zone].includes(itemId),
      );
      
      if (placedZone) {
        const zone = safeZones.find(z => z.id === placedZone);
        if (zone) {
          const zoneIndex = parseInt(placedZone.replace('zone-', ''));
          const correctSyllable = safeItems[zoneIndex]?.text;
          if (syllableText === correctSyllable) {
            return 'bg-green-100 border-green-500';
          } else {
            return 'bg-red-100 border-red-500';
          }
        }
      }
      return 'bg-gray-100';
    }

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
    // Handle syllable items from the infinite bank
    if (itemId.startsWith('syllable-')) {
      // Extract the original syllable text from the unique ID
      const parts = itemId.split('-');
      if (parts.length >= 2) {
        return parts[1]; // Return the syllable text (ña, ñe, ñi, ño, ñu)
      }
      return itemId.replace('syllable-', '').split('-')[0];
    }
    
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
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
          {isTouchDevice
            ? 'Toca y arrastra los elementos a las zonas correctas'
            : 'Arrastra los elementos a las zonas correctas'}
        </div>

        {isTouchDevice && (
          <div className="text-lg sm:text-xl text-gray-600 text-center bg-blue-50 p-4 rounded-lg">
            💡 Mantén presionado un elemento para arrastrarlo
          </div>
        )}

        {/* Layout de 3 columnas: Sílabas | Fuzzy Teacher N | Palabras */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {/* Columna 1: Banco de Sílabas */}
          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 text-center">
              🎯 Sílabas
            </h3>
            <div
              className="flex-1 p-4 bg-gradient-to-b from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-green-300"
              onDragOver={handleDragOver}
              onDrop={handleDropToUnplaced}
              data-unplaced-area="true"
            >
              <div className="space-y-3">
                {syllableBank.map((syllable, index) => (
                  <div
                    key={`${syllable.text}-${index}`}
                    data-syllable={syllable.text}
                    draggable={!showFeedback && !isTouchDevice}
                    onDragStart={() => handleDragStart(`syllable-${syllable.text}-${index}`)}
                    className={`px-4 py-3 bg-white rounded-lg border-2 transition-all select-none min-h-[60px] flex items-center justify-center text-2xl sm:text-3xl font-bold ${
                      isTouchDevice
                        ? 'touch-manipulation'
                        : 'cursor-move hover:shadow-md hover:scale-105'
                    } ${
                      isDraggingTouch && draggedItem === `syllable-${syllable.text}-${index}`
                        ? 'opacity-50 transform scale-105'
                        : 'bg-gradient-to-br from-blue-100 to-green-100 border-blue-400'
                    }`}
                  >
                    {syllable.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna 2: Fuzzy Teacher N */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96">
              <Image
                src="/fuzzy_teacher_N.png"
                alt="Fuzzy Teacher N"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 320px, 384px"
              />
            </div>
            <p className="text-sm text-gray-600 text-center font-bold">
              Fuzzy Teacher N
            </p>
          </div>

          {/* Columna 3: Palabras (Drop Zones) */}
          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 text-center">
              📝 Palabras
            </h3>
            <div className="space-y-3">
              {safeZones.map((zone) => (
                <div
                  key={zone.id}
                  data-zone-id={zone.id}
                  className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200"
                  onDragOver={handleDragOver}
                  onDrop={(e) => zone?.id && handleDrop(e, zone.id)}
                >
                  <h4 className="font-bold text-blue-900 mb-2 text-lg text-center">
                    {zone?.label}
                  </h4>
                  <div className="min-h-[60px] space-y-2">
                    {zone?.id &&
                      zones[zone.id]?.map((itemId) => (
                        <div
                          key={itemId}
                          data-item-id={itemId}
                          draggable={!showFeedback && !isTouchDevice}
                          onDragStart={() => handleDragStart(itemId)}
                          className={`px-3 py-2 bg-white rounded-lg border-2 transition-all select-none min-h-[40px] flex items-center justify-center text-lg font-bold ${
                            isTouchDevice
                              ? 'touch-manipulation'
                              : 'cursor-move hover:shadow-md'
                          } ${getItemStyle(itemId)} ${
                            isDraggingTouch && draggedItem === itemId
                              ? 'opacity-50 transform scale-105'
                              : ''
                          }`}
                        >
                          {getItemContent(itemId)}
                        </div>
                      ))}
                    {zone?.id && (zones[zone.id]?.length ?? 0) === 0 && (
                      <p className="text-xs text-blue-600 italic text-center py-2 font-bold">
                        {isTouchDevice
                          ? 'Suelta aquí'
                          : 'Arrastra aquí'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showFeedback && feedback && (
          <div
            className={`p-6 rounded-2xl border-2 shadow-lg ${
              feedback.correct 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800' 
                : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                feedback.correct ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {feedback.correct ? '🎉' : '📝'}
              </div>
              <div>
                <p className="font-bold text-2xl">
                  {feedback.correct
                    ? '¡Perfecto!'
                    : `${feedback.score}/${feedback.maxScore} sílabas correctas`}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      feedback.correct ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${(feedback.score / feedback.maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {feedback.explanation && (
              <p className="text-lg font-medium bg-white/50 p-4 rounded-xl border border-white/30">
                {feedback.explanation}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between">
          {!showFeedback && (
            <Button
              onClick={handleSubmit}
              className="ml-auto min-h-[80px] px-12 text-2xl font-bold"
              size="lg"
            >
              Verificar Respuestas
            </Button>
          )}
          {showFeedback && onNext && (
            <Button
              onClick={onNext}
              className="ml-auto min-h-[80px] px-12 text-2xl font-bold"
              size="lg"
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DragDrop;
