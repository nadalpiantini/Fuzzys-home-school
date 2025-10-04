'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  BookOpen,
  Clock,
  Star,
  Zap,
  Eye,
  BarChart3,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  AdvancedInsightsService,
  AIInsight,
  PersonalizedRecommendation,
  LearningProfile,
} from '@/services/ai/advancedInsightsService';
import { toast } from 'sonner';

interface AIInsightsDashboardProps {
  studentId: string;
  onInsightClick?: (insight: AIInsight) => void;
  onRecommendationClick?: (recommendation: PersonalizedRecommendation) => void;
}

export function AIInsightsDashboard({
  studentId,
  onInsightClick,
  onRecommendationClick,
}: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<
    PersonalizedRecommendation[]
  >([]);
  const [learningProfile, setLearningProfile] =
    useState<LearningProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadInsights(),
        loadRecommendations(),
        loadLearningProfile(),
      ]);
    } catch (error) {
      console.error('Error loading AI data:', error);
      toast.error('Error al cargar datos de IA');
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const data = await AdvancedInsightsService.generateInsights(studentId);
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const data =
        await AdvancedInsightsService.generateRecommendations(studentId);
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadLearningProfile = async () => {
    try {
      const data =
        await AdvancedInsightsService.updateLearningProfile(studentId);
      setLearningProfile(data);
    } catch (error) {
      console.error('Error loading learning profile:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
      toast.success('Datos actualizados');
    } catch (error) {
      toast.error('Error al actualizar datos');
    } finally {
      setRefreshing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <BarChart3 className="w-5 h-5" />;
      case 'engagement':
        return <Zap className="w-5 h-5" />;
      case 'learning_style':
        return <Brain className="w-5 h-5" />;
      case 'intervention':
        return <AlertTriangle className="w-5 h-5" />;
      case 'prediction':
        return <Eye className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'text-blue-500';
      case 'engagement':
        return 'text-green-500';
      case 'learning_style':
        return 'text-purple-500';
      case 'intervention':
        return 'text-red-500';
      case 'prediction':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <BookOpen className="w-5 h-5" />;
      case 'activity':
        return <Target className="w-5 h-5" />;
      case 'intervention':
        return <AlertTriangle className="w-5 h-5" />;
      case 'schedule':
        return <Clock className="w-5 h-5" />;
      case 'goal':
        return <Star className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuzzy-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Analizando datos con IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-fuzzy-purple" />
            Insights de IA
          </h2>
          <p className="text-gray-600">
            Análisis inteligente del progreso y recomendaciones personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Learning Profile Summary */}
      {learningProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Perfil de Aprendizaje
            </CardTitle>
            <CardDescription>
              Análisis del estilo de aprendizaje y capacidades cognitivas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Estilo de Aprendizaje</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Visual</span>
                    <span className="text-sm font-medium">
                      {Math.round(learningProfile.learningStyle.visual * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={learningProfile.learningStyle.visual * 100}
                    className="h-2"
                  />

                  <div className="flex justify-between">
                    <span className="text-sm">Auditivo</span>
                    <span className="text-sm font-medium">
                      {Math.round(learningProfile.learningStyle.auditory * 100)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={learningProfile.learningStyle.auditory * 100}
                    className="h-2"
                  />

                  <div className="flex justify-between">
                    <span className="text-sm">Kinestésico</span>
                    <span className="text-sm font-medium">
                      {Math.round(
                        learningProfile.learningStyle.kinesthetic * 100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={learningProfile.learningStyle.kinesthetic * 100}
                    className="h-2"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Perfil Cognitivo</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Memoria de Trabajo</span>
                    <span className="text-sm font-medium">
                      {Math.round(
                        learningProfile.cognitiveProfile.workingMemory * 100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={learningProfile.cognitiveProfile.workingMemory * 100}
                    className="h-2"
                  />

                  <div className="flex justify-between">
                    <span className="text-sm">Velocidad de Procesamiento</span>
                    <span className="text-sm font-medium">
                      {Math.round(
                        learningProfile.cognitiveProfile.processingSpeed * 100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      learningProfile.cognitiveProfile.processingSpeed * 100
                    }
                    className="h-2"
                  />

                  <div className="flex justify-between">
                    <span className="text-sm">Atención</span>
                    <span className="text-sm font-medium">
                      {Math.round(
                        learningProfile.cognitiveProfile.attentionSpan * 100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={learningProfile.cognitiveProfile.attentionSpan * 100}
                    className="h-2"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Fortalezas</h4>
                <div className="space-y-1">
                  {learningProfile.strengths.map((strength, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Áreas de Mejora</h4>
                <div className="space-y-1">
                  {learningProfile.challenges.map((challenge, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mr-1 mb-1"
                    >
                      {challenge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights">
            Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            Recomendaciones ({recommendations.length})
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay insights disponibles</p>
                <p className="text-sm text-gray-500">
                  Los insights se generan automáticamente basados en la
                  actividad
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => (
                <Card
                  key={insight.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onInsightClick?.(insight)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${getInsightColor(insight.insightType)}`}
                        >
                          {getInsightIcon(insight.insightType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{insight.title}</h3>
                            <Badge
                              className={getPriorityColor(insight.priority)}
                            >
                              {insight.priority}
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(insight.confidence * 100)}% confianza
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {insight.description}
                          </p>

                          {insight.actions.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-1">
                                Acciones sugeridas:
                              </p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {insight.actions.map((action, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No hay recomendaciones disponibles
                </p>
                <p className="text-sm text-gray-500">
                  Las recomendaciones se generan basadas en el análisis de IA
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((recommendation) => (
                <Card
                  key={recommendation.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onRecommendationClick?.(recommendation)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-fuzzy-purple/10 text-fuzzy-purple">
                          {getRecommendationIcon(
                            recommendation.recommendationType,
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {recommendation.title}
                            </h3>
                            <Badge variant="outline">
                              {recommendation.difficulty}
                            </Badge>
                            <Badge variant="secondary">
                              {recommendation.timeRequired} min
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {recommendation.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              Impacto esperado: {recommendation.expectedImpact}%
                            </span>
                            <span>Prioridad: {recommendation.priority}</span>
                          </div>

                          {recommendation.resources.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-1">
                                Recursos:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {recommendation.resources.map(
                                  (resource, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {resource}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
