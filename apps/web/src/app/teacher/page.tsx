'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  BookOpen,
  BarChart3,
  Plus,
  Settings,
  Calendar,
  Target
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function TeacherDashboard() {
  const { t, language } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {t('teacher.dashboard')}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
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
              : 'Manage your classes and create educational content'
            }
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
              <Button className="mt-4 bg-white text-purple-600 hover:bg-gray-100">
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
              <Button className="mt-4 bg-white text-green-600 hover:bg-gray-100">
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
                  : 'Analyze your students\' progress'}
              </p>
              <Button className="mt-4 bg-white text-blue-600 hover:bg-gray-100">
                {language === 'es' ? 'Ver Análisis' : 'View Analytics'}
              </Button>
            </CardContent>
          </Card>
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
                {language === 'es' ? 'Últimas actividades de tus estudiantes' : 'Latest student activities'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  student="María González"
                  action={language === 'es' ? 'Completó Quiz de Matemáticas' : 'Completed Math Quiz'}
                  time="Hace 2 horas"
                />
                <ActivityItem
                  student="Carlos Ruiz"
                  action={language === 'es' ? 'Subió de nivel en Ciencias' : 'Leveled up in Science'}
                  time="Hace 4 horas"
                />
                <ActivityItem
                  student="Ana López"
                  action={language === 'es' ? 'Preguntó al tutor IA' : 'Asked AI tutor'}
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
                {language === 'es' ? 'Tareas que requieren tu atención' : 'Tasks requiring your attention'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {language === 'es' ? '📝 Revisar Tareas' : '📝 Review Assignments'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'es'
                      ? '15 tareas pendientes de revisión'
                      : '15 assignments pending review'}
                  </p>
                  <Button className="w-full" size="sm">
                    {language === 'es' ? 'Revisar' : 'Review'}
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {language === 'es' ? '📊 Crear Reporte' : '📊 Create Report'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'es'
                      ? 'Reporte mensual de progreso'
                      : 'Monthly progress report'}
                  </p>
                  <Button className="w-full" size="sm" variant="outline">
                    {language === 'es' ? 'Crear' : 'Create'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function ActivityItem({ student, action, time }: { student: string, action: string, time: string }) {
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
  )
}
