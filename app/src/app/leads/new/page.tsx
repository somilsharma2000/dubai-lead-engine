import { requireCtx } from '@/server/auth';
import { createLeadAction } from '../../actions';

export default async function NewLead() {
  await requireCtx();
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">New lead</h1>
      <form action={createLeadAction} className="card space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="label">Full name *</label><input name="name" required className="input" /></div>
          <div><label className="label">Phone (with country code)</label><input name="phone" className="input" placeholder="+971 …" /></div>
          <div><label className="label">Email</label><input name="email" type="email" className="input" /></div>
          <div><label className="label">Source</label>
            <select name="source" className="input">
              {['MANUAL','WEBSITE','WHATSAPP','INSTAGRAM','PORTAL','REFERRAL'].map(s => <option key={s}>{s}</option>)}
            </select></div>
          <div><label className="label">City</label><input name="city" className="input" /></div>
          <div><label className="label">Country code</label><input name="country" maxLength={2} className="input" placeholder="AE / IN / …" /></div>
          <div><label className="label">Intent</label>
            <select name="intent" className="input"><option>BUY</option><option>RENT</option></select></div>
          <div><label className="label">Property type</label><input name="propertyType" className="input" placeholder="Apartment / Villa / …" /></div>
          <div><label className="label">Budget min</label><input name="budgetMin" type="number" min="0" className="input" /></div>
          <div><label className="label">Budget max</label><input name="budgetMax" type="number" min="0" className="input" /></div>
          <div><label className="label">Consent to message</label>
            <select name="consent" className="input"><option>UNKNOWN</option><option>GRANTED</option><option>DENIED</option></select></div>
        </div>
        <div><label className="label">First note (optional)</label><textarea name="notes" rows={3} className="input" placeholder="What they said, what they want…" /></div>
        <button className="btn-gold">Create lead</button>
        <p className="text-xs text-zinc-500">Creating a lead fires the &quot;New lead → 24h first-touch task&quot; workflow automatically.</p>
      </form>
    </div>
  );
}
