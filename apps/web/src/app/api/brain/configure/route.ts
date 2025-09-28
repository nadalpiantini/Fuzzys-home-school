import { NextRequest, NextResponse } from 'next/server';
import { brain } from '@/lib/brain-engine/core/BrainEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await brain.execute({
      type: 'CONFIGURE',
      parameters: body,
    });

    return NextResponse.json(result, {
      status: result.ok ? 200 : 500,
    });
  } catch (error) {
    console.error('Brain configure API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to configure brain',
      },
      { status: 500 },
    );
  }
}
