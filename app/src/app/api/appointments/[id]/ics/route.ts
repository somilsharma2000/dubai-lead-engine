import { NextResponse } from 'next/server';
import { requirePerm } from '@/server/auth';
import { prisma } from '@/server/db';

function icsDate(d: Date) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }

export async function GET(req: Request, { params }: { params: { id: string } }) {
  let ctx;
  try {
    ctx = await requirePerm('calendar.read');
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const apt = await prisma.appointment.findFirst({
    where: { id: params.id, orgId: ctx.org.id },
    include: { lead: true }
  });
  if (!apt) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const prop = apt.propertyId ? await prisma.property.findFirst({ where: { id: apt.propertyId, orgId: ctx.org.id }, select: { title: true } }) : null;
  const summary = `Property viewing — ${prop?.title || 'Viewing'}${apt.lead ? ` (${apt.lead.name})` : ''}`;
  const desc = [apt.notes, apt.lead?.phone ? `Lead: ${apt.lead.name} ${apt.lead.phone}` : '', `Status: ${apt.status}`].filter(Boolean).join('\\n');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LeadEngine//Viewings//EN', 'BEGIN:VEVENT',
    `UID:${apt.id}@leadengine`, `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(apt.startsAt)}`, `DTEND:${icsDate(apt.endsAt)}`,
    `SUMMARY:${summary}`, `DESCRIPTION:${desc.replace(/\n/g, '\\n')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  return new NextResponse(ics, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="viewing-${apt.id}.ics"` } });
}
