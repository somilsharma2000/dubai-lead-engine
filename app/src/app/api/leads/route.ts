import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/db';
import { requirePerm } from '@/auth';
import { computeLeadScore } from '@/score';
import { handleEvent } from '@/workflow';

const leadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  source: z.enum(['MANUAL','WEBSITE','WHATSAPP','INSTAGRAM','PORTAL','REFERRAL']).default('MANUAL'),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  intent: z.enum(['BUY','RENT']).default('BUY'),
  propertyType: z.string().optional().nullable(),
  budgetMin: z.number().nonnegative().optional().nullable(),
  budgetMax: z.number().nonnegative().optional().nullable(),
  consent: z.enum(['UNKNOWN','GRANTED','DENIED']).default('UNKNOWN'),
  notes: z.string().optional().nullable()
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await requirePerm('leads.read');
    const sp = req.nextUrl.searchParams;
    const where: any = { orgId: ctx.org.id, archivedAt: null };
    if (sp.get('stage')) where.stage = sp.get('stage');
    if (sp.get('source')) where.source = sp.get('source');
    if (sp.get('q')) where.OR = [
      { name: { contains: sp.get('q') } }, { phone: { contains: sp.get('q') } }, { email: { contains: sp.get('q') } }
    ];
    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
    return NextResponse.json({ ok: true, leads });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: e.message === 'UNAUTHENTICATED' ? 401 : 403 }); }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requirePerm('leads.write');
    const parsed = leadSchema.parse(await req.json());
    const { notes, ...data } = parsed;
    const { score } = computeLeadScore({ ...data, createdAt: new Date() });
    const lead = await prisma.lead.create({ data: { ...data, score, orgId: ctx.org.id } as any });
    if (notes) await prisma.note.create({ data: { leadId: lead.id, authorId: ctx.user.id, body: notes } });
    await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'lead.created', entity: 'Lead', entityId: lead.id, meta: JSON.stringify({ source: parsed.source }) } });
    const wf = await handleEvent(ctx.org.id, 'LEAD_CREATED', lead);
    return NextResponse.json({ ok: true, lead, workflows: wf });
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ ok: false, error: 'Invalid input: ' + e.issues[0].message }, { status: 400 });
    return NextResponse.json({ ok: false, error: e.message }, { status: e.message === 'UNAUTHENTICATED' ? 401 : 403 });
  }
}
