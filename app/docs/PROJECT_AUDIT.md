# PROJECT AUDIT — Garuda Lead Engine OS
Audit date: 2026-10-11 · Method: source inspection + live deployed testing (https://dubai-lead-engine.vercel.app) + local test execution. No functionality inferred from screenshots.

## Verdict

The platform is a **genuinely functional multi-tenant SaaS**, not a mock: real auth (bcrypt + server-side sessions), full CRUD with Prisma persistence, server-side permission checks on every mutation, real cross-tenant isolation (verified live: cross-org API read and page read both return 404), working workflow automation engine, and 81 passing automated checks. External integrations degrade honestly: without keys, WhatsApp uses click-to-chat links, AI uses rule-based drafts, billing records "blocked" status — no fake success states were found.

## What this audit found and fixed

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Session cookie missing `secure` flag in production | Medium | **FIXED** — set when `NODE_ENV=production` |
| 2 | No brute-force protection on login | High | **FIXED** — 10 attempts / 5 min / IP rate limit (429) |
| 3 | Expired sessions never purged (table growth) | Low | **FIXED** — opportunistic sweep on login |
| 4 | Social Growth module had **zero automated tests** | High | **FIXED** — 12 new checks in features suite (24 total) |
| 5 | Some API routes returned 403 for unauthenticated requests | Low | **FIXED** (previous refactor) — consistent 401/403/404 contract |
| 6 | Dev-only scripts (screenshots/clickbot) mixed with CI scripts | Low | **FIXED** — moved to `tools/dev/` |

## Confirmed working (evidence in TEST_RESULTS.md)

- Signup, login, logout (session invalidated server-side — 401 after logout, verified live)
- One-click demo login with seeded workspace (9 leads, isolated demo org)
- Lead CRUD + scoring + pipeline stages; property, tasks, appointments with .ics export
- AI conversation center: rule-based drafts always, LLM drafts when key set, human approval before send, DENIED-consent leads blocked (403)
- Workflow automation: 3 seeded automations, toggle + retry, run history
- Social Growth: 16-section specialist module, per-org library seeding, idea → campaign promotion
- Billing: Razorpay links when keys set, honest blocked-activity record otherwise
- Team invites: token-based, expiring, audit-logged
- Reports/exports: funnel, sources, CSV lead export, JSON backup

## Honest limitations

- **In-memory rate limits** (login, public form) are per-instance on serverless — they raise attack cost, don't eliminate it. Durable limiter needs Redis or a DB-backed counter (backlog item).
- **Payments are demo-grade**: Razorpay link generation works, but no webhook to mark invoices paid — payment status is manual until a webhook listener is built.
- **AI is single-key, single-org**: all orgs share the platform's AI key; no per-tenant BYO-key path yet.
- **No background jobs**: workflow runs happen in-request; long-running or scheduled jobs need a queue (backlog).
- Single-membership model: a user belongs to their first org only; multi-org switching is not supported.
- SQLite in dev / Postgres in prod; migration via `prisma db push` (no versioned migration files).
