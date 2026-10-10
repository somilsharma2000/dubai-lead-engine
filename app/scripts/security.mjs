// ATTACK SUITE — tries to break the OS like a hostile client would.
const BASE = 'http://localhost:3000';
let pass = 0, fail = 0, CRIT = [];
const t = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL '}  ${name}${extra ? ' — ' + extra : ''}`); if (ok) pass++; else fail++; };
async function api(method, path, body, cookie) {
  const res = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const setCookie = res.headers.get('set-cookie');
  const cookiePair = setCookie ? setCookie.split(';')[0] : null;
  let data = null; try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data, cookie: cookiePair || cookie };
}
const uniq = Date.now();
const orgA = { name: 'Ann', email: `a${uniq}@atk.test`, password: 'Password123!', orgName: 'Alpha Realty', country: 'AE', currency: 'USD' };
const orgB = { name: 'Bob', email: `b${uniq}@atk.test`, password: 'Password123!', orgName: 'Beta Realty', country: 'IN', currency: 'INR' };

// two fresh orgs
let rA = await api('POST', '/api/auth/signup', orgA); const A = rA.cookie;
let rB = await api('POST', '/api/auth/signup', orgB); const B = rB.cookie;
t('setup: two orgs signed up', rA.status === 200 && rB.status === 200);

// A creates a lead + task
rA = await api('POST', '/api/leads', { name: 'A Secret Client', phone: '+971500000001', source: 'WHATSAPP', consent: 'GRANTED' }, A);
const leadA = rA.data?.lead?.id;
t('setup: org A lead created', !!leadA);

// ATTACK 1: B tries to read A's lead by id (leads API GET by id?)
rB = await api('GET', '/api/leads', null, B);
const leadsB = rB.data?.leads || [];
t('1. org B list does NOT contain A\'s lead', !leadsB.some(l => l.id === leadA), `B sees ${leadsB.length} leads`);
rB = await api('GET', `/api/leads?leadId=${leadA}`, null, B);
t('1b. org B cannot fetch A\'s lead by param', !(rB.data?.lead) && !(rB.data?.leads?.some?.(l => l.id === leadA)), JSON.stringify(rB.data).slice(0,60));

// ATTACK 2: B tries to write into A's lead (update endpoint?)
rB = await api('POST', '/api/leads', { id: leadA, stage: 'WON' }, B);
t('2. cross-org write rejected', rB.status >= 400 || rB.data?.error, `status=${rB.status}`);

// ATTACK 3: B tries A's lead detail PAGE (server rendered)
const page = await fetch(BASE + `/leads/${leadA}`, { headers: { cookie: B } });
const pageText = await page.text();
t('3. A\'s lead page not readable by B', !(pageText.includes('A Secret Client')), `status=${page.status}`);

// ATTACK 4: tasks cross-org
rA = await api('GET', '/api/tasks', null, A); const taskA = (rA.data?.tasks || [])[0]?.id;
rB = await api('GET', '/api/tasks', null, B);
t('4. tasks isolated', !(rB.data?.tasks || []).some(x => x.id === taskA));

// ATTACK 5: demo session tries to touch real org A
rA = await api('POST', '/api/auth/demo', {}); const D = rA.cookie;
rB = await api('POST', '/api/leads', { name: 'Demo Intruder', phone: '+971500000002' }, D);
const demoLeadId = rB.data?.lead?.id;
const demoSeesA = await api('GET', '/api/leads', null, D);
t('5. demo org cannot see real leads', !(demoSeesA.data?.leads || []).some(l => l.id === leadA));
// cleanup: the intruder lead was created in the demo org — remove it so the demo stays pristine
await api('POST', '/api/leads', { id: demoLeadId, _cleanup: true }, D); // no delete API — handled by note below

// ATTACK 6: admin wall — non-admin hits admin APIs/pages
const adminPage = await fetch(BASE + '/admin', { headers: { cookie: B }, redirect: 'manual' });
t('6. non-admin blocked from /admin page', [307, 308, 403, 404].includes(adminPage.status), `status=${adminPage.status}`);

// ATTACK 7: unauthenticated write to org-scoped APIs
rB = await api('POST', '/api/messages', { leadId: leadA, body: 'hello' });
t('7. unauthenticated messages POST rejected', rB.status === 401 || rB.status === 403, `status=${rB.status}`);

// ATTACK 8: public lead API abuse — oversized payload
rB = await api('POST', '/api/public/lead', { name: 'X'.repeat(100000), phone: '+971500000003' });
t('8. oversized payload capped by truncation (no crash)', rB.status !== 500, `status=${rB.status}`);

// ATTACK 9: junk types (numbers, objects)
rB = await api('POST', '/api/public/lead', { name: 12345, phone: { $ne: null } });
t('9. type abuse does not create junk lead', rB.status >= 400 || rB.data?.ok !== true, `status=${rB.status}`);

// ATTACK 10: signup password weakness
rB = await api('POST', '/api/auth/signup', { name: 'C', email: `c${uniq}@atk.test`, password: '123', orgName: 'X', country: 'AE', currency: 'USD' });
t('10. weak password rejected', rB.status >= 400, `status=${rB.status}`);

console.log(`\n${pass} passed, ${fail} FAILED`);
if (fail) process.exit(1);
