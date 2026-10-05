# Production workspace — Grok handoff audit (LITEPACK1)

Sprint `P0.SITE00.PRODUCTION-WORKSPACE-GROK-HANDOFF-AUDIT-LITEPACK1`. This is the Opus handoff between pipeline step 02 (architecture and refinement) and step 03 (the Grok canonical asset, environment and icon pass).

- **Generation:** none. OpenArt was not accessed.
- **Workspace changes:** none. No visual implementation changes, and no route, tab, project-context or viewport rewrite.
- **Deploy:** site00.com was not deployed.

**Workspace audited:** `7ec5501d`, the head of the preview tunnel `cursor/studio-world-resident-geometry-complete-production-injection1`.

**Lite pack:** `artifacts/production-workspace-grok-handoff/SITE00_PRODUCTION_WORKSPACE_GROK_LITEPACK1.zip`. It holds 86 files in 7.03 MB.

**Manifests, NOTES and README_FIRST** are mirrored in `docs/production-workspace/grok-handoff/` for review. `PACK_INDEX.json` lists every pack file with its source and size.

## How the audit was done

1. **Runtime model, read from the code.** `scripts/production-workspace/grok-handoff/runtime-model.tsx` imports these tables directly (`tsx`), so the manifests cannot drift from the code:
   - the live route tables (`realmRoutes.ts` 46 + 75, `expressionRoutes.ts` 40);
   - the Activity verbs, domains and ranges;
   - the IA line icons (`iaKit.tsx`) and the host line set (`productionHub/icons.tsx`);
   - the design pack ids;
   - the production asset registry (90 records);
   - the route asset manifests;
   - the Design VIEWPORT presets;
   - the Character Fabrication slot and receipt manifest (108 slots, 82 received).
2. **Authority record.** The previous sprint's forensic record (`artifacts/production-full-authority-forensics/`) was reused, not redone. It covers:
   - 605 visual authorities over every git ref and founder upload;
   - the 200-route authority map;
   - lineage, directives and U-01…U-18.
3. **Component and asset audit:**
   - the router (`src/routes/Site00Routes.tsx`) and the `/production` route family;
   - host chrome and nav (`chrome.tsx`, `nav.tsx`, `productionNavIcon.tsx`);
   - each tab body;
   - every plate consumer (`productionAssetPaths`, `realmData.ts`, `designChamberConfig.ts`, `DesignChamber.tsx`, `ExpressionBody.tsx`, CF `chamber.tsx`);
   - the git history of the bottom-nav glyphs.
4. **Live runtime evidence at the brief's presets.** `scripts/production-workspace/grok-handoff/capture-runtime.mjs` captured 31 states on the worktree dev server at 393×852 (phones at 2×), 834×1194 and 1440×900:
   - 9 parents at portrait tablet;
   - the Activity and Inbox inspectors;
   - four Inbox sheets;
   - the decision detail;
   - the host menu.

   Every state had 0 px page scroll and 0 px horizontal overflow. These captures are evidence only, used where the runtime is the authority (founder FINAL directives, or no recovered image).
5. **Build and validation.** `scripts/production-workspace/grok-handoff/build_handoff.py` writes the six manifests, NOTES, README_FIRST and compressed reference copies, then zips and validates (see *Lite pack*).

## Totals

| Measure | Count |
|---|---|
| Workspace tabs audited | 7 / 7 (plus the global host shell) |
| Surfaces mapped | 235 |
| Parent surfaces | 12 (HUB, INBOX, six parent-level DESIGN modes, EXPERIENCE, EXPRESSION floor, LIBRARY, ACTIVITY) |
| Child surfaces | 39, of which 26 are visually distinct |
| Grandchild surfaces | 137, of which 6 are visually distinct |
| State / drawer / modal / overlay / inspection / preview / full-screen surfaces | 47: 8 need their own visual authority; 15 are LEGACY_LOCKED machine surfaces |
| Distinct visual authorities (surfaces carrying their own pack authority) | 52 |
| Inheriting surfaces (reference a parent through `inherits_visual_from`) | 183 |
| Legacy surfaces (no Grok action) | 22: the hub machine and 14 overlays; 7 legacy `design/*` bench sections |
| Environment groups | 11 |
| New environment plates for the whole pass | 8 |
| Surfaces that get a new plate (as crops of those 8 masters) | 95 |
| Surfaces reusing an existing environment as-is | 88 |
| Isolated asset candidates | 51 in 8 sets: 27 workspace objects and materials, plus 24 CF residual slots |
| Icon records | 132 |
| Unique icon semantics | 110 |
| Icon authority packs | 2 (founder bottom-nav master family; DWS icon pack authority) |
| Generic icon substitutions in use | 31: the HUB nav glyph and 30 Character Fabrication line icons |
| Missing icons | 4: `ia.calendar`, `ia.film` and `ia.flag` have no DWS cell; project-specific icons are not registered |
| Responsive authorities | 52 (one authority + crop rule per distinct surface) |
| Authority images in the pack | 59, plus 5 REFERENCE and 12 ICONS files |

