// Seeds a demo workspace: Somil's founder account + realistic demo data.
// Idempotent: safe to run repeatedly. Demo records carry "Demo —" prefix.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const EMAIL = 'somil@leadengine.com';
const PASSWORD = 'Password123!';

let user = await prisma.user.findUnique({ where: { email: EMAIL } });
if (!user) {
  user = await prisma.user.create({
    data: { email: EMAIL, name: 'Somil Sharma', passwordHash: bcrypt.hashSync(PASSWORD, 10), isPlatformAdmin: true }
  });
}
let org = await prisma.organization.findUnique({ where: { slug: 'lead-engine-hq' } });
if (!org) {
  org = await prisma.organization.create({ data: { name: 'Lead Engine HQ', slug: 'lead-engine-hq', country: 'IN', currency: 'USD' } });
}
if (!await prisma.membership.findFirst({ where: { userId: user.id, orgId: org.id } })) {
  await prisma.membership.create({ data: { userId: user.id, orgId: org.id, role: 'OWNER' } });
}
if (await prisma.onboardingItem.count({ where: { orgId: org.id } }) === 0) {
  const DEFS = ['Business discovery form completed (market, territory, property types, ICP)','Brand voice + approved business facts recorded','Property inventory imported','WhatsApp channel setup + consent rules confirmed','Calendar + agent availability configured','Lead routing rules reviewed','Automation test suite passed','Content calendar approved','Client reporting cadence agreed'];
  for (let i = 0; i < DEFS.length; i++) await prisma.onboardingItem.create({ data: { orgId: org.id, label: DEFS[i], ord: i } });
}
if (await prisma.workflow.count({ where: { orgId: org.id } }) === 0) {
  const WFS = [
    { name: 'New lead → 24h first-touch task', trigger: 'LEAD_CREATED', config: { conditions: {}, actions: [ { type: 'CREATE_TASK', title: 'First touch: WhatsApp/call the new lead', kind: 'FOLLOWUP', dueInHours: 24 }, { type: 'LOG' } ] } },
    { name: 'Lead qualified → schedule viewing', trigger: 'LEAD_STAGE_CHANGED', config: { conditions: { stage: 'QUALIFIED' }, actions: [ { type: 'CREATE_TASK', title: 'Offer viewing slots to qualified lead', kind: 'VIEWING', dueInHours: 48 }, { type: 'LOG' } ] } },
    { name: 'Lead won → reviews & referral', trigger: 'LEAD_STAGE_CHANGED', config: { conditions: { stage: 'WON' }, actions: [ { type: 'CREATE_TASK', title: 'Request Google review from won client', kind: 'FOLLOWUP', dueInHours: 72 }, { type: 'ADD_NOTE', body: 'Client won — start review + referral flow.' } ] } }
  ];
  for (const w of WFS) await prisma.workflow.create({ data: { orgId: org.id, name: w.name, trigger: w.trigger, config: JSON.stringify(w.config) } });
}
if (await prisma.lead.count({ where: { orgId: org.id, name: { startsWith: 'Demo —' } } }) === 0) {
  const LEADS = [
    { name: 'Demo — Rajesh Mehta', phone: '+971501112233', email: 'rajesh@example.com', source: 'WHATSAPP', city: 'Dubai', country: 'AE', intent: 'BUY', propertyType: 'Apartment', budgetMin: 350000, budgetMax: 450000, stage: 'QUALIFIED', score: 82, consent: 'GRANTED' },
    { name: 'Demo — Priya Nair', phone: '+971504445566', email: 'priya@example.com', source: 'INSTAGRAM', city: 'Dubai', country: 'AE', intent: 'RENT', propertyType: 'Villa', budgetMax: 18000, stage: 'CONTACTED', score: 58, consent: 'GRANTED' },
    { name: 'Demo — Ahmed Al Farsi', phone: '+971507778899', source: 'PORTAL', city: 'Abu Dhabi', country: 'AE', intent: 'BUY', propertyType: 'Villa', budgetMax: 1200000, stage: 'NEGOTIATION', score: 91, consent: 'GRANTED' },
    { name: 'Demo — Kavya Reddy', phone: '+919888777666', email: 'kavya@example.com', source: 'WEBSITE', city: 'Hyderabad', country: 'IN', intent: 'BUY', propertyType: 'Plot', budgetMax: 900000, stage: 'NEW', score: 47, consent: 'UNKNOWN' },
    { name: 'Demo — Tom Becker', phone: '+4915112345678', source: 'REFERRAL', city: 'Dubai', country: 'AE', intent: 'RENT', propertyType: 'Apartment', budgetMax: 12000, stage: 'VIEWING', score: 73, consent: 'GRANTED' }
  ];
  const created = [];
  for (const l of LEADS) created.push(await prisma.lead.create({ data: { ...l, orgId: org.id } }));
  const rajesh = created[0], tom = created[4];
  await prisma.message.create({ data: { orgId: org.id, leadId: rajesh.id, direction: 'IN', body: 'Hi, I saw your Marina listing. Is 2BR available near the metro?', status: 'SENT', source: 'WHATSAPP_INBOUND' } });
  await prisma.message.create({ data: { orgId: org.id, leadId: rajesh.id, direction: 'OUT', body: 'Hi Rajesh, thanks for reaching out about buying. I have 2 matching options in your budget in Dubai — shall I send details or book a viewing this week?', status: 'APPROVAL_PENDING', source: 'RULE_DRAFT' } });
  await prisma.message.create({ data: { orgId: org.id, leadId: tom.id, direction: 'IN', body: 'Saturday 11am viewing works for me.', status: 'SENT', source: 'WHATSAPP_INBOUND' } });
  await prisma.note.create({ data: { leadId: rajesh.id, authorId: 'SYSTEM', body: '[workflow] Offer viewing slots to qualified lead' } });
  await prisma.task.create({ data: { orgId: org.id, leadId: rajesh.id, title: 'First touch: WhatsApp/call the new lead', kind: 'FOLLOWUP', dueAt: new Date(Date.now() + 20 * 3600e3) } });
  await prisma.task.create({ data: { orgId: org.id, leadId: rajesh.id, title: 'Offer viewing slots to qualified lead', kind: 'VIEWING', dueAt: new Date(Date.now() + 40 * 3600e3) } });
  await prisma.appointment.create({ data: { orgId: org.id, leadId: tom.id, startsAt: new Date(Date.now() + 3 * 86400e3), status: 'CONFIRMED', notes: 'Marina 1BR viewing' } });
}
if (await prisma.property.count({ where: { orgId: org.id } }) === 0) {
  const PROPS = [
    { title: 'Marina Gate 2BR — sea view', intent: 'SALE', type: 'APARTMENT', price: 420000, bedrooms: 2, city: 'Dubai', area: 'Dubai Marina' },
    { title: 'Downtown 1BR — Burj view', intent: 'RENT', type: 'APARTMENT', price: 11000, bedrooms: 1, city: 'Dubai', area: 'Downtown' },
    { title: 'Palm Villa 5BR — private pool', intent: 'SALE', type: 'VILLA', price: 1100000, bedrooms: 5, city: 'Dubai', area: 'Palm Jumeirah' }
  ];
  for (const p of PROPS) await prisma.property.create({ data: { ...p, orgId: org.id } });
}
if (await prisma.campaign.count({ where: { orgId: org.id } }) === 0) {
  const CAMPS = [
    { name: 'Marina reel #3 — sunset tour', channel: 'INSTAGRAM', type: 'REEL', status: 'EDITING' },
    { name: 'Palm Villa cinematic edit', channel: 'YOUTUBE', type: 'VIDEO_EDIT', status: 'SCRIPTED' },
    { name: 'Rental market report — October', channel: 'GOOGLE', type: 'ARTICLE', status: 'PENDING_APPROVAL' },
    { name: 'Diwali offer post', channel: 'INSTAGRAM', type: 'POST', status: 'IDEA' }
  ];
  for (const c of CAMPS) await prisma.campaign.create({ data: { ...c, orgId: org.id } });
}
const prospectCount = await prisma.prospect.count();
if (prospectCount === 0) {
  const P = [
    { name: 'Demo — Emaar agent (Marina)', company: 'Emaar', city: 'Dubai', country: 'AE', status: 'CONTACTED', nextAction: 'Follow up with sample reel' },
    { name: 'Demo — Independent broker (Hyderabad)', company: 'Indie', city: 'Hyderabad', country: 'IN', status: 'NEW', nextAction: 'Send 48h sample offer' }
  ];
  for (const p of P) await prisma.prospect.create({ data: p });
}
console.log('Seed complete. Login: somil@leadengine.com / Password123!  (dev-only credentials)');
await prisma.$disconnect();
