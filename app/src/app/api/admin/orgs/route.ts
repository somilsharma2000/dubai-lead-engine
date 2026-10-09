import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import { requirePerm, logAudit } from '@/auth';

export async function GET() {
  try {
    const ctx = await requirePerm('admin.platform');
    const orgs = await prisma.organization.findMany({
      include: { _count: { select: { memberships: true, leads: true } } },
      orderBy: { createdAt: 'desc' }
    });
    await logAudit(ctx.user.id, null, 'admin.orgs.listed', 'all');
    return NextResponse.json({ ok: true, orgs });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 403 }); }
}
