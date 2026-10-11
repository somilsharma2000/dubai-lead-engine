# INTEGRATION STATUS
As of 2026-10-11. States: **WORKS** = functioning without credentials · **ACTIVATES** = real implementation that turns on when keys are supplied · **MANUAL** = honest fallback path · **NOT BUILT** = stub or absent.

## WhatsApp — WORKS + ACTIVATES
- **Click-to-chat (WORKS, keyless, test-verified):** every lead page and sent message renders a `wa.me/<phone>?text=` deep link with a pre-written opener. This is the default client-communication path.
- **Cloud API auto-send (ACTIVATES):** `src/server/whatsapp.ts` posts to the Graph API when `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` are set. Without keys it returns a clear not-configured result and the UI never claims a send happened.
- Integration registry stores BSP route/name for reference per client (admin/integrations).

## AI — ACTIVATES (rule-based fallback WORKS)
- Any OpenAI-compatible endpoint (`AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` — OpenAI, OpenRouter, Groq all work).
- With key: LLM drafts replies and answers Garu questions, grounded in the org's real records.
- Without key: deterministic rule-based drafts built from property records — always available, tested.
- Human approval gate before any outbound message (approval workflow tested).

## Payments (Razorpay) — ACTIVATES + MANUAL fallback
- With keys: real payment-link creation via Razorpay Orders API (INR plans priced in `config.plans`).
- Without keys: click records an honest `activity` row ('blocked — keys not set'), zero fake success (tested).
- **Gap:** no payment webhook → invoice status is manual until built (top backlog item for revenue ops).

## Email (Resend) — ACTIVATES + MANUAL fallback
- Team invitations email a magic link when `RESEND_API_KEY` set; otherwise the invite link is displayed in the UI to copy manually (tested). Tokens expire after 7 days.

## Google / OAuth — NOT BUILT
- `IntegrationConfig` registry has a Google entry shape, but no OAuth flow exists. Do not advertise calendar sync.

## Hosting architecture
- Vercel (Next.js App Router), serverless functions + Prisma against Supabase Postgres (SQLite file in dev).
- Deploy on push to `main`; `prisma db push` runs during build (schema sync; no versioned migrations).
- No cron/background workers: workflow automation runs in-request. Long jobs need a queue.
- Health endpoint `/api/health` reports app + DB status (monitored implicitly; no uptime alerting yet).

## Environment variables
Full documented set in `.env.example`; every one optional except `DATABASE_URL`. Values read only in `src/config.ts`.
