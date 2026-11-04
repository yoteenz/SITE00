# 08 — Financial data binding map

One selector feeds the page: `computeMoneyParentReading()` in `src/projects/jurnl/data/f05/moneyParentReading.ts`. It reads only canonical selectors and **writes nothing**; a unit test asserts the snapshot is byte-identical before and after.

## The four figures

| Label | Value | Source | Definition |
|---|---|---|---|
| **HELD** | `summarizePositions(positions).ownedAssets` | `computeMoneyPicture` positions: settled entries only (#1706) | Money in active asset accounts (bank, debit, payout, cash, savings, investment). **Money in transit is in no account and is not in HELD** (unit test: HELD drops by $80 while a transfer is on its way, and is restored when it arrives). Card credit is never held. |
| **OWED** | `summarizePositions(positions).owed` | same | Owed on cards and loans. **Never netted against HELD.** |
| **COMMITTED** | `upcoming + cardPayments + committedTransfers + protected + safetyBuffer + assigned + goalReserved + purchaseReserved + tripReserved` | `computeSafeToSpend()` (F09) | Exactly what Safe to Spend holds back over its 30-day period: bills and subscriptions due, card minimums still due, transfers not sent yet, protected money, buffer, plan / goal / purchase / trip set-asides. |
| **AVAILABLE** | `computeSafeToSpend().value` | F09 | **Safe to Spend for the next 30 days. Not a second formula.** AVAILABLE = Safe to Spend cash − COMMITTED, where Safe to Spend cash counts only accounts marked for Safe to Spend. So HELD − COMMITTED ≠ AVAILABLE when an account (e.g. savings) is outside Safe to Spend. The basis is stated in the button's accessible name, and tapping it opens the planning-period sheet with every line. E2E check 3 asserts it equals the F09 parent's value hook. |

When there are no places of the person's own, Safe to Spend reads the sample preview (`cashSource = MOCK`). The page then shows "—" for COMMITTED and AVAILABLE, plus `ADD A PLACE TO SEE WHAT IS COMMITTED AND AVAILABLE.` A sample figure never stands next to HELD $0.

**For the founder:** the approved image's numbers imply AVAILABLE = HELD − OWED − COMMITTED ($2,450 − $780 − $420 = $1,250), which subtracts whole card balances. JURNL's single Safe to Spend formula subtracts card minimums due. The pilot follows JURNL. Changing that would be a product decision about Safe to Spend everywhere, not a MONEY-page change.

## Account papers

| Field | Source | Notes |
|---|---|---|
| `account_id` | `listActiveAccounts()` | the button's `data-account-id`, the route `money/places/{id}`, React key |
| name and lines | `display_name` → `nameLines()` | Two balanced lines: BANK / ACCOUNT, RIDESHARE / CARD, CASH / ON HAND, CREDIT / CARD. Any name works; long names shrink (×0.84 / 0.7 / 0.6) and clip, and the full name stays in the accessible name. |
| amount | position: `held` (asset) or `owed` (liability) | money-formatted in the user's currency; never animated |
| OWED tag | `nature === 'LIABILITY'` | credit cards and loans |
| transfer slip | `computeMoneyPicture().transfers` (#1706 `transferViews`) → `openTransfers()` → `paperTransferLine()` | `→ {amount} IN TRANSIT` (leaving) · `← {amount} CARD NOT CONFIRMED` (arriving) · `+n`; words are a display of the canonical state (doc 17). **A pending transfer is never shown as received.** |
| threads and tokens | the same `openTransfers()` list, with #1706 labels | position from the state (rest on source vs between); never from time |
| artwork | `artFor(type, isPayout)` | Decoration only: bank → village · debit / payout → olive and lemon · cash → amphora · credit card / loan → coin · savings / investment / business / other → village |
| order | registry order | pages of 4 (2:3, tablet, desktop) or 6 (tall phones) |

## Writes

The pilot writes nothing itself. The two write paths are the existing, unchanged sheets:

- `TransferSheet` → `recordTransfer` (atomic two-leg commit with the chosen settlement state);
- `AddPlaceSheet` → `createManualAccount`.

Decorative motion, hover, press, paging, sheets opened and closed, and navigation change no record (E2E checks 9 and 20; unit test).
