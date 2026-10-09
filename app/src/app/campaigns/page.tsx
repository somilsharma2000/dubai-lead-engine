import { prisma } from '@/db';
import { requireCtx } from '@/auth';
import { createCampaignAction, updateCampaignAction, deleteCampaignAction } from '../actions';

const STAGES = ['IDEA','SCRIPTED','EDITING','PENDING_APPROVAL','SCHEDULED','POSTED'];
const CHANNELS = ['INSTAGRAM','YOUTUBE','TIKTOK','FACEBOOK','GOOGLE','EMAIL'];
const TYPES = ['REEL','POST','STORY','VIDEO_EDIT','ARTICLE','EMAIL'];

export default async function Campaigns() {
  const ctx = await requireCtx();
  const campaigns = await prisma.campaign.findMany({ where: { orgId: ctx.org.id }, orderBy: { createdAt: 'desc' }, take: 100 });
  const byStage: Record<string, typeof campaigns> = {};
  STAGES.forEach(s => byStage[s] = campaigns.filter(c => c.status === s));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Content campaigns</h1>
        <p className="text-sm text-zinc-500">The editing pipeline: idea → script → edit → your approval → scheduled → posted. (Auto-publishing needs the Meta connection — until then, mark POSTED when you post manually.)</p>
      </div>
      <form action={createCampaignAction} className="card grid md:grid-cols-5 gap-2 items-end">
        <div className="md:col-span-2"><label className="label">New campaign *</label><input name="name" required className="input" placeholder="e.g. Marina 2BR reel #3" /></div>
        <div><label className="label">Channel</label><select name="channel" className="input">{CHANNELS.map(c => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label">Type</label><select name="type" className="input">{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
        <button className="btn-gold text-xs">Add</button>
      </form>
      <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAGES.map(stage => (
          <div key={stage} className="card !p-3">
            <div className="text-xs font-semibold text-zinc-500 uppercase mb-2">{stage.replace('_', ' ')} ({byStage[stage].length})</div>
            <div className="space-y-2">
              {byStage[stage].map(c => (
                <div key={c.id} className="border border-zinc-200 rounded-md p-2 text-sm">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-zinc-400">{c.channel} · {c.type}</div>
                  {c.scheduledFor && <div className="text-xs text-amber-800">sched {c.scheduledFor.toISOString().slice(0, 10)}</div>}
                  <form action={updateCampaignAction} className="mt-2 flex gap-1">
                    <input type="hidden" name="campaignId" value={c.id} />
                    <select name="status" defaultValue={c.status} className="input !w-28 !py-1 !text-xs">
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button className="btn-ghost !py-1 !text-xs">Move</button>
                  </form>
                  <div className="flex gap-2 mt-1">
                    <form action={updateCampaignAction} className="flex gap-1">
                      <input type="hidden" name="campaignId" value={c.id} />
                      <input type="hidden" name="status" value={c.status} />
                      <input type="date" name="scheduledFor" className="input !py-1 !text-xs !w-28" />
                      <button className="text-xs text-amber-800 underline">Set date</button>
                    </form>
                    <form action={deleteCampaignAction}><input type="hidden" name="campaignId" value={c.id} /><button className="text-xs text-red-700 underline">Delete</button></form>
                  </div>
                </div>
              ))}
              {byStage[stage].length === 0 && <p className="text-xs text-zinc-300">—</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
