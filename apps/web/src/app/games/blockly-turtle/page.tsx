'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Palette } from 'lucide-react';

export default function BlocklyTurtlePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
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
            <Palette className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Fuzzy Turtle
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ayuda a Fuzzy a dibujar arte programando con bloques visuales.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Próximamente!
          </h2>
          <p className="text-gray-600 mb-6">
            Este juego está en desarrollo. Muy pronto podrás ayudar a Fuzzy a crear arte programando con bloques visuales.
          </p>
          <Button
            onClick={() => router.push('/games')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Ver otros juegos
          </Button>
        </div>
      </div>
    </div>
  );
}