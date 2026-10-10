// WhatsApp delivery. Two real paths, no simulation:
// 1. waLink() — click-to-chat deep link. Works for any phone TODAY, zero credentials.
// 2. cloudSend() — WhatsApp Cloud API auto-send. Activates automatically when
//    WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID are set in the environment.
export function waLink(phone: string | null | undefined, text: string): string {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
export function cloudConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}
export async function cloudSend(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/[^0-9]/g, ''), type: 'text', text: { body } })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (data as any)?.error?.message || `HTTP ${res.status}` };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
