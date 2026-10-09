# How to preview the Growth OS on your PC (no accounts, free, 10 minutes)

## One-click way (recommended)
1. Install Node.js once: https://nodejs.org → download LTS → install (click Next until done).
2. Download the OS code: go to https://github.com/somilsharma2000/dubai-lead-engine
   → green "Code" button → "Download ZIP" → extract (right-click → Extract All).
3. Open the extracted folder → right-click **START-OS.ps1** → **Run with PowerShell**.
4. Wait ~5 minutes (it installs, builds, and starts automatically).
5. Your browser opens at http://localhost:3000/login

## Demo login (dev-only, safe)
- Email: somil@leadengine.com
- Password: Password123!
The workspace is pre-loaded with demo leads, conversations, campaigns, properties.

## What to try (2-minute tour)
1. Dashboard: live metrics computed from the demo data.
2. Leads: open "Demo — Rajesh Mehta" → see his score, matching properties, notes, tasks.
3. Conversations: open Rajesh → a rule-based draft is waiting → "Approve & send" it.
4. Campaigns: move "Diwali offer post" through the pipeline stages.
5. Workflows: see execution history of the automation engine.
6. Settings: tick onboarding items — they stay ticked after you reload (real database).
7. Admin console (you are platform admin): organizations, audit log, prospects.
8. Integrations: every connection honestly shows NOT CONNECTED with steps for later.
9. Dashboard → "Clear demo data" / "Load demo data" = one-click demo reset.

## Honest limitations of this preview
- Runs on your PC (localhost) — only you can see it. It is a preview, not production.
- WhatsApp/email/AI/payments are NOT connected — those need credentials (Stage 6, after your approval).
- Demo data is labelled "Demo —" so you can clear it in one click.
- Architecture is production-ready: swap DATABASE_URL to a Supabase connection string later and the same app runs in the cloud. No rebuild.
