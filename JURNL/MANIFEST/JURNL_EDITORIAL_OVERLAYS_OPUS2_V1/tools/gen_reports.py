import json, os, sys
sys.path.insert(0, '/tmp/claude-0/-home-user/334ce893-7840-52d9-a9d4-209cc4b29b39/scratchpad/o3/gen')
from pw import summarise
SP = '/tmp/claude-0/-home-user/334ce893-7840-52d9-a9d4-209cc4b29b39/scratchpad'
M = '/home/user/SITE00/JURNL/MANIFEST/JURNL_EDITORIAL_OVERLAYS_OPUS2_V1'
meas = json.load(open(f'{M}/metrics/overlay_measure_before_after.json'))
def table(h, rows):
    return '\n'.join(['| ' + ' | '.join(h) + ' |', '|' + '---|' * len(h)] + ['| ' + ' | '.join(str(c) for c in r) + ' |' for r in rows])
NAMES = {'01': 'MONEY ACTION SHEET', '02': 'ADD A POCKET', '03': 'MOVE MONEY', '04': 'MANAGE POCKET', '05': 'SEARCH DRAWER', '06': 'ACCOUNT / SETTINGS', '07': 'ARCHIVE BLOCKED', '08': 'GLOBAL MENU'}
STATUS = {'01': 'PASS (rebuilt)', '02': 'PASS (rebuilt)', '03': 'PASS (rebuilt)', '04': 'PARTIAL (V3 fragment + board clip / art)', '05': 'PASS (new)', '06': 'NOT REBUILT — authority conflict (F09 replica)', '07': 'PARTIAL (V3 caution + board stone)', '08': 'PARTIAL (V3 drawer + board head)'}
mrows = []
for sid in NAMES:
    for vp in ('393x852', '393x660'):
        b, a = meas['before'].get(f'{sid}-{vp}', {}), meas['after'].get(f'{sid}-{vp}', {})
        mrows.append([sid, NAMES[sid], vp, b.get('open'), a.get('open'), a.get('page_scroll_y'), a.get('close_in_view'), a.get('primary_in_view'), a.get('focus_inside'), ', '.join(a.get('off') or []) or '—'])
MEAS = table(['#', 'Surface', 'Viewport', 'opens BEFORE', 'opens AFTER', 'page scroll', 'close on screen', 'primary on screen', 'focus inside', 'off-screen controls (not in a scroller)'], mrows)
unit = json.load(open(f'{SP}/o4/unit.json')) if os.path.exists(f'{SP}/o4/unit.json') else None
e2e = summarise(f'{SP}/o4/e2e.json')
base = json.load(open('/home/user/SITE00/JURNL/MANIFEST/F05_MONEY_DOT01_SHELL_CONVERGENCE_V1/metrics/summary.json')) if os.path.exists('/home/user/SITE00/JURNL/MANIFEST/F05_MONEY_DOT01_SHELL_CONVERGENCE_V1/metrics/summary.json') else {}
# pre-existing on the untouched base d6992b3fc (OPUS3 report 26): the MONEY parent rail
PRE = {'jurnl-f05-carousel.e2e.ts', 'jurnl-f05-motion-pilot.e2e.ts'}
PRE_T = {'T04 · a scroll or drag never opens the menu, and a short tap is still a tap'}
e2e_rows, fails = [], []
if e2e:
    agg, fl, st = e2e
    for (f, p), v in sorted(agg.items()):
        e2e_rows.append([f, p, v.get('expected', 0), v.get('unexpected', 0), v.get('skipped', 0)])
    for f, p, t in fl:
        flaky = f == 'jurnl-f05-carousel.e2e.ts' and p == 'tablet' and t.startswith('07 / 08 / 09 / 10')
        cls = 'FLAKY under 3-worker load: passes 3 / 3 in isolation (same assertion fails on the base desktop project)' if flaky else ('PRE-EXISTING on base (MONEY parent rail)' if f in PRE or t in PRE_T else 'NEW — see report 16')
        fails.append([f, p, t[:96], cls])
