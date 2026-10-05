# Deliverable 7, 13, 14, 15 — Interaction Surfaces, Parity, Responsive, Accessibility

## Deliverable 7 — Interaction surface map

The founder works primarily from mobile. Every interaction therefore has a touch
path, and no interaction is reachable only by hover or double click.

| interaction class | primary | keyboard | touch equivalent | notes |
|---|---|---|---|---|
| Navigation (DW-HDR, DW-NAV, DW-DOCK) | `TAP` / `CLICK` | Enter | same | — |
| View mode (DW-VIEW) | `TAP` / `CLICK` | arrow keys within the radiogroup, Enter / Space | same | already implemented |
| Viewport, record tabs (DW-VP, DW-REC) | `TAP` / `CLICK` | arrow keys, Home / End | same | roving tabindex |
| Candidate card (DW-GAL-004) | `TAP` / `CLICK` | Enter / Space | same | **no `DOUBLE_CLICK`** — see doc 01 |
| Gallery rail | `SWIPE` on touch | arrow keys move focus through cards | DW-GAL-008 next control for pointer users | the rail scrolls; it does not paginate |
| Compare (`OV-COMPARE`) | `TAP` then `SWIPE` between candidates | arrow keys switch the right slot | swipe is the mobile affordance the feature description names | — |
| Authority actions | `TAP` / `CLICK` | Enter / Space, then the confirm modal's own focus order | same | — |
| Accordion, disclosure (DW-AUTH-005, DW-AUTH-016) | `TAP` / `CLICK` | Enter / Space | same | — |
| Inspection triggers | `TAP` / `CLICK` | Enter / Space | same | — |
| Fullscreen artifact | `TAP` to open, pinch to zoom, drag to pan | Escape to close, arrows to pan | same | — |
| Overlay dismissal | scrim tap, X | Escape | back gesture | back must close the overlay, not leave the page |
| Long scroll regions | `SCROLL` | Page Up / Down | same | — |

**Not used anywhere:** `DOUBLE_CLICK`, `LONG_PRESS`, `DRAG` to reorder, and
`HOVER` as the sole route to any action. Hover may add affordance — a tooltip, a
raised state — but never exposes an action that is otherwise unreachable.
`FOCUS` never triggers an action; it only reveals focus styling.

---

## Deliverable 13 — `ViewModeSemanticParityMap`

Different presentation is allowed. Different product behaviour is not.

| action | canonical | list | same handler | same state | presentation difference | parity |
|---|---|---|---|---|---|---|
| Switch view mode | yes | yes | `setViewMode` | `viewMode` | the row is shared chrome above both bodies | PASS |
| Select viewport | yes | yes | `selectViewport` | `viewport` | canonical device glyphs; list labelled row | PASS |
| Select candidate | yes | yes | `selectCandidate` | `selectedCandidate` | canonical horizontal rail; list vertical sequence | PASS |
| Toggle authority block | yes | yes | `toggleAuthorityPair` | `authorityCollapsed` | canonical caret; list section header | PASS |
| Select record tab | yes | yes | `selectRecordTab` | `currentHistoryTab` | canonical compact strip; list wider strip | PASS |
| Select nav section | yes | yes | `selectNavSection` | `navSelection` | shared shell chrome, identical | PASS |
| Select dock destination | yes | yes | `selectDockDestination` | `dockSelection` | shared shell chrome, identical | PASS |
| Select for mobile / desktop | contract | contract | shared action | pipeline | list may stack the two controls | PASS by contract |
| Promote mobile / desktop | contract | contract | shared action | pipeline | list may show them as full-width rows | PASS by contract |
| Replace | contract | contract | shared action | pipeline | — | PASS by contract |
| Pair review | contract | contract | shared action | `pairReviewOpen` | disclosure position differs | PASS by contract |
| Lock pair | contract | contract | shared action | pipeline | — | PASS by contract |
| Compare concepts | contract | contract | shared action | `compareSelection` | — | PASS by contract |
| Refine / regenerate | contract | contract | shared action | `candidateCollection` | list may label the action row | PASS by contract |
| Inspect / fullscreen | contract | contract | shared action | `overlay` | — | PASS by contract |
| Structured output detail | contract | contract | shared action | `overlay` | canonical five-across tiles; list stacked modules | PASS by contract |
| Readiness details | contract | contract | shared action | `overlay` | canonical ring; list may present linearly | PASS by contract |
| Next action | contract | contract | shared resolver | derived | — | PASS by contract |
| Amendment detail | contract | contract | shared action | `overlay` | — | PASS by contract |

**`CANONICAL_LIST_SEMANTIC_PARITY: PASS`.**

Verified structurally, not just asserted. `useTwinOpusDirectWorkspace` returns
one `{ data, state, actions }` object; the shell passes it to whichever renderer
the registry selects. The list renderer calls `selectCandidate`,
`selectRecordTab`, `selectViewport` and `toggleAuthorityPair` — the same four
body-level actions the canonical renderer calls, with `selectNavSection` and
`selectDockDestination` living in the shared shell above both. Neither renderer
holds workspace state of its own.

**The rule for Composer:** an action is implemented once in the workspace hook.
Renderers call it. A renderer that implements an action locally has broken
parity even if the behaviour happens to match today.

---

## Deliverable 14 — Responsive functional contract

Semantics are identical at every width. Only presentation moves.

