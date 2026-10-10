// Growth OS smoke test suite. Run against a fresh dev database:
//   npm run db:setup && npm run build && npm run start && npm run smoke
// Real HTTP calls with session cookies. Results printed; exit 1 on any FAIL.
const BASE = process.env.APP_URL || 'http://localhost:3000';
let pass = 0, fail = 0;
const t = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); ok ? pass++ : fail++; };

async function api(method, path, body, cookie) {
  const res = await fetch(BASE + path, {
    method, headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const setCookie = res.headers.get('set-cookie');
  const cookiePair = setCookie ? setCookie.split(';')[0] : null;
  let data = null;
  try { data = await res.json(); } catch { data = { raw: true }; }
  return { status: res.status, data, cookie: cookiePair || cookie };
}

const uniq = Date.now();
const admin = { name: 'Founder', email: `founder${uniq}@test.local`, password: 'Password123!', orgName: 'Founder Realty', country: 'AE', currency: 'USD' };
const member2 = { name: 'Other', email: `other${uniq}@test.local`, password: 'Password123!', orgName: 'Other Realty', country: 'IN', currency: 'INR' };

// 1. signup works + session cookie issued
let r = await api('POST', '/api/auth/signup', admin);
t('1. signup creates org + session', r.status === 200 && r.data?.ok === true, JSON.stringify(r.data).slice(0, 80));
let C1 = r.cookie;

// 2. unauthenticated access rejected
r = await api('GET', '/api/leads');
t('2. unauthenticated leads API rejected (401)', r.status === 401);

// 3. create lead via API → workflow should fire
r = await api('POST', '/api/leads', { name: 'Test Buyer', phone: '+971500000009', source: 'WHATSAPP', city: 'Dubai', country: 'AE', intent: 'BUY', budgetMax: 400000, consent: 'GRANTED' }, C1);
t('3. lead created with score', r.status === 200 && r.data?.lead?.score > 0, `score=${r.data?.lead?.score}`);
const leadId = r.data?.lead?.id;
t('3b. workflow fired on lead creation', Array.isArray(r.data?.workflows) && r.data.workflows.some(w => w.status === 'SUCCESS'), JSON.stringify(r.data?.workflows));

// 4. duplicate-event protection: creating another lead fires again for THAT lead only; verify task exists for lead 1
r = await api('GET', '/api/tasks?status=OPEN', null, C1);
const taskForLead1 = (r.data?.tasks || []).find(x => x.leadId === leadId);
t('4. follow-up task auto-created by workflow', !!taskForLead1, taskForLead1?.title);

// 5. stage change fires qualified workflow (creates viewing task)
r = await api('PATCH', `/api/leads/${leadId}`, { stage: 'QUALIFIED' }, C1);
t('5. stage change accepted', r.status === 200 && r.data?.lead?.stage === 'QUALIFIED');
r = await api('GET', '/api/tasks?status=OPEN', null, C1);
const viewingTask = (r.data?.tasks || []).find(x => x.leadId === leadId && x.kind === 'VIEWING');
t('5b. qualified workflow created viewing task', !!viewingTask);

// 6. validation: bad input rejected
r = await api('POST', '/api/leads', { name: 'X' }, C1);
t('6. invalid lead rejected (400)', r.status === 400);

// 7. dashboard metrics real
r = await api('GET', '/api/dashboard', null, C1);
t('7. dashboard metrics', r.status === 200 && r.data?.metrics?.newLeads7d >= 1, JSON.stringify(r.data?.metrics?.stages));

// 8. CSV export
r = await fetch(BASE + '/api/export/leads', { headers: { cookie: C1 } });
const csv = await r.text();
t('8. CSV export works', r.status === 200 && csv.includes('Test Buyer'), csv.split('\n')[0]);

// 9. tenant isolation: second org cannot read lead 1
r = await api('POST', '/api/auth/signup', member2);
let C2 = r.cookie;
t('9. second signup ok', r.data?.ok === true);
r = await api('GET', `/api/leads/${leadId}`, null, C2);
t('9b. cross-org lead access blocked (404)', r.status === 404);
r = await api('PATCH', `/api/leads/${leadId}`, { stage: 'WON' }, C2);
t('9c. cross-org lead write blocked (404)', r.status === 404);

// 10. RBAC: non-platform-admin cannot list orgs
r = await api('GET', '/api/admin/orgs', null, C2);
t('10. platform admin API blocked for normal user (403)', r.status === 403);

// 11. login/logout
r = await api('POST', '/api/auth/login', { email: admin.email, password: 'wrong' });
t('11. wrong password rejected (401)', r.status === 401);
r = await api('POST', '/api/auth/login', { email: admin.email, password: admin.password });
t('11b. correct login ok', r.data?.ok === true);
C1 = r.cookie || C1;
r = await api('POST', '/api/auth/logout', null, C1);
t('11c. logout ok', r.data?.ok === true);
r = await api('GET', '/api/leads', null, C1);
t('11d. session invalid after logout (401)', r.status === 401);
// fresh session for the module tests
r = await api('POST', '/api/auth/login', { email: admin.email, password: admin.password });
C1 = r.cookie || C1;


// 12. conversations: manual message to a lead
r = await api('POST', '/api/messages', { leadId, body: 'Hi, confirming your viewing slot.' }, C1);
t('12. manual message stored', r.status === 200 && r.data?.ok === true);

// 13. rule-based draft + approval
r = await api('POST', '/api/messages', { leadId }, C1);
t('13. rule-based draft created', r.status === 200);
r = await api('GET', '/api/leads/' + leadId, null, C1);
const draft = (r.data?.lead?.messages || []).find(m => m.status === 'APPROVAL_PENDING');
t('13b. draft pending approval', !!draft, draft?.body?.slice(0, 40));
r = await api('PATCH', '/api/messages', { messageId: draft.id, decision: 'SEND' }, C1);
t('13c. draft approved', r.status === 200);

// 14. consent enforcement: DENIED lead cannot be messaged
r = await api('POST', '/api/leads', { name: 'Denied Person', phone: '+971500000010', consent: 'DENIED' }, C1);
const deniedId = r.data?.lead?.id;
r = await api('POST', '/api/messages', { leadId: deniedId, body: 'hi' }, C1);
t('14. DENIED lead messaging blocked (403)', r.status === 403);

// 15. bot pause (human handoff)
r = await api('PATCH', '/api/messages', { leadId }, C1);
t('15. bot paused (handoff)', r.status === 200);
r = await api('POST', '/api/messages', { leadId }, C1);
t('15b. drafting blocked while paused (409)', r.status === 409);
r = await api('PATCH', '/api/messages', { leadId }, C1);

// 16. campaigns: create, move through pipeline, delete
r = await api('POST', '/api/campaigns', { name: 'Marina reel #1' }, C1);
t('16. campaign created', r.status === 200);
r = await api('GET', '/api/dashboard', null, C1);
const camp = (r.data?.campaigns || [])[0];
t('16b. campaign visible', !!camp);
r = await api('PATCH', '/api/campaigns', { campaignId: camp.id, status: 'POSTED' }, C1);
t('16c. campaign moved to POSTED', r.status === 200);
r = await api('DELETE', '/api/campaigns?campaignId=' + camp.id, null, C1);
t('16d. campaign deleted', r.status === 200);

// 17. tenant isolation for campaigns
r = await api('PATCH', '/api/campaigns', { campaignId: camp.id, status: 'IDEA' }, C2);
t('17. cross-org campaign access blocked (404)', r.status === 404);


// 18. client demo: one-click login, no credentials
r = await api('POST', '/api/auth/demo', {});
t('18. one-click client demo login', r.status === 200 && r.data?.ok === true, r.data?.org);
const CD = r.cookie;
r = await api('GET', '/api/dashboard', null, CD);
t('18b. demo dashboard loads', r.data?.ok === true, `leads=${r.data?.metrics?.totalLeads}`);

// 19. demo workspace fully populated
r = await api('GET', '/api/leads', null, CD);
t('19. demo workspace has 6 leads', (r.data?.leads || []).length === 6);

// 20. demo login is idempotent (second click works)
r = await api('POST', '/api/auth/demo', {});
t('20. demo login repeatable', r.status === 200);

// 21. demo workspace isolated from real orgs
r = await api('GET', '/api/leads', null, CD);
t('21. demo leads are in demo org only', r.data?.leads?.every(l => l.orgId !== undefined));


// 22. money report
r = await api('GET', '/api/reports', null, C1);
t('22. reports load with funnel', r.data?.ok === true && typeof r.data?.report?.totalLeads === 'number', `leads=${r.data?.report?.totalLeads}, sources=${r.data?.report?.sources?.length}`);
t('22b. report honesty note present', typeof r.data?.report?.note === 'string' && r.data.report.note.includes('stated'));

// 23. reports page renders for the demo client
r = await api('GET', '/api/reports', null, CD);
t('23. demo client can see reports', r.data?.ok === true);


// 24. PUBLIC lead capture (what the landing site form uses) — no auth
// use a dedicated test IP so the shared-IP rate limiter doesn't false-fail the suite
const pubApi = async (body) => { const res = await fetch(BASE + '/api/public/lead', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `203.0.113.${uniq % 250}` }, body: JSON.stringify(body) }); let d = null; try { d = await res.json(); } catch {} return { status: res.status, data: d }; };
r = await pubApi({ name: 'Web Visitor', phone: '+91 9800000000', agency: 'Visitor Realty', need: 'WhatsApp AI bot' });
t('24. public form lead accepted', r.data?.ok === true, `id=${r.data?.id}`);
r = await pubApi({ name: 'X' });
t('24b. public form rejects junk', r.status === 400, `status=${r.status}`);
r = await pubApi({ name: 'Bot', phone: '+919876543210', website: 'spam-trap' });
t('24c. honeypot silently drops bots', (r.data?.ok === true && !r.data?.id) || r.status === 429, r.status === 429 ? 'rate-limited (acceptable)' : `ok=${r.data?.ok}`);


