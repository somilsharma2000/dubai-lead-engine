import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { verifyPassword, createSession } from '@/server/auth';

// Brute-force guard: best-effort per-instance limiter (10 attempts / 5 min / IP).
// Serverless instances rotate, so this raises the cost of credential stuffing
// rather than eliminating it; the real protection is the strong-hash password.
const hits = new Map<string, { n: number; reset: number }>();
const WINDOW = 5 * 60_000, MAX = 10;
function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) { hits.set(ip, { n: 1, reset: now + WINDOW }); return false; }
  h.n++;
  return h.n > MAX;
}

export async function POST(req: NextRequest) {
  try {
    if (limited(req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown')) {
      return NextResponse.json({ ok: false, error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
    }
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ ok: false, error: 'Wrong email or password.' }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false, error: 'Login failed.' }, { status: 400 }); }
}
