# Garuda Lead Engine — Real Estate AI Growth OS

A production-ready, multi-tenant operating system for real estate agents:
lead capture with AI scoring, WhatsApp outreach, conversational drafts with
human approval, calendar, tasks, campaigns, workflows, team RBAC and billing.

**Live:** https://dubai-lead-engine.vercel.app

## Tech stack

- **Next.js 14 (App Router) + TypeScript** — server-rendered pages, server actions
- **Prisma + SQLite (dev) / PostgreSQL (prod)** — database
- **Tailwind CSS** — styling
- **Three.js** — Garu, the 3D assistant mascot
- **No external services required** — every integration (AI, WhatsApp, email,
  payments) activates automatically when its keys are set, and falls back to
  working rule-based behavior when they are not.

## Project structure

```
src/
  config.ts            # ALL environment access — the only file reading process.env
  app/                 # Routes only: pages, API routes, thin server-action barrels
    api/               # REST endpoints (consistent { ok, error } envelope)
    actions.ts         # Barrel re-exporting src/server/actions/* for pages
  server/              # Server-only code (never imported by client components)
    actions/           #  Business logic, one module per domain (leads, tasks, ...)
    action-utils.ts    #  Shared action helpers (S, recordUsage, permission ctx)
    api.ts             #  API error contract: ApiError, ok(), apiFail(), apiRoute()
    auth.ts            #  Sessions, password hashing, permission checks
    rbac.ts            #  Role → permission matrix
    db.ts              #  Prisma client singleton
    garu.ts            #  Garu assistant brain (reads real data, gives tips)
    workflow-engine.ts #  Event → automation engine
    integrations.ts    #  Third-party service registry
    whatsapp.ts, ai.ts #  Delivery + AI drafting clients
    demo.ts            #  Demo workspace seeding/reset
  lib/                 # Pure logic, safe on server and client
    scoring.ts         #  Lead scoring model
    social.ts          #  Social content builders
    format.ts          #  Date/number formatting helpers
  components/
    garu/              #  3D mascot scene + assistant panel
    ui/                #  Reusable primitives (badges, empty states)
scripts/               # CI-test suites and seeds (smoke, security, features)
tools/dev/             # Dev-only utilities (screenshots, clickbot) — not deployed
docs/                  # ARCHITECTURE.md, CODESTYLE.md
```

## Getting started

```bash
npm install
cp .env.example .env.local      # fill in what you have; everything optional but DATABASE_URL
npm run db:setup                # create the database
npm run dev                     # http://localhost:3000
```

The first signup becomes an org OWNER. Add `ADMIN_EMAILS` to grant a user
platform-admin access (the /admin area).

## Testing & deployment

```bash
npm run smoke        # end-to-end happy path against a running dev server
npm run security     # RBAC, cross-org isolation, input abuse
npm run features     # feature-level checks per module
npm run build        # production build (also pushes the Prisma schema)
```

Deploys automatically on push to `main` via Vercel.

## Environment variables

See `.env.example`. Highlights:

| Variable | What it unlocks |
|---|---|
| `DATABASE_URL` | Required — SQLite file or Postgres URL |
| `APP_URL` | Absolute links in emails/ICS exports |
| `ADMIN_EMAILS` | Platform admins, comma-separated |
| `AI_API_KEY` (+`AI_BASE_URL`, `AI_MODEL`) | LLM-powered reply drafting & Garu answers |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Automatic WhatsApp sending (click-to-chat works without) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Invitation emails |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Live payment links |

Every integration is optional: without keys the platform still works with
click-to-chat links, rule-based drafts and a manual payment fallback.
