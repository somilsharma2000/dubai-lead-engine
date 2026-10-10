// API route helpers — one consistent envelope and error contract for every route.
//
//   GET/POST  → handled inside `apiRoute(async () => { ... return ok({ data }) })`
//
// Error contract (tests and the frontend rely on these statuses):
//   401  unauthenticated (no session) — includes Next.js redirect errors caught server-side
//   403  authenticated but lacking the required permission
//   404  resource not found, or belongs to a different org
//   400  validation failure (zod / manual checks)
//   500  unexpected crash (message is logged, a generic error is returned)
import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const unauthenticated = (msg = 'UNAUTHENTICATED') => new ApiError(401, msg);
export const forbidden = (msg = 'FORBIDDEN') => new ApiError(403, msg);
export const notFound = (msg = 'not found') => new ApiError(404, msg);
export const badRequest = (msg = 'bad request') => new ApiError(400, msg);

export function apiFail(e: unknown) {
  const digest = String((e as { digest?: string })?.digest || '');
  if (digest.startsWith('NEXT_REDIRECT')) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  if (e instanceof ApiError) return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
  const msg = (e as Error)?.message || 'UNAUTHENTICATED';
  const status = msg === 'UNAUTHENTICATED' ? 401 : msg.startsWith('FORBIDDEN') ? 403 : 500;
  if (status === 500) console.error('[api]', e);
  return NextResponse.json({ ok: false, error: status === 500 ? 'internal error' : msg }, { status });
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...(data as object) }, { status });
}

export function apiRoute(handler: () => Promise<NextResponse>) {
  return handler().catch((e: unknown) => {
    // Server actions invoked from routes (requirePerm/getCtx) throw NEXT_REDIRECT when
    // there is no session — surface it as a clean 401, never a 500.
    const digest = String((e as { digest?: string })?.digest || '');
    if (digest.startsWith('NEXT_REDIRECT')) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }
    if (e instanceof ApiError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    const msg = (e as Error)?.message || 'UNAUTHENTICATED';
    const status = msg === 'UNAUTHENTICATED' ? 401 : msg.startsWith('FORBIDDEN') ? 403 : 500;
    if (status === 500) console.error('[api]', e);
    return NextResponse.json({ ok: false, error: status === 500 ? 'internal error' : msg }, { status });
  });
}
