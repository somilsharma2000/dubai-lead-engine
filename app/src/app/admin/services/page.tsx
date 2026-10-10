import { getCtx } from '@/server/auth';
import { redirect } from 'next/navigation';

// The service catalog we sell — what each category does and how the client uses it.
const CATALOG = [
  { name: 'WhatsApp AI bot', tier: 'Lead Machine +', use: 'Your phone answers every inquiry in seconds, qualifies the lead, and books viewings while you sleep.', items: ['24/7 auto-replies in any language', 'Auto-lead-capture into CRM', 'Viewing booking', 'Broadcasts to all leads', 'Human takeover anytime'] },
  { name: 'Video editing', tier: 'Lead Engine +', use: 'You shoot simple clips on your phone (we give you the shot list), we edit them into scroll-stopping content.', items: ['Property reels', 'YouTube Shorts & TikTok edits', 'Subtitles in 5 languages', 'Cinematic tours from your footage', 'Before/after renovation edits'] },
  { name: 'Social media management', tier: 'Lead Engine +', use: 'We run the account end-to-end: calendar, posts, captions, hashtags, comments.', items: ['12+ posts monthly', '9 platforms covered', 'Daily stories', 'Comment & DM management', 'Growth reports'] },
  { name: 'CRM & lead tracking', tier: 'Lead Engine +', use: 'Every lead from every source lands in one place, scored and never forgotten.', items: ['Automatic lead scoring', 'Stage pipeline', 'Follow-up tasks (auto)', 'CSV import/export', 'Team roles'] },
  { name: 'Reputation & reviews', tier: 'Lead Engine +', use: 'A machine that turns happy clients into 5-star Google reviews.', items: ['Review-request flows (consent-based)', 'Google Business Profile management', 'Review monitoring', 'Reply drafting'] },
  { name: 'Landing pages & funnels', tier: 'Lead Machine +', use: 'Campaign pages built to capture leads straight into WhatsApp.', items: ['Campaign landing pages', 'Lead magnets', 'Quizzes & valuation tools', 'A/B testing'] },
  { name: 'Ads management', tier: 'Market Domination', use: 'Retargeting and competitor-conquest campaigns across Meta, Google, TikTok.', items: ['Meta + Google + TikTok ads', 'Geo-fencing competitor offices', 'Lookalike audiences', 'Weekly performance reports'] },
  { name: 'Organic lead capture', tier: 'Lead Machine +', use: 'We answer questions in your name where buyers actually ask: Quora, Reddit, X, Facebook groups.', items: ['Daily answers in your name', 'Profile building', 'Portal (99acres/MagicBricks) optimization', 'Referral into WhatsApp'] },
  { name: 'Appointments & viewings', tier: 'Lead Engine +', use: 'Bookings, reminders, no-show recovery — all tracked.', items: ['Conflict-free scheduling', 'Reminder flows', 'No-show recovery tasks', 'Calendar sync (when connected)'] },
  { name: 'Content & brand', tier: 'Lead Engine +', use: 'Brand kit, captions, market reports, email newsletters — written in the client\'s voice.', items: ['Brand voice guide', 'Market report PDFs', 'Newsletter writing', 'Blog/SEO briefs'] },
  { name: 'Back-office automation', tier: 'Market Domination', use: 'The boring work, automated: data entry, birthday bots, database cleanups.', items: ['AI data entry', 'Birthday/anniversary bots', 'Database broadcast', 'Weekly founder briefing'] },
  { name: 'Events & community', tier: 'Market Domination', use: 'Open-house promos, giveaways, webinars that fill the pipeline.', items: ['Open house campaigns', 'Giveaway management', 'Webinar funnels', 'Referral programs'] }
];

export default async function AdminServices() {
  const ctx = await getCtx();
  if (!ctx || !ctx.user.isPlatformAdmin) redirect('/dashboard');
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Service catalog</h1>
        <p className="text-sm text-zinc-500 mt-1">Everything we sell, what it does, and how the client uses it. Tiers: Lead Engine $950/mo · Lead Machine $1,800/mo · Market Domination $3,250/mo.</p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CATALOG.map(c => (
          <div key={c.name} className="card space-y-2">
            <div className="flex justify-between items-start">
              <div className="font-semibold">{c.name}</div>
              <span className="badge bg-amber-50 text-amber-800 shrink-0">{c.tier}</span>
            </div>
            <p className="text-sm text-zinc-600">{c.use}</p>
            <ul className="text-xs text-zinc-500 space-y-0.5 list-disc list-inside">
              {c.items.map((i, k) => <li key={k}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
