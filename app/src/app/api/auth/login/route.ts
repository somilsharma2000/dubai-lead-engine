import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/db';
import { verifyPassword, createSession } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ ok: false, error: 'Wrong email or password.' }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false, error: 'Login failed.' }, { status: 400 }); }
}
