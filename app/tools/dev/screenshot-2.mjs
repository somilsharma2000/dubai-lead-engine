import puppeteer from 'puppeteer-core';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email: 'somil@leadengine.com' } });
const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
await prisma.session.create({ data: { token, userId: user.id, expiresAt: new Date(Date.now() + 86400000) } });
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.setCookie({ name: 'sid', value: token, url: 'http://localhost:3000' });
for (const [path, name] of [['/admin/integrations','os-admin-integrations'],['/admin/services','os-admin-services']]) {
  await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `/app/conversations/6ac7f6cfd20df8682b2c5db4/${name}.png`, fullPage: true });
  console.log('shot:', name);
}
await browser.close(); await prisma.$disconnect();