### Per tab

| Tab | Surfaces | Parent | Child | Grandchild | State / overlay | Distinct | Environment group(s) | Pack authorities |
|---|---|---|---|---|---|---|---|---|
| HUB | 16 | 1 | 0 | 0 | 15 | 1 | ENV-ATRIUM · ENV-HUB-MACHINE-LEGACY | 3 (HUBREF m / t / d) |
| INBOX | 15 | 1 | 5 | 3 | 6 | 7 | ENV-WORKSPACE-PAPER | 6 |
| DESIGN | 16 | 6 | 7 | 0 | 3 | 6 | ENV-ATRIUM · ENV-VIEWPORT-CORRIDOR · ENV-DESIGN-RECONSTRUCTION-BENCH | 8 |
| EXPERIENCE | 48 | 1 | 7 | 39 | 1 | 10 | ENV-EXPERIENCE-WORLD | 11 |
| EXPRESSION | 51 | 1 | 10 | 30 | 10 | 13 | ENV-PRODUCTION-FLOOR · ENV-CF-CHAMBER | 16 |
| LIBRARY | 79 | 1 | 10 | 65 | 3 | 11 | ENV-CANON-VAULT | 12 |
| ACTIVITY | 7 | 1 | 0 | 0 | 6 | 2 | ENV-WORKSPACE-PAPER | 3 |
| Global host shell | 3 | — | — | — | 3 | 2 | ENV-HOST-SHELL | REFERENCE + ICONS |

## Tab by tab

### HUB
- **Canonical state matches the mobile authority:**
  - white host panel;
  - NDXBOOK selector;
  - "NN ITEMS NEED YOU", a live count (the authority shows 03);
  - STATUS, PRODUCTION OVERVIEW, ACTIVE ENTRIES, PROJECT COMPONENTS, CURRENT OPERATIONS and RECENT ACTIVITY;
  - the 7-tab nav.
- **Modules are regions, not routes.** The modules above are regions of `hub.root`.
- **Authority:** HUBREF (founder chat references 2026-10-03), concordant with T12 and PAR3V 00.
- **Hero is functional but not visually canonical.** It is a crop of the authority screenshot (`hub.hero.*`, 1296–2304 px wide bands with the core baked in).
- **Grok action:** one clean atrium master with an empty pedestal (`PLATE-ATRIUM-MASTER`), plus the NDXBOOK core as a separate project-keyed object (`OBJ-NDX-CORE`).
- **Hub machine** (`/production?view=machine` and its 14 interaction boards) is LEGACY_LOCKED (D-HUB-LEGACY). Grok takes no action; the HUB world-panel link must keep reaching it.

### INBOX
- **Root** (NEEDS YOU) follows PAR3V 01 / T12 (D-INBOX-ROOT).
- **Children** (WATCHING, RESOLVED, ALL, MESSAGES, SYSTEM) share one founder-FINAL composition: rail + rows + inspector (D-INBOX-FINAL). IBX2 v2 cards govern model and copy only.
- **Grandchildren** (decision detail, message thread, system notice) follow IBX2 06–08 on mobile. Their desktop/tablet boards are OpenArt URLs only (U-01); the runtime governs.
- **Interaction surfaces** have no recovered image (U-11), so the runtime is the authority. Packed as one 393×852 board:
  - the inspector drawer;
  - REQUEST REVISION;
  - FILTER / SORT;
  - ATTACHMENT PREVIEW.

  APPROVAL CONFIRMATION is gated (disabled) and reuses the sheet pattern.
- **NEAR / MID / FAR** exists in no authority, no runtime model and no git history. It is not canonical; do not create it.
- **Mobile no-scroll:** 0 px page scroll at 393×852 on every captured Inbox state.
- **Grok action:** icons only. No plates.

