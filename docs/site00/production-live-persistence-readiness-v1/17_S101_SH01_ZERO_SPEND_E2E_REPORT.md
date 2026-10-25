# 17 — S1-01 SH01 zero-spend end-to-end report

Sprint §27. Script: `scripts/production/sh01DryRun.ts`. It also runs inside the suite as `tests/productionSpineApi.test.ts → "S1-01-SH01 zero-spend dry run v2"`.

## 1. Setup

- **Steps 1–3** read the live planning catalogue (the repository records, opened read-only) through the real OpenArt route, which is disabled.
- **Steps 4–18** run in an isolated test environment:
  - a throwaway PostgreSQL 16 database carrying migration `20261026100000`, reached through the same `SupabaseRpcBackend` the API uses in supabase mode;
  - private test media in a temporary directory outside the repository;
  - test-only approvals by a test founder, every record marked `TEST_FIXTURE`;
  - two in-process fake providers (video and image);
  - the spine API handler in-process;
  - a second OS process reading the records back.
- **Steps 19–20** check that nothing reached a provider and nothing was spent. The live records are hashed before and after.
- **Durable store:** PostgreSQL sandbox with migration 20261026100000.
- **Simulated outputs are labelled.** The take is a 270×480 ffmpeg test pattern marked TEST FIXTURE. It is not THE EXCHANGE footage.

## 2. Results

