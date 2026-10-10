// SOCIAL GROWTH LIBRARY — the specialist's knowledge base, seeded per workspace.
// Key-based idempotent seeding: new library items automatically appear for existing orgs.
import { prisma } from '@/db';

type Row = { key: string; title: string; detail?: string; meta?: object; sortOrder?: number };

const CHECKLIST: Row[] = [
  { key: 'ig-name-seo', title: 'Name field = searchable keywords', detail: 'Set the Instagram NAME field (not @handle) to "[City] Realtor • [Agency]" — Instagram search matches this field. E.g. "Dubai Hills Realtor • Emaar Partner".', sortOrder: 1 },
  { key: 'ig-bio', title: 'Bio follows the 4-line formula', detail: 'Line 1: who you help + where. Line 2: proof (deals, years, awards). Line 3: what they get by DMing (listings, valuations, alerts). Line 4: CTA + location. Keep the first line keyword-heavy.', sortOrder: 2 },
  { key: 'ig-category', title: 'Category tag + contact buttons on', detail: 'Professional account, category "Real Estate Agent", enable Email + Phone buttons and Action buttons (Book now / Send message).', sortOrder: 3 },
  { key: 'ig-highlights', title: '6 Highlights with branded covers', detail: 'Listings, Sold/Testimonials, Buyer FAQ, Seller FAQ, About me, Free valuation. Keyword-named ("Dubai Listings" not "My work").', sortOrder: 4 },
  { key: 'ig-linkinbio', title: 'Link-in-bio is a lead page, not a bare link', detail: 'Link to a valuation request, top listings page, or WhatsApp chat — never just a homepage.', sortOrder: 5 },
  { key: 'ig-photo-grid', title: 'Profile photo = face, professional, consistent', detail: 'Face photos get 2-3x more profile visits than logos. Same photo across all platforms.', sortOrder: 6 },
  { key: 'gbp', title: 'Google Business Profile claimed + optimized', detail: 'Category "Real estate agent", service areas, photos weekly, review replies, 2-3 posts/week. GBP owns the "realtor near me" map pack.', sortOrder: 7 },
  { key: 'gbp-reviews', title: 'GBP review generation engine running', detail: 'Ask every closed client same-day ("Could you share your experience on Google?"). Reply to 100% of reviews. Map-pack ranking rides on review velocity.', sortOrder: 8 },
  { key: 'fb-page', title: 'Facebook Page synced', detail: 'Same branding, reviews imported, WhatsApp button on. FB still owns 35-55+ demographics in most markets.', sortOrder: 9 },
  { key: 'li-profile', title: 'LinkedIn profile for B2B/investor deals', detail: 'Headline: "Helping [investor type] buy in [market] | [proof]". Commercial and investor clients check LinkedIn first.', sortOrder: 10 },
  { key: 'tt-profile', title: 'TikTok profile pinned + commercial audio', detail: 'Pin the 3 best-performing tours. Use Commercial Music Library audio (personal tracks risk takedowns on business accounts).', sortOrder: 11 },
  { key: 'yt-channel', title: 'YouTube channel banner + SEO set', detail: 'Banner: "[City] homes — new tours weekly". Channel keywords = city + neighborhoods. Shorts feed subscribers.', sortOrder: 12 },
  { key: 'ig-alt-text', title: 'Alt text written on every photo post', detail: 'Describe the property for screen readers + Instagram SEO: "Modern 3-bed villa in Dubai Hills with pool at sunset".', sortOrder: 13 },
  { key: 'ig-caption-seo', title: 'Captions front-load keywords (first 125 chars)', detail: 'NLP search matches the caption START: "Dubai Hills 3-bedroom for sale — " before any storytelling.', sortOrder: 14 },
  { key: 'ig-geotag', title: 'Location tags = micro-neighborhood, not just city', detail: 'Tag the community ("Dubai Marina", "Jumeirah Village Circle"), not "Dubai" — micro-locations reach buyers searching that area.', sortOrder: 15 },
  { key: 'ig-collab', title: 'Collab posts with local partners monthly', detail: 'Co-post with mortgage brokers, interior designers, cafes (collab feature shares reach to both audiences).', sortOrder: 16 },
  { key: 'pin-handle', title: 'Handle is short, name-based, consistent', detail: '@name.realestate or @name.homes. Never long agency strings with numbers.', sortOrder: 17 },
  { key: 'grid-first9', title: 'First 9 posts read like a portfolio', detail: 'New visitors see your grid top: mix 3 listing/sold, 3 proof/education, 3 human/BTS.', sortOrder: 18 },
  { key: 'watermark', title: 'Low-opacity watermark on all creative', detail: 'Logo bottom-left at ~20% opacity, inside safe zones — never over faces or price text. Protects regrams, builds brand.', sortOrder: 19 },
  { key: 'ai-disclosure', title: 'AI content disclosed honestly', detail: 'Virtual staging / AI renders: label "Virtually staged" on-image. Honest disclosure builds trust and stays compliant.', sortOrder: 20 },
];

