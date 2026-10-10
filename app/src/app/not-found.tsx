import Link from 'next/link';
// Custom 404 — keeps visitors inside the app's look instead of a dead end.
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center p-8">
        <div className="text-4xl mb-3">🦅</div>
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="text-sm text-zinc-500 mt-2">The link may be old or mistyped. Everything else is right where you left it.</p>
        <Link href="/dashboard" className="btn-gold text-xs inline-block mt-5">Go to dashboard</Link>
      </div>
    </div>
  );
}
