# THE EXCHANGE — Property registration & Opus bible ingest (Sprint 1)

**Sprint:** `P0.THE-EXCHANGE.PROPERTY-REGISTRATION-AND-OPUS-BIBLE-INGEST1`  
**Status:** Draft PR — not merged, not deployed.

## What landed

- Founder project slug **`the-exchange`** registered in the SITE 00 project index (isolated from NDXBOOK fiction).
- Durable fiction canon schema: in-memory store for tests/dev; Supabase migration `20261022120000_site00_fiction_canon.sql` for production persistence.
- Founder-controlled ingestion (`ingest_batch`) with duplicate detection and **APPROVED_CANON** overwrite protection.
- Orientation **seed only** (WORKING_CONCEPT / UNRESOLVED) — not the definitive bible.
- Fiction-specific Opus adapter **`evaluateFictionPremise`** — dry-run and context assembly only; paid Opus blocked this sprint.
- API route: `POST/GET /api/site00/fiction-canon` (founder auth + `FICTION_CANON` capability).

## What is explicitly not done

- No paid Claude Opus evaluation run.
- No episode scripting, image/video generation, or Kling dispatch.
- No merge to `main` (founder review via draft PR).

## Founder actions next

1. Review draft PR and merge when satisfied.
2. Apply Supabase migration on the production project when ready for durable canon (Railway API uses service role).
3. Supply the **complete founder fiction bible** (structured JSON and/or markdown with stable source IDs) via `ingest_batch` — do not treat the sprint seed as canon.
4. Register Sloane **FOUNDER_APPROVED_IDENTITY** asset reference when the approved file path/URL is ready (currently `AWAITING_FOUNDER_ASSET`).
5. After bible completeness + explicit approvals, enable a future sprint with `SITE00_FICTION_OPUS_EXECUTION_AUTHORIZED=1` for paid Opus critique (separate authorization).

## Ingestion readiness (current)

See `INGESTION_READINESS_REPORT.json` in this folder — generated from code constants and seed coverage; update after founder import.

## Security

- All reads/writes scoped by `propertySlug` / `propertyId`.
- No public routes for unpublished lore.
- Evaluation recommendations stored separately; **founder review required** before any canon promotion.
