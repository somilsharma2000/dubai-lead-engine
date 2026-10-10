import { NextResponse } from 'next/server';
import { prisma } from '@/db';

// Public health probe: safe, no sensitive data. Returns DB connectivity + counts.
export async function GET() {
  const started = Date.now();
  let db = 'ok';
  let counts: Record<string, number> = {};
  try {
    const [orgs, users, leads, tasks, messages] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.lead.count(),
      prisma.task.count(),
      prisma.message.count(),
    ]);
    counts = { orgs, users, leads, tasks, messages };
  } catch {
    db = 'error';
  }
  return NextResponse.json({
    status: db === 'ok' ? 'healthy' : 'degraded',
    db,
    counts,
    latencyMs: Date.now() - started,
    time: new Date().toISOString(),
  }, { status: db === 'ok' ? 200 : 503 });
}
