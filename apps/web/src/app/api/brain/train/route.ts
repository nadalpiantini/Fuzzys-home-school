import { NextRequest, NextResponse } from 'next/server';
import { brain } from '@/lib/brain-engine/core/BrainEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await brain.execute({
      type: 'ANALYZE', // Use ANALYZE for training feedback analysis
      parameters: {
        ...body,
        feedbackData: body, // Store feedback for future learning
      },
    });

    return NextResponse.json(
      {
        ...result,
        message: 'Feedback received for brain training',
      },
      {
        status: result.ok ? 200 : 500,
      },
    );
  } catch (error) {
    console.error('Brain train API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to process brain training',
      },
      { status: 500 },
    );
  }
}
