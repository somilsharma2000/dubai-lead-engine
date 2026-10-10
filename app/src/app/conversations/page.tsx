import Link from 'next/link';
import { prisma } from '@/db';
import { requireCtx } from '@/auth';

export default async function Conversations() {
  const ctx = await requireCtx();
  const leads = await prisma.lead.findMany({
    where: { orgId: ctx.org.id, archivedAt: null },
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { updatedAt: 'desc' }, take: 100
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Conversations</h1>
          <p className="text-sm text-zinc-500">AI replies are drafted from your property records, then approved by you. Delivery: one-tap WhatsApp link per message (Cloud API auto-send activates when credentials are added).</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {leads.length === 0 && <p className="text-sm text-zinc-500">No leads yet — <Link href="/leads/new" className="text-amber-800 underline">create one</Link>.</p>}
        {leads.map(l => {
          const pending = l.messages.filter(m => m.status === 'APPROVAL_PENDING').length;
          return (
            <Link key={l.id} href={`/conversations/${l.id}`} className="card block hover:border-amber-400 transition-colors">
              <div className="flex justify-between items-start">
                <div className="font-medium">{l.name}</div>
                <div className="flex gap-1">
                  {l.consent === 'DENIED' && <span className="badge bg-red-100 text-red-700">DO NOT MESSAGE</span>}
                  {l.botPaused && <span className="badge bg-zinc-200 text-zinc-700">BOT PAUSED</span>}
                  {pending > 0 && <span className="badge bg-amber-100 text-amber-800">{pending} draft{pending > 1 ? 's' : ''}</span>}
                </div>
              </div>
              <p className="text-sm text-zinc-500 mt-1 truncate">{l.messages[0]?.body || 'No messages yet'}</p>
              <p className="text-xs text-zinc-400 mt-1">{l.phone || 'no phone'} · {l.stage}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
