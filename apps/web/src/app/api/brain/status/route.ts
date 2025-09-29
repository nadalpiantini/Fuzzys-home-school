import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  const s = sb();
  const { data: jobs } = await s
    .from('brain_jobs')
    .select('status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  const { data: counts } = await s
    .from('games')
    .select('id', { count: 'exact', head: true });
  return NextResponse.json(
    {
      status: 'ready',
      recent_jobs: jobs ?? [],
      total_games: counts?.length ?? null,
    },
    { status: 200 },
  );
}
