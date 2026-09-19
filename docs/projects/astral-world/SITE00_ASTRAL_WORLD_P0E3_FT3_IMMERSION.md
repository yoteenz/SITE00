# SITE 00 / Astral World — P0.E.FT3 Immersion Recovery Audit

**Sprint:** P0.E.FT3 — Immersion Recovery + Reference-Shell Reconstruction  
**Date:** 2026-08-26  
**Governance:** CREATIVE_EXPLORATION / FOUNDER_FAST_TRACK (no canon promotion)

## Problem

P0.E.2 achieved layout/spacing convergence but retained a **website-first** visual language (dark cards, initials, empty black space). Founder rejected prior fidelity scores (Desktop 91 / Mobile 90) as invalid for immersion.

## Solution

Rebuilt major surfaces as **reference-board environment shells** with functional overlays:

- `shared/site00-astral-world/referenceCropRegistry.ts` — centralized crop keys for hero, districts, destinations, journal, portraits
- Immersive primitives: `AstralScene`, `AstralPortrait`, `AstralEnvironmentCard`, `AstralPresenceItem`, `AstralStatusChip`, `AstralHotspot`
- All major screens wired to reference crops from `public/astral-world/bg-*-cinematic.png`

## Fidelity reset (FT3 categories)

| Category | Score | Notes |
|----------|-------|-------|
| ENVIRONMENTAL_IMMERSION | 88 | Environments dominate heroes; some sheet panels remain functional |
| IMAGE_FIDELITY | 90 | Direct reference crops as production surfaces |
| PEOPLE_PRESENCE | 86 | Portraits for all seeded identities; generic demo users fallback |
| SPATIAL_WORLD_FEEL | 87 | District/destination scenes; table overlays in Coffee Shop |
| REFERENCE_COMPOSITION | 85 | Mobile/desktop crops; not pixel-perfect composite yet |
| TYPOGRAPHY | 88 | Unchanged reference tokens |
| COLOR | 88 | Unchanged reference tokens |
| INTERACTION_INTEGRATION | 90 | All FT1 routing/presence/join preserved |
| MOBILE_EXPERIENCE | 87 | Screen experiences with scene + sheet pattern |
| DESKTOP_EXPERIENCE | 86 | Hero + panorama + env destination cards |
| **OVERALL_IMMERSIVE_FIDELITY** | **87** | HIGH blocked until composition ≥90 across env/image/spatial |

**PLAIN_WEBSITE_FEEL_REMAINS:** Partially — functional sheets under scenes still read as UI panels in places.

## Tests

61/61 Astral World tests pass (P0.E.1 + P0.E.2 + FT1 + FT3).

## Remaining visual failures

1. Kiosk grid and search inputs still use conventional form UI on top of scenes
2. Portrait crops are approximate regions — not individually extracted PNG assets
3. Desktop Astréa orb hotspots could align tighter to reference composition hotspots
