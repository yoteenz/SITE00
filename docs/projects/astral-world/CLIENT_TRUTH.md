# Astral World — Client Truth

**Classification:** CLIENT TRUTH (non-canonical)  
**Project:** `astral-world`

All records stored in `site00_client_truth_records` with `status=RAW` and `payload.isCanonical=false`.

---

## Truth labels

| Label | Meaning |
|-------|---------|
| CLIENT_CONFIRMED | Client explicitly stated current state |
| CLIENT_PROPOSED | Client idea/direction — not approved canon |

---

## Categories ingested

See `shared/site00-origin/astralWorldSeed.ts` for full seed list.

Key categories:

- **PROJECT_OVERVIEW** — project identity statement
- **CLIENT_CONCEPT** — core digital world concept
- **ENVIRONMENT_CONCEPTS** — Tarot Suite, Astral Mall, Coffee Shop
- **CLIENT_FLOW** — reader-first vs environment-first routing
- **READER_MODEL** — multi-reader platform idea
- **BUSINESS_MODEL** — subscription/membership direction (no final tiers)
- **PRODUCT_IDEAS** — custom/personalized tarot concept
- **MERCHANDISE_IDEAS** — decks, cloths, merchandise
- **PLATFORM_CONCEPTS** — single-reader → multi-reader evolution
- **SOURCE_REFERENCES** — tarot concept art metadata
- **CONSTRAINTS** — ingestion boundary (no auto-canonize)
- **UNRESOLVED_DECISIONS** — open questions (see UNRESOLVED_DECISIONS.md)

---

## What is NOT client truth canon

These remain **non-canonical** after ingestion:

- Environment working labels (Tarot Suite, Astral Mall, Coffee Shop)
- Business model tier structure
- Visual identity
- Custom tarot reference imagery
- Origin Summary (derived artifact)

---

## Query

```
GET /api/site00/projects?action=client_truth_list&slug=astral-world
```
