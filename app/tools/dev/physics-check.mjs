import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 950 });
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 20000 });
await new Promise(r => setTimeout(r, 800));
let fails = 0;
const t = (n, ok, x='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${x?' — '+x:''}`); if(!ok) fails++; };

const base = await p.evaluate(() => {
  const el = document.getElementById('mascotInteractiveContainer');
  if (!el) return null;
  const s = getComputedStyle(el); const r = el.getBoundingClientRect();
  return { pos: s.position, z: s.zIndex };
});
t('companion present, position fixed, z-99', base && base.pos === 'fixed' && base.z === '99');

// clearance helper: min gap from mascot to all visible text blocks (32px rule)
async function clearanceAt(id) {
  return await p.evaluate((sec) => {
    const el = document.getElementById('mascotInteractiveContainer');
    const er = el.getBoundingClientRect();
    let min = Infinity;
    for (const e of [...document.querySelectorAll('h1,h2,h3,p,li,a,.hero-badge')]) {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.bottom < 0 || r.top > innerHeight) continue;
      const overlap = !(er.right + 32 <= r.left || er.left >= r.right + 32 || er.bottom + 32 <= r.top || er.top >= r.bottom + 32);
      if (overlap) { min = 0; break; }
      const gx = Math.max(r.left - er.right, er.left - r.right, 0);
      const gy = Math.max(r.top - er.bottom, er.top - r.bottom, 0);
      const d = gx > 0 && gy > 0 ? Math.hypot(gx, gy) : Math.max(gx, gy);
      if (d < min) min = d;
    }
    return Math.round(min);
  }, id);
}

// hero anchor clearance (initial park)
const c0 = await clearanceAt('#heroAnchor');
t('hero anchor: 32px+ clearance from all text', c0 >= 32, 'min gap ' + c0 + 'px');

// glide through each scroll anchor and verify 32px clearance
for (const sec of ['#problemAnchor', '#workflowAnchor', '#featureAnchor', '#pricingAnchor']) {
  await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sec);
  await new Promise(r => setTimeout(r, 2200));
  const c = await clearanceAt(sec);
  t(`${sec.slice(1)}: companion glided in, 32px+ clearance`, c >= 32, 'min gap ' + c + 'px');
}

// cursor parallax
await p.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 500));
const before = await p.evaluate(() => document.getElementById('mascotInteractiveContainer').getBoundingClientRect().left);
await p.mouse.move(200, 200);
await new Promise(r => setTimeout(r, 900));
const after = await p.evaluate(() => document.getElementById('mascotInteractiveContainer').getBoundingClientRect().left);
t('cursor parallax: mascot follows mouse subtly', Math.abs(after - before) > 2, `left ${Math.round(before)} → ${Math.round(after)}`);

// click reaction
const imgBefore = await p.evaluate(() => getComputedStyle(document.querySelector('#mascotInteractiveContainer .mascot-element')).transform);
const pos = await p.evaluate(() => { const r = document.getElementById('mascotInteractiveContainer').getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; });
await p.mouse.click(Math.round(pos.x), Math.round(pos.y));
await new Promise(r => setTimeout(r, 200));
const imgDuring = await p.evaluate(() => getComputedStyle(document.querySelector('#mascotInteractiveContainer .mascot-element')).transform);
t('click triggers jump & spin timeline', imgBefore !== imgDuring);

// mobile fallback
await p.setViewport({ width: 375, height: 700 });
await p.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1200));
const mob = await p.evaluate(() => {
  const r = document.getElementById('mascotInteractiveContainer').getBoundingClientRect();
  const s = getComputedStyle(document.getElementById('mascotInteractiveContainer'));
  return { right: Math.round(innerWidth - r.right), bottom: Math.round(innerHeight - r.bottom), w: Math.round(r.width), left: s.left };
});
t('mobile fallback: parked bottom-right 16px, 80px wide', mob.right <= 16 && mob.bottom <= 16 && mob.w <= 80, JSON.stringify(mob));

t('no JS page errors', errors.length === 0, errors[0] || '');
await b.close();
process.exit(fails ? 1 : 0);
