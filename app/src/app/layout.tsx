import type { Metadata } from 'next';
import './globals.css';
import { getCtx } from '@/server/auth';
import { logoutAction, resetDemoAction } from './actions';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Growth OS', description: 'Real Estate AI Growth Operating System' };

const NAV_GROUPS = [
  { label: null, items: [{ href: '/dashboard', label: 'Dashboard' }] },
  { label: 'Pipeline', items: [
    { href: '/leads', label: 'Leads' },
    { href: '/conversations', label: 'Conversations' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/properties', label: 'Properties' }] },
  { label: 'Growth', items: [
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/social', label: 'Social Growth' },
    { href: '/workflows', label: 'Workflows' }] },
  { label: 'Business', items: [
    { href: '/reports', label: 'Reports' },
    { href: '/integrations', label: 'Integrations' },
    { href: '/billing', label: 'Billing' },
    { href: '/settings', label: 'Settings' }] }
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
          <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
            {NAV_GROUPS.map(g => (
              <div key={g.label || 'main'}>
                {g.label && <div className="px-3 pt-3 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{g.label}</div>}
                {g.items.map(n => (
                  <Link key={n.href} href={n.href} className="navlink">{n.label}</Link>
                ))}
              </div>
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
        <main className="flex-1 min-w-0">
          {ctx.org?.slug === 'demo-prime-realty' && (
            <div className="bg-amber-100 border-b border-amber-300 px-6 py-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold text-amber-900">DEMO WORKSPACE</span>
              <span className="text-amber-800">This is what your clients see — everything works, data is synthetic.</span>
              <form action={resetDemoAction}><button className="text-amber-900 underline font-medium">Reset demo data</button></form>
            </div>
          )}
          <div className="max-w-6xl mx-auto p-6 md:p-8">{children}</div>
        </main>
      </div>
    </body></html>
  );
}
