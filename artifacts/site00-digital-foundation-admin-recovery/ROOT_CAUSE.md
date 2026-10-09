# Digital Foundation admin console — route load recovery

## OBSERVED DEFECT

`/admin/site00/foundation` showed a runtime error when loading the list API via Vite dev middleware:

```
Cannot find module '.../tsx/dist/esm/api/esm/index.mjs'
imported from '.../tsx/dist/esm/api/index.cjs'
```

## ROOT CAUSE

`scripts/vite-site00-local-api.mjs` registered tsx with:

1. `require.resolve('tsx/esm/api')` → **CommonJS** entry (`index.cjs`)
2. `import(fileURL)` of that `.cjs` from an **ESM** Vite plugin context

On Node/Vite combinations used by the cloud preview tunnel, that cross-format dynamic import resolves broken internal subpaths (`esm/api/esm/index.mjs`).

## FIX

1. **`scripts/site00-register-tsx.cjs`** — `require('tsx/cjs/api').register()` (never dynamic-import CJS `index.cjs` from ESM).
2. **`vite-site00-local-api.mjs`** — `createRequire` loads the sidecar only.
3. **Cloud preview dev** — `NODE_OPTIONS=--import=tsx` in `run-site00-cloud-preview-server.sh`.
4. **Sync `/tmp/site00-preview-main`** to `preview/tunnel` / `main` — stale worktree kept the old loader while tunnel load-balanced multiple `:5174` backends.

## ADMIN DATA PATH (Supabase)

When `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1`, the admin `list` action only read the in-process memory store. Added `syncAllArtifactsIntoMemory()` so persisted records appear in the founder console without duplicating tokens.

## ANTHONY RECORD

Remote Supabase project linked to this workspace has **no** `site00_df_*` tables migrated yet. Anthony's production record (if any) lives on the Railway/API environment with persistence enabled — not queryable from this agent VM. **Do not create a duplicate** in this sprint.
