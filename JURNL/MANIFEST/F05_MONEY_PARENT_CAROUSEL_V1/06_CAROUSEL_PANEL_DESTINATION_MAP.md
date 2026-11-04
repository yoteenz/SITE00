# 06 — Panel destination map

Every paper is a real button. Each destination is an existing route or sheet; nothing is a fake route.

| Collection | Panel | Opens | Kind | Notes |
|---|---|---|---|---|
| 01 | each account | `money/places/{account_id}` (shared-element transition) | existing child route | unchanged |
| 01 | ADD A PLACE (free slot) | `AddPlaceSheet` | existing overlay | |
| 01 | MOVE MONEY (free slot, 2+ places) | `TransferSheet` | existing overlay | |
| 01 | ALL PLACES · +n (more than 4 places) | `money/places` | existing child route | the full list; the four dots stay four collections |
| 01 | token on a thread | `TransferDetailSheet` | existing overlay | recorded steps only |
| 02 | IN TRANSIT / PENDING / SCHEDULED | exactly one transfer: its `TransferDetailSheet`. Otherwise: `money/places` (its "NOT FINISHED" panel lists every open transfer) | overlay / route | |
| 02 | RECENT TRANSFERS | `activity` | existing route | **Gap:** ACTIVITY has no transfers-only filter; transfers appear among all entries |
| 03 | BILLS + SUBSCRIPTIONS | `upcoming` | existing route (F07) | |
| 03 | SAVINGS | `goals` | existing route (F14) | |
| 03 | UPCOMING PAYMENTS | `upcoming` | existing route (F07) | its timeline includes card-payment due dates |
| 03 | RESERVED | `SafeHorizonSheet` | existing overlay (F09 breakdown) | lists every commitment line |
| 04 | SAFE TO SPEND | `safe` | existing route (F09) | |
| 04 | NEXT INCOME | `income`; with no date, `income?add=expected` | existing route (F06) | |
| 04 | 30-DAY OUTLOOK | `ahead` | existing route (F15) | |
| 04 | SPENDING INSIGHTS | `activity` | existing route (F04) | **Gap:** there is no category / insights surface in JURNL. The panel shows only verified recorded spending and opens the transaction list. A real insights surface is a separate piece of work. |

Overlays open above the carousel and close back to the same collection. Routes keep the collection in the URL (`?c=…`), so back returns to it.
