# JURNL Wave 0 — Implementation Report

**Sprint:** P0.JURNL.WAVE0-FOUNDATIONS  
**Agent:** COMPOSER  
**Status:** IMPLEMENTED (foundations + registration; child families remain later waves)

## Delivered in code

| Workstream | Outcome |
|------------|---------|
| W0.1 Date model | `src/projects/jurnl/data/foundation/dates.ts` — calendar dates, recurrence helpers, relative display |
| W0.2 Categories | `src/projects/jurnl/data/foundation/categories.ts` — closed spend catalog + normalizer |
| W0.3 Repository | `src/projects/jurnl/data/repository/*` — user-scoped device adapter; setup + ledger + accounts |
| W0.4 Accounts | `src/projects/jurnl/data/foundation/accounts.ts` — registry selectors; Quick Add / filter read registry |
| W0.5 View states | `src/projects/jurnl/data/foundation/viewState.ts` |
| W0.6 Safe to spend | `src/projects/jurnl/data/f09/safeToSpend.ts` — F09-owned formula; setup obligations → PARTIAL, not silent $0 |
| W0.7 Families | `familyRegistry.ts`, F05–F16 contracts, discovery links, blueprint reachability edges |
| W0.8 Primitives | Account registry-backed pickers; discovery uses `JurnlInlineAction` |
| W0.9 Cleanup | Currency disclosure copy vs monetization test; product tree + jurnlProject registration |

## Evidence

- `tests/jurnlWave0Foundations.test.ts`
- `tests/jurnlStructuralBlueprint.test.ts` — `family_parents_unreachable_today: []`
- `npm run build` — pass
- Structural blueprint regenerated (`npx tsx scripts/jurnl/structural-blueprint/build.ts`)

## Not claimed

- Production auth (B18) or server RLS (B19) — interfaces only
- F05–F16 child routes — still disabled “NOT OPEN YET”
- Visual generation — **0** paid generations
