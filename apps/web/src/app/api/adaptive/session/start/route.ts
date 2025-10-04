import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { studentId, curriculumId, chapterId, difficulty = 'medium' } = await req.json()
    
    if (!studentId || !curriculumId || !chapterId) {
      return NextResponse.json(
        { ok: false, error: 'missing_params' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Upsert session - creates new or updates existing based on unique constraint
    const { data, error } = await supabase
      .from('adaptive_sessions')
      .upsert(
        {
          student_id: studentId,
          curriculum_id: curriculumId,
          chapter_id: chapterId,
          current_difficulty: difficulty
        },
        { onConflict: 'student_id,curriculum_id,chapter_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, session: data })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
