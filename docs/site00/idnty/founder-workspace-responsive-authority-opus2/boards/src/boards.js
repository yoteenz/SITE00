// The 42 responsive authority boards. One definition per board id; each board-*.html sets data-board.
// Frames are live specimens (board-kit vp) at true viewports; OPUS1 "before" frames are crops of the OPUS1 boards.
import { S, header, section, row, foot, vp, img, note, callout, table, zones, mount } from './board-kit.js';
import { FAMILY_NAMES } from './ws-overlays.js';

const id = document.body.dataset.board;
const W = 1442; // board content width

// Shorthands: true viewports at a scale that fits the board.
const D = (q, o = {}) => vp({ w: 1440, h: 900, q, ...o });
const fit = (n, w, gap = 28) => Math.min(1, (W - gap * (n - 1)) / n / w);
const at = (w, h, q, n, o = {}) => vp({ w, h, q, scale: o.scale ?? fit(n, w), ...o });

const SH = (t) => `<span class="bd-cap__t">${t}</span>`;
const chips = (...c) => c.join(' ');
const R = S.refine();
const DIR = S.dir();

// Grid zone diagrams per viewport (px are the authority values in RESPONSIVE_GRID_SPECIFICATION.md).
const Z = {
  390: [['STAGE · GUTTER 16', 390]],
  834: [['RAIL', 80, 'nav'], ['STAGE · GUTTER 24', 754]],
  1024: [['RAIL', 80, 'nav'], ['STAGE · GUTTER 28', 944]],
  1194: [['RAIL', 80, 'nav'], ['STAGE ≥ 680', 774], ['INSPECTOR', 340, 'insp']],
  1280: [['SIDEBAR', 224, 'nav'], ['STAGE ≥ 680', 712], ['INSPECTOR', 344, 'insp']],
  1440: [['SIDEBAR', 224, 'nav'], ['STAGE', 870], ['INSPECTOR', 346, 'insp']],
  1920: [['SIDEBAR', 248, 'nav'], ['STAGE · CONTENT ≤ 1760', 1252], ['INSPECTOR', 420, 'insp']],
  3440: [['SIDEBAR', 248, 'nav'], ['GUTTER', 486, 'gut'], ['CONTENT MAX 1760', 1760], ['GUTTER', 486, 'gut'], ['INSPECTOR', 460, 'insp']],
};

const OL_IDS = Object.keys(FAMILY_NAMES).filter((k) => k.startsWith('OL-'));

