import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { studentId, fromChapterId, toChapterId } = await req.json();

  if (!studentId || !toChapterId) {
    return NextResponse.json({ ok: false, error: 'missing_params' }, { status: 400 });
  }

  const supabase = getSupabaseServer(true);

  // Resolve nodes by chapter_id
  const { data: nodes, error: nodesError } = await supabase
    .from('curriculum_nodes')
    .select('id, chapter_id, curriculum_id');

  if (nodesError || !nodes) {
    return NextResponse.json({ ok: false, error: 'db_error_nodes' }, { status: 500 });
  }

  const byCh = new Map(nodes.map((n) => [n.chapter_id, n]));
  const fromNode = fromChapterId ? byCh.get(fromChapterId) : null;
  const toNode = byCh.get(toChapterId);

  if (!toNode) {
    return NextResponse.json({ ok: false, error: 'node_missing' }, { status: 404 });
  }

  // Check if there's an alternative/reinforcement link
  if (!fromNode) {
    // No previous chapter, no bonus
    return NextResponse.json({ ok: true, bonus: false });
  }

  const { data: link, error: linkError } = await supabase
    .from('curriculum_links')
    .select('type')
    .eq('from_node', fromNode.id)
    .eq('to_node', toNode.id)
    .maybeSingle();

  if (linkError) {
    console.error('Error fetching curriculum link:', linkError);
    return NextResponse.json({ ok: false, error: 'db_error_link' }, { status: 500 });
  }

  // Award bonus if link type is alternative or reinforcement
  if (link?.type === 'alternative' || link?.type === 'reinforcement') {
    // Determine subject code from curriculum_id
    const subjectCode = toNode.curriculum_id.startsWith('math')
      ? 'math'
      : toNode.curriculum_id.startsWith('literacy')
        ? 'language'
        : 'science';

    // Award exploration bonus: base 30 points + 10 creativity bonus
    const awardResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/points/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        subjectCode,
        basePoints: 30,
        difficulty: 'medium',
        score: 100,
        time_spent: 0,
        creativity: 10,
      }),
    });

    const awardResult = await awardResponse.json();

    if (awardResult.ok) {
      return NextResponse.json({
        ok: true,
        bonus: true,
        type: link.type,
        points: awardResult.result?.total_awarded || 40,
        message: link.type === 'alternative'
          ? '🎉 Bonus de exploración: +40 pts'
          : '🎯 Bonus de refuerzo: +40 pts',
      });
    }
  }

  return NextResponse.json({ ok: true, bonus: false });
}
