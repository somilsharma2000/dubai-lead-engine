import { prisma } from '@/db';
import { requireCtx } from '@/auth';
import { createAppointmentAction, setAppointmentStatusAction } from '../actions';

export default async function CalendarPage({ searchParams }: { searchParams: { error?: string } }) {
  const ctx = await requireCtx();
  const now = new Date();
  const apts = await prisma.appointment.findMany({
    where: { orgId: ctx.org.id, startsAt: { gte: new Date(now.getTime() - 86400000) } },
    orderBy: { startsAt: 'asc' }, take: 50
  });
  const leads = await prisma.lead.findMany({ where: { orgId: ctx.org.id, archivedAt: null, stage: { in: ['QUALIFIED','VIEWING','NEGOTIATION','CONTACTED','NEW'] } }, take: 100 });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Calendar & viewings</h1>
      {searchParams?.error === 'conflict' && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">That slot conflicts with another viewing for the same agent. Pick another time.</p>
      )}
      <form action={createAppointmentAction} className="card flex flex-wrap gap-3 items-end">
        <div><label className="label">Lead</label>
          <select name="leadId" className="input !w-56"><option value="">— none —</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select></div>
        <div><label className="label">Starts at</label><input name="startsAt" type="datetime-local" required className="input" /></div>
        <div className="flex-1"><label className="label">Notes</label><input name="notes" className="input" /></div>
        <button className="btn-gold text-xs">Book viewing</button>
      </form>
      <div className="card !p-0">
        {apts.length === 0 ? <div className="p-10 text-center text-sm text-zinc-500">No upcoming viewings.</div> : (
          <table className="w-full">
            <thead><tr><th className="th">When</th><th className="th">Status</th><th className="th">Notes</th><th className="th">Actions</th></tr></thead>
            <tbody>
              {apts.map(a => (
                <tr key={a.id} className="hover:bg-zinc-50">
                  <td className="td">{a.startsAt.toISOString().slice(0, 16).replace('T', ' ')} UTC</td>
                  <td className="td"><span className="badge bg-blue-50 text-blue-800">{a.status}</span></td>
                  <td className="td">{a.notes || '—'}</td>
                  <td className="td space-x-1">
                    <form action={setAppointmentStatusAction} className="inline-flex gap-1">
                      <input type="hidden" name="aptId" value={a.id} />
                      <button name="status" value="CONFIRMED" className="btn-ghost text-xs">Confirm</button>
                      <button name="status" value="NO_SHOW" className="btn-ghost text-xs">No-show</button>
                      <button name="status" value="CANCELLED" className="btn-ghost text-xs">Cancel</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-zinc-400">A booking is REQUESTED until confirmed. Conflict detection prevents double-booking the same agent.</p>
    </div>
  );
}
