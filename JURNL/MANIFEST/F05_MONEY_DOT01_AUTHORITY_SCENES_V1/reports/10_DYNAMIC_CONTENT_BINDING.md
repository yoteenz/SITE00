# 10 · Dynamic content binding (nothing frozen into art)

Every value is read at render from the canonical owners; the scene bands carry no text (their text pixels were
reconstructed out, report 07). `AccountPage` computes nothing.

| Page | Slot | Value | Canonical owner |
|---|---|---|---|
| all | title | the Pocket's own name (`nameLines(display_name)`) | account record (renamable, Pocket sprint) |
| all | figure `d01-balance` (`data-jrn-amount-cents`) | `held`, or `owed` for a liability | `accountView` (data/f05/dot01) on the canonical position |
| 03 | AVAILABLE BALANCE | held | idem |
| 03 | SPENDABLE | `notSetAside` | F07 `accountReservationHealth` |
| 03 | PENDING | `waitingToLeave` | `accountView` |
| 03 | CARD STATUS | `account.status` (a page exists only for an ACTIVE Pocket; archived → NotFound) | account record |
| 04 | TOTAL ON HAND | held | `accountView` |
| 04 | BILLS SET ASIDE | `setAside` (active reservations on this Pocket) | F07 reservations |
| 04 | SPENDING CASH | `notSetAside` | F07 `accountReservationHealth` |
| 04 | LAST UPDATED | TODAY / YESTERDAY / short date / NOT YET from `updatedOn`, `daysSinceUpdate` | `accountView` |
| 05 | CURRENT BALANCE + OWED | owed | `accountView` (card statement position) |
| 05 | CREDIT LIMIT | `creditLimit` or NOT SET (never invented) | account record |
| 05 | AVAILABLE CREDIT | `availableCredit` or — | `accountView` |
| 05 | DUE DATE | short date, PAST DUE, or NOT SET | `accountView.dueDate` |
| 02 | AVAILABLE / HELD / PENDING | notSetAside / setAside / waitingToLeave | as above (unchanged) |

**Changes of wording vs. the pre-sprint page (authority-driven, no figure removed from the product):** 03's rows were
SPENDABLE / SET ASIDE / PENDING and are now the authority's SPENDABLE / PENDING / CARD STATUS (SET ASIDE remains in
SPENDABLE = held − set aside, in ACTIVITY and in the Pocket's reservations); 04's NOT LEFT YET became the authority's
LAST UPDATED (money not yet left remains in ACTIVITY and in the parent's TRANSFERS collection).

Not hardcoded anywhere: credit balance, available credit, credit limit, due date, payment status (repo search: the
only literals are the labels). Synthetic data only in tests and captures.
