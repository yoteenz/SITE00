# Digital Foundation lifecycle contract (Phase 1)

## Persisted states (unchanged)

Artifact lifecycle transitions remain in `shared/site00-digital-foundation/lifecycle.ts`. **No renames** of persisted states in Phase 1.

## Surface resolution (server)

`resolveArtifactSurface` / `resolveArtifactSurfaceForClient` (`shared/site00-digital-foundation/surface.ts`):

| Condition | Surface | Client experience |
| --- | --- | --- |
| Refund / dispute | `PAYMENT_RECOVERY` | P06 recovery |
| Intake complete, unpaid | `INTAKE_SUBMITTED` / quote surfaces | Temporary queue (P03–P05) |
| Paid, not complete | `PORTAL` | Living portal (Overview, Roadmap, Needs You, Records) |
| Complete | `COMPLETE` or `BUILD_UPSELL` | **Same portal shell** + `COMPLETE` milestone view |

## Client route resolver (browser)

`resolveDfRoute` (`src/site00/foundation-client/model.ts`):

- **Pre-activation:** P01–P06 only (queue).
- **PORTAL:** P06 + portal views; default OVERVIEW after activation seen.
- **COMPLETE / BUILD_UPSELL:** P06 + portal views **including** `COMPLETE`; default OVERVIEW (BUILD_UPSELL defaults to COMPLETE milestone).

## Boundaries

1. **Payment ≠ activation:** `deriveActivationState` + Stripe webhook (`simulateStripeCheckoutCompleted` in tests) required before `PAID`.
2. **Activation pending:** P06 honest states (`ACTIVATION_PENDING`, `VERIFYING_PAYMENT`, …) — no fake success.
3. **Completion ≠ portal replacement:** Board 11 is a **view inside** `FoundationClient`, not a standalone app.
4. **Archived:** `kind: 'closed'` panel — retention policy unchanged.

## Completion gate (server)

`markFoundationComplete` + `assessArtifactCompletion` — client cannot self-assert complete; founder override only in tests/admin.
