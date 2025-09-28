'use client';

import React, { useState, useEffect } from 'react';
import { AdaptiveService } from '@/services/adaptive/AdaptiveService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Clock,
  Award,
} from 'lucide-react';

interface AdaptiveProgressProps {
  userId: string;
  timeframe?: 'week' | 'month' | 'quarter';
}

export const AdaptiveProgress: React.FC<AdaptiveProgressProps> = ({
  userId,
  timeframe = 'month',
}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await AdaptiveService.getProgressAnalytics(
          userId,
          timeframe,
        );
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading adaptive analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [userId, timeframe]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No hay datos de progreso disponibles
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-100 text-green-800';
      case 'declining':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actividades</p>
                <p className="text-2xl font-bold">{analytics.totalAttempts}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Puntuación Promedio</p>
                <p className="text-2xl font-bold">
                  {Math.round(analytics.averageScore * 100)}%
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Total</p>
                <p className="text-2xl font-bold">
                  {Math.round(analytics.totalTimeSpent / 60)}m
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Racha Actual</p>
                <p className="text-2xl font-bold">
                  {analytics.streakData.current}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  Mejor: {analytics.streakData.longest}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Progreso General
            <Badge className={getTrendColor(analytics.progressTrend)}>
              {getTrendIcon(analytics.progressTrend)}
              {analytics.progressTrend === 'improving'
                ? 'Mejorando'
                : analytics.progressTrend === 'declining'
                  ? 'Necesita atención'
                  : 'Estable'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso actual</span>
              <span>{Math.round(analytics.averageScore * 100)}%</span>
            </div>
            <Progress value={analytics.averageScore * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Concept Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso por Concepto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.conceptProgress).map(
              ([concept, data]: [string, any]) => (
                <div key={concept} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {concept.replace('_', ' ')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {data.attempts} actividades
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {Math.round(data.averageScore * 100)}%
                      </span>
                      <Badge
                        className={getTrendColor(data.trend)}
                        variant="outline"
                      >
                        {getTrendIcon(data.trend)}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={data.averageScore * 100} className="h-2" />
                </div>
              ),
            )}

            {Object.keys(analytics.conceptProgress).length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No hay datos de conceptos disponibles
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights de Aprendizaje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.averageScore > 0.8 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    ¡Excelente progreso!
                  </p>
                  <p className="text-sm text-green-700">
                    Mantienes un rendimiento muy alto. Considera intentar
                    contenido más desafiante.
                  </p>
                </div>
              </div>
            )}

            {analytics.averageScore < 0.5 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">
                    Oportunidad de mejora
                  </p>
                  <p className="text-sm text-yellow-700">
                    Considera revisar los conceptos básicos y practicar más
                    regularmente.
                  </p>
                </div>
              </div>
            )}

            {analytics.streakData.current > 7 && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Award className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800">
                    ¡Racha impresionante!
                  </p>
                  <p className="text-sm text-purple-700">
                    Llevas {analytics.streakData.current} días consecutivos.
                    ¡Sigue así!
                  </p>
                </div>
              </div>
            )}

            {analytics.totalAttempts > 0 &&
              analytics.totalTimeSpent / analytics.totalAttempts > 900 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Aprendizaje reflexivo
                    </p>
                    <p className="text-sm text-blue-700">
                      Tomas tiempo para pensar las respuestas. ¡Esto muestra un
                      aprendizaje profundo!
                    </p>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
