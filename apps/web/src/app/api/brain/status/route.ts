import { NextResponse } from 'next/server';
import { brain } from '@/lib/brain-engine/core/BrainEngine';

export async function GET() {
  try {
    const status = brain.getStatus();
    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error('Brain status API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        version: 'unknown',
        error: 'Failed to get brain status',
      },
      { status: 500 },
    );
  }
}
