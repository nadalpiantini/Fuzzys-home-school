// apps/web/src/app/api/quiz/route.ts
import { NextResponse } from 'next/server';
import { getServiceRoleClient, supabaseServer } from '@/lib/supabase/server';

type Op =
  | 'status'
  | 'list' // lista de quizzes (lectura pública/anon)
  | 'get' // obtiene un quiz por id (lectura)
  | 'create' // crea un quiz (privilegiado o RLS apta)
  | 'submitResult'; // guarda un resultado (privilegiado o RLS apta)

export async function POST(req: Request) {
  try {
    const { op = 'status', payload = {} } = await req.json().catch(() => ({}));

    if (op === 'status') {
      return NextResponse.json({ ok: true, service: 'quiz', ts: Date.now() });
    }

    // Lecturas comunes con cliente ANON:
    const sb = supabaseServer;

    if (op === 'list') {
      const { data, error } = await sb
        .from('quizzes')
        .select('id,title,topic,level,created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error)
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 },
        );
      return NextResponse.json({ ok: true, data });
    }

    if (op === 'get') {
      const id = payload?.id as string | undefined;
      if (!id)
        return NextResponse.json(
          { ok: false, error: 'Missing id' },
          { status: 400 },
        );
      const { data, error } = await sb
        .from('quizzes')
        .select('id,title,topic,level,questions,created_at')
        .eq('id', id)
        .single();
      if (error)
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 },
        );
      return NextResponse.json({ ok: true, data });
    }

    // Operaciones que probablemente requieran permisos elevados o RLS específica:
    const sbSrv = getServiceRoleClient();

    if (op === 'create') {
      // payload esperado: { title, topic, level, questions: JSON }
      const { title, topic, level, questions } = payload || {};
      if (!title || !Array.isArray(questions)) {
        return NextResponse.json(
          { ok: false, error: 'Invalid quiz payload' },
          { status: 400 },
        );
      }
      const { data, error } = await sbSrv
        .from('quizzes')
        .insert({
          title,
          topic,
          level,
          questions,
        })
        .select('id')
        .single();
      if (error)
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 },
        );
      return NextResponse.json({ ok: true, data });
    }

    if (op === 'submitResult') {
      // payload esperado: { quiz_id, user_id?, score, answers }
      const { quiz_id, score, answers, user_id } = payload || {};
      if (!quiz_id || typeof score !== 'number') {
        return NextResponse.json(
          { ok: false, error: 'Invalid result payload' },
          { status: 400 },
        );
      }
      const { data, error } = await sbSrv
        .from('quiz_results')
        .insert({
          quiz_id,
          user_id: user_id ?? null,
          score,
          answers: answers ?? null,
        })
        .select('id')
        .single();
      if (error)
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 },
        );
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json(
      { ok: false, error: 'Unsupported op' },
      { status: 400 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Unexpected error' },
      { status: 500 },
    );
  }
}
