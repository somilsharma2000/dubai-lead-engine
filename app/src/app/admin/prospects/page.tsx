import { prisma } from '@/db';
import { getCtx } from '@/auth';
import { redirect } from 'next/navigation';
import { createProspectAction, updateProspectAction } from '../../actions';

export default async function Prospects() {
  const ctx = await getCtx();
  if (!ctx || !ctx.user.isPlatformAdmin) redirect('/dashboard');
  const prospects = await prisma.prospect.findMany({ orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }], take: 100 });
  const STATUSES = ['NEW','RESEARCHING','CONTACTED','REPLIED','CALL_BOOKED','WON','LOST'];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Founder prospects</h1>
      <form action={createProspectAction} className="card grid md:grid-cols-6 gap-2 items-end">
        <div className="md:col-span-2"><label className="label">Name *</label><input name="name" required className="input" /></div>
        <div><label className="label">Company</label><input name="company" className="input" /></div>
        <div><label className="label">City</label><input name="city" className="input" /></div>
        <div><label className="label">Country</label><input name="country" className="input" /></div>
        <div><label className="label">Next action</label><input name="nextAction" className="input" placeholder="DM / call /…" /></div>
        <button className="btn-gold text-xs md:col-span-6">Add prospect</button>
      </form>
      <div className="card !p-0 overflow-x-auto">
        {prospects.length === 0 ? <div className="p-10 text-center text-sm text-zinc-500">No prospects yet. Add your outreach targets here — nothing is ever lost.</div> : (
          <table className="w-full">
            <thead><tr><th className="th">Name</th><th className="th">Company</th><th className="th">City</th><th className="th">Status</th><th className="th">Next action</th><th className="th">Update</th></tr></thead>
            <tbody>
              {prospects.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="td font-medium">{p.name}</td>
                  <td className="td">{p.company || '—'}</td>
                  <td className="td">{[p.city, p.country].filter(Boolean).join(', ') || '—'}</td>
                  <td className="td"><span className="badge bg-zinc-100 text-zinc-700">{p.status}</span></td>
                  <td className="td">{p.nextAction || '—'}</td>
                  <td className="td">
                    <form action={updateProspectAction} className="flex gap-1">
                      <input type="hidden" name="prospectId" value={p.id} />
                      <select name="status" defaultValue={p.status} className="input !w-32 !py-1">
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button className="btn-ghost text-xs">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
