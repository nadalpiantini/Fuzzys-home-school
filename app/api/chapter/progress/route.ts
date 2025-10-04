import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const curriculumId = searchParams.get('curriculumId');

    if (!studentId) {
      return NextResponse.json({ ok: false, error: 'Student ID required' }, { status: 400 });
    }

    let query = supabase
      .from('chapter_progress')
      .select('*')
      .eq('student_id', studentId);

    if (curriculumId) {
      query = query.eq('curriculum_id', curriculumId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching progress:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || [] });
  } catch (error) {
    console.error('Error in chapter progress GET:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, curriculumId, chapterId, completed, score, activityCompleted, timeSpent } = body;

    if (!studentId || !curriculumId || !chapterId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing required fields: studentId, curriculumId, chapterId' 
      }, { status: 400 });
    }

    // Upsert progress record
    const { data, error } = await supabase
      .from('chapter_progress')
      .upsert({
        student_id: studentId,
        curriculum_id: curriculumId,
        chapter_id: chapterId,
        completed: completed || false,
        score: score || 0,
        activity_completed: activityCompleted || false,
        time_spent: timeSpent || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'student_id,curriculum_id,chapter_id'
      })
      .select();

    if (error) {
      console.error('Error saving progress:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data?.[0] });
  } catch (error) {
    console.error('Error in chapter progress POST:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
