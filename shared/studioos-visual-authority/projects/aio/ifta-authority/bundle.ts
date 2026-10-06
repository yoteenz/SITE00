/**
 * AIO IFTA AUTHORITY BUNDLE — ingest (P0.AIO.IFTA.AUTHORITY-BUNDLE-INGEST-AND-PAGE-TREE-PROOF1).
 *
 * The founder + ChatGPT manually ran the authority-design pipeline for AIO IFTA (steps 01–07: lock the client parent
 * authority → derive 3 actor modes → derive tablet + desktop per mode → page / component / interaction contract → tabs
 * as first-class nodes → icon / asset sheet → lock the package). This module is the machine-readable ingest of that
 * package: every file, its sha256, its authority role, and the brand / logo / theme rules it locks.
 *
 * The images are stored (byte-for-byte) at docs/aio/ifta/authority-bundle/source/AIO_IFTA_AUTHORITY_BUNDLE/.
 * AUTHORITY ≠ RUNTIME ASSET: none of these files may ship in a page.
 */
import type { Viewport } from '../../../../studioos-experience-brain/schema.js';

export const AIO_IFTA_BUNDLE_SPRINT = 'P0.AIO.IFTA.AUTHORITY-BUNDLE-INGEST-AND-PAGE-TREE-PROOF1' as const;
export const AIO_IFTA_BUNDLE_NAME = 'AIO_IFTA_AUTHORITY_BUNDLE' as const;
export const AIO_IFTA_BUNDLE_ATTACHMENT = 'AIO_IFTA_AUTHORITY_BUNDLE_LEAN.zip' as const;
export const AIO_IFTA_BUNDLE_DIR = 'docs/aio/ifta/authority-bundle/source/AIO_IFTA_AUTHORITY_BUNDLE' as const;
export const AIO_IFTA_INGESTED_AT = '2026-10-06' as const;
/** Brand context version that carries the bundle's brand authority (see projects/aio/ifta.ts AIO_BRAND_CONTEXT). */
export const AIO_BRAND_CONTEXT_ID = 'AIO.BRAND@2026-10-06+IFTA_AUTHORITY_BUNDLE' as const;
/** AIO source the functional reconciliation read (yoteenz/fsbw · all-in-one-enterprises). */
export const AIO_SOURCE_SHA = '48d463f' as const;

/** The pipeline the founder tested (sprint §FOUNDER DECISION). Steps 01–07 happened before this sprint. */
export const AIO_IFTA_PIPELINE = [
  { step: '01', id: 'LOCK_CLIENT_PARENT_AUTHORITY', status: 'DONE_BY_FOUNDER' },
  { step: '02', id: 'DERIVE_3_ACTOR_MODES', status: 'DONE_BY_FOUNDER' },
  { step: '03', id: 'DERIVE_TABLET_DESKTOP_PER_MODE', status: 'DONE_BY_FOUNDER' },
  { step: '04', id: 'DEFINE_PAGE_COMPONENT_INTERACTION_CONTRACT', status: 'DONE_BY_FOUNDER' },
  { step: '05', id: 'DEFINE_EVERY_TAB_AS_FIRST_CLASS_NODE', status: 'DONE_BY_FOUNDER (tab contracts) · EXPANDED BY THIS SPRINT (tree)' },
  { step: '06', id: 'CREATE_ICON_ASSET_SHEET', status: 'DONE_BY_FOUNDER' },
  { step: '07', id: 'LOCK_AUTHORITY_PACKAGE', status: 'DONE_BY_FOUNDER' },
  { step: '08', id: 'BRAIN_INGESTS_PACKAGE', status: 'THIS_SPRINT' },
  { step: '09', id: 'BRAIN_PRODUCES_PAGE_TAB_STATE_TREE', status: 'THIS_SPRINT' },
  { step: '10', id: 'FOUNDER_CONFIRMS_TREE', status: 'PENDING_FOUNDER' },
  { step: '11', id: 'IMPLEMENTATION_MAY_BEGIN', status: 'BLOCKED_UNTIL_10' },
] as const;

export type BundleRefId =
  | 'BRAND_DNA_BOARD'
  | 'FULL_LOGO_LOCKUP'
  | 'SIMPLE_NAV_MARK'
  | 'CLIENT_3_TERRITORIES'
  | 'ACTOR_MODES_MOBILE'
  | 'CLIENT_MOBILE_PARENT_AUTHORITY'
  | 'FUEL_PURCHASES_CHILD_PROOF'
  | 'CLIENT_TABLET_DESKTOP'
  | 'FOUNDER_STAFF_TABLET_DESKTOP'
  | 'PUBLIC_TABLET_DESKTOP'
  | 'PAGE_COMPONENT_INTERACTION_CONTRACT'
  | 'ICON_ASSET_SHEET'
  | 'BUNDLE_README'
  | 'BUNDLE_MANIFEST';

export type BundleAuthorityKind =
  | 'BRAND_AUTHORITY'
  | 'TERRITORY_SELECTION'
  | 'ACTOR_MODE_DERIVATION'
  | 'PARENT_AUTHORITY'
  | 'CHILD_PROOF'
  | 'VIEWPORT_DERIVATION'
  | 'CONTRACT_AUTHORITY'
  | 'ASSET_AUTHORITY'
  | 'PACKAGE_META';

export type BundleFile = {
  ref_id: BundleRefId;
  bundle_path: string;
  path: string;
  sha256: string;
  bytes: number;
  media: 'image/jpeg' | 'image/png' | 'text/plain' | 'application/json';
  dimensions: string | null;
  folder: string;
  authority_kind: BundleAuthorityKind;
  role: string;
  actors: string[];
  viewports: Viewport[];
  theme: string | null;
  governs: string[];
  /** What the Brain read from the file (transcribed; image text is evidence, not the only source of truth). */
  extracted: string[];
  /** Defects in the reference itself (never silently corrected). */
  defects: string[];
  runtime_asset: false;
};

