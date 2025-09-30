'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, RotateCcw, Waves } from 'lucide-react';
import { BlocklyGamePlayer, createFuzzyBlocklyConfig } from '@fuzzy/external-games';

export default function BlocklyPondPage() {
  const router = useRouter();
  const [gameKey, setGameKey] = useState(0); // Para reiniciar el juego

  // Configuración específica para el juego de pond (natación) con Fuzzy
  const pondConfig = createFuzzyBlocklyConfig('pond', {
    title: '🏊 Nada con Fuzzy',
    description: '¡Programa a Fuzzy para nadar en el estanque! Usa estrategias inteligentes para ganar.',
    difficulty: 'advanced',
    ageRange: [10, 18],
    objectives: [
      {
        id: 'first-swim',
        title: '¡Fuzzy nadó por primera vez!',
        description: 'Programa a Fuzzy para que nade en el estanque',
        required: true,
        points: 5,
        completionCriteria: { action: 'swim-started', duration: 3 },
      },
      {
        id: 'basic-navigation',
        title: '¡Fuzzy aprendió a navegar!',
        description: 'Programa movimientos básicos de natación',
        required: true,
        points: 10,
        completionCriteria: { action: 'navigation-completed', distance: 50 },
      },
      {
        id: 'detect-opponent',
        title: '¡Fuzzy detectó un oponente!',
        description: 'Usa sensores para detectar otros nadadores',
        required: false,
        points: 15,
        completionCriteria: { action: 'opponent-detected', count: 1 },
      },
      {
        id: 'first-victory',
        title: '¡Fuzzy ganó su primera batalla!',
        description: 'Vence a un oponente en el estanque',
        required: false,
        points: 20,
        completionCriteria: { action: 'battle-won', opponent: 'any' },
      },
      {
        id: 'strategy-master',
        title: '¡Maestro estratega!',
        description: 'Implementa una estrategia avanzada de natación',
        required: false,
        points: 25,
        completionCriteria: { action: 'strategy-used', complexity: 'advanced' },
      },
      {
        id: 'pond-champion',
        title: '¡Campeón del estanque!',
        description: 'Gana 3 batallas consecutivas',
        required: false,
        points: 30,
        completionCriteria: { action: 'battle-won', consecutive: 3 },
      },
    ],
  });

  const handleGameEvent = (event: any) => {
    console.log('🏊 Evento del juego de natación:', event);

    // Aquí puedes agregar lógica específica para eventos del juego de natación
    if (event.action === 'battle-won') {
      console.log(`🏆 ¡Fuzzy ganó una batalla!`);
    } else if (event.action === 'opponent-detected') {
      console.log(`👀 ¡Fuzzy detectó un oponente!`);
    }
  };

  const handleGameComplete = (progress: any) => {
    console.log('🏆 ¡Juego de natación completado!', progress);
    // Aquí puedes agregar lógica para manejar la finalización del juego
  };

  const handleGameError = (error: Error) => {
    console.error('❌ Error en el juego de natación:', error);
    // Aquí puedes agregar manejo de errores específico
  };

  const restartGame = () => {
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
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
                className="bg-white/50 text-gray-700 hover:bg-teal-100 border-teal-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>

              <div className="text-center">
                <div className="text-xs text-gray-500">Jugando como</div>
                <div className="text-sm font-medium text-teal-600">Estudiante</div>
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
            config={pondConfig}
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
                <Waves className="w-4 h-4 text-teal-500" />
                Programa estrategias de natación para Fuzzy
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>🎯 Edad recomendada: 10-18 años</span>
              <span>⏱️ Duración: 20-60 min</span>
              <span>🏊 Estrategia + IA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}