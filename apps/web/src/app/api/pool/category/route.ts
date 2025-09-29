import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// GET: Obtener juegos por categoría de usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer(false); // useServiceRole = false

    const url = new URL(request.url);
    const userCategory = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '2', 10);
    const userId = url.searchParams.get('user_id');

    if (!userCategory) {
      return NextResponse.json(
        { ok: false, error: 'Category parameter is required' },
        { status: 400 },
      );
    }

    // Validar categoría
    const validCategories = ['K-2', '3-4', '5-6', '7-8', '9-12'];
    if (!validCategories.includes(userCategory)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Invalid category. Must be one of: ' + validCategories.join(', '),
        },
        { status: 400 },
      );
    }

    // Obtener juegos para la categoría usando la función SQL
    const { data: games, error } = await supabase.rpc(
      'get_games_for_user_category',
      {
        p_user_category: userCategory,
        p_limit: limit,
      },
    );

    if (error) {
      console.error('Error fetching games for category:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    if (!games || games.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No games available for this category' },
        { status: 404 },
      );
    }

    // Marcar como servidos para rotación
    const gameIds = games.map((g: any) => g.id);
    await supabase
      .from('games_pool')
      .update({ last_served_at: new Date().toISOString() })
      .in('id', gameIds);

    // Si hay un usuario, registrar preferencias
    if (userId) {
      try {
        // Obtener o crear preferencias del usuario
        const { data: existingPrefs } = await supabase
          .from('user_game_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!existingPrefs) {
          // Crear preferencias por defecto
          await supabase.from('user_game_preferences').insert({
            user_id: userId,
            user_category: userCategory,
            preferred_subjects: [
              'math',
              'language',
              'science',
              'social',
              'geo',
            ],
            preferred_grades: [userCategory],
          });
        }
      } catch (prefError) {
        console.error('Error updating user preferences:', prefError);
        // No fallar si no se pueden actualizar las preferencias
      }
    }

    return NextResponse.json({
      ok: true,
      games,
      count: games.length,
      category: userCategory,
      message: `Found ${games.length} games for category ${userCategory}`,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST: Obtener juegos personalizados por preferencias de usuario
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer(false); // useServiceRole = false

    const body = await request.json();
    const { user_id, preferred_subjects, preferred_grades, limit = 2 } = body;

    if (!user_id) {
      return NextResponse.json(
        { ok: false, error: 'user_id is required' },
        { status: 400 },
      );
    }

    // Obtener preferencias del usuario
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_game_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (prefsError && prefsError.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', prefsError);
      return NextResponse.json(
        { ok: false, error: prefsError.message },
        { status: 500 },
      );
    }

    // Si no hay preferencias, crear unas por defecto
    if (!userPrefs) {
      const defaultCategory = '5-6'; // Categoría por defecto
      const { data: newPrefs, error: createError } = await supabase
        .from('user_game_preferences')
        .insert({
          user_id,
          user_category: defaultCategory,
          preferred_subjects: preferred_subjects || [
            'math',
            'language',
            'science',
          ],
          preferred_grades: preferred_grades || [defaultCategory],
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user preferences:', createError);
        return NextResponse.json(
          { ok: false, error: createError.message },
          { status: 500 },
        );
      }

      // Usar las nuevas preferencias
      const { data: games, error } = await supabase
        .from('games_pool')
        .select('*')
        .eq('status', 'ready')
        .in('grade', newPrefs.preferred_grades)
        .in('subject', newPrefs.preferred_subjects)
        .order('last_served_at', { nullsFirst: true, ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching personalized games:', error);
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        ok: true,
        games: games || [],
        count: games?.length || 0,
        preferences: newPrefs,
        message: 'Created new preferences and fetched games',
      });
    }

    // Usar preferencias existentes
    const { data: games, error } = await supabase
      .from('games_pool')
      .select('*')
      .eq('status', 'ready')
      .in('grade', userPrefs.preferred_grades)
      .in('subject', userPrefs.preferred_subjects)
      .order('last_served_at', { nullsFirst: true, ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching personalized games:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    // Marcar como servidos
    if (games && games.length > 0) {
      const gameIds = games.map((g) => g.id);
      await supabase
        .from('games_pool')
        .update({ last_served_at: new Date().toISOString() })
        .in('id', gameIds);
    }

    return NextResponse.json({
      ok: true,
      games: games || [],
      count: games?.length || 0,
      preferences: userPrefs,
      message: 'Fetched personalized games',
    });
  } catch (error) {
    console.error('Unexpected error in personalized games:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
