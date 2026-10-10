import { prisma } from '@/server/db';
import { requireCtx } from '@/server/auth';
import { switchPackageDemoAction, createRazorpayLinkAction } from '../actions';

const PLANS = [
  { key: 'LEAD_ENGINE', price: '$950/mo', items: ['Video editing (reels, Shorts, subtitles)', 'Social media management (12+ posts)', 'CRM + lead scoring + tasks', 'Reputation machine (consent-based)', 'Weekly report'] },
  { key: 'LEAD_MACHINE', price: '$1,800/mo', items: ['Everything in Lead Engine', 'WhatsApp AI bot (auto-replies, booking)', 'Landing pages + funnels', 'Organic lead capture (Quora, Reddit, portals)', 'Appointment automation'] },
  { key: 'MARKET_DOMINATION', price: '$3,250/mo', items: ['Everything in Lead Machine', 'Ads management (Meta, Google, TikTok)', 'AI voice, broadcasts', 'Back-office automation', 'Events + referral programs'] }
];

export default async function Billing() {
  const ctx = await requireCtx();
  const usage = await prisma.usageEvent.findMany({ where: { orgId: ctx.org.id }, orderBy: { day: 'desc' }, take: 60 });
  const payEvents = await prisma.activity.findMany({ where: { orgId: ctx.org.id, type: { startsWith: 'payment.' } }, orderBy: { createdAt: 'desc' }, take: 5 });
  const byMetric: Record<string, number> = {};
  usage.forEach(u => byMetric[u.metric] = (byMetric[u.metric] || 0) + u.count);
  const metrics = [
    { key: 'messages.manual', label: 'Messages sent by agents' },
    { key: 'drafts.rule_based', label: 'Reply drafts generated' },
    { key: 'messages.approved', label: 'Drafts approved and sent' },
    { key: 'posts.published', label: 'Campaigns marked posted' },
    { key: 'leads.created', label: 'Leads created (workflow runs)' }
  ];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Billing &amp; packages</h1>
        <p className="text-sm text-zinc-500">Generate a real Razorpay payment link for any plan (₹79,000 / ₹1,50,000 / ₹2,70,000 monthly). When Razorpay keys are configured the link is created live and appears below; until then the button records the request and Integrations shows the 2-minute setup.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map(p => (
          <div key={p.key} className={`card ${ctx.org.pkg === p.key ? '!border-amber-500 !border-2' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{p.key.replace('_', ' ')}</div>
                <div className="text-2xl font-semibold text-amber-900">{p.price}</div>
              </div>
              {ctx.org.pkg === p.key && <span className="badge bg-amber-100 text-amber-800">CURRENT</span>}
            </div>
            <ul className="mt-2 text-sm text-zinc-600 space-y-1 list-disc list-inside">
              {p.items.map(i => <li key={i}>{i}</li>)}
            </ul>
            <div className="mt-3 flex gap-2">
              <form action={createRazorpayLinkAction}>
                <input type="hidden" name="pkg" value={p.key} />
                <button className="btn-gold text-xs">Payment link (Razorpay)</button>
              </form>
              {ctx.org.pkg !== p.key && (
                <form action={switchPackageDemoAction}>
                  <input type="hidden" name="pkg" value={p.key} />
                  <button className="btn-ghost text-xs">Switch (demo — no charge)</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
      {payEvents.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-2">Payment links</h2>
          <div className="space-y-1 text-sm">
            {payEvents.map(e => (
              <div key={e.id} className="flex items-center gap-2 flex-wrap">
                <span className={`badge ${e.type === 'payment.link_created' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{e.type.replace('payment.', '')}</span>
                {e.type === 'payment.link_created' ? (
                  <a href={e.meta || '#'} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline break-all">{e.meta}</a>
                ) : <span className="text-zinc-600">{e.meta}</span>}
                <span className="text-xs text-zinc-400">{e.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="card">
        <h2 className="font-semibold mb-2">Usage this workspace</h2>
        {Object.keys(byMetric).length === 0 ? (
          <p className="text-sm text-zinc-500">No usage recorded yet. Actions you take (messages, drafts, campaigns) are counted here automatically.</p>
        ) : (
          <table className="w-full">
            <thead><tr><th className="th">Metric</th><th className="th">Count</th></tr></thead>
            <tbody>
              {metrics.filter(m => byMetric[m.key]).map(m => (
                <tr key={m.key}><td className="td">{m.label}</td><td className="td font-semibold">{byMetric[m.key]}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
