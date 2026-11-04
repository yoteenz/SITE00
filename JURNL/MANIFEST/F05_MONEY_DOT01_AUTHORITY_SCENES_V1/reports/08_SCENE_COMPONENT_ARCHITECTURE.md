# 08 · Scene component architecture

```
AccountPage (shared)                         accountScenes.ts (per screen)
──────────────────────────────────           ─────────────────────────────────────────────
canonical figures (accountView)              ACCOUNT_COMPOSITIONS[kind] : AccountComposition
actions (strip ids, sheets, routes)    ─►      authority      02 | 03 | 04 | 05
chips (MANAGE POCKET, BACK)                    source         SK02_SIDEKICK | AUTHORITY_SCENE_BAND
Pocket hold (long-press)                       layers         art in paint order (+ vt jrn-place)
accessible names / aria                        label/value/caption  TextSlot {x,y,w,size,track,leading,tone,on}
                                               hold           balance area {…, on}
                                               stats          rows, size, value em, leading, track, rules|null
                                               strips         action rows (authority px)
                                               stripPapers    SK02 strip papers seated on the rows (own aspect)
                                               rowsOnTall     'zone' (02) | 'block' (03–05)
                                               stripLabel     row label size
                                             seatActionRows(rows, mode, L) → row tops for this viewport
Dot01Frame (shared shell): L0 env SK02_FIELD · L1 layers · L2 heading/title · board(L) live text · L3 chips
```

* **Shared** (never per screen): what a figure means and where it comes from, which actions exist and what they do,
  the trigger ids (`d01-strip-*`, `d01-balance`, `d01-pocket-hold`, `d01-manage`, `d01-back`), the sheets, the
  Pocket manager, focus and accessibility. These are identical for all four kinds.
* **Per screen**: only geometry and art. A composition is data (authority px) — no money, no logic. Bank is SK02's own
  geometry (unchanged pixels); 03 / 04 / 05 are built from `F05_DOT01_SCENES.json`, which the extraction script writes
  next to the art it measured.
* **Anchoring**: every slot carries `on`, the top of the art it is set on; its screen y is `by(L, on) + y − on`, so on a
  tall phone text moves with its paper or plate and never drifts off it.
* **Rows**: `seatActionRows` decides each row's top per viewport (report 13): the authority's own position at the
  authority aspect; on a tall phone the first row stays seated on its scene's foot and 40 % of the extra opens between
  rows; on a short phone rows close up (≥ 95 px pitch), rise ≤ 40 px into the scene foot, then close to ≥ 84 px, so
  the last action is on screen with no page scroll.
* **Shell (Dot01Frame)**: two changes. A content region that would run past the bottom of a short phone now ends on
  screen and scrolls inside itself (`data-clamped`), so no form or list control is ever below the fold. An overlay
  opens on its first content control (the safe choice of a confirmation), in production as in development (report 12).
* **Not a screenshot**: the authority bands carry only art; every figure, label, row and chip is live DOM over it
  (`d01-balance` carries `data-jrn-amount-cents`).
