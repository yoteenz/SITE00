# 02 — Carousel functional architecture

One page, one carousel, four collections. The carousel lives inside the F05 MONEY parent pilot (`/money?parent=motion`). The approved cabinet hub stays the default at `/money`.

## Files

| Piece | File | Role |
|---|---|---|
| Data | `src/projects/jurnl/data/f05/moneyCarousel.ts` | `computeMoneyCarousel()` reads the canonical owners and returns four panels per collection: title, value (`amount`, `none` or `link`), art id, destination and accessible description. It never writes. |
| Accounts data | `src/projects/jurnl/data/f05/moneyParentReading.ts` | unchanged from the pilot: places, band figures and open transfers (#1706 model) |
| Controller | `src/projects/jurnl/runtime/screens/f05/useMoneyCarousel.ts` | active collection (URL `?c=`), drag, flick, trackpad, keyboard, dots, previous / next; the change in progress (`transition`) |
| Page | `src/projects/jurnl/runtime/screens/f05/MoneyMotionParent.tsx` | the layered page; renders the active collection (and, during a change, the outgoing one) inside one carousel region |
| Panel paper | `src/projects/jurnl/runtime/screens/f05/CarouselPanelPaper.tsx` | one paper of collections 02–04: founder art plus live title, value and caption |
| Layout | `src/projects/jurnl/runtime/screens/f05/f05MotionLayout.ts` | the 2 × 2 grid in source px; `accountItems()` for collection 01 |
| Styles | `jurnl-f05-motion.css` (shell, papers, arrival) · `jurnl-f05-carousel.css` (carousel, dots, steps, change motion) | |
| Assets | `src/projects/jurnl/families/F05_MONEY/MOTION_PILOT/F05_PAPER_*.webp` | 12 papers (doc 08) |

## Layers (directive §08) and where each lives

| Layer | Contents | Element | Moves on a collection change? |
|---|---|---|---|
| 01 | SIDEKICK environment (top slice, elastic tile, bottom slice) | `.jrn-f05m__env` | no |
| 02 | title paper, wax seal, JURNL tag (true alpha) | `.jrn-f05m__obj` | no (page arrival only) |
| 03 | JURNL, MONEY, script line, HELD / OWED / COMMITTED / AVAILABLE | `.jrn-f05m__mark`, `.jrn-f05m__title`, `.jrn-f05m__band` | no |
| 04 | carousel paper backing: the SIDEKICK's own panel | part of layer 01 | no |
| 05 | the active collection's four papers | `.jrn-f05m__collection[data-collection]` | **yes** (the only moving layer) |
| 06 | live names, amounts, captions, chevrons, transfer threads and tokens | inside each paper / collection | with its paper |
| 07 | four collection dots, previous / next | `.jrn-f05m__dotrow`, `.jrn-f05m__step` | the active dot changes |
| 08 | the global five-item dock | `JurnlProductNav` (unchanged component), re-seated on the nav paper | no |
| 09 | overlays (sheets) | existing sheets | above everything; they never reset the carousel |

## Rendering a change

- `groups` holds the outgoing collection (`data-phase="exit"`, `inert`, `aria-hidden`) and the incoming one (`data-phase="enter"`). It is keyed by collection id, so each keeps its element through the change.
- The outgoing group starts its exit from wherever the drag left it (`--f05m-drag`).
- After 520 ms the outgoing group is removed and the active one becomes `idle`.
- On page arrival the active collection is `load`. Only `load` plays the page entrance. A collection change never replays it (directive §09A).

## State and history

- The active collection is in the URL (`?c=accounts|transfers|commitments|outlook`).
  - It changes by **replace** navigation, so a change never adds a history entry.
  - A child route followed by back, a reload, or an overlay open and close all return to the same collection.
- The in-app back trail (store) now replaces its top entry on a replace navigation instead of pushing. Without this, collection changes would have added phantom back steps. This is a two-line fix in `runtime/state/store.tsx`; it also stops the index redirect from leaving a back step.
- Sheets are local state. Opening or closing one never touches `?c=`.

## What a change may and may not do

- It chooses which collection is read. It never writes. Unit and E2E tests assert the stored snapshot is byte-identical after swipes, dots, keys, buttons and trackpad changes.
- A drag that ends over a paper does not open it (capture-phase click guard).
- Panels open existing routes or sheets only (doc 06).

## Accessibility semantics

- Region `aria-roledescription="carousel"`, label MONEY COLLECTIONS.
- Each collection is a group with `aria-roledescription="slide"` and the label "TRANSFERS, 2 OF 4".
- Dots are buttons labelled the same way, with `aria-current` on the shown one and `aria-controls` pointing at the collection.
- Previous and next are real buttons, visible on focus; they are `aria-disabled` at the ends (no wrap-around).
- A polite live region announces each change ("COMMITMENTS, 3 OF 4."). The first collection on arrival is not announced.
- ← and → work anywhere in the carousel. Focus follows the change to the paper in the same place.
