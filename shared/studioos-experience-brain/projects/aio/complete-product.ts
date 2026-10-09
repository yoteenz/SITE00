/**
 * AIO COMPLETE PRODUCT — the internal AIO OFFICE completed in the locked workspace language, and the public website
 * designed from the founder's recovered brand authority (P0.AIO.COMPLETE-PRODUCT-VISUAL-CONVERGENCE.INTERNAL-OFFICE-AND-PUBLIC-WEBSITE1).
 *
 * Stage A — the office. The five approved roots (HOME · INTAKE · WORK · REPORTS · MORE) are drawn unchanged; every link on
 * them now opens a designed page. All twelve service lanes have their own workspace, each composed around its own object
 * (an application, a quarter, a calendar, a truck, a load board, a match, coverage, an invoice packet, a month, a driver's
 * credentials, a repair line, a road) — the AIO OFFICE WORKSPACE STYLE inherited, not cloned. HOME has a triage desk,
 * INTAKE the migration line, REPORTS its ten areas, MORE its eleven destinations; Client 360 stays the relationship pattern.
 *
 * Stage B — the public website. The only founder image of the public homepage is panel 04 "WEBSITE HOMEPAGE EXPRESSION"
 * of the brand DNA board (SITE00 4af8116c); the homepage is held to it. The service family is held to the approved IFTA
 * public page. The recovered page tree (fsbw src/routes/AioCoreRoutes.tsx) is designed whole, every catalog service with
 * its page and its real status. No prices, client counts or success rates are shown: none are approved.
 *
 * Design review only. Nothing is deployed; no live behaviour, authentication, data, business rule or migration changed;
 * Brokerage stays paused; the twelve privacy gaps remain separate Composer work.
 */
import { AIO_UO_SECURITY_HANDOFF } from './office-unified-experience.js';

export const AIO_CP_SPRINT = 'P0.AIO.COMPLETE-PRODUCT-VISUAL-CONVERGENCE.INTERNAL-OFFICE-AND-PUBLIC-WEBSITE1';
export const AIO_CP_DATE = '2026-10-09';
export const AIO_CP_NEXT_GATE = 'FOUNDER REVIEW OF THE COMPLETE AIO OFFICE AND THE PUBLIC WEBSITE DESIGN';
/** Where this sprint started. */
export const AIO_CP_BASE = { site00: '3a243a20', fsbw: 'b488a7ee' } as const;

export const AIO_CP_LINKS = {
  office_review: 'https://claude.ai/artifact/DKYZUHjSdiTw1qSC1evdbk',
  public_review: 'https://claude.ai/artifact/BzsjSbyLHoLAxhGZBr27UE',
} as const;

export const AIO_CP_STATUS = {
  office_language: 'LOCKED — the AIO OFFICE WORKSPACE STYLE inherited by every new workspace, not redesigned',
  office: 'COMPLETE OFFICE IN DESIGN REVIEW — TWELVE LANES, HOME, INTAKE, REPORTS, MORE — CANDIDATES, AWAITING FOUNDER REVIEW',
  approved_roots: 'UNCHANGED — HOME · INTAKE · WORK · REPORTS · MORE (studio.js / studio.css byte-for-byte)',
  public_site: 'DESIGNED IN REVIEW — HOMEPAGE, SERVICE FAMILY AND THE WHOLE RECOVERED TREE — CANDIDATES, AWAITING FOUNDER REVIEW; NOT DEPLOYED',
  public_reference: 'PANEL 04 OF THE FOUNDER BRAND DNA BOARD — THE FOUNDER TO CONFIRM IT AS THE HOMEPAGE AUTHORITY',
  live_app: 'NOT CHANGED — nothing deployed; no auth, database, business rule, price, migration or IFTA authority changed',
  brokerage: 'PAUSED — designed in both places, shown paused, never activated',
  security: `${AIO_UO_SECURITY_HANDOFF.length} PRIVACY GAPS STILL OPEN — separate Composer work; not resolved here`,
} as const;

/* ═══════════════ A · the locked office authority recovered ═══════════════ */