const f = (x: Omit<BundleFile, 'path' | 'runtime_asset' | 'defects'> & { defects?: string[] }): BundleFile => ({ ...x, path: `${AIO_IFTA_BUNDLE_DIR}/${x.bundle_path}`, defects: x.defects ?? [], runtime_asset: false });

export const AIO_IFTA_BUNDLE_FILES: BundleFile[] = [
  f({
    ref_id: 'BRAND_DNA_BOARD', bundle_path: '00_BRAND/AIO_BRAND_DNA_BOARD.jpeg', sha256: '9c032a722a4fcac1f5257cce2e85242c5aacbac136f0840e889cf717fd84284a', bytes: 680117, media: 'image/jpeg', dimensions: '1448x1086', folder: '00_BRAND',
    authority_kind: 'BRAND_AUTHORITY', role: 'AIO brand DNA: palette, uppercase typography, logo lockup + app / nav mark, brand language, icon direction, photography direction, materials, principles.', actors: ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'], viewports: [], theme: null,
    governs: ['brand palette', 'typography system', 'icon direction', 'photography direction', 'material world', 'brand principles'],
    extracted: ['Palette: OBSIDIAN #050505 (primary background) · CHARCOAL #1A1A1A (secondary surfaces) · SIGNATURE GOLD #D4A853 (primary accent) · CHAMPAGNE #EBD9B7 (supporting accent) · PLATINUM #C0C6CC (secondary metallic) · STONE WHITE #F6F6F4 (light background)', 'Typography (UPPERCASE ONLY): MONUMENT EXTENDED (primary headline) · INTER (secondary) · BEBAS NEUE (accent / label)', 'Icon direction: LINEAR · STRUCTURED · PREMIUM', 'Photography: TRUCKING · OPERATIONS · PEOPLE · INFRASTRUCTURE', 'Materials: GOLD · BRUSHED METAL · CARBON · MARBLE · ROAD', 'Principles: TRUSTED PARTNER · INDUSTRY EXPERIENCE · NATIONWIDE SUPPORT · BUILT FOR GROWTH', 'Shows website homepage expression and client portal expression thumbnails'],
  }),
  f({
    ref_id: 'FULL_LOGO_LOCKUP', bundle_path: '00_BRAND/AIO_FULL_LOGO_LOCKUP.jpeg', sha256: '3864b9ea7faac5028d5ef83afa60f98515c9d6520489cdc40b20e1beec84861e', bytes: 183619, media: 'image/jpeg', dimensions: '1448x1086', folder: '00_BRAND',
    authority_kind: 'BRAND_AUTHORITY', role: 'Full ALL IN ONE ENTERPRISES INC. lockup — allowed only in spacious lower brand bands / footer / exit regions.', actors: ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'], viewports: [], theme: null,
    governs: ['BRAND_EXIT_BAND logo', 'footer logo'], extracted: ['Monogram + ALL IN ONE / ENTERPRISES INC. wordmark'],
    defects: ['Raster reference on a background — no transparent production lockup for light and dark bands (runtime asset gap).'],
  }),
  f({
    ref_id: 'SIMPLE_NAV_MARK', bundle_path: '00_BRAND/AIO_SIMPLE_NAV_MARK.jpeg', sha256: '31f7dfa144f9909af9281b544c6929e69ca7f117adc4d4624788320b4bda475a', bytes: 229241, media: 'image/jpeg', dimensions: '1254x1254', folder: '00_BRAND',
    authority_kind: 'BRAND_AUTHORITY', role: 'Simple AIO mark — the only logo allowed in tight / top navigation, app launchers and favicons.', actors: ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'], viewports: [], theme: null,
    governs: ['TOP_NAV mark', 'favicon / app launcher'], extracted: ['Monogram on a dark rounded tile with a silver rim'],
    defects: ['Only a dark-tile raster exists — no light-theme or transparent vector mark for the LIGHT_PRIMARY client / staff nav (runtime asset gap).'],
  }),
  f({
    ref_id: 'CLIENT_3_TERRITORIES', bundle_path: '01_TERRITORY_SELECTION/AIO_IFTA_CLIENT_3_TERRITORIES.jpeg', sha256: '817f3c4f9adc7269d5c27d7f950a326965ac1af6296301c2f27acf0b53c9c91a', bytes: 694320, media: 'image/jpeg', dimensions: '1448x1086', folder: '01_TERRITORY_SELECTION',
    authority_kind: 'TERRITORY_SELECTION', role: 'The three original client composition territories (gate step 04–05): 01 THE EXECUTIVE DOSSIER · 02 THE SPATIAL WORKROOM · 03 THE ANALYTICS COMMAND. The founder approved 03 rendered LIGHT (LIGHT ANALYTICS COMMAND).', actors: ['CLIENT'], viewports: ['MOBILE'], theme: 'DARK (selection board)',
    governs: ['territory lineage', 'distinctness proof'],
    extracted: ['01 EXECUTIVE DOSSIER — cinematic office hero, quarter overview card, horizontal 4-step stepper, physical Q3 2026 IFTA FILING PACKET binder beside a 6-line checklist, recent uploads + jurisdiction breakdown, NEXT ACTION bar', '02 SPATIAL WORKROOM — immersive glass-room hero, circular 4-step stepper, six glass cubes on a round platform (one per checklist line), jurisdiction map + recent uploads, CONTINUE bar', '03 ANALYTICS COMMAND — highway hero with IN PROGRESS chip, metrics rail with sparklines, TAB BAR (PROGRESS · FUEL PURCHASES · MILEAGE · VEHICLES · JURISDICTIONS · DOCUMENTS), vertical 4-step workflow + AIO PREPARATION checklist panel, jurisdiction map, recent uploads, AIO insights, GO TO REVIEW MILEAGE SUMMARY rail'],
    defects: ['01 copy “ORGANIZED. AUTOMATED. HANDLED BY AIO.” overstates automation (not selected; recorded only).'],
  }),
  f({
    ref_id: 'ACTOR_MODES_MOBILE', bundle_path: '01_TERRITORY_SELECTION/AIO_IFTA_3_ACTOR_MODES_MOBILE.jpeg', sha256: '1be8c6926ac2966b51ddee7b409d60168786fd922777a73210582cd9db5c7164', bytes: 692739, media: 'image/jpeg', dimensions: '1536x1024', folder: '01_TERRITORY_SELECTION',
    authority_kind: 'ACTOR_MODE_DERIVATION', role: 'Three actor modes derived from the client parent (gate derivation): CLIENT light · FOUNDER / STAFF light dense with dark operational accents · PUBLIC dark cinematic. Governs staff and public MOBILE.', actors: ['CLIENT', 'FOUNDER_STAFF', 'PUBLIC'], viewports: ['MOBILE'], theme: 'LIGHT · LIGHT_DENSE · DARK',
    governs: ['FOUNDER_STAFF mobile', 'PUBLIC mobile', 'actor differentiation'],
    extracted: ['CLIENT (ALEX R. CLIENT): parent composition; tabs PROGRESS … DOCUMENTS + NOTES', 'STAFF (TAYLOR M. AIO STAFF): CLIENT HEALTH dark panel (data completeness 98%, fuel receipts 24/24, jurisdictions 8/8, review readiness ON TRACK) + LOW RISK chip; tabs OVERVIEW · FUEL PURCHASES · MILEAGE · VEHICLES · JURISDICTIONS · DOCUMENTS · NOTES; FILING WORKFLOW with dates; QUARTER TASKS; MILEAGE BY JURISDICTION bars; FUEL PURCHASES donut; RECENT CLIENT ACTIVITY; AIO TEAM ACTIVITY; RISKS / FLAGS; OPEN RETURN DRAFT rail; band OPERATIONS · COMPLIANCE · CLIENT SUCCESS', 'PUBLIC: dark; GET STARTED + menu in nav; sample quarter hero + SEE HOW IT WORKS; sample metrics; A CLEAR PATH FROM MILES TO COMPLIANCE; 5 process tiles; 8 JURISDICTIONS ONE RETURN map; BUILT FOR OWNER OPERATORS AND FLEETS (ACCURATE · EFFICIENT · COMPLIANT); band DRIVEN BY COMPLIANCE. BUILT FOR WHAT MOVES YOU.'],
    defects: ['Staff persona TAYLOR M. here vs ALEX R. AIO STAFF on the staff tablet / desktop (sample-data inconsistency).', 'Public copy “simple, organized, and automated” and “we track your fuel, mileage, and routes” overstate current capability (content truth).'],
  }),
  f({
    ref_id: 'CLIENT_MOBILE_PARENT_AUTHORITY', bundle_path: '02_CLIENT_MODE/AIO_IFTA_CLIENT_MOBILE_PARENT_AUTHORITY.jpeg', sha256: '6d36ba747e42da733ed3395c3b53dd46f2b4fbb6df3e149a507e7a104b5e3e97', bytes: 497718, media: 'image/jpeg', dimensions: '1206x2127', folder: '02_CLIENT_MODE',
    authority_kind: 'PARENT_AUTHORITY', role: 'APPROVED CLIENT PARENT AUTHORITY — LIGHT ANALYTICS COMMAND (mobile). Family composition DNA every tab, child, actor and viewport derives from.', actors: ['CLIENT'], viewports: ['MOBILE'], theme: 'LIGHT_PRIMARY',
    governs: ['family shell', 'hero logic', 'metrics rail', 'tab logic', 'process status', 'actionable panels', 'map / data viz', 'recent activity', 'AIO insights', 'next-action rail', 'lower brand band', 'CLIENT / PROGRESS / MOBILE'],
    extracted: ['TOP NAV: simple mark · search · notifications · avatar', 'HERO: IFTA FILING ROOM · Q3 2026 · JUL 1 – SEP 30, 2026 · REAL DATA. REAL PROGRESS. EVERY MILE ACCOUNTED FOR. · IN PROGRESS chip · cinematic truck / mountain highway perimeter', 'METRICS RAIL: 48,320 TOTAL MILES · 7,420 TOTAL FUEL (GAL) · 8 JURISDICTIONS · $2,184.32 EST. TAX DUE', 'TAB BAR: PROGRESS · FUEL PURCHASES · MILEAGE · VEHICLES · JURISDICTIONS · DOCUMENTS (horizontal scroll)', 'CHECKLIST: FUEL PURCHASES 24 of 24 records · MILEAGE BY JURISDICTION processed · VEHICLE & TRIP DATA processed · IFTA RETURN PREPARATION in progress · YOUR REVIEW & APPROVAL pending · FILING & CONFIRMATION pending', 'FILING PROGRESS: 01 DATA COLLECTION complete · 02 AIO PREPARATION in progress · 03 REVIEW & APPROVE pending · 04 FILE & CONFIRM pending', 'JURISDICTION BREAKDOWN map: TX 24% · OK 18% · NM 12% · AR 10% · LA 9% · OTHER 27%', 'RECENT UPLOADS: fuel receipts (24 files) · TA mileage export · fleet CSV upload', 'AIO INSIGHTS · RECENT ACTIVITY', 'NEXT-ACTION RAIL (dark): GO TO REVIEW MILEAGE SUMMARY', 'LOWER BRAND BAND: full lockup · DATA · COMPLIANCE · REAL PROGRESS'],
    defects: ['Upload row label typo “FUEL FUEL RECEIPTS”.', 'EST. TAX DUE shown during AIO PREPARATION although no tax figure exists until staff prepares the return summary (data truth — decision D-EST-TAX).'],
  }),
  f({
    ref_id: 'FUEL_PURCHASES_CHILD_PROOF', bundle_path: '02_CLIENT_MODE/AIO_IFTA_CLIENT_MOBILE_FUEL_PURCHASES_PROOF.jpeg', sha256: 'd6ac1238a7b21637c5114419db7dd00ea77699aeeefc708a234e531807f2af31', bytes: 428732, media: 'image/jpeg', dimensions: '864x1536', folder: '02_CLIENT_MODE',
    authority_kind: 'CHILD_PROOF', role: 'DERIVATION PROOF (not a template): the parent authority propagates into tab-specific page logic for FUEL PURCHASES without reconceptualising the visual language. Founder approved the cohesion.', actors: ['CLIENT'], viewports: ['MOBILE'], theme: 'LIGHT_PRIMARY',
    governs: ['CLIENT / FUEL_PURCHASES / MOBILE', 'tab derivation rule (inherit shell, override task / data / modules / actions / states)'],
    extracted: ['HERO: IFTA FILING ROOM / Q3 2026 FUEL PURCHASES (same perimeter, tab-specific title)', 'METRICS: TOTAL FUEL · RECEIPTS UPLOADED 24 · VENDORS 5 · EST. FUEL SPEND', 'UPLOAD ZONE: drag & drop · PDF, JPG, PNG (MAX 10MB EACH) · CHOOSE FILES', 'RECENT FUEL PURCHASES table: date · vendor · gallons · amount · status (PROCESSED · NEEDS REVIEW · MISSING DETAILS) · row menu', 'RECEIPT STATUS counts: processed 18 · needs review 4 · missing details 2', 'FUEL SPEND BY VENDOR donut · AIO INSIGHTS · RECENT ACTIVITY', 'NEXT-ACTION RAIL: CONTINUE TO MILEAGE BY JURISDICTION'],
    defects: ['No STATE / jurisdiction column although the FUEL PURCHASES contract requires STATE (sprint §12) — implementation adds it inside the table component (content fit, not new design).', 'Third-party fuel-brand logos in vendor cells conflict with the asset sheet rule “do not include any third-party branding” — vendor names render as text.', 'Only three status chips; DUPLICATE and UNREADABLE are required by contract (mapped to the status chip family — see state registry).'],
  }),
  f({
    ref_id: 'CLIENT_TABLET_DESKTOP', bundle_path: '02_CLIENT_MODE/AIO_IFTA_CLIENT_TABLET_DESKTOP.jpeg', sha256: '0984f4e3fb5b5b613a6fc08286e20e8ba1eec2345b819c7236bccbe01fd44a4f', bytes: 629532, media: 'image/jpeg', dimensions: '1448x1086', folder: '02_CLIENT_MODE',
    authority_kind: 'VIEWPORT_DERIVATION', role: 'Client TABLET (recomposed two-column) + DESKTOP (expanded three-column workspace) derived from the parent.', actors: ['CLIENT'], viewports: ['TABLET', 'DESKTOP'], theme: 'LIGHT_PRIMARY',
    governs: ['CLIENT / * / TABLET', 'CLIENT / * / DESKTOP'],
    extracted: ['TABLET: hero + metrics rail full width; tab bar; 2-col rows (FILING PROGRESS | QUICK ACTIONS), (JURISDICTION BREAKDOWN | RECENT UPLOADS), (AIO INSIGHTS | RECENT ACTIVITY); full-width GO TO REVIEW MILEAGE SUMMARY rail; lockup band', 'DESKTOP: hero with account card; metrics rail; tab bar + NOTES + quarter selector Q3 2026 ▾; 3-col rows (FILING PROGRESS WORKFLOW with dates | QUARTER TASKS | MILEAGE BY JURISDICTION bars), (JURISDICTION BREAKDOWN | FUEL PURCHASES donut | VEHICLE & TRIP DATA trucks 101–104), (RECENT UPLOADS table | RECENT ACTIVITY table | AIO INSIGHTS); CTA rail beside the lockup band (OPERATIONS · COMPLIANCE · CLIENT SUCCESS)'],
    defects: ['Desktop shows staff-only content in client mode: CLIENT: ALEX R. / ACCOUNT #AIO-1042 card, CLIENT HEALTH button, QUARTER TASKS with “Internal QA” and “Check jurisdiction rates” (decision D-CLIENT-DESKTOP-STAFF-MODULES).', 'Desktop adds a NOTES tab not in the approved parent’s six tabs (decision D-NOTES-TAB).'],
  }),
  f({
    ref_id: 'FOUNDER_STAFF_TABLET_DESKTOP', bundle_path: '03_FOUNDER_STAFF_MODE/AIO_IFTA_FOUNDER_STAFF_TABLET_DESKTOP.jpeg', sha256: 'dd249db9be9334d13265dc2c9ae48f6739121f2c04436a2bf0dbd781237052b2', bytes: 654197, media: 'image/jpeg', dimensions: '1448x1086', folder: '03_FOUNDER_STAFF_MODE',
    authority_kind: 'VIEWPORT_DERIVATION', role: 'Founder / staff TABLET (1024×1366) + DESKTOP (1440×1024): the same filing room as a single client-quarter CASE FILE — light primary, denser, dark operational accents.', actors: ['FOUNDER_STAFF'], viewports: ['TABLET', 'DESKTOP'], theme: 'LIGHT_PRIMARY + DARK_OPERATIONAL_ACCENTS',
    governs: ['FOUNDER_STAFF / CASE / TABLET', 'FOUNDER_STAFF / CASE / DESKTOP'],
    extracted: ['HERO: IFTA FILING ROOM Q3 2026 · CLIENT: ALEX R. ACCOUNT #AIO-1042 · IN PROGRESS · dark CLIENT HEALTH panel (data completeness 98% · fuel receipts 24/24 · jurisdictions 8/8 · return readiness ON TRACK) + LOW RISK', 'METRICS with deltas vs Q2 2026 (+6% · +3% · no change · −12%)', 'TABS: OVERVIEW · FUEL PURCHASES · MILEAGE · VEHICLES · JURISDICTIONS · DOCUMENTS · NOTES + EXPORT REPORT', 'FILING WORKFLOW with dates · QUARTER TASKS with assignee initials + due dates · IMPORTANT DATES (return period · draft target Oct 28 · client review Oct 30 · file & pay deadline Oct 31)', 'MILEAGE BY JURISDICTION bars · FUEL PURCHASES donut with gallons · VEHICLES (Unit 101–105, view all 12)', 'RECENT CLIENT ACTIVITY (type · activity · date · by) · AIO TEAM ACTIVITY (user · activity · date) · RISKS / FLAGS (no issues · jurisdiction changes · review recommended · missing documents: 1 fuel receipt Unit 104)', 'OPEN RETURN DRAFT dark rail · lockup band OPERATIONS · COMPLIANCE · CLIENT SUCCESS'],
    defects: ['Single client-quarter only — no dedicated image for the multi-client FUEL TAX QUEUE (contract work_queue). Founder authorised derivation from this authority (D-STAFF-QUEUE-AUTHORITY) → DERIVED_AUTHORITY.'],
  }),
  f({
    ref_id: 'PUBLIC_TABLET_DESKTOP', bundle_path: '04_PUBLIC_CUSTOMER_MODE/AIO_IFTA_PUBLIC_TABLET_DESKTOP.jpeg', sha256: 'fba90e92f422552449c6f1986446d829d92fa94ed9d4fed69782fac25c86dcf1', bytes: 728775, media: 'image/jpeg', dimensions: '1448x1086', folder: '04_PUBLIC_CUSTOMER_MODE',
    authority_kind: 'VIEWPORT_DERIVATION', role: 'Public / customer TABLET + DESKTOP: a dark cinematic service experience derived from the same family DNA — not the client app with data hidden.', actors: ['PUBLIC'], viewports: ['TABLET', 'DESKTOP'], theme: 'DARK_PRIMARY_CINEMATIC',
    governs: ['PUBLIC / ROOT / TABLET', 'PUBLIC / ROOT / DESKTOP'],
    extracted: ['NAV (desktop): IFTA FILING ROOM · HOW IT WORKS · FEATURES · JURISDICTIONS · RESOURCES · search · GET STARTED; (tablet) search · GET STARTED · menu', 'HERO: sample Q3 2026 quarter · SEE HOW IT WORKS · sample metrics rail', 'A CLEAR PATH FROM MILES TO COMPLIANCE copy + GET STARTED + REAL DRIVERS. REAL ROADS. REAL COMPLIANCE. image card', 'OUR IFTA PROCESS KEEPS YOU ON TRACK: 01 FUEL PURCHASES · 02 MILEAGE BY JURISDICTION · 03 VEHICLE & TRIP DATA · 04 RETURN PREPARATION · 05 FILING & CONFIRMATION', '8 JURISDICTIONS ONE RETURN map · BUILT FOR OWNER OPERATORS AND FLEETS: ACCURATE · EFFICIENT · COMPLIANT', 'Lower brand band: full lockup · DRIVEN BY COMPLIANCE. BUILT FOR WHAT MOVES YOU. · DATA | COMPLIANCE | REAL PROGRESS'],
    defects: ['Copy claims (“calculate your return”, “we calculate your IFTA return for you”, “submit with confidence”, “automated tracking”, “track miles by state or province”) exceed current truth: staff-coordinated filing, no government API, no tax engine, US states only (decision D-PUBLIC-COPY-TRUTH).', 'Sample quarter metrics must be labelled SAMPLE — public mode never shows private client data.', 'RESOURCES nav item has no section composition in the reference.'],
  }),
  f({
    ref_id: 'PAGE_COMPONENT_INTERACTION_CONTRACT', bundle_path: '06_CONTRACTS/AIO_IFTA_PAGE_COMPONENT_INTERACTION_CONTRACT.png', sha256: 'b005a82c802910a4271341976eb15e00dbf6a323398e32e7cae5578db665ccce', bytes: 1836915, media: 'image/png', dimensions: '1448x1086', folder: '06_CONTRACTS',
    authority_kind: 'CONTRACT_AUTHORITY', role: 'Page / component / interaction contract: page family overview, actor modes, tab contracts, component stack, interactions, states, responsive notes, data relationships.', actors: ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'], viewports: ['MOBILE', 'TABLET', 'DESKTOP'], theme: null,
    governs: ['tab contracts', 'component stack', 'interaction list', 'UI states', 'responsive notes', 'data relationships'],
    extracted: ['01 page family overview: purpose · trust tone · shared shell', '02 actor modes: client light · founder / staff light · public dark', '03 tab contracts: PROGRESS (track end-to-end filing progress) · FUEL PURCHASES (manage and verify fuel receipts) · MILEAGE (track mileage by jurisdiction) · VEHICLES (manage vehicle and trip data) · JURISDICTIONS (configure jurisdictions and tax rules) · DOCUMENTS (manage filing documents and records)', '04 component stack: 01 hero banner · 02 metrics rail · 03 tab bar · 04 workflow status · 05 task list / cards · 06 map panel · 07 recent uploads · 08 insights panel · 09 recent activity · 10 bottom CTA rail · 11 footer lockup', '05 interactions: 01 upload receipt · 02 import CSV · 03 open detail drawer · 04 filter / sort · 05 verify record · 06 request correction · 07 review draft · 08 message team · 09 run FAQs (label founder-supplied — glyphs garbled in this image; no behaviour line) · 10 submit for approval · 11 file & confirm', '06 states: DEFAULT · LOADING · EMPTY (“No fuel purchases yet. Upload receipts or import your CSV file.”) · SUCCESS (“Record verified and saved.”) · WARNING / EXCEPTION (“Mileage outside expected range. Please review.”) · ERROR (“File could not be processed. Please check and try again.”)', '07 responsive: mobile single column, stacked cards, bottom CTA · tablet two-column flexible modules · desktop multi-column full workspace', '08 data relationships: fuel receipts + mileage logs + vehicles → jurisdictions (rates, rules, allocation) → tax estimate (liabilities by jurisdiction) → filing documents'],
    defects: ['Interaction 09 label glyphs are garbled in this image (“…FAQS”); the founder supplied a clearer image confirming “09 RUN FAQS” (D-INTERACTION-09, DECIDED). No behaviour line is legible — IDENTITY_RESOLVED / BEHAVIOR_DESCRIPTION_PARTIAL, behaviour never guessed.', 'JURISDICTIONS “configure jurisdictions and tax rules / manage settings” is a staff capability; AIO holds no tax-rate table (data reconciliation).', 'VEHICLES “add / deactivate” belongs to the fleet profile; the quarter only records participation.'],
  }),
  f({
    ref_id: 'ICON_ASSET_SHEET', bundle_path: '06_CONTRACTS/AIO_IFTA_ICON_ASSET_SHEET.png', sha256: '42931fe1c6f9d8da07bf7bbf931dcd02964a236ec658e223ca6f197cb020626e', bytes: 1497422, media: 'image/png', dimensions: '1448x1086', folder: '06_CONTRACTS',
    authority_kind: 'ASSET_AUTHORITY', role: 'Icon / asset sheet: brand-mark usage, IFTA UI color tokens, icon families, UI asset tiles, micro-styles, theme rules, typography and usage notes.', actors: ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'], viewports: [], theme: null,
    governs: ['icon families', 'status chips', 'buttons', 'tabs', 'cards', 'file badges', 'map legend', 'shadow levels', 'IFTA UI color tokens'],
    extracted: ['Brand mark usage: top nav icon mark only (top navigation, app launchers, favicons) · footer full lockup only (includes tagline)', 'Color tokens: WHITE #FFFFFF (backgrounds, surfaces) · BLACK #0B0B0B (primary text, headings) · CHARCOAL #1F2937 (nav, footers, containers) · WARM GOLD #F4B223 (CTAs, highlights, active states) · SOFT GRAY #E5E7EB (borders, dividers) · SUCCESS GREEN #10B981 (complete) · IN-PROGRESS BLUE #3B82F6 (in progress, active) · WARNING AMBER #F59E0B (attention, warnings)', 'Icon families: METRICS (miles · fuel · tax due · jurisdictions) · WORKFLOW (data collection · prepare return · review & approve · send · file & confirm) · NAVIGATION (overview · filing · documents · vehicles · support · settings) · FILE / DOCUMENT (PDF · Excel · CSV · Document · Image · Text · Archive · Upload) · STATUS (complete · in progress · pending · attention) · COMMUNICATION / ACTION (search · notification · users · message · open / launch · more)', 'UI asset tiles: hero truck image treatment · jurisdiction map style · upload / document row card · avatar chip · search · notification · tab pill · metric card · CTA rail · progress step badge', 'Micro-styles: buttons primary gold / secondary outline / tertiary text · tabs active / inactive / hover / disabled (NOTES shown disabled) · card radius 12px, subtle shadow · divider 1px · status chips complete green / in progress blue / pending gray / attention amber · file badges PDF / XLS / CSV / DOC · map legend · shadow levels 1–3', 'Theme rules: client light (full features, self-service workflow) · founder / staff light (advanced tools, client management) · public dark (simplified, education)', 'Typography: headings INTER TIGHT uppercase bold / semibold · subheadings INTER TIGHT uppercase medium · body INTER uppercase regular, wider tracking (+2%)', 'Usage notes: uppercase throughout · top nav icon mark only · full lockup only in footers · consistent spacing, corners (12px) and shadows · no legacy shell or third-party branding · approved AIO visual language, colors and icons'],
    defects: ['Color tokens and typography differ from the brand DNA board (decisions D-BRAND-TOKENS and D-TYPOGRAPHY).', 'Raster only — no vector icon set (runtime asset gap).'],
  }),
  f({
    ref_id: 'BUNDLE_README', bundle_path: 'README.txt', sha256: 'd025524142392d9cd3a3de8fd0b12e354a01ef20e9fcdef31e83d16956c31b19', bytes: 1311, media: 'text/plain', dimensions: null, folder: '.',
    authority_kind: 'PACKAGE_META', role: 'Package rules and contents; next pipeline step: authority bundle ingest → tab / page / state tree proof → founder confirmation → authority-driven implementation.', actors: [], viewports: [], theme: null,
    governs: ['package rules'], extracted: ['Legacy AIO visuals have ZERO design authority', 'SIMPLE AIO MARK only in tight / top navigation; FULL LOGO LOCKUP reserved for spacious lower brand bands / footer-style areas', 'CLIENT LIGHT · FOUNDER / STAFF LIGHT with denser operational intelligence · PUBLIC DARK cinematic', 'Typography UPPERCASE primary', 'Parent authority defines family composition DNA; tabs / children derive from it', 'Implementation may increase fidelity but may not violate core composition logic'],
  }),
  f({
    ref_id: 'BUNDLE_MANIFEST', bundle_path: 'manifest.json', sha256: '220ac976a75c60d27f97ee2df0f8637e0c5017abc0893d349505f5742d65ba70', bytes: 1194, media: 'application/json', dimensions: null, folder: '.',
    authority_kind: 'PACKAGE_META', role: 'Machine manifest of the bundle (12 images + README).', actors: [], viewports: [], theme: null,
    governs: ['package rules'], extracted: ['legacy_visual_authority FORBIDDEN', 'client_theme LIGHT_PRIMARY', 'founder_staff_theme LIGHT_PRIMARY_DENSE_OPERATIONAL', 'public_theme DARK_PRIMARY_CINEMATIC', 'top_nav_logo_rule SIMPLE_MARK_ONLY', 'lower_brand_band_logo_rule FULL_LOCKUP_ALLOWED', 'typography_rule UPPERCASE_PRIMARY'],
  }),
];

