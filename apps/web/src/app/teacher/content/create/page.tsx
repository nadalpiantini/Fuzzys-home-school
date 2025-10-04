'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Image,
  Video,
  FileText,
  Brain,
  Gamepad2,
  Plus,
  X,
  Clock,
  Users,
  Target,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

interface ContentFormData {
  title: string;
  description: string;
  type: 'lesson' | 'quiz' | 'game';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  subject: string;
  gradeLevel: string;
  tags: string[];
  media: {
    images: File[];
    videos: File[];
    documents: File[];
  };
  content: {
    sections: Array<{
      id: string;
      title: string;
      type: 'text' | 'image' | 'video' | 'quiz' | 'game';
      content: string;
      order: number;
    }>;
  };
}

function CreateContentForm() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentType =
    (searchParams.get('type') as 'lesson' | 'quiz' | 'game') || 'lesson';

  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    type: contentType,
    difficulty: 'beginner',
    duration: '',
    subject: '',
    gradeLevel: '',
    tags: [],
    media: {
      images: [],
      videos: [],
      documents: [],
    },
    content: {
      sections: [
        {
          id: '1',
          title: language === 'es' ? 'Introducción' : 'Introduction',
          type: 'text',
          content: '',
          order: 1,
        },
      ],
    },
  });

  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleBack = () => {
    router.push('/teacher/content');
  };

  const handleSave = async (publish: boolean = false) => {
    try {
      setIsSaving(true);

      // Validate form
      if (!formData.title.trim()) {
        toast.error(
          language === 'es' ? 'El título es requerido' : 'Title is required',
        );
        return;
      }

      if (!formData.description.trim()) {
        toast.error(
          language === 'es'
            ? 'La descripción es requerida'
            : 'Description is required',
        );
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        language === 'es'
          ? `Contenido ${publish ? 'publicado' : 'guardado'} exitosamente`
          : `Content ${publish ? 'published' : 'saved'} successfully`,
      );

      router.push('/teacher/content');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(
        language === 'es'
          ? 'Error al guardar contenido'
          : 'Error saving content',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: language === 'es' ? 'Nueva Sección' : 'New Section',
      type: 'text' as const,
      content: '',
      order: formData.content.sections.length + 1,
    };

    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        sections: [...prev.content.sections, newSection],
      },
    }));
  };

  const handleUpdateSection = (
    sectionId: string,
    updates: Partial<ContentFormData['content']['sections'][0]>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.map((section) =>
          section.id === sectionId ? { ...section, ...updates } : section,
        ),
      },
    }));
  };

  const handleRemoveSection = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.filter(
          (section) => section.id !== sectionId,
        ),
      },
    }));
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
              {getTypeIcon(formData.type)}
              <h1 className="text-lg sm:text-2xl font-bold">
                <span className="hidden sm:inline">
                  {language === 'es' ? 'Crear Contenido' : 'Create Content'}
                </span>
                <span className="sm:hidden">
                  {language === 'es' ? 'Crear' : 'Create'}
                </span>
              </h1>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Vista Previa' : 'Preview'}
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                variant="outline"
              >
                <Save className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Guardar' : 'Save'}
              </Button>
              <Button onClick={() => handleSave(true)} disabled={isSaving}>
                <Target className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Publicar' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'es'
                    ? 'Información Básica'
                    : 'Basic Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'es' ? 'Título' : 'Title'} *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder={
                      language === 'es'
                        ? 'Ingresa el título del contenido'
                        : 'Enter content title'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'es' ? 'Descripción' : 'Description'} *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder={
                      language === 'es'
                        ? 'Describe el contenido...'
                        : 'Describe the content...'
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'es' ? 'Materia' : 'Subject'}
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      placeholder={
                        language === 'es'
                          ? 'Ej: Matemáticas'
                          : 'E.g: Mathematics'
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'es' ? 'Nivel de Grado' : 'Grade Level'}
                    </label>
                    <Input
                      value={formData.gradeLevel}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gradeLevel: e.target.value,
                        }))
                      }
                      placeholder={
                        language === 'es' ? 'Ej: 5to grado' : 'E.g: 5th grade'
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'es' ? 'Dificultad' : 'Difficulty'}
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          difficulty: e.target.value as any,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="beginner">
                        {language === 'es' ? 'Principiante' : 'Beginner'}
                      </option>
                      <option value="intermediate">
                        {language === 'es' ? 'Intermedio' : 'Intermediate'}
                      </option>
                      <option value="advanced">
                        {language === 'es' ? 'Avanzado' : 'Advanced'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'es' ? 'Duración' : 'Duration'}
                    </label>
                    <Input
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      placeholder={
                        language === 'es' ? 'Ej: 30 min' : 'E.g: 30 min'
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'es' ? 'Etiquetas' : 'Tags'}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder={
                        language === 'es' ? 'Agregar etiqueta' : 'Add tag'
                      }
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
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
                <CardDescription>
                  {language === 'es'
                    ? 'Organiza tu contenido en secciones'
                    : 'Organize your content into sections'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.content.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <Input
                        value={section.title}
                        onChange={(e) =>
                          handleUpdateSection(section.id, {
                            title: e.target.value,
                          })
                        }
                        className="font-medium"
                        placeholder={
                          language === 'es'
                            ? 'Título de la sección'
                            : 'Section title'
                        }
                      />
                      <div className="flex gap-2">
                        <select
                          value={section.type}
                          onChange={(e) =>
                            handleUpdateSection(section.id, {
                              type: e.target.value as any,
                            })
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="text">
                            {language === 'es' ? 'Texto' : 'Text'}
                          </option>
                          <option value="image">
                            {language === 'es' ? 'Imagen' : 'Image'}
                          </option>
                          <option value="video">
                            {language === 'es' ? 'Video' : 'Video'}
                          </option>
                          <option value="quiz">
                            {language === 'es' ? 'Quiz' : 'Quiz'}
                          </option>
                          <option value="game">
                            {language === 'es' ? 'Juego' : 'Game'}
                          </option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSection(section.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={section.content}
                      onChange={(e) =>
                        handleUpdateSection(section.id, {
                          content: e.target.value,
                        })
                      }
                      placeholder={
                        language === 'es'
                          ? 'Contenido de la sección...'
                          : 'Section content...'
                      }
                      rows={4}
                    />
                  </div>
                ))}

                <Button
                  onClick={handleAddSection}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Agregar Sección' : 'Add Section'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Content Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(formData.type)}
                  {language === 'es' ? 'Tipo de Contenido' : 'Content Type'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getTypeColor(formData.type)}>
                  {formData.type === 'lesson'
                    ? language === 'es'
                      ? 'Lección'
                      : 'Lesson'
                    : formData.type === 'quiz'
                      ? 'Quiz'
                      : language === 'es'
                        ? 'Juego'
                        : 'Game'}
                </Badge>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  {language === 'es' ? 'Medios' : 'Media'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    {language === 'es'
                      ? 'Arrastra imágenes aquí'
                      : 'Drag images here'}
                  </p>
                  <Button size="sm" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Subir' : 'Upload'}
                  </Button>
                </div>

                <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    {language === 'es'
                      ? 'Arrastra videos aquí'
                      : 'Drag videos here'}
                  </p>
                  <Button size="sm" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Subir' : 'Upload'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {language === 'es' ? 'Estadísticas' : 'Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {language === 'es' ? 'Secciones:' : 'Sections:'}{' '}
                    {formData.content.sections.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {language === 'es' ? 'Etiquetas:' : 'Tags:'}{' '}
                    {formData.tags.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {language === 'es' ? 'Palabras:' : 'Words:'}{' '}
                    {formData.description.split(' ').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreateContentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full border-b-2 animate-spin border-fuzzy-purple"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <CreateContentForm />
    </Suspense>
  );
}
