# Release gate matrix — final (live activation sprint)

**Sprint:** `P0.SITE00.IDNTY.PHASE3B.STAGING-DEPLOYMENT-AND-LIVE-FOUNDER-E2E-ACTIVATION1`  
**Legend:** PASS · FAIL · BLOCKED · NOT_RUN · FOUNDER_REVIEW_REQUIRED

| Gate | Requirement | Result | Evidence | Blocker | Required action |
| --- | --- | --- | --- | --- | --- |
| A | SPA + API health | **PASS** | `df-staging-health-gate.mjs` | — | — |
| B | Allowlist active (authorized tester only) | **BLOCKED** | Health: allowlist present; exact addresses not verified | Cannot read Railway values | Founder confirms allowlist = `kateenaarmstrong@gmail.com` only |
| C | Real Resend staging delivery | **BLOCKED** | Send flag off; no live run | Deploy E2E SHA + enable send for window | Deploy + run journey |
| D | Synthetic project persisted | **NOT_RUN** | No live run | Deploy + founder session | Execute automated journey |
| E | Lifecycle transitions valid | **NOT_RUN** | Unit test only on branch | Live deploy | Live run |
| F | Emails from real lifecycle events | **NOT_RUN** | — | Deploy | Live run |
| G | Resend dispatch | **NOT_RUN** | — | Send flag + deploy | Live run |
| H | Provider message IDs captured | **NOT_RUN** | — | Live run | Gallery + API stats |
| I | Provider delivery status | **NOT_RUN** | — | Live run | Resend poll/webhook |
| J | Order + idempotency | **PARTIAL** | Unit tests | Live dedupe not exercised | Optional isolated tests post-run |
| K | Email review gallery complete | **BLOCKED** | SPA lacks journey route on `34d9afa` | SPA redeploy | Deploy `e907a6331` |
| L | CTA destinations valid | **NOT_RUN** | — | Live run | Founder gallery review |
| M | Stripe test + webhook | **BLOCKED** | `stripeKeyMode: unrecognized` | Confirm test key or `SITE00_DF_FOUNDER_E2E_STRIPE_SIM=1` | Railway Stripe env |
| N | Founder ops / runbook | **NOT_RUN** | — | Live run | — |
| O | Provider simulation labeled | **NOT_RUN** | — | Live run | — |
| P | Foundation complete persisted | **NOT_RUN** | — | Live run | — |
| Q | Four-tab portal after complete | **NOT_RUN** | — | Live run | Portal validation doc |
| R | Records access | **NOT_RUN** | — | Live run | — |
| S | Foundation credit issued | **NOT_RUN** | — | Live run | — |
| T | Builder handoff | **NOT_RUN** | — | Live run | — |
| U | Security / RLS | **PASS** | Staging ref + RLS SQL sample; admin 401 | Live cross-client not run | Optional post-run checks |
| V | Complete automated staging journey | **FAIL** | Deploy SHA mismatch | API/SPA on `34d9afa` | Redeploy `e907a6331` + run |
| W | Founder email inbox + copy review | **FOUNDER_REVIEW_REQUIRED** | No live emails sent | — | After live run |
| X | Founder release approval | **FOUNDER_REVIEW_REQUIRED** | — | — | After W |

**Overall release readiness for Anthony invitation:** **NOT READY** (Gates V, W, X incomplete).
