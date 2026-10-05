# ASSET-FIRST PRODUCTION POLICY (F02+)

Registered rule: **`ASSET_FIRST_REQUIRED = TRUE`** for every product family after a project's legacy pilot.
Implementation: `shared/site00-product-families/assetFirstPolicy.ts` (project-agnostic, test-covered).

## Why

JURNL F01 was produced screen-first; the follow-up harvest of reusable assets from the approved parent failed
(`P0.JURNL.F01-PARENT-ASSET-HARVEST-PROOF1`: 14 attempted, 7 isolated, 50 % — screenshot-crop contamination, transparent object
and material extraction failed). Screens composed first cannot be decomposed into clean assets afterwards. From F02 on, canonical
assets are generated and QA'd **before** any parent composition.

## Asset classes (every asset requirement must carry one)

| Class | Raster eligible |
|-------|-----------------|
| `GLOBAL_INHERITED` | yes |
| `FAMILY_BACKGROUND` | yes |
| `ARCHITECTURAL_LAYER` | yes |
| `ISOLATED_OBJECT` | yes |
| `BOTANICAL` | yes |
| `MATERIAL_TEXTURE` | yes |
| `LIGHT_OVERLAY` | yes |
| `ICON` | yes (prefer live SVG) |
| `IMPLEMENTATION_COMPONENT` | **never** |
| `DATA_VISUALIZATION` | **never** |
| `NO_ASSET_REQUIRED` | **never** |

**Buttons, inputs, checkboxes, toggles, drawers, sheets, modals, cards, toasts, panels are COMPONENTS, not assets**
(`COMPONENT_NOT_ASSET`) — whatever a generated sheet shows. They are built in code.

## Pipeline (17 stages, `ASSET_FIRST_PIPELINE`)

1. FAMILY_PRODUCT_CONTRACT
2. ASSET_INVENTORY
3. CANONICAL_ASSET_GENERATION
4. ASSET_QA_GATE
5. PARENT_COMPOSITION
6. FOUNDER_PARENT_APPROVAL
7. CHILD_EXPANSION
8. GRANDCHILD_EXPANSION
9. STATE_AUTHORITIES
10. INTERACTION_AUDIT
11. INTERACTION_AUTHORITIES
12. ICON_PACK
13. COMPONENT_MANIFEST
14. IMPLEMENTATION_PACKAGE
15. OPUS_IMPLEMENTATION
16. LIVE_RUNTIME_QA
17. FOUNDER_APPROVAL

## Resolution states

- `RESOLVED` — canonical assets exist and passed the asset QA gate.
- `LEGACY_EXCEPTION` — allowed only for a legacy pilot family and **requires a documented reason** (`assetPolicyFor()` throws
  without one). JURNL F01 carries it: reason = failed harvest; excluded sources = `ASSETS/**`, `OVERLAYS/**`,
  `ASSET_HARVEST_PROOF1/**`, the canonical harvest sheet, component reference crops.
- `UNRESOLVED` — the default for every non-legacy family; the family gate's `ASSET_POLICY_RESOLVED` fails until resolved.

## JURNL F02 entry conditions

- F02 contract starts with `assetPolicyFor({ legacyPilot: false })` → `UNRESOLVED`.
- First inventory candidates: the marble bust (F01 `MISSING`), family background, botanicals, material textures.
- F02 budget record must be `TRACKED` (see `BUDGET_CONTRACT.md`).