export const AIO_CP_AUTHORITY: { what: string; where: string; state: string }[] = [
  { what: 'The five approved roots', where: 'fsbw design-authority/aio-office/studio.js + studio.css', state: 'UNCHANGED — drawn by the review exactly as approved; their data-go links are the address book of the office' },
  { what: 'The locked workspace language', where: 'SITE00 office-workspace-style.ts (AIO_WS_STYLE) · fsbw workspaces/ws.css tokens', state: 'INHERITED — type 9/10/12/13/17, motion tokens, surfaces, gold, drawers, reduced motion' },
  { what: 'The four approved workspaces', where: 'fsbw workspaces/ws-fleet.js · ws-books.js · ws-compliance.js · ws-client.js', state: 'UNCHANGED IN DESIGN — registered in the new review registry (states and demos moved beside them)' },
  { what: 'The office page tree', where: 'SITE00 office-ia.ts (AIO_OFFICE_IA)', state: 'FOLLOWED — five roots, twelve lanes and their sections, ten REPORTS areas, eleven MORE destinations, ten INTAKE sections' },
  { what: 'Sample records', where: 'fsbw design-authority/aio-office/office/office-data.js (Batch 1)', state: 'REUSED — every workspace draws the same clients, trucks, drivers, policies and dates; lane-local additions are labelled SAMPLE' },
  { what: 'Approved IFTA staff screens', where: 'fsbw docs/aio/ifta/visual-reconstruction/captures/after/STAFF_{QUEUE,CASE}_{393,834,1440}.jpg', state: 'SHOWN UNCHANGED — FILING opens them in its viewer' },
  { what: 'Approved client-migration screens', where: 'fsbw AIO_CLIENT_MIGRATION_AUTHORITY (authority-manifest.json)', state: 'SHOWN UNCHANGED — INTAKE shows what the client sees with them' },
];

/* ═══════════════ B · the office tree, page by page ═══════════════ */

