# Resumable mass-generation runner (design only)

Not implemented. No paid calls.

## Checkpoint file

One JSON document, written after every job:

- `budget.hard_ceiling_credits`
- `budget.spent_credits`
- `budget.reserve_credits`
- `quote.unit_credits` captured at run start (317 on 2026-10-10)
- `batches[].status`: pending, running, blocked, complete
- `assets[].status`: pending, submitted, complete, failed, skipped_existing
- `assets[].history_id`, `resource_url`, `sha256`, `bytes`, `attempts`

## Rules

- Before submit: if `spent + quoted_unit > hard_ceiling`, stop the run.
- If live `openart_model_cost` unit ≠ the approved unit, stop. Do not continue on a price change.
- If auth fails, stop. No silent re-login loop.
- Max attempts per asset: **2** (one regeneration) while reserve remains. No unlimited retry.
- If the output file already exists and its sha256 matches the checkpoint, skip.
- One asset id maps to one file. Do not generate the same screen under two batch ids.
- After each batch: write that batch zip. After the run: write the master zip from completed files only.

## Concurrency

OpenArt did not return an official concurrency or rate limit on the tools used here. Batches A and B each submitted **four** jobs together and all completed. Proposed cap: **4** in flight, matching that observation. Raise it only after the provider documents a higher limit.

## Outputs

Per batch: four-to-N PNGs, contact sheet, manifest, prompts, provenance, review guide, zip, checksum.

Master zip: batch zips plus this planning folder. No client implementation in the runner.
