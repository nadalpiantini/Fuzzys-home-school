'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  RotateCcw,
  Home,
  Star,
  Trophy,
  Timer,
  Target,
  Sparkles,
  Code,
  ChevronRight,
  ChevronLeft,
  Zap,
  CheckCircle,
  Brain,
  Lightbulb,
  Award,
} from 'lucide-react';

// Block types for programming
interface CodeBlock {
  id: string;
  type: 'action' | 'loop' | 'condition' | 'start' | 'end';
  command: string;
  displayText: string;
  color: string;
  params?: { [key: string]: any };
  children?: CodeBlock[];
}

// Character position and state
interface Character {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  collected: number;
}

// Challenge definition
interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: 'sequences' | 'loops' | 'conditionals' | 'mixed';
  grid: {
    width: number;
    height: number;
    character: { x: number; y: number };
    goal: { x: number; y: number };
    obstacles: { x: number; y: number }[];
    collectibles: { x: number; y: number; value: number }[];
  };
  maxMoves: number;
  optimalMoves: number;
  availableBlocks: string[];
  hint: string;
}

// Available programming blocks
const AVAILABLE_BLOCKS: { [key: string]: CodeBlock } = {
  move_forward: {
    id: 'move_forward',
    type: 'action',
    command: 'move_forward',
    displayText: 'Mover adelante',
    color: 'bg-blue-500 text-white border-blue-600',
  },
  turn_left: {
    id: 'turn_left',
    type: 'action',
    command: 'turn_left',
    displayText: 'Girar izquierda',
    color: 'bg-green-500 text-white border-green-600',
  },
  turn_right: {
    id: 'turn_right',
    type: 'action',
    command: 'turn_right',
    displayText: 'Girar derecha',
    color: 'bg-yellow-600 text-white border-yellow-700',
  },
  collect: {
    id: 'collect',
    type: 'action',
    command: 'collect',
    displayText: 'Recoger item',
    color: 'bg-purple-500 text-white border-purple-600',
  },
  repeat_3: {
    id: 'repeat_3',
    type: 'loop',
    command: 'repeat',
    displayText: 'Repetir 3 veces',
    color: 'bg-orange-500 text-white border-orange-600',
    params: { times: 3 },
    children: [],
  },
  repeat_5: {
    id: 'repeat_5',
    type: 'loop',
    command: 'repeat',
    displayText: 'Repetir 5 veces',
    color: 'bg-orange-600 text-white border-orange-700',
    params: { times: 5 },
    children: [],
  },
  if_can_move: {
    id: 'if_can_move',
    type: 'condition',
    command: 'if_can_move',
    displayText: 'Si puede moverse',
    color: 'bg-red-500 text-white border-red-600',
    children: [],
  },
  if_item_here: {
    id: 'if_item_here',
    type: 'condition',
    command: 'if_item_here',
    displayText: 'Si hay item aquí',
    color: 'bg-pink-500 text-white border-pink-600',
    children: [],
  },
};

