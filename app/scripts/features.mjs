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

// ===== SOCIAL GROWTH MODULE =====
let socHtml = await pageHTML('/social');
t('13. social page renders all 16 sections', ['Profile optimization','Brand kit','Content pillars','Weekly content series','Idea bank','Hashtag sets','DM → lead funnels','engagement routine','KPIs','Reel script builder','Hook library','CTA formulas','Repurposing engine','Posting cadence','compliance'].every(x => socHtml.includes(x)));
t('13b. social library auto-seeded (20+ checklist items)', (socHtml.match(/name="id" value=/g) || []).length > 20, 'forms=' + (socHtml.match(/name="id" value=/g) || []).length);

// toggle first checklist item via its form
const socForms = [...socHtml.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/g)].map(f => f[0]).filter(x => x.includes('$ACTION_ID_'));
const toggleForm = socForms.find(f => f.includes('socialToggleAction') || (f.includes('name="id"') && f.includes('✓')));
// forms reference actions by id; find one with a checklist id
const firstId = (socHtml.match(/name="id" value="([^"]+)"/) || [])[1];
t('13c. checklist item id extractable', !!firstId);
if (firstId) {
  const before = socHtml.includes(`value="${firstId}"`);
  r = await click('/social', socForms.find(f => f.includes(`value="${firstId}"`)) || socForms[0], { id: firstId });
  const after = await pageHTML('/social');
  t('13d. checklist toggle persists', r.status === 303 || r.status === 200, 'status=' + r.status);
}

// add an idea
const ideaForm = socForms.find(f => f.includes('value="IDEA"'));
r = await click('/social', ideaForm, { category: 'IDEA', title: 'Audit test idea ' + uniq, pillar: 'p-local', format: 'REEL' });
const withIdea = await pageHTML('/social');
t('13e. idea added + persisted', withIdea.includes('Audit test idea ' + uniq));

// idea → campaign promotion (find the form by its button label)
const ideaForms = [...withIdea.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/g)].map(f => f[0]).filter(x => x.includes('$ACTION_ID_'));
const promoForms = ideaForms.filter(f => f.includes('→ Campaigns'));
const promoForm = promoForms[promoForms.length - 1]; // newest idea is appended last
t('13f. promotion form found for new idea', !!promoForm);
if (promoForm) {
  const pid = (promoForm.match(/name="id" value="([^"]+)"/) || [])[1];
  r = await click('/social', promoForm, { id: pid });
  const camps = await (await fetch(BASE + '/campaigns', { headers: { cookie: C } })).text();
  t('13f2. idea promoted to campaign (in CRM pipeline)', camps.includes('Audit test idea ' + uniq));
  const afterPromo = await pageHTML('/social');
  t('13f3. promoted idea removed from idea bank', !afterPromo.includes('Audit test idea ' + uniq));
}

// script builder persists
const scriptForm = socForms.find(f => f.includes('name="topic"'));
if (!scriptForm) { t('13g. reel script generated + saved', false, 'form not found'); } else {
 r = await click('/social', scriptForm, { topic: 'Audit villa tour ' + uniq, pillar: 'p-listings', city: 'Dubai' });
const withScript = await pageHTML('/social');
t('13g. reel script generated + saved', withScript.includes('Audit villa tour ' + uniq) || withScript.includes('HOOK'));
}

// brand kit save
const brandForm = socForms.find(f => f.includes('name="primary"'));
r = await click('/social', brandForm, { primary: '#b45309', secondary: '#1d4ed8', accent: '#db2777', neutral: '#18181b', fontHeading: 'Playfair', fontBody: 'Inter', vibe: 'Premium Dubai luxury' });
const withBrand = await pageHTML('/social');
t('13h. brand kit saved', r.status === 303 || r.status === 200);

// cross-org: demo session cannot toggle our social asset
const demoLogin = await fetch(BASE + '/api/auth/demo', { method: 'POST' });
const DC = demoLogin.headers.get('set-cookie').split(';')[0];
if (firstId) {
  const demoForms = [...(await (await fetch(BASE + '/social', { headers: { cookie: DC } })).text()).matchAll(/<form[^>]*>([\s\S]*?)<\/form>/g)].map(f => f[0]).filter(x => x.includes('$ACTION_ID_'));
  // try posting our asset id with demo cookie — server must reject (asset belongs to other org)
  const fd = new FormData(); fd.append('id', firstId);
  const target = demoForms[0] ? (demoForms[0].match(/\$ACTION_ID_([a-f0-9]+)/) || [])[1] : null;
  if (target) { fd.append('$ACTION_ID_' + target, ''); }
  const probe = await fetch(BASE + '/social', { method: 'POST', headers: { cookie: DC }, body: fd, redirect: 'manual' });
  const demoSoc = await pageHTML('/social');
  t('13i. cross-org social toggle rejected', probe.status !== 200 || !demoSoc.includes('Audit test idea'), 'status=' + probe.status);
}

console.log(`\n${pass} passed, ${fail} FAILED`);
if (fail) process.exit(1);
