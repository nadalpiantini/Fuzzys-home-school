'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Music,
  Play,
  Target,
  Clock,
  Users,
  Star,
  Filter,
  Search,
  Zap,
  Palette,
  Volume2,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { MusicBlocksEditor, MUSIC_ACTIVITIES } from '@fuzzy/creative-tools';

export default function MusicBlocksGames() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterAge, setFilterAge] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [freePlayMode, setFreePlayMode] = useState(false);

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const ageRanges = ['6-12', '8-14', '10-16', '12-18'];

  // Filter activities based on search and filters
  const filteredActivities = Object.entries(MUSIC_ACTIVITIES).filter(
    ([_, activity]) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        filterDifficulty === 'all' || activity.difficulty === filterDifficulty;
      const matchesAge =
        filterAge === 'all' ||
        (activity.ageRange[0] <= parseInt(filterAge.split('-')[1]) &&
          activity.ageRange[1] >= parseInt(filterAge.split('-')[0]));

      return matchesSearch && matchesDifficulty && matchesAge;
    },
  );

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
  };

  const handleFreePlay = () => {
    setFreePlayMode(true);
    setSelectedActivity('free-play');
  };

  const handleBack = () => {
    if (selectedActivity) {
      setSelectedActivity(null);
      setFreePlayMode(false);
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

  if (selectedActivity) {
    const isFreePlay = freePlayMode && selectedActivity === 'free-play';

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
                <Music className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold">
                    {isFreePlay
                      ? language === 'es'
                        ? 'Music Blocks - Modo Libre'
                        : 'Music Blocks - Free Play'
                      : MUSIC_ACTIVITIES[selectedActivity]?.title ||
                        'Music Blocks'}
                  </h1>
                  <p className="text-sm text-gray-600">Music Blocks Activity</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Activity Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Music Blocks Editor */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    {language === 'es' ? 'Editor de Música' : 'Music Editor'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MusicBlocksEditor
                    activityId={isFreePlay ? undefined : selectedActivity}
                    studentId="demo-student"
                    onEvent={(event) =>
                      console.log('Music Blocks Event:', event)
                    }
                    onComplete={(data) =>
                      console.log('Music Blocks Complete:', data)
                    }
                    onError={(error) =>
                      console.error('Music Blocks Error:', error)
                    }
                    showInstructions={!isFreePlay}
                    freePlay={isFreePlay}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            {!isFreePlay && (
              <div className="space-y-6">
                {/* Activity Info */}
                {(() => {
                  const activity = MUSIC_ACTIVITIES[selectedActivity];
                  if (!activity) return null;

                  return (
                    <>
                      {/* Learning Concepts */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            {language === 'es'
                              ? 'Conceptos de Aprendizaje'
                              : 'Learning Concepts'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <span className="font-medium text-gray-700 text-sm">
                                {language === 'es'
                                  ? 'Conceptos musicales:'
                                  : 'Musical concepts:'}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {activity.musicConcepts.map(
                                  (concept, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      🎵 {concept}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>

                            <div>
                              <span className="font-medium text-gray-700 text-sm">
                                {language === 'es'
                                  ? 'Conceptos matemáticos:'
                                  : 'Mathematical concepts:'}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {activity.mathConcepts.map((concept, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    🔢 {concept}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Activity Info */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Music className="w-5 h-5" />
                            {language === 'es'
                              ? 'Información de la Actividad'
                              : 'Activity Information'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <span className="font-medium text-gray-700">
                              {language === 'es'
                                ? 'Dificultad:'
                                : 'Difficulty:'}
                            </span>
                            <div className="mt-1">
                              <Badge
                                className={getDifficultyColor(
                                  activity.difficulty,
                                )}
                              >
                                {getDifficultyLabel(activity.difficulty)}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">
                              {language === 'es'
                                ? 'Rango de edad:'
                                : 'Age range:'}
                            </span>
                            <div className="mt-1">
                              <Badge variant="outline">
                                {activity.ageRange[0]}-{activity.ageRange[1]}{' '}
                                años
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
                              <Badge variant="outline">
                                {activity.estimatedTime}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Instructions */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="w-5 h-5" />
                            {language === 'es'
                              ? 'Instrucciones'
                              : 'Instructions'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ol className="space-y-2 text-sm">
                            {activity.instructions.map((instruction, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </span>
                                <span>{instruction}</span>
                              </li>
                            ))}
                          </ol>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Free Play Info */}
            {isFreePlay && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      {language === 'es'
                        ? 'Modo de Exploración Libre'
                        : 'Free Exploration Mode'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {language === 'es'
                        ? 'Explora Music Blocks sin restricciones. Crea música, experimenta con sonidos y descubre la conexión entre matemáticas y música.'
                        : 'Explore Music Blocks without restrictions. Create music, experiment with sounds and discover the connection between mathematics and music.'}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>• No hay objetivos específicos</p>
                      <p>• Experimenta libremente</p>
                      <p>• Descubre tu creatividad</p>
                      <p>• Aprende a tu propio ritmo</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      {language === 'es'
                        ? 'Consejos Musicales'
                        : 'Musical Tips'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p>• Comienza con ritmos simples</p>
                      <p>• Escucha tu creación frecuentemente</p>
                      <p>• Experimenta con diferentes instrumentos</p>
                      <p>• Combina ritmo y melodía</p>
                      <p>• Las matemáticas están en la música</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
              <Music className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'es' ? 'Music Blocks' : 'Music Blocks'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'es'
                    ? 'Crea música usando programación visual'
                    : 'Create music using visual programming'}
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
                <Music className="h-6 w-6" />
                {language === 'es'
                  ? 'Acerca de Music Blocks'
                  : 'About Music Blocks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {language === 'es'
                  ? 'Music Blocks es una herramienta de Sugar Labs que combina programación visual con creación musical. Los estudiantes pueden crear música usando bloques de código, explorando la conexión entre matemáticas, programación y arte.'
                  : 'Music Blocks is a Sugar Labs tool that combines visual programming with musical creation. Students can create music using code blocks, exploring the connection between mathematics, programming and art.'}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es'
                      ? 'Música y Matemáticas'
                      : 'Music and Math'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Explora fracciones, patrones y secuencias'
                      : 'Explore fractions, patterns and sequences'}
                  </p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es' ? 'Creatividad' : 'Creativity'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Composición libre y experimentación'
                      : 'Free composition and experimentation'}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es'
                      ? 'Programación Visual'
                      : 'Visual Programming'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Aprende programación sin código'
                      : 'Learn programming without code'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Free Play Option */}
        <div className="mb-8">
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {language === 'es'
                        ? 'Modo de Exploración Libre'
                        : 'Free Exploration Mode'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'es'
                        ? 'Explora Music Blocks sin restricciones y descubre tu creatividad'
                        : 'Explore Music Blocks without restrictions and discover your creativity'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleFreePlay}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Explorar Libremente' : 'Explore Freely'}
                </Button>
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
                      language === 'es'
                        ? 'Buscar actividades...'
                        : 'Search activities...'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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

        {/* Activities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map(([activityId, activity]) => (
            <Card
              key={activityId}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={() => handleActivitySelect(activityId)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-2xl">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{activity.title}</h3>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {activity.musicConcepts
                      .slice(0, 2)
                      .map((concept, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          🎵 {concept}
                        </Badge>
                      ))}
                    {activity.musicConcepts.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{activity.musicConcepts.length - 2} más
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getDifficultyColor(activity.difficulty)}
                      >
                        {getDifficultyLabel(activity.difficulty)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {activity.ageRange[0]}-{activity.ageRange[1]} años
                      </Badge>
                    </div>

                    <Button size="sm" className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {language === 'es' ? 'Comenzar' : 'Start'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{activity.estimatedTime}</span>
                    <span>{activity.instructions.length} pasos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {language === 'es'
                ? 'No se encontraron actividades'
                : 'No activities found'}
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
