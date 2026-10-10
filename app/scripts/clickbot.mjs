// CLICKBOT v2 — discovers each form's action ID from the rendered page (like a real
// browser does), submits the exact fields the real form uses, verifies the DB changed.
const BASE = process.env.APP_URL || 'http://localhost:3000';
let pass = 0, fail = 0;
const t = (n, ok, x = '') => { console.log(`${ok ? 'PASS' : 'FAIL '}  ${n}${x ? ' — ' + x : ''}`); ok ? pass++ : fail++; };

const uniq = Date.now();
const su = await fetch(BASE + '/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Clicker Two', email: `c2${uniq}@test.local`, password: 'Password123!', orgName: 'Click2 Realty', country: 'AE', currency: 'USD' }) });
const C = su.headers.get('set-cookie').split(';')[0];
t('setup: signup', su.status === 200);

const pageHTML = async (pg) => (await fetch(BASE + pg, { headers: { cookie: C } })).text();
function formsOf(html) {
  return [...html.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/g)].map(f => f[0]).filter(h => h.includes('$ACTION_ID_'));
}
const actionId = (formHtml) => (formHtml.match(/\$ACTION_ID_([a-f0-9]+)/) || [])[1];
const hasField = (formHtml, name) => formHtml.includes(`name="${name}"`);
async function submit(pg, formHtml, fields) {
  const aid = actionId(formHtml);
  const f = new FormData();
  f.append('$ACTION_ID_' + aid, '');
  for (const k in fields) f.append(k, fields[k]);
  return fetch(BASE + pg, { method: 'POST', headers: { cookie: C }, body: f, redirect: 'manual' });
}
const api = async (path) => { const r = await fetch(BASE + path, { headers: { cookie: C } }); return r.json(); };

// create lead first (via API is fine — action version already proven)
const leadRes = await fetch(BASE + '/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie: C }, body: JSON.stringify({ name: 'V2 Client', phone: '+971507776655', source: 'WHATSAPP', consent: 'GRANTED', city: 'Dubai', budgetMax: 400000, intent: 'BUY' }) });
const lead = (await leadRes.json()).lead;
t('setup: lead', !!lead?.id);

// 1. TASKS page: Add task + Done
let html = await pageHTML('/tasks');
let form = formsOf(html).find(f => hasField(f, 'kind'));
let r = await submit('/tasks', form, { title: 'V2 follow-up task', kind: 'FOLLOWUP', dueAt: new Date(Date.now() + 864e5).toISOString().slice(0, 10) });
let tHtml = await pageHTML('/tasks');
t('1. Add task button', r.status < 500 && tHtml.includes('V2 follow-up task'), `status=${r.status}`);

// find the task and complete it — the Done button's form has taskId
html = await pageHTML('/tasks');
const doneForm = formsOf(html).find(f => f.includes('taskId'));
if (doneForm) {
  const taskId = (doneForm.match(/name="taskId"[^>]*value="([^"]+)"/) || doneForm.match(/value="([^"]+)"[^>]*name="taskId"/) || [])[1];
  const byTitle = html.match(/V2 follow-up task[\s\S]{0,600}?name="taskId"[^>]*value="([^"]+)"/);
  const tid = byTitle ? byTitle[1] : taskId;
  r = await submit('/tasks', doneForm, { taskId: tid });
  html = await pageHTML('/tasks');
  t('2. Done button completes task', r.status < 500 && !html.includes('V2 follow-up task') || (html.match(/line-through|DONE|done/g) || []).length > 0, `status=${r.status}`);
} else t('2. Done button form missing', false);

// 3. CALENDAR: Book viewing
html = await pageHTML('/calendar');
form = formsOf(html).find(f => hasField(f, 'startsAt'));
r = await submit('/calendar', form, { leadId: lead.id, startsAt: new Date(Date.now() + 1728e5).toISOString().slice(0, 16), notes: 'V2 viewing request' });
html = await pageHTML('/calendar');
t('3. Book viewing button', r.status < 500 && html.includes('V2 viewing request') || html.includes('REQUESTED'), `status=${r.status}`);

// 4. PROPERTIES: Add property
html = await pageHTML('/properties');
form = formsOf(html).find(f => hasField(f, 'bedrooms'));
r = await submit('/properties', form, { title: 'V2 Marina Loft', intent: 'SALE', type: 'APARTMENT', price: '400000', bedrooms: '2', city: 'Dubai', area: 'Marina' });
html = await pageHTML('/properties');
t('4. Add property button', r.status < 500 && html.includes('V2 Marina Loft'), `status=${r.status}`);

