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

const gradeLevels: DifficultyLevel[] = [
  {
    id: 'prek-2',
    title: '🌱 Pre-K a 2do Grado',
    description: 'Aprendizaje básico con juegos divertidos',
    icon: <Heart className="w-8 h-8" />,
    color: 'from-amber-300 to-orange-300',
    glassColor: 'bg-amber-50/30',
    games: [
      {
        id: 'blockly-programming',
        title: 'Blockly Games',
        description: 'Programación visual para niños pequeños',
        difficulty: 'beginner',
        ageRange: '4-8',
        duration: '10-20 min',
        players: '1',
        type: 'programming',
        url: '/games/external?type=blockly',
        tags: ['Programación', 'Lógica', 'Visual'],
        rating: 4.8,
        plays: 23150,
        icon: <Blocks className="w-6 h-6" />,
        glassColor: 'bg-amber-50/40',
        gradientColor: 'from-amber-300 to-orange-300',
        emoji: '🧩',
      },
      {
        id: 'fractions-intro',
        title: 'Fracciones Básicas',
        description: 'Aprende fracciones con visuales',
        difficulty: 'beginner',
        ageRange: '6-8',
        duration: '15-20 min',
        players: '1',
        type: 'simulation',
        url: '/games/external?type=phet&sim=fractions-intro',
        tags: ['Matemáticas', 'Fracciones', 'Básico'],
        rating: 4.7,
        plays: 9876,
        icon: <Brain className="w-6 h-6" />,
        glassColor: 'bg-orange-50/40',
        gradientColor: 'from-orange-300 to-red-300',
        emoji: '🔢',
      },
    ],
  },
  {
    id: 'grades-3-5',
    title: '🌿 3ro a 5to Grado',
    description: 'Conceptos fundamentales de ciencias y matemáticas',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-green-400 to-teal-400',
    glassColor: 'bg-green-50/30',
    games: [
      {
        id: 'forces-motion',
        title: 'Fuerzas y Movimiento',
        description: 'Conceptos básicos de física',
        difficulty: 'beginner',
        ageRange: '8-11',
        duration: '20-30 min',
        players: '1',
        type: 'simulation',
        url: '/games/external?type=phet&sim=forces-and-motion-basics',
        tags: ['Física', 'Ciencias', '3ro-5to'],
        rating: 4.8,
        plays: 6789,
        icon: <Target className="w-6 h-6" />,
        glassColor: 'bg-green-50/40',
        gradientColor: 'from-green-400 to-teal-400',
        emoji: '⚡',
      },
      {
        id: 'phet-simulations',
        title: 'PhET Simulations',
        description: 'Simulaciones científicas interactivas',
        difficulty: 'intermediate',
        ageRange: '8-12',
        duration: '15-30 min',
        players: '1',
        type: 'simulation',
        url: '/games/external?type=phet',
        tags: ['STEM', 'Simulación', 'Ciencias'],
        rating: 4.9,
        plays: 15420,
        icon: <Beaker className="w-6 h-6" />,
        glassColor: 'bg-teal-50/40',
        gradientColor: 'from-teal-400 to-cyan-400',
        emoji: '🧪',
      },
      {
        id: 'music-blocks',
        title: 'Music Blocks',
        description: 'Música y matemáticas juntas',
        difficulty: 'intermediate',
        ageRange: '8-12',
        duration: '20-40 min',
        players: '1',
        type: 'music',
        url: '/games/external?type=music',
        tags: ['Música', 'Matemáticas', 'Creatividad'],
        rating: 4.7,
        plays: 8934,
        icon: <Music className="w-6 h-6" />,
        glassColor: 'bg-cyan-50/40',
        gradientColor: 'from-cyan-400 to-blue-400',
        emoji: '🎵',
      },
    ],
  },
  {
    id: 'grades-6-8',
    title: '🌳 6to a 8vo Grado',
    description: 'Desafíos intermedios para estudiantes',
    icon: <Trophy className="w-8 h-8" />,
    color: 'from-blue-400 to-indigo-400',
    glassColor: 'bg-blue-50/30',
    games: [
      {
        id: 'math-solver',
        title: 'Solucionador de Matemáticas',
        description: 'Álgebra y geometría paso a paso',
        difficulty: 'intermediate',
        ageRange: '11-14',
        duration: '15-25 min',
        players: '1',
        type: 'traditional',
        url: '/games/demo?game=math-solver',
        tags: ['Matemáticas', 'Álgebra', 'Geometría'],
        rating: 4.6,
        plays: 12340,
        icon: <Trophy className="w-6 h-6" />,
        glassColor: 'bg-blue-50/40',
        gradientColor: 'from-blue-400 to-indigo-400',
        emoji: '🧮',
      },
      {
        id: 'colonial-zone-ar',
        title: 'AR Zona Colonial',
        description: 'Historia dominicana en realidad aumentada',
        difficulty: 'intermediate',
        ageRange: '12-15',
        duration: '30-45 min',
        players: '1-4',
        type: 'ar',
        url: '/games/external?type=ar',
        tags: ['Historia', 'AR', 'Cultura', 'RD'],
        rating: 4.9,
        plays: 5678,
        icon: <Camera className="w-6 h-6" />,
        glassColor: 'bg-indigo-50/40',
        gradientColor: 'from-indigo-400 to-purple-400',
        emoji: '📱',
      },
    ],
  },
  {
    id: 'grades-9-12',
    title: '🏔️ 9no a 12mo Grado',
    description: 'Desafíos avanzados para preparación universitaria',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-purple-400 to-pink-400',
    glassColor: 'bg-purple-50/30',
    games: [
      {
        id: 'code-challenge',
        title: 'Desafío de Código',
        description: 'Programación avanzada y algoritmos',
        difficulty: 'advanced',
        ageRange: '14-18',
        duration: '20-45 min',
        players: '1',
        type: 'traditional',
        url: '/games/demo?game=code-challenge',
        tags: ['Programación', 'Algoritmos', 'Python'],
        rating: 4.5,
        plays: 8765,
        icon: <Gamepad2 className="w-6 h-6" />,
        glassColor: 'bg-purple-50/40',
        gradientColor: 'from-purple-400 to-pink-400',
        emoji: '💻',
      },
    ],
  },
];

export default function GamesPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const allGames = gradeLevels.flatMap((level) => level.games);

  const filteredLevels =
    selectedLevel === 'all'
      ? gradeLevels
      : gradeLevels.filter((level) => level.id === selectedLevel);

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-amber-500" />
                Juegos por Grados
              </h1>
              <p className="text-gray-600 mt-2">
                Actividades organizadas por nivel educativo
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">4</div>
                <div className="text-sm text-gray-600">Niveles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">8</div>
                <div className="text-sm text-gray-600">Juegos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">4.8★</div>
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
              Todos los Grados
            </Button>
            {gradeLevels.map((level) => (
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
      <section className="bg-gradient-to-r from-amber-500/80 to-orange-500/80 backdrop-blur-sm text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar tu aventura de aprendizaje?
          </h2>
          <p className="text-amber-100 mb-8 max-w-2xl mx-auto">
            Actividades organizadas por grados escolares, desde Pre-K hasta 12mo
            grado. Aprende jugando con contenido adaptado a tu nivel educativo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white/90 text-amber-600 hover:bg-white hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/games/external')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explorar Todos los Juegos
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
