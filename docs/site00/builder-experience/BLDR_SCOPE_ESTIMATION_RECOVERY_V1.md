# BLDR scope estimation recovery (P0)

Sprint: `P0.SITE00.BLDR.SCOPE-ESTIMATION-ALL-BUILD-TYPES-END-TO-END-QUOTE-RECOVERY1`

## Root cause

End-to-end estimation was **computed only when** `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` was on **and** the session room was `BLUEPRINT` (`revealEstimateForRoom` gated both computation and display).

When the client preview flag was off in a bundle, or when computation was skipped while preview UI was on, the Blueprint showed **`—`** because `snapshot.estimate` stayed `null` even though `builderEstimateView()` succeeds for valid configurations.

Pricing rules in `src/studioos/estimation/` and `toEstimateConfig()` were not broken; the **adapter layer** withheld the estimate from the snapshot.

## Fix

| Layer | Change |
| --- | --- |
| `computeEstimateForSpatialRoom()` | Runs on `BLUEPRINT` when `scopeEstimatorEnabled()` (default on). |
| `revealClientEstimateFigures()` | Client dollars/weeks still gated by `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1`. |
| `resolveScopeEstimate()` | Shared contract: status, fingerprint, canonical min/max, modifiers, assumptions, errors. |
| Blueprint UI | No silent `—` when status is `INCOMPLETE`, `ERROR`, or `REQUIRES_REVIEW`. |

Server submission already used `allowEstimate: true` on submit; live Blueprint now matches that behavior while editing.

## Estimation contract map

```
SpatialBuilderState
  → spatialSelectionToBuilder()
  → toEstimateConfig()
  → estimateProject()          (approved baselines — engine v1.0.0)
  → presentEstimate()          (presentation policy 1.1.0)
  → builderEstimateView()      (client copy)
  → ScopeEstimateResult        (quoteStatus + canonical numbers)
  → BlueprintSessionSnapshot
  → BlueprintRoom Overview
```

## Build-type coverage

| Build | Estimator path | Quote status |
| --- | --- | --- |
| SIMPLE | `buildLevel SIMPLE`, service structure, essential edition | `ESTIMATED` when Blueprint complete |
| ADVANCED | Full edition, richer families/features | `ESTIMATED` |
| CUSTOM | Custom expression; open TYPE/COLOR/IMAGE lines block submission | `REQUIRES_REVIEW` when estimable but founder review required |
| WORLD | `projectType WORLD` + default world scope weights | `REQUIRES_REVIEW` (indicative range shown) |

## Founder-reported SIMPLE case (automated)

Configuration: SIMPLE · MODERN · PAGES · FLEXIBLE · Blueprint room.

See `src/site00/builder-experience/scopeEstimateResult.test.ts` and:

```bash
npx tsx scripts/site00/builder-studio-qa/expected-estimate.ts '{"version":1,"room":"BLUEPRINT","placePath":"SIMPLE","feelVibe":"MODERN","workModules":["PAGES"],"pace":"FLEXIBLE","paceNotes":"","blueprintSection":"OVERVIEW","buildObjectView":"FRONT","savedAt":null}'
```

Example output at recovery time: investment about `$4.5K–$9.5K`, window `8–14 WEEKS`, `submission_ready: true`.

## Pricing authority (unchanged)

- Engine: `src/studioos/estimation/engine.ts`, assumptions `DEFAULT_ASSUMPTIONS`
- Registry modifiers: `src/studioos/estimation/registries.ts`
- Builder mapping: `src/site00/builder-experience/toEstimateConfig.ts`, `rules.ts`
- No new prices or timelines were invented in this recovery.

## Manual-quote limitations

- **CUSTOM** with incomplete Blueprint lines remains **not submittable** until decisions are closed.
- **WORLD** ranges stay **indicative** until founder Blueprint review (`REQUIRES_REVIEW`).
- **Founder-approved commercial quote** is still a separate step after submission; client estimate remains non-binding.