/** Manifest values (verbatim). */
export const AIO_IFTA_BUNDLE_MANIFEST = {
  project: 'ALL IN ONE ENTERPRISES INC',
  feature_family: 'IFTA / FUEL TAX',
  bundle_name: 'AIO_IFTA_AUTHORITY_BUNDLE',
  legacy_visual_authority: 'FORBIDDEN',
  client_theme: 'LIGHT_PRIMARY',
  founder_staff_theme: 'LIGHT_PRIMARY_DENSE_OPERATIONAL',
  public_theme: 'DARK_PRIMARY_CINEMATIC',
  top_nav_logo_rule: 'SIMPLE_MARK_ONLY',
  lower_brand_band_logo_rule: 'FULL_LOCKUP_ALLOWED',
  typography_rule: 'UPPERCASE_PRIMARY',
} as const;

/** Folders the README names that the package does not contain (05 is skipped in the package numbering). */
export const AIO_IFTA_BUNDLE_ABSENT_FOLDERS = ['05_* (no folder 05 in the package; numbering skips from 04 to 06)'];

/* ─────────────────────────────── brand authority ─────────────────────────────── */

export const AIO_LOGO_RULES = {
  status: 'LOCKED',
  top_nav: { rule: 'SIMPLE_MARK_ONLY', asset_ref: 'SIMPLE_NAV_MARK', applies_to: ['top navigation', 'tight navigation', 'app launchers', 'favicons'], forbidden: 'the full text lockup in tight navigation' },
  lower_band: { rule: 'FULL_LOCKUP_ALLOWED', asset_ref: 'FULL_LOGO_LOCKUP', applies_to: ['spacious lower brand band', 'footer', 'exit region'] },
  source: ['sprint §4 (THIS RULE IS LOCKED)', 'manifest top_nav_logo_rule / lower_brand_band_logo_rule', 'ICON_ASSET_SHEET §1 brand mark usage'],
} as const;

