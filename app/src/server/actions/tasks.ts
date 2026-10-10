'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';


export async function completeTaskAction(fd: FormData) {
  const ctx = await requirePerm('tasks.write');
  if (!S(fd, 'taskId')) return;
  await prisma.task.updateMany({ where: { id: S(fd, 'taskId')!, orgId: ctx.org.id }, data: { status: 'DONE', doneAt: new Date() } });
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
}

export async function createTaskAction(fd: FormData) {
  const ctx = await requirePerm('tasks.write');
  if (!S(fd, 'title')) return;
  await prisma.task.create({
    data: {
      orgId: ctx.org.id, title: S(fd, 'title')!, kind: S(fd, 'kind') || 'FOLLOWUP',
      leadId: S(fd, 'leadId'),
      dueAt: new Date(S(fd, 'dueAt') || Date.now() + 86400000), assigneeId: ctx.user.id
    }
  });
  revalidatePath('/tasks');
}

