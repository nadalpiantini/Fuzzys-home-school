// apps/web/src/app/api/adaptive/route.ts
import { NextResponse } from 'next/server';
import { getServiceRoleClient, supabaseServer } from '@/lib/supabase/server';
import { assertInternalAuth } from '@/lib/auth/api-guard';

// Opcional: pequeño guard para permitir solo POST
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { op = 'status', payload = {} } = body || {};

    // Cliente ANON para lecturas simples si hace falta
    const sb = supabaseServer;

    // Cliente con service_role SOLO aquí dentro (privilegiado)
    const sbSrv = getServiceRoleClient();

    // 👉 Ejemplo de "operaciones" típicas:
    // - "status": ping de salud (no toca DB privilegiada)
    // - "log": inserta un registro interno (requiere service_role o RLS adecuada)
    if (op === 'status') {
      return NextResponse.json({
        ok: true,
        service: 'adaptive',
        ts: Date.now(),
      });
    }

    if (op === 'log') {
      assertInternalAuth(req); // 🔒 requerido
      const sbSrv = getServiceRoleClient();
      const { data, error } = await sbSrv
        .from('adaptive_logs')
        .insert({
          event: payload?.event ?? 'unknown',
          meta: payload?.meta ?? {},
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 },
        );
      }
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json(
      { ok: false, error: 'Unsupported op' },
      { status: 400 },
    );
  } catch (e: any) {
    const status = e?.status ?? 500;
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Unexpected' },
      { status },
    );
  }
}
