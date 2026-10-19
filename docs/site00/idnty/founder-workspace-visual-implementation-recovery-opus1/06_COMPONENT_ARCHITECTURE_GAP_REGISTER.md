# 06 · Component architecture gap register

Classes:
- **A** wrong component architecture
- **B** wrong styling
- **C** wrong layout or container
- **D** missing asset
- **E** font or typography
- **F** responsive
- **G** unmounted
- **H** runtime or build
- **I** data or backend
- **J** handoff gap

| Id | Area | Finding (verified in source) | Class | Status |
| --- | --- | --- | --- | --- |
| GAP-01 | Local API | Hoisted esbuild 0.14 cannot parse `satisfies` → compile error in every admin request | H | **Fixed** |
| GAP-02 | Stylesheet | Approved `ws.css` never ported; `idnty-founder-workspace.css` (1 064 lines) is an approximation with different structure | A/B | **Fixed** (ported) |
| GAP-03 | Shell | Header = row of outlined text buttons; no brand, env tag, icons or breadcrumb; no ⌘K field | A/B | **Fixed** |
| GAP-04 | Nav | Sidebar and rail without icons or create; rail text-only | A/D | **Fixed** |
| GAP-05 | Bottom bar | Text-only items, CREATE as red text | B/D | **Fixed** (icons, red square CREATE, safe area) |
| GAP-06 | Colour | No `<button>`/`<a>` colour reset → iOS blue | B/E | **Fixed** |
| GAP-07 | Layout | Page wider than the viewport at every width (no `box-sizing`; panels overflow) | C | **Fixed** (authority box model; 0 overflow measured) |
| GAP-08 | Overview | Four bordered counters + generic “Next focus” instead of focus / signals / needs-you / registry / movement | A | **Fixed** |
| GAP-09 | Page header | Shell-owned `h1` without index rail or architecture object | A/D | **Fixed** (`ws-phead`) |
| GAP-10 | Menu OL-03 | Only three “extra destinations” in generic list styling | A | **Fixed** (all seven with REFERRALS) |
| GAP-11 | Foundations body | Native inputs and select; no registry columns, status views or inspector | A/F | Open (after approval) |
| GAP-12 | Reviews / Operations / Correspondence bodies | Generic panels, not the approved workbench / runbook / thread compositions | A | Open |
| GAP-13 | Referrals body | `ifw-` panels; OPUS3 composition (signals, partner registry, ledgers, Card Studio) not implemented | A/G | Open |
| GAP-14 | System + Test Lab | Grey module tiles; legacy readiness component mounted raw | A/G | Open |
| GAP-15 | Overlay host | Generic sheet chrome (“CLOSE” button header, rounded sheet) instead of `ws-ov` grammar per M/T/D | A/B | Open (docs 10–11) |
| GAP-16 | Overview milestone | API lacks operational stage data for NEXT MILESTONE | I | Open (G-OV-1) |
| GAP-17 | Handoff | Composer implemented from documents without porting the specimen CSS/markup; no visual comparison step | J | Addressed by docs 16, 18 |
