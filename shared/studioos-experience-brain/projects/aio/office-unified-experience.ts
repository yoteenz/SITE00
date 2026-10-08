/**
 * AIO OFFICE unified experience — the complete internal office designed as one connected product and proven in an
 * isolated review studio (P0.AIO.OFFICE.COMPLETE-INTERNAL-OFFICE-AND-UNIFIED-EXPERIENCE1, batch 1).
 *
 * Every root, INTAKE section, WORK lane section, REPORTS domain and MORE destination in the canonical IA has a page family
 * in the review, with record pages, Client 360, client context, simulated actions and honest states. The review is
 * sample data in fsbw design-authority/aio-office/office/ — it is NOT the live app, the live app is NOT complete, and
 * nothing here authorizes live implementation, permission changes or deployment. The founder reviews it next.
 */
import { AIO_OFFICE_IA } from './office-ia.js';
import { AIO_VA_MISSING_ASSETS } from './office-visual-authority.js';

export const AIO_UO_SPRINT = 'P0.AIO.OFFICE.COMPLETE-INTERNAL-OFFICE-AND-UNIFIED-EXPERIENCE1';
export const AIO_UO_DATE = '2026-10-08';
export const AIO_UO_NEXT_GATE = 'FOUNDER REVIEW OF THE UNIFIED INTERNAL AIO OFFICE EXPERIENCE';
export const AIO_UO_REVIEW_LINK = 'https://claude.ai/artifact/VQCyD4A4YmeErb27ik2hgG';
export const AIO_UO_BASE = { site00: '0a153f9a', fsbw: 'c74cf37c' } as const;

export const AIO_UO_STATUS = {
  batch: 'BATCH 1 COMPLETE — every page family designed and connected in the review studio',
  office: 'NOT COMPLETE — continuation batches below; the office is not labelled COMPLETE',
  review: 'CONNECTED REVIEW BUILT AND QA-CRAWLED (619 routes, 0 failures) — SAMPLE RECORDS ONLY',
  approval: 'AWAITING FOUNDER REVIEW',
  live_app: 'NOT COMPLETE — the review is not the live app; Composer owns live integration after approval',
  security: '12 PRIVACY GAPS STILL OPEN (rechecked at fsbw c74cf37c); separate Composer security handoff prepared; nothing patched',
} as const;

export const AIO_UO_LOCATIONS = {
  studio: 'fsbw all-in-one-enterprises/design-authority/aio-office/office/ (isolated from src/; never deployed)',
  approved_roots: 'fsbw all-in-one-enterprises/design-authority/aio-office/studio.js (embed mode; authority renders unchanged)',
  build: 'node design-authority/aio-office/office/build.mjs <outDir>',
  qa: 'node design-authority/aio-office/office/qa.mjs <outDir> --shots <dir>',
  screenshots: 'fsbw AIO_OFFICE_UNIFIED_REVIEW/screens/',
  qa_report: 'fsbw AIO_OFFICE_UNIFIED_REVIEW/qa-summary.json',
  review_link: AIO_UO_REVIEW_LINK,
  migration_flow: 'https://claude.ai/artifact/1rPbngoDNkMNwTg695HUZQ',
  docs: 'docs/aio/office-unified-experience/ (SITE00, generated) · vendored to fsbw all-in-one-enterprises/docs/aio/office-unified-experience/',
} as const;

/* ═══════════════ 1 · inventory (what already existed) ═══════════════ */

export interface UoInventoryItem { item: string; kind: 'APPROVED_ROOT' | 'APPROVED_AUTHORITY' | 'CONTRACT' | 'ASSET' | 'ARTIFACT' | 'LIVE_ROUTE_FAMILY'; source: string; status: string; used_as: string }
const inv = (item: string, kind: UoInventoryItem['kind'], source: string, status: string, used_as: string): UoInventoryItem => ({ item, kind, source, status, used_as });
export const AIO_UO_INVENTORY: UoInventoryItem[] = [
  inv('HOME · WORK · REPORTS · MORE roots', 'APPROVED_ROOT', 'fsbw design-authority/aio-office/studio.js + AIO_OFFICE_VISUAL_AUTHORITY/ (38 renders)', 'CANDIDATES — designs reviewed “look really good”; formal approval pending', 'Drawn unchanged as the four roots of the review'),
  inv('Client migration authority — 41 screens + root', 'APPROVED_AUTHORITY', 'fsbw AIO_CLIENT_MIGRATION_AUTHORITY/ (authority-manifest.json, 42 entries)', 'APPROVED · LOCKED', 'INTAKE flow viewer (every screen unchanged) and section thumbnails'),
  inv('Client migration responsive blueprint', 'APPROVED_AUTHORITY', 'fsbw AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT/ · public/migration/env-wide-*.jpg', 'APPROVED', 'INTAKE root hero per viewport (env-wide-tablet / env-wide-desktop)'),
  inv('Clickable migration flow prototype', 'ARTIFACT', 'https://claude.ai/artifact/1rPbngoDNkMNwTg695HUZQ (.migration-mocks/aio-migration-flow.html)', 'PUBLISHED', 'Linked from INTAKE and every flow step'),
  inv('IFTA LIGHT ANALYTICS COMMAND — staff queue + staff case', 'APPROVED_AUTHORITY', 'fsbw docs/aio/ifta/visual-reconstruction/captures/after/STAFF_{QUEUE,CASE}_{393,834,1440}.jpg', 'APPROVED · LOCKED', 'Embedded unchanged in WORK › FILING & FUEL TAXES and every IFTA quarter record'),
  inv('Canonical office IA (five roots, 12 lanes, 10 report domains, 11 MORE entries)', 'CONTRACT', 'SITE00 projects/aio/office-ia.ts', 'LOCKED', 'Page tree and coverage check'),
  inv('Office root and lane contracts', 'CONTRACT', 'SITE00 projects/aio/office-contracts.ts', 'RECORDED', 'Which records, statuses and sections each lane may show'),
  inv('Service activation matrix', 'CONTRACT', 'fsbw src/infrastructure/serviceActivation.ts', 'LIVE', 'Service chips, brokerage PAUSED gate, partner-pending states, MORE › SERVICE CATALOG'),
  inv('Brand lockup, icon sheet, approved plates', 'ASSET', 'fsbw public/migration/brand-lockup.png · public/migration/icons/aio-icon-sheet.svg · public/brand/ifta/plates/*', 'APPROVED', 'Shell and lane bands'),
  inv('Seven labelled stand-in lane photographs', 'ASSET', 'fsbw design-authority/aio-office/standins/', 'INTERIM · LABELLED STAND-IN', 'Lane cards and lane bands until the photo pass delivers'),
  inv('Live office route families', 'LIVE_ROUTE_FAMILY', 'fsbw src/ (/office, /office/migration/*, /office/ifta, /office/crm, /office/billing, /office/invoices, lane pages)', 'PARTIAL per IA node status', 'Recorded as each page family’s live status'),
  inv('Earlier review artifacts', 'ARTIFACT', 'AIO Office prototype UCvqqLPCWwMKba1bZLn1QQ · image review JuYTR4tEFpcUv51VFnmz5Z · Founder Staff V2 2562hEnELiQyQSjCkoB5FR · Client Filing Room JDEeSCFdEea3JUTDkYxMzw', 'PUBLISHED', 'Superseded for office review by the unified review (kept as history)'),
];

