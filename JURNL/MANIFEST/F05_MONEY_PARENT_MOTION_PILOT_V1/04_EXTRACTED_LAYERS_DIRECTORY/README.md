# 04 — Extracted layers

Produced by `scripts/jurnl/f05-motion-pilot/extract_layers.py` (deterministic; the runtime copies are WebP in `src/projects/jurnl/families/F05_MONEY/MOTION_PILOT/`).

| File | Alpha | How |
|---|---|---|
| `TITLE_PAPER.png` | true alpha | GrabCut silhouette (holes filled; seal and leaves excluded); MONEY and script RECONSTRUCTED |
| `WAX_SEAL.png` | true alpha | GrabCut |
| `CARD_BANK.png`, `CARD_PAYOUT.png`, `CARD_CASH.png`, `CARD_CREDIT.png` | true alpha (exact rounded rect, r 19, supersampled) | rim-fitted geometry; text and chevron glyph RECONSTRUCTED; imagery original |
| `TORN_EDGE.webp` | true alpha | luminance key of the panel's torn top edge against the dark band |
| `PAPER_TILE.webp` | none (texture) | crop of the bank card's reconstructed parchment |
| `PANEL_TILE.webp` | none (texture) | panel interior rows 800–1090, made seamless (cross-fade) with its lighting flattened |
| `F05_MOTION_GEOMETRY.json` | — | layer boxes, card rects, seams, motion envelopes |

Not delivered as separate layers (they stay in the SIDEKICK), with reasons in doc 02: bust, arch and village, lemon branches, olive foliage, engraving, red papers, band, panel, nav paper.

Nothing here is a crop with a baked-in background labelled transparent: every file with alpha has a real transparent surround (doc 05).
