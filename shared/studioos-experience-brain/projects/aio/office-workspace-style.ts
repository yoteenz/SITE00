/**
 * AIO OFFICE WORKSPACE STYLE — the locked design language of the four workspace proofs, and the material, motion and
 * detail pass that locked it (P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.MATERIAL-MOTION-AND-DETAIL-POLISH1).
 *
 * The founder found the four proofs "wayyy better" — simple but with personality and richness — and named what still
 * fell flat: the lower panels and tabs, the drawers and popups, text that overflowed or wrapped, and the missing panel
 * animation. This pass refines the same four directions (fleet = the vehicle, bookkeeping = the period, compliance = the
 * deadline, Client 360 = the business); it does not redesign them and does not expand them to other lanes.
 *
 * AIO_WS_STYLE is the specification every later workspace inherits: layout, hierarchy, responsive rules, type scale,
 * spacing, surfaces, gold, control states, panel and drawer geometry, motion durations and easing, reduced motion,
 * overflow and accessibility. It is a shared grammar, not permission for identical layouts, and it governs the AIO
 * OFFICE only — the public website keeps its own visual language. The tokens are the ones in fsbw
 * design-authority/aio-office/workspaces/ws.css; fsbw's evidence test holds the two together.
 */
import { AIO_WP_REVIEW_LINK } from './office-workspace-proofs.js';
import { AIO_UO_SECURITY_HANDOFF } from './office-unified-experience.js';

export const AIO_WSS_SPRINT = 'P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.MATERIAL-MOTION-AND-DETAIL-POLISH1';
export const AIO_WSS_DATE = '2026-10-08';
export const AIO_WSS_NEXT_GATE = 'FOUNDER REVIEW OF AIO OFFICE MATERIAL, MOTION AND DETAIL POLISH';
export const AIO_WSS_REVIEW_LINK = AIO_WP_REVIEW_LINK;
/** Where this pass started: the last pass of the four proofs. */
export const AIO_WSS_BASE = { site00: '89f59cd5', fsbw: '5d39f7bb' } as const;

export const AIO_WSS_STATUS = {
  language: 'LOCKED — the four directions are the AIO OFFICE workspace language; refined in place, not redesigned',
  proofs: 'FOUR WORKSPACE PROOFS POLISHED — CANDIDATES, AWAITING FOUNDER REVIEW',
  expansion: 'NOT STARTED — the style is not applied to any other lane or to the 619-page review in this pass',
  public_site: 'SEPARATE — this style governs AIO OFFICE workspaces only; the public AIO website keeps its own language',
  approved_roots: 'UNCHANGED — HOME · INTAKE · WORK · REPORTS · MORE (studio.js / studio.css byte-for-byte)',
  live_app: 'NOT CHANGED — nothing deployed; no business logic, schema, permission, migration or IFTA authority changed; Brokerage stays paused',
  security: `${AIO_UO_SECURITY_HANDOFF.length} PRIVACY GAPS STILL OPEN — separate Composer work; not resolved here`,
} as const;

export const AIO_WSS_FOUNDER_FEEDBACK = {
  liked: ['“wayyy better” — simple, with personality and richness', 'the buttons and the gold glow', 'Fleet and Client 360 strongest'],
  asked: [
    'Panel animations are the missing piece.',
    'As you scroll down to the panels / tabs it loses its impressiveness and richness; the other features fall flat.',
    'The drawers / popups can be enhanced.',
    'Some text alignment, size and wrapping is still off and overflowing or overlapping panels.',
    'Decrease text size enough that text fits on one row where that matters.',
  ],
  recording: 'NOT AVAILABLE — the founder’s mobile screen recording was not available to this work and was not inspected. The same states were captured directly instead: 79 states at four sizes in the text audit, and twelve interactions recorded with real clicks on the last pass and this one.',
} as const;

