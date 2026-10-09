import { prisma } from '@/db';
import { getCtx } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Admin() {
  const ctx = await getCtx();
  if (!ctx || !ctx.user.isPlatformAdmin) redirect('/dashboard');
  const [orgs, audit, flags, prospects] = await Promise.all([
    prisma.organization.findMany({ include: { _count: { select: { memberships: true, leads: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.featureFlag.findMany(),
    prisma.prospect.count()
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Platform admin</h1>
      <div className="grid grid-cols-3 gap-3">
        <div className="card"><div className="text-xs text-zinc-500">Organizations</div><div className="text-2xl font-semibold">{orgs.length}</div></div>
        <div className="card"><div className="text-xs text-zinc-500">Prospects</div><div className="text-2xl font-semibold">{prospects}</div></div>
        <div className="card"><div className="text-xs text-zinc-500">Audit entries</div><div className="text-2xl font-semibold">{audit.length}+</div></div>
      </div>
      <div className="card !p-0 overflow-x-auto">
        <div className="px-4 py-3 font-semibold border-b border-zinc-100">Organizations</div>
        <table className="w-full">
          <thead><tr><th className="th">Name</th><th className="th">Package</th><th className="th">Status</th><th className="th">Members</th><th className="th">Leads</th><th className="th">Country</th><th className="th">Created</th></tr></thead>
          <tbody>
            {orgs.map(o => (
              <tr key={o.id} className="hover:bg-zinc-50">
                <td className="td font-medium">{o.name}</td>
                <td className="td"><span className="badge bg-amber-50 text-amber-800">{o.pkg}</span></td>
                <td className="td">{o.status}</td>
                <td className="td">{o._count.memberships}</td>
                <td className="td">{o._count.leads}</td>
                <td className="td">{o.country}</td>
                <td className="td text-zinc-500">{o.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">Feature flags</h2>
        {flags.length === 0 ? <p className="text-sm text-zinc-500">None configured. Flags: create rows in the FeatureFlag table (key, enabled, description) and they appear here.</p> : (
          <ul className="text-sm space-y-1">{flags.map(f => <li key={f.id} className="flex justify-between"><span>{f.key}</span><span className="badge bg-zinc-100">{f.enabled ? 'ON' : 'OFF'}</span></li>)}</ul>
        )}
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">Audit log (privileged actions)</h2>
        <ul className="text-xs text-zinc-600 space-y-1">
          {audit.map(a => <li key={a.id}>{a.createdAt.toISOString().slice(0, 16).replace('T', ' ')} — {a.action} — {a.target}</li>)}
        </ul>
      </div>
    </div>
  );
}
