# SITE 00 / Astral World — P0.E.FT3.1 Scene-First Immersive Shell Audit

**Sprint:** P0.E.FT3.1  
**Truth layer:** CREATIVE_EXPLORATION / FOUNDER_FAST_TRACK  
**Date:** 2026-08-26

## Summary

Replaced mobile document-page stacks with a scene-first architecture: full-viewport environments, hotspot navigation, contextual drawers/overlays, compact world HUD, and FAL-ready scene asset slots wired to FT4 contracts.

## Systems delivered

| System | Path | Status |
|--------|------|--------|
| Scene contracts | `shared/site00-astral-world/scenes/sceneContracts.ts` | ✅ |
| Hotspot registry | `shared/site00-astral-world/scenes/hotspotRegistry.ts` | ✅ |
| Scene object model | `shared/site00-astral-world/scenes/sceneObjectRegistry.ts` | ✅ |
| AstralWorldScene shell | `src/site00/astral-world/components/immersive/AstralWorldScene.tsx` | ✅ |
| Drawers / overlays / HUD | `AstralDrawer`, `AstralOverlay`, `AstralHUD` | ✅ |
| Scene transitions | `AstralSceneTransition` in experience shell | ✅ |
| Mobile scene routes | `src/site00/astral-world/components/scenes/*` | ✅ |

## Primary mobile routes rebuilt

- HOME → `MobileArrivalScene`
- Astréa → `MobileAstreaScene` + destination hotspots
- Tarot Suite / Mall / Coffee Shop → interior scenes + drawers
- Find My Reader → world layer + portrait carousel + detail drawer
- Friends / Journal / Profile → presence, artifact, avatar scenes
- Who's Here / Take Me Somewhere → world overlays (not page stacks)

## Function preservation

All FT1 fixture services, presence, Join Her Table, kiosk selection, reader favorites, Take Me Somewhere routing, and existing test suites preserved. **86/86** Astral World tests pass.

## FAL readiness

Each `AstralWorldScene` exposes `data-scene-id` and `data-asset-slot` from scene contracts; backgrounds resolve via existing `useAstralAssets` + reference crop fallbacks.

## Recommended next step

Run FAL P0 visual-foundation batch on Railway and validate generated assets inhabit each scene slot without layout changes (FT5).
