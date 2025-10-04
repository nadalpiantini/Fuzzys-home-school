import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const studentId = url.searchParams.get('studentId');
  const curriculumId = url.searchParams.get('curriculumId'); // optional

  if (!studentId) {
    return NextResponse.json({ ok: false, error: 'missing_studentId' }, { status: 400 });
  }

  const supabase = getSupabaseServer(true);

  // Fetch curriculum nodes
  let nodesQuery = supabase
    .from('curriculum_nodes')
    .select('id, curriculum_id, chapter_id, title, order_index');

  if (curriculumId) {
    nodesQuery = nodesQuery.eq('curriculum_id', curriculumId);
  }

  const { data: nodes, error: nodesError } = await nodesQuery;

  if (nodesError) {
    return NextResponse.json({ ok: false, error: 'db_error_nodes' }, { status: 500 });
  }

  // Fetch curriculum links
  const { data: links, error: linksError } = await supabase
    .from('curriculum_links')
    .select('id, from_node, to_node, condition, type');

  if (linksError) {
    return NextResponse.json({ ok: false, error: 'db_error_links' }, { status: 500 });
  }

  // Fetch student progress
  const { data: cp, error: cpError } = await supabase
    .from('chapter_progress')
    .select('chapter_id, completed, score')
    .eq('student_id', studentId);

  if (cpError) {
    return NextResponse.json({ ok: false, error: 'db_error_progress' }, { status: 500 });
  }

  const N = nodes || [];
  const cpMap = new Map((cp || []).map((r) => [r.chapter_id, r]));

  const byId = new Map(N.map((n) => [n.id, n]));
  const incoming = new Map<string, typeof links>();

  for (const l of links || []) {
    if (!byId.has(l.to_node)) continue;
    const arr = incoming.get(l.to_node) || [];
    arr.push(l);
    incoming.set(l.to_node, arr);
  }

  // Helper functions
  const getScoreFrom = (from: string): number | null => {
    const ch = byId.get(from)?.chapter_id;
    return ch ? cpMap.get(ch)?.score ?? null : null;
  };

  const condOK = (c: string, sc: number | null): boolean => {
    if (!c || c === 'always') return true;
    if (c.startsWith('score>=')) return sc != null && sc >= parseInt(c.split('>=')[1]);
    if (c === 'completed') return sc != null;
    return false;
  };

  const unlocked = (id: string): boolean => {
    const ins = incoming.get(id) || [];
    if (ins.length === 0) return true;
    return ins.some((l) => condOK(l.condition, getScoreFrom(l.from_node)));
  };

  const completed = (id: string): boolean => {
    const ch = byId.get(id)?.chapter_id;
    return ch ? !!cpMap.get(ch)?.completed : false;
  };

  // Filter candidates: unlocked and not completed
  const C = N.filter((n) => unlocked(n.id) && !completed(n.id));

  // Helper: check if from node has weak score (<70)
  const isWeak = (from: string): boolean => {
    const sc = getScoreFrom(from);
    return sc != null && sc < 70;
  };

  // Priority ranking:
  // 1. Reinforcement links from weak performance (highest priority)
  // 2. Linear progression links
  // 3. Alternative exploration links
  // 4. Others
  const priority = (n: any): number => {
    const ins = incoming.get(n.id) || [];
    if (ins.some((l) => l.type === 'reinforcement' && isWeak(l.from_node))) return 1;
    if (ins.some((l) => l.type === 'linear')) return 2;
    if (ins.some((l) => l.type === 'alternative')) return 3;
    return 4;
  };

  // Sort by priority, then by order_index
  const plan = C.sort((a, b) => priority(a) - priority(b) || (a.order_index ?? 0) - (b.order_index ?? 0))
    .slice(0, 5)
    .map((n) => ({
      chapterId: n.chapter_id,
      title: n.title,
      priority: priority(n),
      reason: getPriorityReason(n, incoming, isWeak),
    }));

  return NextResponse.json({ ok: true, plan });
}

// Helper to explain why a chapter is recommended
function getPriorityReason(n: any, incoming: Map<string, any[]>, isWeak: (from: string) => boolean): string {
  const ins = incoming.get(n.id) || [];

  if (ins.some((l) => l.type === 'reinforcement' && isWeak(l.from_node))) {
    return 'Refuerzo recomendado (rendimiento <70%)';
  }
  if (ins.some((l) => l.type === 'linear')) {
    return 'Siguiente en secuencia principal';
  }
  if (ins.some((l) => l.type === 'alternative')) {
    return 'Camino alternativo (exploración)';
  }
  return 'Disponible para explorar';
}
