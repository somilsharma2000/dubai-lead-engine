import { redirect } from 'next/navigation';
import { getCtx, verifyPassword } from '@/auth';
import { prisma } from '@/db';
import { loginAction, demoLoginAction } from './actions';

export default async function Login({ searchParams }: { searchParams: { error?: string } }) {
  const ctx = await getCtx();
  if (ctx) redirect('/dashboard');
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-2xl font-semibold">Growth OS</div>
          <div className="text-sm text-zinc-500">Real estate lead operations</div>
        </div>
        <form action={loginAction} className="card space-y-3">
          {searchParams?.error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">Wrong email or password.</p>}
          <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
          <div><label className="label">Password</label><input name="password" type="password" required className="input" /></div>
          <button className="btn-gold w-full">Sign in</button>
          <p className="text-xs text-center text-zinc-500">No account? <a href="/signup" className="text-amber-800 underline">Create one</a></p>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-zinc-400"><div className="h-px bg-zinc-200 flex-1"></div>or<div className="h-px bg-zinc-200 flex-1"></div></div>
        <form action={demoLoginAction}>
          <button className="btn-ghost w-full !py-3 !text-sm font-medium">▶ &nbsp;Try the live client demo — no login needed</button>
        </form>
        <p className="text-xs text-center text-zinc-400 mt-2">Opens a full workspace with demo data. Real software, synthetic leads.</p>
      </div>
    </div>
  );
}
