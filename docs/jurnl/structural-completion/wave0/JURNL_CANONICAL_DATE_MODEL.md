# Canonical date model (Wave 0)

**Owner:** shared foundation (`src/projects/jurnl/data/foundation/dates.ts`)

- **Calendar dates** are `YYYY-MM-DD` strings validated in UTC (no timezone shift for date-only values).
- **Timestamps** remain ISO-8601 UTC when needed; do not store display strings as canonical dates.
- **Recurrence** uses `RecurrenceType` + `resolveRecurringOccurrence` (weekly / biweekly / monthly / annual).
- **Display** uses `formatRelativeDate` (TODAY / YESTERDAY / weekday / formatted date).

Legacy ledger `when` strings are normalized via `normalizeDateInput` for sorting only until Wave 1 ledger migration.
