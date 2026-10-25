# 13 — Runtime and cost reconciliation

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`. All figures are read from committed records. Nothing was reserved, debited or spent.

## 1. Runtime

| Measure | Before this sprint | After | Source |
| --- | --- | --- | --- |
| Season 1 releases | 86 | 86 | `SEASON1_86_RELEASE_MASTER_V1.json` |
| Season 1 runtime | 127:40 (7,660 s) | 127:40 (7,660 s) | same |
| S1-01 runtime | 45 s, 1,080 frames at 24 fps | unchanged | S1-01 directorial packet |
| S1-01 shots | 19, same order | unchanged | packet; deliverable 04 |
| S1-01 cues | music track: 3 cues and 1 silence; 13 sound cues; no dialogue | unchanged | cue sheet unchanged byte for byte |
| S1-01-SH01 | 4 s on screen (96 frames), 5 s generated | unchanged | packet; `SHOT/S1-01-SH01.json` |

The seven S1-01 patches (deliverable 03) add no shot, cue, line or second.

## 2. S1-01-SH01 first take: planning estimate

| Line | Jobs | Credits | Basis |
| --- | --- | --- | --- |
| L-01 reference development: KF-ENV-CITY-DUSK-A, 2 candidates (also the start frame) | `JOB-S1-01-SH01-REF-01`, `-REF-02` | 80 | nano-banana-pro image2image, 2K, 9:16: 40 credits per image |
| L-02 initial video | `JOB-S1-01-SH01-VIDEO-01` | 175 | kling-3-omni image2video, pro, 5 s, sound off: 35 credits per second |
| **Total** | 3 | **255** | **PLANNING_ESTIMATE_ONLY** |

How the 255 should be read:

- **It matches the audit's estimate.** The audit put it at about 255.
- **It is not an approved budget.** The budget record's authorized credits are 0 and it has no approval. FD-S101-11, the decision that would authorize it, is OPEN.
- **The quote is old.** It comes from `PROVIDER_PRICE_QUOTES_V2.json`, read on 2026-10-24 at 14:47 UTC. The account balance then was 10,031 credits. OpenArt's credit-to-USD rate is UNKNOWN.
- **It includes no retakes.** If FD-S101-08 chooses a founder-supplied photograph instead of look development, the 80-credit reference line may not be needed.
- **It may need re-pricing.** Prices should be re-quoted before any authorization, because quotes can change.

## 3. S1-01 as a whole (unchanged, for context)

| Figure | Credits | Source |
| --- | --- | --- |
| Estimated, quoted lines | 3,400 (+ $1.48 of fal audio; assembly UNKNOWN) | `PRODUCTION_BUDGET_V1.json` |
| Expected with retakes | 4,578 | same |
| Ceiling | 5,715 | same |
| Authorized / actual / refunded | 0 / 0 / 0 | same |

The SH01 lines are part of this budget's B-01, B-02 and B-03 lines, not additional to it.

## 4. Spend ledger after this sprint

| Ledger | Credits |
| --- | --- |
| Authorized (any job, any budget) | 0 |
| Committed (dispatched attempts) | 0 |
| Actual | 0 |
| Real provider requests | 0 |
| Zero-spend dry run (fake provider, test store) | 0 reported; 0 network calls |
