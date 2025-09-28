import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // TODO: Implement brain_jobs table
    return NextResponse.json({ ok: true, message: 'Weekly scheduler temporarily disabled' });
  } catch (error) {
    console.error('Weekly scheduler error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to schedule weekly generation' },
      { status: 500 }
    );
  }
}
