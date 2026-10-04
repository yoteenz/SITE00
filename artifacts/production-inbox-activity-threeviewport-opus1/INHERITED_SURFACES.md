# Inherited / unchanged surfaces

| Surface | Status |
|---|---|
| `ProductionAuthorityFrame` (`.pxa`, `pxh` top + nav, mobile `ph` strip, MENU panel) | Unchanged. The frames' mobile top bar (status bar, single INBOX title) differs from the protected `ph` strip; the strip was kept. |
| `ProductionQueuePage.tsx` / `ProductionActivityPage.tsx` | Unchanged; they still mount the bodies in the frame with screen `inbox` / `activity`. |
| HUB (`HubBody`) | Unchanged; still imports `buildActivityRows` / `NODE_BADGE` from `ActivityBody`, and its signatures are kept. |
| DESIGN, EXPERIENCE, EXPRESSION, LIBRARY | Untouched. |
| Data hooks (`useProductionAuthorityData`, `useProductionRequests`, `decideStoryboard`) | Unchanged; read only. |
| Activity hero plate | Stays `AUTHORITY_ASSETS.hubCrystal`, as an earlier authority test requires. Inbox uses the per-family `hubHero` plates. Neither has dedicated INBOX/ACTIVITY art (see residuals). |
| Publish | Not present, so nothing is inherited. |

## Temporary / interaction surface audit

| Surface | Exists? | Treatment | Class |
|---|---|---|---|
| Host MENU | yes (frame) | unchanged | LEGACY (host) |
| Filter popover (Activity WORKSPACE + RANGE) | yes | moved into an `iax-pop` panel with a red-pipe head; closes on Esc or an outside click; filter logic unchanged | PARENT_INHERITED |
| Search | new UI over the existing lists | filters the visible list (verified: 7 → 4 rows for "cast") | PARENT_INHERITED |
| System notice-type / status selects | yes | styled native selects in kit grammar | PARENT_INHERITED |
| Approval decision state (approve / request changes) | yes (`decideStoryboard`) | gated buttons, a DECIDE IN WORKSPACE gate box, and a decision note | PARENT_INHERITED |
| Approval confirmation dialog | **no** | not invented; the decision call is unchanged | — |
| Sort control ("Sort: Recent" in frames) | **no** | not invented; lists keep their existing order | residual |
| Comment composer | **no data** | inside the Comments UNMOUNTED shell; no fake input | UNMOUNTED |
| Attachment preview | partial | Inbox Approvals preview aside (asset art) + detail media | PARENT_INHERITED |
| Person / project context | project only | Direct → PROJECT CONTEXT (live project / entry / decisions open); no people | PARENT_INHERITED |
| Drawers | **no** | none exist; none added | — |
| Mobile drill-ins | yes | approval rows → `?item=`; milestones → `?milestone=`; disabled PREV/NEXT ends are `aria-disabled` | PARENT_INHERITED |
| Loading / empty | yes | `IaEmpty` (`data-state=EMPTY`) per panel | PARENT_INHERITED (shared with the above) |
