/**
 * AIO OFFICE — the founder's four-screen design (HOME · WORK · REPORTS · MORE) reconciled against the office IA and the
 * root authority contracts (P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.EXISTING-DESIGN-RECONCILIATION1).
 *
 * First delivery only: inventory, findings, proposals and open founder decisions. Nothing here is approved, no image is
 * generated, no page / nav / route / schema / auth changes. Every figure drawn in the reference is a design example.
 */
import type {
  AssetPlanItem,
  ContractRef,
  DesignDecision,
  DesignReconciliation,
  DesignVerdict,
  PageReconciliation,
  ProposedSlot,
  ReferenceElement,
  ReferenceElementKind,
  RoleVisibilityRow,
  ViewportPlan,
} from '../../office-design-reconciliation.js';

export const AIO_DESIGN_RECON_SPRINT = 'P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.EXISTING-DESIGN-RECONCILIATION1';
export const AIO_DESIGN_RECON_NEXT_GATE = 'FOUNDER REVIEW OF THE EXISTING DESIGN RECONCILIATION';
export const AIO_DESIGN_RECON_REFERENCE_SHA256 = '47343139eccfe6055479d4f1f0841da74ab87134fd1d62f5f5cded040dd5e961';

const H = 'AIO_OFFICE.HOME';
const W = 'AIO_OFFICE.WORK';
const R = 'AIO_OFFICE.REPORTS';
const M = 'AIO_OFFICE.MORE';
const I = 'AIO_OFFICE.INTAKE';

const root = (id: string): ContractRef => ({ kind: 'ROOT', id });
const region = (id: string): ContractRef => ({ kind: 'REGION', id });
const lane = (id: string): ContractRef => ({ kind: 'LANE', id: `${W}.${id}` });
const entry = (id: string): ContractRef => ({ kind: 'MORE_ENTRY', id: `${M}.${id}` });
const domain = (id: string): ContractRef => ({ kind: 'REPORT_DOMAIN', id: `${R}.${id}` });
const metric = (id: string): ContractRef => ({ kind: 'METRIC', id });
const action = (id: string): ContractRef => ({ kind: 'ACTION', id });
const NONE: ContractRef = { kind: 'NONE', id: null };

type El = Omit<ReferenceElement, 'figures' | 'anti_ai'> & { figures?: string[]; anti_ai?: ReferenceElement['anti_ai'] };
const el = (element_id: string, kind: ReferenceElementKind, label: string, maps_to: ContractRef[], verdict: DesignVerdict, finding: string, o: Partial<El> = {}): ReferenceElement =>
  ({ element_id, kind, label, maps_to, verdict, finding, figures: o.figures ?? [], anti_ai: o.anti_ai ?? [] });
const AI = (flag: string, note: string, severity: 'MATERIAL' | 'MINOR' = 'MINOR') => ({ flag, severity, note });

const HEADER = (s: string) => el(`${s}.header`, 'HEADER', 'ALL IN ONE ENTERPRISES INC. · search · bell · JL · JORDAN L. · AIO STAFF', [NONE], 'KEEP',
  'Logo matches the approved staff header lockup (gold and black mark, ALL IN ONE / ENTERPRISES INC., no dot above the I). Search, alerts and identity are where the approved migration header puts them. The role line must come from the person’s role (FOUNDER or a staff role), never from a name.');
const DOCK = (s: string, active: string) => el(`${s}.dock`, 'NAV', `HOME · INTAKE · WORK · REPORTS · MORE (${active} active)`, [root(H), root(I), root(W), root(R), root(M)], 'KEEP',
  'Exactly the five AIO OFFICE roots in the canonical order, active root in the black-and-gold tile. The live app still shows FILING; that changes only in the implementation sprint.');

/* ════════════════════════════════ the reference, element by element ════════════════════════════════ */

const HOME_ELEMENTS: ReferenceElement[] = [
  HEADER('home'),
  el('home.hero', 'HERO', 'GOOD MORNING, JORDAN. · YOUR OPERATION AT A GLANCE. · Everything moving. Everything that needs you. All in one place.', [root(H)], 'REFINE',
    'Strong cinematic opener (black truck at the warehouse, golden hour) and the right promise. It takes about a third of the phone screen, so the attention cards sit low and the first real item is below the fold. The greeting uses a first name; it must come from the signed-in person.'),
  el('home.card.attention', 'STAT_CARD', '3 · CLIENTS · NEED ATTENTION', [region(`${H}.NEEDS_ATTENTION`)], 'REFINE',
    'Right idea, right place. It counts clients, while the contract lists items (an approval, a document, an expiring policy). The card should open the items, not just a number.', { figures: ['3'] }),
  el('home.card.deadlines', 'STAT_CARD', '5 · DEADLINES · THIS WEEK', [region(`${H}.DEADLINES`)], 'REFINE',
    'The only trace of the DEADLINES region. A count alone does not say what is due or for whom.', { figures: ['5'] }),
  el('home.card.blockers', 'STAT_CARD', '2 · BLOCKERS · REQUIRE INPUT', [region(`${H}.BLOCKERS`)], 'REFINE',
    'The only trace of the BLOCKERS region. Blockers group on whom they wait (client, staff, provider, document, approval, payment) — the card should lead to that list.', { figures: ['2'] }),
  el('home.work-across', 'REGION', 'WORK ACROSS AIO · Live activity across all services. · THIS WEEK', [region(`${H}.WORK_ACROSS_AIO`)], 'CORRECT',
    'Shows 8 tiles: 7 of the 12 lanes plus INTAKE. Missing VEHICLES & FLEET, FACTORING, DRIVERS & CARRIERS, MECHANIC / MAINTENANCE, ROAD READY. “Live activity” is not true today: every office figure comes from the demo store.',
    { anti_ai: [AI('FAKE_EDITORIAL_COPY', '“Live activity” claims live data that does not exist yet.')] }),
  el('home.tile.intake', 'TILE', 'Intake · 12 in progress', [root(I)], 'REMOVE', 'INTAKE is its own root in the dock, not a service lane. Migration items still reach HOME through NEEDS ATTENTION (blocked files, activation waiting).', { figures: ['12'], anti_ai: [AI('DUPLICATED_NAV_ITEM', 'INTAKE appears as a lane and as a dock root.')] }),
  el('home.tile.permitting', 'TILE', 'Permitting · 8 active', [lane('PERMITTING_AUTHORITIES')], 'REFINE', 'Lane name is PERMITTING & AUTHORITIES.', { figures: ['8'] }),
  el('home.tile.filing', 'TILE', 'Filing (IFTA) · 14 open', [lane('FILING_FUEL_TAXES')], 'CORRECT', 'Lane name is FILING & FUEL TAXES; IFTA is one workspace inside it.', { figures: ['14'] }),
  el('home.tile.compliance', 'TILE', 'Compliance · 6 require attention', [lane('COMPLIANCE')], 'KEEP', 'Right lane, right kind of figure (needs attention).', { figures: ['6'] }),
  el('home.tile.dispatch', 'TILE', 'Dispatch · 24 active loads', [lane('DISPATCH')], 'KEEP', 'Right lane.', { figures: ['24'] }),
  el('home.tile.brokerage', 'TILE', 'Brokerage · 6 shipments', [lane('BROKERAGE')], 'REFINE', 'Right lane. The brokerage business line is paused today; the tile should say so rather than show activity.', { figures: ['6'] }),
  el('home.tile.insurance', 'TILE', 'Insurance · 5 renewals', [lane('INSURANCE')], 'KEEP', 'Right lane; renewals are the lane’s real attention source.', { figures: ['5'] }),
  el('home.tile.bookkeeping', 'TILE', 'Bookkeeping · 11 clients', [lane('BOOKKEEPING')], 'REFINE', 'Right lane. WORK draws the same lane as “5 clients” — two different figures for one lane.', { figures: ['11'] }),
  el('home.clients', 'REGION', 'CLIENTS IN MOTION · Recent activity across your clients. · VIEW ALL', [region(`${H}.CLIENTS_IN_MOTION`)], 'REFINE',
    'Good row design: client, service chips, status, time. Missing the next deadline and the blocking condition the contract asks for. The client badges are invented logo marks.',
    { anti_ai: [AI('MUTATED_MARK', 'Each client badge is an invented emblem; real clients have no such marks. Use initials.')] }),
  el('home.client.riverstone', 'ROW', 'Riverstone Logistics · IFTA · Bookkeeping · Compliance · Needs your approval · 2h ago', [region(`${H}.CLIENTS_IN_MOTION`)], 'KEEP', 'Sample client. “Needs your approval” is a real status family (APPROVAL_REQUIRED).', { figures: ['2h ago'] }),
  el('home.client.delta', 'ROW', 'Delta Hauling LLC · Permits · Insurance · Documents received · 4h ago', [region(`${H}.CLIENTS_IN_MOTION`)], 'REFINE', 'Sample client. Chip “Permits” should read PERMITTING & AUTHORITIES (or a short form the whole set uses).', { figures: ['4h ago'] }),
  el('home.client.tk', 'ROW', 'T&K Transport · Dispatch · IFTA · Filing ready · 6h ago', [region(`${H}.CLIENTS_IN_MOTION`)], 'KEEP', 'Sample client.', { figures: ['6h ago'] }),
  el('home.activity', 'REGION', 'RECENT ACTIVITY · Latest updates across AIO. · VIEW ALL · 4 events', [region(`${H}.RECENT_ACTIVITY`)], 'KEEP',
    'Each line maps onto an event the code already records (filing prepared, intake started, document received, approval). The small gold bullets carry no meaning; an event-type mark would.', { figures: ['1h ago', '3h ago', '5h ago', '6h ago'] }),
  DOCK('home', 'HOME'),
];

