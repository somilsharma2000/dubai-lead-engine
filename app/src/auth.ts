import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { can } from './rbac';

export const SESSION_COOKIE = 'sid';
export type Ctx = {
  user: { id: string; email: string; name: string; isPlatformAdmin: boolean };
  org: { id: string; name: string; slug: string; country: string; currency: string; pkg: string; status: string };
  role: string;
};

export function hashPassword(pw: string) { return bcrypt.hashSync(pw, 10); }
export function verifyPassword(pw: string, hash: string) { return bcrypt.compareSync(pw, hash); }
export function adminEmails(): string[] { return (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean); }

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', expires: expiresAt });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  jar.delete(SESSION_COOKIE);
}

// Get the request context: user + first org + role. Returns null if not signed in.
export async function getCtx(): Promise<Ctx | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token }, include: { user: { include: { memberships: { include: { org: true } } } } } });
  if (!session || session.expiresAt < new Date()) return null;
  const m = session.user.memberships[0];
  return {
    user: { id: session.user.id, email: session.user.email, name: session.user.name, isPlatformAdmin: session.user.isPlatformAdmin },
    org: m ? { id: m.orgId, name: m.org.name, slug: m.org.slug, country: m.org.country, currency: m.org.currency, pkg: m.org.pkg, status: m.org.status } : null,
    role: m ? m.role : (session.user.isPlatformAdmin ? 'PLATFORM_ADMIN' : ''),
  } as Ctx;
}

export async function requireCtx(): Promise<Ctx> {
  const ctx = await getCtx();
  if (!ctx) throw new Error('UNAUTHENTICATED');
  return ctx;
}

export async function requirePerm(perm: string): Promise<Ctx> {
  const ctx = await requireCtx();
  if (!ctx.role || (!can(ctx.role, perm) && !ctx.user.isPlatformAdmin)) throw new Error('FORBIDDEN:' + perm);
  return ctx;
}

export async function logAudit(actorId: string | null, orgId: string | null, action: string, target: string, meta: object = {}) {
  await prisma.auditLog.create({ data: { actorId, orgId, action, target, meta: JSON.stringify(meta) } });
}
