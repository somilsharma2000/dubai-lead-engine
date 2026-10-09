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
const C1 = r.cookie;

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
const C2 = r.cookie;
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
r = await api('POST', '/api/auth/logout', null, C1);
t('11c. logout ok', r.data?.ok === true);
r = await api('GET', '/api/leads', null, C1);
t('11d. session invalid after logout (401)', r.status === 401);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
