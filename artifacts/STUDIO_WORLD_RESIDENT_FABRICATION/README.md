# Studio World — Resident Fabrication Geometry Pack (OpenArt batch)

**Sprint:** `P0.STUDIOWORLD.RESIDENT-FABRICATION.GEOMETRY-BATCH.OPENART1`  
**OpenArt project:** `Q7IHYCEK3RPn2c1ConEG`  
**Model:** `gpt-image-2-5-sunburst` · image2image · HIGH · 2K · `autoEnhancePrompt=false`

## Purpose

Identity-locked **face geometry**, **body geometry**, and **natural pose** reference frames (16 per resident) for Character Fabrication / Casting / continuity. **Not** performance or wardrobe variants.

## Identity authority

- Canonical mounted portraits in `01_IDENTITY_SOURCE/` (copied from `public/site00/production-authority-assets/shared/residents/`).
- **SW Team(1).zip** was not found in the workspace — all residents classified **`SOURCE_QUALITY: LITE_ONLY`** unless a high-res archive is added later.
- **Jules:** mounted portrait only (locs cluster = `CANDIDATE_ALTERNATE_LOOK`, not used).
- **Iona:** canonical portrait only (glam variant not used as default identity).

## Approval

Every generated frame: **`IN_REVIEW`**. Runtime canonical portraits are unchanged until founder approval.

## Artifacts

| File | Role |
|------|------|
| `resident_fabrication_manifest.json` | Machine-readable frame records |
| `GENERATION_AUDIT.json` | OpenArt history ids, retries, failures |
| `MASTER_RESIDENT_GEOMETRY_OVERVIEW.jpg` | 8-resident quick consistency sheet |
| `SW-00x_*/05_METADATA/*_CONTACT_SHEET.jpg` | Per-resident 16-frame review |

## ZIP exports (repo root `artifacts/`)

- `STUDIO_WORLD_RESIDENT_FABRICATION_GEOMETRY_REVIEW.zip` — full PNG masters
- `STUDIO_WORLD_RESIDENT_FABRICATION_GEOMETRY_REVIEW_LITE.zip` — JPEG downscale for mobile / ChatGPT review (**not final masters**)

## Commands

```bash
node scripts/studio-world-resident-fabrication-pack.mjs scaffold
node scripts/export-resident-fabrication-manifest.mjs
node scripts/studio-world-resident-fabrication-pack.mjs finalize
```

Generation is executed via OpenArt MCP (see `GENERATION_AUDIT.json`).

### Batch generation (cloud agent)

```bash
# Job queue (80 frames = SW-001..SW-005), params per index in _gen_params_<n>.json
node scripts/studio-world-resident-fabrication-openart-batch-step.mjs emit 9

# After openart_generate_image + openart_creation_wait:
npx tsx scripts/studio-world-resident-fabrication-openart-runner.mjs record '<json>'

# Optional headless loop (requires OPENART_MCP_BRIDGE executable):
# OPENART_MCP_BRIDGE=./my-bridge.sh node scripts/studio-world-resident-fabrication-openart-autogen.mjs run 71
```

Resume index: `artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/_autogen_state.json` (`nextIndex`).
