'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Blocks,
  Play,
  Code,
  Target,
  Clock,
  Users,
  Star,
  Filter,
  Search,
  Trophy,
  Zap,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { BlocklyEditor, BLOCKLY_GAMES } from '@fuzzy/creative-tools';

export default function BlocklyGames() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterAge, setFilterAge] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const ageRanges = ['4-8', '6-12', '8-14', '10-16', '12-18'];

  // Filter games based on search and filters
  const filteredGames = Object.entries(BLOCKLY_GAMES).filter(([_, game]) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === 'all' || game.difficulty === filterDifficulty;
    const matchesAge =
      filterAge === 'all' ||
      (game.minAge <= parseInt(filterAge.split('-')[1]) &&
        game.maxAge >= parseInt(filterAge.split('-')[0]));

    return matchesSearch && matchesDifficulty && matchesAge;
  });

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleBack = () => {
    if (selectedGame) {
      setSelectedGame(null);
    } else {
      router.back();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return language === 'es' ? 'Principiante' : 'Beginner';
      case 'intermediate':
        return language === 'es' ? 'Intermedio' : 'Intermediate';
      case 'advanced':
        return language === 'es' ? 'Avanzado' : 'Advanced';
      default:
        return difficulty;
    }
  };

  if (selectedGame) {
    const game = BLOCKLY_GAMES[selectedGame];
    if (!game) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'es' ? 'Juego no encontrado' : 'Game not found'}
            </h1>
            <Button onClick={handleBack}>
              {language === 'es' ? 'Volver' : 'Back'}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'es' ? 'Volver' : 'Back'}
              </Button>
              <div className="flex items-center gap-3">
                <Blocks className="w-8 h-8 text-orange-600" />
                <div>
                  <h1 className="text-2xl font-bold">{game.title}</h1>
                  <p className="text-sm text-gray-600">Blockly Game</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Game Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Game */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    {language === 'es'
                      ? 'Juego de Programación'
                      : 'Programming Game'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BlocklyEditor
                    gameId={selectedGame}
                    studentId="demo-student"
                    onEvent={(event) => console.log('Blockly Event:', event)}
                    onComplete={(data) =>
                      console.log('Blockly Complete:', data)
                    }
                    onError={(error) => console.error('Blockly Error:', error)}
                    showInstructions={true}
                    autoStart={true}
                    language="es"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* Learning Objectives */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {language === 'es'
                      ? 'Objetivos de Aprendizaje'
                      : 'Learning Objectives'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {((game as any).learningObjectives || []).map(
                      (objective: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{objective}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Game Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    {language === 'es'
                      ? 'Información del Juego'
                      : 'Game Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">
                      {language === 'es' ? 'Dificultad:' : 'Difficulty:'}
                    </span>
                    <div className="mt-1">
                      <Badge className={getDifficultyColor(game.difficulty)}>
                        {getDifficultyLabel(game.difficulty)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      {language === 'es' ? 'Rango de edad:' : 'Age range:'}
                    </span>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {game.minAge}-{game.maxAge} años
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      {language === 'es'
                        ? 'Tiempo estimado:'
                        : 'Estimated time:'}
                    </span>
                    <div className="mt-1">
                      <Badge variant="outline">{game.estimatedTime}</Badge>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      {language === 'es' ? 'Conceptos:' : 'Concepts:'}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {((game as any).concepts || []).map(
                        (concept: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {concept}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Programming Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {language === 'es'
                      ? 'Consejos de Programación'
                      : 'Programming Tips'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p>
                      • Lee las instrucciones cuidadosamente antes de empezar
                    </p>
                    <p>• Piensa en la solución paso a paso</p>
                    <p>
                      • Usa bloques de repetición para evitar código repetitivo
                    </p>
                    <p>• Prueba tu solución con diferentes casos</p>
                    <p>
                      • No tengas miedo de experimentar con diferentes enfoques
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'es' ? 'Volver' : 'Back'}
            </Button>
            <div className="flex items-center gap-3">
              <Blocks className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'es' ? 'Juegos Blockly' : 'Blockly Games'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'es'
                    ? 'Aprende programación visual con juegos divertidos'
                    : 'Learn visual programming with fun games'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Blocks className="h-6 w-6" />
                {language === 'es' ? 'Acerca de Blockly' : 'About Blockly'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {language === 'es'
                  ? 'Blockly es una biblioteca de programación visual desarrollada por Google. Los juegos de Blockly enseñan conceptos de programación a través de bloques de colores que se conectan como piezas de rompecabezas.'
                  : 'Blockly is a visual programming library developed by Google. Blockly games teach programming concepts through colorful blocks that connect like puzzle pieces.'}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es'
                      ? 'Programación Visual'
                      : 'Visual Programming'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Aprende sin escribir código'
                      : 'Learn without writing code'}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es'
                      ? 'Progresión Gradual'
                      : 'Gradual Progression'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Desde principiante hasta avanzado'
                      : 'From beginner to advanced'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es'
                      ? 'Pensamiento Computacional'
                      : 'Computational Thinking'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Desarrolla habilidades de resolución de problemas'
                      : 'Develop problem-solving skills'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder={
                      language === 'es' ? 'Buscar juegos...' : 'Search games...'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">
                      {language === 'es'
                        ? 'Todas las dificultades'
                        : 'All difficulties'}
                    </option>
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {getDifficultyLabel(difficulty)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterAge}
                    onChange={(e) => setFilterAge(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">
                      {language === 'es' ? 'Todas las edades' : 'All ages'}
                    </option>
                    {ageRanges.map((age) => (
                      <option key={age} value={age}>
                        {age} años
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map(([gameId, game]) => (
            <Card
              key={gameId}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={() => handleGameSelect(gameId)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                    <Blocks className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{game.title}</h3>
                    <p className="text-sm text-gray-600">{game.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {((game as any).concepts || [])
                      .slice(0, 3)
                      .map((concept: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {concept}
                        </Badge>
                      ))}
                    {((game as any).concepts || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{((game as any).concepts || []).length - 3} más
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(game.difficulty)}>
                        {getDifficultyLabel(game.difficulty)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {game.minAge}-{game.maxAge} años
                      </Badge>
                    </div>

                    <Button size="sm" className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {language === 'es' ? 'Jugar' : 'Play'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{game.estimatedTime}</span>
                    <span>
                      {((game as any).learningObjectives || []).length}{' '}
                      objetivos
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Blocks className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {language === 'es'
                ? 'No se encontraron juegos'
                : 'No games found'}
            </h3>
            <p className="text-gray-500">
              {language === 'es'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Try adjusting your search filters'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
