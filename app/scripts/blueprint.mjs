// Blueprint feature tests: follow-up sequence, visit reminders, reactivation, Playbook page.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const BASE = 'http://localhost:3000';
let pass = 0, fail = 0;
const t = (n, ok, x='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${x?' — '+x:''}`); ok ? pass++ : fail++; };

const user = await prisma.user.findUnique({ where: { email: 'somil@leadengine.com' } });
const m = await prisma.membership.findFirst({ where: { userId: user.id } });
const orgId = m.orgId;
const token = 'bp' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
await prisma.session.create({ data: { token, userId: user.id, expiresAt: new Date(Date.now() + 3600000) } });
const H = { cookie: `sid=${token}`, 'content-type': 'application/json' };

// visiting /workflows tops up missing defaults for older orgs
const wfp = await fetch(BASE + '/workflows', { headers: H });
t('Workflows page loads', wfp.status === 200, 'status ' + wfp.status);
const existing = await prisma.workflow.findMany({ where: { orgId } });
const names = existing.map(w => w.name);
console.log('org workflows:', names.length);
const need = ['Day 1 follow-up', 'Day 3 follow-up', 'Day 7 follow-up', 'Visit booked', 'reactivation'];
const missing = need.filter(n => !names.some(x => x.includes(n)));
t('org has blueprint workflows seeded', missing.length === 0, missing.length ? 'missing: ' + missing.join(', ') : '');

// ── live behaviour: create lead -> Day1/3/7 tasks; move to VIEWING -> 3 reminder tasks
const r = await fetch(BASE + '/api/leads', { method: 'POST', headers: H, body: JSON.stringify({ name: 'BP Test Lead', phone: '+971500000777', source: 'WEBSITE', intent: 'BUY', budgetMax: 600000, consent: 'GRANTED' }) });
const created = await r.json().catch(() => ({}));
const leadId = created.id || created.lead?.id;
t('API creates lead', !!leadId, 'status ' + r.status);
await new Promise(r => setTimeout(r, 1500));
let tasks = await prisma.task.findMany({ where: { leadId } });
t('new lead -> first-touch + Day 1/3/7 follow-up tasks (4)', tasks.filter(x => /First touch|Day 1|Day 3|Day 7/.test(x.title)).length === 4, tasks.map(x => x.title.slice(0, 12)).join(' | '));
const r2 = await fetch(BASE + '/api/leads/' + leadId, { method: 'PATCH', headers: H, body: JSON.stringify({ stage: 'VIEWING' }) });
t('stage change to VIEWING accepted', r2.status === 200, 'status ' + r2.status);
await new Promise(r => setTimeout(r, 1500));
tasks = await prisma.task.findMany({ where: { leadId } });
t('VIEWING -> confirmation + 24h + 2h reminder tasks (3)', tasks.filter(x => /visit confirmation|24h reminder|2h reminder/i.test(x.title)).length === 3, 'tasks total ' + tasks.length);
const r3 = await fetch(BASE + '/api/leads/' + leadId, { method: 'PATCH', headers: H, body: JSON.stringify({ stage: 'LOST' }) });
await new Promise(r => setTimeout(r, 1500));
tasks = await prisma.task.findMany({ where: { leadId } });
t('LOST -> 30-day reactivation task', tasks.some(x => /Reactivation/.test(x.title)));
// cleanup so the demo workspace stays pristine
await prisma.task.deleteMany({ where: { leadId } });
await prisma.workflowRun.deleteMany({ where: { orgId, meta: { contains: leadId } } }).catch(() => {});
await prisma.activity.deleteMany({ where: { orgId, meta: { contains: leadId } } }).catch(() => {});
await prisma.lead.deleteMany({ where: { id: leadId } });
const pg = await fetch(BASE + '/playbook', { headers: H });
const html = await pg.text();
t('Playbook renders for logged-in user', pg.status === 200 && html.includes('Sales Playbook'));
t('Playbook has templates, objections, 48h plan', html.includes('Handling objections') && html.includes('48-hour demo plan') && html.includes('Message templates'));
t('Playbook uses no-free-trial wording', !/free (7-day )?trial/i.test(html));
await prisma.session.deleteMany({ where: { token } });
await prisma.$disconnect();
console.log(`\n${pass} passed, ${fail} FAILED`);
process.exit(fail ? 1 : 0);
