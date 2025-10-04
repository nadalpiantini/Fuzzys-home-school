import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const studentId = url.searchParams.get('studentId')
    const curriculumId = url.searchParams.get('curriculumId')
    const chapterId = url.searchParams.get('chapterId')

    if (!studentId || !curriculumId || !chapterId) {
      return NextResponse.json(
        { ok: false, error: 'missing_params' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('adaptive_sessions')
      .select('id, current_difficulty, total_questions, correct_answers, avg_response_ms, updated_at')
      .eq('student_id', studentId)
      .eq('curriculum_id', curriculumId)
      .eq('chapter_id', chapterId)
      .single()

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, state: data })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
