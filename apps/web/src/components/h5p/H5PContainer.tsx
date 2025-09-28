'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
// Mock H5P components for deployment
const DragDropAdvanced = ({ content, onComplete }: any) => (
  <div>DragDropAdvanced Mock</div>
);
const HotspotImage = ({ content, onComplete }: any) => (
  <div>HotspotImage Mock</div>
);
const BranchingScenario = ({ content, onComplete }: any) => (
  <div>BranchingScenario Mock</div>
);

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
