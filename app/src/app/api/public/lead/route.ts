import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { computeLeadScore } from '@/lib/scoring';

// PUBLIC lead capture: the marketing site form posts here.
// Lands in the "Lead Engine HQ" org so every website inquiry is in the CRM.
// No auth by design — protected by honeypot, field caps and a simple rate limit.

const HITS: Record<string, { n: number; ts: number }> = {};
const WINDOW_MS = 60_000, MAX_PER_MIN = 5;

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*'); // public lead capture only
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}

export async function OPTIONS() { return cors(NextResponse.json({ ok: true })); }

export async function POST(req: Request) {
  // rate limit by IP (best effort, per warm instance)
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const h = HITS[ip] || { n: 0, ts: now };
  if (now - h.ts > WINDOW_MS) { h.n = 0; h.ts = now; }
  h.n++; HITS[ip] = h;
  if (h.n > MAX_PER_MIN) return cors(NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 }));

  let data: any;
  try { data = await req.json(); } catch { return cors(NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 })); }

  // honeypot: bots fill hidden field
  if (data.website) return cors(NextResponse.json({ ok: true })); // silently drop

  // hard type validation: reject objects/arrays/numbers outright, and non-numeric phones
  if (typeof data.name !== 'string' || typeof data.phone !== 'string' ||
      typeof data.need !== 'undefined' && typeof data.need !== 'string' ||
      typeof data.agency !== 'undefined' && typeof data.agency !== 'string') {
    return cors(NextResponse.json({ ok: false, error: 'Invalid submission' }, { status: 400 }));
  }
  const name = data.name.trim().slice(0, 80);
  const phone = data.phone.trim().slice(0, 30);
  const need = (data.need || '').slice(0, 200);
  const agency = (data.agency || '').slice(0, 80);
  if (name.length < 2 || !/^[+0-9][0-9 ()-]{5,29}$/.test(phone)) {
    return cors(NextResponse.json({ ok: false, error: 'Name and WhatsApp number are required' }, { status: 400 }));
  }

  // ensure the HQ org exists (idempotent)
  const org = await prisma.organization.upsert({
    where: { slug: 'lead-engine-hq' },
    update: {},
    create: { name: 'Lead Engine HQ', slug: 'lead-engine-hq', country: 'GLOBAL', currency: 'USD', pkg: 'LEAD_ENGINE' }
  });

  const { score } = computeLeadScore({ name, phone, source: 'WEBSITE', createdAt: new Date() } as any);
  const lead = await prisma.lead.create({
    data: {
      orgId: org.id,
      name, phone,
      email: null,
      source: 'WEBSITE',
      stage: 'NEW', score,
      // consent: the person filled the contact form asking us to reply
      consent: 'IMPLIED'
    } as any
  });
  // the inquiry as the first note on the lead
  const adminNote = await prisma.user.findFirst({ where: { isPlatformAdmin: true }, select: { id: true } });
  await prisma.note.create({ data: { leadId: lead.id, authorId: adminNote?.id || lead.id, body: (agency ? `Agency: ${agency}. ` : '') + `Needs: ${need}` } });
  await prisma.activity.create({
    data: { orgId: org.id, type: 'LEAD_CREATED', entity: 'lead', entityId: lead.id, meta: JSON.stringify({ source: 'WEBSITE', name, agency: agency || null }) } as any
  });
  return cors(NextResponse.json({ ok: true, id: lead.id }));
}
