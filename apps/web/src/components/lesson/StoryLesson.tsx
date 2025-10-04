'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  Award,
  Clock,
  Users,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChildProfile } from '@/hooks/useChildProfile';
import { toast } from 'sonner';
import type { Curriculum, CurriculumActivity } from '@/curriculum';

// Dynamic imports for game components
const MCQ = dynamic(() => import('@/components/games/MCQ'), {
  loading: () => <div className="p-4 text-center">Cargando juego...</div>,
});

const TrueFalse = dynamic(() => import('@/components/games/TrueFalse'), {
  loading: () => <div className="p-4 text-center">Cargando juego...</div>,
});

const DragDrop = dynamic(() => import('@/components/games/DragDrop'), {
  loading: () => <div className="p-4 text-center">Cargando juego...</div>,
});

const ShortAnswer = dynamic(() => import('@/components/games/ShortAnswer'), {
  loading: () => <div className="p-4 text-center">Cargando juego...</div>,
});

const BranchingScenario = dynamic(
  () => import('@/components/games/BranchingScenario'),
  {
    loading: () => <div className="p-4 text-center">Cargando historia...</div>,
  },
);

const QuizGeneratorSimple = dynamic(
  () => import('@/components/games/QuizGeneratorSimple'),
  {
    loading: () => <div className="p-4 text-center">Generando quiz...</div>,
  },
);

interface StoryLessonProps {
  curriculum: Curriculum;
  onProgress?: (
    chapterId: string,
    activityIndex: number,
    completed: boolean,
  ) => void;
  onBadgeEarned?: (badge: string, description: string) => void;
}

