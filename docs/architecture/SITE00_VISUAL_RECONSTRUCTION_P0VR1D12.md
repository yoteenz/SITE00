# SITE 00 — P0.VR.1D.12 Legacy Shell Flash Removal

## Problem

Reconstructed NDXBOOK mobile routes briefly showed the superseded `site00-project-lore-calibration` shell (including "Loading Experiment 01…") before switching to the P0.VR.1D.9+ reference-driven shell after data fetch/hydration.

## Root cause

`ProjectBrandMarketingExpressionExperiment01Page` gated `FounderWorkspaceShell` on `versionTab === 'V23' && v23Artifacts.length > 0`. Until experiment data resolved, the page rendered the legacy calibration shell on the founder-facing path.

## Fix

1. **Route-based shell first** — `FounderWorkspaceShell` renders immediately for `ndxbook` experiment-01; mobile dedicated screen (`MobileExperiment01Screen`) is static reference content and does not wait for Supabase fetch.
2. **ReferenceShellLoadingState** — Desktop loading uses skeleton placeholders inside current shell geometry (3×3 grid, metrics, direction rows).
3. **ReferenceShellSuspenseFallback** — Lazy route Suspense on reconstructed NDX paths renders current mobile chrome + reference screen (or desktop skeleton).
4. **Legacy marking** — Inspect-only legacy markup carries `data-visual-shell-version="legacy"` and `data-runtime-current-route-eligible="false"`.
5. **Instrumentation** — `FounderWorkspaceShell` and `MobileFounderWorkspaceChrome` stamp `data-visual-shell-version="P0.VR.1D.9+"`.

## Module

`shared/site00-studio-world-production/visualReconstruction/p0vr1d12/`

## Tests

`tests/visualReconstructionP0VR1D12.test.ts`

## Core rule

The old shell is superseded visual history — not a loading screen. The first pixel must belong to the current reference-driven design.
