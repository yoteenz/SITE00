# Production authority forensics — corpus summary (Phase 0–6)

Sprint `P0.STUDIOOS.PRODUCTION.FULL-AUTHORITY-FORENSIC-AUDIT.PIXEL-PERFECT-REFINEMENT.OPUS2`.

The audit covers every git ref and every founder upload in this session's store. No implementation work started until this report existed.

## How the archive was recovered

- **Git, all refs.** I ran `git fetch --all --prune`. The search covered 882 remote refs, 767 tags and 3,721 commits.
  - `git log --all --raw --no-abbrev --no-renames` was filtered to image, video and zip paths, with adds, modifies, renames and deletes.
  - That gave 4,979 media events in 139 commits.
- **Hashing.** Every image blob was measured: width, height and a 256-bit dHash. The founder upload store was hashed with `git hash-object`, so an uploaded file and a committed copy share one id.
- **Lineage.** Each commit was traced to the branches that contain it, then to the PR that introduced it.
  - PR attribution uses main merge commits, squash subjects, then the earliest PR whose head contains the commit.
  - All 1,331 PRs were listed. 76 PRs introduced media.
- **Classification sources.** Pack manifests and READMEs, `production-authority-registry.ts`, the live route tables (`realmRoutes.ts` and `expressionRoutes.ts`), and the founder decisions recorded in `motherboard/MEMORY.md`.
- **Visual checks.** Supersession calls that depended on what the images show were checked on the contact sheets. Examples: T12 against PAR3V, DWS against T12, and the parent boards against the EL family roots.

## Totals

| Measure | Count |
|---|---|
| Files inspected (uploads + git path@blob) | **4,024** (586 upload files + 3,438 git entries over 3,167 paths) |
| Visual authorities (screen, hybrid, interaction, system pack) | **605** |
| CANONICAL | 430 |
| SUPERSEDED | 53 |
| IN_REVIEW | 0 |
| UNKNOWN | 0 |
| DUPLICATE (exact secondary copies) | 109 |
| CONFLICTING | 13 |
| Duplicate groups | 165 (exact blob plus dHash near-duplicate) |
| Content authorities (runtime media, residents, generated outputs) | 546 |
| Content status | 134 CANONICAL · 166 SUPERSEDED · 162 IN_REVIEW · 84 DUPLICATE |
| Not authority | 1,079 live captures · 472 comparison sheets · 1,322 out-of-scope files |

Out-of-scope files are JURNL, the public redesign, Astral World, skins, twin benches, the Projects index, NDXBOOK founder workspace art and deploy ZIPs.

### By family (visual authorities)

| Family | Found | Canonical | Superseded | Duplicate | Conflicting |
|---|---|---|---|---|---|
| HUB | 26 | 22 | 1 | 3 | 0 |
| INBOX | 31 | 8 | 6 | 12 | 5 |
| DESIGN | 131 | 45 | 20 | 66 | 0 |
| EXPERIENCE | 100 | 92 | 1 | 3 | 4 |
| EXPRESSION | 137 | 100 | 18 | 19 | 0 |
| LIBRARY | 158 | 150 | 1 | 3 | 4 |
| ACTIVITY | 13 | 4 | 6 | 3 | 0 |
| SHELL (host strip + nav icon family) | 9 | 9 | 0 | 0 | 0 |

### Live routes (`route-authority-map.json`)

200 live Production routes and states are mapped.

| Family | Exact | Partial | Conflicting | None |
|---|---|---|---|---|
| HUB | 1 | 1 (legacy machine, mobile only) | – | – |
| INBOX | 1 | 3 (grandchildren: mobile exact, desktop/tablet URL-only) | 5 (children: IBX2 vs founder directive) | 5 (temporary sheets + inspector) |
| DESIGN | 6 modes | 7 (`design/*` workspace sections) | – | – |
| EXPERIENCE | 46 | – | 1 (tab root) | – |
| EXPRESSION | 41 (root + 40 family routes) | 1 (Character Fabrication: mobile only) | – | – |
| LIBRARY | 75 | – | 1 (tab root) | – |
| ACTIVITY | 5 (root + filter states) | 1 (inspector: text authority) | – | – |

