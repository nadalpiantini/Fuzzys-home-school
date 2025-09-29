export const dynamic='force-dynamic'; export const revalidate=0; export const runtime='nodejs';
import { NextResponse } from 'next/server'; import { getSupabaseServer } from '@/lib/supabase/server';
export async function POST(req:Request){ try{
  const supabase=getSupabaseServer(true);
  const payload=await req.json();
  return NextResponse.json({ok:true});
}catch(e:any){ return NextResponse.json({ok:false,error:e?.message??'Server error'},{status:500});}}