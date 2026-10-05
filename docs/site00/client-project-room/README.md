# SITE 00 — Client Project Room (P0.SITE00.CLIENT-PROJECT-ROOM-UX-APPROVAL-COST-TRANSPARENCY-FORENSIC1)

UX blueprint for the client project room, covering approval, cost transparency and client-funded production. These are plans only.

| What this sprint did not touch | Count |
|---|---|
| Code changes | 0 |
| Database changes | 0 |
| Real client accounts | 0 |
| Real provider credentials | 0 |
| Paid generations | 0 |

It builds on `../ground-zero/` (repo `eedc9c8`).

| Group | Files |
|---|---|
| Audit | `SITE00_CLIENT_APP_EXISTING_AUDIT.json` |
| IA + screens | `SITE00_CLIENT_APP_CANONICAL_IA.json`, `SITE00_CLIENT_APP_PROPOSED_SCREEN_TREE.json`, `SITE00_CLIENT_APP_UX_MODEL.json` |
| Review / approval | `SITE00_CLIENT_REVIEW_FLOW.json`, `SITE00_CLIENT_REVISION_FLOW.json`, `SITE00_CLIENT_APPROVAL_GATE_MODEL.json`, `SITE00_CLIENT_FAMILY_REVIEW_INTERACTION_BOARD.html` (wireframe authority spec, with a live prototype) |
| Project state | `SITE00_CLIENT_PROJECT_PULSE.json`, `SITE00_CLIENT_PROJECT_ROADMAP_MODEL.json`, `SITE00_CLIENT_ACTIVITY_MODEL.json`, `SITE00_CLIENT_NOTIFICATION_MODEL.json` |
| Cost + funding | `SITE00_CLIENT_COST_TRANSPARENCY_MODEL.json`, `SITE00_CLIENT_FUNDING_MODEL.json`, `SITE00_PROJECT_PROVIDER_CONNECTION_MODEL.json` |
| Permissions | `SITE00_CLIENT_PERMISSION_MODEL.json` |
| Direction + test instance | `SITE00_CLIENT_APP_CREATIVE_DIRECTION.md`, `AIO_CLIENT_PROJECT_ROOM_BLUEPRINT.md` |

## Follow-up: P0.SITE00.CLIENT-PROJECT-ROOM-LIVE-VIEWPORT-WORKING-TREE-REVIEW1

| Group | Files |
|---|---|
| Live review | `SITE00_CLIENT_LIVE_REVIEW_MODEL.json`, `SITE00_CLIENT_VIEWPORT_MODEL.json` |
| Working tree | `SITE00_CLIENT_WORKING_TREE_MODEL.json`, `SITE00_PROJECT_GRAPH_SCHEMA.json`, `SITE00_CLIENT_TREE_FILTER_RULES.json` |
| Final review | `SITE00_FINAL_PROJECT_REVIEW_MODEL.json` |
| Direction | `SITE00_CLIENT_LIVE_TREE_CREATIVE_DIRECTION.md` |

No sixth tab is added. The working tree lives in PROJECT (`/app/:slug/project/tree`). LIVE is a DESIGN | LIVE switch inside each family review, plus a full-screen viewer at `/app/:slug/live/:nodeId`. FINAL REVIEW has three parts: SITE, TREE and SUMMARY.