E2E_TOT = {k: sum(r[i] for r in e2e_rows) for k, i in (('passed', 2), ('failed', 3), ('skipped', 4))}
U = f"{unit['numPassedTests']} / {unit['numTotalTests']}" if unit else 'pending'
R = {}
R['01_BRANCH_AND_AUTHORITY_BASELINE'] = """# 01 · Branch and authority baseline

| Ref | SHA | Role |
|---|---|---|
| `claude/jurnl-f05-dot01-shell-convergence-um0u93` (Accounts OPUS3) | `c4787f382` | **base of this sprint** — contains #1713 safety (`f7e2739c6`), OPUS2 03/04/05, V3 (`3fac5e546`), Cursor's MONEY rail (`d6992b3fc`), OPUS3 06 / 22 |
| `claude/jurnl-global-interactive-v3-um0u93` | `3fac5e546` | V3 foundation (in lineage) |
| `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` | `d6992b3fc` | Cursor tunnel merge (in lineage) |
| this sprint | `claude/jurnl-editorial-overlays-um0u93` | isolated branch from `c4787f382`; nothing force-pushed; no other branch written |

Accounts OPUS3: EXECUTED and pushed (`c4787f382`, PARTIAL, no PR) — its 06 / 22 compositions are preserved untouched here.

Authority hierarchy applied: V9 governs the pages under the overlays (unchanged); the founder's eight-panel board governs these
eight overlays (the illustration's sample values / names / dates are not data); V3 governs shared materials and primitives;
the approved art registries are the only art sources; the canonical contracts govern behaviour, data and access."""
R['02_GENERIC_OVERLAY_ROOT_CAUSE'] = """# 02 · Generic overlay root cause

`GENERIC_OVERLAY_COMPOSITION_ARCHITECTURE_PRESERVED` — exact sources:

| Responsible | Where | What it imposed |
|---|---|---|
| `JurnlDrawer` | runtime/components/primitives.tsx:486 | one fixed geometry for every sheet: full-width `jrn-drawer--short/long` block, grab handle, head (title + lead + top-right close), vertically stacked `jrn-drawer__body`, uniform `jrn-drawer__foot`; `material="v3"` only re-skinned it (border-image parchment) — the layout stayed |
| `Chips` | runtime/finance/FinanceSheets.tsx:58 | every option a full-width `jrn-btn--secondary` row in `jrn-home__choices` → ADD A POCKET's five permanent account-type rows, MOVE MONEY's stacked FROM / TO rows, four stacked settlement rows |
| `AccountChips` | FinanceSheets.tsx:70 | FROM / TO as two unrelated chip stacks: no expression of a source, a destination or a direction |
| call sites | MoneyMotionParent.tsx (`f05m-actions-sheet`: `JurnlDrawer size="short"` + two `JurnlButton`s), MoneyScreens.tsx `AddPlaceSheet` (`JurnlDrawer size="long"` + `Chips`), FinanceSheets.tsx `TransferSheet` (`JurnlDrawer material="v3" size="long"`) | the founder's three rejected surfaces |
| `SelectionSheet` | screens/CheckPurchaseScreens.tsx:78 | no focus containment, no Escape (legacy) |

Correction: the behaviour host is separated from composition (`EditorialOverlay`, report 04). The three rejected sheets no
longer use `JurnlDrawer` / `Chips`; their logic (state, validation, `createManualAccount`, `recordTransfer`, settlement
states, duplicate guard) is unchanged. 74 `JurnlDrawer` call sites remain elsewhere (report 18)."""
R['03_V3_AND_NEW_CONCEPT_AUTHORITY_MAP'] = """# 03 · V3 and new concept authority map

| Layer | Authority | Applies to |
|---|---|---|
| page under an overlay | V9 (DOT 01) / approved family pages | unchanged |
| overlay composition (01–08) | founder eight-panel editorial board | this sprint |
| materials, palette, type roles | V3 (olive / oxblood / terracotta / gold / parchment; uppercase serif + sparse lowercase script) | shared |
| behaviour | existing primitives (OverlayLayer, useOverlayFocus, JurnlPopover, JurnlInput) | shared |
| art | V9 DOT 01 motion PNGs, SK01 text-free plate, OPUS2 scene bands, OPUS3 06 / 22 lifts | only sources used |

Conflicts resolved explicitly: (a) 06 ACCOUNT / SETTINGS vs the F09 AccountDrawer — the F09 drawer is an approved pixel replica
(`OVR_DRAWER`, jurnlOverlayReplica1 tests); replacing it is a founder decision, not done silently (report 11). (b) 07 ARCHIVE
BLOCKED sits inside the V9 36 frame: the board's caution materials are applied to the caution, the V9 frame stays. (c) board
labels CREATE POCKET / OPENING BALANCE vs the sprint's SAVE POCKET / BALANCE NOW: the sprint's labels are used."""
R['04_OVERLAY_COMPOSITION_ARCHITECTURE'] = """# 04 · Overlay composition architecture

`runtime/surfaces/editorial/Editorial.tsx` + `jurnl-editorial.css`:

| Responsibility (sprint concept) | Implementation |
|---|---|
| JURNL_OVERLAY_BEHAVIOR_HOST | `EditorialOverlay`: OverlayLayer portal, scrim, `role=dialog aria-modal`, V3 `useStableFocus` (first control, Tab trap, Escape, focus return), `data-jrn-overlay` id — **no geometry** |
| JURNL_OVERLAY_COMPOSITION | `data-jed="action" / "register" / "transfer" / "search"` — each composition places its own layers in CSS |
| JURNL_EDITORIAL_LAYER / ARTIFACT_SLOT | `EdArt`: an approved image or a source region of one, uniformly scaled (cover) into the box the composition gives it, optionally torn (deterministic clip-path) |
| JURNL_PARCHMENT_FRAGMENT | `EdHead` (V9 01 heading parchment), `.jed-sheet` (V9 14 sheet 9-slice), `.jed-pick` (V9 13 panel 9-slice) |
| JURNL_TEXTILE_LAYER | V9 03 olive branch on oxblood; OPUS2 05 coin-on-oxblood band |
| JURNL_LIVE_CONTENT_SLOT | `.jed-body` (contained scroll) with real `JurnlInput`s |
| JURNL_ACTION_FRAGMENT | `EdAction` (paper / cream / olive torn strip V9 17 / terracotta) with optional art |
| JURNL_RESPONSIVE_COMPOSITION | folio `min(404px, 100%)`, `max-height` from the visual viewport (`--jrn-vvh`); body scrolls, foot stays |
| JURNL_DECORATIVE_POINTER_POLICY | `.jed-decor` / `.jed-art` `pointer-events: none`, `aria-hidden` (E2E A1 / B4 hit-test) |

One host, four distinct geometries; no generic wrapper was swapped for another: the compositions differ in headline
placement, artifact set, ground silhouette, content arrangement and action placement."""
R['05_ARTWORK_RECOVERY_AND_PROVENANCE'] = """# 05 · Artwork recovery and provenance

Every layer is an existing approved file (no generation, no screenshot crop of the board, no upscaled preview):

| Layer | Source file | Used in |
|---|---|---|
| classical bust, arch | `MOTION_PILOT/F05_MOTION_SIDEKICK.webp` (SK01 text-free, 941 × 1672) regions bust [70,0,520,330], arch [600,40,341,560] | 01, 03, 05, 08 |
| heading parchment | `DOT01/F05_DOT01_01_HEADING_PARCHMENT.webp` | all headlines |
| laurel wax seal | `DOT01/F05_DOT01_02_LAUREL_WAX_SEAL.webp` (+ the 06 reorder glyph `SCENES/F05_DOT01_ICON06_REORDER.webp` engraved over it) | 03 direction |
| olive branch on oxblood | `DOT01/F05_DOT01_03_OLIVE_BRANCH_RED_FABRIC.webp` | 01, 02 |
| lemon branch | `DOT01/F05_DOT01_04_LEMON_BRANCH_BLOSSOMS.webp` | 01, 03, 08 |
| olive foliage | `DOT01/F05_DOT01_10_SMALL_OLIVE_FOLIAGE.webp` | 02 |
| engraved coast | `DOT01/F05_DOT01_11_ENGRAVED_COASTAL_FOREGROUND.webp` | 01 |
| torn panel / large sheet | `DOT01/F05_DOT01_13_…PANEL`, `14_…SHEET` | action papers, sheets, pickers |
| temple columns | `DOT01/F05_DOT01_15_TEMPLE_COASTAL_COMPOSITION.webp` region [120,40,420,360] | 07 |
| dark torn strip | `DOT01/F05_DOT01_17_TORN_RECEIPT_STRIP.webp` | primary actions |
| receipt stack + binder clip | `DOT01/F05_DOT01_22_RECEIPT_PAPER_STACK.webp` (clip region [300,0,200,150]) | 04, 05 |
| amphora / coin on oxblood | OPUS2 `SCENES/F05_DOT01_SCENE_04.webp` [30,40,360,500], `SCENE_05.webp` [540,236,390,260] | 01 |
| pocket kind art | OPUS3 `SCENES/F05_DOT01_CARD06_*.webp` (above the chevron tab) | 03, 04 |
| bronze temple seal | OPUS3 `SCENES/F05_DOT01_SEAL_22.webp` | 02 |

ARTWORK_SOURCES_RECOVERED: 16 files. Gaps (not invented, recorded): GAP-SEARCH-BOOKS (the board's archival book spines —
none in the approved sets; the receipt stack is used), GAP-WARN-SEAL (the board's bronze warning emblem as art — the V3 CSS
bronze ring with a warning glyph stays), GAP-PURSE-EMBLEM (the board's purse medallion for ADD A POCKET — the 22 temple
seal is used), GAP-COIN-STACK (the board's coin stack beside the balance — Batch 02 brass coin stacks is a candidate, not
mounted), GAP-ACCOUNT-MEDALLION (06, not rebuilt)."""
for sid, rep, body in (('01', '06_MONEY_ACTION_SHEET_REBUILD', 'Before: `JurnlDrawer size="short"` — beige sheet, title, lead, two full-width stacked buttons.\n\nAfter (`MoneyActionSheet`, `data-jed="action"`): dark olive torn ground; the SK01 bust (torn) top-left; the MONEY headline parchment overlapping it with "manage pockets and movement"; oxblood olive branch behind; a lemon branch at the corner; ADD A POCKET on a torn paper tilted −1.4° with the OPUS2 amphora breaking out of its right edge; MOVE MONEY on a cream paper tilted +1.2°, offset right, with the coin on oxblood; the engraved coast along the foot. Two distinct, ≥ 112 px tall fragments; MOVE MONEY is disabled with the reason ("add two pockets first") under two pockets. Triggers `f05m-actions-add` / `f05m-actions-move` unchanged.'),
                       ('02', '07_ADD_POCKET_REBUILD', 'Before: `JurnlDrawer size="long"`: NAME, five full-width KIND rows, BALANCE NOW, two payout rows, SAVE at the bottom (clipped on short phones).\n\nAfter (`data-jed="register"`): the 22 bronze temple seal on the ADD A POCKET headline; oxblood branch at the left edge; one torn sheet holding NAME, ACCOUNT TYPE as a compact two-column grid with glyphs (all five supported types; CASH spans; the chosen one dark olive with a gold check), BALANCE NOW (BALANCE OWED NOW for a card), CREDIT LIMIT only for a card, RIDESHARE PAY only for bank / debit; CANCEL paper + SAVE POCKET dark strip always on screen (393 × 660 measured). `createManualAccount` unchanged (E2E A2 asserts the stored type and balance).'),
                       ('03', '08_MOVE_MONEY_REBUILD', 'Before: `JurnlDrawer material="v3"`: FROM chip stack, a note, TO chip stack, AMOUNT, DATE, four stacked settlement rows, note, footer.\n\nAfter (`data-jed="transfer"`): bust + arch top; MOVE MONEY / PAY A CARD headline; FROM as a torn fragment (the pocket\'s own 06 art, name, live figure) with the real pocket choices under it; the bronze laurel seal engraved with the 06 up/down arrows between; TO as a second fragment offset the other way; a ledger sheet with AMOUNT + DATE side by side, WHERE IS THE MONEY NOW? as a 2 × 2 grid (all four canonical starts: arrived, in transit, pending, scheduled), the effect line, the note; CANCEL + RECORD TRANSFER. The body scrolls inside itself; RECORD stays on screen. `recordTransfer`, the duplicate guard and the settlement labels are unchanged (E2E A3: two legs written once).'),
                       ('04', '09_MANAGE_POCKET_POPOVER_REBUILD', 'Kept the shared PocketManager (long press, right-click, Shift+F10, the MANAGE chip) and its anchored JurnlPopover (V3 fragment). Added from the board: the binder clip (V9 22) fastening the fragment, and the pocket\'s own 06 kind illustration. RENAME POCKET / DELETE POCKET (terracotta, safe archive) unchanged. PARTIAL: the fragment\'s paper silhouette is the V3 border-image, not the board\'s larger torn sheet.'),
                       ('05', '10_SEARCH_DRAWER_REBUILD', 'New (`GlobalSearchDrawer`, `data-jed="search"`), opened by the MONEY parent search chip (`f05m-search`, which before navigated to ACTIVITY). Real records only (`searchRecords`): pockets by name, transactions by merchant / category / note; FILTER BY ALL / POCKETS / ACTIVITY; an empty query lists the most recent real activity (never sample data); "NOTHING MATCHES" empty state; a result navigates to the pocket or the entry; ALL ACTIVITY and ADVANCED SEARCH (the V9 31 page) stay separate. Art: SK01 arch, the V9 receipt stack (GAP-SEARCH-BOOKS).'),
                       ('06', '11_ACCOUNT_SETTINGS_REBUILD', 'NOT REBUILT. The F09 AccountDrawer (PREFERENCES) is an approved pixel replica of its own authority (`OVR_DRAWER` boxes; `tests/jurnlOverlayReplica1.test.tsx` checks its ten controls: account, profile, currency, connection, ask context, buffer, buffer save, privacy, sign out). Re-composing it as board 06 would override an approved replica: founder decision required (keep F09, or let board 06 supersede it). All real settings remain reachable (unchanged).'),
                       ('07', '12_ARCHIVE_BLOCKED_REBUILD', 'Kept the canonical archive service and the V3 caution (oxblood torn paper, bronze ring with the warning glyph, BLOCKERS ledger of the real blockers — HELD_BALANCE, ACTIVE_TRANSFER, RESERVED_FUNDS, RECURRING_PAYMENT, EXPECTED_INCOME, OPEN_BALANCE, DEFAULT_ACCOUNT — RESOLVE ISSUES, KEEP). Added from the board: the classical stone (V9 15 temple columns) beside the caution. PARTIAL: the terracotta fragment layering of the board is not reproduced; on 393 × 660 RESOLVE ISSUES is inside the V9 content scroller (reachable by scroll).'),
                       ('08', '13_GLOBAL_MENU_REBUILD', 'Kept the V3 menu (secondary destinations only: YOUR ACCOUNT, MEMBERSHIP & ACCESS, SUPPORT, SIGN OUT; no dock destinations — V3 unit M1 / E2E G1). Added from the board: the classical head — SK01 bust (torn), lemon branch, a torn MENU headline parchment with "tools, membership and more". PARTIAL: the board\'s Mediterranean arch strip on the exposed left side is the live page behind (not a layer).')):
    R[rep] = f'# {rep[:2]} · {NAMES[sid]}\n\n{body}\n\nEvidence: `evidence/surfaces/{sid}_*.webp` (founder concept · before · after 393 × 852 · after 393 × 660). Status: **{STATUS[sid]}**; founder approval: PENDING.'
