'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Edit,
  Eye,
  Download,
  Share,
  Clock,
  Users,
  Target,
  FileText,
  Brain,
  Gamepad2,
  Calendar,
  User,
  BookOpen,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

interface ContentData {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'quiz' | 'game';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  subject: string;
  gradeLevel: string;
  tags: string[];
  status: 'draft' | 'published';
  content: {
    sections: Array<{
      id: string;
      title: string;
      type: 'text' | 'image' | 'video' | 'quiz' | 'game';
      content: string;
      order: number;
    }>;
  };
  createdAt: string;
  updatedAt: string;
  author: string;
  students: number;
  views: number;
  completionRate: number;
  averageScore: number;
}

export default function ViewContentPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const contentId = params?.id as string;

  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would come from API
  const mockContent: ContentData = {
    id: contentId,
    title: 'Matemáticas Básicas - Suma y Resta',
    description:
      'Una lección interactiva sobre operaciones básicas de suma y resta para estudiantes de primaria.',
    type: 'lesson',
    difficulty: 'beginner',
    duration: '30 min',
    subject: 'Matemáticas',
    gradeLevel: '3er grado',
    tags: ['matemáticas', 'suma', 'resta', 'básico'],
    status: 'published',
    content: {
      sections: [
        {
          id: '1',
          title: 'Introducción a la Suma',
          type: 'text',
          content:
            'La suma es una operación matemática que nos permite combinar dos o más números para obtener un total.',
          order: 1,
        },
        {
          id: '2',
          title: 'Ejemplos de Suma',
          type: 'text',
          content:
            'Ejemplo 1: 2 + 3 = 5\nEjemplo 2: 7 + 4 = 11\nEjemplo 3: 15 + 8 = 23',
          order: 2,
        },
        {
          id: '3',
          title: 'Introducción a la Resta',
          type: 'text',
          content:
            'La resta es una operación matemática que nos permite quitar una cantidad de otra para encontrar la diferencia.',
          order: 3,
        },
        {
          id: '4',
          title: 'Ejemplos de Resta',
          type: 'text',
          content:
            'Ejemplo 1: 5 - 2 = 3\nEjemplo 2: 10 - 4 = 6\nEjemplo 3: 20 - 8 = 12',
          order: 4,
        },
      ],
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    author: 'Prof. María González',
    students: 24,
    views: 156,
    completionRate: 87,
    averageScore: 92,
  };

  useEffect(() => {
    // Simulate loading content
    const loadContent = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setContent(mockContent);
      setIsLoading(false);
    };

    loadContent();
  }, [contentId]);

  const handleBack = () => {
    router.push('/teacher/content');
  };

  const handleEdit = () => {
    router.push(`/teacher/content/${contentId}/edit`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content?.title,
        text: content?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(
        language === 'es'
          ? 'Enlace copiado al portapapeles'
          : 'Link copied to clipboard',
      );
    }
  };

  const handleDownload = () => {
    toast.info(
      language === 'es' ? 'Descargando contenido...' : 'Downloading content...',
    );
    // In real app, this would generate and download a PDF or other format
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
        return <FileText className="w-5 h-5" />;
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full border-b-2 animate-spin border-fuzzy-purple"></div>
          <p className="text-gray-600">
            {language === 'es' ? 'Cargando contenido...' : 'Loading content...'}
          </p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            {language === 'es'
              ? 'Contenido no encontrado'
              : 'Content not found'}
          </p>
          <Button onClick={handleBack} className="mt-4">
            {language === 'es' ? 'Volver' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="touch-target"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">
                {language === 'es' ? 'Volver' : 'Back'}
              </span>
              <span className="sm:hidden">{language === 'es' ? '←' : '←'}</span>
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              {getTypeIcon(content.type)}
              <h1 className="text-lg sm:text-2xl font-bold">
                <span className="hidden sm:inline">
                  {language === 'es' ? 'Ver Contenido' : 'View Content'}
                </span>
                <span className="sm:hidden">
                  {language === 'es' ? 'Ver' : 'View'}
                </span>
              </h1>
            </div>
            <div className="ml-auto flex gap-2">
              <Button onClick={handleEdit} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Editar' : 'Edit'}
              </Button>
              <Button onClick={handleShare} variant="outline">
                <Share className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Compartir' : 'Share'}
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Descargar' : 'Download'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Content Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {content.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {content.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(content.type)}>
                      {content.type === 'lesson'
                        ? language === 'es'
                          ? 'Lección'
                          : 'Lesson'
                        : content.type === 'quiz'
                          ? 'Quiz'
                          : language === 'es'
                            ? 'Juego'
                            : 'Game'}
                    </Badge>
                    <Badge className={getDifficultyColor(content.difficulty)}>
                      {content.difficulty === 'beginner'
                        ? language === 'es'
                          ? 'Principiante'
                          : 'Beginner'
                        : content.difficulty === 'intermediate'
                          ? language === 'es'
                            ? 'Intermedio'
                            : 'Intermediate'
                          : language === 'es'
                            ? 'Avanzado'
                            : 'Advanced'}
                    </Badge>
                    <Badge
                      variant={
                        content.status === 'published' ? 'default' : 'secondary'
                      }
                    >
                      {content.status === 'published'
                        ? language === 'es'
                          ? 'Publicado'
                          : 'Published'
                        : language === 'es'
                          ? 'Borrador'
                          : 'Draft'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {content.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{content.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {content.students}{' '}
                      {language === 'es' ? 'estudiantes' : 'students'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{content.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>{content.gradeLevel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Sections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'es' ? 'Contenido' : 'Content'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {content.content.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="border-l-4 border-fuzzy-purple pl-4"
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {section.title}
                    </h3>
                    <div className="prose max-w-none">
                      {section.type === 'text' && (
                        <p className="text-gray-700 whitespace-pre-line">
                          {section.content}
                        </p>
                      )}
                      {section.type === 'image' && (
                        <div className="bg-gray-100 rounded-lg p-8 text-center">
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600">
                            {language === 'es' ? 'Imagen: ' : 'Image: '}
                            {section.content}
                          </p>
                        </div>
                      )}
                      {section.type === 'video' && (
                        <div className="bg-gray-100 rounded-lg p-8 text-center">
                          <VideoIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600">
                            {language === 'es' ? 'Video: ' : 'Video: '}
                            {section.content}
                          </p>
                        </div>
                      )}
                      {section.type === 'quiz' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800">
                              {language === 'es' ? 'Quiz' : 'Quiz'}
                            </span>
                          </div>
                          <p className="text-green-700">{section.content}</p>
                        </div>
                      )}
                      {section.type === 'game' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Gamepad2 className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-purple-800">
                              {language === 'es' ? 'Juego' : 'Game'}
                            </span>
                          </div>
                          <p className="text-purple-700">{section.content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Content Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(content.type)}
                  {language === 'es' ? 'Información' : 'Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'es' ? 'Autor:' : 'Author:'}
                  </span>
                  <span className="text-sm">{content.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'es' ? 'Creado:' : 'Created:'}
                  </span>
                  <span className="text-sm">
                    {new Date(content.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'es' ? 'Actualizado:' : 'Updated:'}
                  </span>
                  <span className="text-sm">
                    {new Date(content.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'es' ? 'Vistas:' : 'Views:'}
                  </span>
                  <span className="text-sm">{content.views}</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {language === 'es' ? 'Rendimiento' : 'Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'es'
                      ? 'Tasa de Completado:'
                      : 'Completion Rate:'}
                  </span>
                  <span className="text-sm font-medium">
                    {content.completionRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'es'
                      ? 'Puntuación Promedio:'
                      : 'Average Score:'}
                  </span>
                  <span className="text-sm font-medium">
                    {content.averageScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'es' ? 'Estudiantes:' : 'Students:'}
                  </span>
                  <span className="text-sm font-medium">
                    {content.students}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleEdit}
                  className="w-full"
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Editar' : 'Edit'}
                </Button>
                <Button
                  onClick={handleShare}
                  className="w-full"
                  variant="outline"
                >
                  <Share className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Compartir' : 'Share'}
                </Button>
                <Button
                  onClick={handleDownload}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Descargar' : 'Download'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
