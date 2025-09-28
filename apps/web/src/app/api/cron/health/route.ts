export const runtime = 'edge';

export async function GET(req: Request) {
  const isCron = req.headers.get('x-vercel-cron') === '1';
  const okToken =
    !process.env.CRON_TOKEN ||
    req.headers.get('x-cron-token') === process.env.CRON_TOKEN;
  if (!isCron || !okToken) return new Response('forbidden', { status: 403 });

  const url = process.env.HEALTH_URL!;
  const r = await fetch(url, { cache: 'no-store' }).catch((e) => ({
    ok: false,
    status: 0,
    json: async () => ({ ok: false, error: e + '' }),
  }));
  const body = await r.json().catch(() => ({ ok: false, error: 'bad-json' }));
  const healthy = r.ok && body?.ok === true;

  if (!healthy) {
    const msg = {
      // Slack (blocks) o Discord (content). Aquí Discord:
      content: `🚨 ENV HEALTH FAIL\nstatus:${r.status}\nerror:${body?.error ?? 'unknown'}\nurl:${url}`,
    };
    const hook = process.env.ALERT_WEBHOOK_URL!;
    await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    }).catch(() => null);
    return new Response('alerted', { status: 502 });
  }
  return new Response('ok', { status: 200 });
}
