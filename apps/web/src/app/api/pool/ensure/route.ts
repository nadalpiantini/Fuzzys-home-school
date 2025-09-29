export const dynamic='force-dynamic'; export const revalidate=0; export const runtime='nodejs';
import { NextResponse } from 'next/server'; import { getSupabaseServer } from '@/lib/supabase/server';
export async function POST(){ try{
  const supabase=getSupabaseServer(true); // si no hace falta admin, usa false
  return NextResponse.json({ok:true});
}catch(e:any){ return NextResponse.json({ok:false,error:e?.message??'Server error'},{status:500});}}