# P0.E.FT5 — Pre-Flight Convergence Audit

**Date:** 2026-08-26  
**Sprint:** Master Visual Convergence + Immersive World Lock

## Current State (post FT3.2, pre FT5)

### Functional foundation — PRESERVED
- Project isolation, routing, fixture services, presence, friends, readers, Take Me Somewhere, Join Her Table, kiosks, journal, profile, FAL infrastructure all intact.

### Visual failure mode identified
Prior implementation split **mobile scene-first** (FT3.1/FT3.2) from **desktop panel/card layouts** (`DesktopHomeReferenceLayout`, `DesktopAstreaLayout`, right-rail SaaS columns). Desktop retained heading → panel → card → list document flow despite mobile convergence.

### Reference assets
| Reference | Path | Status |
|-----------|------|--------|
| Desktop master | `docs/projects/astral-world/references/astral-world-desktop-reference.png` | Ingested |
| Mobile master | `docs/projects/astral-world/references/astral-world-mobile-reference.png` | Ingested |
| Runtime crops | `/astral-world/bg-*-cinematic.png` | Active fallbacks |

### FAL asset slots (FT4)
| Status | Count | Notes |
|--------|-------|-------|
| ACTIVE/READY generated | 0 | No production FAL batch completed |
| Reference crop fallback | All P0 env + portrait slots | Interim until FT4 batch |
| Contracts bound | 10 P0 + portraits | Auto-inhabitation wired |

### Scene architecture (pre-FT5)
- Mobile: `AstralWorldScene` viewport stacks on primary routes ✓
- Desktop: legacy panel layouts + persistent right rail ✗
- Hotspots: registry with mobile/desktop adjustments ✓
- Portraits: isolated semantic registry (6 readers + 4 friends) ✓

## FT5 corrective actions
1. Unified `ImmersiveRouteFrame` — same scene components on mobile + desktop
2. `aw-shell--immersive` — hide right rail, zero canvas padding, full viewport scenes
3. `useAstralViewport` — responsive hotspot geometry on all viewports
4. Canonical `referenceManifest.ts` + `visualAnchors.ts`
5. Remove desktop/mobile layout split from primary routes

## Remaining blockers for VISUAL_LOCK
- Major scene imagery still reference-crop fallbacks (not FAL ACTIVE)
- `VISUAL_LOCK_BLOCKED_BY_ASSET_GENERATION = TRUE` until FAL P0 batch completes
