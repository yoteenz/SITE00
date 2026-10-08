/**
 * AIO OFFICE visual authority — founder approval of the fifteen design decisions and the record of the completed
 * HOME · WORK · REPORTS · MORE visual family (P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.FOUNDER-APPROVAL-AND-VISUAL-AUTHORITY1).
 *
 * The decisions are APPROVED. The renders built on them are CANDIDATES awaiting founder review. Nothing here authorizes
 * live implementation, security changes or deployment.
 */
import type { DesignDecisionApproval } from '../../office-design-reconciliation.js';
import { AIO_DESIGN_DECISIONS } from './office-design-reconciliation.js';
import { AIO_VA_RENDERS, type AioVaRender } from './office-visual-authority-renders.js';

export const AIO_VA_SPRINT = 'P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.FOUNDER-APPROVAL-AND-VISUAL-AUTHORITY1';
export const AIO_VA_DATE = '2026-10-08';
export const AIO_VA_NEXT_GATE = 'FOUNDER REVIEW OF COMPLETED AIO OFFICE VISUAL AUTHORITIES';

const approve = (decision_id: string, approved_as: string, modification: string | null = null): DesignDecisionApproval => ({
  decision_id,
  decided_by: 'FOUNDER',
  date: AIO_VA_DATE,
  sprint: AIO_VA_SPRINT,
  chosen_option: AIO_DESIGN_DECISIONS.find((d) => d.decision_id === decision_id)!.recommended_option,
  approved_as,
  modification,
});

/** The founder approved all fifteen recommendations, with one explicit modification (D-CREATIVE-PROFILE scope). */
export const AIO_DESIGN_DECISION_APPROVALS: DesignDecisionApproval[] = [
  approve('D-HERO-SCALE', 'HOME retains a cinematic welcome photograph at about 60% of the reference height. WORK, REPORTS and MORE use slimmer photographic bands so useful content appears sooner, keeping the premium composition.'),
  approve('D-HOME-ATTENTION', 'The three attention cards become selectable views of one supporting task list of up to five items; each item names the client, the issue and where to fix it.'),
  approve('D-HOME-QUICK-ACTIONS', 'Phone: a square-rounded “+” in the header opens the available quick actions. Tablet: a compact action row after recent activity. Desktop: actions in the context column. Actions depend on permissions.'),
  approve('D-WORK-CARD-SIGNALS', 'Cards show a needs-attention count where supported and a BLOCKED indicator when appropriate; unconnected data says so. VEHICLES & FLEET never pretends its missing staff workspace works.'),
  approve('D-WORK-BANNER', 'The “NEED TO ASSIGN WORK?” banner is replaced by MY WORK near the top of WORK: assigned work and approaching deadlines where supported. No nonexistent case creation is advertised.'),
  approve('D-PHOTOGRAPHY', 'Reuse approved AIO photography wherever it fits; keep the subjects and cinematic character; replace images with generated text, invented branding, anatomical mistakes or repeated compositions with controlled, high-resolution assets.'),
  approve('D-REPORTS-OVERVIEW', 'Only supported figures: ACTIVE CLIENTS, FILINGS FILED, ACTIVE WORK, COLLECTED REVENUE (founder / finance only). No unsupported trends or growth; elegant, truthful unavailable states.'),
  approve('D-REPORTS-DOMAINS', 'Phone: overview, then the reporting areas. Tablet: an organized report selector. Desktop: report navigation beside the content. All ten areas reachable by permission and status.'),
  approve('D-REPORTS-STAFF', 'REPORTS stays in the fixed five-item navigation. Staff see only what their role allows; without reporting access, a clear, professional access explanation. Founder-only financial intelligence never reaches general staff views.'),
  approve('D-MORE-GROUPS', 'Four groups: CLIENTS & RECORDS (Clients, Documents & Vault, Messages) · BUSINESS (Growth / CRM, Billing, Service Catalog) · PEOPLE & NETWORK (Team & Staff, Mechanic Network) · SYSTEM (System Settings, Help & Support, Account). “ADDITIONAL TOOLS” is removed.'),
  approve('D-MORE-HELP-CARD', 'The redundant NEED HELP card is removed; HELP & SUPPORT stays as a directory entry.'),
  approve('D-ACCOUNT', 'The header profile control and MORE → ACCOUNT open the same account destination; no second account experience.'),
  approve('D-IDENTITY', 'One consistent illustrative staff identity across the AIO OFFICE family; the role label reflects the actor (FOUNDER, STAFF or another authorized role); founder privileges never tied to a name or email.'),
  approve('D-DESKTOP-SHELL', 'Reuse the approved AIO OFFICE tablet and desktop frame with WORK replacing FILING; desktop and tablet are intentional compositions, not enlarged phone layouts.'),
  approve(
    'D-CREATIVE-PROFILE',
    'The four-screen visual language becomes the INTERNAL AIO OFFICE design profile: cinematic transportation photography, premium workspace imagery, black-and-gold navigation, ivory and champagne surfaces, strong editorial type, disciplined hierarchy, photographic service cards, precise spacing, practical utility.',
    'Scope limited to the internal AIO OFFICE. It is not a template for every AIO product: the public website may stay darker and cinematic, CLIENT OFFICE keeps its own approved composition, and the IFTA and client-migration authorities remain valid and protected. All share the AIO brand.',
  ),
];