| # | Step (§27) | Result | Evidence |
| --- | --- | --- | --- |
| 1 | SH01 loads from production records | PASS | THE EXCHANGE (86 releases) → S1-01 (45 s) → S1-01-SH01: PRODUCTION_SETUP_READY / GENERATION_AUTHORIZATION_PENDING, 4 s on screen (96 frames at 24 fps); budget BUDGET-S1-01-SH01-PILOT PLANNING_ESTIMATE_ONLY (255 cr planning estimate); jobs REF-01, REF-02, VIDEO-01 |
| 2 | Missing approvals are visible | PASS | six separate stages, none implied by another. TECHNICALLY READY no: Durable record store; Private master storage; Provider route available. CREATIVELY APPROVED no: FD-S101-01 (screenplay); FD-S101-08 (city reference); KF-ENV-CITY-DUSK-A approved. FINANCIALLY AUTHORIZED no: FD-S101-11 (generation budget); Budget authorized by the founder; JOB-S1-01-SH01-REF-01 current quote; JOB-S1-01-SH01-REF-02 current quote; JOB-S1-01-SH01-VIDEO-01 current quote; JOB-S1-01-SH01-VIDEO-01 authorized |
| 3 | Generate is blocked | PASS | generate.enabled=false; live dispatch by the founder → BLOCKED (PROVIDER_EXECUTION_DISABLED); gate reasons shown: DECISIONS_OPEN, INVALID_SCENE_STATE, JOB_NOT_AUTHORIZED, NO_APPLICABLE_BUDGET, NO_FOUNDER_APPROVAL, PROVIDER_EXECUTION_DISABLED, QUOTE_STALE, REFERENCES_NOT_APPROVED |
| 4 | Authorization requires the correct role | PASS | PRODUCTION_ADMIN → FORBIDDEN; AUTHORIZED_EDITOR → FORBIDDEN; REVIEWER → FORBIDDEN; READ_ONLY → FORBIDDEN; a non-founder GENERATION_AUTHORIZATION written straight to the database → 23514 site00_spine_approval_events_spend_founder |
| 5 | Authorization is bound to shot and fingerprint | PASS | APR-GEN-JOB-S1-01-SH01-VIDEO-01-r4: GENERATION_JOB/JOB-S1-01-SH01-VIDEO-01, input fingerprint 208146427581a43d…, route OA-K3O-I2V-PRO, quote 175 cr, ceiling 175 cr, scope ONE_JOB_ONE_ATTEMPT, expires 2026-10-25T14:15:13.000Z; same authorization against a changed request → APPROVAL_INVALIDATED_BY_INPUT_CHANGE; against another shot → PROJECT_MISMATCH, NO_APPLICABLE_BUDGET |
| 6 | Unquoted spend is blocked | PASS | JOB-S1-01-SH01-REF-01 with no quote: authorization → GATE_BLOCKED; dispatch → BLOCKED (JOB_NOT_AUTHORIZED, NO_FOUNDER_APPROVAL, UNKNOWN_QUOTE); the records' planning quote (175 cr, 2026-10-24T14:47Z) judged now → QUOTE_STALE; provider calls 0 |
| 7 | The fake transport completes the authorized test transaction | PASS | SUBMITTED → CAPTURED; kling-3-omni image2video {"duration":5,"resolution":"pro","videoCount":1,"generateSound":false}; start frame ee7495fe1130…; operation FAKE-OP-001; transitions AWAITING_APPROVAL → AUTHORIZED → QUEUED → RUNNING → SUCCEEDED → ASSET_CAPTURE_PENDING → CAPTURED |
| 8 | Output is stored privately | PASS | ASSET-JOB-S1-01-SH01-VIDEO-01-A01 → spine-media://LOCAL_PRIVATE/test-fixtures/the-exchange/c8b43629cc5d6d89da95f535244a8f5d0d2b1968095371611cb8e57cc53215a7.mp4; file mode 600 outside the repository; no URL stored in any record (production uses the private Supabase bucket site00-production-masters) |
| 9 | The hash is verified | PASS | stored copy sha256 c8b43629cc5d6d89… equals the provider output; provenance: the database accepts the asset only because its storage reference is content-addressed by that hash in this project |
| 10 | The take persists | PASS | TAKE-S1-01-SH01-01: READY_FOR_REVIEW; probed 270x480, 24 fps, 5 s, audio false; intended edit 4 s; database row READY_FOR_REVIEW/true/c8b43629cc5d6d89da95f535244a8f5d0d2b1968095371611cb8e57cc53215a7 |
| 11 | The take is retrievable after a process restart | PASS | process 8944 (this run is 8466) opened the store from nothing and read 11 records; TAKE-S1-01-SH01-01 identical |
| 12 | A reviewer can approve | PASS | take approval authority is the founder's (FOUNDER role); REVIEWER members review: reviewer HOLD → 200, reviewer continuity PASS → 200, founder APPROVE → 200 (APPROVED) |
| 13 | Unauthorized review is denied | PASS | reviewer REJECT → 403; read-only HOLD → 403; non-member → 403 NOT_A_PROJECT_MEMBER; reviewer SELECT_FOR_EDIT → 403; take unchanged at r4; a reviewer's decision written straight to the database → 23514 site00_spine_approval_events_take_authority |
| 14 | SELECT FOR EDIT records the selection | PASS | editor SELECT_FOR_EDIT → 200; TAKE-S1-01-SH01-01 selectedForEdit=true r5; event APR-TAKE-TAKE-S1-01-SH01-01-r4 APPROVED → SELECTED_FOR_EDIT on TAKE/TAKE-S1-01-SH01-01@r4; edit-selection view: S1-01-SH01/TAKE-S1-01-SH01-01 |
| 15 | Duplicate execution is prevented | PASS | dispatch again → DUPLICATE_IDEMPOTENT; from a second server → DUPLICATE_IDEMPOTENT; through the API → 200 DUPLICATE_IDEMPOTENT; provider requests 1; provider-operation rows 1 (the database allows one in-flight attempt per job and one row per ticket) |
| 16 | Capture failure creates no new paid job | PASS | JOB-S1-01-SH01-REF-02: capture → ASSET_CAPTURE_FAILED (PROVIDER_OUTPUT_UNAVAILABLE: fake network: output download interrupted); production admin recapture → CAPTURED; provider submissions 1, output reads 2; jobs 3 before and after |
| 17 | Cross-project access is denied | PASS | workspace for ndxbook through the Exchange spine → 404 NOT_A_SPINE_PROJECT; an Exchange media link presented as ndxbook → 403 SIGNED_READ_INVALID; ndxbook-scoped store sees 0 takes; writing an Exchange record through it → CROSS_PROJECT_DENIED; a signed-in ndxbook reviewer sees 0 Exchange takes (RLS) |
| 18 | Signed URL expiry works | PASS | signed read (expires 2026-10-25T14:06:07.000Z) → 200, 706816 bytes, hash matches; the same link one second after expiry → 403 SIGNED_READ_EXPIRED; extended expiry → 403 SIGNED_READ_INVALID |
| 19 | No real request occurs | PASS | network calls during the run: 0; OpenArt route: SITE00_PROVIDER_EXECUTION is not ENABLED; the only requests went to the in-process fake (1 video, 1 image) |
| 20 | No credits are spent | PASS | live records unchanged (5 files, same hashes); live budget authorized 0 cr; live jobs never attempted; the fake reported 0 cr |

**Totals:** 20 of 20 steps pass. Provider network calls 0. Real provider requests 0. Credits spent 0. Live records unchanged: true.

## 3. Notes

- **Step 12, "The reviewer can approve it."** In this build the approval authority for takes is the FOUNDER role. A REVIEWER-role member holds and records continuity. The step shows both, and step 13 shows a REVIEWER's approve refused at the API and by the database. Whether reviewers may approve is founder decision D-E (deliverable 19).
- **Steps 4 and 13 also bypass the application.** They write a forged non-founder authorization and a forged reviewer decision straight to the database function. Both are refused by check constraints.
- **Step 6 judges the planning quote at the moment of the run.** The records' 24 Oct quote is older than 24 h and is refused as `QUOTE_STALE`, so it cannot be spent against.
