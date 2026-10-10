// GARU'S BRAIN — the in-app assistant. Reads the real workspace data and gives
// prioritized suggestions, tips and answers. Rule-based always works; an AI key
// (AI_API_KEY) upgrades free-form answers automatically.
import { prisma } from '@/db';
import { llmDraft, aiConfigured } from '@/lib/ai';

export type GaruTip = { text: string; href?: string; level: 'urgent' | 'good' | 'info' };

export async function garuInsights(orgId: string): Promise<GaruTip[]> {
  const now = new Date();
  const d1 = new Date(now.getTime() - 864e5), d5 = new Date(now.getTime() - 5 * 864e5), d7 = new Date(now.getTime() - 7 * 864e5);
  const [pendingDrafts, overdueTasks, todaysViewings, openTasks, staleLeads, unknownConsent, campaignsWeek, wonCount, lostCount, onbPending, newLeads7, archived] = await Promise.all([
    prisma.message.count({ where: { orgId, status: 'APPROVAL_PENDING' } }),
    prisma.task.count({ where: { orgId, status: 'OPEN', dueAt: { lt: now } } }),
    prisma.appointment.findMany({ where: { orgId, startsAt: { gte: now }, status: { in: ['REQUESTED', 'CONFIRMED'] } }, orderBy: { startsAt: 'asc' }, take: 3, include: { lead: true } }),
    prisma.task.count({ where: { orgId, status: 'OPEN' } }),
    prisma.lead.count({ where: { orgId, archivedAt: null, updatedAt: { lt: d5 }, stage: { in: ['NEW', 'CONTACTED', 'QUALIFIED'] } } }),
    prisma.lead.count({ where: { orgId, consent: 'UNKNOWN', archivedAt: null } }),
    prisma.campaign.count({ where: { orgId, status: 'POSTED', createdAt: { gte: d7 } } }),
    prisma.lead.count({ where: { orgId, stage: 'WON' } }),
    prisma.lead.count({ where: { orgId, stage: 'LOST' } }),
    prisma.onboardingItem.count({ where: { orgId, done: false } }),
    prisma.lead.count({ where: { orgId, createdAt: { gte: d7 }, archivedAt: null } }),
    prisma.lead.count({ where: { orgId, archivedAt: { not: null } } })
  ]);

  const tips: GaruTip[] = [];
  if (overdueTasks > 0) tips.push({ text: `${overdueTasks} task${overdueTasks > 1 ? 's are' : ' is'} overdue. Clear the oldest first — overdue follow-ups kill pipelines.`, href: '/tasks', level: 'urgent' });
  if (pendingDrafts > 0) tips.push({ text: `${pendingDrafts} reply draft${pendingDrafts > 1 ? 's are' : ' is'} waiting for your approval. Leads reply 7x more within the first hour.`, href: '/conversations', level: 'urgent' });
  if (staleLeads > 0) tips.push({ text: `${staleLeads} active lead${staleLeads > 1 ? 's have' : ' has'}n't been touched in 5+ days. Send a follow-up before they go cold.`, href: '/leads', level: 'urgent' });
  if (todaysViewings.length > 0) {
    const next = todaysViewings[0];
    tips.push({ text: `Next viewing: ${next.lead?.name || 'a lead'} at ${next.startsAt.toISOString().slice(11, 16)} UTC — confirm it and add it to your calendar.`, href: '/calendar', level: 'good' });
  } else {
    tips.push({ text: 'No viewings booked. Book one with your warmest qualified lead today — viewings convert 3x better than chats.', href: '/calendar', level: 'good' });
  }
  if (unknownConsent > 0) tips.push({ text: `${unknownConsent} lead${unknownConsent > 1 ? 's' : ''} still have UNKNOWN consent. Ask for permission — consented leads convert better and keep you compliant.`, href: '/leads', level: 'info' });
  if (campaignsWeek === 0) tips.push({ text: 'No campaigns posted this week. One reel or post keeps your pipeline warm — add one to the content calendar.', href: '/campaigns', level: 'info' });
  if (onbPending > 0) tips.push({ text: `Setup is ${onbPending} step${onbPending > 1 ? 's' : ''} from finished. Finish it in Settings to unlock the full engine.`, href: '/settings', level: 'info' });
  const closed = wonCount + lostCount;
  if (closed >= 3) {
    const rate = Math.round(100 * wonCount / closed);
    tips.push({ text: `Your win rate is ${rate}% (${wonCount} won / ${lostCount} lost). ${rate >= 50 ? 'Strong — protect it by following up faster.' : 'Push it up: qualify harder before spending time on weak leads.'}`, href: '/reports', level: 'info' });
  } else if (newLeads7 > 0) {
    tips.push({ text: `${newLeads7} new lead${newLeads7 > 1 ? 's' : ''} this week. First touch within an hour doubles reply rates — message them now.`, href: '/conversations', level: 'good' });
  }
  if (tips.length === 0) tips.push({ text: 'Workspace is clean — no overdue tasks, no stale leads. Spend the quiet hour on outreach or a content campaign.', href: '/campaigns', level: 'info' });
  return tips.slice(0, 6);
}

