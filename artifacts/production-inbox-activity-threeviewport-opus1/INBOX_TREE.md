# INBOX tree

```
/production/queue                         INBOX (root)  — ALL lens
├── ?view=priority                        INBOX / PRIORITY
├── ?view=approvals                       COMMUNICATIONS / INBOX — APPROVALS
│   └── &item=<id>                        APPROVAL DETAIL (grandchild)
├── ?view=direct                          DIRECT (UNMOUNTED — no messaging data)
└── ?view=system                          SYSTEM
```

Lens links use `replace`, so switching lenses does not pile up history. Search filters the visible list on every lens.

| Surface | Panels (test ids) | Live inputs |
|---|---|---|
| ALL | stats OPEN/URGENT/AWAITING APPROVAL/WATCHING (`inbox-stats`) · NEEDS YOU (`inbox-incoming`) · AWAITING YOUR APPROVAL (`inbox-awaiting`) · WATCHING (`inbox-watching`) · RECENTLY RESOLVED (`inbox-resolved`) | attention, requests |
| PRIORITY | stats URGENT/BLOCKERS/FOUNDER GATE/WAITING ON YOU · URGENT (`inbox-urgent`) + blockers (`inbox-blockers`) · PRIORITY DECISION QUEUE (`inbox-decisions`) · FAST ACTIONS (`inbox-fast-actions`) | attention HIGH, graph.blockers, founderGate |
| APPROVALS | stats PENDING REVIEW/HIGH RISK/APPROVED/BLOCKED · review list (`inbox-approvals`) · preview with REVIEW / APPROVE / REQUEST CHANGES (`inbox-primary`, hidden on mobile where rows open the detail) | decision items |
| DIRECT | three-column shell: list / thread / PROJECT CONTEXT (`inbox-direct-*`); the project context is live (project, entry, decisions open) | project + counts only |
| SYSTEM | stats PIPELINE/STORYBOARD FRAMES/BLOCKERS/REQUESTS · notice type + status selects (`inbox-system-filters`) · SYSTEM NOTICES (`inbox-system-notices`) | buildActivityRows filtered SYSTEM/RENDER/ASSET |
| APPROVAL DETAIL | BACK TO APPROVALS · PREV/NEXT (disabled as `aria-disabled` spans at the ends) · media + node strip · status/gate box · APPROVE / REQUEST CHANGES / REVIEW IN WORKSPACE · tabs DETAILS / DEPENDENCIES / STATUS HISTORY | item, node, dependsOn/unlocks, founderGate |

The kept footnote reads "Requests are held on this device until the queue service is connected." The kept test ids include `production-queue`, `inbox-item`, `queue-request`, `queue-empty`, `inbox-approve`, `inbox-revise` and `inbox-review`.