**Routes with no recovered authority.** These are marked NO_RECOVERED_AUTHORITY. The live presentation is preserved and inherits the parent shell (Phase 5):

- the Inbox REQUEST REVISION sheet;
- the APPROVAL CONFIRMATION sheet;
- the FILTER / SORT sheet;
- the ATTACHMENT PREVIEW sheet;
- the Inbox inspector drawer.

## Upload packs, in the order they arrived

| Pack | Uploaded | Use now |
|---|---|---|
| NDXBOOK_Narrative_Engine_Screen_Pack + screen recording | 09-29 15:00 | SUPERSEDED for Production. Still the authority for the legacy NME widget. |
| SITE00_Mobile_Projects_and_Production_Reference_Pack | 09-29 17:15 | Production screens SUPERSEDED. Projects screens are out of scope. |
| SITE00_PRODUCTION_HUB_AUTHORITY_PACK_FINAL (00–14) | 09-29 22:32 | CANONICAL for `/production?view=machine` (LEGACY_LOCKED). |
| Character_Fabrication_Authority_Expressions (×2, identical) | 09-29 / 09-30 | CANONICAL, mobile only. |
| DWS_SONNET_LITE (×3, identical) | 10-02 05:27 | Mode roots SUPERSEDED by T12. Interaction expressions and system packs CANONICAL. |
| SITE00_VIEWPORT_TAB_SONNET_LITE | 10-02 12:13 | SUPERSEDED by T12 viewport. |
| Production_3_Viewports_12_Tabs_SONNET_LITE (×2) | 10-02 18:43 | CANONICAL 36-screen set. The registry follows it. |
| sonnet_production_authority_handoff_v2 (text) | 10-02 18:43 | Shell canon (D-SHELL-CANON). |
| HUB references (chat, 3 images) | 10-03 17:12 | CANONICAL. Same design as T12 HUB at higher resolution. |
| Host header strip (chat image) | 10-03 19:45 | CANONICAL mobile host strip. |
| STUDIOOS_INBOX_ACTIVITY_3VIEW_AUTHORITY_LITE_v1 | 10-03 19:43 | SUPERSEDED. The lens model was retired. |
| SW_INBOX_AUTHORITY_LITE_v2 / STUDIOOS_INBOX_AUTHORITY_LITE_v2 (identical) | 10-03 23:21 / 10-04 02:52 | Root and grandchildren CANONICAL. Children CONFLICTING: the founder directive governs presentation. |
| STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1 | 10-03 23:36 | CANONICAL compilation of T12. Experience and Library are CONFLICTING (see U-07 and U-08). |
| STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2 | 10-04 01:31 | CANONICAL for all 40 Expression routes. |
| STUDIOOS_EXPERIENCE_LIBRARY_AUTHORITY_LITE | 10-04 15:37 | CANONICAL for 46 + 75 routes. |

Committed authority material found in history:

- `docs/site00/design-pack/sources/*`: byte-identical to the DWS system packs.
- `docs/site00/bottom-nav/BOTTOM_NAV_ICON_FAMILY_V1/authority/*`: founder approved on 10-02.
- The founder design-reconstruction calibration references in `public/visual-references/founder/site00/*`. These are the only authority for `/production/:slug/design/*` sections.
- Resident authorities in `public/site00/studio-world-residents/*`.
- `artifacts/production-authority-opus/{vp}/NN-*.jpg` looks like an authority copy but is not. It is OPUS1 live captures (dHash 68–111 against T12).

## Conflicts kept, not discarded (`unresolved-authorities.json`)

- **U-07 `/production/:slug/experience`.** The T12/PAR3V 08 parent landing (immersive world hero, family nav, ENTER WORLD) competes with the later EL `01_World` operating overview.
  - EL governs under rule 3 (later, route-specific) and rule 5 (route manifest).
  - **Founder decision needed.**