export const AIO_WSS_LOCATIONS = {
  style_tokens: 'fsbw all-in-one-enterprises/design-authority/aio-office/workspaces/ws.css (.ao-root tokens; MOTION, DRAWERS and CONTROLS · STATES layers)',
  motion_code: 'fsbw …/workspaces/ws-motion.js — the morph renderer (patch, do not redraw), segmented thumbs, drawer focus and Tab trap',
  text_audit: 'node design-authority/aio-office/workspaces/audit.mjs <dist> [out.json] — also run inside qa.mjs',
  recordings: 'node design-authority/aio-office/workspaces/record.mjs <dist> <outDir> [label] [ids] → fsbw AIO_OFFICE_WORKSPACE_PROOFS/recordings/',
  boards: 'node design-authority/aio-office/workspaces/polish-boards.mjs <lastPassDist> <thisPassDist> <recDir> → fsbw AIO_OFFICE_WORKSPACE_PROOFS/boards/polish-*.jpg',
  review_link: AIO_WSS_REVIEW_LINK,
  docs: 'docs/aio/office-workspace-style/ (SITE00, generated) · vendored to fsbw all-in-one-enterprises/docs/aio/office-workspace-style/',
} as const;

/* ═══════════════ THE STYLE (locked) ═══════════════ */

export interface WssToken { name: string; value: string; use: string; min?: number; max?: number }

/** Type scale (px at 1×). Never below 9. min / max are the brief’s ranges. */
export const AIO_WSS_TYPE: WssToken[] = [
  { name: '--fs-micro', value: '9px', use: 'letter-spaced labels: section labels, column heads, fact keys', min: 9, max: 10 },
  { name: '--fs-label', value: '10px', use: 'compact data labels and metadata', min: 10, max: 11 },
  { name: '--fs-row', value: '12px', use: 'row titles and table text', min: 11, max: 13 },
  { name: '--fs-body', value: '13px', use: 'panel body', min: 12, max: 14 },
  { name: '--fs-h', value: '17px', use: 'panel headings', min: 14, max: 18 },
];

/** Motion durations (ms) and easing. min / max are the brief’s ranges. */
export const AIO_WSS_MOTION: WssToken[] = [
  { name: '--m-micro', value: '130ms', use: 'press, hover, chip feedback', min: 100, max: 160 },
  { name: '--m-select', value: '190ms', use: 'tabs, selection, the segmented thumb', min: 150, max: 220 },
  { name: '--m-panel', value: '260ms', use: 'panel content settling, drawers entering', min: 200, max: 300 },
  { name: '--m-context', value: '320ms', use: 'larger context changes (a new truck, a new client) and the one selection echo', min: 220, max: 350 },
  { name: '--m-out', value: '200ms', use: 'anything leaving (drawer and scrim exit)', min: 150, max: 300 },
];
export const AIO_WSS_EASING: WssToken[] = [
  { name: '--ease-out', value: 'cubic-bezier(0.22, 0.9, 0.28, 1)', use: 'arrivals: settles without bounce' },
  { name: '--ease-in', value: 'cubic-bezier(0.4, 0, 0.9, 0.6)', use: 'departures' },
  { name: '--ease-std', value: 'cubic-bezier(0.3, 0.6, 0.2, 1)', use: 'colour, border and shadow changes' },
];
export const AIO_WSS_SURFACES: WssToken[] = [
  { name: '--paper', value: '#fffdf9', use: 'work surfaces: panels, drawers, rows' },
  { name: '--tint', value: '#fbf3e0', use: 'a selected row (with the gold bar)' },
  { name: '--rule', value: '#ece5d8', use: 'hairlines between rows' },
  { name: '--stage', value: '#141416', use: 'obsidian stages: the truck, the client plate, record and service plates, the confirm plate' },
  { name: '--stage-ink', value: '#f2e9d6', use: 'text on a stage' },
  { name: '--stage-mute', value: '#a59c8b', use: 'quiet text on a stage' },
];
export const AIO_WSS_ELEVATION: WssToken[] = [
  { name: '--e0', value: 'none', use: 'level 3 — inline: rows, facts, lists inside a panel' },
  { name: '--e1', value: '0 1px 0 rgba(255, 255, 255, 0.85) inset, 0 1px 2px rgba(48, 34, 12, 0.05), 0 8px 22px rgba(48, 34, 12, 0.06)', use: 'level 2 — panels on the page' },
  { name: '--e2', value: '0 1px 0 rgba(255, 255, 255, 0.85) inset, 0 3px 8px rgba(48, 34, 12, 0.08), 0 18px 40px rgba(48, 34, 12, 0.12)', use: 'raised: a panel that is being worked in' },
  { name: '--e-stage', value: '0 18px 40px rgba(20, 16, 10, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 0 0 1px #2c2a26', use: 'level 1 — the stage of each workspace' },
  { name: '--gold-edge', value: '0 0 0 1px rgba(231, 171, 60, 0.75), 0 6px 18px rgba(214, 150, 40, 0.22)', use: 'the one gold light: an active or selected object' },
];

