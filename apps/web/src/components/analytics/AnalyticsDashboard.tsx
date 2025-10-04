'use client';

import { useState, useEffect } from 'react';
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Target,
  Clock,
  Activity,
  Award,
  Zap,
  Brain,
  MapPin,
  Download,
  RefreshCw,
} from 'lucide-react';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { AnalyticsData, AnalyticsFilters } from '@/services/analytics/types';
import { ActivityHeatmap } from './ActivityHeatmap';
import { EngagementChart } from './EngagementChart';
import { HeatmapChart } from './HeatmapChart';

interface AnalyticsDashboardProps {
  filters?: AnalyticsFilters;
  showFilters?: boolean;
  compact?: boolean;
}

export function AnalyticsDashboard({ 
  filters = { period: 'week' }, 
  showFilters = true,
  compact = false 
}: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<AnalyticsFilters>(filters);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await AnalyticsService.getAnalyticsData(currentFilters);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [currentFilters]);

  const handleRefresh = () => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await AnalyticsService.getAnalyticsData(currentFilters);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  };

  const handleDownloadReport = async () => {
    try {
      const report = await AnalyticsService.generateReport(currentFilters);
      
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${currentFilters.period}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuzzy-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analíticas en Tiempo Real</h2>
          <p className="text-gray-600">Monitorea el progreso de tus estudiantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className={`grid gap-6 ${compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-fuzzy-purple/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-fuzzy-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.totalStudents}</p>
                <p className="text-sm text-gray-600">Total Estudiantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-fuzzy-green/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-fuzzy-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.averageScore}%</p>
                <p className="text-sm text-gray-600">Promedio General</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-fuzzy-blue/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-fuzzy-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.completionRate}%</p>
                <p className="text-sm text-gray-600">Tasa de Completado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-fuzzy-yellow/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-fuzzy-yellow" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.engagementScore}%</p>
                <p className="text-sm text-gray-600">Engagement</p>
              </div>
            </CardContent>
        </Card>
      </div>

      {!compact && (
        <>
          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Mapa de Calor de Actividad
                </CardTitle>
                <CardDescription>
                  Patrones de actividad por día y hora
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityHeatmap data={analyticsData.heatmapData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Métricas de Engagement
                </CardTitle>
                <CardDescription>
                  Análisis de participación estudiantil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EngagementChart data={analyticsData.engagementMetrics} />
              </CardContent>
            </Card>
          </div>

          {/* Top Students and Activities */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Estudiantes Top
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topStudents.slice(0, 5).map((student, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{student.studentName}</span>
                        {student.improvement > 0 && (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      <Badge variant="outline">{student.averageScore}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Actividades Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HeatmapChart data={analyticsData.popularActivities} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
