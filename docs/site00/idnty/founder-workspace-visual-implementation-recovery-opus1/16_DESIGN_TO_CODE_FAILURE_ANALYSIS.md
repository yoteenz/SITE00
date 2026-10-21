# 16 · Design-to-code failure analysis

**Question:** why did the workspace look like generic developer scaffolding?

**Answer, with source evidence:**

1. **The approved implementation layer was never ported (A/B/J).**
   - The authorities shipped working markup and CSS: `ws-kit.js` + `ws.css` (950 lines, audited at 16 viewports).
   - The implementation re-described them in a new stylesheet (`idnty-founder-workspace.css`) and new JSX with different structure (`ifw-shell__*`, `ifw-metric`, `ifw-panel`).
   - Nothing referenced the authority classes. On `b446db3f` the overview had **0** `ws-` classes; after the fix it has 61.
2. **Browser defaults leaked through (B/E).**
   - Shell buttons set `font: inherit` and a border but no `color`, and there was no anchor reset, so iOS Safari tinted them blue.
   - The controls used UA weights and sizes (400 / 16 px) instead of the approved 600 / 11–12 px.
3. **No box model reset (C).** Without `box-sizing: border-box`, padded grid panels exceeded their tracks. The page scrolled horizontally at every measured width.
4. **Icons and objects unused (D).** The DF glyph set and `DfCrownObject` existed in the repo but were not referenced, so text labels stood in for icons.
5. **A runtime failure masked everything (H).** The local API compile error replaced data with a red error string on every page.
6. **No visual verification step (Q).** Acceptance was source-level (routes and overlay ids present), with no capture-and-compare against the boards.

## Method that fixed it (to reuse for propagation)
1. Port the authority CSS verbatim and scope it.
2. Port the specimen markup one-to-one into React primitives.
3. Bind real data through pure mapping functions (`readLifecycle`).
4. Capture the real app at the authority viewports and compare side by side.
5. Measure overflow, colours and fonts in the DOM.
