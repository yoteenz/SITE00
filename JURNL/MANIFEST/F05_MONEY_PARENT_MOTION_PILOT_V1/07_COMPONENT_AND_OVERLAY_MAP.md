# 07 — Component and overlay map

## Route

`/production/jurnl/runtime/money` → `MoneyParentRoute` (`runtime/screens/f05/MoneyParentRoute.tsx`):

- `?parent=motion` → `MoneyMotionParent` (this pilot). The choice is remembered for the browser session.
- `?parent=cabinet`, or no prior choice → `MoneyHubScreen`, the existing approved cabinet hub. **This is the default.**

The choice is a display preference in `sessionStorage` (`jurnl.f05.parent`). It never touches financial records, and if storage is unavailable the query alone decides.

## Page tree (`MoneyMotionParent.tsx`)

| Element | Role / trigger | Opens / does | Existing component reused |
|---|---|---|---|
| `JurnlScreen` F05.00 (plate `MONEY.ENVIRONMENT.MOTION_PILOT.SIDEKICK.V1`) | screen shell; the plate is also the blurred ambient on wide screens | — | `JurnlScreen` |
| `.jrn-f05m__env` L0 | decoration (`aria-hidden`) | — | — |
| `.jrn-f05m__title-paper`, `.jrn-f05m__seal` L1 | decoration | — | — |
| `p.jrn-f05m__mark` "JURNL" | wordmark text | — | — |
| `h1` MONEY, `p` "where your money lives" | heading and editorial script (lowercase) | — | — |
| `button` × 4 `f05m-metric-{held,owed,committed,available}` | figures | HELD → PLACES · OWED → CREDIT · COMMITTED / AVAILABLE → planning period | `SafeHorizonSheet` |
| `button` per account `f05m-place-{account_id}` | account paper | shared-element route to `money/places/{id}` | `MoneyPlaceDetailScreen` (unchanged except the title's transition name) |
| `button` `f05m-add-slot` | ADD A PLACE paper (free slot), or NO PLACES YET (zero accounts) | add-place sheet | `AddPlaceSheet` (exported, unchanged) |
| `button` `f05m-move` | MOVE MONEY paper (free slot, 2+ accounts) | transfer sheet | `TransferSheet` (unchanged; the #1706 settlement states) |
| `button` `f05m-transfer-{linkId}` (token on a thread) | one unfinished transfer or card payment, in its canonical state | #1706's transfer detail sheet: only `allowedActions(state)`, each a `recordTransferStep` | `TransferDetailSheet` (unchanged) |
| `i.jrn-f05m__paper-note--transit` (slip under a paper) | that paper's open transfer state (`→ / ← {amount} {STATE}`, `+n` for more) | — | — |
| `button` `f05m-next-page` | page dots (more than one page) | next page; ← / → also page | — |
| `button` `f05m-search` | SEARCH ACTIVITY chip | Activity (its search field) | `ActivityScreen` |
| `button` `f05m-actions` | "+" chip | MONEY actions sheet → ADD A PLACE · MOVE MONEY | `JurnlDrawer`, `JurnlButton` |
| global `f09-menu` chip | account drawer | unchanged | `JurnlCornerChrome` (re-seated beside the two chips) |
| `JurnlProductNav` (five items) | HOME · MONEY (active) · ADD · PLAN · CREDIT | ADD opens the canonical Quick Add | `JurnlProductNav`, `QuickAddV2Sheet` |

## Overlays (required set)

| Required overlay | Implementation | Writes |
|---|---|---|
| MOVE MONEY | `TransferSheet` (from · to · amount · how it started) | existing `recordTransfer`: two linked legs with the settlement state the person chose. **IN TRANSIT credits nothing** (E2E 10/11). |
| ADD A PLACE | `AddPlaceSheet` (name · kind · balance · optional limit · payout) | existing `createManualAccount`; success toast `PLACE ADDED`, and the new paper settles in, marked `data-fresh` |
| ACCOUNT SELECTION | the FROM / TO account chips inside `TransferSheet`, and the account papers themselves | — |
| ACCOUNT DETAILS ENTRY | the `AddPlaceSheet` fields (decimal input, validation unchanged) | — |
| TRANSFER STATE STEP | `TransferDetailSheet` from a token: MONEY LEFT THE ACCOUNT · MONEY ARRIVED / CARD CONFIRMED IT · IT FAILED (back / not back) · CANCEL · THE MONEY CAME BACK · IT WAS REVERSED | existing `recordTransferStep` (idempotent) |
| ACTION SUCCESS / ERROR | existing toasts (`transfer-result`, `f05m-added`) and inline field errors | — |
| Planning period | `SafeHorizonSheet` (30 days / before next income) | read only |

**Creative language:** while the pilot is mounted, the drawers wear its paper. That means the reconstructed parchment tile as background, the true-alpha torn edge along the top, and a deeper shadow. It is pure CSS under `.jrn[data-jrn-f05-motion]`; no form, validation or write changed. Fields keep their existing labels, decimal input modes and error messages.

## Deviations from the approved image (founder to confirm)

| # | Approved image | Pilot | Why |
|---|---|---|---|
| 1 | Two corner chips (search circle, "+" square) | Three rounded squares: search, +, and the global menu | The global menu (account drawer) is on every app screen. Removing it on MONEY would cut that access. "No circular tappable controls" makes the search chip a square. |
| 2 | Search | Opens ACTIVITY (its search field) | JURNL has no global search. Nothing was invented. |
| 3 | AVAILABLE $1,250 = HELD − OWED − COMMITTED | AVAILABLE = F09 Safe to Spend (30 days) | One formula owner. The reference subtracts the whole card balance; Safe to Spend subtracts card minimums due (doc 08). |
| 4 | Dots always shown | Dots only with more than one page | A page indicator must not claim pages that do not exist |
| 5 | Exactly four papers | 0…n papers; ADD / MOVE fill free slots; tall phones hold 6 per page | Required states (zero / one / many) |