### DESIGN
- **Six parent-level modes** (BRAND default, EXPERIENCE, SURFACES, COMPILER, ASSETS, VIEWPORT). T12 governs, with PAR3V 02–07 boards packed as one 3-view image each, plus mobile BRAND and VIEWPORT.
- **Mounted today:**
  - project selector (host);
  - six mode tabs;
  - atrium chamber with suspended panels and the project core;
  - DESIGN PIPELINE;
  - ON YOUR TABLE;
  - on VIEWPORT: the preset (MOBILE 390×844, MOBILE XL 430×932, TABLET 834×1194, DESKTOP 1440×900), SAFE AREA, ORIENTATION and ZOOM controls, the live client-app iframe (PREVIEW), and the validation sheet link.
- **Not mounted** (U-10): the DWS interaction states (drawers, inspectors, review modals, compare, export, family / screen selectors, grid, bounds, reference mode). They are canonical in DWS 04 but the unified workspace lives on another branch. Grok takes no action.
- **Design pack crops are unusable at size:** stages 76 px, icons 48–64 px, swatches 41 px tall, devices ≤225 px, plates 90–278 px. Grok regenerates them as isolated objects and materials.
- **`design/*` sections** (workspace, references, assets, pages, skins, history, more) mount the legacy reconstruction bench. They are LEGACY with no action.

### EXPERIENCE
- **Tab root** renders the WORLD family root. The U-07 conflict stays open for a founder decision, with explicit priority: (1) EL body, (2) T12/PAR3V 08 for the world-hero language only.
- **Structure:** 7 families (WORLD, ZONES, PATHS, INTERACTIONS, INHABITANTS, STATES, ACCESS) with 46 routes.
- **One plate stands in for every view.** All views of one NDXBOOK world use one GROK1 city plate today (`experience.worldHero`).
- **Grok action:** five project-keyed world plates: sphere, archipelago map, central plaza, spire and aurora city. Add the portal gate and the interaction object set.
- **Overlays stay live:** map pins, labels, route lines and rings.
- **Inhabitant portraits** are cast media and are not generated.

### EXPRESSION
- **Structure:**
  - the Production Floor root (T12);
  - 10 EXPR2 families with 40 routes: NARRATIVE, CASTING, LOOK + WARDROBE, CAST + PERFORMANCE, SETS + SCENES, STORYBOARD, REVIEW + HANDOFF, FORMAT STUDIO, CONTENT PACKAGE, CAMPAIGN BOARD. Not flattened;
  - the media inspector (D-EXPR-MEDIA);
  - the Character Fabrication entryway (full-screen chamber with 8 station states).
- **Journey rail.** The brief's "journey rail" is the PRODUCTION FLOORS row on the floor plus the downstream flow rail FORMAT STUDIO → CONTENT PACKAGE → CAMPAIGN BOARD. Both are live code.
- **Hero plate mismatch.** `expression.stageHero` is a dark red faceted stage, but every authority shows a luminous white production floor.
- **Grok action:** one `PLATE-PRODUCTION-FLOOR` master, band-cropped for the floor and all 10 family heroes, with screens left blank for live project media.
- **Character Fabrication** already has a Grok family (2026-09-30) refined to its 16 authorities, so it is reused. Optional: its 24 residual slots, plus icon cleanup.
- **Requested successors.** The brief's WORK / WORLD / CONTINUITY / FORMATS / PRODUCTION / HISTORY are covered by the 10 EXPR2 families. Continuity lives inside CASTING and LOOK.

### LIBRARY
- **Tab root** renders the AUTHORITIES family root. The U-08 conflict stays open for a founder decision, with explicit priority: (1) EL body, (2) the T12/PAR3V 10 canon-vault band. `library.canon` already matches that band.
- **Structure:** 10 families with 75 routes. Coverage includes:
  - the CANONICAL, IN REVIEW, SUPERSEDED and ARCHIVE lifecycles;
  - the inspection band and drawer;
  - RECENT, MOST USED and LINEAGE;
  - detail and lineage routes;
  - search and filter.
- **Records stay real.** They render the real production asset registry (live data) and must not be replaced with generated thumbnails.
- **Grok action:** reuse the canon and geometry plates. Generate MATERIAL swatches, which are shared with Design.

