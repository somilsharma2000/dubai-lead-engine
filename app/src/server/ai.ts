import { config } from '@/config';
// Reply drafting. Two real paths:
// 1. LLM draft — activates automatically when AI_API_KEY is set (OpenAI-compatible:
//    OpenAI, OpenRouter, Groq, Together… via AI_BASE_URL).
// 2. Rule-based draft from property records — always works, used when no key is set.
export function aiConfigured(): boolean {
  return Boolean(config.ai.apiKey);
}
export async function llmDraft(system: string, user: string): Promise<string | null> {
  const base = config.ai.baseUrl;
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.ai.apiKey}` },
      body: JSON.stringify({
        model: config.ai.model,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        temperature: 0.4, max_tokens: 220
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch {
    return null;
  }
}
