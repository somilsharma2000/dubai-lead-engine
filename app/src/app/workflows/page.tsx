import { prisma } from '@/server/db';
import { requirePerm } from '@/server/auth';
import { toggleWorkflowAction, retryRunAction } from '../actions';

export default async function Workflows() {
  const ctx = await requirePerm('workflows.manage');
  const [workflows, runs, failed] = await Promise.all([
    prisma.workflow.findMany({ where: { orgId: ctx.org.id }, include: { runs: { orderBy: { createdAt: 'desc' }, take: 3 } } }),
    prisma.workflowRun.findMany({ where: { orgId: ctx.org.id }, orderBy: { createdAt: 'desc' }, take: 25, include: { workflow: true } }),
    prisma.workflowRun.count({ where: { orgId: ctx.org.id, status: { in: ['FAILED', 'PENDING_RETRY', 'DEAD'] } } })
  ]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Workflows</h1>
        {failed > 0 && <span className="badge bg-red-100 text-red-700">{failed} failed run(s) need attention</span>}
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {workflows.map(w => (
          <div key={w.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{w.name}</div>
                <div className="text-xs text-zinc-500">Trigger: {w.trigger.replace(/_/g, ' ')}</div>
              </div>
              <form action={toggleWorkflowAction}>
                <input type="hidden" name="wfId" value={w.id} />
                <button className={`badge ${w.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'}`}>{w.enabled ? 'ON' : 'OFF'}</button>
              </form>
            </div>
            <ul className="mt-2 text-xs text-zinc-600 space-y-0.5">
              {((JSON.parse(w.config || '{}').actions) || []).map((a: any, i: number) => <li key={i}>→ {a.type}{a.title ? `: ${a.title}` : ''}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="card !p-0 overflow-x-auto">
        <div className="px-4 py-3 font-semibold border-b border-zinc-100">Execution history</div>
        {runs.length === 0 ? <div className="p-8 text-center text-sm text-zinc-500">No runs yet. Workflows fire when leads are created or stages change.</div> : (
          <table className="w-full">
            <thead><tr><th className="th">Workflow</th><th className="th">Status</th><th className="th">Attempts</th><th className="th">Log</th><th className="th">When</th><th className="th"></th></tr></thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id} className="hover:bg-zinc-50">
                  <td className="td">{r.workflow?.name || '—'}</td>
                  <td className="td"><span className={`badge ${r.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : r.status === 'DEAD' ? 'bg-red-100 text-red-700' : r.status.startsWith('PENDING') || r.status === 'FAILED' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'}`}>{r.status}</span></td>
                  <td className="td">{r.attempts}</td>
                  <td className="td text-xs text-zinc-500 max-w-64 truncate">{(JSON.parse(r.log || '[]') || []).join(' | ')}</td>
                  <td className="td text-zinc-500 text-xs">{r.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                  <td className="td">{['FAILED','PENDING_RETRY','DEAD'].includes(r.status) && (
                    <form action={retryRunAction}><input type="hidden" name="runId" value={r.id} /><button className="btn-ghost text-xs">Retry</button></form>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-zinc-400">Engine: trigger → conditions → actions. Idempotent per event. 3 attempts then DEAD (dead-letter). Manual retry available.</p>
    </div>
  );
}
