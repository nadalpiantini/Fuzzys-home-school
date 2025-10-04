import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentId,
      curriculumId,
      chapterId,
      completed = false,
      score = 0,
      activityCompleted = false,
      timeSpent = 0
    } = body;

    // Validar parámetros requeridos
    if (!studentId || !curriculumId || !chapterId) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameters: studentId, curriculumId, chapterId' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer(true);

    // Obtener progreso actual o crear nuevo
    const { data: currentProgress } = await supabase
      .from('chapter_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('curriculum_id', curriculumId)
      .eq('chapter_id', chapterId)
      .single();

    const now = new Date().toISOString();

    let updateData: any = {
      student_id: studentId,
      curriculum_id: curriculumId,
      chapter_id: chapterId,
      last_activity: now,
      updated_at: now
    };

    if (currentProgress) {
      // Actualizar progreso existente
      updateData.score = Math.max(currentProgress.score || 0, score);
      updateData.time_spent = (currentProgress.time_spent || 0) + timeSpent;

      if (activityCompleted) {
        updateData.activities_completed = (currentProgress.activities_completed || 0) + 1;
      }

      if (completed) {
        updateData.completed = true;
      }
    } else {
      // Crear nuevo progreso
      updateData.score = score;
      updateData.time_spent = timeSpent;
      updateData.activities_completed = activityCompleted ? 1 : 0;
      updateData.completed = completed;
      updateData.created_at = now;
    }

    // Upsert en la base de datos
    const { data, error } = await supabase
      .from('chapter_progress')
      .upsert(updateData, {
        onConflict: 'student_id,curriculum_id,chapter_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating chapter progress:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
      message: completed ? 'Chapter completed!' : 'Progress updated'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const curriculumId = searchParams.get('curriculumId');

    if (!studentId) {
      return NextResponse.json(
        { ok: false, error: 'Missing studentId parameter' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer(true);

    let query = supabase
      .from('chapter_progress')
      .select('*')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });

    if (curriculumId) {
      query = query.eq('curriculum_id', curriculumId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching chapter progress:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: data || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}