const RULES: { match: RegExp; answer: string }[] = [
  { match: /whatsapp|send|message|deliver/i, answer: 'Every sent message has an "Open in WhatsApp" one-tap link with the text pre-filled — tap it and press send. Drafts always wait for your approval first. (Find the thread under Conversations.)' },
  { match: /invite|team|member|staff|colleague/i, answer: 'Go to Settings → invite by email: a 7-day activation link appears with WhatsApp/email share buttons. Your teammate opens it and sets their own password — no email setup needed.' },
  { match: /calendar|viewing|appointment|ics|book/i, answer: 'Book viewings under Calendar (conflict detection prevents double-booking). Every viewing has an "Add to Google Calendar" link and a downloadable .ics file for Apple/Outlook.' },
  { match: /bill|pay|razorpay|price|plan|package|upgrade/i, answer: 'Billing shows the three plans (₹79,000 / ₹1,50,000 / ₹2,70,000 monthly). The "Payment link (Razorpay)" button creates a real payment link once Razorpay keys are added. Package switching for testing is instant and free.' },
  { match: /lead|capture|form|website|score/i, answer: 'Leads arrive from the public website form automatically and are scored on budget, intent and source. Create one manually under Leads → New lead. Export everything as CSV anytime.' },
  { match: /task|todo|remind|follow/i, answer: 'Tasks are under Tasks — create follow-ups with due dates, and completed ones move to "Recently completed". Overdue ones turn red on the dashboard.' },
  { match: /campaign|content|reel|post|instagram|tiktok/i, answer: 'Campaigns is your content pipeline: add ideas, move them through stages (IDEA → DRAFTED → SCHEDULED → POSTED), and mark them posted when live. Posted campaigns count in Billing usage.' },
  { match: /workflow|automat|bot|auto/i, answer: 'Workflows are your automation engine (welcome series, viewing reminders, win-back pings). Toggle any workflow on/off on the Workflows page — the same one that created the first-touch task on each new lead.' },
  { match: /report|analytic|win rate|funnel/i, answer: 'Reports breaks down your funnel by stage, source and win rate with a weekly summary you can share with clients. The dashboard shows the live numbers.' },
  { match: /consent|privacy|stop|gdpr|dnd/i, answer: 'Consent is sacred here: leads with DENIED consent can never be messaged — the system blocks it with no exceptions. Leads can opt out; UNKNOWN means ask first.' },
  { match: /password|login|account|security/i, answer: 'Passwords are hashed (bcrypt), sessions are server-side, and every record is scoped to your workspace — clients can never see each other\'s data. Reset a password from the login page.' },
  { match: /property|listing|inventory/i, answer: 'Add your listings under Properties (type, price, bedrooms, area). The reply drafter uses them to match leads to real options in their budget automatically.' }
];

export async function garuAnswer(question: string, orgId: string, orgName: string): Promise<string> {
  const q = question.trim().slice(0, 300);
  if (!q) return 'Ask me anything — WhatsApp, leads, tasks, campaigns, billing…';
  if (aiConfigured()) {
    const summary = await workspaceSummary(orgId);
    const a = await llmDraft(
      `You are Garu, a friendly baby-eagle assistant inside a real estate agency's growth OS. Answer the user's question in 1-3 short sentences. Be warm, concrete and action-oriented. Use ONLY these facts about their workspace; if the question is unrelated, give your best practical answer without inventing product features: ${summary}`,
      q
    );
    if (a) return a;
  }
  const rule = RULES.find(r => r.match.test(q));
  if (rule) return rule.answer;
  if (/price|cost|cheap|discount/i.test(q)) return 'Plans: Lead Engine ₹79,000/mo, Lead Machine ₹1,50,000/mo, Market Domination ₹2,70,000/mo — switching for testing is free and instant.';
  return 'I know this workspace inside out — try asking about leads, WhatsApp, tasks, campaigns, viewings, billing or team invites.';
}

async function workspaceSummary(orgId: string): Promise<string> {
  const [leads, tasks, apts, camps, drafts] = await Promise.all([
    prisma.lead.count({ where: { orgId, archivedAt: null } }),
    prisma.task.count({ where: { orgId, status: 'OPEN' } }),
    prisma.appointment.count({ where: { orgId, startsAt: { gte: new Date() } } }),
    prisma.campaign.count({ where: { orgId } }),
    prisma.message.count({ where: { orgId, status: 'APPROVAL_PENDING' } })
  ]);
  return `${leads} active leads, ${tasks} open tasks, ${apts} upcoming viewings, ${camps} campaigns, ${drafts} drafts pending approval.`;
}
