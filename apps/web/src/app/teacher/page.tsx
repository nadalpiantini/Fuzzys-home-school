'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  BarChart3,
  Plus,
  Settings,
  Calendar,
  Target,
  Sparkles,
  Atom,
  Blocks,
  Music,
  MapPin,
  ExternalLink,
  Gamepad2,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TeacherDashboard() {
  const { t, language } = useTranslation();
  const router = useRouter();

  // Handler functions for different actions
  const handleViewClasses = () => {
    toast.info(
      language === 'es'
        ? 'Redirigiendo a clases...'
        : 'Redirecting to classes...',
    );
    // TODO: Implement navigation to classes page
    router.push('/teacher/classes');
  };

  const handleCreateContent = () => {
    toast.info(
      language === 'es'
        ? 'Abriendo creador de contenido...'
        : 'Opening content creator...',
    );
    // TODO: Implement navigation to content creation
    router.push('/teacher/content');
  };

  const handleViewAnalytics = () => {
    toast.info(
      language === 'es' ? 'Cargando analíticas...' : 'Loading analytics...',
    );
    // TODO: Implement navigation to analytics
    router.push('/teacher/analytics');
  };

  const handleSettings = () => {
    toast.info(
      language === 'es' ? 'Abriendo configuración...' : 'Opening settings...',
    );
    // TODO: Implement navigation to settings
    router.push('/teacher/settings');
  };

  const handleUseInClass = (resource: string) => {
    toast.success(
      language === 'es' ? `Abriendo ${resource}...` : `Opening ${resource}...`,
    );
    // TODO: Implement external resource opening
    window.open(
      `https://${resource.toLowerCase().replace(/\s+/g, '')}.com`,
      '_blank',
    );
  };

  const handleViewAll = () => {
    toast.info(
      language === 'es'
        ? 'Mostrando todos los recursos...'
        : 'Showing all resources...',
    );
    // TODO: Implement view all resources
    router.push('/teacher/resources');
  };

  const handleViewReports = () => {
    toast.info(
      language === 'es' ? 'Generando reportes...' : 'Generating reports...',
    );
    // TODO: Implement navigation to reports
    router.push('/teacher/reports');
  };

  const handleReviewTasks = () => {
    toast.info(
      language === 'es'
        ? 'Abriendo tareas pendientes...'
        : 'Opening pending tasks...',
    );
    // TODO: Implement navigation to task review
    router.push('/teacher/tasks');
  };

  const handleCreateReport = () => {
    toast.info(
      language === 'es'
        ? 'Creando reporte mensual...'
        : 'Creating monthly report...',
    );
    // TODO: Implement report creation
    router.push('/teacher/reports/create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">{t('teacher.dashboard')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleSettings}>
                <Settings className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Configuración' : 'Settings'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {t('common.welcome')}, Profesor! 👋
          </h2>
          <p className="text-gray-600">
            {language === 'es'
              ? 'Gestiona tus clases y crea contenido educativo'
              : 'Manage your classes and create educational content'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('teacher.myClasses')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100">
                {language === 'es'
                  ? 'Gestiona tus clases y estudiantes'
                  : 'Manage your classes and students'}
              </p>
              <Button
                className="mt-4 bg-white text-purple-600 hover:bg-gray-100"
                onClick={handleViewClasses}
              >
                {language === 'es' ? 'Ver Clases' : 'View Classes'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t('teacher.createContent')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100">
                {language === 'es'
                  ? 'Crea lecciones y actividades'
                  : 'Create lessons and activities'}
              </p>
              <Button
                className="mt-4 bg-white text-green-600 hover:bg-gray-100"
                onClick={handleCreateContent}
              >
                {language === 'es' ? 'Crear' : 'Create'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t('teacher.analytics')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100">
                {language === 'es'
                  ? 'Analiza el progreso de tus estudiantes'
                  : "Analyze your students' progress"}
              </p>
              <Button
                className="mt-4 bg-white text-blue-600 hover:bg-gray-100"
                onClick={handleViewAnalytics}
              >
                {language === 'es' ? 'Ver Análisis' : 'View Analytics'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* External Resources for Teachers */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-fuzzy-yellow" />
            <h3 className="text-2xl font-bold">
              {language === 'es'
                ? '🎓 Recursos Educativos'
                : '🎓 Educational Resources'}
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            {language === 'es'
              ? 'Más de 100 herramientas y actividades para enriquecer tus clases'
              : '100+ tools and activities to enrich your classes'}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="card-hover cursor-pointer border-2 border-blue-200 hover:border-blue-400 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Atom className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">PhET Simulations</h4>
                    <p className="text-xs text-gray-600">6+ simulaciones</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'es'
                    ? 'Simulaciones interactivas de física y ciencias'
                    : 'Interactive physics and science simulations'}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleUseInClass('PhET Simulations')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Usar en Clase' : 'Use in Class'}
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover cursor-pointer border-2 border-orange-200 hover:border-orange-400 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Blocks className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Blockly Games</h4>
                    <p className="text-xs text-gray-600">7+ juegos</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'es'
                    ? 'Programación visual para principiantes'
                    : 'Visual programming for beginners'}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleUseInClass('Blockly Games')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Usar en Clase' : 'Use in Class'}
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover cursor-pointer border-2 border-purple-200 hover:border-purple-400 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Music Blocks</h4>
                    <p className="text-xs text-gray-600">5+ actividades</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'es'
                    ? 'Integración de música y matemáticas'
                    : 'Music and math integration'}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleUseInClass('Music Blocks')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Usar en Clase' : 'Use in Class'}
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover cursor-pointer border-2 border-green-200 hover:border-green-400 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">AR Colonial</h4>
                    <p className="text-xs text-gray-600">Zona Colonial SD</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'es'
                    ? 'Exploración histórica con realidad aumentada'
                    : 'Historical exploration with AR'}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleUseInClass('AR Colonial')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Usar en Clase' : 'Use in Class'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-indigo-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gamepad2 className="w-5 h-5 text-indigo-600" />
                  {language === 'es'
                    ? 'Recursos Adicionales'
                    : 'Additional Resources'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>GCompris</span>
                    <span className="text-gray-500">20+ actividades</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sugarizer</span>
                    <span className="text-gray-500">15+ herramientas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scratch for Schools</span>
                    <span className="text-gray-500">Programación</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Khan Academy</span>
                    <span className="text-gray-500">Matemáticas</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  size="sm"
                  onClick={handleViewAll}
                >
                  {language === 'es' ? 'Ver Todos' : 'View All'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  {language === 'es' ? 'Seguimiento de Uso' : 'Usage Tracking'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {language === 'es' ? 'Recursos usados' : 'Resources used'}
                    </span>
                    <span className="font-semibold">12/15</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: '80%' }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Tus estudiantes han explorado 80% de los recursos disponibles'
                      : 'Your students have explored 80% of available resources'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  size="sm"
                  onClick={handleViewReports}
                >
                  {language === 'es' ? 'Ver Reportes' : 'View Reports'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-fuzzy-purple" />
                {language === 'es' ? 'Actividad Reciente' : 'Recent Activity'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Últimas actividades de tus estudiantes'
                  : 'Latest student activities'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  student="María González"
                  action={
                    language === 'es'
                      ? 'Completó Quiz de Matemáticas'
                      : 'Completed Math Quiz'
                  }
                  time="Hace 2 horas"
                />
                <ActivityItem
                  student="Carlos Ruiz"
                  action={
                    language === 'es'
                      ? 'Subió de nivel en Ciencias'
                      : 'Leveled up in Science'
                  }
                  time="Hace 4 horas"
                />
                <ActivityItem
                  student="Ana López"
                  action={
                    language === 'es'
                      ? 'Preguntó al tutor IA'
                      : 'Asked AI tutor'
                  }
                  time="Hace 6 horas"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-fuzzy-green" />
                {language === 'es' ? 'Tareas Pendientes' : 'Pending Tasks'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Tareas que requieren tu atención'
                  : 'Tasks requiring your attention'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {language === 'es'
                      ? '📝 Revisar Tareas'
                      : '📝 Review Assignments'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'es'
                      ? '15 tareas pendientes de revisión'
                      : '15 assignments pending review'}
                  </p>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleReviewTasks}
                  >
                    {language === 'es' ? 'Revisar' : 'Review'}
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {language === 'es'
                      ? '📊 Crear Reporte'
                      : '📊 Create Report'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'es'
                      ? 'Reporte mensual de progreso'
                      : 'Monthly progress report'}
                  </p>
                  <Button
                    className="w-full"
                    size="sm"
                    variant="outline"
                    onClick={handleCreateReport}
                  >
                    {language === 'es' ? 'Crear' : 'Create'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ActivityItem({
  student,
  action,
  time,
}: {
  student: string;
  action: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-fuzzy-purple/10 rounded-full flex items-center justify-center">
        <Users className="w-4 h-4 text-fuzzy-purple" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{student}</p>
        <p className="text-xs text-gray-500">{action}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
}