export interface CpOfficePage { id: string; no: string; name: string; group: 'AUTHORITY & FILINGS' | 'TRUCKS & PEOPLE' | 'FREIGHT & MONEY' | 'THE OFFICE'; under: string; built_around: string; line: string; demos: string[]; routes: string[]; note?: string; approved?: boolean }
export const AIO_CP_OFFICE: CpOfficePage[] = [
  { id: 'permits', no: '01', name: 'PERMITTING & AUTHORITIES', group: 'AUTHORITY & FILINGS', under: 'WORK', built_around: 'AN APPLICATION', line: 'EVERY FILING: WHERE IT IS, WHAT IT NEEDS.', demos: ['MOVE AN APPLICATION', 'CHASE A MISSING DOCUMENT', 'WORK BY SECTION'], routes: ['work/permitting', 'rec/request/<id>'] },
  { id: 'filing', no: '02', name: 'FILING & FUEL TAXES', group: 'AUTHORITY & FILINGS', under: 'WORK', built_around: 'A QUARTER', line: 'ONE QUARTER, EVERY RETURN, ONE DEADLINE.', demos: ['FILE A RETURN', 'THE APPROVED FILING ROOM', 'WALK THE LANE'], routes: ['work/filing', 'rec/quarter/<id>'], note: 'The case level opens the approved IFTA staff screens unchanged; no government API is claimed.' },
  { id: 'comp', no: '03', name: 'COMPLIANCE', group: 'AUTHORITY & FILINGS', under: 'WORK', built_around: 'A CALENDAR', line: 'WHAT IS DUE, HOW SOON, WHAT CLEARS IT.', demos: ['INSPECT A DEADLINE', 'ONLY WHAT IS DUE NOW', 'FOLLOW IT TO THE TRUCK'], routes: ['work/compliance', 'rec/deadline/<id>'], approved: true },
  { id: 'fleet', no: '04', name: 'VEHICLES & FLEET', group: 'TRUCKS & PEOPLE', under: 'WORK', built_around: 'A TRUCK', line: 'PICK A TRUCK. ALL IT TOUCHES IS ON IT.', demos: ['SELECT A TRUCK', 'CLEAR A BLOCKER', 'FILTER THE YARD'], routes: ['work/vehicles', 'rec/vehicle/<id>'], approved: true },
  { id: 'dispatch', no: '05', name: 'DISPATCH', group: 'FREIGHT & MONEY', under: 'WORK', built_around: 'A LOAD BOARD', line: 'EVERY LOAD, ITS ROUTE, ITS TRUCK, ITS PAPERS.', demos: ['FOLLOW THE LOADS', 'CLEAR AN EXCEPTION', 'THE BOARD, FIVE WAYS'], routes: ['work/dispatch', 'rec/load/<id>'] },
  { id: 'broker', no: '06', name: 'BROKERAGE', group: 'FREIGHT & MONEY', under: 'WORK', built_around: 'A MATCH · PAUSED', line: 'SHIPPER, LOAD, CARRIER. PAUSED UNTIL ACTIVATED.', demos: ['TWO SIDES OF ONE LOAD', 'A QUOTE WITH NO CARRIER', 'FOLLOW THE CARRIER'], routes: ['work/brokerage', 'rec/shipment/<id>'], note: 'Designed and shown PAUSED; activating actions are not offered.' },
  { id: 'ins', no: '07', name: 'INSURANCE', group: 'FREIGHT & MONEY', under: 'WORK', built_around: 'COVERAGE', line: 'WHO IS COVERED, BY WHAT, UNTIL WHEN.', demos: ['SEND THE DELTA RENEWAL', 'FOLLOW A POLICY TO ITS TRUCK', 'INTAKE TO QUOTE'], routes: ['work/insurance', 'rec/policy/<id>'], note: 'Referral · partner pending · nothing is bound.' },
  { id: 'factor', no: '08', name: 'FACTORING', group: 'FREIGHT & MONEY', under: 'WORK', built_around: 'AN INVOICE PACKET', line: 'EVERY INVOICE, ITS PAPERS, ITS PATH TO FUNDED.', demos: ['CLEAR THE BLOCKER', 'WALK THE PATH', 'ONLY WHAT IS STUCK'], routes: ['work/factoring', 'rec/submission/<id>'], note: 'Privacy-sensitive lane; no funding amounts invented.' },
  { id: 'books', no: '09', name: 'BOOKKEEPING', group: 'FREIGHT & MONEY', under: 'WORK', built_around: 'A MONTH', line: 'ONE CLIENT, ONE MONTH, LINE BY LINE.', demos: ['CHANGE THE MONTH', 'CHASE A MISSING PAPER', 'ANSWER A QUESTION'], routes: ['work/bookkeeping', 'rec/cycle/<id>', 'rec/subscription/<id>'], approved: true },
  { id: 'drivers', no: '10', name: 'DRIVERS & CARRIERS', group: 'TRUCKS & PEOPLE', under: 'WORK', built_around: 'A DRIVER’S CREDENTIALS', line: 'WHO MAY DRIVE, FOR WHOM, AND UNTIL WHEN.', demos: ['RENEW A MEDICAL CARD', 'APPLICANTS ON THEIR PATH', 'FOLLOW THE DRIVER'], routes: ['work/drivers', 'rec/driver/<id>', 'rec/application/<id>'] },
  { id: 'mech', no: '11', name: 'MECHANIC / MAINTENANCE', group: 'TRUCKS & PEOPLE', under: 'WORK', built_around: 'A REPAIR LINE', line: 'EVERY WORK ORDER, WHERE IT STANDS, WHAT MOVES IT.', demos: ['GET THE REPAIR APPROVED', 'WALK THE SHOP', 'THE NETWORK'], routes: ['work/maintenance', 'rec/ticket/<id>'], note: 'Providers own the repair; AIO coordinates.' },
  { id: 'ready', no: '12', name: 'ROAD READY', group: 'AUTHORITY & FILINGS', under: 'WORK', built_around: 'A ROAD', line: 'NINE CHECKPOINTS BETWEEN A CLIENT AND THE ROAD.', demos: ['VERIFY A CHECKPOINT', 'THREE CLIENTS, THREE ROADS', 'TO THE LANE THAT OWNS IT'], routes: ['work/roadready', 'rec/profile/<id>'] },
  { id: 'home', no: 'H+', name: 'HOME · TRIAGE', group: 'THE OFFICE', under: 'HOME', built_around: 'A TRIAGE DESK', line: 'EVERY ITEM, BY PRIORITY. EACH OPENS WHERE IT IS FIXED.', demos: ['TRIAGE THE MORNING', 'DEADLINES, THEN BLOCKERS', 'QUICK ACTIONS'], routes: ['home/list/<list>', 'home/activity', 'home/quick', 'home/notifications', 'work/mine', 'work/queue'] },
  { id: 'intake', no: 'I+', name: 'INTAKE · MIGRATION CASES', group: 'THE OFFICE', under: 'INTAKE', built_around: 'THE MIGRATION LINE', line: 'EVERY CASE ON ITS WAY TO ACTIVE.', demos: ['APPROVE · IT LANDS ON PREBUILT', 'SETTLE BLUELINE’S CONFLICTS', 'WHAT THE CLIENT SEES'], routes: ['intake/<section>', 'intake/case/<id>'], note: 'PREBUILT is never ACTIVE; the approved migration screens are shown unchanged.' },
  { id: 'reports', no: 'R+', name: 'REPORTS · AREAS', group: 'THE OFFICE', under: 'REPORTS', built_around: 'A REPORT', line: 'TEN AREAS. EVERY MARK OPENS ITS RECORDS.', demos: ['FROM THE OVERVIEW TO A RECORD', 'CHANGE THE PERIOD', 'PREPARE AN EXPORT'], routes: ['reports/<area>'], note: 'Sample counts only; no revenue or performance figures invented.' },
  { id: 'more', no: 'M+', name: 'MORE · DESTINATIONS', group: 'THE OFFICE', under: 'MORE', built_around: 'ELEVEN DESTINATIONS', line: 'EACH PLACE IN MORE, SHAPED FOR ITS WORK.', demos: ['WHO SEES EACH DOCUMENT', 'ANSWER A CLIENT', 'WALK THE DESTINATIONS'], routes: ['more/<destination>', 'rec/document/<id>', 'rec/thread/<id>', 'rec/invoice/<id>'] },
  { id: 'client', no: '360', name: 'CLIENT 360', group: 'THE OFFICE', under: 'MORE', built_around: 'A COMPANY', line: 'WHO THEY ARE, WHAT WE DO, WHAT IS OPEN.', demos: ['ABC → INSURANCE → A TRUCK → BACK', 'MOVE BETWEEN SERVICES', 'TO FLEET AND BACK'], routes: ['more/clients', 'client/<id>'], approved: true, note: 'Reused as the relationship pattern every lane links to.' },
];
export const AIO_CP_REPORTS_AREAS = ['OVERVIEW', 'CLIENTS', 'SERVICES', 'FINANCIAL / REVENUE', 'FILING HISTORY', 'COMPLIANCE', 'DISPATCH / BROKERAGE', 'BOOKKEEPING', 'MIGRATION', 'EXPORTS'] as const;
export const AIO_CP_MORE_DESTINATIONS = ['CLIENTS', 'DOCUMENTS & VAULT', 'GROWTH / CRM', 'BILLING', 'TEAM / STAFF', 'SERVICE CATALOG', 'MECHANIC NETWORK', 'MESSAGES', 'SYSTEM SETTINGS', 'HELP & SUPPORT', 'ACCOUNT'] as const;
export const AIO_CP_REVIEW_GROUPS = [
  { id: 'auth', name: 'AUTHORITY & FILINGS', pages: ['permits', 'filing', 'comp', 'ready'] },
  { id: 'fleet', name: 'TRUCKS & PEOPLE', pages: ['fleet', 'drivers', 'mech'] },
  { id: 'money', name: 'FREIGHT & MONEY', pages: ['dispatch', 'broker', 'ins', 'factor', 'books'] },
  { id: 'office', name: 'THE OFFICE', pages: ['r-home', 'r-intake', 'r-work', 'r-reports', 'r-more', 'client'] },
] as const;
export const AIO_CP_OFFICE_REVIEW_RULE = 'Each department shows four states — MAIN (the primary workspace), SELECTED (a selected record), DEEPER (a drawer, a simulated action or a nested record) and PHONE (the mobile adaptation) — and its TRY demonstrations press the real controls. Every link on the approved roots opens a designed page (BACK returns).';

