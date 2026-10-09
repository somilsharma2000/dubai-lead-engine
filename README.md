# Lead Engine — Real Estate AI Growth OS

Two things live in this repo:

## 1. The OS (the product) — folder `app/`
A full multi-tenant SaaS platform for real estate agencies: CRM, leads,
conversations, campaigns, appointments, workflows, billing, and a
founder super-admin console.

- **Try it on your PC:** open **PREVIEW-GUIDE.md** (one-click, no accounts, free)
- **Login:** somil@leadengine.com / Password123! (dev-only)
- **Status & checklist:** docs/BUILD_STATUS.md
- **Tests:** 30/30 automated tests pass (`npm run smoke` inside `app/`)
- **Tech:** Next.js 14 + Prisma + SQLite (swap to Supabase later by changing one setting — no rebuild)

Everything works now in demo mode. Connections (WhatsApp, AI, payments,
email, social) get switched on later — each one shows its honest status
and steps in the Integrations console inside the app.

## 2. The landing page (marketing site) — folder `docs/`
Live at: https://somilsharma2000.github.io/dubai-lead-engine/

Static site, WhatsApp-connected lead form. To change the WhatsApp number,
edit `WA_NUMBER` near the bottom of `docs/index.html`.

## Repo map
| Path | What it is |
|---|---|
| `app/` | The Growth OS (full SaaS product) |
| `docs/` | Landing page + project documents |
| `PREVIEW-GUIDE.md` | How to run the OS on your PC in 10 minutes |
| `START-OS.ps1` | One-click launcher for Windows |
| `01–05 folders` | Outreach scripts, lead lists, playbooks |
