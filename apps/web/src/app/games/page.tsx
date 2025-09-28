'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gamepad2,
  BookOpen,
  Music,
  Beaker,
  Brain,
  Blocks,
  Camera,
  Globe,
  Sparkles,
  Users,
  Clock,
  Trophy,
  Target,
  ChevronRight,
  Star,
  Play,
  ArrowRight,
  Heart,
  Zap,
  Shield,
} from 'lucide-react';

interface GameButton {
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
  glassColor: string;
  gradientColor: string;
  emoji: string;
}

interface DifficultyLevel {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  glassColor: string;
  games: GameButton[];
}

const difficultyLevels: DifficultyLevel[] = [
  {
    id: 'beginner',
    title: '🌱 Principiante',
    description: 'Perfecto para empezar tu aventura de aprendizaje',
    icon: <Heart className="w-8 h-8" />,
    color: 'from-green-400 to-emerald-400',
    glassColor: 'bg-green-100/20',
    games: [
      {
        id: 'blockly-programming',
        title: 'Blockly Games',
        description: 'Aprende programación con bloques visuales',
        difficulty: 'beginner',
        ageRange: '6-16',
        duration: '10-30 min',
        players: '1',
        type: 'programming',
        url: '/games/external?type=blockly',
        tags: ['Programación', 'Lógica', 'Visual'],
        rating: 4.8,
        plays: 23150,
        icon: <Blocks className="w-6 h-6" />,
        glassColor: 'bg-green-100/30',
        gradientColor: 'from-green-400 to-emerald-400',
        emoji: '🧩',
      },
      {
        id: 'forces-motion',
        title: 'Fuerzas y Movimiento',
        description: 'Conceptos de física para 3er grado',
        difficulty: 'beginner',
        ageRange: '8-10',
        duration: '20-30 min',
        players: '1',
        type: 'simulation',
        url: '/games/external?type=phet&sim=forces-and-motion-basics',
        tags: ['Física', 'Ciencias Naturales', '3ro'],
        rating: 4.8,
        plays: 6789,
        icon: <Target className="w-6 h-6" />,
        glassColor: 'bg-pink-100/30',
        gradientColor: 'from-pink-400 to-rose-400',
        emoji: '⚡',
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
        url: '/games/external?type=phet&sim=fractions-intro',
        tags: ['Matemáticas', 'Fracciones', '3ro-5to'],
        rating: 4.7,
        plays: 9876,
        icon: <Brain className="w-6 h-6" />,
        glassColor: 'bg-indigo-100/30',
        gradientColor: 'from-indigo-400 to-blue-400',
        emoji: '🔢',
      },
    ],
  },
  {
    id: 'intermediate',
    title: '🚀 Intermedio',
    description: 'Desafíos perfectos para seguir creciendo',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-yellow-400 to-orange-400',
    glassColor: 'bg-yellow-100/20',
    games: [
      {
        id: 'phet-simulations',
        title: 'PhET Simulations',
        description:
          'Simulaciones interactivas de física, química y matemáticas',
        difficulty: 'intermediate',
        ageRange: '8-18',
        duration: '15-45 min',
        players: '1',
        type: 'simulation',
        url: '/games/external?type=phet',
        tags: ['STEM', 'Simulación', 'Experimentos'],
        rating: 4.9,
        plays: 15420,
        icon: <Beaker className="w-6 h-6" />,
        glassColor: 'bg-blue-100/30',
        gradientColor: 'from-blue-400 to-cyan-400',
        emoji: '🧪',
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
        url: '/games/external?type=music',
        tags: ['Música', 'Matemáticas', 'Creatividad'],
        rating: 4.7,
        plays: 8934,
        icon: <Music className="w-6 h-6" />,
        glassColor: 'bg-purple-100/30',
        gradientColor: 'from-purple-400 to-pink-400',
        emoji: '🎵',
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
        url: '/games/external?type=ar',
        tags: ['Historia', 'AR', 'Cultura', 'RD'],
        rating: 4.9,
        plays: 5678,
        icon: <Camera className="w-6 h-6" />,
        glassColor: 'bg-amber-100/30',
        gradientColor: 'from-amber-400 to-orange-400',
        emoji: '📱',
      },
      {
        id: 'math-solver',
        title: 'Solucionador de Matemáticas',
        description: 'Resuelve problemas matemáticos paso a paso',
        difficulty: 'intermediate',
        ageRange: '10-16',
        duration: '10-20 min',
        players: '1',
        type: 'traditional',
        url: '/games/demo?game=math-solver',
        tags: ['Matemáticas', 'Álgebra', 'Paso a paso'],
        rating: 4.6,
        plays: 12340,
        icon: <Trophy className="w-6 h-6" />,
        glassColor: 'bg-yellow-100/30',
        gradientColor: 'from-yellow-400 to-amber-400',
        emoji: '🧮',
      },
    ],
  },
  {
    id: 'advanced',
    title: '🏆 Avanzado',
    description: 'Para los más valientes y experimentados',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-red-400 to-pink-400',
    glassColor: 'bg-red-100/20',
    games: [
      {
        id: 'code-challenge',
        title: 'Desafío de Código',
        description: 'Resuelve problemas de programación',
        difficulty: 'advanced',
        ageRange: '12-18',
        duration: '15-45 min',
        players: '1',
        type: 'traditional',
        url: '/games/demo?game=code-challenge',
        tags: ['Programación', 'Algoritmos', 'Python'],
        rating: 4.5,
        plays: 8765,
        icon: <Gamepad2 className="w-6 h-6" />,
        glassColor: 'bg-teal-100/30',
        gradientColor: 'from-teal-400 to-cyan-400',
        emoji: '💻',
      },
    ],
  },
];

