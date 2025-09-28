'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Target,
  Clock,
  Brain,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react';
import { useGameProgress } from '@/hooks/useGameProgress';

export default function StudentProgress() {
  const { progress, getRecentSessions, getAchievements } = useGameProgress();
  const recentSessions = getRecentSessions(5);
  const achievements = getAchievements();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Juegos Jugados
                </p>
                <p className="text-2xl font-bold">
                  {progress.totalGamesPlayed}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Puntuación Promedio
                </p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(progress.averageScore)}`}
                >
                  {progress.averageScore.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Racha Actual
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {progress.streak} días
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tiempo Total
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatTime(progress.totalTimeSpent)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Progreso por Materia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(progress.subjectProgress).map(
                ([subject, data]) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{subject}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getScoreBadgeColor(data.averageScore)}
                        >
                          {data.averageScore.toFixed(1)}%
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {data.gamesPlayed} juegos
                        </span>
                      </div>
                    </div>
                    <Progress value={data.averageScore} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Tiempo: {formatTime(data.totalTimeSpent)}</span>
                      <span>
                        Último:{' '}
                        {data.lastPlayed
                          ? formatDate(data.lastPlayed)
                          : 'Nunca'}
                      </span>
                    </div>
                  </div>
                ),
              )}
              {Object.keys(progress.subjectProgress).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aún no has jugado ningún juego
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sesiones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {session.subject}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Grado {session.grade}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.gameType === 'mcq'
                        ? 'Opción Múltiple'
                        : session.gameType === 'truefalse'
                          ? 'Verdadero/Falso'
                          : session.gameType === 'dragdrop'
                            ? 'Arrastrar y Soltar'
                            : session.gameType === 'hotspot'
                              ? 'Hotspots'
                              : 'Juego'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(session.completedAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${getScoreColor(Math.round((session.score / session.totalQuestions) * 100))}`}
                    >
                      {Math.round(
                        (session.score / session.totalQuestions) * 100,
                      )}
                      %
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(session.timeSpent)}
                    </div>
                  </div>
                </div>
              ))}
              {recentSessions.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No hay sesiones recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Logros Desbloqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <Award className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    {achievement}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
