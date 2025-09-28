// apps/web/src/app/api/quiz/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getUserAndClient, isAdmin } from '@/lib/auth/server-auth';
import * as Sentry from '@sentry/nextjs';

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

    // Operaciones que requieren autenticación (manejadas por RLS)
    const { supabase } = await getUserAndClient();

    if (op === 'create') {
      const { title, topic, level, questions } = payload || {};
      if (!title || !Array.isArray(questions)) {
        return NextResponse.json(
          { ok: false, error: 'Invalid quiz payload' },
          { status: 400 },
        );
      }
      // RLS permitirá insert solo si el JWT tiene role=admin (policy arriba)
      const { data, error } = await supabase
        .from('quizzes')
        .insert({ title, topic, level, questions })
        .select('id')
        .single();
      if (error) {
        // Si RLS bloquea la operación, retornar error apropiado
        if (
          error.message.includes('permission denied') ||
          error.message.includes('RLS')
        ) {
          return NextResponse.json(
            { ok: false, error: 'Forbidden - Admin role required' },
            { status: 403 },
          );
        }
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 },
        );
      }
      return NextResponse.json({ ok: true, data });
    }

    if (op === 'submitResult') {
      const { quiz_id, score, answers } = payload || {};
      if (!quiz_id || typeof score !== 'number') {
        return NextResponse.json(
          { ok: false, error: 'Invalid result payload' },
          { status: 400 },
        );
      }
      // RLS: user_id = auth.uid() - RLS manejará la asociación con el usuario autenticado
      const { data, error } = await supabase
        .from('quiz_results')
        .insert({ quiz_id, user_id: null, score, answers: answers ?? null })
        .select('id')
        .single();
      if (error) {
        // Si RLS bloquea la operación, retornar error apropiado
        if (
          error.message.includes('permission denied') ||
          error.message.includes('RLS')
        ) {
          return NextResponse.json(
            { ok: false, error: 'Unauthorized' },
            { status: 401 },
          );
        }
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 },
        );
      }
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json(
      { ok: false, error: 'Unsupported op' },
      { status: 400 },
    );
  } catch (e: any) {
    Sentry.captureException(e, {
      tags: { route: 'api/quiz' },
      extra: { op: 'unknown' },
    });
    const status = e?.status ?? 500;
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Unexpected' },
      { status },
    );
  }
}
