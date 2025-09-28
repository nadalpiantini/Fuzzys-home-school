'use client';

import React, { useState } from 'react';
import { PhETSimulation } from '@fuzzy/simulation-engine';
import { BlocklyEditor, MusicBlocksEditor } from '@fuzzy/creative-tools';
import { ColonialZoneAR } from '@fuzzy/vr-ar-adapter';
import { ExternalGameWrapper } from '@fuzzy/external-games';
import type { ExternalGameEvent } from '@fuzzy/external-games';

type ExternalGameType = 'phet' | 'blockly' | 'music' | 'ar' | 'custom';

export default function ExternalGamesPage() {
  const [selectedType, setSelectedType] = useState<ExternalGameType>('phet');
  const [events, setEvents] = useState<ExternalGameEvent[]>([]);

  const handleGameEvent = (event: ExternalGameEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
  };

  const handleGameComplete = (data: any) => {
    console.log('Game completed:', data);
    // Here you could save completion data to your backend
  };

  const handleGameError = (error: Error) => {
    console.error('Game error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🌟 Integración de Recursos Open Source
          </h1>
          <p className="text-gray-600">
            Explora simulaciones educativas, programación visual, música creativa y realidad aumentada.
          </p>
        </div>

        {/* Game Type Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Selecciona una experiencia educativa:</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedType('phet')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedType === 'phet'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🧪</div>
              <div className="font-medium">PhET</div>
              <div className="text-sm text-gray-600">Simulaciones STEM</div>
            </button>

            <button
              onClick={() => setSelectedType('blockly')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedType === 'blockly'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🧩</div>
              <div className="font-medium">Blockly</div>
              <div className="text-sm text-gray-600">Programación Visual</div>
            </button>

            <button
              onClick={() => setSelectedType('music')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedType === 'music'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🎵</div>
              <div className="font-medium">Music Blocks</div>
              <div className="text-sm text-gray-600">Música Creativa</div>
            </button>

            <button
              onClick={() => setSelectedType('ar')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedType === 'ar'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🏛️</div>
              <div className="font-medium">AR Zona Colonial</div>
              <div className="text-sm text-gray-600">Realidad Aumentada</div>
            </button>

            <button
              onClick={() => setSelectedType('custom')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedType === 'custom'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">Personalizado</div>
              <div className="text-sm text-gray-600">Wrapper Genérico</div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-3">
            {selectedType === 'phet' && (
              <PhETSimulation
                simId="forces-and-motion-basics"
                studentId="demo-student"
                onEvent={handleGameEvent}
                onComplete={handleGameComplete}
                onError={handleGameError}
                showInfo={true}
              />
            )}

            {selectedType === 'blockly' && (
              <BlocklyEditor
                gameId="maze"
                studentId="demo-student"
                onEvent={handleGameEvent}
                onComplete={handleGameComplete}
                onError={handleGameError}
                showInstructions={true}
                language="es"
              />
            )}

            {selectedType === 'music' && (
              <MusicBlocksEditor
                activityId="rhythm-patterns"
                studentId="demo-student"
                onEvent={handleGameEvent}
                onComplete={handleGameComplete}
                onError={handleGameError}
                showInstructions={true}
              />
            )}

            {selectedType === 'ar' && (
              <ColonialZoneAR
                mode="exploration"
                studentId="demo-student"
                onEvent={handleGameEvent}
                onComplete={handleGameComplete}
                onError={handleGameError}
                language="es"
                enableGPS={false}
              />
            )}

            {selectedType === 'custom' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Ejemplo de Wrapper Personalizado</h3>
                <p className="text-gray-600 mb-4">
                  Aquí puedes integrar cualquier herramienta educativa externa usando el ExternalGameWrapper:
                </p>

                <ExternalGameWrapper
                  config={{
                    source: 'scratch',
                    gameId: 'scratch-demo',
                    title: 'Scratch Programming',
                    description: 'Crea tus propios proyectos interactivos',
                    url: 'https://scratch.mit.edu/projects/editor/',
                    allowedOrigins: ['https://scratch.mit.edu'],
                    trackingEnabled: true,
                    subjects: ['Programación', 'Creatividad'],
                    difficulty: 'intermediate',
                    objectives: [
                      {
                        id: 'create-project',
                        title: 'Crear proyecto',
                        description: 'Desarrollar un proyecto interactivo',
                        required: true,
                        points: 20,
                        completionCriteria: { action: 'project_saved' },
                      },
                    ],
                  }}
                  studentId="demo-student"
                  onEvent={handleGameEvent}
                  onComplete={handleGameComplete}
                  onError={handleGameError}
                />
              </div>
            )}
          </div>

          {/* Sidebar with Events and Stats */}
          <div className="xl:col-span-1 space-y-6">
            {/* Event Log */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">📊 Eventos en Tiempo Real</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay eventos aún...</p>
                ) : (
                  events.map((event, index) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">
                        {event.action}
                      </div>
                      <div className="text-gray-600">
                        {event.source} - {event.gameId}
                      </div>
                      {event.score && (
                        <div className="text-green-600">
                          Puntuación: {event.score}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">📈 Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Eventos totales:</span>
                  <span className="font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tipo actual:</span>
                  <span className="font-medium capitalize">{selectedType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Logros:</span>
                  <span className="font-medium">
                    {events.filter(e => e.action === 'achievement').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Integration Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Integración</h3>
              <p className="text-sm text-blue-800 mb-3">
                Esta página demuestra la integración completa de recursos educativos open source.
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Tracking unificado de eventos</li>
                <li>• Sistema de progreso común</li>
                <li>• Almacenamiento en Supabase</li>
                <li>• Componentes reutilizables</li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">🔗 Recursos</h3>
              <div className="space-y-2 text-sm">
                <a
                  href="https://phet.colorado.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  PhET Simulations →
                </a>
                <a
                  href="https://blockly.games"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  Blockly Games →
                </a>
                <a
                  href="https://musicblocks.sugarlabs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  Music Blocks →
                </a>
                <a
                  href="https://ar-js-org.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  AR.js →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}