const PILLARS: Row[] = [
  { key: 'p-listings', title: 'Listings & Tours', meta: { weight: 30, color: '#b45309', why: 'Your inventory. Show it constantly — the algorithm and buyers both want it.' }, sortOrder: 1 },
  { key: 'p-proof', title: 'Social Proof', meta: { weight: 20, color: '#15803d', why: 'Solds, testimonials, keys-day photos. Proof closes deals faster than pitch.' }, sortOrder: 2 },
  { key: 'p-education', title: 'Buyer/Seller Education', meta: { weight: 20, color: '#1d4ed8', why: 'Mortgage tips, buying process, area guides — saves/shares drive reach.' }, sortOrder: 3 },
  { key: 'p-local', title: 'Local Authority', meta: { weight: 15, color: '#7c3aed', why: 'Area spotlights, market updates, "what $X buys here" — this is what locals follow you for.' }, sortOrder: 4 },
  { key: 'p-human', title: 'Behind the Scenes', meta: { weight: 15, color: '#db2777', why: 'Client meetings, key handovers, honest takes. People pick people.' }, sortOrder: 5 },
];

const SERIES: Row[] = [
  { key: 's-market-monday', title: 'Market Monday', meta: { day: 'MONDAY', format: 'REEL', hook: '60 seconds on this week\u2019s prices, inventory and rate moves', pillar: 'p-local' }, sortOrder: 1 },
  { key: 's-listing-tuesday', title: 'Listing Breakdown Tuesday', meta: { day: 'TUESDAY', format: 'REEL', hook: 'One unique detail of this property most people miss', pillar: 'p-listings' }, sortOrder: 2 },
  { key: 's-spotlight-wednesday', title: 'Local Spotlight Wednesday', meta: { day: 'WEDNESDAY', format: 'REEL', hook: 'In-person feature: the best coffee shop in [area]', pillar: 'p-local' }, sortOrder: 3 },
  { key: 's-tip-thursday', title: 'Buyer/Seller Tip Thursday', meta: { day: 'THURSDAY', format: 'CAROUSEL', hook: 'The myth about buying that costs people thousands', pillar: 'p-education' }, sortOrder: 4 },
  { key: 's-feature-friday', title: 'Feature Friday', meta: { day: 'FRIDAY', format: 'REEL', hook: 'The amenity that sold this house before the open house', pillar: 'p-listings' }, sortOrder: 5 },
  { key: 's-sold-saturday', title: 'Sold Saturday', meta: { day: 'SATURDAY', format: 'CAROUSEL', hook: 'How we solved the hardest part of this sale', pillar: 'p-proof' }, sortOrder: 6 },
  { key: 's-open-sunday', title: 'Open House Sunday Preview', meta: { day: 'SUNDAY', format: 'REEL', hook: 'Doors open today — parking, timing, what to expect inside', pillar: 'p-listings' }, sortOrder: 7 },
  { key: 's-neighborhood', title: 'Neighborhood Showdown', meta: { day: 'WEDNESDAY', format: 'CAROUSEL', hook: 'Living in [A] vs [B]: prices, schools, commute — who wins?', pillar: 'p-local' }, sortOrder: 8 },
  { key: 's-what-x-buys', title: 'What $X Gets You', meta: { day: 'THURSDAY', format: 'REEL', hook: 'Same budget, three neighborhoods — wait for the third one', pillar: 'p-local' }, sortOrder: 9 },
  { key: 's-jargon', title: 'Real Estate Jargon Buster', meta: { day: 'MONDAY', format: 'REEL', hook: 'The contract term every buyer pretends to understand', pillar: 'p-education' }, sortOrder: 10 },
  { key: 's-fixer', title: 'Fixer-Upper vs Turnkey', meta: { day: 'TUESDAY', format: 'CAROUSEL', hook: 'Renovate this one, or buy that one done — the math', pillar: 'p-education' }, sortOrder: 11 },
  { key: 's-ama', title: 'Weekly AMA', meta: { day: 'FRIDAY', format: 'STORY+REEL', hook: 'You asked, I answered — this week\u2019s real questions', pillar: 'p-human' }, sortOrder: 12 },
];

