# 18 · Accessibility and focus results

* Every V3 surface is `role="dialog" aria-modal="true"` with a label; focus moves in, Tab is trapped, Escape and the
  scrim close, focus returns.
* **Defect found and fixed:** the corner chrome steps aside while the menu is open, so the hamburger the trap remembered
  no longer existed on close; focus now goes to the hamburger that comes back (E2E G1).
* PRIVACY & CONSENTS switches now have visible words (they had only aria-labels).
* axe (serious / critical) on the menu, membership and add-ons: **0** (E2E G4, mobile + desktop); the DOT 01 and
  Pockets axe suites still pass.
* Focus visible: 2 px gold outline on every V3 control; touch targets ≥ 44 px (pills 46, rows 48, nav items 46).
* No interaction requires long-press only (the Pocket menu keeps the chip, right-click and Shift+F10).