const workCard = (id: string, label: string, ref: ContractRef, verdict: DesignVerdict, finding: string, figures: string[], anti_ai: ReferenceElement['anti_ai'] = []) =>
  el(`work.card.${id}`, 'LANE_CARD', label, [ref], verdict, finding, { figures, anti_ai });

const WORK_ELEMENTS: ReferenceElement[] = [
  HEADER('work'),
  el('work.hero', 'HERO', 'GET THINGS DONE. · EVERY SERVICE. EVERY CLIENT. · Access all AIO workspaces and drive your operation forward.', [root(W)], 'REFINE',
    'Warm office scene that separates WORK from HOME’s road. Same height problem as HOME: the directory starts below the fold.', { anti_ai: [AI('RANDOM_BOTANICALS', 'Potted plants and greenery carry no AIO meaning.')] }),
  el('work.directory', 'REGION', 'SERVICE WORKSPACES · Manage active work across all AIO services.', [region('WORK.LANE_SWITCHER')], 'KEEP', 'The photographic directory is the page’s strongest idea and stays.'),
  workCard('intake', 'Intake · 12 active', root(I), 'REMOVE', 'INTAKE has its own dock root; it is not one of the twelve lanes. Its slot goes to VEHICLES & FLEET.', ['12'], [AI('DUPLICATED_NAV_ITEM', 'INTAKE drawn as a lane card and a dock root.', 'MATERIAL')]),
  workCard('permitting', 'Permitting & Authorities · 18 active', lane('PERMITTING_AUTHORITIES'), 'ASSET_PASS', 'Right lane and name. HOME draws the same lane as “8 active”. The photo has a fake “PERMITS” form.', ['18'], [AI('AI_TYPOGRAPHY_ARTIFACTS', 'Generated “PERMITS” heading and unreadable form text.')]),
  workCard('filing', 'Filing & Fuel Taxes · 14 open', lane('FILING_FUEL_TAXES'), 'ASSET_PASS', 'Right lane and name. The photo (a jar on a stump by a mountain road) says nothing about filing and nearly repeats the Brokerage photo.', ['14'], [AI('RANDOM_BOTANICALS', 'Stump, jar and greenery in a filing image.')]),
  workCard('compliance', 'Compliance · 9 active', lane('COMPLIANCE'), 'ASSET_PASS', 'Right lane. HOME counts “6 require attention” for it. The DOT clipboard text is generated.', ['9'], [AI('AI_TYPOGRAPHY_ARTIFACTS', 'Generated “DOT” clipboard and unreadable text.')]),
  workCard('dispatch', 'Dispatch · 24 active loads', lane('DISPATCH'), 'KEEP', 'Right lane, clear subject (a truck at the dock).', ['24']),
  workCard('brokerage', 'Brokerage · 6 shipments', lane('BROKERAGE'), 'ASSET_PASS', 'Right lane. Paused as a business line today. The empty mountain road does not read as brokerage and nearly repeats the Filing photo.', ['6']),
  workCard('insurance', 'Insurance · 7 active', lane('INSURANCE'), 'ASSET_PASS', 'Right lane. HOME counts “5 renewals” for it. The “INSURANCE” form is generated.', ['7'], [AI('AI_TYPOGRAPHY_ARTIFACTS', 'Generated “INSURANCE” heading and unreadable form text.')]),
  workCard('factoring', 'Factoring · 5 clients', lane('FACTORING'), 'ASSET_PASS', 'Right lane. Paperwork photo with garbled text.', ['5'], [AI('AI_TYPOGRAPHY_ARTIFACTS', 'Garbled document text.')]),
  workCard('bookkeeping', 'Bookkeeping · 5 clients', lane('BOOKKEEPING'), 'ASSET_PASS', 'Right lane. HOME counts “11 clients” for it. Calculator and ledger with garbled text.', ['5'], [AI('AI_TYPOGRAPHY_ARTIFACTS', 'Garbled ledger text.')]),
  workCard('drivers', 'Drivers & Carriers · 12 in progress', lane('DRIVERS_CARRIERS'), 'ASSET_PASS', 'Right lane. The driver’s face is covered and the clipboard text is generated; it reads as anonymous rather than professional.', ['12'], [AI('AI_TYPOGRAPHY_ARTIFACTS', 'Generated clipboard form.')]),
  workCard('maintenance', 'Maintenance · 8 open', lane('MECHANIC_MAINTENANCE'), 'REFINE', 'Right lane; its name is MECHANIC / MAINTENANCE. Tire-shop photo fits.', ['8']),
  workCard('road-ready', 'Road Ready · 6 in setup', lane('ROAD_READY'), 'REFINE', 'Right lane. The photo repeats the Dispatch truck. “In setup” implies an engagement state that does not exist yet.', ['6']),
  el('work.banner', 'BANNER', 'NEED TO ASSIGN WORK? · Create a new task, case, or client project.', [action('WORK.ASSIGN'), action('HOME.CREATE_CASE')], 'FOUNDER_DECISION',
    'Creating a case is not built, “client project” does not exist, and the quick task it would create today is not an office work item. Assigning exists only for managers.',
    { anti_ai: [AI('MUTATED_MARK', 'Invented round emblem beside the banner.')] }),
  DOCK('work', 'WORK'),
];

const REPORTS_ELEMENTS: ReferenceElement[] = [
  HEADER('reports'),
  el('reports.hero', 'HERO', 'REAL INSIGHTS. · STRONGER OPERATIONS. · Track performance, review history, and uncover what’s next.', [root(R)], 'REFINE',
    'Fitting desk-and-charts scene. Same height issue; the chart papers are generated.', { anti_ai: [AI('AI_TYPOGRAPHY_ARTIFACTS', 'Generated chart sheets.')] }),
  el('reports.tabs', 'TAB', 'OVERVIEW · CLIENTS · SERVICES · FINANCIAL · EXPORTS', [domain('OVERVIEW'), domain('CLIENTS'), domain('SERVICES'), domain('FINANCIAL_REVENUE'), domain('EXPORTS')], 'CORRECT',
    'Five of the ten report domains. Missing FILING HISTORY, COMPLIANCE, DISPATCH / BROKERAGE, BOOKKEEPING, MIGRATION. FINANCIAL is FINANCIAL / REVENUE and is founder-class (staff only by grant).'),
  el('reports.period', 'ACTION', 'KEY METRICS · This period compared to last. · THIS MONTH', [action('REPORTS.SET_PERIOD')], 'KEEP', 'Period control in the right place.'),
  el('reports.metric.clients', 'METRIC', 'Clients · 48 · +12% · sparkline', [metric('overview.active-clients')], 'CORRECT',
    'A count of ACTIVE clients is supported (PREBUILT never counts). The +12% and the trend line need history the system does not keep.', { figures: ['48', '+12%'] }),
  el('reports.metric.filings', 'METRIC', 'Filings Completed · 36 · +28% · sparkline', [metric('overview.filing-throughput')], 'REFINE',
    'Supported: each filed quarter records when it was filed, so this period and the last can be compared. No report surface exists yet.', { figures: ['36', '+28%'] }),
  el('reports.metric.work', 'METRIC', 'Active Work Items · 62 · −8% · sparkline', [metric('overview.active-work')], 'CORRECT',
    'The count is supported; the −8% and trend need history that is not kept.', { figures: ['62', '−8%'] }),
  el('reports.metric.revenue', 'METRIC', 'Revenue (Est.) · $48.2K · +14% · sparkline', [metric('financial.collected')], 'CORRECT',
    'No “estimated revenue” exists to show. The supported figure is collected service revenue — founder-class, staff only by grant — and today it is demo data. Never an estimate.', { figures: ['$48.2K', '+14%'] }),
  el('reports.services', 'CHART', 'SERVICE ACTIVITY · Work volume by service. · 8 bars', [metric('services.volume')], 'CORRECT',
    'Partial data. Bars cover 7 lanes plus Intake / Migration (which belongs to the MIGRATION domain); five lanes are missing. The bars have no axis but carry their values, which is enough.', { figures: ['36', '28', '22', '18', '14', '12', '11', '9'] }),
  el('reports.filing-history', 'LIST', 'FILING HISTORY · Recent submissions across all clients. · 4 rows', [domain('FILING_HISTORY'), metric('filing.quarters-filed')], 'REFINE',
    'The data exists (filed quarters) but the domain is NOT STARTED as a surface. All four dates are in 2024 — two years old.', { figures: ['Q3 2024', 'Oct 18, 2024', 'Oct 16, 2024', 'Oct 14, 2024', 'Jul 22, 2024'] }),
  el('reports.client-growth', 'CHART', 'CLIENT GROWTH · Active clients over time. · +24% since April · Apr–Sep bars', [metric('overview.client-growth')], 'CORRECT',
    'Not supported: activation dates are written but never read, so growth over time cannot be computed. The bars have no scale and no values.',
    { figures: ['+24%'], anti_ai: [AI('DATA_NOT_ENCODED', 'Bars with no axis or values encode no data.', 'MATERIAL')] }),
  DOCK('reports', 'REPORTS'),
];

