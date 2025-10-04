import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseServer } from '@/lib/supabase/server';
import { WeeklyReportEmail } from '@/lib/email/templates/weekly-report';

const resend = new Resend(process.env.RESEND_API_KEY || 're_development_key');

export async function POST(req: Request) {
  try {
    const { parentId } = await req.json();

    if (!parentId) {
      return NextResponse.json(
        { ok: false, error: 'Missing parentId parameter' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer(true);

    // Get parent profile with email
    const { data: parentProfile, error: parentError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', parentId)
      .single();

    if (parentError || !parentProfile || !parentProfile.email) {
      return NextResponse.json(
        { ok: false, error: 'Parent profile or email not found' },
        { status: 404 }
      );
    }

    // Get linked students
    const { data: links, error: linksError } = await supabase
      .from('family_links')
      .select('student_id')
      .eq('parent_id', parentId);

    if (linksError || !links || links.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No students linked to this parent' },
        { status: 404 }
      );
    }

    const studentIds = links.map((link: { student_id: string }) => link.student_id);

    // Get weekly data using existing view
    const { data: weeklyData, error: weeklyError } = await supabase
      .from('v_parent_weekly')
      .select('*')
      .in('student_id', studentIds);

    if (weeklyError) {
      console.error('Error fetching weekly data:', weeklyError);
      return NextResponse.json(
        { ok: false, error: weeklyError.message },
        { status: 500 }
      );
    }

    // Aggregate data by student
    const studentSummaries: Record<string, any> = {};

    for (const row of weeklyData || []) {
      const studentId = row.student_id;

      if (!studentSummaries[studentId]) {
        studentSummaries[studentId] = {
          studentName: row.student_name,
          totalPoints: row.total_points ?? 0,
          streakDays: row.streak_days ?? 0,
          chapters: [],
        };
      }

      studentSummaries[studentId].chapters.push({
        curriculumId: row.curriculum_id,
        chapterId: row.chapter_id,
        completed: row.completed,
        score: row.score,
        updatedAt: row.updated_at,
      });
    }

    // Format data for email template
    const students = Object.values(studentSummaries).map((student: any) => {
      const chapters = student.chapters;
      const chaptersCompleted = chapters.filter((c: any) => c.completed).length;
      const avgScore =
        chapters.length > 0
          ? Math.round(
              chapters.reduce((sum: number, c: any) => sum + (c.score || 0), 0) /
                chapters.length
            )
          : 0;

      // Calculate subject-specific stats
      const subjectStats = ['math', 'literacy', 'science'].map((subject) => {
        const subjectChapters = chapters.filter((c: any) =>
          c.curriculumId.includes(subject)
        );
        const completedCount = subjectChapters.filter((c: any) => c.completed).length;
        const subjectAvg =
          subjectChapters.length > 0
            ? Math.round(
                subjectChapters.reduce((sum: number, c: any) => sum + (c.score || 0), 0) /
                  subjectChapters.length
              )
            : 0;

        return {
          name:
            subject === 'math'
              ? 'Matemáticas'
              : subject === 'literacy'
              ? 'Lectoescritura'
              : 'Ciencias',
          icon:
            subject === 'math' ? '🔢' : subject === 'literacy' ? '📖' : '🔬',
          completedCount,
          avgScore: subjectAvg,
        };
      });

      return {
        studentName: student.studentName,
        totalPoints: student.totalPoints,
        streakDays: student.streakDays,
        chaptersCompleted,
        avgScore,
        subjects: subjectStats,
      };
    });

    // Calculate week range
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-DO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    // Get dashboard URL
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/parent/dashboard`;

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Fuzzy\'s Home School <onboarding@resend.dev>', // Replace with your verified domain
      to: [parentProfile.email],
      subject: `📊 Reporte Semanal - ${formatDate(weekStart)} a ${formatDate(now)}`,
      react: WeeklyReportEmail({
        parentName: parentProfile.name || 'Padre/Madre',
        students,
        weekStart: formatDate(weekStart),
        weekEnd: formatDate(now),
        dashboardUrl,
      }),
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        { ok: false, error: emailError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Email sent successfully',
      emailId: emailData?.id,
    });
  } catch (error) {
    console.error('Send Report API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