/* ═══════════════ G–K · the public website ═══════════════ */

export const AIO_CP_PUBLIC_RECOVERY = {
  searched: 'fsbw and SITE00 — working trees and all history (SITE00 4,255 commits); fsbw history has an orphan gap 2026-04-14 → 2026-08-26 (cd766621 is a root commit)',
  found: [
    { item: 'Founder brand DNA board — panel 04 WEBSITE HOMEPAGE EXPRESSION', where: 'SITE00 docs/aio/ifta/authority-bundle/source/AIO_IFTA_AUTHORITY_BUNDLE/00_BRAND/AIO_BRAND_DNA_BOARD.jpeg (4af8116c, sha256 9c032a72…)', use: 'THE HOMEPAGE AUTHORITY (first screen)' },
    { item: 'Approved IFTA public page (public service-page authority)', where: 'SITE00 …/04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg · fsbw captures PUBLIC_{393,834,1440}.jpg', use: 'THE SERVICE-FAMILY MODEL; shown unchanged at /services/ifta-filing' },
    { item: 'The public page tree', where: 'fsbw src/routes/AioCoreRoutes.tsx · src/data/publicNavigation.ts · src/components/AIONav.tsx · docs/refinement/PUBLIC_INFORMATION_ARCHITECTURE.md', use: 'DESIGNED WHOLE' },
    { item: 'The service catalog and its availability', where: 'fsbw src/services/catalog/serviceCatalog.ts · src/launch/serviceActivationLaunch.ts · src/infrastructure/serviceActivation.ts', use: 'EVERY SERVICE PAGE AND STATUS, BUNDLED AT BUILD TIME' },
    { item: 'Brand lines, palette, logo rules, typography decision', where: 'SITE00 dna.ts · ifta-authority bundle.ts (AIO_BRAND_PALETTE, AIO_LOGO_RULES, D-TYPOGRAPHY)', use: 'TAGLINE · POSITIONING · PROMISE; SIMPLE MARK IN THE NAV, FULL LOCKUP IN THE FOOTER; INTER TIGHT + INTER' },
  ],
  not_found: [
    'The 2026-08 desktop homepage “approved reference” mock (fsbw docs/redesign/AIO_HOMEPAGE_RESPONSIVE_PARITY_REPORT.md describes it)',
    'The 13-screen founder mobile reference (docs/refinement/MOBILE_EXPERIENCE_REPORT.md)',
    'The Page Story & Moodboard (14 page families) and the dark / gold service-page reference mock',
    'A branded black-truck photograph like panel 04’s (only the unbranded founder master exists)',
    'Approved prices (all DRAFT / NOT_SET / “demo — clearly fictional”) and verified phone, email and hours (placeholders)',
    'A licence for Monument Extended',
  ],
  decision: 'Panel 04 reconciles with every brand line of the brief (ALL IN ONE ENTERPRISES INC. · FROM STARTUP TO EVERY MILE AFTER. · WHERE BUSINESS MEETS THE ROAD.), so the public stage proceeded and holds the homepage first screen to it. The founder confirms it as the homepage authority. Nothing was substituted for the missing references; below the fold has no founder reference and says so in the review.',
} as const;

