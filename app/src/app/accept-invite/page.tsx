import { prisma } from '@/db';
import { acceptInviteAction } from '@/app/actions';

export default async function AcceptInvite({ searchParams }: { searchParams: { token?: string; error?: string } }) {
  const token = searchParams.token || '';
  const inv = token ? await prisma.invitation.findUnique({ where: { token }, include: { org: true } }) : null;
  const valid = inv && !inv.acceptedAt && inv.expiresAt > new Date();
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card max-w-md w-full space-y-3">
        <h1 className="text-2xl font-semibold">{valid ? `Join ${inv!.org.name}` : 'Invitation'}</h1>
        {!token && <p className="text-sm text-zinc-500">This page needs an invitation token. Ask the person who invited you for your personal link.</p>}
        {token && !valid && <p className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2">{searchParams.error === 'weak' ? 'Password must be at least 8 characters.' : 'This invitation is invalid or has expired. Ask for a fresh invitation.'}</p>}
        {valid && (
          <>
            <p className="text-sm text-zinc-500">Invited as <span className="font-medium text-zinc-800">{inv!.email}</span> ({inv!.role.replace('_', ' ')}). Choose a password to activate your account.</p>
            <form action={acceptInviteAction} className="space-y-2">
              <input type="hidden" name="token" value={token} />
              <input name="name" placeholder="Your full name" className="input w-full" />
              <input name="password" type="password" required minLength={8} placeholder="Password (min 8 chars)" className="input w-full" />
              <button className="btn-gold w-full">Activate my account</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
