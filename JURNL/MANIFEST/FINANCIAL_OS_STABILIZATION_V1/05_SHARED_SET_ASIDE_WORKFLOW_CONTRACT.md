# 05 — Shared set-aside workflow contract (D3)

## One engine

Money set aside for a bill is a **reservation** (`JurnlReservation`, `data/f07/reservations.ts`) on the bill's current occurrence. It is created and changed only by:

- `buildSetAside(...)`: earmark an amount from an account for an occurrence.
- `buildReduceReservation(...)`: reduce or release it.

Both are applied through `JurnlRepository.commit`, atomically.

## Two entry points, the same sheet

| Entry point | Path | Opens |
|---|---|---|
| Bill page (F07) | UPCOMING → bill → SET ASIDE | `SetAsideSheet` |
| Plan (F08) | PLAN → SET MONEY ASIDE → **FOR A BILL** → bill row (`plan-bill-{id}`) | the same `SetAsideSheet`, same props |
| Plan (F08) | PLAN → SET MONEY ASIDE → **FOR SOMETHING ELSE** | existing plan-line flow (`plan-add-name` / `plan-add-save`), unchanged |

`data/f08/billSetAsides.ts` (`billSetAsideRows`, `billSetAsideTotal`, `useBillSetAsideRows`) is a **read model** over the reservations. It holds no state of its own. Each row shows the bill, the due date, the amount set aside and the amount still needed (`plan-bill-funding-{id}`).

## Invariants

1. A set-aside made from either entry point is visible in both, with the same amount (T19).
2. Changing it from either entry point updates both (T20).
3. A set-aside never reduces Safe to Spend a second time. The bill is deducted at its full remaining amount, and the set-aside is shown inside that amount (`INCLUDES {X} YOU SET ASIDE. NOT TAKEN OFF TWICE.`) (T21).
4. A set-aside never moves or pays money (`EARMARKS MONEY YOU HAVE; IT DOES NOT MOVE OR PAY ANYTHING.`).
5. A bill linked to a card has no set-aside action. The card payment flow covers it (doc 04).
6. More set aside in an account than it holds is reported as `OVER-SET-ASIDE`, never hidden.

## Proof

- **Unit:** T19 / T20 / T21.
- **E2E (×4 viewports):** `D3 set money aside: the bill page and Plan show and change the same amount`.