export const AIO_CP_PUBLIC_TREE: { group: string; pages: number; note: string }[] = [
  { group: 'HOME', pages: 1, note: 'Held to panel 04' },
  { group: 'SERVICES', pages: 18, note: 'Directory, finder, five division hubs (Brokerage paused), bookkeeping (+ assessment, recommendation), factoring, FleetCare (+ plans, join, apply), DriverLink (+ driver profile), IFTA filing (approved, unchanged)' },
  { group: 'SOLUTIONS', pages: 8, note: 'Start Your Business and its stages, Road Ready™, compliance guide, client portal' },
  { group: 'GET STARTED', pages: 6, note: 'Check What I Need → your roadmap → service plan → submit → request received; a quote opened from its private link' },
  { group: 'COMPANY', pages: 4, note: 'About (+ resources), contact, request a callback, schedule' },
  { group: 'ACCOUNT', pages: 4, note: 'Log in, create account, forgot password, onboarding — authentication unchanged' },
  { group: 'SYSTEM', pages: 1, note: '404' },
  { group: 'SERVICE PAGES', pages: 50, note: 'One per remaining catalog service, generated from the canonical catalog with its status' },
];
export const AIO_CP_PUBLIC_NOT_DESIGNED = [
  '/debug/icon-library — a debug page exposed in the public layout; recommend removing it from the public routes',
  '/reset-password and /verify-email — token screens; same form as forgot password',
  '/office-activation/:token — the approved client-migration flow (its own authority)',
];

export const AIO_CP_PUBLIC_HOME = {
  reference: 'Founder brand DNA board · panel 04 · WEBSITE HOMEPAGE EXPRESSION',
  sections: [
    'NAV — simple mark · SERVICES ▾ (seven families) · SOLUTIONS ▾ · ABOUT · RESOURCES ▾ · CONTACT · search · CLIENT LOGIN · GET STARTED',
    'HERO — the founder’s black-truck dusk master; ALL IN ONE ENTERPRISES INC. / FROM STARTUP / TO EVERY MILE AFTER. / WHERE BUSINESS MEETS THE ROAD. / the panel’s body line; GET STARTED · SEE HOW IT WORKS',
    'THE BAND — TRUSTED PARTNER · INDUSTRY EXPERIENCE · NATIONWIDE SUPPORT · BUILT FOR YOUR GROWTH, then four product facts (7 service families · 6 roadmap stages · 12 office service lanes · 1 client portal)',
    'PICK YOUR ROAD — the four recovered pathways as photographic tiles (swipe on the phone)',
    'START · OPERATE · MAINTAIN — the service ecosystem on the road, every family with its catalog status (Brokerage paused)',
    'THE BUSINESS OFFICE BEHIND THE TRUCK — the client portal (the approved IFTA client screen, labelled sample)',
    'ROAD READY™ — KNOW WHERE YOU STAND. KNOW WHAT’S NEXT. — the six recovered stages',
    'READY TO MOVE FORWARD? — the closing band; the full lockup in the footer only',
  ],
  matches: ['Navigation order and the two buttons', 'The eyebrow, the two-tone headline, the tagline and the body line, verbatim', 'Words left on the dark, the black truck at dusk right, one gold call to action', 'The four principles in the band'],
  differs: ['The four stats (2,500+ clients · 98% approval · 50 states · 24/7) are unverified — replaced by product facts', 'WATCH OUR STORY → SEE HOW IT WORKS: no brand film exists', 'The truck is the founder’s approved black-truck master, unbranded — no branded photograph exists', 'Inter Tight for the headline — Monument Extended is not licensed (D-TYPOGRAPHY)'],
} as const;

