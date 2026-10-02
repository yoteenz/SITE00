/**
 * Generates the SONNET-STRUCTURE1 documentation artifacts from the code-side authority manifest and
 * the asset-slot registry, so docs and code cannot drift.
 *
 *   npx tsx scripts/site00-generate-public-redesign-docs.ts
 *
 * Writes into docs/site00/public-redesign/:
 *   SONNET-ROUTE-AUTHORITY-MAP.md · SONNET-AUTHORITY-IMPLEMENTATION-PLAN.json ·
 *   SONNET-ASSET-SLOT-MANIFEST.json · SONNET-VISUAL-QA.md · SONNET-OPUS-HANDOFF.md ·
 *   sonnet-proof/<id>/comparison-notes.md
 *
 * Visual PASS/PARTIAL/FAIL grades are human judgements recorded in QA below (from side-by-side browser
 * review of sonnet-proof/<id>/authority.jpg vs render.jpg), not computed.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  PUBLIC_REDESIGN_AUTHORITY_RECORDS,
  SUPERSEDED_AUTHORITY_IDS,
  WAITING_FOR_AUTHORITY_ROUTES,
  type AuthorityRecord,
} from '../src/site00/authority/publicRedesignAuthorityManifest';
import { PUBLIC_REDESIGN_ASSET_SLOTS } from '../src/site00/authority/publicRedesignAssetSlots';

const ROOT = path.resolve(import.meta.dirname ?? '.', '..');
const OUT = path.join(ROOT, 'docs/site00/public-redesign');
const PROOF = path.join(OUT, 'sonnet-proof');
fs.mkdirSync(PROOF, { recursive: true });

type Grade = 'PASS' | 'PARTIAL' | 'FAIL';

/** What each authority replaced / is built on — current product truth (Phase 0 forensic map). */
type Forensic = {
  legacyComponent: string;
  dataSource: string;
  interaction: string;
  newRoute?: boolean;
};

const IDNTY_DATA = 'useIdntyAssessment → localStorage `site00_idnty_assessment_v1` + useIntakeSync → /api/site00/intakes (site00_idnty_submissions)';
const FORENSIC: Record<string, Forensic> = {
  origin: { legacyComponent: 'OriginPage (mobile branch) · OriginCards · StatusStrip · OriginMobileSwipeUp', dataSource: 'Site00Context.homeMode · origin-background-assets', interaction: 'Tap card → expand panel (homeMode); swipe-up / button → /origin/locations transition' },
  originPanel: { legacyComponent: 'IdntyExpandedPanel · BldrExpandedPanel · EvolveExpandedPanel', dataSource: 'config/identity.ts · builder.ts · evolve.ts (IDNTY_HOMEPAGE_EXPANDED etc.)', interaction: 'Close/back collapses; BEGIN → /idnty/state · /bldr/state · /evolve/state' },
  overview: { legacyComponent: 'IdntyStatePage (mobile) → IdntyMobileDiagnostic · IdntyStateGrid', dataSource: 'Site00Context.selectedIdentityStateId · IDNTY_BRAND_STATES · IDNTY_INVESTMENT_TIERS', interaction: 'Select state (highlight) → SELECT STATE navigates to /idnty/<slug>. BUILD READY previously routed straight to /bldr/start (corrected).' },
  detail: { legacyComponent: 'IdntyAssessmentLandingPage → IdentityStateLandingV2', dataSource: IDNTY_DATA, interaction: 'Begin → first unanswered question' },
  question: { legacyComponent: 'IdntyAssessmentStepPage → IdentityCalibrationMobileStep', dataSource: IDNTY_DATA, interaction: 'Answer persists on change (local + debounced server autosave); CONTINUE validates required' },
  review: { legacyComponent: 'IdntyAssessmentReviewPage → IdentityCalibrationMobileReview', dataSource: IDNTY_DATA, interaction: 'Legacy review navigated to discovery-result WITHOUT submitting. Now submits via useIdntyAssessment.submitAssessment (existing submit endpoint) and routes to /complete only on server success.' },
  buildReady: { legacyComponent: 'IdntyAssessmentStepPage (services / scope / timeline form)', dataSource: IDNTY_DATA + ' — evidence stored as answers under step `evidence` (no schema change)', interaction: 'NEW verification UI. No verification backend: statuses are provisional descriptions of user input; submit reports unavailable.', newRoute: true },
  bldrCenter: { legacyComponent: 'BldrStatePage (mobile) → BldrClassificationMobile', dataSource: 'Site00Context.selectBuildClass · useBldrAssessment · BLDR_BUILD_CLASSES', interaction: 'Path card → ?path= panel → BEGIN → /bldr/<class>. MISMATCH: classes are SITE/WORLD/ENTERPRISE/NOT SURE.' },
  bldrPanel: { legacyComponent: 'none (nearest: BldrHubPage / BldrEntryPage)', dataSource: 'config/public-redesign-content.ts (authority copy)', interaction: 'In-place panel via ?path=; BEGIN <path> → existing assessment route', newRoute: true },
  evolveCenter: { legacyComponent: 'EvolveStatePage (mobile) → EvolveMobileExperience', dataSource: 'Site00Context.selectEvolvePath · useEvolveAssessment · EVOLVE_PATHS', interaction: 'Path card → ?path= panel → CHOOSE → /evolve/<path>/property' },
  evolvePanel: { legacyComponent: 'none (nearest: EvolveHubPathCard)', dataSource: 'config/public-redesign-content.ts (authority copy; prices are authority copy, not a pricing source)', interaction: 'In-place panel via ?path=', newRoute: true },
  locations: { legacyComponent: 'LocationsPage → Site00MobileShell · LocationsDirectory · DirectoryCard', dataSource: 'config/locations-directory.ts · useSignedInFromStorage', interaction: 'Rows link to existing destinations; auth-locked rows deep-link to sign-in; mobile-only (redirects to /origin ≥768px)' },
};

