export const dynamic='force-dynamic'; export const revalidate=0; export const runtime='nodejs';
import { NextResponse } from 'next/server'; import { getSupabaseServer } from '@/lib/supabase/server';
export async function GET(){ const ts=Date.now(); try{
  const s=getSupabaseServer(false); await s.from('games').select('id').limit(1);
  return NextResponse.json({ok:true,ts});
}catch(e:any){ return NextResponse.json({ok:false,ts,err:String(e?.message??'db error').slice(0,200)});}}