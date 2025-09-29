'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

interface Quest {
  id: string;
  title: string;
  description?: string;
  payload: any;
  points: number;
  time_limit?: number;
  difficulty: string;
  type: string;
  available_on: string;
}

interface Message {
  id: string;
  kind: 'quest' | 'badge' | 'achievement' | 'reminder' | 'info';
  title: string;
  body: string;
  cta_url?: string;
  cta_text?: string;
  seen_at?: string;
  created_at: string;
  expires_at?: string;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_days_active: number;
}

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
}

export function useHookedSystem() {
  const { user } = useUser();
  const [todayQuest, setTodayQuest] = useState<Quest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseClient();

  const loadHookedData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar reto del día
      const today = new Date().toISOString().slice(0, 10);
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('available_on', today)
        .eq('is_active', true)
        .single();

      if (questError && questError.code !== 'PGRST116') {
        console.error('Error loading quest:', questError);
      }

      // Cargar mensajes
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
      }

      // Cargar streak
      const { data: streakData, error: streakError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        console.error('Error loading streak:', streakError);
      }

      // Cargar badges del usuario
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(
          `
          badge_id,
          earned_at,
          badges (
            id,
            code,
            name,
            description,
            icon,
            category,
            points,
            rarity
          )
        `,
        )
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (badgesError) {
        console.error('Error loading badges:', badgesError);
      }

      setTodayQuest(quest);
      setMessages(messagesData || []);
      setStreak(streakData);
      setBadges(badgesData?.flatMap((ub) => ub.badges).filter(Boolean) || []);
    } catch (err) {
      console.error('Error loading hooked data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // Cargar datos del sistema Hooked
  useEffect(() => {
    if (user) {
      loadHookedData();
    }
  }, [user, loadHookedData]);

  // Verificar si el reto de hoy está completado
  const isTodayQuestCompleted = async (): Promise<boolean> => {
    if (!user || !todayQuest) return false;

    try {
      const { data, error } = await supabase
        .from('quest_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('quest_id', todayQuest.id)
        .eq('status', 'completed')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking quest completion:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Error checking quest completion:', err);
      return false;
    }
  };

  // Marcar mensaje como leído
  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ seen_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        return false;
      }

      // Actualizar estado local
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, seen_at: new Date().toISOString() }
            : msg,
        ),
      );

      return true;
    } catch (err) {
      console.error('Error marking message as read:', err);
      return false;
    }
  };

  // Obtener mensajes no leídos
  const getUnreadMessagesCount = () => {
    return messages.filter((msg) => !msg.seen_at).length;
  };

  // Refrescar datos
  const refreshData = () => {
    loadHookedData();
  };

  return {
    // Estado
    todayQuest,
    messages,
    streak,
    badges,
    loading,
    error,

    // Métodos
    isTodayQuestCompleted,
    markMessageAsRead,
    getUnreadMessagesCount,
    refreshData,
  };
}
