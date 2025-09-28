import { H5PEvent } from '../types';

export interface H5PProgressData {
  contentId: string;
  userId: string;
  progress: number; // 0-1
  score?: number;
  maxScore?: number;
  timeSpent: number; // seconds
  attempts: number;
  completedAt?: Date;
  lastInteraction: Date;
  interactionEvents: H5PProgressEvent[];
  xAPIStatements?: xAPIStatement[];
}

export interface H5PProgressEvent {
  timestamp: Date;
  type: 'started' | 'progress' | 'completed' | 'interaction' | 'paused' | 'resumed';
  data: any;
  score?: number;
  maxScore?: number;
  completion?: number;
}

export interface xAPIStatement {
  actor: {
    name: string;
    mbox: string;
  };
  verb: {
    id: string;
    display: { [key: string]: string };
  };
  object: {
    id: string;
    definition: {
      name: { [key: string]: string };
      type: string;
    };
  };
  result?: {
    score?: {
      scaled?: number;
      raw?: number;
      min?: number;
      max?: number;
    };
    completion?: boolean;
    success?: boolean;
    duration?: string;
  };
  timestamp: string;
}

export class H5PProgressTracker {
  private progressData: Map<string, H5PProgressData> = new Map();
  private apiEndpoint: string;
  private saveInterval: number = 30000; // 30 seconds
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(apiEndpoint: string = '/api/h5p/progress') {
    this.apiEndpoint = apiEndpoint;
    this.startAutoSave();
  }

  public initializeContent(contentId: string, userId: string): H5PProgressData {
    const key = `${contentId}-${userId}`;

    if (!this.progressData.has(key)) {
      const progressData: H5PProgressData = {
        contentId,
        userId,
        progress: 0,
        timeSpent: 0,
        attempts: 0,
        lastInteraction: new Date(),
        interactionEvents: [],
        xAPIStatements: []
      };

      this.progressData.set(key, progressData);
      this.trackEvent(contentId, userId, {
        timestamp: new Date(),
        type: 'started',
        data: { contentId }
      });
    }

    return this.progressData.get(key)!;
  }

  public updateProgress(
    contentId: string,
    userId: string,
    event: H5PEvent
  ): void {
    const key = `${contentId}-${userId}`;
    const progressData = this.progressData.get(key);

    if (!progressData) {
      console.warn(`No progress data found for ${key}`);
      return;
    }

    // Update last interaction time
    progressData.lastInteraction = new Date();

    // Process the event
    switch (event.type) {
      case 'progress':
        if (event.data.completion !== undefined) {
          progressData.progress = Math.max(progressData.progress, event.data.completion);
        }
        this.trackEvent(contentId, userId, {
          timestamp: new Date(),
          type: 'progress',
          data: event.data,
          completion: event.data.completion
        });
        break;

      case 'completed':
        progressData.progress = 1;
        progressData.completedAt = new Date();
        if (event.data.score !== undefined && event.data.maxScore !== undefined) {
          progressData.score = event.data.score;
          progressData.maxScore = event.data.maxScore;
        }
        this.trackEvent(contentId, userId, {
          timestamp: new Date(),
          type: 'completed',
          data: event.data,
          score: event.data.score,
          maxScore: event.data.maxScore,
          completion: 1
        });
        break;

      case 'score':
        if (event.data.score !== undefined) {
          progressData.score = event.data.score;
        }
        if (event.data.maxScore !== undefined) {
          progressData.maxScore = event.data.maxScore;
        }
        this.trackEvent(contentId, userId, {
          timestamp: new Date(),
          type: 'interaction',
          data: event.data,
          score: event.data.score,
          maxScore: event.data.maxScore
        });
        break;

      case 'interaction':
        this.trackEvent(contentId, userId, {
          timestamp: new Date(),
          type: 'interaction',
          data: event.data
        });
        break;
    }

    // Generate xAPI statement
    const xapiStatement = this.generateXAPIStatement(contentId, userId, event);
    if (xapiStatement) {
      progressData.xAPIStatements = progressData.xAPIStatements || [];
      progressData.xAPIStatements.push(xapiStatement);
    }

    this.progressData.set(key, progressData);
  }

  private trackEvent(
    contentId: string,
    userId: string,
    event: H5PProgressEvent
  ): void {
    const key = `${contentId}-${userId}`;
    const progressData = this.progressData.get(key);

    if (progressData) {
      progressData.interactionEvents.push(event);

      // Limit event history to last 100 events
      if (progressData.interactionEvents.length > 100) {
        progressData.interactionEvents = progressData.interactionEvents.slice(-100);
      }
    }
  }

