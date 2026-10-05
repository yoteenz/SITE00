# SITE 00 / Astral World — P0.E.FT3.2 Immersive Interaction Language Audit

**Sprint:** P0.E.FT3.2  
**Date:** 2026-08-26

## Summary

Removed remaining conventional website interaction patterns: directory-style reader search, mall kiosk pricing grids, CRM friend rows, and loose portrait crops. Replaced with world-native discovery lens, spatial kiosk trays, portrait orbit, and isolated face-centered portrait assets.

## Deliverables

| Area | Change |
|------|--------|
| Find My Reader | Astréa backdrop + `AstralInvokeField` + category sigils + portrait orbit + brass reader tray |
| Astral Mall | Five spatial kiosk hotspots + `AstralKioskTray` (grid removed mobile + desktop) |
| Portraits | `portraitAssetRegistry.ts` — 6 readers + 4 friends + user semantic keys |
| Hotspots | Astréa alignment tuned; emblem visual language |
| Who's Here / Friends | `SpatialPresenceGroups` by destination |
| Take Me Somewhere | Intention tokens (not chip bars) |

## Tests

**97/97** Astral World tests pass (FT3.2 +11).

## Next

Run FT4 FAL P0 batch to replace isolated extraction crops with generated portrait assets.