// Predefined challenges
const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: '🚶 Primeros Pasos',
    description: 'Mueve el personaje hasta la meta usando secuencias básicas',
    difficulty: 'beginner',
    topic: 'sequences',
    grid: {
      width: 5,
      height: 5,
      character: { x: 0, y: 2 },
      goal: { x: 4, y: 2 },
      obstacles: [],
      collectibles: [],
    },
    maxMoves: 8,
    optimalMoves: 4,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right'],
    hint: 'Solo necesitas moverte hacia la derecha 4 veces',
  },
  {
    id: 2,
    title: '🔄 Mi Primer Bucle',
    description: 'Usa bucles para moverte de manera eficiente',
    difficulty: 'beginner',
    topic: 'loops',
    grid: {
      width: 6,
      height: 3,
      character: { x: 0, y: 1 },
      goal: { x: 5, y: 1 },
      obstacles: [],
      collectibles: [],
    },
    maxMoves: 3,
    optimalMoves: 2,
    availableBlocks: ['move_forward', 'repeat_5'],
    hint: 'Usa un bucle para repetir el movimiento',
  },
  {
    id: 3,
    title: '💎 Recolector de Gemas',
    description: 'Recoge todas las gemas en el camino',
    difficulty: 'intermediate',
    topic: 'sequences',
    grid: {
      width: 5,
      height: 5,
      character: { x: 0, y: 0 },
      goal: { x: 4, y: 4 },
      obstacles: [],
      collectibles: [
        { x: 1, y: 0, value: 10 },
        { x: 2, y: 2, value: 15 },
        { x: 4, y: 3, value: 20 },
      ],
    },
    maxMoves: 12,
    optimalMoves: 8,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'collect'],
    hint: 'Planifica tu ruta para recoger todas las gemas',
  },
  {
    id: 4,
    title: '🧱 Navegando Obstáculos',
    description: 'Evita los obstáculos usando condicionales',
    difficulty: 'intermediate',
    topic: 'conditionals',
    grid: {
      width: 6,
      height: 4,
      character: { x: 0, y: 1 },
      goal: { x: 5, y: 1 },
      obstacles: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
      ],
      collectibles: [],
    },
    maxMoves: 10,
    optimalMoves: 6,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'if_can_move'],
    hint: 'Usa condicionales para detectar y evitar obstáculos',
  },
  {
    id: 5,
    title: '🏆 Desafío Maestro',
    description: 'Combina bucles, condicionales y secuencias',
    difficulty: 'advanced',
    topic: 'mixed',
    grid: {
      width: 8,
      height: 6,
      character: { x: 0, y: 0 },
      goal: { x: 7, y: 5 },
      obstacles: [
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 3 },
        { x: 5, y: 4 },
      ],
      collectibles: [
        { x: 1, y: 1, value: 25 },
        { x: 6, y: 2, value: 30 },
        { x: 7, y: 4, value: 35 },
      ],
    },
    maxMoves: 20,
    optimalMoves: 12,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'collect', 'repeat_3', 'if_can_move', 'if_item_here'],
    hint: 'Usa bucles y condicionales para crear una solución elegante',
  },
];

