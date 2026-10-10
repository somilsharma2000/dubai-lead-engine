import { prisma } from './db';
import { hashPassword } from './auth';
import { computeLeadScore } from '@/lib/scoring';
import { seedDefaultWorkflows } from '@/server/workflow-engine';

// The client demo: one shared, always-ready workspace that a prospective
// client can open with one click. Data is realistic but synthetic.
export const DEMO_EMAIL = 'demo@leadengine.com';
export const DEMO_PASSWORD = 'Demo123!';
const DEMO_SLUG = 'demo-prime-realty';

export async function seedDemoData(orgId: string) {
  const LEADS = [
    { name: 'Layla Hassan', phone: '+971501234567', email: 'layla@example.com', source: 'WHATSAPP', city: 'Dubai', country: 'AE', intent: 'BUY', propertyType: 'Apartment', budgetMin: 350000, budgetMax: 450000, stage: 'QUALIFIED', consent: 'GRANTED' },
    { name: 'Vikram Singh', phone: '+971502345678', email: 'vikram@example.com', source: 'INSTAGRAM', city: 'Dubai', country: 'AE', intent: 'RENT', propertyType: 'Villa', budgetMax: 25000, stage: 'VIEWING', consent: 'GRANTED' },
    { name: 'Elena Petrova', phone: '+971503456789', email: 'elena@example.com', source: 'PORTAL', city: 'Dubai', country: 'AE', intent: 'BUY', propertyType: 'Villa', budgetMax: 1900000, stage: 'NEGOTIATION', consent: 'GRANTED' },
    { name: 'Karan Malhotra', phone: '+919812345678', email: 'karan@example.com', source: 'REFERRAL', city: 'Mumbai', country: 'IN', intent: 'BUY', propertyType: 'Apartment', budgetMax: 220000, stage: 'CONTACTED', consent: 'GRANTED' },
    { name: 'Fatima Al Zaabi', phone: '+971504567890', source: 'WEBSITE', city: 'Abu Dhabi', country: 'AE', intent: 'BUY', propertyType: 'Apartment', budgetMax: 800000, stage: 'QUALIFIED', consent: 'GRANTED' },
    { name: 'James Carter', phone: '+971505678901', source: 'WHATSAPP', city: 'Dubai', country: 'AE', intent: 'RENT', propertyType: 'Apartment', budgetMax: 9000, stage: 'NEW', consent: 'UNKNOWN' }
  ];
  const ids: Record<string, string> = {};
  for (const l of LEADS) {
    const { score } = computeLeadScore({ ...l, createdAt: new Date() });
    const lead = await prisma.lead.create({ data: { ...l, score, orgId } });
    ids[l.name] = lead.id;
  }
  const PROPS = [
    { title: 'Marina Gate 2BR — sea view', intent: 'SALE', type: 'APARTMENT', price: 420000, bedrooms: 2, bathrooms: 2, area: 'Dubai Marina', city: 'Dubai' },
    { title: 'Downtown 1BR — Burj view', intent: 'RENT', type: 'APARTMENT', price: 11000, bedrooms: 1, bathrooms: 1, area: 'Downtown', city: 'Dubai' },
    { title: 'Palm Villa 5BR — private pool', intent: 'SALE', type: 'VILLA', price: 1900000, bedrooms: 5, bathrooms: 6, area: 'Palm Jumeirah', city: 'Dubai' },
    { title: 'JVC Studio — high floor', intent: 'SALE', type: 'APARTMENT', price: 165000, bedrooms: 0, bathrooms: 1, area: 'JVC', city: 'Dubai' }
  ];
  for (const p of PROPS) await prisma.property.create({ data: { ...p, orgId } });
  await prisma.message.create({ data: { orgId, leadId: ids['Layla Hassan'], direction: 'IN', body: 'Hi! I saw your Marina listing. Is a 2BR near the metro still available?', status: 'SENT', source: 'WHATSAPP_INBOUND' } });
  await prisma.message.create({ data: { orgId, leadId: ids['Layla Hassan'], direction: 'OUT', body: 'Hi Layla, thanks for reaching out about buying. I have 2 matching options in your budget in Dubai Marina — shall I book a viewing this week?', status: 'APPROVAL_PENDING', source: 'RULE_DRAFT' } });
  await prisma.message.create({ data: { orgId, leadId: ids['Elena Petrova'], direction: 'IN', body: 'Can we see the Palm villa on Saturday morning?', status: 'SENT', source: 'WHATSAPP_INBOUND' } });
  await prisma.message.create({ data: { orgId, leadId: ids['Elena Petrova'], direction: 'OUT', body: 'Saturday 10am works. I will send the location pin once the owner confirms.', status: 'SENT', source: 'MANUAL' } });
  await prisma.note.create({ data: { leadId: ids['Elena Petrova'], authorId: 'SYSTEM', body: '[workflow] Client won stage — review + referral flow pending' } });
  await prisma.task.create({ data: { orgId, leadId: ids['Layla Hassan'], title: 'First touch: WhatsApp/call the new lead', kind: 'FOLLOWUP', dueAt: new Date(Date.now() + 20 * 3600e3) } });
  await prisma.task.create({ data: { orgId, leadId: ids['Vikram Singh'], title: 'Offer viewing slots to qualified lead', kind: 'VIEWING', dueAt: new Date(Date.now() + 44 * 3600e3) } });
  await prisma.appointment.create({ data: { orgId, leadId: ids['Elena Petrova'], startsAt: new Date(Date.now() + 3 * 86400e3), endsAt: new Date(Date.now() + 3 * 86400e3 + 3600e3), status: 'CONFIRMED', notes: 'Palm Villa viewing — Saturday 10am' } });
  for (const c of [
    { name: 'Marina reel #3 — sunset tour', channel: 'INSTAGRAM', type: 'REEL', status: 'EDITING' },
    { name: 'Palm Villa cinematic edit', channel: 'YOUTUBE', type: 'VIDEO_EDIT', status: 'PENDING_APPROVAL' },
    { name: 'Rental market report — October', channel: 'GOOGLE', type: 'ARTICLE', status: 'SCHEDULED' },
    { name: 'Diwali offer post', channel: 'INSTAGRAM', type: 'POST', status: 'IDEA' }
  ]) await prisma.campaign.create({ data: { ...c, orgId } });
  const DEFS = ['Business discovery form completed (market, territory, property types, ICP)','Brand voice + approved business facts recorded','Property inventory imported','WhatsApp channel setup + consent rules confirmed','Calendar + agent availability configured','Lead routing rules reviewed','Automation test suite passed','Content calendar approved','Client reporting cadence agreed'];
  for (let i = 0; i < DEFS.length; i++) await prisma.onboardingItem.create({ data: { orgId, label: DEFS[i], ord: i, done: i < 5 } });
}