/* ═══════════════ the visual authority candidates (Phase B–D) ═══════════════ */

export { AIO_VA_RENDERS };
export type { AioVaRender };

export const AIO_VA_STATUS = {
  decisions: 'APPROVED — all fifteen, D-CREATIVE-PROFILE with the founder’s scope modification',
  visuals: 'GENERATED — deterministic HTML/CSS authority studio over approved photography, rendered with Chromium',
  approval: 'AWAITING FOUNDER APPROVAL — every render is a CANDIDATE; approving the decisions did not approve these renders',
  implementation: 'NOT AUTHORIZED — no live route, schema, auth, permission, billing, IFTA or migration change; nothing deployed',
} as const;

/** Where the studio and the renders live (fsbw, next to the assets they reuse). Nothing in src imports either. */
export const AIO_VA_LOCATIONS = {
  studio: 'all-in-one-enterprises/design-authority/aio-office/ (studio.html · studio.css · studio.js · compare.html · render.mjs · standins/)',
  renders: 'AIO_OFFICE_VISUAL_AUTHORITY/ (01_MOBILE · 02_TABLET · 03_DESKTOP · 04_ULTRA_WIDE · 05_COMPONENTS · 06_COMPARISON · renders.json)',
  reference: 'docs/aio/office-design-reconciliation/reference/AIO_OFFICE_FOUR_SCREEN_REFERENCE.png (preserved unchanged, sha256 47343139…)',
  rerender: 'cd all-in-one-enterprises && node design-authority/aio-office/render.mjs',
} as const;

