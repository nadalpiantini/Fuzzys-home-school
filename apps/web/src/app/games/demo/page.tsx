'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MCQ,
  TrueFalse,
  ShortAnswer,
  DragDrop,
  Hotspot,
  GapFill,
  LiveQuiz,
  ImageSequence,
  Crossword,
  WordSearch,
  MemoryCards,
  Flashcards,
  BranchingScenario,
  Timeline,
  Match,
  MathSolver,
  CodeChallenge
} from '@/components/games';
import { GameType } from '@fuzzy/game-engine';
import {
  Brain,
  Gamepad2,
  Trophy,
  BookOpen,
  PuzzleIcon,
  Target,
  Shuffle,
  Code,
  Map,
  Users,
  Calculator,
  Link2,
  Clock,
  GitBranch,
  Grid3X3
} from 'lucide-react';

// Sample game data for each type
const sampleGames = {
  [GameType.MCQ]: {
    type: GameType.MCQ,
    stem: '¿Cuál es la capital de República Dominicana?',
    choices: [
      { id: '1', text: 'Santiago', correct: false },
      { id: '2', text: 'Santo Domingo', correct: true },
      { id: '3', text: 'Puerto Plata', correct: false },
      { id: '4', text: 'La Romana', correct: false }
    ],
    explanation: 'Santo Domingo es la capital y ciudad más poblada de República Dominicana.'
  },
  [GameType.TrueFalse]: {
    type: GameType.TrueFalse,
    statement: 'El agua hierve a 100 grados Celsius al nivel del mar',
    correct: true,
    explanation: 'A presión atmosférica normal (1 atm), el agua hierve a 100°C.'
  },
  [GameType.ShortAnswer]: {
    type: GameType.ShortAnswer,
    question: '¿Cuál es el resultado de 15 + 27?',
    acceptableAnswers: ['42', 'cuarenta y dos'],
    caseSensitive: false
  },
  [GameType.DragDrop]: {
    type: GameType.DragDrop,
    items: [
      { id: '1', content: 'Perro', targetZone: 'mammals' },
      { id: '2', content: 'Águila', targetZone: 'birds' },
      { id: '3', content: 'Tiburón', targetZone: 'fish' },
      { id: '4', content: 'Gato', targetZone: 'mammals' },
      { id: '5', content: 'Salmón', targetZone: 'fish' },
      { id: '6', content: 'Colibrí', targetZone: 'birds' }
    ],
    zones: [
      { id: 'mammals', label: 'Mamíferos' },
      { id: 'birds', label: 'Aves' },
      { id: 'fish', label: 'Peces' }
    ]
  },
  [GameType.Hotspot]: {
    type: GameType.Hotspot,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    targets: [
      { x: 50, y: 30, radius: 10, label: 'Cabeza', correct: true },
      { x: 50, y: 60, radius: 15, label: 'Cuerpo', correct: true }
    ]
  },
  [GameType.GapFill]: {
    type: GameType.GapFill,
    text: 'El _____ es el planeta más grande del sistema solar',
    answers: [['Júpiter', 'jupiter']],
    caseSensitive: false
  },
  [GameType.ImageSequence]: {
    type: GameType.ImageSequence,
    items: [
      { id: '1', image: 'https://images.unsplash.com/photo-1584714268709-c3dd9c92b378?w=400', caption: 'Semilla' },
      { id: '2', image: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=400', caption: 'Brote' },
      { id: '3', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400', caption: 'Árbol' }
    ],
    correctOrder: [0, 1, 2]
  },
  [GameType.Crossword]: {
    type: GameType.Crossword,
    grid: [
      ['H', 'O', 'L', 'A', null],
      ['O', null, null, 'M', null],
      ['L', null, null, 'O', null],
      ['A', null, null, 'R', null]
    ],
    clues: {
      across: [
        { number: 1, clue: 'Saludo común', answer: 'HOLA', startRow: 0, startCol: 0 }
      ],
      down: [
        { number: 1, clue: 'Palabra de saludo vertical', answer: 'HOLA', startRow: 0, startCol: 0 },
        { number: 2, clue: 'Sentimiento romántico', answer: 'AMOR', startRow: 0, startCol: 3 }
      ]
    }
  },
  [GameType.WordSearch]: {
    type: 'word_search',
    grid: [
      ['S', 'O', 'L', 'A', 'R'],
      ['O', 'M', 'U', 'N', 'D'],
      ['L', 'A', 'R', 'T', 'E'],
      ['U', 'R', 'I', 'O', 'S'],
      ['N', 'T', 'E', 'R', 'R']
    ],
    words: ['SOL', 'LUNA', 'MARTE', 'TIERRA'],
    theme: 'Sistema Solar'
  },
  [GameType.MemoryCards]: {
    type: GameType.MemoryCards,
    pairs: [
      { id: '1', front: '🇩🇴', back: 'República Dominicana' },
      { id: '2', front: '🇲🇽', back: 'México' },
      { id: '3', front: '🇦🇷', back: 'Argentina' },
      { id: '4', front: '🇪🇸', back: 'España' }
    ],
    gridSize: { rows: 2, cols: 4 }
  },
  [GameType.Flashcards]: {
    type: 'flashcards',
    cards: [
      { id: '1', front: 'What is 2 + 2?', back: '4', difficulty: 0.2 },
      { id: '2', front: '¿Capital de Francia?', back: 'París', difficulty: 0.3 },
      { id: '3', front: 'H₂O', back: 'Agua', difficulty: 0.1 }
    ],
    subject: 'Repaso General',
    reviewMode: 'sequential'
  },
  [GameType.BranchingScenario]: {
    type: GameType.BranchingScenario,
    nodes: [
      {
        id: 'start',
        content: 'Estás explorando una cueva misteriosa. Encuentras dos caminos.',
        options: [
          { text: 'Ir por el camino izquierdo', next: 'left', points: 10 },
          { text: 'Ir por el camino derecho', next: 'right', points: 5 }
        ]
      },
      {
        id: 'left',
        content: 'Encuentras un tesoro brillante!',
        options: [
          { text: 'Tomar el tesoro', next: 'end', points: 20 },
          { text: 'Dejarlo y seguir', next: 'end', points: 10 }
        ]
      },
      {
        id: 'right',
        content: 'El camino está bloqueado por rocas.',
        options: [
          { text: 'Regresar', next: 'start', points: -5 },
          { text: 'Buscar otra ruta', next: 'end', points: 5 }
        ]
      },
      {
        id: 'end',
        content: '¡Aventura completada!',
        options: []
      }
    ],
    startNode: 'start'
  },
  [GameType.Timeline]: {
    type: GameType.Timeline,
    events: [
      { id: '1', title: 'Llegada de Colón', date: '1492-10-12', description: 'Cristóbal Colón llega a América' },
      { id: '2', title: 'Independencia de RD', date: '1844-02-27', description: 'República Dominicana se independiza' },
      { id: '3', title: 'Era de Trujillo', date: '1930-08-16', description: 'Inicio de la dictadura' }
    ],
    displayDates: false
  },
  [GameType.Match]: {
    type: GameType.Match,
    pairs: [
      { left: 'Photosynthesis', right: 'Fotosíntesis' },
      { left: 'Water', right: 'Agua' },
      { left: 'Sun', right: 'Sol' },
      { left: 'Tree', right: 'Árbol' }
    ],
    shuffle: true
  },
  [GameType.MathSolver]: {
    type: GameType.MathSolver,
    problem: 'Resuelve: 2x + 5 = 13',
    steps: [
      { step: 1, description: 'Restar 5 de ambos lados', equation: '2x = 13 - 5' },
      { step: 2, description: 'Simplificar', equation: '2x = 8' },
      { step: 3, description: 'Dividir por 2', equation: 'x = 8/2' },
      { step: 4, description: 'Resultado final', equation: 'x = 4' }
    ],
    answer: 4
  },
  [GameType.CodeChallenge]: {
    type: GameType.CodeChallenge,
    title: 'Función Suma',
    description: 'Crea una función que sume dos números',
    language: 'javascript',
    starterCode: 'function suma(a, b) {\n  // Tu código aquí\n}',
    testCases: [
      { input: 'suma(2, 3)', expected: 5 },
      { input: 'suma(-1, 1)', expected: 0 },
      { input: 'suma(0, 0)', expected: 0 }
    ],
    solution: 'function suma(a, b) {\n  return a + b;\n}'
  },
  [GameType.MindMap]: {
    type: GameType.MindMap,
    title: 'Mapa Mental - Ecosistema',
    description: 'Crea un mapa mental sobre el ecosistema',
    centralTopic: 'Ecosistema',
    nodes: [
      { id: '1', text: 'Plantas', x: 100, y: 50 },
      { id: '2', text: 'Animales', x: 200, y: 50 },
      { id: '3', text: 'Clima', x: 150, y: 150 }
    ],
    connections: [
      { from: 'central', to: '1' },
      { from: 'central', to: '2' },
      { from: 'central', to: '3' }
    ]
  },
  [GameType.TeamChallenge]: {
    type: GameType.TeamChallenge,
    title: 'Desafío de Equipo',
    description: 'Trabaja en equipo para resolver el problema',
    challenge: 'Diseña una solución sostenible para el reciclaje',
    timeLimit: 300,
    maxParticipants: 4
  },
  [GameType.ColonialRally]: {
    type: GameType.ColonialRally,
    title: 'Rally Colonial',
    description: 'Explora la historia colonial de República Dominicana',
    checkpoints: [
      { id: '1', name: 'Llegada de Colón', location: 'Santo Domingo', completed: false },
      { id: '2', name: 'Primera Catedral', location: 'Zona Colonial', completed: false },
      { id: '3', name: 'Independencia', location: 'Puerta del Conde', completed: false }
    ],
    totalTime: 1800
  },
  [GameType.LiveQuiz]: {
    type: GameType.LiveQuiz,
    title: 'Quiz en Vivo',
    description: 'Participa en un quiz en tiempo real',
    questions: [
      {
        id: '1',
        question: '¿Cuál es la capital de República Dominicana?',
        options: ['Santiago', 'Santo Domingo', 'Puerto Plata', 'La Romana'],
        correctAnswer: 1,
        timeLimit: 30
      }
    ],
    participants: 0,
    maxParticipants: 50
  }
};

const gameInfo = [
  { type: GameType.MCQ, name: 'Opción Múltiple', icon: Brain, color: 'bg-purple-500' },
  { type: GameType.TrueFalse, name: 'Verdadero/Falso', icon: Target, color: 'bg-green-500' },
  { type: GameType.ShortAnswer, name: 'Respuesta Corta', icon: BookOpen, color: 'bg-blue-500' },
  { type: GameType.DragDrop, name: 'Arrastrar y Soltar', icon: Shuffle, color: 'bg-yellow-500' },
  { type: GameType.Hotspot, name: 'Punto Caliente', icon: Target, color: 'bg-red-500' },
  { type: GameType.GapFill, name: 'Llenar Espacios', icon: PuzzleIcon, color: 'bg-indigo-500' },
  { type: GameType.LiveQuiz, name: 'Quiz en Vivo', icon: Users, color: 'bg-pink-500' },
  { type: GameType.ImageSequence, name: 'Secuencia de Imágenes', icon: Grid3X3, color: 'bg-teal-500' },
  { type: GameType.Crossword, name: 'Crucigrama', icon: Grid3X3, color: 'bg-orange-500' },
  { type: GameType.WordSearch, name: 'Sopa de Letras', icon: Grid3X3, color: 'bg-cyan-500' },
  { type: GameType.MemoryCards, name: 'Memoria', icon: Brain, color: 'bg-violet-500' },
  { type: GameType.Flashcards, name: 'Tarjetas de Estudio', icon: BookOpen, color: 'bg-amber-500' },
  { type: GameType.BranchingScenario, name: 'Escenario Ramificado', icon: GitBranch, color: 'bg-emerald-500' },
  { type: GameType.Timeline, name: 'Línea de Tiempo', icon: Clock, color: 'bg-rose-500' },
  { type: GameType.Match, name: 'Emparejar', icon: Link2, color: 'bg-lime-500' },
  { type: GameType.MathSolver, name: 'Resolvedor Matemático', icon: Calculator, color: 'bg-slate-500' },
  { type: GameType.CodeChallenge, name: 'Desafío de Código', icon: Code, color: 'bg-gray-500' },
  { type: GameType.MindMap, name: 'Mapa Mental', icon: Brain, color: 'bg-pink-500' },
  { type: GameType.TeamChallenge, name: 'Desafío de Equipo', icon: Users, color: 'bg-orange-500' },
  { type: GameType.ColonialRally, name: 'Rally Colonial', icon: Map, color: 'bg-yellow-500' }
];

export default function GameDemoPage() {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = (answer: any) => {
    console.log('Answer received:', answer);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedGame(null);
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    const gameData = sampleGames[selectedGame];
    const commonProps = {
      game: gameData,
      onAnswer: handleAnswer,
      onNext: handleNext,
      showFeedback,
      feedback: showFeedback ? {
        correct: true,
        explanation: 'Respuesta correcta! Bien hecho.'
      } : undefined
    };

    switch (selectedGame) {
      case GameType.MCQ:
        return <MCQ {...commonProps as any} />;
      case GameType.TrueFalse:
        return <TrueFalse {...commonProps as any} />;
      case GameType.ShortAnswer:
        return <ShortAnswer {...commonProps as any} />;
      case GameType.DragDrop:
        return <DragDrop {...commonProps as any} />;
      case GameType.Hotspot:
        return <Hotspot {...commonProps as any} />;
      case GameType.GapFill:
        return <GapFill {...commonProps as any} />;
      case GameType.ImageSequence:
        return <ImageSequence {...commonProps as any} />;
      case GameType.Crossword:
        return <Crossword {...commonProps as any} />;
      case GameType.WordSearch:
        return <WordSearch {...commonProps as any} />;
      case GameType.MemoryCards:
        return <MemoryCards {...commonProps as any} />;
      case GameType.Flashcards:
        return <Flashcards {...commonProps as any} />;
      case GameType.BranchingScenario:
        return <BranchingScenario {...commonProps as any} />;
      case GameType.Timeline:
        return <Timeline {...commonProps as any} />;
      case GameType.Match:
        return <Match {...commonProps as any} />;
      case GameType.MathSolver:
        return <MathSolver {...commonProps as any} />;
      case GameType.CodeChallenge:
        return <CodeChallenge {...commonProps as any} />;
      case GameType.MindMap:
        return (
          <div className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Mapa Mental</h3>
            <p className="text-gray-600 mb-4">Este juego estará disponible próximamente</p>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500">Funcionalidad en desarrollo...</p>
            </div>
          </div>
        );
      case GameType.TeamChallenge:
        return (
          <div className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Desafío de Equipo</h3>
            <p className="text-gray-600 mb-4">Este juego estará disponible próximamente</p>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500">Funcionalidad en desarrollo...</p>
            </div>
          </div>
        );
      case GameType.ColonialRally:
        return (
          <div className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Rally Colonial</h3>
            <p className="text-gray-600 mb-4">Este juego estará disponible próximamente</p>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500">Funcionalidad en desarrollo...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent">
              Centro de Juegos Educativos
            </h1>
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <p className="text-gray-600">
            Explora todos los tipos de juegos educativos disponibles en Fuzzy&apos;s Home School
          </p>
        </div>

        {!selectedGame ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {gameInfo.map((game) => {
              const Icon = game.icon;
              return (
                <Card
                  key={game.type}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedGame(game.type)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${game.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-sm">{game.name}</CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={() => {
                setSelectedGame(null);
                setShowFeedback(false);
              }}
              variant="outline"
            >
              ← Volver a la lista
            </Button>

            <div className="bg-white rounded-lg shadow-lg p-2">
              {renderGame()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}