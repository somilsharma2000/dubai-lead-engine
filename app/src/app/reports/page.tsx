import Link from 'next/link';
import { prisma } from '@/db';
import { requireCtx } from '@/auth';

const fmtMoney = (n: number, cur: string) => new Intl.NumberFormat('en', { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 0 }).format(n);

export default async function Reports() {
  const ctx = await requireCtx();
  const orgId = ctx.org.id;
  const [byStage, won, bySource, tasks] = await Promise.all([
    prisma.lead.groupBy({ by: ['stage'], where: { orgId, archivedAt: null }, _count: { _all: true } }),
    prisma.lead.findMany({ where: { orgId, stage: 'WON', archivedAt: null }, select: { budgetMax: true, source: true } }),
    prisma.lead.groupBy({ by: ['source'], where: { orgId, archivedAt: null }, _count: { _all: true } }),
    prisma.task.groupBy({ by: ['status'], where: { orgId }, _count: { _all: true } })
  ]);
  const stages: Record<string, number> = {};
  byStage.forEach(s => { stages[s.stage] = s._count._all; });
  const total = byStage.reduce((s, g) => s + g._count._all, 0);
  const wonCount = won.length;
  const wonRevenue = won.reduce((s, l) => s + (l.budgetMax || 0), 0);
  const winRate = total ? Math.round(100 * wonCount / total) : 0;
  const openTasks = tasks.find(t => t.status === 'OPEN')?._count._all || 0;
  const doneTasks = tasks.find(t => t.status === 'DONE')?._count._all || 0;
  const sources = bySource.map(g => {
    const w = won.filter(l => l.source === g.source).length;
    return { source: g.source, leads: g._count._all, won: w, rate: g._count._all ? Math.round(100 * w / g._count._all) : 0 };
  }).sort((a, b) => b.leads - a.leads);
  const cards = [
    { label: 'Won deals (stated budgets)', value: fmtMoney(wonRevenue, ctx.org.currency), small: true },
    { label: 'Deals won', value: wonCount },
    { label: 'Win rate', value: winRate + '%' },
    { label: 'Total leads', value: total },
    { label: 'Open tasks', value: openTasks },
    { label: 'Tasks done', value: doneTasks }
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Money report</h1>
          <p className="text-sm text-zinc-500">What the engine produced — computed live from your data.</p>
        </div>
        <Link href="/leads" className="btn-ghost text-xs">Back to leads</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(c => (
          <div key={c.label} className="card !p-4">
            <div className="text-xs text-zinc-500">{c.label}</div>
            <div className={`mt-1 font-semibold ${c.small ? 'text-lg' : 'text-2xl'}`}>{c.value}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-3">Funnel</h2>
          {total === 0 && <p className="text-sm text-zinc-500">No leads yet.</p>}
          {(['NEW','CONTACTED','QUALIFIED','VIEWING','NEGOTIATION','WON'].map(st => (
            <div key={st} className="flex items-center gap-3 py-1">
              <div className="w-32 text-sm text-zinc-600">{st}</div>
              <div className="flex-1 h-3 bg-zinc-100 rounded"><div className={`h-3 rounded ${st === 'WON' ? 'bg-emerald-600' : 'bg-amber-700'}`} style={{ width: `${total ? Math.min(100, 100 * (stages[st] || 0) / total) : 0}%` }} /></div>
              <div className="w-8 text-sm font-medium text-right">{stages[st] || 0}</div>
            </div>
          )))}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Where leads come from</h2>
          {sources.length === 0 && <p className="text-sm text-zinc-500">No leads yet.</p>}
          {sources.length > 0 && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-zinc-500 text-xs"><th>Source</th><th className="text-right">Leads</th><th className="text-right">Won</th><th className="text-right">Win rate</th></tr></thead>
              <tbody>
                {sources.map(s => (
                  <tr key={s.source} className="border-t border-zinc-100">
                    <td className="py-1.5">{s.source}</td>
                    <td className="text-right">{s.leads}</td>
                    <td className="text-right">{s.won}</td>
                    <td className="text-right font-medium">{s.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <p className="text-xs text-zinc-400">Honesty note: revenue figures use client-stated budgets, not verified transactions. This report updates itself — no manual work.</p>
    </div>
  );
}
