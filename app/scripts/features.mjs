const BASE = process.env.APP_URL || 'http://localhost:3000';
let pass = 0, fail = 0;
const t = (n, ok, x = '') => { console.log(`${ok ? 'PASS' : 'FAIL '}  ${n}${x ? ' — ' + x : ''}`); ok ? pass++ : fail++; };
const uniq = Date.now();

const su = await fetch(BASE + '/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Flow T', email: `fl${uniq}@test.local`, password: 'Password123!', orgName: 'Flow Realty', country: 'AE', currency: 'USD' }) });
const C = su.headers.get('set-cookie').split(';')[0];
t('setup: signup', su.status === 200);

const pageHTML = async (pg) => (await fetch(BASE + pg, { headers: { cookie: C } })).text();
const formsOf = (h) => [...h.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/g)].map(f => f[0]).filter(x => x.includes('$ACTION_ID_'));
const aid = (f) => (f.match(/\$ACTION_ID_([a-f0-9]+)/) || [])[1];
async function click(pg, f, fields) {
  const fd = new FormData(); fd.append('$ACTION_ID_' + aid(f), '');
  for (const k in fields) fd.append(k, fields[k]);
  return fetch(BASE + pg, { method: 'POST', headers: { cookie: C }, body: fd, redirect: 'manual' });
}

// 1. INVITE -> accept link flow
let html = await pageHTML('/settings');
let invForm = formsOf(html).find(f => f.includes('name="email"'));
const invEmail = `teammate${uniq}@test.local`;
let r = await click('/settings', invForm, { email: invEmail, role: 'AGENCY_MEMBER' });
html = await pageHTML('/settings');
const linkMatch = html.match(/accept-invite\?token=([a-f0-9]{20,})/);
t('1. invite creates real activation link', !!linkMatch);
if (linkMatch) {
  const token = linkMatch[1];
  const invPage = await (await fetch(BASE + '/accept-invite?token=' + token)).text();
  t('2. accept-invite page opens without login', invPage.includes('password'));
  const invForms = [...invPage.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/g)].map(f => f[0]).filter(x => x.includes('$ACTION_ID_'));
  const accForm = invForms.find(f => f.includes('name="password"'));
  const fd = new FormData(); fd.append('$ACTION_ID_' + aid(accForm), ''); fd.append('token', token); fd.append('password', 'TeammatePass1!'); fd.append('name', 'Team Mate');
  const acc = await fetch(BASE + '/accept-invite?token=' + token, { method: 'POST', body: fd, redirect: 'manual' });
  t('3. accept sets password + joins org', acc.status === 303 && (acc.headers.get('location') || '').includes('login'), `status=${acc.status}`);
  const lg = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: invEmail, password: 'TeammatePass1!' }) });
  t('4. invited member logs in with chosen password', lg.status === 200);
  const TC = (lg.headers.get('set-cookie') || '').split(';')[0];
  const dash = await fetch(BASE + '/dashboard', { headers: { cookie: TC } });
  t('5. member sees workspace dashboard', dash.status === 200);
  const bad = await fetch(BASE + '/accept-invite?token=deadbeef');
  const badHtml = await bad.text();
  t('6. invalid token rejected honestly', badHtml.includes('invalid') || badHtml.includes('expired'));
}

// 2. ICS
const leadRes = await fetch(BASE + '/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie: C }, body: JSON.stringify({ name: 'ICS Lead', phone: '+971501112233', source: 'PORTAL', consent: 'GRANTED' }) });
const lead = (await leadRes.json()).lead;
html = await pageHTML('/calendar');
const calForm = formsOf(html).find(f => f.includes('name="startsAt"'));
r = await click('/calendar', calForm, { leadId: lead.id, startsAt: new Date(Date.now() + 1728e5).toISOString().slice(0, 16), notes: 'ICS test viewing' });
html = await pageHTML('/calendar');
const icsLink = html.match(/\/api\/appointments\/([a-z0-9]+)\/ics/);
t('7. calendar shows .ics links', !!icsLink);
if (icsLink) {
  const icsRes = await fetch(BASE + icsLink[0], { headers: { cookie: C } });
  const ics = await icsRes.text();
  t('8. .ics file is valid calendar event', icsRes.status === 200 && ics.includes('BEGIN:VCALENDAR') && ics.includes('DTSTART') && ics.includes('ICS test viewing'), `bytes=${ics.length}`);
  const noAuth = await fetch(BASE + icsLink[0]);
  t('9. .ics protected without cookie', [401, 403, 307].includes(noAuth.status), `status=${noAuth.status}`);
}

// 3. Razorpay honest no-keys behavior
html = await pageHTML('/billing');
const payForm = formsOf(html).find(f => f.includes('name="pkg"') && f.includes('Razorpay'));
t('10. billing has Razorpay payment link button', !!payForm);
if (payForm) {
  r = await click('/billing', payForm, { pkg: 'LEAD_MACHINE' });
  html = await pageHTML('/billing');
  t('11. no-keys click records honest status', html.includes('keys not configured') || html.includes('link_blocked'), 'blocked activity shown');
}

// 4. WhatsApp link on sent messages
const convHtml = await pageHTML('/conversations/' + lead.id);
const sendForm = [...convHtml.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/g)].map(f => f[0]).find(f => f.includes('name="body"'));
r = await click('/conversations/' + lead.id, sendForm, { leadId: lead.id, body: 'Wa link test message' });
const conv2 = await pageHTML('/conversations/' + lead.id);
const waMatch = conv2.match(/wa\.me\/971501112233\?text=/);
t('12. sent message shows working WhatsApp link', !!waMatch);

console.log(`\n${pass} passed, ${fail} FAILED`);
if (fail) process.exit(1);
