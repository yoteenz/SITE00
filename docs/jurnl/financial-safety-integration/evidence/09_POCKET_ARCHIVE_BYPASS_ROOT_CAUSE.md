# Pocket archive bypass root cause

**Entry point:** `MoneyPlaceDetailScreen` in `MoneyScreens.tsx` (cabinet / legacy F05 place route).

**Bug:** Confirm handler called `archiveAccount()` directly, skipping `archiveBlockers` (transfers, liabilities, reservations, bills, income defaults).

**DOT01 path:** Already used `archiveAccountSafely` via `AccountSheets.tsx`.