export default function StoryLesson({
  curriculum,
  onProgress,
  onBadgeEarned,
}: StoryLessonProps) {
  const { t } = useTranslation();
  const { childData } = useChildProfile();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(
    new Set(),
  );
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());
  const [totalScore, setTotalScore] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [chapterProgress, setChapterProgress] = useState<
    Record<string, { completed: boolean; score?: number }>
  >({});
  const [pointsData, setPointsData] = useState<{
    total: number;
    streak: number;
  }>({ total: 0, streak: 0 });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const currentChapter = curriculum.chapters[currentChapterIndex];
  const currentActivity = currentChapter?.activities[currentActivityIndex];
  const totalChapters = curriculum.chapters.length;
  const totalActivities = currentChapter?.activities.length || 0;
  const overallProgress =
    (currentChapterIndex * 100 +
      (currentActivityIndex / totalActivities) * 100) /
    totalChapters;

  // Load existing progress on component mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!childData?.id) return;

      try {
        const response = await fetch(
          `/api/chapter/progress?studentId=${childData.id}&curriculumId=${curriculum.id}`,
        );
        const result = await response.json();

        if (result.ok && result.data.length > 0) {
          const completedChapters = result.data.filter((p: any) => p.completed);
          const earnedBadgeNames = new Set(
            curriculum.chapters
              .filter((chapter, index) =>
                completedChapters.some((p: any) => p.chapter_id === chapter.id),
              )
              .map((chapter) => chapter.badge)
              .filter(Boolean),
          );

          setEarnedBadges(earnedBadgeNames);

          // Set total score from all completed chapters
          const totalScoreFromDB = result.data.reduce(
            (sum: number, progress: any) => sum + (progress.score || 0),
            0,
          );
          setTotalScore(totalScoreFromDB);

          // Set chapter progress map
          const progressMap: Record<
            string,
            { completed: boolean; score?: number }
          > = {};
          result.data.forEach((progress: any) => {
            progressMap[progress.chapter_id] = {
              completed: progress.completed,
              score: progress.score,
            };
          });
          setChapterProgress(progressMap);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    const loadPoints = async () => {
      if (!childData?.id) return;

      try {
        const response = await fetch(
          `/api/points/award?studentId=${childData.id}`,
        );
        const result = await response.json();

        if (result.ok && result.data) {
          setPointsData({
            total: result.data.totalPoints,
            streak: result.data.maxStreak,
          });
        }
      } catch (error) {
        console.error('Error loading points:', error);
      }
    };

    loadProgress();
    loadPoints();
  }, [childData?.id, curriculum.id]);

  // Save progress to database
  const saveProgress = async (
    activityCompleted: boolean = false,
    score: number = 0,
  ) => {
    if (!childData?.id) return;

    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
    const chapterCompleted =
      currentActivityIndex === totalActivities - 1 && activityCompleted;

    try {
      const response = await fetch('/api/chapter/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: childData.id,
          curriculumId: curriculum.id,
          chapterId: currentChapter.id,
          completed: chapterCompleted,
          score: score,
          activityCompleted: activityCompleted,
          timeSpent: timeSpent,
        }),
      });

      const result = await response.json();

      if (result.ok && chapterCompleted && currentChapter.badge) {
        // Award badge automatically when chapter is completed
        await awardBadge(currentChapter.badge);
      }

      // Update local chapter progress state
      if (result.ok) {
        setChapterProgress((prev) => ({
          ...prev,
          [currentChapter.id]: {
            completed: chapterCompleted,
            score: score,
          },
        }));
      }

      // Award points when activity is completed
      if (activityCompleted) {
        await awardPoints(score, timeSpent);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Award points using the advanced system
  const awardPoints = async (score: number = 0, timeSpent: number = 0) => {
    if (!childData?.id) return;

    try {
      // Determinar subject code basado en el curriculum
      const subjectCode = curriculum.id.startsWith('math')
        ? 'math'
        : curriculum.id.startsWith('literacy')
          ? 'language'
          : 'science';

      // Determinar dificultad (por ahora hardcoded, luego se puede leer del chapter metadata)
      const difficulty = curriculum.id.includes('level1')
        ? 'easy'
        : curriculum.id.includes('level2')
          ? 'medium'
          : 'hard';

      const response = await fetch('/api/points/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: childData.id,
          subjectCode,
          basePoints: 100,
          difficulty,
          score,
          time_spent: timeSpent,
          creativity: 0, // Por ahora 0, se puede incrementar para actividades abiertas
        }),
      });

      const result = await response.json();

      if (result.ok && result.result) {
        const { total_awarded, new_total_points, new_streak } = result.result;

        // Actualizar estado local de puntos
        setPointsData({
          total: new_total_points,
          streak: new_streak,
        });

        // Mostrar feedback de puntos
        toast.success(`🎯 +${total_awarded} puntos ganados!`, {
          description: `Total: ${new_total_points} pts | Racha: ${new_streak} días`,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  // Award badge automatically
  const awardBadge = async (badgeName: string) => {
    if (!childData?.id || earnedBadges.has(badgeName)) return;

    try {
      const response = await fetch('/api/award-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: childData.id,
          badgeName: badgeName,
          curriculumId: curriculum.id,
          chapterId: currentChapter.id,
        }),
      });

      const result = await response.json();

      if (result.ok && !result.alreadyAwarded) {
        setEarnedBadges((prev) => new Set([...prev, badgeName]));
        toast.success(`🏆 ¡Badge ganado: ${badgeName}!`, {
          description: result.achievement.description,
          duration: 5000,
        });
        onBadgeEarned?.(badgeName, result.achievement.description);
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  // Send feedback to AI system
  const sendFeedback = async (feeling: string, difficulty?: string) => {
    if (!childData?.id) return;

    try {
      const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000);

      const response = await fetch('/api/adaptive/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: childData.id,
          curriculumId: curriculum.id,
          chapterId: currentChapter.id,
          feeling,
          difficulty,
          timeSpent,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success('¡Gracias! Fuzzy ajustará tus próximos retos ✨', {
          duration: 3000,
        });
        setFeedbackSubmitted(true);
      } else {
        console.error('Error sending feedback:', result.error);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  // Handle activity completion
  const handleActivityComplete = async (score?: number) => {
    const activityId = `${currentChapter.id}-${currentActivityIndex}`;
    const newCompleted = new Set(completedActivities);
    newCompleted.add(activityId);
    setCompletedActivities(newCompleted);

    const activityScore = score || 0;
    setTotalScore((prev) => prev + activityScore);

    // Save progress to database
    await saveProgress(true, activityScore);

    // Check if chapter is complete
    const chapterCompleted = currentActivityIndex === totalActivities - 1;

    if (chapterCompleted) {
      toast.success(`✅ ¡Capítulo completado: ${currentChapter.title}!`, {
        description: 'Tu progreso ha sido guardado',
        duration: 3000,
      });

      // Show feedback form after chapter completion
      setShowFeedback(true);
    }

    // Auto-advance to next activity
    setTimeout(() => {
      if (currentActivityIndex < totalActivities - 1) {
        setCurrentActivityIndex((prev) => prev + 1);
        setSessionStartTime(Date.now()); // Reset timer for new activity
      } else if (currentChapterIndex < totalChapters - 1) {
        setCurrentChapterIndex((prev) => prev + 1);
        setCurrentActivityIndex(0);
        setSessionStartTime(Date.now()); // Reset timer for new chapter
        setShowFeedback(false); // Reset feedback state for new chapter
        setFeedbackSubmitted(false);
      }
    }, 1500);

    onProgress?.(currentChapter.id, currentActivityIndex, true);
  };

  // Navigation functions
  const goToPrevious = () => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex((prev) => prev - 1);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
      const prevChapter = curriculum.chapters[currentChapterIndex - 1];
      setCurrentActivityIndex(prevChapter.activities.length - 1);
    }
  };

  const goToNext = () => {
    if (currentActivityIndex < totalActivities - 1) {
      setCurrentActivityIndex((prev) => prev + 1);
    } else if (currentChapterIndex < totalChapters - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
      setCurrentActivityIndex(0);
    }
  };

  // Lógica de bloqueo: capítulos posteriores bloqueados si el anterior no está completado
  const isCurrentChapterLocked = (() => {
    if (currentChapterIndex === 0) return false; // Primer capítulo nunca está bloqueado
    const previousChapter = curriculum.chapters[currentChapterIndex - 1];
    return !chapterProgress[previousChapter.id]?.completed;
  })();

  const canGoBack = currentChapterIndex > 0 || currentActivityIndex > 0;
  const canGoForward =
    !isCurrentChapterLocked &&
    (currentChapterIndex < totalChapters - 1 ||
      currentActivityIndex < totalActivities - 1);

  // Render activity based on type
  const renderActivity = (activity: CurriculumActivity) => {
    const activityId = `${currentChapter.id}-${currentActivityIndex}`;
    const isCompleted = completedActivities.has(activityId);

    // Manejar actividades de tipo 'quiz' (generador adaptativo)
    if ((activity as any).type === 'quiz') {
      const params = (activity as any).params || {};
      return (
        <QuizGeneratorSimple
          subject={params.subject || 'math'}
          topic={params.topic || 'numeros-0-10'}
          questionCount={params.questionCount || 3}
          onComplete={(result: { score: number; total: number }) =>
            handleActivityComplete(
              Math.round((100 * result.score) / result.total),
            )
          }
          disabled={isCompleted}
        />
      );
    }

    // Adapt data structure for each component type
    const getActivityProps = () => {
      switch (activity.component) {
        case 'TrueFalse':
          // Convert curriculum data to TrueFalse format
          const trueFalseData = activity.data;
          return {
            game: {
              statement:
                trueFalseData.instructions || 'Selecciona verdadero o falso',
              questions: trueFalseData.items?.map((item: any) => ({
                id: item.q || Math.random().toString(),
                q: item.q,
                answer: item.answer,
                audioText: item.q, // Usar la pregunta como texto de audio
              })) || [],
              audioText: trueFalseData.instructions, // Audio para las instrucciones
            },
            onAnswer: (answer: boolean) => handleActivityComplete(),
            onNext: () => handleActivityComplete(),
            disabled: isCompleted,
          };

        case 'MCQ':
          return {
            game: {
              question:
                activity.data.instructions ||
                'Selecciona la respuesta correcta',
              options: activity.data.items || [],
              correctAnswer:
                activity.data.items?.map((item: any) => item.answer) || [],
            },
            onAnswer: (answer: string) => handleActivityComplete(),
            onNext: () => handleActivityComplete(),
            disabled: isCompleted,
          };

        case 'DragDrop':
          return {
            game: {
              instructions: activity.data.prompt || 'Arrastra los elementos',
              items: activity.data.items || [],
            },
            onAnswer: (answer: any) => handleActivityComplete(),
            onNext: () => handleActivityComplete(),
            disabled: isCompleted,
          };

        case 'ShortAnswer':
          return {
            question: activity.data.prompt || 'Responde la pregunta',
            onAnswer: (answer: string) => handleActivityComplete(),
            onNext: () => handleActivityComplete(),
            disabled: isCompleted,
          };

        case 'BranchingScenario':
          return {
            game: activity.data,
            onAnswer: (answer: any) => handleActivityComplete(),
            onNext: () => handleActivityComplete(),
            disabled: isCompleted,
          };

        case 'QuizGenerator':
          return {
            ...activity.data,
            onComplete: (result: { score: number; total: number }) =>
              handleActivityComplete(
                Math.round((100 * result.score) / result.total),
              ),
            disabled: isCompleted,
            adaptive: true,
            studentId: childData?.id,
            curriculumId: curriculum.id,
          };

        default:
          return {
            ...activity.data,
            onComplete: handleActivityComplete,
            disabled: isCompleted,
          };
      }
    };

    switch (activity.component) {
      case 'MCQ':
        return <MCQ {...getActivityProps()} />;

      case 'TrueFalse':
        return <TrueFalse {...getActivityProps()} />;

      case 'DragDrop':
        return <DragDrop {...getActivityProps()} />;

      case 'ShortAnswer':
        return <ShortAnswer {...getActivityProps()} />;

      case 'BranchingScenario':
        return <BranchingScenario {...getActivityProps()} />;

      case 'QuizGenerator':
        return <QuizGeneratorSimple {...getActivityProps()} />;

      case 'ExternalGame':
        return (
          <div className="w-full h-[500px] border rounded-lg overflow-hidden">
            <iframe
              src={activity.data.url}
              className="w-full h-full"
              title={activity.title}
              allowFullScreen
            />
          </div>
        );

      default:
        return (
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Tipo de actividad no reconocido: {activity.component}
            </p>
            <pre className="mt-2 text-xs bg-white p-2 rounded">
              {JSON.stringify(activity.data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {curriculum.title}
            </h1>
            <p className="text-gray-600 mt-1">{curriculum.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              Edad: {curriculum.ageRange}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {curriculum.estimatedDuration}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progreso general</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Badges earned */}
        {earnedBadges.size > 0 && (
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Badges ganados:</span>
            {Array.from(earnedBadges).map((badge) => (
              <Badge
                key={badge}
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                <Trophy className="w-3 h-3 mr-1" />
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {/* Chapter Status */}
        <div className="flex items-center gap-3">
          {chapterProgress[currentChapter.id]?.completed ? (
            <div className="flex items-center text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4 mr-1" />
              Capítulo completado
            </div>
          ) : isCurrentChapterLocked ? (
            <div className="flex items-center text-amber-600 text-sm font-medium">
              <Lock className="w-4 h-4 mr-1" />
              Capítulo bloqueado - Completa el anterior primero
            </div>
          ) : null}
        </div>
      </div>

      {/* Chapter Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {currentChapter.title}
            </CardTitle>
            <Badge variant="outline">
              Capítulo {currentChapterIndex + 1} de {totalChapters}
            </Badge>
          </div>

          {/* Chapter goals */}
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Objetivos:</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {currentChapter.goals.map((goal, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        </CardHeader>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{currentActivity?.title}</span>
            <Badge variant="outline">
              Actividad {currentActivityIndex + 1} de {totalActivities}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCurrentChapterLocked ? (
            <div className="text-center py-12 space-y-4">
              <Lock className="w-16 h-16 text-amber-500 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-amber-800">
                  Capítulo Bloqueado
                </h3>
                <p className="text-amber-700">
                  Completa el capítulo anterior para desbloquear este contenido.
                </p>
              </div>
            </div>
          ) : (
            currentActivity && renderActivity(currentActivity)
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={!canGoBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="text-center space-y-1">
          <p className="text-sm text-gray-500">
            Puntuación total:{' '}
            <span className="font-medium text-blue-600">{totalScore}</span>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-yellow-600">
              🎯 <strong>{pointsData.total}</strong> pts
            </span>
            <span className="flex items-center gap-1 text-orange-600">
              🔥 <strong>{pointsData.streak}</strong> días
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={goToNext}
          disabled={!canGoForward}
          className="flex items-center gap-2"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Feedback Form */}
      {showFeedback && !feedbackSubmitted && (
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  ¡Excelente trabajo completando el capítulo!
                </h3>
              </div>

              <p className="text-sm text-gray-600">
                ¿Cómo te sentiste en este capítulo? Tu respuesta ayudará a Fuzzy
                a personalizar tu experiencia.
              </p>

              <div className="flex justify-center gap-3">
                {[
                  { emoji: '🤓', label: 'Fácil', value: 'easy' },
                  { emoji: '😅', label: 'Regular', value: 'medium' },
                  { emoji: '😖', label: 'Difícil', value: 'hard' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    onClick={() => sendFeedback(option.value, option.value)}
                    className="flex flex-col items-center gap-2 p-4 h-auto hover:bg-blue-100 hover:border-blue-300 transition-colors"
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </Button>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                Tu feedback es privado y solo se usa para mejorar tu experiencia
                de aprendizaje.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Submitted Confirmation */}
      {feedbackSubmitted && (
        <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                ¡Gracias por tu feedback! Fuzzy ajustará tus próximos retos ✨
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
