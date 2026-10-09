import { prisma } from '@/db';
import { getCtx } from '@/auth';
import { redirect } from 'next/navigation';
import { PROVIDERS } from '@/integrations';
import { saveIntegrationAction } from '../../actions';

export default async function AdminIntegrations() {
  const ctx = await getCtx();
  if (!ctx || !ctx.user.isPlatformAdmin) redirect('/dashboard');
  const saved = await prisma.integrationConfig.findMany({ where: { orgId: ctx.org.id } });
  const savedMap = new Map(saved.map(s => [s.provider, s]));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Integrations console</h1>
        <p className="text-sm text-zinc-500 mt-1">Everything the machine can connect. Status is always truthful: a connection shows CONNECTED only after the platform admin verifies it works. Save credentials any time — they switch on the moment verification passes.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {PROVIDERS.map(p => {
          const s = savedMap.get(p.key);
          return (
            <div key={p.key} className="card space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-amber-800 mt-0.5">Included in: {p.packages}</div>
                </div>
                <span className={`badge ${s ? (s.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800') : 'bg-zinc-100 text-zinc-600'}`}>
                  {s ? s.status.replace('_', ' ') : 'NOT CONNECTED'}
                </span>
              </div>
              <p className="text-sm text-zinc-700">{p.what}</p>
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase mb-1">What the client gets</div>
                <ul className="text-sm text-zinc-600 space-y-0.5 list-disc list-inside">
                  {p.gives.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase mb-1">How to connect (do this later)</div>
                <ol className="text-xs text-zinc-600 space-y-0.5 list-decimal list-inside">
                  {p.steps.map((st, i) => <li key={i}>{st}</li>)}
                </ol>
              </div>
              <form action={saveIntegrationAction} className="border-t border-zinc-100 pt-3 space-y-2">
                <input type="hidden" name="provider" value={p.key} />
                {p.fields.map(f => (
                  <div key={f.name}>
                    <label className="label">{f.label}</label>
                    <input name={`f_${f.name}`} className="input" placeholder={s ? '•••• saved (enter new value to replace)' : f.placeholder} />
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <button className="btn-gold text-xs">Save for later</button>
                  {s && <span className="text-xs text-zinc-400">Saved {s.updatedAt.toISOString().slice(0, 10)} — stored, never displayed back.</span>}
                </div>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
