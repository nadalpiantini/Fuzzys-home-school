import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { name='default', value={} } = await req.json();
  const s = sb();
  const { error } = await s.from('brain_config')
    .upsert({ name, value, updated_at: new Date().toISOString() }, { onConflict: 'name' });
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status: 400 });
  return NextResponse.json({ ok:true });
}