# Responsive matrix

Mobile is the canonical content and hierarchy authority. Tablet (700–1119) and desktop (≥1120) are independent recompositions in `site00-production-inbox-family.css`, not scaled copies, and there is no zoom or transform. The desktop and tablet layouts are MOBILE_AUTHORITY_TRANSLATED (see `AUTHORITY_MATRIX.md`).

| Surface | Mobile (390×844) | Tablet (1024×768) | Desktop (1440×810) |
|---|---|---|---|
| Shell | lifecycle tabs at full width (3 equal) | tabs left-aligned, 200px each | same, wider gutters (28px) |
| ROOT | focus card (art \| TYPE + facts; actions row) → INCOMING rail (3) → ATTENTION 2×2 → RECENTLY RESOLVED rail (6) | focus card across the top (art \| facts \| stacked actions) → INCOMING \| ATTENTION side by side → resolved rail (8) | focus card spans the full height (art \| facts; actions) beside INCOMING (cards with 128px art) over ATTENTION 2×2 → resolved rail (10) |
| WATCHING | stats 4 → search + AREA + STATUS → list (art \| facts \| status / OPEN / STOP) | two-column object grid; actions move to a footer row in each card | two-column lane of wide cards with an inspector-style side column |
| RESOLVED | stats 4 (48-style red lead) → 3 menus → rows (art \| facts \| outcome / by / time ›) | wider rows; outcome / by / time in a meta column | 120px art rows |
| ALL INBOX | type rail, title, search + filter, 7 dimension menus, rows (type and state stacked) | **table**: object \| type \| state | **table**: object \| type \| state \| urgency \| area |
| MESSAGES | type rail → title → conversations → context → thread + composer | conversations \| (context over thread) | **three columns**: conversations \| active thread \| project context |
| SYSTEM | type rail → metrics 4 → notices (pane) → attention | notices \| attention + resolved rail | same, wider notices column |
| DECISION DETAIL | breadcrumb → title + chips → card (art \| facts; affects / dependencies / reviewers strip) → tabs (pane) → materials rail → APPROVE / REQUEST REVISION | card (art \| facts \| side column) + tabs \| materials column; actions bottom-right | same with 210px art |
| MESSAGE THREAD | breadcrumb → identity + facts → linked decision → pane → composer + CREATE DECISION | identity \| facts in one row | same |
| SYSTEM NOTICE DETAIL | breadcrumb → title + severity line → card (art \| 8 facts) → chain (horizontal) → materials → tabs → 4 actions | card \| (chain vertical + materials); tabs below; actions right-aligned | same with 230px art |
| Temporary surfaces | bottom sheets inside the workspace | centred dialogs (460px / 640px wide) | same |

The OPUS1 lens layer had a hero band, which made every page taller than the viewport. This sprint has no hero, because the authorities have none.