export const AIO_ACTOR_THEMES = {
  PUBLIC: { theme: 'DARK_PRIMARY', manifest: 'DARK_PRIMARY_CINEMATIC', role: ['CINEMATIC', 'BRAND-FORWARD', 'ASPIRATIONAL', 'SERVICE EXPLANATION', 'CONVERSION'], asset_sheet: 'dark, simplified, focused on education' },
  CLIENT: { theme: 'LIGHT_PRIMARY', manifest: 'LIGHT_PRIMARY', role: ['CALM', 'CLEAR', 'GUIDED', 'OPERATIONAL', 'LONG-SESSION FRIENDLY'], asset_sheet: 'light, full features, self-service workflow' },
  FOUNDER_STAFF: { theme: 'LIGHT_PRIMARY + DARK_OPERATIONAL_ACCENTS', manifest: 'LIGHT_PRIMARY_DENSE_OPERATIONAL', role: ['DENSER', 'HIGHER VISIBILITY', 'MORE CONTROL', 'MORE EXCEPTIONS', 'MORE OPERATIONAL INTELLIGENCE'], asset_sheet: 'light, advanced tools, client management', dark_operational_accents: ['CLIENT HEALTH panel', 'OPEN RETURN DRAFT rail', 'LOW RISK / risk chips'] },
} as const;