export type AioVaViewport = 'MOBILE' | 'TABLET' | 'DESKTOP' | 'ULTRA_WIDE';
export interface AioVaFrame {
  frame: string;
  root: 'HOME' | 'WORK' | 'REPORTS' | 'MORE' | 'SYSTEM';
  viewport: AioVaViewport | 'BOARD';
  actor: 'FOUNDER' | 'STAFF (NO REPORTING GRANT)' | 'STAFF (REPORTING GRANT, NO FINANCE)' | 'STAFF' | '—';
  shows: string;
  deliverable: number;
}
const fr = (frame: string, root: AioVaFrame['root'], viewport: AioVaFrame['viewport'], actor: AioVaFrame['actor'], shows: string, deliverable: number): AioVaFrame => ({ frame, root, viewport, actor, shows, deliverable });
/** The thirty frames, mapped to the sprint’s twenty deliverables (3–6 phone · 7–10 tablet · 11–14 desktop · 15 ultra-wide · 18 components · 19 comparison). */
export const AIO_VA_FRAMES: AioVaFrame[] = [
  fr('AIO-OFFICE-HOME-MOBILE', 'HOME', 'MOBILE', 'FOUNDER', 'NEEDS ATTENTION selected; hero at about 60% of the drawing; three cards + one list in the first screen; 12 lanes; clients; activity', 3),
  fr('AIO-OFFICE-HOME-MOBILE-QUICK-ACTIONS', 'HOME', 'MOBILE', 'FOUNDER', 'the square-rounded “+” opened: seven role-aware quick actions, each naming its destination', 3),
  fr('AIO-OFFICE-HOME-MOBILE-STAFF', 'HOME', 'MOBILE', 'STAFF', 'DUE THIS WEEK selected; no founder-only items, no not-connected line, no payment event', 3),
  fr('AIO-OFFICE-WORK-MOBILE', 'WORK', 'MOBILE', 'FOUNDER', 'slim band; MY WORK; 12 lanes 3 × 4 with honest signals; VEHICLES & FLEET without a workspace; ALL OPEN WORK', 4),
  fr('AIO-OFFICE-REPORTS-MOBILE', 'REPORTS', 'MOBILE', 'FOUNDER', 'overview first (four backed figures), service activity, filing history, client growth not connected, then the ten areas', 5),
  fr('AIO-OFFICE-REPORTS-MOBILE-STAFF-NO-ACCESS', 'REPORTS', 'MOBILE', 'STAFF (NO REPORTING GRANT)', 'professional access explanation; routes to WORK and HOME', 5),
  fr('AIO-OFFICE-MORE-MOBILE', 'MORE', 'MOBILE', 'FOUNDER', 'search; four groups; founder and by-grant markers; ACCOUNT not built yet', 6),
  fr('AIO-OFFICE-MORE-MOBILE-STAFF', 'MORE', 'MOBILE', 'STAFF', 'grant-only and not-built entries omitted; view-only markers', 6),
  fr('AIO-OFFICE-HOME-TABLET', 'HOME', 'TABLET', 'FOUNDER', 'DUE THIS WEEK selected; 6 × 2 lanes; clients beside activity; quick-action row after recent activity', 7),
  fr('AIO-OFFICE-WORK-TABLET', 'WORK', 'TABLET', 'FOUNDER', 'MY WORK under the band; lanes 4 × 3', 8),
  fr('AIO-OFFICE-REPORTS-TABLET', 'REPORTS', 'TABLET', 'FOUNDER', 'report selector (ten areas); figures 4 across; charts two-up; exports', 9),
  fr('AIO-OFFICE-REPORTS-TABLET-STAFF-NO-ACCESS', 'REPORTS', 'TABLET', 'STAFF (NO REPORTING GRANT)', 'access explanation beside the areas the founder can grant (names only, no figures, no financial area)', 9),
  fr('AIO-OFFICE-MORE-TABLET', 'MORE', 'TABLET', 'FOUNDER', 'groups in two columns', 10),
  fr('AIO-OFFICE-HOME-DESKTOP', 'HOME', 'DESKTOP', 'FOUNDER', 'approved desktop frame (WORK replaces FILING); main column + context column (quick actions, activity, business pulse not connected)', 11),
  fr('AIO-OFFICE-HOME-DESKTOP-STAFF', 'HOME', 'DESKTOP', 'STAFF', 'BLOCKED selected, grouped by whom it waits on; no by-grant actions; no business pulse', 11),
  fr('AIO-OFFICE-WORK-DESKTOP', 'WORK', 'DESKTOP', 'FOUNDER', 'lanes 4 × 3 with MY WORK in the right column at the top', 12),
  fr('AIO-OFFICE-REPORTS-DESKTOP', 'REPORTS', 'DESKTOP', 'FOUNDER', 'report navigation beside the content; figures 4 across; charts and filing history side by side; exports', 13),
  fr('AIO-OFFICE-REPORTS-DESKTOP-STAFF-GRANTED', 'REPORTS', 'DESKTOP', 'STAFF (REPORTING GRANT, NO FINANCE)', 'three figures; no revenue tile and no gap for it; nine areas', 13),
  fr('AIO-OFFICE-REPORTS-DESKTOP-STAFF-NO-ACCESS', 'REPORTS', 'DESKTOP', 'STAFF (NO REPORTING GRANT)', 'access explanation with the grantable areas', 13),
  fr('AIO-OFFICE-MORE-DESKTOP', 'MORE', 'DESKTOP', 'FOUNDER', 'directory landing: search + groups 2 × 2 (an open entry is its own future authority)', 14),
  fr('AIO-OFFICE-MORE-DESKTOP-STAFF', 'MORE', 'DESKTOP', 'STAFF', 'role-aware directory with the by-grant note', 14),
  fr('AIO-OFFICE-HOME-ULTRAWIDE', 'HOME', 'ULTRA_WIDE', 'FOUNDER', '2560 × 1440: content capped at 1480 px and centred; plate full-bleed at fixed height; words aligned to the measure; BLOCKED view', 15),
  fr('AIO-OFFICE-WORK-ULTRAWIDE', 'WORK', 'ULTRA_WIDE', 'FOUNDER', 'four cards per row at their measure; extra width to margins and the MY WORK column', 15),
  fr('AIO-OFFICE-REPORTS-ULTRAWIDE', 'REPORTS', 'ULTRA_WIDE', 'FOUNDER', 'no photograph — data first', 15),
  fr('AIO-OFFICE-MORE-ULTRAWIDE', 'MORE', 'ULTRA_WIDE', 'FOUNDER', 'four groups side by side', 15),
  fr('AIO-OFFICE-COMPONENTS-AND-STATES', 'SYSTEM', 'DESKTOP', '—', 'colour, type, controls, status words, navigation, lane signals, report figure states, icons', 18),
  fr('AIO-OFFICE-HOME-ORIGINAL-VS-REVISED', 'HOME', 'BOARD', '—', 'the founder’s HOME drawing · revised first screen · revised full page · what changed', 19),
  fr('AIO-OFFICE-WORK-ORIGINAL-VS-REVISED', 'WORK', 'BOARD', '—', 'the founder’s WORK drawing vs revised', 19),
  fr('AIO-OFFICE-REPORTS-ORIGINAL-VS-REVISED', 'REPORTS', 'BOARD', '—', 'the founder’s REPORTS drawing vs revised', 19),
  fr('AIO-OFFICE-MORE-ORIGINAL-VS-REVISED', 'MORE', 'BOARD', '—', 'the founder’s MORE drawing vs revised', 19),
];

/* ═══════════════ assets ═══════════════ */

