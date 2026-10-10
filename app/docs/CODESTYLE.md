# Code style

Follow these rules when adding anything new.

## Naming

| Thing | Convention | Example |
|---|---|---|
| Files (lib/server) | kebab-case | `workflow-engine.ts`, `scoring.ts` |
| React components | PascalCase file + named export | `GaruScene.tsx` → `GaruScene` |
| Server actions | `verbNounAction` | `createLeadAction`, `approveMessageAction` |
| API routes | lowercase, plural resources | `/api/leads`, `/api/tasks` |
| DB enums | UPPER_SNAKE | `APPROVAL_PENDING`, `NEW` |
| Functions | camelCase, verbs | `computeLeadScore`, `garuInsights` |
| React state | `use<State>` or plain noun | `useGuruOpen`, `answer` |

## Layering rules

1. `process.env` **only** in `src/config.ts`.
2. Prisma **only** in `src/server/**` (plus `src/app/api/**` route handlers).
3. `src/lib/**` stays pure — no DB, no fetch, no secrets. Safe for client.
4. Client components never import from `@/server/**`.
5. New domain? Add `src/server/actions/<domain>.ts` and re-export it in
   `src/app/actions.ts`.

## Error handling

- API routes: validate with zod, then `return ok({...})` or let `apiFail(e)`
  map the error. Never return a raw `e.message` with status 500 — use
  `throw new ApiError(status, message)` for known failures.
- Server actions: throw only for truly unexpected states; otherwise record an
  `Activity` row (audit trail) and revalidate.
- No empty `catch {}` on fetches that matter — at minimum log to `Activity`.

## Forms and mutations

- Read form data with the shared `S()` helper (trims, returns null not '').
- Every mutation: `requirePerm('<domain>.<verb>')` → validate → write with
  `orgId` → `handleEvent()` for automation → `revalidatePath()`.

## Styling

Tailwind utility classes only, using the shared classes in `globals.css`
(`card`, `btn-gold`, `btn-ghost`, `badge`, `td`). Repeated visual patterns get
a component in `src/components/ui/`, not a copy-pasted class string.

## Testing

Every feature ships with checks in `scripts/features.mjs`; security invariants
in `scripts/security.mjs`; the full happy path in `scripts/smoke.mjs`.
New endpoints must add at least: happy path + unauthenticated case.
