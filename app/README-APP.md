# Growth OS — the application (app/)

The real product: a multi-tenant real estate lead operations platform.
Stack: Next.js 14 (TypeScript, server actions) + Prisma + Tailwind. Modular monolith.

## What is implemented and TESTED (18/18 smoke tests, 2026-10-10)
- Signup → creates User + Organization + OWNER role + 3 default workflows
- Login/logout, bcrypt password hashing, httpOnly DB-backed sessions
- 8-role permission matrix, enforced in every API route and server action
- Multi-tenant isolation: every query is org-scoped; cross-org reads/writes return 404 (tested)
- Lead CRM: create, stage pipeline, explainable scoring, notes, consent, search/filter, CSV export
- Workflow engine: trigger → conditions → actions; idempotent, retries, dead-letter, execution log, on/off
- Tasks (manual + workflow-generated), overdue highlighting
- Appointments/viewings with agent conflict detection
- Properties + lead-to-property matching by budget/city
- Dashboard: live metrics with defined formulas, pipeline chart, activity feed
- Founder console: organizations, audit log, prospects CRM, feature flags
- Integrations page: TRUTHFUL status only (nothing fake-connected)

## Run locally (Windows)
1. Install Node.js 20+ from nodejs.org
2. Open PowerShell in app/ folder: `npm install`
3. `npx prisma migrate dev` (creates dev.db)
4. `npm run dev` → open http://localhost:3000

## Deploy to production (Vercel + Supabase, both free)
1. supabase.com → New project → copy the connection string (Settings → Database)
2. vercel.com → Add New Project → import this GitHub repo
3. In Vercel settings set Root Directory: `app` and environment variables:
   DATABASE_URL = your Supabase connection string
   ADMIN_EMAILS = your email (platform admin powers)
4. Locally: `npx prisma migrate deploy` against the Supabase URL once
5. Deploy. Signup with your ADMIN_EMAILS address → you get the founder console.

## The honest BLOCKED list (needs your accounts/credentials)
- WhatsApp Business API → needs Meta business verification + BSP/API credentials
- Email sending (password reset) → needs a provider API key
- Google Calendar sync → needs OAuth client
- AI reply drafting → needs an AI provider key (design: constrained, approval-gated)
- Razorpay billing webhooks → needs Razorpay keys
Until each is connected, the Integrations page shows DISCONNECTED. Nothing is simulated.

## Environment variables (app/.env.example)
DATABASE_URL, ADMIN_EMAILS, APP_URL — never commit real secrets.