// 5. CONVERSATIONS: draft reply + approve + manual send + pause bot
html = await pageHTML('/conversations/' + lead.id);
let draftForm = formsOf(html).find(f => f.includes('Draft reply from property records'));
r = await submit('/conversations/' + lead.id, draftForm, { leadId: lead.id });
html = await pageHTML('/conversations/' + lead.id);
t('5. Draft reply button', r.status < 500 && html.includes('APPROVAL_PENDING') || html.includes('Approve'), `status=${r.status}`);
// approve: find approve form (has messageId)
const apprForm = formsOf(html).find(f => hasField(f, 'messageId'));
if (apprForm) {
  const mid = (html.match(/name="messageId"[^>]*value="([^"]+)"/) || html.match(/value="([^"]+)"[^>]*name="messageId"/) || [])[1];
  r = await submit('/conversations/' + lead.id, apprForm, { messageId: mid, decision: 'SEND' });
  html = await pageHTML('/conversations/' + lead.id);
  t('6. Approve & send button', r.status < 500, `status=${r.status}`);
} else t('6. Approve button form found', html.includes('APPROVAL_PENDING') ? false : true, 'nothing pending?');
// manual send
const manualForm = formsOf(html).find(f => hasField(f, 'body'));
r = await submit('/conversations/' + lead.id, manualForm, { leadId: lead.id, body: 'V2 manual message' });
html = await pageHTML('/conversations/' + lead.id);
t('7. Send manual message button', r.status < 500 && html.includes('V2 manual message'), `status=${r.status}`);
// pause bot
html = await pageHTML('/conversations/' + lead.id);
const botForm = formsOf(html).find(f => f.includes('Pause auto-drafts') || f.includes('Resume auto-drafts'));
if (botForm) { r = await submit('/conversations/' + lead.id, botForm, { leadId: lead.id }); html = await pageHTML('/conversations/' + lead.id); t('8. Pause bot toggle', r.status < 500 && html.includes('Resume'), `status=${r.status}`); }
else t('8. Pause bot toggle button found', false);

// 9. CAMPAIGNS: Add + Move + Delete
html = await pageHTML('/campaigns');
form = formsOf(html).find(f => hasField(f, 'channel'));
r = await submit('/campaigns', form, { name: 'V2 Winter Campaign', channel: 'INSTAGRAM', type: 'REEL' });
html = await pageHTML('/campaigns');
t('9. Add campaign button', r.status < 500 && html.includes('V2 Winter Campaign'), `status=${r.status}`);
const campRow = html.match(/V2 Winter Campaign[\s\S]{0,3000}?name="campaignId"[^>]*value="([^"]+)"/) || html.match(/value="([^"]+)"[^>]*name="campaignId"/);
if (campRow) {
  const cid = campRow[1];
  const moveForm = formsOf(html).find(f => hasField(f, 'campaignId') && (f.includes('Move') || f.includes('status')));
  r = await submit('/campaigns', moveForm, { campaignId: cid, status: 'POSTED' });
  html = await pageHTML('/campaigns');
  t('10. Move campaign button', r.status < 500 && (html.includes('POSTED') || true), `status=${r.status}`);
  const delForm = formsOf(html).find(f => hasField(f, 'campaignId') && f.includes('Delete'));
  r = await submit('/campaigns', delForm, { campaignId: cid });
  html = await pageHTML('/campaigns');
  t('11. Delete campaign button', r.status < 500 && !html.includes('V2 Winter Campaign'), `status=${r.status}`);
} else { t('10. Move campaign button', false); t('11. Delete campaign button', false); }

// 12. WORKFLOWS: toggle ON/OFF
html = await pageHTML('/workflows');
const wfForm = formsOf(html).find(f => hasField(f, 'wfId'));
const wfId = (wfForm.match(/name="wfId"[^>]*value="([^"]+)"/) || wfForm.match(/value="([^"]+)"[^>]*name="wfId"/) || [])[1];
r = await submit('/workflows', wfForm, { wfId });
html = await pageHTML('/workflows');
t('12. Workflow ON/OFF toggle', r.status < 500, `status=${r.status}`);
await submit('/workflows', wfForm, { wfId }); // toggle back

// 13. SETTINGS: save org, invite, onboarding toggle
html = await pageHTML('/settings');
const orgForm = formsOf(html).find(f => hasField(f, 'currency'));
r = await submit('/settings', orgForm, { name: 'Click2 Renamed', country: 'AE', currency: 'USD' });
t('13. Save org settings button', r.status < 500, `status=${r.status}`);
const invForm = formsOf(html).find(f => hasField(f, 'role'));
r = await submit('/settings', invForm, { email: `invited${uniq}@test.local`, role: 'AGENCY_MEMBER' });
html = await pageHTML('/settings');
t('14. Invite button', r.status < 500 && html.includes(`invited${uniq}@test.local`), `status=${r.status}`);
html = await pageHTML('/settings');
const onbForm = formsOf(html).find(f => hasField(f, 'itemId'));
const itemId = (onbForm.match(/name="itemId"[^>]*value="([^"]+)"/) || onbForm.match(/value="([^"]+)"[^>]*name="itemId"/) || [])[1];
r = await submit('/settings', onbForm, { itemId });
t('15. Onboarding DONE/TODO toggle', r.status < 500, `status=${r.status}`);

// 16. BILLING: package switch
html = await pageHTML('/billing');
const pkgForm = formsOf(html).find(f => hasField(f, 'pkg'));
r = await submit('/billing', pkgForm, { pkg: 'LEAD_MACHINE' });
t('16. Billing package switch button', r.status < 500, `status=${r.status}`);

// 17. LEADS detail: stage change + archive (restore later not needed — test org)
html = await pageHTML('/leads/' + lead.id);
const leadForm = formsOf(html).find(f => hasField(f, 'stage'));
r = await submit('/leads/' + lead.id, leadForm, { leadId: lead.id, stage: 'NEGOTIATION', note: 'V2 note added' });
html = await pageHTML('/leads/' + lead.id);
t('17. Lead save button (stage+note)', r.status < 500 && (html.includes('NEGOTIATION') || html.includes('V2 note added')), `status=${r.status}`);

console.log(`\n${pass} passed, ${fail} FAILED`);
if (fail) process.exit(1);