export interface WssSection { id: string; title: string; rules: string[] }
export const AIO_WS_STYLE: WssSection[] = [
  { id: 'layout', title: 'Layout', rules: [
    'CHOOSE → WORK → ACT: a selector, a working stage and a context panel, shaped differently for each subject (a truck, a month, a calendar, a company). The same grammar never means the same layout.',
    'Desktop (1440 × 900) and ultra-wide (2560 × 1440) fit one screen; only lists scroll, inside their region. Tablet (834 × 1194) stacks the stage over the panel. Phone (390 × 844) is a strip of choices, the stage, then the work; detail opens in a drawer.',
    'Side gutter 16 px; 24 px on ultra-wide. Ultra-wide earns its width with more of the same subject (the month at a glance, a taller horizon, the case in three columns, the truck with its connections), never with stretched rows.',
  ] },
  { id: 'hierarchy', title: 'Visual hierarchy — three levels', rules: [
    'Level 1 · the stage: obsidian (--stage, --e-stage). One per workspace: the truck, the period rule, the horizon, the identity plate.',
    'Level 2 · panels: ivory (--paper, --e1), radius 12–16 px, a header that stays and a body that scrolls.',
    'Level 3 · inline: rows, facts and lists on --e0, separated by hairlines (--rule). Nested records keep a dark plate (type, company, title, status) so detail never drops to a plain list.',
  ] },
  { id: 'responsive', title: 'Responsive', rules: [
    'Each device is composed, not shrunk: phone strips and drawers, tablet stack, desktop three regions, ultra-wide more of the subject.',
    'Rows drawn to scroll sideways (the yard strip, the period strip, the phone service line, tab rows) carry an edge fade and keep the active choice in view; nothing else scrolls sideways.',
    'Phone tabs fit one row (EXPIRATIONS · DOT / SAFETY · AUDITS · CORRECTIVE); when they cannot, the row scrolls with a fade — never a clipped word.',
  ] },
  { id: 'type', title: 'Type scale', rules: [
    'Five sizes: 9 / 10 / 12 / 13 / 17 px (micro, label, row, body, heading); figures in condensed type sized by role, not by space.',
    'Single-line components stay on one line: tabs, chips, tags, readouts, buttons, status words, breadcrumbs, roster rows, truck tokens, plate titles.',
    'Truncation is the last resort: the full text stays on the element (title / aria-label) and in the record it opens.',
    'Headings may wrap to two balanced lines; rows clamp at two lines with the full text reachable. Uppercase everywhere (the uppercase law).',
  ] },
  { id: 'spacing', title: 'Spacing', rules: [
    'Rhythm 4 · 6 · 8 · 10 · 12 · 14 · 18 px; panels pad 14–18 px; drawer bodies 14 × 18 px; rows 9–11 px vertical.',
    'Related things touch (a plate and its record list 9–12 px apart); separate things breathe (14–18 px between regions).',
  ] },
  { id: 'surfaces', title: 'Surfaces and material', rules: [
    'Ivory to work on, obsidian for focus, gold for the path; hairlines for structure. Metal (--metal) only on the plate monogram and stage unit numbers.',
    'Three elevations (--e0 / --e1 / --e-stage) plus --e2 for a raised panel; one gold edge (--gold-edge). No new shadows per component.',
  ] },
  { id: 'gold', title: 'Gold rules', rules: [
    'Gold means ACTIVE · SELECTED · READY · NEXT · FOCUSED — nothing else. Never decoration, never a background wash.',
    'Glow is never the only signal: selection is also obsidian or a gold bar; focus is also a ring; status is a shape and a word.',
    'One gold primary action where the decision is made; everything else is quiet.',
  ] },
  { id: 'states', title: 'Control states (square-rounded)', rules: [
    'Hover: a warmer border (#d9b56a); gold buttons brighten slightly with a deeper shadow.',
    'Focus: a 2 px ring, #c98d1d on ivory and #f1c158 on obsidian, offset 2 px — visible on every control.',
    'Pressed: 1 px down (transform) — gold buttons press in (inset shadow).',
    'Loading: the button keeps its size and says WORKING with a small spinner; its neighbour is disabled. A simulated confirmation works for 420 ms, then applies.',
    'Disabled: 45 % opacity, no hover.',
    'Success: the record changes in place, the history gains a quietly tinted SIMULATED entry, and a toast says what happened.',
    'Selected segments: one obsidian thumb slides to the active choice (--m-select).',
  ] },
  { id: 'panels', title: 'Panel geometry and behaviour', rules: [
    'A panel keeps its position and height when its content changes; only the content settles in (6 px rise + fade, --m-panel). The whole screen never animates.',
    'The page is patched, not redrawn: rows, scroll position, focus and caret survive every change.',
    'Every lower panel keeps working below its focus: the rest of the step (bookkeeping), the trucks and documents a service touches (Client 360), what else is due for the client (compliance). No blank paper under the content.',
  ] },
  { id: 'drawers', title: 'Drawer and popup geometry', rules: [
    'Phone: a bottom sheet, max 86 % of the screen, 22 px top radius, a gold hairline at its leading edge, over a dimming scrim.',
    'A 42 px bar holds the grip and the 32 px close control, so the close button never sits on a title; the header stays, the body scrolls on its own (overscroll contained) and respects the safe area.',
    'Desktop and tablet: a contextual side panel; where a list is chosen from (the client directory on tablet), a side drawer min(360 px, 88 %).',
    'Behaviour: labelled modal dialog; focus moves in; Tab and Shift+Tab stay inside; Escape, the close button and a tap outside close it; the workspace behind is inert; focus returns to what opened it; a newer change always wins.',
    'The confirm popover is an obsidian plate opened where you pressed: the action, a SIMULATED tag, its effect, NOTHING IS SAVED OR SENT, CONFIRM and CANCEL.',
  ] },
  { id: 'motion', title: 'Motion', rules: [
    'Character: precise, soft, responsive, weighted. Durations micro 130 · select 190 · panel 260 · context 320 · exit 200 ms; one easing family, no bounce.',
    'Movement uses transform and opacity only; colour, border and shadow transition for state.',
    'A selection may echo once (a ring or a drawn leader); nothing loops, pulses, flashes, zooms or staggers.',
    'A drawer leaves before the page behind it changes (200 ms); taps are ignored only while it leaves, so nothing lands on a closing drawer. Decorative motion never blocks the next action.',
  ] },
  { id: 'reduced', title: 'Reduced motion', rules: [
    'prefers-reduced-motion (and the review’s REDUCE MOTION switch) sets every animation and transition to 1 ms: drawers appear and close at once, selections change instantly, the confirmation applies without the working wait, scrolling is instant.',
  ] },
  { id: 'overflow', title: 'Text overflow', rules: [
    'Never overflow a panel. The text audit fails QA on a wrapped single-line part, text clipped by its container, text over text, truncation without the full text, text under 9 px, or sideways scroll where none is drawn.',
    'Fix order: shorter wording that keeps the meaning (a status word before its reason), then the type scale, then layout; truncation last.',
  ] },
  { id: 'a11y', title: 'Accessibility', rules: [
    'Every control is reachable and pressable from the keyboard (non-button controls get role=button and a tab stop); tags and services carry aria-pressed; dialogs carry a label.',
    'Status is a shape and a word, never colour alone; contrast holds on obsidian (lightened status colours).',
    'The workspaces honour reduced motion; nothing depends on hover.',
  ] },
  { id: 'scope', title: 'Scope', rules: [
    'A shared grammar, not identical layouts: each workspace keeps its own subject composition.',
    'AIO OFFICE only. The public AIO website keeps its own visual language.',
  ] },
];

