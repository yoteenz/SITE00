# 14 · Safe to Spend buffer audit

Every fact is read at `4ddbac6ce`. They are VERIFIED_CURRENT_CODE unless marked otherwise. No calculation was changed (sprint §14).

## Verdict

**SAFE_TO_SPEND_BUFFER_STATUS: ACTIVE_AND_FUNCTIONAL in the calculation, HIDDEN in the menu, with a currency-unit defect.**

The buffer is a real financial safeguard, not a cosmetic preference. In the V3 menu it is reachable only through
PREFERENCES → AccountDrawer or the ACCOUNT page. The menu itself has no SAFE TO SPEND BUFFER row.

## Data and calculation

| Aspect | Evidence |
|---|---|
| Storage | `data/foundation/settings.ts:9` `safeToSpendBuffer: string`, default `''` (`:33`). Repository settings: localStorage `jurnl.repository.v{N}.{userId}`, server-synced when `SERVER_SYNC`. |
| Read | `data/f09/safeToSpend.ts:143-148` `safetyBufferFromSettings()`; empty → 0 |
| Effect | `safeToSpend.ts:199` `const safetyBuffer = safetyBufferFromSettings()`. `:328` `others = held + safetyBuffer + assigned + goalReserved + …`. `:329` `value = cash − upcoming − cardPayments − committedTransfers − others`. |
| Both horizons | 30-day and before-next-income both use `computeSafeToSpendThrough` (`:188`). `computeNextIncomeView` (`:416-425`): "Expected income is never added to money held." |
| Relation to obligations | subtracted beside protected, plans and goals, separate from bills due |
| Relation to balances | cash = asset accounts with `include_in_safe_to_spend` (`data/foundation/accounts.ts:68-70`) |
| Relation to projected income | never added (above) |
| Shown | F09 breakdown row `{ id: 'buffer', label: 'BUFFER' }` (`runtime/screens/SafeToSpendScreens.tsx:168`) |
| Documented invariant | `JURNL/MANIFEST/FINANCIAL_OS_UNIFICATION_V1/JURNL_SAFE_TO_SPEND_INVARIANT.md:10`; `FINANCIAL_OS_STABILIZATION_V1/03_DUAL_HORIZON_SAFE_TO_SPEND_CONTRACT.md:17`: "− SAFETY BUFFER" |
| Tests | `tests/jurnlFinancialStabilization.test.ts:381`, `tests/jurnlWave1Global.test.ts:17-18`, `e2e/jurnl/jurnl-global-systems.e2e.ts:33-37` |
| DOT 04 Outlook | the MONEY carousel OUTLOOK collection's SAFE TO SPEND paper reads the same F09 signal (`F05_PAPER_OUTLOOK_SAFE_TO_SPEND`). No separate buffer exists. |

## Edit points (three, one field)

1. AccountDrawer `drawer-buffer` / `drawer-buffer-save` (`runtime/screens/AccountScreens.tsx:382-407`). The toast reads "SAFE TO SPEND NOW KEEPS THIS AMOUNT ASIDE."
2. ACCOUNT page `settings-buffer` / `settings-buffer-save` (`AccountScreens.tsx:230-233`).
3. F09 hold sheet `safe-buffer` (`SafeToSpendScreens.tsx:328-339`).

## Defects (evidence-backed; not fixed in this sprint)

| Id | Defect | Evidence | Severity |
|---|---|---|---|
| BUF-1 | **Currency unit mismatch.** The drawer shows the display-currency symbol, but the value is saved raw and subtracted as USD. With EUR display, "€100" protects $100. | drawer symbol `AccountScreens.tsx:388,401`; raw subtraction `safeToSpend.ts:144-147`; the page hard-codes `$` (`AccountScreens.tsx:107`) | HIGH (a financial figure) |
| BUF-2 | No validation and no failure path. The toast always reports success. | `AccountScreens.tsx:62-66` | MEDIUM |
| BUF-3 | The value is read once per mount (`useMemo []`, `:44`), so a change made in the F09 hold sheet is stale in an open drawer | `AccountScreens.tsx:44` | LOW |
| BUF-4 | No reset or disable control. Disabling = saving empty. | `safeToSpend.ts:145` | LOW |

## Visual states (DESIGN_REQUIREMENT)

| State | Shows | Notes |
|---|---|---|
| VIEW BUFFER | amount in the display currency with the USD basis noted; the effect line "SAFE TO SPEND IS $X LOWER" | — |
| EDIT BUFFER | numeric field; currency explicit | fixes BUF-1 by entering in the canonical currency or converting at save |
| BUFFER ENABLED / DISABLED | explicit switch; disabled keeps the amount | today: empty = off |
| BUFFER EXPLANATION | what it protects; not a savings account | — |
| BUFFER TOO LARGE | the buffer exceeds cash: Safe to Spend would be negative or zero | warn, never block |
| BUFFER CONFLICT | another protected amount or goal also reserves the same money | explain the overlap |
| BUFFER EFFECT ON SAFE TO SPEND | before/after for both horizons | uses the F09 breakdown |

## Composition

One overlay. It reuses the V3 folio or SK03 overlay with the F09 breakdown strips. A new authority is optional. Batch B08 includes it so that a menu-level
destination has its own composition (FD-09).
