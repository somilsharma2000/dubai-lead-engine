import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 950 });
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 20000 });
await new Promise(r => setTimeout(r, 600));
const geo = await p.evaluate(() => {
  const box = s => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, w: r.width, h: r.height }; };
  const stickerCards = [...document.querySelectorAll('.glass-card-3d, .card')].filter(c => c.querySelector('.feature-sticker'));
  const stickersPerCard = stickerCards.map(c => c.querySelectorAll('.feature-sticker').length);
  return {
    heroShell: box('.hero-shell'),
    heroMascot: box('.hero-mascot'),
    badges: document.querySelectorAll('.hero-badge').length,
    interactiveMascots: document.querySelectorAll('.mascot-interactive').length,
    glassCards: document.querySelectorAll('.glass-card-3d').length,
    glowAnim: getComputedStyle(document.querySelector('.glass-card-3d')).animationName,
    stickersMax: Math.max(...stickersPerCard, 0),
    stickerCards: stickerCards.length,
    hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    h1: box('h1'),
    pills: document.querySelectorAll('.pill').length,
    metricsCards: document.querySelectorAll('#product .glass-card-3d').length,
    workflowCards: document.querySelectorAll('#workflow .card').length,
  };
});
let fails = 0;
const t = (n, ok, x='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${x?' — '+x:''}`); if(!ok) fails++; };
t('no JS page errors', errors.length===0, errors[0]||'');
t('no horizontal overflow', !geo.hOverflow);
t('hero mascot breaks hero-shell top edge (bounding-box overlap)', geo.heroMascot && geo.heroMascot.top < geo.heroShell.top - 20, `mascot top ${Math.round(geo.heroMascot?.top||0)} vs shell ${Math.round(geo.heroShell?.top||0)}`);
t('hero mascot sits over right zone (z-20)', geo.heroMascot && (geo.heroMascot.left + geo.heroMascot.w) > geo.heroShell.left + geo.heroShell.w*0.55);
t('floating glass badges present', geo.badges>=2, 'n='+geo.badges);
t('4 interactive mascot instances (hero/sweep/juggle/peek)', geo.interactiveMascots===4, 'n='+geo.interactiveMascots);
t('key metrics strip: 4 glass cards', geo.metricsCards===4, 'n='+geo.metricsCards);
t('workflow preview: 4 step cards', geo.workflowCards===4, 'n='+geo.workflowCards);
t('glass cards animate badgeGlow', geo.glowAnim==='badgeGlow', geo.glowAnim);
t('exactly 1 micro-sticker per card', geo.stickersMax===1 && geo.stickerCards>=13, `max=${geo.stickersMax} cards=${geo.stickerCards}`);
t('display headline renders', !!geo.h1 && geo.h1.h>50);
t('nav pills present', geo.pills>=4);
// hover triggers mascotJump on .mascot-interactive
const m = await p.$('.mascot-interactive');
const before = await p.evaluate(el => getComputedStyle(el).animationName, m);
await p.hover('.mascot-interactive');
await new Promise(r => setTimeout(r, 400));
const after = await p.evaluate(el => getComputedStyle(el).animationName, m);
t('hover triggers mascotJump animation', after==='mascotJump', `idle=${before} hover=${after}`);
// random behavior engine: poll 9.5s for an action class appearing
let sawRandom = false;
for (let i=0; i<19; i++) {
  const has = await p.evaluate(() => !!document.querySelector('.jump-action, .tilt-left, .tilt-right'));
  if (has) { sawRandom = true; break; }
  await new Promise(r => setTimeout(r, 500));
}
t('random mascot behavior engine fires (7s interval)', sawRandom);
await b.close();
process.exit(fails ? 1 : 0);
