import { NextResponse } from 'next/server';
import { brain } from '@/lib/brain-engine/core/BrainEngine';
import { sb } from '@/lib/brain-engine/core/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const s = sb();
    
    // Get recent jobs
    const { data: jobs } = await s
      .from('brain_jobs')
      .select('status, created_at, type')
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Get total games count
    const { data: games, error: gamesError } = await s
      .from('games')
      .select('id', { count: 'exact', head: true });
    
    // Get recent logs
    const { data: logs } = await s
      .from('brain_logs')
      .select('kind, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const baseStatus = brain.getStatus();
    
    return NextResponse.json({ 
      ...baseStatus,
      recent_jobs: jobs ?? [],
      total_games: games?.length ?? 0,
      recent_logs: logs ?? [],
      system_health: 'operational'
    });
  } catch (error) {
    console.error('Brain status API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        version: 'unknown',
        error: 'Failed to get brain status',
        system_health: 'degraded'
      },
      { status: 500 },
    );
  }
}
