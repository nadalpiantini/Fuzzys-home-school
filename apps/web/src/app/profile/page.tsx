'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Flame,
  Calendar,
  Star,
  BookOpen,
  Target,
  Award,
  Clock,
} from 'lucide-react';
import { useHookedSystem } from '@/hooks/useHookedSystem';
import { useUser } from '@/hooks/useUser';
import { createSupabaseClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const { user } = useUser();
  const { streak, badges, loading } = useHookedSystem();
  const [activeTab, setActiveTab] = useState('overview');
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });

  const supabase = createSupabaseClient();

  const handleAddJournalEntry = async () => {
    if (!user || !newEntry.title.trim() || !newEntry.content.trim()) return;

    try {
      const { error } = await supabase.from('progress_journal').insert({
        user_id: user.id,
        title: newEntry.title,
        content: newEntry.content,
        type: 'reflection',
      });

      if (error) {
        console.error('Error adding journal entry:', error);
        return;
      }

      setNewEntry({ title: '', content: '' });
      // Recargar entradas
      loadJournalEntries();
    } catch (err) {
      console.error('Error adding journal entry:', err);
    }
  };

  const loadJournalEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('progress_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading journal entries:', error);
        return;
      }

      setJournalEntries(data || []);
    } catch (err) {
      console.error('Error loading journal entries:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-600 mx-auto mb-4"></div>
          <p className="text-earth-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-earth-800 mb-2">Mi Perfil</h1>
          <p className="text-earth-600">
            Tu progreso y logros en Fuzzy's Home School
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="badges">Insignias</TabsTrigger>
            <TabsTrigger value="journal">Diario</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          {/* Resumen */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Streak Card */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-semibold">Racha Actual</h3>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {streak?.current_streak || 0} días
                </div>
                <p className="text-sm text-gray-600">
                  Racha más larga: {streak?.longest_streak || 0} días
                </p>
              </Card>

              {/* Total Days */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-blue-500" />
                  <h3 className="text-lg font-semibold">Días Activos</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {streak?.total_days_active || 0}
                </div>
                <p className="text-sm text-gray-600">Días de aprendizaje</p>
              </Card>

              {/* Badges Count */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Insignias</h3>
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {badges.length}
                </div>
                <p className="text-sm text-gray-600">Logros desbloqueados</p>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-earth-600" />
                Actividad Reciente
              </h3>
              <div className="space-y-3">
                {badges.slice(0, 3).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 bg-earth-50 rounded-lg"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-sm text-gray-600">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Insignias */}
          <TabsContent value="badges" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-earth-600" />
                Mis Insignias
              </h3>

              {badges.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aún no tienes insignias</p>
                  <p className="text-sm text-gray-500">
                    ¡Completa retos para desbloquearlas!
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <Card key={badge.id} className="p-4 text-center">
                      <div className="text-4xl mb-3">{badge.icon}</div>
                      <h4 className="font-semibold mb-2">{badge.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {badge.description}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Badge
                          variant={
                            badge.rarity === 'legendary'
                              ? 'destructive'
                              : badge.rarity === 'epic'
                                ? 'default'
                                : badge.rarity === 'rare'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {badge.rarity === 'legendary'
                            ? 'Legendaria'
                            : badge.rarity === 'epic'
                              ? 'Épica'
                              : badge.rarity === 'rare'
                                ? 'Rara'
                                : 'Común'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {badge.points} pts
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Diario */}
          <TabsContent value="journal" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-earth-600" />
                Mi Diario de Progreso
              </h3>

              {/* Nueva entrada */}
              <div className="mb-6 p-4 bg-earth-50 rounded-lg">
                <h4 className="font-medium mb-3">Nueva Entrada</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Título de tu reflexión..."
                    value={newEntry.title}
                    onChange={(e) =>
                      setNewEntry((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-earth-300 rounded-md focus:ring-2 focus:ring-earth-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="¿Qué aprendiste hoy? ¿Cómo te sentiste? ¿Qué fue lo más interesante?"
                    value={newEntry.content}
                    onChange={(e) =>
                      setNewEntry((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full p-2 border border-earth-300 rounded-md focus:ring-2 focus:ring-earth-500 focus:border-transparent"
                  />
                  <Button
                    onClick={handleAddJournalEntry}
                    disabled={
                      !newEntry.title.trim() || !newEntry.content.trim()
                    }
                    className="btn-earth"
                  >
                    Agregar Entrada
                  </Button>
                </div>
              </div>

              {/* Entradas del diario */}
              <div className="space-y-4">
                {journalEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Tu diario está vacío</p>
                    <p className="text-sm text-gray-500">
                      ¡Agrega tu primera reflexión!
                    </p>
                  </div>
                ) : (
                  journalEntries.map((entry: any) => (
                    <Card key={entry.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{entry.title}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {entry.content}
                      </p>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Estadísticas */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-earth-600" />
                  Progreso General
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Días de racha actual:</span>
                    <span className="font-semibold">
                      {streak?.current_streak || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mejor racha:</span>
                    <span className="font-semibold">
                      {streak?.last_activity_date || 'Nunca'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de días activos:</span>
                    <span className="font-semibold">
                      {streak?.total_days_active || 0}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-earth-600" />
                  Logros
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Insignias obtenidas:</span>
                    <span className="font-semibold">{badges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Puntos totales:</span>
                    <span className="font-semibold">
                      {badges.reduce((sum, badge) => sum + badge.points, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última actividad:</span>
                    <span className="font-semibold">
                      {streak?.last_activity_date
                        ? new Date(
                            streak.last_activity_date,
                          ).toLocaleDateString()
                        : 'Nunca'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
