'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';
import { cloudSend, cloudConfigured, waLink } from '@/server/whatsapp';
import { llmDraft, aiConfigured } from '@/server/ai';

export async function sendManualMessageAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const leadId = S(fd, 'leadId')!;
  const body = S(fd, 'body')!;
  const lead = await prisma.lead.findFirst({ where: { id: leadId, orgId: ctx.org.id } });
  if (!lead) return;
  if (lead.consent === 'DENIED') return; // consent guard: never message a DENIED lead
  await prisma.message.create({ data: { orgId: ctx.org.id, leadId, direction: 'OUT', body, status: 'SENT', source: 'AGENT' } });
  await recordUsage(ctx.org.id, 'messages.manual');
  revalidatePath(`/conversations/${leadId}`); revalidatePath('/conversations');
}

export async function draftReplyAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const leadId = S(fd, 'leadId')!;
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, orgId: ctx.org.id },
    include: { notes: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });
  if (!lead || lead.consent === 'DENIED' || lead.botPaused) return;
  const props = await prisma.property.findMany({
    where: { orgId: ctx.org.id, status: 'ACTIVE', price: lead.budgetMax ? { lte: lead.budgetMax * 1.05 } : undefined },
    take: 2
  });
  let body: string | null = null;
  let source = 'RULE_DRAFT';
  if (aiConfigured()) {
    const context = [
      `Lead: ${lead.name}. Intent: ${lead.intent}. Budget max: ${lead.budgetMax ?? 'unknown'}. City: ${lead.city ?? 'unknown'}. Stage: ${lead.stage}.`,
      props.length ? `Matching properties: ${props.map(p => `${p.title} in ${p.area || p.city || 'the city'} at ${p.price}`).join('; ')}.` : 'No matching properties in records.',
      'Recent note: ' + (lead.notes?.[lead.notes.length - 1]?.body || 'none')
    ].join('\n');
    body = await llmDraft(
      `You are a real estate agent's WhatsApp assistant. Write a short (2-4 sentence), warm reply to the lead. Use ONLY the facts provided. Never invent properties, prices or promises. End with a question that moves the lead toward a viewing or a budget answer. No emojis.`,
      context
    );
    if (body) source = 'AI_DRAFT';
  }
  if (!body) {
    const lines = [`Hi ${lead.name.split(' ')[0]}, thanks for reaching out about ${lead.intent === 'BUY' ? 'buying' : 'renting'}.`];
    if (props.length) lines.push(`I have ${props.length} matching option${props.length > 1 ? 's' : ''} in your budget${lead.city ? ` in ${lead.city}` : ''} — shall I send details or book a viewing this week?`);
    else lines.push('Could you share your budget and preferred area? I will send you the best current options.');
    if (lead.consent === 'UNKNOWN') lines.push('(If you prefer, reply STOP and we will not message again.)');
    body = lines.join(' ');
  }
  await prisma.message.create({
    data: { orgId: ctx.org.id, leadId, direction: 'OUT', body, status: 'APPROVAL_PENDING', source }
  });
  await recordUsage(ctx.org.id, 'drafts.rule_based');
  revalidatePath(`/conversations/${leadId}`);
}

export async function approveMessageAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const messageId = S(fd, 'messageId');
  const decision = S(fd, 'decision'); // SEND or DISCARD
  if (!messageId || !decision) return;
  const msg = await prisma.message.findFirst({ where: { id: messageId, orgId: ctx.org.id } });
  if (!msg || msg.status !== 'APPROVAL_PENDING') return;
  const lead = await prisma.lead.findFirst({ where: { id: msg.leadId, orgId: ctx.org.id } });
  if (!lead || lead.consent === 'DENIED') return;
  if (decision === 'SEND') {
    await prisma.message.update({ where: { id: messageId }, data: { status: 'SENT' } });
    await recordUsage(ctx.org.id, 'messages.approved');
    // Real auto-send via WhatsApp Cloud API when configured; otherwise the
    // click-to-chat link in the UI delivers the same message in one tap.
    if (cloudConfigured() && lead.phone) {
      const r = await cloudSend(lead.phone, msg.body);
      if (r.ok) {
        await prisma.message.update({ where: { id: messageId }, data: { source: msg.source + '+CLOUD_DELIVERED' } });
        await recordUsage(ctx.org.id, 'messages.delivered_cloud');
      }
    }
  } else {
    await prisma.message.delete({ where: { id: messageId } });
  }
  revalidatePath(`/conversations/${msg.leadId}`);
}

export async function toggleBotAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const leadId = S(fd, 'leadId')!;
  const lead = await prisma.lead.findFirst({ where: { id: leadId, orgId: ctx.org.id } });
  if (!lead) return;
  await prisma.lead.update({ where: { id: leadId }, data: { botPaused: !lead.botPaused } });
  revalidatePath(`/conversations/${leadId}`);
}

// === Campaigns (content pipeline) ===