export interface AioVaAssetUse {
  asset: string;
  path: string;
  used_for: string[];
  status: 'APPROVED_REUSED' | 'APPROVED_REUSED_SHARED' | 'NEW' | 'STAND_IN_REVIEW_ONLY' | 'NOT_USED';
  note: string;
}
const use = (asset: string, path: string, used_for: string[], status: AioVaAssetUse['status'], note: string): AioVaAssetUse => ({ asset, path, used_for, status, note });
/** Deliverable 16 — every approved asset the authorities reuse, and the ones deliberately left out. */
export const AIO_VA_ASSET_REUSE: AioVaAssetUse[] = [
  use('Staff header lockup', 'all-in-one-enterprises/public/migration/brand-lockup.png', ['every root, every viewport (header, top-left)'], 'APPROVED_REUSED', 'The approved INTAKE header lockup; never redrawn, never placed in photography.'),
  use('Approved AIO OFFICE staff frame', 'AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT/ (responsive-tokens.json · nav-rules.json · masters)', ['header 77 px tablet / 68 px desktop', '138 px desktop sidebar', '113 px tablet dock', 'active tile: obsidian, gold label, 5 px gold edge'], 'APPROVED_REUSED', 'WORK replaces FILING (D-DESKTOP-SHELL); every other value unchanged.'),
  use('Roboto Condensed + Roboto', 'all-in-one-enterprises/public/fonts/migration/*.woff2', ['display and text faces'], 'APPROVED_REUSED', 'The migration family faces (OFL).'),
  use('Founder icon sheet', 'all-in-one-enterprises/public/migration/icons/aio-icon-sheet.svg', ['navigation (home · inbox · folder · signal · menu)', 'search, bell, plus, chevrons, arrows', 'report areas, quick actions, MORE entries'], 'APPROVED_REUSED', 'WORK inherits FILING’s folder glyph; the approved optical-size factors are kept.'),
  use('Migration kit supplemental glyphs', 'all-in-one-enterprises/src/client-migration/visual/AioMigrationKit.tsx (DRAWN)', ['company, people, truck, letter, person-plus, tag, shield-check, id-card, pin, link'], 'APPROVED_REUSED', 'Copied paths, same 24-grid outline weight.'),
  use('HOME welcome photograph', 'all-in-one-enterprises/public/brand/ifta/plates/client-hero.jpg', ['HOME hero (all viewports)'], 'APPROVED_REUSED_SHARED', 'Interim: also the CLIENT OFFICE IFTA hero. The founder’s drawn subject (black truck at an AIO terminal) waits on the photo pass.'),
  use('WORK band', 'all-in-one-enterprises/public/brand/ifta/plates/public-hero.jpg', ['WORK band'], 'APPROVED_REUSED_SHARED', 'Interim: also the PUBLIC IFTA hero. The drawn subject (a warm premium office desk) waits on the photo pass.'),
  use('REPORTS band', 'all-in-one-enterprises/public/brand/ifta/plates/client-insights.jpg', ['REPORTS band (not on ultra-wide)'], 'APPROVED_REUSED_SHARED', 'Interim: also the CLIENT OFFICE insights plate. Replaces a drawing with invented chart text.'),
  use('MORE band', 'all-in-one-enterprises/public/brand/ifta/plates/public-footer-desktop.jpg', ['MORE band'], 'APPROVED_REUSED_SHARED', 'Interim: also the PUBLIC footer. Replaces a notebook carrying an invented AIO mark.'),
  use('FILING & FUEL TAXES lane', 'all-in-one-enterprises/public/brand/ifta/plates/public-road.jpg', ['WORK lane 02'], 'APPROVED_REUSED', 'Light trails into the mountains — the drawn subject.'),
  use('VEHICLES & FLEET lane', 'all-in-one-enterprises/public/brand/ifta/plates/staff-hero.jpg', ['WORK lane 04 (desaturated: no staff workspace yet)'], 'APPROVED_REUSED', 'Night fleet yard.'),
  use('DISPATCH lane', 'all-in-one-enterprises/public/brand/all-in-one-hero-truck.png', ['WORK lane 05'], 'APPROVED_REUSED', 'Carries the real AIO trailer lockup (no dot above the I).'),
  use('BROKERAGE lane', 'all-in-one-enterprises/public/brand/ifta/plates/public-map.jpg', ['WORK lane 06'], 'APPROVED_REUSED', 'The gold freight network over the US — replaces a road shot that duplicated FILING’s.'),
  use('ROAD READY lane', 'all-in-one-enterprises/public/brand/aio-login-hero.png', ['WORK lane 12'], 'APPROVED_REUSED', 'Black truck at sunset — the drawn subject.'),
  use('Founder four-screen drawing', 'docs/aio/office-design-reconciliation/reference/AIO_OFFICE_FOUR_SCREEN_REFERENCE.png', ['seven lane stand-ins (cropped, labelled STAND-IN)', 'the four comparison boards'], 'STAND_IN_REVIEW_ONLY', 'Design review only — never shipped; the drawing itself is preserved unchanged.'),
  use('Older dotted lockup', 'all-in-one-enterprises/public/brand/aio-logo-lockup.png', [], 'NOT_USED', 'Carries the gold dot above the I.'),
  use('Brand service icon PNGs', 'all-in-one-enterprises/public/brand/icons/{compliance,freight,platform,services}/', [], 'NOT_USED', 'Solid style unlike the drawing’s outline icons, and several glyphs are cut off at the source (see missing assets).'),
  use('Migration low-resolution plates', 'all-in-one-enterprises/public/migration/*.jpg', [], 'NOT_USED', '853 px or smaller, with baked text or fades; INTAKE’s own hero stays INTAKE’s.'),
];

