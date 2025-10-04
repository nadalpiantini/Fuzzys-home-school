'use client';

import { useState, useEffect } from 'react';
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
  BarChart3,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Target,
  Calendar,
  Download,
  Filter,
  Clock,
  Activity,
  Award,
  Zap,
  Brain,
  MapPin,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { AnalyticsData, AnalyticsFilters } from '@/services/analytics/types';
import { HeatmapChart } from '@/components/analytics/HeatmapChart';
import { EngagementChart } from '@/components/analytics/EngagementChart';
import { ActivityHeatmap } from '@/components/analytics/ActivityHeatmap';

export default function AnalyticsPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] =
    useState<AnalyticsFilters['period']>('week');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const filters: AnalyticsFilters = {
          period: selectedPeriod,
        };
        const data = await AnalyticsService.getAnalyticsData(filters);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast.error('Error cargando analíticas');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedPeriod]);

  const handleBack = () => {
    router.push('/teacher');
  };

  const handleDownloadReport = async () => {
    try {
      toast.info(
        language === 'es' ? 'Generando reporte...' : 'Generating report...',
      );

      const filters: AnalyticsFilters = {
        period: selectedPeriod,
      };
      const report = await AnalyticsService.generateReport(filters);

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Reporte descargado exitosamente');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generando reporte');
    }
  };

  const handleFilterChange = (period: AnalyticsFilters['period']) => {
    setSelectedPeriod(period);
    toast.info(language === 'es' ? 'Filtrando datos...' : 'Filtering data...');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full border-b-2 animate-spin border-fuzzy-purple"></div>
          <p className="text-gray-600">
            {language === 'es'
              ? 'Cargando analíticas...'
              : 'Loading analytics...'}
          </p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
        <div className="text-center">
          <p className="text-gray-600">
            {language === 'es'
              ? 'No hay datos disponibles'
              : 'No data available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex gap-4 items-center">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 w-4 h-4" />
              {language === 'es' ? 'Volver' : 'Back'}
            </Button>
            <div className="flex gap-3 items-center">
              <BarChart3 className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es' ? 'Analíticas' : 'Analytics'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-6 py-8 mx-auto">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="mb-2 text-3xl font-bold">
              {language === 'es'
                ? 'Análisis de Rendimiento'
                : 'Performance Analysis'}
            </h2>
            <p className="text-gray-600">
              {language === 'es'
                ? 'Monitorea el progreso y rendimiento de tus estudiantes'
                : 'Monitor your students progress and performance'}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('week')}
              >
                {language === 'es' ? 'Semana' : 'Week'}
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('month')}
              >
                {language === 'es' ? 'Mes' : 'Month'}
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('year')}
              >
                {language === 'es' ? 'Año' : 'Year'}
              </Button>
            </div>
            <Button onClick={handleDownloadReport}>
              <Download className="mr-2 w-4 h-4" />
              {language === 'es' ? 'Descargar' : 'Download'}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-fuzzy-purple/10">
                  <Users className="w-6 h-6 text-fuzzy-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.totalStudents}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Total Estudiantes' : 'Total Students'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-fuzzy-green/10">
                  <BookOpen className="w-6 h-6 text-fuzzy-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.activeClasses}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Clases Activas' : 'Active Classes'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-fuzzy-blue/10">
                  <Target className="w-6 h-6 text-fuzzy-blue" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.averageScore}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Promedio General' : 'Average Score'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-fuzzy-yellow/10">
                  <TrendingUp className="w-6 h-6 text-fuzzy-yellow" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.completionRate}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'es'
                      ? 'Tasa de Completado'
                      : 'Completion Rate'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-fuzzy-orange/10">
                  <Clock className="w-6 h-6 text-fuzzy-orange" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.totalTimeSpent}m
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Tiempo Total' : 'Total Time'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-fuzzy-pink/10">
                  <Activity className="w-6 h-6 text-fuzzy-pink" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.engagementScore}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Engagement' : 'Engagement'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-fuzzy-cyan/10">
                  <Zap className="w-6 h-6 text-fuzzy-cyan" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {analyticsData.overview.averageSessionTime}m
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Sesión Promedio' : 'Avg Session'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance by Subject */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <BarChart3 className="w-5 h-5" />
                {language === 'es'
                  ? 'Rendimiento por Materia'
                  : 'Performance by Subject'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Puntuaciones promedio por materia'
                  : 'Average scores by subject'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.subjectPerformance.map((subject, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex gap-3 items-center">
                      <span className="font-medium">{subject.subject}</span>
                      <div className="flex gap-1 items-center">
                        {subject.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : subject.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-400 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold">{subject.score}%</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 rounded-full bg-fuzzy-green"
                          style={{ width: `${subject.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Calendar className="w-5 h-5" />
                {language === 'es' ? 'Actividad Reciente' : 'Recent Activity'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Últimas actividades de estudiantes'
                  : 'Latest student activities'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex justify-center items-center w-8 h-8 rounded-full bg-fuzzy-purple/10">
                      <Users className="w-4 h-4 text-fuzzy-purple" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.studentName}
                      </p>
                      <p className="text-xs text-gray-600">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      {activity.score && (
                        <Badge variant="outline" className="mb-1">
                          {activity.score}%
                        </Badge>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heat Map and Engagement Charts */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <MapPin className="w-5 h-5" />
                {language === 'es'
                  ? 'Mapa de Calor de Actividad'
                  : 'Activity Heatmap'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Patrones de actividad por día y hora'
                  : 'Activity patterns by day and hour'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap data={analyticsData.heatmapData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Brain className="w-5 h-5" />
                {language === 'es'
                  ? 'Métricas de Engagement'
                  : 'Engagement Metrics'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Análisis de participación estudiantil'
                  : 'Student participation analysis'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EngagementChart data={analyticsData.engagementMetrics} />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Award className="w-5 h-5" />
                {language === 'es' ? 'Estudiantes Top' : 'Top Students'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.topStudents.slice(0, 5).map((student, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex gap-2 items-center">
                      <span className="text-sm font-medium">
                        {student.studentName}
                      </span>
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
              <CardTitle className="flex gap-2 items-center">
                <Activity className="w-5 h-5" />
                {language === 'es'
                  ? 'Actividades Populares'
                  : 'Popular Activities'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.popularActivities
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{activity.activityName}</span>
                      <span className="text-xs text-gray-500">
                        {activity.playCount} estudiantes
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Clock className="w-5 h-5" />
                {language === 'es' ? 'Tiempo por Capítulo' : 'Chapter Timing'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.chapterTiming
                  .slice(0, 5)
                  .map((chapter, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{chapter.chapterName}</span>
                      <span className="text-xs text-gray-500">
                        {chapter.averageTimeSpent}m
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