function forensicFor(r: AuthorityRecord): Forensic {
  if (r.family === 'ORIGIN') return r.state === 'collapsed' ? FORENSIC.origin : FORENSIC.originPanel;
  if (r.pageFamily === 'IDNTY_DIAGNOSTIC') return r.state === 'overview' ? FORENSIC.overview : FORENSIC.detail;
  if (r.pageFamily === 'IDNTY_BUILD_READY') return r.route.endsWith('/review') ? FORENSIC.review : FORENSIC.buildReady;
  if (r.family === 'IDNTY') return r.route.endsWith('/review') ? FORENSIC.review : FORENSIC.question;
  if (r.pageFamily === 'BLDR_COMMAND_CENTER') return FORENSIC.bldrCenter;
  if (r.pageFamily === 'BLDR_PATH_PANEL') return FORENSIC.bldrPanel;
  if (r.pageFamily === 'EVOLVE_INTERVENTION_CENTER') return FORENSIC.evolveCenter;
  if (r.pageFamily === 'EVOLVE_PATH_PANEL') return FORENSIC.evolvePanel;
  return FORENSIC.locations;
}

/* ------------------------------------------------------------- visual QA */

const COMMON = [
  'Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).',
  'Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel\'s footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.',
  'Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).',
  'Bottom nav keeps the existing five-bay icon set; labels are ~10% larger than the authority.',
];

type QA = { grade: Grade; mismatches: string[]; questions?: string[]; responsive?: string; functional?: string };
const IDNTY_MACHINE_NOTE = 'Machine is an SVG scaffold: lacks glossy material/bloom and node density; ~15% smaller than the authority; hero body copy overlaps the machine\'s left rings (authority keeps the text column ~130px).';

