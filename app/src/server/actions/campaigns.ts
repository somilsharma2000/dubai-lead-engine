'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';


export async function createCampaignAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  if (!S(fd, 'name')) return;
  await prisma.campaign.create({
    data: { orgId: ctx.org.id, name: S(fd, 'name')!, channel: S(fd, 'channel') || 'INSTAGRAM', type: S(fd, 'type') || 'REEL' }
  });
  revalidatePath('/campaigns');
}

export async function updateCampaignAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const campaignId = S(fd, 'campaignId');
  if (!campaignId) return;
  const c = await prisma.campaign.findFirst({ where: { id: campaignId, orgId: ctx.org.id } });
  if (!c) return;
  const data: any = {};
  const status = S(fd, 'status'); if (status) data.status = status;
  const sched = S(fd, 'scheduledFor'); if (sched) data.scheduledFor = new Date(sched);
  await prisma.campaign.update({ where: { id: campaignId }, data });
  if (data.status === 'POSTED') await recordUsage(ctx.org.id, 'posts.published');
  revalidatePath('/campaigns');
}

export async function deleteCampaignAction(fd: FormData) {
  const ctx = await requirePerm('leads.write');
  const campaignId = S(fd, 'campaignId');
  if (!campaignId) return;
  const c = await prisma.campaign.findFirst({ where: { id: campaignId, orgId: ctx.org.id } });
  if (c) await prisma.campaign.delete({ where: { id: campaignId } });
  revalidatePath('/campaigns');
}

// === Onboarding checklist ===