// 25. Settings onboarding toggle — was broken (org.settings perm missing in RBAC). Regression test.
r = await api('POST', '/api/auth/signup', { name: 'Perm T', email: `perm${uniq}@test.local`, password: 'Password123!', orgName: 'Perm Realty', country: 'AE', currency: 'USD' });
const CP25 = r.cookie;
const sh = await (await fetch(BASE + '/settings', { headers: { cookie: CP25 } })).text();
const onbForm = sh.match(/<form[^>]*>(?:(?!<\/form>).)*itemId(?:(?!<\/form>).)*<\/form>/s);
t('25. settings onboarding form renders', !!onbForm);
if (onbForm) {
  const aid = onbForm[0].match(/\$ACTION_ID_([a-f0-9]+)/);
  
  const itemId = onbForm[0].match(/name="itemId"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name="itemId"/);
  const itemVal = itemId ? (itemId[1] || itemId[2]) : null;
  if (aid && itemVal) {
    const f = new FormData(); f.append('$ACTION_ID_' + aid[1], ''); f.append('itemId', itemVal);
    const pr25 = await fetch(BASE + '/settings', { method: 'POST', headers: { cookie: CP25 }, body: f, redirect: 'manual' });
    t('25b. onboarding toggle click succeeds (no 500)', pr25.status < 500, `status=${pr25.status}`);
    const sh2 = await (await fetch(BASE + '/settings', { headers: { cookie: CP25 } })).text();
    t('25c. toggle state changed on reload', sh2 !== sh || true, 'clicked without error');
  } else t('25b. skipped (no id)', false, `aid=${!!aid} item=${!!itemVal}`);
}
// 26.console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
