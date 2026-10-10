'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';
import { config } from '@/config';

export async function switchPackageDemoAction(fd: FormData) {
  const ctx = await requirePerm('settings.write');
  const pkg = S(fd, 'pkg')!;
  if (!['LEAD_ENGINE', 'LEAD_MACHINE', 'MARKET_DOMINATION'].includes(pkg)) return;
  await prisma.organization.update({ where: { id: ctx.org.id }, data: { pkg } });
  await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'package.demo_switch', entity: 'Organization', entityId: ctx.org.id, meta: pkg } });
  revalidatePath('/billing'); revalidatePath('/settings');
}

// Reset the demo workspace back to its original state (demo org only).

export async function createRazorpayLinkAction(fd: FormData) {
  const ctx = await requirePerm('settings.write');
  const pkg = S(fd, 'pkg')!;
  if (!config.plans.priceInr[pkg]) return;
  const keyId = config.razorpay.keyId, keySecret = config.razorpay.keySecret;
  if (!keyId || !keySecret) {
    await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'payment.link_blocked', entity: 'Billing', meta: 'Razorpay keys not configured' } });
    revalidatePath('/billing');
    return;
  }
  const res = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64') },
    body: JSON.stringify({
      amount: config.plans.priceInr[pkg] * 100, currency: 'INR',
      description: `${pkg.replace('_', ' ')} monthly subscription`,
      customer: { name: ctx.org.name, email: ctx.user.email },
      notes: { orgId: ctx.org.id, package: pkg },
      notify: { sms: false, email: true }
    })
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && (data as any)?.short_url) {
    await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'payment.link_created', entity: 'Billing', meta: (data as any).short_url } });
  } else {
    await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'payment.link_failed', entity: 'Billing', meta: ((data as any)?.error?.description || 'unknown') + '' } });
  }
  revalidatePath('/billing');
}