export type BrandToken = { token: string; hex: string; role: string; source: BundleRefId };

export const AIO_BRAND_PALETTE: BrandToken[] = [
  { token: 'OBSIDIAN', hex: '#050505', role: 'primary background (dark / public)', source: 'BRAND_DNA_BOARD' },
  { token: 'CHARCOAL', hex: '#1A1A1A', role: 'secondary surfaces', source: 'BRAND_DNA_BOARD' },
  { token: 'SIGNATURE_GOLD', hex: '#D4A853', role: 'primary accent', source: 'BRAND_DNA_BOARD' },
  { token: 'CHAMPAGNE', hex: '#EBD9B7', role: 'supporting accent', source: 'BRAND_DNA_BOARD' },
  { token: 'PLATINUM', hex: '#C0C6CC', role: 'secondary metallic', source: 'BRAND_DNA_BOARD' },
  { token: 'STONE_WHITE', hex: '#F6F6F4', role: 'light background (authenticated workspaces)', source: 'BRAND_DNA_BOARD' },
];

export const AIO_IFTA_UI_TOKENS: BrandToken[] = [
  { token: 'WHITE', hex: '#FFFFFF', role: 'backgrounds, surfaces', source: 'ICON_ASSET_SHEET' },
  { token: 'BLACK', hex: '#0B0B0B', role: 'primary text, headings', source: 'ICON_ASSET_SHEET' },
  { token: 'CHARCOAL', hex: '#1F2937', role: 'nav, footers, containers', source: 'ICON_ASSET_SHEET' },
  { token: 'WARM_GOLD', hex: '#F4B223', role: 'CTAs, highlights, active states', source: 'ICON_ASSET_SHEET' },
  { token: 'SOFT_GRAY', hex: '#E5E7EB', role: 'borders, dividers', source: 'ICON_ASSET_SHEET' },
  { token: 'SUCCESS_GREEN', hex: '#10B981', role: 'complete, success states', source: 'ICON_ASSET_SHEET' },
  { token: 'IN_PROGRESS_BLUE', hex: '#3B82F6', role: 'in progress, active states', source: 'ICON_ASSET_SHEET' },
  { token: 'WARNING_AMBER', hex: '#F59E0B', role: 'attention, warnings', source: 'ICON_ASSET_SHEET' },
];

