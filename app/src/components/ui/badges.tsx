// Reusable presentational primitives — tiny, dependency-free, used by pages
// so badge colors and empty states stay consistent across the app.
import type { ReactNode } from 'react';

// One place for stage → badge color. Keeps lead-stage visuals identical on every page.
export const STAGE_BADGE: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-800',
  CONTACTED: 'bg-slate-50 text-slate-700',
  QUALIFIED: 'bg-amber-50 text-amber-800',
  VIEWING: 'bg-purple-50 text-purple-800',
  NEGOTIATION: 'bg-orange-50 text-orange-800',
  WON: 'bg-emerald-50 text-emerald-800',
  LOST: 'bg-zinc-100 text-zinc-600',
};

export function StageBadge({ stage }: { stage: string }) {
  return <span className={`badge ${STAGE_BADGE[stage] || 'bg-zinc-100 text-zinc-600'}`}>{stage}</span>;
}

export function EmptyState({ title, hint, children }: { title: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="text-center py-10">
      <p className="text-sm font-medium text-zinc-700">{title}</p>
      {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
