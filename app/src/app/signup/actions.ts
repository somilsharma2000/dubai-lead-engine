'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/db';
import { hashPassword, createSession, adminEmails } from '@/auth';
import { seedDefaultWorkflows } from '@/workflow';

export async function signupAction(fd: FormData) {
  const raw = { name: fd.get('name'), email: fd.get('email'), password: fd.get('password'), orgName: fd.get('orgName'), country: fd.get('country'), currency: fd.get('currency') };
  const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), orgName: z.string().min(2), country: z.string().length(2), currency: z.string().length(3) });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) redirect('/signup?error=1');
  const d = parsed.data;
  const email = d.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) redirect('/signup?error=exists');
  let slug = d.orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'org';
  if (await prisma.organization.findUnique({ where: { slug } })) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  const user = await prisma.user.create({ data: { email, name: d.name, passwordHash: hashPassword(d.password), isPlatformAdmin: adminEmails().includes(email) } });
  const org = await prisma.organization.create({ data: { name: d.orgName, slug, country: d.country.toUpperCase(), currency: d.currency.toUpperCase() } });
  await prisma.membership.create({ data: { userId: user.id, orgId: org.id, role: 'OWNER' } });
  await seedDefaultWorkflows(org.id);
  await prisma.activity.create({ data: { orgId: org.id, userId: user.id, type: 'org.created', entity: 'Organization', entityId: org.id } });
  await createSession(user.id);
  redirect('/dashboard');
}
