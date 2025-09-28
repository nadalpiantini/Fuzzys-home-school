type Op = 'status' | 'track';
async function call(op: Op, payload?: any) {
  const r = await fetch('/api/external-games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ op, payload }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || `external-games ${r.status}`);
  return j;
}
export const ExternalGames = {
  status: () => call('status'),
  track: (kind: string, meta?: Record<string, any>) =>
    call('track', { kind, meta }),
};
