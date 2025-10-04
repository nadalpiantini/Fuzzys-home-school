'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
// Real H5P component implementations
const DragDropAdvanced = ({ content, onEvent }: any) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleDragStart = (item: string) => {
    setDraggedItem(item);
  };

  const handleDrop = (zone: string) => {
    if (draggedItem) {
      setDropZones((prev) => ({ ...prev, [zone]: draggedItem }));
      setDraggedItem(null);

      // Check if all items are placed correctly
      const correctMatches = content.params?.correctMatches || {};
      const isCorrect = correctMatches[zone] === draggedItem;

      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      // Check completion
      const totalItems = content.params?.items?.length || 0;
      const placedItems = Object.keys(dropZones).length + 1;

      if (placedItems >= totalItems) {
        setCompleted(true);
        onEvent?.({
          type: 'completed',
          data: {
            score: score + (isCorrect ? 1 : 0),
            maxScore: totalItems,
            completion: 100,
          },
        });
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">
        {content.params?.taskDescription}
      </h3>

      {/* Drop Zones */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {content.params?.dropZones?.map((zone: any, index: number) => (
          <div
            key={index}
            className={`border-2 border-dashed border-gray-300 p-4 rounded-lg min-h-[100px] ${
              dropZones[zone.id]
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            }`}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(zone.id);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <p className="text-sm text-gray-600">{zone.label}</p>
            {dropZones[zone.id] && (
              <div className="mt-2 p-2 bg-green-100 rounded text-sm">
                {dropZones[zone.id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Draggable Items */}
      <div className="flex flex-wrap gap-2">
        {content.params?.items?.map((item: any, index: number) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(item.name)}
            className="bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded cursor-move text-sm"
          >
            {item.name}
          </div>
        ))}
      </div>

      {completed && (
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-semibold">
            ¡Completado! Puntuación: {score}/
            {content.params?.items?.length || 0}
          </p>
        </div>
      )}
    </div>
  );
};

const HotspotImage = ({ content, onEvent }: any) => {
  const [clickedSpots, setClickedSpots] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleHotspotClick = (spotId: string) => {
    if (clickedSpots.has(spotId)) return;

    setClickedSpots((prev) => new Set([...prev, spotId]));

    const correctSpots = content.params?.correctSpots || [];
    const isCorrect = correctSpots.includes(spotId);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    onEvent?.({
      type: 'interaction',
      data: { spotId, correct: isCorrect },
    });

    // Check completion
    if (clickedSpots.size + 1 >= content.params?.totalSpots?.length || 0) {
      setCompleted(true);
      onEvent?.({
        type: 'completed',
        data: {
          score,
          maxScore: content.params?.totalSpots?.length || 0,
          completion: 100,
        },
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">
        {content.params?.taskDescription}
      </h3>

      <div className="relative">
        <img
          src={content.params?.imageUrl || '/placeholder-image.jpg'}
          alt="Hotspot Image"
          className="w-full max-w-2xl mx-auto rounded-lg"
        />

        {/* Hotspot overlays */}
        {content.params?.hotspots?.map((spot: any, index: number) => (
          <button
            key={index}
            onClick={() => handleHotspotClick(spot.id)}
            className={`absolute w-6 h-6 rounded-full border-2 ${
              clickedSpots.has(spot.id)
                ? 'bg-green-500 border-green-600'
                : 'bg-red-500 border-red-600 hover:bg-red-600'
            }`}
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            title={spot.label}
          />
        ))}
      </div>

      {completed && (
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-semibold">
            ¡Completado! Puntuación: {score}/
            {content.params?.totalSpots?.length || 0}
          </p>
        </div>
      )}
    </div>
  );
};

const BranchingScenario = ({ content, onEvent }: any) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleChoice = (choice: string) => {
    const newChoices = [...choices, choice];
    setChoices(newChoices);

    onEvent?.({
      type: 'interaction',
      data: { choice, step: currentStep },
    });

    const nextStep = content.params?.steps?.[currentStep]?.nextSteps?.[choice];
    if (nextStep !== undefined) {
      setCurrentStep(nextStep);
    } else {
      setCompleted(true);
      onEvent?.({
        type: 'completed',
        data: {
          score: newChoices.length,
          maxScore: content.params?.steps?.length || 0,
          completion: 100,
        },
      });
    }
  };

  const currentStepData = content.params?.steps?.[currentStep];

  if (!currentStepData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg text-center">
        <p className="text-gray-500">Escenario no disponible</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">{currentStepData.title}</h3>
      <p className="text-gray-700 mb-6">{currentStepData.description}</p>

      <div className="space-y-3">
        {currentStepData.choices?.map((choice: any, index: number) => (
          <button
            key={index}
            onClick={() => handleChoice(choice.id)}
            className="w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
          >
            {choice.text}
          </button>
        ))}
      </div>

      {completed && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-semibold">
            ¡Escenario completado! Pasos: {choices.length}
          </p>
        </div>
      )}
    </div>
  );
};

import type { H5PContent } from '@/types/service-types';

interface H5PEvent {
  type: string;
  data: any;
}

// Extend H5PContent to include type property
interface ExtendedH5PContent extends H5PContent {
  type: string;
  description?: string;
  language?: string;
  content: any;
}

interface H5PContainerProps {
  content: ExtendedH5PContent;
  onComplete?: (results: H5PResults) => void;
  onProgress?: (progress: number) => void;
  className?: string;
}

interface H5PResults {
  contentId: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  interactions: number;
  completion: number;
  passed: boolean;
}

export const H5PContainer: React.FC<H5PContainerProps> = ({
  content,
  onComplete,
  onProgress,
  className = '',
}) => {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<H5PResults | null>(null);
  const [interactions, setInteractions] = useState(0);
  const [startTime] = useState(Date.now());

  const handleEvent = useCallback(
    (event: H5PEvent) => {
      switch (event.type) {
        case 'interaction':
          setInteractions((prev) => prev + 1);
          break;

        case 'progress':
          if (event.data.completion !== undefined && onProgress) {
            onProgress(event.data.completion);
          }
          break;

        case 'completed':
          const timeSpent = Date.now() - startTime;
          const finalResults: H5PResults = {
            contentId: content.id,
            score: event.data.score || 0,
            maxScore: event.data.maxScore || 100,
            timeSpent,
            interactions,
            completion: event.data.completion || 100,
            passed: (event.data.score || 0) >= 70, // 70% passing threshold
          };

          setResults(finalResults);
          setCompleted(true);

          if (onComplete) {
            onComplete(finalResults);
          }
          break;
      }
    },
    [content.id, interactions, startTime, onComplete, onProgress],
  );

  const resetContent = () => {
    setStarted(false);
    setCompleted(false);
    setResults(null);
    setInteractions(0);
  };

  const renderH5PContent = () => {
    const commonProps = {
      content,
      onEvent: handleEvent,
      className: 'w-full',
    };

    switch (content.type) {
      case 'drag_drop_advanced':
        return <DragDropAdvanced {...commonProps} />;
      case 'hotspot_image':
        return <HotspotImage {...commonProps} />;
      case 'branching_scenario':
        return <BranchingScenario {...commonProps} />;
      default:
        return (
          <div className="text-center p-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Tipo de contenido H5P no soportado: {content.type}</p>
          </div>
        );
    }
  };

  const getContentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      drag_drop_advanced: 'Arrastrar y Soltar Avanzado',
      hotspot_image: 'Imagen con Puntos Calientes',
      branching_scenario: 'Escenario Ramificado',
      interactive_video: 'Video Interactivo',
      image_sequence_advanced: 'Secuencia de Imágenes Avanzada',
      timeline_interactive: 'Línea de Tiempo Interactiva',
      accordion: 'Acordeón',
      collage: 'Collage',
      image_hotspots: 'Puntos Calientes en Imagen',
      image_slider: 'Deslizador de Imágenes',
      speak_the_words: 'Habla las Palabras',
      find_the_words: 'Encuentra las Palabras',
      mark_the_words: 'Marca las Palabras',
      sort_paragraphs: 'Ordena los Párrafos',
      dialog_cards: 'Cartas de Diálogo',
    };

    return labels[type] || type;
  };

  return (
    <div className={`h5p-container ${className}`}>
      {/* Header */}
      <Card className="mb-4 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold mb-1">{content.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {getContentTypeLabel(content.type)}
            </p>
            {content.description && (
              <p className="text-sm text-gray-700">{content.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            {completed && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetContent}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </Button>
            )}
          </div>
        </div>

        {/* Progress and Status */}
        {started && !completed && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progreso</span>
              <span>{interactions} interacciones</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: '0%' }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {completed && results && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle
                className={`w-5 h-5 ${results.passed ? 'text-green-600' : 'text-yellow-600'}`}
              />
              <span className="font-semibold">
                {results.passed ? '¡Completado exitosamente!' : 'Completado'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Puntuación</div>
                <div className="font-bold text-blue-600">
                  {Math.round(results.score)}/{results.maxScore}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Porcentaje</div>
                <div className="font-bold text-blue-600">
                  {Math.round((results.score / results.maxScore) * 100)}%
                </div>
              </div>
              <div>
                <div className="text-gray-600">Tiempo</div>
                <div className="font-bold text-gray-700">
                  {Math.round(results.timeSpent / 1000)}s
                </div>
              </div>
              <div>
                <div className="text-gray-600">Interacciones</div>
                <div className="font-bold text-gray-700">
                  {results.interactions}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Content Area */}
      <Card className="p-6">
        {!started ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">
                ¿Listo para comenzar?
              </h4>
              <p className="text-gray-600 max-w-md mx-auto">
                Esta actividad interactiva te ayudará a practicar y reforzar los
                conceptos aprendidos.
              </p>
            </div>

            <Button onClick={() => setStarted(true)} size="lg" className="px-8">
              <Play className="w-5 h-5 mr-2" />
              Comenzar Actividad
            </Button>
          </div>
        ) : (
          <div className="h5p-content-area">{renderH5PContent()}</div>
        )}
      </Card>

      {/* Language Support */}
      {content.language === 'en' && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Contenido en inglés - Content in English
        </div>
      )}
    </div>
  );
};
