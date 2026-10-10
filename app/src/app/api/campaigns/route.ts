import { NextResponse } from 'next/server';
import { requirePerm } from '@/server/auth';
import { prisma } from '@/server/db';
import { createCampaignAction, updateCampaignAction, deleteCampaignAction } from '@/app/actions';

function fd(pairs: Record<string, string>) {
  const f = new FormData();
  for (const k in pairs) f.append(k, pairs[k]);
  return f;
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePerm('leads.write');
    const data = await req.json();
    if (!data.name) return NextResponse.json({ error: 'name required' }, { status: 400 });
    await createCampaignAction(fd({ name: data.name, channel: data.channel || 'INSTAGRAM', type: data.type || 'REEL' }));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'unauthorized' }, { status: e.message === 'unauthenticated' ? 401 : 403 });
  }
}

export async function PATCH(req: Request) {
  try {
    const ctx = await requirePerm('leads.write');
    const data = await req.json();
    if (!data.campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 });
    const c = await prisma.campaign.findFirst({ where: { id: data.campaignId, orgId: ctx.org.id } });
    if (!c) return NextResponse.json({ error: 'not found' }, { status: 404 });
    await updateCampaignAction(fd({ campaignId: data.campaignId, status: data.status || c.status }));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'unauthorized' }, { status: e.message === 'unauthenticated' ? 401 : 403 });
  }
}

export async function DELETE(req: Request) {
  try {
    const ctx = await requirePerm('leads.write');
    const url = new URL(req.url);
    const campaignId = url.searchParams.get('campaignId');
    if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 });
    const c = await prisma.campaign.findFirst({ where: { id: campaignId, orgId: ctx.org.id } });
    if (!c) return NextResponse.json({ error: 'not found' }, { status: 404 });
    await deleteCampaignAction(fd({ campaignId }));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'unauthorized' }, { status: e.message === 'unauthenticated' ? 401 : 403 });
  }
}
