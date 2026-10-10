import { prisma } from '@/db';
import { requireCtx } from '@/auth';
import { ensureSocialLibrary, FORMATS, DM_SCRIPTS, ROUTINE, HOOKS, CTAS, REPURPOSING, CADENCE, COMPLIANCE } from '@/lib/social';
import {
  socialToggleAction, socialAddAction, socialDeleteAction, socialWeightAction,
  ideaToCampaignAction, brandSaveAction, socialEditAction, scriptGenerateAction,
} from './actions';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const m = (a: string | null): any => (a ? JSON.parse(a) : {});

export default async function SocialPage() {
  const ctx = await requireCtx();
  await ensureSocialLibrary(ctx.org.id);
  const assets = await prisma.socialAsset.findMany({ where: { orgId: ctx.org.id }, orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] });
  const by = (c: string) => assets.filter(a => a.category === c);
  const checklist = by('CHECKLIST'), pillars = by('PILLAR'), series = by('SERIES'),
        hashtags = by('HASHTAG'), kpis = by('KPI'), ideas = by('IDEA'), scripts = by('SCRIPT'), brand = by('BRAND')[0];
  const doneCount = checklist.filter(c => c.done).length;
  const score = checklist.length ? Math.round(100 * doneCount / checklist.length) : 0;
  const brandM = brand ? m(brand.meta) : {};

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Social Growth Engine</h1>
          <p className="text-sm text-zinc-500">Profile → Content → Funnels → Leads: the full specialist system for {ctx.org.name}.</p>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-xs text-zinc-500">Profile Score</div>
          <div className={`text-3xl font-bold ${score >= 80 ? 'text-emerald-700' : score >= 50 ? 'text-amber-700' : 'text-red-700'}`}>{score}%</div>
          <div className="text-[10px] text-zinc-400">{doneCount}/{checklist.length} setup items</div>
        </div>
      </div>

      {/* 1. PROFILE OPTIMIZATION */}
      <div className="card">
        <h2 className="font-semibold mb-1">1 · Profile optimization</h2>
        <p className="text-xs text-zinc-500 mb-3">Instagram + Google + LinkedIn. Every item is a step — tick it off and watch the score rise.</p>
        <div className="grid md:grid-cols-2 gap-2">
          {checklist.map(c => (
            <form key={c.id} action={socialToggleAction} className={`flex items-start gap-3 border rounded-lg p-3 ${c.done ? 'border-emerald-300 bg-emerald-50' : 'border-zinc-200 hover:border-amber-400'}`}>
              <input type="hidden" name="id" value={c.id} />
              <button name="toggle" value="1" className="shrink-0 mt-0.5 w-5 h-5 rounded border-2 border-zinc-400 text-xs flex items-center justify-center hover:border-amber-600" aria-label={c.done ? 'Mark undone' : 'Mark done'}>{c.done ? '✓' : ''}</button>
              <div>
                <div className={`text-sm font-medium ${c.done ? 'line-through text-zinc-500' : ''}`}>{c.title}</div>
                <div className="text-xs text-zinc-500">{c.detail}</div>
              </div>
            </form>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* 2. BRAND KIT */}
        <div className="card">
          <h2 className="font-semibold mb-1">2 · Brand kit</h2>
          <p className="text-xs text-zinc-500 mb-3">Pick your 4 content colours + fonts. Every template uses them — consistency reads as premium.</p>
          <div className="flex gap-2 mb-3">
            {[brandM.primary, brandM.secondary, brandM.accent, brandM.neutral].filter(Boolean).map((c: string, i: number) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-lg border border-zinc-200" style={{ background: c }} />
                <div className="text-[9px] text-zinc-500 mt-1">{c}</div>
              </div>
            ))}
            {!brandM.primary && <p className="text-xs text-zinc-400 self-center">No colours yet — set them below.</p>}
          </div>
          <form action={brandSaveAction} className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
              {[['primary', 'Primary'], ['secondary', 'Secondary'], ['accent', 'Accent'], ['neutral', 'Neutral']].map(([k, l]) => (
                <div key={k}>
                  <label className="label !text-[10px]">{l}</label>
                  <input type="color" name={k} defaultValue={(brandM as any)[k] || (k === 'primary' ? '#b45309' : k === 'secondary' ? '#1f2937' : k === 'accent' ? '#f6c453' : '#f5f5f4')} className="w-full h-9 border border-zinc-200 rounded cursor-pointer" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label !text-[10px]">Heading font</label><input name="fontHeading" defaultValue={brandM.fontHeading || 'Playfair Display'} className="input !text-sm" /></div>
              <div><label className="label !text-[10px]">Body font</label><input name="fontBody" defaultValue={brandM.fontBody || 'Inter'} className="input !text-sm" /></div>
            </div>
            <div><label className="label !text-[10px]">Brand vibe (luxury / family / investor)</label><input name="vibe" defaultValue={brandM.vibe || ''} className="input !text-sm" placeholder="e.g. luxury gold, minimal ivory" /></div>
            <button className="btn-gold text-xs">Save brand kit</button>
          </form>
        </div>

        {/* 3. CONTENT PILLARS */}
        <div className="card">
          <h2 className="font-semibold mb-1">3 · Content pillars</h2>
          <p className="text-xs text-zinc-500 mb-3">Your 5 content categories with % split. Edit weights to match your positioning.</p>
          {pillars.map(p => {
            const pm = m(p.meta);
            return (
              <form key={p.id} action={socialWeightAction} className="flex items-center gap-2 py-1.5 border-b border-zinc-100 last:border-0">
                <input type="hidden" name="id" value={p.id} />
                <div className="w-3 h-8 rounded" style={{ background: pm.color || '#ccc' }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="text-[10px] text-zinc-400">{pm.why}</div>
                </div>
                <input name="weight" defaultValue={pm.weight} className="w-14 input !text-xs !py-1 text-center" aria-label="weight %" />
                <span className="text-xs text-zinc-400">%</span>
                <button className="btn-ghost !text-[10px]">Save</button>
              </form>
            );
          })}
        </div>
      </div>

      {/* 4. WEEKLY CONTENT SERIES */}
      <div className="card">
        <h2 className="font-semibold mb-1">4 · Weekly content series</h2>
        <p className="text-xs text-zinc-500 mb-3">Recurring, named series — the spine of a consistent calendar. Follow the hook, post on the day.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="th">Day</th><th className="th">Series</th><th className="th">Format</th><th className="th">Hook</th><th className="th">Pillar</th></tr></thead>
            <tbody>
              {series.sort((a, b) => DAYS.indexOf(m(a.meta).day || '') - DAYS.indexOf(m(b.meta).day || '')).map(s => {
                const sm = m(s.meta);
                return (
                  <tr key={s.id} className="hover:bg-zinc-50">
                    <td className="td font-medium">{sm.day}</td>
                    <td className="td">{s.title}</td>
                    <td className="td"><span className="badge bg-zinc-100 text-zinc-700 !text-[10px]">{sm.format}</span></td>
                    <td className="td text-xs text-zinc-600 max-w-xs">{sm.hook}</td>
                    <td className="td text-xs">{pillars.find(p => p.key === sm.pillar)?.title || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <form action={socialAddAction} className="grid md:grid-cols-5 gap-2 mt-3">
          <input type="hidden" name="category" value="SERIES" />
          <select name="day" className="input !text-sm">{DAYS.map(d => <option key={d}>{d}</option>)}</select>
          <input name="title" required placeholder="Series name" className="input !text-sm" />
          <select name="format" className="input !text-sm">{['REEL', 'CAROUSEL', 'POST', 'STORY+POST', 'STORY+REEL'].map(f => <option key={f}>{f}</option>)}</select>
          <input name="hook" placeholder="Hook (first line)" className="input !text-sm" />
          <button className="btn-gold text-xs">+ Add series</button>
        </form>
      </div>

      {/* 5. IDEA BANK → CAMPAIGNS */}
      <div className="card">
        <h2 className="font-semibold mb-1">5 · Idea bank</h2>
        <p className="text-xs text-zinc-500 mb-3">Capture ideas against a pillar. Promote any idea to the Campaigns pipeline when it&apos;s ready to produce.</p>
        {ideas.length > 0 && (
          <div className="space-y-2 mb-3">
            {ideas.map(i => {
              const im = m(i.meta);
              return (
                <div key={i.id} className="flex items-center gap-2 border border-zinc-200 rounded-lg p-2">
                  <span className="badge bg-zinc-100 text-zinc-700 !text-[10px] shrink-0">{pillars.find(p => p.key === im.pillar)?.title || '—'}</span>
                  <span className="badge bg-amber-50 text-amber-800 !text-[10px] shrink-0">{im.format || 'REEL'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{i.title}</div>
                    <div className="text-xs text-zinc-500 truncate">{im.hook}</div>
                  </div>
                  <form action={ideaToCampaignAction}><input type="hidden" name="id" value={i.id} /><button className="btn-ghost !text-[10px]">→ Campaigns</button></form>
                  <form action={socialDeleteAction}><input type="hidden" name="id" value={i.id} /><button className="btn-ghost !text-[10px] text-red-700">✕</button></form>
                </div>
              );
            })}
          </div>
        )}
        <form action={socialAddAction} className="grid md:grid-cols-5 gap-2">
          <input type="hidden" name="category" value="IDEA" />
          <input name="title" required placeholder="Idea (e.g. Marina sunset tour)" className="input !text-sm md:col-span-2" />
          <select name="pillar" className="input !text-sm">{pillars.map(p => <option key={p.id} value={p.key || p.title}>{p.title}</option>)}</select>
          <select name="format" className="input !text-sm">{['REEL', 'CAROUSEL', 'POST', 'STORY'].map(f => <option key={f}>{f}</option>)}</select>
          <button className="btn-gold text-xs">+ Capture idea</button>
        </form>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* 6. FORMATS */}
        <div className="card">
          <h2 className="font-semibold mb-1">6 · Content formats library</h2>
          <p className="text-xs text-zinc-500 mb-3">2026 specs — what to make and what it&apos;s best for.</p>
          <ul className="space-y-2">
            {FORMATS.map(f => (
              <li key={f.name} className="border-l-2 border-amber-500 pl-3">
                <div className="text-sm font-medium">{f.name}</div>
                <div className="text-xs text-zinc-600">{f.spec}</div>
                <div className="text-[10px] text-zinc-400">Best for: {f.bestFor}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* 7. HASHTAG SETS */}
        <div className="card">
          <h2 className="font-semibold mb-1">7 · Hashtag sets</h2>
          <p className="text-xs text-zinc-500 mb-3">Ready-made sets — click to copy, rotate weekly, 3-8 specific tags beats 30 broad.</p>
          <div className="space-y-2">
            {hashtags.filter(h => m(h.meta).tags).map(h => (
              <div key={h.id} className="border border-zinc-200 rounded-lg p-2">
                <div className="text-sm font-medium">{h.title}</div>
                <div className="text-xs text-blue-800 break-words">{m(h.meta).tags}</div>
              </div>
            ))}
            {hashtags.filter(h => h.detail && !m(h.meta).tags).map(h => (
              <div key={h.id} className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                <div className="text-sm font-medium">{h.title}</div>
                <div className="text-xs text-zinc-600">{h.detail}</div>
              </div>
            ))}
          </div>
          <form action={socialAddAction} className="flex gap-2 mt-3">
            <input type="hidden" name="category" value="HASHTAG" />
            <input name="title" required placeholder="Set name" className="input !text-sm" />
            <input name="tags" required placeholder="#tags..." className="input !text-sm flex-1" />
            <button className="btn-gold text-xs">+ Add</button>
          </form>
        </div>
      </div>

      {/* 8. DM FUNNELS */}
      <div className="card">
        <h2 className="font-semibold mb-1">8 · DM → lead funnels (the money part)</h2>
        <p className="text-xs text-zinc-500 mb-3">Copy-paste scripts. Every DM that answers becomes a lead in your CRM — this is where social turns into revenue.</p>
        <div className="grid md:grid-cols-2 gap-2">
          {DM_SCRIPTS.map(s => (
            <div key={s.name} className="border border-zinc-200 rounded-lg p-3">
              <div className="text-sm font-medium text-amber-900">{s.name}</div>
              <div className="text-xs text-zinc-600 mt-1">{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* 9. DAILY ROUTINE */}
        <div className="card">
          <h2 className="font-semibold mb-1">9 · Daily 30-minute engagement routine</h2>
          <p className="text-xs text-zinc-500 mb-3">Growth is 20% posting, 80% this.</p>
          <ol className="space-y-2">
            {ROUTINE.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm"><span className="badge bg-amber-100 text-amber-800 !text-[10px] shrink-0 h-5">{i + 1}</span><span className="text-zinc-700">{r}</span></li>
            ))}
          </ol>
        </div>
        {/* 10. KPIs */}
        <div className="card">
          <h2 className="font-semibold mb-1">10 · Weekly KPIs</h2>
          <p className="text-xs text-zinc-500 mb-3">Track every Friday. Numbers, not mood.</p>
          <div className="space-y-2">
            {kpis.map(k => (
              <div key={k.id} className="flex items-center justify-between gap-2 border-b border-zinc-100 last:border-0">
                <div>
                  <div className="text-sm font-medium">{k.title}</div>
                  <div className="text-xs text-zinc-500">{k.detail}</div>
                </div>
                <span className="badge bg-zinc-100 text-zinc-700 !text-[10px] shrink-0">{m(k.meta).target || ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 11. REEL SCRIPT BUILDER */}
      <div className="card">
        <h2 className="font-semibold mb-1">11 · Reel script builder</h2>
        <p className="text-xs text-zinc-500 mb-3">Rule-based engine: pick a pillar and hook style — get a shoot-ready script with hook, beats, CTA and SEO caption.</p>
        {scripts.length > 0 && (
          <div className="space-y-2 mb-3">
            {scripts.map(sc => {
              const sm = m(sc.meta);
              return (
                <div key={sc.id} className="border border-amber-200 bg-amber-50/50 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{sc.title}</div>
                    <div className="flex gap-1">
                      <form action={ideaToCampaignAction}><input type="hidden" name="id" value={sc.id} /><button className="btn-ghost !text-[10px]">→ Campaigns</button></form>
                      <form action={socialDeleteAction}><input type="hidden" name="id" value={sc.id} /><button className="btn-ghost !text-[10px] text-red-700">✕</button></form>
                    </div>
                  </div>
                  <div className="mt-2 text-sm"><span className="badge bg-amber-100 text-amber-800 !text-[10px]">HOOK</span> <span className="font-medium">{sm.hook}</span></div>
                  <ol className="list-decimal ml-5 mt-1 text-xs text-zinc-700 space-y-0.5">{(sm.body || []).map((b: string, i: number) => <li key={i}>{b}</li>)}</ol>
                  <div className="mt-1 text-xs"><span className="badge bg-emerald-100 text-emerald-800 !text-[10px]">CTA</span> {sm.cta}</div>
                  <div className="mt-1 text-xs text-zinc-500"><span className="badge bg-zinc-200 text-zinc-700 !text-[10px]">CAPTION</span> {sm.caption}</div>
                </div>
              );
            })}
          </div>
        )}
        <form action={scriptGenerateAction} className="grid md:grid-cols-5 gap-2">
          <input name="topic" required placeholder="Topic (e.g. Marina penthouse tour)" className="input !text-sm md:col-span-2" />
          <input name="city" placeholder="City/area" className="input !text-sm" />
          <select name="pillar" className="input !text-sm">{pillars.map(p => <option key={p.id} value={p.key || ''}>{p.title}</option>)}</select>
          <select name="hookType" className="input !text-sm">{Array.from(new Set(HOOKS.map(h => h.type))).map(t => <option key={t}>{t}</option>)}</select>
          <button className="btn-gold text-xs md:col-span-5 md:w-40">⚡ Generate script</button>
        </form>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* 12. HOOKS */}
        <div className="card">
          <h2 className="font-semibold mb-1">12 · Hook library (first 1.5 seconds)</h2>
          <p className="text-xs text-zinc-500 mb-3">The first 1.5s decide if the video gets watched. Swap [City]/[Price] and go.</p>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {HOOKS.map((h, i) => (
              <div key={i} className="flex gap-2 text-sm items-start">
                <span className="badge bg-zinc-100 text-zinc-600 !text-[9px] shrink-0 mt-0.5">{h.type}</span>
                <span className="text-zinc-700">{h.text}</span>
              </div>
            ))}
          </div>
        </div>
        {/* 13. CTAS */}
        <div className="card">
          <h2 className="font-semibold mb-1">13 · CTA formulas</h2>
          <p className="text-xs text-zinc-500 mb-3">Every post ends with ONE ask. Keyword CTAs feed the DM funnels.</p>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {CTAS.map((c, i) => (
              <div key={i} className="flex gap-2 text-sm items-start">
                <span className="badge bg-amber-100 text-amber-800 !text-[9px] shrink-0 mt-0.5">{c.name}</span>
                <span className="text-zinc-700">{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 14. REPURPOSING ENGINE */}
      <div className="card">
        <h2 className="font-semibold mb-1">14 · Repurposing engine — 1 shoot → 12+ assets</h2>
        <p className="text-xs text-zinc-500 mb-3">One 1-hour property shoot is a week of content across every platform. Work down this list every time.</p>
        <div className="grid md:grid-cols-3 gap-2">
          {REPURPOSING.map((r, i) => (
            <div key={i} className="border border-zinc-200 rounded-lg p-2">
              <div className="text-xs font-medium text-amber-900">{r.asset}</div>
              <div className="text-[11px] text-zinc-500">{r.spec}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* 15. CADENCE */}
        <div className="card">
          <h2 className="font-semibold mb-1">15 · Posting cadence blueprint</h2>
          <p className="text-xs text-zinc-500 mb-3">Consistency beats volume. This is the 2026 baseline per platform.</p>
          <table className="w-full text-sm"><tbody>
            {CADENCE.map((c, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-0">
                <td className="py-1.5 font-medium w-40">{c.platform}</td>
                <td className="py-1.5 text-xs text-zinc-600">{c.freq}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        {/* 16. COMPLIANCE */}
        <div className="card">
          <h2 className="font-semibold mb-1">16 · Regional compliance (read before posting)</h2>
          <p className="text-xs text-zinc-500 mb-3">One violation can cost more than a year of marketing. Know your market&apos;s rules.</p>
          <div className="space-y-2">
            {COMPLIANCE.map((c, i) => (
              <div key={i} className="border-l-2 border-red-400 pl-3">
                <div className="text-sm font-medium">{c.region}</div>
                <div className="text-xs text-zinc-600">{c.rule}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
