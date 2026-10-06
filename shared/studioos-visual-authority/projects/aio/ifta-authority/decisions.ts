/**
 * AIO IFTA — decisions the founder settles when confirming the page / tab / state tree (pipeline step 10).
 * OPEN decisions carry a recommendation; DECIDED ones are settled by an explicit rule in the package or the contract.
 * Nothing here is invented visual design: each item cites the package / contract / AIO source it comes from.
 */
import type { OpenDecision } from '../../../tree.js';

export const AIO_IFTA_DECISIONS: OpenDecision[] = [
  /* ── global (settled once for the whole family) ── */
  {
    decision_id: 'D-BRAND-TOKENS', kind: 'BRAND_TOKEN', scope: 'GLOBAL', status: 'OPEN',
    question: 'Which values govern the shared roles where the brand DNA board and the IFTA asset sheet disagree (gold, charcoal, darkest ink, light background)?',
    options: ['Brand DNA board values (#D4A853 · #1A1A1A · #050505 · #F6F6F4)', 'IFTA asset sheet values (#F4B223 · #1F2937 · #0B0B0B · #FFFFFF)', 'Brand board for brand roles + asset sheet for functional tokens the board does not define'],
    recommendation: 'Brand board for the shared brand roles (00_BRAND is the brand authority); adopt the asset sheet’s functional tokens where the board is silent (SUCCESS #10B981 · IN-PROGRESS #3B82F6 · WARNING #F59E0B · SOFT GRAY #E5E7EB · surface WHITE on light bodies).',
    blocks_nodes: [], evidence: ['BRAND_DNA_BOARD palette', 'ICON_ASSET_SHEET §2 color tokens'],
  },
  {
    decision_id: 'D-TYPOGRAPHY', kind: 'BRAND_TOKEN', scope: 'GLOBAL', status: 'OPEN',
    question: 'Display face: MONUMENT EXTENDED (+ BEBAS NEUE labels) per the brand DNA board, or INTER TIGHT per the IFTA asset sheet? (Uppercase primary is locked either way; INTER body is common.)',
    options: ['MONUMENT EXTENDED display + INTER + BEBAS NEUE (needs a commercial licence)', 'INTER TIGHT headings + INTER body (open licence)', 'MONUMENT EXTENDED for public / hero display only + INTER TIGHT / INTER in workspaces'],
    recommendation: 'INTER TIGHT headings + INTER body for the client and staff workspaces (matches the IFTA sheet, open licence, long-session legibility); MONUMENT EXTENDED for public / hero display only if the founder licenses it.',
    blocks_nodes: [], evidence: ['BRAND_DNA_BOARD typography', 'ICON_ASSET_SHEET §7 typography'],
  },
  {
    decision_id: 'D-INTERACTION-09', kind: 'AUTHORITY', scope: 'GLOBAL', status: 'OPEN',
    question: 'Interaction 09 on the page / component / interaction contract is illegible (“…FAQS”). What is it?',
    options: ['Founder supplies the label + behaviour', 'Drop it'],
    recommendation: 'Founder supplies it. The Brain does not guess; the tree does not bind it to any node.',
    blocks_nodes: [], evidence: ['PAGE_COMPONENT_INTERACTION_CONTRACT §05 item 09'],
  },

  {
    decision_id: 'D-ROUTES-SHELL', kind: 'SCOPE', scope: 'GLOBAL', status: 'OPEN',
    question: 'Where do the new IFTA pages mount? The planned helpers (/portal/services/ifta, /office/permitting/fuel-tax/:caseId) are unrouted today (the client path is caught by services/:serviceRequestId), and the legacy portal / office layouts carry legacy chrome with zero design authority.',
    options: ['Register static routes at the planned paths inside the existing auth / permission guards, rendering the authority family shell (no legacy chrome)', 'New top-level paths (e.g. /portal/ifta, /office/fuel-tax) with the family shell', 'Inside the legacy layouts (forbidden — LEGACY_VISUAL_LEAK)'],
    recommendation: 'Planned paths, registered as static routes (they outrank the :serviceRequestId param) inside the existing guards for auth / permissions / org context only; the page renders the authority family shell. No legacy header, sidebar, footer, width or grid.',
    blocks_nodes: [], evidence: ['fsbw src/routes/AioCoreRoutes.tsx:337', 'fsbw src/utils/paths.ts:151 · :217', 'sprint ABSOLUTE LEGACY VISUAL FIREWALL (shell architecture)'],
  },

  /* ── node-scoped ── */
  {
    decision_id: 'D-IFTA-AVAILABILITY', kind: 'CONTENT_TRUTH', scope: 'NODE', status: 'OPEN',
    question: 'Is IFTA filing publicly requestable? The catalog says ifta-filing PREPARING, the launch matrix says fuel-tax INTERNAL_ONLY (staff-coordinated), and the public CTA falls back to GO because SLUG_MAP lacks ifta-filing. Road Ready links to a non-existent ifta-setup slug.',
    options: ['LIMITED / quote request: GET STARTED opens REQUEST FILING (quote required) — availability line says staff-coordinated filing', 'INTERNAL_ONLY: public page explains the service and routes to contact AIO (no self-start)', 'GO: self-start (not true today)'],
    recommendation: 'Quote request: GET STARTED opens REQUEST FILING (quote required), with an honest availability line; the founder sets the catalog / launch status so all three sources agree.',
    blocks_nodes: ['AIO.IFTA.PUBLIC.SERVICE', 'AIO.IFTA.PUBLIC.REQUEST_FILING', 'AIO.IFTA.CLIENT.NOT_ENROLLED'],
    evidence: ['fsbw src/services/catalog/serviceCatalog.ts:356', 'fsbw src/launch/serviceActivationLaunch.ts:56 · :291', 'fsbw src/road-ready/roadReadyConfig.ts:62'],
  },
  {
    decision_id: 'D-NOTES-TAB', kind: 'SCOPE', scope: 'NODE', status: 'OPEN',
    question: 'NOTES appears as a tab on the client desktop, the 3-actor mobile sheet and every staff reference, but not in the approved parent’s six tabs (and is drawn DISABLED on the asset sheet). Is NOTES a tab, and for whom?',
    options: ['No NOTES tab anywhere (notes travel in the quarter thread)', 'Staff-only secondary NOTES tab (internal + reconciliation notes); client keeps six tabs and sends notes via MESSAGE AIO', 'Secondary NOTES tab for both actors'],
    recommendation: 'Staff-only secondary NOTES tab (contract DISCREPANCY_LOG + audit notes are staff-owned); client keeps the approved six tabs and uses MESSAGE AIO for NOTES_FOR_AIO (the contract’s method is MESSAGE). No new primary tab.',
    blocks_nodes: ['AIO.IFTA.CLIENT.ROOM.NOTES', 'AIO.IFTA.STAFF.CASE.NOTES'], evidence: ['CLIENT_TABLET_DESKTOP', 'ACTOR_MODES_MOBILE', 'FOUNDER_STAFF_TABLET_DESKTOP', 'ICON_ASSET_SHEET §5 tabs (NOTES disabled)', 'experience contract optional_inputs NOTES_FOR_AIO (method MESSAGE)'],
  },
  {
    decision_id: 'D-CLIENT-DESKTOP-STAFF-MODULES', kind: 'AUTHORITY', scope: 'NODE', status: 'OPEN',
    question: 'The client DESKTOP reference shows staff-only content (CLIENT: ALEX R. / ACCOUNT #AIO-1042 card, CLIENT HEALTH button, QUARTER TASKS incl. “Internal QA” and “Check jurisdiction rates”). What does the client desktop show in those slots?',
    options: ['Keep as drawn', 'Client-safe QUARTER TASKS (the six client-visible checklist lines) + no CLIENT HEALTH / account card (identity stays in the avatar menu)', 'Drop the QUARTER TASKS panel on client desktop'],
    recommendation: 'Client-safe QUARTER TASKS (the parent’s six checklist lines with owner = YOU / AIO) in the same slot; remove CLIENT HEALTH and the account card from client mode. Composition and zones stay as drawn.',
    blocks_nodes: ['AIO.IFTA.CLIENT.ROOM.PROGRESS'], evidence: ['CLIENT_TABLET_DESKTOP desktop', 'experience contract perspectives.client (no staff internals)', 'FOUNDER_STAFF_TABLET_DESKTOP (where those modules belong)'],
  },
  {
    decision_id: 'D-TAX-FIGURES', kind: 'DATA', scope: 'NODE', status: 'OPEN',
    question: 'The references show EST. TAX DUE during AIO preparation and a JURISDICTIONS tab that “configures tax rules / rates”. AIO holds no tax-rate data and computes no tax: per-jurisdiction net tax comes only from the staff filing worksheet in the return summary. How do the tax slots behave?',
    options: ['Tax slots read the staff-prepared return summary only: “PENDING AIO PREPARATION” before it exists, then TAX DUE / CREDIT; JURISDICTIONS shows miles · gallons · allocation · net tax per jurisdiction from the summary, rates not shown', 'Build a tax-rate table + estimate engine (new data contract — out of this sprint and forbidden without a founder sprint)'],
    recommendation: 'Read the staff-prepared return summary only. Label the metric TAX DUE / CREDIT (no “EST.”) and show PENDING until the summary exists. JURISDICTIONS client view is read-only; staff enter worksheet figures. No invented tax logic.',
    blocks_nodes: ['AIO.IFTA.CLIENT.ROOM', 'AIO.IFTA.CLIENT.ROOM.JURISDICTIONS', 'AIO.IFTA.CLIENT.ROOM.JURISDICTIONS.STATE_DETAIL', 'AIO.IFTA.STAFF.CASE', 'AIO.IFTA.STAFF.CASE.JURISDICTIONS'],
    evidence: ['CLIENT_MOBILE_PARENT_AUTHORITY metrics rail', 'PAGE_COMPONENT_INTERACTION_CONTRACT §03 JURISDICTIONS + §08 tax estimate', 'fsbw src/ifta/iftaTypes.ts IftaReturnLine.netTax (“Staff-entered … No rate tables in code”)', 'experience contract system_derivations RETURN_SUMMARY (staff-prepared; estimates never enter the return)'],
  },
  {
    decision_id: 'D-PUBLIC-COPY-TRUTH', kind: 'CONTENT_TRUTH', scope: 'NODE', status: 'OPEN',
    question: 'Public reference copy claims automation AIO does not have (“calculate your return”, “automated tracking”, “we track your … routes”, “state or province”, “submit with confidence” as e-filing). Keep the composition and rewrite the copy from the experience contract?',
    options: ['Keep the composition; copy comes from experience contract perspectives.public (truthful: staff-prepared, client-approved, AIO-filed; ELD report upload; US jurisdictions in data today)', 'Keep the reference copy (not true today)'],
    recommendation: 'Keep the composition; source every public line from the experience contract. Sample metrics are labelled SAMPLE. GET STARTED opens the REQUEST FILING flow (quote required).',
    blocks_nodes: ['AIO.IFTA.PUBLIC.SERVICE', 'AIO.IFTA.PUBLIC.SERVICE.HOW_IT_WORKS', 'AIO.IFTA.PUBLIC.SERVICE.FEATURES', 'AIO.IFTA.PUBLIC.SERVICE.JURISDICTIONS'],
    evidence: ['PUBLIC_TABLET_DESKTOP', 'ACTOR_MODES_MOBILE public column', 'experience contract perspectives.public + perspectives.system.failure_handling (no government integration)', 'fsbw infrastructure/serviceActivation fuel-tax INTERNAL_ONLY'],
  },
  {
    decision_id: 'D-STAFF-QUEUE-AUTHORITY', kind: 'AUTHORITY', scope: 'NODE', status: 'OPEN',
    question: 'The package has no reference for the multi-client FUEL TAX QUEUE (contract work_queue: client-quarters by due date × readiness with hub buckets). How is its authority supplied?',
    options: ['Founder supplies a queue authority (one image, light dense)', 'Founder authorises derivation from the staff case authority (status chips · risk / flag panel · metrics rail · table rows)', 'Sidekick fallback (explicit founder request only)'],
    recommendation: 'Founder supplies (or explicitly authorises derivation of) a queue authority. The Brain does not invent the queue composition.',
    blocks_nodes: ['AIO.IFTA.STAFF.QUEUE'], evidence: ['FOUNDER_STAFF_TABLET_DESKTOP (single client only)', 'experience contract perspectives.founder_staff.work_queue + hub_buckets'],
  },

  /* ── decided by an explicit rule ── */
  {
    decision_id: 'D-VENDOR-LOGOS', kind: 'AUTHORITY', scope: 'GLOBAL', status: 'DECIDED',
    question: 'Third-party fuel-brand logos in the FUEL PURCHASES reference?', options: ['Vendor names as text'],
    recommendation: 'Vendor names render as text — asset sheet usage note: “do not include any … third-party branding”.', blocks_nodes: [], evidence: ['FUEL_PURCHASES_CHILD_PROOF', 'ICON_ASSET_SHEET §7 usage notes'],
  },
  {
    decision_id: 'D-FUEL-STATE-COLUMN', kind: 'DATA', scope: 'GLOBAL', status: 'DECIDED',
    question: 'The FUEL PURCHASES reference table has no STATE column.', options: ['Add STATE inside the receipt table component'],
    recommendation: 'Sprint §12 requires STATE; IftaReceipt.jurisdiction exists. Added as a column of the same table component (content fit, flexible area) — no new composition.', blocks_nodes: [], evidence: ['sprint §12', 'fsbw src/ifta/iftaTypes.ts IftaReceipt.jurisdiction'],
  },
  {
    decision_id: 'D-RECEIPT-STATUS-MAP', kind: 'DATA', scope: 'GLOBAL', status: 'DECIDED',
    question: 'Reference chips (PROCESSED · NEEDS REVIEW · MISSING DETAILS) vs contract classes (READY · NEEDS_YOU · DUPLICATE · POSSIBLE_MISSING · UNREADABLE · UNDER_AIO_REVIEW).', options: ['Map (state registry RECORD layer)'],
    recommendation: 'PROCESSED ← READY / verified · NEEDS REVIEW ← UNDER_AIO_REVIEW · MISSING DETAILS ← NEEDS_YOU · DUPLICATE ← DUPLICATE · UNREADABLE ← UNREADABLE (chips from the status-chip family: complete green / in progress blue / attention amber) · POSSIBLE_MISSING is a flag row, not a receipt chip.', blocks_nodes: [], evidence: ['FUEL_PURCHASES_CHILD_PROOF', 'ICON_ASSET_SHEET status chips', 'experience contract AIO_IFTA_RECEIPT_CLASSES'],
  },
  {
    decision_id: 'D-PUBLIC-SAMPLE-DATA', kind: 'CONTENT_TRUTH', scope: 'GLOBAL', status: 'DECIDED',
    question: 'Public hero and metrics show a quarter with figures.', options: ['Label SAMPLE; never bind to client data'],
    recommendation: 'Public mode shows a static, labelled SAMPLE quarter only (sprint §20: public mode must not display private client data).', blocks_nodes: [], evidence: ['sprint §20', 'PUBLIC_TABLET_DESKTOP'],
  },
  {
    decision_id: 'D-PROGRESS-PHASES', kind: 'DATA', scope: 'GLOBAL', status: 'DECIDED',
    question: 'Reference FILING PROGRESS has four phases; the contract has twelve states and a six-step service progress.', options: ['Map phases over states'],
    recommendation: 'DATA COLLECTION = QUARTER_OPEN · COLLECTING · NEEDS_CLIENT · OVERDUE_RISK; AIO PREPARATION = AIO_REVIEW · RECONCILING (· FILING_REJECTED correction); CLIENT REVIEW = AWAITING_APPROVAL; FILE & CONFIRM = FILING · FILED (→ ARCHIVED). The six checklist lines are the compartments.', blocks_nodes: [], evidence: ['CLIENT_MOBILE_PARENT_AUTHORITY filing progress', 'sprint §6', 'experience contract states'],
  },
  {
    decision_id: 'D-CTA-GET-STARTED', kind: 'CONTENT_TRUTH', scope: 'GLOBAL', status: 'DECIDED',
    question: 'Reference CTA GET STARTED vs contract public_cta REQUEST FILING.', options: ['GET STARTED label opens the REQUEST FILING flow'],
    recommendation: 'The authority label (GET STARTED) triggers the contract action (REQUEST FILING → quote request; IFTA account prerequisite routes to IFTA registration).', blocks_nodes: [], evidence: ['PUBLIC_TABLET_DESKTOP', 'experience contract public_cta + information_hierarchy.PUBLIC.blocker'],
  },
  {
    decision_id: 'D-STAFF-MOBILE-SCOPE', kind: 'SCOPE', scope: 'GLOBAL', status: 'DECIDED',
    question: 'The earlier authority input said staff mobile is out of scope; the package includes a staff mobile derivation.', options: ['Package supersedes'],
    recommendation: 'Staff mobile is in scope (ACTOR_MODES_MOBILE staff column). The authority package supersedes the earlier input package viewport note.', blocks_nodes: [], evidence: ['ACTOR_MODES_MOBILE', 'docs/studioos/visual-authority-development/AIO_IFTA_FOUNDER_AUTHORITY_INPUT.json (superseded note)'],
  },
];

export const AIO_IFTA_OPEN_DECISION_IDS = AIO_IFTA_DECISIONS.filter((d) => d.status === 'OPEN').map((d) => d.decision_id);
