'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/db';
import { getCtx, requirePerm, destroySession, hashPassword, logAudit } from '@/auth';
import { computeLeadScore } from '@/score';
import { handleEvent } from '@/workflow';
import { createSession } from '@/auth';
import { resetDemoWorkspace } from '@/demo';

const S = (fd: FormData, k: string) => { const v = fd.get(k); return typeof v === 'string' && v.trim() ? v.trim() : null; };

export async function logoutAction() { await destroySession(); redirect('/login'); }

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

export async function completeTaskAction(fd: FormData) {
  const ctx = await requirePerm('tasks.write');
  await prisma.task.updateMany({ where: { id: S(fd, 'taskId')!, orgId: ctx.org.id }, data: { status: 'DONE', doneAt: new Date() } });
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
}

export async function createTaskAction(fd: FormData) {
  const ctx = await requirePerm('tasks.write');
  await prisma.task.create({
    data: {
      orgId: ctx.org.id, title: S(fd, 'title')!, kind: S(fd, 'kind') || 'FOLLOWUP',
      leadId: S(fd, 'leadId'),
      dueAt: new Date(S(fd, 'dueAt') || Date.now() + 86400000), assigneeId: ctx.user.id
    }
  });
  revalidatePath('/tasks');
}

export async function createPropertyAction(fd: FormData) {
  const ctx = await requirePerm('properties.write');
  await prisma.property.create({
    data: {
      orgId: ctx.org.id, title: S(fd, 'title')!, intent: S(fd, 'intent') || 'SALE',
      type: S(fd, 'type') || 'APARTMENT', price: S(fd, 'price') ? Number(S(fd, 'price')) : null,
      bedrooms: S(fd, 'bedrooms') ? Number(S(fd, 'bedrooms')) : null,
      bathrooms: S(fd, 'bathrooms') ? Number(S(fd, 'bathrooms')) : null,
      area: S(fd, 'area'), city: S(fd, 'city'), address: S(fd, 'address')
    }
  });
  revalidatePath('/properties');
}

export async function createAppointmentAction(fd: FormData) {
  const ctx = await requirePerm('calendar.write');
  const leadId = S(fd, 'leadId');
  const propertyId = S(fd, 'propertyId');
  const startsAt = new Date(S(fd, 'startsAt')!);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
  // conflict detection: same agent overlapping slot
  const conflict = await prisma.appointment.findFirst({
    where: { orgId: ctx.org.id, agentId: ctx.user.id, status: { in: ['REQUESTED', 'CONFIRMED'] }, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } }
  });
  if (conflict) { redirect('/calendar?error=conflict'); }
  await prisma.appointment.create({ data: { orgId: ctx.org.id, leadId, propertyId, agentId: ctx.user.id, startsAt, endsAt, status: 'REQUESTED', notes: S(fd, 'notes') } });
  await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'appointment.requested', entity: 'Appointment', meta: JSON.stringify({ startsAt }) } });
  revalidatePath('/calendar');
}

export async function setAppointmentStatusAction(fd: FormData) {
  const ctx = await requirePerm('calendar.write');
  await prisma.appointment.updateMany({ where: { id: S(fd, 'aptId')!, orgId: ctx.org.id }, data: { status: S(fd, 'status')! } });
  revalidatePath('/calendar');
}

export async function toggleWorkflowAction(fd: FormData) {
  const ctx = await requirePerm('workflows.manage');
  const wf = await prisma.workflow.findFirst({ where: { id: S(fd, 'wfId')!, orgId: ctx.org.id } });
  if (wf) {
    await prisma.workflow.update({ where: { id: wf.id }, data: { enabled: !wf.enabled } });
    await logAudit(ctx.user.id, ctx.org.id, 'workflow.toggled', wf.name, { enabled: !wf.enabled });
  }
  revalidatePath('/workflows');
}

export async function retryRunAction(fd: FormData) {
  const ctx = await requirePerm('workflows.manage');
  const run = await prisma.workflowRun.findFirst({ where: { id: S(fd, 'runId')!, orgId: ctx.org.id } });
  if (run) {
    const wf = await prisma.workflow.findUnique({ where: { id: run.workflowId } });
    if (wf && run.leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: run.leadId } });
      if (lead) await handleEvent(ctx.org.id, wf.trigger, lead);
    }
  }
  revalidatePath('/workflows');
}

export async function inviteMemberAction(fd: FormData) {
  const ctx = await requirePerm('team.write');
  const email = (S(fd, 'email') || '').toLowerCase();
  const name = S(fd, 'name') || email.split('@')[0];
  const role = S(fd, 'role') || 'AGENCY_MEMBER';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) user = await prisma.user.create({ data: { email, name, passwordHash: hashPassword(Math.random().toString(36) + 'ChangeMe1!') } });
  await prisma.membership.upsert({ where: { userId_orgId: { userId: user.id, orgId: ctx.org.id } }, create: { userId: user.id, orgId: ctx.org.id, role }, update: { role } });
  await logAudit(ctx.user.id, ctx.org.id, 'team.member_invited', email, { role });
  revalidatePath('/settings');
}

