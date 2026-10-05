# NDXBOOK Creative Asset Lineage Methodology

Validation generation is **production-grade**, not disposable.

## Principles

1. Every generated asset receives durable lineage (origin, direction, topic, format, world, version, status).
2. The winning Core Direction becomes the **governing creative world** — never auto-selected.
3. Non-winning directions are preserved; salvage is founder-controlled.
4. **Brand Canon** (typography, color, composition, voice, motion, primary world) is separate from **Content Canon** (franchises, series, editorial mechanics).
5. Losing-direction visual DNA may only enter Brand Canon via explicit **BrandCanonTrait** founder approval.
6. Concepts carry `portableCore` (survives direction change) vs `originalExpression` (direction-native execution).
7. Translation preserves idea and audience value; replaces incompatible visual system with winning world system.

## Storage

- Normalized records: `site00_creative_asset_records`, `site00_creative_concept_records`, etc.
- Historical validation JSONB in `site00_methodology_validation_runs` is **never mutated or deleted**.
- Images: Supabase Storage `live-preview` bucket under `site00/validation/ndxbook/`.

## Founder surfaces

- **Content Library:** `/projects/ndxbook/content-library`
- **Salvage review:** within Content Library after winning-world promotion (founder-triggered)

## Launch

The winning validation output may become the first live brand content. Launch Seed Sets are planning infrastructure only — no auto-publish.
