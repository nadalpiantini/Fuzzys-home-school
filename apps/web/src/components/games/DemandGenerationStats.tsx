'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDemandGeneration } from '@/hooks/useDemandGeneration';
import {
  BarChart3,
  Users,
  Gamepad2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface DemandGenerationStatsProps {
  userId?: string;
  category?: string;
  className?: string;
}

export const DemandGenerationStats: React.FC<DemandGenerationStatsProps> = ({
  userId,
  category,
  className = '',
}) => {
  const { stats, isLoading, error, fetchDemandStats, clearError } =
    useDemandGeneration(userId);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchDemandStats(category);
    setLastUpdated(new Date());
  }, [fetchDemandStats, category]);

  const handleRefresh = () => {
    fetchDemandStats(category);
    setLastUpdated(new Date());
  };

  if (isLoading && !stats) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fuzzy-purple" />
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button onClick={clearError} variant="outline" size="sm">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No hay estadísticas disponibles</p>
        </div>
      </div>
    );
  }

  const completionRate =
    stats.total_jobs > 0
      ? ((stats.completed / stats.total_jobs) * 100).toFixed(1)
      : '0';

  const successRate =
    stats.completed > 0
      ? ((stats.completed / (stats.completed + stats.failed)) * 100).toFixed(1)
      : '0';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-fuzzy-purple" />
            Generación por Demanda
          </h2>
          <p className="text-gray-600">
            Sistema que genera 3 juegos por cada juego completado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total_jobs}
            </div>
            <p className="text-xs text-gray-500">Trabajos de generación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <p className="text-xs text-gray-500">{completionRate}% del total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-blue-500" />
              Juegos Generados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total_games_generated}
            </div>
            <p className="text-xs text-gray-500">Juegos nuevos creados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Tasa de Éxito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {successRate}%
            </div>
            <p className="text-xs text-gray-500">Jobs exitosos</p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de jobs */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-gray-500">Esperando procesamiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-500" />
              En Proceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.running}
            </div>
            <p className="text-xs text-gray-500">Generando juegos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Fallidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.failed}
            </div>
            <p className="text-xs text-gray-500">Jobs con errores</p>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-fuzzy-purple text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <strong>Usuario completa un juego:</strong> El sistema detecta
                automáticamente cuando un usuario termina de jugar.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-fuzzy-purple text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <strong>Se crea un job de generación:</strong> Se programa la
                creación de 3 juegos nuevos para la categoría del usuario.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-fuzzy-purple text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <strong>DeepSeek genera contenido:</strong> La IA crea juegos
                personalizados con temas dominicanos.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-fuzzy-purple text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <strong>Juegos se comparten:</strong> Los nuevos juegos están
                disponibles para todos los usuarios de la misma categoría.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
