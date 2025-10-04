import { createClient } from '@supabase/supabase-js';
import { AnalyticsData, AnalyticsFilters, AnalyticsReport } from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export class AnalyticsService {
  /**
   * Get comprehensive analytics data for teacher dashboard
   */
  static async getAnalyticsData(
    filters: AnalyticsFilters,
  ): Promise<AnalyticsData> {
    const dateFilter = this.getDateFilter(filters);

    // Fetch all data in parallel for better performance
    const [
      overview,
      subjectPerformance,
      recentActivity,
      topStudents,
      popularActivities,
      chapterTiming,
      heatmapData,
      engagementMetrics,
    ] = await Promise.all([
      this.getOverviewData(dateFilter, filters),
      this.getSubjectPerformance(dateFilter, filters),
      this.getRecentActivity(dateFilter, filters),
      this.getTopStudents(dateFilter, filters),
      this.getPopularActivities(dateFilter, filters),
      this.getChapterTiming(dateFilter, filters),
      this.getHeatmapData(dateFilter, filters),
      this.getEngagementMetrics(dateFilter, filters),
    ]);

    return {
      overview,
      subjectPerformance,
      recentActivity,
      topStudents,
      popularActivities,
      chapterTiming,
      heatmapData,
      engagementMetrics,
    };
  }

  /**
   * Generate comprehensive analytics report
   */
  static async generateReport(
    filters: AnalyticsFilters,
  ): Promise<AnalyticsReport> {
    const data = await this.getAnalyticsData(filters);
    const insights = this.generateInsights(data);
    const recommendations = this.generateRecommendations(data);

    return {
      generatedAt: new Date().toISOString(),
      period: filters.period,
      filters,
      data,
      insights,
      recommendations,
    };
  }

  /**
   * Get overview metrics
   */
  private static async getOverviewData(
    dateFilter: string,
    filters: AnalyticsFilters,
  ) {
    // Try to get from daily analytics first (more efficient)
    const { data: dailyAnalytics } = await supabase
      .from('daily_analytics')
      .select('*')
      .gte('date', dateFilter.split('T')[0])
      .order('date', { ascending: false })
      .limit(1);

    if (dailyAnalytics && dailyAnalytics.length > 0) {
      const latest = dailyAnalytics[0];
      return {
        totalStudents: latest.total_students,
        activeClasses: 3, // This would come from a classes table
        averageScore: Math.round(latest.average_score),
        completionRate: Math.round(latest.completion_rate),
        totalTimeSpent: Math.round(latest.total_time_spent),
        averageSessionTime: latest.total_sessions
          ? Math.round(latest.total_time_spent / latest.total_sessions)
          : 0,
        engagementScore: Math.round(latest.engagement_score),
      };
    }

    // Fallback to calculating from raw data
    const { data: students } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student');

    const { data: gameSessions } = await supabase
      .from('game_sessions')
      .select('score, time_spent, completed')
      .gte('started_at', dateFilter);

    const { data: chapterProgress } = await supabase
      .from('chapter_progress')
      .select('score, time_spent, completed')
      .gte('created_at', dateFilter);

    const totalStudents = students?.length || 0;
    const totalSessions = gameSessions?.length || 0;
    const completedSessions =
      gameSessions?.filter((s) => s.completed).length || 0;
    const totalTimeSpent =
      (gameSessions?.reduce(
        (sum: number, s: any) => sum + (s.time_spent || 0),
        0,
      ) || 0) / 60; // convert to minutes
    const averageScore = gameSessions?.length
      ? gameSessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) /
        gameSessions.length
      : 0;
    const completionRate = totalSessions
      ? (completedSessions / totalSessions) * 100
      : 0;

    return {
      totalStudents,
      activeClasses: 3, // This would come from a classes table
      averageScore: Math.round(averageScore),
      completionRate: Math.round(completionRate),
      totalTimeSpent: Math.round(totalTimeSpent),
      averageSessionTime: totalSessions
        ? Math.round(totalTimeSpent / totalSessions)
        : 0,
      engagementScore: Math.round((completionRate + averageScore) / 2) / 2,
    };
  }

  /**
   * Get subject performance data
   */
  private static async getSubjectPerformance(
    dateFilter: string,
    filters: AnalyticsFilters,
  ) {
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name, code');

    const performance = await Promise.all(
      subjects?.map(async (subject) => {
        const { data: sessions } = await supabase
          .from('game_sessions')
          .select('score, time_spent, completed')
          .eq('game_id', subject.id) // This would need proper game-subject relationship
          .gte('started_at', dateFilter);

        const scores = sessions?.map((s) => s.score || 0) || [];
        const averageScore = scores.length
          ? scores.reduce((sum: number, score: number) => sum + score, 0) /
            scores.length
          : 0;
        const completionRate = sessions?.length
          ? (sessions.filter((s) => s.completed).length / sessions.length) * 100
          : 0;

        return {
          subject: subject.name,
          subjectId: subject.id,
          score: Math.round(averageScore),
          trend: 'up' as const, // This would be calculated by comparing with previous period
          totalStudents: sessions?.length || 0,
          averageTimeSpent: sessions?.length
            ? Math.round(
                sessions.reduce(
                  (sum: number, s: any) => sum + (s.time_spent || 0),
                  0,
                ) /
                  sessions.length /
                  60,
              )
            : 0,
          completionRate: Math.round(completionRate),
          difficulty: 'medium' as const,
        };
      }) || [],
    );

    return performance;
  }

  /**
   * Get recent student activity
   */
  private static async getRecentActivity(
    dateFilter: string,
    filters: AnalyticsFilters,
  ) {
    const { data: activities } = await supabase
      .from('game_sessions')
      .select(
        `
        id,
        score,
        time_spent,
        started_at,
        completed,
        player_id,
        profiles!inner(full_name, avatar_url),
        games!inner(title, type)
      `,
      )
      .gte('started_at', dateFilter)
      .order('started_at', { ascending: false })
      .limit(20);

    return (
      activities?.map((activity) => ({
        studentId: activity.player_id,
        studentName: activity.profiles?.[0]?.full_name || 'Unknown',
        avatarUrl: activity.profiles?.[0]?.avatar_url,
        action: `Completó ${activity.games?.[0]?.title || 'Actividad'}`,
        subject: 'General', // This would come from game-subject relationship
        score: activity.score,
        timeSpent: Math.round((activity.time_spent || 0) / 60),
        timestamp: activity.started_at,
        activityType: 'game' as const,
      })) || []
    );
  }

  /**
   * Get top performing students
   */
  private static async getTopStudents(
    dateFilter: string,
    filters: AnalyticsFilters,
  ) {
    const { data: students } = await supabase
      .from('student_progress')
      .select(
        `
        student_id,
        total_points,
        games_played,
        games_won,
        streak_days,
        last_activity,
        profiles!inner(full_name, avatar_url)
      `,
      )
      .gte('updated_at', dateFilter)
      .order('total_points', { ascending: false })
      .limit(10);

    return (
      students?.map((student) => ({
        studentId: student.student_id,
        studentName: student.profiles?.[0]?.full_name || 'Unknown',
        avatarUrl: student.profiles?.[0]?.avatar_url,
        totalScore: student.total_points,
        gamesPlayed: student.games_played,
        averageScore: student.games_played
          ? Math.round(student.total_points / student.games_played)
          : 0,
        streakDays: student.streak_days,
        lastActivity: student.last_activity,
        improvement: 5, // This would be calculated by comparing with previous period
      })) || []
    );
  }

  /**
   * Get most popular activities
   */
  private static async getPopularActivities(
    dateFilter: string,
    filters: AnalyticsFilters,
  ) {
    const { data: activities } = await supabase
      .from('games')
      .select(
        `
        id,
        title,
        type,
        play_count,
        subjects!inner(name)
      `,
      )
      .gte('created_at', dateFilter)
      .order('play_count', { ascending: false })
      .limit(10);

    return (
      activities?.map((activity) => ({
        activityId: activity.id,
        activityName: activity.title,
        activityType: activity.type,
        subject: activity.subjects?.[0]?.name || 'General',
        playCount: activity.play_count,
        averageScore: 85, // This would be calculated from game_sessions
        completionRate: 90, // This would be calculated from game_sessions
        difficulty: 'medium',
        thumbnailUrl: undefined,
      })) || []
    );
  }

  /**
   * Get chapter timing data
   */
  private static async getChapterTiming(
    dateFilter: string,
    filters: AnalyticsFilters,
  ) {
    const { data: chapters } = await supabase
      .from('chapter_progress')
      .select(
        `
        chapter_id,
        curriculum_id,
        time_spent,
        completed,
        student_id
      `,
      )
      .gte('created_at', dateFilter);

    // Group by chapter and calculate averages
    const chapterMap = new Map();
    chapters?.forEach((chapter) => {
      const key = chapter.chapter_id;
      if (!chapterMap.has(key)) {
        chapterMap.set(key, {
          chapterId: chapter.chapter_id,
          chapterName: `Capítulo ${chapter.chapter_id}`,
          subject: chapter.curriculum_id,
          timeSpent: [],
          completed: 0,
          total: 0,
        });
      }
      const data = chapterMap.get(key);
      data.timeSpent.push(chapter.time_spent || 0);
      data.total++;
      if (chapter.completed) data.completed++;
    });

    return Array.from(chapterMap.values()).map((chapter) => ({
      chapterId: chapter.chapterId,
      chapterName: chapter.chapterName,
      subject: chapter.subject,
      averageTimeSpent: Math.round(
        chapter.timeSpent.reduce((sum: number, time: number) => sum + time, 0) /
          chapter.timeSpent.length /
          60,
      ),
      totalAttempts: chapter.total,
      completionRate: Math.round((chapter.completed / chapter.total) * 100),
      difficulty: 'medium',
      studentsCompleted: chapter.completed,
    }));
  }

  /**
   * Get heatmap data for activity patterns
   */
  private static async getHeatmapData(
    dateFilter: string,
    filters: AnalyticsFilters,
  ) {
    // Try to get from activity_heatmap table first
    const { data: heatmapData } = await supabase
      .from('activity_heatmap')
      .select(
        'hour, day_of_week, activity_count, average_score, total_time_spent',
      )
      .gte('date', dateFilter.split('T')[0]);

    if (heatmapData && heatmapData.length > 0) {
      return heatmapData.map((data) => ({
        hour: data.hour,
        day: data.day_of_week,
        activityCount: data.activity_count,
        averageScore: Math.round(data.average_score),
        totalTimeSpent: Math.round(data.total_time_spent),
      }));
    }

    // Fallback to calculating from raw data
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('started_at, score, time_spent')
      .gte('started_at', dateFilter);

    // Group by hour and day of week
    const heatmap = new Map();
    sessions?.forEach((session) => {
      const date = new Date(session.started_at);
      const hour = date.getHours();
      const day = date.getDay();
      const key = `${day}-${hour}`;

      if (!heatmap.has(key)) {
        heatmap.set(key, {
          hour,
          day,
          activityCount: 0,
          totalScore: 0,
          totalTimeSpent: 0,
        });
      }

      const data = heatmap.get(key);
      data.activityCount++;
      data.totalScore += session.score || 0;
      data.totalTimeSpent += session.time_spent || 0;
    });

    return Array.from(heatmap.values()).map((data) => ({
      hour: data.hour,
      day: data.day,
      activityCount: data.activityCount,
      averageScore: data.activityCount
        ? Math.round(data.totalScore / data.activityCount)
        : 0,
      totalTimeSpent: Math.round(data.totalTimeSpent / 60), // convert to minutes
    }));
  }

  /**
   * Get engagement metrics
   */
  private static async getEngagementMetrics(
    dateFilter: string,
    filters: AnalyticsFilters,
  ) {
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('player_id, started_at, time_spent')
      .gte('started_at', dateFilter);

    const uniqueUsers = new Set(sessions?.map((s) => s.player_id) || []);
    const totalTimeSpent =
      sessions?.reduce((sum: number, s: any) => sum + (s.time_spent || 0), 0) ||
      0;
    const averageSessionDuration = sessions?.length
      ? totalTimeSpent / sessions.length / 60
      : 0;

    return {
      dailyActiveUsers: uniqueUsers.size,
      weeklyActiveUsers: uniqueUsers.size, // This would be calculated differently
      monthlyActiveUsers: uniqueUsers.size,
      averageSessionDuration: Math.round(averageSessionDuration),
      bounceRate: 15, // This would be calculated from session data
      retentionRate: 85, // This would be calculated from user activity patterns
    };
  }

  /**
   * Generate insights from analytics data
   */
  private static generateInsights(data: AnalyticsData): string[] {
    const insights = [];

    if (data.overview.engagementScore > 80) {
      insights.push('Excelente nivel de engagement de los estudiantes');
    }

    if (data.overview.completionRate > 90) {
      insights.push('Alta tasa de completado en las actividades');
    }

    const topSubject = data.subjectPerformance.reduce(
      (prev: any, current: any) =>
        prev.score > current.score ? prev : current,
    );
    insights.push(`${topSubject.subject} es la materia con mejor rendimiento`);

    return insights;
  }

  /**
   * Generate recommendations based on analytics
   */
  private static generateRecommendations(data: AnalyticsData): string[] {
    const recommendations = [];

    if (data.overview.completionRate < 70) {
      recommendations.push(
        'Considera ajustar la dificultad de las actividades',
      );
    }

    if (data.overview.averageScore < 70) {
      recommendations.push('Implementa más ejercicios de práctica');
    }

    const lowPerformingSubjects = data.subjectPerformance.filter(
      (s) => s.score < 70,
    );
    if (lowPerformingSubjects.length > 0) {
      recommendations.push(
        `Revisa el contenido de: ${lowPerformingSubjects.map((s) => s.subject).join(', ')}`,
      );
    }

    return recommendations;
  }

  /**
   * Get date filter based on period
   */
  private static getDateFilter(filters: AnalyticsFilters): string {
    const now = new Date();
    let startDate: Date;

    switch (filters.period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        startDate = filters.startDate
          ? new Date(filters.startDate)
          : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return startDate.toISOString();
  }
}
