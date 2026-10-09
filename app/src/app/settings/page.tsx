import { prisma } from '@/db';
import { requireCtx } from '@/auth';
import { updateOrgAction, inviteMemberAction, toggleOnboardingAction } from '../actions';



export default async function Settings() {
  const ctx = await requireCtx();
  const members = await prisma.membership.findMany({ where: { orgId: ctx.org.id }, include: { user: true } });
  let items = await prisma.onboardingItem.findMany({ where: { orgId: ctx.org.id }, orderBy: { ord: 'asc' } });
  if (items.length === 0) {
    const DEFAULTS = ['Business discovery form completed (market, territory, property types, ICP)','Brand voice + approved business facts recorded','Property inventory imported','WhatsApp channel setup + consent rules confirmed','Calendar + agent availability configured','Lead routing rules reviewed','Automation test suite passed','Content calendar approved','Client reporting cadence agreed'];
    for (let i = 0; i < DEFAULTS.length; i++) {
      await prisma.onboardingItem.create({ data: { orgId: ctx.org.id, label: DEFAULTS[i], ord: i } });
    }
    items = await prisma.onboardingItem.findMany({ where: { orgId: ctx.org.id }, orderBy: { ord: 'asc' } });
  }
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <form action={updateOrgAction} className="card grid md:grid-cols-3 gap-3 items-end">
        <div className="md:col-span-1"><label className="label">Organization</label><input name="name" defaultValue={ctx.org.name} className="input" /></div>
        <div><label className="label">Country</label><input name="country" maxLength={2} defaultValue={ctx.org.country} className="input" /></div>
        <div><label className="label">Currency</label><input name="currency" maxLength={3} defaultValue={ctx.org.currency} className="input" /></div>
        <button className="btn-gold text-xs md:col-span-3">Save</button>
      </form>
      <div className="card">
        <h2 className="font-semibold mb-1">Package</h2>
        <p className="text-sm text-zinc-600">Current: <span className="badge bg-amber-50 text-amber-800">{ctx.org.pkg}</span></p>
        <p className="text-xs text-zinc-500 mt-1">Entitlements: LEAD_ENGINE ($950/mo): content + reviews. LEAD_MACHINE ($1,800/mo): + WhatsApp AI bot, landing page. MARKET_DOMINATION ($3,250/mo): + AI voice, ads, broadcasts. Billing activation is BLOCKED until Razorpay credentials are configured (see Integrations).</p>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">Team</h2>
        <ul className="text-sm space-y-1 mb-4">
          {members.map(m => <li key={m.id} className="flex justify-between"><span>{m.user.name} <span className="text-zinc-400">{m.user.email}</span></span><span className="badge bg-zinc-100 text-zinc-700">{m.role}</span></li>)}
        </ul>
        <form action={inviteMemberAction} className="flex flex-wrap gap-2 items-end">
          <div><label className="label">Email</label><input name="email" type="email" required className="input !w-52" /></div>
          <div><label className="label">Name</label><input name="name" className="input !w-36" /></div>
          <div><label className="label">Role</label>
            <select name="role" className="input !w-40">
              {['AGENCY_ADMIN','AGENCY_MEMBER','ANALYST','CLIENT_OWNER','CLIENT_MEMBER'].map(r => <option key={r}>{r}</option>)}
            </select></div>
          <button className="btn-gold text-xs">Invite</button>
        </form>
        <p className="text-xs text-zinc-400 mt-2">Email delivery is BLOCKED (no provider). The invite creates the account with a temporary password that you share manually until email is connected.</p>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">Onboarding checklist</h2>
        <div className="space-y-1">
          {items.map((o, i) => (
            <form key={o.id} action={toggleOnboardingAction} className="flex items-center gap-2">
              <input type="hidden" name="itemId" value={o.id} />
              <button className={`badge ${o.done ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'}`}>{o.done ? 'DONE' : 'TODO'}</button>
              <span className={`text-sm ${o.done ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>{i + 1}. {o.label}</span>
            </form>
          ))}
        </div>
        <p className="text-xs text-zinc-400 mt-2">Click DONE/TODO to toggle. Saved permanently in the database.</p>
      </div>
    </div>
  );
}
