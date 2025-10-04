'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Award,
  BookOpen,
  Gamepad2,
  Brain,
  Target,
  Zap,
} from 'lucide-react';
import { ParentAnalyticsData } from '@/app/api/parents/analytics/[studentId]/route';

interface ParentReportDashboardProps {
  studentId: string;
  period: 'week' | 'month' | 'year';
  analyticsData: ParentAnalyticsData;
  language?: string;
}

export function ParentReportDashboard({
  studentId,
  period,
  analyticsData,
  language = 'es',
}: ParentReportDashboardProps) {
  const { studentInfo, weeklyData, subjectBreakdown, recentAchievements } = analyticsData;

  const getPeriodText = () => {
    switch (period) {
      case 'week':
        return language === 'es' ? 'esta semana' : 'this week';
      case 'month':
        return language === 'es' ? 'este mes' : 'this month';
      case 'year':
        return language === 'es' ? 'este año' : 'this year';
      default:
        return language === 'es' ? 'período' : 'period';
    }
  };

  const getStreakText = (streak: number) => {
    if (streak === 0) return language === 'es' ? 'Sin racha activa' : 'No active streak';
    if (streak === 1) return language === 'es' ? '1 día de racha' : '1 day streak';
    return language === 'es' ? `${streak} días de racha` : `${streak} day streak`;
  };

  const getProgressMessage = () => {
    const avgScore = weeklyData.averageScore;
    if (avgScore >= 90) {
      return language === 'es'
        ? '¡Excelente trabajo! El progreso es excepcional.'
        : 'Excellent work! Progress is exceptional.';
    } else if (avgScore >= 80) {
      return language === 'es'
        ? 'Muy buen progreso. ¡Sigue así!'
        : 'Very good progress. Keep it up!';
    } else if (avgScore >= 70) {
      return language === 'es'
        ? 'Buen progreso, con algunas áreas de mejora.'
        : 'Good progress, with some areas for improvement.';
    } else {
      return language === 'es'
        ? 'Hay oportunidades para mejorar. ¡Sigamos trabajando juntos!'
        : 'There are opportunities to improve. Let\'s keep working together!';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'es' ? `Reporte de ${studentInfo.name}` : `${studentInfo.name}'s Report`}
        </h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            {language === 'es' ? 'Nivel' : 'Level'} {studentInfo.level}
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-4 h-4 text-purple-500" />
            {studentInfo.totalPoints.toLocaleString()} {language === 'es' ? 'puntos totales' : 'total points'}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-orange-500" />
            {getStreakText(studentInfo.streak)}
          </span>
        </div>
      </div>

      {/* Progress Message */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-blue-800 font-medium">{getProgressMessage()}</p>
              <p className="text-blue-600 text-sm">
                {language === 'es' ? `Análisis de ${getPeriodText()}` : `Analysis for ${getPeriodText()}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'es' ? 'Promedio General' : 'Overall Average'}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {weeklyData.averageScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'es' ? 'Puntuación promedio' : 'Average score'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'es' ? 'Tiempo de Estudio' : 'Study Time'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {weeklyData.totalTimeSpent}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'es' ? `minutos ${getPeriodText()}` : `minutes ${getPeriodText()}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'es' ? 'Actividades Completadas' : 'Activities Completed'}
            </CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {weeklyData.gamesCompleted}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'es' ? `juegos ${getPeriodText()}` : `games ${getPeriodText()}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'es' ? 'Logros Obtenidos' : 'Achievements Earned'}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {weeklyData.achievementsEarned}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'es' ? `logros ${getPeriodText()}` : `achievements ${getPeriodText()}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {language === 'es' ? 'Rendimiento por Materias' : 'Subject Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjectBreakdown.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {language === 'es'
                ? 'No hay datos de materias para este período'
                : 'No subject data for this period'}
            </div>
          ) : (
            <div className="space-y-4">
              {subjectBreakdown.slice(0, 5).map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: subject.mastery >= 80 ? '#10B981' : subject.mastery >= 60 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                    <div>
                      <h4 className="font-medium">{subject.subject}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        {subject.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                        {subject.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                        {subject.mastery}% {language === 'es' ? 'dominio' : 'mastery'} • {subject.timeSpent} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={subject.mastery} className="w-20" />
                    <Badge variant={subject.mastery >= 80 ? 'default' : 'secondary'}>
                      {subject.mastery >= 90 ? (language === 'es' ? 'Excelente' : 'Excellent') :
                       subject.mastery >= 80 ? (language === 'es' ? 'Muy Bien' : 'Very Good') :
                       subject.mastery >= 70 ? (language === 'es' ? 'Bien' : 'Good') :
                       subject.mastery >= 60 ? (language === 'es' ? 'Regular' : 'Fair') :
                       (language === 'es' ? 'Necesita Apoyo' : 'Needs Support')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              {language === 'es' ? 'Logros Recientes' : 'Recent Achievements'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentAchievements.slice(0, 4).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Award className="w-6 h-6 text-yellow-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800">{achievement.title}</h4>
                    <p className="text-sm text-yellow-700">{achievement.description}</p>
                    <p className="text-xs text-yellow-600">
                      {new Date(achievement.earnedAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
