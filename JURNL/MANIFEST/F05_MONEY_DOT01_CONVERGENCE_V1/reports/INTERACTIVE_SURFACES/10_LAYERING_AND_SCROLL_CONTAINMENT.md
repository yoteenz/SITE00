# 10 · Layering and scroll containment

Sprint `P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-SURFACES-AND-OVERLAY-AUTHORITY-CONVERGENCE.OPUS1` (addendum) · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

While any surface is open: page scroll Y = 0 / 18, X = 0 / 18; popover inside the viewport 14 / 14.

The popover is portalled into the stage, so it never inherits the content box's `overflow: auto` clipping and never extends the document; it repositions on scroll / resize; the dialog focus trap contains it; the global dock is never covered.
