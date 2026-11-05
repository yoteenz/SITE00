# 18 · Security and persistence verification

## What was verified (this environment)

| Check | Result | Evidence |
| --- | --- | --- |
| Device records are per user (`jurnl.repository.v5.{userId}`); user B cannot read user A's earnings or entries | PASS | invariant U |
| Reload reads the same records from storage with no duplicated entries; a retried commit is idempotent | PASS | invariant T (fresh module import against stored data), Playwright reload in the daily-earnings journey |
| One financial event = one atomic persist (no half-written transfer or earnings day) | PASS | `JurnlRepository.commit`; invariants D, I, L |
| Snapshot stays schema v5; new collections are additive with defaults; older snapshots load unchanged | PASS | `finalizeSnapshot` defaults; `tests/jurnlDeviceServerMerge.test.ts`; full JURNL unit suite |
| Server contract unchanged: `PUT /api/jurnl/repository` accepts any snapshot object scoped to the JWT user; no new endpoint, no migration | PASS (by inspection) | `api/jurnl/repository.ts` |
| No secret values or financial values added to logs / telemetry | PASS (by inspection) | new code has no `console.*` or analytics calls |
| No bank, card, payout or credit-score integration; no automatic payments; no background polling | PASS | `JURNL_BANK_CONNECTION_PROVIDER` unchanged (`PROVIDER_UNAVAILABLE`); no new network calls |
| Manual / stale data never shown as bank-confirmed | PASS | invariant V; every toast for a transfer or payment says "RECORDED BY YOU, NOT CONFIRMED BY A BANK" |

## What was NOT verified — production security proof

`npx tsx scripts/jurnl/live-proof-prerequisite-precheck.ts` (read-only) returned:

```
gate_status: PREREQUISITE_BLOCKED
missing_secret_names: SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_ANON_KEY, VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, JURNL_QA_USER_A_EMAIL, JURNL_QA_USER_A_PASSWORD,
  JURNL_QA_USER_B_EMAIL, JURNL_QA_USER_B_PASSWORD
migration_local: true   migration_remote: UNKNOWN   user_a_ready: false   user_b_ready: false
```

The live proof (real JWT → server write → server read → reload → second user denied → idempotent retry) was **not run**. Creating QA users or applying migrations on a remote project would be an unapproved database mutation, so none was attempted.

**PRODUCTION_SECURITY_PROOF: BLOCKED** — needs the GitHub Actions workflow "JURNL Live RLS & Production Sync Proof" with the secrets above, against the non-production Supabase + API.

## Database

No migration was written or applied. No production data was read or written. All test data is synthetic.
