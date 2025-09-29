'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Beaker,
  Blocks,
  Music,
  Camera,
  ArrowLeft,
  Play,
  Star,
  Clock,
  Users,
  Sparkles,
  BookOpen,
  Gamepad2,
  Brain,
  Target,
  Trophy,
} from 'lucide-react';

interface ExternalGame {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageRange: string;
  duration: string;
  players: string;
  type: 'simulation' | 'programming' | 'music' | 'ar' | 'traditional';
  url: string;
  tags: string[];
  rating: number;
  plays: number;
  icon: React.ReactNode;
  color: string;
  glassColor: string;
}

const externalGames: ExternalGame[] = [
  {
    id: 'phet-simulations',
    title: 'PhET Simulations',
    description: 'Simulaciones interactivas de física, química y matemáticas',
    difficulty: 'intermediate',
    ageRange: '8-18',
    duration: '15-45 min',
    players: '1',
    type: 'simulation',
    url: 'https://phet.colorado.edu/',
    tags: ['STEM', 'Simulación', 'Experimentos'],
    rating: 4.9,
    plays: 15420,
    icon: <Beaker className="w-8 h-8" />,
    color: 'from-blue-400 to-cyan-400',
    glassColor: 'bg-blue-100/20',
  },
  {
    id: 'blockly-programming',
    title: 'Blockly Games',
    description: 'Aprende programación con bloques visuales',
    difficulty: 'beginner',
    ageRange: '6-16',
    duration: '10-30 min',
    players: '1',
    type: 'programming',
    url: 'https://blockly.games/',
    tags: ['Programación', 'Lógica', 'Visual'],
    rating: 4.8,
    plays: 23150,
    icon: <Blocks className="w-8 h-8" />,
    color: 'from-green-400 to-emerald-400',
    glassColor: 'bg-green-100/20',
  },
  {
    id: 'music-blocks',
    title: 'Music Blocks',
    description: 'Crea música mientras aprendes matemáticas',
    difficulty: 'intermediate',
    ageRange: '8-16',
    duration: '20-60 min',
    players: '1',
    type: 'music',
    url: 'https://musicblocks.sugarlabs.org/',
    tags: ['Música', 'Matemáticas', 'Creatividad'],
    rating: 4.7,
    plays: 8934,
    icon: <Music className="w-8 h-8" />,
    color: 'from-purple-400 to-pink-400',
    glassColor: 'bg-purple-100/20',
  },
  {
    id: 'colonial-zone-ar',
    title: 'AR Zona Colonial',
    description: 'Explora la historia dominicana en realidad aumentada',
    difficulty: 'intermediate',
    ageRange: '10-18',
    duration: '30-60 min',
    players: '1-4',
    type: 'ar',
    url: '/colonial-rally',
    tags: ['Historia', 'AR', 'Cultura', 'RD'],
    rating: 4.9,
    plays: 5678,
    icon: <Camera className="w-8 h-8" />,
    color: 'from-amber-400 to-orange-400',
    glassColor: 'bg-amber-100/20',
  },
];

const curriculumGames: ExternalGame[] = [
  {
    id: 'forces-motion',
    title: 'Fuerzas y Movimiento',
    description: 'Conceptos de física para 3er grado',
    difficulty: 'beginner',
    ageRange: '8-10',
    duration: '20-30 min',
    players: '1',
    type: 'simulation',
    url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_es.html',
    tags: ['Física', 'Ciencias Naturales', '3ro'],
    rating: 4.8,
    plays: 6789,
    icon: <Target className="w-8 h-8" />,
    color: 'from-pink-400 to-rose-400',
    glassColor: 'bg-pink-100/20',
  },
  {
    id: 'fractions-intro',
    title: 'Introducción a Fracciones',
    description: 'Aprende fracciones visualmente',
    difficulty: 'beginner',
    ageRange: '8-12',
    duration: '15-25 min',
    players: '1',
    type: 'simulation',
    url: 'https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_es.html',
    tags: ['Matemáticas', 'Fracciones', '3ro-5to'],
    rating: 4.7,
    plays: 9876,
    icon: <Brain className="w-8 h-8" />,
    color: 'from-indigo-400 to-blue-400',
    glassColor: 'bg-indigo-100/20',
  },
];

