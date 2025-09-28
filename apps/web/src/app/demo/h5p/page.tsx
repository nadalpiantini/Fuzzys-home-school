'use client';

import React, { useState } from 'react';
import { H5PPlayer, H5PEditor, useH5PContent, useH5PLibraries, H5PHelpers } from '@fuzzy/h5p-adapter';
import type { H5PContent } from '@fuzzy/h5p-adapter';

// Demo H5P content for testing
const DEMO_CONTENT: H5PContent = {
  id: 'demo-drag-drop-1',
  type: 'drag_drop_advanced',
  title: 'Demo: Operaciones Matemáticas',
  description: 'Arrastra los números correctos para completar las operaciones',
  metadata: {
    author: 'Fuzzy\'s Home School',
    license: 'CC BY-SA'
  },
  params: {
    taskDescription: 'Arrastra los números correctos para completar las operaciones matemáticas',
    dropzones: [
      {
        id: 'sum1',
        label: '5 + ? = 8',
        x: 10,
        y: 10,
        width: 100,
        height: 50,
        correctElements: ['3']
      },
      {
        id: 'sum2',
        label: '10 - ? = 7',
        x: 10,
        y: 80,
        width: 100,
        height: 50,
        correctElements: ['3']
      }
    ],
    draggables: [
      { id: '1', type: 'text', content: '1', multiple: false },
      { id: '2', type: 'text', content: '2', multiple: false },
      { id: '3', type: 'text', content: '3', multiple: true },
      { id: '4', type: 'text', content: '4', multiple: false }
    ],
    feedback: {
      correct: '¡Excelente! Has completado todas las operaciones correctamente.',
      incorrect: 'Revisa tus respuestas e inténtalo de nuevo.'
    }
  },
  library: 'H5P.DragQuestion 1.14',
  language: 'es'
};

