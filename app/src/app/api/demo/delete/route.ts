import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { requirePerm } from '@/server/auth';
import { apiFail } from '@/server/api';

export async function POST() {
  try {
    const ctx = await requirePerm('leads.write');
    await prisma.lead.deleteMany({ where: { orgId: ctx.org.id, name: { startsWith: 'Demo —' } } });
    await prisma.property.deleteMany({ where: { orgId: ctx.org.id, title: { startsWith: 'Demo —' } } });
    return NextResponse.json({ ok: true });
  } catch (e) { return apiFail(e); }
}
