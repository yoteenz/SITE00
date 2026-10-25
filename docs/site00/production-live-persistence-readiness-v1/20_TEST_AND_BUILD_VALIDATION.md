# 20 — Test and build validation

Sprint §32. Integration branch `claude/production-live-persistence-readiness`. Node 22, Vitest 2.1.9, PostgreSQL 16 (local, throwaway), Chromium via Playwright 1.63.

## 1. Build

| Check | Result |
| --- | --- |
| `tsc --noEmit` (the repository's `src` + `shared` project) | exit 0 |
| `vite build` + `verify-production-dist` | built in 1 m 5 s; 471 JS assets checked, OK |
| Typecheck of the spine API, scripts and tests (a scratch config extending the repository's, adding `api/site00/production-spine.ts`, `scripts/production/*.ts`, `tests/productionSpine*.ts`) | 0 errors in those files |

## 2. Sprint suites

| Suite | Tests | Result |
| --- | --- | --- |
| `tests/productionSpine.test.ts` | 56 | 56 pass |
| `tests/productionSpineApi.test.ts` (includes the 20-step dry run v2) | 9 | 9 pass |
| `tests/productionSpineDurable.test.ts` (PostgreSQL 16) | 19 | 18 pass, 1 skipped: the placeholder that runs only where PostgreSQL is missing and reports BLOCKED |
| `tests/productionSpendGates.test.ts` (#1696) | 15 | 15 pass |
| `tests/theExchangeS101PacketAlignment.test.ts` (#1695) | 10 | 10 pass |
| `tests/theExchangeScenePacketProduction.test.ts` | 9 | 9 pass |

Scripts:

| Script | Result |
| --- | --- |
| `scripts/production/sh01DryRun.ts` | 20/20; provider network calls 0; credits 0; live records unchanged |
| `scripts/production/takes-viewport-check.ts` (390, 834, 1440, 2560) | no failures |
| `scripts/production/verify-security-hardening.sh` | 20/20 |
| `scripts/production/verify-role-policies.sh` (#1696) | 16/16 |
| `scripts/production/render-readiness-docs.ts --check` | current |

## 3. §32 regression tests

| §32 case | Test |
| --- | --- |
| Unauthorized dispatch | `dispatches only for the founder…`; API test (reviewer 403, non-member 403); dry-run step 3 |
| Changed request after authorization | `refuses a request changed after authorization…`; `with inputs changed after approval…`; dry-run step 5 |
| Duplicate jobs | `no duplicate job: an idempotency key belongs to one job` (PostgreSQL) |
| Duplicate dispatch | `double click…` (memory); `two servers dispatching…` (PostgreSQL); dry-run step 15 |
| Concurrent approvals | `decides a take version once…`; `compare-and-set holds under real concurrency…` (PostgreSQL) |
| Cross-project access | `a store scoped to one project…`; RLS tests; API scoping test; dry-run step 17 |
| Expired signed URLs | private-media test; dry-run step 18 |
| Lost provider response | `lost provider response: RECONCILIATION_REQUIRED…`; `provider accepted but the ledger write failed…` |
| Capture failure | `capture failure creates no new paid job…`; dry-run step 16 |
| Restart persistence | `keeps every record across connections and across a process restart` (child process); dry-run step 11 |
| Unapproved take selection | state-machine test; `no approved take without founder authority, and no selection of a take that is not approved` (PostgreSQL) |
| Missing approvals | workspace readiness test (API suite); dry-run step 2 |
| Unknown cost never zero | `never counts an unknown cost as zero`; `scene gate: an unknown quote stays unknown…` |
| Worker restart mid-call | `worker restart mid-call…` |
| Approval immutability | `approval history is append-only…` (PostgreSQL, as owner) |
| Media revocation | `serves a signed media link only while a record of that project names the media` |

## 4. Full suite and pre-existing failures

**Full run on the integration branch:** 11,537 tests; 11,440 passed, 91 failed, 6 skipped. The run started before the last test additions above, which pass in §2.

**The 91 failures are all pre-existing.** The 60 files with failures were run again, by themselves, on three trees:

| Tree | Tests in those 60 files | Passed | Failed |
| --- | --- | --- | --- |
| `main` 159c0fa9 | 1,105 | 1,014 | 91 |
| #1697 0f987a3f | 1,105 | 1,014 | 91 |
| integration branch | 1,105 | 1,014 | 91 |

- **The same 91 tests fail on all three.** None is new against `main` or #1697. All 91 also fail when their files run on their own, so none was caused by load during the full run.
- **Where they are.** The largest groups: Expression Engine sprints B41 (6) and B42 (7), the visual reconstruction suites, founder creative ingestion, NDX icon and notification suites, campaign board, and `src/utils/site00ApiBase.test.ts`. #1696's deliverable 07 recorded the B4.1/B4.2 failures as already failing on `main`.
- **This sprint changed none of those test files**, nor the code they cover.

The two JURNL generation ledgers that a full run rewrites were restored after each run.

## 5. Not run

| Check | Why |
| --- | --- |
| Supabase staging verification (`verify-spine-supabase.ts`) | No staging project approved for changes |
| Live private-bucket transfer | Same |
| Production read-only verification of the new schema | Nothing deployed |
| H.264 playback in a real browser | The test Chromium cannot decode H.264 (carried over from the previous sprint) |