/** Where the two sources define the same role differently. Functional tokens the DNA board does not define are not conflicts. */
export const AIO_TOKEN_CONFLICTS = [
  { role: 'primary accent / CTA gold', brand: 'SIGNATURE_GOLD #D4A853', ifta_sheet: 'WARM_GOLD #F4B223', resolution: 'SIGNATURE_GOLD #D4A853 (D-BRAND-TOKENS)' },
  { role: 'charcoal surfaces / containers', brand: 'CHARCOAL #1A1A1A', ifta_sheet: 'CHARCOAL #1F2937', resolution: 'CHARCOAL #1A1A1A (D-BRAND-TOKENS)' },
  { role: 'darkest ink / background', brand: 'OBSIDIAN #050505', ifta_sheet: 'BLACK #0B0B0B', resolution: 'OBSIDIAN #050505 (D-BRAND-TOKENS)' },
  { role: 'light background', brand: 'STONE_WHITE #F6F6F4', ifta_sheet: 'WHITE #FFFFFF', resolution: 'STONE_WHITE #F6F6F4 for the brand light background; WHITE #FFFFFF stays only as the functional surface (cards / panels on light bodies)' },
];

/**
 * D-BRAND-TOKENS (DECIDED): the brand DNA board wins every shared brand role; the IFTA asset sheet supplies functional
 * tokens only where the board is silent and never redefines a brand role.
 */