- **U-08 `/production/libraries`.** The T12/PAR3V 10 canon-vault landing (featured canonical asset, recent additions, most used, lineage) competes with the EL `01_Authorities` root. Same resolution. **Founder decision needed.**
- **U-09 shell.** Tablet and desktop images show a centred selector and a stacked nav. The handoff v2 shell override text governs.
- **Inbox children.** The SW_INBOX v2 stacked cards conflict with the 10-04 Inbox directive marked FOUNDER AUTHORITY: FINAL. The directive governs presentation; v2 keeps governing the model and copy.

## Could not be retrieved in this container

- **U-01.** Eight Inbox v2 desktop/tablet boards exist only as `cdn.openart.ai` URLs. This environment's network policy denies that host (403).
- **U-02.** The Experience/Library master ZIPs are not present. Their URLs are in `artifacts/production-openart-recovery2/`. The LITE copies were used.
- **U-03.** The Expression LITE v1 pack is not in the upload store. It survives as the authority halves of 120 committed compare sheets. The sampled route is identical to v2.

## Files

- `authority-inventory.json`: every authority-class and content-class file, with all required fields (id, file, path, branch, commit, date, PR, family, route, state, viewport, type, lineage, approval, status, supersession, live route, duplicate group).
- `authority-lineage.json`: directives, pack chronology, supersession chains, the git authority commits, and per-entry supersession evidence.
- `duplicate-groups.json`: 165 groups.
- `unresolved-authorities.json`: U-01 to U-13 (authority questions) and U-14 to U-18 (refinement decisions, added after QA).
- `route-authority-map.json`: 200 routes and states.
- `files-inspected.json`: all 4,024 inspected files, including live captures and out-of-scope files.
- `contact-sheets/`: 47 sheets by family, route and viewport.
  - Candidates sit side by side.
  - Labels give source, date and viewport.
  - Borders and badges are coloured by status: green CANONICAL, grey SUPERSEDED, red CONFLICTING.

# Refinement and QA (Phases 7–27)

Implementation started only after the record above existed. Refinement followed the order the brief set: geometry, composition, primary media scale, columns, navigation, controls, density, typography, spacing, crop, materials, micro styling.

## How before and after were measured

- **Scope.** The same 185 mapped routes were captured at all 14 viewports: 390×844, 393×852, 430×932, 390×664, 360×640, 768×1024, 820×1180, 1024×1366, 1024×768, 1440×900, 1680×1050, 1920×1080, 1440×810 and 1280×720. That gives 2,590 states per side.
- **Before and after.** BEFORE is the tunnel SHA `09378e0a` served on its own dev server. AFTER is the working branch. Both use one detector (`scripts/visual_diff.py` documents it).
- **Checks per state:**
  - frame and document scroll;
  - horizontal overflow;
  - primary media crushed into strips (hero bands are listed separately, see U-18);
  - clipping outside declared panes;
  - type under 8.5px;
  - full-width empty bands;
  - undeclared scroll panes and page errors.
- **Not captured as pages (15 of 200 mapped states):**
  - the legacy Hub machine view, which is LEGACY_LOCKED (its link is checked as an interaction);
  - the 5 Inbox temporary sheets, exercised as interactions instead;
  - the 6 `design/*` workspace sections, a separate workspace surface outside the Production frame;
  - 3 Activity parameter patterns, represented by their concrete states.

| Family | Routes | States | Page scroll | Media strips | Type < 8.5px | Empty band > 48px | Undeclared panes / errors |
|---|---|---|---|---|---|---|---|
| HUB | 1 | 14 | 5 → 0 | 0 → 0 | 9 → 0 | 8 → 0 | 0 → 0 |
| INBOX | 9 | 126 | 0 → 0 | 1 → 0 | 30 → 0 | 39 → 24 | 0 → 0 |
| DESIGN | 6 | 84 | 0 → 0 | 24 → 3 | 75 → 75 | 56 → 15 | 0 → 0 |
| EXPERIENCE | 47 | 658 | 0 → 0 | 0 → 0 | 0 → 0 | 33 → 33 | 0 → 0 |
| EXPRESSION | 42 | 588 | 19 → 10 | 55 → 1 | 255 → 14 | 7 → 3 | 19 → 0 |
| LIBRARY | 76 | 1,064 | 0 → 0 | 66 → 0 | 0 → 0 | 39 → 22 | 0 → 0 |
| ACTIVITY | 4 | 56 | 0 → 0 | 0 → 0 | 20 → 0 | 2 → 2 | 0 → 0 |
| **All** | 185 | 2,590 | **24 → 10** | **146 → 4** | **389 → 89** | 184 → 99 | 19 → 0 |

