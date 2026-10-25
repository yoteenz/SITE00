# 21 — Completion report

## Acceptance (§33)

| | Criterion | Result | Evidence |
| --- | --- | --- | --- |
| A | PR dependency graph reconciled | PASS | 02 |
| B | Durable database-backed RecordStore | PASS on an isolated PostgreSQL 16; staging BLOCKED | 03, 04, 20 |
| C | Migrations pass isolated validation | PASS | 04; security 20/20; policies 16/16; spine applied twice |
| D | Private media storage implemented and verified at the available level | PASS at the isolated level; live BLOCKED | 06, 07 |
| E | Spending gates cover all relevant generation paths | **PARTIAL**: the spine is fully gated; 15 ungated and 10 client-flag-only paths elsewhere (D-I) | 08, 09 |
| F | Authorization enforced at dispatch | PASS (spine) | 08; dry run steps 4–6 |
| G | Takes persist across process restarts | PASS | dry run step 11; durable tests |
| H | Approval events keep immutable history | PASS (application and database, even for the owner) | 12; durable tests |
| I | Duplicate generation jobs blocked | PASS | 12; dry run step 15 |
| J | Cross-project access denied | PASS | 05; dry run step 17 |
| K | First-shot packet reflects current approvals | PASS (generated from canon, `--check` current) | 15, 16 |
| L | SH01 zero-spend simulation passes | PASS, 20/20 | 17 |
| M | Real provider calls remain disabled | PASS | 10; dry run step 19 |
| N | No media credits spent | PASS | — |
| O | No production database mutations | PASS: read-only listings, advisors and SELECTs only | 05 |
| P | No production deployment | PASS | — |
| Q | No PR automatically merged | PASS | 02 |

## Report (§34)

```
SPRINT ID              P0.SITE00.STUDIOWORLD.PRODUCTION-LIVE-PERSISTENCE-SECURITY-AND-FIRST-SHOT-READINESS.V1
STATUS                 PARTIAL — infrastructure complete and isolated-verified; staging BLOCKED (not approved);
                       spend coverage outside the spine PARTIAL (D-I)
REPOSITORY             yoteenz/SITE00
BRANCH                 claude/production-live-persistence-readiness (integration)
                       claude/production-security-rls-hardening (security follow-up)
COMMIT SHA             head of PR #1699 (integration); fd899040 (PR #1698)
PR NUMBER              #1699 (base #1697's branch); #1698 (base #1696's branch)
PR INTEGRATION STATUS  #1699 contains every open PR head (#1690, #1692, #1693, #1694, #1695, #1696, #1697, #1698);
                       merges clean; nothing merged into main
DEPENDENCY GRAPH STATUS Reconciled; #1694 is based on #1693 at f43aa1f0 (not its head); #1696 independent

PRODUCTION RECORDSTORE
  Implementation       RecordStore.apply (atomic, compare-and-set); SupabaseRpcBackend (no fallback);
                       explicit store selection; repository catalogue read-only by default
  Migration tests      20261026100000 applied twice on PostgreSQL 16; 18/18 durable tests
  Durability validation New connection and a second OS process read identical records; 8 concurrent writers → 1

SUPABASE
  Schema status        Migration written and isolated-verified; not applied anywhere
  RLS status           Spine: all tables RLS, service_role writes, member-only reads, anon none.
                       Live findings repaired in #1696 / #1698, not deployed
  Storage status       Private bucket site00-production-masters in the migration; adapter contract-tested; live BLOCKED
  Staging verification BLOCKED: not approved for changes; scripts/production/verify-spine-supabase.ts ready
  Production deployment NONE

SECURITY
  Authorization coverage Spine: API, runner and database enforce one role table; founder-only spend.
                         Outside the spine: 58 paths audited; 25 reachable without a founder action (D-I)
  Cross-role policy results #1696: 16/16 isolated; still open live. #1698: 20/20 isolated
  Cross-project isolation Denied at API, store scope, foreign keys, RLS and signed links
  Remaining vulnerabilities Public paid endpoints (deliverable 09); live policies until #1696/#1698 deploy;
                            studio_world_atomic_reserve_budget (outside repo); FS Website findings (reported)

PROVIDER RUNNER
  Implementation       Ticketed transport; NOT_SENT/REJECTED/UNCERTAIN; reconciliation; recovery; OpenArt
                       contract from recorded creations and quotes
  Configuration        SITE00_PROVIDER_EXECUTION unset; no executor; OpenArt session variables refused
  Live execution state DISABLED / BLOCKED (D-B)

COST SYSTEM
  Spend gates          Operator, project, purpose, references, settings, quote ≤ 24 h, explicit founder
                       authorization, ceiling, budget, one-attempt scope, expiry, fingerprint, route
  Quote handling       Exact recorded quotes only; stale or changed quote blocks; unknown never zero
  Idempotency          Idempotency key unique; deterministic approval ids; one decision per subject version
  Retry protection     No automatic retry; uncertain → reconcile; capture failure → recapture without resubmission

TAKES
  Persistence          PostgreSQL; survives restart
  Approval history     Append-only events with before/after state and source version
  Private asset capture Content-addressed, re-hashed, private; no provider URL stored
  Edit selection       One per shot; founder or authorized editor; SELECT_FOR_EDIT event required

S1-01
  Creative packet status FOUNDER_REVIEW_REQUIRED; screenplay v2 DRAFT; 7 patches applied and re-verified
  Outstanding decisions FD-S101-01, 02, 03, 04, 05 (visual), 08, 09, 10, 11, 12 open; 06, 07 answered
  SH01 technical readiness Setup records ready; infrastructure not deployed; provider route BLOCKED
  SH01 authorization status Not authorized (all steps PENDING; budget PLANNING_ESTIMATE_ONLY)
  Planned cost         255 credits (planning estimate, 24 Oct; re-quote required)
  Actual spend         0

BUILD STATUS           tsc exit 0; vite build OK (471 assets verified)
TEST STATUS            Spine suites pass; full suite 11,440 passed, 91 failed (all pre-existing)
NEW REGRESSIONS        0 (the same 91 fail on main and #1697)
REAL PROVIDER REQUESTS 0
MEDIA CREDITS SPENT    0
PRODUCTION DATABASE MUTATIONS 0
PRODUCTION DEPLOYMENT  NONE
AUTOMATIC MERGES       NONE
SMALL REVIEW PACKAGE   STUDIOWORLD_PRODUCTION_LIVE_READINESS_V1_SMALL_FOUNDER_REVIEW.zip
FULL IMPLEMENTATION PACKAGE STUDIOWORLD_PRODUCTION_LIVE_READINESS_V1_FULL_IMPLEMENTATION_EVIDENCE.zip
NEXT RECOMMENDED ACTION FOUNDER REVIEWS THE VERIFIED TECHNICAL READINESS AND THE S1-01 SH01 CREATIVE
                       AUTHORIZATION PACKET BEFORE ANY PAID GENERATION IS ENABLED.
```
