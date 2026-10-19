# Founder device QA handoff

Parity recovery unblocks the **existing** Sprint B script:

`docs/site00/idnty/form-control-staging-e2e-acceptance-b/IPHONE_SAFARI_FOUNDER_QA.md`

## Before device QA

1. Confirm API health still shows `255576b5` (or newer integration SHA).
2. Run on desktop: `node scripts/staging/staging-live-spa-form-control-smoke.mjs` → industry **`button`**.

## Authenticated staging E2E (founder)

1. Sign in at `https://carefree-luck-staging.up.railway.app/admin/site00/foundation-readiness`.
2. Create client: display name prefix **`IDNTY E2E ACCEPTANCE — SYNTHETIC`**.
3. Open personalized `/foundation/…` link on **iPhone Safari**.
4. Complete steps 5–20 in `IPHONE_SAFARI_FOUNDER_QA.md`.

Agent **cannot** automate step 1 without founder credentials — do not bypass auth.

## After device QA

Update Sprint B `FOUNDER_ACCEPTANCE_SUMMARY.md` classification if all gates pass.