const HASHTAGS: Row[] = [
  { key: 'h-local', title: 'Local set (rotate weekly)', meta: { tags: '#dubairealestate #dubaiproperty #dubaihomes #dubaihills #emaar #dubaimarina' }, detail: 'Swap the neighborhood/developer tags per listing location. Local tags pull local buyers.', sortOrder: 1 },
  { key: 'h-intent', title: 'Buyer-intent set', meta: { tags: '#dubaipropertiesforsale #apartmentsforsale #offplan #investmentproperty #propertyinvestment' }, detail: 'Tags buyers search when ready. Use on listings and tours.', sortOrder: 2 },
  { key: 'h-authority', title: 'Authority/education set', meta: { tags: '#realestatetips #firsttimehomebuyer #homebuyingtips #mortgagetips #realestateagent' }, detail: 'Use on education and Q&A posts.', sortOrder: 3 },
  { key: 'h-note', title: '2026 hashtag rules', meta: { tags: '' }, detail: '3-8 specific beats 30 broad. Avoid banned/spammy tags. Rotate between 5 banks so you never repeat the same set twice in a row. Saves/shares rank you more than hashtags do.', sortOrder: 4 },
];

const KPIS: Row[] = [
  { key: 'k-reach', title: 'Weekly reach (not followers)', detail: 'Reach = how many people saw you. Followers are vanity; reach is the game.', sortOrder: 1, meta: { target: '+10% weekly' } },
  { key: 'k-dm', title: 'Profile visits → DMs → leads', detail: 'Track: profile visits, DMs started, leads created in the CRM. This is the only funnel that pays.', sortOrder: 2, meta: { target: '5+ DMs/week' } },
  { key: 'k-saves', title: 'Saves + shares per post', detail: 'Shares-per-reach is the strongest 2026 ranking signal. Education posts win here.', sortOrder: 3, meta: { target: '10+ shares/week' } },
  { key: 'k-watch', title: 'Reels: average watch time / 3s retention', detail: 'Algorithm 2026 weighs watch time + sends per reach. If viewers pass 50%, the hook works.', sortOrder: 4, meta: { target: '>50% watch' } },
  { key: 'k-content', title: 'Posting consistency', detail: 'Consistency beats volume: 4-5 posts + daily stories. Track streak.', sortOrder: 5, meta: { target: '5 posts/week' } },
  { key: 'k-gmb', title: 'GBP actions (calls, direction requests)', detail: 'Google Business Profile calls are the hottest local leads there are.', sortOrder: 6, meta: { target: '10+ actions/week' } },
  { key: 'k-cpl', title: 'Cost/lead & lead→viewing conversion', detail: 'Compare lead sources: which platform produces viewings, not just likes?', sortOrder: 7, meta: { target: 'review monthly' } },
  { key: 'k-review', title: 'Weekly review ritual', detail: 'Every Friday: pull the numbers, log them, decide next week from data not mood.', sortOrder: 8, meta: { target: 'every Friday' } },
];

