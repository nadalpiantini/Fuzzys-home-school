'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, RotateCcw, Bird } from 'lucide-react';
import { BlocklyGamePlayer, createFuzzyBlocklyConfig } from '@fuzzy/external-games';

export default function BlocklyBirdPage() {
  const router = useRouter();
  const [gameKey, setGameKey] = useState(0); // Para reiniciar el juego

  // Configuración específica para el juego de bird (volar) con Fuzzy
  const birdConfig = createFuzzyBlocklyConfig('bird', {
    title: '🐦 Vuela con Fuzzy',
    description: '¡Controla el vuelo de Fuzzy! Programa su ruta para evitar obstáculos y recoger estrellas.',
    difficulty: 'intermediate',
    objectives: [
      {
        id: 'first-flight',
        title: '¡Fuzzy voló por primera vez!',
        description: 'Ayuda a Fuzzy a volar sin chocar',
        required: true,
        points: 5,
        completionCriteria: { action: 'flight-started', duration: 5 },
      },
      {
        id: 'avoid-obstacle',
        title: '¡Fuzzy evitó un obstáculo!',
        description: 'Programa a Fuzzy para evitar chocar con un obstáculo',
        required: true,
        points: 10,
        completionCriteria: { action: 'obstacle-avoided', count: 1 },
      },
      {
        id: 'collect-star',
        title: '¡Fuzzy recolectó una estrella!',
        description: 'Guía a Fuzzy para recoger estrellas mientras vuela',
        required: true,
        points: 15,
        completionCriteria: { action: 'star-collected', count: 1 },
      },
      {
        id: 'level-complete',
        title: '¡Fuzzy completó un nivel!',
        description: 'Termina un nivel sin chocar',
        required: false,
        points: 20,
        completionCriteria: { action: 'level-completed', level: 1 },
      },
      {
        id: 'master-pilot',
        title: '¡Fuzzy es un piloto experto!',
        description: 'Completa 3 niveles consecutivos',
        required: false,
        points: 30,
        completionCriteria: { action: 'level-completed', level: 3 },
      },
      {
        id: 'star-collector',
        title: '¡Coleccionista de estrellas!',
        description: 'Recolecta 10 estrellas en total',
        required: false,
        points: 25,
        completionCriteria: { action: 'star-collected', total: 10 },
      },
    ],
  });

  const handleGameEvent = (event: any) => {
    console.log('🐦 Evento del juego de vuelo:', event);

    // Aquí puedes agregar lógica específica para eventos del juego de vuelo
    if (event.action === 'star-collected') {
      console.log(`⭐ ¡Fuzzy recolectó una estrella!`);
    } else if (event.action === 'obstacle-avoided') {
      console.log(`🚧 ¡Fuzzy evitó un obstáculo!`);
    }
  };

  const handleGameComplete = (progress: any) => {
    console.log('🏆 ¡Juego de vuelo completado!', progress);
    // Aquí puedes agregar lógica para manejar la finalización del juego
  };

  const handleGameError = (error: Error) => {
    console.error('❌ Error en el juego de vuelo:', error);
    // Aquí puedes agregar manejo de errores específico
  };

  const restartGame = () => {
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
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
                className="bg-white/50 text-gray-700 hover:bg-sky-100 border-sky-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>

              <div className="text-center">
                <div className="text-xs text-gray-500">Jugando como</div>
                <div className="text-sm font-medium text-sky-600">Estudiante</div>
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
            config={birdConfig}
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
                <Bird className="w-4 h-4 text-sky-500" />
                Controla el vuelo de Fuzzy evitando obstáculos
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>🎯 Edad recomendada: 8-16 años</span>
              <span>⏱️ Duración: 15-30 min</span>
              <span>🐦 Vuelo + Lógica</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}