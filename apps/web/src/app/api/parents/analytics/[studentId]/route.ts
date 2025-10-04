import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { AnalyticsService } from '@/services/analytics/analyticsService';

// Supabase client will be created using factory pattern in functions

export interface ParentAnalyticsData {
  studentInfo: {
    id: string;
    name: string;
    level: number;
    totalPoints: number;
    streak: number;
  };
  weeklyData: {
    totalTimeSpent: number;
    gamesCompleted: number;
    averageScore: number;
    subjectsStudied: number;
    achievementsEarned: number;
  };
  subjectBreakdown: Array<{
    subject: string;
    mastery: number;
    timeSpent: number;
    gamesPlayed: number;
    trend: 'up' | 'down' | 'stable';
    recommendations: string[];
  }>;
  weeklyBreakdown: Array<{
    day: string;
    points: number;
    gamesPlayed: number;
    timeSpent: number;
  }>;
  recentAchievements: Array<{
    id: string;
    title: string;
    description: string;
    earnedAt: string;
    type: 'academic' | 'streak' | 'creativity' | 'completion';
  }>;
  learningPatterns: {
    bestTimeOfDay: string;
    averageSessionLength: number;
    preferredSubjects: string[];
    strugglingAreas: string[];
    progressTrend: 'improving' | 'stable' | 'declining';
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const supabase = getSupabaseServer(true);
    const { studentId } = params;
    const cookieStore = cookies();
    const authCookie = cookieStore.get('sb-access-token') || cookieStore.get('supabase-auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get parent user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Verify parent has access to this student
    const { data: parentChild, error: accessError } = await supabase
      .from('parent_children')
      .select('student_id')
      .eq('parent_id', user.id)
      .eq('student_id', studentId)
      .single();

    if (accessError && accessError.code !== 'PGRST116') {
      console.error('Error checking parent access:', accessError);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // For development, allow access if no parent_children table exists
    if (!parentChild) {
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', studentId)
        .eq('role', 'student')
        .single();

      if (!studentProfile) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
    }

    // Get student basic info
    const { data: studentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', studentId)
      .single();

    if (profileError || !studentProfile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get time period from query params (default to last 7 days)
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'week';
    const daysBack = period === 'month' ? 30 : period === 'year' ? 365 : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startDateStr = startDate.toISOString();

    // Fetch all data in parallel
    const [
      pointsData,
      streakData,
      gameSessionsData,
      chapterProgressData,
      achievementsData,
      dailyAnalyticsData
    ] = await Promise.all([
      // Total points
      supabase
        .from('game_sessions')
        .select('points_earned')
        .eq('student_id', studentId)
        .eq('completed', true),

      // Current streak
      supabase
        .from('daily_analytics')
        .select('current_streak')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(1),

      // Game sessions for the period
      supabase
        .from('game_sessions')
        .select('*')
        .eq('student_id', studentId)
        .gte('started_at', startDateStr)
        .order('started_at', { ascending: false }),

      // Chapter progress for subjects
      supabase
        .from('chapter_progress')
        .select('*')
        .eq('student_id', studentId)
        .gte('created_at', startDateStr),

      // Recent achievements
      supabase
        .from('student_achievements')
        .select('*')
        .eq('student_id', studentId)
        .gte('earned_at', startDateStr)
        .order('earned_at', { ascending: false }),

      // Daily analytics for trends
      supabase
        .from('daily_analytics')
        .select('*')
        .eq('student_id', studentId)
        .gte('date', startDateStr.split('T')[0])
        .order('date', { ascending: false })
    ]);

    // Calculate metrics
    const totalPoints = pointsData.data?.reduce((sum: number, session: any) => sum + (session.points_earned || 0), 0) || 0;
    const currentStreak = streakData.data?.[0]?.current_streak || 0;
    const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1;

    // Process game sessions data
    const sessions = gameSessionsData.data || [];
    const completedSessions = sessions.filter((s: any) => s.completed);
    const totalTimeSpent = sessions.reduce((sum: number, s: any) => sum + (s.time_spent || 0), 0);
    const averageScore = completedSessions.length
      ? completedSessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / completedSessions.length
      : 0;

    // Subject breakdown
    const subjectMap = new Map<string, any>();

    // Process game sessions by subject
    sessions.forEach((session: any) => {
      const subject = session.subject || 'General';
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, {
          subject,
          sessions: [],
          totalTime: 0,
          totalScore: 0,
          completedCount: 0
        });
      }

      const subjectData = subjectMap.get(subject);
      subjectData.sessions.push(session);
      subjectData.totalTime += session.time_spent || 0;
      if (session.completed) {
        subjectData.totalScore += session.score || 0;
        subjectData.completedCount++;
      }
    });

    // Process chapter progress by subject
    (chapterProgressData.data || []).forEach(chapter => {
      const subject = chapter.subject || 'General';
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, {
          subject,
          sessions: [],
          totalTime: 0,
          totalScore: 0,
          completedCount: 0
        });
      }

      const subjectData = subjectMap.get(subject);
      subjectData.totalTime += chapter.time_spent || 0;
      if (chapter.completed) {
        subjectData.totalScore += chapter.score || 0;
        subjectData.completedCount++;
      }
    });

    const subjectBreakdown = Array.from(subjectMap.values()).map(data => ({
      subject: data.subject,
      mastery: data.completedCount > 0 ? Math.round(data.totalScore / data.completedCount) : 0,
      timeSpent: Math.round(data.totalTime / 60), // Convert to minutes
      gamesPlayed: data.sessions.length,
      trend: 'stable' as const, // TODO: Calculate based on historical data
      recommendations: []
    }));

    // Weekly breakdown (last 7 days)
    const weeklyBreakdown = [];
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const daySessions = sessions.filter(s =>
        s.started_at?.startsWith(dateStr)
      );

      weeklyBreakdown.push({
        day: daysOfWeek[date.getDay()],
        points: daySessions.reduce((sum, s) => sum + (s.points_earned || 0), 0),
        gamesPlayed: daySessions.length,
        timeSpent: Math.round(daySessions.reduce((sum, s) => sum + (s.time_spent || 0), 0) / 60)
      });
    }

