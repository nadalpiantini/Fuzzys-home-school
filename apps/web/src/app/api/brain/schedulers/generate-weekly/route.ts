import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
export const runtime = 'nodejs';

export async function GET() {
  const s = sb();
  // Encola un job semanal (5 juegos base)
  const params = { subjects: ['matemáticas','ciencias'], gradeLevel:[3,4], quantity:5, language:'es', culturalContext:'dominican', difficulty:'adaptive' };
  const { error } = await s.from('brain_jobs').insert({ type:'GENERATE', params, status:'queued' });
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });
  return NextResponse.json({ ok:true, enqueued:true });
}