/** New assets this sprint created — no photographs, no logos. */
export const AIO_VA_NEW_ASSETS: { asset: string; path: string; note: string }[] = [
  { asset: 'Six supplemental outline glyphs: fuel, umbrella, cash, calculator, steering wheel, wrench', path: 'all-in-one-enterprises/design-authority/aio-office/studio.js (DRAWN)', note: 'Subjects neither the icon sheet nor the migration kit draws (FILING, INSURANCE, FACTORING, BOOKKEEPING, DRIVERS & CARRIERS, MECHANIC / MAINTENANCE); same 24-grid outline family. Marked NEW GLYPH on the components sheet.' },
  { asset: 'Seven lane stand-in crops', path: 'all-in-one-enterprises/design-authority/aio-office/standins/*.jpg (standins.json)', note: 'Cropped from the founder’s drawing (100 px sources, upscaled 4×) — review only, labelled STAND-IN on every render.' },
  { asset: 'Thirty authority frames (38 PNG files) + render manifest', path: 'AIO_OFFICE_VISUAL_AUTHORITY/', note: 'Deterministic: a re-render reproduces every sha256.' },
];

export interface AioVaMissingAsset {
  asset: string;
  needed_for: string;
  interim: string;
  why_missing: string;
  brief: string;
}
const miss = (asset: string, needed_for: string, interim: string, why_missing: string, brief: string): AioVaMissingAsset => ({ asset, needed_for, interim, why_missing, brief });
const PHOTO_BLOCK = 'Photo pass blocked: image generation runs, but this environment cannot download the result (www.figma.com is denied by the network policy).';
/** Deliverable 17. */
export const AIO_VA_MISSING_ASSETS: AioVaMissingAsset[] = [
  miss('PERMITTING & AUTHORITIES lane photograph', 'WORK lane 01', 'STAND-IN from the drawing (legible generated “PERMITS”)', PHOTO_BLOCK, 'Authority filings and stamped permit folders on an office desk; no legible text.'),
  miss('COMPLIANCE lane photograph', 'WORK lane 03', 'STAND-IN (generated “DOT” clipboard)', PHOTO_BLOCK, 'A safety inspector checking a truck at golden hour, face visible; clipboard text unreadable.'),
  miss('INSURANCE lane photograph', 'WORK lane 07', 'STAND-IN (generated “INSURANCE”)', PHOTO_BLOCK, 'A policy folder and truck keys on a desk, cab through the window; no legible text.'),
  miss('FACTORING lane photograph', 'WORK lane 08', 'STAND-IN (garbled invoice text)', PHOTO_BLOCK, 'Freight invoices and a bill of lading being handed over at a dispatch counter; no legible text.'),
  miss('BOOKKEEPING lane photograph', 'WORK lane 09', 'STAND-IN (garbled ledger)', PHOTO_BLOCK, 'Ledger, receipts and a calculator on a warm wood desk; no legible text.'),
  miss('DRIVERS & CARRIERS lane photograph', 'WORK lane 10', 'STAND-IN (masked driver)', PHOTO_BLOCK, 'A professional driver beside a cab at golden hour, face visible, natural anatomy.'),
  miss('MECHANIC / MAINTENANCE lane photograph', 'WORK lane 11', 'STAND-IN (generated workshop)', PHOTO_BLOCK, 'A clean truck workshop: technician at a wheel hub, real tools.'),
  miss('HOME welcome photograph (drawn subject)', 'HOME hero', 'client-hero.jpg (shared with CLIENT OFFICE)', PHOTO_BLOCK, 'A black truck at a modern terminal at golden hour, mountains beyond; no logos or signage in the photograph.'),
  miss('WORK band (drawn subject)', 'WORK band', 'public-hero.jpg (shared with PUBLIC)', PHOTO_BLOCK, 'A premium office desk in warm light, plants and a closed laptop; no screen text.'),
  miss('REPORTS band (drawn subject)', 'REPORTS band', 'client-insights.jpg (shared with CLIENT OFFICE)', PHOTO_BLOCK, 'Printed reports on a desk, out of focus; no readable charts or numbers.'),
  miss('MORE band (drawn subject)', 'MORE band', 'public-footer-desktop.jpg (shared with PUBLIC)', PHOTO_BLOCK, 'A leather notebook and a gold pen on stone with leaves — plain cover, no mark.'),
  miss('Clean re-trace of the brand service icon PNGs', 'any surface that wants the solid icon style', 'outline glyphs from the icon sheet + supplemental family', 'At least eight PNGs are cut off at the source crop: operating-authority, permits, ifta-fuel-tax, irp-road-tax, document-vault, messages, notifications, permits-compliance.', 'Re-trace from public/brand/icons/*/_source-master-*.png with full bounds.'),
  miss('MECHANIC / MAINTENANCE service icon', 'HOME tile 11, WORK lane 11', 'supplemental wrench glyph (new)', 'No approved icon draws the subject.', 'Founder to confirm the wrench, or supply an icon.'),
];

