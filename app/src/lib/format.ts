// Shared date formatting — one place for the app's date display conventions.
// All helpers accept Date | string | null | undefined and never throw.

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toISOString().slice(0, 10);            // 2026-10-11
}

export function fmtDateTime(d: Date | string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toISOString().slice(0, 16).replace('T', ' ');  // 2026-10-11 09:30
}

export function fmtShort(d: Date | string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toISOString().slice(5, 10);            // 10-11
}

export function ago(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const secs = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
