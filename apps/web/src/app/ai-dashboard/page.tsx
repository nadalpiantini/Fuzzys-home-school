'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Brain,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react';
import { AIIntegration } from '@/components/ai/AIIntegration';
import { ParentReportDashboard } from '@/components/parent-reports/ParentReportDashboard';
// import { useTranslation } from '@/lib/i18n/client';

export default function AIDashboardPage() {
  // const { t, language } = useTranslation();
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState('maria-gonzalez');
  const [activeTab, setActiveTab] = useState('ai');

  // Mock data para estudiantes
  const students = [
    {
      id: 'maria-gonzalez',
      name: 'María González',
      level: 3,
      totalPoints: 2450,
      streak: 12,
      lastActivity: '2024-01-15',
      aiEnabled: true,
    },
    {
      id: 'carlos-rodriguez',
      name: 'Carlos Rodríguez',
      level: 2,
      totalPoints: 1890,
      streak: 8,
      lastActivity: '2024-01-14',
      aiEnabled: true,
    },
  ];

  const handleBack = () => {
    router.push('/');
  };

  const handleContentSelect = (content: any) => {
    console.log('Contenido seleccionado:', content);
    // Implementar navegación al contenido seleccionado
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-100 to-blue-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-fuzzy-purple" />
                  {language === 'es' ? 'Dashboard de IA' : 'AI Dashboard'}
                </h1>
                <p className="text-gray-600">
                  {language === 'es'
                    ? 'Inteligencia artificial para el aprendizaje personalizado'
                    : 'AI-powered personalized learning'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Configuración' : 'Settings'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Student Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {language === 'es' ? 'Seleccionar Estudiante' : 'Select Student'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStudent === student.id
                      ? 'border-fuzzy-purple bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStudent(student.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {student.name}
                        {student.aiEnabled && (
                          <div className="flex items-center gap-1 text-xs text-fuzzy-purple">
                            <Zap className="w-3 h-3" />
                            IA Activa
                          </div>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Nivel {student.level} • {student.totalPoints} puntos
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {student.streak} días de racha
                      </div>
                      <div className="text-xs text-gray-500">
                        Última actividad: {student.lastActivity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8" />
                <div>
                  <h3 className="font-bold">Análisis Inteligente</h3>
                  <p className="text-sm opacity-90">
                    Perfil de aprendizaje personalizado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8" />
                <div>
                  <h3 className="font-bold">Contenido Adaptativo</h3>
                  <p className="text-sm opacity-90">
                    Materiales personalizados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <h3 className="font-bold">Progreso Inteligente</h3>
                  <p className="text-sm opacity-90">Seguimiento avanzado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai">
              <Brain className="w-4 h-4 mr-2" />
              IA
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="content">
              <BookOpen className="w-4 h-4 mr-2" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-6">
            <AIIntegration
              studentId={selectedStudent}
              onContentSelect={handleContentSelect}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ParentReportDashboard studentId={selectedStudent} period="week" />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Contenido Personalizado por IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-fuzzy-purple mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Contenido Generado por IA
                  </h3>
                  <p className="text-gray-600 mb-4">
                    La IA ha generado contenido personalizado basado en el
                    perfil de aprendizaje del estudiante.
                  </p>
                  <Button>
                    <Zap className="w-4 h-4 mr-2" />
                    Generar Nuevo Contenido
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Analytics Avanzados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-fuzzy-purple mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics con IA</h3>
                  <p className="text-gray-600 mb-4">
                    Análisis avanzado del progreso del estudiante con insights
                    de IA.
                  </p>
                  <Button>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Analytics Detallados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