const QA_DATA: Record<string, QA> = {
  '01_ORIGIN_MAIN': { grade: 'PARTIAL', mismatches: ['Landmark plate not visible in the sandbox proof: the approved CLEAN plate is a remote Supabase image blocked offline, so the render shows the gradient fallback. Unverified until rendered on a connected build.', 'Header nav is larger/bolder than the authority; CHARACTERS / WORLDS / LIBRARY intentionally omitted (no routes; canonical Origin = IDNTY / BLDR / EVOLVE); EVOLVE link added; SEARCH omitted.', 'Collapsed cards ~168px tall vs ~139px; thumbnails are placeholders (CARD.ORIGIN.*).', 'Hero wordmark uses a Georgia/Cormorant fallback; authority serif not matched.', 'Footer TERMS / PRIVACY are labels (no destination), CONTACT → /support.'], questions: ['Should the preview Mobile/Desktop toggle (existing founder control) stay visible over the Origin header? It is hidden in proof captures only.'], functional: 'Card tap expands; swipe-up/SWIPE UP TO ENTER → /origin/locations transition preserved; ENTER SITE 00 (/enter) link no longer on the mobile Origin (authority has none).' },
  '02_ORIGIN_IDNTY_EXPANDED': { grade: 'PARTIAL', mismatches: ['Hero face wireframe and framework icons are existing production PNGs (blocked offline) → blank boxes in proof; verify on a connected build.', 'Panel top starts ~40px lower; authority right-hand vertical side note ("CLARITY CREATES EVERYTHING THAT FOLLOWS.") is not rendered on mobile.', 'Glass panel blur/tint approximated; plate behind it is the gradient fallback.'], functional: 'CLOSE / BACK collapse; BEGIN IDENTITY → /idnty/state.' },
  '03_ORIGIN_BLDR_EXPANDED': { grade: 'PARTIAL', mismatches: ['Same panel mismatches as IDNTY; WHAT WE BUILD shows 4 columns from the authority (SITE/WORLD/SYSTEMS/EXTENSIONS) but current build classes are SITE/WORLD/ENTERPRISE/NOT SURE.', 'Framework icons are existing BLDR PNGs (blocked offline).'], questions: ['Panel title reads BUILDER per authority; card/CTA still say BLDR. Confirm intended naming.'], functional: 'BEGIN BLDR → /bldr/state (command center).' },
  '04_ORIGIN_EVOLVE_EXPANDED': { grade: 'PARTIAL', mismatches: ['Three path illustrations are the existing Evolve placeholder icons (simple geometric), not the authority\'s red-line vignettes (ILLUSTRATION.ORIGIN.EVOLVE_PATH.* slots).', 'Diamond-ended OVERVIEW rule implemented; hero lattice art blocked offline.'], functional: 'START EVOLVE → /evolve/state; HOW IT WORKS → /evolve (existing secondary action kept as a small link).' },
  '01_IDNTY_DIAGNOSTIC_OVERVIEW': { grade: 'PARTIAL', mismatches: ['State cards render 2×2 below 560px (authority: 4-up row, which is unreadable at 390px); 4-up from 560px.', 'Card glyphs are simplified SVGs; authority cards carry richer line art.', 'Overview machine is the 00 orb scaffold; authority adds node rings and a dais halo.', 'INVESTMENT detail expands inline (VIEW DETAILS) — authority shows only the label.', ...COMMON.slice(0, 1)], questions: ['Is a 2×2 mobile grid acceptable, or should the four cards scroll horizontally to keep one row?'], functional: 'Default highlight is 00 (visual only; context stays unselected until a tap). Resume banner preserved.' },
  '02_IDNTY_STATE_00_FOUNDATION': { grade: 'PARTIAL', mismatches: [IDNTY_MACHINE_NOTE, ...COMMON.slice(0, 2)] },
  '03_IDNTY_STATE_01_REFINE': { grade: 'PARTIAL', mismatches: [IDNTY_MACHINE_NOTE, 'Hex lattice lacks the translucent volume, drop-lines and node cloud.', ...COMMON.slice(0, 2)] },
  '04_IDNTY_STATE_02_EVOLUTION': { grade: 'PARTIAL', mismatches: [IDNTY_MACHINE_NOTE, 'Waveform lobes are narrower; ring light/vertical bloom missing.', ...COMMON.slice(0, 2)] },
  '05_IDNTY_STATE_03_BUILD_READY': { grade: 'PARTIAL', mismatches: ['DEVIATION (intentional): authority copy "Your identity is locked and verified … ENTER BLDR" is replaced with honest verification copy and a BEGIN VERIFICATION CTA — no verification backend exists.', 'Deliverables read ASSET VERIFICATION / PRODUCTION FILES REVIEW / BLDR ACCESS AFTER VERIFICATION (authority: … / PROCEED TO BLDR).', 'Star is flatter; the five domain nodes + labels are placed on a pentagon (authority labels sit further out).', ...COMMON.slice(0, 2)], questions: ['Founder to confirm the honest copy for State 03 (and the CTA label) before Opus converges this screen.'] },
  '01_FOUNDATION_PRIMARY_GOAL': { grade: 'PARTIAL', mismatches: ['Tile icons are generic live-SVG line icons (authority icons are bespoke).', 'Tile labels ~7.5px at 5 columns; authority tiles are taller with more padding.', 'Header third line shows the state quote; authority shows QUESTION 01 there (counter lives in the panel body here, per the secondary-progress rule).', IDNTY_MACHINE_NOTE, ...COMMON.slice(0, 2)], functional: 'Single-select (radio semantics); legacy multi-value goal answers display the first value.' },
  '02_FOUNDATION_AUDIENCE': { grade: 'PARTIAL', mismatches: ['Textarea shows ≥4 lines at 11px (16px on touch devices to prevent iOS zoom-on-focus — intentional deviation).', 'Authority machine adds satellite nodes around the orb for this screen.', ...COMMON.slice(0, 2)] },
  '03_FOUNDATION_TIMELINE': { grade: 'PARTIAL', mismatches: ['Radio rows are slightly taller; row dividers heavier than the authority.', ...COMMON.slice(0, 2)] },
  '04_FOUNDATION_BUDGET': { grade: 'PARTIAL', mismatches: ['Coin icons are simplified; authority shows stacked-coin art of increasing height.', 'CTA label REVIEW ASSESSMENT matches.', ...COMMON.slice(0, 2)] },
  '05_FOUNDATION_REVIEW': { grade: 'PARTIAL', mismatches: ['Audience copy is the user\'s own text (authority shows a sample); small EDIT links added (authority has none) to preserve edit-from-review function.', ...COMMON.slice(0, 2)], functional: 'SUBMIT IDENTITY ASSESSMENT now submits via the existing endpoint; incomplete → routes to first missing question; failure stays on review.' },
  '01_REFINE_EXISTING_ASSETS': { grade: 'PARTIAL', mismatches: ['Typography/website/social icons are simplified line icons.', 'OTHER expands a conditional field (not shown by the authority image, per product correction).', IDNTY_MACHINE_NOTE, ...COMMON.slice(0, 2)] },
  '02_REFINE_CONDITION': { grade: 'PARTIAL', mismatches: ['Card glyphs (scattered/cohesive/missing) are simplified; authority shows isometric component art.', ...COMMON.slice(0, 2)] },
  '03_REFINE_GAPS': { grade: 'PARTIAL', mismatches: ['Machine callout annotations for selected gaps (UNCLEAR MESSAGING / INCONSISTENT VISUAL SYSTEM / NO BRAND GUIDELINES with leader lines) are NOT implemented — deferred to Opus.', ...COMMON.slice(0, 2)] },
  '04_REFINE_REVIEW': { grade: 'PARTIAL', mismatches: ['Condition meter is a visual 5-segment bar (not a score); glyph beside it omitted.', 'Header lines: REFINE IDENTITY / REVIEW ASSESSMENT now match; small EDIT links added.', ...COMMON.slice(0, 2)] },
  '01_EVOLUTION_AREAS': { grade: 'PARTIAL', mismatches: ['Three identity-domain cards only (per correction); card icons simplified.', IDNTY_MACHINE_NOTE, ...COMMON.slice(0, 2)] },
  '02_EVOLUTION_GOALS': { grade: 'PARTIAL', mismatches: ['Authority shows the machine with two highlighted lobes while typing; not implemented.', ...COMMON.slice(0, 2)] },
  '03_EVOLUTION_TIMELINE': { grade: 'PARTIAL', mismatches: ['Two-column rows with icon + radio match structurally; row height ~10% taller.', ...COMMON.slice(0, 2)] },
  '04_EVOLUTION_REVIEW': { grade: 'PARTIAL', mismatches: ['Authority machine annotates VISUAL IDENTITY / BRAND MESSAGING with dashed brackets; not implemented.', 'Row icons simplified.', ...COMMON.slice(0, 2)] },
  '01_BUILD_READY_VERIFICATION': { grade: 'PARTIAL', mismatches: ['Per-row mini node glyph is simplified; machine nodes fill only when the user supplied evidence (provisional).', 'Statuses are provisional descriptions of user input — not verification.', ...COMMON.slice(0, 2)] },
  '02_BUILD_READY_EVIDENCE': { grade: 'PARTIAL', mismatches: ['Chips are toggleable "I can provide this" source types (authority shows static chips); a per-domain "ask SITE 00 to review" checkbox is added (needed to represent REVIEW REQUIRED honestly).', 'No file upload (no backend).', ...COMMON.slice(0, 2)] },
  '03_BUILD_READY_AUTHORITY_CHECK': { grade: 'PARTIAL', mismatches: ['DEVIATION (intentional): authority shows AUTHORITY ESTABLISHED and "SITE 00 HAS REVIEWED THE AVAILABLE EVIDENCE". Nothing has been reviewed → shows PENDING REVIEW / GAP IDENTIFIED / REVIEW REQUIRED with a provisional disclaimer.', ...COMMON.slice(0, 2)] },
  '04_BUILD_READY_REVIEW_VERIFICATION': { grade: 'PARTIAL', mismatches: ['Domain tile icons are the live-SVG set (authority: eye/heart/graph glyphs).', 'EVIDENCE STATUS reads counts only; node glyph simplified.', ...COMMON.slice(0, 2)], functional: 'SUBMIT FOR VERIFICATION reports "not available yet" — never navigates, never fakes success.' },
  '01_BLDR_COMMAND_CENTER': { grade: 'PARTIAL', mismatches: ['Tower is a flat slab SVG; authority is a rendered glass assembly with floating path panels (MACHINE.BLDR.TOWER slot).', 'Path cards render 2×2 below 560px (authority 4-up); card art are placeholders (CARD.BLDR.PATH.*).', 'Header lacks the authority\'s inline nav links (EXPLORE BUILD …); SEARCH omitted.', ...COMMON.slice(2, 4)], questions: ['STRUCTURAL: authority paths SITE/WORLD/SYSTEMS/EXTENSIONS vs current classes SITE/WORLD/ENTERPRISE/NOT SURE. SYSTEMS → enterprise; EXTENSIONS → discovery. Does EXTENSIONS need its own build class/assessment?'] },
  '02_BLDR_OVERVIEW': { grade: 'PARTIAL', mismatches: ['Scene plate above the panel is a gradient (ENV.BLDR.PATH.OVERVIEW).', 'Panel art (cube lattice) overlaps the tagline by ~10px; path-index list sits tighter than the authority.', 'Framework glyphs are simple SVGs (one shared set of 5).', ...COMMON.slice(2, 3)], questions: ['Authority numbering: Overview 02.01 and path 1/4 both; SITE is "02" with CLOSE. Reproduced as drawn — confirm intended numbering.'] },
  '03_BLDR_SITE': { grade: 'PARTIAL', mismatches: ['Side note stacks at the panel\'s right edge (authority aligns it to the art\'s right).', 'Plate gradient; panel is a flatter glass.', ...COMMON.slice(2, 3)] },
  '04_BLDR_WORLD': { grade: 'PARTIAL', mismatches: ['Terrace lattice is a generic isometric placeholder.', 'Plate gradient (globe/waterfall scene = Grok).', ...COMMON.slice(2, 3)] },
  '05_BLDR_SYSTEMS': { grade: 'PARTIAL', mismatches: ['Systems lattice is a generic placeholder.', 'SYSTEM ARCHITECTURE / SYSTEM FLOW floating panels belong to the plate (Grok).', ...COMMON.slice(2, 3)] },
  '06_BLDR_EXTENSIONS': { grade: 'PARTIAL', mismatches: ['Slab-stack art overflows its 112px box slightly.', 'Waiting note added under CTA: no EXTENSIONS assessment exists yet.', ...COMMON.slice(2, 3)] },
  '01_EVOLVE_INTERVENTION_CENTER': { grade: 'PARTIAL', mismatches: ['Property machine is a three-layer wireframe; authority is a rendered glass building with red intervention blocks (MACHINE.EVOLVE.PROPERTY_TOWER).', 'Authority highlights the IDNTY nav bay on this EVOLVE page; implementation highlights a contextual EVOLVE bay (flagged as an authority inconsistency).', 'Cards 3-up (matches) but art placeholders (CARD.EVOLVE.PATH.*).', ...COMMON.slice(2, 4)] },
  '02_EVOLVE_REFINE': { grade: 'PARTIAL', mismatches: ['Orbit target art simplified; CURRENT STATE / TARGET STATE plate panels are Grok.', 'Panel columns (INCLUDES / IDEAL FOR / DELIVERABLES) match; list text ~8% smaller.', ...COMMON.slice(2, 3)] },
  '03_EVOLVE_INSTALL': { grade: 'PARTIAL', mismatches: ['Layered lattice simplified; SYSTEM MODULES / INTEGRATION LAYERS panels are plate content (Grok).', 'Right-hand hero note absent in the authority (matches).', ...COMMON.slice(2, 3)] },
  '04_EVOLVE_TRANSFORM': { grade: 'PARTIAL', mismatches: ['Star/orbit art simplified.', 'EXISTING / TRANSFORMED panels are plate content (Grok).', ...COMMON.slice(2, 3)] },
  '01_LOCATIONS_MAIN': { grade: 'PARTIAL', mismatches: ['Marble-arch plate and row thumbnails are placeholders (ENV.LOCATIONS.ARCH, CARD.LOCATIONS.*).', 'Rows are ~12px shorter than the authority; thumbnail fade starts at 38%.', 'Authority numbers SYSTEM and ABOUT both "05"; implementation keeps 05/06/07.', 'YOUR SPACE section (existing function) renders below the supplied seven; authority ends at JOURNAL + CONTINUE EXPLORING.', 'No bottom nav (matches the authority); header is SITE 00 ◆ + EXIT 00.'] },
};

