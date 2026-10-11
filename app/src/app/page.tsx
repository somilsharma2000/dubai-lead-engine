import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCtx } from '@/server/auth';
import { GaruHero, GaruSweep, GaruPeek, GaruJuggle, StickerOS, StickerAI, StickerGrowth, StickerBroken, StickerClock, StickerBell } from '@/components/brand/Assets';
import MascotBehaviors from '@/components/brand/MascotBehaviors';
import MascotCompanion from '@/components/brand/MascotCompanion';
import { demoLoginAction } from './page-actions';

// ── honest plan copy, identical to /billing ──
const PLANS = [
  { key: 'LEAD_ENGINE', name: 'Lead Engine', price: '$950/mo', tag: 'Most popular start', items: ['Video editing (reels, Shorts, subtitles)', 'Social media management (12+ posts)', 'CRM + lead scoring + tasks', 'Reputation machine (consent-based)', 'Weekly report'] },
  { key: 'LEAD_MACHINE', name: 'Lead Machine', price: '$1,800/mo', tag: 'Serious pipeline', featured: true, items: ['Everything in Lead Engine', 'WhatsApp AI bot (auto-replies, booking)', 'Landing pages + funnels', 'Organic lead capture (Quora, Reddit, portals)', 'Appointment automation'] },
  { key: 'MARKET_DOMINATION', name: 'Market Domination', price: '$3,250/mo', tag: 'Full takeover', items: ['Everything in Lead Machine', 'Ads management (Meta, Google, TikTok)', 'AI voice, broadcasts', 'Back-office automation', 'Events + referral programs'] },
];

// ── Stage 6: Key Metrics Strip — 4 glass cards with 3D stickers ──
const METRICS = [
  { icon: StickerOS, big: 'One OS', label: 'CRM, conversations, tasks, calendar, campaigns and social in a single shell' },
  { icon: StickerAI, big: 'AI drafts', label: 'Every reply grounded in your listings — you approve, it sends' },
  { icon: StickerGrowth, big: 'Growth loops', label: 'Social system feeds leads into the same pipeline you close from' },
  { icon: StickerBell, big: 'Live alerts', label: 'Every lead, task and approval lands in one real-time activity feed' },
];

const PROBLEMS = [
  { icon: StickerBroken, title: 'Leads rot in spreadsheets', body: 'Enquiries land in WhatsApp, portals and DMs — then vanish in messy sheets nobody checks twice. One lost follow-up is one lost deal.' },
  { icon: StickerClock, title: 'Follow-up eats your day', body: 'Typing every reply, chasing every viewing, remembering every callback. Chair-time you will never get back.' },
  { icon: StickerBroken, title: 'Hot leads go cold silently', body: 'No alert when a deal stalls, no nudge when a viewing is overdue. You find out after it is already lost to a faster agent.' },
];

const FEATURES = [
  { icon: StickerOS, title: 'Lead OS + scoring', body: 'One CRM for every source: WhatsApp, portals, Instagram, your website form. Every lead scored and staged automatically.' },
  { icon: StickerAI, title: 'AI conversation engine', body: 'Drafts replies grounded in your actual listings. You approve, it sends. Nothing goes out without you.' },
  { icon: StickerGrowth, title: 'Social Growth system', body: 'A 16-part specialist module: profile SEO, content pillars, weekly series, DM funnels, hook and hashtag libraries.' },
  { icon: StickerClock, title: 'Follow-up automation', body: 'Workflows watch your pipeline: new lead gets a first-touch task, a qualified lead gets viewing slots, a won deal gets the referral ask.' },
  { icon: StickerBell, title: 'Real-time activity + alerts', body: 'Every message, task and approval recorded in one feed. Nothing slips between agents.' },
  { icon: StickerBroken, title: 'Reports + full backup', body: 'Funnel and source analytics, CSV export, one-click JSON backup of your whole workspace.' },
];

// workflow preview — the real module chain, no mockups claimed
const WORKFLOW = [
  { step: '1', title: 'Capture', body: 'Public form, WhatsApp click-to-chat and portal leads flow into one CRM inbox, scored on arrival.' },
  { step: '2', title: 'Draft', body: 'Garu reads the lead context and your listings, then proposes the reply. One click to approve and send.' },
  { step: '3', title: 'Convert', body: 'Viewings booked on the shared calendar, tasks assigned automatically, outcomes logged to reports.' },
  { step: '4', title: 'Grow', body: 'The social module turns your wins into weekly content series that feed fresh leads back into step one.' },
];

