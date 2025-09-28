import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
import { brain } from '@/lib/brain-engine/core/BrainEngine';
export const runtime = 'nodejs';

export async function GET() {
  const s = sb();
  const { data:jobs, error } = await s
    .from('brain_jobs')
    .select('id, type, params, status')
    .eq('status','queued')
    .limit(2);
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });

  const results = [];
  for (const job of jobs ?? []) {
    await s.from('brain_jobs').update({ status:'running', started_at: new Date().toISOString() }).eq('id', job.id);
    try {
      const res = await brain.execute({ type:'GENERATE', parameters: job.params } as any);
      await s.from('brain_jobs').update({ status:'finished', finished_at: new Date().toISOString() }).eq('id', job.id);
      results.push({ id:job.id, ok:true, res });
    } catch (e:any) {
      await s.from('brain_jobs').update({ status:'failed', finished_at: new Date().toISOString(), error:String(e?.message||e) }).eq('id', job.id);
      results.push({ id:job.id, ok:false, error:String(e?.message||e) });
    }
  }
  return NextResponse.json({ ok:true, processed: results.length, results });
}
