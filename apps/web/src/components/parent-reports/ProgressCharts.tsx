'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Gamepad2,
  Clock,
  Star,
} from 'lucide-react';

interface ProgressChartsProps {
  subjectAnalysis: Array<{
    subject: string;
    mastery: number;
    timeSpent: number;
    gamesPlayed: number;
    trend: 'up' | 'down' | 'stable';
    recommendations: string[];
  }>;
  weeklyBreakdown: Array<{
    day: string;
    points: number;
    gamesPlayed: number;
    timeSpent: number;
  }>;
  learningPatterns?: {
    bestTimeOfDay: string;
    averageSessionLength: number;
    preferredSubjects: string[];
    strugglingAreas: string[];
    progressTrend: 'improving' | 'stable' | 'declining';
  };
  language?: string;
}

export function ProgressCharts({
  subjectAnalysis,
  weeklyBreakdown,
  learningPatterns,
  language = 'es',
}: ProgressChartsProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 90) return 'bg-green-500';
    if (mastery >= 80) return 'bg-green-400';
    if (mastery >= 70) return 'bg-yellow-400';
    if (mastery >= 60) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getMasteryBadge = (mastery: number) => {
    if (mastery >= 90)
      return { text: 'Excelente', variant: 'default' as const };
    if (mastery >= 80)
      return { text: 'Muy Bueno', variant: 'default' as const };
    if (mastery >= 70) return { text: 'Bueno', variant: 'secondary' as const };
    if (mastery >= 60)
      return { text: 'Regular', variant: 'secondary' as const };
    return { text: 'Necesita Mejora', variant: 'destructive' as const };
  };

  return (
    <div className="space-y-6">
      {/* Subject Mastery Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {language === 'es' ? 'Dominio por Materias' : 'Subject Mastery'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectAnalysis.map((subject, index) => {
              const badge = getMasteryBadge(subject.mastery);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{subject.subject}</span>
                      {getTrendIcon(subject.trend)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {subject.mastery}%
                      </span>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={subject.mastery} className="h-3" />
                    <div
                      className={`absolute top-0 left-0 h-3 rounded-full ${getMasteryColor(subject.mastery)}`}
                      style={{ width: `${subject.mastery}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {language === 'es' ? 'Actividad Semanal' : 'Weekly Activity'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyBreakdown.map((day, index) => {
              const maxPoints = Math.max(
                ...weeklyBreakdown.map((d) => d.points),
              );
              const maxGames = Math.max(
                ...weeklyBreakdown.map((d) => d.gamesPlayed),
              );
              const maxTime = Math.max(
                ...weeklyBreakdown.map((d) => d.timeSpent),
              );

              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{day.day}</span>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {day.points} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <Gamepad2 className="w-4 h-4 text-blue-500" />
                        {day.gamesPlayed} juegos
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-green-500" />
                        {day.timeSpent} min
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-16">
                        Puntos:
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(day.points / maxPoints) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-16">
                        Juegos:
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(day.gamesPlayed / maxGames) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-16">
                        Tiempo:
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(day.timeSpent / maxTime) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'es' ? 'Resumen de Rendimiento' : 'Performance Summary'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {subjectAnalysis.filter((s) => s.mastery >= 80).length}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'es' ? 'Materias Excelentes' : 'Excellent Subjects'}
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {
                  subjectAnalysis.filter(
                    (s) => s.mastery >= 60 && s.mastery < 80,
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">
                {language === 'es' ? 'Materias Buenas' : 'Good Subjects'}
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {subjectAnalysis.filter((s) => s.mastery < 60).length}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'es' ? 'Materias a Mejorar' : 'Needs Improvement'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Patterns Analysis */}
      {learningPatterns && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {language === 'es' ? 'Patrones de Aprendizaje' : 'Learning Patterns'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Learning Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">
                  {language === 'es' ? 'Preferencias de Estudio' : 'Study Preferences'}
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">
                        {language === 'es' ? 'Mejor momento del día' : 'Best time of day'}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {learningPatterns.bestTimeOfDay === 'morning'
                          ? (language === 'es' ? 'Mañana' : 'Morning')
                          : learningPatterns.bestTimeOfDay === 'afternoon'
                          ? (language === 'es' ? 'Tarde' : 'Afternoon')
                          : (language === 'es' ? 'Noche' : 'Evening')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Star className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium">
                        {language === 'es' ? 'Duración promedio de sesión' : 'Average session length'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {learningPatterns.averageSessionLength} {language === 'es' ? 'minutos' : 'minutes'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className={`w-5 h-5 ${
                      learningPatterns.progressTrend === 'improving' ? 'text-green-600' :
                      learningPatterns.progressTrend === 'declining' ? 'text-red-600' :
                      'text-gray-600'
                    }`} />
                    <div>
                      <div className="text-sm font-medium">
                        {language === 'es' ? 'Tendencia de progreso' : 'Progress trend'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {learningPatterns.progressTrend === 'improving'
                          ? (language === 'es' ? 'Mejorando' : 'Improving')
                          : learningPatterns.progressTrend === 'declining'
                          ? (language === 'es' ? 'Necesita atención' : 'Needs attention')
                          : (language === 'es' ? 'Estable' : 'Stable')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">
                  {language === 'es' ? 'Materias Favoritas' : 'Favorite Subjects'}
                </h4>

                <div className="space-y-2">
                  {learningPatterns.preferredSubjects.slice(0, 3).map((subject, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{subject}</span>
                    </div>
                  ))}
                </div>

                {learningPatterns.strugglingAreas.length > 0 && (
                  <>
                    <h4 className="font-medium text-gray-800 mt-6">
                      {language === 'es' ? 'Áreas que Necesitan Apoyo' : 'Areas Needing Support'}
                    </h4>
                    <div className="space-y-2">
                      {learningPatterns.strugglingAreas.slice(0, 3).map((area, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                            !
                          </div>
                          <span className="text-sm font-medium">{area}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
