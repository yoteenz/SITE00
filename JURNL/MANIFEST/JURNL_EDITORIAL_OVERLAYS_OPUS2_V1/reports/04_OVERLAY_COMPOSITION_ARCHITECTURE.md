# 04 · Overlay composition architecture

`runtime/surfaces/editorial/Editorial.tsx` + `jurnl-editorial.css`:

| Responsibility (sprint concept) | Implementation |
|---|---|
| JURNL_OVERLAY_BEHAVIOR_HOST | `EditorialOverlay`: OverlayLayer portal, scrim, `role=dialog aria-modal`, V3 `useStableFocus` (first control, Tab trap, Escape, focus return), `data-jrn-overlay` id — **no geometry** |
| JURNL_OVERLAY_COMPOSITION | `data-jed="action" / "register" / "transfer" / "search"` — each composition places its own layers in CSS |
| JURNL_EDITORIAL_LAYER / ARTIFACT_SLOT | `EdArt`: an approved image or a source region of one, uniformly scaled (cover) into the box the composition gives it, optionally torn (deterministic clip-path) |
| JURNL_PARCHMENT_FRAGMENT | `EdHead` (V9 01 heading parchment), `.jed-sheet` (V9 14 sheet 9-slice), `.jed-pick` (V9 13 panel 9-slice) |
| JURNL_TEXTILE_LAYER | V9 03 olive branch on oxblood; OPUS2 05 coin-on-oxblood band |
| JURNL_LIVE_CONTENT_SLOT | `.jed-body` (contained scroll) with real `JurnlInput`s |
| JURNL_ACTION_FRAGMENT | `EdAction` (paper / cream / olive torn strip V9 17 / terracotta) with optional art |
| JURNL_RESPONSIVE_COMPOSITION | folio `min(404px, 100%)`, `max-height` from the visual viewport (`--jrn-vvh`); body scrolls, foot stays |
| JURNL_DECORATIVE_POINTER_POLICY | `.jed-decor` / `.jed-art` `pointer-events: none`, `aria-hidden` (E2E A1 / B4 hit-test) |

One host, four distinct geometries; no generic wrapper was swapped for another: the compositions differ in headline
placement, artifact set, ground silhouette, content arrangement and action placement.