const traditionalGames: ExternalGame[] = [
  {
    id: 'math-solver',
    title: 'Solucionador de Matemáticas',
    description: 'Resuelve problemas matemáticos paso a paso',
    difficulty: 'intermediate',
    ageRange: '10-16',
    duration: '10-20 min',
    players: '1',
    type: 'traditional',
    url: '/games/math-solver',
    tags: ['Matemáticas', 'Álgebra', 'Paso a paso'],
    rating: 4.6,
    plays: 12340,
    icon: <Trophy className="w-8 h-8" />,
    color: 'from-yellow-400 to-amber-400',
    glassColor: 'bg-yellow-100/20',
  },
  {
    id: 'code-challenge',
    title: 'Desafío de Código',
    description: 'Resuelve problemas de programación',
    difficulty: 'advanced',
    ageRange: '12-18',
    duration: '15-45 min',
    players: '1',
    type: 'traditional',
    url: '/games/code-challenge',
    tags: ['Programación', 'Algoritmos', 'Python'],
    rating: 4.5,
    plays: 8765,
    icon: <Gamepad2 className="w-8 h-8" />,
    color: 'from-teal-400 to-cyan-400',
    glassColor: 'bg-teal-100/20',
  },
];

export default function ExternalGamesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const type = searchParams.get('type');
  const game = searchParams.get('game');

  useEffect(() => {
    if (type) {
      setSelectedType(type);
    }
  }, [type]);

  // Handle specific game requests
  useEffect(() => {
    if (game) {
      // Redirect to appropriate demo or external game
      if (game === 'puzzle' && type === 'blockly') {
        // Redirect to Blockly puzzle game
        router.push('/games/blockly-puzzle');
      } else if (game === 'memory-cards') {
        router.push('/games/memory-cards');
      } else if (game === 'flashcards') {
        router.push('/games/flashcards');
      } else if (game === 'drag-drop') {
        router.push('/games/drag-drop');
      }
    }
  }, [game, type, router]);

  const allGames = [...externalGames, ...curriculumGames, ...traditionalGames];

  const filteredGames = allGames.filter((game) => {
    const typeMatch = selectedType === 'all' || game.type === selectedType;
    const difficultyMatch =
      selectedDifficulty === 'all' || game.difficulty === selectedDifficulty;
    return typeMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100/30 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100/30 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-100/30 text-red-700 border-red-200';
      default:
        return 'bg-gray-100/30 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return difficulty;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'simulation':
        return <Beaker className="w-5 h-5" />;
      case 'programming':
        return <Blocks className="w-5 h-5" />;
      case 'music':
        return <Music className="w-5 h-5" />;
      case 'ar':
        return <Camera className="w-5 h-5" />;
      case 'traditional':
        return <Gamepad2 className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'simulation':
        return 'Simulación';
      case 'programming':
        return 'Programación';
      case 'music':
        return 'Música';
      case 'ar':
        return 'Realidad Aumentada';
      case 'traditional':
        return 'Tradicional';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  Recursos Educativos
                </h1>
                <p className="text-gray-600 text-sm">
                  Más de 100 actividades educativas de alta calidad
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">100+</div>
                <div className="text-xs">Actividades</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">50K+</div>
                <div className="text-xs">Jugadas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">4.8★</div>
                <div className="text-xs">Calificación</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="container mx-auto px-6 py-6">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Tipo:</span>
              <div className="flex gap-2">
                {[
                  'all',
                  'simulation',
                  'programming',
                  'music',
                  'ar',
                  'traditional',
                ].map((t) => (
                  <Button
                    key={t}
                    variant={selectedType === t ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(t)}
                    className={`${
                      selectedType === t
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/50 text-gray-700 hover:bg-purple-100'
                    }`}
                  >
                    {t === 'all' ? 'Todos' : getTypeLabel(t)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Dificultad:
              </span>
              <div className="flex gap-2">
                {['all', 'beginner', 'intermediate', 'advanced'].map((d) => (
                  <Button
                    key={d}
                    variant={selectedDifficulty === d ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(d)}
                    className={`${
                      selectedDifficulty === d
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/50 text-gray-700 hover:bg-pink-100'
                    }`}
                  >
                    {d === 'all' ? 'Todas' : getDifficultyLabel(d)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              className={`group hover:scale-105 transition-all duration-300 cursor-pointer border-0 shadow-lg ${game.glassColor} backdrop-blur-sm`}
              onClick={() => {
                if (game.url.startsWith('http')) {
                  window.open(game.url, '_blank');
                } else {
                  router.push(game.url);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-3 rounded-xl ${game.color} text-white shadow-lg`}
                  >
                    {game.icon}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{game.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                  {game.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {game.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {getDifficultyLabel(game.difficulty)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-white/50 text-gray-700"
                    >
                      {getTypeIcon(game.type)}
                      <span className="ml-1">{getTypeLabel(game.type)}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {game.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {game.players}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {game.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-white/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {game.plays.toLocaleString()} jugadas
                    </span>
                    <Button
                      size="sm"
                      className={`bg-gradient-to-r ${game.color} text-white hover:opacity-90`}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Jugar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No se encontraron juegos</p>
              <p className="text-sm">Intenta cambiar los filtros</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
