// Pequeño guard para API privileged ops
export function assertInternalAuth(req: Request) {
  const token = process.env.SERVER_INTERNAL_API_TOKEN;
  if (!token) throw new Error('Missing SERVER_INTERNAL_API_TOKEN');
  const incoming = req.headers.get('x-internal-token');
  if (!incoming || incoming !== token) {
    const err = new Error('Unauthorized');
    (err as any).status = 401;
    throw err;
  }
}
