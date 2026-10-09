# PRODUCT REQUIREMENTS — Growth OS v1 (Oct 10, 2026)
Owner: Somil Sharma. One line: the software that runs a global real-estate lead agency ($950/$1,800/$3,250 monthly tiers, USD/AED/INR display).

## Roles (server-enforced via src/rbac.ts)
PLATFORM_ADMIN, PLATFORM_OPS, OWNER, AGENCY_ADMIN, AGENCY_MEMBER, CLIENT_OWNER, CLIENT_MEMBER, ANALYST
Permissions matrix in `app/src/rbac.ts`. Frontend hiding is cosmetic only; every API route and server action re-checks.

## Feature registry (traceability matrix — status updated as build progresses)
| ID | Requirement | Phase | Status |
|---|---|---|---|
| AUTH-1 | Signup creates User + Organization + OWNER membership + default workflows | 3 | IMPLEMENTED |
| AUTH-2 | Login/logout with hashed passwords (bcrypt) + DB sessions, httpOnly cookies | 3 | IMPLEMENTED |
| AUTH-3 | Password reset via admin (email sending BLOCKED — no provider credentials) | 3 | BLOCKED |
| RBAC-1 | Permission matrix, 8 roles, checked in every route/action | 3 | IMPLEMENTED |
| TEN-1 | Tenant isolation: every query org-scoped; cross-org access returns 404 | 3 | IMPLEMENTED |
| LEAD-1 | Lead CRUD: name/phone/email/source/city/country/intent/type/budget/stage/consent | 4 | IMPLEMENTED |
| LEAD-2 | Explainable qualification score (factors + points shown in UI) | 4 | IMPLEMENTED |
| LEAD-3 | Stage pipeline NEW→CONTACTED→QUALIFIED→VIEWING→NEGOTIATION→WON/LOST, archive | 4 | IMPLEMENTED |
| LEAD-4 | Notes, tasks, activity history per lead | 4 | IMPLEMENTED |
| LEAD-5 | Search + stage/source filters + CSV export | 4 | IMPLEMENTED |
| LEAD-6 | CSV import, merge, dedupe | 4 | PLANNED |
| PROP-1 | Property records + lead matching by budget/area/type | 4 | IMPLEMENTED |
| PROP-2 | Public listing pages | 8 | PLANNED |
| CAL-1 | Appointments w/ conflict detection (server-verified before CONFIRMED) | 4 | IMPLEMENTED |
| CAL-2 | Google Calendar sync | 7 | BLOCKED — provider credentials |
| WF-1 | Workflow engine: triggers, conditions, actions, execution log, idempotency (unique eventKey), attempts/retry/dead-letter | 4 | IMPLEMENTED |
| WF-2 | Approval gates for consequential actions | 6 | PLANNED |
| AI-1 | AI reply drafting constrained to property DB + business facts | 6 | BLOCKED — provider key |
| AI-2 | Cost/usage tracking per org | 6 | PLANNED |
| INT-1 | Integrations page: honest status only (DISCONNECTED + setup guides) | 5 | IMPLEMENTED |
| INT-2 | WhatsApp Business API adapter | 7 | BLOCKED — BSP credentials |
| BILL-1 | Packages, entitlement fields, subscription state | 5 | IMPLEMENTED (state only) |
| BILL-2 | Razorpay webhooks w/ signature verification | 7 | BLOCKED — provider keys |
| ADM-1 | Platform console: orgs, members, flags, audit log | 5 | IMPLEMENTED |
| ADM-2 | Prospect CRM for founder outreach (seeded from 02-leads/) | 5 | IMPLEMENTED |
| ONB-1 | Client onboarding checklist template | 5 | IMPLEMENTED (static checklist per org settings page) |
| REP-1 | Dashboard metrics with defined formulas (see below) | 4 | IMPLEMENTED |
| DEL-1 | Deployment: Vercel + Supabase instructions | 9 | BLOCKED — owner accounts |
| TST-1 | Smoke test suite (auth, tenant isolation, RBAC negative, workflow, export) | 8 | IMPLEMENTED (scripts/smoke.mjs) |

## Dashboard metric definitions (every card has a formula)
- New leads (7d): count(Leads, createdAt ≥ now−7d, orgId)
- Response rate: leads with ≥1 note/task by agent within 48h of creation ÷ new leads (30d window)
- Qualified: stage in [QUALIFIED, VIEWING, NEGOTIATION, WON]
- Pipeline value: sum(budgetMax) of non-lost/non-won active stages (labelled "estimate — from stated budgets")
- Overdue tasks: dueAt < now, status OPEN
- Upcoming viewings: appointments next 7d, status CONFIRMED or REQUESTED
All computed live via Prisma from the org's own data. Demo data (when loaded) is labelled "Demo".

## Non-goals (v1)
IDX/MLS, website builder, funnel builder, multi-region legal automation, LLM autonomy over money/access/consent.
