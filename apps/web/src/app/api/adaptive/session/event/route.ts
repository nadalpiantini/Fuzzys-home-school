import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { 
      sessionId, 
      eventType, 
      correct = null, 
      responseMs = null, 
      payload = {} 
    } = await req.json()

    if (!sessionId || !eventType) {
      return NextResponse.json(
        { ok: false, error: 'missing_params' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Insert event
    const { data: event, error: insertError } = await supabase
      .from('adaptive_events')
      .insert({
        session_id: sessionId,
        event_type: eventType,
        correct,
        response_ms: responseMs,
        payload
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { ok: false, error: insertError.message },
        { status: 500 }
      )
    }

    // Auto-update metrics and difficulty
    const { data: state, error: updateError } = await supabase
      .rpc('adaptive_update_metrics', { p_session: sessionId })

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      event,
      state: state?.[0] || null
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
