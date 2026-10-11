# SECURITY AUDIT
Audit date: 2026-10-11 · Method: code review + live adversarial testing against production (synthetic data only)

## Authentication & sessions
- Passwords: bcrypt, cost 10. Signup enforces min-8, server-side.
- Sessions: 32-byte random hex token in DB; `httpOnly`, `sameSite=lax`, **`secure` in production** (added this audit); 7-day expiry enforced server-side on every request; expired rows swept on login.
- Logout deletes the session row — verified live: post-logout request returns 401.
- Login brute-force: **10 attempts / 5 min / IP** (added this audit) → 429. Per-instance on serverless; durable limiter is on the backlog.

## Authorization (RBAC)
- Roles: OWNER / ADMIN / AGENT / PLATFORM_ADMIN via `can(role, perm)` matrix (`src/server/rbac.ts`).
- Every server action calls `requirePerm('<domain>.<verb>')`; server-side, not UI-only.
- `/admin` area requires `isPlatformAdmin`; demo client redirected (307, verified live).

## Tenant isolation — verified adversarially (live, production)
| Probe | Result |
|---|---|
| Org B lists leads → sees only own | ✅ 0 foreign leads |
| Org B reads Org A lead by id (API) | ✅ 404 |
| Org B opens Org A lead page | ✅ 404 |
| Demo org toggling another org's social asset | ✅ rejected (no cross-org effect) |
| Cross-org campaign access | ✅ 404 |
| Unauthenticated API access (7 endpoints) | ✅ 401 |

## Input validation & API security
- All mutating endpoints validate with zod (400 on junk — verified live on public form and signup).
- Public lead form: honeypot field (bots silently dropped), field length caps, best-effort IP rate limit.
- Type-abuse payloads do not create junk records (verified: 400).
- Oversized payloads truncated, no crash (verified: no 500).
- Consistent error contract (`src/server/api.ts`): 401/403/404/400/500 — no stack traces or internal errors returned; 500s log server-side and return a generic message.

## Secret handling
- `process.env` read **only** in `src/config.ts`; client components never import server code (verified by grep sweep of all `'use client'` files).
- Integration credential values are write-only: never rendered back to the UI after saving.
- No secrets in the client bundle, in API responses, or in the repo (`.env` gitignored).

## Logging, audit, recovery
- `Activity` (org timeline) + `AuditLog` (admin actions) + `UsageEvent` (per-day metrics) — all writes verified in tests.
- JSON backup export (`/api/export/backup`) covers all org data; CSV for leads.
- No inbound webhooks exist yet, so there is nothing to verify signature-wise; when a payments webhook is added it MUST verify signatures (noted in backlog).

## Residual risks (honest list)
1. In-memory rate limits are per-instance (serverless) — a determined attacker rotating instances bypasses them. Mitigation: DB-backed counters or Upstash Redis.
2. No CSRF tokens — mitigated by `sameSite=lax` cookies + JSON-only mutations; server-action forms are Next.js-protected. Acceptable at current scale; revisit before large customer count.
3. No 2FA / SSO.
4. Postgres backups are provider-level (Supabase daily); no app-level scheduled backups yet.
5. Dependencies are minimal (8 runtime packages), which shrinks supply-chain risk, but `npm audit` is not yet in CI.

**No exploitable cross-tenant access, auth bypass, or injection path was found.**
