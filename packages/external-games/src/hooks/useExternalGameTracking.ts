import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ExternalGameEvent,
  ExternalGameProgress,
  ExternalGameConfig
} from '../types';

interface UseExternalGameTrackingOptions {
  config: ExternalGameConfig;
  studentId?: string;
  onEvent?: (event: ExternalGameEvent) => void;
  onComplete?: (progress: ExternalGameProgress) => void;
  enabled?: boolean;
}

export function useExternalGameTracking({
  config,
  studentId,
  onEvent,
  onComplete,
  enabled = true,
}: UseExternalGameTrackingOptions) {
  const [progress, setProgress] = useState<ExternalGameProgress>(() => ({
    gameId: config.gameId,
    studentId: studentId || 'anonymous',
    startedAt: new Date(),
    lastPlayedAt: new Date(),
    totalTimeSpent: 0,
    objectivesCompleted: [],
    events: [],
    metadata: {},
  }));

  const [isActive, setIsActive] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const eventListenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const handleExternalEvent = useCallback((event: MessageEvent) => {
    if (!enabled || !isActive) return;

    // Verificar que el mensaje viene de un origen permitido
    const allowedOrigins = config.allowedOrigins || [];
    if (allowedOrigins.length > 0 && !allowedOrigins.includes(event.origin)) {
      return;
    }

    // Verificar que el mensaje es para nuestro juego
    const data = event.data;
    if (!data || data.gameId !== config.gameId || data.source !== config.source) {
      return;
    }

    const gameEvent: ExternalGameEvent = {
      source: config.source,
      gameId: config.gameId,
      action: data.action || 'unknown',
      score: data.score,
      duration: data.duration || 0,
      timestamp: new Date(),
      studentId: studentId,
      metadata: data.metadata || {},
    };

    // Actualizar progreso
    setProgress(prev => {
      const now = Date.now();
      const sessionTime = startTimeRef.current ? now - startTimeRef.current : 0;

      const newProgress = {
        ...prev,
        lastPlayedAt: new Date(),
        totalTimeSpent: prev.totalTimeSpent + sessionTime,
        events: [...prev.events, gameEvent],
        metadata: {
          ...prev.metadata,
          ...gameEvent.metadata,
        },
      };

      // Verificar objetivos completados
      if (config.objectives) {
        const newObjectives = config.objectives
          .filter(obj => {
            const criteria = obj.completionCriteria;
            return criteria.action === gameEvent.action &&
                   !prev.objectivesCompleted.includes(obj.id);
          })
          .map(obj => obj.id);

        newProgress.objectivesCompleted = [
          ...prev.objectivesCompleted,
          ...newObjectives,
        ];
      }

      // Verificar si el juego está completo
      if (data.action === 'complete' || data.action === 'finish') {
        newProgress.completedAt = new Date();
        newProgress.score = gameEvent.score || prev.score;

        onComplete?.(newProgress);
      }

      return newProgress;
    });

    // Reiniciar timer de sesión
    startTimeRef.current = Date.now();

    // Llamar callback de evento
    onEvent?.(gameEvent);
  }, [config, studentId, enabled, isActive, onEvent, onComplete]);

  const startTracking = useCallback(() => {
    if (!enabled) return;

    setIsActive(true);
    startTimeRef.current = Date.now();

    // Agregar listener de mensajes
    if (!eventListenerRef.current) {
      eventListenerRef.current = handleExternalEvent;
      window.addEventListener('message', eventListenerRef.current);
    }
  }, [enabled, handleExternalEvent]);

  const stopTracking = useCallback(() => {
    setIsActive(false);

    // Calcular tiempo final de sesión
    if (startTimeRef.current) {
      const sessionTime = Date.now() - startTimeRef.current;
      setProgress(prev => ({
        ...prev,
        totalTimeSpent: prev.totalTimeSpent + sessionTime,
      }));
      startTimeRef.current = null;
    }

    // Remover listener
    if (eventListenerRef.current) {
      window.removeEventListener('message', eventListenerRef.current);
      eventListenerRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    // Función para enviar mensajes al iframe del juego
    return {
      type: 'fuzzy-message',
      gameId: config.gameId,
      ...message,
    };
  }, [config.gameId]);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    progress,
    isActive,
    startTracking,
    stopTracking,
    sendMessage,
  };
}