export default async function Landing() {
  const ctx = await getCtx();
  if (ctx) redirect('/dashboard'); // customers go straight to work

  return (
    <div className="min-h-screen">
      <MascotBehaviors />
      <MascotCompanion />

      {/* ── glass sticky navbar ── */}
      <header className="glass-bar sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto flex items-center gap-2 px-6 py-3">
          <Link href="/" className="flex items-center gap-2 mr-4">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg,#0A5C36,#00E699)' }}>G</span>
            <span className="display font-bold text-lg text-slate-900">Growth OS</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <a href="#product" className="pill">Product</a>
            <a href="#workflow" className="pill">Workflow</a>
            <a href="#features" className="pill">Features</a>
            <a href="#pricing" className="pill">Pricing</a>
          </div>
          <div className="flex-1"></div>
          <Link href="/login" className="btn-ghost !py-1.5">Sign in</Link>
          <Link href="/signup" className="btn-gold !py-1.5">Get started</Link>
        </nav>
      </header>

      {/* ── HERO — Mascot #1 anchored on top-right border of the preview card ── */}
      <section id="heroAnchor" className="max-w-6xl mx-auto px-6 pt-16 pb-8 md:pt-24">
        <div className="grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 lg:col-span-7">
            <div className="inline-flex items-center gap-2 glass-bar rounded-full px-3 py-1 mb-6" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              <span className="mint-dot w-2 h-2"></span>
              <span className="text-xs font-semibold text-slate-600">Real software — try the live demo, no login</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
              The AI Growth Operating System for real estate agents
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-xl">
              Capture every lead, follow up in minutes with AI drafts you approve, and grow your socials with a specialist system. One workspace — no fake buttons.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="btn-gold !px-6 !py-3 !text-base">Start your workspace</Link>
              <form action={demoLoginAction}><button className="btn-mint !px-6 !py-3 !text-base">▶ Try the live demo</button></form>
            </div>
            <p className="text-xs text-slate-500 mt-4">Works without any API keys · WhatsApp click-to-chat built in · Cancel anytime</p>
          </div>
          <div className="col-span-12 lg:col-span-5 relative mt-10 lg:mt-0">
            <div className="hero-shell glass-card-3d rounded-[28px] h-80 flex items-end justify-center overflow-visible">
              <div className="text-center pb-2">
                <div className="display font-bold text-2xl text-slate-900">Garu</div>
                <div className="text-xs text-slate-500">your workspace assistant</div>
              </div>
              <div className="hero-mascot mascot-interactive"><GaruHero size={230} /></div>
              {/* floating glass badges — 15% edge overlap */}
              <div className="hero-badge hero-badge-1 float-badge"><span className="mint-dot inline-block w-1.5 h-1.5 mr-1.5"></span>AI drafts, human approved</div>
              <div className="hero-badge hero-badge-2 float-badge" style={{ animationDelay: '1.2s' }}>Social Growth built in</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY METRICS STRIP — 4 glass cards with 3D stickers ── */}
      <section id="product" className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-6">
          {METRICS.map((m, i) => (
            <div key={i} className="col-span-12 sm:col-span-6 xl:col-span-3 glass-card-3d rounded-[20px] relative overflow-visible">
              <div className="feature-sticker sticker-3d"><m.icon size={84} /></div>
              <div style={{ padding: '28px', paddingTop: '46px' }}>
                <div className="display text-2xl font-extrabold text-slate-900">{m.big}</div>
                <p className="text-sm mt-1">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEMS — Mascot #2 sweeping away paperwork in negative space ── */}
      <section id="problemAnchor" className="max-w-6xl mx-auto px-6 py-24">
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">The manual way is costing you deals</h2>
          <p className="text-lg mb-10 max-w-2xl">Agents do not lose to better listings. They lose to slower follow-up and scattered systems.</p>
          <div className="sweep-slot hidden md:block"><GaruSweep size={170} className="mascot-interactive" /></div>
          <div className="grid grid-cols-12 gap-6 mt-4">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="col-span-12 md:col-span-4 card relative overflow-visible">
                <div className="feature-sticker sticker-3d"><p.icon size={86} /></div>
                <div style={{ padding: '28px', paddingTop: '48px' }}>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{p.title}</h3>
                  <p className="text-sm">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE WORKFLOW PREVIEW — Mascot #3 juggling the ecosystem ── */}
      <section id="workflowAnchor" className="max-w-6xl mx-auto px-6 py-24">
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">From enquiry to viewing to closing loop</h2>
          <p className="text-lg mb-10 max-w-2xl">Four steps, one system — every one of them is running in the live product right now.</p>
          <div className="sweep-slot hidden md:block" style={{ right: '2%' }}><GaruJuggle size={190} className="mascot-interactive" /></div>
          <div className="grid grid-cols-12 gap-6 mt-4">
            {WORKFLOW.map((w, i) => (
              <div key={i} className="col-span-12 md:col-span-6 xl:col-span-3 card relative overflow-visible">
                <div className="display font-extrabold text-4xl absolute" style={{ top: '18px', left: '24px', color: 'var(--mint)' }}>{w.step}</div>
                <div style={{ padding: '28px', paddingTop: '64px' }}>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{w.title}</h3>
                  <p className="text-sm">{w.body}</p>
                </div>
              </div>
            ))}
          </div>
          {/* floating golden bell notification badges over the preview */}
          <div className="hero-badge hero-badge-1 float-badge !left-auto" style={{ left: '72%', bottom: '-14px', top: 'auto' }}>
            <span className="inline-block align-middle mr-2"><StickerBell size={30} /></span>viewing booked — task created
          </div>
          <div className="hero-badge hero-badge-2 float-badge" style={{ bottom: '-20px', right: '30%', top: 'auto', animationDelay: '1.6s' }}>
            <span className="mint-dot inline-block w-1.5 h-1.5 mr-1.5"></span>new lead scored 84
          </div>
        </div>
      </section>

      {/* ── FEATURES — 1 micro-sticker per card ── */}
      <section id="featureAnchor" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">One system. Six engines.</h2>
        <p className="text-lg mb-10 max-w-2xl">Everything below is running in the live product right now — log into the demo and check.</p>
        <div className="grid grid-cols-12 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="col-span-12 md:col-span-6 xl:col-span-4 card relative overflow-visible">
              <div className="feature-sticker sticker-3d"><f.icon size={86} /></div>
              <div style={{ padding: '28px', paddingTop: '44px' }}>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING — identical copy to /billing ── */}
      <section id="pricingAnchor" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Simple retainers. No lock-in.</h2>
        <p className="text-lg mb-10 max-w-2xl">Done-for-you growth packages, powered by the same OS you see in the demo. Paid monthly, cancel anytime.</p>
        <div className="grid grid-cols-12 gap-6">
          {PLANS.map((p) => (
            <div key={p.key} className={`col-span-12 md:col-span-4 glass-card-3d rounded-[20px] relative ${p.featured ? 'md:-translate-y-3' : ''}`} style={p.featured ? { border: '1px solid rgba(0,230,153,0.35)' } : {}}>
              {p.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 btn-mint !py-1 !px-3 !text-xs">Most chosen</span>}
              <div style={{ padding: '28px' }}>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{p.tag}</div>
                <h3 className="display font-extrabold text-2xl text-slate-900 mt-1">{p.name}</h3>
                <div className="display text-3xl font-extrabold mt-3" style={{ color: 'var(--forest)' }}>{p.price}</div>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {p.items.map((it, j) => <li key={j} className="flex gap-2"><span style={{ color: 'var(--mint)' }}>✓</span>{it}</li>)}
                </ul>
                <Link href="/signup" className={`btn-gold w-full mt-6 ${!p.featured && '!bg-transparent !text-slate-800 hover:!text-white'} `}>{p.featured ? 'Start now' : 'Choose plan'}</Link>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 text-center">Invoiced via Razorpay payment links · monthly · cancel anytime</p>
      </section>

      {/* ── FINAL CTA — Garu peeks from the bar ── */}
      <section className="max-w-6xl mx-auto px-6 pb-28 pt-8">
        <div className="hero-shell relative overflow-visible">
          <div className="glass-card-3d rounded-[28px] !py-14 text-center relative overflow-visible">
            <div className="cta-peek"><GaruPeek size={120} className="mascot-interactive" /></div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Your next 90 days of growth start today</h2>
            <p className="text-lg mb-8">Spin up the demo workspace first — real screens, real data flow, zero signup.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <form action={demoLoginAction}><button className="btn-gold !px-8 !py-3.5 !text-base">▶ Open the live demo</button></form>
              <Link href="/signup" className="btn-ghost !px-8 !py-3.5 !text-base">Create your workspace</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="glass-bar">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">Garuda Growth OS</span>
          <span>·</span>
          <Link href="/legal/terms" className="hover:text-slate-800">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-slate-800">Privacy</Link>
          <Link href="/legal/refund" className="hover:text-slate-800">Refund policy</Link>
          <div className="flex-1"></div>
          <span>Built for real estate agents worldwide · India · UAE</span>
        </div>
      </footer>
    </div>
  );
}
