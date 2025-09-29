import { NextResponse } from 'next/server';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json({ ok: true, items: [] });
}
