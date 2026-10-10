import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { requirePerm, logAudit } from '@/server/auth';
import { apiFail } from '@/server/api';

export async function GET() {
  try {
    const ctx = await requirePerm('admin.platform');
    const orgs = await prisma.organization.findMany({
      include: { _count: { select: { memberships: true, leads: true } } },
      orderBy: { createdAt: 'desc' }
    });
    await logAudit(ctx.user.id, null, 'admin.orgs.listed', 'all');
    return NextResponse.json({ ok: true, orgs });
  } catch (e) { return apiFail(e); }
}