export const AIO_CP_PUBLIC_FAMILY = {
  reference: 'The approved IFTA public page (founder authority for a public service page)',
  grammar: ['Photo hero: words left, road right, one gold call to action', 'A rail of four facts overlapping the hero — STATUS · DELIVERY · PRICING · JURISDICTION (from the catalog; no sample figures)', 'A clear path: copy beside a photo card with three short lines', 'Five numbered steps (filing · operate · partner · books variants)', 'The family’s services with their status, the disclosure, the mountain band and the lockup'],
  representatives: [
    { path: '/services/permitting', job: 'FAMILY HUB (20 services)' },
    { path: '/services/trip-permits', job: 'SERVICE PAGE' },
    { path: '/services/bookkeeping', job: 'PLANS — structure and features, no prices' },
    { path: '/services/insurance', job: 'PARTNER REFERRAL — licensed partners quote and decide' },
    { path: '/services/brokerage', job: 'PAUSED — shown, start actions disabled' },
    { path: '/services/ifta-filing', job: 'APPROVED — the approved build, shown unchanged' },
  ],
} as const;

export const AIO_CP_PUBLIC_RULES = [
  'Dark, cinematic, brand-led — obsidian, charcoal, signature gold #D4A853, champagne, platinum (DNA board §02); it does not look like the office.',
  'The simple mark in the navigation; the full lockup only in the footer (AIO_LOGO_RULES).',
  'Every letter uppercase; type never below 9 px; buttons, chips and links on one line.',
  'Status words come from the activation matrices: AVAILABLE · LIMITED PILOT · PREPARING · COMING SOON · REQUEST INFO · PARTNER REFERRAL · STAFF-COORDINATED · PAUSED.',
  'No prices (catalog sentences carrying “Starting at $…” are cut at build; the build fails if a $ figure reaches the page), no client counts, rates, testimonials or the retired Perfect Choice identity.',
  'Placeholder contact details are labelled TO BE CONFIRMED, never shown as real.',
  'Motion: the hero settles in once (≤ 1.6 s); sections rise into view once; nothing loops; reduced motion shows everything at once.',
  'Forms are drawn and answer DESIGN REVIEW — NOTHING WAS SENT; authentication is not changed.',
];

/* ═══════════════ L–M · sizes and QA ═══════════════ */

export const AIO_CP_SIZES = [
  { device: 'PHONE', size: '390 × 844', office: 'Strips, slabs and drawers; detail opens in a sheet', public: 'Photo across the top, words below; pathways swipe; START / OPERATE / MAINTAIN become tabs; full-width actions' },
  { device: 'TABLET', size: '834 × 1194', office: 'Stage over panel; side drawers', public: 'Truck above, words on the road; two-column tiles; menu drawer' },
  { device: 'DESKTOP', size: '1440 × 900', office: 'Selector · stage · context on one screen; only lists scroll', public: 'Panel 04 first screen; four-column pathways; the road with three stages' },
  { device: 'ULTRA_WIDE', size: '2560 × 1440', office: 'More of the subject (journeys, boards, maps), never stretched rows', public: 'More road, larger type, the same hierarchy' },
] as const;

export const AIO_CP_QA = {
  office: { tool: 'design-authority/aio-office/workspaces/qa.mjs (+ lane-check.mjs per workspace)', checks_run: 935, failures: 0, screenshots: 107, lane_checks: { states: 989, failures: 0 } },
  public: { tool: 'design-authority/aio-public/qa.mjs', checks_run: 84, failures: 0, pages: 92, sizes: 4, screenshots: 188 },
} as const;