const moreRow = (id: string, label: string, ref: ContractRef, verdict: DesignVerdict, finding: string, anti_ai: ReferenceElement['anti_ai'] = []) =>
  el(`more.entry.${id}`, 'ENTRY', label, [ref], verdict, finding, { anti_ai });

const MORE_ELEMENTS: ReferenceElement[] = [
  HEADER('more'),
  el('more.hero', 'HERO', 'YOUR AIO OFFICE. · EVERYTHING WITHIN REACH. · Manage clients, tools, settings and support — all in one place.', [root(M)], 'ASSET_PASS',
    'Calm desk scene that suits a directory. The notebook carries an invented “AIO” wordmark with a gold accent above it — not the approved logo.',
    { anti_ai: [AI('MUTATED_WORDMARK', 'Notebook shows an invented AIO wordmark with a gold accent mark.', 'MATERIAL'), AI('RANDOM_BOTANICALS', 'Rock and leaves around the notebook.')] }),
  el('more.search', 'SEARCH', 'Search tools, clients, documents...', [region('MORE.SEARCH')], 'KEEP', 'Search first is right for a directory.'),
  el('more.directory', 'REGION', 'ADDITIONAL TOOLS · Manage your office and access everything else.', [region('MORE.DIRECTORY')], 'CORRECT',
    '“Additional tools … everything else” frames MORE as leftovers — the junk-drawer reading the contract forbids. Each entry has one purpose and owner.'),
  moreRow('clients', 'Clients · View and manage all client accounts.', entry('CLIENTS'), 'KEEP', 'Right entry and purpose.'),
  moreRow('documents', 'Documents & Vault · Access client documents and internal files.', entry('DOCUMENTS_VAULT'), 'KEEP', 'Right entry. The page must tell staff-only, client-visible, generated and historical documents apart.'),
  moreRow('team', 'Team & Staff · Manage team members and permissions.', entry('TEAM_STAFF'), 'REFINE', 'Right entry. Managing permissions is a founder act; staff see the team, not the role controls.'),
  moreRow('catalog', 'Service Catalog · Configure services, pricing and packages.', entry('SERVICE_CATALOG'), 'REFINE', 'Right entry. Configuring services and pricing is founder-only; today’s pricing is sample data and there are no “packages”.'),
  moreRow('mechanic-network', 'Mechanic Network · Manage providers and maintenance partners.', entry('MECHANIC_NETWORK'), 'KEEP', 'Right entry, correctly kept apart from WORK → MECHANIC / MAINTENANCE.'),
  moreRow('messages', 'Messages · Client and internal communications.', entry('MESSAGES'), 'KEEP', 'Right entry. Internal notes and client messages must look different.'),
  moreRow('settings', 'System Settings · Preferences, integrations and security.', entry('SYSTEM_SETTINGS'), 'KEEP', 'Right entry; privileged areas inside it carry their gates.'),
  moreRow('help', 'Help & Support · Training, resources and live support.', entry('HELP_SUPPORT'), 'REFINE', 'Right entry. There is no live support today; training and SOPs exist.', [AI('FAKE_EDITORIAL_COPY', '“live support” promises a service that does not exist.')]),
  el('more.help-card', 'BANNER', 'NEED HELP? · Access support, training, or request a feature.', [entry('HELP_SUPPORT')], 'FOUNDER_DECISION', 'Repeats the Help & Support row directly above it. “Request a feature” has nowhere to go today.'),
  DOCK('more', 'MORE'),
];

export const AIO_DESIGN_REFERENCE: DesignReconciliation['reference'] = {
  reference_id: 'AIO-OFFICE-FOUR-SCREEN-2026-10-08',
  description: 'Founder’s four-screen mobile direction for AIO OFFICE: HOME, WORK, REPORTS, MORE (one 1536 × 1024 composite).',
  file: { path: 'docs/aio/office-design-reconciliation/reference/AIO_OFFICE_FOUR_SCREEN_REFERENCE.png', width: 1536, height: 1024, sha256: AIO_DESIGN_RECON_REFERENCE_SHA256 },
  drawn_nav: ['HOME', 'INTAKE', 'WORK', 'REPORTS', 'MORE'],
  drawn_identity: { name: 'JORDAN L.', role_label: 'AIO STAFF' },
  screens: [
    { root_id: H, title_as_drawn: 'YOUR OPERATION AT A GLANCE.', crop: [6, 86, 377, 906], elements: HOME_ELEMENTS },
    { root_id: W, title_as_drawn: 'EVERY SERVICE. EVERY CLIENT.', crop: [388, 86, 378, 906], elements: WORK_ELEMENTS },
    { root_id: R, title_as_drawn: 'STRONGER OPERATIONS.', crop: [771, 86, 379, 906], elements: REPORTS_ELEMENTS },
    { root_id: M, title_as_drawn: 'EVERYTHING WITHIN REACH.', crop: [1154, 86, 378, 906], elements: MORE_ELEMENTS },
  ],
};

/* ════════════════════════════════ assets ════════════════════════════════ */

const APP = 'all-in-one-enterprises/public';
export const AIO_DESIGN_ASSETS: AssetPlanItem[] = [
  { asset_id: 'logo-header', what: 'Header lockup — gold and black mark, ALL IN ONE / ENTERPRISES INC.', path: `${APP}/migration/brand-lockup.png`, status: 'REUSE_WITH_FIX', used_for: ['header on every root'], reason: 'The approved staff header lockup and the one the reference draws. Only 282 × 76: the asset pass supplies a 2× / vector export of this same lockup, unchanged.' },
  { asset_id: 'logo-mark', what: 'Mark only, for light grounds', path: `${APP}/brand/ifta/aio-mark-on-light.png`, status: 'REUSE', used_for: ['collapsed desktop sidebar', 'compact tablet header'], reason: 'Approved mark (IFTA family).' },
  { asset_id: 'logo-full-lockup', what: 'Full lockup with WHERE BUSINESS MEETS THE ROAD.', path: `${APP}/brand/ifta/aio-lockup-on-light.png`, status: 'REUSE', used_for: ['desktop sidebar foot', 'splash / sign-in'], reason: 'Supplied full lockup; carries the tagline the four screens never show.' },
  { asset_id: 'logo-global-dotted', what: 'Older horizontal lockup with a gold dot above the I', path: `${APP}/brand/aio-logo-lockup.png`, status: 'DO_NOT_USE', used_for: [], reason: 'Has the invented gold dot above the I. Keep it out of AIO OFFICE authorities; replacing it in the live header is a separate decision.' },
  { asset_id: 'icons-services', what: 'AIO service icon library (compliance, freight, platform, services sets)', path: `${APP}/brand/icons`, status: 'REUSE_WITH_FIX', used_for: ['HOME lane tiles', 'MORE entries', 'REPORTS domain list'], reason: 'Approved gold-on-black icons for fleet, driver, dispatch, brokerage, factoring, billing, reports, fuel tax, permits, vault, messages, support. Several QA cells are clipped (operating authority, permits, document vault, messages, notifications); no icon yet for maintenance, bookkeeping, Road Ready, CRM, team, settings, account, catalog.' },
  { asset_id: 'icons-ui', what: 'Traced UI glyph sheet (search, alerts, filters, status)', path: `${APP}/migration/icons/aio-icon-sheet.svg`, status: 'REUSE', used_for: ['header', 'status marks', 'filters'], reason: 'Approved vector set from the migration family.' },
  { asset_id: 'plate-fleet-yard', what: 'Night fleet yard, rows of tractors (2880 × 1607)', path: `${APP}/brand/ifta/plates/staff-hero.jpg`, status: 'REUSE', used_for: ['WORK → VEHICLES & FLEET card'], reason: 'High-resolution approved plate whose subject is the fleet itself — the natural image for the new lane.' },
  { asset_id: 'plate-light-trails', what: 'Dusk road with light trails (2400 × 1339)', path: `${APP}/brand/ifta/plates/public-road.jpg`, status: 'REUSE', used_for: ['WORK → FILING & FUEL TAXES card'], reason: 'Approved IFTA-family plate; ties the filing lane to the IFTA pages.' },
  { asset_id: 'plate-aio-truck', what: 'AIO-liveried truck on the highway (1774 × 887)', path: `${APP}/brand/all-in-one-hero-truck.png`, status: 'REUSE', used_for: ['WORK → DISPATCH card'], reason: 'Existing brand photograph of a moving AIO truck.' },
  { asset_id: 'plate-sunset-truck', what: 'Black truck at sunset (1536 × 1024)', path: `${APP}/brand/aio-login-hero.png`, status: 'REUSE', used_for: ['WORK → ROAD READY card'], reason: 'Existing brand photograph; “ready for the road”.' },
  { asset_id: 'hero-home', what: 'HOME hero — truck at the AIO building, golden hour (the reference’s scene)', path: null, status: 'ASSET_PASS', used_for: ['HOME hero'], reason: 'The reference scene exists only inside the 1536-pixel composite, and the migration crop of the same world is 853 px wide. Crops and upscales of boards are forbidden; a high-resolution master is needed.' },
  { asset_id: 'hero-work', what: 'WORK hero — operations desk', path: null, status: 'ASSET_PASS', used_for: ['WORK hero band'], reason: 'Only exists inside the composite. Keep the scene; drop the decorative plants.' },
  { asset_id: 'hero-reports', what: 'REPORTS hero — desk with printed reports', path: null, status: 'ASSET_PASS', used_for: ['REPORTS hero band'], reason: 'Only exists inside the composite; printed charts must carry no generated text.' },
  { asset_id: 'hero-more', what: 'MORE hero — desk / notebook', path: null, status: 'ASSET_PASS', used_for: ['MORE hero band'], reason: 'Only exists inside the composite; the notebook must carry no mark, or the real lockup composited in.' },
  { asset_id: 'lane-photos', what: 'Lane photographs: Permitting & Authorities, Compliance, Brokerage, Insurance, Factoring, Bookkeeping, Drivers & Carriers, Mechanic / Maintenance', path: null, status: 'ASSET_PASS', used_for: ['WORK lane cards'], reason: 'Keep each subject the founder chose; supply high-resolution versions with no legible generated text, a visible professional driver, and a Brokerage image that is not another empty road.' },
  { asset_id: 'reference-composite', what: 'The founder’s four-screen composite', path: 'SITE00:docs/aio/office-design-reconciliation/reference/AIO_OFFICE_FOUR_SCREEN_REFERENCE.png', status: 'DO_NOT_USE', used_for: [], reason: 'Design reference only. Never crop, inpaint or upscale it into production imagery.' },
];

