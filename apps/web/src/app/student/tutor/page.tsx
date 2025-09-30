'use client';

import { useState } from 'react';
// Session is handled by Supabase client - removed deprecated import
import { AITutorChat } from '@/components/tutor/AITutorChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot,
  BookOpen,
  Calculator,
  Globe,
  Palette,
  Music,
  Microscope,
  History,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
// TODO: Replace with proper i18n implementation
// import { useTranslation } from 'next-i18next';

const subjects = [
  {
    id: 'math',
    name: { es: 'Matemáticas', en: 'Mathematics' },
    icon: Calculator,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'science',
    name: { es: 'Ciencias', en: 'Science' },
    icon: Microscope,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'spanish',
    name: { es: 'Lengua Española', en: 'Spanish Language' },
    icon: BookOpen,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    id: 'social',
    name: { es: 'Sociales', en: 'Social Studies' },
    icon: Globe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'art',
    name: { es: 'Arte', en: 'Art' },
    icon: Palette,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    id: 'music',
    name: { es: 'Música', en: 'Music' },
    icon: Music,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    id: 'history',
    name: { es: 'Historia', en: 'History' },
    icon: History,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export default function TutorPage() {
  // const { i18n } = useTranslation();
  const language = 'es' as 'es' | 'en'; // Default to Spanish for now
  const router = useRouter();
  // Session is handled through Supabase client
  const session: { user?: { id?: string } } | null = null; // TODO: Use createClientComponentClient().auth.getSession()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sessionAnalytics, setSessionAnalytics] = useState<any>(null);

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSessionAnalytics(null);
  };

  const handleSessionEnd = (analytics: any) => {
    setSessionAnalytics(analytics);
    // Optionally save analytics to database
    console.log('Session analytics:', analytics);
  };

  const handleBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
    } else {
      router.push('/student');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Bot className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold mb-2">
                {language === 'es' ? 'Inicia sesión para continuar' : 'Sign in to continue'}
              </h2>
              <p className="text-gray-600">
                {language === 'es'
                  ? 'Necesitas una cuenta para usar el Tutor AI'
                  : 'You need an account to use the AI Tutor'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'es' ? 'Volver' : 'Back'}
          </Button>
          <Badge variant="outline" className="text-sm">
            <Bot className="w-3 h-3 mr-1" />
            {language === 'es' ? 'Tutor AI Activo' : 'AI Tutor Active'}
          </Badge>
        </div>

        {!selectedSubject ? (
          // Subject Selection
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-600" />
                {language === 'es' ? 'Tutor AI de Fuzzy' : "Fuzzy's AI Tutor"}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Selecciona una materia para comenzar tu sesión de tutoría personalizada'
                  : 'Select a subject to start your personalized tutoring session'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subjects.map((subject) => {
                  const Icon = subject.icon;
                  return (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectSelect(subject.id)}
                      className="group p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all hover:shadow-lg"
                    >
                      <div
                        className={`w-12 h-12 ${subject.bgColor} rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}
                      >
                        <Icon className={`w-6 h-6 ${subject.color}`} />
                      </div>
                      <h3 className="font-semibold text-sm">
                        {subject.name[language]}
                      </h3>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Active Tutoring Session
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {subjects.find(s => s.id === selectedSubject)?.name[language]}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {subjects.find(s => s.id === selectedSubject) && (
                      <div
                        className={`w-8 h-8 ${
                          subjects.find(s => s.id === selectedSubject)!.bgColor
                        } rounded-lg flex items-center justify-center`}
                      >
                        {(() => {
                          const subject = subjects.find(s => s.id === selectedSubject);
                          const Icon = subject!.icon;
                          return <Icon className={`w-4 h-4 ${subject!.color}`} />;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <AITutorChat
              userId={''}  // Using empty string as session is not properly implemented yet
              subject={selectedSubject}
              language={language}
              onSessionEnd={handleSessionEnd}
            />

            {sessionAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'es' ? 'Resumen de la Sesión' : 'Session Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === 'es' ? 'Preguntas' : 'Questions'}
                      </p>
                      <p className="text-2xl font-bold">
                        {sessionAnalytics.metrics?.questionsAsked || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === 'es' ? 'Tiempo' : 'Time'}
                      </p>
                      <p className="text-2xl font-bold">
                        {Math.floor((sessionAnalytics.metrics?.timeSpent || 0) / 60)} min
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === 'es' ? 'Conceptos' : 'Concepts'}
                      </p>
                      <p className="text-2xl font-bold">
                        {sessionAnalytics.metrics?.conceptsCovered?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === 'es' ? 'Progreso' : 'Progress'}
                      </p>
                      <p className="text-2xl font-bold text-green-600">+15%</p>
                    </div>
                  </div>

                  {sessionAnalytics.insights?.recommendedNextSteps && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">
                        {language === 'es' ? 'Próximos Pasos:' : 'Next Steps:'}
                      </p>
                      <ul className="space-y-1">
                        {sessionAnalytics.insights.recommendedNextSteps.map(
                          (step: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{step}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}