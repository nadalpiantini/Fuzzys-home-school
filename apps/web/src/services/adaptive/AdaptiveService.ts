import { AdaptiveEngine, LearningProfile, ActivityAttempt, AdaptiveRecommendation } from '@fuzzys/adaptive-engine';
import { createClient } from '@/lib/supabase/client';

export class AdaptiveService {
  private engine: AdaptiveEngine;
  private supabase = createClient();

  constructor() {
    this.engine = new AdaptiveEngine();
  }

  async getLearningProfile(userId: string): Promise<LearningProfile | null> {
    const { data, error } = await this.supabase
      .from('learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      userId: data.user_id,
      learningStyle: data.learning_style,
      knowledgeMap: data.knowledge_map,
      preferences: data.preferences,
      performance: data.performance,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateLearningProfile(profile: LearningProfile): Promise<void> {
    const { error } = await this.supabase
      .from('learning_profiles')
      .upsert({
        user_id: profile.userId,
        learning_style: profile.learningStyle,
        knowledge_map: profile.knowledgeMap,
        preferences: profile.preferences,
        performance: profile.performance,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to update learning profile: ${error.message}`);
    }
  }

  async recordActivityAttempt(attempt: ActivityAttempt): Promise<void> {
    const { error } = await this.supabase
      .from('activity_attempts')
      .insert({
        user_id: attempt.userId,
        activity_id: attempt.activityId,
        game_type: attempt.gameType,
        concept: attempt.concept,
        difficulty: attempt.difficulty,
        start_time: attempt.startTime.toISOString(),
        end_time: attempt.endTime?.toISOString(),
        score: attempt.score,
        time_spent: attempt.timeSpent,
        hints_used: attempt.hintsUsed,
        mistakes: attempt.mistakes,
        completed: attempt.completed
      });

    if (error) {
      throw new Error(`Failed to record activity attempt: ${error.message}`);
    }
  }

  async getRecommendations(userId: string): Promise<AdaptiveRecommendation[]> {
    const profile = await this.getLearningProfile(userId);
    if (!profile) {
      // Create default profile for new user
      const defaultProfile: LearningProfile = {
        userId,
        learningStyle: 'multimodal',
        knowledgeMap: {},
        preferences: {
          preferredDifficulty: 0.5,
          sessionLength: 30,
          feedbackStyle: 'immediate'
        },
        performance: {
          overallProgress: 0,
          strengthAreas: [],
          improvementAreas: [],
          recentTrends: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.updateLearningProfile(defaultProfile);
      return [];
    }

    // Get recent activities for context
    const { data: activities } = await this.supabase
      .from('activity_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    const formattedActivities = activities?.map(a => ({
      userId: a.user_id,
      activityId: a.activity_id,
      gameType: a.game_type,
      concept: a.concept,
      difficulty: a.difficulty,
      startTime: new Date(a.start_time),
      endTime: a.end_time ? new Date(a.end_time) : undefined,
      score: a.score,
      timeSpent: a.time_spent,
      hintsUsed: a.hints_used,
      mistakes: a.mistakes,
      completed: a.completed
    })) || [];

    return this.engine.generateRecommendations(profile, formattedActivities);
  }

  async processActivityCompletion(userId: string, attempt: ActivityAttempt): Promise<AdaptiveRecommendation[]> {
    // Record the attempt
    await this.recordActivityAttempt(attempt);

    // Get current profile
    const profile = await this.getLearningProfile(userId);
    if (!profile) return [];

    // Update profile based on attempt
    const updatedProfile = this.engine.updateProfile(profile, attempt);
    await this.updateLearningProfile(updatedProfile);

    // Generate new recommendations
    return this.getRecommendations(userId);
  }

  async calculateOptimalDifficulty(userId: string, concept: string): Promise<number> {
    const profile = await this.getLearningProfile(userId);
    if (!profile) return 0.5; // Default medium difficulty

    return this.engine.calculateOptimalDifficulty(profile, concept);
  }

  async getProgressAnalytics(userId: string, timeframe: 'week' | 'month' | 'quarter' = 'month') {
    const daysAgo = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const { data: attempts } = await this.supabase
      .from('activity_attempts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (!attempts || attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        conceptProgress: {},
        progressTrend: 'stable' as const,
        streakData: { current: 0, longest: 0 }
      };
    }

    const totalAttempts = attempts.length;
    const averageScore = attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts;
    const totalTimeSpent = attempts.reduce((sum, a) => sum + a.time_spent, 0);

    // Calculate concept-specific progress
    const conceptProgress: Record<string, { attempts: number; averageScore: number; trend: 'improving' | 'stable' | 'declining' }> = {};

    attempts.forEach(attempt => {
      if (!conceptProgress[attempt.concept]) {
        conceptProgress[attempt.concept] = { attempts: 0, averageScore: 0, trend: 'stable' };
      }
      conceptProgress[attempt.concept].attempts++;
    });

    Object.keys(conceptProgress).forEach(concept => {
      const conceptAttempts = attempts.filter(a => a.concept === concept);
      conceptProgress[concept].averageScore = conceptAttempts.reduce((sum, a) => sum + a.score, 0) / conceptAttempts.length;

      // Calculate trend (compare first half vs second half)
      const midPoint = Math.floor(conceptAttempts.length / 2);
      const firstHalf = conceptAttempts.slice(0, midPoint);
      const secondHalf = conceptAttempts.slice(midPoint);

      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstHalfAvg = firstHalf.reduce((sum, a) => sum + a.score, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, a) => sum + a.score, 0) / secondHalf.length;

        if (secondHalfAvg > firstHalfAvg + 0.1) {
          conceptProgress[concept].trend = 'improving';
        } else if (secondHalfAvg < firstHalfAvg - 0.1) {
          conceptProgress[concept].trend = 'declining';
        }
      }
    });

    // Calculate overall progress trend
    const progressTrend = averageScore > 0.7 ? 'improving' : averageScore < 0.5 ? 'declining' : 'stable';

    // Calculate streak data
    const completedDays = new Set(attempts.filter(a => a.completed).map(a => a.created_at.split('T')[0]));
    const currentStreak = this.calculateCurrentStreak(Array.from(completedDays).sort());
    const longestStreak = this.calculateLongestStreak(Array.from(completedDays).sort());

    return {
      totalAttempts,
      averageScore,
      totalTimeSpent,
      conceptProgress,
      progressTrend,
      streakData: { current: currentStreak, longest: longestStreak }
    };
  }

  private calculateCurrentStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currentDate = new Date(sortedDates[i]);
      const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }
}

export const adaptiveService = new AdaptiveService();