# SITE 00 Invitation System V1

**Version:** `1.0.0` (`shared/site00-invitation-system/version.ts`)  
**Public route:** `/invite/:code`  
**Initial partner:** ALL IN ONE ENTERPRISES INC — PARTNER 001 (display `AIO`)  
**Initial collection:** INVITATION 001 (shared office QR)

## Product boundaries

- **SITE 00** owns invitation UX contracts, activation, Foundation continuity, and partner-facing presentation metadata.
- **Studio OS** (future persistence) owns referral ledger integrity, commission approval, and partner reporting contracts at scale.
- **AIO** is an external referral partner — not a client workspace owner and not granted private intake by default.

## Identity separation

| Identity | Purpose |
|----------|---------|
| `partner_id` | Referral partner (e.g. AIO) |
| `campaign_id` | Marketing / placement campaign |
| `invitation_code_id` | Server-managed code record |
| Public `code` | Opaque QR segment (no PII) |
| `visit_id` | Anonymous visit / dedupe |
| `activation_id` | Secure activation session |
| `verified_client_id` | After identity verification |
| Foundation `public_token` | Existing `/foundation/:token` journey |

## Invitation types

1. **SHARED_OFFICE** — one QR per campaign batch (AIO front office stack).
2. **PERSONALIZED** — unique opaque code; reference only, not an auth credential.

## Attribution policy

- File: `shared/site00-invitation-system/attributionPolicy.ts`
- Version: `1.0.0-draft`
- **Founder approval:** `PENDING` — configurable rules; no silent first/last-touch lock-in.

## Commission rules

- File: `shared/site00-invitation-system/commissionRules.ts`
- Version: `1.0.0-unapproved`
- **Rates:** `draft_fixed_reward_minor` and `draft_basis_points` are **null** until commercial approval.
- **Live payouts:** `false`

## API

| Endpoint | Access | Actions |
|----------|--------|---------|
| `/api/site00/invitation` | Public | `resolve`, `visit`, `begin-activation`, `complete-activation` |
| `/api/admin/site00-invitation` | Admin | `founder-review`, `partner-report`, `qr-asset`, `record-conversion-event`, `test-set-activation-secret` (non-prod) |

### Verification delivery

`resolve` and `begin-activation` return `verification_delivery`:

- `DEVELOPMENT_INLINE`: only when `SITE00_VITE_LOCAL_API=1` and `NODE_ENV` is not production. `begin-activation` also returns `development_verification_code`.
- `PENDING_IDNTY`: every other environment. No code is returned and the UI blocks activation until IDNTY delivery is wired.

`persistence` is `IN_MEMORY` until the Supabase store is connected.

## Foundation integration

Activation calls `createArtifactForLead({ referral_kind: 'AIO' })` and navigates to `/foundation/:token`. Idempotent completion reuses the same artifact.

## Persistence

- **Runtime (dev / this sprint):** in-memory store `api/_lib/invitationSystem/memoryStore.ts`
- **Migration (future):** `supabase/migrations/20261009180000_site00_invitation_system_v1.sql`

## Safeguards (this sprint)

- No public production campaign activation
- No live referral payouts
- No commission from scans alone
- No hardcoded $50 / 5% rates

## Fixtures

`shared/site00-invitation-system/fixtures.ts` — AIO office code, expired, revoked.

## Tests

`tests/invitationSystem.test.ts`, `tests/invitationActivationExperience.test.tsx`. Browser QA: `scripts/site00/invitation001/qa-invitation-activation.mjs`.
