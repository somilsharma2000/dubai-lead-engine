'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';


export async function updateOrgAction(fd: FormData) {
  const ctx = await requirePerm('settings.write');
  await prisma.organization.update({ where: { id: ctx.org.id }, data: { name: S(fd, 'name')!, country: (S(fd, 'country') || 'AE').toUpperCase(), currency: (S(fd, 'currency') || 'USD').toUpperCase() } });
  revalidatePath('/settings');
}

export async function toggleOnboardingAction(fd: FormData) {
  const ctx = await requirePerm('settings.write');
  const itemId = S(fd, 'itemId');
  if (!itemId) return;
  const item = await prisma.onboardingItem.findFirst({ where: { id: itemId, orgId: ctx.org.id } });
  if (!item) return;
  await prisma.onboardingItem.update({ where: { id: itemId }, data: { done: !item.done } });
  revalidatePath('/settings');
}

// === Billing (demo package switch; real payments BLOCKED until Razorpay) ===

