'use server';
import { redirect } from 'next/navigation';
import { prisma } from '@/db';
import { verifyPassword, createSession } from '@/auth';

export async function loginAction(fd: FormData) {
  const email = String(fd.get('email') || '').toLowerCase();
  const password = String(fd.get('password') || '');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) redirect('/login?error=1');
  await createSession(user.id);
  redirect('/dashboard');
}
