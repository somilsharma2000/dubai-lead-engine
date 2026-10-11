import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 950 });
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 500));
const rects = await p.evaluate(() => {
  const out = [];
  for (const e of document.querySelectorAll('h1,h2,h3,p,li,a,.hero-badge')) {
    const r = e.getBoundingClientRect();
    if (r.width > 0 && r.top > 0 && r.top < 950) out.push({ t: e.textContent.trim().slice(0, 28), x: Math.round(r.left), y: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) });
  }
  return out.filter(o => o.x > 1000).slice(0, 14);
});
console.log(rects.map(o => `${o.t} @ x${o.x}-${o.r} y${o.y}-${o.b}`).join('\n'));
await b.close();
