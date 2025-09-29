export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    has: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
}
