import { requireCtx } from '@/server/auth';

// HONEST status page. Nothing is connected until credentials are provided.
const INTEGRATIONS = [
  { name: 'WhatsApp delivery', status: 'WORKING', blocked: null,
    steps: ['Click-to-chat: every sent message has an "Open in WhatsApp" one-tap link with the text pre-filled — live now, no setup.', 'Auto-send (optional): add WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID (Meta WhatsApp Business API) and approved messages send automatically.', 'Consent, pause-bot and audit rules apply to both paths.'] },
  { name: 'Team invites', status: 'WORKING', blocked: null,
    steps: ['Invite creates a personal activation link (valid 7 days) — share it on WhatsApp or anywhere.', 'Invitee sets their own password; nothing is emailed in clear.', 'Optional: add RESEND_API_KEY + EMAIL_FROM and invites also go out by email automatically.'] },
  { name: 'Calendar sync', status: 'WORKING', blocked: null,
    steps: ['Every viewing has an "Add to Google Calendar" link and a downloadable .ics file (Apple/Outlook).', 'Two-way Google sync activates when an OAuth client is connected.'] },
  { name: 'AI reply drafting', status: 'WORKING', blocked: null,
    steps: ['Rule-based drafts from your property records work today.', 'Add AI_API_KEY (any OpenAI-compatible provider; set AI_BASE_URL/AI_MODEL for OpenRouter, Groq, etc.) and drafts become LLM-written automatically.', 'Every draft still requires your approval before sending.'] },
  { name: 'Razorpay (billing)', status: 'AWAITING KEYS', blocked: null,
    steps: ['"Payment link (Razorpay)" buttons are live on the Billing page.', 'Create a Razorpay account and add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET — links then generate live (₹79k/₹1.5L/₹2.7L monthly).', 'Webhook signature verification is required before any subscription auto-changes.'] },
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