/* ═══════════════ THE PASS ═══════════════ */

export interface WssDefect { id: string; defect: string; status: 'FIXED' | 'OPEN'; fix: string }
export const AIO_WSS_DEFECTS: WssDefect[] = [
  { id: 'A', defect: 'Fleet yard model names truncated', status: 'FIXED', fix: 'Roster rows re-laid (number · name and client · fingerprint over status); FREIGHTLINER CASCADIA and every model read in full.' },
  { id: 'B', defect: 'IFTA tag read “Q3 · AWAITING CLIE…”', status: 'FIXED', fix: 'Tags carry a short label and a word (IFTA · Q3 / AWAITING CLIENT); tag width fits the longest word.' },
  { id: 'C', defect: 'Ultra-wide bookkeeping sparse', status: 'FIXED', fix: 'A fourth column on ultra-wide: the month at a glance (counts and the nine-step timeline).' },
  { id: 'D', defect: 'Lower compliance panel sparse on wide', status: 'FIXED', fix: 'The case uses three columns with ALSO DUE for the same client; ultra-wide gets a taller horizon and the truck subject as the Fleet slab with its eight connections.' },
  { id: 'E', defect: 'Client 360 desktop overview had weak space', status: 'FIXED', fix: 'The overview reads like the plate: OPEN WORK · TRUCKS · DRIVERS · DOCUMENTS, what needs attention, their fleet as truck tokens and the latest — fitted to one screen.' },
  { id: 'F', defect: 'Mobile compliance tabs clipped', status: 'FIXED', fix: 'The phone tab row fits one line; the thumb slides; the empty DOT / SAFETY state sits on a plate the TODAY line runs behind.' },
  { id: 'G', defect: 'Compact fleet connection tiles lost richness', status: 'FIXED', fix: 'On the phone the eight connections are lit tiles on the same dark slab as the truck.' },
  { id: 'H', defect: 'Nested Client 360 details weaker', status: 'FIXED', fix: 'Every nested record opens on its own plate; a truck is drawn with its eight connections; a service opens on a service plate with its records, the trucks and documents they touch and their dates.' },
  { id: 'I', defect: 'Bookkeeping detail states flat', status: 'FIXED', fix: 'Each detail has its own object — a document sheet with ASKED · REMINDED · RECEIVED, category tiles, a review meter, a report cover — and the rest of the step stays listed below.' },
  { id: 'J', defect: 'Drawer readability on mobile', status: 'FIXED', fix: 'A bar for grip and close (never over a title), a fixed header, a scrolling body, safe-area padding, focus and Escape.' },
];

