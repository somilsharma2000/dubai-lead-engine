# ROUTE AND FEATURE INVENTORY
Generated from source inspection, 2026-10-11. Legend: UI ✅ functional · BE ✅ backend exists · DB ✅ persists · PERM ✅ permission enforced · TEST ✅ automated test · Live = integration state (SIM=simulated/none, CFG=activates with keys, VERIFIED=verified working)

## Pages (App Router)

| Route | Feature | UI | BE | DB | PERM | TEST | Notes |
|---|---|---|---|---|---|---|---|
| `/` | Public landing | ✅ | — | — | — | — | marketing page |
| `/login`, `/signup` | Auth | ✅ | ✅ | ✅ Session | n/a | ✅ | bcrypt; signup validation 400; weak pw 400 |
| `/dashboard` | Main dashboard + Garu tips | ✅ | ✅ | ✅ | ✅ | ✅ | real counts incl. social progress |
| `/leads` | CRM list, stage badges | ✅ | ✅ | ✅ | ✅ | ✅ | shared StageBadge |
| `/leads/new`, `/leads/[id]` | Lead detail, pipeline, notes, consent | ✅ | ✅ | ✅ | ✅ | ✅ | cross-org read → 404 (verified live) |
| `/conversations`, `/conversations/[id]` | AI conversation center | ✅ | ✅ | ✅ Message | ✅ | ✅ | drafts need approval; DENIED consent blocked 403 |
| `/properties` | Property inventory | ✅ | ✅ | ✅ | ✅ | ✅ | org-scoped |
| `/calendar` | Appointments + .ics export | ✅ | ✅ | ✅ | ✅ | ✅ | .ics auth-protected (401) |
| `/tasks` | Task board | ✅ | ✅ | ✅ | ✅ | ✅ | |
| `/campaigns` | Content pipeline (IDEA→POSTED) | ✅ | ✅ | ✅ | ✅ | ✅ | delete cleans up; cross-org 404 |
| `/social` | Social Growth specialist module (16 sections) | ✅ | ✅ | ✅ SocialAsset | ✅ `social.manage` | ✅ (12 checks) | idea→campaign promotion; auto-seeded library |
| `/workflows` | Automation control | ✅ | ✅ | ✅ Workflow/Run | ✅ | ✅ | toggle + retry |
| `/reports` | Funnel, sources, honesty note | ✅ | ✅ | ✅ | ✅ | ✅ | demo client can view own |
| `/settings` | Org settings, onboarding checklist | ✅ | ✅ | ✅ | ✅ | ✅ | |
| `/integrations` | Integration credentials | ✅ | ✅ | ✅ IntegrationConfig | ✅ OWNER | ✅ | values never re-rendered |
| `/billing` | Packages, Razorpay links | ✅ | ✅ | ✅ | ✅ | ✅ | no-keys → honest blocked activity |
| `/admin` (+ `/prospects`, `/services`, `/integrations`) | Founder OS super-admin | ✅ | ✅ | ✅ | ✅ PLATFORM_ADMIN | ✅ | demo user redirected 307 (verified live) |
| `/accept-invite` | Team invitation accept | ✅ | ✅ | ✅ Invitation | ✅ token | ✅ | expiring tokens |
| `/legal/[doc]` | Terms, Privacy | ✅ | — | — | public | — | |

## API routes

| Endpoint | Purpose | Auth | Test |
|---|---|---|---|
| `POST /api/auth/login|signup|logout` | Sessions | public / cookie | ✅ (rate limit: login 429) |
| `POST /api/auth/demo` | One-click demo login | public | ✅ |
| `GET/POST /api/leads`, `PATCH /api/leads/[id]` | CRUD + scoring | cookie | ✅ 401 unauth; zod 400 |
| `POST /api/tasks`, `POST /api/campaigns` | CRUD | cookie | ✅ |
| `GET /api/messages` | Conversation feed | cookie | ✅ (no GET handler on messages by design → 405) |
| `GET /api/dashboard`, `GET /api/reports` | Aggregates | cookie | ✅ 401 |
| `GET /api/appointments/[id]/ics` | Calendar export | cookie | ✅ 401 without cookie |
| `POST /api/public/lead` | Public lead capture (CORS for client sites) | public + honeypot + rate limit | ✅ junk→400, honeypot silently drops |
| `POST /api/garu/ask` | Garu Q&A (rule + optional LLM) | cookie | ✅ |
| `POST /api/workflows/[id]/toggle`, `runs/[id]/retry` | Automation control | cookie | ✅ |
| `GET /api/export/leads|backup` | CSV / JSON backup | cookie | ✅ 401 |
| `POST /api/demo`, `/api/demo/delete` | Demo lifecycle | admin-only for delete | ✅ non-admin blocked |
| `GET /api/admin/orgs` | Platform admin | PLATFORM_ADMIN | ✅ 401 unauth |
| `GET /api/health` | Uptime + DB check | public | ✅ |

## Integration status

| Integration | State | Detail |
|---|---|---|
| WhatsApp click-to-chat | **VERIFIED** | works keyless, tested (wa.me link asserted) |
| WhatsApp Cloud API auto-send | CFG | activates with `WHATSAPP_TOKEN` + `PHONE_NUMBER_ID` |
| AI (LLM drafts, Garu) | CFG | any OpenAI-compatible API; rule-based fallback always works |
| Razorpay payments | CFG | link generation live when keys set; no payment webhook (manual status) |
| Resend email | CFG | invite emails; link also shown in UI when email absent |
| Google/other OAuth | **NOT IMPLEMENTED** | registry schema exists, no OAuth flow (backlog) |
