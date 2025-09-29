'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Play,
  Download,
  BookOpen,
  Video,
  FileText,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ResourcePageProps {
  params: {
    subjectId: string;
    resourceName: string;
  };
}

export default function ResourcePage({ params }: ResourcePageProps) {
  const { language } = useTranslation();
  const router = useRouter();
  const { subjectId, resourceName } = params;
  const decodedResourceName = decodeURIComponent(resourceName);

  const getSubjectInfo = (id: string) => {
    const subjects: {
      [key: string]: { title: string; color: string; icon: string };
    } = {
      math: { title: 'Matemáticas', color: 'bg-blue-500', icon: '🧮' },
      science: { title: 'Ciencias', color: 'bg-green-500', icon: '🔬' },
      history: { title: 'Historia', color: 'bg-purple-500', icon: '🌍' },
      language: { title: 'Lenguaje', color: 'bg-yellow-500', icon: '📚' },
      arts: { title: 'Artes', color: 'bg-pink-500', icon: '🎨' },
      programming: {
        title: 'Programación',
        color: 'bg-orange-500',
        icon: '💻',
      },
    };
    return (
      subjects[id] || { title: 'Recurso', color: 'bg-gray-500', icon: '📄' }
    );
  };

  const subjectInfo = getSubjectInfo(subjectId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'es' ? 'Volver' : 'Back'}
            </Button>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${subjectInfo.color} rounded-lg flex items-center justify-center text-white text-xl`}
              >
                {subjectInfo.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{decodedResourceName}</h1>
                <p className="text-sm text-gray-600">{subjectInfo.title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">{decodedResourceName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Button className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    {language === 'es' ? 'Reproducir' : 'Play'}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {language === 'es' ? 'Descargar' : 'Download'}
                  </Button>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    {language === 'es' ? 'Descripción' : 'Description'}
                  </h3>
                  <p className="text-gray-700">
                    {language === 'es'
                      ? `Este es un recurso educativo de ${subjectInfo.title.toLowerCase()}. Aquí encontrarás contenido interactivo y educativo para aprender sobre ${decodedResourceName.toLowerCase()}.`
                      : `This is an educational resource for ${subjectInfo.title.toLowerCase()}. Here you'll find interactive and educational content to learn about ${decodedResourceName.toLowerCase()}.`}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {language === 'es' ? 'Contenido' : 'Content'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>
                          •{' '}
                          {language === 'es'
                            ? 'Lecciones interactivas'
                            : 'Interactive lessons'}
                        </li>
                        <li>
                          •{' '}
                          {language === 'es'
                            ? 'Ejercicios prácticos'
                            : 'Practical exercises'}
                        </li>
                        <li>
                          • {language === 'es' ? 'Evaluaciones' : 'Assessments'}
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        {language === 'es' ? 'Recursos' : 'Resources'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>
                          •{' '}
                          {language === 'es'
                            ? 'Videos explicativos'
                            : 'Explanatory videos'}
                        </li>
                        <li>
                          •{' '}
                          {language === 'es'
                            ? 'Material de apoyo'
                            : 'Support material'}
                        </li>
                        <li>
                          •{' '}
                          {language === 'es'
                            ? 'Enlaces útiles'
                            : 'Useful links'}
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
