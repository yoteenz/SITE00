# OpenArt pricing evidence — Digital Foundation visual batches

Verification date: 2026-10-10 (UTC).

Source: OpenArt MCP `openart_model_cost` and `openart_account_get` on the connected Wonder account. No generation was submitted. Credits spent this sprint: 0.

Account balance at verification: **26,590 credits**. Plan: Wonder. Currency returned by the API: **credits**, not USD.

## Live quote (one job)

| Setting | Value |
| --- | --- |
| Model | `gpt-image-2-5-sunburst` (GPT Image 2.5 Sunburst) |
| Mode | `image2image` |
| Resolution tier | 4k |
| Quality | high |
| Auto-enhance | off |
| Image count | 1 |
| Aspect 9:16 | **317 credits** |
| Aspect 16:9, same tier and quality | **317 credits** |

The API prices **per job** (one image at `imageCount: 1`). It does not return a token rate. Reference images are inputs on the same job; this quote did not add a second line item for extra references. Upload, download, and zip export returned **no separate fee** on batches A and B.

## Comparison quote (not the approved baseline)

9:16, 2k tier, quality high, image count 1: **172 credits**. Recorded only as an optimization option. The approved pipeline stays on 4k.

## USD

`openart_model_cost` does not return a dollar amount. USD per image is **UNVERIFIED**. Do not convert credits to dollars without a founder-confirmed pack price.

## Historical batches (account deltas, not a per-job receipt)

| Batch | Jobs | Regenerations | Quoted | Balance before | Balance after | Delta |
| --- | --- | --- | --- | --- | --- | --- |
| A | 4 | 0 | 317 × 4 = 1,268 | 29,118 | 27,854 | 1,264 |
| B | 4 | 0 | 317 × 4 = 1,268 | 27,854 | 26,590 | 1,264 |

OpenArt did not return a per-job receipt. Four credits per batch are unallocated. No upscale and no export charge appears in those records. Provenance files are on the unmerged batch branches; `main` at planning time does not contain the PNGs.

Historical cost per successful 4k image: **316 credits average** (1,264 / 4). Planning unit for new work: **317 credits**, the live quote.
