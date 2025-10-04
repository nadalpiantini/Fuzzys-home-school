'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  BookOpen,
  Calculator,
  Users,
  Clock,
  Star,
  Trophy,
  ArrowRight,
  Sparkles,
  Target,
  Award,
  Brain,
  Heart,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChildProfile } from '@/hooks/useChildProfile';
import { getAllCurriculums } from '@/curriculum';

interface CurriculumCardProps {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  estimatedDuration: string;
  chaptersCount: number;
  icon: React.ReactNode;
  color: string;
  href: string;
  progress?: number;
  completedChapters?: number;
}

function CurriculumCard({
  title,
  description,
  ageRange,
  estimatedDuration,
  chaptersCount,
  icon,
  color,
  href,
  progress = 0,
  completedChapters = 0,
}: CurriculumCardProps) {
  const router = useRouter();

  // For now, all levels are unlocked
  const isLocked = false;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg ${color} mb-3`}>{icon}</div>
          <Badge variant="secondary" className="text-xs">
            {chaptersCount} capítulos
          </Badge>
        </div>
        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>Edad: {ageRange}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{estimatedDuration}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Target className="w-4 h-4 text-blue-500" />
            Lo que aprenderás:
          </div>
          <div className="text-sm text-gray-600">
            {title.includes('Matemágico') && (
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Números del 0 al 10
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Primeras sumas
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Resolución de problemas
                </li>
              </ul>
            )}
            {title.includes('Sonidos') && (
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Reconocimiento de letras
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Fluidez lectora
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Historias interactivas
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Progress section */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Progreso</span>
              <span className="text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {completedChapters} de {chaptersCount} capítulos completados
            </div>
          </div>
        )}

        <Button
          onClick={() => !isLocked && router.push(href)}
          disabled={isLocked}
          className={`w-full transition-colors ${
            isLocked
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'group-hover:bg-blue-600'
          }`}
        >
          <span className="flex items-center gap-2">
            {isLocked ? (
              <>
                🔒 Desbloquea el nivel anterior
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                {progress > 0 ? 'Continuar aventura' : 'Comenzar aventura'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function LearnPage() {
  const { t } = useTranslation();
  const { childData } = useChildProfile();
  const curriculums = getAllCurriculums();
  const [progressData, setProgressData] = useState<
    Record<string, { progress: number; completedChapters: number }>
  >({});
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Helper function to calculate progress percentage
  const calculateProgress = (curriculumIds: string[]) => {
    const totalProgress = curriculumIds.reduce((acc, id) => {
      const progress = progressData[id];
      return acc + (progress?.progress || 0);
    }, 0);
    return Math.round(totalProgress / curriculumIds.length);
  };

  const curriculumCards = useMemo(
    () => [
      {
        id: 'literacy-level1',
        title: 'Sonidos Mágicos · Nivel 1',
        description:
          'Explora el mundo de las letras y sonidos con Fuzzy en aventuras interactivas llenas de diversión.',
        ageRange: '5-7 años',
        estimatedDuration: '45 min',
        chaptersCount: 2,
        icon: <BookOpen className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-br from-purple-500 to-pink-500',
        href: '/learn/literacy/level1',
      },
      {
        id: 'literacy-level2',
        title: 'Palabras Mágicas · Nivel 2',
        description:
          'Aventuras avanzadas con palabras complejas, sílabas trabadas y comprensión lectora.',
        ageRange: '7-9 años',
        estimatedDuration: '75 min',
        chaptersCount: 4,
        icon: <BookOpen className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-br from-purple-600 to-pink-600',
        href: '/learn/literacy/level2',
      },
      {
        id: 'math-level1',
        title: 'Mundo Matemágico · Nivel 1',
        description:
          'Descubre los números y las primeras operaciones en un mundo lleno de magia matemática.',
        ageRange: '6-8 años',
        estimatedDuration: '50 min',
        chaptersCount: 2,
        icon: <Calculator className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        href: '/learn/math/level1',
      },
      {
        id: 'math-level2',
        title: 'Mundo Matemágico · Nivel 2',
        description:
          'Aventuras matemáticas avanzadas con fracciones, multiplicación y geometría básica.',
        ageRange: '8-10 años',
        estimatedDuration: '60 min',
        chaptersCount: 4,
        icon: <Calculator className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-br from-blue-600 to-cyan-600',
        href: '/learn/math/level2',
      },
      {
        id: 'math-level3',
        title: 'Mundo Matemágico · Nivel 3',
        description:
          'Aventuras matemáticas avanzadas: restas, números hasta 20 y operaciones complejas.',
        ageRange: '8-10 años',
        estimatedDuration: '90 min',
        chaptersCount: 4,
        icon: <Calculator className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-br from-blue-700 to-cyan-700',
        href: '/learn/math/level3',
      },
      {
        id: 'science-level1',
        title: 'Laboratorio Mágico · Nivel 1',
        description:
          'Explora el mundo de las ciencias con experimentos PhET interactivos y descubrimientos fascinantes.',
        ageRange: '7-9 años',
        estimatedDuration: '80 min',
        chaptersCount: 5,
        icon: <Brain className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-br from-green-500 to-teal-500',
        href: '/learn/science/level1',
      },
    ],
    [],
  );

  // Load progress data for all curriculums
  useEffect(() => {
    const loadAllProgress = async () => {
      if (!childData?.name) return;

      try {
        const response = await fetch(
          `/api/chapter/progress?studentId=${childData.name}`,
        );
        const result = await response.json();

        if (result.ok && result.data.length > 0) {
          const progressBycurriculum: Record<
            string,
            { progress: number; completedChapters: number }
          > = {};

          curriculumCards.forEach((curriculum) => {
            const curriculumProgress = result.data.filter(
              (p: any) => p.curriculum_id === curriculum.id,
            );
            const completedChapters = curriculumProgress.filter(
              (p: any) => p.completed,
            ).length;
            const progress =
              (completedChapters / curriculum.chaptersCount) * 100;

            progressBycurriculum[curriculum.id] = {
              progress,
              completedChapters,
            };
          });

          setProgressData(progressBycurriculum);
        }
      } catch (error) {
        console.error('Error loading progress data:', error);
      }
    };

    loadAllProgress();
  }, [childData, curriculumCards]);

  // Load AI recommendations
  useEffect(() => {
    const loadAIRecommendations = async () => {
      if (!childData?.name) return;

      setLoadingRecommendations(true);
      try {
        const response = await fetch(
          `/api/adaptive/recommend?studentId=${childData.name}`,
        );
        const result = await response.json();

        if (result.ok && result.data) {
          setAiRecommendations(result.data);
        }
      } catch (error) {
        console.error('Error loading AI recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadAIRecommendations();
  }, [childData]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mundos de Aprendizaje
          </h1>
          <Sparkles className="w-8 h-8 text-yellow-500" />
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Embárcate en aventuras educativas diseñadas especialmente para ti.
          Cada mundo está lleno de juegos, historias y desafíos que harán que
          aprender sea emocionante.
        </p>

        {/* Overall Progress */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progreso General</span>
            <span>
              {Math.round(
                Object.values(progressData).reduce(
                  (acc, curr) => acc + (curr?.progress || 0),
                  0,
                ) / Math.max(Object.keys(progressData).length, 1),
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round(
                  Object.values(progressData).reduce(
                    (acc, curr) => acc + (curr?.progress || 0),
                    0,
                  ) / Math.max(Object.keys(progressData).length, 1),
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-indigo-800">
              🧠 Recomendaciones de Fuzzy
            </h2>
          </div>
          <div className="space-y-2">
            {aiRecommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3 bg-white rounded-lg border border-indigo-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-1">
                      {rec.motivation}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📚 {rec.curriculumId}</span>
                      <span>
                        🎯 Dificultad:{' '}
                        <strong>{rec.suggestedDifficulty}</strong>
                      </span>
                      <span>
                        ➡️ Próximo: <strong>{rec.nextChapter}</strong>
                      </span>
                      {rec.confidence && (
                        <span>
                          🎯 Confianza: {Math.round(rec.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-2">
                    <Badge
                      variant={
                        rec.suggestedDifficulty === 'easy'
                          ? 'default'
                          : rec.suggestedDifficulty === 'hard'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className="text-xs"
                    >
                      {rec.suggestedDifficulty === 'easy'
                        ? 'Fácil'
                        : rec.suggestedDifficulty === 'hard'
                          ? 'Difícil'
                          : 'Medio'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">15+</div>
            <div className="text-sm text-green-600">Badges por ganar</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">50+</div>
            <div className="text-sm text-blue-600">
              Actividades interactivas
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">100%</div>
            <div className="text-sm text-purple-600">Diversión garantizada</div>
          </CardContent>
        </Card>
      </div>

      {/* Curriculum Grid - Organized by Subject */}
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            Elige tu aventura
          </h2>
        </div>

        {/* Lectoescritura Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-purple-800">
                Lectoescritura
              </h3>
              <Badge variant="outline" className="text-purple-600">
                2 niveles
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Progreso:{' '}
              {calculateProgress(
                curriculumCards
                  .filter((c) => c.id.startsWith('literacy'))
                  .map((c) => c.id),
              )}
              %
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {curriculumCards
              .filter((curriculum) => curriculum.id.startsWith('literacy'))
              .map((curriculum) => {
                const progress = progressData[curriculum.id];
                return (
                  <CurriculumCard
                    key={curriculum.id}
                    {...curriculum}
                    progress={progress?.progress || 0}
                    completedChapters={progress?.completedChapters || 0}
                  />
                );
              })}
          </div>
        </div>

        {/* Matemáticas Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-800">Matemáticas</h3>
              <Badge variant="outline" className="text-blue-600">
                3 niveles
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Progreso:{' '}
              {Math.round(
                curriculumCards.filter((c) => c.id.startsWith('math')).length *
                  10,
              )}
              %
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curriculumCards
              .filter((curriculum) => curriculum.id.startsWith('math'))
              .map((curriculum) => {
                const progress = progressData[curriculum.id];
                return (
                  <CurriculumCard
                    key={curriculum.id}
                    {...curriculum}
                    progress={progress?.progress || 0}
                    completedChapters={progress?.completedChapters || 0}
                  />
                );
              })}
          </div>
        </div>

        {/* Ciencias Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-800">Ciencias</h3>
              <Badge variant="outline" className="text-green-600">
                1 nivel
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Progreso:{' '}
              {Math.round(
                curriculumCards
                  .filter((c) => c.id.startsWith('science'))
                  .reduce((acc, curr) => {
                    const progress = progressData[curr.id];
                    return acc + (progress?.progress || 0);
                  }, 0) /
                  curriculumCards.filter((c) => c.id.startsWith('science'))
                    .length,
              )}
              %
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {curriculumCards
              .filter((curriculum) => curriculum.id.startsWith('science'))
              .map((curriculum) => {
                const progress = progressData[curriculum.id];
                return (
                  <CurriculumCard
                    key={curriculum.id}
                    {...curriculum}
                    progress={progress?.progress || 0}
                    completedChapters={progress?.completedChapters || 0}
                  />
                );
              })}
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            ¡Más mundos en camino!
          </h3>
          <p className="text-gray-600">
            Estamos preparando emocionantes aventuras en Historia, Arte, Música
            y más. ¡Mantente atento para descubrir nuevos mundos de aprendizaje!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