/* ═══════════════ N · assets reused (nothing generated, no paid credits) ═══════════════ */

export const AIO_CP_ASSETS: { asset: string; source: string; provenance: string; used_in: string }[] = [
  { asset: 'Black truck at dusk (hero)', source: 'fsbw public/brand/aio-login-hero.png', provenance: 'Founder “approved wide master” (login hero)', used_in: 'Public homepage hero, about, account pages' },
  { asset: 'Branded white truck', source: 'fsbw public/brand/all-in-one-hero-truck.png', provenance: 'Founder-supplied, approved homepage hero (Refinement 03B)', used_in: 'Public START pathway, Start Your Business, formation' },
  { asset: 'Golden highway · mountain road · night interstate · fleet yard · freight map · valley trail · mountains at dusk', source: 'fsbw public/brand/ifta/plates/*.jpg', provenance: 'Founder-approved IFTA plates already in the repository (no new generation)', used_in: 'Public page heroes, photo cards, Road Ready map, closing band; office plates' },
  { asset: 'Simple mark and full lockup', source: 'fsbw public/brand/ifta/aio-mark-on-dark.png · aio-lockup-on-dark.png', provenance: 'Founder logo, keyed to alpha', used_in: 'Public nav (mark) and footer (lockup) — per AIO_LOGO_RULES' },
  { asset: 'Inter + Inter Tight', source: 'fsbw public/fonts/ifta/*.woff2', provenance: 'SIL Open Font Licence, already in the repository', used_in: 'Public website type' },
  { asset: 'Line icons', source: 'lucide-static 1.52.0 (ISC) → design-authority/aio-public/site-icons.js', provenance: 'Same source and version as the IFTA family icons', used_in: 'Public website' },
  { asset: 'Approved IFTA captures', source: 'fsbw docs/aio/ifta/visual-reconstruction/captures/after/*.jpg', provenance: 'Approved IFTA reconstruction', used_in: 'Public /services/ifta-filing and client-portal screen; office FILING viewer' },
  { asset: 'Approved migration screens', source: 'fsbw AIO_CLIENT_MIGRATION_AUTHORITY', provenance: 'Approved client-migration authority', used_in: 'Office INTAKE' },
  { asset: 'Office photographic stand-ins and plates', source: 'fsbw design-authority/aio-office/standins/*.jpg · brand plates', provenance: 'Earlier approved office photography pass (labelled stand-ins remain stand-ins)', used_in: 'Office lanes where a plate is drawn' },
  { asset: 'Founder references (review only)', source: 'SITE00 AIO_BRAND_DNA_BOARD.jpeg (and a crop of panel 04), AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg → design-authority/aio-public/reference/', provenance: 'Founder authority bundle', used_in: 'Shown beside the designs in the review; never as production assets' },
];

/* ═══════════════ O · Composer handoff ═══════════════ */

export const AIO_CP_COMPOSER_HANDOFF: { area: string; build: string[]; do_not: string[] }[] = [
  { area: 'Office workspaces', build: ['Port each ws-<id>.js composition to the office app behind the existing routes (src/office/routes/OfficeRoutes.tsx), one lane at a time, reading live data through the existing contracts (SITE00 office-contracts.ts).', 'Keep the registry idea: one definition per page (states for QA, routes from the roots).', 'Keep the motion and drawer behaviour of ws-motion.js (patch, do not redraw; Tab trap; inert background; reduced motion).'], do_not: ['Change studio.js / studio.css (the approved roots).', 'Turn SIMULATED actions into live writes without the permission matrix and audit log.', 'Activate Brokerage.'] },
  { area: 'Public website', build: ['Rebuild AIOPublicLayout + HomePage + the page-system pages to this design (site.css tokens, container breakpoints 600 / 1100 / 1900).', 'Fix the live defect first: src/styles/aio-page-system.css is imported nowhere.', 'Replace the dotted lockup in the nav with the simple mark (AIO_LOGO_RULES).', 'Remove the “Perfect Choice Inc.” placeholder from src/locales/{en,es}/intake.json and scan locale JSON in the brand audit.', 'Drive service status from one activation source (three matrices disagree today).'], do_not: ['Publish prices until approved; publish counts, rates or testimonials.', 'Show the placeholder phone and email as real.', 'Deploy before the founder approves.'] },
];

/* ═══════════════ P · gaps · founder decisions ═══════════════ */

