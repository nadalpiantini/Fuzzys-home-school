'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const analyticsData = {
    overview: {
      totalStudents: 72,
      activeClasses: 3,
      averageScore: 78,
      completionRate: 85,
    },
    performance: [
      { subject: 'Matemáticas', score: 82, trend: 'up' },
      { subject: 'Ciencias', score: 75, trend: 'up' },
      { subject: 'Historia', score: 68, trend: 'down' },
      { subject: 'Lengua', score: 88, trend: 'up' },
    ],
    recentActivity: [
      {
        student: 'María González',
        action: 'Completó Quiz de Matemáticas',
        time: 'Hace 2 horas',
        score: 95,
      },
      {
        student: 'Carlos Ruiz',
        action: 'Subió de nivel en Ciencias',
        time: 'Hace 4 horas',
        score: 87,
      },
      {
        student: 'Ana López',
        action: 'Preguntó al tutor IA',
        time: 'Hace 6 horas',
        score: null,
      },
      {
        student: 'Luis Martínez',
        action: 'Completó Juego de Memoria',
        time: 'Hace 8 horas',
        score: 92,
      },
    ],
  };

  const handleBack = () => {
    router.push('/teacher');
  };

  const handleDownloadReport = () => {
    toast.info(
      language === 'es' ? 'Descargando reporte...' : 'Downloading report...',
    );
    // Basic report download implementation
    const reportData = {
      period: selectedPeriod,
      totalStudents: 24,
      avgScore: 85,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${selectedPeriod}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (period: string) => {
    setSelectedPeriod(period);
    toast.info(language === 'es' ? 'Filtrando datos...' : 'Filtering data...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Volver' : 'Back'}
            </Button>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es' ? 'Analíticas' : 'Analytics'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
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
              <Download className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Descargar' : 'Download'}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-fuzzy-purple/10 rounded-lg flex items-center justify-center">
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
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-fuzzy-green/10 rounded-lg flex items-center justify-center">
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
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-fuzzy-blue/10 rounded-lg flex items-center justify-center">
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
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-fuzzy-yellow/10 rounded-lg flex items-center justify-center">
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

        {/* Performance by Subject */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                {analyticsData.performance.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{subject.subject}</span>
                      <div className="flex items-center gap-1">
                        {subject.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{subject.score}%</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-fuzzy-green h-2 rounded-full"
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
              <CardTitle className="flex items-center gap-2">
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
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-fuzzy-purple/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-fuzzy-purple" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.student}</p>
                      <p className="text-xs text-gray-600">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      {activity.score && (
                        <Badge variant="outline" className="mb-1">
                          {activity.score}%
                        </Badge>
                      )}
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'es' ? 'Estudiantes Top' : 'Top Students'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">María González</span>
                  <Badge>95%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Carlos Ruiz</span>
                  <Badge>87%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ana López</span>
                  <Badge>82%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'es'
                  ? 'Actividades Populares'
                  : 'Popular Activities'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quiz de Matemáticas</span>
                  <span className="text-xs text-gray-500">24 estudiantes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Juego de Memoria</span>
                  <span className="text-xs text-gray-500">22 estudiantes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Simulación PhET</span>
                  <span className="text-xs text-gray-500">18 estudiantes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'es' ? 'Tendencias' : 'Trends'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Participación</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 text-sm">+12%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tiempo de estudio</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 text-sm">+8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Puntuaciones</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 text-sm">+5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
