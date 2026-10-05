# SITE 00 — Existing Location Service Architecture

**Internal name:** `EXISTING_LOCATION`  
**Public working label:** EXISTING LOCATION  
**Date:** 2026-10-01

## Purpose

Serve clients who **already have** a website, store, app, or digital product and need SITE 00 to **diagnose, repair, enhance, install, or add custom experiences** — without a full SITE 00 rebuild.

## Relationship to EVOLVE

- **PUBLIC EVOLVE** = preserve → intervene → evolve on a digital property (marketing paths REFINE / INSTALL / TRANSFORM).
- **EXISTING LOCATION** = customer entry context: “work on what I already have.”
- Intervention modes (DIAGNOSE, REPAIR, REFINE, INSTALL, TRANSFORM, CUSTOM EXPERIENCE) sit **under** Existing Location; they may align with EVOLVE paths but are **not forced** into EVOLVE taxonomy (e.g. promotion bug → DIAGNOSE → REPAIR, not TRANSFORM).

## Canonical flow

See `SERVICE-FLOW.md`.

## Code map

| Layer | Path |
|-------|------|
| Shared types | `shared/site00-existing-location/` |
| API (client) | `api/site00/existing-location.ts` |
| API (admin) | `api/admin/site00-existing-location.ts` |
| Service (memory store in tests) | `api/_lib/existingLocation/` |
| Public UI | `src/site00/pages/existing-location/` |
| Schema migration | `supabase/migrations/20261001150000_site00_existing_location_service.sql` |

## Shopify founding example

General diagnostic system — not a one-off “free sample fix.” Adapter: `SHOPIFY-DIAGNOSTIC-ADAPTER.md`.

## Experience Compiler

New experience units registered in `service-archetypes.json` and `EXPERIENCE-COMPILER-HANDOFF.md`.

## Visual authority

Structural placeholder UI only; checkout marked `WAITING_FOR_AUTHORITY`. Founder gates: `FOUNDER-AUTHORITY-GATES.md`.
