# IMPROVEMENT BACKLOG
Prioritized 2026-10-11 after the full audit. Rank = revenue impact × customer value ÷ cost, dependencies respected. Core end-to-end workflow first; AI agents and decoration last.

## P0 — Revenue path (this week)
1. **Razorpay payment webhook** — automatic invoice status: today payment status is manual. Blocks confident scaling of subscriptions. (Cost: S; Risk: must verify signature; Value: high)
2. **Lead search + filter + sort** on `/leads` (by stage, source, city, score; text search). The CRM is the product's spine; this is the first thing agents feel at 100+ leads. (Cost: S)
3. **Conversations: "needs approval" filter + count badge in nav** — the approval queue is the core differentiator of the AI flow. (Cost: S)
4. **Durable rate limiting** (DB-backed counters) for login + public form — current per-instance limits are best-effort only. (Cost: S)

## P1 — Client value (next 2 weeks)
5. **Notification center**: unread Activity feed with badge; digest option. (Cost: M)
6. **Weekly report email** (Resend already integrated): pipeline summary to owner. (Cost: S–M)
7. **Reports export PDF** (print-optimized view is enough; avoid heavy deps). (Cost: S)
8. **Property ↔ lead matching suggestions** in lead detail ("2 listings in budget in Dubai Marina"). (Cost: M; engine pieces exist)
9. **Multi-org switching** for users invited to two orgs (membership model already supports the data; getCtx takes first). (Cost: S–M)

## P2 — Scale (this month)
10. **Background job queue** (Vercel Cron or a queue service) for scheduled workflow runs + retries; today automation is in-request only. (Cost: M)
11. **npm audit + CI gate** in deploy pipeline. (Cost: S)
12. **Versioned Prisma migrations** instead of `db push` before real customer migrations. (Cost: S)
13. **App-level scheduled backups** (daily JSON backup to storage) on top of provider backups. (Cost: S)
14. **`npm audit`-style dependency sweep + CSP headers** in `next.config`. (Cost: S)

## P3 — Later / optional
15. Google Calendar OAuth sync (registry stub exists; real OAuth flow needed).
16. Mobile card views for tables.
17. Loading skeletons.
18. 2FA for OWNER role.
19. Per-tenant BYO AI keys.

## Explicitly NOT doing (per directive: no decoration before core)
- More AI agents/personas.
- Another marketing landing page.
- Stylistic rewrites of working code.