export const AIO_CP_GAPS: string[] = [
  'The founder must confirm panel 04 as the public homepage authority; the full-page homepage mock, the 13-screen mobile reference and the page-story moodboard were not found.',
  'No branded black-truck photograph exists; the homepage uses the founder’s unbranded master.',
  'Prices, verified contact details and hours are not approved — the design shows none.',
  'WATCH OUR STORY needs a brand film that does not exist.',
  'Public service icons for 13 catalog slots are missing at source (MISSING_ICON_SLOTS); the design uses the IFTA family’s line icons.',
  'Office workspaces are design-review compositions on sample data; nothing is wired to live data.',
  'Motion was verified in headless Chromium, not on a physical phone.',
  `The ${AIO_UO_SECURITY_HANDOFF.length} privacy gaps remain separate Composer work.`,
];
export const AIO_CP_FOUNDER_DECISIONS: string[] = [
  'Confirm panel 04 of the brand DNA board as the public homepage authority (or supply the 2026-08 homepage mock and the 13-screen mobile reference).',
  'Approve the public homepage first screen and the service family (or name what to change).',
  'Positioning line: the brief restores THE BUSINESS OFFICE BEHIND THE TRUCK. (retired from customer pages in Refinement 02); it is used as a section headline, not the H1 — confirm.',
  'Replace the panel’s four stats with product facts (as designed), or supply verified figures.',
  'Approve prices before any are published; supply verified phone, email and hours.',
  'Review the twelve lanes, HOME, INTAKE, REPORTS and MORE by group (four states each) and approve or name changes per lane.',
  'Remove /debug/icon-library from the public routes.',
];

/* ═══════════════ quality gate ═══════════════ */

/** Problems with the record; [] when it is consistent and honest. */
export function validateCompleteProduct(): string[] {
  const out: string[] = [];
  const lanes = AIO_CP_OFFICE.filter((p) => /^\d\d$/.test(p.no));
  if (lanes.length !== 12) out.push(`twelve service lanes (have ${lanes.length})`);
  if (lanes.map((l) => l.no).join() !== '01,02,03,04,05,06,07,08,09,10,11,12') out.push('lanes numbered 01–12 in order');
  if (new Set(AIO_CP_OFFICE.map((p) => p.built_around)).size !== AIO_CP_OFFICE.length) out.push('every page is built around its own object (no clones)');
  for (const p of AIO_CP_OFFICE) if (p.demos.length < 2 || !p.routes.length) out.push(`${p.id}: demos and routes`);
  if (!AIO_CP_OFFICE.find((p) => p.id === 'broker')!.built_around.includes('PAUSED')) out.push('Brokerage stays paused');
  if (AIO_CP_REPORTS_AREAS.length !== 10) out.push('ten REPORTS areas');
  if (AIO_CP_MORE_DESTINATIONS.length !== 11) out.push('eleven MORE destinations');
  if (!/^UNCHANGED/.test(AIO_CP_STATUS.approved_roots)) out.push('approved roots unchanged');
  if (!/NOT DEPLOYED$/.test(AIO_CP_STATUS.public_site)) out.push('the public site is not deployed');
  if (!/^NOT CHANGED/.test(AIO_CP_STATUS.live_app)) out.push('the live app is not changed');
  if (!/^PAUSED/.test(AIO_CP_STATUS.brokerage)) out.push('Brokerage paused');
  if (!/PRIVACY GAPS STILL OPEN/.test(AIO_CP_STATUS.security)) out.push('privacy gaps are not resolved here');
  if (!AIO_CP_PUBLIC_RECOVERY.not_found.length) out.push('what was not found is recorded');
  if (AIO_CP_PUBLIC_HOME.differs.every((d) => !/unverified/i.test(d))) out.push('the unverified stats are recorded as replaced');
  if (AIO_CP_PUBLIC_TREE.reduce((n, g) => n + g.pages, 0) !== AIO_CP_QA.public.pages) out.push('the public tree adds up to the pages QA ran');
  if (AIO_CP_QA.office.failures !== 0 || AIO_CP_QA.public.failures !== 0) out.push('QA failures recorded');
  if (AIO_CP_QA.office.checks_run === 0) out.push('office QA not recorded');
  if (/\$\s?\d/.test(JSON.stringify([AIO_CP_PUBLIC_HOME, AIO_CP_PUBLIC_FAMILY, AIO_CP_PUBLIC_TREE]))) out.push('no price in the public record');
  if (AIO_CP_LINKS.public_review === 'PENDING_PUBLISH') out.push('public review link not published');
  return out;
}