export default function GamesPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const allGames = difficultyLevels.flatMap((level) => level.games);

  const filteredLevels =
    selectedLevel === 'all'
      ? difficultyLevels
      : difficultyLevels.filter((level) => level.id === selectedLevel);

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
        return <Beaker className="w-4 h-4" />;
      case 'programming':
        return <Blocks className="w-4 h-4" />;
      case 'music':
        return <Music className="w-4 h-4" />;
      case 'ar':
        return <Camera className="w-4 h-4" />;
      case 'traditional':
        return <Gamepad2 className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-500" />
                Centro de Juegos Educativos
              </h1>
              <p className="text-gray-600 mt-2">
                Más de 100 actividades educativas para aprender jugando
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">100+</div>
                <div className="text-sm text-gray-600">Actividades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">50K+</div>
                <div className="text-sm text-gray-600">Jugadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4.8★</div>
                <div className="text-sm text-gray-600">Calificación</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Level Selector */}
      <section className="container mx-auto px-6 py-6">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <Button
              variant={selectedLevel === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedLevel('all')}
              className={`${
                selectedLevel === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/50 text-gray-700 hover:bg-purple-100'
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Todos los Niveles
            </Button>
            {difficultyLevels.map((level) => (
              <Button
                key={level.id}
                variant={selectedLevel === level.id ? 'default' : 'outline'}
                onClick={() => setSelectedLevel(level.id)}
                className={`${
                  selectedLevel === level.id
                    ? `bg-gradient-to-r ${level.color} text-white`
                    : 'bg-white/50 text-gray-700 hover:bg-purple-100'
                }`}
              >
                {level.icon}
                <span className="ml-2">{level.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Difficulty Levels */}
      <section className="container mx-auto px-6 pb-12">
        {filteredLevels.map((level) => (
          <div key={level.id} className="mb-12">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-r ${level.color} text-white shadow-lg`}
                >
                  {level.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {level.title}
                  </h2>
                  <p className="text-gray-600">{level.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {level.games.map((game) => (
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
                        <div className="text-3xl">{game.emoji}</div>
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
                          <Badge
                            className={getDifficultyColor(game.difficulty)}
                          >
                            {getDifficultyLabel(game.difficulty)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-white/50 text-gray-700"
                          >
                            {getTypeIcon(game.type)}
                            <span className="ml-1">
                              {getTypeLabel(game.type)}
                            </span>
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
                            className={`bg-gradient-to-r ${game.gradientColor} text-white hover:opacity-90`}
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
            </div>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar tu aventura de aprendizaje?
          </h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Con más de 100 actividades educativas, desde simulaciones
            científicas hasta experiencias de realidad aumentada, nunca ha sido
            tan divertido aprender.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white/90 text-purple-600 hover:bg-white hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/games/external')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explorar Recursos Open Source
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/student')}
            >
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
