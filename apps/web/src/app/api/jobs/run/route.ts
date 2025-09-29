import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// Función para llamar a DeepSeek y generar juegos
async function callDeepSeek(prompt: string): Promise<any> {
  try {
    const response = await fetch(
      `${process.env.DEEPSEEK_BASE_URL}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `Eres un generador de juegos educativos para niños dominicanos. 
            Genera juegos apropiados para la edad, con temas culturales dominicanos.
            Responde SOLO con JSON válido con esta estructura:
            {
              "title": "Nombre del juego",
              "subject": "math|language|science|social|geo",
              "grade": "K-2|3-4|5-6|7-8|9-12",
              "content": {
                "type": "quiz|cards|match|sorting|visual|map|scavenger",
                "questions": [...],
                "theme": "tema_dominicano",
                "difficulty": "easy|medium|hard"
              }
            }`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parsear JSON de la respuesta
    return JSON.parse(content);
  } catch (error) {
    console.error('Error calling DeepSeek:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer(true); // useServiceRole = true

    // Tomar un job pendiente usando la función RPC
    const { data: job, error: jobError } = await supabase.rpc('take_one_job');

    if (jobError) {
      console.error('Error taking job:', jobError);
      return NextResponse.json(
        { ok: false, error: jobError.message },
        { status: 500 },
      );
    }

    if (!job) {
      return NextResponse.json({
        ok: true,
        message: 'No pending jobs',
      });
    }

    console.log(
      `Processing job ${job.id} with target_count: ${job.target_count}`,
    );

    const runs = job.target_count || 2;
    const generatedGames = [];

    // Generar los juegos solicitados
    for (let i = 0; i < runs; i++) {
      try {
        const prompt = `Genera un juego educativo para niños dominicanos. 
        Debe ser apropiado para edad escolar, con temas culturales de República Dominicana.
        Incluye elementos como: colmado, barrio, sancocho, merengue, béisbol, etc.`;

        const generatedGame = await callDeepSeek(prompt);

        // Insertar el juego como 'queued' primero
        const { data: insertedGame, error: insertError } = await supabase
          .from('games_pool')
          .insert({
            title: generatedGame.title,
            subject: generatedGame.subject,
            grade: generatedGame.grade,
            content: generatedGame.content,
            status: 'queued',
            source: 'ai',
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting game:', insertError);
          continue;
        }

        // Promover a 'ready' inmediatamente
        const { error: updateError } = await supabase
          .from('games_pool')
          .update({
            status: 'ready',
            ready_at: new Date().toISOString(),
          })
          .eq('id', insertedGame.id);

        if (updateError) {
          console.error('Error promoting game to ready:', updateError);
        } else {
          generatedGames.push(insertedGame);
          console.log(`Generated game: ${generatedGame.title}`);
        }
      } catch (gameError) {
        console.error(`Error generating game ${i + 1}:`, gameError);
        continue;
      }
    }

    // Marcar el job como completado
    await supabase
      .from('generation_jobs')
      .update({
        status: 'done',
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return NextResponse.json({
      ok: true,
      message: `Generated ${generatedGames.length} games`,
      games: generatedGames.length,
      job_id: job.id,
    });
  } catch (error) {
    console.error('Unexpected error in job runner:', error);

    // Marcar job como fallido si hay error
    try {
      const supabase = getSupabaseServer(true); // useServiceRole = true
      await supabase
        .from('generation_jobs')
        .update({
          status: 'failed',
          error: String(error),
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'current_job_id'); // Esto se manejaría mejor con el job actual
    } catch (updateError) {
      console.error('Error updating failed job:', updateError);
    }

    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
