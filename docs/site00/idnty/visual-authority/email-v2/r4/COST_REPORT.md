# Email V2 R4 — cost report

| Item | Value |
|---|---|
| Provider | OpenArt · project `6Ueswtr8vt58ur2n3CRs` (SITE00 IDNTY Digital Foundation Production) |
| Model | `gpt-image-2-5-sunburst`, image-to-image, 2k, quality high, auto-enhance off, PNG |
| References | DF-I01, DF-I02, DF-I03 (bound by image URL, not described in text) |
| Jobs | 10 (R4-G01 … R4-G10) |
| Regenerations | 0 (all ten passed visual QA: no text in frame, right world, usable composition) |
| Reserve | 1 job held (162 credits), unused |
| Quoted | 1630 credits (2:3 162 · 3:2 3 × 162 · 4:5 2 × 147 · 16:9 4 × 172) |
| Spent | **1700 credits** (balance 20899 → 19199) |
| Previous premium ceiling | 1902 credits (`DF_V2_EMAIL_PACK_BUDGET_APPROVAL.md` PREMIUM: 4 new + 2 reserve at 317) |
| Within ceiling | Yes (1700 < 1902), so the sprint proceeded without pausing after the cost matrix |

The quote and the charge differ by 70 credits. The account balance is the record, so this report uses 1700.

Why 2k: a 640px message at 2× needs about 1280px of width. Every 2k output (1344–2304px wide) covers that and every
crop in `prepare_r4.py`, at roughly half the per-image cost of the 4k scenario the earlier ceiling assumed. That is
how ten photographs fit inside the budget previously set for four.

Coverage: 10 photographs serve 14 emails (10 P1 heroes plus 4 P2 sibling crops). Six P3 utility emails use drawn
devices only. Credits per email served: 1700 / 14 ≈ 121.

Provenance per image (history id, resource id, CDN URL, PNG SHA-256, dimensions): `OPENART_PROVENANCE.json`.
