import { NextResponse } from 'next/server';
import { requirePerm } from '@/auth';
import { prisma } from '@/db';
import { sendManualMessageAction, draftReplyAction, approveMessageAction, toggleBotAction } from '@/app/actions';

function fd(pairs: Record<string, string>) {
  const f = new FormData();
  for (const k in pairs) f.append(k, pairs[k]);
  return f;
}

export async function POST(req: Request) {
  try {
    const ctx = await requirePerm('leads.write');
    const data = await req.json();
    if (!data.leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 });
    const lead = await prisma.lead.findFirst({ where: { id: data.leadId, orgId: ctx.org.id } });
    if (!lead) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (lead.consent === 'DENIED') return NextResponse.json({ error: 'consent denied — messaging blocked' }, { status: 403 });
    if (data.body) await sendManualMessageAction(fd({ leadId: data.leadId, body: data.body }));
    else {
      if (lead.botPaused) return NextResponse.json({ error: 'bot paused — human handoff active' }, { status: 409 });
      await draftReplyAction(fd({ leadId: data.leadId }));
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'unauthorized' }, { status: e.message === 'unauthenticated' ? 401 : 403 });
  }
}

export async function PATCH(req: Request) {
  try {
    const ctx = await requirePerm('leads.write');
    const data = await req.json();
    if (data.messageId) {
      const msg = await prisma.message.findFirst({ where: { id: data.messageId, orgId: ctx.org.id } });
      if (!msg) return NextResponse.json({ error: 'not found' }, { status: 404 });
      await approveMessageAction(fd({ messageId: data.messageId, decision: data.decision || 'SEND' }));
      return NextResponse.json({ ok: true });
    }
    if (data.leadId) { await toggleBotAction(fd({ leadId: data.leadId })); return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: 'messageId or leadId required' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: 'unauthorized' }, { status: e.message === 'unauthenticated' ? 401 : 403 });
  }
}
