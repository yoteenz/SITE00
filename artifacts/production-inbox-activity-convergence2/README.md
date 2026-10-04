# P0.PRODUCTION.INBOX-ACTIVITY.AUTHORITY-CONVERGENCE2

## Authority used (newest approved)
- **Board pack:** `STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1` (manifest copied to `AUTHORITY_MANIFEST.json`).
  - `01_INBOX.jpg`: INBOX parent board (desktop 16:9 · tablet 4:3 · mobile 9:19.5).
  - `11_ACTIVITY.jpg`: ACTIVITY LOG parent board (same three viewports).
- **Inbox child references:** `STUDIOOS_INBOX_AUTHORITY_LITE_v2` (re-uploaded). It is byte-identical to the pack the OPUS2 Inbox sprint already used, and it still governs the Inbox children.

## Forensics (before editing)
Live screenshots of the mounted Inbox and Activity at 390×844, 1024×768 and 1440×810 are in `*/before-vs-after.jpg` (left side) and `NO_SCROLL_REPORT_BEFORE.json`.

### Inbox mismatches found
| # | Mismatch vs `01_INBOX` | Resolution |
|---|---|---|
| 1 | Decision card used a tall portrait image plus a TYPE / DECISION title, with buttons underneath | Landscape art · SOURCE / AREA / REQUEST / BLOCKS / BY + `URGENCY: HIGH` chip · stacked REVIEW / APPROVE / REQUEST REVISION. Mobile keeps art + facts with the 3 buttons in a row below. |
| 2 | Two-column grid with a 4-tile ATTENTION block (blockers / approvals / messages / system) | Centered column: decision card, then INCOMING DECISION OBJECTS (~62%) beside BLOCKERS & APPROVALS (~38%, two large red counts), then RECENTLY RESOLVED |
| 3 | INCOMING title plus ALL / DECISIONS / MESSAGES / SYSTEMS filter chips | INCOMING DECISION OBJECTS, image cards with an entry–title line and a red status line. ALL INBOX keeps the typed views one tap away. |
| 4 | Lifecycle tabs left-aligned and full width | NEEDS YOU / WATCHING / RESOLVED centered under the shared host |
| 5 | RECENTLY RESOLVED was a blank text bar | Thumbnail strip. With nothing resolved it shows six dashed slots plus an honest caption (no filler art). |
| 6 | Gated APPROVE rendered as washed-out pink | Solid authority red with a not-allowed cursor; the gate reason sits under the card |

### Activity mismatches found
| # | Mismatch vs `11_ACTIVITY` | Resolution |
|---|---|---|
| 1 | Own ACTIVITY hero (glass chamber), lens bar, search, 4 stat cards, feed + milestones columns (a generic dashboard) | Replaced. The HUB project band (NDXBOOK / ENTRY 002 crystal hero + live status strip) is extracted from HubBody as `ProjectHeroBand` and reused verbatim. |
| 2 | Lenses ALL / APPROVALS / UPDATES / COMMENTS / BLOCKERS | Domain tabs ALL · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · PEOPLE · SYSTEM and range tabs TODAY · THIS WEEK · THIS MONTH · FULL HISTORY (desktop/tablet on one row, mobile stacked) |
| 3 | Feed rows: avatar · title · REVIEW chip | Lineage timeline: red node · verb chip · subject · Version · By · Affects / Downstream · Cause. Opening an event shows CAUSED BY / LED TO. |
| 4 | Page scrolled (frame +903px mobile, +445px tablet/desktop) | No page scroll; the timeline is the one internal pane |

## Implementation
| File | Change |
|---|---|
| `src/site00/components/productionAuthority/InboxBody.tsx` | NEEDS YOU root markup only: `FocusCard`, new `BlockersApprovals`, INCOMING DECISION OBJECTS, `RecentlyResolved strip`. Model, routing, lifecycle state, gate and handlers unchanged. |
| `src/site00/styles/site00-production-inbox-family.css` | All old root / focus rules removed (38); one new per-viewport ROOT section |
| `src/site00/components/productionAuthority/activityLog.ts` | New ACTIVITY LOG model: 12 verbs, 7 domains, 4 ranges; events from live graph blockers / unlocks, recorded activity + requests, canonical Entry 002 records; lineage (`causeId`, `causeChain`, `effectsOf`) |
| `src/site00/components/productionAuthority/ActivityBody.tsx` | Rewritten as the ACTIVITY LOG. Query state `?domain= ?range= ?verb= ?event=`; legacy `?view=blockers / approvals` and `?milestone=` still resolve. `buildActivityRows` kept for the HUB feed. |
| `src/site00/components/productionAuthority/HubBody.tsx` | Hero + status strip extracted to `ProjectHeroBand` (identical DOM on HUB) |
| `src/site00/styles/site00-production-activity-log.css` | New: no-scroll contract, log card, tabs, timeline, mobile / tablet / desktop |
| `src/site00/components/productionAuthority/iaKit.tsx` | OPUS1 Activity kit retired (IaHero / IaLensBar / IaStats / IaPanel / IaChip / IaEmpty); `IaIcon` kept for Inbox |
| `src/site00/styles/site00-production-inbox-activity.css` | Deleted. It was dead once the OPUS1 Activity body was gone. |
| `tests/productionInboxActivityAuthorityConvergence2.test.ts` | New: 22 tests |
| `tests/productionInboxActivityThreeViewportOpus1.test.ts`, `tests/productionAuthorityConvergenceOpus2.test.ts` | Superseded Activity assertions rewritten to the new authority. Legacy links stay covered. |

## Shell
- `ProductionAuthorityFrame` is untouched; both pages still mount in it.
- Host top panel and the seven-item bottom nav (HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY) are untouched.
- No phone or browser chrome was reintroduced.

## Proof
- **Comparisons:** `inbox/<viewport>/authority-vs-live.jpg` and `activity/<viewport>/authority-vs-live.jpg` (authority left, live right), plus `before-vs-after.jpg`.
- **Activity states:** `activity/STATES_DESKTOP.jpg` and `activity/STATES_MOBILE.jpg` (lineage open · PEOPLE / FULL HISTORY · BLOCKED deep link · legacy milestone).
- **No-scroll:** `NO_SCROLL_MATRIX.md` and `NO_SCROLL_REPORT.json`: 16 routes/states × 5 viewports = 80 / 80 PASS.

## Residuals
- **Preview host:** the Cursor cloud preview tunnel does not exist in this container, so live QA ran against the branch's Vite dev server (same build inputs) in Chromium. The tunnel URL was not exercised.
- **Thin data:** Activity data is sparse in this sandbox (no recorded ledger, Expression Engine API unreachable). The log shows the live graph state plus canonical Entry 002 records. PUBLISHED / DEPLOYED / SUPERSEDED / RESOLVED events appear only when a recorded event carries them; none are invented.
- **Decision art:** the Inbox decision art is the live object's own asset (the narrative still), not the reference's mock crystal. Incoming and resolved cards use live objects only.
- **HUB overflow (pre-existing):** the HUB root (`/production`) overflows its frame by 22px on tablet and 45px on desktop. Identical numbers on committed HEAD before this sprint; the `ProjectHeroBand` extraction does not change its DOM. Out of scope here.
- **Children:** Inbox children (Watching / Resolved / All / Messages / System / details) keep their OPUS2 compositions from `INBOX_LITE_v2`. The parent board covers the root only.