/** The one photography attempt and the environment fix (reported, not worked around). */
export const AIO_VA_PHOTOGRAPHY_PASS = {
  status: 'BLOCKED',
  attempted: 'One generation (HOME welcome photograph, 2048 × 1152 requested, gpt-image-2.5-sunburst via Figma) — one Figma AI credit used; only a 256 px preview reached this environment.',
  cause: 'The generator returns an image URL on www.figma.com; the environment’s network policy denies that host (proxy 403). Figma’s plugin sandbox has no fetch, and Weave runs need a per-run cost approval from the founder.',
  fix: 'Environment settings → Network access: allow www.figma.com (Allowed domains) or choose a broader level; then the controlled photo pass runs with the briefs in AIO_VA_MISSING_ASSETS.',
  forbidden_providers: ['OpenArt'],
} as const;

/* ═══════════════ components, icons, responsive ═══════════════ */

/** Deliverable 18 — shared components and icon rules, as drawn on the components sheet. */
export const AIO_VA_COMPONENTS: { component: string; rule: string }[] = [
  { component: 'Header', rule: 'Approved frame: phone 62 px (lockup · gold “+” on HOME only · search · bell · avatar · identity · chevron); tablet 77 px (adds the page label); desktop 68 px (AIO OFFICE / page, search field, rule).' },
  { component: 'Navigation', rule: 'One list HOME · INTAKE · WORK · REPORTS · MORE: phone and tablet dock, desktop sidebar. Active = obsidian tile, gold label (sidebar adds the 5 px gold edge).' },
  { component: 'Photograph', rule: 'HOME hero about 60% of the drawing’s height; WORK, REPORTS, MORE slim bands. Light plates take dark type over an ivory scrim; dark plates take ivory type with a gold kicker. Full-bleed, fixed height; words align to the content measure. None on REPORTS ultra-wide.' },
  { component: 'Attention cards + list', rule: 'Three selectable views of one list (≤ 5 rows). Selected card: gold ring and a pointer to its list. Row: priority word · client · what is wrong · destination path · age.' },
  { component: 'Honest-state line', rule: 'Dashed top rule, info glyph: names what is NOT CONNECTED YET. Founder / admin views only; never a zero for an unconnected source.' },
  { component: 'Lane tile (HOME) / lane card (WORK)', rule: 'Number 01–12, glyph or photograph, name, signal: “N NEED ATTENTION” (amber), “N BLOCKED” (oxblood), “NOT CONNECTED YET” (grey), “NOTHING NEEDS ATTENTION” (green). VEHICLES & FLEET: hatched / desaturated, “NO STAFF WORKSPACE YET”, no arrow.' },
  { component: 'MY WORK', rule: 'Title, three stat chips (assigned · due this week · blocked), the next rows with due date and status word, and the lanes that do not assign work yet.' },
  { component: 'Report figure', rule: 'Five states: supported · incomplete (PARTIAL DATA chip) · not yet connected · restricted (obsidian, founder / finance) · empty period (0 with when it was checked). No sparklines, no percentages.' },
  { component: 'Report areas', rule: 'Phone: list after the overview. Tablet: selector (two rows). Desktop: navigation column. Each area carries today’s state; the financial area only with the grant.' },
  { component: 'MORE directory', rule: 'Group title with hairline; entry row: glyph tile, title + marker (BY GRANT / FOUNDER / VIEW ONLY / NOT BUILT YET), one-line purpose, chevron.' },
  { component: 'Controls', rule: 'Square-rounded 8–10 px; one gold primary per screen; secondary outline; unavailable actions dashed and say so (PDF LATER). Only the avatar is round.' },
  { component: 'Status words', rule: 'Always a word with a small square: URGENT / OVERDUE / BLOCKED (oxblood), HIGH / TODAY (amber), SOON / BY GRANT / FOUNDER (gold), ON TRACK (green), NOT CONNECTED YET / NOT BUILT YET / PREBUILT (grey).' },
  { component: 'Labels', rule: 'SAMPLE (dashed) on every panel with figures in authority proofs; INTERNAL / CLIENT-VISIBLE on activity; STAND-IN on interim lane photographs.' },
  { component: 'Icons', rule: 'Icon sheet + the migration kit’s outline family only; six supplemental glyphs drawn this sprint (fuel, umbrella, cash, calculator, steering wheel, wrench). Gold on ivory tiles; obsidian in nav. No emoji; the solid brand PNGs wait for a clean re-trace.' },
];

/** Deliverable 15 — ultra-wide (≥ 1900 px) guidance, proven at 2560 × 1440. */
export const AIO_VA_ULTRA_WIDE: string[] = [
  'The frame does not change: 68 px header, 138 px sidebar.',
  'Content measure caps at 1480 px and centres in the workspace; extra width becomes margin (and a wider context column on HOME: 380 px).',
  'Photography stays full-bleed at a fixed height (HOME 360 px); it never stretches past its master (plates are 2880 px wide). Headline words align to the content measure.',
  'Grids keep their counts: HOME 6 × 2 tiles, WORK 4 × 3 cards, MORE four groups side by side; never six or more stretched photo cards per row.',
  'REPORTS drops the photograph on ultra-wide: data first.',
];

/* ═══════════════ permissions and privacy ═══════════════ */

