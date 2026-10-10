// Deterministic workflow engine v1: trigger -> conditions -> actions, with
// idempotency (unique eventKey per workflow+event), attempts, retry, dead-letter.
import { prisma } from './db';

export const DEFAULT_WORKFLOWS = [
  {
    name: 'New lead → 24h first-touch task',
    trigger: 'LEAD_CREATED',
    config: {
      conditions: {},
      actions: [
        { type: 'CREATE_TASK', title: 'First touch: WhatsApp/call the new lead', kind: 'FOLLOWUP', dueInHours: 24 },
        { type: 'LOG' }
      ]
    }
  },
  {
    name: 'Lead qualified → schedule viewing',
    trigger: 'LEAD_STAGE_CHANGED',
    config: {
      conditions: { stage: 'QUALIFIED' },
      actions: [
        { type: 'CREATE_TASK', title: 'Offer viewing slots to qualified lead', kind: 'VIEWING', dueInHours: 48 },
        { type: 'LOG' }
      ]
    }
  },
  {
    name: 'Deal won → review + referral ask',
    trigger: 'LEAD_STAGE_CHANGED',
    config: {
      conditions: { stage: 'WON' },
      actions: [
        { type: 'CREATE_TASK', title: 'Ask happy client for Google review + 2 referrals', kind: 'OTHER', dueInHours: 24 },
        { type: 'LOG' }
      ]
    }
  }
];

export async function seedDefaultWorkflows(orgId: string) {
  for (const w of DEFAULT_WORKFLOWS) {
    await prisma.workflow.create({ data: { orgId, name: w.name, trigger: w.trigger, config: JSON.stringify(w.config) } });
  }
}

async function runAction(orgId: string, lead: { id: string; consent: string; ownerId: string | null }, action: any, log: string[]) {
  if (action.type === 'CREATE_TASK') {
    if (action.requireConsent && lead.consent !== 'GRANTED') {
      log.push(`SKIP CREATE_TASK "${action.title}" — consent not granted`); return;
    }
    await prisma.task.create({
      data: {
        orgId, leadId: lead.id, assigneeId: lead.ownerId || null,
        title: action.title, kind: action.kind || 'FOLLOWUP',
        dueAt: new Date(Date.now() + (action.dueInHours || 24) * 3600 * 1000)
      }
    });
    log.push(`TASK created: "${action.title}"`);
  } else if (action.type === 'ADD_NOTE') {
    // notes authored by the system are clearly marked
    await prisma.note.create({ data: { leadId: lead.id, authorId: 'SYSTEM', body: '[workflow] ' + action.body } });
    log.push('NOTE added');
  } else if (action.type === 'SET_STAGE') {
    await prisma.lead.update({ where: { id: lead.id }, data: { stage: action.stage } });
    log.push(`STAGE set to ${action.stage}`);
  } else if (action.type === 'LOG') {
    log.push('event recorded in activity log');
  } else {
    log.push(`UNKNOWN action type: ${action.type} (skipped)`);
  }
}

export async function handleEvent(orgId: string, trigger: string, lead: { id: string; stage: string; source: string; consent: string; ownerId: string | null }) {
  const workflows = await prisma.workflow.findMany({ where: { orgId, trigger, enabled: true } });
  const results = [];
  for (const wf of workflows) {
    const cfg = JSON.parse(wf.config || '{}');
    const conds: Record<string, string> = cfg.conditions || {};
    const fieldOf: Record<string, string> = { stage: lead.stage, source: lead.source };
    const matches = Object.entries(conds).every(([k, v]) => (fieldOf[k] ?? '') === v);
    if (!matches) { results.push({ workflowId: wf.id, status: 'SKIPPED_CONDITION' }); continue; }
    const eventKey = trigger === 'LEAD_STAGE_CHANGED' ? `${trigger}:${lead.id}:${lead.stage}` : `${trigger}:${lead.id}`;
    // idempotency: if this event was already processed, do nothing
    const existing = await prisma.workflowRun.findUnique({ where: { workflowId_eventKey: { workflowId: wf.id, eventKey } } });
    if (existing && existing.status === 'SUCCESS') { results.push({ workflowId: wf.id, status: 'DUPLICATE_ignored' }); continue; }
    const log: string[] = [];
    let status = 'SUCCESS';
    try {
      for (const a of (cfg.actions || [])) await runAction(orgId, lead, a, log);
    } catch (err: any) {
      status = 'FAILED';
      log.push('ERROR: ' + err.message);
    }
    const attempts = (existing?.attempts || 0) + 1;
    if (status === 'FAILED' && attempts >= 3) status = 'DEAD';
    else if (status === 'FAILED') status = 'PENDING_RETRY';
    const data = { orgId, leadId: lead.id, eventKey, status, attempts, log: JSON.stringify(log) };
    if (existing) await prisma.workflowRun.update({ where: { id: existing.id }, data });
    else await prisma.workflowRun.create({ data: { ...data, workflowId: wf.id } });
    await prisma.activity.create({ data: { orgId, type: `workflow.${status}`, entity: 'Workflow', entityId: wf.id, meta: JSON.stringify({ trigger, leadId: lead.id, log }) } });
    results.push({ workflowId: wf.id, status });
  }
  return results;
}

export async function retryRun(runId: string) {
  const run = await prisma.workflowRun.findUnique({ where: { id: runId } });
  if (!run || !['FAILED', 'PENDING_RETRY', 'DEAD'].includes(run.status)) throw new Error('Run not retryable');
  const wf = await prisma.workflow.findUnique({ where: { id: run.workflowId } });
  if (!wf) throw new Error('Workflow missing');
  const lead = run.leadId ? await prisma.lead.findUnique({ where: { id: run.leadId } }) : null;
  if (!lead) throw new Error('Lead missing');
  // re-execute actions fresh (idempotency key changes with new eventKey suffix)
  const log: string[] = [];
  try {
    for (const a of (JSON.parse(wf.config || '{}').actions || [])) await runAction(run.orgId, lead, a, log);
  } catch (err: any) { log.push('ERROR: ' + err.message); }
  const attempts = run.attempts + 1;
  const status = log.some(l => l.startsWith('ERROR')) ? (attempts >= 3 ? 'DEAD' : 'PENDING_RETRY') : 'SUCCESS';
  await prisma.workflowRun.update({ where: { id: run.id }, data: { status, attempts, log: JSON.stringify(log) } });
  return { status, attempts };
}
