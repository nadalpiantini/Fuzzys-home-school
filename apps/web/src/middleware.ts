import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60_000; // 60 seconds
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per IP
const RATE_LIMIT_API_WINDOW = 60_000; // 60 seconds for API
const RATE_LIMIT_API_MAX_REQUESTS = 30; // 30 requests per minute for API

// In-memory rate limiting store (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware para proteger la API
 * Implementa un bucket token simple por IP
 */
export function middleware(request: NextRequest) {
  const url = new URL(request.url);

  // Solo aplicar rate limiting a rutas API
  if (!url.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Obtener IP del cliente
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown';

  const now = Date.now();
  const key = `rate_limit:${ip}`;
  const record = rateLimitStore.get(key);

  // Configurar límites según el tipo de endpoint
  const isApiEndpoint = url.pathname.startsWith('/api/');
  const maxRequests = isApiEndpoint
    ? RATE_LIMIT_API_MAX_REQUESTS
    : RATE_LIMIT_MAX_REQUESTS;
  const windowMs = isApiEndpoint ? RATE_LIMIT_API_WINDOW : RATE_LIMIT_WINDOW;

  if (!record || now > record.resetTime) {
    // Nuevo bucket o bucket expirado
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
  } else {
    // Incrementar contador
    record.count++;

    if (record.count > maxRequests) {
      // Rate limit excedido
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      return new NextResponse(
        JSON.stringify({
          ok: false,
          error: 'Too Many Requests',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
          },
        },
      );
    }

    rateLimitStore.set(key, record);
  }

  // Agregar headers de rate limit para información del cliente
  const currentRecord = rateLimitStore.get(key);
  const remaining = Math.max(0, maxRequests - (currentRecord?.count || 0));

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set(
    'X-RateLimit-Reset',
    new Date(currentRecord?.resetTime || now + windowMs).toISOString(),
  );

  return response;
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas API
    '/api/:path*',
  ],
};