/* ════════════════════════════════ decisions ════════════════════════════════ */

const dec = (decision_id: string, title: string, question: string, options: [string, string][], recommendation: string, roots: string[], priority: DesignDecision['priority']): DesignDecision =>
  ({ decision_id, title, question, options: options.map(([option, effect]) => ({ option, effect })), recommendation, roots, priority, status: 'OPEN' });

export const AIO_DESIGN_DECISIONS: DesignDecision[] = [
  dec('D-HERO-SCALE', 'How big the photographs are',
    'Every page opens with a large photograph that takes about a third of the phone screen, so the first piece of real work sits below the fold. How much hero do you want?',
    [['Keep all four large', 'Most cinematic; staff scroll before every task.'], ['HOME keeps a shorter hero, the other three use a slim photo band', 'HOME still greets; WORK, REPORTS and MORE show their content in the first screen.'], ['Slim photo band on all four', 'Most practical; HOME loses its welcome moment.']],
    'HOME keeps a shorter hero (about 60% of today’s height, so the three attention cards sit in the first screen); WORK, REPORTS and MORE use a slim photo band.', [H, W, R, M], 'BEFORE_REGENERATION'),
  dec('D-HOME-ATTENTION', 'What the three HOME cards do',
    'HOME needs NEEDS ATTENTION, DEADLINES and BLOCKERS as real lists, not only numbers. How should they fit without making HOME long?',
    [['Cards become tabs of one list underneath', 'Same three cards; tapping one shows its items (client, what is wrong, where to fix it). One list, three views.'], ['Three separate lists below the cards', 'Everything visible at once; HOME grows by about a screen.'], ['Numbers only, open a separate page', 'Shortest HOME; the next action is one tap further away.']],
    'Cards become tabs of one list underneath, showing the top five items of the selected card.', [H], 'BEFORE_REGENERATION'),
  dec('D-HOME-QUICK-ACTIONS', 'Quick actions on HOME',
    'The drawing has no quick actions. Where should they go?',
    [['Phone: behind a “+” in the header · tablet and desktop: a visible row / column', 'The phone’s first screen stays for attention (contract order); wider screens show the actions in parallel.'], ['A row of four under the attention list on every device', 'Always visible; pushes the work summary down on phones.'], ['None on HOME', 'Cleanest; staff go through WORK and INTAKE.']],
    'Phone: a “+” in the header opens four role-aware actions — START MIGRATION, MY WORK, VIEW DEADLINES, MESSAGE A CLIENT (plus CREATE INVOICE and NEW LEAD for people with the billing or CRM grant). Tablet: a row after recent activity. Desktop: the top of the context column.', [H], 'CAN_DEFAULT'),
  dec('D-WORK-CARD-SIGNALS', 'What each WORK card shows',
    'Each lane card shows one number today. What should a card tell you at a glance?',
    [['One number, as drawn', 'Simple; says little about urgency.'], ['Needs-attention count plus a BLOCKED marker when the lane has one', 'Cards point at what to do first; lanes that cannot report say NOT CONNECTED YET.'], ['No numbers until they are production data', 'Truthful; the grid feels static.']],
    'Needs-attention count plus a BLOCKED marker, taken from the lane’s own summary (the same figure HOME shows). Lanes without that data say NOT CONNECTED YET; VEHICLES & FLEET says NO STAFF SCREEN YET.', [W, H], 'BEFORE_REGENERATION'),
  dec('D-WORK-BANNER', 'The “NEED TO ASSIGN WORK?” banner',
    'Creating a case or “client project” does not exist yet, and assigning is for managers. What should the banner at the bottom of WORK be?',
    [['Replace it with MY WORK', 'Shows what is assigned to you — something that exists today.'], ['Keep it for later', 'Draws a feature the system cannot do yet.'], ['Remove it', 'Cleaner page.']],
    'Replace it with a MY WORK strip near the top of WORK (assigned to me, due soon), and keep “create case” out until it exists.', [W], 'CAN_DEFAULT'),
  dec('D-PHOTOGRAPHY', 'Repairing the photographs',
    'Several photos contain fake text (PERMITS, DOT, INSURANCE, garbled ledgers), an invented logo on the MORE notebook, a masked driver, and two near-identical road shots. How should we fix them?',
    [['Controlled asset pass: same subjects, clean high-resolution versions', 'Keeps your choices; removes the AI tells.'], ['Reuse existing approved photos where they fit, new ones for the rest', 'Faster and consistent with IFTA (fleet yard for VEHICLES & FLEET, light-trail road for FILING, AIO truck for DISPATCH).'], ['Keep them as drawn', 'Fastest; the artifacts would ship.']],
    'Reuse the four approved plates that fit, and run a controlled asset pass for the rest with the same subjects and no legible generated text.', [W, H, R, M], 'BEFORE_REGENERATION'),
  dec('D-REPORTS-OVERVIEW', 'The four headline numbers on REPORTS',
    'Of the four drawn numbers, only some can be backed: client growth and the percentage changes cannot be computed, and “estimated revenue” does not exist. What should the overview lead with?',
    [['Only figures we can back, no trend lines yet', 'ACTIVE CLIENTS, FILINGS FILED (with last period), ACTIVE WORK, COLLECTED REVENUE (founder / finance only). Unbacked ones show a clear “not connected yet”.'], ['Keep the drawn tiles and label them “sample”', 'Looks finished; teaches staff to ignore numbers.'], ['Hide the overview until data is production-backed', 'Truthful; REPORTS looks empty.']],
    'Lead with the four figures we can back, no sparklines until history exists, and an honest “not connected yet” panel where CLIENT GROWTH is drawn.', [R], 'BEFORE_REGENERATION'),
  dec('D-REPORTS-DOMAINS', 'How the ten report areas are reached',
    'The drawing has five tabs; REPORTS has ten areas. How should people move between them?',
    [['Phone: overview plus a list of the ten areas; desktop: a side list', 'All ten reachable, nothing squeezed.'], ['Ten scrolling tabs', 'Familiar; most tabs hide off-screen on a phone.'], ['Group into four tabs', 'Compact; areas get buried inside groups.']],
    'Phone: OVERVIEW first, then a list of all ten areas with their state; tablet: two rows of tabs; desktop: a side list beside the report.', [R], 'CAN_DEFAULT'),
  dec('D-REPORTS-STAFF', 'REPORTS for staff without the reporting grant',
    'Reporting is founder-class; staff see it only by grant. The dock must keep exactly five items. What does a staff member without the grant see on REPORTS?',
    [['Keep the tab; show only the areas they are granted, or a clear “ask a founder for access” page', 'Same dock for everyone; no hidden surprises.'], ['Hide REPORTS for them', 'Breaks the fixed five-item dock.']],
    'Keep the tab for everyone. Staff see only the areas they are granted; with none, a clear “reporting is by grant” page.', [R], 'BEFORE_REGENERATION'),
  dec('D-MORE-GROUPS', 'Grouping the MORE directory',
    'MORE needs eleven entries (three are missing: GROWTH / CRM, BILLING, ACCOUNT). One long list or groups?',
    [['Four groups', 'CLIENTS & RECORDS (Clients, Documents & Vault, Messages) · BUSINESS (Growth / CRM, Billing, Service Catalog) · PEOPLE & NETWORK (Team & Staff, Mechanic Network) · SYSTEM (System Settings, Help & Support, Account).'], ['One list of eleven in canonical order', 'Simple; long on a phone.'], ['Two groups (Business · Office)', 'Fewer headings; less meaningful.']],
    'Four groups, with the group names open for your wording. The heading “ADDITIONAL TOOLS” goes.', [M], 'BEFORE_REGENERATION'),
  dec('D-MORE-HELP-CARD', 'The “NEED HELP?” card',
    'It repeats the Help & Support row right above it. Keep it?',
    [['Remove it', 'One way to reach help.'], ['Keep it as the only help entry and drop the row', 'Friendlier; breaks the directory pattern.']],
    'Remove the card; Help & Support stays as an entry.', [M], 'CAN_DEFAULT'),
  dec('D-ACCOUNT', 'Where ACCOUNT lives',
    'ACCOUNT (your own profile) belongs in MORE. Should the avatar in the header also open it?',
    [['Both: MORE entry and avatar menu open the same page', 'Expected behaviour; one page.'], ['MORE only', 'Strict; the avatar does nothing.']],
    'Both open the same MORE → ACCOUNT page.', [M], 'CAN_DEFAULT'),
  dec('D-IDENTITY', 'The name and role in the header',
    'The drawing shows “JORDAN L. · AIO STAFF”; the approved migration masters show “ALEX R. · STAFF”. What should the authority set show?',
    [['One sample person across all AIO authorities, role line from the role', 'Consistent; FOUNDER shows as FOUNDER for founders.'], ['Name only, no role line', 'Simpler; hides who has founder powers.']],
    'One sample person across the AIO authority sets, and a role line that reads the person’s role (FOUNDER, or the staff role).', [H, W, R, M], 'CAN_DEFAULT'),
  dec('D-DESKTOP-SHELL', 'The desktop and tablet frame',
    'There is an approved AIO OFFICE desktop and tablet frame from the migration work (header bar, left side menu on desktop, bottom dock on tablet). Use it for all four pages?',
    [['Yes, with WORK in place of FILING', 'One consistent office on every device.'], ['Design a new desktop frame', 'Fresh; two frames for one office.']],
    'Yes: the approved frame, with WORK replacing FILING in the side menu and dock.', [H, W, R, M], 'BEFORE_REGENERATION'),
  dec('D-CREATIVE-PROFILE', 'Making your four screens the AIO creative direction',
    'The studio’s design pipeline needs an AIO creative-direction profile before any new AIO page family is generated (only IFTA was exempt). Should your four-screen language become that profile?',
    [['Yes: your four screens are the basis of the AIO profile', 'Every later AIO page inherits this look.'], ['Only for AIO OFFICE', 'Other AIO families may diverge.']],
    'Yes: record your four-screen language (photography, black-and-gold dock, ivory surfaces, editorial headlines) as the AIO creative-direction profile.', [H, W, R, M], 'BEFORE_REGENERATION'),
];

