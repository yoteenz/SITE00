# 25 · Changed files and source map

Base: `4d222f7c0` (JURNL F05 DOT 01 authority-first account compositions; lineage `f7e2739c6` #1713 → OPUS1 → OPUS2).
Branch: `claude/jurnl-global-interactive-v3-um0u93`. No ledger, migration, server, Supabase or deploy file is touched.

## New files

| File | Lines | What it is |
|---|---:|---|
| `src/projects/jurnl/runtime/surfaces/v3/jurnl-v3.css` | 850 | The V3 token and material system: colour / material variables on `.jrn`, the type roles (`.jv3-t-*`, script lowercase), host and scrim, the A drawer (olive + field tile + torn edge), the G / I folios (parchment 9-slice + textile underlay), the F caution (oxblood + torn edge), rule labels, checklist, wax seal, pills, rows, status chips, cards, wells, notices, the context-menu fragment, the `data-jrn-material="v3"` drawer skin, toggle rows, motion + reduced-motion. |
| `src/projects/jurnl/runtime/surfaces/v3/V3Surfaces.tsx` | 337 | The canonical V3 components: `V3Drawer`, `V3NavSection`, `V3NavItem`, `V3Folio`, `V3Caution`, `V3RuleLabel`, `V3Seal`, `V3Pill`, `V3Row`, `V3Status`, `V3Card`, `V3Field`, `V3Notice`, `V3Icon`, `V3Chevron`, `tornClip`, `useStableFocus`. All mount through the single `OverlayLayer` and reuse `useOverlayFocus`. |
| `src/projects/jurnl/runtime/global/GlobalMenu.tsx` | 220 | The GLOBAL MENU (secondary navigation) and MEMBERSHIP & ACCESS: `GlobalMenu`, `MembershipFolio`, `AddOnCollection`, `UnlockFolio`, `useGlobalMenuState`, and the pure contract readers `hasFounderAccess`, `addOnState`, `planDisplayName`, `capabilityLabel`. |
| `tests/jurnlGlobalInteractiveV3.test.tsx` | 121 | 11 unit tests: M1–M3 (menu), E1–E7 (membership / add-ons / unlock / founder / fail-closed / plan names), F1 (deterministic torn edge). |
| `e2e/jurnl/jurnl-global-interactive-v3.e2e.ts` | 84 | 4 browser journeys × 4 projects: G1 menu + Escape + focus return, G2 every destination, G3 membership → add-ons → unlock, G4 axe. |
| `JURNL/MANIFEST/JURNL_GLOBAL_INTERACTIVE_V3_V1/**` | — | This evidence package (reports 01–26 + appendix, evidence WebP, metrics JSON, probe tools). |

## Modified files

| File | +/− | Change |
|---|---|---|
| `src/projects/jurnl/runtime/components/JurnlCornerChrome.tsx` | +43 / −8 | The hamburger now opens `GlobalMenu`; panels `preferences` (F09 `AccountDrawer`), `privacy` (`ConsentsSheet`, closes back to the menu), `membership`, `add-ons`, `{unlock}`; ACCOUNT routes to `/account`; focus returns to `f09-menu` when the last panel closes (rAF refocus, because the chrome re-mounts). |
| `src/projects/jurnl/runtime/components/primitives.tsx` | +5 | `JurnlDrawer` takes an opt-in `material?: 'v3'` → `data-jrn-material`. No call site changes unless it opts in. |
| `src/projects/jurnl/runtime/screens/AccountScreens.tsx` | +17 / −6 | `ConsentsSheet` exported, opts into `material="v3"`, renders labelled `.jv3-toggle-row` rows (label + note + `JurnlToggle`). Same triggers `settings-consent-remember / links / sale`; same store calls. |
| `src/projects/jurnl/runtime/finance/FinanceSheets.tsx` | +1 | `TransferSheet` (MOVE MONEY / PAY A CARD) opts into `material="v3"`. Logic untouched. |
| `src/projects/jurnl/runtime/screens/f05/dot01/PocketManager.tsx` | +3 / −1 | The row context menu is the V3 fragment (`jv3-fragment`, `minWidth 292`, chevrons). Same items, same triggers. |
| `src/projects/jurnl/runtime/screens/f05/dot01/sheets/AccountSheets.tsx` | +27 / −13 | The DELETE / ARCHIVE blocked state is a `V3Caution` inside the approved V9 frame: BLOCKERS rule, one `V3Row` per blocker (`d01-blocker-${kind}`), RESOLVE ISSUES (olive) and KEEP POCKET / KEEP ACTIVE (cream). Role `alert` when blocked. |
| `src/projects/jurnl/data/f05/dot01/archive.ts` | +15 / −1 | Founder-approved ZERO BALANCE BEFORE ARCHIVE: new blocker `HELD_BALANCE` (BALANCE REMAINING) when an asset Pocket holds money or is below zero, or a card holds a credit balance. Read-only check; nothing is moved. |
| `src/projects/jurnl/runtime/components/JurnlProductionServiceScreen.tsx` | +5 / −5 | System copy uppercased (capitalisation contract). |
| `tests/jurnlF05Dot01.test.ts` | +12 | D53 spends the remainder before archiving; new D53b (held and overdrawn Pockets block). |
| `tests/jurnlF05Pockets.test.ts` | +12 | P09 / P10 spend the remainder first; new P08b (a Pocket that holds money cannot be deleted; nothing moves). |
| `e2e/jurnl/jurnl-f05-pockets.e2e.ts` | +16 / −4 | Fixture worlds carry explicit balances (`onePocketAtZero`, `deletableWorld`); T14 asserts `d01-blocker-HELD_BALANCE`. |
| `e2e/jurnl/jurnl-f05-dot01.e2e.ts` | +3 / −1 | Test 25 sets both `balance` and `available_balance` to 0 on the archived Pocket. |

No test was weakened: each changed assertion either adds a blocker check or makes the fixture satisfy the new, stricter policy (spend to zero first).

## Source map — where each V3 panel lives

| V3 panel | Runtime surface | Source | Overlay id / triggers |
|---|---|---|---|
| 01 HAMBURGER MENU | GLOBAL MENU | `global/GlobalMenu.tsx` → `GlobalMenu` (via `V3Drawer`) | `global-menu`; `f09-menu`, `menu-*`, `global-menu-close` |
| 02 MY MEMBERSHIP | MY MEMBERSHIP folio | `GlobalMenu.tsx` → `MembershipFolio` (`V3Folio material=membership`) | `global-membership`; `membership-add-ons`; testids `membership-plan / -billing / -unavailable` |
| 03 EXPLORE ADD-ONS | ADD-ONS collection | `GlobalMenu.tsx` → `AddOnCollection` (`V3Card`) | `global-add-ons`; `add-on-<id>` |
| 04 UNLOCK FEATURE | UNLOCK folio | `GlobalMenu.tsx` → `UnlockFolio` (`V3Folio material=unlock`) | `global-unlock`; `unlock-not-now`; testid `unlock-coming-soon` |
| 05 SEARCH DRAWER | not built (U3) | — | — |
| 06 MANAGE POCKET | Pocket row context menu | `screens/f05/dot01/PocketManager.tsx` (`JurnlPopover` + `jv3-fragment`) | unchanged triggers |
| 07 ADD A POCKET | DOT 01 ADD (V9 14 kept, U1) | `screens/f05/dot01/sheets/*` | unchanged |
| 08 ARCHIVE BLOCKED | DELETE / ARCHIVE blocked caution | `screens/f05/dot01/sheets/AccountSheets.tsx` (`V3Caution`) + `data/f05/dot01/archive.ts` | `d01-blocked-why`, `d01-blocker-*`, `d01-blocker-details`, `d01-keep-pocket`, `d01-keep-active` |
| (B ledger drawer) | MOVE MONEY / PAY A CARD, PRIVACY & DATA | `JurnlDrawer material="v3"` in `FinanceSheets.tsx`, `AccountScreens.tsx` | unchanged |

## Not changed (deliberately)

- DOT 01 V9 compositions (01–41), RIDESHARE / CASH / CREDIT compositions, the F09 `AccountDrawer` folio, any financial service, the monetization contract and registry, `shared/site00-monetization/*`, server, Supabase, ledgers (side-effect ledger writes from the capture run were restored with `git checkout`).
