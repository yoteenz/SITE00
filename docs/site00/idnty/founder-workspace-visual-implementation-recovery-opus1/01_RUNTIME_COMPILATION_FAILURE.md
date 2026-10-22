# 01 · Runtime compilation failure

| Field | Value |
| --- | --- |
| Symptom | Red text in Overview, Foundations, System and Test Lab: `BUILD FAILED WITH 1 ERROR: SHARED/SITE00-CORRESPONDENCE-STUDIO/FNDATN01/CARDS.TS:98:11: ERROR: EXPECTED ";" BUT FOUND "SATISFIES"` |
| Where the text came from | Not Vite's client overlay. It is the **error message of a failed admin API request** (`foundationAdminApi.list()` / `pipeline()`), rendered by the pages' inline error slot |
| Request path | `/api/admin/site00-foundation` → `scripts/vite-site00-local-api.mjs` → `bundleApiHandler('api/admin/site00-foundation.ts')` → `esbuild.build({ bundle: true })` |
| Root cause | `import esbuild from 'esbuild'` resolves to the **hoisted esbuild 0.14.47** (from `@vercel/node`). TypeScript 4.9 `satisfies` is supported from esbuild 0.15.13, so it fails on `cards.ts:98` (`} as const satisfies Record<…>`), which the handler bundles transitively |
| Not the cause | `cards.ts` is valid TypeScript. Vite's esbuild 0.21.5 bundles the same handler cleanly, and `tsc` passes. The word `satisfies` is not the defect |
| Reproduction | Bundling `api/admin/site00-foundation.ts` with esbuild 0.14.47 gives `cards.ts:98:11: ERROR: Expected ";" but found "satisfies"`; with 0.21.5 it succeeds |
| File / lines | `scripts/vite-site00-local-api.mjs` (import + `bundleApiHandler`) |
| Fix | Resolve esbuild through Vite's own dependency: `createRequire(createRequire(import.meta.url).resolve('vite/package.json'))('esbuild')` |
| Related staleness fixes | The cache now records every bundled input (esbuild metafile, `absWorkingDir: ROOT`) and rebuilds when any input changes, not only the entry file. Rebuilt handlers are re-imported with a `?v=<mtime>` query instead of being served from Node's ESM cache |
| Scope | Dev server only (`site00LocalApiPlugin` is mounted for `vite serve`). Production build, Railway and Vercel are untouched. `cards.ts` content is preserved |
| Test | `tests/idntyFounderWorkspaceVisualRecovery.test.ts`: the loader no longer imports bare esbuild, and Vite's esbuild transforms `cards.ts` |
| Runtime result | On the implementation worktree the endpoint returns a real API answer (`SUPABASE_NOT_CONFIGURED` locally, since no Supabase env is set) instead of the build failure. Overview, Foundations and System show no compile error |
| Tunnel | Takes effect once the canonical environment serves `ba4012d59` (doc 19) |
