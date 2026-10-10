'use client';
// Garu assistant widget: 3D mascot + his suggestions + an ask-me-anything box.
import { useState } from 'react';
import GaruScene from './GaruScene';

export default function GaruAssistant({ tips }: { tips: { text: string; href?: string; level: string }[] }) {
  const [q, setQ] = useState('');
  const [a, setA] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim() || busy) return;
    setBusy(true);
    try {
      const r = await fetch('/api/garu/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q }) });
      const d = await r.json();
      setA(d.answer || 'Hmm, I could not think of that one.');
    } catch { setA('I hiccupped — try again.'); }
    setBusy(false);
  }

  const chip = (l: string) => l === 'urgent' ? 'bg-red-100 text-red-800' : l === 'good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';

  return (
    <div className="card overflow-hidden !p-0">
      <div className="flex items-center justify-between px-4 pt-3">
        <h2 className="font-semibold flex items-center gap-2"><span>Garu</span> <span className="badge bg-amber-100 text-amber-800">your AI assistant</span></h2>
        <span className="text-[10px] text-zinc-400">click him — he likes it</span>
      </div>
      <div className="bg-gradient-to-b from-amber-50 to-white border-b border-amber-100">
        <GaruScene tips={tips.map(t => t.text)} height={240} onPoke={() => setA('Hehe! I am Garu. Ask me anything about this workspace below — or tap one of my suggestions.')} />
      </div>
      <div className="p-4 space-y-2">
        {tips.map((t, i) => (
          <a key={i} href={t.href || '#'} className="flex items-start gap-2 group">
            <span className={`badge ${chip(t.level)} shrink-0 mt-0.5 !text-[10px]`}>{t.level === 'urgent' ? 'NOW' : t.level === 'good' ? 'DO' : 'TIP'}</span>
            <span className="text-sm text-zinc-700 group-hover:text-amber-900 group-hover:underline">{t.text}</span>
          </a>
        ))}
        <form onSubmit={ask} className="flex gap-2 pt-2">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ask Garu: how do I invite my team?" className="input flex-1 !text-sm" />
          <button disabled={busy} className="btn-gold text-xs shrink-0">{busy ? '…' : 'Ask'}</button>
        </form>
        {a && <div className="text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"><span className="font-semibold text-amber-900">Garu:</span> {a}</div>}
      </div>
    </div>
  );
}
