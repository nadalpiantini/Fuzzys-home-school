import React, { useState, useRef, useCallback } from 'react';
import { DragDropAdvancedSchema, H5PEvent } from '../types';
import { z } from 'zod';

interface DragDropAdvancedProps {
  content: z.infer<typeof DragDropAdvancedSchema>;
  onEvent?: (event: H5PEvent) => void;
  className?: string;
}

export const DragDropAdvanced: React.FC<DragDropAdvancedProps> = ({
  content,
  onEvent,
  className = ''
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [droppedItems, setDroppedItems] = useState<Record<string, string[]>>({});
  const [completed, setCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { params } = content;

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropzoneId: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');

    if (!itemId || !draggedItem) return;

    setDroppedItems(prev => ({
      ...prev,
      [dropzoneId]: [...(prev[dropzoneId] || []), itemId]
    }));

    setDraggedItem(null);

    // Emit interaction event
    onEvent?.({
      type: 'interaction',
      data: {
        response: `${itemId}->${dropzoneId}`,
        answered: true
      }
    });
  }, [draggedItem, onEvent]);

  const checkAnswers = useCallback(() => {
    let correctCount = 0;
    let totalCount = 0;

    params.dropzones.forEach(dropzone => {
      const droppedInZone = droppedItems[dropzone.id] || [];
      totalCount += dropzone.correctElements.length;

      droppedInZone.forEach(itemId => {
        if (dropzone.correctElements.includes(itemId)) {
          correctCount++;
        }
      });
    });

    const calculatedScore = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
    setScore(calculatedScore);
    setCompleted(true);
    setShowFeedback(true);

    // Emit completion event
    onEvent?.({
      type: 'completed',
      data: {
        score: calculatedScore,
        maxScore: 100,
        completion: 100,
        answered: true,
        correct: calculatedScore >= 70
      }
    });
  }, [droppedItems, params.dropzones, onEvent]);

  const resetActivity = useCallback(() => {
    setDroppedItems({});
    setCompleted(false);
    setShowFeedback(false);
    setScore(0);
    setDraggedItem(null);
  }, []);

  const availableItems = params.draggables.filter(item => {
    return !Object.values(droppedItems).flat().includes(item.id) || item.multiple;
  });

  return (
    <div className={`h5p-drag-drop-advanced ${className}`} ref={containerRef}>
      <div className="task-description mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Actividad de Arrastrar y Soltar</h3>
        <p className="text-gray-700">{params.taskDescription}</p>
      </div>

      <div className="activity-area relative border-2 border-gray-300 rounded-lg p-4 mb-6 min-h-96 bg-gray-50">
        {/* Drop Zones */}
        {params.dropzones.map(dropzone => (
          <div
            key={dropzone.id}
            className="absolute border-2 border-dashed border-blue-400 bg-blue-100 rounded-lg flex flex-col items-center justify-center p-2 transition-colors hover:bg-blue-200"
            style={{
              left: `${dropzone.x}%`,
              top: `${dropzone.y}%`,
              width: `${dropzone.width}%`,
              height: `${dropzone.height}%`
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, dropzone.id)}
          >
            <span className="text-sm font-medium text-blue-700 mb-2">
              {dropzone.label}
            </span>

            {/* Dropped Items */}
            <div className="flex flex-wrap gap-1">
              {(droppedItems[dropzone.id] || []).map((itemId, index) => {
                const item = params.draggables.find(d => d.id === itemId);
                return item ? (
                  <div
                    key={`${itemId}-${index}`}
                    className="bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    {item.type === 'text' ? item.content : (
                      <img src={item.content} alt="" className="w-8 h-8 object-cover" />
                    )}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Draggable Items */}
      <div className="draggables-area mb-6">
        <h4 className="text-md font-semibold mb-3">Elementos para arrastrar:</h4>
        <div className="flex flex-wrap gap-3">
          {availableItems.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className="draggable-item cursor-move bg-white border-2 border-gray-300 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all"
            >
              {item.type === 'text' ? (
                <span className="text-sm font-medium">{item.content}</span>
              ) : (
                <img
                  src={item.content}
                  alt="Draggable item"
                  className="w-16 h-16 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions flex gap-3 mb-4">
        <button
          onClick={checkAnswers}
          disabled={completed || Object.keys(droppedItems).length === 0}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Verificar Respuestas
        </button>

        <button
          onClick={resetActivity}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reiniciar
        </button>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`feedback p-4 rounded-lg ${score >= 70 ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">
              Puntuación: {Math.round(score)}%
            </span>
          </div>
          <p className="text-sm">
            {score >= 70 ? params.feedback.correct : params.feedback.incorrect}
          </p>
        </div>
      )}
    </div>
  );
};