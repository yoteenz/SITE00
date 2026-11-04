# Account archive policy gates

**Enforced (existing `archiveBlockers`):** ACTIVE_TRANSFER, RESERVED_FUNDS, DEFAULT_ACCOUNT, RECURRING_PAYMENT, EXPECTED_INCOME, OPEN_BALANCE (credit owed > 0).

**Not enforced (FD-03 gate):** nonzero **asset held balance** on cash/bank — archiving cash with balance still allowed if no other blockers (test D53). Founder decision required to require zero held balance.
