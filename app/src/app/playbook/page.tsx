import { redirect } from 'next/navigation';
import { getCtx } from '@/server/auth';

const DISCOVERY = ['Where do leads come from?', 'How many leads per month?', 'What CRM do you use today?', 'Who should receive which leads?', 'What makes a lead qualified?', 'What follow-up is done currently?', 'How are visits booked?', 'Which channels have valid opt-in?', 'Which reports matter to you?', 'Who owns the system after launch?'];

const TEMPLATES = [
  { t: 'Cold DM / email', b: 'Hey {{name}}, I checked how your property enquiries are handled. I noticed leads from {{source}} could be pushed into one CRM, automatically qualified and followed up until they book a visit. I mapped a simple workflow for {{company}}. Want me to send the 1-page breakdown?' },
  { t: 'New enquiry reply', b: 'Hi {{first_name}}, thanks for your enquiry about {{property_or_area}}. I can help narrow down the best options. What budget range and move/buy timeline are you working with?' },
  { t: 'No-reply follow-up (Day 3)', b: "Hi {{first_name}}, just checking whether you're still exploring properties in {{location}}. If your budget or preference changed, send me the updated details and I'll adjust the options." },
  { t: 'Visit nudge', b: 'I have a few slots available for a property visit. Would you prefer {{option_1}} or {{option_2}}?' },
  { t: 'Visit confirmation', b: 'Hi {{first_name}}, your visit to {{property_name}} is confirmed for {{date}} at {{time}}. {{agent_name}} will meet you there: {{map_link}}. Need to change the time? {{reschedule_link}}' },
  { t: 'Post-visit feedback', b: 'Hi {{first_name}}, thanks for visiting {{property_name}} today. How did you find it? Would you like to see similar options or discuss next steps?' },
  { t: 'Reactivation (opted-in leads only)', b: "Hi {{first_name}}, a few months ago you were looking for a {{property_type}} in {{location}}. A new option just came up within your budget. Would you like me to share the details? (Reply STOP if you're no longer looking.)" },
  { t: 'Consent line for lead forms', b: 'I agree to receive messages about my property enquiry from {{company}} on WhatsApp, SMS and email. I can opt out anytime by replying STOP.' },
  { t: 'Monthly report email', b: "Hi {{client_name}}, here's your {{month}} summary: {{leads}} leads captured, median first reply in {{response_time}}, {{visits}} visits booked and {{recovered}} leads recovered. Recommendation for next month: {{improvement}}." },
];

const OBJECTIONS = [
  ['We already use WhatsApp, it works fine.', "Great, we keep WhatsApp. The system makes sure no enquiry is missed and every lead is followed up, even when your team is busy."],
  ["It's too expensive.", 'How much is one closed deal worth to you? If the system recovers one lost lead a quarter it pays for itself. We can also start smaller.'],
  ["My agents won't use a CRM.", 'Leads arrive with a summary and they only update the outcome. I train them and keep it simple.'],
  ['Will AI talk wrongly to my clients?', 'The AI only drafts. You approve every reply, and agents run the real conversation.'],
  ['Let me think about it.', 'Of course. Want a free sample first: I will build a demo flow on your enquiry form within 48 hours so you can see the response-time difference. Paid plans start only if you like it.'],
];

const PLAN48 = [['Hour 0-4', 'Pick the stack: this OS is your CRM, automation and booking layer.'], ['Hour 4-8', 'Create a fake brokerage and a simple enquiry form.'], ['Hour 8-14', 'Push the enquiry into the CRM and tag the source.'], ['Hour 14-22', 'Add 4-6 qualification questions and the rules-based score.'], ['Hour 22-30', 'Create the safe follow-up sequence with stop-on-reply.'], ['Hour 30-38', 'Add the property-visit calendar and CRM stage update.'], ['Hour 38-42', 'Record a 60-second Loom of the whole flow.'], ['Hour 42-48', 'Send that Loom to 20 highly relevant real estate prospects.']];

const DELIVERY = [['Day 1', 'Discovery, access, map current lead flow'], ['Day 2', 'CRM fields, pipeline, lead-source connections'], ['Day 3', 'Qualification logic + routing'], ['Day 4', 'Follow-up workflows + consent handling'], ['Day 5', 'Booking, reminders, agent tasks'], ['Day 6', 'Testing with dummy leads + edge cases'], ['Day 7', 'Training, SOP, dashboard, go-live']];

const COMPLIANCE = ['Capture explicit consent for each channel you use.', 'Record when and how consent was collected.', 'Make the sender identity clear.', 'Provide and honor opt-out requests (STOP).', 'Suppress opted-out contacts across all workflows.', 'Use approved WhatsApp templates when required.', "Follow local privacy, telemarketing and housing laws (India DPDP Act, TRAI DND, UAE rules).", 'Never let AI make discriminatory housing decisions or infer protected characteristics.'];

