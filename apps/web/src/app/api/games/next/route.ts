import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer(false); // useServiceRole = false

    // Obtener 2 juegos 'ready' para mostrar instantáneamente
    const { data: games, error } = await supabase
      .from('games_pool')
      .select('*')
      .eq('status', 'ready')
      .order('last_served_at', { nullsFirst: true, ascending: true })
      .limit(2);

    if (error) {
      console.error('Error fetching games:', error);
      // Fallback: return mock games if database is not available
      const mockGames = [
        {
          id: 'mock-1',
          title: 'Sumas del Colmado',
          subject: 'math',
          grade: 'K-2',
          content: {
            type: 'quiz',
            questions: [
              {
                id: 1,
                question: 'En el colmado, María compró 3 mangos y 2 naranjas. ¿Cuántas frutas compró en total?',
                options: ['4', '5', '6', '7'],
                correct: 1,
                explanation: '3 + 2 = 5 frutas en total'
              }
            ],
            theme: 'colmado',
            difficulty: 'easy'
          },
          status: 'ready',
          source: 'seed',
          ready_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-2',
          title: 'Rally del Barrio',
          subject: 'social',
          grade: '3-4',
          content: {
            type: 'scavenger',
            missions: [
              {
                id: 1,
                title: 'Encuentra la iglesia',
                description: 'Busca el lugar donde la gente va a rezar los domingos',
                clue: 'Tiene una cruz en el techo',
                points: 10
              }
            ],
            theme: 'barrio',
            difficulty: 'medium'
          },
          status: 'ready',
          source: 'seed',
          ready_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        ok: true,
        games: mockGames,
        count: mockGames.length,
      });
    }

    if (!games || games.length === 0) {
      // Fallback: return mock games if no games in database
      const mockGames = [
        {
          id: 'mock-1',
          title: 'Sumas del Colmado',
          subject: 'math',
          grade: 'K-2',
          content: {
            type: 'quiz',
            questions: [
              {
                id: 1,
                question: 'En el colmado, María compró 3 mangos y 2 naranjas. ¿Cuántas frutas compró en total?',
                options: ['4', '5', '6', '7'],
                correct: 1,
                explanation: '3 + 2 = 5 frutas en total'
              }
            ],
            theme: 'colmado',
            difficulty: 'easy'
          },
          status: 'ready',
          source: 'seed',
          ready_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-2',
          title: 'Rally del Barrio',
          subject: 'social',
          grade: '3-4',
          content: {
            type: 'scavenger',
            missions: [
              {
                id: 1,
                title: 'Encuentra la iglesia',
                description: 'Busca el lugar donde la gente va a rezar los domingos',
                clue: 'Tiene una cruz en el techo',
                points: 10
              }
            ],
            theme: 'barrio',
            difficulty: 'medium'
          },
          status: 'ready',
          source: 'seed',
          ready_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        ok: true,
        games: mockGames,
        count: mockGames.length,
      });
    }

    // Marcar como servidos para rotación
    const gameIds = games.map((g) => g.id);
    await supabase
      .from('games_pool')
      .update({ last_served_at: new Date().toISOString() })
      .in('id', gameIds);

    return NextResponse.json({
      ok: true,
      games: games,
      count: games.length,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    // Fallback: return mock games on any error
    const mockGames = [
      {
        id: 'mock-1',
        title: 'Sumas del Colmado',
        subject: 'math',
        grade: 'K-2',
        content: {
          type: 'quiz',
          questions: [
            {
              id: 1,
              question: 'En el colmado, María compró 3 mangos y 2 naranjas. ¿Cuántas frutas compró en total?',
              options: ['4', '5', '6', '7'],
              correct: 1,
              explanation: '3 + 2 = 5 frutas en total'
            }
          ],
          theme: 'colmado',
          difficulty: 'easy'
        },
        status: 'ready',
        source: 'seed',
        ready_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-2',
        title: 'Rally del Barrio',
        subject: 'social',
        grade: '3-4',
        content: {
          type: 'scavenger',
          missions: [
            {
              id: 1,
              title: 'Encuentra la iglesia',
              description: 'Busca el lugar donde la gente va a rezar los domingos',
              clue: 'Tiene una cruz en el techo',
              points: 10
            }
          ],
          theme: 'barrio',
          difficulty: 'medium'
        },
        status: 'ready',
        source: 'seed',
        ready_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      ok: true,
      games: mockGames,
      count: mockGames.length,
    });
  }
}
