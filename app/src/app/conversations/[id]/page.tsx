import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/db';
import { requireCtx } from '@/auth';
import { sendManualMessageAction, draftReplyAction, approveMessageAction, toggleBotAction } from '../../actions';

export default async function Thread({ params }: { params: { id: string } }) {
  const ctx = await requireCtx();
  const lead = await prisma.lead.findFirst({
    where: { id: params.id, orgId: ctx.org.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });
  if (!lead) notFound();
  const blocked = lead.consent === 'DENIED';
  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <Link href="/conversations" className="text-xs text-zinc-500 hover:underline">← Conversations</Link>
          <h1 className="text-2xl font-semibold">{lead.name}</h1>
          <p className="text-sm text-zinc-500">{lead.phone || 'no phone'} · stage {lead.stage} · consent {lead.consent}</p>
        </div>
        <form action={toggleBotAction}>
          <input type="hidden" name="leadId" value={lead.id} />
          <button className="btn-ghost text-xs">{lead.botPaused ? 'Resume auto-drafts' : 'Pause auto-drafts (human handoff)'}</button>
        </form>
      </div>
      {blocked && (
        <p className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2">This lead denied consent. Messaging is blocked by the system — no exceptions.</p>
      )}
      <div className="card space-y-2 min-h-48">
        {lead.messages.length === 0 && <p className="text-sm text-zinc-500">No messages yet. Draft a reply below.</p>}
        {lead.messages.map(m => (
          <div key={m.id} className={`flex ${m.direction === 'OUT' ? 'justify-end' : ''}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.direction === 'OUT' ? 'bg-amber-50 border border-amber-200' : 'bg-zinc-100'}`}>
              {m.status === 'APPROVAL_PENDING' && <span className="badge bg-amber-100 text-amber-800 block mb-1 w-max">{m.source === 'RULE_DRAFT' ? 'Rule-based draft — needs your approval' : 'DRAFT'}</span>}
              <p>{m.body}</p>
              <p className="text-[10px] text-zinc-400 mt-1">{m.createdAt.toISOString().slice(0, 16).replace('T', ' ')} · {m.source}{m.status === 'SENT' ? ' · sent (delivery BLOCKED until WhatsApp connects)' : ''}</p>
              {m.status === 'APPROVAL_PENDING' && (
                <form action={approveMessageAction} className="flex gap-2 mt-2">
                  <input type="hidden" name="messageId" value={m.id} />
                  <button name="decision" value="SEND" className="btn-gold !py-1 text-xs">Approve &amp; send</button>
                  <button name="decision" value="DISCARD" className="btn-ghost !py-1 text-xs">Discard</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        <form action={draftReplyAction} className="flex-1">
          <input type="hidden" name="leadId" value={lead.id} />
          <button className="btn-ghost text-xs" disabled={blocked || lead.botPaused}>Draft reply from property records</button>
        </form>
      </div>
      <form action={sendManualMessageAction} className="card flex gap-2">
        <input type="hidden" name="leadId" value={lead.id} />
        <input name="body" required disabled={blocked} placeholder={blocked ? 'Blocked: consent denied' : 'Write a message…'} className="input flex-1" />
        <button className="btn-gold text-xs" disabled={blocked}>Send</button>
      </form>
      <p className="text-xs text-zinc-400">Drafts are rule-based (AI provider key not connected — status stays honest on the Integrations page). Delivery to WhatsApp is BLOCKED until credentials exist; approved messages are stored and queued.</p>
    </div>
  );
}
