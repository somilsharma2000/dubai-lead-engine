import { redirect } from 'next/navigation';
import { getCtx } from '@/auth';
import { signupAction } from './actions';
import GaruScene from '@/components/GaruScene';

export default async function Signup() {
  const ctx = await getCtx();
  if (ctx) redirect('/dashboard');
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-4 -mt-6"><GaruScene height={150} tips={['Welcome! I will set up your workspace.', 'Invite your team right after — links, no email needed.']} /></div>
        <div className="text-center mb-6">
          <div className="text-2xl font-semibold">Create your workspace</div>
          <div className="text-sm text-zinc-500">You become the Owner. Your organization is created with default workflows.</div>
        </div>
        <form action={signupAction} className="card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Your name</label><input name="name" required className="input" /></div>
            <div><label className="label">Organization</label><input name="orgName" required className="input" placeholder="e.g. Manuja Properties" /></div>
          </div>
          <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
          <div><label className="label">Password (min 8 chars)</label><input name="password" type="password" required minLength={8} className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Country code</label><input name="country" defaultValue="AE" maxLength={2} className="input" /></div>
            <div><label className="label">Currency</label><input name="currency" defaultValue="USD" maxLength={3} className="input" /></div>
          </div>
          <button className="btn-gold w-full">Create workspace</button>
          <p className="text-xs text-center text-zinc-500">Have an account? <a href="/login" className="text-amber-800 underline">Sign in</a></p>
        </form>
      </div>
    </div>
  );
}
