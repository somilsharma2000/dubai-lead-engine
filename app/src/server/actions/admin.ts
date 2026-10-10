'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';
import { createSession, hashPassword, logAudit } from '@/server/auth';

export async function createProspectAction(fd: FormData) {
  const ctx = await getCtx();
  if (!ctx?.user.isPlatformAdmin) return;
  await prisma.prospect.create({ data: {
    name: S(fd, 'name')!, company: S(fd, 'company'), city: S(fd, 'city'), country: S(fd, 'country'),
    source: S(fd, 'source') || 'MANUAL', status: 'NEW', nextAction: S(fd, 'nextAction'), notes: S(fd, 'notes')
  }});
  revalidatePath('/admin/prospects');
}

export async function updateProspectAction(fd: FormData) {
  const ctx = await getCtx();
  if (!ctx?.user.isPlatformAdmin) return;
  await prisma.prospect.update({ where: { id: S(fd, 'prospectId')! }, data: { status: S(fd, 'status')!, nextAction: S(fd, 'nextAction'), updatedAt: new Date() } });
  revalidatePath('/admin/prospects');
}

export async function saveIntegrationAction(fd: FormData) {
  const ctx = await getCtx();
  if (!ctx || !ctx.user.isPlatformAdmin) return;
  const provider = S(fd, 'provider')!;
  const config: Record<string, string> = {};
  for (const k of Array.from(fd.keys())) {
    if (k.startsWith('f_')) {
      const v = fd.get(k);
      if (typeof v === 'string' && v.trim()) config[k.slice(2)] = v.trim();
    }
  }
  await prisma.integrationConfig.upsert({
    where: { orgId_provider: { orgId: ctx.org.id, provider } },
    create: { orgId: ctx.org.id, provider, config: JSON.stringify(config), status: 'PENDING_VERIFICATION' },
    update: { config: JSON.stringify(config), status: 'PENDING_VERIFICATION' }
  });
  await logAudit(ctx.user.id, ctx.org.id, 'integration.credentials_saved', provider, { fields: Object.keys(config) });
  revalidatePath('/admin/integrations');
}


// === Conversations (AI center; AI key NOT connected -> rule-based drafts, honestly labelled) ===

