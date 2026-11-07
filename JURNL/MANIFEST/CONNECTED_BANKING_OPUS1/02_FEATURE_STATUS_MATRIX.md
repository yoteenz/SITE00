# 02 · FEATURE STATUS MATRIX

Legend:
- **CODE** — implemented in this branch.
- **TESTED** — automated test with synthetic data, against a disposable DB and/or the stubbed browser network.
- **SANDBOX** — run against Plaid's sandbox.
- **LIVE** — run against a real institution or a real Supabase project.

| Area | Feature | CODE | TESTED | SANDBOX | LIVE |
|---|---|---|---|---|---|
| Auth | Registration, duplicate email, verification, resend, sign in, invalid credentials, rate limit, reset, change password, sign out, expired session | ✓ | ✓ browser E2E (stubbed auth) | n/a | ✗ (B-2) |
| Auth | Real email delivery | config only | ✗ | n/a | ✗ (B-2) |
| Founder | Server-side FOUNDER_FULL grant (merged #1708 line); banking gated on it | ✓ | ✓ | n/a | ✗ |
| Persistence | Data modes; empty real accounts; no preview import | ✓ | ✓ unit + E2E | n/a | ✗ |
| Persistence | Revision CAS write; audit; no blind or stale overwrite; conflict copy; offline cache; never upload after a failed pull | ✓ | ✓ unit + DB + E2E | n/a | ✗ |
| Persistence | Cross-session and cross-device restore | ✓ | ✓ 33-step (steps 27–31) + E2E | n/a | ✗ |
| Provider | Provider-neutral boundary; Plaid adapter (SDK 49.0.0) | ✓ | ✓ unit | ✗ (B-1) | ✗ |
| Provider | Server link token; server exchange; encrypted token vault | ✓ | ✓ | ✗ (B-1) | ✗ |
| Sync | Cursor sync, pagination, add / modify / remove, atomic cursor, concurrency, mutation restart, rate limit, outage, not ready | ✓ | ✓ DB-backed | ✗ (B-1) | ✗ |
| Webhooks | ES256 verification over the raw body; dedupe; out-of-order safe; ITEM events | ✓ | ✓ (real signatures) | ✗ (B-1) | ✗ |
| Health | Every connection state; retry; reconnect (same Item); disconnect (provider first, partial-failure safe) | ✓ | ✓ DB + browser E2E | ✗ (B-1) | ✗ |
| Accounts | Checking, savings, debit / payout cards, credit cards; manual Cash on Hand | ✓ | ✓ | ✗ | ✗ (B-5) |
| Uber Pro Card / Lyft Direct | Real catalog check; UNVERIFIED or UNAVAILABLE / MANUAL; no invented ids | ✓ | ✓ | ✗ (B-1) | ✗ (B-5) |
| Ledger | Imported entries with provenance; pending → posted one record; removals kept | ✓ | ✓ invariants A, H | ✗ | ✗ |
| Classification | Deterministic precedence; JURNL taxonomy + detail; no invented confidence | ✓ | ✓ | ✗ | ✗ |
| Corrections | Overrides survive sync; rules apply to future imports; rule results; match confirm / reject; duplicate marking | ✓ | ✓ invariant K, 33-step 24–26 | — | ✗ |
| Reconciliation | Transfers (not on amount alone); card payments; rideshare payout vs earnings; cash withdrawals; bills; receipts / manual duplicates | ✓ | ✓ invariants B–F | ✗ | ✗ |
| Safe to Spend | Bank facts, dated; stale / limitation copy; no sample cash in real accounts; reservations not double-counted | ✓ | ✓ invariant G, 33-step 21 | — | ✗ |
| UI | CONNECTED ACCOUNTS & SYNC panel (real accounts); menu row status; MONEY "FROM YOUR BANK" + dated source; `/jurnl/app` route; fail closed | ✓ | ✓ browser E2E, 6 viewports | — | ✗ |
| Deletion | Disconnect with optional data deletion; account deletion revokes banks first | ✓ | ✓ DB cascade + service | ✗ | ✗ |
| Read only | No payment / transfer / credential-change method exists anywhere in the provider interface | ✓ | by construction | — | — |
