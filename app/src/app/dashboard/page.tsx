import Link from 'next/link';
import { prisma } from '@/db';
import { requireCtx } from '@/auth';
import { loadDemoAction, clearDemoAction } from '../actions';

const fmtMoney = (n: number, cur: string) => new Intl.NumberFormat('en', { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 0 }).format(n);

export default async function Dashboard() {
  const ctx = await requireCtx();
  const orgId = ctx.org.id;
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000), d30 = new Date(now.getTime() - 30 * 86400000);
  const [total, newLeads7d, byStage, active, overdueTasks, upcoming, activities, hasDemo, totalLeadsAll, campaigns, pendingDrafts, onb, openTasks, nextApt] = await Promise.all([
    prisma.lead.count({ where: { orgId, archivedAt: null } }),
    prisma.lead.count({ where: { orgId, createdAt: { gte: d7 }, archivedAt: null } }),
    prisma.lead.groupBy({ by: ['stage'], where: { orgId, archivedAt: null }, _count: { _all: true } }),
    prisma.lead.findMany({ where: { orgId, stage: { in: ['NEW','CONTACTED','QUALIFIED','VIEWING','NEGOTIATION'] }, archivedAt: null }, select: { budgetMax: true } }),
    prisma.task.count({ where: { orgId, status: 'OPEN', dueAt: { lt: now } } }),
    prisma.appointment.count({ where: { orgId, startsAt: { gte: now }, status: { in: ['REQUESTED','CONFIRMED'] } } }),
    prisma.activity.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.lead.count({ where: { orgId, name: { startsWith: 'Demo —' } } }),
    prisma.lead.count({ where: { orgId, archivedAt: null } }),
    prisma.campaign.findMany({ where: { orgId }, select: { status: true } }),
    prisma.message.count({ where: { orgId, status: 'APPROVAL_PENDING' } }),
    prisma.onboardingItem.findMany({ where: { orgId } }),
    prisma.task.count({ where: { orgId, status: 'OPEN' } }),
    prisma.appointment.findFirst({ where: { orgId, startsAt: { gte: now }, status: 'CONFIRMED' }, orderBy: { startsAt: 'asc' } })
  ]);
  const stages: Record<string, number> = {};
  byStage.forEach(s => stages[s.stage] = s._count._all);
  const pipeline = active.reduce((s, l) => s + (l.budgetMax || 0), 0);
  const cards = [
    { label: 'New leads (7 days)', value: newLeads7d, href: '/leads' },
    { label: 'Total leads', value: total, href: '/leads' },
    { label: 'Qualified pipeline', value: stages['QUALIFIED'] + stages['VIEWING'] + stages['NEGOTIATION'], href: '/leads?stage=QUALIFIED' },
    { label: 'Pipeline value (stated budgets)', value: fmtMoney(pipeline, ctx.org.currency), small: true, href: '/leads' },
    { label: 'Overdue tasks', value: overdueTasks, warn: overdueTasks > 0, href: '/tasks' },
    { label: 'Upcoming viewings', value: upcoming, href: '/calendar' },
    { label: 'Campaigns in pipeline', value: campaigns.length, href: '/campaigns' },
    { label: 'Drafts to approve', value: pendingDrafts, warn: pendingDrafts > 0, href: '/conversations' },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          {totalLeadsAll === 0 && <form action={loadDemoAction}><button className="btn-ghost text-xs">Load demo data</button></form>}
          {hasDemo > 0 && <form action={clearDemoAction}><button className="btn-ghost text-xs">Clear demo data</button></form>}
          <Link href="/leads/new" className="btn-gold text-xs">+ New lead</Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(c => (
          <Link key={c.label} href={c.href} className={`card !p-4 block hover:border-amber-400 transition-colors ${c.warn ? '!border-red-300' : ''}`}>
            <div className="text-xs text-zinc-500">{c.label}</div>
            <div className={`mt-1 font-semibold ${c.small ? 'text-lg' : 'text-2xl'} ${c.warn ? 'text-red-700' : ''}`}>{c.value}</div>
          </Link>
        ))}
      </div>
      <div className="card">
        <h2 className="font-semibold mb-1">Everything, one place</h2>
        <p className="text-xs text-zinc-500 mb-3">The whole system from here — click any module.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { href: '/leads/new', label: 'Add lead', hint: 'scored automatically' },
            { href: '/conversations', label: 'Conversations', hint: pendingDrafts ? `${pendingDrafts} draft(s) to approve` : 'message threads' },
            { href: '/campaigns', label: 'Campaigns', hint: campaigns.length ? `${campaigns.length} in pipeline` : 'content pipeline' },
            { href: '/tasks', label: 'Tasks', hint: openTasks ? `${openTasks} open` : 'nothing due' },
            { href: '/calendar', label: 'Calendar', hint: nextApt ? `next: ${nextApt.startsAt.toISOString().slice(5, 10)}` : 'viewings & meetings' },
            { href: '/properties', label: 'Properties', hint: 'inventory' },
            { href: '/workflows', label: 'Workflows', hint: 'automation engine' },
            { href: '/settings', label: 'Settings', hint: 'team & checklist' }
          ].map(m => (
            <Link key={m.href + m.label} href={m.href} className="border border-zinc-200 rounded-lg p-3 hover:border-amber-400 hover:bg-amber-50 transition-colors">
              <div className="text-sm font-medium">{m.label}</div>
              <div className="text-xs text-zinc-500">{m.hint}</div>
            </Link>
          ))}
        </div>
      </div>
      {onb.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Setup progress</h2>
            <span className="badge bg-amber-100 text-amber-800">{onb.filter(o => o.done).length}/{onb.length} done</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded"><div className="h-2 bg-amber-700 rounded" style={{ width: `${Math.round(100 * onb.filter(o => o.done).length / onb.length)}%` }} /></div>
          <p className="text-xs text-zinc-500 mt-2">Finish setup in <Link href="/settings" className="text-amber-800 underline">Settings</Link></p>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-3">Pipeline by stage</h2>
          {(['NEW','CONTACTED','QUALIFIED','VIEWING','NEGOTIATION','WON','LOST'].map(st => (
            <div key={st} className="flex items-center gap-3 py-1">
              <div className="w-32 text-sm text-zinc-600">{st}</div>
              <div className="flex-1 h-3 bg-zinc-100 rounded"><div className="h-3 bg-amber-700 rounded" style={{ width: `${total ? Math.min(100, 100 * (stages[st] || 0) / Math.max(total, 1)) : 0}%` }} /></div>
              <div className="w-8 text-sm font-medium text-right">{stages[st] || 0}</div>
            </div>
          )))}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Recent activity</h2>
          {activities.length === 0 && <p className="text-sm text-zinc-500">Nothing yet. Create your first lead.</p>}
          <ul className="space-y-2">
            {activities.map(a => (
              <li key={a.id} className="text-sm">
                <span className="text-zinc-500 text-xs">{a.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</span>{' '}
                <span className="font-medium">{a.type}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {hasDemo > 0 && <p className="text-xs text-zinc-400">Demo data is present and clearly labelled. Clear it before going live.</p>}
    </div>
  );
}
