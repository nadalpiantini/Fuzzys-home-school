import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // TODO: Implement brain_config table
    return NextResponse.json({ ok: true, message: 'Config endpoint temporarily disabled' });
  } catch (error) {
    console.error('Brain configure API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // TODO: Implement brain_config table
    return NextResponse.json({ ok: true, message: 'Config endpoint temporarily disabled' });
  } catch (error) {
    console.error('Brain configure GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch configurations' },
      { status: 500 }
    );
  }
}