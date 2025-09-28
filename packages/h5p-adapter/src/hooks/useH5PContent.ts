import { useState, useEffect, useCallback } from 'react';
import { H5PContent, H5PEvent } from '../types';
import { H5PProgressTracker } from '../core/H5PProgressTracker';

interface UseH5PContentOptions {
  contentId: string;
  userId: string;
  autoSave?: boolean;
  apiEndpoint?: string;
}

interface H5PContentState {
  content: H5PContent | null;
  isLoading: boolean;
  error: string | null;
  progress: number;
  score: number | null;
  maxScore: number | null;
  timeSpent: number;
  attempts: number;
  isCompleted: boolean;
}

export const useH5PContent = ({
  contentId,
  userId,
  autoSave = true,
  apiEndpoint = '/api/h5p'
}: UseH5PContentOptions) => {
  const [state, setState] = useState<H5PContentState>({
    content: null,
    isLoading: true,
    error: null,
    progress: 0,
    score: null,
    maxScore: null,
    timeSpent: 0,
    attempts: 0,
    isCompleted: false
  });

  const [progressTracker] = useState(() =>
    new H5PProgressTracker(`${apiEndpoint}/progress`)
  );

  // Load content and progress data
  useEffect(() => {
    const loadContent = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Load H5P content
        const contentResponse = await fetch(`${apiEndpoint}/content/${contentId}`);
        if (!contentResponse.ok) {
          throw new Error('Failed to load H5P content');
        }
        const content: H5PContent = await contentResponse.json();

        // Load progress data
        const progressData = await progressTracker.loadProgress(contentId, userId);

        setState(prev => ({
          ...prev,
          content,
          isLoading: false,
          progress: progressData?.progress || 0,
          score: progressData?.score || null,
          maxScore: progressData?.maxScore || null,
          timeSpent: progressData?.timeSpent || 0,
          attempts: progressData?.attempts || 0,
          isCompleted: progressData?.progress === 1 || false
        }));

        // Initialize progress tracking
        progressTracker.initializeContent(contentId, userId);

      } catch (error) {
        console.error('Error loading H5P content:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    if (contentId && userId) {
      loadContent();
    }
  }, [contentId, userId, apiEndpoint]);

  // Time tracking
  useEffect(() => {
    if (!state.content || state.isCompleted) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
      progressTracker.updateTimeSpent(contentId, userId, secondsElapsed);

      setState(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + secondsElapsed
      }));
    }, 10000); // Update every 10 seconds

    return () => {
      clearInterval(interval);
      const finalSeconds = Math.floor((Date.now() - startTime) / 1000);
      progressTracker.updateTimeSpent(contentId, userId, finalSeconds);
    };
  }, [state.content, state.isCompleted, contentId, userId]);

  // Handle H5P events
  const handleH5PEvent = useCallback((event: H5PEvent) => {
    progressTracker.updateProgress(contentId, userId, event);

    setState(prev => {
      const newState = { ...prev };

      switch (event.type) {
        case 'progress':
          if (event.data.completion !== undefined) {
            newState.progress = Math.max(prev.progress, event.data.completion);
          }
          break;

        case 'completed':
          newState.progress = 1;
          newState.isCompleted = true;
          if (event.data.score !== undefined) {
            newState.score = event.data.score;
          }
          if (event.data.maxScore !== undefined) {
            newState.maxScore = event.data.maxScore;
          }
          break;

        case 'score':
          if (event.data.score !== undefined) {
            newState.score = event.data.score;
          }
          if (event.data.maxScore !== undefined) {
            newState.maxScore = event.data.maxScore;
          }
          break;
      }

      return newState;
    });

    // Auto-save progress if enabled
    if (autoSave) {
      progressTracker.saveProgress(contentId, userId);
    }
  }, [contentId, userId, autoSave]);

  // Manual save function
  const saveProgress = useCallback(async () => {
    try {
      await progressTracker.saveProgress(contentId, userId);
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  }, [contentId, userId]);

  // Reset progress
  const resetProgress = useCallback(async () => {
    try {
      await fetch(`${apiEndpoint}/progress/${contentId}/${userId}`, {
        method: 'DELETE'
      });

      progressTracker.initializeContent(contentId, userId);

      setState(prev => ({
        ...prev,
        progress: 0,
        score: null,
        maxScore: null,
        timeSpent: 0,
        attempts: 0,
        isCompleted: false
      }));

      return true;
    } catch (error) {
      console.error('Error resetting progress:', error);
      return false;
    }
  }, [contentId, userId, apiEndpoint]);

  // Restart content (increment attempts)
  const restartContent = useCallback(() => {
    progressTracker.incrementAttempts(contentId, userId);

    setState(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      progress: 0,
      score: null,
      isCompleted: false
    }));

    if (autoSave) {
      progressTracker.saveProgress(contentId, userId);
    }
  }, [contentId, userId, autoSave]);

  // Get completion status
  const getCompletionStatus = useCallback(() => {
    if (state.isCompleted) {
      const successThreshold = 0.7; // 70% success threshold
      const success = state.score && state.maxScore
        ? (state.score / state.maxScore) >= successThreshold
        : true;

      return {
        completed: true,
        success,
        score: state.score,
        maxScore: state.maxScore,
        percentage: state.maxScore ? Math.round((state.score || 0) / state.maxScore * 100) : null,
        timeSpent: state.timeSpent,
        attempts: state.attempts
      };
    }

    return {
      completed: false,
      success: null,
      score: state.score,
      maxScore: state.maxScore,
      percentage: state.progress ? Math.round(state.progress * 100) : 0,
      timeSpent: state.timeSpent,
      attempts: state.attempts
    };
  }, [state]);

  // Format time spent for display
  const formatTimeSpent = useCallback((seconds?: number) => {
    const timeToFormat = seconds !== undefined ? seconds : state.timeSpent;
    const hours = Math.floor(timeToFormat / 3600);
    const minutes = Math.floor((timeToFormat % 3600) / 60);
    const secs = timeToFormat % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }, [state.timeSpent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSave) {
        progressTracker.saveProgress(contentId, userId);
      }
    };
  }, []);

  return {
    // State
    ...state,

    // Actions
    handleH5PEvent,
    saveProgress,
    resetProgress,
    restartContent,

    // Computed values
    completionStatus: getCompletionStatus(),
    formattedTimeSpent: formatTimeSpent(),
    progressPercentage: Math.round(state.progress * 100),

    // Utilities
    formatTimeSpent,
    progressTracker
  };
};

export default useH5PContent;