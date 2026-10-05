# Character Capture Rig

Deterministic camera presets — same preset + same assembly → same geometric framing.

## Presets (prototype)

`FRONT_FULL_BODY`, `FRONT_PORTRAIT`, `LEFT_PROFILE`, `RIGHT_PROFILE`, `BACK_FULL_BODY`, `LEFT_THREE_QUARTER`, `RIGHT_THREE_QUARTER`

Each preset defines:

- focal length (mm)
- camera height / distance / look-at height (meters)
- output resolution
- background mode

Implementation: `shared/studio-world-live-character-runtime/captureRig.ts` → `DEFAULT_CAPTURE_RIG`

Unreal side must bind preset id → fixed camera transform (version preset table if optics change).

## Character sheet minimum set

Front/back full body, left/right profile, left/right 3/4, front portrait, left/right portrait — all from **live capture**, same `characterId` + `assemblyVersion`.