const gradeOf = (id: string) => QA_DATA[id]?.grade ?? 'PARTIAL';

/* ------------------------------------------------------------------ writers */

const lines = (xs: string[]) => xs.map((x) => `- ${x}`).join('\n');
const json = (p: string, v: unknown) => fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`);

// 1) Implementation plan JSON
const plan = {
  sprint: 'P0.SITE00.PUBLIC-REDESIGN.SONNET-STRUCTURE1',
  pass: 'IMPLEMENTATION PASS 1 — STRUCTURE + FUNCTION + RESPONSIVE GEOMETRY',
  modelSequence: ['SONNET (this pass)', 'OPUS', 'GROK', 'COMPOSER'],
  authorityPack: { total: 40, active: 37, supersededExcluded: [...SUPERSEDED_AUTHORITY_IDS], note: 'The upload-safe "SONNET LITE" pack ships the 37 active JPEGs only; the 3 superseded PNGs are omitted by design.' },
  phases: [
    { phase: 0, name: 'Authority ingestion + route map', status: 'DONE' },
    { phase: 1, name: 'Shared public shell / typography / tokens', status: 'DONE' },
    { phase: 2, name: 'Origin', status: 'DONE' },
    { phase: 3, name: 'IDNTY Diagnostic + state pages', status: 'DONE' },
    { phase: 4, name: 'Foundation', status: 'DONE' },
    { phase: 5, name: 'Refine', status: 'DONE' },
    { phase: 6, name: 'Ready for Evolution', status: 'DONE' },
    { phase: 7, name: 'Build Ready verification UI', status: 'DONE (honest provisional model; no backend)' },
    { phase: 8, name: 'BLDR covered pages', status: 'DONE' },
    { phase: 9, name: 'Public EVOLVE covered pages', status: 'DONE' },
    { phase: 10, name: 'Locations', status: 'DONE' },
    { phase: 11, name: 'Responsive QA', status: 'DONE' },
    { phase: 12, name: 'Browser proof + Opus handoff', status: 'DONE' },
  ],
  records: PUBLIC_REDESIGN_AUTHORITY_RECORDS.map((r) => {
    const f = forensicFor(r);
    return {
      authorityId: r.id,
      authorityPackPath: r.packPath,
      sequence: r.sequence,
      family: r.family,
      pageFamily: r.pageFamily,
      state: r.state,
      intendedRoute: r.route,
      currentRoute: r.route,
      routeStatus: 'ACTIVE',
      coverage: 'COVERED',
      requiresAssetSlots: r.assetSlots.length > 0,
      assetSlots: r.assetSlots,
      replacedComponent: f.legacyComponent,
      newComponent: r.component,
      dataStateSource: f.dataSource,
      interactionBehavior: f.interaction,
      newRouteSurface: Boolean(f.newRoute),
      authorityViewport: r.viewport,
      implementationStatus: r.status,
      visualStatus: gradeOf(r.id),
      notes: r.notes ?? null,
    };
  }),
  uncovered: WAITING_FOR_AUTHORITY_ROUTES.map((u) => ({ ...u, coverage: 'UNCOVERED', status: 'WAITING_FOR_AUTHORITY', visualChange: 'NONE' })),
};
json(path.join(OUT, 'SONNET-AUTHORITY-IMPLEMENTATION-PLAN.json'), plan);

// 2) Asset slot manifest JSON
const grokSlots = PUBLIC_REDESIGN_ASSET_SLOTS.filter((s) => s.grokRequired);
const critical = PUBLIC_REDESIGN_ASSET_SLOTS.filter((s) => s.requiredForFidelity);
json(path.join(OUT, 'SONNET-ASSET-SLOT-MANIFEST.json'), {
  sprint: 'P0.SITE00.PUBLIC-REDESIGN.SONNET-STRUCTURE1',
  rules: [
    'No UI copy is baked into any raster.',
    'No authority screenshot crop is used as an asset or placeholder.',
    'Grok injects a slot by registering its URL in PUBLIC_REDESIGN_ASSET_URLS (src/site00/authority/publicRedesignAssetSlots.ts). No React edits.',
    'Placeholders are neutral CSS gradients inside `AssetSlot` (aria-hidden, data-asset-slot / data-asset-status).',
  ],
  totals: { slots: PUBLIC_REDESIGN_ASSET_SLOTS.length, requiredForFidelity: critical.length, grokRequired: grokSlots.length, svgCssCouldReplace: PUBLIC_REDESIGN_ASSET_SLOTS.filter((s) => s.svgCssCouldReplace).length },
  slots: PUBLIC_REDESIGN_ASSET_SLOTS,
});

// 3) Route → authority map (markdown)
const rows = PUBLIC_REDESIGN_AUTHORITY_RECORDS.map((r) => {
  const f = forensicFor(r);
  return `| ${r.sequence} | \`${r.id}\` | \`${r.packPath}\` | \`${r.route}\` | ${f.legacyComponent.replace(/\|/g, '/')} | \`${r.component}\` | ACTIVE · COVERED | ${r.assetSlots.length ? 'YES (' + r.assetSlots.length + ')' : 'NO'} |`;
});
fs.writeFileSync(
  path.join(OUT, 'SONNET-ROUTE-AUTHORITY-MAP.md'),
  `# SONNET — ROUTE → AUTHORITY MAP

Sprint \`P0.SITE00.PUBLIC-REDESIGN.SONNET-STRUCTURE1\` · produced BEFORE any visual change (Phase 0), then updated with the final component names.

## Pack ingest

| | |
|---|---|
| Total screens in the pack index | 40 |
| ACTIVE authorities (JPEG present) | **37** |
| SUPERSEDED (excluded, never implemented) | **3** — ${SUPERSEDED_AUTHORITY_IDS.join(', ')} |
| Note | This is the upload-safe "SONNET LITE" pack: the 3 superseded PNGs are intentionally omitted; their exclusion stays authoritative (\`99_SUPERSEDED_DO_NOT_USE/README.md\`). |
| Sequence rule | Folder path + numeric filename prefix. Upload chronology is NOT used. |

## 37 ACTIVE authorities → live routes

Every authority is **ACTIVE** (route exists) and **COVERED**. Authorities that have no prior equivalent screen (BLDR path panels, EVOLVE path panels, Build Ready verification) are new surfaces on **existing routes** (\`?path=\` on the \`/state\` route; \`/idnty/build-ready/<step>\`) — no new route entries were added to \`Site00Routes.tsx\`.

| # | Authority ID | Pack path | Live route (mobile) | Replaced / current component | New component | Status | Asset slots |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}

Per-record data/state source and interaction behavior: see \`SONNET-AUTHORITY-IMPLEMENTATION-PLAN.json\`.

## Current data / state sources reused (function kept)

- **IDNTY:** \`useIdntyAssessment\` (localStorage \`site00_idnty_assessment_v1\`) + \`useIntakeSync\` → \`/api/site00/intakes\` (\`site00_idnty_submissions\`). Answers keep their legacy step ids/keys; no schema change.
- **Origin:** \`Site00Context.homeMode\` (\`origin | idnty-expanded | bldr-expanded | evolve-expanded\`), \`useOriginLocationsTransition\`, \`origin-background-assets\` (approved CLEAN plate stays mounted).
- **BLDR / EVOLVE:** \`Site00Context.selectBuildClass / selectEvolvePath\`, \`useBldrAssessment\`, \`useEvolveAssessment\`; assessment routes unchanged.
- **Locations:** \`config/locations-directory.ts\`, \`resolveDirectoryEntryHref\`, \`useSignedInFromStorage\`.

## Uncovered live routes (UNCOVERED → WAITING_FOR_AUTHORITY, **visually untouched**)

| Route | Reason |
|---|---|
${WAITING_FOR_AUTHORITY_ROUTES.map((u) => `| \`${u.route}\` | ${u.reason} |`).join('\n')}

