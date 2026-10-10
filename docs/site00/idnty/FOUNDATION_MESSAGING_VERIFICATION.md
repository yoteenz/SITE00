# Foundation messaging verification

## Existing infrastructure

- **API (client):** `list-messages`, `send-message`, `mark-messages-read` on `digital-foundation-artifact` (send requires `payment_state === 'PAID'`).
- **API (founder):** `GET messages`, `POST send-message` on `site00-foundation` admin handler.
- **Persistence:** `projectMessages` in DF ops bundle (`memoryStore` + `supabaseStore` serialize); migration `supabase/migrations/20261010103000_site00_df_project_messaging.sql` adds tables — **not** primary read/write path in service yet.

## Tests

- `tests/digitalFoundationMessaging.test.ts` — founder send, list, read state — **PASS** (in-process memory).

## Gate B requirements vs status

| Requirement | Status |
| --- | --- |
| Conversation thread UI (client) | **MISSING** |
| Conversation thread UI (founder) | **MISSING** (JSON/API only) |
| Two browser sessions round trip | **FAIL** — not executed |
| Refresh / new session persistence | **BLOCKED** — no SQL-backed messages |
| Authorization (cross-client) | Partial — token-scoped artifact; no broad pen-test |
| Unread state | API support; UI **not verified** |

## Minimum work to pass Gate B

1. Client + founder thread components bound to existing API.
2. Wire messaging migration to authoritative store (or document ops bundle as interim with restart test).
3. Execute sprint §14 round-trip test with screenshots + DB row proof.
