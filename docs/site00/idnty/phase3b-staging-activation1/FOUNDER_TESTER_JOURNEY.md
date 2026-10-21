# Founder tester journey (plain English)

**Test run ID example:** `IDNTY-E2E-20261021-001` (pass on `create-test-client` as `test_run_id`)

## URLs

| Step | URL |
| --- | --- |
| Staging app | https://carefree-luck-staging.up.railway.app |
| Sign in | https://carefree-luck-staging.up.railway.app/origin/sign-in |
| Foundation readiness | https://carefree-luck-staging.up.railway.app/admin/site00/foundation-readiness |
| Pipeline | https://carefree-luck-staging.up.railway.app/admin/site00/foundation/pipeline |

## Before you start (Railway API — reliable-creation)

1. Confirm `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST` includes **your authorized tester inbox only**.  
2. When ready for email proof: set `SITE00_DF_TRANSACTIONAL_EMAIL_SEND=1` (staging only).  
3. Confirm Stripe secret is **test** mode (`sk_test_` or `rk_test_`).

## Create a test client (admin UI or API)

**UI:** Foundation readiness → create synthetic test client (if exposed) or use founder workspace controls.

**API:** `POST /api/admin/site00-foundation` with founder session cookie:

```json
{
  "action": "create-test-client",
  "display_name": "E2E Transport",
  "contact_email": "<YOUR ALLOWLISTED TEST EMAIL>",
  "test_run_id": "IDNTY-E2E-20261021-001"
}
```

Response includes `personalized_url` → open on staging:  
`https://carefree-luck-staging.up.railway.app/foundation/<token>`

## Send invitation (optional — only when send flag ON)

1. `GET ?action=email-timeline` — find invitation `intent_id`  
2. `GET ?action=prepare-test-invitation&intent_id=…` — verify link origin is carefree-luck  
3. `POST { "action": "dispatch-test-email", "intent_id": "…", "founder_approved_send": true }`

## Client path

1. Open email link (or paste personalized URL).  
2. Complete intake (include contact phone).  
3. Refresh — answers must persist.  
4. After founder releases quote (`quote-commercial-ready`), review P04/P05, accept, pay with Stripe test card.  
5. After webhook: portal Overview / Roadmap / Needs You / Records.

## Founder path

1. Open project in pipeline → command / workbench / runbook.  
2. Activate runbook, start/complete tasks (verification UI still disabled where no observed-value contract).  
3. Request client action → complete as client on Needs You tab.

## Completion

1. Satisfy completion gate or founder override per policy.  
2. Confirm board 11 view + records; reopen same foundation link — four tabs still work.

## Blocked on this agent run

- No authorized tester email configured in repo (by design).  
- No founder login session on cloud agent.  
- Email send flag off on live staging API.

See [NEXT_ACTIONS.md](./NEXT_ACTIONS.md).
