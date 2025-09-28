import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
import { brain } from '@/lib/brain-engine/core/BrainEngine';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const s = sb();
    
    // Get queued jobs (limit 2 to avoid overload)
    const { data: jobs, error } = await s
      .from('brain_jobs')
      .select('id, type, params, status')
      .eq('status', 'queued')
      .limit(2);
    
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, message: 'No queued jobs found' });
    }

    const results = [];
    
    for (const job of jobs as any[]) {
      // Mark job as running
      await s.from('brain_jobs')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', job.id);
      
      try {
        const res = await brain.execute({ 
          type: job.type, 
          parameters: job.params 
        } as any);
        
        await s.from('brain_jobs')
          .update({ 
            status: 'completed', 
            finished_at: new Date().toISOString(),
            result: res
          })
          .eq('id', job.id);
        
        results.push({ id: job.id, ok: true, res });
      } catch (e: any) {
        await s.from('brain_jobs')
          .update({ 
            status: 'failed', 
            finished_at: new Date().toISOString(), 
            error: String(e?.message || e) 
          })
          .eq('id', job.id);
        
        results.push({ id: job.id, ok: false, error: String(e?.message || e) });
      }
    }
    
    return NextResponse.json({ 
      ok: true, 
      processed: results.length, 
      results 
    });
  } catch (error) {
    console.error('Worker error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to process jobs' },
      { status: 500 }
    );
  }
}