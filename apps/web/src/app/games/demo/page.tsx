'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Brain,
  Target,
  Zap,
  BookOpen,
  Calculator,
  Atom,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import MCQGame from '@/components/games/MCQGame';
import TrueFalseGame from '@/components/games/TrueFalseGame';
import DragDropGame from '@/components/games/DragDropGame';
import HotspotGame from '@/components/games/HotspotGame';
import StudentProgress from '@/components/StudentProgress';

interface GameData {
  title: string;
  description: string;
  questions?: any[];
  categories?: string[];
  items?: any[];
  imageUrl?: string;
  hotspots?: any[];
  metadata: {
    subject: string;
    grade: number;
    estimatedTime: string;
    learningObjectives?: string[];
  };
}

const gameTemplates = [
  {
    id: 'math-multiplication',
    title: 'Multiplicación Básica',
    description: 'Practica las tablas de multiplicar',
    subject: 'matemáticas',
    grade: 3,
    gameType: 'mcq',
    difficulty: 'easy',
    icon: <Calculator className="h-6 w-6" />,
  },
  {
    id: 'science-animals',
    title: 'Clasificación de Animales',
    description: 'Clasifica animales por sus características',
    subject: 'ciencias',
    grade: 4,
    gameType: 'dragdrop',
    difficulty: 'medium',
    icon: <Atom className="h-6 w-6" />,
  },
  {
    id: 'history-dominican',
    title: 'Historia Dominicana',
    description: 'Verdadero o falso sobre la historia de RD',
    subject: 'historia',
    grade: 6,
    gameType: 'truefalse',
    difficulty: 'medium',
    icon: <Globe className="h-6 w-6" />,
  },
  {
    id: 'science-human-body',
    title: 'Sistema Digestivo',
    description: 'Identifica las partes del sistema digestivo',
    subject: 'ciencias',
    grade: 5,
    gameType: 'hotspot',
    difficulty: 'medium',
    icon: <Target className="h-6 w-6" />,
  },
  {
    id: 'math-fractions',
    title: 'Fracciones',
    description: 'Resuelve problemas con fracciones',
    subject: 'matemáticas',
    grade: 5,
    gameType: 'mcq',
    difficulty: 'hard',
    icon: <Calculator className="h-6 w-6" />,
  },
  {
    id: 'spanish-grammar',
    title: 'Gramática Española',
    description: 'Clasifica palabras por su función gramatical',
    subject: 'español',
    grade: 4,
    gameType: 'dragdrop',
    difficulty: 'medium',
    icon: <BookOpen className="h-6 w-6" />,
  },
];

export default function GamesDemo() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const generateGame = async (template: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/games/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: template.subject,
          grade: template.grade,
          gameType: template.gameType,
          difficulty: template.difficulty,
          language: 'es',
        }),
      });

      if (!response.ok) {
        throw new Error('Error generando el juego');
      }

      const result = await response.json();
      setGameData(result.game);
      setSelectedGame(template.id);
      setGameCompleted(false);
      toast.success('¡Juego generado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar el juego. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = (
    score: number,
    total: number,
    timeSpent: number,
  ) => {
    const percentage = Math.round((score / total) * 100);
    setGameCompleted(true);

    if (percentage >= 80) {
      toast.success(`¡Excelente! ${percentage}% de aciertos`);
    } else if (percentage >= 60) {
      toast.success(`¡Bien hecho! ${percentage}% de aciertos`);
    } else {
      toast.info(`¡Sigue practicando! ${percentage}% de aciertos`);
    }
  };

  const resetGame = () => {
    setSelectedGame(null);
    setGameData(null);
    setGameCompleted(false);
    setShowProgress(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Medio';
      case 'hard':
        return 'Difícil';
      default:
        return 'Medio';
    }
  };

  if (showProgress) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Mi Progreso</h1>
              <p className="text-gray-600">
                Revisa tu progreso en los juegos educativos
              </p>
            </div>
            <Button onClick={resetGame} variant="outline">
              Volver a los juegos
            </Button>
          </div>
          <StudentProgress />
        </div>
      </div>
    );
  }

  if (selectedGame && gameData) {
    const template = gameTemplates.find((t) => t.id === selectedGame);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{gameData.title}</h1>
              <p className="text-gray-600">{gameData.description}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowProgress(true)} variant="outline">
                Ver Progreso
              </Button>
              <Button onClick={resetGame} variant="outline">
                Volver a la selección
              </Button>
            </div>
          </div>

          {template?.gameType === 'mcq' && gameData.questions && (
            <MCQGame
              gameData={gameData as any}
              onComplete={handleGameComplete}
            />
          )}

          {template?.gameType === 'truefalse' && gameData.questions && (
            <TrueFalseGame
              gameData={gameData as any}
              onComplete={handleGameComplete}
            />
          )}

          {template?.gameType === 'dragdrop' && gameData.items && (
            <DragDropGame
              gameData={gameData as any}
              onComplete={handleGameComplete}
            />
          )}

          {template?.gameType === 'hotspot' && gameData.hotspots && (
            <HotspotGame
              gameData={gameData as any}
              onComplete={handleGameComplete}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Juegos Educativos</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Juegos educativos generados con IA para estudiantes de todos los
            niveles. Contenido real, preciso y adaptado al currículo dominicano.
          </p>
          <Button
            onClick={() => setShowProgress(true)}
            variant="outline"
            size="lg"
            className="mb-4"
          >
            Ver Mi Progreso
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameTemplates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {template.icon}
                  <div>
                    <div className="text-lg">{template.title}</div>
                    <div className="text-sm text-gray-600 font-normal">
                      {template.subject} - Grado {template.grade}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{template.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {getDifficultyText(template.difficulty)}
                  </Badge>
                  <Badge variant="outline">
                    {template.gameType === 'mcq'
                      ? 'Opción Múltiple'
                      : template.gameType === 'truefalse'
                        ? 'Verdadero/Falso'
                        : template.gameType === 'dragdrop'
                          ? 'Arrastrar y Soltar'
                          : template.gameType === 'hotspot'
                            ? 'Hotspots'
                            : 'Juego'}
                  </Badge>
                </div>

                <Button
                  onClick={() => generateGame(template)}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generar Juego
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Brain className="h-6 w-6" />
                Características de los Juegos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Contenido Educativo Real
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Preguntas generadas con IA DeepSeek</li>
                    <li>• Contenido adaptado al currículo dominicano</li>
                    <li>• Dificultad ajustada por grado escolar</li>
                    <li>• Explicaciones detalladas para cada respuesta</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Tipos de Juegos</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Preguntas de opción múltiple</li>
                    <li>• Actividades de verdadero/falso</li>
                    <li>• Clasificación por arrastrar y soltar</li>
                    <li>• Identificación por hotspots</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
