# Build Object flicker — root cause (forensic isolation 2)

## OBSERVED DEFECT

On mobile (and founder device), the Hybrid Spatial Studio **Build Object** showed visible **frame-to-frame brightness instability** on architectural surfaces (glass, red portal, stone), especially when idle.

## ACTUAL ROOT CAUSE

**Two compounding issues:**

1. **Idle render loop + animated lighting uniforms** — After the HDRI env map loaded, `tick()` kept `requestAnimationFrame` alive via `idleLighting` while `applyArchitecturalLighting()` animated **accent light intensity/position**, **glass `envMapIntensity`**, and **red `emissiveIntensity`** every frame. That produced whole-scene luminance shifts the founder read as flicker (not only shadow acne).

2. **Transparent mesh sort instability** — Glass and red acrylic use `transparent: true`, `depthWrite: false`, and `DoubleSide`, with many panes sharing coarse `renderOrder` values (2/3). Continuous re-rendering amplified **transparency sort** variance on mobile GPUs.

There is **no** bloom / `EffectComposer` / post-processing stack in builder-studio.

## WHY PRIOR SPRINT DID NOT FIX IT

The prior pass fixed the **moving shadow-casting sun** and reduced global pulsing, but **left the idle RAF loop** and **accent / envMap / emissive animation** active. Automated SwiftShader pixel deltas improved; **founder-visible flicker persisted** because luminance still changed every frame and transparent layers kept re-sorting.

## FILES INVOLVED

| File | Role |
| --- | --- |
| `src/site00/builder-studio/buildObject/engine.ts` | RAF loop, lighting, materials, render |
| `src/site00/builder-studio/buildObject/forensics.ts` | URL forensic modes |
| `src/site00/builder-studio/buildObject/BuildObjectStage.tsx` | Engine bootstrap |
| `src/site00/styles/site00-builder-studio.css` | Canvas opacity crossfade |

## SYSTEM DISABLED / REWRITTEN

| System | Action |
| --- | --- |
| Idle `requestAnimationFrame` for lighting | **Removed** in production (render when animating, dragging, or env loading only) |
| Accent / envMap / emissive animation | **Disabled** in production (`staticLighting` default) |
| Forensic `animateLighting` | Opt-in via `?bsFlickerForensic=animateLighting` for regression capture |
| Transparent `renderOrder` | **Per-element stable order** from composition position |
| CSS canvas fade | **Disabled** in production (`bs-object__host--no-canvas-fade`) |
| Post FX | N/A (none present) |

## BEFORE RESULT

`?bsFlickerForensic=animateLighting` — continuous luminance drift; headless max channel delta elevated vs static.

## AFTER RESULT

Production default — **static high-quality lighting**, **no idle loop**; Playwright idle screenshot probe **max channel delta 1** (Q19/Q20 PASS). Capture bundle: `/opt/cursor/artifacts/site00-bldr-build-object-flicker/` (`01`–`05` `.mp4`, `capture-metrics.json`).

## FORENSIC MATRIX

| Test | Z-fighting | Transparency | React remount | Post FX | Animated lighting |
| --- | --- | --- | --- | --- | --- |
| Isolated | No duplicate geometry found | **YES** (sort + idle rAF) | No (engine singleton per stage) | **NO** (none in stack) | **YES** (prior root; now off in prod) |

## FORENSIC URL MODES

- `?bsFlickerForensic=static` — explicit static baseline
- `?bsFlickerForensic=opaqueGlass` — transparency isolation
- `?bsFlickerForensic=animateLighting` — prior animated behavior for comparison
- `?bsFlickerForensic=cssFadeOff` — CSS fade isolation

Capture script: `scripts/site00/bldr-build-object-flicker-capture.mjs`
