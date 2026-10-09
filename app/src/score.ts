// Deterministic, explainable lead scoring. No LLM involved.
export type ScoreFactor = { label: string; points: number };
export function computeLeadScore(lead: { intent?: string; source?: string; budgetMax?: number | null; consent?: string; createdAt: Date }): { score: number; factors: ScoreFactor[] } {
  const factors: ScoreFactor[] = [];
  let score = 20; factors.push({ label: 'Base', points: 20 });
  const budget = lead.budgetMax || 0;
  if (budget >= 500000) { score += 25; factors.push({ label: `Budget ≥ 500k`, points: 25 }); }
  else if (budget >= 200000) { score += 15; factors.push({ label: 'Budget ≥ 200k', points: 15 }); }
  else if (budget >= 50000) { score += 8; factors.push({ label: 'Budget ≥ 50k', points: 8 }); }
  if ((lead.intent || 'BUY') === 'BUY') { score += 10; factors.push({ label: 'Buying (not renting)', points: 10 }); }
  const sourceW: Record<string, number> = { REFERRAL: 15, WHATSAPP: 10, INSTAGRAM: 10, PORTAL: 8, WEBSITE: 8, MANUAL: 5 };
  const src = lead.source || 'MANUAL';
  const sw = sourceW[src] ?? 3;
  score += sw; factors.push({ label: `Source: ${src}`, points: sw });
  if (lead.consent === 'GRANTED') { score += 10; factors.push({ label: 'Consent to message granted', points: 10 }); }
  if (lead.consent === 'DENIED') { score -= 20; factors.push({ label: 'Consent DENIED — do not message', points: -20 }); }
  if (Date.now() - lead.createdAt.getTime() < 24 * 3600 * 1000) { score += 5; factors.push({ label: 'Fresh (<24h)', points: 5 }); }
  return { score: Math.max(0, Math.min(100, score)), factors };
}
