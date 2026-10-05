# ACTIVITY tree

```
/production/activity                      ACTIVITY (root) — ALL lens
├── ?view=approvals                       ACTIVITY / APPROVALS
├── ?view=updates                         ACTIVITY (updates feed)
├── ?view=comments                        ACTIVITY / COMMENTS (UNMOUNTED — no comment data)
├── ?view=blockers                        ACTIVITY (blockers table)
├── (publish)                             NOT PRESENT — not invented
└── ?milestone=<node id>                  MILESTONE DETAIL (grandchild)
```

The existing WORKSPACE (`activity-category`) and RANGE (`activity-range`) filters are preserved unchanged inside the filter popover (`activity-lenses-filter` → `activity-lenses-filters`). The popover closes on Escape or a click outside it.

| Surface | Panels (test ids) | Live inputs |
|---|---|---|
| ALL | stats TODAY/HIGH PRIORITY/APPROVALS/BLOCKED · ACTIVITY FEED (`activity-feed`, rows `activity-row`) · RECENT MILESTONES (`activity-milestones`) · ATTENTION NEEDED (`activity-attention`) | rows, graph, attention |
| APPROVALS | stats PENDING REVIEW/APPROVED/DECISIONS RECORDED/BLOCKED · APPROVAL ACTIVITY (`activity-approval-feed`) · PENDING YOUR REVIEW (`activity-pending-review`, links to the Inbox detail) | rows, attention |
| UPDATES | stats TOTAL/ASSET UPDATES/PIPELINE STATES/REQUESTS · UPDATES FEED (`activity-updates`) · milestones · RELATED LINKS (`activity-related`, Expression sub-routes) | rows, requests |
| COMMENTS | conversation filter list (all 0) (`activity-comment-filters`) + UNMOUNTED pane (`activity-comments-unmounted`) | none |
| BLOCKERS | stats BLOCKED ITEMS/AWAITING REVIEW/DEPENDENCIES/ESCALATED · table severity/item/depends on/unlocks/status (`activity-blockers`, rows `activity-blocker-row`; stacked cards on mobile) · ESCALATIONS (`activity-escalations`) | graph nodes, blockers, founderGate |
| MILESTONE DETAIL | breadcrumbs · head (art, label, status, stage x/y, VIEW IN PROJECT) · facts · tabs · TIMELINE / DESCRIPTION / NEXT ACTIONS / RELATED ASSETS / DEPENDENCIES / CONNECTED STAGES / BLOCKERS / ACTIVITY | node, graph, rows |

Blocker severity (`blockerSeverity`) is derived, not authored:
- **CRITICAL**: the founder-gate node
- **HIGH**: REVIEW_REQUIRED or BLOCKED
- **MEDIUM**: anything else