/* ════════════════════════════════ proposed pages ════════════════════════════════ */

const slot = (slot_id: string, label: string, maps_to: ContractRef, treatment: string, asset: string | null = null): ProposedSlot => ({ slot_id, label, maps_to, treatment, asset });

const LANES: [string, string, string | null][] = [
  ['PERMITTING_AUTHORITIES', 'PERMITTING & AUTHORITIES', 'lane-photos'],
  ['FILING_FUEL_TAXES', 'FILING & FUEL TAXES', 'plate-light-trails'],
  ['COMPLIANCE', 'COMPLIANCE', 'lane-photos'],
  ['VEHICLES_FLEET', 'VEHICLES & FLEET', 'plate-fleet-yard'],
  ['DISPATCH', 'DISPATCH', 'plate-aio-truck'],
  ['BROKERAGE', 'BROKERAGE', 'lane-photos'],
  ['INSURANCE', 'INSURANCE', 'lane-photos'],
  ['FACTORING', 'FACTORING', 'lane-photos'],
  ['BOOKKEEPING', 'BOOKKEEPING', 'lane-photos'],
  ['DRIVERS_CARRIERS', 'DRIVERS & CARRIERS', 'lane-photos'],
  ['MECHANIC_MAINTENANCE', 'MECHANIC / MAINTENANCE', 'lane-photos'],
  ['ROAD_READY', 'ROAD READY', 'plate-sunset-truck'],
];
const laneSignal = (id: string) =>
  id === 'VEHICLES_FLEET' ? 'NO STAFF SCREEN YET (honest state, no number)'
    : id === 'BROKERAGE' ? 'PAUSED marker; the lane’s own figures when it resumes'
      : 'needs-attention count and a BLOCKED marker when the lane reports one; NOT CONNECTED YET otherwise';

/** The more directory as proposed (D-MORE-GROUPS recommendation). */
export const AIO_MORE_PROPOSED_GROUPS: { group: string; entries: string[] }[] = [
  { group: 'CLIENTS & RECORDS', entries: ['CLIENTS', 'DOCUMENTS_VAULT', 'MESSAGES'] },
  { group: 'BUSINESS', entries: ['GROWTH_CRM', 'BILLING', 'SERVICE_CATALOG'] },
  { group: 'PEOPLE & NETWORK', entries: ['TEAM_STAFF', 'MECHANIC_NETWORK'] },
  { group: 'SYSTEM', entries: ['SYSTEM_SETTINGS', 'HELP_SUPPORT', 'ACCOUNT'] },
];
const MORE_COPY: Record<string, string> = {
  CLIENTS: 'Every client and their Client 360.',
  DOCUMENTS_VAULT: 'Documents across clients — staff-only, client-visible, generated and historical, labelled.',
  MESSAGES: 'Conversations with clients, internal notes and system notices.',
  GROWTH_CRM: 'Leads, pipeline, follow-ups and referrals (by grant).',
  BILLING: 'Quotes, invoices, payments and credits (by grant).',
  SERVICE_CATALOG: 'What AIO offers and to whom; configuration is founder-only.',
  TEAM_STAFF: 'People and roles; role changes are founder-only.',
  MECHANIC_NETWORK: 'Provider onboarding, verification and directory.',
  SYSTEM_SETTINGS: 'Workflows, automations, integrations, security, data.',
  HELP_SUPPORT: 'Training and SOPs.',
  ACCOUNT: 'Your own profile, security and preferences (not built yet).',
};

/** Where each of the ten REPORTS domains appears (overview · its own view · history · detail · export). */
export const AIO_REPORT_DOMAIN_PLACEMENT: { domain: string; overview: string | null; own_view: string; history: string | null; detail: string | null; export: string | null; state_today: string }[] = [
  { domain: 'OVERVIEW', overview: 'the four backed headline figures and the period control', own_view: 'OVERVIEW tab', history: null, detail: 'each figure drills to its domain', export: 'period summary (CSV)', state_today: 'PARTIAL — demo-store figures' },
  { domain: 'CLIENTS', overview: 'ACTIVE CLIENTS figure', own_view: 'clients by lifecycle (active · paused · ended · prebuilt · invited)', history: 'not connected: no readable activation dates', detail: 'Client 360', export: 'client list (CSV)', state_today: 'PARTIAL' },
  { domain: 'SERVICES', overview: 'ACTIVE WORK figure and the service-volume bars', own_view: 'volume and workflow performance by lane', history: 'not connected: status history is not read', detail: 'lane queue', export: 'service report (CSV)', state_today: 'PARTIAL — partial data, labelled' },
  { domain: 'FINANCIAL_REVENUE', overview: 'COLLECTED REVENUE (founder / finance grant only)', own_view: 'collected, invoiced, outstanding, aging, credits', history: 'by period from payments', detail: 'MORE → BILLING invoice', export: 'receivables aging (CSV, exists today)', state_today: 'PARTIAL — demo data; never estimated, never profitability' },
  { domain: 'FILING_HISTORY', overview: 'FILINGS FILED this period vs last', own_view: 'filed quarters by client and quarter, filed on time', history: 'quarter by quarter', detail: 'the IFTA case', export: 'filing history (CSV)', state_today: 'NOT STARTED as a surface — the data exists' },
  { domain: 'COMPLIANCE', overview: null, own_view: 'expirations by window; open and resolved items once a compliance case model exists', history: 'not connected', detail: 'COMPLIANCE lane', export: 'expirations (CSV)', state_today: 'PARTIAL — expirations only' },
  { domain: 'DISPATCH_BROKERAGE', overview: null, own_view: 'load volume and status; brokerage economics for founders / finance grant', history: 'from load timelines (demo)', detail: 'load', export: 'load report (CSV)', state_today: 'PARTIAL' },
  { domain: 'BOOKKEEPING', overview: null, own_view: 'contract only — subscriptions and cycles closed on time', history: null, detail: 'BOOKKEEPING lane', export: null, state_today: 'NOT STARTED' },
  { domain: 'MIGRATION', overview: null, own_view: 'batches, review required, clients activated', history: 'not connected: no stage timestamps', detail: 'INTAKE batch', export: 'migration status (CSV)', state_today: 'PARTIAL' },
  { domain: 'EXPORTS', overview: null, own_view: 'every export with its grant, audit entry and formula guard', history: 'saved reports (write-only today)', detail: null, export: 'CSV now; PDF when a renderer exists', state_today: 'NOT STARTED — contract only' },
];

