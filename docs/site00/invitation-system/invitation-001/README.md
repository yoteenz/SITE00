# INVITATION 001 — Physical territories

**FOUNDER SELECTION: PENDING. PRINT PRODUCTION: NOT AUTHORIZED.**

Founder board: `renders/invitation001-founder-board.jpg`
Print specification (draft): `INVITATION001_PRINT_SPECIFICATION.md`

| Territory | Concept | Size |
|---|---|---|
| A — THE INVITATION | Luminous white, black editorial type, blind-debossed 00, silver hairline, red painted edge | 88.9 × 50.8 × 1.2 mm |
| B — THE ACCESS CARD | Soft-touch black, silver foil, spot-gloss grid, outlined 001, red edge, QR on white panel | 88.9 × 50.8 × 1.0 mm |
| C — THE THRESHOLD | Vertical triplex with red core, die-cut aperture, red column and threshold line | 55 × 100 × 1.4 mm |

## Artifacts per territory (`renders/territory-{a,b,c}-*`)

| File | What it is |
|---|---|
| `-front.png`, `-back.png` | Flat faces at 300 PPI with bleed trimmed. Code render, print geometry exact. |
| `-material-three-quarter.jpg`, `-material-back.jpg` | CSS 3D material scenes with real edge thickness and ply colours. Code render. |
| `-detail-macro.jpg` | Close crop of edge, finish and type. Code render. |
| `-print-spec.png` | Bleed, trim, safe area, QR module size, type table, finish list. |
| `-in-hand-scale.png` | True-scale comparison against a phone and a payment-card outline. |
| `-in-hand-visualization.jpg` | **AI visualization** generated from the front render. Context and approximate scale only. **Not a print proof.** Territory C scale is approximate. |

`invitation001-prototype-qr.svg` is the **prototype** QR for `https://site00.com/invite/aio-office-inv001`. It is a real, scannable code, but it is not verified production output until scanned on a physical proof.

HTML sources for every render are in `html/`.

## Recommendation (agent, not approval)

**Territory A.** It is the clearest expression of the SITE 00 light editorial system. The QR sits on a clean white field with the widest scan margin. Its premium cues (painted red edge, blind deboss, silver hairline) survive a STANDARD PREMIUM run without specialty tooling. Territory C is the strongest object and the best bridge to the digital arrival, at higher fabrication risk and cost. Territory B is the most private but carries the most risk of reading as a payment card.

## Regenerate

```bash
npx tsx scripts/site00/invitation001/render-invitation001.ts
npx tsx scripts/site00/invitation001/render-founder-board.ts
```
