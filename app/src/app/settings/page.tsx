import { prisma } from '@/db';
import { requireCtx } from '@/auth';
import { updateOrgAction, inviteMemberAction } from '../actions';

const ONBOARDING = [
  'Business discovery form completed (market, territory, property types, ICP)',
  'Brand voice + approved business facts recorded',
  'Property inventory imported / connected',
  'WhatsApp channel setup + consent rules confirmed',
  'Calendar + agent availability configured',
  'Lead routing rules reviewed',
  'Automation test suite passed (workflows fired on test lead)',
  'Content calendar approved',
  'Client reporting cadence agreed'
];

export default async function Settings() {
  const ctx = await requireCtx();
  const members = await prisma.membership.findMany({ where: { orgId: ctx.org.id }, include: { user: true } });
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
        <ol className="list-decimal list-inside text-sm text-zinc-700 space-y-1">
          {ONBOARDING.map(o => <li key={o}>{o}</li>)}
        </ol>
        <p className="text-xs text-zinc-400 mt-2">Checklist state tracking ships with the client workspace in the next phase.</p>
      </div>
    </div>
  );
}
