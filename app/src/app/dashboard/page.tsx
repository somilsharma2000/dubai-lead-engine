import Link from 'next/link';
import { prisma } from '@/db';
import { requireCtx } from '@/auth';
import { loadDemoAction, clearDemoAction } from '../actions';
import { garuInsights } from '@/lib/garu';
import GaruAssistant from '@/components/GaruAssistant';
import { ensureSocialLibrary } from '@/lib/social';

const fmtMoney = (n: number, cur: string) => new Intl.NumberFormat('en', { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 0 }).format(n);
const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'VIEWING', 'NEGOTIATION', 'WON', 'LOST'];

export default async function Dashboard() {
  const ctx = await requireCtx();
  const orgId = ctx.org.id;
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 864e5), d14 = new Date(now.getTime() - 14 * 864e5);
  const [total, newLeads7d, newLeadsPrev7, byStage, active, overdueTasks, upcomingApts, activities, hasDemo, totalLeadsAll, campaigns, pendingDrafts, onb, openTasks, daily14, sources, won, lost, nextApt, untouched] = await Promise.all([
    prisma.lead.count({ where: { orgId, archivedAt: null } }),
    prisma.lead.count({ where: { orgId, createdAt: { gte: d7 }, archivedAt: null } }),
    prisma.lead.count({ where: { orgId, createdAt: { gte: d14, lt: d7 }, archivedAt: null } }),
    prisma.lead.groupBy({ by: ['stage'], where: { orgId, archivedAt: null }, _count: { _all: true } }),
    prisma.lead.findMany({ where: { orgId, stage: { in: ['NEW', 'CONTACTED', 'QUALIFIED', 'VIEWING', 'NEGOTIATION'] }, archivedAt: null }, select: { budgetMax: true } }),
    prisma.task.count({ where: { orgId, status: 'OPEN', dueAt: { lt: now } } }),
    prisma.appointment.findMany({ where: { orgId, startsAt: { gte: now }, status: { in: ['REQUESTED', 'CONFIRMED'] } }, orderBy: { startsAt: 'asc' }, include: { lead: true }, take: 5 }),
    prisma.activity.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.lead.count({ where: { orgId, name: { startsWith: 'Demo —' } } }),
    prisma.lead.count({ where: { orgId, archivedAt: null } }),
    prisma.campaign.findMany({ where: { orgId }, select: { status: true, createdAt: true } }),
    prisma.message.count({ where: { orgId, status: 'APPROVAL_PENDING' } }),
    prisma.onboardingItem.findMany({ where: { orgId } }),
    prisma.task.count({ where: { orgId, status: 'OPEN' } }),
    prisma.lead.findMany({ where: { orgId, createdAt: { gte: d14 }, archivedAt: null }, select: { createdAt: true } }),
    prisma.lead.groupBy({ by: ['source'], where: { orgId, archivedAt: null }, _count: { _all: true }, orderBy: { _count: { source: 'desc' } } }),
    prisma.lead.count({ where: { orgId, stage: 'WON' } }),
    prisma.lead.count({ where: { orgId, stage: 'LOST' } }),
    prisma.appointment.findFirst({ where: { orgId, startsAt: { gte: now }, status: 'CONFIRMED' }, orderBy: { startsAt: 'asc' } }),
    prisma.lead.findMany({ where: { orgId, archivedAt: null, stage: { in: ['NEW', 'CONTACTED', 'QUALIFIED'] } }, orderBy: { updatedAt: 'asc' }, select: { id: true, name: true, stage: true, source: true, score: true, updatedAt: true }, take: 5 })
  ]);

  const stages: Record<string, number> = {};
  byStage.forEach(s => stages[s.stage] = s._count._all);
  const pipeline = active.reduce((s, l) => s + (l.budgetMax || 0), 0);
  const closed = won + lost;
  const winRate = closed ? Math.round(100 * won / closed) : null;
  const delta = newLeads7d - newLeadsPrev7;

  // 14-day series
  const days: { d: string; n: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const from = new Date(now.getTime() - (i + 1) * 864e5), to = new Date(now.getTime() - i * 864e5);
    days.push({ d: to.toISOString().slice(5, 10), n: daily14.filter(l => l.createdAt >= from && l.createdAt < to).length });
  }
  const maxN = Math.max(1, ...days.map(d => d.n));

  // sources
  const maxSrc = Math.max(1, ...(sources.map(s => s._count._all) || [1]));

  await ensureSocialLibrary(orgId);
  const [socialChk, socialChkDone, socialIdeas, socialSeries] = await Promise.all([
    prisma.socialAsset.count({ where: { orgId, category: 'CHECKLIST' } }),
    prisma.socialAsset.count({ where: { orgId, category: 'CHECKLIST', done: true } }),
    prisma.socialAsset.count({ where: { orgId, category: 'IDEA' } }),
    prisma.socialAsset.findMany({ where: { orgId, category: 'SERIES' }, orderBy: { sortOrder: 'asc' }, select: { title: true, meta: true } })
  ]);
  const socialScore = socialChk ? Math.round(100 * socialChkDone / socialChk) : 0;
  const tips = await garuInsights(orgId);
  const hour = now.getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const kpis = [
    { label: 'Active leads', value: total, sub: `${newLeads7d} new · ${delta >= 0 ? '+' : ''}${delta} vs last wk`, href: '/leads', warn: false },
    { label: 'Pipeline value', value: fmtMoney(pipeline, ctx.org.currency), small: true, sub: 'stated budgets', href: '/leads?stage=QUALIFIED', warn: false },
    { label: 'Viewings booked', value: upcomingApts.length, sub: nextApt ? `next ${nextApt.startsAt.toISOString().slice(5, 10)}` : 'book one today', href: '/calendar', warn: false },
    { label: 'Open tasks', value: openTasks, sub: overdueTasks ? `${overdueTasks} overdue!` : 'all on track', href: '/tasks', warn: overdueTasks > 0 },
    { label: 'Drafts to approve', value: pendingDrafts, sub: pendingDrafts ? 'reply fast' : 'inbox zero', href: '/conversations', warn: pendingDrafts > 0 },
    { label: 'Win rate', value: winRate === null ? '—' : `${winRate}%`, sub: closed ? `${won}W / ${lost}L` : 'close deals to track', href: '/reports', warn: false }
  ];

  return (
    <div className="space-y-5">
      {/* HERO */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{greet}, {ctx.user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-zinc-500">{ctx.org.name} · {now.toISOString().slice(0, 10)} · {ctx.org.pkg.replace('_', ' ')}</p>
        </div>
        <div className="flex gap-2">
          {totalLeadsAll === 0 && <form action={loadDemoAction}><button className="btn-ghost text-xs">Load demo data</button></form>}
          {hasDemo > 0 && <form action={clearDemoAction}><button className="btn-ghost text-xs">Clear demo data</button></form>}
          <Link href="/leads/new" className="btn-gold text-xs">+ New lead</Link>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(c => (
          <Link key={c.label} href={c.href} className={`card !p-4 block hover:border-amber-400 transition-colors ${c.warn ? '!border-red-300' : ''}`}>
            <div className="text-xs text-zinc-500">{c.label}</div>
            <div className={`mt-1 font-semibold ${c.small ? 'text-lg' : 'text-2xl'} ${c.warn ? 'text-red-700' : ''}`}>{c.value}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">{c.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* LEFT 2/3: charts + lists */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* 14-day chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">New leads — 14 days</h2>
                <span className="badge bg-amber-100 text-amber-800">{newLeads7d} this week</span>
              </div>
              <svg viewBox="0 0 280 90" className="w-full">
                <polyline
                  points={days.map((d, i) => `${10 + i * 19},${80 - (d.n / maxN) * 62}`).join(' ')}
                  fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {days.map((d, i) => (
                  <circle key={i} cx={10 + i * 19} cy={80 - (d.n / maxN) * 62} r={d.n > 0 ? 3.2 : 2} fill={d.n > 0 ? '#b45309' : '#d4d4d8'} />
                ))}
                {days.map((d, i) => i % 3 === 1 && (
                  <text key={i} x={10 + i * 19} y={90} fontSize="7" fill="#a1a1aa" textAnchor="middle">{d.d.slice(3)}</text>
                ))}
              </svg>
              <p className="text-xs text-zinc-500">Last 14 days of lead capture. Empty dots are zero days.</p>
            </div>
            {/* Pipeline funnel */}
            <div className="card">
              <h2 className="font-semibold mb-2">Pipeline funnel</h2>
              <div className="space-y-1.5">
                {STAGES.slice(0, 5).map((st, i) => {
                  const n = stages[st] || 0;
                  return (
                    <Link key={st} href={`/leads?stage=${st}`} className="flex items-center gap-2 group">
                      <div className="w-24 text-xs text-zinc-600 group-hover:text-amber-900">{st}</div>
                      <div className="flex-1 h-4 bg-zinc-100 rounded overflow-hidden">
                        <div className={`h-4 rounded ${i < 2 ? 'bg-amber-400' : i < 4 ? 'bg-amber-600' : 'bg-amber-800'}`} style={{ width: `${Math.max(n ? 8 : 0, 100 * n / Math.max(total, 1))}%` }} />
                      </div>
                      <div className="w-6 text-xs font-medium text-right">{n}</div>
                    </Link>
                  );
                })}
              </div>
              <p className="text-xs text-zinc-500 mt-2">Gold intensity = deal maturity. {stages['WON'] || 0} won, {stages['LOST'] || 0} lost.</p>
            </div>
          </div>

          {/* Sources */}
          <div className="card">
            <h2 className="font-semibold mb-2">Where leads come from</h2>
            {sources.length === 0 ? <p className="text-sm text-zinc-500">No leads yet.</p> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sources.slice(0, 8).map(s => (
                  <Link key={s.source} href={`/leads?source=${s.source}`} className="hover:underline">
                    <div className="text-xs text-zinc-500">{s.source}</div>
                    <div className="text-lg font-semibold">{s._count._all}</div>
                    <div className="h-1.5 bg-zinc-100 rounded"><div className="h-1.5 bg-amber-600 rounded" style={{ width: `${100 * s._count._all / maxSrc}%` }} /></div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming viewings + coldest leads */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Upcoming viewings</h2>
                <Link href="/calendar" className="text-xs text-amber-800 hover:underline">Calendar →</Link>
              </div>
              {upcomingApts.length === 0 ? (
                <p className="text-sm text-zinc-500">Nothing booked. <Link href="/calendar" className="text-amber-800 underline">Book a viewing</Link> with your warmest lead.</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingApts.map(a => (
                    <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                      <div>
                        <Link href={a.leadId ? `/conversations/${a.leadId}` : '#'} className="font-medium hover:underline">{a.lead?.name || 'Viewing'}</Link>
                        <div className="text-xs text-zinc-500">{a.startsAt.toISOString().slice(0, 16).replace('T', ' ')} UTC · {a.status}</div>
                      </div>
                      <div className="flex gap-2 text-xs shrink-0">
                        <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Viewing ' + (a.lead?.name || ''))}&dates=${a.startsAt.toISOString().replace(/[-:]|\.\d{3}/g, '')}/${a.endsAt.toISOString().replace(/[-:]|\.\d{3}/g, '')}`} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">Google</a>
                        <a href={`/api/appointments/${a.id}/ics`} className="text-blue-700 hover:underline">.ics</a>
                        {a.status === 'REQUESTED' && <span className="badge bg-amber-100 text-amber-800">confirm?</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Coldest leads (touch them)</h2>
                <Link href="/leads" className="text-xs text-amber-800 hover:underline">All leads →</Link>
              </div>
              {untouched.length === 0 ? <p className="text-sm text-zinc-500">No active leads yet.</p> : (
                <ul className="space-y-2">
                  {untouched.map(l => (
                    <li key={l.id} className="flex items-center justify-between text-sm">
                      <Link href={`/conversations/${l.id}`} className="hover:underline font-medium">{l.name}</Link>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        {l.score != null && <span className="badge bg-amber-100 text-amber-800 !text-[10px]">score {l.score}</span>}
                        <span>{Math.round((now.getTime() - l.updatedAt.getTime()) / 864e5)}d quiet</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Activity + campaigns */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h2 className="font-semibold mb-2">Recent activity</h2>
              {activities.length === 0 ? <p className="text-sm text-zinc-500">Nothing yet. Create your first lead.</p> : (
                <ul className="space-y-1.5">
                  {activities.map(a => (
                    <li key={a.id} className="text-sm flex gap-2 items-baseline">
                      <span className="text-[10px] text-zinc-400 w-24 shrink-0">{a.createdAt.toISOString().slice(5, 16).replace('T', ' ')}</span>
                      <span className="font-medium">{a.type.replace(/[._]/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Social growth engine</h2>
                <Link href="/social" className="text-xs text-amber-800 hover:underline">Open engine →</Link>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`text-3xl font-bold ${socialScore >= 80 ? 'text-emerald-700' : socialScore >= 50 ? 'text-amber-700' : 'text-red-700'}`}>{socialScore}%</div>
                <div className="flex-1">
                  <div className="text-xs text-zinc-500">Profile score — {socialChkDone}/{socialChk} setup items</div>
                  <div className="h-2 bg-zinc-100 rounded mt-1"><div className="h-2 bg-amber-600 rounded" style={{ width: `${socialScore}%` }} /></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {socialSeries.slice(0, 6).map((sr, i) => {
                  let day = ''; try { day = JSON.parse(sr.meta || '{}').day || ''; } catch {}
                  return <span key={i} className="badge bg-amber-50 text-amber-800 !text-[9px]">{day.slice(0, 3)} · {sr.title}</span>;
                })}
              </div>
              <p className="text-xs text-zinc-500">{socialIdeas} idea(s) in the bank · {campaigns.filter(c => c.status === 'POSTED').length} campaigns posted all-time · <Link href="/campaigns" className="text-amber-800 underline">campaigns</Link></p>
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
          {hasDemo > 0 && <p className="text-xs text-zinc-400">Demo data is present and clearly labelled. Clear it before going live.</p>}
        </div>

        {/* RIGHT 1/3: GARU */}
        <div className="lg:col-span-1">
          <GaruAssistant tips={tips} />
        </div>
      </div>
    </div>
  );
}
