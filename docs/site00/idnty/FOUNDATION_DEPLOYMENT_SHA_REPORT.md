# Foundation deployment SHA report

**As of:** 2026-10-10 (Anthony launch sprint)

| Surface | Intended URL | Branch / ref | Deployed SHA | Status |
| --- | --- | --- | --- | --- |
| Public SPA (GoDaddy) | https://site00.com | `main` (production) | Unknown — not read from live HTML this sprint | **BLOCKED** |
| Cloud preview tunnel | `/tmp/site00-cloud-preview-url.txt` | `origin/preview/tunnel` (may differ from launch branch) | Not aligned with `cursor/df-anthony-launch-gate-a9f7` | **UNVERIFIED** |
| Railway API | https://api.site00.com | `main` typical | Unknown | **BLOCKED** |
| Launch integration branch | — | `cursor/df-anthony-launch-gate-a9f7` | Pending push/commit SHA | **NOT DEPLOYED** |

## Supabase binding

- Client build uses `VITE_SUPABASE_URL` / anon key from secrets (placeholders in repo).
- DF persistence: requires server `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1`.
- **Migration state on production project:** **UNVERIFIED** (agent did not apply migrations to live project).

## Feature flags (representative)

- `SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1` — enabled in dev via Vite env.
- `SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY` — **must be set on API host** for intake-only production.
- Communications send flags — default **OFF** / DRY_RUN.

## Verify procedure (founder / ops)

1. After merge + deploy, fetch production `index.html` or release manifest — confirm bundle hash ≠ stale `index.BT7zuSxb.js`.
2. Railway: note deploy commit SHA; compare to `git rev-parse main`.
3. Hit health/diagnostic route if available; confirm DF flag env on API.
4. Create **disposable** artifact on production; confirm row in Supabase `site00_df_*` tables (not memory-only).

## Agent limitation

This cloud VM validated **local Vite + memory store** only. Production deploy SHA verification is **BLOCKED** without founder-deployed build matching the launch branch merge.