export async function updateOrgAction(fd: FormData) {
  const ctx = await requirePerm('settings.write');
  await prisma.organization.update({ where: { id: ctx.org.id }, data: { name: S(fd, 'name')!, country: (S(fd, 'country') || 'AE').toUpperCase(), currency: (S(fd, 'currency') || 'USD').toUpperCase() } });
  revalidatePath('/settings');
}

export async function loadDemoAction() {
  const ctx = await requirePerm('leads.write');
  const demo = [
    { name: 'Demo — Aisha Khan', phone: '+971500000001', source: 'INSTAGRAM', city: 'Dubai', country: 'AE', intent: 'BUY', propertyType: 'Apartment', budgetMax: 450000, consent: 'GRANTED', stage: 'QUALIFIED' },
    { name: 'Demo — Raj Mehta', phone: '+919800000001', source: 'WHATSAPP', city: 'Mumbai', country: 'IN', intent: 'BUY', propertyType: 'Apartment', budgetMax: 220000, consent: 'GRANTED', stage: 'CONTACTED' },
    { name: 'Demo — Sarah Smith', phone: '+447700000001', source: 'PORTAL', city: 'Dubai', country: 'AE', intent: 'RENT', propertyType: 'Villa', budgetMax: 90000, consent: 'UNKNOWN', stage: 'NEW' },
    { name: 'Demo — Omar Ali', phone: '+971500000002', source: 'REFERRAL', city: 'Abu Dhabi', country: 'AE', intent: 'BUY', propertyType: 'Villa', budgetMax: 1200000, consent: 'GRANTED', stage: 'VIEWING' },
    { name: 'Demo — Priya Nair', phone: '+919800000002', source: 'WEBSITE', city: 'Gurgaon', country: 'IN', intent: 'BUY', propertyType: 'Apartment', budgetMax: 150000, consent: 'DENIED', stage: 'NEW' }
  ];
  for (const d of demo) {
    const { score } = computeLeadScore({ ...d, createdAt: new Date() });
    const lead = await prisma.lead.create({ data: { ...d, score, orgId: ctx.org.id } });
    if (d.stage === 'QUALIFIED' || d.stage === 'VIEWING') await handleEvent(ctx.org.id, 'LEAD_STAGE_CHANGED', lead);
  }
  await prisma.property.createMany({ data: [
    { orgId: ctx.org.id, title: 'Demo — Marina 2BR, sea view', intent: 'SALE', type: 'APARTMENT', price: 420000, bedrooms: 2, bathrooms: 2, area: 'Dubai Marina', city: 'Dubai' },
    { orgId: ctx.org.id, title: 'Demo — JVC 1BR, high floor', intent: 'SALE', type: 'APARTMENT', price: 190000, bedrooms: 1, bathrooms: 1, area: 'JVC', city: 'Dubai' },
    { orgId: ctx.org.id, title: 'Demo — Gurgaon 3BH new launch', intent: 'SALE', type: 'APARTMENT', price: 160000, bedrooms: 3, bathrooms: 3, area: 'Sector 82', city: 'Gurgaon' }
  ]});
  await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'demo.loaded', entity: 'Organization', meta: JSON.stringify({ note: 'Demo data — not real leads' }) } });
  revalidatePath('/dashboard');
}

export async function clearDemoAction() {
  const ctx = await requirePerm('leads.write');
  await prisma.lead.deleteMany({ where: { orgId: ctx.org.id, name: { startsWith: 'Demo —' } } });
  await prisma.property.deleteMany({ where: { orgId: ctx.org.id, title: { startsWith: 'Demo —' } } });
  revalidatePath('/dashboard');
}

export async function createProspectAction(fd: FormData) {
  const ctx = await getCtx();
  if (!ctx?.user.isPlatformAdmin) return;
  await prisma.prospect.create({ data: {
    name: S(fd, 'name')!, company: S(fd, 'company'), city: S(fd, 'city'), country: S(fd, 'country'),
    source: S(fd, 'source') || 'MANUAL', status: 'NEW', nextAction: S(fd, 'nextAction'), notes: S(fd, 'notes')
  }});
  revalidatePath('/admin/prospects');
}

export async function updateProspectAction(fd: FormData) {
  const ctx = await getCtx();
  if (!ctx?.user.isPlatformAdmin) return;
  await prisma.prospect.update({ where: { id: S(fd, 'prospectId')! }, data: { status: S(fd, 'status')!, nextAction: S(fd, 'nextAction'), updatedAt: new Date() } });
  revalidatePath('/admin/prospects');
}

export async function saveIntegrationAction(fd: FormData) {
  const ctx = await getCtx();
  if (!ctx || !ctx.user.isPlatformAdmin) return;
  const provider = S(fd, 'provider')!;
  const config: Record<string, string> = {};
  for (const k of Array.from(fd.keys())) {
    if (k.startsWith('f_')) {
      const v = fd.get(k);
      if (typeof v === 'string' && v.trim()) config[k.slice(2)] = v.trim();
    }
  }
  await prisma.integrationConfig.upsert({
    where: { orgId_provider: { orgId: ctx.org.id, provider } },
    create: { orgId: ctx.org.id, provider, config: JSON.stringify(config), status: 'PENDING_VERIFICATION' },
    update: { config: JSON.stringify(config), status: 'PENDING_VERIFICATION' }
  });
  await logAudit(ctx.user.id, ctx.org.id, 'integration.credentials_saved', provider, { fields: Object.keys(config) });
  revalidatePath('/admin/integrations');
}