export async function ensureSocialLibrary(orgId: string) {
  const all: { category: string; row: Row }[] = [
    ...CHECKLIST.map(r => ({ category: 'CHECKLIST', row: r })),
    ...PILLARS.map(r => ({ category: 'PILLAR', row: r })),
    ...SERIES.map(r => ({ category: 'SERIES', row: r })),
    ...HASHTAGS.map(r => ({ category: 'HASHTAG', row: r })),
    ...KPIS.map(r => ({ category: 'KPI', row: r })),
  ];
  const existing = await prisma.socialAsset.findMany({ where: { orgId, key: { in: all.map(a => a.row.key) } }, select: { key: true } });
  const have = new Set(existing.map(e => e.key));
  const missing = all.filter(a => !have.has(a.row.key));
  if (missing.length === 0) return;
  await prisma.socialAsset.createMany({ data: missing.map(a => ({
    orgId, category: a.category, key: a.row.key, title: a.row.title,
    detail: a.row.detail || null,
    meta: a.row.meta ? JSON.stringify(a.row.meta) : null,
    sortOrder: a.row.sortOrder || 0,
  })) });
}

export const FORMATS: { name: string; spec: string; bestFor: string }[] = [
  { name: 'Reel (talking)', spec: '15-30s, hook in first 1.5s, captions burned-in, 9:16, fast cuts every 2-3s', bestFor: 'Education, myth-busting, market updates' },
  { name: 'Listing tour reel', spec: '20-45s walkthrough, price on screen, trending (commercial-safe) audio, 9:16', bestFor: 'Listings, open houses' },
  { name: 'Carousel', spec: '6-10 slides, 1080x1350 (4:5), headline per slide, 60-char lines', bestFor: 'Area guides, "what $X buys", sold stories' },
  { name: 'Photo post', spec: '1080x1350 or 4:5 max quality, face or hero shot, alt text always', bestFor: 'Solds, testimonials, personal brand' },
  { name: 'Stories + polls', spec: '3-7 frames/day, poll/quiz on 2nd frame, link/DM CTA last', bestFor: 'Daily presence, DM funnels, urgency' },
  { name: 'Story highlight save', spec: 'Add to keyword-named highlight', bestFor: 'Evergreen FAQs, valuations' },
  { name: 'YouTube Short', spec: 'Reuse the reel, keyword title ("3-bed villa Dubai Hills tour"), 30-58s', bestFor: 'Search traffic on the listing' },
  { name: 'TikTok tour', spec: '30s casual agent walkthrough, commercial audio library', bestFor: 'Top-of-funnel reach, younger buyers' },
  { name: 'LinkedIn post', spec: 'Text-first, 1st person, 2-4 lines + photo, price-per-sqft analysis', bestFor: 'Commercial, investor, B2B deals' },
  { name: 'GBP post', spec: 'Listing photo + "Property for sale in [City]" + link', bestFor: 'Map-pack visibility' },
];

