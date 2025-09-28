'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import QuestGame from '@/components/hooked/QuestGame';
import MessageBar from '@/components/hooked/MessageBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  XCircle,
} from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description?: string;
  payload: any;
  points: number;
  time_limit?: number;
  difficulty: string;
  type: string;
}

export default function QuestPage() {
  const params = useParams();
  const router = useRouter();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const supabase = createSupabaseClient();

  useEffect(() => {
    if (params.id) {
      fetchQuest(params.id as string);
    }
  }, [params.id]);

  const fetchQuest = async (questId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        setError('Reto no encontrado');
        return;
      }

      setQuest(data);
    } catch (err) {
      console.error('Error fetching quest:', err);
      setError('Error al cargar el reto');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuest = () => {
    setIsPlaying(true);

    // Registrar inicio del reto
    supabase
      .from('quest_progress')
      .insert({
        quest_id: quest?.id,
        status: 'started',
        started_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.error('Error starting quest:', error);
      });
  };

  const handleComplete = async (score: number, timeSpent: number) => {
    setCompleted(true);

    try {
      // Actualizar progreso
      const { error: progressError } = await supabase
        .from('quest_progress')
        .update({
          status: 'completed',
          score,
          time_spent: timeSpent,
          completed_at: new Date().toISOString(),
        })
        .eq('quest_id', quest?.id);

      if (progressError) {
        console.error('Error updating progress:', progressError);
      }

      // Crear mensaje de felicitación
      await supabase.from('messages').insert({
        kind: 'achievement',
        title: '¡Reto Completado!',
        body: `Has completado "${quest?.title}" con ${score} puntos`,
        cta_url: '/profile',
        cta_text: 'Ver Perfil',
      });
    } catch (err) {
      console.error('Error completing quest:', err);
    }
  };

  const handleAbandon = () => {
    router.push('/student');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-earth-600" />
          <p className="text-earth-600">Cargando reto...</p>
        </div>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="mb-4">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-4">Reto no encontrado</h2>
          <p className="text-gray-600 mb-6">
            {error || 'El reto que buscas no existe o ha expirado'}
          </p>
          <Button onClick={() => router.push('/student')} className="btn-earth">
            Volver al Inicio
          </Button>
        </Card>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <QuestGame
        quest={quest}
        onComplete={handleComplete}
        onAbandon={handleAbandon}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/student')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-earth-800">
                {quest.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Quest Info */}
        <Card className="p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4 text-earth-800">
                Información del Reto
              </h2>
              {quest.description && (
                <p className="text-earth-600 mb-4">{quest.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-earth-600" />
                  <span className="font-medium">Puntos:</span>
                  <Badge variant="secondary">{quest.points}</Badge>
                </div>

                {quest.time_limit && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-earth-600" />
                    <span className="font-medium">Tiempo límite:</span>
                    <Badge variant="outline">
                      {Math.floor(quest.time_limit / 60)} minutos
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-earth-600" />
                  <span className="font-medium">Dificultad:</span>
                  <Badge
                    variant={
                      quest.difficulty === 'easy'
                        ? 'default'
                        : quest.difficulty === 'medium'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {quest.difficulty === 'easy'
                      ? 'Fácil'
                      : quest.difficulty === 'medium'
                        ? 'Medio'
                        : 'Difícil'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-earth-800">
                Instrucciones
              </h3>
              <div className="bg-earth-50 rounded-lg p-4">
                <p className="text-earth-700 mb-4">
                  {quest.payload.instruction}
                </p>

                <div className="text-sm text-earth-600">
                  <p className="mb-2">
                    • Arrastra los elementos a sus posiciones correctas
                  </p>
                  <p className="mb-2">• Tómate tu tiempo para pensar</p>
                  <p>• ¡Diviértete aprendiendo!</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button
            onClick={handleStartQuest}
            size="lg"
            className="btn-earth text-lg px-8 py-4"
          >
            ¡Comenzar Reto!
          </Button>
        </div>
      </div>
    </div>
  );
}