/** Visual decisions that depend on future security work — the 12 recorded privacy gaps are NOT fixed by these visuals. */
export const AIO_VA_PERMISSION_NOTES: { area: string; visual_decision: string; depends_on: string[] }[] = [
  { area: 'MORE → DOCUMENTS & VAULT; HOME document items', visual_decision: 'Each document labelled STAFF ONLY or CLIENT-VISIBLE.', depends_on: ['P-DOCUMENTS-INTERNAL-EXPOSED'] },
  { area: 'MORE → MESSAGES', visual_decision: 'Internal notes drawn distinct from client conversations.', depends_on: ['P-MESSAGES-RLS-VISIBILITY'] },
  { area: 'HOME → RECENT ACTIVITY', visual_decision: 'Every event tagged INTERNAL or CLIENT-VISIBLE.', depends_on: ['P-ACTIVITY-INTERNAL-TO-CLIENT'] },
  { area: 'HOME → CLIENTS IN MOTION', visual_decision: 'PREBUILT shown as NOT ACTIVE YET; only client confirmation activates.', depends_on: ['P-CLIENT-LIFECYCLE-SELF-UPDATE'] },
  { area: 'WORK → MECHANIC / MAINTENANCE; MORE → MECHANIC NETWORK', visual_decision: 'Tickets and providers are staff surfaces; referral fees never drawn in client views.', depends_on: ['P-FLEETCARE-TICKET-NO-ORG-CHECK', 'P-FLEETCARE-REFERRAL-FEES-CLIENT'] },
  { area: 'WORK → BROKERAGE', visual_decision: 'Internal notes and audit stay staff-side.', depends_on: ['P-SHIPPER-VIEW-INTERNAL-NOTES', 'P-SHIPPER-READS-AUDIT'] },
  { area: 'WORK → BOOKKEEPING; REPORTS → BOOKKEEPING', visual_decision: 'Drafts never surfaced as reports (area NOT CONNECTED YET).', depends_on: ['P-BOOKKEEPING-DRAFT-REPORTS'] },
  { area: 'REPORTS → FILING HISTORY', visual_decision: 'Filed quarters are a staff view; client audit actions stay out.', depends_on: ['P-IFTA-CLIENT-AUDIT-ACTIONS'] },
  { area: 'The whole AIO OFFICE frame', visual_decision: 'Clients never see the staff frame, its nav or INTAKE; client links must not lead into /office.', depends_on: ['P-CLIENT-LINKS-TO-OFFICE', 'P-PORTAL-VIEWS-CROSS-ORG'] },
  { area: 'Role-aware visibility (quick actions, REPORTS areas, COLLECTED REVENUE, MORE entries)', visual_decision: 'Drawn as the role and grant model intends: staff without a grant see neither the entry nor a gap for it.', depends_on: ['grant enforcement: “+ New” menu checks no permission; reports.export and crm.leads.manage are not checked today (contracts sprint)'] },
];

/* ═══════════════ comparison ═══════════════ */

/** Deliverable 19 — what changed from the founder’s drawing, page by page (boards in 06_COMPARISON). */
export const AIO_VA_COMPARISON: { root: 'HOME' | 'WORK' | 'REPORTS' | 'MORE'; board: string; preserved: string[]; changed: string[] }[] = [
  { root: 'HOME', board: 'AIO_OFFICE_VISUAL_AUTHORITY/06_COMPARISON/AIO-OFFICE-HOME-ORIGINAL-VS-REVISED-2800.png', preserved: ['greeting + “YOUR OPERATION AT A GLANCE.” over a cinematic truck photograph', 'three overlapping attention cards with gold arrows', 'WORK ACROSS AIO tiles with gold icons', 'CLIENTS IN MOTION rows with badges and chips', 'RECENT ACTIVITY with gold marks', 'black-and-gold dock'], changed: ['hero about 60% of the drawn height', 'cards select one list (≤ 5 items) shown under them', 'quick actions behind the gold “+”', '12 lanes, INTAKE removed, honest signals', 'PREBUILT shown as not active; activity visibility tags', 'one sample person (ALEX R.) with the role label; all uppercase'] },
  { root: 'WORK', board: 'AIO_OFFICE_VISUAL_AUTHORITY/06_COMPARISON/AIO-OFFICE-WORK-ORIGINAL-VS-REVISED-2800.png', preserved: ['“GET THINGS DONE. / EVERY SERVICE. EVERY CLIENT.” headline', 'photographic lane cards, 3 per row on the phone, gold arrows'], changed: ['slim band', 'MY WORK near the top', 'INTAKE tile → VEHICLES & FLEET (no workspace, no arrow); MAINTENANCE → MECHANIC / MAINTENANCE', 'canonical order, numbered 01–12, honest signals', 'assign-work banner removed; ALL OPEN WORK', 'five approved plates; seven labelled stand-ins'] },
  { root: 'REPORTS', board: 'AIO_OFFICE_VISUAL_AUTHORITY/06_COMPARISON/AIO-OFFICE-REPORTS-ORIGINAL-VS-REVISED-2800.png', preserved: ['“REAL INSIGHTS. STRONGER OPERATIONS.” headline', 'four headline figures', 'service bars', 'filing history rows with green marks', 'client growth panel'], changed: ['slim band', 'only backed figures; revenue founder / finance only; no deltas or sparklines', '12 lanes with not-connected rows, PARTIAL DATA label', 'client growth honest NOT CONNECTED YET', 'ten areas after the overview; staff access explanation'] },
  { root: 'MORE', board: 'AIO_OFFICE_VISUAL_AUTHORITY/06_COMPARISON/AIO-OFFICE-MORE-ORIGINAL-VS-REVISED-2800.png', preserved: ['“YOUR AIO OFFICE. EVERYTHING WITHIN REACH.” headline', 'search field under the photograph', 'icon rows with chevrons'], changed: ['slim band without the invented mark', 'four groups, eleven entries (CRM, BILLING, ACCOUNT added)', 'ADDITIONAL TOOLS and the NEED HELP card removed', 'founder / by-grant / view-only markers; staff omit grant-only entries', 'ACCOUNT = the profile menu destination'] },
];

