import { prisma } from '@/server/db';

// Shared helpers for all server action modules — kept DRY, used by every domain.
export const S = (fd: FormData, k: string): string | null => {
  const v = fd.get(k);
  return typeof v === 'string' && v.trim() ? v.trim() : null;
};
export { getCtx, requirePerm } from '@/server/auth';

export { redirect } from 'next/navigation';

// Usage metrics — one upserted row per (org, metric, day). Used by all domains.
export async function recordUsage(orgId: string, metric: string) {
  const day = new Date().toISOString().slice(0, 10);
  await prisma.usageEvent.upsert({
    where: { orgId_metric_day: { orgId, metric, day } },
    create: { orgId, metric, day, count: 1 },
    update: { count: { increment: 1 } }
  });
}
