# P0.STUDIOOS.PRODUCTION.INBOX-ACTIVITY.THREE-VIEWPORT-RECONSTRUCTION.OPUS1

INBOX and ACTIVITY reconstructed against the 12 three-viewport authority triptychs
(`STUDIOOS_INBOX_ACTIVITY_3VIEW_AUTHORITY_LITE_v1`). Desktop (16:9, left frame), tablet (4:3, centre frame)
and mobile (9:19.5, right frame) are three separate compositions in one stylesheet, not one layout scaled down.

**Function kept, look rebuilt.** Every value comes from the live Production data the pages already read:
hub attention items, device-held requests, recorded activity and the production graph (nodes, blockers,
founder gate). No screenshot literals, no sample people/messages, no new routes, no backend change.

## Routes (no new routes — reference children are same-route query lenses)

| Reference | Live route |
|---|---|
| Inbox root | `/production/queue` |
| Inbox / Priority | `/production/queue?view=priority` |
| Inbox / Approvals | `/production/queue?view=approvals` |
| Inbox / Direct | `/production/queue?view=direct` (UNMOUNTED shell — no messaging data) |
| Inbox / System | `/production/queue?view=system` |
| Approval detail | `/production/queue?view=approvals&item=<attention or request id>` |
| Activity root | `/production/activity` |
| Activity / Approvals | `/production/activity?view=approvals` |
| Activity / Updates | `/production/activity?view=updates` |
| Activity / Comments | `/production/activity?view=comments` (UNMOUNTED shell — no comment data) |
| Activity / Blockers | `/production/activity?view=blockers` |
| Activity / Publish | **NOT PRESENT** — no route, tab or data exists; not invented |
| Milestone detail | `/production/activity?milestone=<node id>` |

## Files

- `src/site00/components/productionAuthority/iaKit.tsx` — shared hero / lens bar / search / filter popover / stats / panel / chip / empty kit.
- `src/site00/components/productionAuthority/InboxBody.tsx` — rewritten (lenses + approval detail).
- `src/site00/components/productionAuthority/ActivityBody.tsx` — rewritten (lenses + milestone detail); `buildActivityRows`, `BADGE`, `RANGE_MS`, `workspaceFor`, `NODE_BADGE` kept for HUB + Inbox.
- `src/site00/styles/site00-production-inbox-activity.css` — body-only styles; desktop base + tablet + mobile recompositions.
- `tests/productionInboxActivityThreeViewportOpus1.test.ts` — 24 mount / behaviour / data / style tests.

Host chrome (`ProductionAuthorityFrame`, `pxh` top + nav, mobile `ph` strip) is untouched.

## Proof layout

`inbox/{root,priority,approvals,direct,system,approval-detail}/` and
`activity/{root,approvals,updates,comments,blockers,milestone-detail}/` each hold:

- `desktop/`, `tablet/`, `mobile/` — `live.jpg` (localhost, live ndxbook data) and `authority-vs-live.jpg`
  (the matching triptych frame beside the live capture, for review only — never shipped).
- `before-after/{desktop,tablet,mobile}.jpg` — base `c508fc3d` vs this branch. Before, the lenses did not
  exist, so every child "before" is the old single page at that route.

`activity/publish/` is intentionally absent (see `RESIDUALS.md`).

Also: `INTERACTIONS.json` (live Playwright interaction run, desktop + mobile) and `MATRIX_36.json`
(36-root production structural matrix, 36/36).

Capture viewports: desktop 1440×810, tablet 1024×768, mobile 390×845 (matrix: 1280×720 / 1024×768 / 360×640 @2x mobile emulation).
