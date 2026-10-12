# Regeneration reserve

Batches A and B each finished with **zero** regenerations. Future batches still get an explicit ceiling. The reserve is not a spend target. Unused reserve stays in the account.

Unit: **317 credits** per 4k image-to-image job (live quote, 2026-10-10). USD: **UNVERIFIED**.

Reserve calls = `ceil(rate × base images)`.

## Balanced base (recommended): 18 images = 5,706 credits

| Case | Extra jobs | Extra credits | Total credits |
| --- | --- | --- | --- |
| 0% | 0 | 0 | 5,706 |
| 10% | 2 | 634 | 6,340 |
| 20% | 4 | 1,268 | 6,974 |

Recommended hard ceiling for the balanced run: **6,340 credits** (10% reserve).

## Lean base: 5 images = 1,585 credits

| Case | Extra jobs | Total credits |
| --- | --- | --- |
| 0% | 0 | 1,585 |
| 10% | 1 | 1,902 |
| 20% | 1 | 1,902 |

## Premium base: 39 images = 12,363 credits

| Case | Extra jobs | Total credits |
| --- | --- | --- |
| 0% | 0 | 12,363 |
| 10% | 4 | 13,631 |
| 20% | 8 | 14,899 |

Stop the runner when the approved ceiling is reached. Do not auto-retry without a remaining reserve.
