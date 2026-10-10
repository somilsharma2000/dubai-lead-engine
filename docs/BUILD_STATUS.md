# BUILD STATUS — Real Estate AI Growth OS
Updated: 2026-10-10 (v7) — LIVE. BLOCKED placeholders replaced with working logic.

## v7 — "No more BLOCKED" (2026-10-10)
Every BLOCKED placeholder deleted and replaced with a real working path:
- WhatsApp delivery: WORKING NOW — every sent message gets an "Open in WhatsApp" one-tap link (wa.me, text pre-filled). Auto-send via WhatsApp Cloud API activates automatically when WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID are set (verified code path; records messages.delivered_cloud).
- Team invites: FIXED a broken flow — invites used to create accounts with random lost passwords. Now each invite generates a personal activation link (7-day expiry) shown in Settings with WhatsApp/email share buttons; invitee sets their own password at /accept-invite. Optional automatic email when RESEND_API_KEY is set.
- Calendar: WORKING NOW — every viewing has an "Add to Google Calendar" link + downloadable .ics file (Apple/Outlook). ICS route is auth-protected.
- AI drafting: rule-based works today; add AI_API_KEY (any OpenAI-compatible provider via AI_BASE_URL/AI_MODEL) and drafts become LLM-written automatically, still approval-gated. Source labeled AI_DRAFT vs RULE_DRAFT.
- Razorpay billing: real "Payment link (Razorpay)" buttons on the Billing page create live payment links (₹79,000/₹1,50,000/₹2,70,000 monthly) when RAZORPAY_KEY_ID/SECRET are set; without keys the click is recorded honestly with setup steps on Integrations.
- HARDENED: public lead form now rejects non-string types and non-numeric phones (junk like {"$ne":null} is a 400, not a lead).

## v6 — "No fake buttons" audit (2026-10-10)
Full-OS audit executed with three automated suites (npm run smoke / clickbot / security):
- EVERY button, form and link on every page clicked via real server-action posts — all verified working: lead create/update/archive, AI draft reply (matches properties to lead budget), approve & send, discard, manual send, pause/resume bot, tasks add/complete, calendar book/confirm/no-show/cancel, properties add, campaigns add/move/delete, workflow toggle, retry, org settings save, team invite, onboarding toggle, billing package switch, demo load/clear, logout, login, demo login, CSV export, public website form.
- REAL BUGS FOUND & FIXED: (1) `org.settings` permission used by Settings onboarding toggle + Billing switch did not exist in the RBAC matrix — both buttons errored for every non-admin user; now use `settings.write`. (2) 9 server actions crashed with an error page on missing/stale row ids (null id into Prisma) — all guarded to no-op safely.
- SECURITY VERIFIED: cross-tenant reads/writes blocked at API and page level (404/empty), admin pages 307-redirect non-admins, demo org can't see real orgs, public lead API rate-limited (5/min/IP) + honeypot + input caps, weak passwords rejected.
- Honest-blocked features unchanged (WhatsApp send, real billing, email, calendar sync) — labeled BLOCKED in the UI with setup steps, never faked. Workflow: BUILD FIRST → PREVIEW → APPROVE → PRODUCTION (owner's directive).

## Stage tracker
- Stage 1 AUDIT: DONE — 34 routes, 19 DB models, 40+ source files, all committed. Landing page (GitHub Pages) preserved untouched.
- Stage 2 BUILD: DONE — all modules below implemented and wired end-to-end.
- Stage 3 PREVIEW: DONE — one-click local preview (START-OS.ps1 + PREVIEW-GUIDE.md), demo data seeded, 35/35 tests on fresh DB.
- Stage 4 OWNER REVIEW: WAITING FOR SOMIL — explore the preview, give feedback.
- Stage 5 CHANGES: next after feedback.
- Stage 6 PRODUCTION (Supabase/Vercel/Razorpay/WhatsApp/AI keys): BLOCKED until Somil approves. No accounts created.

## Feature checklist (verified by automated tests)
IMPLEMENTED & TESTED (38/38 smoke tests pass on a fresh database):
- Auth: signup, login, logout, sessions, wrong-password rejection (tests 1, 11, 11b–d)
- Multi-tenant security: cross-org reads and writes blocked (tests 9b, 9c, 17)
- RBAC: platform-admin API blocked for normal users (test 10)
- Leads: create with auto-score, validate input, stage changes, CSV export (tests 3, 5, 6, 8)
- Workflow engine: fires on lead create + stage change, creates follow-up/viewing tasks, consent-aware skips (tests 3b, 4, 5b)
- Dashboard metrics: computed live from real data (test 7)
- Conversations: manual messages, rule-based drafts from property records, approval flow, DENIED-consent block (403), bot pause/human handoff (409) (tests 12–15)
- Campaigns: create, move through 6-stage pipeline, delete, tenant isolation (tests 16, 16b–d, 17)
- Onboarding checklist: persistent toggles (DB-backed, lazily seeded)
- DEPLOY READY (v4): deploy-prepare script switches SQLite→PostgreSQL automatically when a hosted DATABASE_URL is set; prisma db push runs at build; DEPLOY-GUIDE.md = click-by-click Vercel hosting.
- MONEY REPORTS (v4): /reports page + /api/reports — funnel, win rate, leads by source, stated-budget revenue of WON leads, task counts. 38/38 tests.
- CLIENT DEMO (v3): one-click "Try the live client demo" button on login page → shared demo workspace "Prime Realty Studio" with 6 realistic leads, conversations (1 draft awaiting approval), 4 properties, 4 campaigns, tasks, viewing, setup progress. Demo banner + "Reset demo data" button shown inside the demo workspace. Idempotent: any number of demo logins work.
- ONE PANEL (v3): sidebar grouped (Pipeline / Growth / Business / Platform), dashboard "Everything, one place" module grid, setup progress bar, campaigns + pending-drafts tiles.
- Billing: package display, demo package switch, usage metering from real actions
- Onboarding, settings, org management, member invites
- Demo data: seed script (scripts/seed.mjs), demo reset buttons on dashboard

SIMULATED / HONESTLY LABELLED (need credentials, Stage 6):
- WhatsApp message delivery — drafts prepared and approved in-app, delivery BLOCKED until connected
- AI replies — drafts are rule-based (property records + consent rules), no AI key connected
- Auto-publishing to Instagram/Facebook — campaigns marked POSTED manually until Meta connected
- Razorpay billing — demo package switching only, never charges money

## Preview (Stage 3)
- Windows one-click: repo root → START-OS.ps1 → "Run with PowerShell" (needs Node.js LTS once)
- Login: somil@leadengine.com / Password123! (dev-only)
- Client demo: one click on the login page, no credentials needed
- HOSTED (recommended for showing clients): DEPLOY-GUIDE.md in repo root — Vercel + Neon, free
- Full tour: PREVIEW-GUIDE.md in repo root

## Known limitations (honest)
- Preview runs on localhost only (sandbox blocks public tunnels — platform rule).
- SQLite dev DB; production swap = change DATABASE_URL to Supabase Postgres. No rebuild.
- Email sending, payment collection, WhatsApp delivery, AI provider: BLOCKED pending credentials.
