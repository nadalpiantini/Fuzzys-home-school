'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
    id: 'blockly-music',
    title: 'Blockly Music',
    description: 'Crea música con programación visual',
    difficulty: 'beginner',
    ageRange: '6-16',
    duration: '15-30 min',
    players: '1',
    type: 'programming',
    url: 'https://blockly.games/music?lang=es',
    tags: ['Programación', 'Música', 'Creatividad'],
    rating: 4.7,
    plays: 12340,
    icon: <Music className="w-8 h-8" />,
    color: 'from-purple-400 to-pink-400',
    glassColor: 'bg-purple-100/20',
  },
  {
    id: 'blockly-movie',
    title: 'Blockly Movie',
    description: 'Crea animaciones con programación visual',
    difficulty: 'intermediate',
    ageRange: '8-16',
    duration: '20-40 min',
    players: '1',
    type: 'programming',
    url: 'https://blockly.games/movie?lang=es',
    tags: ['Programación', 'Animación', 'Creatividad'],
    rating: 4.6,
    plays: 9876,
    icon: <Camera className="w-8 h-8" />,
    color: 'from-cyan-400 to-blue-400',
    glassColor: 'bg-cyan-100/20',
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
  {
    id: 'live-quiz',
    title: 'Quiz en Vivo',
    description: 'Participa en quizzes interactivos en tiempo real',
    difficulty: 'intermediate',
    ageRange: '8-16',
    duration: '10-20 min',
    players: '1-50',
    type: 'traditional',
    url: '/games/live-quiz',
    tags: ['Quiz', 'Interactivo', 'Tiempo Real'],
    rating: 4.7,
    plays: 15670,
    icon: <Brain className="w-8 h-8" />,
    color: 'from-indigo-400 to-purple-400',
    glassColor: 'bg-indigo-100/20',
  },
  {
    id: 'mind-map',
    title: 'Mapa Mental',
    description: 'Crea mapas mentales interactivos',
    difficulty: 'beginner',
    ageRange: '6-16',
    duration: '15-30 min',
    players: '1',
    type: 'traditional',
    url: '/games/mind-map',
    tags: ['Creatividad', 'Organización', 'Visual'],
    rating: 4.6,
    plays: 9876,
    icon: <Target className="w-8 h-8" />,
    color: 'from-pink-400 to-rose-400',
    glassColor: 'bg-pink-100/20',
  },
  {
    id: 'branching-scenario',
    title: 'Escenario Ramificado',
    description: 'Toma decisiones y ve las consecuencias',
    difficulty: 'intermediate',
    ageRange: '10-18',
    duration: '20-40 min',
    players: '1',
    type: 'traditional',
    url: '/games/branching-scenario',
    tags: ['Decisión', 'Historia', 'Consecuencias'],
    rating: 4.8,
    plays: 11234,
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-emerald-400 to-teal-400',
    glassColor: 'bg-emerald-100/20',
  },
  {
    id: 'team-challenge',
    title: 'Desafío en Equipo',
    description: 'Colabora con otros estudiantes en desafíos',
    difficulty: 'intermediate',
    ageRange: '8-16',
    duration: '30-60 min',
    players: '2-6',
    type: 'traditional',
    url: '/games/team-challenge',
    tags: ['Colaboración', 'Equipo', 'Desafío'],
    rating: 4.9,
    plays: 8765,
    icon: <Users className="w-8 h-8" />,
    color: 'from-orange-400 to-red-400',
    glassColor: 'bg-orange-100/20',
  },
  {
    id: 'match',
    title: 'Juego de Emparejamiento',
    description: 'Empareja conceptos y mejora tu memoria',
    difficulty: 'beginner',
    ageRange: '6-12',
    duration: '5-15 min',
    players: '1',
    type: 'traditional',
    url: '/games/match',
    tags: ['Memoria', 'Emparejamiento', 'Rápido'],
    rating: 4.5,
    plays: 18765,
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-violet-400 to-purple-400',
    glassColor: 'bg-violet-100/20',
  },
  {
    id: 'true-false',
    title: 'Verdadero o Falso',
    description: 'Responde preguntas de verdadero o falso',
    difficulty: 'beginner',
    ageRange: '6-16',
    duration: '5-10 min',
    players: '1',
    type: 'traditional',
    url: '/games/true-false',
    tags: ['Rápido', 'Conocimiento', 'Decisión'],
    rating: 4.4,
    plays: 22340,
    icon: <Target className="w-8 h-8" />,
    color: 'from-green-400 to-emerald-400',
    glassColor: 'bg-green-100/20',
  },
  {
    id: 'research-methods',
    title: 'Métodos de Investigación',
    description: 'Aprende técnicas de investigación científica',
    difficulty: 'advanced',
    ageRange: '12-18',
    duration: '30-60 min',
    players: '1',
    type: 'traditional',
    url: '/games/research-methods',
    tags: ['Ciencia', 'Investigación', 'Método'],
    rating: 4.7,
    plays: 5432,
    icon: <Beaker className="w-8 h-8" />,
    color: 'from-blue-400 to-indigo-400',
    glassColor: 'bg-blue-100/20',
  },
  {
    id: 'critical-thinking',
    title: 'Pensamiento Crítico',
    description: 'Desarrolla habilidades de análisis y razonamiento',
    difficulty: 'intermediate',
    ageRange: '10-18',
    duration: '20-40 min',
    players: '1',
    type: 'traditional',
    url: '/games/critical-thinking',
    tags: ['Análisis', 'Razonamiento', 'Lógica'],
    rating: 4.8,
    plays: 7654,
    icon: <Brain className="w-8 h-8" />,
    color: 'from-purple-400 to-pink-400',
    glassColor: 'bg-purple-100/20',
  },
  {
    id: 'leadership',
    title: 'Liderazgo',
    description: 'Desarrolla habilidades de liderazgo y trabajo en equipo',
    difficulty: 'intermediate',
    ageRange: '12-18',
    duration: '25-50 min',
    players: '1-4',
    type: 'traditional',
    url: '/games/leadership',
    tags: ['Liderazgo', 'Equipo', 'Habilidades'],
    rating: 4.6,
    plays: 4321,
    icon: <Trophy className="w-8 h-8" />,
    color: 'from-amber-400 to-yellow-400',
    glassColor: 'bg-amber-100/20',
  },
];

function ExternalGamesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isClient, setIsClient] = useState(false);

  const type = searchParams.get('type');
  const game = searchParams.get('game');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && type) {
      setSelectedType(type);
    }
  }, [type, isClient]);

  // Handle specific game requests
  useEffect(() => {
    if (isClient && game) {
      // Handle Blockly games - redirect to actual Blockly URLs
      if (type === 'blockly') {
        let blocklyUrl = '';
        switch (game) {
          case 'puzzle':
            blocklyUrl = 'https://blockly.games/puzzle?lang=es';
            break;
          case 'maze':
            blocklyUrl = 'https://blockly.games/maze?lang=es';
            break;
          case 'bird':
            blocklyUrl = 'https://blockly.games/bird?lang=es';
            break;
          case 'turtle':
            blocklyUrl = 'https://blockly.games/turtle?lang=es';
            break;
          case 'movie':
            blocklyUrl = 'https://blockly.games/movie?lang=es';
            break;
          case 'music':
            blocklyUrl = 'https://blockly.games/music?lang=es';
            break;
          default:
            blocklyUrl = 'https://blockly.games/?lang=es';
        }
        window.location.href = blocklyUrl;
        return;
      }

      // Handle PhET simulations
      if (type === 'phet') {
        let phetUrl = 'https://phet.colorado.edu/es/simulations';
        if (game) {
          phetUrl = `https://phet.colorado.edu/es/simulations/filter?subjects=physics,chemistry,math,earth-science,biology`;
        }
        window.location.href = phetUrl;
        return;
      }

      // Handle internal game redirects
      const internalGames: { [key: string]: string } = {
        'memory-cards': '/games/memory-cards',
        'flashcards': '/games/flashcards',
        'drag-drop': '/games/drag-drop',
        'crossword': '/games/crossword',
        'word-search': '/games/word-search',
        'gap-fill': '/games/gap-fill',
        'hotspot': '/games/hotspot',
        'timeline': '/games/timeline',
        'image-sequence': '/games/image-sequence',
        'short-answer': '/games/short-answer',
        'math-solver': '/games/math-solver',
        'code-challenge': '/games/code-challenge',
        'branching-scenario': '/games/branching-scenario',
        'mind-map': '/games/mind-map',
        'live-quiz': '/games/live-quiz',
        'team-challenge': '/games/team-challenge',
        'match': '/games/match',
        'true-false': '/games/true-false',
        'research-methods': '/games/research-methods',
        'critical-thinking': '/games/critical-thinking',
        'leadership': '/games/leadership',
      };

      if (internalGames[game]) {
        router.push(internalGames[game]);
        return;
      }

      // Handle AR games
      if (type === 'ar') {
        router.push('/colonial-rally');
        return;
      }

      // Default behavior - filter by type
      setSelectedType(type || 'all');
    }
  }, [game, type, router, isClient]);

  const allGames = [...externalGames, ...curriculumGames, ...traditionalGames];

  const filteredGames = allGames.filter((gameItem) => {
    const typeMatch = selectedType === 'all' || gameItem.type === selectedType;
    const difficultyMatch =
      selectedDifficulty === 'all' ||
      gameItem.difficulty === selectedDifficulty;

    // If specific game is requested, filter by game ID or title
    let gameMatch = true;
    if (game) {
      gameMatch =
        gameItem.id.includes(game) ||
        gameItem.title.toLowerCase().includes(game.toLowerCase()) ||
        gameItem.tags.some((tag) =>
          tag.toLowerCase().includes(game.toLowerCase()),
        );
    }

    return typeMatch && difficultyMatch && gameMatch;
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

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando recursos educativos...</p>
        </div>
      </div>
    );
  }

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

export default function ExternalGamesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <ExternalGamesContent />
    </Suspense>
  );
}
