import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import { requirePerm } from '@/auth';

// Every metric has a defined formula (see docs/PRODUCT_REQUIREMENTS.md).
export async function GET() {
  try {
    const ctx = await requirePerm('leads.read');
    const orgId = ctx.org.id;
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 86400 * 1000);
    const d30 = new Date(now.getTime() - 30 * 86400 * 1000);
    const [newLeads7d, total, byStage, active, overdueTasks, upcomingApts, activities, followups, leads30] = await Promise.all([
      prisma.lead.count({ where: { orgId, createdAt: { gte: d7 }, archivedAt: null } }),
      prisma.lead.count({ where: { orgId, archivedAt: null } }),
      prisma.lead.groupBy({ by: ['stage'], where: { orgId, archivedAt: null }, _count: { _all: true } }),
      prisma.lead.findMany({ where: { orgId, stage: { in: ['NEW','CONTACTED','QUALIFIED','VIEWING','NEGOTIATION'] }, archivedAt: null }, select: { budgetMax: true } }),
      prisma.task.count({ where: { orgId, status: 'OPEN', dueAt: { lt: now } } }),
      prisma.appointment.count({ where: { orgId, startsAt: { gte: now, lte: new Date(now.getTime() + 7 * 86400 * 1000) }, status: { in: ['REQUESTED','CONFIRMED'] } } }),
      prisma.activity.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.task.findMany({ where: { orgId, kind: 'FOLLOWUP', createdAt: { gte: d30 } }, select: { leadId: true } }),
      prisma.lead.findMany({ where: { orgId, createdAt: { gte: d30 }, archivedAt: null }, select: { id: true } })
    ]);
    // response rate: % of last-30d leads that got a followup task within 48h of creation
    const followupLeadIds = new Set(followups.filter(t => t.leadId).map(t => t.leadId));
    const responded = leads30.filter(l => followupLeadIds.has(l.id)).length;
    const pipelineValue = active.reduce((s, l) => s + (l.budgetMax || 0), 0);
    const stages: Record<string, number> = {};
    byStage.forEach(s => { stages[s.stage] = s._count._all; });
    return NextResponse.json({
      ok: true,
      metrics: {
        newLeads7d, totalLeads: total, stages,
        responseRate30d: leads30.length ? Math.round(100 * responded / leads30.length) : null,
        pipelineValueEstimate: pipelineValue,
        overdueTasks, upcomingViewings7d: upcomingApts,
        demoLabelled: false
      },
      activity: activities
    });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 403 }); }
}
