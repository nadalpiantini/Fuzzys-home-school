'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';
// import { Reward } from 'react-rewards'; // Removed dependency

interface QuestItem {
  id: string;
  name: string;
  emoji?: string;
  correct_position?: number;
  correct_habitat?: string;
}

interface DropZone {
  id: string;
  label: string;
  emoji?: string;
}

interface QuestData {
  type: 'drag_drop' | 'quiz';
  instruction: string;
  items: QuestItem[];
  drop_zones?: DropZone[];
  questions?: any[];
}

interface QuestGameProps {
  quest: {
    id: string;
    title: string;
    description?: string;
    payload: QuestData;
    points: number;
    time_limit?: number;
  };
  onComplete: (score: number, timeSpent: number) => void;
  onAbandon: () => void;
}

function DraggableItem({
  item,
  isDragging,
}: {
  item: QuestItem;
  isDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingItem,
  } = useDraggable({
    id: item.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDraggingItem ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg border-2 border-dashed border-earth-300 bg-white cursor-grab active:cursor-grabbing transition-all hover:border-earth-400 hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {item.emoji && <span className="text-xl">{item.emoji}</span>}
        <span className="font-medium text-earth-800">{item.name}</span>
      </div>
    </div>
  );
}

function DroppableZone({
  zone,
  items,
}: {
  zone: DropZone;
  items: QuestItem[];
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: zone.id,
  });

  const itemsInZone = items.filter((item) => item.id.startsWith(zone.id));

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] p-4 rounded-lg border-2 border-dashed transition-all ${
        isOver
          ? 'border-earth-500 bg-earth-100 border-solid'
          : 'border-earth-300 bg-earth-50'
      }`}
    >
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          {zone.emoji && <span className="text-lg">{zone.emoji}</span>}
          <span className="font-medium text-earth-700">{zone.label}</span>
        </div>
      </div>

      <div className="space-y-2">
        {itemsInZone.map((item) => (
          <div
            key={item.id}
            className="p-2 bg-white rounded border border-earth-200"
          >
            <div className="flex items-center gap-2">
              {item.emoji && <span className="text-sm">{item.emoji}</span>}
              <span className="text-sm font-medium">{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuestGame({
  quest,
  onComplete,
  onAbandon,
}: QuestGameProps) {
  const [timeLeft, setTimeLeft] = useState(quest.time_limit || 0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [draggedItem, setDraggedItem] = useState<QuestItem | null>(null);
  const [items, setItems] = useState<QuestItem[]>(quest.payload.items);
  const [dropZones, setDropZones] = useState<DropZone[]>(
    quest.payload.drop_zones || [],
  );
  const [placedItems, setPlacedItems] = useState<Record<string, QuestItem[]>>(
    {},
  );

  // const rewardRef = React.useRef<any>(null); // Removed reward dependency
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const checkAnswer = useCallback(() => {
    let correctAnswers = 0;
    let totalAnswers = 0;

    // Verificar respuestas según el tipo de reto
    if (quest.payload.type === 'drag_drop') {
      Object.entries(placedItems).forEach(([zoneId, items]) => {
        items.forEach((item) => {
          totalAnswers++;
          if (item.correct_position) {
            // Lógica para ordenamiento
            const expectedPosition = item.correct_position;
            const actualPosition = Object.keys(placedItems).indexOf(zoneId) + 1;
            if (expectedPosition === actualPosition) {
              correctAnswers++;
            }
          } else if (item.correct_habitat) {
            // Lógica para categorización
            if (item.correct_habitat === zoneId) {
              correctAnswers++;
            }
          }
        });
      });
    }

    const finalScore =
      totalAnswers > 0
        ? Math.round((correctAnswers / totalAnswers) * quest.points)
        : 0;
    setScore(finalScore);
    setIsCompleted(true);

    // Mostrar confetti si la puntuación es alta
    // if (finalScore >= quest.points * 0.8) {
    //   rewardRef.current?.rewardMe();
    // }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete(finalScore, timeSpent);
  }, [placedItems, quest.payload.type, quest.points, startTime, onComplete]);

  const handleComplete = useCallback(() => {
    if (!isCompleted) {
      checkAnswer();
    }
  }, [isCompleted, checkAnswer]);

  // Timer
  useEffect(() => {
    if (quest.time_limit && timeLeft > 0 && !isCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isCompleted, handleComplete, quest.time_limit]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = items.find((i) => i.id === active.id);
    setDraggedItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over) return;

    const draggedItem = items.find((item) => item.id === active.id);
    if (!draggedItem) return;

    // Mover item a la zona de drop
    setPlacedItems((prev) => ({
      ...prev,
      [over.id as string]: [...(prev[over.id as string] || []), draggedItem],
    }));

    // Remover item de la lista original
    setItems((prev) => prev.filter((item) => item.id !== active.id));
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="mb-6">
            {score >= quest.points * 0.8 ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            )}
          </div>

          <h2 className="text-2xl font-bold mb-4">
            {score >= quest.points * 0.8 ? '¡Excelente!' : '¡Bien hecho!'}
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-semibold">
                Puntuación: {score}/{quest.points}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-lg">
                Tiempo:{' '}
                {formatTime(Math.floor((Date.now() - startTime) / 1000))}
              </span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="btn-earth"
            >
              Jugar de Nuevo
            </Button>
            <Button variant="outline" onClick={onAbandon}>
              Volver al Inicio
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* <Reward ref={rewardRef} type="confetti">
        <div></div>
      </Reward> */}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-earth-800">{quest.title}</h1>
          <div className="flex items-center gap-4">
            {quest.time_limit && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </Badge>
            )}
            <Badge variant="secondary">{quest.points} puntos</Badge>
          </div>
        </div>

        <p className="text-earth-600 mb-4">{quest.payload.instruction}</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Items para arrastrar */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-earth-700">
              Arrastra aquí:
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  isDragging={draggedItem?.id === item.id}
                />
              ))}
            </div>
          </div>

          {/* Zonas de drop */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-earth-700">
              Suelta aquí:
            </h3>
            <div className="space-y-4">
              {dropZones.map((zone) => (
                <DroppableZone
                  key={zone.id}
                  zone={zone}
                  items={placedItems[zone.id] || []}
                />
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {draggedItem ? (
            <div className="p-3 rounded-lg border-2 border-earth-400 bg-white shadow-lg">
              <div className="flex items-center gap-2">
                {draggedItem.emoji && (
                  <span className="text-xl">{draggedItem.emoji}</span>
                )}
                <span className="font-medium text-earth-800">
                  {draggedItem.name}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Botones de acción */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          onClick={handleComplete}
          className="btn-earth"
          disabled={items.length === 0}
        >
          Comprobar Respuesta
        </Button>
        <Button variant="outline" onClick={onAbandon}>
          Abandonar
        </Button>
      </div>
    </div>
  );
}
