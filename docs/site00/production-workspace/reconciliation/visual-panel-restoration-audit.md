# Visual panel restoration audit (POST-MERGE)

**Sprint:** `P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-SCOPED-VISUAL-PANEL-RESTORATION1`

## Rule

Remove fake content; preserve panel geometry; bind real project media or truthful placeholders.

## Classification (JURNL seven tabs)

| Tab | Prior loss | Restoration |
| --- | --- | --- |
| HUB | Text-only progress rows | Media column on every `NodeRow` via `resolveNodePanelMedia` |
| INBOX | Text-only decisions | Thumbnail on authority/acceptance rows + inbox detail hero band |
| DESIGN | Sterile method + family list | Method-step preview when artifacts exist; family rows always show thumb/placeholder |
| EXPERIENCE | Plain NOT_ESTABLISHED card | `pgx-domain-absence` band + domain map |
| EXPRESSION | Plain NOT_ESTABLISHED card | Same absence treatment |
| LIBRARY | Already media-rich | Unchanged |
| ACTIVITY | Text blockers/events | Blocker rows + visual events use `PanelMediaSlot` |

## Media contract

Implemented in `shared/site00-production-graph/panelMedia.ts` and rendered by `PanelMediaSlot.tsx`.
