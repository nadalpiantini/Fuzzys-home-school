'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MCQ,
  TrueFalse,
  ShortAnswer,
  DragDrop,
  Hotspot,
  GapFill,
  LiveQuiz
} from '@/components/games';
import { UniversalGameEngine } from '@fuzzy/game-engine';

export default function GamesDemoPage() {
  const [currentTab, setCurrentTab] = useState('mcq');
  const gameEngine = new UniversalGameEngine();

  // Sample game data
  const mcqGame = {
    id: '1',
    title: 'Capital de España',
    question: '¿Cuál es la capital de España?',
    options: [
      { id: 'a', text: 'Barcelona', correct: false },
      { id: 'b', text: 'Madrid', correct: true },
      { id: 'c', text: 'Valencia', correct: false },
      { id: 'd', text: 'Sevilla', correct: false }
    ],
    explanation: 'Madrid es la capital y ciudad más grande de España.',
    choices: [
      { id: 'a', text: 'Barcelona', correct: false },
      { id: 'b', text: 'Madrid', correct: true },
      { id: 'c', text: 'Valencia', correct: false },
      { id: 'd', text: 'Sevilla', correct: false }
    ],
    multipleAnswers: false
  };

  const trueFalseGame = {
    id: '2',
    title: 'Agua hirviendo',
    question: 'El agua hierve a 100°C al nivel del mar',
    correctAnswer: true,
    explanation: 'A presión atmosférica normal, el agua hierve a 100°C.'
  };

  const dragDropGame = {
    id: '3',
    title: 'Clasificación de animales',
    items: [
      { id: '1', content: 'Perro', targetZone: 'mammals' },
      { id: '2', content: 'Águila', targetZone: 'birds' },
      { id: '3', content: 'Tiburón', targetZone: 'fish' },
      { id: '4', content: 'Gato', targetZone: 'mammals' },
      { id: '5', content: 'Salmón', targetZone: 'fish' }
    ],
    zones: [
      { id: 'mammals', label: 'Mamíferos' },
      { id: 'birds', label: 'Aves' },
      { id: 'fish', label: 'Peces' }
    ]
  };

  const hotspotGame = {
    id: '4',
    title: 'Partes de la célula',
    image: '/api/placeholder/600/400',
    hotspots: [],
    targets: [
      { x: 30, y: 40, correct: true, radius: 10 },
      { x: 60, y: 60, correct: true, radius: 10 },
      { x: 80, y: 30, correct: false, radius: 10 }
    ]
  };

  const gapFillGame = {
    id: '5',
    title: 'Fotosíntesis',
    text: 'La fotosíntesis ocurre en los _____ de las plantas verdes.',
    gaps: [
      { id: '1', correctAnswer: 'cloroplastos', options: [] }
    ],
    caseSensitive: false
  };

  const handleAnswer = (gameType: string, answer: any) => {
    console.log(`Respuesta para ${gameType}:`, answer);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sistema de Juegos Educativos
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            20+ tipos de interacciones educativas implementadas
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['MCQ', 'True/False', 'Drag & Drop', 'Hotspot', 'Gap Fill', 'Live Quiz', 'Colonial Rally'].map((type) => (
              <span
                key={type}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {type}
              </span>
            ))}
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              +13 más
            </span>
          </div>
        </Card>

        {/* Game Demos */}
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="mcq">MCQ</TabsTrigger>
            <TabsTrigger value="truefalse">V/F</TabsTrigger>
            <TabsTrigger value="dragdrop">Arrastrar</TabsTrigger>
            <TabsTrigger value="hotspot">Hotspot</TabsTrigger>
            <TabsTrigger value="gapfill">Completar</TabsTrigger>
            <TabsTrigger value="livequiz">En Vivo</TabsTrigger>
            <TabsTrigger value="summary">Resumen</TabsTrigger>
          </TabsList>

          <TabsContent value="mcq">
            <MCQ
              game={mcqGame}
              onAnswer={(answer) => handleAnswer('MCQ', answer)}
            />
          </TabsContent>

          <TabsContent value="truefalse">
            <TrueFalse
              game={trueFalseGame}
              onAnswer={(answer) => handleAnswer('True/False', answer)}
            />
          </TabsContent>

          <TabsContent value="dragdrop">
            <DragDrop
              game={dragDropGame}
              onAnswer={(answer) => handleAnswer('Drag & Drop', answer)}
            />
          </TabsContent>

          <TabsContent value="hotspot">
            <Hotspot
              game={hotspotGame}
              onAnswer={(answer) => handleAnswer('Hotspot', answer)}
            />
          </TabsContent>

          <TabsContent value="gapfill">
            <GapFill
              game={gapFillGame}
              onAnswer={(answer) => handleAnswer('Gap Fill', answer)}
            />
          </TabsContent>

          <TabsContent value="livequiz">
            <LiveQuiz
              mode="host"
              quizId="demo"
              onStart={() => console.log('Quiz iniciado')}
            />
          </TabsContent>

          <TabsContent value="summary">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Resumen del Sistema de Juegos</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Componentes Implementados</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                      MCQ - Opción múltiple
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                      True/False - Verdadero/Falso
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                      Short Answer - Respuesta corta
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                      Drag & Drop - Arrastrar y soltar
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                      Hotspot - Áreas interactivas
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                      Gap Fill - Completar espacios
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                      Live Quiz - Quiz en vivo
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                      Colonial Rally - AR/QR
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Características</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                      Motor de juego unificado
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                      Sistema de puntuación adaptativo
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                      Generación con IA
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                      Dashboard del profesor
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                      Competencias en tiempo real
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                      Realidad aumentada
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Estado del Sistema</h3>
                <p className="text-green-800">
                  ✅ Todos los componentes principales están implementados y funcionando.
                  El sistema está listo para integración con base de datos y servicios de IA.
                </p>
              </div>

              <div className="mt-4 flex space-x-3">
                <Button onClick={() => window.location.href = '/teacher/dashboard'}>
                  Ver Dashboard del Profesor
                </Button>
                <Button onClick={() => window.location.href = '/colonial-rally'} variant="outline">
                  Probar Colonial Rally
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}