# IMPLEMENTATION PLAN — 10 phases (Oct 10, 2026)

- Phase 1 Audit & research — DONE (docs/PROJECT_AUDIT.md, docs/research/competitors.md)
- Phase 2 Architecture & data model — DONE (schema in app/prisma/schema.prisma; RBAC matrix; dashboard formulas in PRD)
- Phase 3 Foundation: auth, orgs, sessions, RBAC, app shell — IN PROGRESS this build
- Phase 4 Core OS: leads, notes, tasks, properties, appointments, workflow engine, dashboard — IN PROGRESS this build
- Phase 5 Founder OS: admin console, prospects, packages, onboarding, integrations status — IN PROGRESS this build
- Phase 6 AI: constrained drafting, approval queue, cost metering — PLANNED (BLOCKED: AI provider key; engine hooks in place)
- Phase 7 Integrations: WhatsApp BSP, Razorpay, Google Calendar — BLOCKED on credentials; adapters + guides stubbed, honest status UI only
- Phase 8 Hardening: smoke tests executed, isolation + RBAC negatives, a11y pass — partial this build (see BUILD_STATUS)
- Phase 9 Deployment: Vercel + Supabase — instructions ready; BLOCKED on owner creating accounts (2 free signups)
- Phase 10 Handover: README-APP, runbooks, this doc + BUILD_STATUS — this build

## Cost model (documented assumptions)
Hosting: Vercel Hobby $0 → Pro $20/mo only if needed. DB: Supabase free (500MB) → $25/mo at scale. WhatsApp: Meta per-template pricing (varies by country; metered in-app later). AI: per-request, budgeted per org (Phase 6). Assumption at 25 clients × $1,800 avg ≈ $45k MRR; infra ≈ $200–500/mo; messaging/AI pass-through ≈ $5–15/client/mo. [H — to be verified with real usage]
