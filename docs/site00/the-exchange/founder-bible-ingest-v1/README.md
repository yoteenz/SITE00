# THE EXCHANGE — Founder bible ingest V1 deliverables

Sprint: `P0.THE-EXCHANGE.FOUNDER-BIBLE-INGEST-CANON-VALIDATION-AND-OPUS-READINESS1`

| File | Purpose |
| --- | --- |
| `01_ARCHIVE_VALIDATION_REPORT.json` | ZIP/file integrity, SHA-256 checks, episode/part counts |
| `02_FOUNDER_SOURCE_INGESTION_MANIFEST.json` | Copy of founder transport manifest |
| `03_NORMALIZED_RECORD_SUMMARY.json` | Ingest batch summary |
| `04_SOURCE_TO_RECORD_TRACEABILITY.json` | Source file → stable identifier map |
| `05_CANON_CLASSIFICATION_REPORT.json` | Per-record canon/approval/knowledge layer |
| `06_UNRESOLVED_MYSTERY_REPORT.json` | Unresolved mysteries preserved |
| `07_EPISODE_THIRTY_PART_VALIDATION.json` | 10 episodes × 3 parts |
| `08_SLOANE_VISUAL_REFERENCE_REGISTRATION.json` | Two founder-selected Sloane JPEG references |
| `09_PERSISTENCE_AND_ISOLATION.json` | Local vs Supabase persistence status |
| `10_OPUS_DRY_RUN_PREVIEW.json` | What Opus would receive (no paid call) |
| `11_BLOCKERS_AND_MISSING.json` | Readiness + warnings |
| `12_FOUNDER_CANON_APPROVAL_PACK.json` | Founder review sections A–F |
| `13_OPUS_READINESS_VERDICT.json` | Dry-run readiness only |
| `14_EXECUTIVE_SUMMARY.json` | One-screen status |

**Source tree (unmodified founder text):** `THE_EXCHANGE/FOUNDER_SOURCE/THE_EXCHANGE_MASTER_BIBLE_V1/`  
**Runtime visual paths:** `public/site00/projects/the-exchange/visual_refs/*.jpg`

Regenerate JSON: `npx tsx scripts/the-exchange/write-founder-bible-deliverables.ts` (uses in-memory store unless Supabase tables exist).
