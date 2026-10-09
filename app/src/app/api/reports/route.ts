import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import { requirePerm } from '@/auth';

// Money report: funnel, sources, and stated-budget revenue of WON leads.
// Formulas documented in docs/PRODUCT_REQUIREMENTS.md.
export async function GET() {
  try {
    const ctx = await requirePerm('leads.read');
    const orgId = ctx.org.id;
    const now = new Date();
    const m30 = new Date(now.getTime() - 30 * 86400000);
    const [byStage, won, bySource, leads30, msgs30, tasks] = await Promise.all([
      prisma.lead.groupBy({ by: ['stage'], where: { orgId, archivedAt: null }, _count: { _all: true } }),
      prisma.lead.findMany({ where: { orgId, stage: 'WON', archivedAt: null }, select: { budgetMax: true, source: true } }),
      prisma.lead.groupBy({ by: ['source'], where: { orgId, archivedAt: null }, _count: { _all: true } }),
      prisma.lead.count({ where: { orgId, createdAt: { gte: m30 }, archivedAt: null } }),
      prisma.message.count({ where: { orgId, direction: 'OUT', createdAt: { gte: m30 }, status: 'SENT' } }),
      prisma.task.groupBy({ by: ['status'], where: { orgId }, _count: { _all: true } })
    ]);
    const stages: Record<string, number> = {};
    byStage.forEach(s => { stages[s.stage] = s._count._all; });
    const totalLeads = byStage.reduce((s, g) => s + g._count._all, 0);
    const wonRevenue = won.reduce((s, l) => s + (l.budgetMax || 0), 0);
    const sources = bySource.map(g => {
      const wonCount = won.filter(l => l.source === g.source).length;
      return { source: g.source, leads: g._count._all, won: wonCount, winRate: g._count._all ? Math.round(100 * wonCount / g._count._all) : 0 };
    }).sort((a, b) => b.leads - a.leads);
    const taskStatus: Record<string, number> = {};
    tasks.forEach(t => { taskStatus[t.status] = t._count._all; });
    return NextResponse.json({
      ok: true,
      report: {
        totalLeads, stages, wonCount: won.length, wonRevenue,
        winRate: totalLeads ? Math.round(100 * won.length / totalLeads) : 0,
        leads30: leads30, messagesSent30: msgs30,
        tasks: taskStatus, sources,
        note: 'Revenue = sum of stated budgets of WON leads (client-declared, not verified transactions)'
      }
    });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 403 }); }
}
