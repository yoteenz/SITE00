# 01 — Foundation and source audit

**Sprint:** `P0.THE-EXCHANGE.OPUS.FOUNDER-CANON-LOCK-AND-SCREENPLAY-ARCHITECTURE.V1` · **Founder authorization:** granted 2026-10-23 · **Branch:** `cursor/the-exchange-canon-lock-screenplay-8aec` (from `main` at `159c0fa9b`)

**Result:** every required source was found and verified. No source was reconstructed. One pre-existing hash mismatch in the Master Bible is reported, not repaired.

## Sources

| Source | Location | Verification | Result |
| --- | --- | --- | --- |
| Master Bible V1 | `THE_EXCHANGE/FOUNDER_SOURCE/THE_EXCHANGE_MASTER_BIBLE_V1/` | SHA-256 of 11 documents against `ingestion_manifest.json` | 10 match. `00_READ_ME.md` differs from its recorded hash, as the Bible ingest sprint already recorded (`docs/site00/the-exchange/founder-bible-ingest-v1/01_ARCHIVE_VALIDATION_REPORT.json`). Not altered. |
| Canon approval matrix | `THE_EXCHANGE/MANIFEST/CANON_APPROVAL_MATRIX_V1.json` | Diff against `main` | Present. This sprint only appends topics and definitions (16 existing topics kept, 28 added; SHA-256 before `db4e437b…`, after `51f68aa7…`). |
| Hybrid showrunner V1 (74 releases, Plans A–C, FD-01 to FD-20) | `…/SEASON1_HISTORY/THE_EXCHANGE_FOUNDER_VISION_HYBRID_SHOWRUNNER_V1/` | ZIP `af268397…`; 8 files against `MANIFEST_SHA256.txt` | All match. 9 files including the manifest. |
| Recurring Patron Exchange Engine V1 (BASELINE V1, 86 releases) | `…/SEASON1_HISTORY/THE_EXCHANGE_RECURRING_PATRON_EXCHANGE_ENGINE_V1/` | ZIP `4005391c…`; 9 files against `MANIFEST_SHA256.txt` | All match. The baseline map has 86 rows, S1-01 to S1-86. |
| Season 1 Structural Reconciliation V1 | `…/SEASON1_HISTORY/THE_EXCHANGE_SEASON1_STRUCTURAL_RECONCILIATION_V1/` | ZIP `997fae39…`; 16 files against `MANIFEST_SHA256.txt` | All match. 17 files including the manifest: README, 01–13 Markdown, two CSVs (Option A 86 rows, Option B 81 rows). |
| Character visual registry | `THE_EXCHANGE/MANIFEST/CHARACTER_VISUAL_REGISTRY_V1.json` | Every facial asset's file hash against the registry | All match. File unchanged by this sprint. |
| Kai's Note screen test | `THE_EXCHANGE/SEASON_1/PRODUCTION_TEST_RECORDS/KAIS_NOTE_SCREEN_TEST_OPENART_V1.json` | Read back from OpenArt project `JDK0WveKdptpT6L3pLzB` | Recorded as `PRODUCTION_TEST_ONLY`; not canon. |
| Provider price quotes | `THE_EXCHANGE/SEASON_1/PRODUCTION_TEST_RECORDS/PROVIDER_PRICE_QUOTES_V1.json` | Read-only OpenArt and fal pricing calls, 2026-10-24 UTC | No paid job submitted. |

`…` = `THE_EXCHANGE/FOUNDER_SOURCE`. `SEASON1_HISTORY/SOURCE_ARCHIVES.json` records each archive's file name, SHA-256, file count, role and classification. The test suite re-hashes every history file on each run (`tests/theExchangeSeason1Master.test.ts › historical version preservation`).

## History preservation

- The three packages are stored as extracted, byte-identical copies. They are never edited, renamed or regenerated.
- The hybrid (74 releases, including Plan C) and BASELINE V1 are `HISTORICAL_SUPERSEDED`. The reconciliation package is the source of the approved recommendations.
- Option B (81 releases) is preserved as an inactive, pre-cleared production fallback. None of its five merges is active.

## Repository conventions followed

| Convention | Applied |
| --- | --- |
| Repository is the canonical store for The Exchange (no fiction tables in Supabase) | All records are versioned JSON, CSV, Fountain and Markdown under `THE_EXCHANGE/` and `docs/site00/the-exchange/` |
| Module layout of `shared/site00-fiction-canon/` | New module `shared/site00-fiction-production/` (node:fs, `process.cwd()` root, `.js` import suffixes, ES2020, strict) |
| Scripts run with `npx tsx` | `scripts/the-exchange/build-season1-production.ts`, `check-screenplays.ts`, `render-canon-lock-docs.ts` |
| Tests in `tests/` with vitest and real file reads | Three new suites, 25 tests |
| Existing guardrail types | Dispatch decisions reuse `BlockedReason` from `shared/site00-production-guardrails/` |

## Change footprint

- Two existing files modified, both by appending only: the canon approval matrix, and `motherboard/MEMORY.md` (one sprint entry, per repository convention).
- Everything else is new: history snapshots, the production module, Season 1 data, five draft screenplays, three scripts, three test suites and these deliverables.
- Not touched: facial master assets, the visual registry, the Bible, `src/`, `api/`, `server/`, other projects. No deployment, no publication, no paid generation.

## Blockers found during discovery

None for this sprint's scope. Dependencies that block later production stages are in `15_OPEN_QUESTIONS_AND_DEPENDENCIES.md`.
