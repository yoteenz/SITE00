# Route authority matrix

Classification key (sprint receipt vocabulary)
- **REFERENCE_LOCKED**: rebuilt to its own triptych in all three viewports and fed by live Production data.
- **UNMOUNTED**: rebuilt to its triptych layout, but the data family does not exist, so it shows an honest `data-state="UNMOUNTED"` shell with no sample content.
- **NOT_PRESENT**: no route, tab or data exists, so it was not invented and is not counted.
- **PARENT_INHERITED**: a temporary or interaction surface with no frame of its own, styled in its parent's grammar (see `INHERITED_SURFACES.md`).
- **LEGACY_LOCKED**: a protected existing surface, kept deliberately.
- **VISUALLY_CONVERGED** and **BLOCKED**: none this sprint.

| # | Authority frame | Route | Class | Data source | D | T | M |
|---|---|---|---|---|---|---|---|
| 1 | INBOX/00_ROOT | `/production/queue` | REFERENCE_LOCKED | attention + requests | ✓ | ✓ | ✓ |
| 2 | INBOX/01 priority | `?view=priority` | REFERENCE_LOCKED | attention HIGH + graph.blockers + founderGate | ✓ | ✓ | ✓ |
| 3 | INBOX/01 approvals | `?view=approvals` | REFERENCE_LOCKED | decision items (attention + AWAITING_APPROVAL requests) | ✓ | ✓ | ✓ |
| 4 | INBOX/01 direct-messages | `?view=direct` | UNMOUNTED | none (no messaging service) | ✓ | ✓ | ✓ |
| 5 | INBOX/01 system | `?view=system` | REFERENCE_LOCKED | buildActivityRows (SYSTEM/RENDER/ASSET) + graph | ✓ | ✓ | ✓ |
| 6 | INBOX/02 approval-detail | `?view=approvals&item=` | REFERENCE_LOCKED | item + node graph + founderGate | ✓ | ✓ | ✓ |
| 7 | ACTIVITY/00_ROOT | `/production/activity` | REFERENCE_LOCKED | buildActivityRows + graph + attention | ✓ | ✓ | ✓ |
| 8 | ACTIVITY/01 approvals | `?view=approvals` | REFERENCE_LOCKED | approval rows + attention | ✓ | ✓ | ✓ |
| 9 | ACTIVITY/01 updates | `?view=updates` | REFERENCE_LOCKED | activity rows + requests + node sub-routes | ✓ | ✓ | ✓ |
| 10 | ACTIVITY/01 comments | `?view=comments` | UNMOUNTED | none (no comment service) | ✓ | ✓ | ✓ |
| 11 | ACTIVITY/01 blockers | `?view=blockers` | REFERENCE_LOCKED | graph nodes + blockers + founderGate | ✓ | ✓ | ✓ |
| 12 | ACTIVITY/02 milestone-detail | `?milestone=` | REFERENCE_LOCKED | node + depends/unlocks + blockers + rows | ✓ | ✓ | ✓ |
| — | Activity "PUBLISH" (lens in the frames) | — | NOT_PRESENT | — | — | — | — |

Counts:
- REFERENCE_LOCKED: 10
- UNMOUNTED: 2 (Direct, Comments)
- PARENT_INHERITED: 7 (temporary surfaces)
- LEGACY_LOCKED: 1 (the mobile `ph` strip)
- VISUALLY_CONVERGED: 0
- BLOCKED: 0
- NOT_PRESENT: 1 (Publish)

## Separation rule

Inbox Approvals (`/production/queue?view=approvals`) is where **you decide**: a review list, a preview, and approve or request changes, gated by the founder gate.
Activity Approvals (`/production/activity?view=approvals`) is the **record**: approval activity and the pending-review list, which link back to the Inbox detail.
They use different test ids, data and routes, and a test asserts that neither renders the other's surface.

## Decision gating

The APPROVE and REQUEST CHANGES buttons are enabled only when **all** of these hold:
- `graph.founderGate.open`
- `founderGate.decidableInHub`
- `item.nodeId === founderGate.nodeId`

Live ndxbook currently has `decidableInHub=false`, so both buttons are disabled and the gate box reads DECIDE IN WORKSPACE. Decisions still go through `decideStoryboard`, which is unchanged.