Their function, data and routing are unchanged. Nothing was invented to mirror adjacent screens.

## Current public shell components (Phase 0 findings)

- Router shells: \`Site00PublicRouteShell\` (public pages), \`Site00OriginRouteShell\` (Origin) → \`Site00MobilePresentationShell\` (phone native / laptop phone artboard) or \`Site00DesktopPresentationShell\` (1440 artboard).
- Legacy mobile chrome: \`Site00MobileShell\` (header + fast-travel + bottom nav), \`MobileSiteNavigation\` (ORIGIN · IDNTY · LOCATIONS · PROJECTS · CTRL ROOM — kept and reused).
- **New:** \`PublicRedesignShell\` · \`PublicTechnicalHeader\` · \`SpatialEnvironmentFrame\` · \`AssetSlot\` (\`src/site00/components/public-redesign/\`).

## Typography system (Phase 0 finding)

Host typography is **Martian Mono** (\`--site00-font-family\` in \`styles/tokens.css\`, loaded in \`site00-fonts.css\`). It is **host/interface** type, not client brand type. The redesign keeps it and enforces uppercase at the presentation layer (\`text-transform: uppercase\` on \`.s00pr\`; typed field content is the only exception). The Origin wordmark uses a serif fallback stack (authority serif not yet matched).

## Asset loading patterns (Phase 0 finding)

Remote Supabase storage URLs (\`resolveSite00PublicAsset\`, \`site00SupabasePublicStorageBase\`) for Origin plates, panel icons and framework icons; nav/state icons are live SVG. In an offline sandbox all remote images fail — the redesign never depends on them for layout.

## Mobile breakpoints (Phase 0 finding)

- \`≥768px\` default preview mode = **desktop** (\`defaultPreviewDeviceModeForViewport\`) → legacy desktop artboard branches (preserved). Mobile preview mode (session key \`site00_preview_device_mode\`) renders the phone artboard (390×844).
- \`/origin/locations\` is mobile-only (\`max-width: 767px\`), redirecting to \`/origin\` above that (existing behavior).

## Reusable hooks

\`useIdntyAssessment\` (+ new \`submitAssessment\`), \`useIntakeSync\` (autosave now coalesces patches and flushes before submit), \`useBldrAssessment\`, \`useEvolveAssessment\`, \`useOriginLocationsTransition\`, \`useSignedInFromStorage\`.
`,
);