export const AIO_RESOLVED_TOKENS = {
  decision: 'D-BRAND-TOKENS',
  brand_roles: AIO_BRAND_PALETTE,
  functional_tokens: AIO_IFTA_UI_TOKENS.filter((t) => ['SUCCESS_GREEN', 'IN_PROGRESS_BLUE', 'WARNING_AMBER', 'SOFT_GRAY', 'WHITE'].includes(t.token))
    .map((t) => (t.token === 'WHITE' ? { ...t, role: 'functional white surface (cards / panels on light bodies) — not the brand light background' } : t)),
  not_adopted: AIO_IFTA_UI_TOKENS.filter((t) => ['WARM_GOLD', 'BLACK', 'CHARCOAL'].includes(t.token)).map((t) => ({ ...t, reason: 'redefines a brand role the DNA board already governs' })),
};

export const AIO_TYPOGRAPHY_AUTHORITY = {
  rule: 'UPPERCASE_PRIMARY',
  locked: ['UPPERCASE primary throughout the UI (sprint §3, manifest, README, asset sheet usage notes)'],
  brand_dna_board: { headline: 'MONUMENT EXTENDED', secondary: 'INTER', accent_label: 'BEBAS NEUE' },
  ifta_asset_sheet: { headings: 'INTER TIGHT — uppercase, bold / semibold', subheadings: 'INTER TIGHT — uppercase, medium', body: 'INTER — uppercase, regular, wider tracking (+2%)' },
  agreement: 'INTER is common to both.',
  conflict: 'Display face: MONUMENT EXTENDED (+ BEBAS NEUE labels) on the brand board vs INTER TIGHT on the IFTA sheet.',
  licensing: 'MONUMENT EXTENDED is a commercial face (not on Google Fonts) — a licence is needed before it can ship; INTER / INTER TIGHT / BEBAS NEUE are open (SIL OFL).',
  supersedes: 'Code tokens Plus Jakarta Sans / DM Sans (src/styles/aio.css) were never founder-locked and have no authority for IFTA.',
  decision: 'D-TYPOGRAPHY',
  resolved: {
    status: 'DECIDED',
    client_staff_ui: { headings: 'INTER TIGHT', body: 'INTER' },
    case: 'UPPERCASE PRIMARY (canonical)',
    public_hero_display: 'MONUMENT EXTENDED only if licensed and approved; otherwise INTER TIGHT',
    runtime_rule: 'The runtime never depends on an unavailable commercial font.',
  },
} as const;

