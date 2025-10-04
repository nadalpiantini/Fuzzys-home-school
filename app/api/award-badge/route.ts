import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, badgeName, curriculumId, chapterId } = body;

    if (!studentId || !badgeName) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing required fields: studentId, badgeName' 
      }, { status: 400 });
    }

    // Check if badge already exists
    const { data: existingBadge } = await supabase
      .from('student_achievements')
      .select('id')
      .eq('student_id', studentId)
      .eq('achievement_name', badgeName)
      .single();

    if (existingBadge) {
      return NextResponse.json({ 
        ok: true, 
        alreadyAwarded: true,
        message: 'Badge already awarded'
      });
    }

    // Create achievement record
    const { data, error } = await supabase
      .from('student_achievements')
      .insert({
        student_id: studentId,
        achievement_type: 'badge',
        achievement_name: badgeName,
        description: `Badge ganado: ${badgeName}`,
        curriculum_id: curriculumId || null,
        chapter_id: chapterId || null,
        earned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error awarding badge:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      achievement: data,
      alreadyAwarded: false
    });
  } catch (error) {
    console.error('Error in award badge:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