export const AIO_WSS_REFINEMENTS: Record<'fleet' | 'client' | 'books' | 'comp', string[]> = {
  fleet: ['Selecting a truck draws one gold leader to the active tag and rings the point once; the stage settles in; the roster is patched, not redrawn.', 'Tags light gold only when active and carry aria-pressed; the selection bar grows on the roster row.', 'Phone: the stage and the eight connection tiles share one dark slab; a connection opens in the drawer.'],
  client: ['Service icons light and ring once when chosen; quiet when not used.', 'The overview, the service state and every nested record keep the plate language; truck tokens show unit and state on one line (full state on hover).', 'The drill path stays on one line (initials, service short name, record short name) with BACK.'],
  books: ['MONTHLY / ANNUAL in the client rail; ANNUAL says honestly that no sample client is annual — no annual data invented.', 'Detail objects: document sheet and track, category tiles, review meter, report cover, period meter; the rest of the step below.', 'Ultra-wide: the month at a glance; phone: phases fit one row.'],
  comp: ['The selected marker grows and rings once; when its callout would collide, a readout under the horizon names it.', 'The case shows what else is due for the same client; three columns on wide; the truck subject as the Fleet slab on ultra-wide.', 'Phone tabs fit; empty sections say so on a plate in the same lane.'],
};
export const AIO_WSS_DRAWERS: string[] = [
  'Bar with grip and close; gold hairline at the leading edge; fixed header; contained scrolling body; safe-area padding.',
  'Enter 260 ms from the edge over a fading scrim; leave 200 ms before the page changes.',
  'Labelled modal dialog; focus in; Tab trap; Escape / close / tap outside; inert background; focus back to the opener; keyboard open and close.',
  'Tablet client directory as a side drawer; desktop keeps the contextual side panel.',
  'The confirm popover redrawn as an obsidian plate: action, SIMULATED, effect, NOTHING IS SAVED OR SENT, CONFIRM (WORKING while it applies), CANCEL.',
];
export const AIO_WSS_TYPOGRAPHY: string[] = [
  'Type scale locked at 9 / 10 / 12 / 13 / 17 px; 34 declarations raised to the 9 px floor with tracking tightened.',
  'Single-line parts audited at four sizes: roster rows, tags, tabs, readouts, chips, plate titles, truck tokens, breadcrumbs, status words.',
  'Status words shortened before their reason where space is tight (CANNOT DISPATCH, with AUTHORITY INACTIVE on hover and in the record).',
];

