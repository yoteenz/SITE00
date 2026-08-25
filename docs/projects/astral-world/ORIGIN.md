# Astral World — Origin

**Project:** Astral World  
**Slug:** `astral-world`  
**Type:** WORLD  
**Status after P0.C:** ORIGIN_INGESTED (when ingestion run)

---

## Client state at ingestion

- Concept exists
- Identity not finalized
- Public brand name not finalized

---

## Core client concept (CLIENT PROPOSED)

A digital world for tarot readers and clients where users can choose a reader or choose an environment and be routed into that reading experience.

---

## Environment concepts (CLIENT PROPOSED — not canonical)

| Client label | Working label | Status |
|--------------|---------------|--------|
| Tarot Tent / Tarot Suite | Tarot Suite | CLIENT PROPOSED |
| Mall / on-the-spot reading | Astral Mall | CLIENT PROPOSED |
| Coffee shop / Sims-like social | Coffee Shop | CLIENT PROPOSED |

---

## Client flow (CLIENT PROPOSED)

1. Choose reader first → route to reader's location/environment
2. Choose environment first → show readers associated with that environment

---

## Reader model (CLIENT PROPOSED)

Different readers operate on the platform. Each reader may choose a primary environment.

---

## Business model direction (CLIENT PROPOSED)

- Weekly subscription for readings (no final pricing)
- Tier-based membership possible (no tier names/prices defined)

---

## Product / merchandise ideas (CLIENT PROPOSED)

- Customized cartoon tarot decks
- Personalized tarot cards
- Tarot cloths and merchandise
- Custom tarot with family/personal references

---

## Source references

Stored as `source_reference` logical assets + CLIENT_TRUTH records:

- `astral-world-ref-tarot-family-deck-draft`
- `astral-world-ref-tarot-personal-archetypes`

Reference type: `CLIENT_CREATED_CONCEPT_ART` — non-canonical.

---

## Ingestion

Run via API `origin_ingest` or UI `/projects/astral-world/origin`.

Seed data: `shared/site00-origin/astralWorldSeed.ts`
