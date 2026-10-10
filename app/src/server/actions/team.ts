'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';
import { createSession, hashPassword, logAudit, destroySession } from '@/server/auth';
import { config, emailConfigured } from '@/config';

export async function inviteMemberAction(fd: FormData) {
  const ctx = await requirePerm('team.write');
  const email = (S(fd, 'email') || '').toLowerCase();
  const role = S(fd, 'role') || 'AGENCY_MEMBER';
  if (!email || !email.includes('@')) return;
  // remove stale invitation for the same email, then create a fresh token
  await prisma.invitation.deleteMany({ where: { orgId: ctx.org.id, email, acceptedAt: null } });
  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  await prisma.invitation.create({ data: { orgId: ctx.org.id, email, role, token, expiresAt: new Date(Date.now() + 7 * 864e5) } });
  // Real email delivery when a provider key exists; otherwise the shareable link is shown in Settings.
  if (emailConfigured()) {
    const base = config.app.url;
    try { await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.email.resendApiKey}` }, body: JSON.stringify({ from: config.email.from, to: email, subject: `You're invited to ${ctx.org.name}`, html: `<p>${ctx.org.name} invited you to join their workspace.</p><p><a href="${base}/accept-invite?token=${token}">Accept invitation</a> (valid 7 days)</p>` }) }); } catch {}
  }
  await logAudit(ctx.user.id, ctx.org.id, 'team.member_invited', email, { role });
  revalidatePath('/settings');
}

// Accept an invitation: sets a real password chosen by the invitee. Fully working without email.

export async function acceptInviteAction(fd: FormData) {
  const token = S(fd, 'token')!;
  const password = S(fd, 'password')!;
  const name = S(fd, 'name');
  const inv = await prisma.invitation.findUnique({ where: { token } });
  if (!inv || inv.acceptedAt || inv.expiresAt < new Date()) redirect('/accept-invite?error=expired');
  if (!password || password.length < 8) redirect('/accept-invite?token=' + token + '&error=weak');
  let user = await prisma.user.findUnique({ where: { email: inv.email } });
  if (!user) user = await prisma.user.create({ data: { email: inv.email, name: name || inv.email.split('@')[0], passwordHash: hashPassword(password) } });
  else await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(password), ...(name ? { name } : {}) } });
  await prisma.membership.upsert({ where: { userId_orgId: { userId: user.id, orgId: inv.orgId } }, create: { userId: user.id, orgId: inv.orgId, role: inv.role }, update: { role: inv.role } });
  await prisma.invitation.update({ where: { id: inv.id }, data: { acceptedAt: new Date() } });
  redirect('/login?welcome=1');
}


export async function logoutAction() { await destroySession(); redirect('/login'); }