const HOME_PAGE: PageReconciliation = {
  root_id: H,
  works: [
    'A warm, cinematic welcome that says what HOME is for.',
    'Three attention cards at the top — the right three: what needs attention, what is due, what is blocked.',
    'WORK ACROSS AIO as a tile grid with gold line icons.',
    'CLIENTS IN MOTION rows: client, services, status, time.',
    'RECENT ACTIVITY in plain sentences that match events the system already records.',
    'The black-and-gold dock with exactly the five roots.',
  ],
  preserve: ['The order: welcome → attention → work → clients → activity', 'The three-card attention band', 'Photography with dramatic light', 'Tile grid with gold icons', 'Ivory surfaces and white cards', 'Dock design'],
  missing: [
    'The items behind the three cards — DEADLINES and BLOCKERS exist only as numbers.',
    'QUICK ACTIONS (required region).',
    'Five lanes in WORK ACROSS AIO: VEHICLES & FLEET, FACTORING, DRIVERS & CARRIERS, MECHANIC / MAINTENANCE, ROAD READY.',
    'Next deadline and blocking condition on each client row.',
    'BUSINESS PULSE (optional; founder-only and absent until figures are production-backed).',
  ],
  incorrect: [
    'INTAKE drawn as a lane tile (it is a dock root).',
    '“Filing (IFTA)” and “Permitting” instead of the lane names.',
    '“Live activity” — office figures are demo data today.',
    'Different figures for the same lane on HOME and WORK (Bookkeeping 11 vs 5, Permitting 8 vs 18, Insurance 5 vs 7).',
    'Invented client logo badges.',
  ],
  refine: [
    'Shorter hero so the attention band sits in the first screen.',
    'Smallest text (tile subtitles, chips, times) is about 7–8 px at phone scale; raise to at least 12 px.',
    'All text uppercase (AIO uppercase law); plan tile widths for uppercase.',
    'Give the activity bullets meaning (event type) or drop them.',
  ],
  founder_decisions: ['D-HERO-SCALE', 'D-HOME-ATTENTION', 'D-HOME-QUICK-ACTIONS', 'D-WORK-CARD-SIGNALS', 'D-PHOTOGRAPHY', 'D-IDENTITY', 'D-DESKTOP-SHELL'],
  current_vs_required: [
    { topic: 'Needs attention', current: 'A number: 3 clients.', required: 'The items themselves, each opening the place where it is fixed.', change: 'The card opens a short list under it (top five).' },
    { topic: 'Deadlines', current: 'A number: 5 this week.', required: 'What is due, for whom, overdue / today / soon, and where to do it.', change: 'Second view of the same list.' },
    { topic: 'Blockers', current: 'A number: 2.', required: 'Grouped by whom it waits on, with the owner’s own reason.', change: 'Third view of the same list.' },
    { topic: 'Work across AIO', current: '8 tiles incl. INTAKE.', required: 'All 12 lanes, nothing else.', change: '12 tiles, 3 × 4, canonical order.' },
    { topic: 'Quick actions', current: 'None.', required: 'Role-aware shortcuts that route to the owner.', change: 'Four actions: behind “+” on phones, visible on tablet and desktop.' },
    { topic: 'Business pulse', current: 'None.', required: 'Optional, production-backed figures only.', change: 'Reserved for founders; absent today.' },
  ],
  proposed: [
    slot('home.hero', 'Greeting', root(H), 'Shorter cinematic hero: greeting from the signed-in person and one line of promise.', 'hero-home'),
    slot('home.attention', 'NEEDS ATTENTION', region(`${H}.NEEDS_ATTENTION`), 'First card + its list: client, what is wrong, owner lane, age; each row opens the owner. Unconnected sources are named, never counted.'),
    slot('home.deadlines', 'DUE THIS WEEK', region(`${H}.DEADLINES`), 'Second card + list: overdue / today / soon computed from the date, never the stored severity.'),
    slot('home.blockers', 'BLOCKED', region(`${H}.BLOCKERS`), 'Third card + list, grouped by whom it waits on.'),
    slot('home.work', 'WORK ACROSS AIO', region(`${H}.WORK_ACROSS_AIO`), '12 icon tiles, 3 × 4: lane name and the lane’s own needs-attention figure, or NOT CONNECTED YET.', 'icons-services'),
    slot('home.clients', 'CLIENTS IN MOTION', region(`${H}.CLIENTS_IN_MOTION`), 'Rows: initials badge, client, service chips, status, next deadline, last update. PREBUILT never shown as active.'),
    slot('home.activity', 'RECENT ACTIVITY', region(`${H}.RECENT_ACTIVITY`), 'Plain-sentence events with an event-type mark; staff feed includes client-visible events.'),
    slot('home.quick', 'QUICK ACTIONS', region(`${H}.QUICK_ACTIONS`), 'Four role-aware actions, each routing to its owner (phone: behind “+” in the header). Unbuilt ones (create case, staff upload) are not shown.'),
    slot('home.pulse', 'BUSINESS PULSE', region(`${H}.BUSINESS_PULSE`), 'Founder / finance grant only; absent until production-backed figures exist.'),
  ],
};

const WORK_PAGE: PageReconciliation = {
  root_id: W,
  works: [
    'A photographic directory — the most distinctive page of the four.',
    'Distinct photography per service (paperwork, trucks, road, workshop).',
    'Three-column grid with a consistent card: photo, name, one status line, gold arrow.',
    'Eleven of the twelve lanes already drawn, nearly all with their canonical names.',
  ],
  preserve: ['Photographic service cards', 'Three-column grid on the phone', 'Card anatomy (photo · name · status · arrow)', 'Warm office hero', 'Dock design'],
  missing: [
    'VEHICLES & FLEET card (the twelfth lane).',
    'MY WORK — what is assigned to me.',
    'A way into the cross-client queue (all open work, searchable).',
    'Urgency on the cards (needs attention, blocked).',
  ],
  incorrect: [
    'INTAKE card — INTAKE is a dock root, not a lane.',
    '“Maintenance” — the lane is MECHANIC / MAINTENANCE.',
    'Banner promises creating cases and “client projects”, which do not exist.',
    'Figures disagree with HOME for the same lanes.',
  ],
  refine: [
    'Photos with fake text, a masked driver, near-duplicate road and truck shots (asset pass).',
    'Compact hero band so the first cards are in the first screen.',
    'Status line text is very small; raise it and make the whole card tappable.',
    'Uppercase law; long lane names (PERMITTING & AUTHORITIES, MECHANIC / MAINTENANCE) need two lines.',
  ],
  founder_decisions: ['D-HERO-SCALE', 'D-WORK-CARD-SIGNALS', 'D-WORK-BANNER', 'D-PHOTOGRAPHY', 'D-DESKTOP-SHELL'],
  current_vs_required: [
    { topic: 'Lanes', current: '12 cards: 11 lanes + INTAKE; no VEHICLES & FLEET.', required: 'Exactly the 12 lanes.', change: 'INTAKE’s slot goes to VEHICLES & FLEET; cards follow the canonical order; grid stays 3 × 4.' },
    { topic: 'Card signal', current: 'One number per card.', required: 'Truthful lane summary; honest state where unsupported.', change: 'Needs-attention count + BLOCKED marker, or NOT CONNECTED YET.' },
    { topic: 'My work', current: 'None.', required: 'Assigned-to-me view.', change: 'MY WORK strip under the hero.' },
    { topic: 'Bottom banner', current: 'Create task / case / project.', required: 'Only actions that exist.', change: 'Removed; MY WORK takes its job.' },
  ],
  proposed: [
    slot('work.hero', 'Hero band', root(W), 'Slim photo band with the headline.', 'hero-work'),
    slot('work.mine', 'MY WORK', region('WORK.MY_WORK'), 'Strip: items assigned to me, due soon; opens my list. Lanes without assignees say so.'),
    slot('work.lanes', 'SERVICE WORKSPACES', region('WORK.LANE_SWITCHER'), '12 photographic cards, 3 × 4, canonical order.'),
    ...LANES.map(([id, label, asset]) => slot(`work.lane.${id.toLowerCase()}`, label, lane(id), laneSignal(id), asset)),
    slot('work.queue', 'ALL OPEN WORK', region('WORK.CROSS_CLIENT_QUEUE'), 'Search, filter and sort open work across clients; every row opens the case.'),
  ],
};

