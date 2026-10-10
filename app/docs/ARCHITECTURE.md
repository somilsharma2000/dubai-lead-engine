# Architecture

## Core principles

1. **Server-first.** Every page reads its data on the server via Prisma and
   renders HTML. There is no client-side store (no Redux/Zustand) because the
   app is form-and-table driven: mutations go through server actions, then
   `revalidatePath()` re-renders the affected page. The only stateful client
   components are the Garu 3D scene (animation state) and its assistant panel
   (the current question/answer).
2. **Tenant isolation everywhere.** Every query filters by `orgId` from the
   session context (`requireCtx()`/`requirePerm()`); every write attaches it.
   There are no endpoints that accept an org id from the client.
3. **Graceful degradation.** External services (AI, WhatsApp, email, payments)
   are optional: each has a `*Configured()` check in `src/config.ts` and a
   working fallback path.
4. **One error contract.** API routes return `{ ok: true, ... }` or
   `{ ok: false, error }` with the statuses documented in `src/server/api.ts`.

## Request flow

```
Browser ── form POST ──▶ server action (src/server/actions/<domain>.ts)
                            │ requirePerm → permission check
                            │ prisma write (orgId attached)
                            │ handleEvent() → workflow engine (automation)
                            │ revalidatePath()
                            └─▶ re-rendered page

Browser ── fetch ──▶ API route (src/app/api/**/route.ts)
                       │ zod validation
                       │ prisma query (orgId filtered)
                       └─▶ ok(data) / apiFail(e)   ← consistent envelope
```

## Layers

| Layer | Location | Rule |
|---|---|---|
| Routes / UI | `src/app/**` | Pages stay thin: fetch data, render, delegate to actions. No business rules here. |
| Server actions | `src/server/actions/**` | One file per domain. Own permission checks, validation, writes, workflow events. |
| Services | `src/server/*.ts` | Cross-cutting logic: workflow engine, Garu brain, scoring entry, delivery clients. |
| Pure logic | `src/lib/**` | No Prisma, no I/O. Testable anywhere (scoring, social builders, formatting). |
| Config | `src/config.ts` | The only `process.env` reader. Exports a typed `config` object + `*Configured()` checks. |

Client components must never import from `src/server/**` — that boundary is
what keeps secrets (AI keys, DB) out of the browser bundle.

## Data model (Prisma)

- `Organization` — the tenant. Everything hangs off `orgId`.
- `User` — members of an org, with `role` (OWNER/ADMIN/AGENT) and hashed password.
- `Lead` — scored by `computeLeadScore()`, staged NEW→CONTACTED→…→WON/LOST.
- `Message` — conversation log; status PENDING→APPROVAL_PENDING→APPROVED→SENT.
- `Appointment`, `Task`, `Property`, `Campaign` — operational records.
- `Workflow` / `WorkflowRun` — automation definitions and their execution log.
- `Activity`, `UsageEvent` — audit trail and per-day metric counters.
- `OnboardingItem` — per-org setup checklist.

## Error handling contract

| Status | Meaning |
|---|---|
| 401 | No session (also used when a server action's redirect is caught in a route) |
| 403 | Session valid, permission missing |
| 404 | Not found or owned by another org |
| 400 | Validation failure |
| 500 | Unexpected — logged server-side, generic message returned |

Pages additionally have `src/app/error.tsx` (crash boundary) and
`not-found.tsx`.

## Garu assistant

`src/server/garu.ts` reads the org's real data and produces prioritized tips
(urgent → good → info). The client-side 3D scene (`src/components/garu/`)
displays them and can answer free-form questions through
`POST /api/garu/ask` — rule-based by default, LLM-enhanced when configured.
