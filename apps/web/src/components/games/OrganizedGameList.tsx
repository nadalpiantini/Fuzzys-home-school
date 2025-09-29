'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Target,
  Play,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Game {
  id: string;
  title: string;
  subject: string;
  grade: string;
  content: {
    type: string;
    difficulty: string;
    theme: string;
    metadata?: {
      estimatedTime: string;
      learningObjectives: string[];
    };
  };
  status: string;
  source: string;
}

interface OrganizedGames {
  [subject: string]: {
    [grade: string]: Game[];
  };
}

const subjectIcons = {
  ciencias: <Beaker className="w-5 h-5" />,
  matemáticas: <Calculator className="w-5 h-5" />,
  historia: <Globe className="w-5 h-5" />,
  español: <BookOpen className="w-5 h-5" />,
  science: <Beaker className="w-5 h-5" />,
  math: <Calculator className="w-5 h-5" />,
  history: <Globe className="w-5 h-5" />,
  language: <BookOpen className="w-5 h-5" />,
};

const subjectColors = {
  ciencias: 'bg-green-100 text-green-800 border-green-200',
  matemáticas: 'bg-blue-100 text-blue-800 border-blue-200',
  historia: 'bg-purple-100 text-purple-800 border-purple-200',
  español: 'bg-orange-100 text-orange-800 border-orange-200',
  science: 'bg-green-100 text-green-800 border-green-200',
  math: 'bg-blue-100 text-blue-800 border-blue-200',
  history: 'bg-purple-100 text-purple-800 border-purple-200',
  language: 'bg-orange-100 text-orange-800 border-orange-200',
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

const difficultyLabels = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
};

const gameTypeLabels = {
  hotspot: 'Identifica',
  quiz: 'Preguntas',
  dragdrop: 'Arrastra',
  truefalse: 'Verdadero/Falso',
  crossword: 'Crucigrama',
  memory: 'Memoria',
  timeline: 'Línea de Tiempo',
};

export default function OrganizedGameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [organizedGames, setOrganizedGames] = useState<OrganizedGames>({});
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    organizeGames();
  }, [games]);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeGames = () => {
    const organized: OrganizedGames = {};

    games.forEach((game) => {
      if (!organized[game.subject]) {
        organized[game.subject] = {};
      }
      if (!organized[game.subject][game.grade]) {
        organized[game.subject][game.grade] = [];
      }
      organized[game.subject][game.grade].push(game);
    });

    setOrganizedGames(organized);
  };

  const getFilteredGames = () => {
    if (selectedSubject === 'all' && selectedGrade === 'all') {
      return games;
    }

    return games.filter((game) => {
      const subjectMatch =
        selectedSubject === 'all' || game.subject === selectedSubject;
      const gradeMatch =
        selectedGrade === 'all' || game.grade === selectedGrade;
      return subjectMatch && gradeMatch;
    });
  };

  const getSubjects = () => {
    return Array.from(new Set(games.map((game) => game.subject)));
  };

  const getGrades = () => {
    return Array.from(new Set(games.map((game) => game.grade))).sort();
  };

  const handleGameClick = (game: Game) => {
    // Redirigir al juego específico
    window.location.href = `/games/${game.content.type}?id=${game.id}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-2">Cargando juegos...</span>
      </div>
    );
  }

  const filteredGames = getFilteredGames();

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Materia:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">Todas</option>
            {getSubjects().map((subject) => (
              <option key={subject} value={subject}>
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Grado:</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">Todos</option>
            {getGrades().map((grade) => (
              <option key={grade} value={grade}>
                Grado {grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de juegos organizados */}
      {selectedSubject === 'all' ? (
        // Vista por materias
        Object.entries(organizedGames).map(([subject, grades]) => (
          <div key={subject} className="space-y-4">
            <div className="flex items-center gap-2">
              {subjectIcons[subject as keyof typeof subjectIcons]}
              <h2 className="text-xl font-bold">
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </h2>
              <Badge
                className={subjectColors[subject as keyof typeof subjectColors]}
              >
                {Object.keys(grades).length} grados
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(grades).map(([grade, gradeGames]) => (
                <Card
                  key={`${subject}-${grade}`}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Grado {grade}</CardTitle>
                    <Badge variant="outline" className="w-fit">
                      {gradeGames.length} juegos
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {gradeGames.slice(0, 3).map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">
                            {game.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={
                                difficultyColors[
                                  game.content
                                    .difficulty as keyof typeof difficultyColors
                                ]
                              }
                            >
                              {
                                difficultyLabels[
                                  game.content
                                    .difficulty as keyof typeof difficultyLabels
                                ]
                              }
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {
                                gameTypeLabels[
                                  game.content
                                    .type as keyof typeof gameTypeLabels
                                ]
                              }
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleGameClick(game)}
                          className="ml-2"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {gradeGames.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{gradeGames.length - 3} más
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        // Vista filtrada
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <Card key={game.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {subjectIcons[game.subject as keyof typeof subjectIcons]}
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      subjectColors[game.subject as keyof typeof subjectColors]
                    }
                  >
                    {game.subject.charAt(0).toUpperCase() +
                      game.subject.slice(1)}
                  </Badge>
                  <Badge variant="outline">Grado {game.grade}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      difficultyColors[
                        game.content.difficulty as keyof typeof difficultyColors
                      ]
                    }
                  >
                    {
                      difficultyLabels[
                        game.content.difficulty as keyof typeof difficultyLabels
                      ]
                    }
                  </Badge>
                  <Badge variant="outline">
                    {
                      gameTypeLabels[
                        game.content.type as keyof typeof gameTypeLabels
                      ]
                    }
                  </Badge>
                </div>

                {game.content.metadata?.estimatedTime && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {game.content.metadata.estimatedTime}
                  </div>
                )}

                {game.content.metadata?.learningObjectives && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Objetivos:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {game.content.metadata.learningObjectives
                        .slice(0, 2)
                        .map((objective, index) => (
                          <li key={index} className="text-xs">
                            {objective}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {game.status === 'ready' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {game.status === 'ready' ? 'Listo' : 'En proceso'}
                    </span>
                  </div>
                  <Button onClick={() => handleGameClick(game)}>
                    <Play className="w-4 h-4 mr-1" />
                    Jugar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredGames.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No se encontraron juegos con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  );
}
