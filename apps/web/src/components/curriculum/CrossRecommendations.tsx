'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type Recommendation = {
  weakSubject: string;
  sourceCurriculum: string;
  avgScore: number;
  attempts: number;
  lastAttempt: string;
  suggestions: {
    subject: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }[];
};

type PathRecommendation = {
  chapterId: string;
  title: string;
  difficulty: string;
  type: 'challenge' | 'reinforcement' | 'progression';
};

type CrossRecommendationsProps = {
  studentId: string;
  compact?: boolean;
  showTitle?: boolean;
};

export function CrossRecommendations({
  studentId,
  compact = false,
  showTitle = true
}: CrossRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [pathRecommendations, setPathRecommendations] = useState<Record<string, PathRecommendation[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [studentId]);

  const fetchRecommendations = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/curriculum/recommend-cross?studentId=${studentId}`);
      const result = await response.json();

      if (result.ok) {
        setRecommendations(result.crossSubjectRecommendations || []);
        setPathRecommendations(result.pathRecommendations || {});
      }
    } catch (error) {
      console.error('Error fetching cross-recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={compact ? '' : 'mt-4'}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasRecommendations = recommendations.length > 0 || Object.keys(pathRecommendations).length > 0;

  if (!hasRecommendations) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'challenge':
        return <TrendingUp className="h-4 w-4" />;
      case 'reinforcement':
        return <AlertCircle className="h-4 w-4" />;
      case 'progression':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className={compact ? '' : 'mt-4'}>
      {/* Cross-Subject Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300">
          <CardHeader>
            {showTitle && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  Recomendaciones de Refuerzo
                </CardTitle>
                <CardDescription>
                  Actividades complementarias para fortalecer áreas específicas
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {rec.weakSubject}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Promedio actual: {rec.avgScore.toFixed(1)}% ({rec.attempts} intentos)
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50">
                      Refuerzo
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {rec.suggestions.map((suggestion, sIdx) => (
                      <div
                        key={sIdx}
                        className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{suggestion.message}</p>
                            <p className="text-xs mt-1 capitalize">
                              Materia sugerida: <strong>{suggestion.subject}</strong>
                            </p>
                          </div>
                          {!compact && (
                            <Badge className="text-xs capitalize">
                              {suggestion.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Path Recommendations */}
      {Object.keys(pathRecommendations).length > 0 && (
        <Card className={recommendations.length > 0 ? 'mt-4' : ''}>
          <CardHeader>
            {showTitle && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Próximos Capítulos Recomendados
                </CardTitle>
                <CardDescription>
                  Capítulos personalizados según tu desempeño
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(pathRecommendations).map(([curriculumId, chapters]) => (
                <div key={curriculumId} className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                    {curriculumId.replace(/-/g, ' ')}
                  </h4>
                  <div className="grid gap-2">
                    {chapters.slice(0, compact ? 2 : 5).map((chapter) => (
                      <div
                        key={chapter.chapterId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getTypeIcon(chapter.type)}
                          <div>
                            <p className="font-medium text-sm">{chapter.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {chapter.difficulty}
                              </Badge>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {chapter.type === 'challenge' && '🎯 Desafío'}
                                {chapter.type === 'reinforcement' && '🔄 Refuerzo'}
                                {chapter.type === 'progression' && '➡️ Progresión'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {!compact && (
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
