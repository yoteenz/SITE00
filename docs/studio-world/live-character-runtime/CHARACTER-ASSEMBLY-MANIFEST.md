# Character Assembly Manifest

Canonical **recipe** to reconstruct a digital human in Unreal — not a render output.

## Type

Implementation: `shared/studio-world-live-character-runtime/manifest.ts`  
Schema version: `1`

## Fields (summary)

- **Identity:** `characterId`, `actorId`, `projectId`, `entryId`, `assemblyVersion`
- **Authority refs:** `identityAuthorityId`, `bodyAuthorityId`, appearance + wardrobe + performance + behavior ids
- **Runtime:** `runtime.engine`, `runtime.runtimeCharacterId`, `runtime.assemblyStatus`
- **Authority block:** `approvalState`, `approvedAt`, `approvedBy`
- **Lineage:** `parentAssemblyVersion`, `manifestRevision`

## Versioning rules

- Working drafts use suffix `-draft` (e.g. `2.2-draft`)
- Approved versions are **immutable** — use `assertWorkingDraft()` before mutation
- New hair/wardrobe/body changes bump `assemblyVersion`; never silently edit approved rows

## Fingerprint

`manifestFingerprint(manifest)` → `mf-xxxxxxxx` for sync verification with Unreal ACK `runtimeStateHash`.

## Bridge from Character Fabrication

`buildWorkingAssemblyManifest(state, actor, character)` maps existing `FabricationState` without changing reducer semantics.