### ACTIVITY
- **Authority:** D-ACTIVITY-FINAL (founder FINAL). DOMAIN × TIME project memory: filter rail, timeline and inspector, inline on tablet and desktop, a slide-up drawer on mobile.
- **The T12/PAR3V 11 hero band is retired.** T12 remains the reference for density and chips.
- **The previous mobile scroll defect is fixed:** 0 px page scroll at 393×852, and only the timeline and inspector panes scroll.
- **Event types stay text chips.** CREATED, UPDATED, APPROVED, REVISED, SUPERSEDED, GENERATED, CAST, PUBLISHED, UNLOCKED, BLOCKED, RESOLVED and DEPLOYED are text chips by authority. No event glyphs are invented (DWS icon rule).

## Environment groups (credit plan)

| Group | Region | Members | New plates | Notes |
|---|---|---|---|---|
| ENV-ATRIUM | SHARED_WORKSPACE | 6 | 1 · PLATE-ATRIUM-MASTER | HUB band crops + five Design chamber modes + pack crops 01–04; cores are separate objects |
| ENV-VIEWPORT-CORRIDOR | SHARED_WORKSPACE | 4 | 1 · PLATE-VIEWPORT-CORRIDOR | Device and screen stay live (CSS frame + client-app iframe) |
| ENV-PRODUCTION-FLOOR | SHARED_WORKSPACE | 42 | 1 · PLATE-PRODUCTION-FLOOR | Replaces the mismatched dark stage for floor + 40 family routes |
| ENV-CF-CHAMBER | SHARED_WORKSPACE | 9 | 0 | Grok family already mounted (2026-09-30) |
| ENV-EXPERIENCE-WORLD | PROJECT_BODY | 48 | 5 · PLATE-WORLD-{SPHERE, ARCHIPELAGO-MAP, CENTRAL-PLAZA, SPIRE, AURORA-CITY} | Project-keyed (NDXBOOK); overlays live |
| ENV-CANON-VAULT | SHARED_WORKSPACE | 79 | 0 | Reuse library.canon + geometry 01–03 |
| ENV-DESIGN-OBJECT-LIBRARY | SHARED_WORKSPACE | 0 (object library) | 0 | Pipeline stages, device frames, swatches, mode boards |
| ENV-WORKSPACE-PAPER | SHARED_WORKSPACE | 22 | 0 | Inbox + Activity: live code, icons only |
| ENV-HOST-SHELL | SITE00_HOST | 3 | 0 | Live code + nav / host icons |
| ENV-HUB-MACHINE-LEGACY | SHARED_WORKSPACE | 15 | 0 | LEGACY_LOCKED |
| ENV-DESIGN-RECONSTRUCTION-BENCH | SHARED_WORKSPACE | 7 | 0 | Legacy bench (U-10) |

Execution order:
1. **P0:** atrium master, NDXBOOK core, Design core, pipeline stage objects, HUB nav restore, host icons.
2. **P0/P1:** production floor.
3. **P1:** viewport corridor.
4. **P1:** five world plates.
5. **P1:** IA and HUB component icons.
6. **P2:** swatches, device frames, portal gate, design-pack icons, CF line icons.
7. **P3:** object set, CF residual slots, time-of-day grades, mode-board re-light.

## Icons

**Canonical icon packs:**
1. **Bottom nav:** the founder master family (architectural glyphs, black line + red accent). Mounted 2026-10-03 at the founder's request (D-NAV-MASTERS, commits `d3d060b0` / `43611fd8`).
2. **Functional vocabulary:** the DWS icon pack authority (DWS_SONNET_LITE 05):
   - §01 navigation, §02 modes, §03 pipeline stages;
   - §04 objects, §05 actions, §06 status, §07 review;
   - §08 structural geometry.

**Runtime regression found (P0).** Commit `94831d12` replaced the founder pavilion HUB master (`43611fd8:…/masters/01_HUB.png`, 384×284) with the design pack's 48×48 house glyph during a cherry-pick of `afb22c27`.
- No founder decision chose the house.
- The pack carries the founder master. `ICONS/NAV_MASTERS/01_HUB__FOUNDER_MASTER.png` is restored from the git blob.
- The icon inventory marks `nav.hub` as GENERIC SUBSTITUTE, with action: restore the pavilion.
- The runtime file is not changed in this sprint.

