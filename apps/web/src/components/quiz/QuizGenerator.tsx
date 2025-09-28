'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { quizService } from '@/services/quiz/QuizService';
import { GeneratedQuestion } from '@fuzzy/quiz-generator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Target, Clock, BookOpen, Lightbulb } from 'lucide-react';

interface QuizGeneratorProps {
  userId: string;
  onQuizGenerated?: (questions: GeneratedQuestion[]) => void;
}

const dominican_subjects = [
  { value: 'matematicas', label: 'Matemáticas' },
  { value: 'lengua_espanola', label: 'Lengua Española' },
  { value: 'ciencias_naturales', label: 'Ciencias Naturales' },
  { value: 'ciencias_sociales', label: 'Ciencias Sociales' },
  { value: 'ingles', label: 'Inglés' },
  { value: 'educacion_fisica', label: 'Educación Física' },
  { value: 'educacion_artistica', label: 'Educación Artística' },
  { value: 'formacion_humana', label: 'Formación Humana' }
];

const grades = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}° Grado`
}));

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  userId,
  onQuizGenerated
}) => {
  const [mode, setMode] = useState<'adaptive' | 'curriculum' | 'topic'>('adaptive');
  const [subject, setSubject] = useState('matematicas');
  const [grade, setGrade] = useState(5);
  const [topic, setTopic] = useState('');
  const [unit, setUnit] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState([0.5]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const loadRecommendations = useCallback(async () => {
    try {
      const recs = await quizService.getSubjectRecommendations(userId);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      let generatedQuestions: GeneratedQuestion[] = [];

      switch (mode) {
        case 'adaptive':
          generatedQuestions = await quizService.generateAdaptiveQuiz(
            userId,
            subject,
            grade,
            questionCount
          );
          break;

        case 'curriculum':
          generatedQuestions = await quizService.generateCurriculumQuiz(
            grade,
            subject,
            unit,
            questionCount,
            difficulty[0]
          );
          break;

        case 'topic':
          generatedQuestions = await quizService.generateTopicQuiz(
            topic,
            difficulty[0],
            questionCount
          );
          break;
      }

      setQuestions(generatedQuestions);
      onQuizGenerated?.(generatedQuestions);
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = (rec: any) => {
    setMode('adaptive');
    setSubject(rec.subject);
    setQuestionCount(rec.suggestedQuestionCount);
    setDifficulty([rec.difficulty]);
  };

  const getDifficultyLabel = (value: number) => {
    if (value < 0.3) return 'Fácil';
    if (value < 0.7) return 'Intermedio';
    return 'Difícil';
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <Target className="w-4 h-4" />;
      case 'true_false':
        return <Brain className="w-4 h-4" />;
      case 'short_answer':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Recomendaciones Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => applyRecommendation(rec)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">
                      {rec.subject.replace('_', ' ')}
                    </span>
                    <Badge
                      variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {rec.priority === 'high' ? 'Refuerzo' : 'Desafío'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{rec.suggestedQuestionCount} preguntas</span>
                    <span>•</span>
                    <span>{getDifficultyLabel(rec.difficulty)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Modo de Generación</Label>
            <Select value={mode} onValueChange={(value: any) => setMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adaptive">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Adaptativo (Personalizado)
                  </div>
                </SelectItem>
                <SelectItem value="curriculum">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Currículo Dominicano
                  </div>
                </SelectItem>
                <SelectItem value="topic">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Tema Específico
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject and Grade (for adaptive and curriculum modes) */}
          {(mode === 'adaptive' || mode === 'curriculum') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Materia</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dominican_subjects.map(subj => (
                      <SelectItem key={subj.value} value={subj.value}>
                        {subj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Grado</Label>
                <Select value={grade.toString()} onValueChange={(value) => setGrade(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(g => (
                      <SelectItem key={g.value} value={g.value.toString()}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Unit (for curriculum mode) */}
          {mode === 'curriculum' && (
            <div className="space-y-2">
              <Label>Unidad/Tema</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ej: Fracciones, Ecosistemas, Historia Dominicana..."
              />
            </div>
          )}

          {/* Topic (for topic mode) */}
          {mode === 'topic' && (
            <div className="space-y-2">
              <Label>Tema</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Sistema solar, Animales vertebrados, Sumas y restas..."
              />
            </div>
          )}

          {/* Question Count */}
          <div className="space-y-2">
            <Label>Número de Preguntas: {questionCount}</Label>
            <Slider
              value={[questionCount]}
              onValueChange={(value) => setQuestionCount(value[0])}
              min={5}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          {/* Difficulty (not for adaptive mode) */}
          {mode !== 'adaptive' && (
            <div className="space-y-2">
              <Label>
                Dificultad: {getDifficultyLabel(difficulty[0])} ({Math.round(difficulty[0] * 100)}%)
              </Label>
              <Slider
                value={difficulty}
                onValueChange={setDifficulty}
                min={0.1}
                max={1.0}
                step={0.1}
                className="w-full"
              />
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateQuiz}
            disabled={loading || (mode === 'curriculum' && !unit) || (mode === 'topic' && !topic)}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generando Quiz...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generar Quiz
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Questions Preview */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Quiz Generado ({questions.length} preguntas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.slice(0, 3).map((question, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getQuestionTypeIcon(question.type)}
                        <Badge variant="outline" className="text-xs">
                          {question.type === 'multiple_choice' ? 'Opción múltiple' :
                           question.type === 'true_false' ? 'Verdadero/Falso' :
                           question.type === 'short_answer' ? 'Respuesta corta' : question.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.bloomLevel ? question.bloomLevel.charAt(0).toUpperCase() + question.bloomLevel.slice(1) : 'N/A'}
                        </Badge>
                      </div>
                      <p className="font-medium mb-2">{question.question}</p>
                      {question.options && (
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`text-sm p-2 rounded ${
                                optIndex === Number(question.correctAnswer)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </div>
                          ))}
                        </div>
                      )}
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                          <strong>Explicación:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {questions.length > 3 && (
                <div className="text-center text-gray-500 text-sm">
                  Y {questions.length - 3} preguntas más...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};