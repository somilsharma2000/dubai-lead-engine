'use server';
import { redirect } from 'next/navigation';
import { createSession } from '@/server/auth';
import { ensureDemoWorkspace } from '@/server/demo';

// One-click demo login from the marketing page.
export async function demoLoginAction() {
  try {
    const { user } = await ensureDemoWorkspace();
    await createSession(user.id);
  } catch { /* demo seeding hiccup — fall through to login */ }
  redirect('/dashboard');
}
