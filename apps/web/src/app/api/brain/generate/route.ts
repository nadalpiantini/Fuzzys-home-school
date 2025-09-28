import { NextRequest, NextResponse } from 'next/server';
import { brain } from '@/lib/brain-engine/core/BrainEngine';
import { BrainCommand } from '@/lib/brain-engine/core/types';

export async function POST(req: NextRequest) {
  try {
    const body: BrainCommand = await req.json();

    // Validate command type
    if (!body.type) {
      return NextResponse.json(
        { ok: false, error: 'Command type is required' },
        { status: 400 },
      );
    }

    const result = await brain.execute(body);

    return NextResponse.json(result, {
      status: result.ok ? 200 : 500,
    });
  } catch (error) {
    console.error('Brain generate API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to process brain command',
      },
      { status: 500 },
    );
  }
}
