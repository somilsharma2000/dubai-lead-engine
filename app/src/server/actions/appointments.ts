'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';


export async function createAppointmentAction(fd: FormData) {
  const ctx = await requirePerm('calendar.write');
  if (!S(fd, 'startsAt') || isNaN(new Date(S(fd, 'startsAt') as any).getTime())) redirect('/calendar?error=date');
  const leadId = S(fd, 'leadId');
  const propertyId = S(fd, 'propertyId');
  const startsAt = new Date(S(fd, 'startsAt')!);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
  // conflict detection: same agent overlapping slot
  const conflict = await prisma.appointment.findFirst({
    where: { orgId: ctx.org.id, agentId: ctx.user.id, status: { in: ['REQUESTED', 'CONFIRMED'] }, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } }
  });
  if (conflict) { redirect('/calendar?error=conflict'); }
  await prisma.appointment.create({ data: { orgId: ctx.org.id, leadId, propertyId, agentId: ctx.user.id, startsAt, endsAt, status: 'REQUESTED', notes: S(fd, 'notes') } });
  await prisma.activity.create({ data: { orgId: ctx.org.id, userId: ctx.user.id, type: 'appointment.requested', entity: 'Appointment', meta: JSON.stringify({ startsAt }) } });
  revalidatePath('/calendar');
}

export async function setAppointmentStatusAction(fd: FormData) {
  const ctx = await requirePerm('calendar.write');
  if (!S(fd, 'aptId') || !S(fd, 'status')) return;
  await prisma.appointment.updateMany({ where: { id: S(fd, 'aptId')!, orgId: ctx.org.id }, data: { status: S(fd, 'status')! } });
  revalidatePath('/calendar');
}

