# Persistence regression report — Phase 1

**Protected repair:** PR #1657 / commit `a99d914d` (`createArtifactForLeadDurable`, stable referral id, Supabase error propagation).

## Code touch

No edits under `api/_lib/digitalFoundation/` or Supabase migrations in Phase 1.

## Tests run

| Suite | Result |
| --- | --- |
| `tests/digitalFoundationPersistenceErrors.test.ts` | Pass |
| `tests/founderReadinessE2e.test.ts` | Pass |

## Status

Persistence repair **preserved**. Intake autosave / artifact flows unchanged by Phase 1 UI work.
