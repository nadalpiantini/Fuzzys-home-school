'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, RotateCcw, Palette } from 'lucide-react';
import { BlocklyGamePlayer, createFuzzyBlocklyConfig } from '@fuzzy/external-games';

export default function BlocklyTurtlePage() {
  const router = useRouter();
  const [gameKey, setGameKey] = useState(0); // Para reiniciar el juego

  // Configuración específica para el juego de turtle (arte) con Fuzzy
  const turtleConfig = createFuzzyBlocklyConfig('turtle', {
    title: '🎨 Arte con Fuzzy',
    description: '¡Crea arte increíble programando a Fuzzy! Dibuja formas, patrones y diseños únicos.',
    difficulty: 'intermediate',
    objectives: [
      {
        id: 'draw-line',
        title: '¡Fuzzy dibujó su primera línea!',
        description: 'Programa a Fuzzy para dibujar una línea recta',
        required: true,
        points: 5,
        completionCriteria: { action: 'shape-drawn', shape: 'line' },
      },
      {
        id: 'draw-square',
        title: '¡Fuzzy dibujó un cuadrado!',
        description: 'Programa a Fuzzy para dibujar un cuadrado perfecto',
        required: true,
        points: 10,
        completionCriteria: { action: 'shape-drawn', shape: 'square' },
      },
      {
        id: 'draw-triangle',
        title: '¡Fuzzy domina los triángulos!',
        description: 'Crea un triángulo usando bloques de programación',
        required: false,
        points: 15,
        completionCriteria: { action: 'shape-drawn', shape: 'triangle' },
      },
      {
        id: 'draw-star',
        title: '¡Fuzzy es un artista!',
        description: 'Crea una estrella de 5 puntas',
        required: false,
        points: 20,
        completionCriteria: { action: 'shape-drawn', shape: 'star' },
      },
      {
        id: 'use-colors',
        title: '¡Maestro del color!',
        description: 'Usa diferentes colores en tus dibujos',
        required: false,
        points: 10,
        completionCriteria: { action: 'color-changed', minColors: 3 },
      },
      {
        id: 'complex-pattern',
        title: '¡Artista profesional!',
        description: 'Crea un patrón complejo con bucles',
        required: false,
        points: 25,
        completionCriteria: { action: 'pattern-created', complexity: 'high' },
      },
    ],
  });

  const handleGameEvent = (event: any) => {
    console.log('🎨 Evento del juego de arte:', event);

    // Aquí puedes agregar lógica específica para eventos del juego de arte
    if (event.action === 'shape-drawn') {
      console.log(`🎉 ¡Fuzzy dibujó una ${event.shape}!`);
    }
  };

  const handleGameComplete = (progress: any) => {
    console.log('🏆 ¡Juego de arte completado!', progress);
    // Aquí puedes agregar lógica para manejar la finalización del juego
  };

  const handleGameError = (error: Error) => {
    console.error('❌ Error en el juego de arte:', error);
    // Aquí puedes agregar manejo de errores específico
  };

  const restartGame = () => {
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header de navegación */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4 mr-2" />
                Inicio
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={restartGame}
                className="bg-white/50 text-gray-700 hover:bg-pink-100 border-pink-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>

              <div className="text-center">
                <div className="text-xs text-gray-500">Jugando como</div>
                <div className="text-sm font-medium text-pink-600">Estudiante</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Área principal del juego */}
      <main className="container mx-auto px-6 py-6 h-[calc(100vh-80px)]">
        <div className="h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          <BlocklyGamePlayer
            key={gameKey}
            config={turtleConfig}
            studentId="demo-student" // En producción esto vendría del contexto de usuario
            onEvent={handleGameEvent}
            onComplete={handleGameComplete}
            onError={handleGameError}
            showFuzzyHeader={true}
            showProgrammingTips={true}
            className="h-full"
          />
        </div>
      </main>

      {/* Footer con información adicional */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-white/20 py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Palette className="w-4 h-4 text-pink-500" />
                Programa a Fuzzy para crear arte increíble
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>🎯 Edad recomendada: 8-16 años</span>
              <span>⏱️ Duración: 20-60 min</span>
              <span>🎨 Arte + Programación</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}