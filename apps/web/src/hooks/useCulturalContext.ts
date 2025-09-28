'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  culturalContextService,
  CulturalContext,
  UserCulturalPreferences,
} from '@/lib/cultural-context/CulturalContextService';

interface CulturalContextState {
  currentContext: CulturalContext | null;
  userPreferences: UserCulturalPreferences | null;
  availableContexts: CulturalContext[];
  isLoading: boolean;
  error: string | null;
}

export function useCulturalContext(userId?: string) {
  const [state, setState] = useState<CulturalContextState>({
    currentContext: null,
    userPreferences: null,
    availableContexts: [],
    isLoading: true,
    error: null,
  });

  // Cargar contexto cultural
  const loadCulturalContext = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Obtener contexto para el usuario
      const context = await culturalContextService.getContextForUser(
        userId || '',
      );

      // Obtener preferencias del usuario si hay userId
      let preferences: UserCulturalPreferences | null = null;
      if (userId) {
        preferences =
          await culturalContextService.getUserCulturalPreferences(userId);
      }

      // Obtener todos los contextos disponibles
      const availableContexts = await culturalContextService.getAllContexts();

      setState((prev) => ({
        ...prev,
        currentContext: context,
        userPreferences: preferences,
        availableContexts,
        isLoading: false,
      }));

      return context;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('Error loading cultural context:', error);
      return null;
    }
  }, [userId]);

  // Detectar contexto automáticamente
  const detectContext = useCallback(
    async (userLocation?: {
      country?: string;
      region?: string;
      language?: string;
    }) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const context =
          await culturalContextService.detectCulturalContext(userLocation);

        setState((prev) => ({
          ...prev,
          currentContext: context,
          isLoading: false,
        }));

        return context;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        console.error('Error detecting cultural context:', error);
        return null;
      }
    },
    [],
  );

  // Cambiar contexto cultural
  const changeContext = useCallback(
    async (contextId: string, manualOverride: boolean = true) => {
      if (!userId) {
        setState((prev) => ({
          ...prev,
          error: 'User ID is required to change cultural context',
        }));
        return false;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Actualizar preferencias del usuario
        const success =
          await culturalContextService.updateUserCulturalPreferences(
            userId,
            contextId,
            false, // auto_detect = false
            manualOverride,
          );

        if (!success) {
          throw new Error('Failed to update cultural preferences');
        }

        // Recargar contexto
        await loadCulturalContext();

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        console.error('Error changing cultural context:', error);
        return false;
      }
    },
    [userId, loadCulturalContext],
  );

  // Habilitar auto-detección
  const enableAutoDetection = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({
        ...prev,
        error: 'User ID is required to enable auto-detection',
      }));
      return false;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Detectar contexto automáticamente
      const context = await culturalContextService.detectCulturalContext();

      if (!context) {
        throw new Error('Could not detect cultural context');
      }

      // Actualizar preferencias para auto-detección
      const success =
        await culturalContextService.updateUserCulturalPreferences(
          userId,
          context.id,
          true, // auto_detect = true
          false, // manual_override = false
        );

      if (!success) {
        throw new Error('Failed to update cultural preferences');
      }

      setState((prev) => ({
        ...prev,
        currentContext: context,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('Error enabling auto-detection:', error);
      return false;
    }
  }, [userId]);

  // Obtener elementos culturales
  const getCulturalElements = useCallback(
    async (category?: string) => {
      if (!state.currentContext) {
        return [];
      }

      try {
        return await culturalContextService.getCulturalElements(
          state.currentContext.id,
          category,
        );
      } catch (error) {
        console.error('Error getting cultural elements:', error);
        return [];
      }
    },
    [state.currentContext],
  );

  // Generar prompt cultural
  const generateCulturalPrompt = useCallback(
    async (subject: string, grade: string) => {
      if (!state.currentContext) {
        return 'Genera un juego educativo apropiado para la edad escolar.';
      }

      try {
        return await culturalContextService.generateCulturalPrompt(
          state.currentContext.id,
          subject,
          grade,
        );
      } catch (error) {
        console.error('Error generating cultural prompt:', error);
        return 'Genera un juego educativo apropiado para la edad escolar.';
      }
    },
    [state.currentContext],
  );

  // Cargar contexto al montar
  useEffect(() => {
    loadCulturalContext();
  }, [loadCulturalContext]);

  return {
    // Estado
    currentContext: state.currentContext,
    userPreferences: state.userPreferences,
    availableContexts: state.availableContexts,
    isLoading: state.isLoading,
    error: state.error,

    // Acciones
    loadCulturalContext,
    detectContext,
    changeContext,
    enableAutoDetection,
    getCulturalElements,
    generateCulturalPrompt,

    // Utilidades
    clearError: () => setState((prev) => ({ ...prev, error: null })),
    refresh: loadCulturalContext,
  };
}
