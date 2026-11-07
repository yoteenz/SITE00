# JURNL GLOBAL INTERACTIVE V3 · V1 — evidence package

Sprint: `P0.JURNL.GLOBAL-INTERACTIVE-SURFACES.V3-AUTHORITY-AND-ALL-FAMILY-COMPONENT-CONVERGENCE.OPUS1`
Authority: JURNL_INTERACTIVE_COLOR_CALIBRATION_V3 (8 panels: 01 HAMBURGER MENU · 02 MY MEMBERSHIP · 03 EXPLORE ADD-ONS · 04 UNLOCK FEATURE · 05 SEARCH DRAWER · 06 MANAGE POCKET · 07 ADD A POCKET · 08 ARCHIVE BLOCKED).
Status: **PARTIAL**. The canonical V3 foundation and the highest-priority working surfaces are built and tested. Cross-family convergence (phases 4–5) has not started, and the continuation plan is in report 26. Nothing in this package is founder-approved.

## What is here

| Path | Contents |
|---|---|
| `reports/01–26` | The 26 sprint reports. `02_APPENDIX_FULL_INVENTORY.md` lists all 303 interactive surfaces with file:line. |
| `evidence/v3_vs_runtime/` | Side-by-side WebP of each V3 panel against the runtime surface built from it (panel 05 is not built; see U3). |
| `evidence/runtime/` | The 10 V3 runtime surfaces at 393×852. |
| `metrics/v3_surfaces_9_viewports.json` | 10 surfaces × 9 viewports: page scroll, unreachable controls, small targets, lowercase non-script text. |
| `metrics/migration_counts.json` | Per-family migration status counts (from report 22). |
| `tools/` | The Playwright probe and capture scripts used to produce the evidence. |

## Headline results

- **Surfaces:** 303 discovered across 16 families plus GLOBAL, and 1 DOT (F05 DOT 01).
  - 13 migrated (9 tested, 4 pending visual review).
  - 40 already conformant.
  - 250 deferred: 242 have no authority yet, 8 wait on a functional dependency.
  - 4 new surfaces: GLOBAL MENU, MY MEMBERSHIP, ADD-ONS, UNLOCK.
- **Tests:** 836/836 unit tests pass; tsc reports 0 errors; the build passes. 388 E2E tests ran in the production preview, in 4 Playwright projects: 387 passed on the first run, 1 failed on an old fixture and passed after the fix, and 8 were skipped by design.
- **9-viewport probe:** 0 page-level scroll, 0 unreachable controls, 0 lowercase non-cursive text. axe found 0 serious or critical violations on the V3 surfaces.
- **No-sale guarantees:**
  - Membership, add-ons and unlock read only the real entitlement contract.
  - There are no prices, no checkout and no AVAILABLE add-on that cannot be obtained.
  - FOUNDER_FULL suppresses upsell.
- **Zero balance before archive:** a Pocket that holds money, or has gone below zero, cannot be archived or deleted (`HELD_BALANCE`).

## Not done by this sprint

There was no merge, no deploy, no production database change, no paid provider spend and no new image generation. No billing provider was set up, no subscription was created and no tunnel was changed.
