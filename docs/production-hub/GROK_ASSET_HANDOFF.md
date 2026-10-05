# GROK ASSET HANDOFF — Production Hub (Entry 002 / NDXBOOK)

Sprint: P0.PRODUCTION-HUB.AUTHORITY-RECONSTRUCTION-AND-HANDOFF1

## Contract
Sonnet built the machine (state, graph, interactions, CSS/SVG chamber). Sonnet generated **zero** visual assets.
Every place imagery belongs is an **empty named slot**, rendered by `HubImage` (`data-asset-slot`, `data-asset-state`).

Pipeline: `Grok output → canonical asset id → HUB_ASSET_RECEIPTS → declared slot → HubImage`.

- Source of truth: `docs/production-hub/GROK_ASSET_MANIFEST.json` (generated: `npx tsx scripts/generate-production-hub-manifest.ts`).
- 17 slots need Grok material; 19 slots are already served by canonical runtime pipelines (cast/look authority boards, storyboard pipeline frames) and must NOT be fabricated.
- Files land at each entry's `destinationPath` (`public/site00/production-hub/...webp`). Do not rename.

## Required Grok slots
| Group | Count | Slots |
|---|---|---|
| Node art | 4 | narrative, performance, set, keyframes (16:10, ≥1280x800) |
| Scene plates | 7 | one per Entry 002 reel beat (16:9, ≥1280x720) |
| Project covers | 5 | ndxbook, studio-world, frontal-slayer, astral-world, all-in-one-enterprises (1:1, ≥512) |
| Chamber atmosphere | 1 | optional environmental plate (9:16, ≥1080x1920) |

## Rules for Grok
1. No text, logos, UI chrome, or chamber machinery in any image (rings, beams, rails, nodes are live code).
2. Cast/wardrobe continuity comes from the manifest `continuity` field (canonical cast + looks); do not reinterpret.
3. Do not crop or trace the authority-pack reference screenshots; they are blueprints only.
4. Exact aspect ratio per entry; single deliverable per slot.
5. Return each file with its `slotId`; Composer assigns the canonical asset id and appends a receipt.
