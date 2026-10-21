# Automated founder E2E email journey (Phase 3B follow-up)

**Not merged to `main`.** Deploy this branch to **staging API + SPA only** after Railway configuration below.

## Authorized tester (exactly one)

`kateenaarmstrong@gmail.com` — hard-coded as `FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL` in `shared/site00-digital-foundation/founderE2eEmailJourney.ts`. The runner rejects any other `contact_email`.

## Railway — reliable-creation (API)

Set **before** enabling send:

| Variable | Expected |
| --- | --- |
| `SITE00_DF_FOUNDER_TEST_MODE` | `1` |
| `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST` | `kateenaarmstrong@gmail.com` (only this address) |
| `SITE00_PUBLIC_APP_ORIGIN` | `https://carefree-luck-staging.up.railway.app` |
| `RESEND_API_KEY` | Valid staging key; sender domain verified in Resend |
| `SITE00_DF_TRANSACTIONAL_EMAIL_SEND` | `0` until allowlist verified, then `1` for the run (API only — no `VITE_` required on Railway) |
| `STRIPE_SECRET_KEY` or `SITE00_STRIPE_SECRET_KEY` | `sk_test_…` or `rk_test_…` **or** set `SITE00_DF_FOUNDER_E2E_STRIPE_SIM=1` for checkout simulation |

Do **not** enable unrestricted send. Do **not** add Anthony or real client emails to the allowlist for this sprint.

## Founder steps (one authorization)

1. Sign in to staging SPA as founder admin.
2. Open **`/admin/site00/foundation-email-journey`** (or link from staging readiness desk).
3. Check **run authorization** once → **Start automated journey**.
4. Review Gmail inbox (sequential delivery; order in gallery is canonical).
5. Open gallery on the same page; inspect CTAs, copy, and provider IDs.
6. Inspect persistent test project in pipeline / client portal via `/foundation/:token` from run summary (token masked in UI).

## Automated lifecycle (real ops, not static blasts)

Synthetic client → invitation → intake submit → quote ready → accept + commercial ready → Stripe test checkout **or** `SITE00_DF_FOUNDER_E2E_STRIPE_SIM` → payment email → foundation complete (founder override + simulated ownership) → completion email.

FNDATN reminder templates (06/07) appear in gallery as **NOT_APPLICABLE** for this run.

## Evidence

After run: note `run_id`, `artifact_id`, Resend message IDs in gallery, and `summarizeRunEmailStats` from GET `automated-email-run`. Provider **DELIVERED** is from Resend poll/webhook — not the same as founder inbox confirmation (Gates W/X).

## Security

- POST `start-automated-email-journey` requires founder admin session + `founder_e2e_authorized: true`.
- Server-side allowlist and authorized email constant; `e2eRunAuthorized` does **not** bypass `SITE00_DF_TRANSACTIONAL_EMAIL_SEND=0`.
