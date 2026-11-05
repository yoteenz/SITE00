# 06 · Canonical component architecture

One foundation, distinct families — `src/projects/jurnl/runtime/surfaces/v3/V3Surfaces.tsx` + `jurnl-v3.css`.

| Family | Component | Material | Used by (this sprint) |
|---|---|---|---|
| A EDITORIAL NAVIGATION DRAWER | `V3Drawer material="olive"`, `V3NavSection`, `V3NavItem` | deep olive + field tile, torn edge (`tornClip`) | GLOBAL MENU |
| B LEDGER / DISCOVERY DRAWER | `V3Drawer material="ledger"` | parchment ledger | — (search drawer not built, report 11) |
| C ANCHORED PARCHMENT FRAGMENT | `.jv3-fragment` on `JurnlPopover` | V9 torn panel | MANAGE POCKET |
| D LAYERED TASK SHEET | `V3Folio` / `JurnlDrawer material="v3"` | V9 parchment sheet | MOVE MONEY / PAY A CARD, PRIVACY & CONSENTS |
| E DECISION / CONFIRMATION FOLIO | `V3Folio` | parchment | (available; DOT 01 confirmations keep V9) |
| F TERRACOTTA / OXBLOOD CAUTION | `V3Caution`, `V3RuleLabel` | oxblood torn paper + bronze seal | DELETE / ARCHIVE BLOCKED |
| G MEMBERSHIP AND ACCESS FOLIO | `V3Folio material="membership"` | parchment over oxblood textile, laurel wax seal | MY MEMBERSHIP |
| H EDITORIAL ADD-ON COLLECTION | `V3Card` | parchment cards, V9 illustrations | EXPLORE ADD-ONS |
| I FEATURE UNLOCK | `V3Folio material="unlock"` | parchment over wine textile, bronze lock | UNLOCK |
| J FORM AND SELECTOR | `V3Field`, `.jv3-well`, V3 drawer fields | inset parchment wells | V3 drawers |
| K RECEIPT / SCAN / REVIEW | DOT 01 V9 frames (unchanged) | V9 SK03 | receipts (report 15) |
| L COMPACT NOTICE / STATUS | `V3Notice`, `V3Status` | olive / terracotta tints, state pills | membership, unlock |

**Hosting contract.** No new overlay root: every V3 surface portals through the runtime's single host
(`OverlayLayer`, `JurnlRuntimeRoot.tsx:193`) and is positioned inside it like every other overlay; one scrim per
surface; focus trap, Escape and scrim close, focus return (`useOverlayFocus`, wrapped with a stable close so a caller's
inline handler never re-traps); reduced motion stops every V3 animation. **Opt-in migration:** `JurnlDrawer` gained
`material="v3"` (a data attribute; DOM, behaviour and triggers unchanged) so each of its 77 call sites migrates by
review, not by a blind sweep. Nothing in the foundation reads money or entitlements.
