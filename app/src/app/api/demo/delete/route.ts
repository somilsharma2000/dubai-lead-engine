import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import { requirePerm } from '@/auth';

export async function POST() {
  try {
    const ctx = await requirePerm('leads.write');
    await prisma.lead.deleteMany({ where: { orgId: ctx.org.id, name: { startsWith: 'Demo —' } } });
    await prisma.property.deleteMany({ where: { orgId: ctx.org.id, title: { startsWith: 'Demo —' } } });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 403 }); }
}
