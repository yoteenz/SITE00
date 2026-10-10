# Foundation API restart persistence proof

**Requirement:** Saved intake survives API process restart with Supabase persistence enabled.

## Attempts this sprint

| Environment | Persist flag | Result |
| --- | --- | --- |
| Cloud agent vitest `digitalFoundationPersistence.test.ts` | `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1` + `SITE00_DF_PERSISTENCE_TEST=1` | **FAIL** — 60s timeout (Supabase unreachable from agent network) |
| Cloud agent direct Supabase query | Service role present in secrets | **FAIL** — 15s connection timeout |
| Production Railway restart | Not authorized | **UNVERIFIED** |
| Staging Railway + same Supabase | Not configured | **NOT RUN** |

## Code path (when flag ON)

1. `updateIntake` / `completeIntake` → `schedulePersist` → `persistArtifactGraph`
2. Upsert `site00_df_leads`, `site00_df_artifacts`, quotes, `site00_df_operations_bundle`
3. `loadArtifactGraphByToken` hydrates memory from Supabase on cache miss

## Required proof procedure (founder-authorized)

Use a **disposable** test client (not Anthony).

1. Railway: `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1`, migrations applied.
2. Create artifact via founder admin or authorized API.
3. Complete P02–P03 fields; note `artifact_id` in Supabase dashboard only (private).
4. Confirm row in `site00_df_artifacts.intake` JSON matches form.
5. **Redeploy or restart** Railway API service (maintenance window).
6. Reopen same `/foundation/:token` link — values must match.
7. Founder admin `detail?id=` must match client payload.

Record timestamps and artifact id in **private** ops notes — not in GitHub PRs.

## Current certification

**API_RESTART_PERSISTENCE: BLOCKED** — no successful end-to-end proof on production or agent network.

**Do not launch Anthony intake until this procedure passes on the intended production stack.**