export const HOOKS: { type: string; text: string }[] = [
  { type: 'Location', text: 'Stop scrolling if you\u2019re looking to buy a home in [City] under $[Price]' },
  { type: 'Location', text: 'Thinking about moving to [City] in 2026? Read this before you hire an agent' },
  { type: 'Warning', text: '3 major mistakes home buyers are making in [City] right now' },
  { type: 'Warning', text: 'The secret clause every home seller needs to include in 2026' },
  { type: 'Curiosity', text: 'Inside a $[Price] estate in [Neighborhood] — wait until you see the backyard' },
  { type: 'Curiosity', text: 'What nobody tells you about living in [Neighborhood]' },
  { type: 'Relatable', text: 'Tell me you\u2019re house hunting in [City] without telling me' },
  { type: 'Price', text: 'The price of this [area] apartment dropped today — here\u2019s why' },
  { type: 'Contrast', text: 'Rent for $2,000 or own for $1,800 in the same building — the math' },
  { type: 'List', text: '5 things I\u2019d never do as a realtor in [City] (No. 4 is illegal)' },
  { type: 'Story', text: 'My client almost lost this deal because of one email' },
  { type: 'Direct', text: 'If you\u2019re a first-time buyer in [City], this is your video' },
];

export const CTAS: { name: string; text: string }[] = [
  { name: 'Keyword DM (automation-ready)', text: 'Comment "TOUR" and I\u2019ll DM you the full walkthrough + private floorplan link' },
  { name: 'Off-market tease', text: 'Comment "LIST" for this week\u2019s off-market listings under $[Price]' },
  { name: 'Save', text: 'Save this before you start your house hunt in [City]' },
  { name: 'Share', text: 'Send this to someone who needs to see this kitchen' },
  { name: 'Valuation', text: 'Want to know what your home is worth? Comment "VALUATION"' },
  { name: 'Open house', text: 'Doors open 2-5pm today — DM me for a slot' },
];

export const REPURPOSING: { asset: string; spec: string }[] = [
  { asset: '1. Main reel tour (30-45s)', spec: 'Cinematic walkthrough, trending audio + voiceover' },
  { asset: '2. Kitchen snippet (10s)', spec: '\u201CThe best kitchen in [area]?\u201D loop' },
  { asset: '3. Master suite snippet (10s)', spec: 'Spa bathroom spotlight' },
  { asset: '4. Backyard snippet (10s)', spec: 'Pool/oasis focus' },
  { asset: '5. Photo carousel (7-10 slides)', spec: 'Room-by-room, price slide last' },
  { asset: '6. Story poll (3 frames)', spec: '\u201CGuess the price\u201D, \u201CWhich bedroom?\u201D' },
  { asset: '7. YouTube Short (60s)', spec: 'Fast walkthrough + market context voiceover' },
  { asset: '8. TikTok tour (30s)', spec: 'Casual, unscripted' },
  { asset: '9. LinkedIn post', spec: 'Price-per-sqft + investment analysis for B2B' },
  { asset: '10. GBP post', spec: 'Photo + \u201CProperty for sale in [City]\u201D + link' },
  { asset: '11. Spec-sheet carousel', spec: 'Beds/baths/sqft/service charges slide deck' },
  { asset: '12. WhatsApp broadcast', spec: 'VIP list: \u201Cnew listing before it goes public\u201D' },
];

export const CADENCE: { platform: string; freq: string }[] = [
  { platform: 'Instagram', freq: '4-5 feed posts/week + 3-7 stories daily' },
  { platform: 'TikTok', freq: '1-2 videos/day (reuse reels)' },
  { platform: 'YouTube Shorts', freq: '3-5 shorts/week' },
  { platform: 'LinkedIn', freq: '3 posts/week (carousels + analysis)' },
  { platform: 'Google Business Profile', freq: '2-3 posts/week' },
];

export const COMPLIANCE: { region: string; rule: string }[] = [
  { region: 'Dubai / UAE', rule: 'RERA + DLD: every ad needs the permit QR from the DLD Trakheesi system. Fines for unpermitted property ads. Always show the permit number on listing creative.' },
  { region: 'India', rule: 'RERA: display your RERA registration number on all promotional material. NRI festive-season campaigns (Diwali, Akshaya Tritiya) are the big windows.' },
  { region: 'US', rule: 'Fair Housing Act: never target or exclude protected classes. Avoid steering language (\u201Cperfect for families\u201D, \u201Csafe neighborhood\u201D). Use the trained compliant phrasing.' },
  { region: 'UK', rule: 'Consumer Protection Regulations: material information (council tax, tenure, service charges) must be in listings; EPC rating shown.' },
  { region: 'Australia', rule: 'REA/Domain listing rules + state agency act license numbers on advertising. Auction content performs live on auction day.' },
];