// 4) Visual QA (markdown) + per-authority notes
const gradeRows = PUBLIC_REDESIGN_AUTHORITY_RECORDS.map((r) => `| ${r.sequence} | \`${r.id}\` | \`${r.route}\` | ${gradeOf(r.id)} | ${r.status === 'STRUCTURE_IMPLEMENTED' ? 'STRUCTURE COMPLETE' : 'STRUCTURE COMPLETE · HONESTY DEVIATION'} |`);
const counts = (g: Grade) => PUBLIC_REDESIGN_AUTHORITY_RECORDS.filter((r) => gradeOf(r.id) === g).length;

fs.writeFileSync(
  path.join(OUT, 'SONNET-VISUAL-QA.md'),
  `# SONNET — VISUAL QA

Browser proof outranks test claims. Every one of the 37 active authorities was opened in Chromium at its authority framing (390 CSS px wide; 390×693 for 941×1672 and 1080×1920 authorities, 390×849 for 850×1850), rendered through the real route, and compared side-by-side with its authority. Evidence: \`sonnet-proof/<authority-id>/{authority.jpg, render.jpg, render-full.jpg, metrics.json, comparison-notes.md}\` (reproduce with \`scripts/site00-public-redesign-proof.mjs\`).

**Rubric.** PASS = matches the authority within the Sonnet-pass tolerance on structure, order, hierarchy, type family, uppercase, shell *and* the visible art. PARTIAL = structure/order/function correct, with listed visual mismatches. FAIL = a structural element, order or function is missing/wrong.

## Result: ${counts('PASS')} PASS · ${counts('PARTIAL')} PARTIAL · ${counts('FAIL')} FAIL

**No screen is graded PASS.** Every screen is structurally complete, but all of them still differ from the authority in photographic plates, bespoke art, material/lighting and pixel-level spacing — which this pass explicitly does not chase. This is **not** a pixel-perfect claim.

| # | Authority | Route | Visual | Structure |
|---|---|---|---|---|
${gradeRows.join('\n')}

## Evidence caveats (read before trusting a render)

- **Remote images are blocked in the proof sandbox.** The Origin landmark plate, Origin panel hero art and Origin framework icons are existing production PNGs on Supabase storage; they render blank offline. The Origin screens therefore could not be visually verified against the landmark — only their layout was.
- **The intake API is mocked** in the proof/flow scripts (route interception) so autosave/submit can run against the real client code. A mocked server proves client behavior, not production persistence.
- **The Mobile/Desktop preview toggle** (existing founder control, \`.site00-origin-layout-switch\`) overlaps the header on Origin-family routes; it is hidden in proof captures only.
- The authority images are 9:16 mock frames; real phones are taller (390×844). The panel footer is below the fold at 390×693 and visible at 390×844.

## Per-authority mismatches

${PUBLIC_REDESIGN_AUTHORITY_RECORDS.map((r) => {
  const q = QA_DATA[r.id];
  return `### ${r.sequence}. \`${r.id}\` — ${q.grade}\n\nRoute \`${r.route}\` · component \`${r.component}\`\n\n${lines(q.mismatches)}${q.questions ? `\n\n**Structural questions**\n${lines(q.questions)}` : ''}${q.functional ? `\n\n**Functional notes**\n${lines([q.functional])}` : ''}`;
}).join('\n\n')}

