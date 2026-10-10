import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import { requirePerm } from '@/auth';

// Full workspace backup: every table scoped to the caller's org, as one JSON file.
// Disaster-recovery safeguard — data should never live in only one place.
export async function GET() {
  try {
    const ctx = await requirePerm('settings.write'); // workspace owners only
    const orgId = ctx.org.id;
    const [org, leads, tasks, campaigns, socialAssets, properties, appointments, workflows, memberships, activities] = await Promise.all([
      prisma.organization.findUnique({ where: { id: orgId }, select: { id: true, name: true, slug: true, country: true, currency: true, pkg: true, createdAt: true } }),
      prisma.lead.findMany({ where: { orgId } }),
      prisma.task.findMany({ where: { orgId } }),
      prisma.campaign.findMany({ where: { orgId } }),
      prisma.socialAsset.findMany({ where: { orgId } }),
      prisma.property.findMany({ where: { orgId } }),
      prisma.appointment.findMany({ where: { orgId } }),
      prisma.workflow.findMany({ where: { orgId } }),
      prisma.membership.findMany({ where: { orgId }, select: { role: true, createdAt: true } }),
      prisma.activity.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' }, take: 500 }),
    ]);
    const backup = {
      exportedAt: new Date().toISOString(),
      version: 1,
      org, memberships,
      counts: { leads: leads.length, tasks: tasks.length, campaigns: campaigns.length, socialAssets: socialAssets.length, properties: properties.length, appointments: appointments.length, workflows: workflows.length },
      tables: { leads, tasks, campaigns, socialAssets, properties, appointments, workflows, activities },
    };
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="workspace-backup-${org?.slug || orgId}-${stamp}.json"` },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 403 });
  }
}
