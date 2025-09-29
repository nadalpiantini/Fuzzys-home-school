import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { name = 'default', value = {} } = await req.json();
    const s = sb();

    const { error } = await s
      .from('brain_config')
      .upsert({ name, value, updated_at: new Date().toISOString() } as any, {
        onConflict: 'name',
      });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Config '${name}' saved successfully`,
    });
  } catch (error) {
    console.error('Brain configure API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to save configuration' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const s = sb();
    const { data: configs, error } = await s
      .from('brain_config')
      .select('*')
      .order('name');

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, configs });
  } catch (error) {
    console.error('Brain configure GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch configurations' },
      { status: 500 },
    );
  }
}