## Responsive QA (Phase 11)

Script: \`scripts/site00-public-redesign-responsive.mjs\` → \`responsive-qa.json\`. 16 covered routes × 360×740, 390×844, 430×932 (native phone path) and 768×1024, 1024×768, 1440×900 (default **and** Mobile-preview artboard) = 144 probes; 102 rendered the redesign shell.

| Check | Result |
|---|---|
| Horizontal overflow (document) | none in any probe |
| Elements poking past the viewport / artboard | none |
| Fixed bottom nav vs last content (scrollable clear of nav) | clear in all 102 |
| Page errors | none |
| 360px | no overflow; 5-column tiles drop to 3 below 380px; Origin/BLDR cards stay 2–3 up |
| 430px | no overflow; layout stays single column (max-width 640) |
| 768 / 1024 / 1440 default | **Legacy desktop artboard is intentionally preserved** (derived-conservatively rule); BUILD READY verification always uses the redesign (legacy desktop form cannot represent it) and is centered at max 640px |
| 768 / 1024 / 1440 Mobile preview | Phone artboard (390×844) scales; the shell is the scroll container inside the fixed-height artboard; nav + plate stay pinned |
| Safe areas | header/nav add \`env(safe-area-inset-*)\` |
| Keyboard / input | textarea is 16px on touch devices (prevents iOS zoom-on-focus); focus-visible ring on all controls; radio/checkbox semantics on selectors |
| Scroll position | route change keeps document scroll (panel body fades in); not reset programmatically — Opus to decide |

Not verified (needs a device/real network): iOS Safari keyboard resize behaviour, remote plate loading, true safe-area inset values, swipe-up gesture on touch hardware.

## Functional proof (real browser, mocked intake API)

\`scripts/site00-public-redesign-flows.mjs\` — **43/43 checks pass**: state continuity (hero/machine/rail/panel DOM nodes persist from detail through review), single 00–03 rail, compact question counter, required-field validation, single/multi selector semantics, textarea counter, conditional OTHER, retired \`/project\` step redirect, honest submit (success → existing endpoint → \`/complete\`; failure stays on review; unreachable server shows NOT SAVED and never completes; incomplete assessment routes to the first missing question), Build Ready (no pre-verified domain, provisional statuses only, no percentages, submit reports unavailable, no BLDR link), Origin/BLDR/EVOLVE route integration.
`,
);

