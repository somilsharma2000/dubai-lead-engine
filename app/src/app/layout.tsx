import type { Metadata } from 'next';
import './globals.css';
import { getCtx } from '@/auth';
import { logoutAction } from './actions';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Growth OS', description: 'Real Estate AI Growth Operating System' };

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leads', label: 'Leads' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/properties', label: 'Properties' },
  { href: '/workflows', label: 'Workflows' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/settings', label: 'Settings' },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCtx();
  if (!ctx) return <html lang="en"><body><div className="min-h-screen">{children}</div></body></html>;
  return (
    <html lang="en"><body>
      <div className="min-h-screen flex">
        <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white hidden md:flex flex-col">
          <div className="px-4 py-5 border-b border-zinc-100">
            <div className="font-semibold text-lg leading-tight">Growth OS</div>
            <div className="text-xs text-zinc-500 truncate">{ctx.org?.name || 'Platform'}</div>
          </div>
          <nav className="p-2 space-y-0.5 flex-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className="navlink">{n.label}</Link>
            ))}
            {ctx.user.isPlatformAdmin && (
              <div className="pt-3 mt-3 border-t border-zinc-100">
                <div className="px-3 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Platform</div>
                <Link href="/admin" className="navlink">Admin console</Link>
                <Link href="/admin/integrations" className="navlink">Integrations</Link>
                <Link href="/admin/services" className="navlink">Service catalog</Link>
                <Link href="/admin/prospects" className="navlink">Prospects</Link>
              </div>
            )}
          </nav>
          <div className="p-3 border-t border-zinc-100 text-xs text-zinc-500">
            <div className="font-medium text-zinc-700 truncate">{ctx.user.name}</div>
            <div className="truncate">{ctx.user.email}</div>
            <form action={logoutAction}><button className="mt-2 text-amber-800 hover:underline">Sign out</button></form>
          </div>
        </aside>
        <main className="flex-1 min-w-0"><div className="max-w-6xl mx-auto p-6 md:p-8">{children}</div></main>
      </div>
    </body></html>
  );
}