- **Horizontal overflow: 0 → 0.** No route scrolls sideways. The detector ignores layers that an overflow-hidden container inside the viewport already clips, such as the Design chamber's floor ellipse. That container check was confirmed against the Design chamber at 390, 1024, 1440 and 1280 widths.
- **Interaction authorities: 51 of 51 checks pass** (17 surfaces × 390 / 1024×768 / 1440). The surfaces are:
  - the Expression media inspector on 8 routes (D-EXPR-MEDIA);
  - the Library character image inspector and the index inspector drawer;
  - the Inbox inspector, request revision, attachment preview and filter sheets;
  - the Inbox approval confirmation, which is gated: it stays disabled until the founder gate opens;
  - the Design viewport toggle;
  - the Hub chamber link.
- **Remaining states map to the decisions recorded as U-14 to U-16:**
  - page scroll: Character Fabrication on tablet and desktop;
  - type: Design chamber miniatures and Character Fabrication;
  - media strips: three Design chamber panels on short frames, and the 1280×720 Production Floor tiles at the authority's own proportion.
- **Empty bands** are partly content volume: lists with few live records.

## What changed

- **HUB (D-PARENT-NOSCROLL).**
  - The body is a column that fills the frame. The world panel flexes around its authority height and carries the legacy chamber link.
  - Portrait tablets take the 9:16 composition, scaled to the frame height (`cqb`). Before, 45% of the frame was empty and type was 6px.
  - Phone type floor is 8.5px. On phones the components sit in two rows of whole-label tiles.
- **EXPRESSION.**
  - New media resolver: Entry 002 authority-board crops, resident media and CF receipts, each with its provenance.
  - New media kit: cards, gallery, record hero, face rail, inspector.
  - Casting, Look, Storyboard, Performance and Review were rebuilt media-first, following the media-priority table.
  - The Production Floor follows the T12 one-viewport composition: phones show six floors in one row; tablets and desktops show full-width MAKE IT TRAVEL and ON YOUR TABLE rows; short frames get a compact hero.
  - Hidden phone modules that the EXPR2 mobile boards do show were restored.
- **LIBRARY.** The character detail is portrait-led. Detail heroes and inspector media keep real height. Long blocks scroll as declared `.rk-scroll` panes.
- **INBOX.**
  - Incoming objects fill their pane: 207×134 at 1280×720, up from 54px bands.
  - The decision and notice detail stack on portrait tablets. Related materials fill their column.
  - Card titles, status and empties hold the 8.5px floor.
- **ACTIVITY.** Meta labels and range counts hold the 8.5px floor.
- **DESIGN.** The chamber takes the slack (no empty bands). ON YOUR TABLE cards keep a real image.
- **Assets.** 30 Entry 002 crops are registered as PROJECT_CANON (`entry002.*`). See `public/site00/production-authority-assets/entry-002/SOURCE.md`. Nothing was generated.

## Refinement files

- `visual-diff-report.json`: per route × viewport BEFORE / AFTER metrics, plus a status for each category (geometry, media_scale, spacing, crop, type, interaction). It also holds the interaction-authority checks.
- `before-after-sheets/`: AUTHORITY / BEFORE / AFTER per family × {mobile 390, tablet 1024×768, desktop 1440}, 21 sheets.
- `scripts/visual_diff.py` and `scripts/before_after_sheets.py`: how both were produced.