    // Recent achievements
    const recentAchievements = (achievementsData.data || []).map(achievement => ({
      id: achievement.id,
      title: achievement.title || 'Achievement',
      description: achievement.description || '',
      earnedAt: achievement.earned_at,
      type: achievement.type || 'academic'
    }));

    // Learning patterns analysis
    const dailyData = dailyAnalyticsData.data || [];
    const recentDays = dailyData.slice(0, 7);

    const learningPatterns = {
      bestTimeOfDay: 'afternoon', // TODO: Calculate from session timestamps
      averageSessionLength: sessions.length > 0
        ? Math.round(totalTimeSpent / sessions.length / 60)
        : 0,
      preferredSubjects: subjectBreakdown
        .sort((a, b) => b.timeSpent - a.timeSpent)
        .slice(0, 3)
        .map(s => s.subject),
      strugglingAreas: subjectBreakdown
        .filter(s => s.mastery < 70)
        .map(s => s.subject),
      progressTrend: recentDays.length > 1
        ? (recentDays[0]?.average_score || 0) > (recentDays[recentDays.length - 1]?.average_score || 0)
          ? 'improving' as const
          : 'stable' as const
        : 'stable' as const
    };

    const analyticsData: ParentAnalyticsData = {
      studentInfo: {
        id: studentProfile.id,
        name: studentProfile.full_name || studentProfile.email.split('@')[0],
        level,
        totalPoints,
        streak: currentStreak
      },
      weeklyData: {
        totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
        gamesCompleted: completedSessions.length,
        averageScore: Math.round(averageScore),
        subjectsStudied: subjectBreakdown.length,
        achievementsEarned: recentAchievements.length
      },
      subjectBreakdown,
      weeklyBreakdown,
      recentAchievements,
      learningPatterns
    };

    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error in /api/parents/analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}