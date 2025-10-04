'use client';

import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
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

// Lazy loading de componentes pesados
const MCQ = dynamic(() => import('@/components/games/MCQ'), {
  loading: () => <div className="p-4 text-center">Cargando juego...</div>,
  ssr: false,
});

const TrueFalse = dynamic(() => import('@/components/games/TrueFalse'), {
  loading: () => <div className="p-4 text-center">Cargando juego...</div>,
  ssr: false,
});

const DragDrop = dynamic(() => import('@/components/games/DragDrop'), {
  loading: () => <div className="p-4 text-center">Cargando juego...</div>,
  ssr: false,
});

const ShortAnswer = dynamic(() => import('@/components/games/ShortAnswer'), {
  loading: () => <div className="p-4 text-center">Cargando juego...</div>,
  ssr: false,
});

const BranchingScenario = dynamic(
  () => import('@/components/games/BranchingScenario'),
  {
    loading: () => <div className="p-4 text-center">Cargando historia...</div>,
    ssr: false,
  },
);

const QuizGeneratorSimple = dynamic(
  () => import('@/components/games/QuizGeneratorSimple'),
  {
    loading: () => <div className="p-4 text-center">Generando quiz...</div>,
    ssr: false,
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

// Componente memoizado para actividades
const ActivityCard = memo(({ 
  activity, 
  index, 
  isActive, 
  isCompleted, 
  onSelect 
}: {
  activity: CurriculumActivity;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onSelect: (index: number) => void;
}) => {
  const handleClick = useCallback(() => {
    onSelect(index);
  }, [index, onSelect]);

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : isCompleted 
            ? 'bg-green-50 border-green-200' 
            : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCompleted 
              ? 'bg-green-500 text-white' 
              : isActive 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600'
          }`}>
            {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{activity.title}</h4>
            <p className="text-xs text-gray-600">{activity.type}</p>
          </div>
          {isCompleted && <Badge variant="secondary" className="text-xs">Completado</Badge>}
        </div>
      </CardContent>
    </Card>
  );
});

ActivityCard.displayName = 'ActivityCard';

// Componente memoizado para capítulos
const ChapterCard = memo(({ 
  chapter, 
  index, 
  isActive, 
  progress, 
  onSelect 
}: {
  chapter: any;
  index: number;
  isActive: boolean;
  progress: number;
  onSelect: (index: number) => void;
}) => {
  const handleClick = useCallback(() => {
    onSelect(index);
  }, [index, onSelect]);

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {index + 1}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{chapter.title}</CardTitle>
            <p className="text-sm text-gray-600">{chapter.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
});

ChapterCard.displayName = 'ChapterCard';

export default function OptimizedStoryLesson({
  curriculum,
  onProgress,
  onBadgeEarned,
}: StoryLessonProps) {
  const { t } = useTranslation();
  const { childData } = useChildProfile();
  
  // Estados optimizados con menos re-renders
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());
  const [totalScore, setTotalScore] = useState(0);
  const [sessionStartTime] = useState<number>(Date.now());
  const [chapterProgress, setChapterProgress] = useState<Record<string, { completed: boolean; score?: number }>>({});
  const [pointsData, setPointsData] = useState<{ total: number; streak: number }>({ total: 0, streak: 0 });
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showDifficultyChange, setShowDifficultyChange] = useState(false);
  const [difficultyChangeReason, setDifficultyChangeReason] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [adaptiveSession, setAdaptiveSession] = useState<any>(null);
  const [activityStartTime, setActivityStartTime] = useState<number>(Date.now());
  const [lastChapterId, setLastChapterId] = useState<string | null>(null);

  // Memoizar valores computados
  const currentChapter = useMemo(() => curriculum.chapters[currentChapterIndex], [curriculum.chapters, currentChapterIndex]);
  const currentActivity = useMemo(() => currentChapter?.activities[currentActivityIndex], [currentChapter, currentActivityIndex]);
  
  const totalActivities = useMemo(() => 
    curriculum.chapters.reduce((total, chapter) => total + chapter.activities.length, 0),
    [curriculum.chapters]
  );
  
  const completedCount = useMemo(() => completedActivities.size, [completedActivities]);
  const progressPercentage = useMemo(() => 
    totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0,
    [completedCount, totalActivities]
  );

  // Callbacks optimizados
  const handleChapterSelect = useCallback((chapterIndex: number) => {
    setCurrentChapterIndex(chapterIndex);
    setCurrentActivityIndex(0);
    setLastChapterId(curriculum.chapters[chapterIndex]?.id || null);
  }, [curriculum.chapters]);

  const handleActivitySelect = useCallback((activityIndex: number) => {
    setCurrentActivityIndex(activityIndex);
    setActivityStartTime(Date.now());
  }, []);

  const handleActivityComplete = useCallback((score: number, feedback?: any) => {
    if (!currentActivity) return;

    const activityId = `${currentChapter?.id}-${currentActivityIndex}`;
    const newCompleted = new Set(completedActivities);
    newCompleted.add(activityId);
    setCompletedActivities(newCompleted);

    setTotalScore(prev => prev + score);
    setPointsData(prev => ({ ...prev, total: prev.total + score }));

    // Actualizar progreso del capítulo
    setChapterProgress(prev => ({
      ...prev,
      [currentChapter?.id || '']: {
        completed: newCompleted.size === currentChapter?.activities.length,
        score: (prev[currentChapter?.id || '']?.score || 0) + score,
      },
    }));

    // Verificar si se ganó una medalla
    if (score >= 80 && !earnedBadges.has(currentActivity.type)) {
      const newEarned = new Set(earnedBadges);
      newEarned.add(currentActivity.type);
      setEarnedBadges(newEarned);
      onBadgeEarned?.(currentActivity.type, `¡Completaste ${currentActivity.title}!`);
    }

    onProgress?.(currentChapter?.id || '', currentActivityIndex, true);

    // Mostrar feedback
    setShowFeedback(true);
    setFeedbackSubmitted(true);

    toast.success(`¡Excelente! Ganaste ${score} puntos`);
  }, [currentActivity, currentChapter, completedActivities, earnedBadges, onProgress, onBadgeEarned]);

  const handleNextActivity = useCallback(() => {
    if (currentActivityIndex < (currentChapter?.activities.length || 0) - 1) {
      setCurrentActivityIndex(prev => prev + 1);
      setActivityStartTime(Date.now());
    } else if (currentChapterIndex < curriculum.chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      setCurrentActivityIndex(0);
      setActivityStartTime(Date.now());
    }
    setShowFeedback(false);
    setFeedbackSubmitted(false);
  }, [currentActivityIndex, currentChapter, currentChapterIndex, curriculum.chapters.length]);

  const handlePreviousActivity = useCallback(() => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(prev => prev - 1);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
      setCurrentActivityIndex(curriculum.chapters[currentChapterIndex - 1]?.activities.length - 1);
    }
    setActivityStartTime(Date.now());
  }, [currentActivityIndex, currentChapterIndex, curriculum.chapters]);

  // Renderizar actividad actual
  const renderCurrentActivity = useCallback(() => {
    if (!currentActivity) return null;

    const commonProps = {
      onComplete: handleActivityComplete,
      onNext: handleNextActivity,
    };

    switch (currentActivity.type) {
      case 'multiple-choice':
        return <MCQ {...commonProps} game={currentActivity} />;
      case 'true-false':
        return <TrueFalse {...commonProps} game={currentActivity} />;
      case 'drag-drop':
        return <DragDrop {...commonProps} game={currentActivity} />;
      case 'short-answer':
        return <ShortAnswer {...commonProps} game={currentActivity} />;
      case 'branching-scenario':
        return <BranchingScenario {...commonProps} game={currentActivity} />;
      case 'quiz-generator':
        return <QuizGeneratorSimple {...commonProps} game={currentActivity} />;
      default:
        return (
          <Card className="p-6 text-center">
            <p className="text-gray-600">Tipo de actividad no soportado: {currentActivity.type}</p>
          </Card>
        );
    }
  }, [currentActivity, handleActivityComplete, handleNextActivity]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header con progreso */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{curriculum.title}</h1>
            <p className="text-gray-600">{curriculum.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{totalScore}</div>
            <div className="text-sm text-gray-600">Puntos</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso General</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{completedCount} de {totalActivities} actividades</span>
            <span>Racha: {pointsData.streak}</span>
          </div>
        </div>
      </Card>

      {/* Navegación de capítulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {curriculum.chapters.map((chapter, index) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            index={index}
            isActive={index === currentChapterIndex}
            progress={chapterProgress[chapter.id]?.completed ? 100 : 0}
            onSelect={handleChapterSelect}
          />
        ))}
      </div>

      {/* Actividad actual */}
      {currentActivity && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{currentActivity.title}</h2>
              <p className="text-gray-600">{currentChapter?.title} - Actividad {currentActivityIndex + 1}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousActivity}
                disabled={currentChapterIndex === 0 && currentActivityIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextActivity}
                disabled={currentChapterIndex === curriculum.chapters.length - 1 && 
                         currentActivityIndex === (currentChapter?.activities.length || 0) - 1}
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {renderCurrentActivity()}
        </Card>
      )}

      {/* Medallas ganadas */}
      {earnedBadges.size > 0 && (
        <Card className="p-4 bg-yellow-50">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Medallas Ganadas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(earnedBadges).map((badge) => (
              <Badge key={badge} variant="secondary" className="bg-yellow-100 text-yellow-800">
                {badge}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
