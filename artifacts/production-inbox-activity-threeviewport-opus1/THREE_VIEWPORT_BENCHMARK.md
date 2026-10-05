# Three-viewport benchmark — findings

Method used for every route:
1. implement
2. capture desktop and compare it with the LEFT frame, then fix
3. capture tablet and compare it with the CENTRE frame, then fix
4. capture mobile and compare it with the RIGHT frame, then fix
5. check interactions live
6. run the 36-root matrix

Each capture sits beside its frame in `*/*/{desktop,tablet,mobile}/authority-vs-live.jpg`.

## 1. Was one triptych sufficient to reconstruct three responsive states?

**Mostly yes for layout; no for content, and that was expected.**

What one triptych gave reliably for each page:
- the module inventory
- the module order per family
- the column count per family
- the hero / lens / stats / panel grammar

What it could not settle:
- **what the data is.** The frames are full of people, DMs, comments, due dates, reviewers, versions, file sizes and "+12%" deltas. None of that exists in Production. A large share of each frame's visible content was therefore not reconstructible, and those panels had to be mapped onto real data or left honestly empty.
- **behaviour.** Sort menus, comment composers and the Publish lens are drawn but have no backing, and the frames cannot say what they would do.

A single triptych is enough to place a module. It is not enough to decide whether a module should exist.

## 2. Did desktop require additional interpretation?

Yes, in three places:
- **Dense rows vs. sparse data.** The desktop frames assume about 8 rows per list. Live ndxbook has 2 attention items and 0 recorded activity, so a literal copy leaves dead zones. The fix was to keep the two-column split and fill the second column with live graph state (milestones, blockers, gate) rather than stretching rows.
- **Approval detail.** The frame's 3-column tab panel (file info / reviewers / comments) became DETAILS / DEPENDENCIES / STATUS HISTORY, because those are what the node graph actually holds.
- **Hero art.** The frames show a dedicated red "V" studio scene. No such plate exists, so Inbox uses `hubHero` and Activity uses `hubCrystal` (required by an earlier authority test). This is the largest visual delta on desktop.

## 3. Did tablet remain distinct rather than compressed desktop?

Yes. The centre frames make tablet decisions that are not on desktop, and they were followed:
- the lens row sits on its own line, with a full-width search and filter below it
- the hero is shorter, with smaller copy
- the approval detail stacks the media full width above the decision block, where desktop puts them side by side

The tablet composition was written as its own media block (`700–1119px`) and checked at 1024×768.

One reference inconsistency: Activity tablet shows the stats as 2×2, while Inbox tablet shows them 4 across. Both pages use 4 across on tablet so the family stays consistent. This is logged as a residual.

## 4. Did mobile remain structurally faithful without being a screenshot-scale copy?

Yes, mobile is a recomposition, not a scaled copy:
- stats in a 2×2 grid
- a single column throughout
- the Approvals preview aside removed (rows drill into `?item=`)
- feed timestamps folded under the text
- the blockers table rebuilt as stacked severity cards
- tab strips that scroll

**Defect found by the matrix, not by the frames:** at 360px the five lenses with their count badges are wider than the screen. That widened the scroll container, so the matrix failed with body horizontal overflow. The fix makes the lens row scroll on its own (overflow-x) and gives the body `minmax(0,1fr)` columns. The matrix went back to 36/36. The frames are drawn near 390px and cannot reveal this, so a matrix at the narrowest supported width is mandatory.

**Kept on purpose:** the frames' mobile top bar (an iOS status bar plus a single title row) conflicts with the protected `ph` strip. The strip was kept.

## 5. Where was reference ambiguity encountered?

- **DESIGN mode bar.** The Activity frames repeat DESIGN's mode bar (BRAND … VIEWPORT) under the hero. This is a generation artifact and was not reproduced.
- **Wrong nav tab.** The Activity / Comments frame highlights INBOX in the bottom nav. ACTIVITY was kept active.
- **Publish.** The frames show a PUBLISH lens, but no route, tab or data exists. It is not present.
- **Approvals naming.** Inbox Approvals and Activity Approvals use near-identical names. They were kept separate as decide versus record, and a test asserts the separation.
- **Unread counts and avatars.** "Unread" and "Messages" imply a read-state model that does not exist. They were mapped to OPEN / NEEDS YOU.
- **Inconsistent counts.** Header counts in the frames ("03 ITEMS NEED YOU") disagree between frames of the same page. The live count is used.

## 6. Which sibling pages could safely inherit this grammar in future?

- **Likely safe:** EXPERIENCE and LIBRARY list or index pages. They share the same shapes: a hero, a lens bar with search and filter, stat modules, red-pipe panels, and list/table to detail drill-ins. All of it is in `iaKit.tsx` and needs no new primitives.
- **Not without their own frames:** EXPRESSION sub-workspaces and anything with a canvas or editor. The kit does not cover those layouts.

## 7. Would this approach be safe for DESIGN, the most complex Production tab?

**Yes, with conditions.** The triptych method carried layout and responsive intent well on simple, list-shaped pages. DESIGN differs in ways this benchmark did not exercise:
- canvas and stage surfaces
- mode-specific tool panels
- an existing reconstruction that must not regress

Conditions:
1. Supply one triptych per DESIGN mode (BRAND, EXPERIENCE, SURFACES, COMPILER, ASSETS, VIEWPORT), not one for the tab.
2. Before building, map every frame module to a real data field and list the gaps. In this sprint, that mapping was the step that prevented fake content.
3. Run the 36-root matrix at the narrowest width (360px) on every pass. The frames hide overflow defects.
4. Treat repeated chrome in the frames (mode bars, status bars, nav highlight) as artifacts unless they are confirmed.
5. Supply dedicated hero or stage art with the frames. Crops of the frames cannot be used, so missing art becomes a permanent visual delta.

## Interpretation quality

- **Desktop: GOOD.** Structure and grammar converge. The main residuals are hero art and data density.
- **Tablet: GOOD.** It is a distinct composition. One cross-page reference inconsistency was resolved for consistency.
- **Mobile: GOOD.** It is a recomposition, and the narrow-width overflow was found and fixed. Top-bar divergence is intentional, to protect the strip.