/* ═══════════════ 2–3 · five-root page tree, existing versus missing ═══════════════ */

export type UoRoot = 'HOME' | 'INTAKE' | 'WORK' | 'REPORTS' | 'MORE';
export type UoReview = 'APPROVED_ROOT' | 'APPROVED_AUTHORITY' | 'NEW_FOR_REVIEW' | 'HONEST_STATE';
export type UoLive = 'PARTIAL' | 'NOT_BUILT' | 'DESIGN_ONLY' | 'PAUSED' | 'LIVE';
export interface UoPage {
  root: UoRoot;
  family: string;
  route: string;
  /** IA nodes this page family realizes (AIO_OFFICE.*). */
  ia: string[];
  review: UoReview;
  live: UoLive;
  note?: string;
  founder_only?: boolean;
}
const pg = (root: UoRoot, family: string, route: string, ia: string[], review: UoReview, live: UoLive, note?: string, founder_only?: boolean): UoPage => ({ root, family, route, ia, review, live, ...(note ? { note } : {}), ...(founder_only ? { founder_only } : {}) });
const W = (s: string) => `AIO_OFFICE.WORK.${s}`;

/** Lane slug → IA lane id and the lane's tabs (route tab, label, IA section(s) joined by |, review, live). */
export const AIO_UO_LANES: { slug: string; ia: string; name: string; landing: string; tabs: [string, string, string | null, UoReview, UoLive][] }[] = [
  { slug: 'permitting', ia: 'PERMITTING_AUTHORITIES', name: 'PERMITTING & AUTHORITIES', landing: 'Stat tiles, NEEDS ACTION first, sections with counts, service activation chips', tabs: [['overview', 'OVERVIEW', null, 'NEW_FOR_REVIEW', 'PARTIAL'], ['tags', 'TAGS / REGISTRATION', 'TAGS_REGISTRATION', 'NEW_FOR_REVIEW', 'PARTIAL'], ['fuel', 'FUEL / ROAD TAX PERMITS', 'FUEL_ROAD_TAX_PERMITS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['authorities', 'OPERATING AUTHORITIES', 'OPERATING_AUTHORITIES', 'NEW_FOR_REVIEW', 'PARTIAL'], ['boc3', 'BOC-3', 'BOC3', 'HONEST_STATE', 'NOT_BUILT'], ['llc', 'LLC / INC', 'LLC_INC', 'NEW_FOR_REVIEW', 'PARTIAL'], ['other', 'OTHER PERMITS', 'OTHER_PERMITS', 'NEW_FOR_REVIEW', 'PARTIAL']] },
  { slug: 'filing', ia: 'FILING_FUEL_TAXES', name: 'FILING & FUEL TAXES', landing: 'The approved IFTA LIGHT ANALYTICS COMMAND staff queue, embedded unchanged, beside the office’s linked quarter list', tabs: [['overview', 'IFTA COMMAND', 'IFTA', 'APPROVED_AUTHORITY', 'PARTIAL'], ['queue', 'IFTA QUEUE', 'FILING_QUEUE', 'NEW_FOR_REVIEW', 'PARTIAL'], ['approval', 'CLIENT APPROVAL', 'CLIENT_APPROVAL', 'NEW_FOR_REVIEW', 'PARTIAL'], ['filed', 'SUBMITTED / FILED', 'SUBMITTED_FILED', 'NEW_FOR_REVIEW', 'PARTIAL'], ['history', 'FILING HISTORY', 'FILING_HISTORY', 'NEW_FOR_REVIEW', 'PARTIAL']] },
  { slug: 'compliance', ia: 'COMPLIANCE', name: 'COMPLIANCE', landing: 'Expiry windows (overdue / 7 / 30 / later) with stat tiles; the three unbuilt sections drawn as honest cards', tabs: [['overview', 'OVERVIEW', null, 'NEW_FOR_REVIEW', 'PARTIAL'], ['expirations', 'EXPIRATIONS', 'EXPIRATIONS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['dot_safety', 'DOT / SAFETY', 'DOT_SAFETY', 'HONEST_STATE', 'NOT_BUILT'], ['audits', 'AUDITS', 'AUDIT_CORRECTIVE_WORK', 'HONEST_STATE', 'NOT_BUILT'], ['corrective', 'CORRECTIVE WORK', 'AUDIT_CORRECTIVE_WORK|COMPLIANCE_CASES', 'HONEST_STATE', 'NOT_BUILT']] },
  { slug: 'vehicles', ia: 'VEHICLES_FLEET', name: 'VEHICLES & FLEET', landing: 'Fleet cards: each truck with its links (driver, insurance, IFTA, load, ticket, deadlines); DESIGN ONLY banner', tabs: [['fleet', 'FLEET', null, 'NEW_FOR_REVIEW', 'DESIGN_ONLY'], ['attention', 'NEEDS ATTENTION', null, 'NEW_FOR_REVIEW', 'DESIGN_ONLY'], ['clients', 'BY CLIENT', null, 'NEW_FOR_REVIEW', 'DESIGN_ONLY']] },
  { slug: 'dispatch', ia: 'DISPATCH', name: 'DISPATCH', landing: 'Load board (BOOKED · MOVING · DELIVERED · ISSUE)', tabs: [['board', 'LOAD BOARD', 'LOADS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['clients', 'ACTIVE CLIENTS', 'ACTIVE_CLIENTS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['trucks', 'TRUCKS', 'TRUCKS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['exceptions', 'STATUS & EXCEPTIONS', 'STATUS_EXCEPTIONS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['my_loads', 'MY LOADS / MY TRUCKS', 'MY_LOADS_MY_TRUCKS', 'HONEST_STATE', 'NOT_BUILT']] },
  { slug: 'brokerage', ia: 'BROKERAGE', name: 'BROKERAGE', landing: 'PAUSED state first (business activation required), demo records only; activation is never a switch', tabs: [['overview', 'OVERVIEW', null, 'HONEST_STATE', 'PAUSED'], ['quotes', 'QUOTES', 'QUOTES', 'HONEST_STATE', 'PAUSED'], ['shipments', 'SHIPMENTS', 'SHIPMENTS', 'HONEST_STATE', 'PAUSED'], ['offers', 'CARRIER OFFERS', 'CARRIER_OFFERS', 'HONEST_STATE', 'PAUSED'], ['stops', 'STOPS & STATUS', 'STOPS_STATUS', 'HONEST_STATE', 'PAUSED'], ['financials', 'LOAD FINANCIALS', 'LOAD_FINANCIALS', 'HONEST_STATE', 'PAUSED']] },
  { slug: 'insurance', ia: 'INSURANCE', name: 'INSURANCE', landing: 'Renewal windows (7 days · 60 days · later); referral / assistance notice — nothing is bound', tabs: [['overview', 'RENEWALS AHEAD', null, 'NEW_FOR_REVIEW', 'PARTIAL'], ['intake', 'INTAKE', 'INTAKE', 'NEW_FOR_REVIEW', 'PARTIAL'], ['quotes', 'QUOTES', 'QUOTES', 'NEW_FOR_REVIEW', 'PARTIAL'], ['policies', 'POLICIES', 'POLICIES', 'NEW_FOR_REVIEW', 'PARTIAL'], ['renewals', 'RENEWALS', 'RENEWALS', 'NEW_FOR_REVIEW', 'PARTIAL']] },
  { slug: 'factoring', ia: 'FACTORING', name: 'FACTORING', landing: 'Submission board (documents needed · sent to provider · funded); provider relationships kept', tabs: [['submissions', 'SUBMISSIONS', null, 'NEW_FOR_REVIEW', 'PARTIAL'], ['providers', 'PROVIDER RELATIONSHIPS', null, 'NEW_FOR_REVIEW', 'PARTIAL']] },
  { slug: 'bookkeeping', ia: 'BOOKKEEPING', name: 'BOOKKEEPING', landing: 'Monthly close cards with progress meters and the nine-step close; the three packages unchanged', tabs: [['monthly', 'MONTHLY CLIENTS', 'MONTHLY_CLIENTS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['annual', 'ANNUAL CLIENTS', 'ANNUAL_CLIENTS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['packages', 'PACKAGES', null, 'NEW_FOR_REVIEW', 'PARTIAL'], ['reconciliation', 'RECONCILIATION', 'RECONCILIATION', 'HONEST_STATE', 'NOT_BUILT'], ['deliverables', 'DELIVERABLES', 'DELIVERABLES', 'HONEST_STATE', 'NOT_BUILT']] },
  { slug: 'drivers', ia: 'DRIVERS_CARRIERS', name: 'DRIVERS & CARRIERS', landing: 'Matching (applications) first; driver directory; credentials and approvals honest', tabs: [['matching', 'MATCHING', 'MATCHING', 'NEW_FOR_REVIEW', 'PARTIAL'], ['directory', 'DRIVERS', null, 'NEW_FOR_REVIEW', 'PARTIAL'], ['credentials', 'CREDENTIALS', 'CREDENTIALS', 'HONEST_STATE', 'NOT_BUILT'], ['approvals', 'APPROVALS', 'APPROVALS', 'HONEST_STATE', 'NOT_BUILT']] },
  { slug: 'maintenance', ia: 'MECHANIC_MAINTENANCE', name: 'MECHANIC / MAINTENANCE', landing: 'Ticket board (scheduled · waiting · done); trucks on hold; providers own the repair', tabs: [['tickets', 'TICKETS', 'TICKETS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['status', 'MAINTENANCE STATUS', 'MAINTENANCE_STATUS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['providers', 'PROVIDERS', 'PROVIDERS', 'NEW_FOR_REVIEW', 'PARTIAL'], ['referrals', 'REFERRALS', 'REFERRALS', 'NEW_FOR_REVIEW', 'PARTIAL']] },
  { slug: 'roadready', ia: 'ROAD_READY', name: 'ROAD READY', landing: 'Readiness meters per client; AVAILABLE ≠ ACTIVE notice; checklist items open their owning lane', tabs: [['profiles', 'PROFILES', null, 'NEW_FOR_REVIEW', 'PARTIAL'], ['attention', 'OPEN ITEMS', null, 'NEW_FOR_REVIEW', 'PARTIAL']] },
];

const INTAKE_SECTIONS: [string, string, string][] = [
  ['existing', 'EXISTING CLIENT FILE', 'EXISTING_CLIENT_FILE'], ['new', 'NEW CLIENT FILE', 'NEW_CLIENT_FILE'], ['bulk', 'BULK BATCH MIGRATION', 'BULK_BATCH_MIGRATION'],
  ['status', 'MIGRATION STATUS', 'MIGRATION_STATUS'], ['extraction', 'EXTRACTION & CLASSIFICATION', 'EXTRACTION_CLASSIFICATION'], ['match', 'MATCH & RECONCILE', 'MATCH_RECONCILE'],
  ['review', 'FOUNDER REVIEW', 'FOUNDER_REVIEW'], ['prebuilt', 'PREBUILT CLIENTS', 'PREBUILT_CLIENT'], ['activation', 'ACTIVATION & INVITES', 'ACTIVATION_INVITE'], ['history', 'MIGRATION HISTORY', 'MIGRATION_HISTORY'],
];
export const AIO_UO_REPORT_DOMAINS: [string, string, string, UoReview, UoLive, string][] = [
  ['', 'OVERVIEW', 'OVERVIEW', 'APPROVED_ROOT', 'PARTIAL', 'The approved REPORTS root'],
  ['clients', 'CLIENTS', 'CLIENTS', 'NEW_FOR_REVIEW', 'PARTIAL', 'Lifecycle counts (PREBUILT and INVITED never count as active); new-this-period NOT CONNECTED'],
  ['services', 'SERVICES', 'SERVICES', 'NEW_FOR_REVIEW', 'PARTIAL', 'Open work by lane; time-to-complete NOT CONNECTED'],
  ['financial_revenue', 'FINANCIAL / REVENUE', 'FINANCIAL_REVENUE', 'NEW_FOR_REVIEW', 'PARTIAL', 'Founder / finance only; the approved root’s sample figure and sums of sample invoices, labelled; no projections'],
  ['filing_history', 'FILING HISTORY', 'FILING_HISTORY', 'HONEST_STATE', 'NOT_BUILT', 'Data ready, report view not built; reads the IFTA cases directly'],
  ['compliance', 'COMPLIANCE', 'COMPLIANCE', 'NEW_FOR_REVIEW', 'PARTIAL', 'Expirations only; safety scores and audit outcomes NOT CONNECTED'],
  ['dispatch_brokerage', 'DISPATCH & BROKERAGE', 'DISPATCH_BROKERAGE', 'NEW_FOR_REVIEW', 'PARTIAL', 'Dispatch load counts; brokerage paused so it reports nothing'],
  ['bookkeeping', 'BOOKKEEPING', 'BOOKKEEPING', 'HONEST_STATE', 'NOT_BUILT', 'Seed data only; nothing reported until live'],
  ['migration', 'MIGRATION', 'MIGRATION', 'NEW_FOR_REVIEW', 'PARTIAL', 'Cases by lifecycle; only client confirmation counts as active'],
  ['exports', 'EXPORTS', 'EXPORTS', 'NEW_FOR_REVIEW', 'PARTIAL', 'CSV now (simulated, logged), PDF later; receivables aging founder only'],
];
export const AIO_UO_MORE: { slug: string; title: string; ia: string; group: string; children: string[]; staff: string; founder: string; live: UoLive; review: UoReview }[] = [
  { slug: 'clients', title: 'CLIENTS', ia: 'CLIENTS', group: 'CLIENTS & RECORDS', children: ['client/:id (Client 360, 8 tabs)'], staff: 'Directory + Client 360 (no billing tab)', founder: 'Same + billing tab', live: 'PARTIAL', review: 'NEW_FOR_REVIEW' },
  { slug: 'documents_vault', title: 'DOCUMENTS & VAULT', ia: 'DOCUMENTS_VAULT', group: 'CLIENTS & RECORDS', children: ['rec/document/:id'], staff: 'All documents; visibility change hidden', founder: 'Visibility change (simulated, recorded)', live: 'PARTIAL', review: 'NEW_FOR_REVIEW' },
  { slug: 'messages', title: 'MESSAGES', ia: 'MESSAGES', group: 'CLIENTS & RECORDS', children: ['rec/thread/:id'], staff: 'Conversations + internal notes', founder: 'Same', live: 'PARTIAL', review: 'NEW_FOR_REVIEW' },
  { slug: 'growth_crm', title: 'GROWTH / CRM', ia: 'GROWTH_CRM', group: 'BUSINESS', children: ['more/growth_crm/:lead'], staff: 'Permission page without the CRM grant', founder: 'Pipeline board + lead pages; a lead becomes a client only through INTAKE', live: 'PARTIAL', review: 'NEW_FOR_REVIEW' },
  { slug: 'billing', title: 'BILLING', ia: 'BILLING', group: 'BUSINESS', children: ['more/billing/{payments,credits,quotes}', 'rec/invoice/:id'], staff: 'Permission page without the billing grant', founder: 'Invoices, payments, credits, quotes — sample amounts, no processing', live: 'PARTIAL', review: 'NEW_FOR_REVIEW' },
  { slug: 'service_catalog', title: 'SERVICE CATALOG', ia: 'SERVICE_CATALOG', group: 'BUSINESS', children: ['more/service_catalog/:n'], staff: 'View only', founder: 'Pricing (not shown in review); activation never a switch', live: 'PARTIAL', review: 'NEW_FOR_REVIEW' },
  { slug: 'team_staff', title: 'TEAM & STAFF', ia: 'TEAM_STAFF', group: 'PEOPLE & NETWORK', children: ['more/team_staff/:id'], staff: 'Directory only; grants hidden', founder: 'Roles and grants (server-enforced), invite, deactivate', live: 'PARTIAL', review: 'NEW_FOR_REVIEW' },
  { slug: 'mechanic_network', title: 'MECHANIC NETWORK', ia: 'MECHANIC_NETWORK', group: 'PEOPLE & NETWORK', children: ['more/mechanic_network/:provider'], staff: 'Providers + message', founder: 'Verify provider', live: 'PARTIAL', review: 'NEW_FOR_REVIEW' },
  { slug: 'system_settings', title: 'SYSTEM SETTINGS', ia: 'SYSTEM_SETTINGS', group: 'SYSTEM', children: ['more/system_settings/{workflows,integrations,security,data,notifications}'], staff: 'Notifications only; other areas show the permission page', founder: 'All five areas', live: 'PARTIAL', review: 'NEW_FOR_REVIEW' },
  { slug: 'help_support', title: 'HELP & SUPPORT', ia: 'HELP_SUPPORT', group: 'SYSTEM', children: ['more/help_support/:sop'], staff: 'SOPs + support request', founder: 'Same', live: 'NOT_BUILT', review: 'NEW_FOR_REVIEW' },
  { slug: 'account', title: 'ACCOUNT', ia: 'ACCOUNT', group: 'SYSTEM', children: [], staff: 'Reached from the profile menu', founder: 'Same', live: 'NOT_BUILT', review: 'HONEST_STATE' },
];
export const AIO_UO_RECORD_TYPES: { type: string; owner: string; page: string }[] = [
  { type: 'vehicle', owner: 'VEHICLES & FLEET', page: 'The truck + CONNECTED ACROSS AIO cards (registration, driver, insurance, IFTA, dispatch, maintenance, compliance, documents)' },
  { type: 'driver', owner: 'DRIVERS & CARRIERS', page: 'Driver + credentials compliance already tracks' },
  { type: 'application', owner: 'DRIVERS & CARRIERS', page: 'Application + matching stepper; approval honest (not built)' },
  { type: 'policy', owner: 'INSURANCE', page: 'Coverage, renewal stepper, documents; never binds' },
  { type: 'quarter', owner: 'FILING & FUEL TAXES', page: 'Approved IFTA staff case embedded + the office’s quarter panel' },
  { type: 'request', owner: 'PERMITTING & AUTHORITIES', page: 'Request, blocker, progress, documents, affected trucks' },
  { type: 'deadline', owner: 'COMPLIANCE', page: 'Deadline + what it protects' },
  { type: 'load', owner: 'DISPATCH', page: 'Load, exception, status, truck, driver, factoring link' },
  { type: 'shipment', owner: 'BROKERAGE', page: 'PAUSED demo record; actions unavailable' },
  { type: 'submission', owner: 'FACTORING', page: 'Submission, provider relationship, waiting-on' },
  { type: 'subscription', owner: 'BOOKKEEPING', page: 'Package + current close' },
  { type: 'cycle', owner: 'BOOKKEEPING', page: 'Nine-step close + reconciliation honest' },
  { type: 'ticket', owner: 'MECHANIC / MAINTENANCE', page: 'Ticket, provider, authorization, truck' },
  { type: 'profile', owner: 'ROAD READY', page: 'Readiness meter + checklist that opens owning lanes' },
  { type: 'document', owner: 'DOCUMENTS & VAULT', page: 'Preview, visibility, the record it belongs to' },
  { type: 'thread', owner: 'MESSAGES', page: 'Client / staff / internal-note messages drawn apart; composer' },
  { type: 'invoice', owner: 'BILLING', page: 'Founder / billing grant; permission page otherwise' },
];

function buildTree(): UoPage[] {
  const out: UoPage[] = [
    pg('HOME', 'HOME', 'home', ['AIO_OFFICE.HOME'], 'APPROVED_ROOT', 'PARTIAL'),
    pg('HOME', 'HOME › FULL LISTS (attention · deadlines · blocked)', 'home/list/:view', ['AIO_OFFICE.HOME.NEEDS_ATTENTION', 'AIO_OFFICE.HOME.DEADLINES', 'AIO_OFFICE.HOME.BLOCKERS'], 'NEW_FOR_REVIEW', 'PARTIAL'),
    pg('HOME', 'HOME › RECENT ACTIVITY', 'home/activity', ['AIO_OFFICE.HOME.RECENT_ACTIVITY'], 'NEW_FOR_REVIEW', 'PARTIAL', 'No office-wide feed yet; events come from each lane'),
    pg('HOME', 'HOME › QUICK ACTIONS', 'home/quick', ['AIO_OFFICE.HOME.QUICK_ACTIONS'], 'NEW_FOR_REVIEW', 'PARTIAL'),
    pg('HOME', 'HOME › NOTIFICATIONS', 'home/notifications', [], 'NEW_FOR_REVIEW', 'NOT_BUILT', 'The bell has no feed yet'),
    pg('INTAKE', 'INTAKE', 'intake', ['AIO_OFFICE.INTAKE'], 'APPROVED_AUTHORITY', 'PARTIAL', 'Approved migration root modules inside the office frame + new staff sections'),
    ...INTAKE_SECTIONS.map(([k, t, ia]) => pg('INTAKE', `INTAKE › ${t}`, `intake/${k}`, [`AIO_OFFICE.INTAKE.${ia}`], 'NEW_FOR_REVIEW', 'PARTIAL')),
    pg('INTAKE', 'INTAKE › MIGRATION CASE', 'intake/case/:id', [], 'NEW_FOR_REVIEW', 'PARTIAL', 'Lifecycle stepper; approval founder-only and lands on PREBUILT'),
    pg('INTAKE', 'INTAKE › APPROVED FLOW VIEWER (existing · new · bulk · client activation)', 'intake/flow/:branch/:step', [], 'APPROVED_AUTHORITY', 'PARTIAL', '41 approved screens shown unchanged'),
    pg('WORK', 'WORK', 'work', ['AIO_OFFICE.WORK'], 'APPROVED_ROOT', 'PARTIAL'),
    pg('WORK', 'WORK › MY WORK', 'work/mine', [], 'NEW_FOR_REVIEW', 'PARTIAL'),
    pg('WORK', 'WORK › ALL OPEN WORK', 'work/queue', [], 'NEW_FOR_REVIEW', 'NOT_BUILT', 'No cross-lane queue yet; reads each lane'),
  ];
  for (const l of AIO_UO_LANES)
    for (const [tab, label, ia, review, live] of l.tabs)
      out.push(pg('WORK', `WORK › ${l.name}${tab === l.tabs[0][0] ? '' : ` › ${label}`}`, tab === l.tabs[0][0] ? `work/${l.slug}` : `work/${l.slug}/${tab}`, [W(l.ia), ...(ia ? ia.split('|').map((x) => W(`${l.ia}.${x}`)) : [])], review, live, undefined, tab === 'financials'));
  for (const t of AIO_UO_RECORD_TYPES) out.push(pg(t.type === 'document' || t.type === 'thread' || t.type === 'invoice' ? 'MORE' : 'WORK', `RECORD › ${t.type.toUpperCase()}`, `rec/${t.type}/:id`, [], t.type === 'quarter' ? 'APPROVED_AUTHORITY' : t.type === 'shipment' ? 'HONEST_STATE' : 'NEW_FOR_REVIEW', t.type === 'vehicle' ? 'DESIGN_ONLY' : t.type === 'shipment' ? 'PAUSED' : 'PARTIAL', t.page, t.type === 'invoice'));
  for (const [slug, title, ia, review, live, note] of AIO_UO_REPORT_DOMAINS) out.push(pg('REPORTS', `REPORTS › ${title}`, slug ? `reports/${slug}` : 'reports', [slug ? `AIO_OFFICE.REPORTS.${ia}` : 'AIO_OFFICE.REPORTS', ...(slug ? [] : ['AIO_OFFICE.REPORTS.OVERVIEW'])], review, live, note, ia === 'FINANCIAL_REVENUE'));
  out.push(pg('MORE', 'MORE', 'more', ['AIO_OFFICE.MORE'], 'APPROVED_ROOT', 'NOT_BUILT', 'Entries exist; the root itself is new'));
  for (const m of AIO_UO_MORE) out.push(pg('MORE', `MORE › ${m.title}`, `more/${m.slug}`, [`AIO_OFFICE.MORE.${m.ia}`], m.review, m.live, m.children.join(' · ') || undefined, m.slug === 'growth_crm' || m.slug === 'billing'));
  out.push(pg('MORE', 'CLIENT 360 (overview · services · vehicles · people · documents · messages · history · billing)', 'client/:id[/:tab]', ['AIO_OFFICE.MORE.CLIENTS'], 'NEW_FOR_REVIEW', 'PARTIAL', 'Billing tab founder only'));
  return out;
}
export const AIO_UO_PAGE_TREE: UoPage[] = buildTree();

/* ═══════════════ 4 · shared design system ═══════════════ */

export const AIO_UO_COMPONENTS: { component: string; rule: string }[] = [
  { component: 'Shell', rule: 'The approved header (lockup, area, search, bell, identity) and the five-item navigation (dock on phone / tablet, 138 px sidebar on desktop) on every page; INTAKE between HOME and WORK.' },
  { component: 'Page header', rule: 'Back button + breadcrumb trail, condensed title, one-line purpose, status words, up to two actions on phone / tablet (the full actions column on desktop).' },
  { component: 'Lane band', rule: 'Each lane’s own photograph from the WORK card as a slim band (WORK › 01 … 12), the crumb + section tabs on a panel overlapping it.' },
  { component: 'Client context bar', rule: 'Obsidian bar: badge, name, USDOT · MC · state, lifecycle word, CLIENT 360 · SWITCH · clear. Shown on records, Client 360 and any lane filtered to one client.' },
  { component: 'Tabs and filter chips', rule: 'Square-rounded tabs with counts (dashed when the section is not built); pill filter chips that keep the client context.' },
  { component: 'Rows', rule: 'List rows on phone (lead · title / sub · status); table rows on tablet and desktop (lead · title · meta · status · chevron). Static rows have no hover.' },
  { component: 'Record frame', rule: 'Header + status, client context, return-to-work, working panels, HISTORY (simulated steps marked), ACTIONS column, RELATED (linked, never copied).' },
  { component: 'Actions column', rule: 'First action gold; each says what the live office would do; unavailable actions are hatched and say why; founder-only actions never render for staff.' },
  { component: 'Honest states', rule: 'Hatched panel with NOT BUILT YET / PAUSED / NOTHING HERE YET, the shape of the page (field chips) and the IA gap it waits on.' },
  { component: 'Boards and windows', rule: 'Kanban columns (dispatch, factoring, maintenance, CRM, migration status) and time windows (compliance, insurance) — by lane, never one dashboard template.' },
  { component: 'Fleet and meter cards', rule: 'Truck cards with link chips (warn / bad) and readiness / close meters in gold.' },
  { component: 'Embeds of approved authority', rule: 'Obsidian bar naming the authority (“shown unchanged”), the approved image, and the live route.' },
  { component: 'Overlays', rule: 'Search (every result opens its owner, follows the role), client switcher, period, and the simulated-action sheet — inside the device frame.' },
];

/* ═══════════════ 9 · founder and staff ═══════════════ */

export const AIO_UO_ROLES: { area: string; founder: string; staff: string; staff_with_reports: string }[] = [
  { area: 'REPORTS', founder: 'All ten areas incl. FINANCIAL / REVENUE', staff: 'The approved lock on every report page', staff_with_reports: 'Granted areas; FINANCIAL / REVENUE shows the permission page' },
  { area: 'MORE › GROWTH / CRM, BILLING', founder: 'Full pages', staff: 'Hidden in MORE; direct links show the permission page', staff_with_reports: 'Same as staff' },
  { area: 'Record actions', founder: 'Includes REASSIGN, CHANGE VISIBILITY, CHANGE PACKAGE, VERIFY PROVIDER', staff: 'Founder-only actions absent, with a note that some actions are founder-only', staff_with_reports: 'Same as staff' },
  { area: 'INTAKE founder review', founder: 'APPROVE · LANDS ON PREBUILT; SEND BACK', staff: 'SEND FOR FOUNDER REVIEW only', staff_with_reports: 'Same as staff' },
  { area: 'Brokerage', founder: 'LOAD FINANCIALS tab; ACTIVATE BROKERAGE shown as unavailable (business activation outside the office)', staff: 'No financials tab; “only the founder can start business activation”', staff_with_reports: 'Same as staff' },
  { area: 'Team & Staff, System Settings', founder: 'Grants, invite, deactivate; all settings areas', staff: 'Directory only; notifications settings only', staff_with_reports: 'Same as staff' },
  { area: 'HOME', founder: 'NOT CONNECTED YET sources line; payment events; BUSINESS PULSE', staff: 'Quick actions without ASSIGN WORK / NEW LEAD / CREATE INVOICE; no payment events', staff_with_reports: 'Same as staff' },
  { area: 'Identity', founder: 'ALEX R. · FOUNDER', staff: 'ALEX R. · STAFF', staff_with_reports: 'ALEX R. · STAFF — the label comes from the role, never the name or email' },
];

/* ═══════════════ 10 · client context ═══════════════ */

export const AIO_UO_CLIENT_CONTEXT: { rule: string }[] = [
  { rule: 'One client record per business; every lane references it by id (no duplicate records). Client 360 reads every lane; nothing is copied into it.' },
  { rule: 'Opening a record or Client 360 sets the context; the context bar shows the client, lifecycle, CLIENT 360, SWITCH and clear.' },
  { rule: 'A lane opened from Client 360 (or after SWITCH) is filtered to the client (“@client” in the route) and says so; clearing restores every client.' },
  { rule: 'Filters and tabs keep the client context; breadcrumbs and BACK return through the visit; RETURN TO WORK goes back to the lane list a record was opened from.' },
  { rule: 'Access boundaries hold inside the context: a client’s billing tab is founder-only; PREBUILT and INVITED clients carry their gate notice on Client 360.' },
];

/* ═══════════════ 11–12 · connected review ═══════════════ */

export const AIO_UO_INTERACTIONS: { interaction: string; kind: 'REAL_NAVIGATION' | 'SIMULATED' | 'REVIEW_CHROME' }[] = [
  { interaction: 'Dock / sidebar, every row, card, tile, tab, chip, crumb, related record and link opens a designed page', kind: 'REAL_NAVIGATION' },
  { interaction: 'BACK (page and toolbar), breadcrumbs, RETURN TO WORK', kind: 'REAL_NAVIGATION' },
  { interaction: 'Search overlay (role-aware), client switcher, period selector, phone quick-actions sheet, HOME attention views', kind: 'REAL_NAVIGATION' },
  { interaction: 'Every action button asks in a sheet, then changes status + history for this visit only (marked SIMULATED · NOT SAVED); reset in the guide', kind: 'SIMULATED' },
  { interaction: 'Device (phone 390 · tablet 834 · desktop 1440 · ultra-wide 2560), view-as (founder · staff · staff with reports), Go to, guide with page status, journeys, legend and incomplete destinations', kind: 'REVIEW_CHROME' },
];

/* ═══════════════ 13–16 · viewports ═══════════════ */

export const AIO_UO_VIEWPORTS: { viewport: 'MOBILE' | 'TABLET' | 'DESKTOP' | 'ULTRA_WIDE'; size: string; rules: string[] }[] = [
  { viewport: 'MOBILE', size: '390 × 844', rules: ['Dock navigation', 'Rows as lists; tables become stacked rows', 'Two header actions; full actions column after the content', 'Boards and windows stack; tabs scroll sideways'] },
  { viewport: 'TABLET', size: '834 × 1194', rules: ['Dock navigation', 'Rows become table rows', 'Two-column boards and grids; report area selector', 'Approved migration screen beside its step detail'] },
  { viewport: 'DESKTOP', size: '1440 × 900', rules: ['138 px sidebar', 'Content + 340 px aside (actions, related) on records', 'Four-column boards; report navigation beside content'] },
  { viewport: 'ULTRA_WIDE', size: '2560 × 1440', rules: ['Same frame', 'Office pages keep the roots’ 1480 px measure; bands stay full-bleed', '400 px aside; fleet and thumbnail grids add columns', 'Flow viewer adds the branch step list as a third column'] },
];

/* ═══════════════ 17 · assets ═══════════════ */

export const AIO_UO_ASSETS = {
  reused: ['Approved plates (7) and the two hero PNGs (as JPEG copies for review)', 'Brand lockup and icon sheet', 'Migration hero, wide plates, path images, provider marks, security image', '41 approved migration screens (review-size JPEG copies; originals untouched)', 'Six approved IFTA staff captures'],
  created: [] as string[],
  generated: 'NONE — no image generation this sprint (no paid generation; the photography host is still blocked)',
  logo: 'The approved lockup only; no alternative AIO logo',
  still_missing: AIO_VA_MISSING_ASSETS.map((m) => m.asset),
} as const;

/* ═══════════════ 18 · journeys ═══════════════ */

export const AIO_UO_JOURNEYS: { id: string; title: string; role: 'FOUNDER' | 'STAFF'; steps: string[] }[] = [
  { id: 'renewal', title: 'An insurance renewal from HOME to the client', role: 'FOUNDER', steps: ['home', 'rec/policy/pol-dh', 'rec/vehicle/v-dh-12', 'client/c-dh', 'rec/thread/th-dh'] },
  { id: 'blocked', title: 'A blocked authority: what it holds up', role: 'FOUNDER', steps: ['home/list/blocked', 'rec/request/req-hf-mc', 'rec/document/doc-hf-ein', 'rec/vehicle/v-hf-3', 'rec/profile/rr-hf'] },
  { id: 'oos', title: 'An out-of-service truck ripples across lanes', role: 'FOUNDER', steps: ['work/dispatch', 'rec/load/ld-5517', 'rec/vehicle/v-tk-09', 'rec/ticket/t-tk-2', 'work/compliance/expirations'] },
  { id: 'pod', title: 'A missing POD holds up factoring', role: 'FOUNDER', steps: ['rec/load/ld-5518', 'rec/submission/fs-2210', 'rec/document/doc-tk-2'] },
  { id: 'migration', title: 'Migration lands on PREBUILT, never ACTIVE', role: 'FOUNDER', steps: ['intake', 'intake/flow/existing/0', 'intake/case/mig-sr', 'intake/prebuilt', 'client/c-mt', 'intake/activation'] },
  { id: 'ifta', title: 'An IFTA quarter from queue to client approval', role: 'FOUNDER', steps: ['work/filing', 'work/filing/queue', 'rec/quarter/ifta-rl-q3', 'client/c-rl'] },
  { id: 'credential', title: 'A driver credential expiring', role: 'FOUNDER', steps: ['work/compliance/expirations', 'rec/deadline/dl-abc-med', 'rec/driver/d-abc-1', 'rec/vehicle/v-abc-1'] },
  { id: 'paused', title: 'Brokerage stays paused', role: 'FOUNDER', steps: ['work/brokerage', 'rec/shipment/sh-4471'] },
  { id: 'roles', title: 'What staff see differently', role: 'STAFF', steps: ['reports', 'more', 'more/billing', 'rec/policy/pol-dh'] },
];

/* ═══════════════ 19 · QA (tests actually run) ═══════════════ */

export const AIO_UO_QA = {
  tool: 'qa.mjs (Playwright, chromium) over the built review',
  crawled_routes: 619,
  passes: ['desktop founder (crawl from the five roots, following every link)', 'phone · tablet · ultra-wide founder (every route found)', 'desktop staff', 'phone staff', 'desktop staff with reports'],
  checks: ['page draws (no error, no undesigned destination)', 'no console / page / request errors', 'no dead control', 'uppercase law inside the office', 'no sideways overflow', 'staff never see founder-only actions, finance figures, CRM, billing or report figures without a grant'],
  by_status: { APPROVED_ROOT: 4, APPROVED_AUTHORITY: 56, HONEST_STATE: 55, NEW_FOR_REVIEW: 504 },
  failures: 0,
  journeys: '9/9',
  interactions: ['HOME attention row opens its record', 'simulated action asks first and changes status for this visit only', 'related record opens the linked truck; BACK returns', 'search finds a record and opens it', 'client switch carries the context into a lane', 'RETURN TO WORK appears after opening a record from a lane', 'phone quick-actions sheet opens and closes', 'migration approval is founder-only and lands on PREBUILT'],
  interactions_passed: '8/8',
  authority_renders: '38/38 identical to the pinned sha256 after the studio embed edits (one raster flake re-rendered identical twice)',
  screenshots: 60,
} as const;

/* ═══════════════ 20 · Composer integration plan (DRAFT) ═══════════════ */

export const AIO_UO_COMPOSER_PLAN = {
  status: 'DRAFT — NOT ACTIONABLE UNTIL THE FOUNDER APPROVES THE UNIFIED OFFICE',
  gate: AIO_UO_NEXT_GATE,
  sequence: [
    '1 · Shell: one five-item nav list (HOME · INTAKE · WORK · REPORTS · MORE) for dock and sidebar; INTAKE routes to the existing /office/migration family.',
    '2 · Shared components from the review (office-ui.js → React): page header, client context bar, tabs, filter chips, rows, record frame, actions column, related, honest state, boards, fleet cards.',
    '3 · Record pages first (they are reached from everywhere): policy, request, quarter (IFTA case stays the approved page), load, ticket, deadline, document, thread.',
    '4 · Lane landings and sections, lane by lane, reading each lane’s contract; NOT BUILT sections stay honest until their data exists.',
    '5 · Client 360 and the client context (route-carried, cleared explicitly).',
    '6 · REPORTS domains from records only; MORE destinations with grant checks on the server.',
    '7 · Verify against the review at 390 / 834 / 1440 / 2560 with live screenshots; port qa.mjs checks to the live routes.',
  ],
  must_land_first: 'The security repairs in the separate handoff (11 · SECURITY_REPAIR_HANDOFF) before any client-facing projection is built on the affected tables.',
  do_not: ['deploy', 'change auth, role permissions, schemas, billing or client records as part of the UI work', 'redesign the approved migration screens or the IFTA authority', 'activate brokerage or any partner-pending service', 'ship sample records or SAMPLE labels', 'claim the office complete from the review'],
} as const;

/* ═══════════════ 21 · security-repair handoff (separate) ═══════════════ */

export const AIO_UO_SECURITY_RECHECK = {
  rechecked_at: 'fsbw master c74cf37c (2026-10-08)',
  method: 'Read every cited source line again; searched later migrations for replaced policies (only indexes were added; no policy replaced).',
  result: 'ALL 12 STILL OPEN',
  patched_here: 'NOTHING — this design sprint does not touch production permissions',
} as const;
export const AIO_UO_SECURITY_HANDOFF: { gap_id: string; status: 'OPEN'; evidence_still_present: string; repair: string; office_pages_waiting: string }[] = [
  { gap_id: 'P-PORTAL-VIEWS-CROSS-ORG', status: 'OPEN', evidence_still_present: 'portal views select all orgs; anon has SELECT on all tables', repair: 'Recreate the portal and management views WITH (security_invoker = true) and an organisation filter; revoke anon SELECT on business tables.', office_pages_waiting: 'REPORTS › EXPORTS; MORE › BILLING (no client-facing exports)' },
  { gap_id: 'P-SHIPPER-VIEW-INTERNAL-NOTES', status: 'OPEN', evidence_still_present: 'aio_shipper_freight_shipments selects internal_notes; shipper read policy is row-only', repair: 'Drop internal_notes from the shipper view; give shippers a column-limited view instead of the base table.', office_pages_waiting: 'WORK › BROKERAGE (paused)' },
  { gap_id: 'P-SHIPPER-READS-AUDIT', status: 'OPEN', evidence_still_present: 'aio_bae_shipper policy; audit payload carries targetCarrierRateMinor', repair: 'Remove shipper access to brokerage audit rows or expose a filtered event view without note / payload.', office_pages_waiting: 'WORK › BROKERAGE' },
  { gap_id: 'P-CLIENT-LIFECYCLE-SELF-UPDATE', status: 'OPEN', evidence_still_present: 'aio_orgs_update_members has no column restriction; client_lifecycle on the org row', repair: 'Restrict org-member UPDATE to profile columns (column grants or a trigger); move lifecycle changes to a server function the confirmation flow calls.', office_pages_waiting: 'HOME › CLIENTS IN MOTION; REPORTS › CLIENTS / MIGRATION; INTAKE' },
  { gap_id: 'P-DOCUMENTS-INTERNAL-EXPOSED', status: 'OPEN', evidence_still_present: 'getVaultDocument has no visibility check; approve inserts leave visibility = customer', repair: 'Check visibility in getVaultDocument and the calendar path; set visibility = internal on migrated legacy scans.', office_pages_waiting: 'MORE › DOCUMENTS & VAULT; every record’s documents' },
  { gap_id: 'P-ACTIVITY-INTERNAL-TO-CLIENT', status: 'OPEN', evidence_still_present: 'client activity filter passes any event with the client id', repair: 'Filter client activity on visibility = customer as well as client id.', office_pages_waiting: 'HOME › RECENT ACTIVITY (staff side marks INTERNAL)' },
  { gap_id: 'P-MESSAGES-RLS-VISIBILITY', status: 'OPEN', evidence_still_present: 'aio_messages_access ignores visibility', repair: 'Add visibility = customer to the client branch of the policy (internal users unchanged).', office_pages_waiting: 'MORE › MESSAGES (internal notes)' },
  { gap_id: 'P-FLEETCARE-TICKET-NO-ORG-CHECK', status: 'OPEN', evidence_still_present: 'client ticket page loads getTicketById with no org check', repair: 'Scope the client ticket and vehicle-history loaders to the viewer’s organisation.', office_pages_waiting: 'WORK › MECHANIC / MAINTENANCE (client mirror)' },
  { gap_id: 'P-FLEETCARE-REFERRAL-FEES-CLIENT', status: 'OPEN', evidence_still_present: 'referral read policy includes client orgs; fee columns on the row', repair: 'Remove the client branch, or give clients a view without fee columns.', office_pages_waiting: 'MORE › MECHANIC NETWORK; MORE › BILLING' },
  { gap_id: 'P-IFTA-CLIENT-AUDIT-ACTIONS', status: 'OPEN', evidence_still_present: 'activityRows returns every action with actor names', repair: 'Pass the client actor filter (or a client-safe action list) in the client filing room.', office_pages_waiting: 'WORK › FILING & FUEL TAXES (client approval)' },
  { gap_id: 'P-CLIENT-LINKS-TO-OFFICE', status: 'OPEN', evidence_still_present: 'client dispatch / factoring pages link to aioPaths.officeMessages', repair: 'Point client links at the portal inbox; keep the office guard closed in demo mode.', office_pages_waiting: 'The staff / client firewall for the whole office' },
  { gap_id: 'P-BOOKKEEPING-DRAFT-REPORTS', status: 'OPEN', evidence_still_present: 'client bookkeeping reports list has no status filter', repair: 'Show only delivered reports to clients.', office_pages_waiting: 'WORK › BOOKKEEPING › DELIVERABLES; REPORTS › BOOKKEEPING' },
];
export const AIO_UO_GRANT_ENFORCEMENT = [
  'Grant checks the review draws but the live app does not enforce yet (contracts sprint): the “+ New” menu checks no permission; reports.export and crm.leads.manage are not checked.',
  'Every founder-only action in the review must be enforced on the server by role and grant — never by hiding a button, never by name or email.',
];

/* ═══════════════ 22 · remaining gaps and continuation ═══════════════ */

export const AIO_UO_PRODUCT_GAPS: string[] = [
  'VEHICLES & FLEET has no staff workspace (design only).',
  'Not built: BOC-3 filing; Compliance DOT / Safety, Audits, Corrective work (no case model); Dispatch My loads; Bookkeeping reconciliation and deliverables; Drivers credentials and approvals; Account page; notifications feed; office-wide activity feed; cross-lane ALL OPEN WORK.',
  'REPORTS: Filing history view, Bookkeeping, client growth, time-to-complete, on-time rate, safety scores — not connected.',
  'BROKERAGE paused until business activation.',
  'Road Ready has no engagement state (AVAILABLE ≠ ACTIVE).',
  'The approved migration screens predate the five-root decision (their own dock shows FILING); the live React flow renders the current dock.',
  'Seven lane photographs are labelled stand-ins; the photography pass is still blocked (network policy).',
];
export const AIO_UO_CONTINUATION: { sprint: string; scope: string }[] = [
  { sprint: 'P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.FOUNDER-REVISIONS', scope: 'Apply the founder’s review notes to the unified office; re-run qa.mjs; refresh the review link.' },
  { sprint: 'P0.AIO.OFFICE.UNIFIED-EXPERIENCE3.STATES-AND-EDGE-CASES', scope: 'Loading, error and empty variants per record type; long-content and many-records stress pages; keyboard and screen-reader pass.' },
  { sprint: 'P0.AIO.OFFICE.PHOTOGRAPHY-PASS2', scope: 'Replace the seven stand-ins once image download is allowed, with cost approval.' },
  { sprint: 'P0.AIO.SECURITY.PRIVACY-REPAIR1 (Composer)', scope: 'The twelve repairs in 11 · SECURITY_REPAIR_HANDOFF, separately reviewed.' },
  { sprint: 'P0.AIO.OFFICE.LIVE-INTEGRATION1 (Composer)', scope: 'The integration plan in 10 · COMPOSER_INTEGRATION_PLAN, after founder approval.' },
  { sprint: 'P0.AIO.PUBLIC-WEBSITE.CINEMATIC1', scope: 'The public website (dark, cinematic, black / gold / silver) — the next separate phase; not started here.' },
];

/* ═══════════════ 23 · founder walkthrough ═══════════════ */

export const AIO_UO_WALKTHROUGH: string[] = [
  `Open ${AIO_UO_REVIEW_LINK}. Use Screen to switch phone / tablet / desktop / ultra-wide and View as to switch founder / staff.`,
  'The Guide on the right says for every page whether it is an approved root, an approved authority shown unchanged, a new design for review, or an honest state — and what the live app has today.',
  'Start with the journeys in the Guide (Next step walks each one): renewal, blocked authority, out-of-service truck, missing POD, migration to PREBUILT, IFTA quarter, driver credential, brokerage paused, staff view.',
  'Then wander: every tap opens a page. Buttons that would change something ask first and change only this visit (SIMULATED · NOT SAVED); Reset the review clears them.',
  'Check INTAKE (the approved migration screens inside the office), WORK › FILING & FUEL TAXES (the approved IFTA command), Client 360, and Incomplete destinations at the bottom of the Guide.',
];

/* ═══════════════ quality gate ═══════════════ */

const ia = AIO_OFFICE_IA.nodes;
const covered = () => new Set(AIO_UO_PAGE_TREE.flatMap((p) => p.ia));

/** Problems with the unified-experience record; [] when every IA node in the office has a page family and the record is consistent. */
export function validateUnifiedExperience(): string[] {
  const out: string[] = [];
  const have = covered();
  const roots = ['HOME', 'INTAKE', 'WORK', 'REPORTS', 'MORE'] as const;
  for (const r of roots) if (!have.has(`AIO_OFFICE.${r}`)) out.push(`root ${r} has no page`);
  for (const n of ia) {
    const inOffice = n.node_id.startsWith('AIO_OFFICE.') && n.node_id.split('.').length >= 3;
    const kinds = ['SECTION', 'SERVICE_LANE', 'LANE_SECTION', 'REPORT_DOMAIN', 'DIRECTORY_ENTRY'];
    if (inOffice && kinds.includes(n.kind) && !have.has(n.node_id)) out.push(`IA node ${n.node_id} has no page family`);
  }
  for (const id of have) if (!ia.some((n) => n.node_id === id)) out.push(`page references unknown IA node ${id}`);
  if (AIO_UO_LANES.length !== 12) out.push('expected twelve WORK lanes');
  if (AIO_UO_REPORT_DOMAINS.length !== 10) out.push('expected ten REPORTS domains');
  if (AIO_UO_MORE.length !== 11) out.push('expected eleven MORE destinations');
  if (AIO_UO_SECURITY_HANDOFF.length !== 12 || AIO_UO_SECURITY_HANDOFF.some((g) => g.status !== 'OPEN')) out.push('security handoff must list the twelve open gaps');
  if (!AIO_UO_COMPOSER_PLAN.status.startsWith('DRAFT')) out.push('Composer plan must stay a DRAFT until the founder approves');
  if (/COMPLETE/.test(AIO_UO_STATUS.office) && !/NOT COMPLETE/.test(AIO_UO_STATUS.office)) out.push('the office must not be labelled COMPLETE');
  if (AIO_UO_QA.failures !== 0) out.push('QA failures recorded');
  for (const j of AIO_UO_JOURNEYS) for (const s of j.steps) if (!AIO_UO_PAGE_TREE.some((p) => s === p.route || new RegExp(`^${p.route.replace(/\[\/:tab\]$/, '(/[a-z_]+)?').replace(/:[a-z]+/g, '[^/]+')}$`).test(s))) out.push(`journey ${j.id} step ${s} matches no page family`);
  return out;
}
