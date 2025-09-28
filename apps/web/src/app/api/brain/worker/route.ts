import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
import { brain } from '@/lib/brain-engine/core/BrainEngine';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // TODO: Implement brain_jobs table
    return NextResponse.json({ ok: true, message: 'Brain worker temporarily disabled' });
  } catch (error) {
    console.error('Brain worker error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to process brain jobs' },
      { status: 500 }
    );
  }
}