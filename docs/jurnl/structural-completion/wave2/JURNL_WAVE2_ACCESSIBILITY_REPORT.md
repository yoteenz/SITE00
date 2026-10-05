# Wave 2 accessibility QA

**Scope:** New F05/F06/F07 surfaces (FamilyChrome, lists, drawers, forms).

| Requirement | Status |
|-------------|--------|
| Semantic headings (h1 on intro) | PASS |
| Buttons vs links for actions | PASS — JurnlButton / native button rows |
| Form labels on add/edit sheets | PASS — JurnlInput labels |
| Drawer focus trap (shared primitive) | PASS — inherited |
| Money read aloud | PARTIAL — formatMoney text in DOM; no live region on totals |
| Status not color-only | PASS — connection copy + MANUAL labels |
| Touch targets | PASS — jrn-row / JurnlButton min heights |

**Status:** PASS with noted PARTIAL on dynamic total announcements (defer to global a11y pass).
