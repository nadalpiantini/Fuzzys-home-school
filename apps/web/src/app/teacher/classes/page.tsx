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
  Users,
  Plus,
  Settings,
  Calendar,
  BookOpen,
  BarChart3,
  ArrowLeft,
  UserPlus,
  Edit,
  Trash2,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function ClassesPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [classes] = useState([
    {
      id: 1,
      name: 'Matemáticas 5to Grado',
      students: 24,
      active: true,
      lastActivity: 'Hace 2 horas',
      progress: 78,
    },
    {
      id: 2,
      name: 'Ciencias Naturales 4to',
      students: 22,
      active: true,
      lastActivity: 'Hace 1 día',
      progress: 65,
    },
    {
      id: 3,
      name: 'Historia Dominicana 6to',
      students: 26,
      active: false,
      lastActivity: 'Hace 3 días',
      progress: 45,
    },
  ]);

  const handleBack = () => {
    router.push('/teacher');
  };

  const handleCreateClass = () => {
    toast.info(
      language === 'es' ? 'Creando nueva clase...' : 'Creating new class...',
    );
    // TODO: Implement class creation
  };

  const handleViewClass = (classId: number) => {
    toast.info(language === 'es' ? 'Abriendo clase...' : 'Opening class...');
    router.push(`/teacher/classes/${classId}`);
  };

  const handleEditClass = (classId: number) => {
    toast.info(language === 'es' ? 'Editando clase...' : 'Editing class...');
    // TODO: Implement class editing
  };

  const handleDeleteClass = (classId: number) => {
    toast.info(language === 'es' ? 'Eliminando clase...' : 'Deleting class...');
    // TODO: Implement class deletion
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
              <Users className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es' ? 'Mis Clases' : 'My Classes'}
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
                ? 'Gestiona tus Clases'
                : 'Manage Your Classes'}
            </h2>
            <p className="text-gray-600">
              {language === 'es'
                ? 'Organiza y supervisa el progreso de tus estudiantes'
                : 'Organize and monitor your students progress'}
            </p>
          </div>
          <Button
            onClick={handleCreateClass}
            className="bg-fuzzy-green hover:bg-fuzzy-green/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Nueva Clase' : 'New Class'}
          </Button>
        </div>

        {/* Classes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{classItem.name}</CardTitle>
                    <CardDescription>
                      {classItem.students}{' '}
                      {language === 'es' ? 'estudiantes' : 'students'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClass(classItem.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClass(classItem.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {language === 'es' ? 'Progreso' : 'Progress'}
                    </span>
                    <span className="font-semibold">{classItem.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-fuzzy-green h-2 rounded-full"
                      style={{ width: `${classItem.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={classItem.active ? 'default' : 'secondary'}>
                      {classItem.active
                        ? language === 'es'
                          ? 'Activa'
                          : 'Active'
                        : language === 'es'
                          ? 'Inactiva'
                          : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {classItem.lastActivity}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleViewClass(classItem.id)}
                  >
                    {language === 'es' ? 'Ver Clase' : 'View Class'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-fuzzy-purple/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-fuzzy-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold">72</p>
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
                  <p className="text-2xl font-bold">3</p>
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
                  <BarChart3 className="w-6 h-6 text-fuzzy-blue" />
                </div>
                <div>
                  <p className="text-2xl font-bold">63%</p>
                  <p className="text-sm text-gray-600">
                    {language === 'es'
                      ? 'Promedio Progreso'
                      : 'Average Progress'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