export const AIO_WSS_RESPONSIVE: { device: string; size: string; result: string }[] = [
  { device: 'PHONE', size: '390 × 844', result: 'Strips with edge fades; slab + tiles; tabs fit one row; drawers for detail; plate status under the title; the review itself never scrolls sideways.' },
  { device: 'TABLET', size: '834 × 1194', result: 'Stage over panel; the client directory is a side drawer; Client 360 service state complete on one screen.' },
  { device: 'DESKTOP', size: '1440 × 900', result: 'Three regions fit one screen; only lists scroll; overview and service state fitted.' },
  { device: 'ULTRA_WIDE', size: '2560 × 1440', result: 'More of the subject: month at a glance, taller horizon, three-column case, the truck with its connections.' },
];

export const AIO_WSS_QA = {
  tool: 'workspaces/qa.mjs — Playwright + Chromium over the built review (imports audit.mjs)',
  checks_run: 258,
  failures: 0,
  screenshots: 35,
  text_audit: {
    states: 79,
    sizes: ['390 × 844', '834 × 1194', '1440 × 900', '2560 × 1440'],
    // distinct issues, the same detector on both builds (polish-boards.mjs → boards/polish-audit.json)
    last_pass: { WRAPS: 24, CLIPPED: 0, OVERLAPS: 3, TRUNCATED_UNREACHABLE: 7, BELOW_9PX: 859, UNINTENDED_SIDEWAYS: 2 },
    this_pass: { WRAPS: 0, CLIPPED: 0, OVERLAPS: 0, TRUNCATED_UNREACHABLE: 0, BELOW_9PX: 0, UNINTENDED_SIDEWAYS: 0 },
  },
  covers: [
    'keyboard reach for every control on every device',
    'motion tokens inside the brief’s ranges; the easing has no bounce; the type scale inside its ranges',
    'a truck selection updates in place (rows and panel kept); every running animation ≤ 350 ms; nothing loops in a settled workspace; tab thumbs sit on the active choice',
    'drawers: labelled modal dialog, 200–300 ms entrance, focus in and background inert, close never on text, Tab trap, contained scrolling, Escape with an exit, gone within 400 ms, focus returned, a change during the exit wins, keyboard open and close, tablet side drawer',
    'reduced motion: the drawer appears and closes at once, selections have no motion, the confirmation applies without a wait',
    'MONTHLY / ANNUAL with no invented annual data; ultra-wide month at a glance',
    'the review: this pass leads the landing (seven boards, twelve recordings that play the last pass beside this one), Escape stops a clip, tall boards scroll, REDUCE MOTION on and off, BEFORE shows this pass then since Batch 1',
    'the text audit over 79 states at four sizes (see text_audit)',
    'all earlier checks of the four proofs (journeys, roles, shell, review, TRY demonstrations, console errors)',
  ],
  recordings: {
    count: 12,
    builds: 'the last pass (fsbw 5d39f7bb) and this pass, the same real clicks in Chromium; MP4 and WebM each',
    list: ['01 FLEET · VEHICLE SELECTION', '02 FLEET · CONNECTION DETAIL', '03 CLIENT 360 · SERVICE SELECTION', '04 CLIENT 360 · DRILL DOWN AND RETURN', '05 BOOKKEEPING · STEP TRANSITION', '06 BOOKKEEPING · DETAIL DRAWER', '07 COMPLIANCE · DEADLINE SELECTION', '08 COMPLIANCE · ISSUE DETAIL', '09 ACTION CONFIRMATION', '10 MOBILE DRAWER · OPEN AND CLOSE', '11 MOBILE TABS', '12 REDUCED MOTION'],
    inspected: 'Filmstrips (just before each click, then 50 / 120 / 200 / 320 ms) inspected for all twelve; the last pass has no ALSO DUE step in 08.',
  },
  found_and_fixed: [
    'A redraw during a drawer’s exit could be overwritten by the stale exit draw → a newer draw cancels the pending one',
    'Tab escaped the drawer: icons’ <use href> counted as focus stops → only real controls count',
    'Selection rings ran 0.85–0.9 s and a history highlight 1.4 s → one echo at 320 ms; the simulated entry keeps a still tint',
    'The TODAY line ran through the empty DOT / SAFETY message on the phone → the message sits on its own plate',
    'A simulated action added the counter to the review toolbar, which wrapped and shifted the device 30 px → the counter keeps its space',
    'The new Client 360 overview ran off the bottom of the desktop screen and its truck cards broke UNIT 1 → two attention rows on desktop (the count says how many) and one-line truck tokens',
    'The Client 360 service state was one row over blank paper → a service plate, its records, the trucks and documents they touch, and their dates',
    'Bookkeeping detail panels ended in blank paper → the rest of the step stays listed below the focus',
    'Ultra-wide compliance left half the screen empty → a taller horizon and the truck subject drawn with its connections',
    'Review clips were H.264 only (open-source Chromium cannot play them) → WebM first, MP4 fallback',
  ],
} as const;

