import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

type WeeklyReportData = {
  students: StudentSummary[]
  recommendations: Record<string, Recommendation[]>
}

type StudentSummary = {
  studentId: string
  studentName: string
  totalPoints: number
  streakDays: number
  chapters: ChapterProgress[]
}

type ChapterProgress = {
  curriculumId: string
  chapterId: string
  completed: boolean
  score?: number
  updatedAt: string
}

type Recommendation = {
  curriculumId: string
  nextChapter: string
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const parentId = url.searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json(
        { ok: false, error: 'missing_parentId' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supa = getSupabaseServer(true)

    // Get student IDs linked to this parent
    const { data: links, error: linksError } = await supa
      .from('family_links')
      .select('student_id')
      .eq('parent_id', parentId)

    if (linksError) {
      console.error('Error fetching family links:', linksError)
      return NextResponse.json(
        { ok: false, error: linksError.message },
        { status: 500 }
      )
    }

    const studentIds = (links || []).map(link => link.student_id)

    if (studentIds.length === 0) {
      return NextResponse.json({
        ok: true,
        data: { students: [], recommendations: {} }
      })
    }

    // Get weekly progress data using the view
    const { data: weeklyData, error: weeklyError } = await supa
      .from('v_parent_weekly')
      .select('*')
      .in('student_id', studentIds)

    if (weeklyError) {
      console.error('Error fetching weekly data:', weeklyError)
      return NextResponse.json(
        { ok: false, error: weeklyError.message },
        { status: 500 }
      )
    }

    // Aggregate data by student
    const studentSummaries: Record<string, StudentSummary> = {}

    for (const row of weeklyData || []) {
      const studentId = row.student_id

      if (!studentSummaries[studentId]) {
        studentSummaries[studentId] = {
          studentId,
          studentName: row.student_name,
          totalPoints: row.total_points ?? 0,
          streakDays: row.streak_days ?? 0,
          chapters: []
        }
      }

      studentSummaries[studentId].chapters.push({
        curriculumId: row.curriculum_id,
        chapterId: row.chapter_id,
        completed: row.completed,
        score: row.score,
        updatedAt: row.updated_at
      })
    }

    // Generate simple recommendations for each student
    const recommendations: Record<string, Recommendation[]> = {}

    for (const [studentId, summary] of Object.entries(studentSummaries)) {
      const chaptersByCurriculum: Record<string, ChapterProgress[]> = {}

      // Group chapters by curriculum
      for (const chapter of summary.chapters) {
        if (!chaptersByCurriculum[chapter.curriculumId]) {
          chaptersByCurriculum[chapter.curriculumId] = []
        }
        chaptersByCurriculum[chapter.curriculumId].push(chapter)
      }

      // Generate recommendations per curriculum
      recommendations[studentId] = Object.entries(chaptersByCurriculum).map(
        ([curriculumId, chapters]) => {
          // For now, we'll let the client resolve the next chapter
          // based on the curriculum JSON data
          return {
            curriculumId,
            nextChapter: 'AUTO_CLIENT'
          }
        }
      )
    }

    const responseData: WeeklyReportData = {
      students: Object.values(studentSummaries),
      recommendations
    }

    return NextResponse.json({
      ok: true,
      data: responseData
    })

  } catch (error) {
    console.error('Unexpected error in weekly-report:', error)
    return NextResponse.json(
      { ok: false, error: 'internal_server_error' },
      { status: 500 }
    )
  }
}

// POST para crear/actualizar enlaces familiares
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parentId, studentId, relation = 'parent' } = body;

    if (!parentId || !studentId) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameters: parentId, studentId' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer(true);

    // Verificar que ambos perfiles existen
    const { data: parentProfile } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('id', parentId)
      .single();

    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('id', studentId)
      .single();

    if (!parentProfile || !studentProfile) {
      return NextResponse.json(
        { ok: false, error: 'Parent or student profile not found' },
        { status: 404 }
      );
    }

    // Crear enlace familiar
    const { data, error } = await supabase
      .from('family_links')
      .insert({
        parent_id: parentId,
        student_id: studentId,
        relation
      })
      .select()
      .single();

    if (error) {
      // Si ya existe, actualizar
      if (error.code === '23505') {
        const { data: updated, error: updateError } = await supabase
          .from('family_links')
          .update({ relation, updated_at: new Date().toISOString() })
          .eq('parent_id', parentId)
          .eq('student_id', studentId)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json(
            { ok: false, error: updateError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          ok: true,
          data: updated,
          message: 'Family link updated successfully'
        });
      }

      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
      message: 'Family link created successfully'
    });

  } catch (error) {
    console.error('Family Link POST API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}