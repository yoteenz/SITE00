# Character Capture Service

Captures are **evidence** of a character assembly version — not loose AI images.

## Request (`CharacterCaptureRequest`)

- `captureId`, `characterId`, `actorId`, `assemblyVersion`, `manifestHash`
- `runtimeCharacterId`, `cameraPreset`, pose/expression presets
- `resolution`, `backgroundMode`, `capturePurpose`

## Record (`CharacterCaptureRecord`)

Adds: `imageUrl` / `imageBytesBase64`, `runtimeVersion`, `capturedAt`, **`source`**: `UNREAL` | `MOCK` | `STATIC_FALLBACK`, and **lineage** (`projectId`, `entryId`, `approvedAuthorityId`).

## Rule

Every capture must trace to the same digital human instance that was loaded for that `assemblyVersion`.

## Character sheet (future)

Multi-angle sheet = ordered capture jobs using `CharacterCaptureRig` presets — no generative angle invention.

Implementation types: `shared/studio-world-live-character-runtime/capture.ts`