  private generateXAPIStatement(
    contentId: string,
    userId: string,
    event: H5PEvent
  ): xAPIStatement | null {
    const progressData = this.progressData.get(`${contentId}-${userId}`);
    if (!progressData) return null;

    const baseStatement: Partial<xAPIStatement> = {
      actor: {
        name: `User ${userId}`,
        mbox: `mailto:user${userId}@fuzzyshomeschool.com`
      },
      object: {
        id: `${window.location.origin}/h5p/content/${contentId}`,
        definition: {
          name: { 'es': `Contenido H5P ${contentId}` },
          type: 'http://adlnet.gov/expapi/activities/lesson'
        }
      },
      timestamp: new Date().toISOString()
    };

    switch (event.type) {
      case 'completed':
        return {
          ...baseStatement,
          verb: {
            id: 'http://adlnet.gov/expapi/verbs/completed',
            display: { 'es': 'completó', 'en': 'completed' }
          },
          result: {
            completion: true,
            success: event.data.score ? event.data.score >= ((event.data.maxScore || 100) * 0.7) : true,
            score: event.data.score !== undefined ? {
              scaled: event.data.maxScore ? event.data.score / event.data.maxScore : undefined,
              raw: event.data.score,
              max: event.data.maxScore
            } : undefined,
            duration: this.formatDuration(progressData.timeSpent)
          }
        } as xAPIStatement;

      case 'progress':
        return {
          ...baseStatement,
          verb: {
            id: 'http://adlnet.gov/expapi/verbs/progressed',
            display: { 'es': 'progresó', 'en': 'progressed' }
          },
          result: {
            completion: event.data.completion === 1,
            score: event.data.completion ? {
              scaled: event.data.completion
            } : undefined
          }
        } as xAPIStatement;

      case 'interaction':
        return {
          ...baseStatement,
          verb: {
            id: 'http://adlnet.gov/expapi/verbs/interacted',
            display: { 'es': 'interactuó', 'en': 'interacted' }
          },
          result: event.data.correct !== undefined ? {
            success: event.data.correct,
            response: event.data.response
          } : undefined
        } as xAPIStatement;

      default:
        return null;
    }
  }

  private formatDuration(seconds: number): string {
    // Convert to ISO 8601 duration format (PT[n]H[n]M[n]S)
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let duration = 'PT';
    if (hours > 0) duration += `${hours}H`;
    if (minutes > 0) duration += `${minutes}M`;
    if (secs > 0) duration += `${secs}S`;

    return duration;
  }

  public getProgress(contentId: string, userId: string): H5PProgressData | null {
    const key = `${contentId}-${userId}`;
    return this.progressData.get(key) || null;
  }

  public getAllProgress(): H5PProgressData[] {
    return Array.from(this.progressData.values());
  }

  public async saveProgress(contentId?: string, userId?: string): Promise<void> {
    try {
      let dataToSave: H5PProgressData[];

      if (contentId && userId) {
        const key = `${contentId}-${userId}`;
        const data = this.progressData.get(key);
        dataToSave = data ? [data] : [];
      } else {
        dataToSave = this.getAllProgress();
      }

      if (dataToSave.length === 0) return;

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progressData: dataToSave })
      });

      if (!response.ok) {
        throw new Error(`Failed to save progress: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Error saving H5P progress:', error);
    }
  }

  public async loadProgress(contentId: string, userId: string): Promise<H5PProgressData | null> {
    try {
      const response = await fetch(`${this.apiEndpoint}/${contentId}/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No progress found
        }
        throw new Error(`Failed to load progress: ${response.statusText}`);
      }

      const progressData: H5PProgressData = await response.json();

      // Convert date strings back to Date objects
      progressData.lastInteraction = new Date(progressData.lastInteraction);
      if (progressData.completedAt) {
        progressData.completedAt = new Date(progressData.completedAt);
      }
      progressData.interactionEvents = progressData.interactionEvents.map(event => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));

      const key = `${contentId}-${userId}`;
      this.progressData.set(key, progressData);

      return progressData;
    } catch (error) {
      console.error('Error loading H5P progress:', error);
      return null;
    }
  }

  public updateTimeSpent(contentId: string, userId: string, additionalSeconds: number): void {
    const key = `${contentId}-${userId}`;
    const progressData = this.progressData.get(key);

    if (progressData) {
      progressData.timeSpent += additionalSeconds;
      progressData.lastInteraction = new Date();
    }
  }

  public incrementAttempts(contentId: string, userId: string): void {
    const key = `${contentId}-${userId}`;
    const progressData = this.progressData.get(key);

    if (progressData) {
      progressData.attempts++;
    }
  }

  public getCompletionRate(contentId: string): number {
    const contentProgress = Array.from(this.progressData.values())
      .filter(data => data.contentId === contentId);

    if (contentProgress.length === 0) return 0;

    const completed = contentProgress.filter(data => data.progress === 1).length;
    return completed / contentProgress.length;
  }

  public getAverageScore(contentId: string): number | null {
    const contentProgress = Array.from(this.progressData.values())
      .filter(data => data.contentId === contentId && data.score !== undefined);

    if (contentProgress.length === 0) return null;

    const totalScore = contentProgress.reduce((sum, data) => {
      if (data.score !== undefined && data.maxScore !== undefined) {
        return sum + (data.score / data.maxScore);
      }
      return sum;
    }, 0);

    return totalScore / contentProgress.length;
  }

  public exportProgressData(format: 'json' | 'csv' | 'xapi' = 'json'): string {
    const allProgress = this.getAllProgress();

    switch (format) {
      case 'json':
        return JSON.stringify(allProgress, null, 2);

      case 'csv':
        const headers = ['contentId', 'userId', 'progress', 'score', 'maxScore', 'timeSpent', 'attempts', 'completedAt', 'lastInteraction'];
        const rows = allProgress.map(data => [
          data.contentId,
          data.userId,
          data.progress,
          data.score || '',
          data.maxScore || '',
          data.timeSpent,
          data.attempts,
          data.completedAt?.toISOString() || '',
          data.lastInteraction.toISOString()
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');

      case 'xapi':
        const allStatements = allProgress.flatMap(data => data.xAPIStatements || []);
        return JSON.stringify(allStatements, null, 2);

      default:
        return JSON.stringify(allProgress, null, 2);
    }
  }

  private startAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      this.saveProgress();
    }, this.saveInterval);
  }

  public stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  public destroy(): void {
    this.stopAutoSave();
    this.progressData.clear();
  }
}

export default H5PProgressTracker;