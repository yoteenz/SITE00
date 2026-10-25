# 07 — Spend authorization gate report

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`, decision D-13. Branch `claude/production-spend-gates-and-policy-repair`, based on `main` (`159c0fa9`). No provider was called and no credit was spent.

## 1. The two bypasses

The Character Studios audit (gap G-COST-03) found two ways paid generation could start without an explicit action. Reading the code showed both were wider than one call site.

### Bypass 1: Entry 002 generation on a plain GET

- **Default-on dispatch.** Fourteen Expression Engine dispatch modules (16 call sites) computed `dispatchFal ?? Boolean(process.env.FAL_KEY)`. Any caller that did not say "no" spent whenever the key was configured.
- **GET handlers that dispatch by default.** The `/api/site00/expression-engine` GET handlers for phases B42 (keyframes), B44, B45 and B46 computed `body.dispatchFal !== false`, which is true for a plain GET.
- **GET handlers that dispatch on a URL flag.** B3 and B41 dispatched whenever `?dispatchFal=1` was in the URL.
- **Effect.** Loading those phases could start fal image generation whenever a storage object was missing.

**Fix:**
- Every dispatch module is now opt-in: `options?.dispatchFal === true`.
- The six GET handlers set `dispatchFal = false` and `forceDispatch = false`, and call the existing `assertNoGetDispatchOnRead()`. This is the pattern the B49 GET handler already used.
- The founder-initiated POST `GENERATE_FINAL_STORYBOARD` already passes `dispatchFal: true` and `explicitFounderAction: true`; it is unchanged.

### Bypass 2: ASSTS reads that queue work

- **Library GET.** `GET /api/admin/site00-assts?action=library` ran `ensureAutoGenerationPipeline`. That started a batch run for every asset that was QUEUED, FAILED or missing a version, so a failed job was retried automatically.
- **Polling.** `pollPendingGenerationJobs` ended by calling `continueVaultLineageGeneration`, which submits new jobs. `GET ?action=batch`, `?action=asset` and `?action=poll` all poll.

**Fix:**
- `ensureAutoGenerationPipeline(batchKey, { allowGeneration })` starts a run only with `allowGeneration: true`. The library GET passes nothing. It now reports `awaitingGeneration` instead of acting on it.
- `pollPendingGenerationJobs(limit, { continueLineage })` collects results of jobs already submitted. It continues a lineage only with `continueLineage: true`.
- Continuing a lineage is a new explicit admin POST, `action: 'continue-lineage'`. The existing admin POST `generate` (wired to the ASSTS dev panel) is unchanged.

## 2. Files

| File | Change |
| --- | --- |
| `api/site00/expression-engine.ts` | Six GET phases never dispatch or force |
| `api/_lib/site00ExpressionEngine/*` (14 files) | Dispatch defaults to off |
| `api/_lib/site00Assts/service.ts` | `assetsAwaitingGeneration`; pipeline needs `allowGeneration: true` |
| `api/_lib/site00Assts/generation.ts` | Polling continues a lineage only on request |
| `api/admin/site00-assts.ts` | `continue-lineage` POST action |
| `tests/productionSpendGates.test.ts` | 15 regression tests |

## 3. Verification

| Check | Result |
| --- | --- |
| New regression tests on the fixed code | 15 of 15 pass |
| The same tests on the unfixed code | 10 of 15 fail (source guards, the six GET phases, keyframe opt-in, lineage action, pipeline gate) |
| Explicit dispatch still reaches the provider | Yes, against a mocked `@fal-ai/client`; no real request |
| Related existing suites (31 files: Expression Engine B3–B5, ASSTS, provider gateway, bypass audit, reference binding) | 579 pass, 15 fail, identical to the same files on unmodified `main` (pre-existing: B4.1, B4.2, B5.3 #15, B5.4 #4) |
| API type errors in the changed files' dependency closure | 328 before, 328 after, identical set |

## 4. What is not gated yet

These are recorded for the founder, not fixed in this branch:

- **Founder-initiated POSTs carry no budget.** These are ASSTS `generate`, `regenerate` and `variant`, and Expression Engine `GENERATE_FINAL_STORYBOARD`. They are explicit actions, but none checks a quote or a budget, because those systems have no price data (G-COST-01).
- **Other domains** (Twin, page concept, voice discovery) gate on a client flag or an explicit endpoint. The provider gateway itself rejects a client flag as insufficient (`spendAuthorization.ts:93-107`).
- **The new production spine** (workstream B2, deliverables 05, 06 and 10) enforces the full gate for Director Composer jobs: founder approval, budget, known quote, valid scene state, expiry, idempotency, input-hash invalidation and no automatic retry.

## 5. Deployment gate

The fix takes effect on the API only after a Railway redeploy from `main`, once this branch is merged. Nothing was deployed.
