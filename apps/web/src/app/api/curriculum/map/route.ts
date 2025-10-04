import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/curriculum/map?curriculumId=xxx&studentId=yyy
 * Returns curriculum map data formatted for ReactFlow visualization
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const curriculumId = url.searchParams.get('curriculumId');
    const studentId = url.searchParams.get('studentId');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get all curriculum nodes
    let nodesQuery = supabase
      .from('curriculum_nodes')
      .select('id, chapter_id, curriculum_id, title, difficulty, subject, order_index')
      .order('order_index', { ascending: true });

    // Filter by curriculum if specified
    if (curriculumId) {
      nodesQuery = nodesQuery.eq('curriculum_id', curriculumId);
    }

    const { data: nodes, error: nodesError } = await nodesQuery;

    if (nodesError) {
      console.error('Error fetching nodes:', nodesError);
      return NextResponse.json(
        { ok: false, error: 'database_error', message: 'Failed to fetch curriculum nodes' },
        { status: 500 }
      );
    }

    // Get all curriculum links
    const { data: links, error: linksError } = await supabase
      .from('curriculum_links')
      .select('id, from_node, to_node, type, condition');

    if (linksError) {
      console.error('Error fetching links:', linksError);
      return NextResponse.json(
        { ok: false, error: 'database_error', message: 'Failed to fetch curriculum links' },
        { status: 500 }
      );
    }

    // Get student progress if studentId provided
    let studentProgress: any[] = [];
    let unlockedPaths: any[] = [];

    if (studentId) {
      const { data: progress } = await supabase
        .from('chapter_progress')
        .select('chapter_id, curriculum_id, completed, score')
        .eq('student_id', studentId)
        .not('completed_at', 'is', null);

      const { data: unlocked } = await supabase
        .from('student_unlocked_paths')
        .select('chapter_id, curriculum_id')
        .eq('student_id', studentId);

      studentProgress = progress || [];
      unlockedPaths = unlocked || [];
    }

    // Format nodes for ReactFlow
    const formattedNodes = (nodes || []).map((node, index) => {
      // Check if student has completed this chapter
      const progressEntry = studentProgress.find(
        (p) => p.chapter_id === node.chapter_id && p.curriculum_id === node.curriculum_id
      );

      // Check if chapter is unlocked for student
      const isUnlocked = unlockedPaths.some(
        (u) => u.chapter_id === node.chapter_id && u.curriculum_id === node.curriculum_id
      );

      // Determine node status
      let status = 'locked';
      if (progressEntry?.completed) {
        status = 'completed';
      } else if (isUnlocked || index === 0) {
        // First node is always unlocked
        status = 'unlocked';
      }

      // Calculate position (simple tree layout)
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = col * 280;
      const y = row * 120;

      return {
        id: node.id,
        type: 'custom',
        data: {
          label: node.title,
          chapterId: node.chapter_id,
          curriculumId: node.curriculum_id,
          difficulty: node.difficulty,
          subject: node.subject,
          status,
          score: progressEntry?.score,
        },
        position: { x, y },
      };
    });

    // Format edges for ReactFlow
    const formattedEdges = (links || [])
      .filter((link) => {
        // Only include links between nodes in our filtered set
        const fromExists = nodes?.some((n) => n.id === link.from_node);
        const toExists = nodes?.some((n) => n.id === link.to_node);
        return fromExists && toExists;
      })
      .map((link) => {
        // Determine edge style based on link type
        let edgeStyle: any = {};
        let animated = false;
        let label = '';

        switch (link.type) {
          case 'linear':
            edgeStyle = { stroke: '#94a3b8', strokeWidth: 2 };
            label = '';
            break;
          case 'alternative':
            edgeStyle = { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' };
            animated = true;
            label = 'Alternativo';
            break;
          case 'reinforcement':
            edgeStyle = { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '3,3' };
            label = 'Refuerzo';
            break;
        }

        return {
          id: link.id,
          source: link.from_node,
          target: link.to_node,
          type: 'smoothstep',
          animated,
          label,
          style: edgeStyle,
          labelStyle: { fontSize: 10, fontWeight: 600 },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
        };
      });

    // Calculate curriculum statistics
    const stats = {
      totalChapters: formattedNodes.length,
      completedChapters: formattedNodes.filter((n) => n.data.status === 'completed').length,
      unlockedChapters: formattedNodes.filter((n) => n.data.status === 'unlocked').length,
      lockedChapters: formattedNodes.filter((n) => n.data.status === 'locked').length,
      averageScore:
        studentProgress.length > 0
          ? Math.round(
              studentProgress.reduce((sum, p) => sum + (p.score || 0), 0) / studentProgress.length
            )
          : 0,
      pathTypes: {
        linear: (links || []).filter((l) => l.type === 'linear').length,
        alternative: (links || []).filter((l) => l.type === 'alternative').length,
        reinforcement: (links || []).filter((l) => l.type === 'reinforcement').length,
      },
    };

    return NextResponse.json({
      ok: true,
      nodes: formattedNodes,
      edges: formattedEdges,
      stats,
      curriculumId: curriculumId || 'all',
      studentId: studentId || null,
    });
  } catch (error) {
    console.error('Curriculum map API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'internal_error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
