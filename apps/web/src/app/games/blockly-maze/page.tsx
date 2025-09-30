'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, RotateCcw, Lightbulb } from 'lucide-react';
import { BlocklyGamePlayer, createFuzzyBlocklyConfig } from '@fuzzy/external-games';

export default function BlocklyMazePage() {
  const router = useRouter();
  const [gameKey, setGameKey] = useState(0); // Para reiniciar el juego

  // Configuración específica para el juego de laberinto con Fuzzy
  const mazeConfig = createFuzzyBlocklyConfig('maze', {
    title: '🧩 Laberinto con Fuzzy',
    description: '¡Ayuda a Fuzzy a salir del laberinto programando sus movimientos paso a paso!',
    objectives: [
      {
        id: 'complete-level-1',
        title: '¡Fuzzy escapó del nivel 1!',
        description: 'Guía a Fuzzy hacia la salida usando bloques de programación',
        required: true,
        points: 5,
        completionCriteria: { action: 'level-completed', level: 1 },
      },
      {
        id: 'complete-level-3',
        title: '¡Fuzzy domina los laberintos básicos!',
        description: 'Completa 3 niveles consecutivos',
        required: false,
        points: 15,
        completionCriteria: { action: 'level-completed', level: 3 },
      },
      {
        id: 'complete-level-5',
        title: '¡Fuzzy es un maestro del laberinto!',
        description: 'Completa 5 niveles consecutivos',
        required: false,
        points: 25,
        completionCriteria: { action: 'level-completed', level: 5 },
      },
      {
        id: 'use-loops',
        title: '¡Programador eficiente!',
        description: 'Usa bucles para optimizar tu código',
        required: false,
        points: 10,
        completionCriteria: { action: 'block-used', blockType: 'controls_repeat' },
      },
    ],
  });

  const handleGameEvent = (event: any) => {
    console.log('🎮 Evento del juego de laberinto:', event);

    // Aquí puedes agregar lógica específica para eventos del laberinto
    if (event.action === 'level-completed') {
      console.log(`🎉 ¡Fuzzy completó el nivel ${event.level}!`);
    }
  };

  const handleGameComplete = (progress: any) => {
    console.log('🏆 ¡Juego de laberinto completado!', progress);
    // Aquí puedes agregar lógica para manejar la finalización del juego
  };

  const handleGameError = (error: Error) => {
    console.error('❌ Error en el juego de laberinto:', error);
    // Aquí puedes agregar manejo de errores específico
  };

  const restartGame = () => {
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
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
                className="bg-white/50 text-gray-700 hover:bg-purple-100 border-purple-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>

              <div className="text-center">
                <div className="text-xs text-gray-500">Jugando como</div>
                <div className="text-sm font-medium text-purple-600">Estudiante</div>
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
            config={mazeConfig}
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
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Arrastra los bloques para programar a Fuzzy
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>🎯 Edad recomendada: 8-16 años</span>
              <span>⏱️ Duración: 15-45 min</span>
              <span>🧩 Programación visual</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}