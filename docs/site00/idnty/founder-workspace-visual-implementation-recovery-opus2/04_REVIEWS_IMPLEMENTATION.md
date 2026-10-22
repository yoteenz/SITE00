# 04 · Reviews (D-08/09 · TP-06 · TL-06 · C-06)

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


- Queue = every foundation where the founder holds the move (`INTAKE_COMPLETE` → INTAKE, `RECOMMENDATION_READY` /
  `QUOTE_READY` → QUOTE, approval in the pipeline → REQUEST, founder-owned blocker → EXCEPTION) plus the previous
  pipeline review / approval / quote filter. Oldest first; counts are computed, never fixed.
- `wb wb--decide`: queue | context | decision at ≥ 1160 stage, decision docked under context 920–1159, one pane at a
  time below 920 with a back control and a sticky `wb-mbar`.
- Context: identity, submitted intake, automated recommendation, quote table (for QUOTE), open approval requests.
- Decision: with an open approval record → APPROVE / REQUEST REVISION choices + note; `approvalResolve` is awaited and the
  toast says “CONFIRMED BY THE SERVER” only after it resolves; failures keep the note and show a red banner.
  QUOTE → OL-08 / OL-09. No approval record → honest notice + OPEN RECORD (no fake approval). EXCEPTION → OPEN OPERATIONS.
- Phone / portrait: decision bar opens OL-11 (request revision) or the quote dialogs.
- Detail errors keep the decision disabled.

Evidence: `evidence/matrix/reviews-14-viewports.jpg`, `evidence/compare/reviews-*.jpg`.

REVIEWS: COMPLETE
