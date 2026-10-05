# Studio World — Live Character Runtime Architecture

Sprint: `P0.STUDIO-WORLD.LIVE-CHARACTER-RUNTIME-ARCHITECTURE-AND-PROTOTYPE1`

## Purpose

Move Character Fabrication from **static raster fallback** to **persistent digital human projection** without making Unreal the database.

## Responsibility firewall

| Layer | Owns |
|-------|------|
| **SITE00** | Project, actor/character records, authority, approvals, versioning, wardrobe/hair/performance selection, simulation requests, capture requests, character sheets workflow, **CharacterAssemblyManifest** (canonical recipe) |
| **Unreal 5.8.2** | Metahuman instantiation, mesh/materials/groom/garments, rig/animation, testing ground 3D scene, deterministic cameras, frame capture |
| **Pixel Streaming** | WebRTC video/audio, browser input, session transport |

**Rule:** Unreal is a **runtime projection** of SITE00 state. No unsynchronized second character database.

## Character viewport providers

```
CharacterViewport
  STATIC_AUTHORITY   — current figure.webp / proxy (default)
  LIVE_UNREAL        — Pixel Streaming + command channel (opt-in)
  CACHED_SIMULATION  — future
  FINAL_RENDER       — future
```

Default remains `STATIC_AUTHORITY`. Enable live mode with `?liveRuntime=1` or `VITE_SITE00_LIVE_CHARACTER_RUNTIME=1`.

## Code map

- `shared/studio-world-live-character-runtime/` — manifest, protocol, adapters, capture rig (pure TS)
- `src/site00/characterRuntime/` — React viewport + feature flags
- `src/site00/components/characterFabrication/chamber.tsx` — `CharacterRenderer` → `CharacterViewport`

## Actor vs character

- **SW-017** → persistent actor identity / base digital-human runtime id
- **Subject Woman** → project character assembly (Entry 002) referencing SW-017

Same actor may host multiple characters; approved character versions are immutable.

## Working vs approved

- **Working assembly** — mutable draft (`assemblyVersion` ends with `-draft`)
- **Approved authority** — frozen `CharacterAssemblyVersion` (station 08 AUTHORITY)

## Sync model

1. SITE00 builds manifest from `FabricationState`
2. `manifestFingerprint(manifest)` → deterministic hash
3. Unreal `APPLY_ASSEMBLY` → ACK with `appliedAssemblyVersion` + `runtimeStateHash`
4. Viewport shows **SYNCED** or **OUT OF SYNC** — never silent stale display

## Proof integrity labels

| Label | Meaning |
|-------|---------|
| ARCHITECTED | Designed, not executed |
| IMPLEMENTED | Code in repo |
| MOCKED | `MockCharacterRuntimeAdapter` (explicit `mock: true` on ACKs) |
| LOCALLY PROVEN | Verified on founder Windows + Unreal |
| UNREAL-PROVEN | Real process, stream, capture |
| BLOCKED | Cannot run from current environment |

## Extension (future)

Same runtime host pattern can later support world/set/product assembly and shared capture department — **not built in this sprint**.