const REPORTS_PAGE: PageReconciliation = {
  root_id: R,
  works: [
    'A premium analytics feel: calm surfaces, gold bars, clear section titles.',
    'Period control at the top right.',
    'SERVICE ACTIVITY bars with their values printed — readable without an axis.',
    'FILING HISTORY as a list of real-looking filed quarters.',
  ],
  preserve: ['Metric tiles in a row', 'Gold horizontal bars', 'Filing history list', 'Period control', 'Editorial section titles'],
  missing: [
    'Five of the ten report areas: FILING HISTORY (as an area), COMPLIANCE, DISPATCH / BROKERAGE, BOOKKEEPING, MIGRATION.',
    'Honest states for figures we cannot back yet.',
    'EXPORTS as a real area (CSV today; PDF later).',
  ],
  incorrect: [
    '“Revenue (Est.)” — no estimate exists; the backed figure is collected revenue, and it is founder-class.',
    'CLIENT GROWTH and every percentage change — need history the system does not keep.',
    'Sparklines imply trend data that does not exist.',
    'Intake / Migration bar mixes the MIGRATION area into service volume; five lanes missing.',
    'Filing dates are from 2024.',
  ],
  refine: [
    'Compact hero band.',
    'Ten areas need a navigation that fits a phone.',
    'Metric labels and bar labels are small.',
    'Uppercase law across tabs, tiles and lists.',
  ],
  founder_decisions: ['D-HERO-SCALE', 'D-REPORTS-OVERVIEW', 'D-REPORTS-DOMAINS', 'D-REPORTS-STAFF', 'D-PHOTOGRAPHY', 'D-DESKTOP-SHELL'],
  current_vs_required: [
    { topic: 'Headline figures', current: 'Clients 48 +12% · Filings 36 +28% · Work 62 −8% · Revenue (Est.) $48.2K +14%.', required: 'Only figures source truth backs, each labelled; nothing estimated.', change: 'ACTIVE CLIENTS · FILINGS FILED (vs last period) · ACTIVE WORK · COLLECTED REVENUE (founder / finance only); no sparklines yet.' },
    { topic: 'Client growth', current: '+24% since April chart.', required: 'Not computable today.', change: 'A designed “not connected yet” panel naming what is missing.' },
    { topic: 'Areas', current: '5 tabs.', required: '10 areas.', change: 'Overview + list of ten on the phone; side list on desktop.' },
    { topic: 'Service activity', current: '8 bars incl. Intake / Migration.', required: 'Lane volume, partial-data label.', change: '12 lanes; lanes without data shown as not connected; migration in its own area.' },
  ],
  proposed: [
    slot('reports.hero', 'Hero band', root(R), 'Slim photo band.', 'hero-reports'),
    slot('reports.period', 'PERIOD', action('REPORTS.SET_PERIOD'), 'This month / quarter / custom.'),
    slot('reports.overview', 'OVERVIEW', domain('OVERVIEW'), 'Four backed figures; each opens its area.'),
    slot('reports.active-clients', 'ACTIVE CLIENTS', metric('overview.active-clients'), 'Count by the canonical rule (PREBUILT never counts); no delta.'),
    slot('reports.filings', 'FILINGS FILED', metric('overview.filing-throughput'), 'This period, with last period beside it.'),
    slot('reports.active-work', 'ACTIVE WORK', metric('overview.active-work'), 'Count; no delta.'),
    slot('reports.collected', 'COLLECTED REVENUE', metric('financial.collected'), 'Founder / finance grant only; demo-labelled until production; never an estimate.'),
    slot('reports.services', 'SERVICE ACTIVITY', metric('services.volume'), 'Bars for all 12 lanes, values printed, PARTIAL DATA label.'),
    slot('reports.filing-history', 'FILING HISTORY', domain('FILING_HISTORY'), 'Filed quarters, newest first, real dates.'),
    slot('reports.client-growth', 'CLIENT GROWTH', metric('overview.client-growth'), 'Honest panel: needs readable activation history — not connected yet.'),
    slot('reports.areas', 'REPORT AREAS', root(R), 'All ten areas with a state chip; staff see only granted areas.'),
    slot('reports.exports', 'EXPORTS', domain('EXPORTS'), 'What can be exported, by grant; CSV now, PDF later.'),
  ],
};

const MORE_PAGE: PageReconciliation = {
  root_id: M,
  works: [
    'A calm, readable directory: icon, name, one-line purpose, chevron.',
    'Search at the top.',
    'Eight of the eleven entries already right, with sensible descriptions.',
    'MECHANIC NETWORK correctly separate from the maintenance lane.',
  ],
  preserve: ['Row anatomy (icon · name · purpose · chevron)', 'Search first', 'Quiet hero', 'Dock design'],
  missing: ['GROWTH / CRM', 'BILLING', 'ACCOUNT', 'Founder-only markers where an entry holds founder acts'],
  incorrect: [
    '“ADDITIONAL TOOLS … everything else” frames MORE as a junk drawer.',
    'Team & Staff and Service Catalog promise configuration that is founder-only.',
    '“Live support” and “request a feature” do not exist.',
    'NEED HELP? card duplicates Help & Support.',
    'The notebook in the hero carries an invented AIO mark.',
  ],
  refine: ['Group the eleven entries', 'Compact hero band', 'Uppercase law', 'Role-aware: entries a person cannot use are omitted'],
  founder_decisions: ['D-HERO-SCALE', 'D-MORE-GROUPS', 'D-MORE-HELP-CARD', 'D-ACCOUNT', 'D-PHOTOGRAPHY', 'D-DESKTOP-SHELL'],
  current_vs_required: [
    { topic: 'Entries', current: '8 entries.', required: '11 entries.', change: 'Add GROWTH / CRM and BILLING (BUSINESS group) and ACCOUNT (SYSTEM group).' },
    { topic: 'Framing', current: '“ADDITIONAL TOOLS”.', required: 'A directory where each entry has one purpose.', change: 'Four named groups.' },
    { topic: 'Help', current: 'Row + NEED HELP? card.', required: 'One entry.', change: 'Card removed.' },
    { topic: 'Founder areas', current: 'Same for everyone.', required: 'Role-aware.', change: 'Founder acts marked; grant-only entries omitted without the grant.' },
  ],
  proposed: [
    slot('more.hero', 'Hero band', root(M), 'Slim photo band; notebook without an invented mark.', 'hero-more'),
    slot('more.search', 'SEARCH', region('MORE.SEARCH'), 'Find a client, document, lead or invoice; results open their owner.'),
    ...AIO_MORE_PROPOSED_GROUPS.flatMap((g) => g.entries.map((e) => slot(`more.entry.${e.toLowerCase()}`, `${g.group} · ${e.replace(/_/g, ' ')}`, entry(e), MORE_COPY[e], 'icons-services'))),
  ],
};

export const AIO_DESIGN_PAGES: PageReconciliation[] = [HOME_PAGE, WORK_PAGE, REPORTS_PAGE, MORE_PAGE];

/* ════════════════════════════════ responsive ════════════════════════════════ */

const DOCK_NAV = 'bottom dock: HOME · INTAKE · WORK · REPORTS · MORE';
const SIDEBAR = 'approved desktop frame: 68 px header bar with lockup, page name, search, alerts, identity; 138 px left menu HOME · INTAKE · WORK · REPORTS · MORE; no dock';
const vp = (root_id: string, viewport: ViewportPlan['viewport'], hero: ViewportPlan['hero'], layout: string, order: string[], notes: string, nav?: string): ViewportPlan =>
  ({ root_id, viewport, nav: nav ?? (viewport === 'MOBILE' ? DOCK_NAV : viewport === 'TABLET' ? `77 px compact header; ${DOCK_NAV} (touch-sized, five equal columns)` : SIDEBAR), hero, layout, order, notes });
const workLanes = LANES.map(([id]) => `work.lane.${id.toLowerCase()}`);
const moreEntries = AIO_MORE_PROPOSED_GROUPS.flatMap((g) => g.entries.map((e) => `more.entry.${e.toLowerCase()}`));

export const AIO_DESIGN_RESPONSIVE: ViewportPlan[] = [
  vp(H, 'MOBILE', 'FULL', 'One column. Shorter hero; three attention cards in a row; the selected card’s list under them. Quick actions behind “+” in the header.', ['home.hero', 'home.attention', 'home.deadlines', 'home.blockers', 'home.work', 'home.clients', 'home.activity', 'home.quick'], 'Attention, deadlines, work summary, clients in motion, recent activity survive first (contract). Tiles 3 × 4.'),
  vp(H, 'TABLET', 'COMPACT', 'Two columns under a compact hero: attention list (wide) beside quick actions and recent activity; WORK ACROSS AIO as 6 × 2 tiles; clients full width.', ['home.hero', 'home.attention', 'home.deadlines', 'home.blockers', 'home.work', 'home.clients', 'home.activity', 'home.quick'], 'No stretched phone cards: tiles keep phone proportions, more per row.'),
  vp(H, 'DESKTOP', 'COMPACT', 'Main column + 320 px context column. Main: hero band, three cards, list, WORK ACROSS AIO (6 × 2), CLIENTS IN MOTION as a table. Context: quick actions, recent activity, Business Pulse for founders.', ['home.hero', 'home.attention', 'home.deadlines', 'home.blockers', 'home.work', 'home.clients', 'home.quick', 'home.activity', 'home.pulse'], 'Parallel context only on wide screens (contract).'),
  vp(H, 'WIDE', 'COMPACT', 'Content capped at about 1440 px; extra width goes to the context column and margins, never to stretched images or cards.', ['home.hero', 'home.attention', 'home.deadlines', 'home.blockers', 'home.work', 'home.clients', 'home.quick', 'home.activity', 'home.pulse'], 'Hero image height fixed; never stretched past its master.'),
  vp(W, 'MOBILE', 'COMPACT', 'One column: hero band, MY WORK strip, 3 × 4 lane cards, ALL OPEN WORK link.', ['work.hero', 'work.mine', 'work.lanes', ...workLanes, 'work.queue'], 'Contract mobile order inside a lane: switcher → needs attention → active work → case.'),
  vp(W, 'TABLET', 'COMPACT', 'Lane cards 4 × 3; MY WORK beside the hero band. Opening a lane shows its six-part shell in two columns.', ['work.hero', 'work.mine', 'work.lanes', ...workLanes, 'work.queue'], 'Cards keep their photo ratio.'),
  vp(W, 'DESKTOP', 'COMPACT', 'Directory: lane cards 4 × 3 with MY WORK in a right column. Inside a lane: lane list on the left, the six-part shell in the middle, case detail in a right panel.', ['work.hero', 'work.lanes', ...workLanes, 'work.mine', 'work.queue'], 'The lane list replaces scrolling back to the grid.'),
  vp(W, 'WIDE', 'COMPACT', 'Same as desktop; cards capped at their master width (4 per row), extra width to the case panel.', ['work.hero', 'work.lanes', ...workLanes, 'work.mine', 'work.queue'], 'Never 6+ stretched photo cards per row.'),
  vp(R, 'MOBILE', 'COMPACT', 'Overview first: four figures (2 × 2), period control, service bars, filing history, client-growth honest panel, then the list of ten areas.', ['reports.hero', 'reports.overview', 'reports.active-clients', 'reports.filings', 'reports.active-work', 'reports.collected', 'reports.period', 'reports.services', 'reports.filing-history', 'reports.client-growth', 'reports.areas', 'reports.exports'], 'Key summary, period, high-priority reports, drilldown (contract).'),
  vp(R, 'TABLET', 'COMPACT', 'Area tabs in two rows; figures 4 across; charts two-up.', ['reports.hero', 'reports.areas', 'reports.overview', 'reports.period', 'reports.active-clients', 'reports.filings', 'reports.active-work', 'reports.collected', 'reports.services', 'reports.filing-history', 'reports.client-growth', 'reports.exports'], ''),
  vp(R, 'DESKTOP', 'COMPACT', 'Area list on the left of the report; figures 4 across; charts and filing history side by side; exports in a right panel.', ['reports.areas', 'reports.hero', 'reports.period', 'reports.overview', 'reports.active-clients', 'reports.filings', 'reports.active-work', 'reports.collected', 'reports.services', 'reports.filing-history', 'reports.client-growth', 'reports.exports'], ''),
  vp(R, 'WIDE', 'NONE', 'Reports are read at a comfortable width (max about 1280 px for charts); extra width shows a second domain beside the first.', ['reports.areas', 'reports.period', 'reports.overview', 'reports.active-clients', 'reports.filings', 'reports.active-work', 'reports.collected', 'reports.services', 'reports.filing-history', 'reports.client-growth', 'reports.exports'], 'No hero on ultra-wide: data first.'),
  vp(M, 'MOBILE', 'COMPACT', 'Search, then four groups as lists.', ['more.hero', 'more.search', ...moreEntries], 'Clear directory, search, role-aware entries (contract).'),
  vp(M, 'TABLET', 'COMPACT', 'Search, then groups in two columns.', ['more.hero', 'more.search', ...moreEntries], ''),
  vp(M, 'DESKTOP', 'NONE', 'Directory as a left list beside the open entry; search above it.', ['more.search', ...moreEntries], 'The directory stays visible while working in an entry.'),
  vp(M, 'WIDE', 'NONE', 'Same as desktop; the open entry gets the extra width.', ['more.search', ...moreEntries], ''),
];

