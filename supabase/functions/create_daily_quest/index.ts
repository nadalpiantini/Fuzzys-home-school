import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().slice(0, 10);
    
    // Verificar si ya existe un reto para hoy
    const { data: existingQuest, error: checkError } = await supabase
      .from('quests')
      .select('id')
      .eq('available_on', today)
      .eq('is_active', true)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing quest:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing quest' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingQuest) {
      return new Response(
        JSON.stringify({ message: 'Quest already exists for today', quest_id: existingQuest.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generar reto del día
    const questTemplates = [
      {
        title: "Sistema Solar - Arrastra los Planetas",
        description: "Ordena los planetas según su distancia al sol",
        type: "drag_drop",
        difficulty: "easy",
        payload: {
          type: "drag_drop",
          instruction: "Arrastra cada planeta a su órbita correcta según la distancia al sol",
          items: [
            { id: "mercurio", name: "Mercurio", emoji: "☿️", correct_position: 1 },
            { id: "venus", name: "Venus", emoji: "♀️", correct_position: 2 },
            { id: "tierra", name: "Tierra", emoji: "🌍", correct_position: 3 },
            { id: "marte", name: "Marte", emoji: "♂️", correct_position: 4 },
            { id: "jupiter", name: "Júpiter", emoji: "♃", correct_position: 5 },
            { id: "saturno", name: "Saturno", emoji: "♄", correct_position: 6 }
          ],
          drop_zones: [
            { id: "orbit-1", label: "Órbita 1 (más cerca del sol)" },
            { id: "orbit-2", label: "Órbita 2" },
            { id: "orbit-3", label: "Órbita 3" },
            { id: "orbit-4", label: "Órbita 4" },
            { id: "orbit-5", label: "Órbita 5" },
            { id: "orbit-6", label: "Órbita 6 (más lejos del sol)" }
          ]
        },
        points: 100,
        time_limit: 300
      },
      {
        title: "Animales y sus Hábitats",
        description: "Conecta cada animal con su hábitat natural",
        type: "drag_drop",
        difficulty: "medium",
        payload: {
          type: "drag_drop",
          instruction: "Arrastra cada animal a su hábitat correcto",
          items: [
            { id: "leon", name: "León", emoji: "🦁", correct_habitat: "sabana" },
            { id: "pinguino", name: "Pingüino", emoji: "🐧", correct_habitat: "polo" },
            { id: "pez", name: "Pez", emoji: "🐠", correct_habitat: "oceano" },
            { id: "oso", name: "Oso", emoji: "🐻", correct_habitat: "bosque" }
          ],
          drop_zones: [
            { id: "sabana", label: "Sabana Africana", emoji: "🌍" },
            { id: "polo", label: "Polo Norte", emoji: "🧊" },
            { id: "oceano", label: "Océano", emoji: "🌊" },
            { id: "bosque", label: "Bosque", emoji: "🌲" }
          ]
        },
        points: 120,
        time_limit: 240
      },
      {
        title: "Matemáticas Básicas",
        description: "Resuelve estas operaciones matemáticas",
        type: "quiz",
        difficulty: "easy",
        payload: {
          type: "quiz",
          instruction: "Selecciona la respuesta correcta para cada operación",
          questions: [
            {
              id: "q1",
              question: "¿Cuánto es 5 + 3?",
              options: ["6", "7", "8", "9"],
              correct: 2
            },
            {
              id: "q2", 
              question: "¿Cuánto es 12 - 4?",
              options: ["6", "7", "8", "9"],
              correct: 2
            },
            {
              id: "q3",
              question: "¿Cuánto es 3 × 4?",
              options: ["10", "11", "12", "13"],
              correct: 2
            }
          ]
        },
        points: 80,
        time_limit: 180
      }
    ];

    // Seleccionar template aleatorio
    const randomTemplate = questTemplates[Math.floor(Math.random() * questTemplates.length)];
    
    // Crear el reto
    const { data: newQuest, error: insertError } = await supabase
      .from('quests')
      .insert({
        title: randomTemplate.title,
        description: randomTemplate.description,
        prompt: randomTemplate.payload.instruction,
        payload: randomTemplate.payload,
        type: randomTemplate.type,
        difficulty: randomTemplate.difficulty,
        points: randomTemplate.points,
        time_limit: randomTemplate.time_limit,
        available_on: today,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating quest:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create quest' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear mensajes de notificación para usuarios activos
    const { data: activeUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .not('id', 'is', null);

    if (!usersError && activeUsers && activeUsers.length > 0) {
      const messages = activeUsers.map(user => ({
        user_id: user.id,
        kind: 'quest',
        title: '¡Nuevo Reto Diario!',
        body: `${randomTemplate.title} - ${randomTemplate.description}`,
        cta_url: `/quest/${newQuest.id}`,
        cta_text: 'Jugar Ahora',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expira en 24 horas
      }));

      await supabase
        .from('messages')
        .insert(messages);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        quest: newQuest,
        message: 'Daily quest created successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
