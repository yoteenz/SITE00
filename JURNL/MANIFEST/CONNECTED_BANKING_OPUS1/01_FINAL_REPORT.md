# 01 · FINAL REPORT (contract format)

```
SPRINT:
P0.JURNL.FOUNDER-ACTIVATION.CONNECTED-BANKING-AND-MONEY-END-TO-END.PRODUCTION-READINESS.OPUS1

STATUS:
PARTIAL / READY FOR FOUNDER-CONTROLLED VALIDATION
(all code + local validation done; Plaid sandbox, real Supabase auth/email,
live institutions and deployment are blocked on founder-controlled actions)

REPOSITORY:
yoteenz/SITE00

SOURCE_BRANCH:
claude/jurnl-overlays-micro-assets-opus5-um0u93 (PR #1725)
+ merged cursor/jurnl-founder-entitlements-isolated-v1-4e5a (PR #1708 line)

SOURCE_SHA:
b6b2f2693dd3462d8f901c85466323e287700f51

IMPLEMENTATION_BRANCH:
claude/jurnl-connected-banking-activation-um0u93

FINAL_SHA:
HEAD of claude/jurnl-connected-banking-activation-um0u93 (exact SHA in the delivery message; last code commit c5d93e384)

DRAFT_PR:
https://github.com/yoteenz/SITE00/pull/1727 (draft, base = #1725 branch)

AUTH_REGISTRATION:        PASS (browser E2E vs stubbed auth) · real Supabase NOT VERIFIED
EMAIL_VERIFICATION:       FAIL — real delivery NOT VERIFIED (no approved JURNL Supabase project + SMTP);
                          code path: unverified sign-in refused (E2E, stubbed)
LOGIN:                    PASS (browser E2E vs stubbed auth) · real Supabase NOT VERIFIED
PASSWORD_RESET:           FAIL — implemented (redirect, recovery session, token_hash), not exercised
                          against a real Supabase project
FOUNDER_ENTITLEMENT:      PASS (server-side FOUNDER_FULL, merged #1708 line; banking gated on it)
PRODUCTION_DATA_PERSISTENCE: PASS (revision CAS + audit + RLS on disposable Postgres;
                          hosted DB not migrated)
REAL_ACCOUNT_CLEAN_SEED:  PASS

PROVIDER_ADAPTER:         IMPLEMENTED
PLAID_SANDBOX_LINK:       FAIL — BLOCKED: client id now supplied; Plaid rejects the proxy-injected
                          sandbox secret as malformed (INVALID_FIELD). Re-save the 30-char sandbox secret.
PLAID_TRANSACTIONS_SYNC:  FAIL — BLOCKED (sandbox); sync engine PASS on disposable DB
PLAID_WEBHOOKS:           FAIL — BLOCKED (sandbox); verification PASS with real ES256 signatures
CONNECTED_CHECKING:       LIVE_NOT_TESTED
CONNECTED_CREDIT_CARD:    LIVE_NOT_TESTED
UBER_PRO_CARD:            NOT_TESTED (catalog check implemented; needs keys)
LYFT_DIRECT:              NOT_TESTED (catalog check implemented; needs keys)

BALANCE_SYNC:                   PASS (synthetic, disposable DB)
TRANSACTION_IMPORT:             PASS
PENDING_POSTED_RECONCILIATION:  PASS
TRANSFER_DEDUPLICATION:         PASS
CREDIT_PAYMENT_RECONCILIATION:  PASS
RIDESHARE_EARNINGS:             PASS
CASH_ON_HAND:                   PASS
BILLS_SUBSCRIPTIONS:            PASS
SET_MONEY_ASIDE:                PASS
SAFE_TO_SPEND:                  PASS
USER_CATEGORY_OVERRIDES:        PASS

CONNECTION_REAUTH:        PASS (synthetic provider + browser E2E)
CONNECTION_DISCONNECT:    PASS (synthetic provider + browser E2E)
CROSS_SESSION_RESTORE:    PASS
CROSS_DEVICE_RESTORE:     PASS
RLS_SECURITY:             PASS (disposable Postgres, real policies)
FOUNDER_E2E:              33 / 33 (synthetic; not live banking)

TYPECHECK:                clean
BUILD:                    pass (verify-production-dist OK, 472 JS assets)
UNIT_TESTS:               1133 / 1133 (67 files; connected banking 124 / 124)
INTEGRATION_TESTS:        disposable Postgres (all JURNL migrations, RLS) 17 / 17 · banking service 21 / 21 ·
                          HTTP 5 / 5 · 33-step acceptance 33 / 33 · Plaid sandbox BLOCKED (secret rejected)
E2E_TESTS:                connected banking 9 / 9 (mobile, tablet, desktop) · regression (mobile) 76 passed,
                          1 load-timeout flake (passes 2/2 alone), 2 skipped (prod-mode, run separately)
RESPONSIVE_VALIDATION:    6 viewports (360x640, 393x660, 393x852, 430x932, 834x1194,
                          1440x900): no horizontal overflow; panel contained
IOS_SAFARI:               UNVERIFIED

PLAID_COST_ESTIMATE:
3–4 Items × Plaid Transactions monthly per-Item fee (price not published;
shown on the Production request page). $0 under the Trial plan (≤ 10 Items)
until upgrade. Auth off (0 one-time). No Balance / Refresh calls (0 per-request).

PAID_PROVIDER_SPEND:      0
LIVE_BANK_CREDENTIALS_ACCESSED: NO
PRODUCTION_DB_MUTATIONS:  0
MERGE:                    NONE
DEPLOYMENT:               NONE

COMPACT_EVIDENCE_ZIP:     JURNL_CONNECTED_BANKING_OPUS1_COMPACT.zip (sent in chat)
FULL_EVIDENCE_ZIP:        JURNL_CONNECTED_BANKING_OPUS1_FULL.zip (sent in chat)

EXTERNAL_BLOCKERS:
B-1 sandbox secret injected for sandbox.plaid.com is rejected by Plaid as malformed
    (client id supplied in chat; sandbox runs blocked until the secret is re-saved)
B-2 no approved JURNL Supabase project (real auth/email/RLS-hosted/grant)
B-3 plaid.com not reachable from this environment (pricing from search results)
B-4 local GoTrue/PostgREST binaries refused by session policy (PGlite used)
B-5 no live-institution approval / no Plaid Production access
B-6 no deployment authorization

FOUNDER_APPROVALS_REQUIRED:
F-1 re-save the Plaid SANDBOX secret (Dashboard → Developers → Keys → Sandbox, 30 hex chars,
    no prefix/spaces) for sandbox.plaid.com → re-run the sandbox script
F-2 approve a staging Supabase project: apply 3 migrations, email confirm + SMTP
F-3 create your FOUNDER_FULL grant on staging
F-4 Plaid Production request: read per-Item price, choose plan, keep Auth off
F-5 approve 3–4 Items of Transactions spend (or Trial)
F-6 authorize a staging deploy (API + SPA) with JURNL_BANK_WEBHOOK_URL
F-7 connect your accounts yourself via CONNECT A BANK; fill the live matrix
Decisions: D-1 who may connect · D-2 deletion vs grant audit · D-3 MONEY
entry-point placement · D-4 long-name drawer layout

NEXT_ACTION:
RETURN IMPLEMENTED CODE, DRAFT PR, FULL TEST RESULTS, RUNTIME EVIDENCE,
BOTH ZIP PACKAGES, AND THE SHORTEST POSSIBLE FOUNDER ACTION LIST.

STOP.
```
