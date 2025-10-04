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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, FileText, Calendar, Users, Save, Eye } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function CreateReportPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const [reportData, setReportData] = useState({
    title: '',
    type: 'monthly',
    dateRange: {
      start: '',
      end: '',
    },
    students: [] as string[],
    subjects: [] as string[],
    includeAnalytics: true,
    includeRecommendations: true,
    includeCharts: true,
    description: '',
  });

  const availableStudents = [
    'Juan Pérez',
    'María González',
    'Carlos Rodríguez',
    'Ana Martínez',
    'Luis Fernández',
    'Sofia López',
    'Diego García',
    'Isabella Torres',
  ];

  const availableSubjects = [
    'Matemáticas',
    'Ciencias',
    'Lengua',
    'Historia',
    'Arte',
    'Educación Física',
  ];

  const handleBack = () => {
    router.push('/teacher/reports');
  };

  const handleStudentToggle = (student: string) => {
    setReportData((prev) => ({
      ...prev,
      students: prev.students.includes(student)
        ? prev.students.filter((s) => s !== student)
        : [...prev.students, student],
    }));
  };

  const handleSubjectToggle = (subject: string) => {
    setReportData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleGenerateReport = async () => {
    if (
      !reportData.title ||
      !reportData.dateRange.start ||
      !reportData.dateRange.end
    ) {
      toast.error(
        language === 'es'
          ? 'Por favor completa todos los campos requeridos'
          : 'Please fill in all required fields',
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        language === 'es'
          ? 'Reporte generado exitosamente'
          : 'Report generated successfully',
      );

      // Navigate to the generated report
      router.push('/teacher/reports');
    } catch (error) {
      toast.error(
        language === 'es'
          ? 'Error al generar el reporte'
          : 'Error generating report',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    toast.info(
      language === 'es' ? 'Vista previa del reporte...' : 'Report preview...',
    );
    // TODO: Implement preview functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es' ? 'Crear Reporte' : 'Create Report'}
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Volver' : 'Back'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'es'
                      ? 'Configuración del Reporte'
                      : 'Report Configuration'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'es'
                      ? 'Configura los parámetros para generar tu reporte'
                      : 'Configure the parameters to generate your report'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">
                        {language === 'es'
                          ? 'Título del Reporte'
                          : 'Report Title'}{' '}
                        *
                      </Label>
                      <Input
                        id="title"
                        value={reportData.title}
                        onChange={(e) =>
                          setReportData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder={
                          language === 'es'
                            ? 'Ej: Reporte Mensual - Octubre 2024'
                            : 'E.g: Monthly Report - October 2024'
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">
                        {language === 'es' ? 'Tipo de Reporte' : 'Report Type'}
                      </Label>
                      <Select
                        value={reportData.type}
                        onValueChange={(value) =>
                          setReportData((prev) => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">
                            {language === 'es' ? 'Mensual' : 'Monthly'}
                          </SelectItem>
                          <SelectItem value="quarterly">
                            {language === 'es' ? 'Trimestral' : 'Quarterly'}
                          </SelectItem>
                          <SelectItem value="yearly">
                            {language === 'es' ? 'Anual' : 'Yearly'}
                          </SelectItem>
                          <SelectItem value="custom">
                            {language === 'es' ? 'Personalizado' : 'Custom'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">
                          {language === 'es' ? 'Fecha de Inicio' : 'Start Date'}{' '}
                          *
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={reportData.dateRange.start}
                          onChange={(e) =>
                            setReportData((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                start: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">
                          {language === 'es' ? 'Fecha de Fin' : 'End Date'} *
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={reportData.dateRange.end}
                          onChange={(e) =>
                            setReportData((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                end: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">
                        {language === 'es' ? 'Descripción' : 'Description'}
                      </Label>
                      <Textarea
                        id="description"
                        value={reportData.description}
                        onChange={(e) =>
                          setReportData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder={
                          language === 'es'
                            ? 'Descripción opcional del reporte...'
                            : 'Optional report description...'
                        }
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Students Selection */}
                  <div className="space-y-4">
                    <Label>
                      {language === 'es'
                        ? 'Estudiantes a Incluir'
                        : 'Students to Include'}
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                      {availableStudents.map((student) => (
                        <div
                          key={student}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`student-${student}`}
                            checked={reportData.students.includes(student)}
                            onCheckedChange={() => handleStudentToggle(student)}
                          />
                          <Label
                            htmlFor={`student-${student}`}
                            className="text-sm cursor-pointer"
                          >
                            {student}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subjects Selection */}
                  <div className="space-y-4">
                    <Label>
                      {language === 'es'
                        ? 'Materias a Incluir'
                        : 'Subjects to Include'}
                    </Label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                      {availableSubjects.map((subject) => (
                        <div
                          key={subject}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`subject-${subject}`}
                            checked={reportData.subjects.includes(subject)}
                            onCheckedChange={() => handleSubjectToggle(subject)}
                          />
                          <Label
                            htmlFor={`subject-${subject}`}
                            className="text-sm cursor-pointer"
                          >
                            {subject}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Report Options */}
                  <div className="space-y-4">
                    <Label>
                      {language === 'es'
                        ? 'Opciones del Reporte'
                        : 'Report Options'}
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="analytics"
                          checked={reportData.includeAnalytics}
                          onCheckedChange={(checked) =>
                            setReportData((prev) => ({
                              ...prev,
                              includeAnalytics: checked as boolean,
                            }))
                          }
                        />
                        <Label htmlFor="analytics" className="cursor-pointer">
                          {language === 'es'
                            ? 'Incluir Análisis Detallado'
                            : 'Include Detailed Analytics'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recommendations"
                          checked={reportData.includeRecommendations}
                          onCheckedChange={(checked) =>
                            setReportData((prev) => ({
                              ...prev,
                              includeRecommendations: checked as boolean,
                            }))
                          }
                        />
                        <Label
                          htmlFor="recommendations"
                          className="cursor-pointer"
                        >
                          {language === 'es'
                            ? 'Incluir Recomendaciones'
                            : 'Include Recommendations'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="charts"
                          checked={reportData.includeCharts}
                          onCheckedChange={(checked) =>
                            setReportData((prev) => ({
                              ...prev,
                              includeCharts: checked as boolean,
                            }))
                          }
                        />
                        <Label htmlFor="charts" className="cursor-pointer">
                          {language === 'es'
                            ? 'Incluir Gráficos'
                            : 'Include Charts'}
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'es' ? 'Vista Previa' : 'Preview'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <p className="font-medium">
                        {language === 'es' ? 'Título:' : 'Title:'}{' '}
                        {reportData.title || 'Sin título'}
                      </p>
                      <p className="text-gray-600">
                        {language === 'es' ? 'Tipo:' : 'Type:'}{' '}
                        {reportData.type}
                      </p>
                      <p className="text-gray-600">
                        {language === 'es' ? 'Período:' : 'Period:'}{' '}
                        {reportData.dateRange.start} -{' '}
                        {reportData.dateRange.end}
                      </p>
                      <p className="text-gray-600">
                        {language === 'es' ? 'Estudiantes:' : 'Students:'}{' '}
                        {reportData.students.length}
                      </p>
                      <p className="text-gray-600">
                        {language === 'es' ? 'Materias:' : 'Subjects:'}{' '}
                        {reportData.subjects.length}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreview}
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {language === 'es' ? 'Vista Previa' : 'Preview'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {language === 'es' ? 'Generando...' : 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {language === 'es'
                            ? 'Generar Reporte'
                            : 'Generate Report'}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="w-full"
                    >
                      {language === 'es' ? 'Cancelar' : 'Cancel'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