export default async function Playbook() {
  const ctx = await getCtx();
  if (!ctx) redirect('/login');
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Sales Playbook</h1>
        <p className="mt-1">Built from the Real Estate Automation Service Blueprint. Everything here maps to a live feature in this workspace.</p>
      </div>

      <section className="card"><h2 className="font-bold text-lg text-slate-900 mb-2">The offer in one sentence</h2>
        <p className="text-slate-800">&ldquo;I help your team turn more inbound property enquiries into qualified conversations and booked visits. I connect your lead sources, qualify enquiries, follow up, book visits and reactivate old contacts, then maintain it every month.&rdquo;</p>
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="rounded-xl bg-emerald-50 p-3"><div className="display font-extrabold text-2xl text-slate-900">&lt; 5 min</div><div className="text-xs">first response target</div></div>
          <div className="rounded-xl bg-emerald-50 p-3"><div className="display font-extrabold text-2xl text-slate-900">5 systems</div><div className="text-xs">ad click to booked visit</div></div>
          <div className="rounded-xl bg-emerald-50 p-3"><div className="display font-extrabold text-2xl text-slate-900">7 days</div><div className="text-xs">discovery to go-live</div></div>
        </div></section>

      <section className="card"><h2 className="font-bold text-lg text-slate-900 mb-3">Score bands (System 2)</h2>
        <table className="w-full text-sm"><tbody>
          <tr className="border-b"><td className="py-2 font-bold text-red-600">Hot (70+)</td><td>Instant agent alert + call within 15 minutes</td></tr>
          <tr className="border-b"><td className="py-2 font-bold text-orange-500">Warm (40-69)</td><td>Automated follow-up + agent task same day</td></tr>
          <tr><td className="py-2 font-bold text-indigo-600">Nurture (&lt;40)</td><td>Nurture sequence; re-check in 30 days</td></tr>
        </tbody></table>
        <p className="text-xs text-slate-500 mt-2">Scoring uses fixed, explainable rules (no LLM decides the score). Open any lead to see the factor breakdown.</p></section>

      <section className="card"><h2 className="font-bold text-lg text-slate-900 mb-3">Message templates</h2>
        <div className="space-y-3">{TEMPLATES.map(t => (
          <div key={t.t} className="rounded-xl border p-3"><div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.t}</div><p className="text-sm text-slate-800 mt-1 select-all">{t.b}</p></div>))}</div></section>

      <section className="card"><h2 className="font-bold text-lg text-slate-900 mb-3">Handling objections</h2>
        <div className="space-y-3">{OBJECTIONS.map(([q, a]) => (
          <div key={q} className="rounded-xl border p-3"><div className="font-semibold text-sm text-slate-900">&ldquo;{q}&rdquo;</div><p className="text-sm mt-1">{a}</p></div>))}</div></section>

      <section className="card"><h2 className="font-bold text-lg text-slate-900 mb-3">10 discovery questions</h2>
        <ol className="grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm list-decimal pl-5">{DISCOVERY.map(q => <li key={q}>{q}</li>)}</ol>
        <p className="text-sm mt-3"><b>Quantify:</b> leads per month x missed or slow leads x average commission = money left on the table.</p></section>

      <section className="card"><h2 className="font-bold text-lg text-slate-900 mb-3">48-hour demo plan</h2>
        <table className="w-full text-sm"><tbody>{PLAN48.map(([h, a]) => <tr key={h} className="border-b last:border-0"><td className="py-2 font-semibold w-28">{h}</td><td>{a}</td></tr>)}</tbody></table></section>

      <section className="card"><h2 className="font-bold text-lg text-slate-900 mb-3">7-day delivery framework</h2>
        <table className="w-full text-sm"><tbody>{DELIVERY.map(([h, a]) => <tr key={h} className="border-b last:border-0"><td className="py-2 font-semibold w-20">{h}</td><td>{a}</td></tr>)}</tbody></table>
        <p className="text-sm mt-3"><b>Monthly report:</b> leads captured, median first-response time, qualified rate, visits booked, leads recovered, top sources, errors fixed, next-month plan. Recommend one small improvement every month.</p></section>

      <section className="card"><h2 className="font-bold text-lg text-slate-900 mb-3">Compliance checklist</h2>
        <ul className="space-y-1 text-sm">{COMPLIANCE.map(c => <li key={c} className="flex gap-2"><span style={{ color: 'var(--mint)' }}>&#10003;</span>{c}</li>)}</ul></section>
    </div>
  );
}
