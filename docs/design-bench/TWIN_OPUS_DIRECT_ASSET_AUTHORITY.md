# Twin Opus Direct — asset authority

Route: `/projects/:projectSlug/design/twin-opus-direct`
Sprint: `P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1`

## What went wrong

The Grok plate set repeatedly "disappeared" after later sprints. It was not
reverting at runtime. `GROK-ASSET-OPUS1` (PR #945) was merged with
`baseRefName: cursor/twin-opus-direct-e65d` — a feature branch that had
**already been merged** into `main` by PR #942. The plates landed as commit
`e6dff158` on that stale branch and nowhere else:

```
git merge-base --is-ancestor e6dff158 origin/main   # false
```

Every later sprint branched from `main`, which had never contained
`public/site00/twin-opus-direct/`. The route silently degraded to its CSS-drawn
fallback, which still rendered and still passed every test.

The founder saw the plates because `site00.fsbw-dev.com` serves the **Vite dev
server** off whatever branch the cloud VM has checked out. During the Grok
sprint that branch had the plates; every sprint afterwards did not.

No storage, fixture, seed, server response, state initializer or fallback map
was involved. The only value this route persists is view mode.

## Current authority

`src/site00/components/designBench/opusDirect/twinOpusDirectAssetManifest.ts`
is the single source of truth. Renderers may not name a plate path directly.

Precedence, highest first:

1. `FOUNDER_APPROVED`
2. `GROK_APPROVED`
3. `PROJECT`
4. `LEGACY_FALLBACK`

`resolveTwinOpusDirectAsset(slot)` returns the approved `src` whenever the slot
is approved. A fallback is reachable **only** when a slot has no approved
asset, so a legacy texture can never reclaim a slot on remount.

CANONICAL and LIST resolve the same slots. Identity is shared; only crop and
framing differ, via `.tod-plate__photo` and `.tod-lv-plate__photo`.

## Agent firewall

| Agent | Scope | Asset rights |
|-------|-------|--------------|
| OPUS | layout, typography, UI, icons, refinement | `READ_ONLY` |
| SPARK | LIST presentation grammar | `READ_ONLY` |
| GROK | raster imagery, generated plates | mutate when explicitly requested |

`TWIN_OPUS_DIRECT_ASSET_MUTATION_ALLOWED` is `false`. Opus and Spark may read,
crop and reframe plates. Replacing a slot's source identity requires a sprint
that explicitly declares `ASSET_MUTATION_ALLOWED = YES`.

## Guards

`tests/p0vrOpusAssetPersistence1.test.ts`. The load-bearing one asserts every
manifest `src` exists under `public/`, so a slot pointing at a plate the tree
does not carry fails the suite instead of degrading quietly.

## Adding or replacing a plate

1. Commit the file under `public/site00/twin-opus-direct/`.
2. Add or update its manifest entry, including `assetId`, `version`,
   `goldenLineage` and `updatedAt`.
3. Open the PR against **`main`**, not against a feature branch. The original
   loss was a base-branch mistake, and nothing in CI can infer intent here.