**Superseded nav glyphs.** The V1 line glyphs inside the screen authorities' nav bars (`BOTTOM_NAV_ICON_FAMILY_V1`) are superseded by the masters. They appear once, as a DO-NOT-USE contrast sheet, because every screen authority shows them.

**Other icon findings:**
- **Generic line set.** Character Fabrication uses 30 generic line icons from `productionHub/icons.tsx`. They are functional, but their style is not the DWS vocabulary. Of the other icons in that file, 9 serve only the legacy machine and 6 are unused.
- **IA line icons** (23) serve Inbox, Experience and Library. 21 are in use and 2 (`mail`, `at`) are unused.
- **Missing DWS cells.** Three in-use IA icons (`calendar`, `film`, `flag`) have no DWS cell.
- **Project-specific icons** (Library ICONS → PROJECT) are not registered. That page renders "NO PROJECT-SPECIFIC ICONS ARE REGISTERED".
- **Provider and system marks** are not used anywhere. Provenance renders as text.

## Responsive

**Presets.** The QA presets are 393×852, 834×1194 and 1440×900.
- The Design VIEWPORT runtime presets are MOBILE 390×844, MOBILE XL 430×932, TABLET 834×1194 and DESKTOP 1440×900. There is no 393×852 preset. They are recorded, not changed.
- Founder tablet boards (T12 / EL / EXPR2) are 4:3 landscape. Portrait 834×1194 has no founder board; `REFERENCE/RUNTIME__TABLET_PORTRAIT_834x1194_BOARD.jpg` shows the runtime compositions and crop zones.

**Composition rules:**
- Every parent and distinct child is a first-class mobile, tablet and desktop composition (D-PARENT-NOSCROLL; DWS responsive rule).
- Inheriting surfaces reflow inside their parent's frame.
- No device chrome on mobile.
- Keep the top breathing space under the host strip.

**Crop rules** are known for every plate-bearing environment group (`PRODUCTION_WORKSPACE_RESPONSIVE_MAP.json`).

## Host / project firewall

Every surface labels its regions (SITE00_HOST, PROJECT_BODY, SHARED_WORKSPACE) and its class (HOST_VISUAL, PROJECT_VISUAL, GLOBAL_WORKSPACE_VISUAL). The DWS firewall rule governs: Studio OS owns shell, navigation, controls, pipeline and review grammar; the active project owns artifacts, imagery and expressive content.

Findings to keep out of the Grok pass:
- **FIREWALL-01 (host leak).** The host project-selector thumbnail is hard-coded to `project.ndxbook.cover` while the label follows the slug. Recorded for Composer; Grok must not bake project art into host chrome.
- **FIREWALL-02.** Experience world plates are NDXBOOK project art but resolve from the global registry. Deliver them project-keyed.
- **FIREWALL-03.** HUB and DESIGN authorities bake the NDXBOOK core into the shared atrium. Split them: empty-pedestal atrium (shared) plus the core object (project).

## Superseded authorities excluded

None of these are in the pack. Lineage is in `NOTES/SUPERSESSION_NOTES.txt`; only the V1 nav contrast sheet travels.

- **Production screens superseded by later founder packs:**
  - SITE00_Mobile_Projects_and_Production_Reference_Pack;
  - NDXBOOK_Narrative_Engine_Screen_Pack and its screen recording (video never packed);
  - the DWS 01–03 mode roots;
  - SITE00_VIEWPORT_TAB;
  - STUDIOOS_INBOX_ACTIVITY_3VIEW (the lens model is retired);
  - the SW_INBOX v2 children presentation;
  - EXPRESSION LITE v1.
- **Retired hero:** the T12/PAR3V 11 Activity hero.
- **Nav glyph lineage:** the GROK_ICON_PACK nav glyphs; the BOTTOM_NAV_ICON_FAMILY_V1 line glyphs; the unreferenced 512 px keyed nav set in `bottom-nav/`; the 48 px house substitute.
- **Unused plate:** `hub.crystal`. The registry note "Activity hero still uses this plate" is stale.
- **Not authorities:** the OPUS1 live captures that look like authority copies (U-13).

## Unresolved authority conflicts

These do not block the pass, because each has an explicit priority in the manifests.

