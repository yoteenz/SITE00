# Before / after query comparison

**Measurement:** Static code analysis + forensic snapshot (PR #1602). **No live load test on production.**

| Location | Before | After | Payload / rows | Performance |
| --- | --- | --- | --- | --- |
| `listJudgmentsFromSupabase` | `select('*')` no limit | summary cols + `range` / chunks; optional omit `record` | Full JSON per row → summary ± optional record | **NOT MEASURED** (expected ↓ I/O) |
| `listCorrectionsFromSupabase` | `select('*')` no limit | projection + order + chunks | Duplicate JSON reduced | NOT MEASURED |
| Campaign copy listing | no list API | summary page API | no package `record` in list | NOT MEASURED |
| Replay org list | all rows `record` | `limit(100)` default | up to 100 JSONB records | NOT MEASURED |
| Marketing admin list | all engagements | max 500 | capped | NOT MEASURED |
| ASSTS library | unbounded assets | max 2000 | capped | NOT MEASURED |
| FS live-presence | 5000 rows / 90s | 2000 rows + 60s cache | ↓ rows; ↓ duplicate polls | NOT MEASURED |
| FS social analytics | up to 100k rows in Node | 5000 + head count | ↓ wire + memory | NOT MEASURED |

## Pagination completeness

- Unit tests cover range math and chunk iterator (`supabaseBoundedListQuery.test.ts`).
- Integration against production Supabase **not run** (sprint boundary).

## Sort order

- All new list paths use **`created_at` or `updated_at` DESC** consistent with prior implicit inserts.