export const AIO_WSS_EVIDENCE = {
  boards: ['polish-1-fleet.jpg', 'polish-2-client.jpg', 'polish-3-books.jpg', 'polish-4-comp.jpg', 'polish-5-drawers.jpg', 'polish-6-text.jpg', 'polish-7-motion.jpg'],
  boards_since_batch1: ['before-after-fleet.jpg', 'before-after-books.jpg', 'before-after-comp.jpg', 'before-after-client.jpg', 'family-roots.jpg'],
  folder: 'fsbw AIO_OFFICE_WORKSPACE_PROOFS/ — boards/, recordings/, screens/, qa-summary.json',
} as const;

export const AIO_WSS_KNOWN_REMAINING: string[] = [
  'The founder’s mobile screen recording was not inspected (not available to this work).',
  'Motion was verified in headless Chromium (recordings and frames), not on a physical phone; Safari playback of the clips (MP4 fallback) was not tested here.',
  'The bottom sheet closes by its button, a tap outside or Escape; swipe-down to dismiss is not built.',
  'Client 360 shows two trucks in the overview and service state; more scroll inside the panel.',
  'Open founder decision from the last pass: AUDITS and CORRECTIVE WORK as two tabs vs one IA section.',
  `The ${AIO_UO_SECURITY_HANDOFF.length} privacy gaps remain separate Composer work.`,
];

