'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { requirePerm } from '@/server/auth';
import { buildScript } from '@/lib/social';

async function own(id: string) {
  const ctx = await requirePerm('social.manage');
  const a = await prisma.socialAsset.findFirst({ where: { id } });
  if (!a || a.orgId !== ctx.org.id) throw new Error('Not found');
  return { asset: a, ctx };
}

export async function socialToggleAction(fd: FormData) {
  const { asset } = await own(String(fd.get('id')));
  await prisma.socialAsset.update({ where: { id: asset.id }, data: { done: !asset.done } });
  revalidatePath('/social');
  revalidatePath('/dashboard');
}

export async function socialAddAction(fd: FormData) {
  const ctx = await requirePerm('social.manage');
  const category = String(fd.get('category') || '').toUpperCase();
  const title = String(fd.get('title') || '').trim().slice(0, 120);
  if (!title) return;
  let meta: Record<string, unknown> = {};
  if (category === 'SERIES') {
    meta = { day: String(fd.get('day') || 'MONDAY'), format: String(fd.get('format') || 'REEL'), hook: String(fd.get('hook') || '').slice(0, 300) };
  } else if (category === 'IDEA') {
    meta = { pillar: String(fd.get('pillar') || ''), format: String(fd.get('format') || 'REEL') };
  } else if (category === 'HASHTAG') {
    meta = { tags: String(fd.get('tags') || '').slice(0, 400) };
  }
  const max = await prisma.socialAsset.aggregate({ where: { orgId: ctx.org.id, category }, _max: { sortOrder: true } });
  await prisma.socialAsset.create({
    data: { orgId: ctx.org.id, category, title, meta: Object.keys(meta).length ? JSON.stringify(meta) : null, sortOrder: (max._max.sortOrder || 0) + 1 }
  });
  revalidatePath('/social');
  revalidatePath('/dashboard');
}

export async function socialDeleteAction(fd: FormData) {
  const { asset } = await own(String(fd.get('id')));
  // library items (keyed) can't be deleted, only user-created ones
  if (asset.key) return;
  await prisma.socialAsset.delete({ where: { id: asset.id } });
  revalidatePath('/social');
  revalidatePath('/dashboard');
}

export async function socialWeightAction(fd: FormData) {
  const { asset } = await own(String(fd.get('id')));
  const meta = asset.meta ? JSON.parse(asset.meta) : {};
  const w = Math.max(0, Math.min(100, Number(fd.get('weight')) || meta.weight || 0));
  await prisma.socialAsset.update({ where: { id: asset.id }, data: { meta: JSON.stringify({ ...meta, weight: w }) } });
  revalidatePath('/social');
}

export async function socialEditAction(fd: FormData) {
  const { asset } = await own(String(fd.get('id')));
  const title = String(fd.get('title') || '').trim().slice(0, 120);
  const detail = String(fd.get('detail') || '').slice(0, 1000);
  await prisma.socialAsset.update({ where: { id: asset.id }, data: { title: title || asset.title, detail: detail || asset.detail } });
  revalidatePath('/social');
}

export async function brandSaveAction(fd: FormData) {
  const ctx = await requirePerm('social.manage');
  const meta = {
    primary: String(fd.get('primary') || ''),
    secondary: String(fd.get('secondary') || ''),
    accent: String(fd.get('accent') || ''),
    neutral: String(fd.get('neutral') || ''),
    fontHeading: String(fd.get('fontHeading') || '').slice(0, 60),
    fontBody: String(fd.get('fontBody') || '').slice(0, 60),
    vibe: String(fd.get('vibe') || '').slice(0, 120),
  };
  const existing = await prisma.socialAsset.findFirst({ where: { orgId: ctx.org.id, category: 'BRAND' } });
  if (existing) {
    await prisma.socialAsset.update({ where: { id: existing.id }, data: { meta: JSON.stringify(meta), title: 'Brand kit' } });
  } else {
    await prisma.socialAsset.create({ data: { orgId: ctx.org.id, category: 'BRAND', key: 'brand-kit', title: 'Brand kit', meta: JSON.stringify(meta) } });
  }
  revalidatePath('/social');
}

export async function ideaToCampaignAction(fd: FormData) {
  const { asset } = await own(String(fd.get('id')));
  const meta = asset.meta ? JSON.parse(asset.meta) : {};
  await prisma.campaign.create({
    data: { orgId: asset.orgId, name: asset.title.slice(0, 120), type: String(meta.format || 'REEL'), status: 'IDEA' }
  });
  await prisma.socialAsset.delete({ where: { id: asset.id } });
  revalidatePath('/social');
  revalidatePath('/campaigns');
}

export async function scriptGenerateAction(fd: FormData) {
  const ctx = await requirePerm('social.manage');
  const topic = String(fd.get('topic') || '').trim().slice(0, 120);
  if (!topic) return;
  const script = buildScript({
    topic,
    pillar: String(fd.get('pillar') || 'p-listings'),
    hookType: String(fd.get('hookType') || ''),
    city: String(fd.get('city') || '').slice(0, 60),
  });
  const max = await prisma.socialAsset.aggregate({ where: { orgId: ctx.org.id, category: 'SCRIPT' }, _max: { sortOrder: true } });
  await prisma.socialAsset.create({
    data: {
      orgId: ctx.org.id, category: 'SCRIPT', title: topic,
      meta: JSON.stringify(script), sortOrder: (max._max.sortOrder || 0) + 1,
    }
  });
  revalidatePath('/social');
}