/* ═══════════════ Composer handoff (DRAFT) ═══════════════ */

/** Deliverable 20 — DRAFT until the founder approves the visuals. Implementation is not authorized by this sprint. */
export const AIO_VA_COMPOSER_HANDOFF = {
  status: 'DRAFT — NOT ACTIONABLE UNTIL THE FOUNDER APPROVES THE VISUAL AUTHORITIES',
  gate: AIO_VA_NEXT_GATE,
  read_first: ['docs/aio/office-visual-authority/README.md', 'docs/aio/office-root-contracts/ (what each region may show)', 'AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT/ (the frame)', 'AIO_OFFICE_VISUAL_AUTHORITY/ (the approved pixels, once approved)'],
  sequence: [
    '1 · Shell: rename the staff nav item FILING → WORK in AioMigrationKit STAFF_NAV (one list feeds dock and sidebar); route WORK to the office work root.',
    '2 · Shared components from 05_COMPONENTS: plate / band, attention cards + list, lane tile, lane card, status words, honest-state line, figure tile states, MORE entry row.',
    '3 · HOME, then WORK, REPORTS, MORE — phone first, then tablet and desktop compositions (reflow, never scale).',
    '4 · Data: every figure from its contract source; unconnected sources render NOT CONNECTED YET; SAMPLE labels removed in production.',
    '5 · Roles: visibility from grants, never names; COLLECTED REVENUE and grant-only entries absent (not hidden) without the grant.',
    '6 · Photography: replace the seven STAND-IN lane images and the four interim plates once the photo pass delivers approved assets.',
    '7 · Verify against the authority PNGs at 390 / 834 / 1440 / 2560 with live screenshots before claiming fidelity.',
  ],
  do_not: ['deploy', 'change auth, role permissions, schemas, billing or client records', 'touch IFTA or client-migration implementations beyond the nav label', 'activate any platform fee', 'ship stand-in or interim shared photography as final', 'claim live visual fidelity without live screenshots'],
} as const;

/* ═══════════════ quality gate ═══════════════ */

const ROOTS = ['HOME', 'WORK', 'REPORTS', 'MORE'] as const;
const VIEWPORTS: AioVaViewport[] = ['MOBILE', 'TABLET', 'DESKTOP', 'ULTRA_WIDE'];

/** Problems with the visual-authority record; [] when the package is complete and internally consistent. */
export function validateVisualAuthority(): string[] {
  const out: string[] = [];
  for (const root of ROOTS) for (const vp of VIEWPORTS) if (!AIO_VA_FRAMES.some((f) => f.root === root && f.viewport === vp)) out.push(`no ${root} ${vp} frame`);
  for (const root of ROOTS) if (!AIO_VA_FRAMES.some((f) => f.root === root && f.viewport === 'BOARD')) out.push(`no ${root} comparison board`);
  for (const f of AIO_VA_FRAMES) if (!AIO_VA_RENDERS.some((r) => r.frame === f.frame)) out.push(`frame ${f.frame} has no render`);
  for (const r of AIO_VA_RENDERS) {
    if (!AIO_VA_FRAMES.some((f) => f.frame === r.frame)) out.push(`render ${r.file} belongs to no frame`);
    if (!r.qa_pass) out.push(`render ${r.file} failed visual QA`);
    if (!/^[0-9a-f]{64}$/.test(r.sha256)) out.push(`render ${r.file} has no sha256`);
  }
  const staffRoles = AIO_VA_FRAMES.filter((f) => f.actor.startsWith('STAFF')).map((f) => f.root);
  for (const root of ROOTS.filter((x) => x !== 'WORK')) if (!staffRoles.includes(root)) out.push(`no staff variant for ${root}`);
  for (const d of [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19]) if (!AIO_VA_FRAMES.some((f) => f.deliverable === d)) out.push(`deliverable ${d} has no frame`);
  if (AIO_VA_COMPARISON.map((c) => c.root).join() !== ROOTS.join()) out.push('comparison does not cover the four roots in order');
  if (AIO_VA_MISSING_ASSETS.filter((m) => /lane photograph/.test(m.asset)).length !== 7) out.push('expected seven missing lane photographs');
  if (!AIO_VA_COMPOSER_HANDOFF.status.startsWith('DRAFT')) out.push('Composer handoff must stay a DRAFT until the founder approves the visuals');
  return out;
}
