'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';
import { handleEvent } from '@/server/workflow-engine';
import { createSession, hashPassword, logAudit } from '@/server/auth';

export async function toggleWorkflowAction(fd: FormData) {
  const ctx = await requirePerm('workflows.manage');
  if (!S(fd, 'wfId')) return;
  const wf = await prisma.workflow.findFirst({ where: { id: S(fd, 'wfId')!, orgId: ctx.org.id } });
  if (wf) {
    await prisma.workflow.update({ where: { id: wf.id }, data: { enabled: !wf.enabled } });
    await logAudit(ctx.user.id, ctx.org.id, 'workflow.toggled', wf.name, { enabled: !wf.enabled });
  }
  revalidatePath('/workflows');
}

export async function retryRunAction(fd: FormData) {
  const ctx = await requirePerm('workflows.manage');
  if (!S(fd, 'runId')) return;
  const run = await prisma.workflowRun.findFirst({ where: { id: S(fd, 'runId')!, orgId: ctx.org.id } });
  if (run) {
    const wf = await prisma.workflow.findUnique({ where: { id: run.workflowId } });
    if (wf && run.leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: run.leadId } });
      if (lead) await handleEvent(ctx.org.id, wf.trigger, lead);
    }
  }
  revalidatePath('/workflows');
}

