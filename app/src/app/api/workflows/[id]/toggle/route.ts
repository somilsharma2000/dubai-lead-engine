import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { requirePerm, logAudit } from '@/server/auth';
import { apiFail } from '@/server/api';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requirePerm('workflows.manage');
    const wf = await prisma.workflow.findFirst({ where: { id: params.id, orgId: ctx.org.id } });
    if (!wf) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    const updated = await prisma.workflow.update({ where: { id: wf.id }, data: { enabled: !wf.enabled } });
    await logAudit(ctx.user.id, ctx.org.id, 'workflow.toggled', wf.name, { enabled: updated.enabled });
    return NextResponse.json({ ok: true, enabled: updated.enabled });
  } catch (e) { return apiFail(e); }
}
