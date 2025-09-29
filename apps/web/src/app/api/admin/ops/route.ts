import { NextResponse } from 'next/server';
import { aggregateOps } from '@/lib/ops';
import { getUserAndClient, isAdmin } from '@/lib/auth/server-auth';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { user } = await getUserAndClient();
    if (!user || !(await isAdmin(user))) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden' },
        { status: 403 },
      );
    }
    const data = await aggregateOps();
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'error' },
      { status: 500 },
    );
  }
}