for (const r of PUBLIC_REDESIGN_AUTHORITY_RECORDS) {
  const q = QA_DATA[r.id];
  const dir = path.join(PROOF, r.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'comparison-notes.md'),
    `# ${r.id}

- **Authority:** \`${r.packPath}\` (${r.viewport.w}×${r.viewport.h}) — \`authority.jpg\` is the pack image resized to 390px wide.
- **Route:** \`${r.route}\`  ·  **Component:** \`${r.component}\`
- **Render:** \`render.jpg\` (viewport) · \`render-full.jpg\` (full page)
- **Visual status:** **${q.grade}**  ·  **Structure:** ${r.status === 'STRUCTURE_IMPLEMENTED' ? 'complete' : 'complete, with an intentional honesty deviation'}

## Known mismatches
${lines(q.mismatches)}
${q.questions ? `\n## Structural questions\n${lines(q.questions)}\n` : ''}${q.functional ? `\n## Functional notes\n${lines([q.functional])}\n` : ''}
Asset slots: ${r.assetSlots.map((s) => `\`${s}\``).join(', ') || 'none'}
`,
  );
}

// 5) Opus handoff
const queue = [
  ['1', 'Shared geometry first (fixes ~25 screens at once)', 'IDNTY family chrome: hero type scale + column width, machine size/placement, progression rail, panel header grid, nav label scale, header glyph. One change in `site00-public-redesign.css` / `IdentityDiagnosticChrome.tsx` cascades to every IDNTY screen.'],
  ['2', 'IDNTY working surfaces', 'Tile/card/row heights and icon art, textarea metrics, footer action row so CONTINUE is above the fold at 390×693.'],
  ['3', 'IDNTY machines', 'Material/node density/bloom for the four SVG machines; REFINE gap callouts; EVOLUTION area brackets (annotation layers).'],
  ['4', 'Origin (4 screens)', 'Hero wordmark, card height, glass panel tint/blur, side notes — after plates load (needs a connected build).'],
  ['5', 'BLDR + EVOLVE centers', 'Hero/machine overlap, card art slots, 4-up vs 2×2 decision.'],
  ['6', 'BLDR + EVOLVE path panels', 'Panel head grid (title/art/side-note), framework glyph scale, EVOLVE three-column lists.'],
  ['7', 'Locations', 'Row height, thumbnail fade, ghost 00 / CONTINUE EXPLORING footer.'],
];

fs.writeFileSync(
  path.join(OUT, 'SONNET-OPUS-HANDOFF.md'),
  `# SONNET → OPUS HANDOFF

**SONNET STRUCTURE COMPLETE** (37/37 active authorities live, routed, interactive, uppercase, responsive).
**OPUS PIXEL CONVERGENCE REQUIRED** (37/37 are PARTIAL against their authority — see \`SONNET-VISUAL-QA.md\`).

Opus receives the same authority pack. Mandate: visual convergence, not product reinvention.

## What is locked (do not undo)

- **IDNTY continuity:** hero, machine, 00–03 rail, shell stay mounted; only the lower panel transforms (detail → question → review). One component (\`IdentityDiagnosticFlow\`) is rendered for every segment of \`/idnty/:state/*\`. Do not split it per page.
- **One progress rail.** Question progress is the compact counter + 3–4 segments inside the panel.
- **Honest Build Ready.** No "verified", no "ESTABLISHED", no BLDR unlock, no percentages. The authority image says otherwise on three screens — see *Deviations* below.
- **Uppercase** is a CSS contract on \`.s00pr\` (typed content excepted). Don't title-case anything.
- **Assets are slots.** Don't paint plates/art in CSS; leave \`AssetSlot\` mounts. Grok injects by URL.
- Desktop branches are preserved legacy; do not redesign desktop from these mobile authorities.

## Component map

| Layer | Files (\`src/site00/components/public-redesign/\`) |
|---|---|
| Shell | \`PublicRedesignShell\` · \`PublicTechnicalHeader\` · \`SpatialEnvironmentFrame\` · \`AssetSlot\` |
| IDNTY | \`IdentityDiagnosticFlow\` (detail/question/review) · \`IdentityDiagnosticOverview\` · \`IdentityDiagnosticChrome\` (hero, stage, rail, \`TransformingStatePanel\`) · \`IdentityMachines\` · \`TechnicalControls\` · \`PanelActions\` · \`IdentityReviewSummary\` · \`BuildReadyVerification\` · \`PublicLineIcon\` |
| Origin | \`PublicOrigin\` (\`PublicOriginMobile\`, \`PublicOriginExpandedPanel\`) |
| BLDR / EVOLVE | \`PublicServiceLayouts\` (\`PublicServiceCenter\`, \`PublicServicePathPanel\`) · \`PublicServicePages\` (\`BuilderStateExperience\`, \`EvolveStateExperience\`) · \`ServiceMachines\` |
| Locations | \`PublicLocationsDirectory\` |
| Config / data | \`config/idnty-public-redesign.ts\` · \`config/public-redesign-content.ts\` · \`lib/identityAuthorityVerification.ts\` |
| Authority metadata | \`src/site00/authority/publicRedesignAuthorityManifest.ts\` · \`publicRedesignAssetSlots.ts\` |
| Styles | \`site00-public-redesign.css\` · \`-origin.css\` · \`-services.css\` |

Dev-only authority badge: append \`?authority=1\` in \`vite dev\` to see the current authority id / route / status (compiled out of production).

## Route-by-route refinement queue

${queue.map(([n, t, d]) => `${n}. **${t}** — ${d}`).join('\n')}

## Per-authority handoff

${PUBLIC_REDESIGN_AUTHORITY_RECORDS.map((r) => {
  const q = QA_DATA[r.id];
  return `### ${r.sequence}. \`${r.id}\`
- **Route:** \`${r.route}\`  ·  **Component:** \`${r.component}\`
- **Current render:** \`sonnet-proof/${r.id}/render.jpg\` (+ \`render-full.jpg\`) vs \`authority.jpg\`
- **Visual status:** ${q.grade} — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** ${q.mismatches.length} (see \`comparison-notes.md\`)
- **Asset placeholders:** ${r.assetSlots.map((s) => `\`${s}\``).join(', ') || 'none'}
- **Structural questions:** ${q.questions ? q.questions.join(' ') : 'none'}
- **Responsive notes:** ${q.responsive ?? 'No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).'}
- **Functional notes:** ${q.functional ?? 'Function preserved (see route map).'}`;
}).join('\n\n')}

## Deviations from the authority images (intentional — founder decision needed)

1. **State 03 detail** (\`05_IDNTY_STATE_03_BUILD_READY\`): image says "locked and verified … ENTER BLDR"; implemented as honest verification copy + **BEGIN VERIFICATION**.
2. **Build Ready authority check** (\`03_…\`): image shows **AUTHORITY ESTABLISHED** + "SITE 00 HAS REVIEWED"; implemented as **PENDING REVIEW / GAP IDENTIFIED / REVIEW REQUIRED** + provisional disclaimer.
3. **Header nav links** CHARACTERS / WORLDS / LIBRARY omitted (no routes; Origin = IDNTY / BLDR / EVOLVE only). SEARCH omitted (no capability).
4. **EVOLVE center nav bay:** authority highlights IDNTY on an EVOLVE page; implemented as a contextual EVOLVE bay (BLDR pages: BUILDER).
5. **Textarea 16px on touch** (iOS zoom guard).
6. **Locations:** SYSTEM / ABOUT numbered 05/06 (authority repeats 05); YOUR SPACE section kept.

## Structural questions for the founder

- BLDR: should **EXTENSIONS** become a real build class/assessment? Today SYSTEMS → \`enterprise\`, EXTENSIONS → \`/bldr/not-sure\`.
- BLDR panel numbering as drawn (02 / 02.01 / 02.02 …) is internally inconsistent; reproduced verbatim.
- Overview cards: 2×2 on mobile vs horizontally scrolling single row.
- \`TERMS\` / \`PRIVACY\` footer items have no destination yet.

## Grok handoff (asset slots only — NO generation performed)

${PUBLIC_REDESIGN_ASSET_SLOTS.length} stable slots in \`SONNET-ASSET-SLOT-MANIFEST.json\` (${critical.length} required for fidelity; ${grokSlots.length} Grok-required; ${PUBLIC_REDESIGN_ASSET_SLOTS.filter((s) => s.svgCssCouldReplace).length} could be replaced by SVG/CSS). Register URLs in \`PUBLIC_REDESIGN_ASSET_URLS\`.

## Composer blockers (backend / productionization)

See the final receipt §AB: identity-authority verification backend (snapshot read + submit-for-verification + evidence storage), BLDR unlock authority, EXTENSIONS class, pricing source for BLDR/EVOLVE panels, server confirmation semantics of \`submit\` (lifecycle/commercial activation) for IDNTY branches.
`,
);

console.log('generated:', fs.readdirSync(OUT).join(', '));
