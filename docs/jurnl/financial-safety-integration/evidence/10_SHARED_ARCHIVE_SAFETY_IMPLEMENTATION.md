# Shared archive safety implementation

- Cabinet place archive drawer now computes `archiveBlockers(accountId, today)`.
- Blocked state shows ARCHIVE BLOCKED + RESOLVE ISSUES / KEEP POCKET (matches DOT01 vocabulary).
- Confirm path calls `archiveAccountSafely` only when blockers empty.
