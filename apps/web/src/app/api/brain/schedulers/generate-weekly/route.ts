import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  try {
    // TODO: Implement brain_jobs table operations after migration
    return NextResponse.json({
      ok: true,
      message: 'Weekly scheduler ready - waiting for database migration',
    });
  } catch (error) {
    console.error('Weekly scheduler error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to schedule weekly generation' },
      { status: 500 },
    );
  }
}
