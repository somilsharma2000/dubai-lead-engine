import { NextResponse } from 'next/server';
import { createSession } from '@/auth';
import { ensureDemoWorkspace } from '@/demo';

// One-click demo login for clients and testing.
export async function POST() {
  try {
    const { user, org } = await ensureDemoWorkspace();
    await createSession(user.id);
    return NextResponse.json({ ok: true, org: org.name });
  } catch {
    return NextResponse.json({ ok: false, error: 'Demo login failed.' }, { status: 400 });
  }
}
