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
  const [showMessageBar, setShowMessageBar] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hooked-message-bar-visible') === 'true';
    }
    return false;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseClient();

  // Guardar estado de MessageBar en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hooked-message-bar-visible', showMessageBar.toString());
    }
  }, [showMessageBar]);

  // Estados para almacenar datos con cache simple
  const [todayQuest, setTodayQuest] = useState<Quest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);

  // Implementación de retry con exponential backoff
  const fetchWithRetry = useCallback(async (
    fetchFn: () => Promise<any>,
    maxRetries = 3,
    delay = 1000
  ): Promise<any> => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fetchFn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  }, []);

  const loadHookedData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar reto del día con retry
      const today = new Date().toISOString().slice(0, 10);
      const questData = await fetchWithRetry(async () => {
        const { data: quest, error: questError } = await supabase
          .from('quests')
          .select('*')
          .eq('available_on', today)
          .eq('is_active', true)
          .single();

        if (questError && questError.code !== 'PGRST116') {
          console.error('Error loading quest:', questError);
          throw questError;
        }
        return quest;
      });

      // Cargar mensajes con retry
      const messagesData = await fetchWithRetry(async () => {
        const { data, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (messagesError) {
          console.error('Error loading messages:', messagesError);
          throw messagesError;
        }
        return data;
      });

      // Cargar streak con retry
      const streakData = await fetchWithRetry(async () => {
        const { data, error: streakError } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (streakError && streakError.code !== 'PGRST116') {
          console.error('Error loading streak:', streakError);
          throw streakError;
        }
        return data;
      });

      // Cargar badges del usuario con retry
      const badgesData = await fetchWithRetry(async () => {
        const { data, error: badgesError } = await supabase
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
          throw badgesError;
        }
        return data;
      });

      setTodayQuest(questData);
      setMessages(messagesData || []);
      setStreak(streakData);
      setBadges(badgesData?.flatMap((ub: any) => ub.badges).filter(Boolean) || []);
    } catch (err) {
      console.error('Error loading hooked data:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [user, supabase, fetchWithRetry]);

  // Cargar datos del sistema Hooked con cache simple
  useEffect(() => {
    if (user) {
      // Verificar si hay datos en caché de sessionStorage
      const cachedData = sessionStorage.getItem(`hooked-data-${user.id}`);
      const cacheTimestamp = sessionStorage.getItem(`hooked-timestamp-${user.id}`);
      
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
      const isCacheValid = cacheTimestamp && 
        (Date.now() - parseInt(cacheTimestamp)) < CACHE_DURATION;

      if (cachedData && isCacheValid) {
        try {
          const parsed = JSON.parse(cachedData);
          setTodayQuest(parsed.todayQuest);
          setMessages(parsed.messages || []);
          setStreak(parsed.streak);
          setBadges(parsed.badges || []);
          setLoading(false);
          
          // Cargar datos frescos en background
          loadHookedData().then(() => {
            // Guardar en caché
            const dataToCache = {
              todayQuest,
              messages,
              streak,
              badges
            };
            sessionStorage.setItem(`hooked-data-${user.id}`, JSON.stringify(dataToCache));
            sessionStorage.setItem(`hooked-timestamp-${user.id}`, Date.now().toString());
          });
        } catch (e) {
          console.error('Error parsing cached data:', e);
          loadHookedData();
        }
      } else {
        loadHookedData();
      }
    }
  }, [user]);

  // Guardar datos en caché cuando cambien
  useEffect(() => {
    if (user && !loading) {
      const dataToCache = {
        todayQuest,
        messages,
        streak,
        badges
      };
      sessionStorage.setItem(`hooked-data-${user.id}`, JSON.stringify(dataToCache));
      sessionStorage.setItem(`hooked-timestamp-${user.id}`, Date.now().toString());
    }
  }, [user, todayQuest, messages, streak, badges, loading]);

  // Verificar si el reto de hoy está completado
  const isTodayQuestCompleted = useCallback(async (): Promise<boolean> => {
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
  }, [user, todayQuest, supabase]);

  // Marcar mensaje como leído con optimistic update
  const markMessageAsRead = useCallback(async (messageId: string) => {
    // Actualización optimista
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, seen_at: new Date().toISOString() }
          : msg,
      ),
    );

    try {
      const { error } = await supabase
        .from('messages')
        .update({ seen_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        // Revertir actualización optimista
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, seen_at: undefined }
              : msg,
          ),
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error marking message as read:', err);
      // Revertir actualización optimista
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, seen_at: undefined }
            : msg,
        ),
      );
      return false;
    }
  }, [supabase]);

  // Obtener mensajes no leídos
  const getUnreadMessagesCount = useCallback(() => {
    return messages.filter((msg) => !msg.seen_at).length;
  }, [messages]);

  // Refrescar datos con indicador de loading
  const refreshData = useCallback(async () => {
    if (!user) return;
    
    // Limpiar caché
    sessionStorage.removeItem(`hooked-data-${user.id}`);
    sessionStorage.removeItem(`hooked-timestamp-${user.id}`);
    
    await loadHookedData();
  }, [loadHookedData, user]);

  // Toggle MessageBar visibility
  const toggleMessageBar = useCallback(() => {
    setShowMessageBar(prev => !prev);
  }, []);

  // Hide MessageBar
  const hideMessageBar = useCallback(() => {
    setShowMessageBar(false);
  }, []);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Suscribirse a cambios en tiempo real
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadHookedData();
        }
      )
      .subscribe();

    const questsChannel = supabase
      .channel('quests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quests',
        },
        () => {
          loadHookedData();
        }
      )
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
      questsChannel.unsubscribe();
    };
  }, [user, supabase, loadHookedData]);

  return {
    // Estado
    todayQuest,
    messages,
    streak,
    badges,
    loading,
    error,
    showMessageBar,

    // Métodos
    isTodayQuestCompleted,
    markMessageAsRead,
    getUnreadMessagesCount,
    refreshData,
    toggleMessageBar,
    hideMessageBar,
  };
}
