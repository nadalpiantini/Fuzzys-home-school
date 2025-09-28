// apps/web/src/services/adaptive/AdaptiveService.ts
// Cliente "delgadito": NO toca process.env privadas ni service_role.
// Solo llama a la API interna (server-only).

type AdaptiveOp = 'status' | 'log';

async function call(op: AdaptiveOp, payload?: any) {
  const res = await fetch('/api/adaptive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Importante: no mandes secretos aquí.
    body: JSON.stringify({ op, payload }),
    // Si necesitas cookies/sesión del usuario:
    credentials: 'include',
  });
  if (!res.ok) {
    const t = await res.json().catch(() => ({}));
    throw new Error(t?.error || `Adaptive API error (${res.status})`);
  }
  return res.json();
}

export const AdaptiveService = {
  async status() {
    return call('status');
  },
  async log(event: string, meta?: Record<string, any>) {
    return call('log', { event, meta });
  },

  // ====== MÉTODOS ESPECÍFICOS PARA COMPONENTES ======
  // getProgressAnalytics(userId, timeframe) -> (shim) retorna datos mock por ahora
  async getProgressAnalytics(userId: string, timeframe: string) {
    // TODO: Implementar lógica real de analytics
    return {
      overallProgress: 75,
      subjectBreakdown: [
        { subject: 'Math', progress: 80, trend: 'up' },
        { subject: 'Science', progress: 70, trend: 'stable' },
        { subject: 'History', progress: 85, trend: 'up' },
      ],
      recentActivity: [
        { date: '2024-01-15', activity: 'Quiz completed', score: 85 },
        { date: '2024-01-14', activity: 'Lesson finished', score: 90 },
      ],
      recommendations: [
        {
          type: 'focus',
          subject: 'Science',
          reason: 'Below average performance',
        },
        { type: 'continue', subject: 'Math', reason: 'Excellent progress' },
      ],
    };
  },
};
