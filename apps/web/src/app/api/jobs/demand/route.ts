import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { culturalContextService } from '@/lib/cultural-context/CulturalContextService';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// Función para llamar a DeepSeek y generar juegos por demanda
async function callDeepSeekForDemand(
  userCategory: string,
  subjects: string[],
  grades: string[],
  count: number = 3,
  userId?: string,
): Promise<any[]> {
  try {
    // Obtener contexto cultural para el usuario
    const culturalContext = userId
      ? await culturalContextService.getContextForUser(userId)
      : await culturalContextService.getDefaultContext();

    // Generar prompt cultural personalizado
    const culturalPrompt = await culturalContextService.generateCulturalPrompt(
      culturalContext.id,
      subjects[0] || 'math',
      userCategory,
    );

    // Obtener elementos culturales específicos
    const culturalElements = await culturalContextService.getCulturalElements(
      culturalContext.id,
    );

    const foodElements =
      culturalElements.find((e) => e.category === 'food')?.elements || [];
    const placeElements =
      culturalElements.find((e) => e.category === 'places')?.elements || [];
    const traditionElements =
      culturalElements.find((e) => e.category === 'traditions')?.elements || [];

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
              content: `Eres un generador de juegos educativos para niños de ${culturalContext.country_name}.
              Genera ${count} juegos diferentes para la categoría ${userCategory}.
              Cada juego debe ser apropiado para la edad, con temas culturales de ${culturalContext.country_name}.
              Responde SOLO con JSON válido con esta estructura:
              {
                "games": [
                  {
                    "title": "Nombre del juego",
                    "subject": "math|language|science|social|geo",
                    "grade": "${userCategory}",
                    "content": {
                      "type": "quiz|cards|match|sorting|visual|map|scavenger",
                      "questions": [...],
                      "theme": "tema_${culturalContext.country_code.toLowerCase()}",
                      "difficulty": "easy|medium|hard"
                    }
                  }
                ]
              }`,
            },
            {
              role: 'user',
              content: `${culturalPrompt}
              
              Contexto cultural específico:
              - Comida: ${foodElements.slice(0, 5).join(', ')}
              - Lugares: ${placeElements.slice(0, 5).join(', ')}
              - Tradiciones: ${traditionElements.slice(0, 3).join(', ')}
              
              Genera ${count} juegos educativos para niños de ${culturalContext.country_name} de la categoría ${userCategory}.
              Materias preferidas: ${subjects.join(', ')}.
              Asegúrate de que cada juego sea único, divertido y culturalmente relevante para ${culturalContext.country_name}.`,
            },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parsear JSON de la respuesta
    const parsed = JSON.parse(content);
    return parsed.games || [];
  } catch (error) {
    console.error('Error calling DeepSeek for demand generation:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer(true); // useServiceRole = true

    // Obtener jobs de generación por demanda pendientes
    const { data: jobs, error: jobsError } = await supabase
      .from('demand_generation_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5); // Procesar máximo 5 jobs por vez

    if (jobsError) {
      console.error('Error fetching demand jobs:', jobsError);
      return NextResponse.json(
        { ok: false, error: jobsError.message },
        { status: 500 },
      );
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No pending demand generation jobs',
        processed: 0,
      });
    }

    console.log(`Processing ${jobs.length} demand generation jobs`);

    const processedJobs = [];
    const generatedGames = [];

    // Procesar cada job
    for (const job of jobs) {
      try {
        console.log(
          `Processing demand job ${job.id} for user ${job.triggered_by_user_id} in category ${job.user_category}`,
        );

        // Marcar como running
        await supabase
          .from('demand_generation_jobs')
          .update({ status: 'running' })
          .eq('id', job.id);

        // Generar juegos con DeepSeek
        const games = await callDeepSeekForDemand(
          job.user_category,
          job.preferred_subjects || ['math', 'language', 'science'],
          job.preferred_grades || [job.user_category],
          job.target_count || 3,
          job.triggered_by_user_id,
        );

        const insertedGames = [];

        // Insertar cada juego generado
        for (const game of games) {
          try {
            const { data: insertedGame, error: insertError } = await supabase
              .from('games_pool')
              .insert({
                title: game.title,
                subject: game.subject,
                grade: game.grade,
                content: game.content,
                status: 'ready',
                source: 'ai',
                ready_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (insertError) {
              console.error('Error inserting demand game:', insertError);
              continue;
            }

            insertedGames.push(insertedGame.id);
            generatedGames.push(insertedGame);
            console.log(`Generated demand game: ${game.title}`);
          } catch (gameError) {
            console.error('Error processing individual game:', gameError);
            continue;
          }
        }

        // Actualizar el job con los juegos generados
        await supabase
          .from('demand_generation_jobs')
          .update({
            status: insertedGames.length > 0 ? 'done' : 'failed',
            generated_games: insertedGames,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        processedJobs.push({
          job_id: job.id,
          user_id: job.triggered_by_user_id,
          category: job.user_category,
          games_generated: insertedGames.length,
        });

        console.log(
          `Completed demand job ${job.id}: ${insertedGames.length} games generated`,
        );
      } catch (jobError) {
        console.error(`Error processing demand job ${job.id}:`, jobError);

        // Marcar job como fallido
        await supabase
          .from('demand_generation_jobs')
          .update({
            status: 'failed',
            error: String(jobError),
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        processedJobs.push({
          job_id: job.id,
          user_id: job.triggered_by_user_id,
          category: job.user_category,
          games_generated: 0,
          error: String(jobError),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Processed ${processedJobs.length} demand generation jobs`,
      processed_jobs: processedJobs,
      total_games_generated: generatedGames.length,
      games: generatedGames.map((g) => ({
        id: g.id,
        title: g.title,
        subject: g.subject,
        grade: g.grade,
      })),
    });
  } catch (error) {
    console.error('Unexpected error in demand generation:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Endpoint para obtener estadísticas de generación por demanda
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer(true); // useServiceRole = true
    const url = new URL(request.url);
    const userCategory = url.searchParams.get('category');

    let query = supabase
      .from('demand_generation_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (userCategory) {
      query = query.eq('user_category', userCategory);
    }

    const { data: jobs, error } = await query.limit(50);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    // Calcular estadísticas
    const stats = {
      total_jobs: jobs?.length || 0,
      pending: jobs?.filter((j) => j.status === 'pending').length || 0,
      running: jobs?.filter((j) => j.status === 'running').length || 0,
      completed: jobs?.filter((j) => j.status === 'done').length || 0,
      failed: jobs?.filter((j) => j.status === 'failed').length || 0,
      total_games_generated:
        jobs
          ?.filter((j) => j.status === 'done')
          .reduce((sum, j) => sum + (j.generated_games?.length || 0), 0) || 0,
    };

    return NextResponse.json({
      ok: true,
      stats,
      recent_jobs: jobs?.slice(0, 10) || [],
    });
  } catch (error) {
    console.error('Error getting demand generation stats:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
