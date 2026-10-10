'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';
import { computeLeadScore } from '@/lib/scoring';
import { handleEvent } from '@/server/workflow-engine';

export async function createLeadAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const data: any = {
    name: S(fd, 'name')!, phone: S(fd, 'phone'), email: S(fd, 'email'),
    source: S(fd, 'source') || 'MANUAL', city: S(fd, 'city'), country: S(fd, 'country'),
    intent: S(fd, 'intent') || 'BUY', propertyType: S(fd, 'propertyType'),
    budgetMin: S(fd, 'budgetMin') ? Number(S(fd, 'budgetMin')) : null,
    budgetMax: S(fd, 'budgetMax') ? Number(S(fd, 'budgetMax')) : null,
    consent: S(fd, 'consent') || 'UNKNOWN',
  };
  const { score } = computeLeadScore({ ...data, createdAt: new Date() });
  const lead = await prisma.lead.create({ data: { ...data, score, orgId: ctx.org.id } });
  const note = S(fd, 'notes');
  if (note) await prisma.note.create({ data: { leadId: lead.id, authorId: ctx.user.id, body: note } });
  await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'lead.created', entity: 'Lead', entityId: lead.id } });
  await handleEvent(ctx.org.id, 'LEAD_CREATED', lead);
  await recordUsage(ctx.org.id, 'leads.created');
  redirect(`/leads/${lead.id}`);
}

export async function updateLeadAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const leadId = S(fd, 'leadId')!;
  const lead = await prisma.lead.findFirst({ where: { id: leadId, orgId: ctx.org.id } });
  if (!lead) return;
  const stage = S(fd, 'stage');
  const consent = S(fd, 'consent');
  const note = S(fd, 'note');
  if (note) await prisma.note.create({ data: { leadId, authorId: ctx.user.id, body: note } });
  const patch: any = { lastActivityAt: new Date() };
  if (stage && stage !== lead.stage) patch.stage = stage;
  if (consent && consent !== lead.consent) patch.consent = consent;
  const updated = await prisma.lead.update({ where: { id: leadId }, data: patch });
  if (patch.stage) await handleEvent(ctx.org.id, 'LEAD_STAGE_CHANGED', updated);
  if (S(fd, 'archive') === '1') await prisma.lead.update({ where: { id: leadId }, data: { archivedAt: new Date() } });
  await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'lead.updated', entity: 'Lead', entityId: leadId } });
  revalidatePath(`/leads/${leadId}`);
}

