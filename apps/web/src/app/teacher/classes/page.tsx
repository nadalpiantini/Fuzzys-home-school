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
  Loader2,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

export default function ClassesPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch classes using tRPC
  const {
    data: classes,
    isLoading,
    refetch,
  } = trpc.classes.getByTeacher.useQuery({});

  // Create class mutation
  const createClassMutation = trpc.classes.create.useMutation({
    onSuccess: () => {
      toast.success(
        language === 'es'
          ? 'Clase creada exitosamente'
          : 'Class created successfully',
      );
      refetch();
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsCreating(false);
    },
  });

  // Delete class mutation
  const deleteClassMutation = trpc.classes.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'es' ? 'Clase eliminada' : 'Class deleted');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = trpc.classes.toggleActive.useMutation({
    onSuccess: () => {
      toast.success(
        language === 'es' ? 'Estado actualizado' : 'Status updated',
      );
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleBack = () => {
    router.push('/teacher');
  };

  const handleCreateClass = () => {
    setIsCreating(true);
    // For now, create a sample class - in real implementation, this would open a form
    createClassMutation.mutate({
      name: `Nueva Clase ${Date.now()}`,
      description: 'Descripción de la nueva clase',
      subjectId: '00000000-0000-0000-0000-000000000000', // Default subject ID
      gradeLevel: 5,
      maxStudents: 30,
    });
  };

  const handleViewClass = (classId: string) => {
    router.push(`/teacher/classes/${classId}`);
  };

  const handleEditClass = (classId: string) => {
    router.push(`/teacher/classes/${classId}/edit`);
  };

  const handleDeleteClass = (classId: string) => {
    if (
      confirm(
        language === 'es'
          ? '¿Estás seguro de eliminar esta clase?'
          : 'Are you sure you want to delete this class?',
      )
    ) {
      deleteClassMutation.mutate({ classId });
    }
  };

  const handleToggleActive = (classId: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ classId, isActive: !isActive });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>
            {language === 'es' ? 'Cargando clases...' : 'Loading classes...'}
          </span>
        </div>
      </div>
    );
  }

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
          {classes && classes.length > 0 ? (
            classes.map((classItem: any) => (
              <Card key={classItem.id} className="card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {classItem.name}
                      </CardTitle>
                      <CardDescription>
                        {classItem.studentCount || 0}{' '}
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
                        {language === 'es' ? 'Estado' : 'Status'}
                      </span>
                      <Badge
                        variant={classItem.is_active ? 'default' : 'secondary'}
                      >
                        {classItem.is_active
                          ? language === 'es'
                            ? 'Activa'
                            : 'Active'
                          : language === 'es'
                            ? 'Inactiva'
                            : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'es' ? 'Código' : 'Code'}
                      </span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {classItem.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'es' ? 'Grado' : 'Grade'}
                      </span>
                      <span className="font-semibold">
                        {classItem.grade_level}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleActive(classItem.id, classItem.is_active)
                        }
                        className="flex-1"
                      >
                        {classItem.is_active
                          ? language === 'es'
                            ? 'Desactivar'
                            : 'Deactivate'
                          : language === 'es'
                            ? 'Activar'
                            : 'Activate'}
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleViewClass(classItem.id)}
                      >
                        {language === 'es' ? 'Ver' : 'View'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {language === 'es' ? 'No tienes clases aún' : 'No classes yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {language === 'es'
                  ? 'Crea tu primera clase para comenzar a gestionar estudiantes'
                  : 'Create your first class to start managing students'}
              </p>
              <Button
                onClick={handleCreateClass}
                disabled={isCreating}
                className="bg-fuzzy-green hover:bg-fuzzy-green/90"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'es' ? 'Creando...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {language === 'es'
                      ? 'Crear Primera Clase'
                      : 'Create First Class'}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {classes && classes.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-fuzzy-purple/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-fuzzy-purple" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {classes.reduce(
                        (total, cls) => total + (cls.studentCount || 0),
                        0,
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {language === 'es'
                        ? 'Total Estudiantes'
                        : 'Total Students'}
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
                      {classes.filter((cls) => cls.is_active).length}
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
                    <BarChart3 className="w-6 h-6 text-fuzzy-blue" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{classes.length}</p>
                    <p className="text-sm text-gray-600">
                      {language === 'es' ? 'Total Clases' : 'Total Classes'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
