import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Implement game_metrics table
    return NextResponse.json({ ok: true, message: 'Game metrics temporarily disabled' });
  } catch (error) {
    console.error('Game metrics error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update game metrics' },
      { status: 500 }
    );
  }
}
