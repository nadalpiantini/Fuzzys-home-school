'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AIInsightsDashboard } from '@/components/ai/AIInsightsDashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Users,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Target,
  Clock,
  Star,
} from 'lucide-react';
import {
  AIInsight,
  PersonalizedRecommendation,
} from '@/services/ai/advancedInsightsService';
import { toast } from 'sonner';

export default function AIInsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadStudents();
    }
  }, [user, authLoading, router]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      // Load students based on user role
      if (user?.role === 'teacher') {
        // Load students from teacher's classes
        const response = await fetch('/api/classes/students');
        const data = await response.json();
        setStudents(data.students || []);
      } else if (user?.role === 'parent') {
        // Load parent's children
        const response = await fetch('/api/parents/children');
        const data = await response.json();
        setStudents(data.children || []);
      } else if (user?.role === 'student') {
        // For students, show their own data
        setStudents([{ id: user.id, name: user.name || 'Estudiante' }]);
        setSelectedStudent(user.id);
      }

      if (students.length > 0 && !selectedStudent) {
        setSelectedStudent(students[0].id);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const handleInsightClick = (insight: AIInsight) => {
    console.log('Insight clicked:', insight);
    toast.info(`Insight: ${insight.title}`);
  };

  const handleRecommendationClick = (
    recommendation: PersonalizedRecommendation,
  ) => {
    console.log('Recommendation clicked:', recommendation);
    toast.info(`Recomendación: ${recommendation.title}`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuzzy-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando insights de IA...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-fuzzy-purple to-fuzzy-blue rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Insights de IA
              </h1>
              <p className="text-gray-600">
                Análisis inteligente y recomendaciones personalizadas para el
                aprendizaje
              </p>
            </div>
          </div>

          {/* Student Selector */}
          {students.length > 1 && (
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium">Estudiante:</label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccionar estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-gray-600">Insights Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-gray-600">Recomendaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">85%</p>
                    <p className="text-sm text-gray-600">Confianza Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-gray-600">Acciones Críticas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        {selectedStudent ? (
          <AIInsightsDashboard
            studentId={selectedStudent}
            onInsightClick={handleInsightClick}
            onRecommendationClick={handleRecommendationClick}
          />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Selecciona un Estudiante
              </h3>
              <p className="text-gray-600">
                Elige un estudiante para ver sus insights de IA y
                recomendaciones personalizadas
              </p>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Cómo Funciona la IA
              </CardTitle>
              <CardDescription>
                Nuestro sistema de IA analiza múltiples factores para generar
                insights precisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Recopilación de Datos</h4>
                    <p className="text-sm text-gray-600">
                      Analizamos el rendimiento, engagement, patrones de
                      aprendizaje y comportamiento
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Análisis Inteligente</h4>
                    <p className="text-sm text-gray-600">
                      Utilizamos algoritmos de machine learning para identificar
                      patrones y tendencias
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      Recomendaciones Personalizadas
                    </h4>
                    <p className="text-sm text-gray-600">
                      Generamos sugerencias específicas basadas en el perfil
                      único de cada estudiante
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Tipos de Insights
              </CardTitle>
              <CardDescription>
                Diferentes categorías de análisis para una comprensión completa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium">Rendimiento</h4>
                    <p className="text-sm text-gray-600">
                      Análisis de puntuaciones y progreso
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium">Engagement</h4>
                    <p className="text-sm text-gray-600">
                      Nivel de participación y motivación
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium">Estilo de Aprendizaje</h4>
                    <p className="text-sm text-gray-600">
                      Preferencias y capacidades cognitivas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium">Intervención</h4>
                    <p className="text-sm text-gray-600">
                      Necesidades de apoyo adicional
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium">Predicciones</h4>
                    <p className="text-sm text-gray-600">
                      Tendencias futuras y recomendaciones
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
