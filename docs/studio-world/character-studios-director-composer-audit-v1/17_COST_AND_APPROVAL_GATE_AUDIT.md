# 17 — Cost and approval gate audit

## 1. Gates that exist

| Gate | Evidence | What it checks | Weakness |
| --- | --- | --- | --- |
| Server spend token | `shared/site00-production-guardrails/providerGateway/spendAuthorization.ts:23` | A token issued by the server for a job, with a 900 s lifetime | In memory (lost on restart); checks the caller's estimate; used by the JURNL admin path and the Kling 4 branch only |
| Client flag `founderConfirmedSpend` | `runPageConceptGeneration.ts:106`, `runWorkspaceSelfGeneration.ts:56`, `site00OpusNative/runtime.ts:100` | A boolean in the request body | The gateway itself rejects this flag as insufficient (`spendAuthorization.ts:93-107`) |
| FILM plan approval | `filmProductionService.ts:77-90` | Generation needs an approved plan | Gates a simulation only |
| Storyboard cost guard | `storyboardGenerationCostGuard.ts:55-67` | Blocks GET-triggered spend, auto-retry and concurrency | Counts attempts, no price; the caller hard-codes `explicitFounderAction: true` |
| THE EXCHANGE pre-spend check | `directorial/review.ts:160` authorizeGenerationJob | Step authorized, target approved, price known and within budget, route executable | Pure function; nothing calls it before a provider call |
| THE EXCHANGE dispatch precheck | `dispatch.ts` precheckProductionDispatch | Duplicate generation, provider verified, upstream approved | Pure function; no caller |

## 2. Paths with no gate

| Path | Evidence | Risk |
| --- | --- | --- |
| Entry 002 keyframe dispatch | `entry002ReelKeyframeDispatch.ts:289`: on whenever `FAL_KEY` exists | Spend from a route visit |
| ASSTS library GET | `api/admin/site00-assts.ts:75` → `service.ts:427-450`: queues generation automatically | Spend from opening the library |

Both are G-COST-03 (P1). Closing them is the first change recommended, before any new generation feature.

## 3. Cost visibility

- **No code fetches a real price.** The gateway writes the estimate as `actualCredits` (`runProductionProviderRequest.ts:189`). FILM writes the estimate as `actualCostUsd` (`engine.ts:209`).
- **No cost table exists** (deliverable 19).
- **THE EXCHANGE has dated quotes** (`PROVIDER_PRICE_QUOTES_V2.json`) and a per-scene budget:
  - S1-01 base: 3,400 credits plus $1.48;
  - expected with retakes: 4,578;
  - ceiling: 5,715;
  - balance at quote: 10,031 (2026-10-24 14:47 UTC);
  - ledger: 0.

  The balance was read by hand.

## 4. Where the plan already saves credits

| Saving | Evidence |
| --- | --- |
| Frames extracted from approved footage instead of generated | S1-01: 2 extractions (SH07, SH18) |
| Environment frames reused across releases | `reusableBeyondUnit` on keyframes (for example `KF-ENV-CITY-DUSK-B`: any release on SET-CITY-DUSK) |
| Short generations for complex movement | Motion bands; S1-01 requests 64 s for 43.5 s on screen across 18 videos |
| No lip-sync without a visible speaking mouth | Budget B-04: 0 jobs ("No visible speaking mouth") |
| No invented narration | Budget B-05: 0 ("Do not invent narration") |
| No upscaling | B-08: 0 (pro output is delivered at 1080 × 1920) |
| Candidates only where a choice matters | Keyframes carry 1 or 2 candidates each (29 images for 22 keyframes) |

**Further savings to build:**
- reuse-before-generate lookup across releases (G-KF-04);
- the identity pack generating only missing views (G-ID-05);
- revision as a linked job rather than a full scene rerun (deliverable 15);
- one dialogue take reused under every shot it plays across (deliverable 12).

## 5. Scene cost preview (proposal)

Shown in the shot inspector and the scene's review step. One row per media job:

| Field | Source |
| --- | --- |
| Provider, model | Route |
| Inputs | Job inputs with purpose and asset IDs |
| Expected output | Kind, duration, resolution |
| Estimated credits | Dated quote, marked stale after a set age |
| Remaining budget | Authorized minus committed; the provider balance where the route reports it |
| Actual spend after completion | Provider response or balance change |
| Reuse eligibility | Whether the output can serve other shots or releases |
| Approval status | Step state and target state |
| **Purpose** | One of: approved production scene, reusable character asset, environment, performance requirement, repair job |

The purpose field enforces sprint §21: a job without one of the five purposes cannot be authorized. That ends disposable experiments.

## 6. Authorization flow

1. **Plan.** Quotes are computed for every job in the scene.
2. **Founder authorizes:**
   - SCREENPLAY, DIRECTION and KEYFRAMES (approval of content);
   - GENERATION_BUDGET (credits for images);
   - PRODUCTION (scope of shots and video credits).
3. **Run.** The runner calls `authorizeGenerationJob` and `precheckProductionDispatch`, then the provider through the gateway. A refusal is logged with its reasons.
4. **Reconcile.** Actual credits are recorded and the budget updates.

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| C-01 | Close the two ungated paths | Director Composer | D-13 | Tests prove neither path calls a provider without an explicit authorized action |
| C-02 | Runner enforces the Exchange checks and the gateway | Director Composer | G-GEN-01 | An unauthorized SH01 job is refused before any provider call; an authorized one runs |
| C-03 | Job purpose required | Director Composer | C-02 | A job without a purpose cannot be authorized |
| C-04 | Cost ledger with actual spend | Production Asset Registry | G-DATA-01 | After two jobs the ledger matches provider history |
| C-05 | Founder authorization surface in REVIEW + HANDOFF | Studio World | G-WS-01 | Founder authorizes a step and budget on a phone; the runner reads it |