export const AIO_BRAND_AUTHORITY = {
  source_refs: ['BRAND_DNA_BOARD', 'FULL_LOGO_LOCKUP', 'SIMPLE_NAV_MARK', 'ICON_ASSET_SHEET', 'BUNDLE_MANIFEST', 'BUNDLE_README'] as BundleRefId[],
  master_tagline: 'WHERE BUSINESS MEETS THE ROAD.',
  positioning: 'THE BUSINESS OFFICE BEHIND THE TRUCK.',
  product_promise: 'FROM STARTUP TO EVERY MILE AFTER.',
  secondary_line: 'ONE OFFICE. THE WHOLE ROAD AHEAD.',
  voice: ['CLEAR', 'CAPABLE', 'CONNECTED', 'HUMAN'],
  visual_language: ['EXECUTIVE INDUSTRIAL', 'MODERN INFRASTRUCTURE', 'OPERATIONAL LUXURY'],
  material_world: ['BLACK', 'GOLD', 'SILVER', 'OBSIDIAN', 'CHARCOAL', 'STONE', 'CHAMPAGNE', 'WHITE / IVORY FOR AUTHENTICATED WORKSPACES'],
  palette: AIO_BRAND_PALETTE,
  ifta_ui_tokens: AIO_IFTA_UI_TOKENS,
  token_conflicts: AIO_TOKEN_CONFLICTS,
  resolved_tokens: AIO_RESOLVED_TOKENS,
  typography: AIO_TYPOGRAPHY_AUTHORITY,
  logo: AIO_LOGO_RULES,
  actor_themes: AIO_ACTOR_THEMES,
  icon_direction: 'LINEAR · STRUCTURED · PREMIUM',
  photography: ['TRUCKING', 'OPERATIONS', 'PEOPLE', 'INFRASTRUCTURE'],
  materials: ['GOLD', 'BRUSHED METAL', 'CARBON', 'MARBLE', 'ROAD'],
  principles: ['TRUSTED PARTNER', 'INDUSTRY EXPERIENCE', 'NATIONWIDE SUPPORT', 'BUILT FOR GROWTH'],
  lower_band_lines: { CLIENT: 'DATA · COMPLIANCE · REAL PROGRESS', FOUNDER_STAFF: 'OPERATIONS · COMPLIANCE · CLIENT SUCCESS', PUBLIC: 'DRIVEN BY COMPLIANCE. BUILT FOR WHAT MOVES YOU.' },
  imagery_supersession: 'The founder-approved bundle uses cinematic truck-on-highway hero perimeters. This supersedes the earlier IDNTY guidance against generic semi hero shots for the IFTA family (the IDNTY record should be updated by the founder).',
};

/* ─────────────────────────────── sidekick ─────────────────────────────── */

export const AIO_IFTA_SIDEKICK_POLICY = {
  status: 'SIDEKICK_FALLBACK_ONLY',
  primary_path: 'COMPLETE AUTHORITY PACKAGE → IMPLEMENT',
  allowed_only_for: ['TRUE MISSING RUNTIME ASSET', 'UNFORESEEN RESPONSIVE ASSET GAP', 'EXPLICIT NEW FOUNDER REQUEST', 'REQUIRED ASSET ABSENT FROM AUTHORITY PACKAGE'],
  invoked_this_sprint: false,
  new_paid_generations: 0,
  credits_spent: 0,
} as const;

export const AIO_IFTA_BUNDLE_REF_IDS = AIO_IFTA_BUNDLE_FILES.map((x) => x.ref_id);
export const bundleFile = (id: BundleRefId): BundleFile => {
  const x = AIO_IFTA_BUNDLE_FILES.find((b) => b.ref_id === id);
  if (!x) throw new Error(`unknown bundle ref ${id}`);
  return x;
};
