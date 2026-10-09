import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/db';
import { requirePerm } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const ctx = await requirePerm('tasks.read');
    const status = req.nextUrl.searchParams.get('status');
    const tasks = await prisma.task.findMany({
      where: { orgId: ctx.org.id, ...(status ? { status } : {}) },
      orderBy: { dueAt: 'asc' }, take: 200
    });
    return NextResponse.json({ ok: true, tasks });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 403 }); }
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
    return NextResponse.json({ ok: false, error: e.message }, { status: 403 });
  }
}
