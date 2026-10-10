import { NextResponse } from 'next/server';
import { requireCtx } from '@/auth';
import { garuAnswer } from '@/lib/garu';

export async function POST(req: Request) {
  try {
    const ctx = await requireCtx();
    const { q } = await req.json().catch(() => ({ q: '' }));
    const answer = await garuAnswer(String(q || ''), ctx.org.id, ctx.org.name);
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
}