export const AIO_WSS_FOUNDER_DECISIONS: string[] = [
  'Approve the locked style (AIO_WS_STYLE) as the language for every remaining workspace — or name what to change.',
  'Motion: confirm the durations and the one-echo selection (play the twelve recordings; switch REDUCE MOTION to compare).',
  'Drawers: confirm the bar-and-hairline sheet on the phone and the side drawer on tablet; say if swipe-down is wanted.',
  'Lower panels: confirm the service plate (Client 360), the rest-of-step list (bookkeeping) and the ultra-wide truck slab (compliance).',
  'Then: the order in which the remaining lanes adopt the style (recommendation in the workspace-proofs record).',
];

/* ═══════════════ quality gate ═══════════════ */

const ms = (t: WssToken) => parseFloat(t.value);
/** Problems with the style record; [] when it is consistent and honest. */
export function validateWorkspaceStyle(): string[] {
  const out: string[] = [];
  for (const t of [...AIO_WSS_TYPE, ...AIO_WSS_MOTION]) if (t.min != null && t.max != null && !(ms(t) >= t.min && ms(t) <= t.max)) out.push(`${t.name} ${t.value} outside ${t.min}–${t.max}`);
  if (AIO_WSS_TYPE.some((t) => ms(t) < 9)) out.push('type below 9 px');
  if (!AIO_WSS_EASING.every((e) => /^cubic-bezier\(/.test(e.value))) out.push('easing must be cubic-bezier');
  if (AIO_WSS_EASING.some((e) => e.value.match(/-?\d*\.?\d+/g)!.map(Number).some((n) => n > 1 || n < 0))) out.push('easing must not overshoot (no bounce)');
  const ids = AIO_WS_STYLE.map((s) => s.id);
  for (const need of ['layout', 'hierarchy', 'responsive', 'type', 'spacing', 'surfaces', 'gold', 'states', 'panels', 'drawers', 'motion', 'reduced', 'overflow', 'a11y', 'scope']) if (!ids.includes(need)) out.push(`style section missing: ${need}`);
  for (const s of AIO_WS_STYLE) if (!s.rules.length) out.push(`${s.id}: no rules`);
  if (AIO_WSS_DEFECTS.map((d) => d.id).join('') !== 'ABCDEFGHIJ') out.push('defects A–J all recorded');
  for (const d of AIO_WSS_DEFECTS) if (!d.fix) out.push(`defect ${d.id}: no fix recorded`);
  if (AIO_WSS_QA.failures !== 0) out.push('QA failures recorded');
  if (AIO_WSS_QA.recordings.list.length !== 12) out.push('twelve recorded interactions');
  if (Object.values(AIO_WSS_QA.text_audit.this_pass).some((n) => n !== 0)) out.push('text audit not clean');
  if (!/^NOT AVAILABLE/.test(AIO_WSS_FOUNDER_FEEDBACK.recording)) out.push('the founder recording must not be claimed as inspected');
  if (!/^LOCKED/.test(AIO_WSS_STATUS.language)) out.push('the language is locked, not redesigned');
  if (!/CANDIDATES, AWAITING FOUNDER REVIEW$/.test(AIO_WSS_STATUS.proofs)) out.push('the proofs stay candidates');
  if (!/^NOT STARTED/.test(AIO_WSS_STATUS.expansion)) out.push('no expansion in this pass');
  if (!/^SEPARATE/.test(AIO_WSS_STATUS.public_site)) out.push('the public website stays separate');
  if (!/^UNCHANGED/.test(AIO_WSS_STATUS.approved_roots)) out.push('approved roots unchanged');
  if (!/PRIVACY GAPS STILL OPEN/.test(AIO_WSS_STATUS.security)) out.push('privacy gaps are not resolved here');
  return out;
}
