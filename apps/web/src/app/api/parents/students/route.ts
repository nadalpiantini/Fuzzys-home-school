import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Supabase client will be created using factory pattern in functions

export interface Student {
  id: string;
  name: string;
  email: string;
  level: number;
  totalPoints: number;
  streak: number;
  lastActivity: string;
  subjects: string[];
  overallGrade: string;
  avatar?: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer(true);
    const cookieStore = cookies();
    const authCookie =
      cookieStore.get('sb-access-token') ||
      cookieStore.get('supabase-auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get parent user from auth token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authCookie.value);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 },
      );
    }

    // Get parent profile to ensure they have parent role
    const { data: parentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .eq('role', 'parent')
      .single();

    if (profileError || !parentProfile) {
      return NextResponse.json(
        { error: 'Access denied - not a parent' },
        { status: 403 },
      );
    }

    // Get students linked to this parent
    // Assuming we have a parent_children table that links parents to students
    const { data: parentChildren, error: childrenError } = await supabase
      .from('parent_children')
      .select(
        `
        student_id,
        profiles!inner(
          id,
          full_name,
          email,
          avatar_url,
          created_at
        )
      `,
      )
      .eq('parent_id', user.id);

    if (childrenError) {
      console.error('Error fetching parent children:', childrenError);
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 },
      );
    }

    // If no parent_children table exists yet, let's try direct profile lookup
    // This is a fallback for development
    const studentIds = parentChildren?.map((pc) => pc.student_id) || [];

    if (studentIds.length === 0) {
      // Fallback: get all student profiles for development
      const { data: allStudents } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, created_at')
        .eq('role', 'student')
        .limit(5); // Limit for development

      if (allStudents) {
        studentIds.push(...allStudents.map((s) => s.id));
      }
    }

    // Get detailed student data
    const studentsPromises = studentIds.map(async (studentId) => {
      // Get basic profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', studentId)
        .single();

      if (!profile) return null;

      // Get student statistics
      const [pointsData, streakData, lastActivityData, subjectsData] =
        await Promise.all([
          // Get total points from game sessions
          supabase
            .from('game_sessions')
            .select('points_earned')
            .eq('student_id', studentId)
            .eq('completed', true),

          // Get current streak
          supabase
            .from('daily_analytics')
            .select('current_streak')
            .eq('student_id', studentId)
            .order('date', { ascending: false })
            .limit(1),

          // Get last activity
          supabase
            .from('game_sessions')
            .select('started_at')
            .eq('student_id', studentId)
            .order('started_at', { ascending: false })
            .limit(1),

          // Get subjects from chapter progress
          supabase
            .from('chapter_progress')
            .select('subject')
            .eq('student_id', studentId)
            .not('subject', 'is', null),
        ]);

      // Calculate metrics
      const totalPoints =
        pointsData.data?.reduce(
          (sum, session) => sum + (session.points_earned || 0),
          0,
        ) || 0;
      const currentStreak = streakData.data?.[0]?.current_streak || 0;
      const lastActivity =
        lastActivityData.data?.[0]?.started_at || new Date().toISOString();
      const subjects = Array.from(
        new Set(
          subjectsData.data?.map((s) => s.subject) || [
            'Matemáticas',
            'Lengua',
            'Ciencias',
          ],
        ),
      );

      // Calculate level based on points (using same formula as AdvancedPointsSystem)
      const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1;

      // Calculate overall grade based on recent performance
      const { data: recentSessions } = await supabase
        .from('game_sessions')
        .select('score')
        .eq('student_id', studentId)
        .eq('completed', true)
        .order('started_at', { ascending: false })
        .limit(10);

      const averageScore = recentSessions?.length
        ? recentSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
          recentSessions.length
        : 0;

      const overallGrade =
        averageScore >= 90
          ? 'A'
          : averageScore >= 80
            ? 'B'
            : averageScore >= 70
              ? 'C'
              : averageScore >= 60
                ? 'D'
                : 'F';

      const student: Student = {
        id: profile.id,
        name: profile.full_name || profile.email.split('@')[0],
        email: profile.email,
        level,
        totalPoints,
        streak: currentStreak,
        lastActivity,
        subjects,
        overallGrade,
        avatar: profile.avatar_url,
      };

      return student;
    });

    const students = (await Promise.all(studentsPromises)).filter(
      Boolean,
    ) as Student[];

    return NextResponse.json({
      success: true,
      students,
      total: students.length,
    });
  } catch (error) {
    console.error('Error in /api/parents/students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
