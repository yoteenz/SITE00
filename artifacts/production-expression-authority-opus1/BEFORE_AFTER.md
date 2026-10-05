# BEFORE / AFTER

| | Before | After |
|---|---|---|
| Routes | 8 Expression sub-routes (7 screens plus character-fabrication); no children, details or downstream routes | 40 routes in 10 families (plus character-fabrication, unchanged) |
| Shell | Sub-screens in the legacy `PwFrame` (no authority host strip, no status strip); local toggle tabs, not routes | One `ExpressionFamilyShell` inside `ProductionAuthorityFrame`; routed family tabs, breadcrumb, shared status strip |
| Format → Package → Campaign | Not present (root card only) | 08, 09 and 10 routes with the locked flow; Campaign Board takes completed packages only |
| Role / actor / character | One "Roles" list that mixed character rows with actor chips | Separate lists, separate detail routes, and a ROLE → ACTOR → CHARACTER chain linked by id |
| Page scroll | Sub-screens scrolled inside `PwFrame` (long stacked lists) | 200 / 200 measurements with no page or frame scroll; panes bounded |
| Approval controls | Narrative judgment inside the embedded engine panel; lock / handoff on Review | Narrative judgment, storyboard decision, lock and handoff in shared action primitives; every disabled control carries its reason |

- Images: `BEFORE_AFTER_DESKTOP.jpg` (top row before, bottom row after: narrative, casting, sets, review) and `BEFORE_AFTER_MOBILE.jpg` (before/after pairs).
- Measurement: `NO_SCROLL_REPORT_BEFORE.json`. The Expression root (Production Floor, `data-screen="expression"`) was out of scope and still overflows inside its frame (see RESIDUALS).