async function recordUsage(orgId: string, metric: string) {
  const day = new Date().toISOString().slice(0, 10);
  await prisma.usageEvent.upsert({
    where: { orgId_metric_day: { orgId, metric, day } },
    create: { orgId, metric, day, count: 1 },
    update: { count: { increment: 1 } }
  });
}

// === Conversations (AI center; AI key NOT connected -> rule-based drafts, honestly labelled) ===
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
  const lines = [`Hi ${lead.name.split(' ')[0]}, thanks for reaching out about ${lead.intent === 'BUY' ? 'buying' : 'renting'}.`];
  if (props.length) lines.push(`I have ${props.length} matching option${props.length > 1 ? 's' : ''} in your budget${lead.city ? ` in ${lead.city}` : ''} — shall I send details or book a viewing this week?`);
  else lines.push('Could you share your budget and preferred area? I will send you the best current options.');
  if (lead.consent === 'UNKNOWN') lines.push('(If you prefer, reply STOP and we will not message again.)');
  await prisma.message.create({
    data: { orgId: ctx.org.id, leadId, direction: 'OUT', body: lines.join(' '), status: 'APPROVAL_PENDING', source: 'RULE_DRAFT' }
  });
  await recordUsage(ctx.org.id, 'drafts.rule_based');
  revalidatePath(`/conversations/${leadId}`);
}

export async function approveMessageAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const messageId = S(fd, 'messageId')!;
  const decision = S(fd, 'decision')!; // SEND or DISCARD
  const msg = await prisma.message.findFirst({ where: { id: messageId, orgId: ctx.org.id } });
  if (!msg || msg.status !== 'APPROVAL_PENDING') return;
  const lead = await prisma.lead.findFirst({ where: { id: msg.leadId, orgId: ctx.org.id } });
  if (!lead || lead.consent === 'DENIED') return;
  if (decision === 'SEND') {
    await prisma.message.update({ where: { id: messageId }, data: { status: 'SENT' } });
    await recordUsage(ctx.org.id, 'messages.approved');
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
export async function createCampaignAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  await prisma.campaign.create({
    data: { orgId: ctx.org.id, name: S(fd, 'name')!, channel: S(fd, 'channel') || 'INSTAGRAM', type: S(fd, 'type') || 'REEL' }
  });
  revalidatePath('/campaigns');
}

export async function updateCampaignAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const campaignId = S(fd, 'campaignId')!;
  const c = await prisma.campaign.findFirst({ where: { id: campaignId, orgId: ctx.org.id } });
  if (!c) return;
  const data: any = {};
  const status = S(fd, 'status'); if (status) data.status = status;
  const sched = S(fd, 'scheduledFor'); if (sched) data.scheduledFor = new Date(sched);
  await prisma.campaign.update({ where: { id: campaignId }, data });
  if (data.status === 'POSTED') await recordUsage(ctx.org.id, 'posts.published');
  revalidatePath('/campaigns');
}

export async function deleteCampaignAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const campaignId = S(fd, 'campaignId')!;
  const c = await prisma.campaign.findFirst({ where: { id: campaignId, orgId: ctx.org.id } });
  if (c) await prisma.campaign.delete({ where: { id: campaignId } });
  revalidatePath('/campaigns');
}

// === Onboarding checklist ===
export async function toggleOnboardingAction(fd: FormData) {
  const ctx = await requirePerm('org.settings');
  const itemId = S(fd, 'itemId')!;
  const item = await prisma.onboardingItem.findFirst({ where: { id: itemId, orgId: ctx.org.id } });
  if (!item) return;
  await prisma.onboardingItem.update({ where: { id: itemId }, data: { done: !item.done } });
  revalidatePath('/settings');
}

// === Billing (demo package switch; real payments BLOCKED until Razorpay) ===
export async function switchPackageDemoAction(fd: FormData) {
  const ctx = await requirePerm('org.settings');
  const pkg = S(fd, 'pkg')!;
  if (!['LEAD_ENGINE', 'LEAD_MACHINE', 'MARKET_DOMINATION'].includes(pkg)) return;
  await prisma.organization.update({ where: { id: ctx.org.id }, data: { pkg } });
  await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'package.demo_switch', entity: 'Organization', entityId: ctx.org.id, meta: pkg } });
  revalidatePath('/billing'); revalidatePath('/settings');
}

// Reset the demo workspace back to its original state (demo org only).
export async function resetDemoAction() {
  const ctx = await requirePerm('settings.write');
  if (ctx.org.slug !== 'demo-prime-realty') throw new Error('Not the demo workspace');
  await resetDemoWorkspace();
  revalidatePath('/dashboard');
}
