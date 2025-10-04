import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

type ChapterProgress = { chapter_id: string; completed: boolean; score: number | null };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const studentId = url.searchParams.get('studentId');
  const curriculumId = url.searchParams.get('curriculumId'); // optional: map por mundo

  if (!studentId) {
    return NextResponse.json({ ok: false, error: 'missing_studentId' }, { status: 400 });
  }

  const supabase = getSupabaseServer(true);

  // Fetch curriculum nodes
  let nodesQuery = supabase
    .from('curriculum_nodes')
    .select('id, curriculum_id, chapter_id, title, order_index, difficulty')
    .order('order_index', { ascending: true });

  if (curriculumId) {
    nodesQuery = nodesQuery.eq('curriculum_id', curriculumId);
  }

  const { data: nodes, error: nodesError } = await nodesQuery;

  if (nodesError) {
    console.error('Error fetching curriculum nodes:', nodesError);
    return NextResponse.json({ ok: false, error: 'db_error_nodes' }, { status: 500 });
  }

  // Fetch curriculum links
  const { data: links, error: linksError } = await supabase
    .from('curriculum_links')
    .select('id, from_node, to_node, condition, type');

  if (linksError) {
    console.error('Error fetching curriculum links:', linksError);
    return NextResponse.json({ ok: false, error: 'db_error_links' }, { status: 500 });
  }

  // Fetch student progress
  const { data: progress, error: progressError } = await supabase
    .from('chapter_progress')
    .select('chapter_id, completed, score')
    .eq('student_id', studentId);

  if (progressError) {
    console.error('Error fetching chapter progress:', progressError);
    return NextResponse.json({ ok: false, error: 'db_error_progress' }, { status: 500 });
  }

  const nodesAll = nodes || [];
  const linksAll = (links || []).filter((l) => {
    const fromOk = nodesAll.find((n) => n.id === l.from_node);
    const toOk = nodesAll.find((n) => n.id === l.to_node);
    return !!(fromOk && toOk);
  });

  // Build progress map
  const progMap = new Map<string, ChapterProgress>();
  for (const p of progress || []) {
    progMap.set(p.chapter_id, p as ChapterProgress);
  }

  // Build incoming links map
  const incoming = new Map<string, typeof linksAll>();
  for (const l of linksAll) {
    const arr = incoming.get(l.to_node) || [];
    arr.push(l);
    incoming.set(l.to_node, arr);
  }

  // Helper: get score of from node
  const getScoreOfFrom = (fromNodeId: string): number | null => {
    const n = nodesAll.find((x) => x.id === fromNodeId);
    const p = n ? progMap.get(n.chapter_id) : undefined;
    return p?.score ?? null;
  };

  // Helper: evaluate condition
  const condOK = (cond: string, score: number | null): boolean => {
    if (!cond || cond === 'always') return true;
    if (cond.startsWith('score>=')) {
      const th = parseInt(cond.split('>=')[1]);
      return score != null && score >= th;
    }
    if (cond === 'completed') return score != null;
    if (cond.startsWith('avg<')) return false; // not used here
    return false;
  };

  // Convert to ReactFlow nodes
  const toReactFlowNodes = nodesAll.map((n, i) => {
    const cp = progMap.get(n.chapter_id);
    const ins = incoming.get(n.id) || [];

    // Unlocked if no prerequisites or at least one link meets condition
    const unlocked = ins.length === 0 || ins.some((l) => condOK(l.condition, getScoreOfFrom(l.from_node)));
    const completed = !!cp?.completed;

    // Color coding: green (completed), purple (unlocked), gray (locked)
    const color = completed ? '#10b981' : unlocked ? '#7c3aed' : '#9ca3af';

    return {
      id: n.id,
      data: {
        label: n.title,
        chapterId: n.chapter_id,
        completed,
        unlocked,
        difficulty: n.difficulty,
        score: cp?.score ?? null
      },
      position: { x: (n.order_index ?? i) * 200, y: i * 40 },
      style: { border: `2px solid ${color}`, borderRadius: 12, padding: 8 },
    };
  });

  // Convert to ReactFlow edges
  const toReactFlowEdges = linksAll.map((l) => ({
    id: l.id,
    source: l.from_node,
    target: l.to_node,
    label: l.type === 'alternative' ? 'ALT' : l.type === 'reinforcement' ? 'REF' : '→',
    animated: l.type === 'alternative',
    style: {
      stroke: l.type === 'reinforcement' ? '#f59e0b' : l.type === 'alternative' ? '#8b5cf6' : '#6b7280',
    },
  }));

  return NextResponse.json({ ok: true, nodes: toReactFlowNodes, edges: toReactFlowEdges });
}