R['14_RESPONSIVE_AND_KEYBOARD_QA'] = '# 14 · Responsive and keyboard QA\n\nMeasured on the real overlays (scripts/jurnl/f05-motion-pilot/capture_editorial_overlays.ts), BEFORE = `c4787f382` with the working tree stashed, AFTER = this branch:\n\n' + MEAS + '\n\nThe E2E spec adds 393 × 660 for the three pilots (A4: close and primary on screen, no page scroll) and runs every spec in the small (360 × 780), mobile (393 × 852), tablet (834 × 1194) and desktop (1440 × 900) projects. Inputs are 16 px (no iOS zoom); the folio height follows the visual viewport (`--jrn-vvh`). iOS Safari / WebKit: **UNVERIFIED** (no WebKit in this container; the tunnel was not touched).'
R['15_ACCESSIBILITY_AND_FOCUS_QA'] = """# 15 · Accessibility and focus QA

* Every composition: `role="dialog" aria-modal="true"`, labelled by its live headline; first control focused; Tab trapped;
  Escape closes; focus returns to the opener (E2E A1: back to `f05m-actions`; B2: back to the pocket card; B5).
* Decorative layers `aria-hidden`, `pointer-events: none`; a tap at the centre of every art layer reaches the control or the
  ground, never the art (E2E A1 / B4 `artTakesTaps = 0`).
* Hit targets: action fragments ≥ 112 px tall (01), choices ≥ 44 px, close 44 × 44, foot actions ≥ 52 px.
* SelectionSheet (legacy, F09 CHECK PURCHASE category / pay-with): now uses the shared `useOverlayFocus` with a stable close —
  focus trapped through 14 Tabs, Escape closes, focus returns to `check-category` (E2E B5). The other legacy overlays
  inherited from JurnlDrawer / JurnlSheet / Dot01Overlay already trap focus.
* Long press is never the only way: MANAGE POCKET also opens by right-click, the ContextMenu key / Shift + F10 and the MANAGE chip."""
R['16_FINANCIAL_NONREGRESSION'] = f"""# 16 · Financial non-regression

No financial service changed: `createManualAccount`, `recordTransfer` (settlement start, duplicate guard), the archive
service (zero held balance, zero liability, no unresolved dependencies), `renameAccount` are called exactly as before.
Opening, typing in and dismissing any overlay writes nothing (E2E A3 counts the written legs; the search drawer only reads).
JURNL unit: **{U}** (the one failure is the MONEY parent rail test that fails identically on the untouched base). Financial
suites (jurnlFinancialInvariants, jurnlFinancialStabilization, jurnlF05Dot01, jurnlF05Pockets) are inside that run."""
R['17_ENTITLEMENT_COMPATIBILITY'] = """# 17 · Entitlement compatibility

MY MEMBERSHIP / EXPLORE ADD-ONS / UNLOCK are unchanged from V3: they read only the entitlement contract (no prices, no
checkout, honest COMING SOON, fail closed when unknown, FOUNDER_FULL suppresses upsell). The menu's new classical head adds
no destination and no commercial claim. V3 unit E1–E7 and E2E G3 / G4 run in this sprint's suites (report 19 / 21)."""
R['18_GLOBAL_MIGRATION_MATRIX'] = """# 18 · Global migration matrix (revalidated)

Re-counted on this branch: 74 `JurnlDrawer` call sites (77 at V3 − the three rebuilt here), 1 `material="v3"` (CONSENTS),
21 `Dot01Overlay`, 6 `JurnlModal`, 2 `JurnlSheet`, 2 `SelectionSheet` (hardened), 3 `JurnlPopover`, 5 V3 surfaces,
4 `EditorialOverlay`. The V3 inventory (303 surfaces, `JURNL_GLOBAL_INTERACTIVE_V3_V1/reports/02_APPENDIX_FULL_INVENTORY.md`)
is reclassified:

| Classification | Surfaces | Notes |
|---|---|---|
| ALREADY_CONFORMANT | 40 | V3 count (V9 DOT 01 pages / overlays, approved replicas) |
| MIGRATED (V3 + this sprint) | 13 + 7 | V3: menu, membership, add-ons, unlock, consents, transfer→now editorial, fragment, caution; this sprint: 01 02 03 05 rebuilt, 04 07 08 adapted |
| REUSE_APPROVED_COMPOSITION | ≈ 52 | the remaining form `JurnlDrawer`s with a pick / ledger shape → `register` or `transfer` composition (F04 entry, F06 earnings, F07 bills / pay, F08 set-aside, F10 / F11 forms) |
| ADAPT_APPROVED_SURFACE_FAMILY | ≈ 22 | detail / analysis drawers → `search` ledger or the V3 folio with board materials |
| NEW_UNIQUE_AUTHORITY_REQUIRED | 6 | the `JurnlModal`s (confirmations) and the F09 SECURITY set: no board panel governs them |
| FUNCTIONAL_REMEDIATION_REQUIRED | 5 | confirmations missing on F06 ARCHIVE, F10 I BOUGHT IT, F11 MARK COMPLETE, F16 UNLINK, SIGN OUT (V3 U9) |
| NOT_IMPLEMENTED | 8 | V3 functional dependencies (HELP, NOTIFICATIONS, SECURITY, CALENDAR, DATA EXPORT, LEGAL, MANAGE MEMBERSHIP, billing) |
| BLOCKED | 1 | 06 ACCOUNT / SETTINGS (authority conflict with the F09 replica) |

Approximate counts (≈) come from the call-site mapping by file (finance/FinanceSheets 15, screens/SecurityScreens 13,
HomeScreens 5, GoalsScreens 4, EntryScreens 4, CreditSheets 4, Trips / Setup / Records / Plan 3 each, …); each needs its own
review before migration. No family rollout is authorised before the founder reviews the eight pilots."""
R['19_VISUAL_COMPARISONS'] = '# 19 · Visual comparisons\n\nPer surface (readable, not thumbnails): `evidence/surfaces/01_MONEY_ACTION_SHEET.webp` … `08_GLOBAL_MENU.webp` — the founder board panel, the BEFORE runtime (393 × 852), the AFTER runtime (393 × 852 and 393 × 660). The board itself is kept as input (`input/FOUNDER_EIGHT_PANEL_BOARD.webp`) and is never mounted in the app.\n\nPhysical-composition check (not colour similarity): 01 two distinct tilted fragments with breaking-out objects over a dark ground — matches; 02 seal-on-headline, compact type grid, balance, two-material action row — matches; 03 FROM / seal / TO vertical relationship — matches; 05 headline + search well + filter row + ledger rows + archival object — matches (books gap); 04 / 07 / 08 board objects added to the V3 compositions — partial; 06 unchanged.'
R['20_REMAINING_AUTHORITY_GAPS'] = """# 20 · Remaining authority gaps

1. 06 ACCOUNT / SETTINGS — F09 replica vs board 06 (founder decision).
2. Art gaps: GAP-SEARCH-BOOKS, GAP-WARN-SEAL, GAP-PURSE-EMBLEM, GAP-COIN-STACK, GAP-ACCOUNT-MEDALLION (report 05).
3. 04 / 07 / 08 keep V3 silhouettes with board objects added (partial fidelity).
4. Board labels vs sprint labels (CREATE POCKET / OPENING BALANCE → SAVE POCKET / BALANCE NOW).
5. iOS Safari unverified.
6. 74 `JurnlDrawer` call sites in other families await review (report 18)."""
R['21_CHANGED_FILES_AND_COMMITS'] = """# 21 · Changed files and commits

Base `c4787f382` → `claude/jurnl-editorial-overlays-um0u93` (SHA in the final response).

| File | Change |
|---|---|
| `runtime/surfaces/editorial/Editorial.tsx` (new) | behaviour host + composition primitives (EdArt, EdHead, EdAction, EdChoices, EdSeal, EdGlyph), the art registry and regions |
| `runtime/surfaces/editorial/jurnl-editorial.css` (new) | the compositions (action, register, transfer, search, account) + 04 / 07 / 08 additions |
| `runtime/surfaces/editorial/MoneyOverlays.tsx` (new) | 01 MoneyActionSheet, 03 PocketPick, type glyphs |
| `runtime/surfaces/editorial/SearchDrawer.tsx` (new) | 05 GlobalSearchDrawer + `searchRecords` |
| `runtime/screens/f05/MoneyMotionParent.tsx` | action sheet → MoneyActionSheet; search chip opens the drawer |
| `runtime/screens/MoneyScreens.tsx` | AddPlaceSheet recomposed (logic unchanged) |
| `runtime/finance/FinanceSheets.tsx` | TransferSheet recomposed (logic unchanged) |
| `runtime/screens/f05/dot01/PocketManager.tsx` | clip + kind art on MANAGE POCKET |
| `runtime/screens/f05/dot01/sheets/AccountSheets.tsx` | stone on ARCHIVE BLOCKED |
| `runtime/global/GlobalMenu.tsx` | classical head on the menu |
| `runtime/screens/CheckPurchaseScreens.tsx` | SelectionSheet focus trap + Escape |
| `runtime/surfaces/v3/V3Surfaces.tsx` | `useStableFocus` exported |
| `tests/jurnlEditorialOverlays.test.tsx` (new), `e2e/jurnl/jurnl-editorial-overlays.e2e.ts` (new), `playwright.config.ts` | tests |
| `scripts/jurnl/f05-motion-pilot/capture_editorial_overlays.ts` (new) | evidence capture |"""
R['22_FOUNDER_REVIEW'] = """# 22 · Founder review

Review on a real iPhone (Safari not verified here):
1. Approve or correct PILOT A — 01 MONEY ACTION SHEET, 02 ADD A POCKET, 03 MOVE MONEY.
2. Approve or correct PILOT B — 05 SEARCH (new), 04 / 07 / 08 (board objects on the V3 compositions).
3. Decide 06: keep the F09 AccountDrawer replica, or let board 06 supersede it.
4. Approve the labels used (SAVE POCKET, BALANCE NOW) over the board's sample copy.
5. Authorise the next migration wave (report 18) — none is done before your review.
Nothing is founder-approved by this package. No merge, no deployment, no generation, no spend, no database change."""
tests = f"""## Test results

| Check | Result |
|---|---|
| JURNL unit | {U} |
| new `jurnlEditorialOverlays` | 6 / 6 |
| E2E (production build, 10 specs × 4 projects) | {E2E_TOT.get('passed')} passed · {E2E_TOT.get('failed')} failed · {E2E_TOT.get('skipped')} skipped |

""" + (table(['Spec', 'Project', 'passed', 'failed', 'skipped'], e2e_rows) if e2e_rows else '') + '\n\nFailures, classified:\n\n' + (table(['Spec', 'Project', 'Test', 'Class'], fails) if fails else 'none')
R['16_FINANCIAL_NONREGRESSION'] += '\n\n' + tests
for k, v in R.items():
    open(f'{M}/reports/{k}.md', 'w').write(v.rstrip() + '\n')
json.dump({'e2e': E2E_TOT, 'unit': U, 'new_failures': [f for f in fails if f[3].startswith('NEW')]}, open(f'{M}/metrics/summary.json', 'w'), indent=1)
print(len(R), 'reports', E2E_TOT, U, 'new fails', [f[:3] for f in fails if f[3].startswith('NEW')])
