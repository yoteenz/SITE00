# 05 — Character Fabrication runtime status

## 1. Station machine

Route: `/production/:project/expression/character-fabrication` (EXPRESSION, internal guard plus `ExpressionDomainGate`, so NDXBOOK only today).

| Station | What runs | Data | Class |
| --- | --- | --- | --- |
| Identity | Actor selection from the seed catalogue | TS seed | PARTIALLY_IMPLEMENTED |
| Body | Versioned body lock; a new version invalidates downstream stations | Readouts are fixtures | PARTIALLY_IMPLEMENTED |
| Look | Candidates A, B and C; 21-garment wardrobe seed; fitting L1–L4 | Browser storage | PARTIALLY_IMPLEMENTED |
| Hair and makeup | 4 hair and 4 makeup references | Static receipts | PARTIALLY_IMPLEMENTED |
| Character | Character record assembly | Browser storage | PARTIALLY_IMPLEMENTED |
| Performance | Motion selection | Fixtures with invented capture metadata | SCHEMA_OR_INTERFACE_ONLY |
| Simulation | Deterministic cached preview (`SIMULATION_PREVIEW_CACHED`) | Static | SCHEMA_OR_INTERFACE_ONLY |
| Authority | Founder gates | Browser storage, labelled "DEVICE-LOCAL ONLY — FOUNDER GATES ARE NOT YET CANONICAL BACKEND AUTHORITY" | PARTIALLY_IMPLEMENTED |
| Final generation | — | — | NOT_FOUND ("FINAL GENERATION — not implemented") |

Evidence:
- `shared/site00-character-fabrication/*`
- `src/site00/components/characterFabrication/CharacterFabrication.tsx:130`
- `src/site00/state/characterFabricationRepository.ts:6,26,41,48` (key `site00.character-fabrication.v1.{project}.{entry}`)
- `docs/character-fabrication/CHARACTER_FABRICATION_HANDOFF.md`
- Tests: `p0CharacterFabricationMachine1` (17 tests: station graph, invalidation, receipt and manifest parity, no raster imports)

## 2. Known conflicts

- **SW-017.** The canonical record (Maya Okonkwo, 26–32, deep brown skin, black 4C hair) differs from the authority images (24–30, Caucasian, blonde). The handoff document records this (L19–20). The UI shows the canonical data with empty portraits. G-ID-04.
- **Orphan receipts.** Receipts exist for SW-022, SW-034 and SW-042, which are not in the catalogue.
- **Manifest gaps.** The manifest always writes `accessories: []`, and nails are not modelled (G-LOOK-03).

## 3. Live digital-human runtime (path B)

| Part | Evidence | Class |
| --- | --- | --- |
| `CharacterAssemblyManifest` (assembly version, approved authority ID, lineage); `assertWorkingDraft` rejects an approved manifest | `shared/studio-world-live-character-runtime/manifest.ts` (L110) | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Command protocol and WebSocket Unreal adapter | same folder; `VITE_SITE00_UNREAL_COMMAND_WS` | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Mock adapter | `liveCharacterRuntimeP0` (6 tests) | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Geometry and rig | `fabricationBridge.ts:44` `rigAuthorityId: null`; the rig "wireframe" is a picture | NOT_FOUND |
| Voice | `fabricationBridge.ts:47` `voiceAuthorityId: null` | NOT_FOUND |
| Unreal, MetaHuman, Pixel Streaming host | `LOCAL-UNREAL-SETUP.md` "UNKNOWN / REQUIRES LOCAL VERIFICATION"; MEMORY L12824–12833 | BLOCKED |
| Capture service | `CAPTURE-SERVICE.md` | SPECIFICATION_ONLY |

## 4. What fabrication can give path A now

Nothing that a provider can consume. Fabrication holds no generated identity images of its own: its receipts are crops of founder screens, and SW-017's conflict with them is unresolved.

Path A should take identity from approved reference files (CAST NDX storage or THE EXCHANGE masters) through the canonical actor registry. Fabrication can feed path A later once its final generation writes approved views to the actor record (G-DH-03, P2).

## 5. Recommendation

1. Keep path B on its own track (G-DH-01, G-DH-02 at P3).
2. Persist fabrication decisions server-side before any Composer reads them (G-LOOK-02).
3. Resolve SW-017 before fabrication images are used as identity material (G-ID-04).
4. Change no station design; this audit proposes no fabrication UI change.