export const DM_SCRIPTS: { name: string; text: string }[] = [
  { name: 'Valuation funnel (comment VALUATION)', text: 'Auto: "Hey! Thanks for commenting VALUATION \uD83D\uDC9B Want a free, no-pressure price estimate for your home? Just reply with the area." → in CRM as lead, source INSTAGRAM.' },
  { name: 'Listing price funnel (comment PRICE)', text: 'Auto: "Hi! Here is the price + floor plan for [listing]. Want me to set up a viewing this week? I have slots Thu/Sat." → lead + viewing attempt.' },
  { name: 'Story reply catcher', text: 'Post poll "Want to see more listings like this?" → everyone who votes YES gets a DM with the top 3 + "which one should I send first?"' },
  { name: 'Open house reminder', text: '"Doors open 2-5pm today — want me to hold a slot so you skip the queue?"' },
  { name: 'Cold lead re-opener (30 days quiet)', text: '"Saw a new listing that fits what you described — want me to send it before I post it publicly?"' },
];

export const ROUTINE: string[] = [
  'Minute 0-10 — engage BEFORE posting: comment on 10 local accounts (movers, cafes, gyms, community pages) as your profile. Genuine comments, not emojis.',
  'Minute 10-15 — reply to every DM and comment from the last 24h. Reply speed is a ranking signal and a trust signal.',
  'Minute 15-20 — post today\u2019s content (reel/story), then reply to every comment in the first 30 minutes (early engagement decides reach).',
  'Minute 20-30 — story polls/quiz to start DM conversations (the funnel). Log new leads into the CRM with source INSTAGRAM.',
];

// --- Rule-based reel script builder (no external AI needed) ---
export function buildScript(opts: { topic: string; pillar?: string; format?: string; hookType?: string; city?: string }): { hook: string; body: string[]; cta: string; caption: string } {
  const topic = opts.topic.trim() || 'a new listing';
  const city = (opts.city || '').trim() || '[City]';
  const hooks = HOOKS.filter(h => !opts.hookType || h.type === opts.hookType);
  const hook = (hooks[Math.floor(Math.random() * hooks.length)]?.text || HOOKS[0].text)
    .replace(/\[City\]/g, city).replace(/\[Neighborhood\]/g, city);
  const pillarMap: Record<string, string[]> = {
    'p-listings': ['Open on the hero shot — the exact frame that made you stop', 'Walk the flow: entry → living → kitchen → the payoff room', 'Put the price on screen in the first 5 seconds', 'One line of honesty: "the one thing I\u2019d change is…"'],
    'p-proof': ['Start with the client\u2019s problem in their words', 'Show the moment (keys, boardroom, signature)', 'Give the number: days on market, over/under ask', 'End on the client\u2019s one-line review on screen'],
    'p-education': ['Name the myth in frame 1', 'Explain it like a friend, zero jargon', 'Show one real example or number', 'Give the "so what" for the viewer\u2019s situation'],
    'p-local': ['Open on the street/area establishing shot', 'Three facts: prices, commute, the vibe', 'One hidden gem most people miss', 'Compare it to the neighboring area in one line'],
    'p-human': ['Open mid-action (walking in, coffee in hand)', 'Say the honest thing about the day', 'One behind-the-scenes detail viewers never see', 'Invite: "ask me anything below"'],
  };
  const body = pillarMap[opts.pillar || 'p-listings'] || pillarMap['p-listings'];
  const cta = CTAS[Math.floor(Math.random() * 3)].text.replace(/\[City\]/g, city);
  const caption = `${city} real estate · ${topic} — ${hook.slice(0, 90)}… ${cta}`;
  return { hook, body, cta, caption };
}
