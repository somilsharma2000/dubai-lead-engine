import Link from 'next/link';
import { prisma } from '@/db';
import { requireCtx } from '@/auth';

export default async function Leads({ searchParams }: { searchParams: { q?: string; stage?: string; source?: string } }) {
  const ctx = await requireCtx();
  const where: any = { orgId: ctx.org.id, archivedAt: null };
  if (searchParams?.stage) where.stage = searchParams.stage;
  if (searchParams?.source) where.source = searchParams.source;
  if (searchParams?.q) where.OR = [{ name: { contains: searchParams.q } }, { phone: { contains: searchParams.q } }, { email: { contains: searchParams.q } }];
  const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  const stages = ['NEW','CONTACTED','QUALIFIED','VIEWING','NEGOTIATION','WON','LOST'];
  const badge: Record<string, string> = { NEW: 'bg-blue-50 text-blue-800', QUALIFIED: 'bg-amber-50 text-amber-800', VIEWING: 'bg-purple-50 text-purple-800', NEGOTIATION: 'bg-orange-50 text-orange-800', WON: 'bg-emerald-50 text-emerald-800', LOST: 'bg-zinc-100 text-zinc-600', CONTACTED: 'bg-slate-50 text-slate-700' };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <div className="flex gap-2">
          <a href="/api/export/leads" className="btn-ghost text-xs">Export CSV</a>
          <Link href="/leads/new" className="btn-gold text-xs">+ New lead</Link>
        </div>
      </div>
      <form className="flex gap-2 flex-wrap items-center">
        <input name="q" defaultValue={searchParams?.q || ''} placeholder="Search name, phone, email…" className="input !w-64" />
        <select name="stage" defaultValue={searchParams?.stage || ''} className="input !w-44">
          <option value="">All stages</option>
          {stages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-ghost text-xs">Filter</button>
      </form>
      <div className="card !p-0 overflow-x-auto">
        {leads.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm">
            No leads yet. <Link href="/leads/new" className="text-amber-800 underline">Add your first lead</Link>.
          </div>
        ) : (
          <table className="w-full">
            <thead><tr>
              <th className="th">Name</th><th className="th">Source</th><th className="th">City</th><th className="th">Intent</th>
              <th className="th">Budget</th><th className="th">Stage</th><th className="th">Score</th><th className="th">Consent</th><th className="th">Added</th>
            </tr></thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id} className="hover:bg-zinc-50">
                  <td className="td"><Link href={`/leads/${l.id}`} className="text-amber-900 hover:underline font-medium">{l.name}</Link></td>
                  <td className="td">{l.source}</td>
                  <td className="td">{l.city || '—'}</td>
                  <td className="td">{l.intent}</td>
                  <td className="td">{l.budgetMax ? l.budgetMax.toLocaleString() : '—'}</td>
                  <td className="td"><span className={`badge ${badge[l.stage] || 'bg-zinc-100'}`}>{l.stage}</span></td>
                  <td className="td font-semibold">{l.score}</td>
                  <td className="td">{l.consent === 'DENIED' ? <span className="badge bg-red-50 text-red-700">DENIED</span> : l.consent === 'GRANTED' ? 'Yes' : '—'}</td>
                  <td className="td text-zinc-500">{l.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
