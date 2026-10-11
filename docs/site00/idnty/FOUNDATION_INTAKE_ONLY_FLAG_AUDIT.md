# Foundation intake-only launch flag audit

**Flag:** `SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY=1` (Railway API — server env only)

## Implementation (code on `main`)

| Control | Location | Behavior |
| --- | --- | --- |
| Checkout block | `api/_lib/digitalFoundation/service.ts` → `createCheckoutSession` | Throws `LAUNCH_GATE_INTAKE_ONLY` when flag on |
| Client surface cap | `shared/site00-digital-foundation/surface.ts` → `resolveArtifactSurfaceForClient` | After intake complete, surface `INTAKE_SUBMITTED` instead of quote/checkout |
| UI | `FoundationClient.tsx` → `P03IntakeSubmitted` when surface is `INTAKE_SUBMITTED` | Honest submission state |

## Paid / active project safety

When flag is on, **unchanged** for:

- `payment_state === 'PAID'`
- `project_state !== 'NOT_STARTED'`
- `completion_state === 'COMPLETE'`

Those artifacts receive normal portal/checkout surfaces (`surface.ts` lines 30–31).

## Production runtime status

| Item | Status |
| --- | --- |
| Flag readable on Railway | **UNVERIFIED** (not exposed until `/api/health` `digitalFoundation` block deployed) |
| Server-side checkout block live | **UNVERIFIED** on `api.site00.com` at SHA `4bf6fa50` (#1573 era — launch gate landed in #1577) |
| React intake-submitted UI on site00.com | **UNVERIFIED** (SPA stale Sep 2026 bundle) |

## Automated tests

- `tests/digitalFoundationLaunchGate.test.ts` — PASS (vitest, in-process)

## Gate A allowed / blocked (when flag ON)

| Allowed | Blocked |
| --- | --- |
| Open link, intake, save, resume, submit | Live Stripe checkout session |
| `INTAKE_SUBMITTED` confirmation | False “paid” / “activated” |
| Founder admin read | Unverified messaging CTAs as full service |

## Founder action

1. Set env on **Railway production** service (not Vite).
2. Redeploy API from `main` ≥ `7ba509e6` (#1577) or latest `2001e373`.
3. Deploy SPA ≥ same lineage so client shows `P03IntakeSubmitted`.
4. Verify: complete disposable intake → client stays on submission surface; `start-checkout` returns error `LAUNCH_GATE_INTAKE_ONLY`.
