import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const {
      studentId,
      curriculumId,
      chapterId,
      feeling,
      difficulty,
      timeSpent,
    } = await req.json();

    if (!studentId || !curriculumId || !chapterId || !feeling) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Missing required fields: studentId, curriculumId, chapterId, feeling',
        },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Registrar feedback en la tabla ai_conversations
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: studentId,
        message: `Feedback del capítulo ${chapterId} en ${curriculumId}`,
        response: `Sentimiento: ${feeling}${difficulty ? ` | Dificultad percibida: ${difficulty}` : ''}${timeSpent ? ` | Tiempo: ${timeSpent}s` : ''}`,
        context: {
          type: 'feedback',
          curriculumId,
          chapterId,
          feeling,
          difficulty,
          timeSpent,
          timestamp: new Date().toISOString(),
        },
      })
      .select();

    if (error) {
      console.error('Error saving feedback:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    // Opcional: Actualizar patrones de aprendizaje en tiempo real
    // Esto podría disparar una actualización de las recomendaciones
    try {
      // Aquí podrías implementar lógica adicional para actualizar
      // las recomendaciones basadas en el feedback inmediato
      console.log('Feedback registrado:', {
        studentId,
        curriculumId,
        chapterId,
        feeling,
      });
    } catch (updateError) {
      console.error('Error updating patterns:', updateError);
      // No fallar la operación principal por esto
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: data[0]?.id,
        message: 'Feedback registrado exitosamente',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in adaptive feedback API:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Endpoint para obtener feedback histórico (opcional)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');
    const curriculumId = url.searchParams.get('curriculumId');

    if (!studentId) {
      return NextResponse.json(
        { ok: false, error: 'Missing studentId parameter' },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    let query = supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', studentId)
      .eq('context->>type', 'feedback')
      .order('created_at', { ascending: false });

    if (curriculumId) {
      query = query.eq('context->>curriculumId', curriculumId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error in adaptive feedback GET API:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
