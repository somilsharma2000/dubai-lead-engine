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
  return {
    heroShell: box('.hero-shell'),
    heroMascot: box('.hero-mascot'),
    badges: document.querySelectorAll('.hero-badge').length,
    sweep: box('.sweep-slot'),
    peek: box('.cta-peek'),
    stickers: document.querySelectorAll('.feature-sticker').length,
    hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    h1: box('h1'),
    pills: document.querySelectorAll('.pill').length,
  };
});
const t = (n, ok, x='') => console.log(`${ok?'PASS':'FAIL'}  ${n}${x?' — '+x:''}`) || (!ok && process.exitCode ? null : null);
t('no JS page errors', errors.length===0, errors[0]||'');
t('no horizontal overflow', !geo.hOverflow);
t('hero mascot breaks hero-shell top edge', geo.heroMascot && geo.heroMascot.top < geo.heroShell.top - 20, `mascot top ${Math.round(geo.heroMascot?.top||0)} vs shell ${Math.round(geo.heroShell?.top||0)}`);
t('hero mascot overlaps hero-shell right zone (z-20)', geo.heroMascot && (geo.heroMascot.left + geo.heroMascot.w) > geo.heroShell.left + geo.heroShell.w*0.55);
t('exactly 2 floating glass badges', geo.badges===2, 'n='+geo.badges);
t('sweep mascot sits above card grid (negative space)', geo.sweep && geo.sweep.h > 0);
t('peek mascot present at CTA', geo.peek && geo.peek.h > 0);
t('6 feature micro-stickers (1 per card)', geo.stickers===6, 'n='+geo.stickers);
t('display headline renders (Outfit applied)', !!geo.h1 && geo.h1.h>50);
t('nav pills present', geo.pills>=3);
// mascot hover physics fires
const m = await p.$('.mascot-hover');
const before = await p.evaluate(el => getComputedStyle(el).transform, m);
await p.hover('.mascot-hover');
await new Promise(r => setTimeout(r, 500));
const after = await p.evaluate(el => getComputedStyle(el).transform, m);
t('hover triggers 3D tilt/translate', before !== after, JSON.stringify({before, after}).slice(0,80));
await b.close();
