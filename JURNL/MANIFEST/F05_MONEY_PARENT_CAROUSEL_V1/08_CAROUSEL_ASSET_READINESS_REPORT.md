# 08 — Carousel asset readiness report

**SIDEKICK_ASSET_READINESS: READY (pilot quality).** One shared environment for all four collections, plus 16 paper layers with true alpha. No generated imagery, no generative fill. **NEW_GENERATIONS: 0.**

## Shared parent (all four collections)

From the founder's text-free 9:16 SIDEKICK (941 × 1672), via `scripts/jurnl/f05-motion-pilot/extract_layers_9x16.py` (deterministic, seed 20261103):

| Layer | File | Size | Alpha | Notes |
|---|---|---|---|---|
| environment | `F05_MOTION_SIDEKICK.webp` | 941 × 1672 | opaque (by design) | statue, arch, botanicals, panel, coast and nav paper; drawn once |
| elastic panel tile | `F05_MOTION_PANEL_TILE.webp` | 941 × 290 | opaque | seamless between seams 905 / 1195; tall phones only |
| title paper | `F05_MOTION_TITLE_PAPER.webp` | 541 × 272 | true (27 % transparent) | scale-only envelope verified: 0 px of covered fill exposed |
| wax seal | `F05_MOTION_WAX_SEAL.webp` | 137 × 127 | true | envelope 0 / 0 |
| JURNL tag | `F05_MOTION_TAG_PAPER.webp` | 200 × 134 | true | lifted from the parent reference (the SIDEKICK lacks it; doc 01) |
| paper tile, torn edge | `F05_MOTION_PAPER_TILE.webp`, `F05_MOTION_TORN_EDGE.webp` | | | ADD / MOVE / ALL PLACES papers and sheets |

## Collection papers

12 papers come from C02–C04 via `scripts/jurnl/f05-motion-pilot/extract_carousel_papers.py`. ACCOUNTS uses the SIDEKICK's own four cards.

| Collection | Paper | File | Size | sha256 (12) |
|---|---|---|---|---|
| 01 | bank / payout / cash / credit | `F05_MOTION_CARD_{BANK,PAYOUT,CASH,CREDIT}.webp` | 409 × 199–217 | `dbe8885b728c` / `5e69cbdd2028` / `99dd1017aef3` / `9edfeeb98d8e` |
| 02 | in transit | `F05_PAPER_TRANSFERS_IN_TRANSIT.webp` | 409 × 199 | `90a8bb79f90b` |
| 02 | pending | `F05_PAPER_TRANSFERS_PENDING.webp` | 409 × 201 | `927e25caf649` |
| 02 | scheduled | `F05_PAPER_TRANSFERS_SCHEDULED.webp` | 408 × 217 | `099ac7728673` |
| 02 | recent transfers | `F05_PAPER_TRANSFERS_RECENT.webp` | 409 × 217 | `1b12d2dcaf6a` |
| 03 | bills + subscriptions | `F05_PAPER_COMMITMENTS_BILLS.webp` | 409 × 199 | `e8c9521c44ea` |
| 03 | savings | `F05_PAPER_COMMITMENTS_SAVINGS.webp` | 409 × 201 | `9727d142b110` |
| 03 | upcoming payments | `F05_PAPER_COMMITMENTS_UPCOMING.webp` | 408 × 217 | `033d0fc9dee4` |
| 03 | reserved | `F05_PAPER_COMMITMENTS_RESERVED.webp` | 409 × 217 | `1ac54853e07a` |
| 04 | safe to spend | `F05_PAPER_OUTLOOK_SAFE_TO_SPEND.webp` | 409 × 199 | `dbe7c78560a6` |
| 04 | next income | `F05_PAPER_OUTLOOK_NEXT_INCOME.webp` | 409 × 201 | `758c242eb5f2` |
| 04 | 30-day outlook | `F05_PAPER_OUTLOOK_FORECAST.webp` | 408 × 217 | `d1addaba8d1c` |
| 04 | spending insights | `F05_PAPER_OUTLOOK_INSIGHTS.webp` | 409 × 217 | `bc17fa3497ea` |

### Method (each paper)

1. **Rect.** Fitted with GrabCut (left, top, bottom), width 404 like every paper in the set.
2. **Alpha.** Exact rounded-rect alpha (r = 20); 3.0–3.4 % of pixels are fully transparent (the corners).
3. **Text removal.**
   - Text and the chevron are removed only inside measured text boxes, and only where dark ink lies on light parchment.
   - Removal uses the pilot's two-band reconstruction: low-frequency fill plus the same paper's grain.
   - The art itself is never touched.
4. **Fit.** Resampled to the SIDEKICK slot (≤ 2 % scale), so every collection's papers land in the same four places.
5. **No baked data.** No paper carries a name, amount, date or caption. All of those are live DOM.

## Consistency rule (directive §08)

The statue, arch and botanicals are **not** taken from C02–C04 (they differ by 8.9–9.7 % between screens; doc 01). They are drawn once, from the SIDEKICK, for every collection. Only the papers change. E2E 07 asserts the region above the papers and the dock are pixel-identical across all four collections.

## Gaps and limits (founder to note)

| Item | Status | What would close it |
|---|---|---|
| JURNL label missing from the SIDEKICK | **WORKED_AROUND** (tag lifted from the reference) | a SIDEKICK that includes the label |
| Source resolution 941 px wide | **LIMIT** | on 2× / 3× phones the art is upsampled about 1.0–1.3× (crisp at 1×; slightly soft at 3×). A 2× SIDEKICK and paper set would close it. |
| Light patch under each chevron | **FAITHFUL** | the reference's own curled paper corner, kept |
| Slight softening where removed text met the art edge | **MINOR** (bills, forecast) | only visible at 3× zoom; papers from a text-free C02–C04 export would remove it |
| SPENDING INSIGHTS art implies an insights surface | **DATA GAP** (doc 06) | the art is decoration only; the panel shows recorded spending |
| Generative fill | **NOT USED** | — |
| EXTRACTION_BLOCKED assets | **NONE** | — |
