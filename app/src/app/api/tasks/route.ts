import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requirePerm } from '@/server/auth';
import { apiFail } from '@/server/api';

export async function GET(req: NextRequest) {
  try {
    const ctx = await requirePerm('tasks.read');
    const status = req.nextUrl.searchParams.get('status');
    const tasks = await prisma.task.findMany({
      where: { orgId: ctx.org.id, ...(status ? { status } : {}) },
      orderBy: { dueAt: 'asc' }, take: 200
    });
    return NextResponse.json({ ok: true, tasks });
  } catch (e) { return apiFail(e); }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requirePerm('tasks.write');
    const data = z.object({
      title: z.string().min(2), kind: z.string().default('FOLLOWUP'),
      leadId: z.string().optional().nullable(),
      dueAt: z.coerce.date()
    }).parse(await req.json());
    const task = await prisma.task.create({ data: { ...data, orgId: ctx.org.id, assigneeId: ctx.user.id } as any });
    return NextResponse.json({ ok: true, task });
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ ok: false, error: 'Invalid input: ' + e.issues[0].message }, { status: 400 });
    return apiFail(e);
  }
}
