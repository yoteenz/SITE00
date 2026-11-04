# 06 · Asset layering and stacking context

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Layer | Content | Stacking context / owner |
|---|---|---|
| L0 environment | SIDEKICK slices + elastic olive tile | `.jrn-d01__board` (transform: scale) — `.jrn-d01__env` |
| L1 scenery / papers | SIDEKICK papers, motion PNG layers, nav paper | `.jrn-d01__layer` in the board |
| L2 fixed decoration | JURNL tag, seal (baked) | board |
| L3 paper surfaces | content papers (9-slice founder papers), field strips | `.jrn-d01__content` (screen px, not transformed) |
| L4 live text / data | titles, figures, labels | board (scaled) or content |
| L5 controls / icons | chips, strips, fields, micro-assets (`.f05-micro`) | board chips / content |
| L6 foreground ornament | none added (botanical corners stay baked) | — |
| L7 temporary surfaces | JURNL_POPOVER (`.jrn-pop`, z 80) | portalled into the stage `.jrn-d01` (fixed, untransformed): never clipped by the scrolling content, inside the dialog for focus |
| L8 dialogs | DOT 01 overlays (`.jrn-d01-overlay`, z 60, `OverlayLayer` portal) | runtime overlay layer |

The popover is the only new layer. It avoids creating a stacking problem by living in the stage, not the content box (which has `overflow: auto`), and avoids the dock by treating the dock top as the viewport floor. No `z-index` was raised anywhere else.