export default function CodeChallengeGame() {
  const router = useRouter();
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [character, setCharacter] = useState<Character>({
    x: CHALLENGES[0].grid.character.x,
    y: CHALLENGES[0].grid.character.y,
    direction: 'right',
    collected: 0,
  });
  const [programBlocks, setProgramBlocks] = useState<CodeBlock[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const draggedBlock = useRef<CodeBlock | null>(null);

  // Initialize character position when challenge changes
  useEffect(() => {
    setCharacter({
      x: currentChallenge.grid.character.x,
      y: currentChallenge.grid.character.y,
      direction: 'right',
      collected: 0,
    });
    setProgramBlocks([]);
    setGameWon(false);
    setMoveCount(0);
    setScore(0);
    setExecutionLog([]);
    setShowHint(false);
  }, [currentChallenge]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, block: CodeBlock) => {
    draggedBlock.current = { ...block, id: `${block.id}_${Date.now()}` };
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drop in program area
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedBlock.current) {
      setProgramBlocks(prev => [...prev, draggedBlock.current!]);
      draggedBlock.current = null;
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Remove block from program
  const removeBlock = (index: number) => {
    setProgramBlocks(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all blocks
  const clearProgram = () => {
    setProgramBlocks([]);
  };

  // Reset to initial state
  const resetChallenge = () => {
    setCharacter({
      x: currentChallenge.grid.character.x,
      y: currentChallenge.grid.character.y,
      direction: 'right',
      collected: 0,
    });
    setGameWon(false);
    setMoveCount(0);
    setScore(0);
    setExecutionLog([]);
    setIsExecuting(false);
    setExecutionStep(0);
  };

  // Check if position is valid
  const isValidPosition = (x: number, y: number) => {
    return x >= 0 && x < currentChallenge.grid.width &&
           y >= 0 && y < currentChallenge.grid.height &&
           !currentChallenge.grid.obstacles.some(obs => obs.x === x && obs.y === y);
  };

  // Execute a single command
  const executeCommand = useCallback((command: string, params?: any): boolean => {
    let success = true;
    setCharacter(prevChar => {
      let newChar = { ...prevChar };

      switch (command) {
        case 'move_forward':
          let newX = newChar.x;
          let newY = newChar.y;

          switch (newChar.direction) {
            case 'right': newX++; break;
            case 'left': newX--; break;
            case 'up': newY--; break;
            case 'down': newY++; break;
          }

          if (isValidPosition(newX, newY)) {
            newChar.x = newX;
            newChar.y = newY;
            setMoveCount(prev => prev + 1);
            setExecutionLog(prev => [...prev, `Movido a (${newX}, ${newY})`]);
          } else {
            setExecutionLog(prev => [...prev, '❌ No se puede mover - obstáculo o límite']);
            success = false;
          }
          break;

        case 'turn_left':
          const leftRotation = { 'right': 'up', 'up': 'left', 'left': 'down', 'down': 'right' };
          newChar.direction = leftRotation[newChar.direction] as any;
          setExecutionLog(prev => [...prev, `Girado a la izquierda - ahora mira ${newChar.direction}`]);
          break;

        case 'turn_right':
          const rightRotation = { 'right': 'down', 'down': 'left', 'left': 'up', 'up': 'right' };
          newChar.direction = rightRotation[newChar.direction] as any;
          setExecutionLog(prev => [...prev, `Girado a la derecha - ahora mira ${newChar.direction}`]);
          break;

        case 'collect':
          const collectibleIndex = currentChallenge.grid.collectibles.findIndex(
            item => item.x === newChar.x && item.y === newChar.y
          );
          if (collectibleIndex !== -1) {
            const value = currentChallenge.grid.collectibles[collectibleIndex].value;
            newChar.collected += value;
            setScore(prev => prev + value);
            setExecutionLog(prev => [...prev, `💎 Recolectado item (${value} puntos)`]);
            // Remove collected item
            currentChallenge.grid.collectibles.splice(collectibleIndex, 1);
          } else {
            setExecutionLog(prev => [...prev, '❌ No hay items para recoger aquí']);
            success = false;
          }
          break;
      }

      return newChar;
    });

    return success;
  }, [currentChallenge]);

  // Execute program with animation
  const executeProgram = async () => {
    if (programBlocks.length === 0) return;

    setIsExecuting(true);
    setExecutionLog(['🚀 Iniciando ejecución del programa...']);
    resetChallenge();

    const executeBlocks = async (blocks: CodeBlock[]): Promise<boolean> => {
      for (const block of blocks) {
        if (block.type === 'loop' && block.params?.times) {
          setExecutionLog(prev => [...prev, `🔄 Iniciando bucle: ${block.params?.times} veces`]);
          for (let i = 0; i < (block.params?.times || 0); i++) {
            setExecutionLog(prev => [...prev, `🔄 Iteración ${i + 1} de ${block.params?.times}`]);
            if (block.children) {
              const success = await executeBlocks(block.children);
              if (!success) return false;
            }
          }
        } else if (block.type === 'condition') {
          let conditionMet = false;
          if (block.command === 'if_can_move') {
            // Check if character can move forward
            setCharacter(prevChar => {
              let newX = prevChar.x;
              let newY = prevChar.y;

              switch (prevChar.direction) {
                case 'right': newX++; break;
                case 'left': newX--; break;
                case 'up': newY--; break;
                case 'down': newY++; break;
              }

              conditionMet = isValidPosition(newX, newY);
              return prevChar;
            });
          } else if (block.command === 'if_item_here') {
            // Check if there's an item at current position
            conditionMet = currentChallenge.grid.collectibles.some(
              item => item.x === character.x && item.y === character.y
            );
          }

          setExecutionLog(prev => [...prev, `🤔 Condición: ${conditionMet ? 'Verdadero' : 'Falso'}`]);

          if (conditionMet && block.children) {
            const success = await executeBlocks(block.children);
            if (!success) return false;
          }
        } else if (block.type === 'action') {
          const success = executeCommand(block.command, block.params);
          if (!success) return false;
        }

        // Add delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      return true;
    };

    await executeBlocks(programBlocks);

    // Check win condition
    setTimeout(() => {
      setCharacter(prevChar => {
        const isAtGoal = prevChar.x === currentChallenge.grid.goal.x &&
                        prevChar.y === currentChallenge.grid.goal.y;
        const allItemsCollected = currentChallenge.grid.collectibles.length === 0;

        if (isAtGoal && allItemsCollected) {
          setGameWon(true);
          const efficiency = Math.max(0, 100 - (moveCount - currentChallenge.optimalMoves) * 10);
          const bonusScore = Math.floor(efficiency * 5);
          setScore(prev => prev + bonusScore);
          setExecutionLog(prev => [...prev, '🎉 ¡Meta alcanzada! ¡Desafío completado!']);
        } else if (isAtGoal) {
          setExecutionLog(prev => [...prev, '🎯 Meta alcanzada, pero faltan items por recoger']);
        } else {
          setExecutionLog(prev => [...prev, '❌ No se alcanzó la meta']);
        }

        setIsExecuting(false);
        return prevChar;
      });
    }, 1000);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get topic icon
  const getTopicIcon = (topic: string) => {
    switch (topic) {
      case 'sequences': return '📝';
      case 'loops': return '🔄';
      case 'conditionals': return '🤔';
      case 'mixed': return '🧩';
      default: return '💻';
    }
  };

  // Get character direction arrow
  const getDirectionArrow = (direction: string) => {
    switch (direction) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'left': return '←';
      case 'right': return '→';
      default: return '→';
    }
  };

  // Calculate performance rating
  const getPerformanceRating = () => {
    if (moveCount <= currentChallenge.optimalMoves) return { stars: 3, text: '¡Perfecto!' };
    if (moveCount <= currentChallenge.optimalMoves + 2) return { stars: 2, text: '¡Muy bien!' };
    return { stars: 1, text: '¡Completado!' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  💻 Desafío de Programación
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Arrastra bloques para crear algoritmos!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/games')}
                className="bg-white/50 hover:bg-white/80"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver a Juegos
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Challenge Info & Blocks */}
          <div className="lg:col-span-1 space-y-6">
            {/* Challenge Selection */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Desafíos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {CHALLENGES.map((challenge) => (
                    <Button
                      key={challenge.id}
                      variant={currentChallenge.id === challenge.id ? "default" : "ghost"}
                      className={`w-full text-left justify-start h-auto p-3 ${
                        currentChallenge.id === challenge.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                          : ''
                      }`}
                      onClick={() => setCurrentChallenge(challenge)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <span className="text-xl">{getTopicIcon(challenge.topic)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{challenge.title}</div>
                          <div className="text-xs opacity-80 truncate">{challenge.description}</div>
                          <Badge
                            className={`mt-1 text-xs ${getDifficultyColor(challenge.difficulty)}`}
                            variant="outline"
                          >
                            {challenge.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Challenge Info */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  {currentChallenge.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{currentChallenge.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Movimientos óptimos:</span>
                    <div className="font-bold text-green-600">{currentChallenge.optimalMoves}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Límite:</span>
                    <div className="font-bold text-orange-600">{currentChallenge.maxMoves}</div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="w-full"
                >
                  {showHint ? '🙈 Ocultar' : '💡 Mostrar'} Pista
                </Button>

                {showHint && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">💡 {currentChallenge.hint}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Blocks */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Bloques Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {currentChallenge.availableBlocks.map((blockId) => {
                    const block = AVAILABLE_BLOCKS[blockId];
                    return (
                      <div
                        key={blockId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, block)}
                        className={`${block.color} rounded-lg p-3 cursor-grab active:cursor-grabbing transition-transform hover:scale-105 border-2`}
                      >
                        <div className="text-sm font-medium text-center">
                          {block.displayText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Game Grid */}
          <div className="lg:col-span-1 space-y-6">
            {/* Game Stats */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Timer className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                    <div className="text-sm text-gray-600">Movimientos</div>
                    <div className="text-lg font-bold text-blue-600">{moveCount}</div>
                  </div>
                  <div>
                    <Star className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                    <div className="text-sm text-gray-600">Puntos</div>
                    <div className="text-lg font-bold text-yellow-600">{score}</div>
                  </div>
                  <div>
                    <Trophy className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                    <div className="text-sm text-gray-600">Items</div>
                    <div className="text-lg font-bold text-purple-600">{character.collected}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Grid */}
            <Card className="bg-white/40 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div
                  className="grid gap-1 mx-auto bg-white rounded-lg p-4 shadow-inner"
                  style={{
                    gridTemplateColumns: `repeat(${currentChallenge.grid.width}, 1fr)`,
                    maxWidth: '400px',
                    aspectRatio: `${currentChallenge.grid.width} / ${currentChallenge.grid.height}`,
                  }}
                >
                  {Array.from({ length: currentChallenge.grid.height }).map((_, y) =>
                    Array.from({ length: currentChallenge.grid.width }).map((_, x) => {
                      const isCharacter = character.x === x && character.y === y;
                      const isGoal = currentChallenge.grid.goal.x === x && currentChallenge.grid.goal.y === y;
                      const isObstacle = currentChallenge.grid.obstacles.some(obs => obs.x === x && obs.y === y);
                      const collectible = currentChallenge.grid.collectibles.find(item => item.x === x && item.y === y);

                      return (
                        <div
                          key={`${x}-${y}`}
                          className={`
                            aspect-square rounded border-2 flex items-center justify-center text-lg font-bold
                            ${isObstacle ? 'bg-gray-800 border-gray-900' : 'bg-gray-100 border-gray-200'}
                            ${isGoal ? 'bg-green-200 border-green-400 ring-2 ring-green-300' : ''}
                            ${isCharacter ? 'bg-blue-200 border-blue-400 ring-2 ring-blue-300' : ''}
                          `}
                        >
                          {isCharacter && (
                            <span className="text-2xl">
                              🤖{getDirectionArrow(character.direction)}
                            </span>
                          )}
                          {isGoal && !isCharacter && '🎯'}
                          {isObstacle && '🧱'}
                          {collectible && '💎'}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Control Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={executeProgram}
                disabled={isExecuting || programBlocks.length === 0}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
              </Button>
              <Button
                onClick={resetChallenge}
                variant="outline"
                disabled={isExecuting}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>
          </div>

          {/* Right Panel - Program Builder */}
          <div className="lg:col-span-1 space-y-6">
            {/* Program Builder */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Mi Programa
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearProgram}
                    disabled={programBlocks.length === 0 || isExecuting}
                  >
                    Limpiar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="min-h-48 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {programBlocks.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Arrastra bloques aquí para crear tu programa</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {programBlocks.map((block, index) => (
                        <div
                          key={`${block.id}_${index}`}
                          className={`${block.color} rounded-lg p-3 border-2 group relative`}
                        >
                          <div className="text-sm font-medium text-center">
                            {block.displayText}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                            onClick={() => removeBlock(index)}
                            disabled={isExecuting}
                          >
                            ×
                          </Button>
                          {block.type === 'loop' && (
                            <div className="mt-2 pl-4 border-l-2 border-white/30 min-h-8 text-xs text-center text-white/80">
                              {block.children && block.children.length > 0
                                ? block.children.map(child => child.displayText).join(', ')
                                : 'Arrastra bloques aquí'
                              }
                            </div>
                          )}
                          {block.type === 'condition' && (
                            <div className="mt-2 pl-4 border-l-2 border-white/30 min-h-8 text-xs text-center text-white/80">
                              {block.children && block.children.length > 0
                                ? block.children.map(child => child.displayText).join(', ')
                                : 'Arrastra bloques aquí'
                              }
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Execution Log */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Registro de Ejecución
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-1 bg-gray-50 rounded-lg p-3">
                  {executionLog.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      El registro aparecerá aquí cuando ejecutes el programa
                    </p>
                  ) : (
                    executionLog.map((log, index) => (
                      <div key={index} className="text-xs bg-white rounded px-2 py-1 border">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl border border-white/20">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ¡Desafío Completado!
              </h2>

              <p className="text-gray-600 mb-6">
                ¡Has programado exitosamente la solución!
              </p>

              {/* Performance Rating */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
                <div className="flex justify-center gap-1 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < getPerformanceRating().stars
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-lg font-semibold text-indigo-600 mb-3">
                  {getPerformanceRating().text}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Movimientos</div>
                    <div className="font-bold text-blue-600">{moveCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Eficiencia</div>
                    <div className="font-bold text-green-600">
                      {Math.max(0, 100 - (moveCount - currentChallenge.optimalMoves) * 10)}%
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-gray-600">Puntuación Total</div>
                  <div className="text-2xl font-bold text-purple-600">{score}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    if (currentChallenge.id < CHALLENGES.length) {
                      setCurrentChallenge(CHALLENGES[currentChallenge.id]);
                    } else {
                      resetChallenge();
                    }
                    setGameWon(false);
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                  size="lg"
                >
                  {currentChallenge.id < CHALLENGES.length ? (
                    <>
                      <ChevronRight className="w-5 h-5 mr-2" />
                      Siguiente Desafío
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Jugar de Nuevo
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/games')}
                  size="lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Otros Juegos
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}