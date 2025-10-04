'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  User,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Star,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ParentReportDashboard } from '@/components/parent-reports/ParentReportDashboard';
import { ProgressCharts } from '@/components/parent-reports/ProgressCharts';
import { useParentStudents, useStudentAnalytics } from '@/hooks/useParentData';
// import { useTranslation } from '@/lib/i18n/client';

export default function ParentReportsPage() {
  // const { t, language } = useTranslation();
  const language = 'es'; // Fallback for now
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Fetch real data using our hooks
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useParentStudents();
  const {
    data: analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useStudentAnalytics(selectedStudent, period);

  // Set default selected student when students load
  React.useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0].id);
    }
  }, [students, selectedStudent]);

  const handleBack = () => {
    router.push('/parent');
  };

  const handleDownloadAllReports = async () => {
    try {
      // Generate and download PDF reports for all students
      const response = await fetch('/api/parents/reports/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: students.map((s) => s.id),
          period,
          format: 'pdf',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reportes-estudiantes-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading reports:', error);
    }
  };

  const handleShareAllReports = async () => {
    try {
      // Share reports via email
      const response = await fetch('/api/parents/reports/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: students.map((s) => s.id),
          period,
          shareMethod: 'email',
        }),
      });

      if (response.ok) {
        alert(
          language === 'es'
            ? 'Reportes enviados por correo'
            : 'Reports sent by email',
        );
      }
    } catch (error) {
      console.error('Error sharing reports:', error);
    }
  };

  const handleRefresh = () => {
    refetchStudents();
    refetchAnalytics();
  };

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language === 'es'
                    ? 'Reportes de Progreso'
                    : 'Progress Reports'}
                </h1>
                <p className="text-gray-600">
                  {language === 'es'
                    ? 'Seguimiento del aprendizaje de tus hijos'
                    : "Track your children's learning progress"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={studentsLoading || analyticsLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${studentsLoading || analyticsLoading ? 'animate-spin' : ''}`}
                />
                {language === 'es' ? 'Actualizar' : 'Refresh'}
              </Button>
              <Button
                variant="outline"
                onClick={handleShareAllReports}
                disabled={students.length === 0}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Compartir' : 'Share'}
              </Button>
              <Button
                onClick={handleDownloadAllReports}
                disabled={students.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Descargar Todo' : 'Download All'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Error Handling */}
        {studentsError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {language === 'es'
                ? `Error al cargar estudiantes: ${studentsError}`
                : `Error loading students: ${studentsError}`}
            </AlertDescription>
          </Alert>
        )}

        {analyticsError && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-700">
              {language === 'es'
                ? `Error al cargar análisis: ${analyticsError}`
                : `Error loading analytics: ${analyticsError}`}
            </AlertDescription>
          </Alert>
        )}

        {/* Period Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {language === 'es' ? 'Período de Análisis' : 'Analysis Period'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {p === 'week' && (language === 'es' ? 'Semana' : 'Week')}
                  {p === 'month' && (language === 'es' ? 'Mes' : 'Month')}
                  {p === 'year' && (language === 'es' ? 'Año' : 'Year')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {language === 'es' ? 'Seleccionar Estudiante' : 'Select Student'}
              {studentsLoading && <Spinner className="w-4 h-4 ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="w-8 h-8" />
                <span className="ml-2 text-gray-600">
                  {language === 'es'
                    ? 'Cargando estudiantes...'
                    : 'Loading students...'}
                </span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'es'
                  ? 'No se encontraron estudiantes'
                  : 'No students found'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedStudent === student.id
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedStudent(student.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {student.avatar && (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-600">
                            Nivel {student.level} •{' '}
                            {student.totalPoints.toLocaleString()} puntos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            student.overallGrade === 'A'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {student.overallGrade}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {student.streak} días de racha
                          </div>
                          <div className="text-xs text-gray-500">
                            Última:{' '}
                            {new Date(student.lastActivity).toLocaleDateString(
                              'es-ES',
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Tabs */}
        {selectedStudent && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" disabled={analyticsLoading}>
                {language === 'es' ? 'Resumen' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="detailed" disabled={analyticsLoading}>
                {language === 'es' ? 'Detallado' : 'Detailed'}
              </TabsTrigger>
              <TabsTrigger value="charts" disabled={analyticsLoading}>
                {language === 'es' ? 'Gráficos' : 'Charts'}
              </TabsTrigger>
            </TabsList>

            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="w-8 h-8" />
                <span className="ml-2 text-gray-600">
                  {language === 'es'
                    ? 'Cargando análisis...'
                    : 'Loading analytics...'}
                </span>
              </div>
            ) : !analyticsData ? (
              <div className="text-center py-12 text-gray-500">
                {language === 'es'
                  ? 'No hay datos disponibles para este estudiante'
                  : 'No data available for this student'}
              </div>
            ) : (
              <>
                <TabsContent value="overview" className="space-y-6">
                  <ParentReportDashboard
                    studentId={selectedStudent}
                    period={period}
                    analyticsData={analyticsData}
                    language={language}
                  />
                </TabsContent>

                <TabsContent value="detailed" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {language === 'es'
                          ? 'Análisis Detallado por Materia'
                          : 'Detailed Subject Analysis'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsData.subjectBreakdown.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {language === 'es'
                            ? 'No hay actividades registradas para este período'
                            : 'No activities recorded for this period'}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {analyticsData.subjectBreakdown.map(
                            (subject, index) => (
                              <div
                                key={index}
                                className="p-4 border rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">
                                    {subject.subject}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <TrendingUp
                                      className={`w-4 h-4 ${
                                        subject.trend === 'up'
                                          ? 'text-green-500'
                                          : subject.trend === 'down'
                                            ? 'text-red-500'
                                            : 'text-gray-500'
                                      }`}
                                    />
                                    <Badge
                                      variant={
                                        subject.mastery >= 80
                                          ? 'default'
                                          : 'secondary'
                                      }
                                    >
                                      {subject.mastery >= 90
                                        ? 'Excelente'
                                        : subject.mastery >= 80
                                          ? 'Muy Bien'
                                          : subject.mastery >= 70
                                            ? 'Bien'
                                            : subject.mastery >= 60
                                              ? 'Regular'
                                              : 'Necesita Apoyo'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span>{subject.mastery}% dominio</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span>
                                      {subject.timeSpent} min esta{' '}
                                      {period === 'week'
                                        ? 'semana'
                                        : period === 'month'
                                          ? 'mes'
                                          : 'año'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-purple-500" />
                                    <span>
                                      {subject.gamesPlayed}{' '}
                                      {language === 'es'
                                        ? 'actividades'
                                        : 'activities'}
                                    </span>
                                  </div>
                                </div>
                                {subject.recommendations.length > 0 && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                    <h5 className="text-sm font-medium text-blue-800 mb-1">
                                      {language === 'es'
                                        ? 'Recomendaciones:'
                                        : 'Recommendations:'}
                                    </h5>
                                    <ul className="text-xs text-blue-700 list-disc list-inside">
                                      {subject.recommendations.map(
                                        (rec, idx) => (
                                          <li key={idx}>{rec}</li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Achievements */}
                  {analyticsData.recentAchievements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          {language === 'es'
                            ? 'Logros Recientes'
                            : 'Recent Achievements'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analyticsData.recentAchievements.map(
                            (achievement) => (
                              <div
                                key={achievement.id}
                                className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
                              >
                                <Award className="w-6 h-6 text-yellow-600" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-yellow-800">
                                    {achievement.title}
                                  </h4>
                                  <p className="text-sm text-yellow-700">
                                    {achievement.description}
                                  </p>
                                  <p className="text-xs text-yellow-600">
                                    {new Date(
                                      achievement.earnedAt,
                                    ).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="charts" className="space-y-6">
                  <ProgressCharts
                    subjectAnalysis={analyticsData.subjectBreakdown}
                    weeklyBreakdown={analyticsData.weeklyBreakdown}
                    learningPatterns={analyticsData.learningPatterns}
                    language={language}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        )}

        {!selectedStudent && !studentsLoading && students.length > 0 && (
          <div className="text-center py-12 text-gray-500">
            {language === 'es'
              ? 'Selecciona un estudiante para ver sus reportes'
              : 'Select a student to view their reports'}
          </div>
        )}
      </main>
    </div>
  );
}
