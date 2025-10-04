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
  ArrowLeft,
  BarChart3,
  Download,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  Plus,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { t, language } = useTranslation();
  const router = useRouter();

  const reports = [
    {
      id: 1,
      title: 'Reporte Mensual - Octubre 2024',
      type: 'monthly',
      date: '2024-10-31',
      status: 'completed',
      students: 24,
      subjects: ['Matemáticas', 'Ciencias', 'Lengua'],
      description:
        'Análisis completo del progreso estudiantil del mes de octubre',
    },
    {
      id: 2,
      title: 'Evaluación Trimestral - Q3 2024',
      type: 'quarterly',
      date: '2024-09-30',
      status: 'completed',
      students: 24,
      subjects: ['Todas las materias'],
      description:
        'Reporte trimestral con análisis de rendimiento y recomendaciones',
    },
    {
      id: 3,
      title: 'Reporte de Progreso Individual',
      type: 'individual',
      date: '2024-11-15',
      status: 'draft',
      students: 1,
      subjects: ['Matemáticas'],
      description:
        'Análisis detallado del progreso de un estudiante específico',
    },
  ];

  const handleBack = () => {
    router.push('/teacher');
  };

  const handleCreateReport = () => {
    router.push('/teacher/reports/create');
  };

  const handleViewReport = (reportId: number) => {
    toast.info(language === 'es' ? 'Abriendo reporte...' : 'Opening report...');
    router.push(`/teacher/reports/${reportId}`);
  };

  const handleDownloadReport = (reportId: number) => {
    toast.success(
      language === 'es' ? 'Descargando reporte...' : 'Downloading report...',
    );
    // TODO: Implement actual download
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return language === 'es' ? 'Completado' : 'Completed';
      case 'draft':
        return language === 'es' ? 'Borrador' : 'Draft';
      case 'pending':
        return language === 'es' ? 'Pendiente' : 'Pending';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es' ? 'Reportes' : 'Reports'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleCreateReport}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Nuevo Reporte' : 'New Report'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Volver' : 'Back'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'es' ? 'Reportes Totales' : 'Total Reports'}
                  </p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
                <FileText className="w-8 h-8 text-fuzzy-purple" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'es' ? 'Completados' : 'Completed'}
                  </p>
                  <p className="text-2xl font-bold">
                    {reports.filter((r) => r.status === 'completed').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'es' ? 'Estudiantes' : 'Students'}
                  </p>
                  <p className="text-2xl font-bold">
                    {Math.max(...reports.map((r) => r.students))}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            {language === 'es' ? 'Reportes Recientes' : 'Recent Reports'}
          </h2>

          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    {getStatusText(report.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Report Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {language === 'es' ? 'Fecha:' : 'Date:'} {report.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {language === 'es' ? 'Estudiantes:' : 'Students:'}{' '}
                        {report.students}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {language === 'es' ? 'Tipo:' : 'Type:'} {report.type}
                      </span>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {language === 'es' ? 'Materias:' : 'Subjects:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {report.subjects.map((subject, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewReport(report.id)}
                      className="flex-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {language === 'es' ? 'Ver Reporte' : 'View Report'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {language === 'es'
                ? 'No hay reportes disponibles'
                : 'No reports available'}
            </h3>
            <p className="text-gray-500 mb-4">
              {language === 'es'
                ? 'Crea tu primer reporte para comenzar'
                : 'Create your first report to get started'}
            </p>
            <Button onClick={handleCreateReport}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Crear Reporte' : 'Create Report'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
