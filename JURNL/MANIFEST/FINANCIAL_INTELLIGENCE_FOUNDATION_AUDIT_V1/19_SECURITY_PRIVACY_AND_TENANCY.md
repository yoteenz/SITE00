# 19 — Security, privacy, and tenancy

Inspected tree: `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ `8ba653faf`
Worktree: `/tmp/site00-jurnl-integration-wt`
Default branch `main` @ `e413590e1` does not contain `src/projects/jurnl/data/ledger/accounting.ts`.
None of the financial-OS pull requests below are merged to `main`.
Tagline: PLAN TODAY. GROW FREELY.
Sprint: P0.JURNL.FINANCIAL-INTELLIGENCE.CONNECTED-TRANSACTION-UNDERSTANDING-AND-ADAPTIVE-LEARNING-FOUNDATION.AUDIT1
Application code: unchanged. Database: unchanged. Paid calls: none.


Evidence classes:

- VERIFIED_IN_REPOSITORY — read in the inspected tree.
- VERIFIED_IN_TESTS — covered by a named test in that tree.
- VERIFIED_WITH_PROVIDER_DOCS — public page read on 4 Nov 2026 (America/Chicago). Not a live JURNL connection.
- DESIGN_REQUIREMENT — required by this sprint. Not implemented.
- PROPOSED_ARCHITECTURE — design for a later implementation sprint. Not implemented.
- UNKNOWN — not established by repository evidence or a cited source.
- BLOCKED — needs a founder or vendor decision before build.

## Verified controls

- `jurnl_user_snapshots`, `jurnl_record_files`, and `jurnl_mutation_idempotency` have RLS and own-row policies in `supabase/migrations/20261006103000_jurnl_production_persistence.sql`.
- Repository mutation idempotency is per user.
- Receipt images are specified as device storage, with a SHA-256 for duplicate detection, not as an upload (`EntryReceipt.stored = 'DEVICE'`).
- F01 claim register withholds encryption, bank-level security, fraud monitoring, and "no sharing" promises because they are not verified (`copy.ts` C01–C04).
- No bank token exists to leak.

## Gaps

UNKNOWN or absent: field-level encryption of a future token table, webhook signature verification, a financial deletion workflow that revokes a provider item, and a review of service-role routes for `/api/jurnl/repository`. Those routes were not penetration-tested in this sprint. Treat server access to snapshots as a trust boundary that a later security pass must re-read before go-live.

## Requirements before any connection

- Access tokens live in a server table. They are not in the client snapshot, not in logs, and not in model prompts.
- Webhooks are verified or discarded.
- Raw provider payloads are server-only.
- The model receives, at most, a minimized classification view the user has allowed through `AI_CATEGORIZATION`. It does not receive tokens, full account numbers, or another user's rows.
- Rules carry `owner_id` and `tenant_id`. Queries include both. Scenario 28 is a release test.
- Disconnect revokes the provider item before the local status flips to DISCONNECTED.
- Deletion removes tokens, raw payloads, events, rules, and evidence for that owner. Other owners are unchanged (scenario 40).
- Household or business workspaces do not exist yet. Until OD-02, tenant equals the authenticated user. Sharing a rule means a new owner confirmation, not a copy.
- Audit logs record ids and actions, not raw tokens and not full payloads.
- Least privilege: the ingestion worker can write raw and canonical rows. The suggestion worker cannot. The client can read its own read model.
