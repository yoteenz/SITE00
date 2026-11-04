# 09 — Four-collection visual fidelity comparisons

**What was compared.** Each runtime state against its own reference screen, at 9:16 (471 × 836 CSS px × 2 = the references' 941 × 1672):

| Collection | Reference | Runtime world |
|---|---|---|
| 01 ACCOUNTS | `C01_ACCOUNTS.png` | APPROVED world |
| 02 TRANSFERS | `C02_TRANSFERS.png` | CAROUSEL world |
| 03 COMMITMENTS | `C03_COMMITMENTS.png` | CAROUSEL world |
| 04 OUTLOOK | `C04_OUTLOOK.png` | CAROUSEL world |

Both worlds use synthetic data with live values.

**Files.** In `09_FIDELITY/`:

- `{collection}_reference_runtime_diff.webp`: reference | runtime | difference heat map
- `{collection}_papers_reference_vs_runtime.webp`: the papers zone, side by side
- `four_references.webp` and `four_runtime_states.webp`: the four states side by side, to judge whether they read as one composition
- `{collection}_metrics.json`: every number below

**Script.** `fidelity4.py` (OpenCV). Pixel difference uses the threshold > 24/255 on any channel.

## 1. The shared parent: identical in all four states, by construction

| Region | Runtime vs SIDEKICK | Reference vs SIDEKICK | Runtime vs reference (C01 / C02 / C03 / C04) |
|---|---|---|---|
| statue, arch, botanicals (y < 380) | **9.3 %** | 41–45 % | 40.5 / 38.5 / 37.9 / 36.1 % |
| title paper and seal | **8.0 %** | 36–39 % | 38.1 / 35.2 / 37.4 / 35.6 % |
| summary band | **7.3–7.7 %** | 19–20 % | 22.9 / 22.4 / 22.5 / 22.8 % |
| dots | **5.8 %** | 24–34 % | 38.0 / 35.1 / 35.8 / 29.2 % |
| coast illustration | **7.4 %** | 56–61 % | 60.3 / 55.5 / 58.0 / 57.6 % |
| global nav | **19.3 %** | 28–29 % | 28.1 / 28.0 / 28.2 / 28.6 % |

**Reading the table.**

- The runtime is the SIDEKICK. Within each shell region it differs from it only by the live layers drawn on top (chips and menu, JURNL tag, MONEY, script, band figures, dock labels and the active pill) and by WebP and resampling.
- The four reference screens are separate renders of one design. Each differs from the SIDEKICK by 20–61 % in the same regions, and from each other by 9–10 % above the papers (doc 01).
- So the runtime-to-reference figures equal the reference-to-SIDEKICK figures: they measure the renders, not the reconstruction.
- Per the directive, the statue, arch and botanicals are **not** re-taken per collection. E2E 07 asserts that the top of the page and the dock are pixel-identical across all four collections.

## 2. The papers: the founder's art, moved into the shared slots

Each runtime paper's art (right side, above the chevron corner) was compared with its source. For ACCOUNTS the source is the SIDEKICK; for collections 02–04 it is the reference screen. Comparison was after the best alignment within ±12 px.

| Collection | Paper | Shift (x, y) to source | Art correlation | Art pixels > 24 after alignment |
|---|---|---|---|---|
| 01 | BANK ACCOUNT | 1, 1 | 0.969 | 14.7 % |
| 01 | RIDESHARE CARD | 2, 0 | 0.976 | 9.7 % |
| 01 | CASH ON HAND | 2, 0 | 0.978 | 8.6 % |
| 01 | CREDIT CARD | 1, 0 | 0.894 | 23.5 % ¹ |
| 02 | IN TRANSIT | 1, −4 | 0.958 | 14.4 % |
| 02 | PENDING | 0, −5 | 0.974 | 9.1 % |
| 02 | SCHEDULED | 3, −8 | 0.950 | 14.7 % |
| 02 | RECENT TRANSFERS | −1, −9 | 0.981 | 8.3 % |
| 03 | BILLS + SUBSCRIPTIONS | −1, −4 | 0.841 | 31.3 % ² |
| 03 | SAVINGS | 0, −2 | 0.970 | 9.9 % |
| 03 | UPCOMING PAYMENTS | 1, −1 | 0.965 | 16.2 % |
| 03 | RESERVED | 1, −4 | 0.968 | 7.4 % |
| 04 | SAFE TO SPEND | 3, −6 | 0.963 | 16.7 % |
| 04 | NEXT INCOME | 1, −5 | 0.961 | 18.2 % |
| 04 | 30-DAY OUTLOOK | 3, −8 | 0.964 | 15.9 % |
| 04 | SPENDING INSIGHTS | 0, −10 | 0.977 | 8.6 % |

¹ The live OWED line and amount reach into the coin art's box (the reference has the same, in its own figures).

² The live word SUBSCRIPTIONS reaches into the column art's box. The art itself is unchanged.

- **Position.** C02–C04 place their papers 1–10 px higher than C01 / the SIDEKICK. The runtime puts every collection's papers in the SIDEKICK's four slots, so nothing jumps between collections. This is the source of the shifts (≤ 10 source px, ≈ 4 screen px on a phone).
- **Scale.** Every paper is 404–409 source px wide (resampled ≤ 2 %).
- **Edges, alpha and shadows.** Torn and rounded edges are the founder's; alpha is real. Shadows are redrawn as a soft halo plus contact shadow, identical for every collection.

## 3. Live typography against the reference's ink

Ink lines in each paper's text column were measured: title line(s), amount, caption.

| Collection | Median \|Δy\| on screen (source px) | Median \|Δy\| within the paper | Median \|Δx\| within the paper |
|---|---|---|---|
| 01 ACCOUNTS | 0–3 | 1–3 | 1–8 (21 on CREDIT CARD: OWED is placed differently) |
| 02 TRANSFERS | 3–7 | 2.5–11 | 2.5–13.5 |
| 03 COMMITMENTS | 3–11 | 1–15 | 3.5–8 |
| 04 OUTLOOK | 2–7 | 1.5–16 | 2–13 |

- **One rhythm.** The type follows one rhythm for all 16 papers: name top 12, line pitch 35, amount 18 below, caption 63 below. It is calibrated on C01 (the approved parent; median 2 px there).
- **Per-screen variation.** C02–C04 vary their in-paper layout slightly from screen to screen: their captions sit lower, and RECENT TRANSFERS / 30-DAY OUTLOOK put the link caption near the bottom. The runtime keeps one rhythm rather than copying each screen's variation.
- **Typography rules.** Uppercase serif for every non-cursive label, lowercase script only for "where your money lives". Live amounts, never baked.

## 4. Directive checklist (§18)

| Item | Judgement | Notes |
|---|---|---|
| Overall parent composition | **MATCH** | one shared parent; the four states read as one page (`four_runtime_states.webp`) |
| Statue placement | **MATCH (SIDEKICK)** | the SIDEKICK's render, a few px from C01–C04's |
| JURNL label placement | **MATCH (worked around)** | tag lifted from the parent reference; the SIDEKICK lacks it (doc 01) |
| MONEY parchment | **MATCH** | true-alpha title paper; live MONEY and script within 1–3 px (doc 18 of the pilot) |
| Financial summary | **MATCH** | positions and type match; figures are live (the references' are illustrative) |
| Account-fragment scale | **MATCH** | 404 px papers in the 2 × 2 grid at every size |
| Panel positions | **MATCH (shared slots)** | ≤ 10 px from C02–C04 by design: no jump between collections |
| Torn-paper edges | **MATCH** | the founder's, with real alpha |
| Artwork inside each fragment | **MATCH** | correlation 0.84–0.98 with its source (lower where live text overlaps the art box) |
| Colour contrast | **MATCH** | same palette; ink #1f1810–#2a2016 on parchment; axe: no serious or critical issues in any collection |
| Shadows and depth | **CLOSE** | redrawn halo and contact shadow, consistent across collections; the references' baked shadows vary per screen |
| Pagination | **DELIBERATE DEPARTURE** | the reference's dots (17 px, 30 px pitch); each button ≥ 24 × 44 screen px, so the pitch opens to about 54 source px on phones (doc 05) |
| Global nav | **MATCH** | HOME · MONEY · ADD · PLAN · CREDIT, MONEY active in all four; on the approved nav paper |
| Editorial typography | **CLOSE** | one rhythm for all papers (above); fonts are the project's serif and script |
| Responsive framing | **MATCH** | 360 × 780 and 393 × 852: elastic panel; 834 × 1194 and 1440 × 900: centred 9:16 board over the ambient plate (`10_SCREENSHOTS/`) |
| Chips | **DELIBERATE (pilot)** | the global menu takes the far-right square, so search and + move one square left |

**Verdict.** Every state is the founder's art in one shared, layered composition with live values. It is not generic cards over a similar background. The remaining differences are named above. None is invented artwork.
