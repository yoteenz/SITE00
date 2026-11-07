# 10 · MIGRATION, IMPACT, ROLLBACK

File: `supabase/migrations/20261107120000_jurnl_connected_banking.sql`. **It has not been applied to any hosted project.**

## What it adds

**Snapshot hardening:**
- `jurnl_user_snapshots` gets two columns: `revision bigint default 1` and `data_mode text default 'PRODUCTION'` (with a check).
- New table `jurnl_snapshot_audit`.
- New function `jurnl_put_snapshot(snapshot, schema, mode, expected_revision, source)`. It is a SECURITY DEFINER keyed to `auth.uid()`. A stale revision gets `JR409`; a mode mismatch gets `JR422`.
- INSERT and UPDATE on the snapshot table are revoked from `authenticated`, so every write goes through the compare-and-swap. Reads and the user's own DELETE stay as before.

**Banking:**
- Tables: `jurnl_bank_items`, `jurnl_bank_item_secrets`, `jurnl_bank_accounts`, `jurnl_bank_transactions`, `jurnl_bank_sync_events`, `jurnl_bank_webhook_events`.
- Policies: select-own on items, accounts, transactions and sync events. No policy on secrets or webhooks.
- Functions: `jurnl_bank_apply_sync` (atomic rows plus cursor) and `jurnl_bank_disconnect`. Both are service role only.

## Impact

- **Additive.** Nothing is dropped and no row is rewritten.
- **Existing snapshot rows:** none exist anywhere today (read-only checks found no JURNL tables in any project). Any that did would get revision 1 and mode PRODUCTION.
- **Behaviour change:** `PUT /api/jurnl/repository` now requires `expectedRevision` (428 without it), plus `dataMode`. The old blind upsert path is no longer used by the app.
- **Order:** it depends on `20261006103000_jurnl_production_persistence.sql` and `20261104183000_jurnl_internal_grants.sql`. All three apply in order on a fresh database (test: `migrations › apply in order`).

## Rollback / forward recovery

1. **Forward fix (preferred):** ship a corrective migration. The new objects are isolated from existing ones.
2. **Full rollback:** run in this order.
   - `drop function jurnl_bank_disconnect, jurnl_bank_apply_sync, jurnl_put_snapshot`
   - `drop table jurnl_bank_webhook_events, jurnl_bank_sync_events, jurnl_bank_transactions, jurnl_bank_accounts, jurnl_bank_item_secrets, jurnl_bank_items, jurnl_snapshot_audit`
   - `grant insert, update on jurnl_user_snapshots to authenticated`

   The two added snapshot columns have defaults and can stay. **Before dropping the banking tables,** revoke every Plaid Item with `/item/remove` from the API, or the provider keeps billing for them.

## Tested on disposable databases

PGlite (Postgres 16 engine, in-process) runs with a Supabase platform shim: the roles, `auth.users`, and `auth.uid()` as Supabase defines it. The results are in `05_SANDBOX_AND_TEST_RESULTS.md` (17 database / RLS tests).
