# 16 — Test and build report

Branch `cursor/the-exchange-canon-lock-screenplay-8aec`, based on `main` at `159c0fa9b`. Every result below came from a command run on this branch on October 23, 2026. Nothing here is inferred.

## Summary

| Check | Command | Result |
| --- | --- | --- |
| Repository typecheck | `npm run typecheck` | Exit 0 |
| Scoped typecheck (module, scripts, new tests) | `tsc --noEmit -p` a temporary config extending the root config | Exit 0. The temporary config was removed afterwards. |
| The Exchange test suites | `npx vitest run tests/theExchange*.test.ts` | 7 files, 47 tests, all passing. 25 of the tests are new. |
| Full repository test suite | `npm test` | 885 files: 829 passed, 56 failed. 11,351 tests: 11,275 passed, 74 failed, 2 skipped. All 74 failures also fail on `main`. |
| Production build | `npm run build` | Exit 0. `verify-production-dist: OK (470 JS assets checked)`. |
| Screenplay check | `npx tsx scripts/the-exchange/check-screenplays.ts` | Exit 0. Hard conflicts: 0. |
| Generator idempotency | Rerun `build-season1-production.ts` and `render-canon-lock-docs.ts` | No diff in any generated file |

## The Exchange test suites

| File | Tests | Covers (section 16) |
| --- | --- | --- |
| `tests/theExchangeSeason1Master.test.ts` | 10 | Canonical promotion; historical version preservation; 86-release master integrity; no releases added against BASELINE V1; approved Nights placement; recurring patron retention; Hybrid H continuity; superseded Plan C status; 81-release fallback preservation; stress regression |
| `tests/theExchangeScreenplaySystem.test.ts` | 6 | Character dialogue registry; screenplay schema; malformed and unauthorised drafts rejected; runtime estimation; script-to-shot conversion; continuity engine flags without rewriting |
| `tests/theExchangeProductionPipeline.test.ts` | 9 | Asset reference validation; missing asset handling; manifest generation; cost estimation; approval transitions; founder review gating; duplicate generation prevention; provider failure handling; no dispatch without a verified provider, approved upstream and founder spend authorization |
| Four existing Exchange suites | 22 | Unchanged and still passing |

The new tests read and write real files. They load the committed JSON, CSV and Fountain files from disk, regenerate them in memory, and require an exact match. The history test hashes every archived file and compares it with the archive's `MANIFEST_SHA256.txt`.

## Full-suite failures are pre-existing

The 74 failing tests fall in 56 files outside this sprint. Examples: Expression Engine reference fidelity, Blueprint tabs, a live Playwright desktop capture, and Experience Engine Sprint A.

How this was checked:

1. Ran `npm test` on this branch and saved the sorted names of the failing tests.
2. Checked out `main` at `159c0fa9b` in a separate worktree and ran the same 56 files.
3. Compared the two lists with `cmp`. They are identical: 74 names on each side.

No Exchange file appears in either list.

## Side effects of the full run

The full suite rewrites three tracked files that belong to other projects: an Expression Engine JPEG and two JURNL ledgers (F03 and F05). They were restored with `git checkout --` after each run and are not in any commit on this branch.

## Stress regression

| | PASS | PARTIAL | FAIL |
| --- | --- | --- | --- |
| Prior (structural reconciliation) | 24 | 8 | 0 |
| Current (this master) | 24 | 8 | 0 |

No question was upgraded. One check, T31, briefly read as a downgrade because its phrase sits in the release's ending rather than the main description. The phrase match now covers the opening hook, the description, the payoff and the ending. With that fix T31 passes, which matches the prior result.

## Continuity and screenplay check

| Measure | Value |
| --- | --- |
| Checks run | 15 |
| Hard conflicts | 0 |
| Warnings | 1: Gideon has lines in S1-04 but is not in that release's featured list |
| Open questions carried | 7 |
| Screenplay warnings | S1-04: PRODUCER and PIANIST speak but have no dialogue-registry entry |

## Draft runtimes and shot plans

| Release | Estimated / target | Ratio | Shots | Estimated cost if ever generated |
| --- | --- | --- | --- | --- |
| S1-01 | 41.5 s / 45 s | 0.92 | 11 | $15.40 / 2,345 credits |
| S1-02 | 65.6 s / 70 s | 0.94 | 21 | $27.26 / 4,123 credits |
| S1-03 | 109 s / 120 s | 0.91 | 28 | $45.32 / 6,475 credits |
| S1-04 | 86.9 s / 90 s | 0.97 | 29 | $44.48 / 6,601 credits |
| S1-05 | 91.9 s / 105 s | 0.88 | 27 | $45.76 / 6,692 credits |
| Total | | | 116 | $178.22 / 26,236 credits |

All five are on target (between 0.85 and 1.15). These costs are estimates only. Nothing was dispatched, and the dispatch gate reports 0 credits spent. The OpenArt balance last read was 10,154 credits, which does not cover the full first batch.

## Not verified

| Item | Why |
| --- | --- |
| Rendered video, voice or lip sync | Not generated. No provider is verified. |
| Speech timing against real voices | Runtimes use a words-per-second model, not recorded audio. |
| GoDaddy or Railway deploys | Not in scope. No UI or API change. |