| surface | mobile 390 | tablet 834 | desktop 1440 | semantics |
|---|---|---|---|---|
| View mode row | full-width row below the context bar, sized in real pixels so it stays legible under the artboard scale | same row | same row, may align right | identical |
| Primary nav | horizontally scrollable strip | full strip | full strip | identical |
| Candidate gallery | horizontal swipe rail | swipe rail with more cards visible | visible row, next control for pointer users | **candidate selection semantics identical** |
| Authority controls | stacked full-width | two columns | two columns with the action rail beside | identical |
| Structured output | horizontally scrollable modules | wrapped grid | five across | identical |
| Pipeline / readiness | stacked panels | two columns | side by side | identical |
| Concept record tabs | scrollable strip, no truncation | full strip | full strip | identical |
| Bottom dock | fixed, five items | fixed | fixed or docked to a side rail | identical |
| Drawers | full-height bottom sheet | side drawer | side drawer | identical content and close behaviour |
| Modals | centred sheet, full width | centred | centred | identical |
| Fullscreen | true full viewport, back closes | full viewport | full viewport | identical |
| Compare | one candidate at a time with swipe | two up | two up | identical comparison semantics |

**Non-negotiables on mobile.** No horizontal page overflow. Every control has a
touch target of at least 44 CSS pixels in its real rendered size, which on this
artboard-scaled page means real-pixel sizing as the view row already does. Back
closes overlays before it leaves the page. No action is hover-only or
pointer-only; DW-GAL-008 is a pointer convenience for a rail that swipes.

---

## Deliverable 15 — Accessibility contract

| class | semantic element | accessible name | focusable | keyboard | focus state | selected | expanded | disabled |
|---|---|---|---|---|---|---|---|---|
| `NAVIGATION` | `<a>` for real routes, `<button>` for tab state | visible label | yes | Enter | visible ring | `aria-current="page"` | — | `aria-disabled` |
| `WORKSPACE_MODE` | `<button role="radio">` inside `role="radiogroup"` | visible label; group labelled by `VIEW` | roving | arrows, Enter, Space | visible ring | `aria-checked` | — | — |
| `SELECTOR` (viewport) | `<button role="radio">` in a labelled radiogroup | visible label | roving | arrows | visible ring | `aria-checked` | — | `aria-disabled` + reason |
| `TAB` | `<button role="tab">` in `role="tablist"` with `role="tabpanel"` | visible label | roving | arrows, Home, End | visible ring | `aria-selected` | `aria-controls` | — |
| `SELECTABLE_CARD` | `<button>` | version plus artifact description | yes | Enter, Space | visible ring on the whole card | `aria-pressed` | — | — |
| `ACCORDION` | `<button>` | section title | yes | Enter, Space | visible ring | — | `aria-expanded` + `aria-controls` | — |
| `DISCLOSURE` | `<button>` | control label | yes | Enter, Space | visible ring | — | `aria-expanded` | `aria-disabled` until both masters promoted |
| `STATE_ACTION` | `<button>` | visible label plus viewport, e.g. "Select for mobile" | yes | Enter, Space | visible ring | — | — | `aria-disabled` with the reason in the accessible description |
| `APPROVAL_ACTION` | `<button>` | full label, never an icon alone | yes | Enter, Space | visible ring | — | — | `aria-disabled` plus the blocking gate named in `aria-describedby` |
| `DESTRUCTIVE_ACTION` | `<button>` | label naming the target, e.g. "Replace desktop master" | yes | Enter, Space | visible ring | — | — | `aria-disabled` |
| `SYSTEM_ACTION` | `<button>` | label; `aria-busy` while generating | yes | Enter, Space | visible ring | — | — | `aria-disabled` while in flight |
| `MODAL_TRIGGER` | `<button aria-haspopup="dialog">` | label | yes | Enter, Space | visible ring | — | — | — |
| `DRAWER_TRIGGER` | `<button aria-haspopup="dialog">` | label; icon-only triggers need `aria-label`, e.g. "Inspect grounding detail" | yes | Enter, Space | visible ring | — | `aria-expanded` while open | — |
| `FULLSCREEN_TRIGGER` | `<button>` | "View <artifact> fullscreen" | yes | Enter, Space | visible ring | — | — | — |
| `CONTEXT_MENU` | `<button aria-haspopup="menu">` with `role="menu"` | "More options" | yes | Enter, arrows, Escape | visible ring | — | `aria-expanded` | — |
| `STATUS` | `<span>`; live regions where the value changes as a result of an action | — | no | — | — | — | — | — |
| `PROGRESS` | `role="progressbar"` with `aria-valuenow` / `min` / `max` and a text alternative | "Readiness" | no | — | — | — | — | — |
| `DECORATIVE` | `<span aria-hidden="true">`, SVG with `aria-hidden` | — | no | — | — | — | — | — |
| `MEDIA` / `THUMBNAIL` | `<img>` with meaningful `alt`, or `role="img"` | artifact description, not "image" | only when it triggers fullscreen | Enter | visible ring | — | — | — |

### Overlay focus management

```
OPEN     focus moves to the overlay's first focusable element, or to its heading
         when there is no obvious first control
TRAP     Tab cycles within the overlay only
LABEL    role="dialog" + aria-modal="true" + aria-labelledby pointing at the
         overlay heading
CLOSE    focus returns to the triggering element, always
CONFIRM  destructive and approval confirmations focus the CANCEL control first,
         so an accidental Enter does not promote or lock
```

### Announcements

Status changes that result from an action must be announced, because the visual
change can be far from the control that caused it. Promotion changes a slot
partway up the page; locking changes six things at once. Use a polite live
region for state results and an assertive one for errors and blocked actions.

### Contrast

The page is black, white and lime. Lime on black is the active state for the
view mode control and passes. Lime as small text on white does not, and must not
be used for the only indication of state — active states pair the lime with a
fill or a weight change, never colour alone. No state anywhere is communicated by
colour alone: the check indicators, the status dots and the selected tick all
carry a shape or a label as well.
