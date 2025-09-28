import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const s = sb();
    
    // Encola un job semanal (5 juegos base)
    const params = { 
      subjects: ['matemáticas', 'ciencias'], 
      gradeLevel: [3, 4], 
      quantity: 5, 
      language: 'es', 
      culturalContext: 'dominican', 
      difficulty: 'adaptive' 
    };
    
    const { data: job, error } = await s.from('brain_jobs').insert({ 
      type: 'GENERATE', 
      params, 
      status: 'queued' 
    } as any).select('id').single();
    
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      ok: true, 
      enqueued: true, 
      job_id: job?.id,
      message: 'Weekly generation job enqueued successfully'
    });
  } catch (error) {
    console.error('Weekly scheduler error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to enqueue weekly job' },
      { status: 500 }
    );
  }
}