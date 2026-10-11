# Anthony Gate A — E2E certification plan

**Client:** Anthony (Digital Foundation intake artifact)  
**Rule:** Do **not** use Anthony’s live PII as test fixtures.  
**Status:** **NOT RUN** — blocked on migration approval + deploy + disposable artifact.

## Preconditions (founder approval)

- [ ] `SUPABASE_STABILITY` trending toward certified (G1 + G4 minimum).  
- [ ] Migrations **20261008160000** + **20261008170000** applied.  
- [ ] Railway: `persistSupabaseEnv: true` (already).  
- [ ] cPanel: fresh v272+ ZIP deployed.  
- [ ] Explicit approval to run **disposable** production E2E (not Anthony link).

## Test flow (disposable artifact)

| Step | Action | Pass criteria |
| --- | --- | --- |
| 1 | Founder/admin: create artifact + token (disposable email/name) | Token returned; no Anthony PII |
| 2 | SQL: row in `site00_df_artifacts` / `site00_df_leads` | Row exists |
| 3 | Open `https://site00.com/foundation/{token}` mobile (~393×852) | Intake loads; real fields |
| 4 | Partial intake save | API 200; JSON intake persisted |
| 5 | New session / hard refresh | Same data recovered |
| 6 | Complete intake / submit | State transitions; no mock data |
| 7 | Founder admin detail | Submission visible |
| 8 | SQL re-check | `intake` JSONB updated; timestamps |
| 9 | Repeat steps 3–6 desktop | Parity |
| 10 | Optional: Railway restart | Data survives (persistence proof) |

## Failure modes to watch

- `[object Object]` errors on payload (fix error serialization).  
- Silent success with memory-only store (flag on but DB write failed).  
- Checkout enabled when intake-only required (`launchGateIntakeOnly` must block).  
- Dead-end routes / broken download links.

## Anthony link

**ANTHONY_LINK: NOT SENT** until this plan passes on **production** with founder sign-off.

## Gate B separation

Stripe checkout, messaging v3 migration, email automation — **out of scope** for this plan (see `GATE_B_DEFERRED_SCOPE.md`).
