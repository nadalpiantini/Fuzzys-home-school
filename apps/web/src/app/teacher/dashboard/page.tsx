'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  BookOpen,
  Trophy,
  BarChart3,
  Plus,
  Play,
  Settings,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface ClassInfo {
  id: string;
  name: string;
  students: number;
  activeActivities: number;
  averageScore: number;
}

interface Activity {
  id: string;
  title: string;
  type: string;
  class: string;
  dueDate: string;
  completions: number;
  averageScore: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  progress: number;
  score: number;
}

export default function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const classes: ClassInfo[] = [
    { id: '1', name: 'Matemáticas 8vo A', students: 28, activeActivities: 5, averageScore: 78 },
    { id: '2', name: 'Matemáticas 8vo B', students: 25, activeActivities: 4, averageScore: 82 },
    { id: '3', name: 'Ciencias 7mo', students: 30, activeActivities: 6, averageScore: 75 }
  ];

  const activities: Activity[] = [
    {
      id: '1',
      title: 'Quiz: Ecuaciones Lineales',
      type: 'MCQ',
      class: 'Matemáticas 8vo A',
      dueDate: '2024-01-20',
      completions: 22,
      averageScore: 85
    },
    {
      id: '2',
      title: 'Rally: Zona Colonial',
      type: 'Colonial Rally',
      class: 'Historia 8vo',
      dueDate: '2024-01-25',
      completions: 15,
      averageScore: 92
    },
    {
      id: '3',
      title: 'Práctica: Fotosíntesis',
      type: 'Drag & Drop',
      class: 'Ciencias 7mo',
      dueDate: '2024-01-22',
      completions: 28,
      averageScore: 78
    }
  ];

  const students: Student[] = [
    { id: '1', name: 'Ana Martínez', email: 'ana@school.com', lastActive: 'Hace 2 horas', progress: 85, score: 890 },
    { id: '2', name: 'Carlos Pérez', email: 'carlos@school.com', lastActive: 'Hace 1 día', progress: 72, score: 750 },
    { id: '3', name: 'María González', email: 'maria@school.com', lastActive: 'Hace 3 horas', progress: 93, score: 1020 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard del Profesor</h1>
          <p className="text-gray-600">Bienvenido de vuelta, Prof. Rodríguez</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estudiantes Totales</p>
                <p className="text-2xl font-bold mt-1">83</p>
                <p className="text-xs text-green-600 mt-1">+5 este mes</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actividades Activas</p>
                <p className="text-2xl font-bold mt-1">15</p>
                <p className="text-xs text-gray-500 mt-1">3 vencen hoy</p>
              </div>
              <BookOpen className="w-10 h-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promedio General</p>
                <p className="text-2xl font-bold mt-1">78.5%</p>
                <p className="text-xs text-green-600 mt-1">↑ 3.2%</p>
              </div>
              <Target className="w-10 h-10 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Participación</p>
                <p className="text-2xl font-bold mt-1">92%</p>
                <p className="text-xs text-green-600 mt-1">↑ 5%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="activities">Actividades</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="analytics">Analítica</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/teacher/create-quiz">
                  <Button className="w-full" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Quiz
                  </Button>
                </Link>
                <Link href="/teacher/live-quiz">
                  <Button className="w-full" variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Quiz en Vivo
                  </Button>
                </Link>
                <Link href="/colonial-rally">
                  <Button className="w-full" variant="outline">
                    <Trophy className="mr-2 h-4 w-4" />
                    Iniciar Rally
                  </Button>
                </Link>
                <Link href="/teacher/reports">
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver Reportes
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Ana Martínez completó "Quiz: Ecuaciones"</p>
                    <p className="text-sm text-gray-500">Hace 15 minutos - Puntuación: 95%</p>
                  </div>
                  <Button size="sm" variant="ghost">Ver</Button>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">5 estudiantes iniciaron "Rally Zona Colonial"</p>
                    <p className="text-sm text-gray-500">Hace 1 hora</p>
                  </div>
                  <Button size="sm" variant="ghost">Ver</Button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Carlos Pérez necesita ayuda con "Fotosíntesis"</p>
                    <p className="text-sm text-gray-500">Hace 2 horas - 3 intentos fallidos</p>
                  </div>
                  <Button size="sm" variant="ghost">Ayudar</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Actividades</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Actividad
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Título</th>
                      <th className="text-left py-2">Tipo</th>
                      <th className="text-left py-2">Clase</th>
                      <th className="text-left py-2">Vencimiento</th>
                      <th className="text-left py-2">Completado</th>
                      <th className="text-left py-2">Promedio</th>
                      <th className="text-left py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr key={activity.id} className="border-b">
                        <td className="py-3">{activity.title}</td>
                        <td className="py-3">{activity.type}</td>
                        <td className="py-3">{activity.class}</td>
                        <td className="py-3">{activity.dueDate}</td>
                        <td className="py-3">{activity.completions}/30</td>
                        <td className="py-3">{activity.averageScore}%</td>
                        <td className="py-3">
                          <Button size="sm" variant="ghost">Ver</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Estudiantes</h2>
                <div className="flex space-x-2">
                  <select
                    className="px-3 py-2 border rounded-lg"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="all">Todas las clases</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  <Button variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Nombre</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Última Actividad</th>
                      <th className="text-left py-2">Progreso</th>
                      <th className="text-left py-2">Puntos</th>
                      <th className="text-left py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="py-3">{student.name}</td>
                        <td className="py-3">{student.email}</td>
                        <td className="py-3">{student.lastActive}</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-sm">{student.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3">{student.score}</td>
                        <td className="py-3">
                          <Button size="sm" variant="ghost">Ver Perfil</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Analítica de Rendimiento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Rendimiento por Tipo de Actividad</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Quiz MCQ</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Drag & Drop</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gap Fill</span>
                      <span className="font-medium">72%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Live Quiz</span>
                      <span className="font-medium">91%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Temas con Mayor Dificultad</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Ecuaciones Cuadráticas</span>
                      <span className="text-red-600">62%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Fotosíntesis</span>
                      <span className="text-yellow-600">68%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Guerra de Independencia</span>
                      <span className="text-yellow-600">71%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-2">Recomendaciones</h3>
                <ul className="text-sm space-y-1 text-blue-800">
                  <li>• Reforzar el tema de Ecuaciones Cuadráticas con más ejercicios prácticos</li>
                  <li>• Los estudiantes responden mejor a actividades interactivas (Live Quiz)</li>
                  <li>• Considerar sesiones de tutoría para estudiantes con progreso menor al 70%</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}