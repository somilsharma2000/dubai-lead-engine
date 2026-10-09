import { requireCtx } from '@/auth';

// HONEST status page. Nothing is connected until credentials are provided.
const INTEGRATIONS = [
  { name: 'WhatsApp Business API', status: 'DISCONNECTED', blocked: 'BLOCKED — BSP/Meta credentials required',
    steps: ['Choose a Meta-approved BSP or apply via Meta Business Manager (business verification needed).', 'Provide API credentials to the platform admin.', 'Webhook URL will be registered per organization; signature validation is implemented in the adapter stub.'] },
  { name: 'Email (transactional)', status: 'DISCONNECTED', blocked: 'BLOCKED — provider credentials required',
    steps: ['Create a free provider account (e.g. Resend/SendGrid).', 'Add API key to environment (EMAIL_PROVIDER_KEY).', 'Password reset + notifications become live.'] },
  { name: 'Google Calendar', status: 'DISCONNECTED', blocked: 'BLOCKED — OAuth client required',
    steps: ['Create a Google Cloud OAuth client.', 'Enable Calendar API.', 'Connect per agent to sync viewings two-way.'] },
  { name: 'AI model provider', status: 'DISCONNECTED', blocked: 'BLOCKED — API key required',
    steps: ['Add an AI provider key to environment (AI_PROVIDER_KEY).', 'Reply drafting will be constrained to property records + approved business facts only.', 'Every draft requires human approval before sending.'] },
  { name: 'Razorpay (billing)', status: 'DISCONNECTED', blocked: 'BLOCKED — Razorpay keys required',
    steps: ['Create Razorpay account.', 'Add key id/secret as environment secrets.', 'Webhook: verify signature server-side before changing any subscription state.'] },
  { name: 'CSV import/export', status: 'EXPORT ONLY', blocked: null,
    steps: ['Lead CSV export is live (Leads page → Export CSV).', 'Import is on the roadmap.'] },
];

export default async function Integrations() {
  await requireCtx();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Integrations</h1>
      <p className="text-sm text-zinc-500 max-w-2xl">Status below is truthful. A service shows CONNECTED only after credentials are verified by the platform. Nothing is simulated.</p>
      <div className="grid md:grid-cols-2 gap-3">
        {INTEGRATIONS.map(i => (
          <div key={i.name} className="card">
            <div className="flex justify-between items-center">
              <div className="font-medium">{i.name}</div>
              <span className={`badge ${i.status === 'DISCONNECTED' ? 'bg-zinc-100 text-zinc-600' : 'bg-blue-50 text-blue-800'}`}>{i.status}</span>
            </div>
            {i.blocked && <p className="mt-1 text-xs font-medium text-amber-800">{i.blocked}</p>}
            <ol className="mt-2 list-decimal list-inside text-xs text-zinc-600 space-y-0.5">
              {i.steps.map((s, k) => <li key={k}>{s}</li>)}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