const BOARDS = {
  // ═══ DESKTOP ═════════════════════════════════════════════════════════════
  D01: () => ({
    num: 'D01', title: 'Global shell · desktop', tier: 'DESKTOP 1280–1919 + ULTRA-WIDE',
    sub: 'Four zones — navigation, stage, contextual inspector, global utilities — on one named-area grid. The sidebar never stretches, the stage carries the composition, the inspector docks only when the stage keeps ≥ 680 px.',
    body: [
      section('01', 'ZONES · NAMED-AREA GRID', `<div class="bd-grid" style="grid-template-columns:repeat(2,${(W - 22) / 2}px)">${[1280, 1440, 1920, 3440].map((w) => `<div>${SH(`${w} PX · ${w === 3440 ? 'ULTRA-WIDE' : 'DESKTOP'}`)}<div style="margin-top:8px">${zones(w, Z[w], (W - 22) / 2)}</div></div>`).join('')}</div>
        ${note('grid-template-areas: "nav top insp" "nav stage insp" · columns var(--ws-nav) minmax(0,1fr) var(--ws-insp). Nav 224 (1280–1599) / 248 (≥ 1600). Inspector clamp(344, 24vw, 420) → clamp(420, 18vw, 480) from 1920. Top bar 56. Stage gutter 32 / 40. Page content max 1560 / 1760, centred inside the stage; at 3440 the remainder becomes quiet gutter, not stretched components.', W)}`, R),
      section('02', 'SHELL AT 1440 · DEFAULT AND WITH INSPECTOR', row(D('page=foundations', { scale: fit(2, 1440), title: 'NO SELECTION · STAGE 1216', chips: R }), D('page=foundations&sel=0&insp=client', { scale: fit(2, 1440), title: 'INSPECTOR DOCKED · STAGE 870', chips: R }))),
      section('03', 'GLOBAL UTILITIES', row(D('ol=OL-04', { scale: fit(3, 1440), title: '⌘K SEARCH + COMMANDS', chips: R }), D('ol=OL-05', { scale: fit(3, 1440), title: 'NOTIFICATIONS · POPOVER', chips: chips(R, S.open('FD-W19')) }), D('ol=OL-18', { scale: fit(3, 1440), title: 'ACCOUNT MENU · OPENS UPWARD', chips: R })) +
        note('Top bar = breadcrumb (index + destination + record) · search field clamp(200, 26vw, 420) with ⌘K · notifications. The page title moves out of the top bar into the page header, removing OPUS1’s duplicate “OVERVIEW / DIGITAL FOUNDATION” pairing (P-08).', W)),
      section('04', 'SHORT AND WIDE DESKTOPS', row(vp({ w: 1366, h: 768, q: 'page=overview', scale: fit(2, 1366), title: '1366 × 768 · SHORT-HEIGHT HEADER (TITLE 44)', chips: R }), vp({ w: 1920, h: 1080, q: 'page=overview', scale: fit(2, 1920), title: '1920 × 1080 · WIDE TIER', chips: R }))),
    ],
  }),
  D02: () => ({
    num: 'D02', title: 'Overview · desktop', tier: 'EDITORIAL COMMAND CENTER · RELAXED',
    sub: 'One dominant focus, the decision queue beside it, a horizontal signal strip, then work and movement. OPUS1’s stacked hero is gone: the primary registry now starts above the fold at 1440 × 900.',
    body: [
      section('01', 'DEFAULT · 1440 × 900', row(D('page=overview', { title: 'OVERVIEW · STAGE 1216 · 7/5 COMPOSITION', chips: chips(R, S.illus()), note: 'Title 52 (was 68) in a 112 px header; focus statement 30 in a horizontal composition (identity + statement left, CTA right); signals as one 4-up strip (was crushed into a 1/2 column); ACTIVE WORK registry uses the CLIENT / STATUS / NEXT ACTION variant because its own column is 660 px wide.' }))),
      section('02', 'SCROLLED · 1440 × 900', row(D('page=overview&scroll=380', { title: 'BELOW THE FOLD · WORK + MOVEMENT + MILESTONE', chips: R }))),
      section('03', 'OTHER DESKTOP WIDTHS', row(vp({ w: 1280, h: 800, q: 'page=overview', scale: fit(2, 1280), title: '1280 × 800 · STAGE 1056', chips: R }), vp({ w: 1920, h: 1080, q: 'page=overview', scale: fit(2, 1920), title: '1920 × 1080 · 6/3/3 COMPOSITION', chips: R, note: 'At stage ≥ 1440 the signals move beside the decision queue as a 2 × 2 block and the registry gains LIFECYCLE / INTAKE / LAST ACTIVITY.' }))),
      section('04', 'STATES', row(vp({ w: 1280, h: 800, q: 'page=overview&st=loading', scale: fit(3, 1280), title: 'LOADING', chips: R }), vp({ w: 1280, h: 800, q: 'page=overview&st=empty', scale: fit(3, 1280), title: 'EMPTY', chips: R }), vp({ w: 1280, h: 800, q: 'page=overview&st=error-detail', scale: fit(3, 1280), title: 'ERROR + TECHNICAL DETAIL (OL-20)', chips: R }))),
    ],
  }),
  D03: () => ({
    num: 'D03', title: 'Foundations registry · desktop', tier: 'STANDARD DENSITY',
    sub: 'Columns CLIENT / LIFECYCLE / INTAKE / NEXT ACTION / LAST ACTIVITY on one CSS-grid row template. The registry reads its own width (container query), so the same rows give CLIENT / STATUS / NEXT ACTION when the inspector docks.',
    body: [
      section('01', 'FULL REGISTRY · 1440 × 900', row(D('page=foundations', { title: 'FIVE-COLUMN REGISTRY · ROWS 56', chips: chips(R, S.backend('G-01 INTAKE · LIST FIELDS')), note: 'INTAKE and the list-level lifecycle need the extended `list` response (G-01). Until then the registry shows what `list` returns and these cells read from detail on selection only.' }))),
      section('02', 'WITH INSPECTOR', row(D('page=foundations&sel=0&insp=client', { scale: fit(2, 1440), title: '1440 · STAGE 870 → THREE COLUMNS', chips: R }), vp({ w: 1920, h: 1080, q: 'page=foundations&sel=0&insp=client', scale: fit(2, 1920), title: '1920 · STAGE 1252 → FIVE COLUMNS + INSPECTOR', chips: R }))),
      section('03', 'TOOLBAR, SORT, MENUS', row(D('ol=OL-07', { scale: fit(2, 1440), title: 'FILTER + SORT POPOVER', chips: chips(R, S.open('FD-W12 SYNTHETIC')) }), D('ol=OL-06', { scale: fit(2, 1440), title: 'ROW ACTIONS · UNAVAILABLE SHOWN WITH GAP', chips: chips(R, S.backend('G-05 · G-06')) }))),
      section('04', 'STATES', row(vp({ w: 1280, h: 800, q: 'page=foundations&st=search', scale: fit(4, 1280), title: 'SEARCH RESULT', chips: R }), vp({ w: 1280, h: 800, q: 'page=foundations&st=filtered', scale: fit(4, 1280), title: 'NEEDS YOU VIEW', chips: R }), vp({ w: 1280, h: 800, q: 'page=foundations&st=empty', scale: fit(4, 1280), title: 'NO MATCH', chips: R }), vp({ w: 1280, h: 800, q: 'page=foundations&st=error', scale: fit(4, 1280), title: 'STALE + ERROR', chips: R })) + note('Keyboard: J / K move the row cursor, ↵ opens, / focuses search, ⌘K opens the palette. Sorting is single-column via the SORT control and the active column header (aria-sort). No multi-select — no bulk API exists.', W)),
    ],
  }),
  D04: () => ({
    num: 'D04', title: 'Create client · desktop', tier: 'DIALOG 600 · NO SUCCESS BEFORE THE DURABLE WRITE',
    sub: 'A 600 px dialog over the registry: two-column name row, full-width email, sticky footer, max height 100dvh − 96. Success appears only after the server confirms the persisted artifact (persistence repair #1657).',
    body: [
      section('01', 'FORM STATES', row(D('ol=OL-01', { scale: fit(3, 1440), title: 'FORM · FOCUS IN EMAIL', chips: R }), D('ol=OL-01&os=error', { scale: fit(3, 1440), title: 'VALIDATION', chips: chips(R, S.open('U-2 COPY')) }), D('ol=OL-01&os=duplicate', { scale: fit(3, 1440), title: 'DUPLICATE NOTICE (CLIENT-SIDE)', chips: chips(R, S.backend('G-11')) }))),
      section('02', 'SUBMISSION', row(D('ol=OL-01&os=submitting', { scale: fit(3, 1440), title: 'SUBMITTING · FIELDS LOCKED', chips: R }), D('ol=OL-01&os=failed', { scale: fit(3, 1440), title: 'NOT CREATED · RETRY KEEPS ENTRIES', chips: R }), D('ol=OL-02', { scale: fit(3, 1440), title: 'CONFIRMED · ROW ALREADY IN PLACE', chips: R })) + callout('<b>Order of events (unchanged contract):</b> CREATE → `create-artifact` → server confirms durable write → dialog becomes LINK READY and the registry refreshes. A timeout or 5xx never shows LINK READY; it shows NOT CREATED with RETRY.', W)),
      section('03', 'AT 1280 AND 1920', row(vp({ w: 1280, h: 800, q: 'ol=OL-01', scale: fit(2, 1280), title: '1280 × 800', chips: R }), vp({ w: 1920, h: 1080, q: 'ol=OL-01', scale: fit(2, 1920), title: '1920 × 1080 · DIALOG STAYS 600', chips: R }))),
    ],
  }),
  D05: () => ({
    num: 'D05', title: 'Client record · desktop', tier: 'HORIZONTAL JOURNEY · RELAXED',
    sub: 'Header (plate, name, category, email) with actions on the same baseline; the eight-phase journey as a fixed-rhythm strip (max 1180, nodes never stretched); section tabs; content left, context column right.',
    body: [
      section('01', 'RECORD · 1440 × 900', row(D('page=record', { title: 'OVERVIEW SECTION · MAIN + 360 CONTEXT COLUMN', chips: chips(R, S.illus()) }))),
      section('02', 'SCROLLED + OTHER WIDTHS', row(D('page=record&scroll=420', { scale: fit(3, 1440), title: '1440 · SCROLLED', chips: R }), vp({ w: 1280, h: 800, q: 'page=record', scale: fit(3, 1280), title: '1280 × 800', chips: R }), vp({ w: 1920, h: 1080, q: 'page=record', scale: fit(3, 1920), title: '1920 · JOURNEY BESIDE STATUS', chips: R }))),
      section('03', 'RECORD MENU', row(D('page=record&ol=OL-06', { scale: fit(2, 1440), title: 'MORE · SAME ROW-ACTION FAMILY', chips: chips(R, S.backend('G-05 · G-06')) }), D('page=record&sec=6', { scale: fit(2, 1440), title: 'OTHER SECTIONS SHARE THE TWO-ZONE LAYOUT', chips: R }))),
    ],
  }),
  D06: () => ({
    num: 'D06', title: 'Client intake + recommendations · desktop', tier: 'RECORD SECTIONS 02 · 03',
    sub: 'Submitted answers in grouped two-column definition grids (≥ 760 px), case-sensitive values untransformed; the automated recommendation as a reasoned list with the manual-review item flagged.',
    body: [
      section('01', 'INTAKE ANSWERS', row(D('page=record&sec=1', { scale: fit(2, 1440), title: '1440 · TWO-COLUMN GROUPS', chips: R }), vp({ w: 1920, h: 1080, q: 'page=record&sec=1', scale: fit(2, 1920), title: '1920', chips: R }))),
      section('02', 'RECOMMENDATIONS', row(D('page=record&sec=2', { scale: fit(2, 1440), title: '1440 · REASONS UNDER EACH ITEM', chips: R }), vp({ w: 1280, h: 800, q: 'page=record&sec=2', scale: fit(2, 1280), title: '1280', chips: R }))),
    ],
  }),
  D07: () => ({
    num: 'D07', title: 'Client quote · desktop', tier: 'DISPLAY ONLY · CALCULATIONS UNCHANGED',
    sub: 'Quote lines in a real table with right-aligned tabular amounts; the decision column beside it. Amounts come from the quote record; this surface never recalculates.',
    body: [
      section('01', 'QUOTE SECTION', row(D('page=record&sec=3', { title: '1440 · TABLE + 320 DECISION COLUMN', chips: chips(R, S.illus()) }))),
      section('02', 'APPROVE + REVISE', row(D('ol=OL-08', { scale: fit(2, 1440), title: 'APPROVE · DIALOG 500', chips: R }), D('ol=OL-09', { scale: fit(2, 1440), title: 'REVISE · DIALOG 720', chips: chips(R, S.backend('G-04 PERSISTENCE')) }))),
    ],
  }),
  D08: () => ({
    num: 'D08', title: 'Reviews queue · desktop', tier: 'WORKBENCH · QUEUE / CONTEXT / DECISION',
    sub: 'Three panes from stage 1160 (1440 and up): queue 280–320, context fluid, decision 320–360. Between 920 and 1159 (1280, 1366) the decision docks as a compact footer of the context pane.',
    body: [
      section('01', 'THREE PANES · 1440 × 900', row(D('page=reviews', { title: 'INTAKE REVIEW SELECTED', chips: chips(R, S.open('FD-W15 NO REJECT')) }))),
      section('02', 'NARROWER + WIDER', row(vp({ w: 1280, h: 800, q: 'page=reviews', scale: fit(2, 1280), title: '1280 · DECISION AS CONTEXT FOOTER', chips: R }), vp({ w: 1920, h: 1080, q: 'page=reviews', scale: fit(2, 1920), title: '1920 · THREE PANES', chips: R }))),
      section('03', 'OTHER ITEMS', row(D('page=reviews&sel=3', { scale: fit(2, 1440), title: 'EXCEPTION', chips: R }), D('page=reviews&sel=2', { scale: fit(2, 1440), title: 'CLIENT REQUEST', chips: R }))),
    ],
  }),
  D09: () => ({
    num: 'D09', title: 'Review detail · desktop', tier: 'DECISION STATES',
    sub: 'The same workbench, read for the decision itself: quote context, revision request with a note, saving, and a failed save that keeps the note.',
    body: [
      section('01', 'QUOTE REVIEW', row(D('page=reviews&sel=1', { title: 'QUOTE CONTEXT · AMOUNTS FROM THE RECORD', chips: R }))),
      section('02', 'DECISION STATES', row(D('page=reviews&state=revise', { scale: fit(3, 1440), title: 'REQUEST REVISION + NOTE (OL-11 INLINE)', chips: R }), D('page=reviews&state=saving', { scale: fit(3, 1440), title: 'SAVING…', chips: R }), D('page=reviews&state=error', { scale: fit(3, 1440), title: 'NOT SAVED · NOTE KEPT', chips: chips(R, S.backend('G-04')) }))),
    ],
  }),
  D10: () => ({
    num: 'D10', title: 'Operations · desktop', tier: 'PRODUCTION WORKBENCH · NO KANBAN',
    sub: 'Runbooks (left) → the selected runbook’s stage rail and task table (centre) → completion gate, client actions and verification (right at stage ≥ 1440, a three-up row beneath below that).',
    body: [
      section('01', 'WORKBENCH · 1440 × 900', row(D('page=operations', { title: 'STAGE 1216 · RUNBOOKS + MAIN, CONTEXT ROW BENEATH', chips: chips(R, S.backend('G-04 OPS PERSISTENCE')) }))),
      section('02', 'WIDE + TASK INSPECTOR', row(vp({ w: 1920, h: 1080, q: 'page=operations', scale: fit(2, 1920), title: '1920 · THREE COLUMNS', chips: R }), D('page=operations&insp=task', { scale: fit(2, 1440), title: 'TASK DETAIL (OL-12) · INSPECTOR', chips: R }))),
      section('03', 'TASK OVERLAYS', row(D('ol=OL-13', { scale: fit(2, 1440), title: 'SET BLOCKER', chips: R }), D('ol=OL-10', { scale: fit(2, 1440), title: 'MARK COMPLETE · GATE OPEN', chips: chips(R, S.open('FD-W17')) }))),
    ],
  }),
  D11: () => ({
    num: 'D11', title: 'Correspondence · desktop', tier: 'INDEX / THREAD / CONTEXT',
    sub: 'Thread index, a reading column capped at 68ch (messages never span the stage), and client context with the send policy. Lifecycle email is a table, not a feed.',
    body: [
      section('01', 'MESSAGES · 1440 × 900', row(D('page=correspondence', { title: 'THREE PANES · READING WIDTH 68CH', chips: chips(R, S.illus()) }))),
      section('02', 'LIFECYCLE + PREVIEW', row(D('page=lifecycle', { scale: fit(2, 1440), title: 'LIFECYCLE EMAIL · DRY RUN', chips: chips(R, S.backend('G-09')) }), D('page=lifecycle&insp=email', { scale: fit(2, 1440), title: 'EMAIL PREVIEW · SEND DISABLED BY POLICY', chips: chips(R, S.open('FD-W16')) }))),
      section('03', 'WIDE', row(vp({ w: 1920, h: 1080, q: 'page=correspondence', scale: fit(1, 1920), title: '1920 · THE THREAD STAYS 68CH, CENTRED', chips: R }))),
    ],
  }),
  D12: () => ({
    num: 'D12', title: 'System · desktop', tier: 'COMPACT CONSOLE',
    sub: 'Verdict band, then a status-first console: one row per module (MODULE / STATUS / AREA / DETAIL / CHECKED), ordered by severity. Rows are 44 px, not cards. Detail opens in the inspector; environment values are names only.',
    body: [
      section('01', 'CONSOLE · 1440 × 900', row(D('page=system', { title: 'COMPACT DENSITY · STATUS FIRST', chips: chips(R, S.backend('G-08 PROBES')) }))),
      section('02', 'MODULE DETAIL + WIDTHS', row(D('page=system&insp=module', { scale: fit(2, 1440), title: 'MODULE DETAIL (OL-16) · CONSOLE COMPACTS', chips: R }), vp({ w: 1920, h: 1080, q: 'page=system', scale: fit(2, 1920), title: '1920 · ATTENTION ORDER BESIDE', chips: R }))),
    ],
  }),
  D13: () => ({
    num: 'D13', title: 'System test lab · desktop', tier: 'COMPACT · SYNTHETIC ONLY',
    sub: 'Four panels on an auto grid (2 → 3 columns): synthetic client, journey steps (existing actions only), email events, continuity checks (UNVERIFIED until probes exist).',
    body: [
      section('01', 'TEST LAB · 1440 × 900', row(D('page=testlab', { title: 'TWO-COLUMN PANELS', chips: chips(R, S.open('FD-W18'), S.backend('G-09')) }))),
      section('02', 'GATED ACTIONS', row(D('ol=OL-15', { scale: fit(2, 1440), title: 'SEND TEST · APPROVAL TICK', chips: chips(R, S.open('FD-W16')) }), D('ol=OL-17', { scale: fit(2, 1440), title: 'RESET · TYPE RESET', chips: R }))),
      section('03', 'WIDE', row(vp({ w: 1920, h: 1080, q: 'page=testlab', scale: fit(1, 1920), title: '1920 · THREE COLUMNS', chips: R }))),
    ],
  }),
  D14: () => ({
    num: 'D14', title: 'Global overlays · desktop', tier: '20 FAMILIES + FEEDBACK',
    sub: 'Every overlay family at 1440 × 900 in its desktop container (dialog, popover, palette, inspector, inline, toast). Phone variants (approved direction) follow for comparison.',
    body: [
      section('01', 'DESKTOP · 1440 × 900', row(...[...OL_IDS, 'TOAST'].map((k) => D(`ol=${k}`, { scale: fit(3, 1440), title: `${k} · ${FAMILY_NAMES[k]}`, chips: k === 'OL-03' ? S.open('N/A · SIDEBAR') : R })))),
      section('02', 'PHONE · 390 × 844', row(...[...OL_IDS, 'TOAST'].map((k) => vp({ w: 390, h: 844, q: `ol=${k}`, scale: fit(7, 390), title: k, chips: '' })))),
    ],
  }),
  D15: () => ({
    num: 'D15', title: 'Component system · desktop', tier: 'MEASURED AT 1440 AND 1920',
    sub: 'The component gallery rendered by the same stylesheet at two desktop widths; every type sample prints its computed size, weight and tracking from the live page.',
    body: [
      section('01', '1440 × 1800 (TALL CAPTURE OF A 1440 VIEWPORT)', row(vp({ w: 1440, h: 1800, q: 'page=components', title: 'GALLERY · D TIER', chips: chips(R, S.measured()), label: 'DESKTOP · 1440 WIDE · D · TALL CAPTURE' }))),
      section('02', '1920 · UW TIER', row(vp({ w: 1920, h: 1500, q: 'page=components&set=type,buttons,status', scale: fit(1, 1920), title: 'TYPE + BUTTONS + STATUS', chips: chips(R, S.measured()), label: 'WIDE · 1920 · UW · TALL CAPTURE' }))),
    ],
  }),

  // ═══ TABLET PORTRAIT 768–1023 ════════════════════════════════════════════
  TP01: () => tp('TP01', 'Global shell · tablet portrait', 'Labelled 80 px rail (icon + word, 10 px) instead of a squeezed sidebar; search collapses to an icon; the inspector is a right sheet (≤ 420) over a scrim; the workspace menu is a left drawer.', [
    section('01', 'RAIL GRAMMAR', `<div style="display:flex;gap:22px;align-items:flex-start">${zones(834, Z[834], 700)}${note('768–1023: one working column. Selections open as a right sheet; record and review detail are pushed pages with a sticky action bar. Touch targets ≥ 44 px; rail items 72 × 58.', 700)}</div>`, R),
    section('02', 'THREE PORTRAIT TABLETS', row(at(768, 1024, 'page=overview', 3, { title: '768 × 1024', chips: R }), at(820, 1180, 'page=overview', 3, { title: '820 × 1180', chips: R }), at(834, 1112, 'page=overview', 3, { title: '834 × 1112', chips: R }))),
    section('03', 'MENU, SEARCH, ACCOUNT', row(at(834, 1112, 'ol=OL-03', 3, { title: 'WORKSPACE MENU · LEFT DRAWER', chips: R }), at(834, 1112, 'ol=OL-04', 3, { title: 'SEARCH · KEYBOARD OPEN', chips: R }), at(834, 1112, 'ol=OL-18', 3, { title: 'ACCOUNT · POPOVER FROM RAIL', chips: R }))),
  ]),
  TP02: () => tp('TP02', 'Overview · tablet portrait', 'Focus full width, the 4-up signal strip, then NEEDS YOU beside RECENT MOVEMENT, then active work in the three-column registry variant.', [
    section('01', '834 × 1112', row(at(834, 1112, 'page=overview', 2, { title: 'TOP', chips: R }), at(834, 1112, 'page=overview&scroll=760', 2, { title: 'SCROLLED', chips: R }))),
    section('02', '768 × 1024', row(at(768, 1024, 'page=overview', 3, { title: '768', chips: R }), at(768, 1024, 'page=overview&st=empty', 3, { title: 'EMPTY', chips: R }), at(768, 1024, 'page=overview&st=error-detail', 3, { title: 'ERROR', chips: R }))),
  ]),
  TP03: () => tp('TP03', 'Foundations · tablet portrait', 'CLIENT / STATUS / NEXT ACTION. Status carries the phase segments and last activity so nothing is clipped; the preview opens as a right sheet.', [
    section('01', 'REGISTRY', row(at(834, 1112, 'page=foundations', 2, { title: '834 · THREE COLUMNS', chips: R }), at(834, 1112, 'page=foundations&sel=0&insp=client', 2, { title: 'PREVIEW · RIGHT SHEET (OL-19)', chips: R }))),
    section('02', 'SEARCH + FILTER', row(at(768, 1024, 'page=foundations&st=search&kb=', 3, { title: 'SEARCH · KEYBOARD OPEN', chips: R }), at(768, 1024, 'ol=OL-07', 3, { title: 'FILTER POPOVER', chips: R }), at(768, 1024, 'ol=OL-06', 3, { title: 'ROW ACTIONS', chips: chips(R, S.backend('G-05')) }))),
  ]),
  TP04: () => tp('TP04', 'Create client · tablet portrait', 'The desktop dialog at min(560, 100vw − 48), anchored above the software keyboard (max-height 100dvh − 64 − keyboard).', [
    section('01', 'DIALOG', row(at(834, 1112, 'ol=OL-01', 3, { title: 'FORM', chips: R }), at(834, 1112, 'ol=OL-01&kb=398', 3, { title: 'KEYBOARD OPEN · LIFTS + SCROLLS', chips: R }), at(834, 1112, 'ol=OL-02', 3, { title: 'CONFIRMED', chips: R }))),
    section('02', '768', row(at(768, 1024, 'ol=OL-01&os=error', 3, { title: 'VALIDATION', chips: R }), at(768, 1024, 'ol=OL-01&os=submitting', 3, { title: 'SUBMITTING', chips: R }), at(768, 1024, 'ol=OL-01&os=failed', 3, { title: 'NOT CREATED', chips: R }))),
  ]),
  TP05: () => tp('TP05', 'Client record · tablet portrait', 'Condensed journey (abbreviated phase labels, dates kept), actions wrap under the name, the context column moves below the section content.', [
    section('01', 'SECTIONS', row(at(834, 1112, 'page=record', 3, { title: 'OVERVIEW', chips: R }), at(834, 1112, 'page=record&sec=1', 3, { title: 'INTAKE', chips: R }), at(834, 1112, 'page=record&sec=3', 3, { title: 'QUOTE', chips: R }))),
    section('02', '768 + DECISION', row(at(768, 1024, 'page=record&sec=2', 3, { title: 'RECOMMENDATIONS', chips: R }), at(768, 1024, 'ol=OL-08', 3, { title: 'APPROVE QUOTE · DIALOG', chips: R }), at(768, 1024, 'page=record&scroll=700', 3, { title: 'CONTEXT BELOW', chips: R }))),
  ]),
  TP06: () => tp('TP06', 'Reviews · tablet portrait', 'Queue → opened item (pushed) with a sticky action bar. REQUEST REVISION opens the note sheet; the keyboard never covers the CTA.', [
    section('01', 'QUEUE → DETAIL', row(at(834, 1112, 'page=reviews', 3, { title: 'QUEUE', chips: R }), at(834, 1112, 'page=reviews&detail=1', 3, { title: 'DETAIL + STICKY BAR', chips: R }), at(834, 1112, 'page=reviews&detail=1&sel=1', 3, { title: 'QUOTE DETAIL', chips: R }))),
    section('02', 'REVISION NOTE', row(at(768, 1024, 'ol=OL-11', 3, { title: 'NOTE SHEET · KEYBOARD', chips: R }), at(768, 1024, 'page=reviews&detail=1&sel=3', 3, { title: 'EXCEPTION', chips: R }))),
  ]),
  TP07: () => tp('TP07', 'Operations · tablet portrait', 'Runbooks become a horizontal card strip; the stage rail shows numbers only (names in the current stage heading); task status stacks under the mode.', [
    section('01', 'WORKBENCH', row(at(834, 1112, 'page=operations', 3, { title: '834', chips: R }), at(834, 1112, 'page=operations&insp=task', 3, { title: 'TASK · RIGHT SHEET', chips: R }), at(768, 1024, 'ol=OL-13', 3, { title: 'SET BLOCKER', chips: R }))),
  ]),
  TP08: () => tp('TP08', 'Correspondence · tablet portrait', 'Thread index → thread (pushed). The composer stays above the keyboard; message width stays within 68ch.', [
    section('01', 'INDEX → THREAD', row(at(834, 1112, 'page=correspondence', 3, { title: 'INDEX', chips: R }), at(834, 1112, 'page=correspondence&detail=1', 3, { title: 'THREAD', chips: R }), at(834, 1112, 'ol=OL-14', 3, { title: 'COMPOSE · KEYBOARD OPEN', chips: R }))),
    section('02', 'LIFECYCLE', row(at(768, 1024, 'page=lifecycle', 2, { title: 'LIFECYCLE TABLE · SCROLLS INSIDE ITS PANEL', chips: R }), at(768, 1024, 'page=lifecycle&insp=email', 2, { title: 'EMAIL PREVIEW · SHEET', chips: R }))),
  ]),
  TP09: () => tp('TP09', 'System · tablet portrait', 'The console keeps one row per module (icon · module + detail · status); module detail opens as a right sheet; the test lab is one column.', [
    section('01', 'CONSOLE', row(at(834, 1112, 'page=system', 3, { title: 'CONSOLE', chips: R }), at(834, 1112, 'page=system&insp=module', 3, { title: 'MODULE · SHEET', chips: R }), at(834, 1112, 'page=testlab', 3, { title: 'TEST LAB', chips: R }))),
  ]),
  TP10: () => tp('TP10', 'Global overlays · tablet portrait', 'All 20 families at 834 × 1112: dialogs centred, popovers anchored to their trigger, inspector content as a right sheet, palette top-centred.', [
    section('01', '834 × 1112', row(...[...OL_IDS, 'TOAST'].map((k) => at(834, 1112, `ol=${k}`, 5, { title: `${k} · ${FAMILY_NAMES[k]}`, chips: '' })))),
  ]),

  // ═══ TABLET LANDSCAPE 1024–1279 ══════════════════════════════════════════
  TL01: () => tl('TL01', 'Global shell · tablet landscape', 'Rail + stage. Landscape height (768–834) triggers the short header (title 44). At 1194 the inspector docks (stage 774 ≥ 680); at 1024 it is a sheet. Split View falls back to the portrait or phone grammar by width.', [
    section('01', 'GRID', `<div style="display:flex;gap:22px;align-items:flex-start">${zones(1024, Z[1024], 700)}${zones(1194, Z[1194], 700)}</div>`, R),
    section('02', 'TWO LANDSCAPE TABLETS', row(at(1024, 768, 'page=overview', 2, { title: '1024 × 768', chips: R }), at(1194, 834, 'page=overview', 2, { title: '1194 × 834', chips: R }))),
    section('03', 'SPLIT VIEW (ILLUSTRATIVE WIDTHS)', row(vp({ w: 782, h: 834, q: 'page=foundations', scale: 0.6, title: '2/3 SPLIT · 782 → PORTRAIT GRAMMAR', chips: R }), vp({ w: 593, h: 834, q: 'page=foundations', scale: 0.6, title: '1/2 SPLIT · 593 → PHONE GRAMMAR', chips: R }), vp({ w: 390, h: 834, q: 'page=foundations', scale: 0.6, title: '1/3 SLIDE OVER · 390', chips: R }))),
  ]),
  TL02: () => tl('TL02', 'Overview · tablet landscape', 'Stage 944 at 1024: the 7/5 desktop composition with the short header, so the focus and queue sit above the fold.', [
    section('01', 'LANDSCAPE', row(at(1024, 768, 'page=overview', 2, { title: '1024 × 768', chips: R }), at(1194, 834, 'page=overview', 2, { title: '1194 × 834', chips: R }))),
    section('02', 'SCROLLED', row(at(1024, 768, 'page=overview&scroll=420', 2, { title: '1024 · WORK + MOVEMENT', chips: R }), at(1194, 834, 'page=overview&st=loading', 2, { title: 'LOADING', chips: R }))),
  ]),
  TL03: () => tl('TL03', 'Foundations · tablet landscape', 'At 1024 the full five-column registry fits (stage 944); at 1194 with the inspector docked it becomes CLIENT / STATUS / NEXT ACTION — no clipped toolbar, no crushed search (OPUS1 defect P-07).', [
    section('01', 'REGISTRY', row(at(1024, 768, 'page=foundations', 2, { title: '1024 · FIVE COLUMNS', chips: R }), at(1194, 834, 'page=foundations&sel=0&insp=client', 2, { title: '1194 · INSPECTOR DOCKED', chips: R }))),
    section('02', 'SHEET + MENUS', row(at(1024, 768, 'page=foundations&sel=0&insp=client', 3, { title: '1024 · PREVIEW AS SHEET', chips: R }), at(1024, 768, 'ol=OL-07', 3, { title: 'FILTER', chips: R }), at(1194, 834, 'ol=OL-06', 3, { title: 'ROW ACTIONS', chips: R }))),
  ]),
  TL04: () => tl('TL04', 'Create client · tablet landscape', 'Dialog 600 with the keyboard: on a 768-tall landscape screen the keyboard leaves ~370 px, so the dialog body scrolls under a sticky header and footer.', [
    section('01', 'DIALOG', row(at(1024, 768, 'ol=OL-01', 3, { title: 'FORM', chips: R }), at(1024, 768, 'ol=OL-01&kb=398', 3, { title: 'KEYBOARD OPEN', chips: R }), at(1194, 834, 'ol=OL-02', 3, { title: 'CONFIRMED', chips: R }))),
  ]),
  TL05: () => tl('TL05', 'Client record · tablet landscape', 'Full journey labels return at stage ≥ 920; the context column sits beside the content (300–360).', [
    section('01', 'RECORD', row(at(1024, 768, 'page=record', 2, { title: '1024 · TWO ZONES', chips: R }), at(1194, 834, 'page=record&sec=3', 2, { title: '1194 · QUOTE', chips: R }))),
    section('02', 'SECTIONS', row(at(1024, 768, 'page=record&sec=1', 2, { title: 'INTAKE', chips: R }), at(1024, 768, 'page=record&sec=2', 2, { title: 'RECOMMENDATIONS', chips: R }))),
  ]),
  TL06: () => tl('TL06', 'Reviews · tablet landscape', 'Two panes: queue | context, with the decision docked as a compact footer (choices side by side, one-line note, CTA).', [
    section('01', 'WORKBENCH', row(at(1024, 768, 'page=reviews', 2, { title: '1024 · QUEUE | CONTEXT + DECISION FOOTER', chips: R }), at(1194, 834, 'page=reviews&sel=1', 2, { title: '1194 · QUOTE', chips: R }))),
    section('02', 'STATES', row(at(1024, 768, 'page=reviews&state=revise', 3, { title: 'REVISION NOTE', chips: R }), at(1024, 768, 'page=reviews&state=saving', 3, { title: 'SAVING', chips: R }), at(1024, 768, 'page=reviews&state=error', 3, { title: 'NOT SAVED', chips: R }))),
  ]),
  TL07: () => tl('TL07', 'Operations · tablet landscape', 'Runbooks | main; gate, client actions and verification as a three-up row under the tasks.', [
    section('01', 'WORKBENCH', row(at(1024, 768, 'page=operations', 2, { title: '1024', chips: R }), at(1194, 834, 'page=operations&insp=task', 2, { title: '1194 · TASK INSPECTOR DOCKED', chips: R }))),
    section('02', 'OVERLAYS', row(at(1024, 768, 'ol=OL-13', 2, { title: 'SET BLOCKER', chips: R }), at(1024, 768, 'ol=OL-10', 2, { title: 'MARK COMPLETE', chips: R }))),
  ]),
  TL08: () => tl('TL08', 'Correspondence · tablet landscape', 'Index | thread; client context moves into the thread header link at this width.', [
    section('01', 'TWO PANES', row(at(1024, 768, 'page=correspondence', 2, { title: '1024', chips: R }), at(1194, 834, 'page=correspondence', 2, { title: '1194', chips: R }))),
    section('02', 'LIFECYCLE', row(at(1024, 768, 'page=lifecycle', 2, { title: 'LIFECYCLE', chips: R }), at(1194, 834, 'page=lifecycle&insp=email', 2, { title: 'PREVIEW DOCKED', chips: R }))),
  ]),
  TL09: () => tl('TL09', 'System · tablet landscape', 'The full console row template appears from 960 px of console width (1024 without inspector).', [
    section('01', 'CONSOLE', row(at(1024, 768, 'page=system', 2, { title: '1024 · FULL CONSOLE', chips: R }), at(1194, 834, 'page=system&insp=module', 2, { title: '1194 · DETAIL DOCKED · CONSOLE COMPACTS', chips: R }))),
    section('02', 'TEST LAB', row(at(1024, 768, 'page=testlab', 2, { title: 'TEST LAB', chips: R }), at(1024, 768, 'ol=OL-17', 2, { title: 'RESET', chips: R }))),
  ]),
  TL10: () => tl('TL10', 'Global overlays · tablet landscape', 'All 20 families at 1024 × 768 — the shortest supported tablet height.', [
    section('01', '1024 × 768', row(...[...OL_IDS, 'TOAST'].map((k) => at(1024, 768, `ol=${k}`, 4, { title: `${k} · ${FAMILY_NAMES[k]}`, chips: '' })))),
  ]),

  // ═══ COMPARISON ═════════════════════════════════════════════════════════
  C01: () => ({
    num: 'C01', title: 'Desktop before / after', tier: 'OPUS1 → OPUS2 AT 1440 × 900',
    sub: 'Left: the OPUS1 board frame. Right: the OPUS2 specimen at the same viewport. Defect codes refer to DESKTOP_PROPORTION_AUDIT.md.',
    body: [
      ['overview-1440', 'page=overview', 'OVERVIEW', 'P-01 inverse type scale · P-04 stacked hero · P-10 registry below the fold'],
      ['overview-1440-insp', 'page=overview&sel=1&insp=client', 'OVERVIEW + INSPECTOR', 'P-07 crushed signals · P-06 wrapped labels'],
      ['registry-1440', 'page=foundations', 'FOUNDATIONS', 'P-02 8.5 px table text · P-09 58 px rows for 2 lines of 8 px'],
      ['record-1440', 'page=record', 'CLIENT RECORD', 'P-05 stretched journey · P-10 dead stage below the fold'],
      ['record-1440-insp', 'page=record&insp=review', 'RECORD + INSPECTOR', 'P-06 email broken mid-token'],
      ['reviews-1440', 'page=reviews', 'REVIEWS', 'P-04 table + inspector instead of a workbench'],
      ['operations-1440', 'page=operations', 'OPERATIONS', 'P-07 segmented control over the heading'],
      ['system-1440', 'page=system', 'SYSTEM', 'P-03 module cards at equal weight · P-02 7.5 px'],
    ].map(([b, q, t, d], i) => section(String(i + 1).padStart(2, '0'), t, row(img({ src: `./before/${b}.jpg`, w: 1440, h: 900, scale: fit(2, 1440), title: 'OPUS1', chips: S.before(), label: 'DESKTOP · 1440 × 900 · OPUS1' }), D(q, { scale: fit(2, 1440), title: 'OPUS2', chips: S.after() })) + note(`<b>${d}</b>`, W))),
  }),
  C02: () => ({
    num: 'C02', title: 'Tablet portrait + landscape', tier: 'OPUS1 → OPUS2',
    sub: 'OPUS1 drew one tablet frame per orientation. OPUS2 gives each orientation its own grammar and verifies it across the three portrait and two landscape sizes.',
    body: [
      section('01', 'PORTRAIT 834 × 1112', row(img({ src: './before/tablet-834.jpg', w: 834, h: 1112, scale: fit(2, 834), title: 'OPUS1 · TABLE CLIPPED AT RIGHT', chips: S.before(), label: 'TABLET · 834 × 1112 · OPUS1' }), at(834, 1112, 'page=overview', 2, { title: 'OPUS2', chips: S.after() }))),
      section('02', 'LANDSCAPE 1194 × 834', row(img({ src: './before/tablet-1194.jpg', w: 1194, h: 834, scale: fit(2, 1194), title: 'OPUS1 · SEARCH CRUSHED · SORT + COLUMNS CLIPPED', chips: S.before(), label: 'TABLET · 1194 × 834 · OPUS1' }), at(1194, 834, 'page=foundations&sel=0&insp=client', 2, { title: 'OPUS2', chips: S.after() }))),
      section('03', 'ALL TABLET SIZES · FOUNDATIONS', row(...[[768, 1024], [820, 1180], [834, 1112], [1024, 768], [1194, 834]].map(([w, h]) => vp({ w, h, q: 'page=foundations', scale: 0.32, title: `${w} × ${h}`, chips: '' })))),
    ],
  }),
  C03: () => ({
    num: 'C03', title: 'Typographic reflow', tier: 'ONE SCALE, FIVE TIERS',
    sub: 'The same gallery measured live at 390, 834, 1440 and 1920: type grows modestly with the tier, labels never drop below 10 px (phone) / 11 px (tablet, desktop), and tracking tightens as size grows. Wrapping is fixed with columns and policies, not by shrinking type.',
    body: [
      section('01', 'TYPE SCALE · MEASURED', row(...[[390, 844], [834, 1112], [1440, 900], [1920, 1080]].map(([w, h]) => vp({ w, h: Math.round(h * 1.15), q: 'page=components&set=type', scale: [0.75, 0.42, 0.3, 0.22][[390, 834, 1440, 1920].indexOf(w)], title: `${w}`, chips: S.measured(), label: `${w} WIDE · ${['M', 'TP', 'D', 'UW'][[390, 834, 1440, 1920].indexOf(w)]}` })))),
      section('02', 'REGISTRY ROW ACROSS THE 16 VIEWPORTS', row(...[[320, 700], [375, 812], [390, 844], [430, 932], [768, 1024], [820, 1180], [834, 1112], [1024, 768]].map(([w, h]) => vp({ w, h, q: 'page=foundations', scale: 0.2, title: `${w}`, chips: '' }))) + row(...[[1194, 834], [1280, 800], [1366, 768], [1440, 900], [1600, 900], [1920, 1080], [2560, 1440], [3440, 1440]].map(([w, h]) => vp({ w, h, q: 'page=foundations', scale: Math.min(0.2, 330 / w), title: `${w}`, chips: '' })))),
    ],
  }),
  C04: () => ({
    num: 'C04', title: 'Component proportions', tier: 'OPUS1 → OPUS2 COMPONENTS',
    sub: 'Component-level corrections. Left: OPUS1 desktop components (crops). Right: the OPUS2 gallery at 1440. Measured values are in COMPONENT_VARIANT_MATRIX.md.',
    body: [
      section('01', 'GALLERY · 1440', row(vp({ w: 1440, h: 1800, q: 'page=components&set=buttons,status,ident,nav,fields,density', scale: fit(1, 1440), title: 'OPUS2 COMPONENTS', chips: chips(S.after(), S.measured()), label: 'DESKTOP · 1440 WIDE · TALL CAPTURE' }))),
      section('02', 'THE CORRECTIONS', table(['COMPONENT', 'OPUS1 (DESKTOP)', 'OPUS2 (DESKTOP)', 'DEFECT'], [
        ['Page title', 'Display 68 px + hero object ≈ 200 px tall', 'Display 52 px (44 short-height) in a 112 px header; object ≤ 104 px', 'P-01 P-10'],
        ['Labels / meta', '7.5–9 px, 0.2–0.24 em', '11 px / 12 px, 0.16 / 0.10 em', 'P-02'],
        ['Buttons', '44 px block buttons, 10 px text', '40 px (34 sm, 30 xs), 12 px, width by content', 'P-03'],
        ['Registry row', '58 px, 8.5 px text, 7 fixed columns', '56 px two-line cells, 14 px, grid template per width', 'P-09 P-07'],
        ['Journey', 'Eight nodes spread across 1100 px', 'Max 1180, abbreviations below 920 stage', 'P-05'],
        ['Signals', '4 cells in half a column (labels wrap)', 'Full-width strip or 2 × 2 block beside the queue', 'P-04 P-06'],
        ['Sidebar', '232 px, 9 px labels, wrapped tool names', '224 / 248 px, 12 px, tools wrap by design', 'P-06'],
        ['Inspector', 'Fixed 392 / 360 regardless of stage', 'clamp(344, 24vw, 420); docks only if stage ≥ 680', 'P-07'],
      ], W)),
    ],
  }),
  C05: () => ({
    num: 'C05', title: 'Registry + inspector responsiveness', tier: '768 → 2560',
    sub: 'One registry, eight widths. The column set is chosen from the registry’s own width; the inspector docks from 1100; ultra-wide gains whitespace, not wider cells.',
    body: [
      section('01', 'WITH A SELECTION', row(...[[768, 1024], [1024, 768], [1194, 834], [1280, 800]].map(([w, h]) => vp({ w, h, q: 'page=foundations&sel=0&insp=client', scale: fit(4, w), title: `${w} × ${h} · ${w < 1100 ? 'SHEET' : 'DOCKED'}`, chips: '' })))),
      section('02', 'DESKTOP + ULTRA-WIDE', row(...[[1440, 900], [1920, 1080]].map(([w, h]) => vp({ w, h, q: 'page=foundations&sel=0&insp=client', scale: fit(2, w), title: `${w} × ${h}`, chips: '' }))) + row(...[[2560, 1440], [3440, 1440]].map(([w, h]) => vp({ w, h, q: 'page=foundations&sel=0&insp=client', scale: fit(2, w), title: `${w} × ${h} · CONTENT ≤ 1760`, chips: '' })))),
    ],
  }),
  C06: () => ({
    num: 'C06', title: 'Reviews workbench responsiveness', tier: '390 → 1920',
    sub: 'Phone and portrait: queue, then a pushed detail with a sticky decision bar. Stage 920–1159: queue | context with a decision footer. Stage ≥ 1160: queue | context | decision.',
    body: [
      section('01', 'ONE PANE', row(vp({ w: 390, h: 844, q: 'page=reviews', scale: 0.6, title: '390 · QUEUE', chips: '' }), vp({ w: 390, h: 844, q: 'page=reviews&detail=1', scale: 0.6, title: '390 · DETAIL', chips: '' }), vp({ w: 834, h: 1112, q: 'page=reviews&detail=1', scale: 0.455, title: '834 · DETAIL', chips: '' }))),
      section('02', 'TWO AND THREE PANES', row(...[[1024, 768], [1280, 800], [1440, 900], [1920, 1080]].map(([w, h]) => vp({ w, h, q: 'page=reviews', scale: fit(2, w), title: `${w} × ${h}`, chips: '' })))),
    ],
  }),
  C07: () => ({
    num: 'C07', title: 'System console responsiveness', tier: '390 → 3440',
    sub: 'Rows stay rows: icon · module · status on narrow widths; MODULE / STATUS / AREA / DETAIL / CHECKED from 960 px of console width; the attention order joins beside it on wide stages.',
    body: [
      section('01', 'NARROW', row(vp({ w: 390, h: 844, q: 'page=system', scale: 0.6, title: '390', chips: '' }), vp({ w: 834, h: 1112, q: 'page=system', scale: 0.455, title: '834', chips: '' }), vp({ w: 1194, h: 834, q: 'page=system&insp=module', scale: 0.48, title: '1194 · DETAIL DOCKED', chips: '' }))),
      section('02', 'WIDE', row(...[[1440, 900], [1920, 1080]].map(([w, h]) => vp({ w, h, q: 'page=system', scale: fit(2, w), title: `${w} × ${h}`, chips: '' }))) + row(vp({ w: 3440, h: 1440, q: 'page=system', scale: fit(1, 3440), title: '3440 × 1440 · CONTENT CAP 1760', chips: '' }))),
    ],
  }),
};

function tp(num, title, sub, body) {
  return { num, title, sub, body, tier: 'TABLET PORTRAIT 768–1023' };
}
function tl(num, title, sub, body) {
  return { num, title, sub, body, tier: 'TABLET LANDSCAPE 1024–1279' };
}

const b = BOARDS[id]();
mount(`${header({ num: b.num.replace(/^([A-Z]+)(\d+)$/, '$1-$2'), title: b.title, sub: b.sub, tier: b.tier })}${b.body.join('')}${foot(`BOARD ${b.num.replace(/^([A-Z]+)(\d+)$/, '$1-$2')} · ${b.title.toUpperCase()}`, 'OPUS2 · FOUNDER VISUAL REVIEW REQUIRED · PRODUCTION NOT AUTHORIZED')}`);