/* ════════════════════════════════ founder vs staff ════════════════════════════════ */

const role = (area: string, root_id: string, founder: string, staff: string, decided_by: string): RoleVisibilityRow => ({ area, root_id, founder, staff, decided_by });
export const AIO_DESIGN_ROLES: RoleVisibilityRow[] = [
  role('Header role line', H, 'FOUNDER', 'Their staff role', 'the person’s role — never their name'),
  role('Needs attention: founder review, PREBUILT approval', H, 'Item with an approve action', 'Item as status only (“waiting for founder review”)', 'founder acts'),
  role('Needs attention: billing and CRM items', H, 'Shown', 'Shown only with billing / CRM grants', 'billing.read · crm.*'),
  role('Quick actions', H, 'All four + create invoice + new lead', 'The four; invoice and lead only with grants; assign only for managers', 'billing.manage · crm.leads.manage · work.assign'),
  role('Business pulse', H, 'Shown when production-backed', 'Only with the internal-financial grant', 'internal financial visibility'),
  role('Brokerage load financials', W, 'Shown', 'Only with brokerage_finance', 'brokerage_finance.read'),
  role('REPORTS areas', R, 'All ten', 'Granted areas only; none → “reporting is by grant” page', 'reports.read · management.*.read'),
  role('Collected revenue and financial area', R, 'Shown', 'Only with the financial grant', 'management.financial.read'),
  role('Team & Staff role controls', M, 'Change roles and grants', 'See the team; no role controls', 'founder act'),
  role('Service Catalog configuration and pricing', M, 'Edit', 'View', 'founder act'),
  role('System Settings privileged areas', M, 'All', 'Granted areas only', 'security / integration / data / QA grants'),
  role('Growth / CRM and Billing entries', M, 'Shown', 'Shown only with the grant (omitted otherwise)', 'crm.* · billing.*'),
];

export const AIO_DESIGN_PRIVACY_TOUCHPOINTS: DesignReconciliation['privacy_touchpoints'] = [
  { gap_id: 'P-DOCUMENTS-INTERNAL-EXPOSED', area: 'MORE → DOCUMENTS & VAULT; HOME document items', effect: 'Design labels every document STAFF ONLY or CLIENT-VISIBLE. The leak itself (internal documents reachable by link; migrated scans customer-readable) waits for the security sprint.' },
  { gap_id: 'P-MESSAGES-RLS-VISIBILITY', area: 'MORE → MESSAGES', effect: 'Internal notes must look unmistakably different from client messages; the database rule still has to filter them.' },
  { gap_id: 'P-ACTIVITY-INTERNAL-TO-CLIENT', area: 'HOME → RECENT ACTIVITY', effect: 'The staff feed marks internal vs client-visible events; the client feed leak is outside these pages but shares the event model.' },
  { gap_id: 'P-CLIENT-LIFECYCLE-SELF-UPDATE', area: 'HOME → CLIENTS IN MOTION; REPORTS → ACTIVE CLIENTS', effect: 'A client could set itself ACTIVE today, so active counts cannot be trusted in production until fixed.' },
  { gap_id: 'P-PORTAL-VIEWS-CROSS-ORG', area: 'REPORTS → EXPORTS; MORE → BILLING', effect: 'No client-facing report or invoice export is designed on these views until they are fixed.' },
  { gap_id: 'P-FLEETCARE-REFERRAL-FEES-CLIENT', area: 'MORE → MECHANIC NETWORK; MORE → BILLING', effect: 'Referral fees are labelled internal-only in the design.' },
  { gap_id: 'P-SHIPPER-VIEW-INTERNAL-NOTES', area: 'WORK → BROKERAGE card and lane', effect: 'Internal notes stay staff-only in the lane design; shippers can read them in the database today.' },
  { gap_id: 'P-BOOKKEEPING-DRAFT-REPORTS', area: 'WORK → BOOKKEEPING', effect: 'Deliverables are labelled DRAFT or DELIVERED; clients see drafts today.' },
];

export const AIO_DESIGN_CROSS_CUTTING: DesignReconciliation['cross_cutting'] = [
  { topic: 'Uppercase law', finding: 'The drawing uses mixed case for body text, rows and descriptions. AIO’s founder rule is that every visible word is uppercase (password fields excepted), overriding authority casing.', verdict: 'CORRECT', change: 'All text uppercase in the authority set; card widths and line counts planned for the wider uppercase text.' },
  { topic: 'Text size', finding: 'The smallest text (tile subtitles, chips, times, metric labels) is about 7–8 px at phone scale.', verdict: 'REFINE', change: 'At least 12 px for secondary text and 11 px for uppercase labels on phones.' },
  { topic: 'One set of sample figures', finding: 'The same lane shows different figures on HOME and WORK (Bookkeeping 11 vs 5, Permitting 8 vs 18, Insurance 5 vs 7). In the product both read the same lane summary.', verdict: 'CORRECT', change: 'One labelled sample dataset drives every authority screen.' },
  { topic: 'Illustrative figures', finding: 'Every number and date drawn is a design example; no office figure is production-backed today.', verdict: 'CORRECT', change: 'Authority screens label sample data; unbacked figures appear as honest states.' },
  { topic: 'Logo', finding: 'The header lockup matches the approved staff lockup. The MORE notebook shows an invented AIO mark; the older global lockup has a gold dot above the I.', verdict: 'KEEP', change: 'Keep the header lockup; repair the notebook; keep the dotted lockup out.' },
  { topic: 'Photography artifacts', finding: 'Generated text on paperwork, invented emblems, a masked driver, near-duplicate road and truck photos.', verdict: 'ASSET_PASS', change: 'Controlled asset pass and reuse of approved plates (D-PHOTOGRAPHY).' },
  { topic: 'Hero heights', finding: 'Four large heroes push work below the first screen on every page.', verdict: 'FOUNDER_DECISION', change: 'D-HERO-SCALE.' },
  { topic: 'Arrows on every card', finding: 'Each card carries its own gold arrow button; the whole card should be the tap target.', verdict: 'REFINE', change: 'Whole card tappable; arrow kept as the visual cue.' },
  { topic: 'Dock', finding: 'Exactly the five roots in the canonical order.', verdict: 'KEEP', change: 'None.' },
  { topic: 'Creative direction', finding: 'AIO has no creative-direction profile yet; new AIO families must pass that gate (only IFTA was exempt).', verdict: 'FOUNDER_DECISION', change: 'D-CREATIVE-PROFILE.' },
];

export const AIO_DESIGN_RECONCILIATION: DesignReconciliation = {
  project_id: 'AIO',
  sprint: AIO_DESIGN_RECON_SPRINT,
  reference: AIO_DESIGN_REFERENCE,
  pages: AIO_DESIGN_PAGES,
  cross_cutting: AIO_DESIGN_CROSS_CUTTING,
  decisions: AIO_DESIGN_DECISIONS,
  responsive: AIO_DESIGN_RESPONSIVE,
  assets: AIO_DESIGN_ASSETS,
  roles: AIO_DESIGN_ROLES,
  privacy_touchpoints: AIO_DESIGN_PRIVACY_TOUCHPOINTS,
};
