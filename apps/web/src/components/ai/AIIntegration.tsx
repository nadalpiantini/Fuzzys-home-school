'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  Gamepad2,
  Clock,
  Star,
  Zap,
  Users,
  BarChart3,
} from 'lucide-react';
import {
  aiService,
  AIInsights,
  PersonalizedContent,
  AIAnalysisResult,
} from '@/services/ai/AIService';

interface AIIntegrationProps {
  studentId: string;
  onContentSelect?: (content: PersonalizedContent) => void;
}

export function AIIntegration({
  studentId,
  onContentSelect,
}: AIIntegrationProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [personalizedContent, setPersonalizedContent] = useState<
    PersonalizedContent[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    loadAIData();
  }, [studentId]);

  const loadAIData = async () => {
    try {
      setLoading(true);

      // Cargar insights del estudiante
      const studentInsights = await aiService.generateInsights(studentId);
      setInsights(studentInsights);

      // Cargar análisis de perfil de aprendizaje
      const mockData = {
        responses: [
          'Me gusta ver diagramas y dibujos',
          'Prefiero escuchar explicaciones',
          'Disfruto hacer experimentos',
          'Me gusta leer textos explicativos',
        ],
        timeSpent: {
          Matemáticas: 45,
          Ciencias: 30,
          Lengua: 60,
          Historia: 25,
          Arte: 40,
        },
        scores: {
          Matemáticas: 85,
          Ciencias: 78,
          Lengua: 92,
          Historia: 88,
          Arte: 95,
        },
        preferences: ['games', 'visual', 'interactive'],
      };

      const profileAnalysis = await aiService.analyzeLearningProfile(
        studentId,
        mockData,
      );
      setAnalysis(profileAnalysis);

      // Cargar contenido personalizado
      const content = await aiService.generatePersonalizedContent(
        studentId,
        'Ciencias',
        'intermediate',
        ['games', 'lessons', 'activities'],
      );
      setPersonalizedContent(content);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentSelect = (content: PersonalizedContent) => {
    if (onContentSelect) {
      onContentSelect(content);
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuzzy-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-fuzzy-purple" />
            Inteligencia Artificial
          </h2>
          <p className="text-gray-600">
            Análisis personalizado y recomendaciones inteligentes
          </p>
        </div>
        <Button onClick={loadAIData} variant="outline">
          <Zap className="w-4 h-4 mr-2" />
          Actualizar Análisis
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {insights && (
            <>
              {/* Progreso General */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Progreso del Estudiante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Progreso General</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={insights.studentProgress.overall}
                          className="w-32"
                        />
                        <span className="text-sm font-medium">
                          {insights.studentProgress.overall}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(insights.studentProgress.bySubject).map(
                        ([subject, progress]) => (
                          <div
                            key={subject}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <span className="font-medium">{subject}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="w-20" />
                              <span className="text-sm">{progress}%</span>
                              {insights.studentProgress.trends[subject] ===
                                'up' && (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Nivel de Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Nivel Actual</span>
                      <Badge
                        className={getEngagementColor(
                          insights.engagement.level,
                        )}
                      >
                        {insights.engagement.level === 'high'
                          ? 'Alto'
                          : insights.engagement.level === 'medium'
                            ? 'Medio'
                            : 'Bajo'}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        Factores Identificados:
                      </h4>
                      <ul className="space-y-1">
                        {insights.engagement.factors.map((factor, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-sm">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Sugerencias:</h4>
                      <ul className="space-y-1">
                        {insights.engagement.suggestions.map(
                          (suggestion, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">{suggestion}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {analysis && (
            <>
              {/* Estilo de Aprendizaje */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Perfil de Aprendizaje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Estilo de Aprendizaje</span>
                      <Badge variant="default">
                        {analysis.learningStyle === 'visual'
                          ? 'Visual'
                          : analysis.learningStyle === 'auditory'
                            ? 'Auditivo'
                            : analysis.learningStyle === 'kinesthetic'
                              ? 'Kinestésico'
                              : 'Lectura'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Confianza del Análisis
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={analysis.confidence * 100}
                          className="w-24"
                        />
                        <span className="text-sm">
                          {Math.round(analysis.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fortalezas y Debilidades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Star className="w-5 h-5" />
                      Fortalezas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <Target className="w-5 h-5" />
                      Áreas de Mejora
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recomendaciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Recomendaciones Personalizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Próximos Pasos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Próximos Pasos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Contenido Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalizedContent.map((content, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{content.title}</h4>
                      <Badge className={getDifficultyColor(content.difficulty)}>
                        {content.difficulty}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {content.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Clock className="w-3 h-3" />
                      <span>{content.estimatedTime} min</span>
                      <span>•</span>
                      <span>{content.type}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleContentSelect(content)}
                      className="w-full"
                    >
                      Seleccionar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {insights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Ruta de Aprendizaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Nivel Actual</span>
                    <Badge variant="default">
                      {insights.learningPath.current}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Próximos Niveles:</h4>
                    <ul className="space-y-1">
                      {insights.learningPath.next.map((level, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm">{level}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Prerrequisitos:</h4>
                    <ul className="space-y-1">
                      {insights.learningPath.prerequisites.map(
                        (prereq, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm">{prereq}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
