# HUB INTERACTION MATRIX

Every clickable on the HUB root, opened in a live browser at mobile 390×844, tablet 1024×768 and desktop 1440×900. For each one: hover (tablet / desktop) and keyboard focus are captured clipped to the element, then it is clicked and the destination is recorded. Destination surfaces are the converged OPUS2 / authority surfaces. `lime` counts stale lime-system elements on the destination (0 = none).

Captures: `interactions/<family>/NN-<id>-{hover,focus,target}.jpg`. Raw data: `interactions/interactions.json`.

| # | INTERACTION | TRIGGER (selector) | ROUTE | DESTINATION SURFACE | MOBILE | TABLET | DESKTOP | CLASS |
|---|---|---|---|---|---|---|---|---|
| 01 | project-switcher | `[data-testid="production-chrome-project"]` | `/production` | HUB | PASS | PASS | PASS | REFERENCE_LOCKED |
| 02 | items-need-you | `.pxh-top__attn, .ph-top__attn` | `/production/queue` | authority-frame:inbox | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 03 | status-view-now | `.hubx-status__cell.is-alert >> nth=0 >> a` | `/production/queue` | authority-frame:inbox | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 04 | status-blockers-view | `.hubx-status__cell.is-alert >> nth=1 >> a` | `/production/activity` | authority-frame:activity | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 05 | overview-view-all | `.hubx-overview .hubx-viewall` | `/production/ndxbook/expression` | authority-frame:expression | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 06 | overview-feature-entry | `[data-testid="hub-entry-card"]` | `/production/ndxbook/expression` | authority-frame:expression | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 07 | entries-view-all | `.hubx-entries .hubx-viewall` | `/production/ndxbook/expression` | authority-frame:expression | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 08 | entry-active | `[data-testid="hub-entry-active"]` | `/production/ndxbook/expression` | authority-frame:expression | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 09 | entry-new | `[data-testid="hub-entry-new"]` | `/production/ndxbook/expression` | authority-frame:expression | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 10 | components-view-all | `.hubx-components .hubx-viewall` | `/production/ndxbook/expression` | authority-frame:expression | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 11 | component-narrative | `.hubx-tiles li >> nth=0 >> a` | `/production/ndxbook/expression/narrative` | pw--authority | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 12 | component-cast | `.hubx-tiles li >> nth=1 >> a` | `/production/ndxbook/expression/casting` | pw--authority | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 13 | component-look | `.hubx-tiles li >> nth=2 >> a` | `/production/ndxbook/expression/wardrobe` | pw--authority | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 14 | component-performance | `.hubx-tiles li >> nth=3 >> a` | `/production/ndxbook/expression/performance` | pw--authority | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 15 | component-set | `.hubx-tiles li >> nth=4 >> a` | `/production/ndxbook/expression/sets` | pw--authority | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 16 | component-storyboard | `.hubx-tiles li >> nth=5 >> a` | `/production/ndxbook/expression/storyboard` | pw--authority | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 17 | component-keyframes | `.hubx-tiles li >> nth=6 >> a` | `/production/ndxbook/expression/storyboard` | pw--authority | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 18 | operations-view-all | `.hubx-ops .hubx-viewall` | `/production/queue` | authority-frame:inbox | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 19 | operations-row-01 | `.hubx-ops__list li >> nth=0 >> a` | `/production/queue` | authority-frame:inbox | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 20 | operations-row-02 | `.hubx-ops__list li >> nth=1 >> a` | `/production/queue` | authority-frame:inbox | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 21 | activity-view-all | `.hubx-feed .hubx-viewall` | `/production/activity` | authority-frame:activity | PASS | PASS | PASS | FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED |
| 22 | open-hub-machine | `[data-testid="hub-open-machine"]` | `/production?view=machine` | hub-machine (LEGACY_LOCKED) | PASS | PASS | PASS | LEGACY_LOCKED |

## Menu (host MENU panel)

| FAMILY | OPENS | ESCAPE CLOSES | OUTSIDE PRESS CLOSES | CLASS |
|---|---|---|---|---|
| mobile | YES | YES | YES | PARENT_INHERITED |
| tablet | YES | YES | YES | PARENT_INHERITED |
| desktop | YES | YES | YES | PARENT_INHERITED |

## Non-interactive by design

- **Status strip cells LIVE STATUS, ACTIVE ENTRY and CURRENT PHASE** carry no action in the product. They stay non-interactive, with no invented targets. The cells that do act are ITEMS NEED YOU → VIEW NOW and BLOCKERS → VIEW.
- **Hero / world panel:** no interaction exists, so none was invented.
- **Production overview legend rows and the progress ring:** display only. Drill-in is VIEW ALL or the featured entry tile, both going to Expression.

## Notes on targets

- **Project switcher:** the live control is a link to `/production` (project command). There is no project-switching UI in the product and none was invented; see HUB_RESIDUALS.
- **NEW ENTRY:** routes to the Expression root, as before. No creation flow exists, so it is recorded as UNMOUNTED rather than simulated.
- **BLOCKERS → VIEW:** routes to `/production/activity`, the existing semantics. There is no dedicated blocker detail surface, and the blocker count is live (`graph.blockers`).
- **ITEMS NEED YOU (host top), VIEW NOW, CURRENT OPERATIONS rows and VIEW ALL:** all go to `/production/queue` (the INBOX root, converged earlier). The INBOX destination was not redesigned.
- **KEYFRAMES component:** shares the storyboard sub-route (`NODE_SUB`), as before.
