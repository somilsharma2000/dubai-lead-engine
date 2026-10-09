import { prisma } from '@/db';
import { requireCtx } from '@/auth';
import { createTaskAction, completeTaskAction } from '../actions';

export default async function Tasks() {
  const ctx = await requireCtx();
  const [open, done] = await Promise.all([
    prisma.task.findMany({ where: { orgId: ctx.org.id, status: 'OPEN' }, orderBy: { dueAt: 'asc' }, take: 100 }),
    prisma.task.findMany({ where: { orgId: ctx.org.id, status: 'DONE' }, orderBy: { doneAt: 'desc' }, take: 10 }),
  ]);
  const now = Date.now();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <form action={createTaskAction} className="card flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48"><label className="label">New task</label><input name="title" required className="input" placeholder="e.g. WhatsApp the Dubai Marina buyer" /></div>
        <div><label className="label">Kind</label><select name="kind" className="input !w-32"><option>FOLLOWUP</option><option>CALL</option><option>VIEWING</option><option>OTHER</option></select></div>
        <div><label className="label">Due</label><input name="dueAt" type="datetime-local" className="input" /></div>
        <button className="btn-gold text-xs">Add task</button>
      </form>
      <div className="card !p-0 overflow-x-auto">
        {open.length === 0 && <div className="p-10 text-center text-sm text-zinc-500">No open tasks. The workflow engine adds them automatically for new leads.</div>}
        {open.length > 0 && <table className="w-full">
          <thead><tr><th className="th">Task</th><th className="th">Kind</th><th className="th">Due</th><th className="th"></th></tr></thead>
          <tbody>
            {open.map(t => (
              <tr key={t.id} className={t.dueAt.getTime() < now ? 'bg-red-50/50' : 'hover:bg-zinc-50'}>
                <td className="td font-medium">{t.title}</td>
                <td className="td">{t.kind}</td>
                <td className="td">{t.dueAt.toISOString().slice(0, 16).replace('T', ' ')} {t.dueAt.getTime() < now && <span className="badge bg-red-100 text-red-700 ml-1">OVERDUE</span>}</td>
                <td className="td"><form action={completeTaskAction}><input type="hidden" name="taskId" value={t.id} /><button className="btn-ghost text-xs">Done</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
      {done.length > 0 && <div className="card"><h2 className="text-sm font-semibold text-zinc-500 uppercase mb-2">Recently completed</h2>
        <ul className="text-sm text-zinc-600 space-y-1">{done.map(t => <li key={t.id}>✓ {t.title}</li>)}</ul></div>}
    </div>
  );
}