export default function H5PDemoPage() {
  const [currentView, setCurrentView] = useState<'player' | 'editor' | 'libraries'>('player');
  const [editorContent, setEditorContent] = useState<H5PContent | null>(null);

  // Use H5P hooks for demo
  const contentHook = useH5PContent({
    contentId: DEMO_CONTENT.id,
    userId: 'demo-user-123',
    autoSave: false
  });

  const librariesHook = useH5PLibraries({
    autoLoad: true,
    preloadLibraries: ['H5P.DragQuestion', 'H5P.ImageHotspots']
  });

  const handleSaveContent = async (content: H5PContent) => {
    console.log('Saving H5P content:', content);
    setEditorContent(content);
    // In a real app, this would save to the database
    alert('Contenido H5P guardado (demo mode)');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo H5P Adapter
          </h1>
          <p className="text-gray-600">
            Prueba las funcionalidades del adaptador H5P integrado en Fuzzy&apos;s Home School
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setCurrentView('player')}
              className={`px-4 py-2 rounded-md font-medium ${
                currentView === 'player'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Reproductor H5P
            </button>
            <button
              onClick={() => setCurrentView('editor')}
              className={`px-4 py-2 rounded-md font-medium ${
                currentView === 'editor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Editor H5P
            </button>
            <button
              onClick={() => setCurrentView('libraries')}
              className={`px-4 py-2 rounded-md font-medium ${
                currentView === 'libraries'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Bibliotecas H5P
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {currentView === 'player' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Reproductor H5P</h2>

              {/* Progress Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Estado del Progreso</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Progreso:</span>
                    <span className="ml-2 font-medium">{contentHook.progressPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Tiempo:</span>
                    <span className="ml-2 font-medium">{contentHook.formattedTimeSpent}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Intentos:</span>
                    <span className="ml-2 font-medium">{contentHook.attempts}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Estado:</span>
                    <span className="ml-2 font-medium">
                      {contentHook.isCompleted ? '✅ Completado' : '🔄 En progreso'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Info */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Información del Contenido</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Título:</span>
                      <span className="ml-2">{DEMO_CONTENT.title}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <span className="ml-2">{H5PHelpers.getContentTypeDisplayName(DEMO_CONTENT.type)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Dificultad:</span>
                      <span className="ml-2">{H5PHelpers.getContentDifficulty(DEMO_CONTENT)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo estimado:</span>
                      <span className="ml-2">{H5PHelpers.estimateCompletionTime(DEMO_CONTENT)} min</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-600">Resumen:</span>
                    <span className="ml-2">{H5PHelpers.generateContentSummary(DEMO_CONTENT)}</span>
                  </div>
                </div>
              </div>

              {/* H5P Player */}
              <div className="border rounded-lg overflow-hidden">
                <H5PPlayer
                  content={DEMO_CONTENT}
                  onEvent={contentHook.handleH5PEvent}
                  onProgress={(progress) => console.log('Progress:', progress)}
                  onCompleted={(score, maxScore) => console.log('Completed:', score, maxScore)}
                  enableFullscreen={true}
                  showCopyright={false}
                  className="w-full"
                />
              </div>

              {/* Actions */}
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={contentHook.restartContent}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Reiniciar Contenido
                </button>
                <button
                  onClick={contentHook.saveProgress}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Guardar Progreso
                </button>
                <button
                  onClick={contentHook.resetProgress}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reset Progreso
                </button>
              </div>
            </div>
          )}

          {currentView === 'editor' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Editor H5P</h2>
              <p className="text-gray-600 mb-6">
                Nota: Esta es una demostración del componente editor. En un entorno de producción,
                requeriría la configuración completa del servidor H5P.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Editor H5P</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    El editor H5P permite crear contenido interactivo. Esta demo muestra la integración del componente.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => alert('En producción, esto abriría el editor H5P completo')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Abrir Editor Demo
                    </button>
                  </div>
                </div>
              </div>

              {editorContent && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">Último contenido guardado:</h4>
                  <pre className="mt-2 text-sm text-green-700 overflow-x-auto">
                    {JSON.stringify(editorContent, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {currentView === 'libraries' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Bibliotecas H5P</h2>

              {librariesHook.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando bibliotecas...</span>
                </div>
              ) : librariesHook.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">Error: {librariesHook.error}</p>
                </div>
              ) : (
                <div>
                  {/* Statistics */}
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(librariesHook.getLibraryStats()).map(([key, value]) => (
                      <div key={key} className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {typeof value === 'object' ? Object.keys(value).length : value}
                        </div>
                        <div className="text-sm text-blue-800 capitalize">
                          {key === 'byCategory' ? 'Categorías' : key}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Buscar bibliotecas H5P..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const results = librariesHook.searchLibraries(e.target.value);
                        console.log('Search results:', results);
                      }}
                    />
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Categorías Disponibles</h3>
                    <div className="flex flex-wrap gap-2">
                      {librariesHook.categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            const libs = librariesHook.getLibrariesByCategory(category);
                            console.log(`Libraries in ${category}:`, libs);
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 capitalize"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Libraries */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Bibliotecas Populares</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {librariesHook.getPopularLibraries().map((library) => (
                        <div key={library.name} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{library.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{library.description}</p>
                              <div className="mt-2 flex items-center text-xs text-gray-500">
                                <span className="bg-gray-100 px-2 py-1 rounded capitalize">
                                  {library.category}
                                </span>
                                <span className="ml-2">v{library.majorVersion}.{library.minorVersion}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={() => console.log('Library details:', library)}
                              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            >
                              Ver Detalles
                            </button>
                            {library.tutorial && (
                              <a
                                href={library.tutorial}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              >
                                Tutorial
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Libraries */}
                  <div>
                    <h3 className="font-medium mb-3">Todas las Bibliotecas ({librariesHook.libraries.length})</h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {librariesHook.libraries.map((library) => (
                          <div key={library.name} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <div>
                              <span className="font-medium">{library.title}</span>
                              <span className="ml-2 text-sm text-gray-500">({library.name})</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {library.category}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                library.isCore ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {library.isCore ? 'Core' : 'Extensión'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Demo del adaptador H5P para Fuzzy&apos;s Home School -
            <a href="/games" className="text-blue-600 hover:underline ml-1">
              Ver más juegos educativos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}