'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Lightbulb, Loader2 } from 'lucide-react';

// Componente de carga
function LoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargando Fuzzy Maze...</h2>
        <p className="text-gray-600">Preparando tu aventura de programación</p>
      </div>
    </div>
  );
}

// Componente principal del juego
function BlocklyMazeGame() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [gameError, setGameError] = useState(false);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleGameError = () => {
    setGameError(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (gameError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Inicio</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Lightbulb className="w-8 h-8 text-red-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Fuzzy Maze
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ayuda a Fuzzy a encontrar la salida del laberinto programando con bloques visuales.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error al cargar el juego
            </h2>
            <p className="text-gray-600 mb-6">
              Lo sentimos, hubo un problema al cargar Fuzzy Maze. Por favor, intenta de nuevo.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700"
              >
                🔄 Reintentar
              </Button>
              <Button
                onClick={() => router.push('/games')}
                variant="outline"
              >
                Ver otros juegos
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atrás</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Lightbulb className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Fuzzy Maze
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ayuda a Fuzzy a encontrar la salida del laberinto programando con bloques visuales.
          </p>
        </div>

        {/* Game iframe */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            src="/games/blockly-maze.html"
            width="100%"
            height="800"
            frameBorder="0"
            onError={handleGameError}
            onLoad={() => setIsLoading(false)}
            className="w-full"
            title="Fuzzy Maze - Blockly Game"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </div>
  );
}



// Disable SSR to prevent hydration errors
const BlocklyMazeGameNoSSR = dynamic(() => Promise.resolve(BlocklyMazeGame), {
  ssr: false,
  loading: () => <LoadingComponent />
});

export default function BlocklyMazePage() {
  return <BlocklyMazeGameNoSSR />;
}