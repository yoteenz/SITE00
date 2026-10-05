# Route tree

## Forensics: the Inbox before this sprint (OPUS1 @ `72b2ad5a`)

| Item | Before |
|---|---|
| Route | `/production/queue` (`ProductionQueuePage` → `ProductionAuthorityFrame screen="inbox"` → `InboxBody`) |
| Component | `InboxBody.tsx` (OPUS1): `?view=priority\|approvals\|direct\|system` lenses plus `?item=` approval detail, a hero band and the iaKit lens bar |
| Data source | `useProductionAuthorityData()`: attention, activity, graph (blockers, founder gate), assetUrl, decideStoryboard, deciding. `useProductionRequests()`: device-local requests |
| State | URL query (lens, item), local search |
| Actions | APPROVE / REVISE through `decideStoryboard`, gated on gate open + `decidableInHub` + same node |
| Temporary surfaces | none (no confirmation, revision note, filter sheet or attachment preview) |
| Responsive | OPUS1 tablet and mobile recompositions; long, scrolling pages (hero plus stacked panels) |
| Stale / duplicate UI | hero band reused from the Activity kit (not in the Inbox authority); "PRIORITY / APPROVALS / DIRECT" lenses conflated type and state; the approvals list and the priority decision queue duplicated the same objects |
| Inbound links | Activity → `/production/queue?view=approvals[&item=]` (3 links); HUB, host attention indicator and menu → `/production/queue` |

## Canonical tree (after)

```
/production/queue                          ROOT · NEEDS YOU (default)
├── ?view=watching                         CHILD · WATCHING          (lifecycle state)
├── ?view=resolved                         CHILD · RESOLVED          (lifecycle state)
├── ?view=all [&type=&state=]              CHILD · ALL INBOX         (inventory across type × state)
├── ?view=messages                         CHILD · MESSAGES          (UNMOUNTED: no messaging source)
├── ?view=system                           CHILD · SYSTEM
├── ?item=<attention|request id>           GRANDCHILD · DECISION DETAIL
├── ?view=messages&thread=<id>             GRANDCHILD · MESSAGE THREAD (honest shell)
└── ?view=system&notice=sys.<node>         GRANDCHILD · SYSTEM NOTICE DETAIL
TEMPORARY (contained overlays, no navigation)
    REQUEST REVISION · APPROVAL CONFIRMATION · FILTER / SORT (sheet + menus) · ATTACHMENT PREVIEW
```

- The brief's `/production/inbox/*` routes do not exist. The working route was kept: "do not rename working routes merely to match this prompt".
- Legacy aliases: `priority` and `approvals` resolve to `needs`; `direct` resolves to `messages`. `?item=` always opens Decision Detail, so the Activity links keep working.
- Lifecycle tabs show on every non-detail surface. ALL INBOX, MESSAGES and SYSTEM sit under NEEDS YOU (as the authorities show) and share a type rail: ALL INBOX · MESSAGES · SYSTEM.

## Object model (`inboxModel.ts`)

| Source | TYPE | STATE (status) |
|---|---|---|
| hub attention item | DECISION | NEEDS_YOU (NEEDS_REVIEW) |
| request AWAITING_APPROVAL | DECISION | NEEDS_YOU |
| request QUEUED / IN_PROGRESS | DECISION | WATCHING (AWAITING_RESPONSE / IN_PROGRESS) |
| request COMPLETE | DECISION | RESOLVED (COMPLETE) |
| recorded APPROVAL activity | DECISION | RESOLVED (APPROVED / REVISED) |
| recorded RENDER / ASSET activity | SYSTEM | RESOLVED (COMPLETE) |
| graph node not already an open decision | SYSTEM | REVIEW_REQUIRED → NEEDS_YOU · BLOCKED → WATCHING/AT_RISK · ACTIVE → WATCHING/IN_PROGRESS · LOCKED/NOT_STARTED → WATCHING/AWAITING_RESPONSE · COMPLETE → RESOLVED |
| (none) | MESSAGE | no source exists, so no objects are created |

Live ndxbook today:
- **NEEDS YOU (4):** 2 decisions (narrative, casting) and 2 system (look, performance review-required).
- **WATCHING (3):** system (set, storyboard, keyframes, all locked).
- **RESOLVED:** 0.
