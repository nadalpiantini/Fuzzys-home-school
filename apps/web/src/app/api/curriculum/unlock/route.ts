import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/curriculum/unlock
 * Unlocks next chapters based on student performance and curriculum paths
 */
export async function POST(req: Request) {
  try {
    const { studentId, curriculumId, chapterId, score } = await req.json();

    // Validate required parameters
    if (!studentId || !curriculumId || !chapterId) {
      return NextResponse.json(
        { ok: false, error: 'missing_params', message: 'studentId, curriculumId, and chapterId are required' },
        { status: 400 }
      );
    }

    // Validate score
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json(
        { ok: false, error: 'invalid_score', message: 'Score must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key for admin access
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

    // Find the current chapter node
    const { data: currentNode, error: nodeError } = await supabase
      .from('curriculum_nodes')
      .select('id, title, difficulty')
      .eq('curriculum_id', curriculumId)
      .eq('chapter_id', chapterId)
      .single();

    if (nodeError || !currentNode) {
      console.error('Node not found:', nodeError);
      return NextResponse.json(
        { ok: false, error: 'node_not_found', message: 'Current chapter not found in curriculum' },
        { status: 404 }
      );
    }

    // Get all outgoing links from this node
    const { data: links, error: linksError } = await supabase
      .from('curriculum_links')
      .select(`
        id,
        condition,
        type,
        to_node:curriculum_nodes!curriculum_links_to_node_fkey (
          id,
          chapter_id,
          curriculum_id,
          title,
          difficulty
        )
      `)
      .eq('from_node', currentNode.id);

    if (linksError) {
      console.error('Error fetching links:', linksError);
      return NextResponse.json(
        { ok: false, error: 'database_error', message: 'Failed to fetch curriculum links' },
        { status: 500 }
      );
    }

    // Evaluate each link condition to determine what to unlock
    const unlocked: any[] = [];
    const locked: any[] = [];

    for (const link of links || []) {
      let shouldUnlock = false;
      let reason = '';

      const condition = link.condition || 'always';

      // Evaluate unlock condition
      switch (true) {
        case condition === 'always':
          shouldUnlock = true;
          reason = 'automatic progression';
          break;

        case condition === 'completed':
          shouldUnlock = true;
          reason = 'chapter completed';
          break;

        case condition.startsWith('score>='):
          const requiredScore = parseInt(condition.split('>=')[1]);
          shouldUnlock = score >= requiredScore;
          reason = shouldUnlock
            ? `score ${score} meets requirement ${requiredScore}`
            : `score ${score} below requirement ${requiredScore}`;
          break;

        case condition.startsWith('score<='):
          const maxScore = parseInt(condition.split('<=')[1]);
          shouldUnlock = score <= maxScore;
          reason = shouldUnlock
            ? `score ${score} within range ${maxScore}`
            : `score ${score} above range ${maxScore}`;
          break;

        case condition.startsWith('avg<'):
          const avgThreshold = parseInt(condition.split('<')[1]);
          // Get student's average for this curriculum
          const { data: avgData } = await supabase
            .from('chapter_progress')
            .select('score')
            .eq('student_id', studentId)
            .eq('curriculum_id', curriculumId)
            .not('completed_at', 'is', null);

          const avgScore = avgData && avgData.length > 0
            ? avgData.reduce((sum, item) => sum + (item.score || 0), 0) / avgData.length
            : score;

          shouldUnlock = avgScore < avgThreshold;
          reason = shouldUnlock
            ? `avg score ${avgScore.toFixed(1)} suggests reinforcement`
            : `avg score ${avgScore.toFixed(1)} above threshold ${avgThreshold}`;
          break;

        case condition.startsWith('avg>='):
          const avgMinThreshold = parseInt(condition.split('>=')[1]);
          // Get student's average for this curriculum
          const { data: avgMinData } = await supabase
            .from('chapter_progress')
            .select('score')
            .eq('student_id', studentId)
            .eq('curriculum_id', curriculumId)
            .not('completed_at', 'is', null);

          const avgMinScore = avgMinData && avgMinData.length > 0
            ? avgMinData.reduce((sum, item) => sum + (item.score || 0), 0) / avgMinData.length
            : score;

          shouldUnlock = avgMinScore >= avgMinThreshold;
          reason = shouldUnlock
            ? `avg score ${avgMinScore.toFixed(1)} meets challenge threshold`
            : `avg score ${avgMinScore.toFixed(1)} below challenge threshold ${avgMinThreshold}`;
          break;

        default:
          console.warn('Unknown condition:', condition);
          break;
      }

      if (shouldUnlock) {
        unlocked.push({
          ...link.to_node,
          link_type: link.type,
          unlock_reason: reason,
        });
      } else {
        locked.push({
          ...link.to_node,
          link_type: link.type,
          lock_reason: reason,
        });
      }
    }

    // Save unlocked paths to database
    const unlockPromises = unlocked.map(async (node) => {
      const { error } = await supabase
        .from('student_unlocked_paths')
        .upsert(
          {
            student_id: studentId,
            curriculum_id: node.curriculum_id,
            chapter_id: node.chapter_id,
            unlocked_at: new Date().toISOString(),
            unlocked_via: chapterId,
          },
          {
            onConflict: 'student_id,curriculum_id,chapter_id',
            ignoreDuplicates: false,
          }
        );

      if (error) {
        console.error('Error saving unlock:', error);
      }

      return error;
    });

    await Promise.all(unlockPromises);

    // Update student progress table
    await supabase.from('student_progress').upsert(
      {
        student_id: studentId,
        subject_id: curriculumId,
        last_activity: new Date().toISOString(),
      },
      {
        onConflict: 'student_id,subject_id',
      }
    );

    return NextResponse.json({
      ok: true,
      unlocked: unlocked.map((n) => ({
        chapterId: n.chapter_id,
        title: n.title,
        difficulty: n.difficulty,
        type: n.link_type,
        reason: n.unlock_reason,
      })),
      locked: locked.map((n) => ({
        chapterId: n.chapter_id,
        title: n.title,
        difficulty: n.difficulty,
        type: n.link_type,
        reason: n.lock_reason,
      })),
      currentScore: score,
      currentChapter: {
        id: chapterId,
        title: currentNode.title,
        difficulty: currentNode.difficulty,
      },
    });
  } catch (error) {
    console.error('Unlock API error:', error);
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
