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
  BookOpen,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Clock,
  FileText,
  Gamepad2,
  Brain,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function ContentPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [content] = useState([
    {
      id: 1,
      title: 'Matemáticas Básicas - Suma y Resta',
      type: 'lesson',
      difficulty: 'beginner',
      duration: '30 min',
      students: 24,
      lastModified: 'Hace 2 días',
      status: 'published',
    },
    {
      id: 2,
      title: 'Quiz de Ciencias - Sistema Solar',
      type: 'quiz',
      difficulty: 'intermediate',
      duration: '15 min',
      students: 22,
      lastModified: 'Hace 1 semana',
      status: 'draft',
    },
    {
      id: 3,
      title: 'Juego de Memoria - Capitales del Mundo',
      type: 'game',
      difficulty: 'beginner',
      duration: '20 min',
      students: 26,
      lastModified: 'Hace 3 días',
      status: 'published',
    },
  ]);

  const handleBack = () => {
    router.push('/teacher');
  };

  const handleCreateContent = (type: string) => {
    toast.info(
      language === 'es'
        ? `Creando nuevo ${type === 'lesson' ? 'lección' : type === 'quiz' ? 'quiz' : 'juego'}...`
        : `Creating new ${type}...`,
    );
    // TODO: Implement content creation
  };

  const handleViewContent = (contentId: number) => {
    toast.info(
      language === 'es' ? 'Abriendo contenido...' : 'Opening content...',
    );
    // TODO: Implement content viewing
  };

  const handleEditContent = (contentId: number) => {
    toast.info(
      language === 'es' ? 'Editando contenido...' : 'Editing content...',
    );
    // TODO: Implement content editing
  };

  const handleDeleteContent = (contentId: number) => {
    toast.info(
      language === 'es' ? 'Eliminando contenido...' : 'Deleting content...',
    );
    // TODO: Implement content deletion
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <FileText className="w-5 h-5" />;
      case 'quiz':
        return <Brain className="w-5 h-5" />;
      case 'game':
        return <Gamepad2 className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson':
        return 'bg-blue-100 text-blue-800';
      case 'quiz':
        return 'bg-green-100 text-green-800';
      case 'game':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <BookOpen className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es' ? 'Crear Contenido' : 'Create Content'}
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
                ? 'Gestiona tu Contenido'
                : 'Manage Your Content'}
            </h2>
            <p className="text-gray-600">
              {language === 'es'
                ? 'Crea lecciones, quizzes y juegos educativos'
                : 'Create lessons, quizzes and educational games'}
            </p>
          </div>
        </div>

        {/* Create Content Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card
            className="card-hover cursor-pointer"
            onClick={() => handleCreateContent('lesson')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {language === 'es' ? 'Nueva Lección' : 'New Lesson'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {language === 'es'
                  ? 'Crea lecciones interactivas con multimedia'
                  : 'Create interactive lessons with multimedia'}
              </p>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Crear Lección' : 'Create Lesson'}
              </Button>
            </CardContent>
          </Card>

          <Card
            className="card-hover cursor-pointer"
            onClick={() => handleCreateContent('quiz')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-green-600" />
                {language === 'es' ? 'Nuevo Quiz' : 'New Quiz'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {language === 'es'
                  ? 'Diseña evaluaciones con IA'
                  : 'Design AI-powered assessments'}
              </p>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Crear Quiz' : 'Create Quiz'}
              </Button>
            </CardContent>
          </Card>

          <Card
            className="card-hover cursor-pointer"
            onClick={() => handleCreateContent('game')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-600" />
                {language === 'es' ? 'Nuevo Juego' : 'New Game'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {language === 'es'
                  ? 'Desarrolla juegos educativos'
                  : 'Develop educational games'}
              </p>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Crear Juego' : 'Create Game'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Content Library */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            {language === 'es' ? 'Biblioteca de Contenido' : 'Content Library'}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card key={item.id} className="card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewContent(item.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditContent(item.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContent(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(item.type)}>
                        {item.type === 'lesson'
                          ? language === 'es'
                            ? 'Lección'
                            : 'Lesson'
                          : item.type === 'quiz'
                            ? 'Quiz'
                            : language === 'es'
                              ? 'Juego'
                              : 'Game'}
                      </Badge>
                      <Badge variant="outline">
                        {item.difficulty === 'beginner'
                          ? language === 'es'
                            ? 'Principiante'
                            : 'Beginner'
                          : item.difficulty === 'intermediate'
                            ? language === 'es'
                              ? 'Intermedio'
                              : 'Intermediate'
                            : language === 'es'
                              ? 'Avanzado'
                              : 'Advanced'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {item.students}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {item.lastModified}
                      </span>
                      <Badge
                        variant={
                          item.status === 'published' ? 'default' : 'secondary'
                        }
                      >
                        {item.status === 'published'
                          ? language === 'es'
                            ? 'Publicado'
                            : 'Published'
                          : language === 'es'
                            ? 'Borrador'
                            : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Lecciones' : 'Lessons'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-gray-600">Quizzes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Juegos' : 'Games'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-fuzzy-purple/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-fuzzy-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold">35</p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Total' : 'Total'}
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
