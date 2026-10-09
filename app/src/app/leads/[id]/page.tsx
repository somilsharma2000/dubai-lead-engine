import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/db';
import { requireCtx } from '@/auth';
import { computeLeadScore } from '@/score';
import { updateLeadAction } from '../../actions';

export default async function LeadDetail({ params }: { params: { id: string } }) {
  const ctx = await requireCtx();
  // tenant isolation: scoped to org
  const lead = await prisma.lead.findFirst({
    where: { id: params.id, orgId: ctx.org.id },
    include: { notes: { orderBy: { createdAt: 'desc' } }, tasks: { orderBy: { dueAt: 'asc' } } }
  });
  if (!lead) notFound();
  const { factors } = computeLeadScore(lead);
  const properties = await prisma.property.findMany({
    where: { orgId: ctx.org.id, status: 'ACTIVE', price: lead.budgetMax ? { lte: lead.budgetMax * 1.05 } : undefined, ...(lead.city ? { city: lead.city } : {}) },
    take: 6
  });
  const stages = ['NEW','CONTACTED','QUALIFIED','VIEWING','NEGOTIATION','WON','LOST'];
  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/leads" className="text-xs text-zinc-500 hover:underline">← Leads</Link>
          <h1 className="text-2xl font-semibold">{lead.name}</h1>
          <p className="text-sm text-zinc-500">{lead.phone || 'no phone'} · {lead.email || 'no email'} · added {lead.createdAt.toISOString().slice(0, 10)}</p>
        </div>
        <div className="text-center card !p-3">
          <div className="text-xs text-zinc-500">Score</div>
          <div className="text-3xl font-semibold">{lead.score}</div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card space-y-4">
          <h2 className="font-semibold">Pipeline</h2>
          <form action={updateLeadAction} className="space-y-3">
            <input type="hidden" name="leadId" value={lead.id} />
            <div><label className="label">Stage</label>
              <select name="stage" defaultValue={lead.stage} className="input">
                {stages.map(s => <option key={s}>{s}</option>)}
              </select></div>
            <div><label className="label">Consent</label>
              <select name="consent" defaultValue={lead.consent} className="input">
                {['UNKNOWN','GRANTED','DENIED'].map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className="label">Add note</label><textarea name="note" rows={2} className="input" /></div>
            <div className="flex gap-2">
              <button className="btn-gold text-xs">Save</button>
              <button name="archive" value="1" className="btn-ghost text-xs" formNoValidate>Archive lead</button>
            </div>
          </form>
          <div className="pt-2 border-t border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-1">Why this score</h3>
            <ul className="text-xs text-zinc-600 space-y-0.5">
              {factors.map((f, i) => <li key={i}>{f.points > 0 ? '+' : ''}{f.points} — {f.label}</li>)}
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold mb-2">Matching properties ({properties.length})</h2>
            {properties.length === 0 && <p className="text-sm text-zinc-500">No matching inventory. Add properties in <Link href="/properties" className="text-amber-800 underline">Properties</Link>.</p>}
            <ul className="space-y-1 text-sm">
              {properties.map(p => (
                <li key={p.id} className="flex justify-between"><span>{p.title}</span><span className="text-zinc-500">{p.price ? p.price.toLocaleString() : ''}</span></li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-2">Tasks</h2>
            {lead.tasks.length === 0 && <p className="text-sm text-zinc-500">No tasks yet.</p>}
            <ul className="text-sm space-y-1">
              {lead.tasks.map(t => (
                <li key={t.id} className="flex justify-between">
                  <span>{t.status === 'DONE' ? '✓ ' : ''}{t.title}</span>
                  <span className="text-zinc-500 text-xs">due {t.dueAt.toISOString().slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">Notes & history</h2>
        {lead.notes.length === 0 && <p className="text-sm text-zinc-500">No notes yet.</p>}
        <ul className="space-y-2">
          {lead.notes.map(n => (
            <li key={n.id} className="text-sm border-t border-zinc-100 pt-2">
              <span className="text-zinc-400 text-xs">{n.createdAt.toISOString().slice(0, 16).replace('T', ' ')} · {n.authorId === 'SYSTEM' ? 'System' : 'Agent'}</span>
              <p>{n.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
