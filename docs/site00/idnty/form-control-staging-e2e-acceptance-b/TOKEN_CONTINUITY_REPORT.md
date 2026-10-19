# Token continuity report

## Live staging

**NOT RUN** — no new synthetic artifact created on staging during Sprint B (auth + deploy blockers).

## Code / unit evidence

- Persistence repair #1657: token-scoped load from Supabase when memory miss
- `openArtifactByToken` does not rotate tokens on refresh (same `public_token` in DB row)
- Invalid token → `ARTIFACT_NOT_FOUND` / client recoverable panel (artifact init recovery tests)

## Required post-deploy checks

1. Create synthetic client; copy `/foundation/<token>` link.
2. Refresh, new session, reopen link — values unchanged.
3. Confirm token string unchanged in Supabase `site00_df_artifacts.public_token`.
