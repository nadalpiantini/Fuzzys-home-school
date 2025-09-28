'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Play
} from 'lucide-react';

interface GameCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  games: Game[];
  featured?: boolean;
}

interface Game {
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
}

const gameCategories: GameCategory[] = [
  {
    id: 'external-resources',
    title: '🌟 Recursos Open Source',
    description: 'Más de 100 actividades educativas de alta calidad',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    featured: true,
    games: [
      {
        id: 'phet-simulations',
        title: 'PhET Simulations',
        description: 'Simulaciones interactivas de física, química y matemáticas',
        difficulty: 'intermediate',
        ageRange: '8-18',
        duration: '15-45 min',
        players: '1',
        type: 'simulation',
        url: '/games/external?type=phet',
        tags: ['STEM', 'Simulación', 'Experimentos'],
        rating: 4.9,
        plays: 15420
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
        url: '/games/external?type=blockly',
        tags: ['Programación', 'Lógica', 'Visual'],
        rating: 4.8,
        plays: 23150
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
        plays: 8934
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
        plays: 5678
      }
    ]
  },
  {
    id: 'traditional-games',
    title: '🎮 Juegos Tradicionales',
    description: 'Nuestros juegos clásicos de aprendizaje',
    icon: <Gamepad2 className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    games: [
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
        plays: 12340
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
        url: '/games/demo?game=code-challenge',
        tags: ['Programación', 'Algoritmos', 'Python'],
        rating: 4.5,
        plays: 8765
      }
    ]
  },
  {
    id: 'curriculum-integrated',
    title: '📚 Integrado al Currículo',
    description: 'Actividades alineadas con el currículo dominicano',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
    games: [
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
        plays: 6789
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
        plays: 9876
      }
    ]
  }
];

export default function GamesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allGames = gameCategories.flatMap(category => category.games);
  const featuredGames = gameCategories
    .filter(cat => cat.featured)
    .flatMap(cat => cat.games)
    .slice(0, 4);

  const filteredCategories = selectedCategory === 'all'
    ? gameCategories
    : gameCategories.filter(cat => cat.id === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Gamepad2 className="w-8 h-8 text-purple-600" />
                Centro de Juegos Educativos
              </h1>
              <p className="text-gray-600 mt-2">
                Más de 100 actividades educativas para aprender jugando
              </p>
            </div>

            <div className="flex items-center gap-4">
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

      {/* Featured Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            ✨ Recursos Destacados - Open Source
          </h2>
          <p className="text-gray-600 mb-6">
            Descubre nuestra colección de recursos educativos de alta calidad,
            incluyendo simulaciones PhET, programación Blockly, música creativa y experiencias AR.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.map((game) => (
              <Card key={game.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {getDifficultyLabel(game.difficulty)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {game.rating}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                    {game.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
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
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => router.push(game.url)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Jugar Ahora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-500" />
          🚀 Acceso Rápido por Tipo
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            onClick={() => router.push('/games/external?type=phet')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="w-5 h-5" />
                PhET Simulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 text-sm mb-3">
                20+ simulaciones interactivas de ciencias
              </p>
              <Button className="bg-white text-blue-600 hover:bg-gray-100 w-full">
                Explorar →
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white"
            onClick={() => router.push('/games/external?type=blockly')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Blocks className="w-5 h-5" />
                Blockly Programming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100 text-sm mb-3">
                Programación visual para todas las edades
              </p>
              <Button className="bg-white text-green-600 hover:bg-gray-100 w-full">
                Programar →
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white"
            onClick={() => router.push('/games/external?type=music')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Music Blocks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 text-sm mb-3">
                Música creativa con matemáticas
              </p>
              <Button className="bg-white text-purple-600 hover:bg-gray-100 w-full">
                Crear →
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            onClick={() => router.push('/games/external?type=ar')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                AR Zona Colonial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-100 text-sm mb-3">
                Historia dominicana en realidad aumentada
              </p>
              <Button className="bg-white text-amber-600 hover:bg-gray-100 w-full">
                Explorar →
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* All Categories */}
      <section className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">📚 Todas las Categorías</h2>

        {filteredCategories.map((category) => (
          <div key={category.id} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {category.icon}
                {category.title}
              </h3>
              <Button variant="outline" size="sm">
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <p className="text-gray-600 mb-4">{category.description}</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.games.map((game) => (
                <Card key={game.id} className="hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(game.difficulty)}>
                        {getDifficultyLabel(game.difficulty)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {game.rating}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                      {game.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>📅 {game.ageRange} años</span>
                        <span>⏱️ {game.duration}</span>
                        <span>👥 {game.players}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {game.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
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
                          onClick={() => router.push(game.url)}
                        >
                          Jugar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar tu aventura de aprendizaje?
          </h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Con más de 100 actividades educativas, desde simulaciones científicas hasta
            experiencias de realidad aumentada, nunca ha sido tan divertido aprender.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => router.push('/games/external')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explorar Recursos Open Source
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600"
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