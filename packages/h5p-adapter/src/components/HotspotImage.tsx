'use client';

import React, { useState, useCallback } from 'react';
import { HotspotImageSchema, H5PEvent } from '../types';
import { z } from 'zod';

interface HotspotImageProps {
  content: z.infer<typeof HotspotImageSchema>;
  onEvent?: (event: H5PEvent) => void;
  className?: string;
}

export const HotspotImage: React.FC<HotspotImageProps> = ({
  content,
  onEvent,
  className = ''
}) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [visitedHotspots, setVisitedHotspots] = useState<Set<string>>(new Set());
  const [showContent, setShowContent] = useState<string | null>(null);

  const { params } = content;

  const handleHotspotClick = useCallback((hotspotId: string) => {
    setActiveHotspot(hotspotId);
    setShowContent(hotspotId);
    setVisitedHotspots(prev => new Set([...prev, hotspotId]));

    // Emit interaction event
    onEvent?.({
      type: 'interaction',
      data: {
        response: hotspotId,
        answered: true
      }
    });

    // Check if all hotspots have been visited
    const newVisited = new Set([...visitedHotspots, hotspotId]);
    if (newVisited.size === params.hotspots.length) {
      onEvent?.({
        type: 'completed',
        data: {
          score: 100,
          maxScore: 100,
          completion: 100,
          answered: true,
          correct: true
        }
      });
    } else {
      // Emit progress event
      onEvent?.({
        type: 'progress',
        data: {
          completion: (newVisited.size / params.hotspots.length) * 100
        }
      });
    }
  }, [visitedHotspots, params.hotspots.length, onEvent]);

  const closeContent = useCallback(() => {
    setActiveHotspot(null);
    setShowContent(null);
  }, []);

  const activeHotspotData = params.hotspots.find(h => h.id === showContent);

  return (
    <div className={`h5p-hotspot-image relative ${className}`}>
      <div className="image-container relative inline-block">
        <img
          src={params.image.url}
          alt={params.image.alt}
          className="max-w-full h-auto rounded-lg shadow-lg"
        />

        {/* Hotspots */}
        {params.hotspots.map(hotspot => (
          <button
            key={hotspot.id}
            onClick={() => handleHotspotClick(hotspot.id)}
            className={`absolute w-8 h-8 rounded-full border-3 border-white shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              visitedHotspots.has(hotspot.id)
                ? 'bg-green-500 animate-pulse'
                : activeHotspot === hotspot.id
                ? 'bg-blue-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            aria-label={`Hotspot: ${hotspot.content.header}`}
          >
            <span className="text-white font-bold text-sm">
              {visitedHotspots.has(hotspot.id) ? '✓' : '?'}
            </span>
          </button>
        ))}

        {/* Content Modal */}
        {showContent && activeHotspotData && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {activeHotspotData.content.header}
                </h3>
                <button
                  onClick={closeContent}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              {activeHotspotData.content.image && (
                <img
                  src={activeHotspotData.content.image}
                  alt=""
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
              )}

              <p className="text-gray-700 leading-relaxed">
                {activeHotspotData.content.text}
              </p>

              <button
                onClick={closeContent}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                Continuar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="progress-container mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Progreso: {visitedHotspots.size} de {params.hotspots.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round((visitedHotspots.size / params.hotspots.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(visitedHotspots.size / params.hotspots.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Instrucciones:</strong> Haz clic en los puntos azules (?) para explorar el contenido.
          Los puntos verdes (✓) ya han sido visitados.
        </p>
      </div>

      {/* Completion Message */}
      {visitedHotspots.size === params.hotspots.length && (
        <div className="completion-message mt-4 p-4 bg-green-100 border border-green-400 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-xl">🎉</span>
            <span className="font-semibold text-green-800">
              ¡Excelente! Has explorado todos los puntos de interés.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};