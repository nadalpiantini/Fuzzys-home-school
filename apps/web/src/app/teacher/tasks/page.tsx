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
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  CheckSquare,
  Clock,
  AlertCircle,
  Users,
  Calendar,
  BookOpen,
  Plus,
  Filter,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function TasksPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const tasks = [
    {
      id: 1,
      title: 'Revisar tareas de Matemáticas - Grado 3A',
      type: 'grading',
      priority: 'high',
      dueDate: '2024-11-20',
      students: 24,
      subject: 'Matemáticas',
      description: 'Revisar y calificar 24 tareas de suma y resta',
      completed: false,
    },
    {
      id: 2,
      title: 'Preparar material para clase de Ciencias',
      type: 'preparation',
      priority: 'medium',
      dueDate: '2024-11-18',
      students: 0,
      subject: 'Ciencias',
      description: 'Preparar experimento de plantas para la próxima clase',
      completed: false,
    },
    {
      id: 3,
      title: 'Reunión con padres - Estudiante Juan Pérez',
      type: 'meeting',
      priority: 'high',
      dueDate: '2024-11-22',
      students: 1,
      subject: 'General',
      description: 'Reunión para discutir el progreso del estudiante',
      completed: false,
    },
    {
      id: 4,
      title: 'Actualizar plan de estudios',
      type: 'planning',
      priority: 'low',
      dueDate: '2024-11-25',
      students: 0,
      subject: 'General',
      description:
        'Revisar y actualizar el plan de estudios para el próximo trimestre',
      completed: true,
    },
  ];

  const handleBack = () => {
    router.push('/teacher');
  };

  const handleTaskComplete = (taskId: number) => {
    toast.success(language === 'es' ? 'Tarea completada' : 'Task completed');
    // TODO: Implement actual task completion
  };

  const handleCreateTask = () => {
    toast.info(
      language === 'es' ? 'Creando nueva tarea...' : 'Creating new task...',
    );
    // TODO: Implement task creation
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return language === 'es' ? 'Alta' : 'High';
      case 'medium':
        return language === 'es' ? 'Media' : 'Medium';
      case 'low':
        return language === 'es' ? 'Baja' : 'Low';
      default:
        return priority;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grading':
        return <CheckSquare className="w-4 h-4" />;
      case 'preparation':
        return <BookOpen className="w-4 h-4" />;
      case 'meeting':
        return <Users className="w-4 h-4" />;
      case 'planning':
        return <Calendar className="w-4 h-4" />;
      default:
        return <CheckSquare className="w-4 h-4" />;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    if (filter === 'high') return task.priority === 'high';
    return true;
  });

  const pendingTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es' ? 'Tareas Pendientes' : 'Pending Tasks'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleCreateTask}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Nueva Tarea' : 'New Task'}
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
                    {language === 'es' ? 'Tareas Pendientes' : 'Pending Tasks'}
                  </p>
                  <p className="text-2xl font-bold text-orange-500">
                    {pendingTasks}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'es' ? 'Completadas' : 'Completed'}
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {completedTasks}
                  </p>
                </div>
                <CheckSquare className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'es' ? 'Total' : 'Total'}
                  </p>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                </div>
                <Clock className="w-8 h-8 text-fuzzy-purple" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              {language === 'es' ? 'Todas' : 'All'}
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              {language === 'es' ? 'Pendientes' : 'Pending'}
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              {language === 'es' ? 'Completadas' : 'Completed'}
            </Button>
            <Button
              variant={filter === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('high')}
            >
              {language === 'es' ? 'Alta Prioridad' : 'High Priority'}
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={`${task.completed ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleTaskComplete(task.id)}
                      className="mt-1"
                    />
                    <div>
                      <CardTitle
                        className={`text-lg ${task.completed ? 'line-through' : ''}`}
                      >
                        {task.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {task.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {getPriorityText(task.priority)}
                    </Badge>
                    <Badge variant="outline">{task.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Task Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {language === 'es' ? 'Vence:' : 'Due:'} {task.dueDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {language === 'es' ? 'Estudiantes:' : 'Students:'}{' '}
                        {task.students}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(task.type)}
                      <span className="text-gray-600">
                        {language === 'es' ? 'Materia:' : 'Subject:'}{' '}
                        {task.subject}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {!task.completed && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleTaskComplete(task.id)}
                        className="flex-1"
                      >
                        <CheckSquare className="w-4 h-4 mr-2" />
                        {language === 'es'
                          ? 'Marcar como Completada'
                          : 'Mark as Completed'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {language === 'es'
                ? 'No hay tareas disponibles'
                : 'No tasks available'}
            </h3>
            <p className="text-gray-500 mb-4">
              {language === 'es'
                ? 'No se encontraron tareas con los filtros seleccionados'
                : 'No tasks found with the selected filters'}
            </p>
            <Button onClick={handleCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Crear Tarea' : 'Create Task'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
