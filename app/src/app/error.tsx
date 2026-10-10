'use client';
// Global error boundary — if ANY page crashes at render, the user sees a calm
// recovery screen instead of a raw stack. Never shown in normal operation.
export default function GlobalError({ reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center p-8">
        <div className="text-4xl mb-3">🦅</div>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="text-sm text-zinc-500 mt-2">
          Your data is safe — this was a display error. Try again, and if it repeats, reload the page.
        </p>
        <div className="flex gap-2 justify-center mt-5">
          <button onClick={reset} className="btn-gold text-xs">Try again</button>
          <a href="/dashboard" className="btn-ghost text-xs">Back to dashboard</a>
        </div>
      </div>
    </div>
  );
}
