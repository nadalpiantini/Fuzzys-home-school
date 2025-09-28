import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
import { brain } from '@/lib/brain-engine/core/BrainEngine';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // TODO: Implement brain_jobs table operations after migration
    return NextResponse.json({
      ok: true,
      message: 'Brain worker ready - waiting for database migration',
    });
  } catch (error) {
    console.error('Worker error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to process jobs' },
      { status: 500 },
    );
  }
}
