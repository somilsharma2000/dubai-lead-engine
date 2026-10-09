import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/db';
import { requirePerm } from '@/auth';
import { computeLeadScore } from '@/score';
import { handleEvent } from '@/workflow';

// Tenant isolation: lookup is ALWAYS scoped to ctx.org.id — cross-org ids return 404.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requirePerm('leads.read');
    const lead = await prisma.lead.findFirst({ where: { id: params.id, orgId: ctx.org.id }, include: { notes: true, tasks: true } });
    if (!lead) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, lead });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 403 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requirePerm('leads.write');
    const lead = await prisma.lead.findFirst({ where: { id: params.id, orgId: ctx.org.id } });
    if (!lead) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    const data = z.object({
      stage: z.string().optional(),
      consent: z.enum(['UNKNOWN','GRANTED','DENIED']).optional(),
      notes: z.string().optional()
    }).parse(await req.json());
    if (data.notes) await prisma.note.create({ data: { leadId: lead.id, authorId: ctx.user.id, body: data.notes } });
    const patch: any = {};
    if (data.stage && data.stage !== lead.stage) patch.stage = data.stage;
    if (data.consent) patch.consent = data.consent;
    if (data.consent) patch.consent = data.consent;
    let updated = lead;
    if (Object.keys(patch).length) {
      patch.lastActivityAt = new Date();
      updated = await prisma.lead.update({ where: { id: lead.id }, data: patch });
      if (patch.stage) await handleEvent(ctx.org.id, 'LEAD_STAGE_CHANGED', updated);
      await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'lead.updated', entity: 'Lead', entityId: lead.id, meta: JSON.stringify(patch) } });
    }
    return NextResponse.json({ ok: true, lead: updated });
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 });
    return NextResponse.json({ ok: false, error: e.message }, { status: 403 });
  }
}
