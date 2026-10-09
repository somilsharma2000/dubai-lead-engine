import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import { requirePerm } from '@/auth';
import { computeLeadScore } from '@/score';
import { handleEvent } from '@/workflow';

// Clearly-labelled demo data so a new team can see the product working.
// Names carry the "Demo" prefix. Delete with one button on the dashboard.
export async function POST() {
  try {
    const ctx = await requirePerm('leads.write');
    const demo = [
      { name: 'Demo — Aisha Khan', phone: '+971500000001', source: 'INSTAGRAM', city: 'Dubai', country: 'AE', intent: 'BUY', propertyType: 'Apartment', budgetMax: 450000, consent: 'GRANTED', stage: 'QUALIFIED' },
      { name: 'Demo — Raj Mehta', phone: '+919800000001', source: 'WHATSAPP', city: 'Mumbai', country: 'IN', intent: 'BUY', propertyType: 'Apartment', budgetMax: 220000, consent: 'GRANTED', stage: 'CONTACTED' },
      { name: 'Demo — Sarah Smith', phone: '+447700000001', source: 'PORTAL', city: 'Dubai', country: 'AE', intent: 'RENT', propertyType: 'Villa', budgetMax: 90000, consent: 'UNKNOWN', stage: 'NEW' },
      { name: 'Demo — Omar Ali', phone: '+971500000002', source: 'REFERRAL', city: 'Abu Dhabi', country: 'AE', intent: 'BUY', propertyType: 'Villa', budgetMax: 1200000, consent: 'GRANTED', stage: 'VIEWING' },
      { name: 'Demo — Priya Nair', phone: '+919800000002', source: 'WEBSITE', city: 'Gurgaon', country: 'IN', intent: 'BUY', propertyType: 'Apartment', budgetMax: 150000, consent: 'DENIED', stage: 'NEW' }
    ];
    for (const d of demo) {
      const { score } = computeLeadScore({ ...d, createdAt: new Date() });
      const lead = await prisma.lead.create({ data: { ...d, score, orgId: ctx.org.id } });
      if (d.stage === 'QUALIFIED' || d.stage === 'VIEWING') await handleEvent(ctx.org.id, 'LEAD_STAGE_CHANGED', lead);
    }
    await prisma.property.createMany({ data: [
      { orgId: ctx.org.id, title: 'Demo — Marina 2BR, sea view', intent: 'SALE', type: 'APARTMENT', price: 420000, bedrooms: 2, bathrooms: 2, area: 'Dubai Marina', city: 'Dubai' },
      { orgId: ctx.org.id, title: 'Demo — JVC 1BR, high floor', intent: 'SALE', type: 'APARTMENT', price: 190000, bedrooms: 1, bathrooms: 1, area: 'JVC', city: 'Dubai' },
      { orgId: ctx.org.id, title: 'Demo — Gurgaon 3BH new launch', intent: 'SALE', type: 'APARTMENT', price: 160000, bedrooms: 3, bathrooms: 3, area: 'Sector 82', city: 'Gurgaon' }
    ]});
    await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'demo.loaded', entity: 'Organization', entityId: ctx.org.id, meta: JSON.stringify({ note: 'Demo data — not real leads' }) } });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 403 }); }
}