- **U-07, EXPERIENCE tab root.** EL World root (priority 1) vs the T12/PAR3V 08 immersive landing (priority 2, hero language only). Founder decision pending.
- **U-08, LIBRARY tab root.** EL Authorities root (priority 1) vs the T12/PAR3V 10 canon vault (priority 2, band language only). Founder decision pending.
- **U-17, Entry 002 subject identity (content).** Dark-haired authority boards vs the blonde SW-017 receipt. Out of Grok scope: people are not generated or altered.

Resolved with explicit priority:
- **U-09 shell:** D-SHELL-CANON.
- **Inbox children:** D-INBOX-FINAL.
- **Activity hero:** D-ACTIVITY-FINAL.
- **Nav family:** D-NAV-MASTERS.
- **HUB nav substitute:** founder master.

## Missing visual authorities

All of these are recorded, and the runtime or a rule governs.

- **Inbox temporary sheets** (U-11). The runtime is the authority, packed as a board.
- **Inbox v2 desktop/tablet boards** for the grandchildren (U-01). OpenArt URLs only; OpenArt is not accessed by policy.
- **Character Fabrication tablet/desktop** (U-05 / U-15). Mobile authority only; the runtime centres the authority canvas.
- **Portrait tablet 834×1194** for all parents. No founder board; the runtime board is packed.
- **Activity event inspector.** Text directive only (D-ACTIVITY-FINAL); the runtime capture is packed.
- **`design/*` sections, desktop/tablet.** Founder calibration on mobile only, and the bench is legacy.
- **Hub machine tablet/desktop** (U-06). LEGACY_LOCKED.
- **Project-specific icon set.** Not registered.

## Lite pack

`artifacts/production-workspace-grok-handoff/SITE00_PRODUCTION_WORKSPACE_GROK_LITEPACK1.zip`: 86 files, 7.03 MB (6.70 MiB).

| Folder | Contents |
|---|---|
| `README_FIRST.txt` | Purpose, MUST / MUST NOT, reference-only image rule, read order, quick answers, folders, design language, firewall |
| `MANIFEST/` | `PRODUCTION_WORKSPACE_GROK_HANDOFF.json`, `…_SCREEN_TREE.json`, `…_ENVIRONMENT_GROUPS.json`, `…_ICON_INVENTORY.json`, `…_RUNTIME_ROUTES.json`, `…_RESPONSIVE_MAP.json` |
| `AUTHORITIES/` | 59 distinct parent / child / grandchild / interaction authorities in per-tab folders, about 1280 px long edge (3-view boards 1600 px) |
| `ICONS/` | Founder nav master sheet + 7 individual masters (HUB pavilion restored from git); DWS icon pack authority; current runtime line-icon and design-pack sheets; one DO-NOT-USE contrast sheet |
| `REFERENCE/` | Global environment language board, DWS asset pack authority, host shell board, portrait-tablet runtime board, current plates contact sheet |
| `NOTES/` | `GROK_EXECUTION_RULES.txt`, `SUPERSESSION_NOTES.txt`, `ASSET_PASS_SCOPE.txt` |

**Validation** is run by the builder and re-checked by `tests/productionWorkspaceGrokHandoffLitepack1.test.ts`. Checks:
- the ZIP opens (testzip);
- every image decodes;
- all required files are present;
- every manifest pack path resolves;
- all 7 tabs are present;
- every P0 / P1 distinct surface has a pack authority;
- no image is over 600 KB;
- there are no duplicate images;
- icon authorities are present.

**Originals were not modified.** Every copy records its source: authority id, upload pack path or git blob.

## Reproduce

```bash
node_modules/.bin/tsx scripts/production-workspace/grok-handoff/runtime-model.tsx <scratch>/runtime-model.json
node scripts/production-workspace/grok-handoff/capture-runtime.mjs <scratch>/gh-captures <vite port>
python3 scripts/production-workspace/grok-handoff/build_handoff.py --repo . --runtime-model <scratch>/runtime-model.json \
  --uploads <founder upload store> --inventory <forensic inventory with _disk paths> --captures <FULL-AUTHORITY live captures> \
  --gh-captures <scratch>/gh-captures --routes-main <routes-main.json> --stage <scratch>/stage \
  --zip artifacts/production-workspace-grok-handoff/SITE00_PRODUCTION_WORKSPACE_GROK_LITEPACK1.zip --docs docs/production-workspace/grok-handoff
```

The founder upload store and the live-capture folders are session inputs and are not committed. Their files are identified in the manifests by authority id and git blob.
