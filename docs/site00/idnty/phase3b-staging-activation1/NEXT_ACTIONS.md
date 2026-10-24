# Next actions (founder-ordered)

## Release-blocking

1. **Authorize tester email** — add to `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST` on staging API (you choose the address; agent did not send mail).  
2. **Enable transactional send** — `SITE00_DF_TRANSACTIONAL_EMAIL_SEND=1` on staging API only when ready.  
3. **Confirm Stripe test keys** — Railway `STRIPE_SECRET_KEY` must be test prefix; webhook URL → staging API.  
4. **Redeploy staging** to PR **#1684** branch `cursor/idnty-phase3b-automated-e2e-email-b71a` @ **`e907a6331`** (API + SPA) — see [FOUNDER_NEXT_ACTIONS.md](./FOUNDER_NEXT_ACTIONS.md) and [STAGING_DEPLOYMENT_REPORT.md](./STAGING_DEPLOYMENT_REPORT.md) (2026-10-24 audit: live deploy still **`34d9afa`**).  
5. **Run** [FOUNDER_TESTER_JOURNEY.md](./FOUNDER_TESTER_JOURNEY.md) end-to-end; capture Resend + Stripe dashboard IDs (redacted in docs).  
6. **Gate W + X** — visual + release approval before production.

## Non-blocking follow-ups

- Record download contract + wire 13A buttons  
- RUN VERIFICATION observed-value contract  
- Builder credit redemption E2E  
- Redeploy API to pick up `rk_test_` stripe mode diagnostics (Phase 3B branch)

## Rollback

- Railway: redeploy previous successful deployment for carefree-luck + reliable-creation  
- Disable `SITE00_DF_TRANSACTIONAL_EMAIL_SEND` immediately if misdirected mail  
- Persistence: do **not** disable Supabase flag after real test data without export

## Merge order

1. Approve and merge **#1681** (Phase 3 integration)  
2. Merge Phase 3B PR (**#1682** or successor) for tooling/docs/stripe prefix fix  
3. Redeploy staging → re-run `df-staging-health-gate.mjs`