export async function ensureDemoWorkspace() {
  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: DEMO_EMAIL, name: 'Demo Client', passwordHash: hashPassword(DEMO_PASSWORD) }
    });
  }
  let org = await prisma.organization.findUnique({ where: { slug: DEMO_SLUG } });
  if (!org) {
    org = await prisma.organization.create({ data: { name: 'Prime Realty Studio', slug: DEMO_SLUG, country: 'AE', currency: 'USD', pkg: 'LEAD_MACHINE' } });
  }
  if (!await prisma.membership.findFirst({ where: { userId: user.id, orgId: org.id } })) {
    await prisma.membership.create({ data: { userId: user.id, orgId: org.id, role: 'OWNER' } });
  }
  if (await prisma.workflow.count({ where: { orgId: org.id } }) === 0) await seedDefaultWorkflows(org.id);
  if (await prisma.lead.count({ where: { orgId: org.id } }) === 0) await seedDemoData(org.id);
  return { user, org };
}

export async function resetDemoWorkspace() {
  const org = await prisma.organization.findUnique({ where: { slug: DEMO_SLUG } });
  if (!org) return;
  await prisma.message.deleteMany({ where: { orgId: org.id } });
  await prisma.task.deleteMany({ where: { orgId: org.id } });
  await prisma.appointment.deleteMany({ where: { orgId: org.id } });
  await prisma.campaign.deleteMany({ where: { orgId: org.id } });
  await prisma.onboardingItem.deleteMany({ where: { orgId: org.id } });
  await prisma.lead.deleteMany({ where: { orgId: org.id } });
  await prisma.property.deleteMany({ where: { orgId: org.id } });
  await seedDemoData(org.id);
}
