'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle, Brain } from 'lucide-react';
import MCQSimple from './MCQSimple';

interface QuizGeneratorSimpleProps {
  subject?: string;
  grade?: string;
  topic?: string;
  levels?: string[];
  questionCount?: number;
  onComplete?: (result: { score: number; total: number }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  title?: string;
  adaptive?: boolean;
  studentId?: string;
  curriculumId?: string;
}

interface GeneratedQuiz {
  questions: Array<{
    q: string;
    options: string[];
    correct: number[];
  }>;
  meta: {
    subject: string;
    grade: string;
    topic: string;
    levels: string[];
    questionCount: number;
    generated_at: string;
  };
}

const QuizGeneratorSimple: React.FC<QuizGeneratorSimpleProps> = ({
  subject = 'math',
  grade = 'K-2',
  topic = 'numeros-0-10',
  levels = ['remember', 'understand'],
  questionCount = 3,
  onComplete,
  onError,
  disabled = false,
  title,
  adaptive = false,
  studentId,
  curriculumId,
}) => {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [error, setError] = useState<string>('');
  const [adaptiveDifficulty, setAdaptiveDifficulty] =
    useState<string>('medium');

  // Obtener dificultad adaptativa si está habilitado
  useEffect(() => {
    const getAdaptiveDifficulty = async () => {
      if (adaptive && studentId) {
        try {
          const response = await fetch(
            `/api/adaptive/recommend?studentId=${studentId}`,
          );
          const result = await response.json();

          if (result.ok && result.data.length > 0) {
            // Buscar recomendación para el curriculum actual
            const recommendation = result.data.find((rec: any) =>
              curriculumId ? rec.curriculumId === curriculumId : true,
            );

            if (recommendation) {
              setAdaptiveDifficulty(recommendation.suggestedDifficulty);
            }
          }
        } catch (error) {
          console.error('Error getting adaptive difficulty:', error);
        }
      }
    };

    getAdaptiveDifficulty();
  }, [adaptive, studentId, curriculumId]);

  // Auto-generar quiz al montar el componente
  useEffect(() => {
    if (!disabled) {
      generateQuiz();
    }
  }, [subject, topic, questionCount, disabled, adaptiveDifficulty]);

  const generateQuiz = async () => {
    setState('loading');
    setError('');

    try {
      const requestBody: any = {
        subject,
        grade,
        topic,
        levels,
        questionCount,
      };

      // Si está habilitado el modo adaptativo, incluir la dificultad
      if (adaptive) {
        requestBody.difficulty = adaptiveDifficulty;
        requestBody.adaptive = true;
      }

      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error generando quiz');
      }

      setQuiz(result);
      setState('ready');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setState('error');
      onError?.(errorMessage);
    }
  };

  const handleQuizComplete = (result: { score: number; total: number }) => {
    onComplete?.(result);
  };

  const handleRetry = () => {
    generateQuiz();
  };

  // Estado de carga
  if (state === 'loading') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Brain className="w-12 h-12 text-blue-500" />
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -top-1 -right-1" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Generando tu quiz personalizado...
              </h3>
              <p className="text-sm text-gray-600">
                Creando {questionCount} preguntas sobre {topic}
              </p>
            </div>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full animate-pulse"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado de error
  if (state === 'error') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-900">
                Error al generar el quiz
              </h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado inicial
  if (state === 'idle') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Brain className="w-12 h-12 text-gray-400" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Quiz Adaptativo
              </h3>
              <p className="text-sm text-gray-600">
                Presiona el botón para generar preguntas personalizadas
              </p>
            </div>
            <Button
              onClick={generateQuiz}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Generar Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz listo - renderizar con MCQSimple
  if (state === 'ready' && quiz) {
    const quizTitle = title || quiz.meta.topic.replace('-', ' ').toUpperCase();

    return (
      <div className="space-y-4">
        {/* Información del quiz generado */}
        <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {adaptive
                    ? 'Quiz adaptativo personalizado'
                    : 'Quiz generado automáticamente'}
                </span>
                {adaptive && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    IA
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-blue-700">
                <span>{quiz.meta.subject}</span>
                <span>•</span>
                <span>{quiz.meta.questionCount} preguntas</span>
                {adaptive && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{adaptiveDifficulty}</span>
                  </>
                )}
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 h-auto p-1"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz interactivo */}
        <MCQSimple
          questions={quiz.questions}
          onSubmit={handleQuizComplete}
          title={quizTitle}
          showResults={true}
        />
      </div>
    );
  }

  return null;
};

export default QuizGeneratorSimple;
