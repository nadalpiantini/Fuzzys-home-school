'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  TrendingUp,
  Trophy,
  Calendar,
  BookOpen,
  Flame,
  Star,
  Clock,
  Target,
  AlertCircle,
  Mail,
  Download,
  Plus,
  Link as LinkIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LinkStudentDialog } from '@/components/parent/LinkStudentDialog';
import { CrossRecommendations } from '@/components/curriculum/CrossRecommendations';

type StudentSummary = {
  studentId: string;
  studentName: string;
  totalPoints: number;
  streakDays: number;
  chapters: ChapterProgress[];
};

type ChapterProgress = {
  curriculumId: string;
  chapterId: string;
  completed: boolean;
  score?: number;
  updatedAt: string;
};

type WeeklyReportData = {
  students: StudentSummary[];
  recommendations: Record<string, any[]>;
};

export default function ParentDashboard() {
  // TODO: Re-enable authentication
  // const { user, loading: authLoading } = useAuth();
  const [reportData, setReportData] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Mock user for demo - remove when auth is enabled
  const user = null;

  useEffect(() => {
    console.log('[ParentDashboard] Demo mode - no auth required');
    // TODO: Re-enable when auth is active
    // if (authLoading) return;
    // if (user?.id) {
    //   fetchWeeklyReport();
    // }
  }, []);

  const fetchWeeklyReport = async () => {
    if (!user?.id) return;

    try {
      console.log('[ParentDashboard] Fetching report for:', user.id);
      setLoading(true);
      const response = await fetch(`/api/parents/weekly-report?parentId=${user.id}`);
      const result = await response.json();

      console.log('[ParentDashboard] Report response:', result);

      if (result.ok && result.data) {
        setReportData(result.data);
        if (result.data.students.length > 0 && !selectedStudent) {
          setSelectedStudent(result.data.students[0].studentId);
        }
      }
    } catch (error) {
      console.error('[ParentDashboard] Error fetching weekly report:', error);
      toast.error('Error al cargar el reporte semanal');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkStudent = async () => {
    // Refresh data after linking
    await fetchWeeklyReport();
  };

  const handleSendEmail = async () => {
    if (!user?.id) {
      toast.error('No se pudo obtener tu ID de usuario');
      return;
    }

    try {
      toast.loading('Enviando reporte por email...', { id: 'send-email' });

      const response = await fetch('/api/parents/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: user.id }),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success('¡Reporte enviado exitosamente!', {
          id: 'send-email',
          description: 'Revisa tu bandeja de entrada',
        });
      } else {
        toast.error(result.error || 'Error al enviar reporte', {
          id: 'send-email',
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Error al enviar reporte', { id: 'send-email' });
    }
  };

  const handleDownloadPDF = async () => {
    toast.info('Generando PDF...');
    // TODO: Implementar generación de PDF
  };

  // TODO: Re-enable loading state when auth is active
  // if (authLoading || loading) {
  //   return (
  //     <div className="container mx-auto p-6">
  //       <div className="animate-pulse space-y-4">
  //         <div className="h-8 w-64 bg-gray-200 rounded"></div>
  //         <div className="grid gap-4 md:grid-cols-3">
  //           {[1, 2, 3].map((i) => (
  //             <div key={i} className="h-32 bg-gray-200 rounded"></div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // TODO: Re-enable authentication when ready
  // if (!user) {
  //   return (
  //     <div className="container mx-auto p-6">
  //       <Card>
  //         <CardContent className="flex flex-col items-center justify-center py-12">
  //           <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
  //           <h3 className="text-xl font-semibold mb-2">Acceso no autorizado</h3>
  //           <p className="text-gray-600 mb-4 text-center">
  //             Debes iniciar sesión para ver el panel de padres
  //           </p>
  //           <Button onClick={() => window.location.href = '/login'}>
  //             Iniciar Sesión
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  const students = reportData?.students || [];
  const currentStudent = students.find((s) => s.studentId === selectedStudent);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Padres</h1>
          <p className="text-gray-600 mt-1">Seguimiento del progreso de tus hijos</p>
        </div>
        <div className="flex gap-2">
          {/* TODO: Re-enable when authentication is active */}
          {/* {user?.id && (
            <LinkStudentDialog
              parentId={user.id}
              onSuccess={handleLinkStudent}
            />
          )} */}
          <Button variant="outline" onClick={handleSendEmail} disabled>
            <Mail className="w-4 h-4 mr-2" />
            Enviar Reporte
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} disabled>
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {students.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay estudiantes vinculados</h3>
            <p className="text-gray-600 mb-4 text-center">
              Vincula a tus hijos para ver su progreso académico
            </p>
            <Button onClick={handleLinkStudent}>
              <LinkIcon className="w-4 h-4 mr-2" />
              Vincular Estudiante
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Student Tabs */}
      {students.length > 0 && (
        <Tabs value={selectedStudent || ''} onValueChange={setSelectedStudent}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${students.length}, 1fr)` }}>
            {students.map((student) => (
              <TabsTrigger key={student.studentId} value={student.studentId}>
                {student.studentName}
              </TabsTrigger>
            ))}
          </TabsList>

          {students.map((student) => (
            <TabsContent key={student.studentId} value={student.studentId} className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Puntos Totales</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{student.totalPoints}</div>
                    <p className="text-xs text-muted-foreground">Esta semana</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
                    <Flame className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{student.streakDays} días</div>
                    <p className="text-xs text-muted-foreground">Consecutivos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Capítulos</CardTitle>
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {student.chapters.filter((c) => c.completed).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Completados esta semana</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio</CardTitle>
                    <Star className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {student.chapters.length > 0
                        ? Math.round(
                            student.chapters.reduce((sum, c) => sum + (c.score || 0), 0) /
                              student.chapters.length
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">De puntuación</p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Details */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Actividad Reciente
                    </CardTitle>
                    <CardDescription>Últimos 7 días</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {student.chapters.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No hay actividad esta semana
                      </p>
                    ) : (
                      student.chapters
                        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                        .slice(0, 5)
                        .map((chapter, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b pb-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {chapter.curriculumId.includes('math') ? '🔢 Matemáticas' :
                                 chapter.curriculumId.includes('literacy') ? '📖 Lectoescritura' :
                                 '🔬 Ciencias'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(chapter.updatedAt).toLocaleDateString('es-DO', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {chapter.completed && (
                                <Badge variant="default" className="bg-green-500">
                                  Completado
                                </Badge>
                              )}
                              {chapter.score && (
                                <span className="text-sm font-semibold">{chapter.score}%</span>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </CardContent>
                </Card>

                {/* Subject Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Progreso por Materia
                    </CardTitle>
                    <CardDescription>Desempeño general</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['math', 'literacy', 'science'].map((subject) => {
                      const subjectChapters = student.chapters.filter((c) =>
                        c.curriculumId.includes(subject)
                      );
                      const avgScore = subjectChapters.length > 0
                        ? Math.round(
                            subjectChapters.reduce((sum, c) => sum + (c.score || 0), 0) /
                              subjectChapters.length
                          )
                        : 0;
                      const completedCount = subjectChapters.filter((c) => c.completed).length;

                      return (
                        <div key={subject} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {subject === 'math' ? '🔢 Matemáticas' :
                               subject === 'literacy' ? '📖 Lectoescritura' :
                               '🔬 Ciencias'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {completedCount} capítulos · {avgScore}%
                            </span>
                          </div>
                          <Progress value={avgScore} className="h-2" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              {reportData?.recommendations?.[student.studentId] && reportData.recommendations[student.studentId].length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Recomendaciones
                    </CardTitle>
                    <CardDescription>Próximos pasos sugeridos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reportData.recommendations[student.studentId].map((rec, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <AlertCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">
                            Continuar con {rec.curriculumId.includes('math') ? 'Matemáticas' :
                                           rec.curriculumId.includes('literacy') ? 'Lectoescritura' :
                                           'Ciencias'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cross-Subject Recommendations */}
              <CrossRecommendations studentId={student.studentId} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
