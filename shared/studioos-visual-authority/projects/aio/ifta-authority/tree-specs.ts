/**
 * AIO IFTA — page / tab / state tree specs (sprint §8–20, §30–36).
 *
 *   AIO → IFTA → ACTOR MODE → PAGE FAMILY → PAGE → TAB → CHILD PAGE / DRAWER / MODAL / FLOW / STATE VIEW → COMPONENT → INTERACTION
 *
 * Specs carry only what is authored per node. index.ts completes every node contract from single sources:
 * write_contracts ← the node's interactions · data_domains ← its contracts · asset_refs ← its components ·
 * open_decisions ← the decision registry · derivation conditions ← the registries (never asserted by hand) ·
 * responsive_modes ← the actor × viewport responsive authority + the node rule below.
 */
import type { AuthorityBindingKind, NodePermission, TreeNodeType } from '../../../tree.js';
import type { BundleRefId } from './bundle.js';

export type BindingSpec = { binding: AuthorityBindingKind; refs: BundleRefId[]; note?: string };
export type TreeNodeSpec = {
  node_id: string;
  node_type: TreeNodeType;
  actor: 'AIO' | 'CLIENT' | 'FOUNDER_STAFF' | 'PUBLIC';
  page_family: string;
  tab_id: string | null;
  parent_node: string | null;
  title: string;
  purpose: string;
  primary_object: string;
  primary_task: string;
  read_contracts: string[];
  components: string[];
  interactions: string[];
  states: string[];
  /** [MOBILE, TABLET, DESKTOP] — omitted for pure structure nodes. */
  bindings?: [BindingSpec, BindingSpec, BindingSpec];
  /** [MOBILE, TABLET, DESKTOP] node rule (what changes here at each viewport). */
  resp?: [string, string, string];
  permissions?: NodePermission[];
  cross_feature_dependencies?: string[];
  vault_relationship?: string;
  inbox_relationship?: string;
  activity_relationship?: string;
  success_condition: string;
  blocked_condition: string;
  experience_refs: string[];
  tab_class?: 'PRIMARY' | 'SECONDARY_CANDIDATE';
  overrides?: string[];
  notes?: string[];
};

/* ─────────────────────────────── shared pieces ─────────────────────────────── */

const P = 'CLIENT_MOBILE_PARENT_AUTHORITY' as const;
const FP = 'FUEL_PURCHASES_CHILD_PROOF' as const;
const CTD = 'CLIENT_TABLET_DESKTOP' as const;
const STD = 'FOUNDER_STAFF_TABLET_DESKTOP' as const;
const AM = 'ACTOR_MODES_MOBILE' as const;
const PTD = 'PUBLIC_TABLET_DESKTOP' as const;
const K = 'PAGE_COMPONENT_INTERACTION_CONTRACT' as const;
const A = 'ICON_ASSET_SHEET' as const;

const direct = (...refs: BundleRefId[]): BindingSpec => ({ binding: 'DIRECT', refs });
const derived = (note: string, ...refs: BundleRefId[]): BindingSpec => ({ binding: 'DERIVED', refs, note });
const missing = (note: string): BindingSpec => ({ binding: 'MISSING', refs: [], note });

/** Client child of a tab: derived from the tab's governing references + contract + asset sheet. */
const clientChild = (note: string): [BindingSpec, BindingSpec, BindingSpec] => [derived(note, P, FP, K, A), derived(note, CTD, P, K, A), derived(note, CTD, P, K, A)];
const staffChild = (note: string): [BindingSpec, BindingSpec, BindingSpec] => [derived(note, AM, FP, K, A), derived(note, STD, K, A), derived(note, STD, K, A)];
const clientTabDerived = (note: string): [BindingSpec, BindingSpec, BindingSpec] => [derived(note, P, FP, K, A), derived(note, CTD, FP, K, A), derived(note, CTD, FP, K, A)];
const staffTabDerived = (note: string): [BindingSpec, BindingSpec, BindingSpec] => [derived(note, AM, STD, FP, K, A), derived(note, STD, FP, K, A), derived(note, STD, FP, K, A)];

const C_PERM = (rights: NodePermission['rights']): NodePermission[] => [
  { actor: 'CLIENT', rights, scope: 'own organisation’s quarter; writes only while the quarter is unlocked (COLLECTION states)' },
  { actor: 'FOUNDER_STAFF', rights: ['VIEW'], scope: 'reads the same records through the staff case file (mirror, not this surface)' },
];
const S_PERM = (rights: NodePermission['rights']): NodePermission[] => [{ actor: 'FOUNDER_STAFF', rights, scope: 'office role (assigned staff or founder); overrides need a note and are audited' }];
const PUB_PERM: NodePermission[] = [{ actor: 'PUBLIC', rights: ['VIEW'], scope: 'anonymous; static content + SAMPLE quarter only — never private client data' }];

const ROOM = 'AIO.IFTA.CLIENT.ROOM';
const CASE = 'AIO.IFTA.STAFF.CASE';
const PUB = 'AIO.IFTA.PUBLIC.SERVICE';
const CF = 'AIO.IFTA.CLIENT.FILING_ROOM';
const SF = 'AIO.IFTA.STAFF.FUEL_TAX_OFFICE';
const PF = 'AIO.IFTA.PUBLIC.SERVICE_FAMILY';

const VAULT_PACKET = 'Quarter packet seals to VAULT › Tax & Fuel › IFTA › {YYYY} › Q{n} on FILED (contract vault_destination; path naming open in the scan).';
const NO_VAULT = 'NONE — this node does not read or write Vault records.';
const THREAD = 'Quarter request thread (one per client-quarter); inbox events IFTA_QUARTER_OPEN · IFTA_NEEDS_YOU · IFTA_APPROVAL_REQUEST · IFTA_FILED.';
const NO_INBOX = 'NONE — no inbox event originates here.';
const ACT_CLIENT = 'Reads IFTA activity kinds with visibility customer (ACT_RECEIPTS_ADDED · ACT_SUBMITTED · ACT_APPROVED · ACT_FILED · ACT_ARCHIVED).';

/* ─────────────────────────────── structure ─────────────────────────────── */

const structure = (node_id: string, node_type: TreeNodeType, actor: TreeNodeSpec['actor'], parent_node: string | null, page_family: string, title: string, purpose: string): TreeNodeSpec => ({
  node_id, node_type, actor, page_family, tab_id: null, parent_node, title, purpose, primary_object: 'THE QUARTER', primary_task: purpose,
  read_contracts: [], components: [], interactions: [], states: [], success_condition: '—', blocked_condition: '—', experience_refs: [],
});

export const AIO_IFTA_TREE_SPECS: TreeNodeSpec[] = [
  structure('AIO', 'PROJECT', 'AIO', null, '—', 'ALL IN ONE ENTERPRISES INC', 'Project root.'),
  structure('AIO.IFTA', 'FEATURE_FAMILY', 'AIO', 'AIO', '—', 'IFTA / FUEL TAX — QUARTERLY FILING ROOM', 'Feature family: quarterly IFTA return built from verified fuel + miles, approved by the client, filed by AIO, archived — every quarter.'),
  structure('AIO.IFTA.PUBLIC', 'ACTOR_MODE', 'PUBLIC', 'AIO.IFTA', '—', 'PUBLIC / CUSTOMER — DARK_PRIMARY', 'Cinematic service experience: understand IFTA filing with AIO and request it.'),
  structure('AIO.IFTA.CLIENT', 'ACTOR_MODE', 'CLIENT', 'AIO.IFTA', '—', 'CLIENT — LIGHT_PRIMARY', 'Calm, guided quarter workspace: send fuel and miles, resolve flags, approve.'),
  structure('AIO.IFTA.STAFF', 'ACTOR_MODE', 'FOUNDER_STAFF', 'AIO.IFTA', '—', 'FOUNDER / STAFF — LIGHT_PRIMARY + DARK_OPERATIONAL_ACCENTS', 'Dense case file: see what blocks each filing and act.'),
  structure(PF, 'PAGE_FAMILY', 'PUBLIC', 'AIO.IFTA.PUBLIC', PF, 'IFTA FILING ROOM — PUBLIC SERVICE', 'Public service page family derived from the client parent DNA.'),
  structure(CF, 'PAGE_FAMILY', 'CLIENT', 'AIO.IFTA.CLIENT', CF, 'IFTA FILING ROOM — CLIENT', 'LIGHT ANALYTICS COMMAND parent authority family.'),
  structure(SF, 'PAGE_FAMILY', 'FOUNDER_STAFF', 'AIO.IFTA.STAFF', SF, 'IFTA FILING ROOM — FOUNDER / STAFF', 'Staff mirror family: fuel tax queue + client-quarter case file.'),

  /* ═════════════════════════════ CLIENT ═════════════════════════════ */
  {
    node_id: ROOM, node_type: 'PAGE', actor: 'CLIENT', page_family: CF, tab_id: null, parent_node: CF,
    title: 'IFTA FILING ROOM — Q{n} {YYYY} (root)', purpose: 'The quarter as a live business object: identity, live metrics, the tab family of its compartments, process status, one next action, the lower brand band.',
    primary_object: 'THE QUARTER (Q{n} {YYYY})', primary_task: 'Get this quarter’s fuel and miles to AIO, then approve the return.',
    read_contracts: ['QUARTER.read.case', 'QUARTER.read.derived', 'QUARTER.read.history', 'RETURN.read.summary', 'NOTIF.read'],
    components: ['TOP_NAV', 'QUARTER_HERO', 'METRICS_RAIL', 'TAB_BAR', 'QUARTER_SELECTOR', 'NEXT_ACTION_RAIL', 'HELP_RAIL', 'BRAND_EXIT_BAND', 'STATUS_CHIP'],
    interactions: ['I.SWITCH_TAB', 'I.SWITCH_QUARTER', 'I.CONTINUE_NEXT_ACTION', 'I.SEARCH', 'I.OPEN_NOTIFICATIONS', 'I.MESSAGE_AIO'],
    states: ['COLLECTING', 'NEEDS_YOU', 'READY_FOR_AIO', 'AIO_REVIEWING', 'CORRECTION_REQUIRED', 'READY_FOR_CLIENT_REVIEW', 'CLIENT_APPROVAL_PENDING', 'APPROVED_FOR_FILING', 'FILING', 'FILED', 'PAYMENT_PENDING', 'COMPLETE', 'ARCHIVED', 'NEXT_QUARTER_OPEN', 'OVERDUE_RISK', 'FILING_REJECTED', 'UI.LOADING', 'UI.ERROR'],
    bindings: [direct(P), direct(CTD), direct(CTD)],
    resp: ['shell: tall hero → metrics → scrollable tabs → tab body → next-action rail → band', 'shell: hero + metrics full width; tab body in two columns', 'shell: wide hero; tab bar + quarter selector; tab body in three columns; rail beside the band'],
    permissions: C_PERM(['VIEW', 'MESSAGE']),
    cross_feature_dependencies: ['AIO.MY_OFFICE (attention card entry)', 'AIO.NOTIFICATIONS (Tax & Fuel)', 'AIO.INBOX (quarter thread)'],
    vault_relationship: VAULT_PACKET, inbox_relationship: THREAD, activity_relationship: ACT_CLIENT,
    success_condition: 'The client sees the quarter, its state and the single next thing to do on every tab.', blocked_condition: 'Quarter not found / no IFTA service → NOT_ENROLLED view; read failure → UI.ERROR in the body (shell stays).',
    experience_refs: ['primary_visual_object', 'perspectives.client.primary_task', 'perspectives.client.sees_first', 'composition_rules', 'client_cta'],
  },
  {
    node_id: `${ROOM}.PROGRESS`, node_type: 'TAB', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: ROOM, tab_class: 'PRIMARY',
    title: 'PROGRESS', purpose: 'Show end-to-end quarter readiness (sprint §11): collection, AIO preparation, client review, filing status, next action, blockers, insights, recent uploads, activity, jurisdiction overview, quarter metrics.',
    primary_object: 'THE QUARTER’S FILING PROGRESS', primary_task: 'Know exactly what AIO needs next and where the quarter stands.',
    read_contracts: ['QUARTER.read.derived', 'FUEL.read.receipts', 'MILEAGE.read.records', 'JURIS.read.breakdown', 'ACTIVITY.read.ifta_client', 'DOCS.read.vault'],
    components: ['TASK_LIST', 'FILING_WORKFLOW', 'MAP_PANEL', 'RECENT_UPLOADS', 'INSIGHTS_PANEL', 'ACTIVITY_TIMELINE', 'RISK_FLAG_PANEL', 'MILEAGE_BARS', 'FUEL_DONUT', 'VEHICLE_ROW'],
    interactions: ['I.CONTINUE_NEXT_ACTION', 'I.OPEN_JURISDICTION', 'I.OPEN_FILE', 'I.RESOLVE_FLAG', 'I.SEND_QUARTER_TO_AIO', 'I.REVIEW_DRAFT'],
    states: ['COLLECTING', 'NEEDS_YOU', 'READY_FOR_AIO', 'AIO_REVIEWING', 'CORRECTION_REQUIRED', 'READY_FOR_CLIENT_REVIEW', 'CLIENT_APPROVAL_PENDING', 'APPROVED_FOR_FILING', 'FILING', 'OVERDUE_RISK', 'UI.DEFAULT', 'UI.LOADING', 'UI.EMPTY', 'UI.BLOCKED', 'UI.LOCKED_IN_REVIEW'],
    bindings: [direct(P), direct(CTD), direct(CTD)],
    resp: ['checklist → filing progress → jurisdiction map → recent uploads → insights → activity (stacked)', '(filing progress | quick actions) · (jurisdiction | uploads) · (insights | activity)', '(workflow | quarter tasks | mileage bars) · (jurisdiction | fuel donut | vehicles) · (uploads | activity | insights)'],
    permissions: C_PERM(['VIEW', 'EDIT', 'MESSAGE']),
    cross_feature_dependencies: ['AIO.VAULT (recent uploads)', 'AIO.MY_OFFICE (attention mirrors the next action)'],
    vault_relationship: 'Reads recent source uploads; links to the Vault packet once sealed.', inbox_relationship: THREAD, activity_relationship: ACT_CLIENT,
    success_condition: 'Every checklist line shows its state; the next-action rail names the single next item; blockers are listed with the fix.', blocked_condition: 'Open client items → NEEDS YOU drawer; OVERDUE_RISK → deadline line over the progress; inputs locked in review.',
    experience_refs: ['perspectives.client.project_room', 'information_hierarchy.CLIENT', 'visual_relationships.COLLECTING', 'visual_relationships.AIO_REVIEW', 'section_overrides.CLIENT'],
    overrides: ['PRIMARY_TASK: readiness overview', 'CONTENT_MODULES: checklist + workflow + map + uploads + insights + activity'],
    notes: ['Desktop QUARTER TASKS / CLIENT HEALTH / account card content: decision D-CLIENT-DESKTOP-STAFF-MODULES.'],
  },
  { node_id: `${ROOM}.PROGRESS.NEEDS_YOU`, node_type: 'DRAWER', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: `${ROOM}.PROGRESS`, title: 'NEEDS YOU — {n} ITEMS', purpose: 'Blocked state: one row per open client item with the fix inline (receipt questions, unreadable, possible missing, duplicate, truck without miles).', primary_object: 'OPEN CLIENT ITEMS', primary_task: 'Resolve each item so AIO can review.', read_contracts: ['QUARTER.read.derived', 'FUEL.read.receipts', 'MILEAGE.read.records'], components: ['DETAIL_DRAWER', 'RISK_FLAG_PANEL', 'RECEIPT_ROW', 'STATUS_CHIP'], interactions: ['I.RESOLVE_FLAG', 'I.RETAKE_UNREADABLE', 'I.CHOOSE_MILEAGE_SOURCE'], states: ['NEEDS_YOU', 'CORRECTION_REQUIRED', 'RECEIPT.MISSING_DETAILS', 'RECEIPT.DUPLICATE', 'RECEIPT.UNREADABLE', 'RECEIPT.POSSIBLE_MISSING', 'UI.SUCCESS', 'UI.EMPTY'], bindings: clientChild('Blocked-state list built from the parent checklist rows + status chips + contract sheet #03 drawer.'), permissions: C_PERM(['VIEW', 'EDIT']), inbox_relationship: 'IFTA_NEEDS_YOU notice resolves as items clear.', activity_relationship: 'Resolutions are audited on the quarter.', vault_relationship: NO_VAULT, success_condition: 'Zero open items → state returns to COLLECTING / READY FOR AIO.', blocked_condition: 'Quarter locked → read only.', experience_refs: ['perspectives.client.needs_you', 'visual_relationships.NEEDS_CLIENT', 'inbox_events.IFTA_NEEDS_YOU'], cross_feature_dependencies: [] },
  { node_id: `${ROOM}.PROGRESS.CORRECTION_FLOW`, node_type: 'FLOW', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: `${ROOM}.PROGRESS`, title: 'CORRECTION REQUESTED', purpose: 'Correction flow: AIO sent specific items back; the client fixes each one and the quarter returns to AIO.', primary_object: 'AIO CORRECTION REQUEST', primary_task: 'Fix the requested items and send the quarter back.', read_contracts: ['STAFF.read.discrepancies', 'FUEL.read.receipts', 'MSG.read.thread'], components: ['DETAIL_DRAWER', 'RISK_FLAG_PANEL', 'RECEIPT_ROW', 'MESSAGE_THREAD', 'NEXT_ACTION_RAIL'], interactions: ['I.RESOLVE_FLAG', 'I.RETAKE_UNREADABLE', 'I.MESSAGE_AIO', 'I.SEND_QUARTER_TO_AIO'], states: ['CORRECTION_REQUIRED', 'NEEDS_YOU', 'READY_FOR_AIO', 'UI.SUCCESS'], bindings: clientChild('Correction list = NEEDS YOU rows scoped to the request message; derived from parent checklist + flag panel.'), permissions: C_PERM(['VIEW', 'EDIT', 'MESSAGE']), inbox_relationship: 'Correction request arrives as a client notice + thread message.', activity_relationship: 'Correction resolution audited; corrections auto-close when items resolve.', vault_relationship: NO_VAULT, success_condition: 'All requested items resolved → SEND QUARTER TO AIO again.', blocked_condition: 'Items still open.', experience_refs: ['transitions', 'perspectives.founder_staff.corrections', 'interaction_grammar.REQUEST CORRECTION'], cross_feature_dependencies: [] },
  { node_id: `${ROOM}.PROGRESS.SEND_CONFIRM`, node_type: 'MODAL', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: `${ROOM}.PROGRESS`, title: 'SEND QUARTER TO AIO', purpose: 'Confirm submitting the packet; inputs lock while AIO reviews.', primary_object: 'THE QUARTER PACKET', primary_task: 'Submit the quarter for AIO review.', read_contracts: ['QUARTER.read.derived'], components: ['CONFIRM_MODAL'], interactions: ['I.SEND_QUARTER_TO_AIO'], states: ['READY_FOR_AIO', 'AIO_REVIEWING', 'UI.BLOCKED', 'UI.SUCCESS', 'UI.ERROR'], bindings: clientChild('Contract sheet #10 + family confirm modal.'), permissions: C_PERM(['VIEW', 'EDIT']), inbox_relationship: 'Staff notice: quarter ready for review.', activity_relationship: 'ACT_SUBMITTED.', vault_relationship: NO_VAULT, success_condition: 'State AIO REVIEWING; capture tools quiet.', blocked_condition: 'canSendToAio false → blocking items listed, nothing sent.', experience_refs: ['interaction_grammar.SEND QUARTER TO AIO', 'activity_events.ACT_SUBMITTED'], cross_feature_dependencies: ['Office (staff notice / work queue)'] },
  { node_id: `${ROOM}.PROGRESS.RETURN_REVIEW`, node_type: 'CHILD_PAGE', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: `${ROOM}.PROGRESS`, title: 'YOUR REVIEW & APPROVAL', purpose: 'Decision window: the return summary is the object (miles, gallons, MPG, tax due / credit by jurisdiction) with approve / ask beside it.', primary_object: 'THE RETURN SUMMARY', primary_task: 'Approve the return AIO will file, or ask a question.', read_contracts: ['RETURN.read.summary', 'JURIS.read.tax'], components: ['QUARTER_HERO', 'METRICS_RAIL', 'RETURN_SUMMARY_SHEET', 'JURISDICTION_TABLE', 'NEXT_ACTION_RAIL', 'HELP_RAIL'], interactions: ['I.REVIEW_DRAFT', 'I.APPROVE_RETURN', 'I.ASK_QUESTION', 'I.DOWNLOAD_FILE'], states: ['READY_FOR_CLIENT_REVIEW', 'CLIENT_APPROVAL_PENDING', 'APPROVED_FOR_FILING', 'DOC.REVIEW_COPY', 'UI.LOADING', 'UI.SUCCESS', 'UI.ERROR'], bindings: clientChild('Derived: metrics rail + jurisdiction table + dark next-action rail (APPROVE RETURN); the parent shows the YOUR REVIEW & APPROVAL line.'), resp: ['metrics → stacked jurisdiction rows → APPROVE rail → ask link', 'metrics → table → rail', 'metrics → table with approval column → rail'], permissions: C_PERM(['VIEW', 'APPROVE', 'DOWNLOAD', 'MESSAGE']), inbox_relationship: 'Opened from IFTA_APPROVAL_REQUEST; approval resolves the request.', activity_relationship: 'ACT_APPROVED.', vault_relationship: 'Approved summary becomes part of the sealed packet.', success_condition: 'Approval recorded with timestamp → APPROVED — AIO IS FILING.', blocked_condition: 'No summary yet → PENDING AIO PREPARATION; summary revised → re-review.', experience_refs: ['client_approval_points', 'visual_relationships.AWAITING_APPROVAL', 'output_artifacts.RETURN_SUMMARY', 'section_overrides.CLIENT'], cross_feature_dependencies: ['AIO.INBOX (approval request)'], notes: ['Highest-stakes client decision; derived composition recommended for a founder spot-check at tree confirmation.'] },
  { node_id: `${ROOM}.PROGRESS.RETURN_REVIEW.APPROVE_CONFIRM`, node_type: 'MODAL', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: `${ROOM}.PROGRESS.RETURN_REVIEW`, title: 'APPROVE RETURN', purpose: 'Confirm approval: AIO may file only after approval.', primary_object: 'THE RETURN SUMMARY', primary_task: 'Confirm the approval.', read_contracts: ['RETURN.read.summary'], components: ['CONFIRM_MODAL'], interactions: ['I.APPROVE_RETURN'], states: ['APPROVED_FOR_FILING', 'UI.SUCCESS', 'UI.ERROR'], bindings: clientChild('Family confirm modal.'), permissions: C_PERM(['APPROVE']), inbox_relationship: 'Resolves IFTA_APPROVAL_REQUEST.', activity_relationship: 'ACT_APPROVED.', vault_relationship: NO_VAULT, success_condition: 'approvedAt recorded.', blocked_condition: 'Not in AWAITING_APPROVAL.', experience_refs: ['interaction_grammar.APPROVE'], cross_feature_dependencies: [] },
  { node_id: `${ROOM}.PROGRESS.RETURN_REVIEW.ASK`, node_type: 'DRAWER', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: `${ROOM}.PROGRESS.RETURN_REVIEW`, title: 'ASK A QUESTION', purpose: 'Question a line before approving (review flow back to AIO).', primary_object: 'A RETURN LINE', primary_task: 'Ask AIO about the return.', read_contracts: ['MSG.read.thread', 'RETURN.read.summary'], components: ['DETAIL_DRAWER', 'MESSAGE_THREAD'], interactions: ['I.ASK_QUESTION'], states: ['AIO_REVIEWING', 'UI.SUCCESS', 'UI.ERROR'], bindings: clientChild('Family drawer + thread.'), permissions: C_PERM(['MESSAGE']), inbox_relationship: 'Question posts to the quarter thread.', activity_relationship: 'Audited on the quarter.', vault_relationship: NO_VAULT, success_condition: 'Question sent; quarter back to RECONCILING.', blocked_condition: 'Empty question.', experience_refs: ['interaction_grammar.ASK A QUESTION'], cross_feature_dependencies: ['AIO.INBOX'] },

  {
    node_id: `${ROOM}.FUEL_PURCHASES`, node_type: 'TAB', actor: 'CLIENT', page_family: CF, tab_id: 'FUEL_PURCHASES', parent_node: ROOM, tab_class: 'PRIMARY',
    title: 'FUEL PURCHASES', purpose: 'Collect, verify, correct and reconcile fuel purchase records (sprint §12).',
    primary_object: 'THE QUARTER’S FUEL RECEIPTS', primary_task: 'Get every fuel purchase into the quarter and answer what AIO asks about them.',
    read_contracts: ['FUEL.read.receipts', 'QUARTER.read.derived', 'ACTIVITY.read.ifta_client'],
    components: ['QUARTER_HERO', 'METRICS_RAIL', 'UPLOAD_ZONE', 'RECEIPT_ROW', 'RECEIPT_STATUS_SUMMARY', 'FUEL_DONUT', 'INSIGHTS_PANEL', 'ACTIVITY_TIMELINE', 'EMPTY_STATE', 'NEXT_ACTION_RAIL', 'STATUS_CHIP'],
    interactions: ['I.UPLOAD_RECEIPT', 'I.TAKE_PHOTO', 'I.IMPORT_FROM_VAULT', 'I.IMPORT_CSV', 'I.OPEN_RECEIPT', 'I.FILTER_SORT', 'I.CONTINUE_NEXT_ACTION'],
    states: ['COLLECTING', 'NEEDS_YOU', 'AIO_REVIEWING', 'RECEIPT.PROCESSED', 'RECEIPT.NEEDS_REVIEW', 'RECEIPT.MISSING_DETAILS', 'RECEIPT.DUPLICATE', 'RECEIPT.UNREADABLE', 'RECEIPT.POSSIBLE_MISSING', 'UI.DEFAULT', 'UI.LOADING', 'UI.EMPTY', 'UI.SUCCESS', 'UI.ERROR', 'UI.LOCKED_IN_REVIEW'],
    bindings: [direct(P, FP), derived('Tablet / desktop derive the FUEL PURCHASES child proof onto the client tablet / desktop grid.', CTD, FP, K, A), derived('Tablet / desktop derive the FUEL PURCHASES child proof onto the client tablet / desktop grid.', CTD, FP, K, A)],
    resp: ['hero title Q{n} FUEL PURCHASES → fuel metrics → upload zone (camera first) → stacked receipt rows → status counts → vendor donut → insights → activity → CONTINUE TO MILEAGE rail', 'upload zone | status counts; receipt table full width; donut | insights', 'upload zone | status counts | vendor donut; receipt table (date · vendor · state · gallons · amount · status) full width; insights | activity'],
    permissions: C_PERM(['VIEW', 'CREATE', 'EDIT', 'VERIFY']),
    cross_feature_dependencies: ['AIO.VAULT (import receipts already stored; tax_fuel)', 'AIO.BOOKKEEPING (fuel expense categorisation downstream)'],
    vault_relationship: 'IMPORT FROM VAULT reads tax_fuel receipts in the quarter; receipts belong under the quarter folder (not stored as documents today).', inbox_relationship: 'Receipt questions raise IFTA_NEEDS_YOU.', activity_relationship: 'ACT_RECEIPTS_ADDED.',
    success_condition: 'Every receipt has a class; counts match; no open receipt questions.', blocked_condition: 'Quarter locked in AIO review → upload zone quiet (UI.LOCKED_IN_REVIEW).',
    experience_refs: ['required_inputs.FUEL_RECEIPTS', 'output_artifacts.FUEL_RECEIPT', 'system_derivations.RECEIPT_PARSE', 'system_derivations.DUPLICATE_CHECK', 'interaction_grammar.UPLOAD', 'interaction_grammar.TAKE PHOTO'],
    overrides: ['PRIMARY_TASK: capture + verify receipts', 'PRIMARY_DATA: receipts', 'CONTENT_MODULES: upload zone · receipt table · status counts · vendor donut', 'ACTIONS: upload · photo · vault import · CSV import', 'STATES: receipt classes'],
    notes: ['Child proof is DERIVATION PROOF, not a template: other tabs reuse its parent-derivation rule, not its modules.'],
  },
  { node_id: `${ROOM}.FUEL_PURCHASES.UPLOAD`, node_type: 'FLOW', actor: 'CLIENT', page_family: CF, tab_id: 'FUEL_PURCHASES', parent_node: `${ROOM}.FUEL_PURCHASES`, title: 'UPLOAD RECEIPTS', purpose: 'Upload flow: drag & drop / choose files / take photo → parse → classify → rows appear.', primary_object: 'RECEIPT FILES', primary_task: 'Add receipts to the quarter.', read_contracts: ['FUEL.read.receipts'], components: ['UPLOAD_ZONE', 'RECEIPT_ROW', 'STATUS_CHIP'], interactions: ['I.UPLOAD_RECEIPT', 'I.TAKE_PHOTO'], states: ['UI.DEFAULT', 'UI.LOADING', 'UI.SUCCESS', 'UI.ERROR', 'RECEIPT.UNREADABLE', 'RECEIPT.DUPLICATE'], bindings: [direct(FP), derived('Upload zone on the tablet / desktop grid.', CTD, FP, K, A), derived('Upload zone on the tablet / desktop grid.', CTD, FP, K, A)], permissions: C_PERM(['CREATE']), inbox_relationship: NO_INBOX, activity_relationship: 'ACT_RECEIPTS_ADDED.', vault_relationship: 'Files should land under the quarter folder (not stored today).', success_condition: 'n receipts added with classes.', blocked_condition: 'Locked quarter; file type / size rejected.', experience_refs: ['required_inputs.FUEL_RECEIPTS', 'automations.AUTO_PARSE_RECEIPT'], cross_feature_dependencies: [] },
  { node_id: `${ROOM}.FUEL_PURCHASES.CSV_IMPORT`, node_type: 'MODAL', actor: 'CLIENT', page_family: CF, tab_id: 'FUEL_PURCHASES', parent_node: `${ROOM}.FUEL_PURCHASES`, title: 'IMPORT CSV', purpose: 'Map fields and validate a fuel card / fuel log export before import.', primary_object: 'FUEL CSV', primary_task: 'Import many purchases at once.', read_contracts: ['FUEL.read.receipts'], components: ['CONFIRM_MODAL', 'CSV_MAPPER'], interactions: ['I.IMPORT_CSV'], states: ['UI.DEFAULT', 'UI.WARNING', 'UI.ERROR', 'UI.SUCCESS'], bindings: clientChild('Contract sheet #02 “map fields and validate” on the family modal.'), permissions: C_PERM(['CREATE']), inbox_relationship: NO_INBOX, activity_relationship: 'ACT_RECEIPTS_ADDED.', vault_relationship: NO_VAULT, success_condition: 'Valid rows imported as receipts.', blocked_condition: 'Unmapped / invalid columns.', experience_refs: ['optional_inputs.FUEL_CARD_STATEMENT'], cross_feature_dependencies: [] },
  { node_id: `${ROOM}.FUEL_PURCHASES.IMPORT_VAULT`, node_type: 'MODAL', actor: 'CLIENT', page_family: CF, tab_id: 'FUEL_PURCHASES', parent_node: `${ROOM}.FUEL_PURCHASES`, title: 'IMPORT FROM VAULT', purpose: 'Pick tax_fuel receipts already in the Vault for the quarter dates.', primary_object: 'VAULT RECEIPTS', primary_task: 'Reuse receipts already stored.', read_contracts: ['DOCS.read.vault'], components: ['CONFIRM_MODAL', 'FILE_ROW'], interactions: ['I.IMPORT_FROM_VAULT'], states: ['UI.DEFAULT', 'UI.EMPTY', 'UI.SUCCESS'], bindings: clientChild('Family modal + file rows.'), permissions: C_PERM(['CREATE']), inbox_relationship: NO_INBOX, activity_relationship: 'ACT_RECEIPTS_ADDED.', vault_relationship: 'Reads Vault documents (tax_fuel; currently also billing receipts — scan conflict).', success_condition: 'Receipts linked to their Vault documents.', blocked_condition: 'No matching documents.', experience_refs: ['perspectives.client.system_already_knows'], cross_feature_dependencies: ['AIO.VAULT'] },
  { node_id: `${ROOM}.FUEL_PURCHASES.RECEIPT_DETAIL`, node_type: 'DRAWER', actor: 'CLIENT', page_family: CF, tab_id: 'FUEL_PURCHASES', parent_node: `${ROOM}.FUEL_PURCHASES`, title: 'RECEIPT DETAIL', purpose: 'Detail / edit: image, parsed fields, state, vehicle, flag reason with the fix inline, history (corrected receipt supersedes; original kept).', primary_object: 'ONE RECEIPT', primary_task: 'Check or correct a receipt.', read_contracts: ['FUEL.read.receipts'], components: ['DETAIL_DRAWER', 'STATUS_CHIP'], interactions: ['I.OPEN_RECEIPT', 'I.EDIT_RECEIPT', 'I.RETAKE_UNREADABLE', 'I.RESOLVE_FLAG'], states: ['RECEIPT.PROCESSED', 'RECEIPT.NEEDS_REVIEW', 'RECEIPT.MISSING_DETAILS', 'RECEIPT.DUPLICATE', 'RECEIPT.UNREADABLE', 'DOC.SUPERSEDED', 'UI.SUCCESS', 'UI.READ_ONLY'], bindings: clientChild('Contract sheet #03 detail drawer from the receipt row menu.'), permissions: C_PERM(['VIEW', 'EDIT']), inbox_relationship: NO_INBOX, activity_relationship: 'Resolution audited.', vault_relationship: 'Links to the Vault document when imported.', success_condition: 'Receipt PROCESSED or explained.', blocked_condition: 'Locked quarter → read only.', experience_refs: ['output_artifacts.FUEL_RECEIPT'], cross_feature_dependencies: [] },

  {
    node_id: `${ROOM}.MILEAGE`, node_type: 'TAB', actor: 'CLIENT', page_family: CF, tab_id: 'MILEAGE', parent_node: ROOM, tab_class: 'PRIMARY',
    title: 'MILEAGE', purpose: 'Track miles by jurisdiction per truck (sprint §13): source, import, manual entry, validation, exceptions, trip + fuel relationship.',
    primary_object: 'MILES BY STATE PER TRUCK', primary_task: 'Give every qualified truck a verified mileage source.',
    read_contracts: ['MILEAGE.read.records', 'JURIS.read.breakdown', 'VEHICLES.read.quarter', 'FUEL.read.receipts'],
    components: ['QUARTER_HERO', 'METRICS_RAIL', 'MILEAGE_ROW', 'MILEAGE_BARS', 'MAP_PANEL', 'MILEAGE_SOURCE_PICKER', 'INSIGHTS_PANEL', 'EMPTY_STATE', 'NEXT_ACTION_RAIL'],
    interactions: ['I.CHOOSE_MILEAGE_SOURCE', 'I.IMPORT_MILEAGE_REPORT', 'I.ENTER_MILEAGE_MANUAL', 'I.OPEN_MILEAGE_RECORD', 'I.FILTER_SORT', 'I.CONTINUE_NEXT_ACTION'],
    states: ['COLLECTING', 'NEEDS_YOU', 'MILEAGE.VERIFIED', 'MILEAGE.UNVERIFIED', 'MILEAGE.ESTIMATED', 'MILEAGE.EXCEPTION', 'UI.DEFAULT', 'UI.LOADING', 'UI.EMPTY', 'UI.WARNING', 'UI.ERROR', 'UI.LOCKED_IN_REVIEW'],
    bindings: clientTabDerived('Derived from the parent (MILEAGE BY JURISDICTION checklist line + map) with the FUEL PURCHASES derivation rule; desktop mileage bars from the client desktop.'),
    resp: ['hero title Q{n} MILEAGE → mileage metrics → per-truck rows with source badge → map → insights → rail', 'truck rows | bars; map full width', 'truck × state table | bars | map'],
    permissions: C_PERM(['VIEW', 'CREATE', 'EDIT']),
    cross_feature_dependencies: ['AIO.DISPATCH_OPERATIONS (load miles → ESTIMATE only)', 'ELD provider exports (report upload; live ELD / GPS not supported)'],
    vault_relationship: 'Mileage reports belong under the quarter folder (not stored today).', inbox_relationship: 'Truck without miles raises IFTA_NEEDS_YOU.', activity_relationship: 'Mileage additions audited on the quarter.',
    success_condition: 'Every truck that ran has VERIFIED (or awaiting-verification) miles by state; no estimate-only truck.', blocked_condition: 'Estimate-only truck or exception → flag; locked in review.',
    experience_refs: ['required_inputs.JURISDICTION_MILEAGE', 'output_artifacts.JURISDICTION_MILEAGE_RECORD', 'system_derivations.MILEAGE_QUALITY', 'composition_rules'],
    overrides: ['PRIMARY_TASK: miles by state per truck', 'PRIMARY_DATA: mileage records', 'CONTENT_MODULES: truck rows · bars · map · source picker', 'ACTIONS: report upload · manual entry', 'STATES: mileage quality'],
  },
  { node_id: `${ROOM}.MILEAGE.SOURCE_PICKER`, node_type: 'DRAWER', actor: 'CLIENT', page_family: CF, tab_id: 'MILEAGE', parent_node: `${ROOM}.MILEAGE`, title: 'ADD MILES — CHOOSE SOURCE', purpose: 'Source picker sheet: ELD / GPS (not live) · ELD report upload · manual state entry · spreadsheet · AIO assistance.', primary_object: 'MILEAGE SOURCE', primary_task: 'Pick how miles arrive for a truck.', read_contracts: ['VEHICLES.read.quarter'], components: ['DETAIL_DRAWER', 'MILEAGE_SOURCE_PICKER'], interactions: ['I.CHOOSE_MILEAGE_SOURCE', 'I.CONNECT_ELD'], states: ['UI.DEFAULT'], bindings: clientChild('Contract mobile_behavior “mileage source picker as a sheet”; built from task-list rows.'), permissions: C_PERM(['VIEW', 'CREATE']), inbox_relationship: 'AIO ASSISTANCE posts to the thread.', activity_relationship: NO_INBOX, vault_relationship: NO_VAULT, success_condition: 'Source chosen.', blocked_condition: 'ELD / GPS not live → report upload offered.', experience_refs: ['mobile_behavior'], cross_feature_dependencies: [], notes: ['I.CONNECT_ELD is ROADMAP_NOT_SUPPORTED and is excluded from readiness; the picker shows it as NOT LIVE YET.'] },
  { node_id: `${ROOM}.MILEAGE.REPORT_IMPORT`, node_type: 'MODAL', actor: 'CLIENT', page_family: CF, tab_id: 'MILEAGE', parent_node: `${ROOM}.MILEAGE`, title: 'IMPORT MILEAGE REPORT / CSV', purpose: 'Upload an ELD state-mileage report or spreadsheet; map + validate.', primary_object: 'MILEAGE REPORT', primary_task: 'Import miles by state.', read_contracts: ['MILEAGE.read.records'], components: ['CONFIRM_MODAL', 'CSV_MAPPER', 'UPLOAD_ZONE'], interactions: ['I.IMPORT_MILEAGE_REPORT'], states: ['UI.DEFAULT', 'UI.WARNING', 'UI.ERROR', 'UI.SUCCESS', 'MILEAGE.UNVERIFIED'], bindings: clientChild('Contract sheet #02 import on the family modal.'), permissions: C_PERM(['CREATE']), inbox_relationship: NO_INBOX, activity_relationship: 'Audited.', vault_relationship: 'Report file belongs under the quarter folder (not stored today).', success_condition: 'Miles recorded with source badge.', blocked_condition: 'Unparseable report.', experience_refs: ['required_inputs.JURISDICTION_MILEAGE'], cross_feature_dependencies: ['ELD provider exports'] },
  { node_id: `${ROOM}.MILEAGE.MANUAL_ENTRY`, node_type: 'DRAWER', actor: 'CLIENT', page_family: CF, tab_id: 'MILEAGE', parent_node: `${ROOM}.MILEAGE`, title: 'ENTER MILES BY STATE', purpose: 'Manual entry: miles per state for one truck (verified after staff review).', primary_object: 'ONE TRUCK’S MILES', primary_task: 'Enter miles by state.', read_contracts: ['MILEAGE.read.records', 'VEHICLES.read.quarter'], components: ['DETAIL_DRAWER', 'MILEAGE_ROW'], interactions: ['I.ENTER_MILEAGE_MANUAL'], states: ['UI.DEFAULT', 'UI.ERROR', 'UI.SUCCESS', 'MILEAGE.UNVERIFIED'], bindings: clientChild('Family drawer with mileage rows.'), permissions: C_PERM(['CREATE', 'EDIT']), inbox_relationship: NO_INBOX, activity_relationship: 'Audited.', vault_relationship: NO_VAULT, success_condition: 'Miles saved; badge AWAITING AIO VERIFICATION.', blocked_condition: 'Invalid state / miles.', experience_refs: ['required_inputs.JURISDICTION_MILEAGE'], cross_feature_dependencies: [] },
  { node_id: `${ROOM}.MILEAGE.VEHICLE_DETAIL`, node_type: 'DRAWER', actor: 'CLIENT', page_family: CF, tab_id: 'MILEAGE', parent_node: `${ROOM}.MILEAGE`, title: 'TRUCK MILEAGE', purpose: 'Miles by state, source, exceptions, fuel relationship, superseded sources for one truck.', primary_object: 'ONE TRUCK’S MILEAGE', primary_task: 'Check or correct a truck’s miles.', read_contracts: ['MILEAGE.read.records', 'FUEL.read.receipts'], components: ['DETAIL_DRAWER', 'MILEAGE_ROW', 'STATUS_CHIP'], interactions: ['I.OPEN_MILEAGE_RECORD', 'I.CHOOSE_MILEAGE_SOURCE'], states: ['MILEAGE.VERIFIED', 'MILEAGE.UNVERIFIED', 'MILEAGE.ESTIMATED', 'MILEAGE.EXCEPTION', 'DOC.SUPERSEDED'], bindings: clientChild('Contract sheet #03 detail drawer.'), permissions: C_PERM(['VIEW', 'EDIT']), inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, vault_relationship: NO_VAULT, success_condition: 'Truck’s miles verified or explained.', blocked_condition: 'Locked quarter → read only.', experience_refs: ['output_artifacts.JURISDICTION_MILEAGE_RECORD'], cross_feature_dependencies: [] },

  {
    node_id: `${ROOM}.VEHICLES`, node_type: 'TAB', actor: 'CLIENT', page_family: CF, tab_id: 'VEHICLES', parent_node: ROOM, tab_class: 'PRIMARY',
    title: 'VEHICLES', purpose: 'Manage vehicle and trip data relevant to the quarter (sprint §14): active vehicles, unit numbers, trip data, quarter participation, missing data, detail, excluded state, validation, filing impact.',
    primary_object: 'THE QUARTER’S QUALIFIED VEHICLES', primary_task: 'Confirm which trucks ran and that each has fuel + miles.',
    read_contracts: ['VEHICLES.read.quarter', 'VEHICLES.read.fleet', 'MILEAGE.read.records', 'FUEL.read.receipts'],
    components: ['QUARTER_HERO', 'METRICS_RAIL', 'VEHICLE_ROW', 'STATUS_CHIP', 'INSIGHTS_PANEL', 'EMPTY_STATE', 'NEXT_ACTION_RAIL'],
    interactions: ['I.CONFIRM_VEHICLES', 'I.OPEN_VEHICLE', 'I.MANAGE_FLEET', 'I.FILTER_SORT', 'I.CONTINUE_NEXT_ACTION'],
    states: ['COLLECTING', 'NEEDS_YOU', 'VEHICLE.ACTIVE', 'VEHICLE.NOT_OPERATED', 'VEHICLE.MISSING_DATA', 'UI.DEFAULT', 'UI.LOADING', 'UI.EMPTY', 'UI.WARNING', 'UI.LOCKED_IN_REVIEW'],
    bindings: clientTabDerived('Derived from the parent VEHICLE & TRIP DATA line and the client desktop VEHICLE & TRIP DATA panel (trucks 101–104).'),
    resp: ['vehicle rows with participation + readiness → CONFIRM FLEET rail', 'vehicle rows | insights', 'vehicle table (unit · miles · gallons · participation · readiness)'],
    permissions: C_PERM(['VIEW', 'EDIT', 'VERIFY']),
    cross_feature_dependencies: ['Fleet profile (owns units: add / edit / deactivate)', 'AIO.ROAD_READY (qualified vehicles)'],
    vault_relationship: NO_VAULT, inbox_relationship: 'Truck without data raises IFTA_NEEDS_YOU.', activity_relationship: 'Fleet confirmation audited.',
    success_condition: 'Every fleet truck is marked ran / did not run; every truck that ran has fuel + verified miles.', blocked_condition: 'Unconfirmed participation or missing data → NEEDS YOU.',
    experience_refs: ['required_inputs.QUARTER_VEHICLES', 'perspectives.client.system_already_knows'],
    overrides: ['PRIMARY_TASK: participation', 'PRIMARY_DATA: quarter vehicles', 'CONTENT_MODULES: vehicle rows', 'ACTIONS: confirm fleet', 'STATES: vehicle participation'],
    notes: ['Contract sheet “add / edit / deactivate” reconciled: the fleet profile owns units; the quarter records participation (IFTA vehicle copies are a LEGACY_DUPLICATE of powerUnits).'],
  },
  { node_id: `${ROOM}.VEHICLES.CONFIRM_FLEET`, node_type: 'MODAL', actor: 'CLIENT', page_family: CF, tab_id: 'VEHICLES', parent_node: `${ROOM}.VEHICLES`, title: 'CONFIRM TRUCKS THAT RAN', purpose: 'Confirm quarter participation (pre-filled from the fleet profile); a truck that did not run is excluded.', primary_object: 'QUARTER PARTICIPATION', primary_task: 'Mark each truck ran / did not run.', read_contracts: ['VEHICLES.read.quarter'], components: ['CONFIRM_MODAL', 'VEHICLE_ROW'], interactions: ['I.CONFIRM_VEHICLES'], states: ['VEHICLE.ACTIVE', 'VEHICLE.NOT_OPERATED', 'UI.SUCCESS'], bindings: clientChild('Contract sheet #05 verify record on the family modal.'), permissions: C_PERM(['VERIFY']), inbox_relationship: NO_INBOX, activity_relationship: 'Audited (“Fleet confirmed — n trucks ran”).', vault_relationship: NO_VAULT, success_condition: 'Participation recorded.', blocked_condition: 'Locked quarter.', experience_refs: ['required_inputs.QUARTER_VEHICLES', 'interaction_grammar.VERIFY'], cross_feature_dependencies: ['Fleet profile'] },
  { node_id: `${ROOM}.VEHICLES.VEHICLE_DETAIL`, node_type: 'DRAWER', actor: 'CLIENT', page_family: CF, tab_id: 'VEHICLES', parent_node: `${ROOM}.VEHICLES`, title: 'VEHICLE DETAIL', purpose: 'Unit, participation, fuel + miles this quarter, readiness, filing impact, prior-quarter MPG.', primary_object: 'ONE VEHICLE', primary_task: 'See what a truck still needs.', read_contracts: ['VEHICLES.read.quarter', 'MILEAGE.read.records', 'FUEL.read.receipts'], components: ['DETAIL_DRAWER', 'STATUS_CHIP', 'MILEAGE_ROW'], interactions: ['I.OPEN_VEHICLE', 'I.CHOOSE_MILEAGE_SOURCE'], states: ['VEHICLE.ACTIVE', 'VEHICLE.NOT_OPERATED', 'VEHICLE.MISSING_DATA'], bindings: clientChild('Contract sheet #03 detail drawer.'), permissions: C_PERM(['VIEW']), inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, vault_relationship: NO_VAULT, success_condition: 'Truck’s filing impact clear.', blocked_condition: '—', experience_refs: ['required_inputs.QUARTER_VEHICLES'], cross_feature_dependencies: [] },

  {
    node_id: `${ROOM}.JURISDICTIONS`, node_type: 'TAB', actor: 'CLIENT', page_family: CF, tab_id: 'JURISDICTIONS', parent_node: ROOM, tab_class: 'PRIMARY',
    title: 'JURISDICTIONS', purpose: 'Show state / jurisdiction distribution and the tax relationship (sprint §15): miles, gallons, rate / tax relationship, allocation, exception, state detail, map, data quality, review status.',
    primary_object: 'THE QUARTER BY JURISDICTION', primary_task: 'See where miles and fuel fall and what is still being checked.',
    read_contracts: ['JURIS.read.breakdown', 'JURIS.read.tax', 'MILEAGE.read.records', 'FUEL.read.receipts', 'STAFF.read.discrepancies'],
    components: ['QUARTER_HERO', 'METRICS_RAIL', 'MAP_PANEL', 'JURISDICTION_TABLE', 'MILEAGE_BARS', 'STATUS_CHIP', 'INSIGHTS_PANEL', 'EMPTY_STATE', 'NEXT_ACTION_RAIL'],
    interactions: ['I.OPEN_JURISDICTION', 'I.FILTER_SORT', 'I.CONTINUE_NEXT_ACTION'],
    states: ['COLLECTING', 'AIO_REVIEWING', 'READY_FOR_CLIENT_REVIEW', 'JURISDICTION.OK', 'JURISDICTION.EXCEPTION', 'RECEIPT.POSSIBLE_MISSING', 'UI.DEFAULT', 'UI.LOADING', 'UI.EMPTY', 'UI.WARNING'],
    bindings: clientTabDerived('Derived from the parent JURISDICTION BREAKDOWN map + legend and the desktop mileage-by-jurisdiction bars.'),
    resp: ['map + legend → jurisdiction rows → insights', 'map | table', 'map | bars | table with data quality + review status'],
    permissions: C_PERM(['VIEW']),
    cross_feature_dependencies: ['Base jurisdiction (external filing destination)'],
    vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: 'Reads reconciliation outcomes (plain-language) — staff notes stay internal.',
    success_condition: 'Every jurisdiction has miles + fuel or an explanation; tax per jurisdiction shown once the return summary exists.', blocked_condition: 'Miles without fuel → POSSIBLE MISSING RECEIPT; tax PENDING until AIO prepares the return.',
    experience_refs: ['system_derivations.JURISDICTION_CLASSIFY', 'system_derivations.POSSIBLE_MISSING', 'output_artifacts.RETURN_SUMMARY'],
    overrides: ['PRIMARY_TASK: distribution + tax relationship', 'PRIMARY_DATA: per-jurisdiction rollup', 'CONTENT_MODULES: map · table · bars', 'ACTIONS: open jurisdiction (client read-only)', 'STATES: jurisdiction quality'],
    notes: ['Contract sheet “configure jurisdictions and tax rules / manage settings” is a staff capability; client view is read-only. No rate data exists (D-TAX-FIGURES).'],
  },
  { node_id: `${ROOM}.JURISDICTIONS.STATE_DETAIL`, node_type: 'DRAWER', actor: 'CLIENT', page_family: CF, tab_id: 'JURISDICTIONS', parent_node: `${ROOM}.JURISDICTIONS`, title: 'JURISDICTION DETAIL', purpose: 'One jurisdiction: miles by truck, gallons, allocation, net tax (summary only), exceptions, data quality, review status.', primary_object: 'ONE JURISDICTION', primary_task: 'Understand one state’s line.', read_contracts: ['JURIS.read.breakdown', 'JURIS.read.tax', 'MILEAGE.read.records', 'FUEL.read.receipts'], components: ['DETAIL_DRAWER', 'JURISDICTION_TABLE', 'STATUS_CHIP'], interactions: ['I.OPEN_JURISDICTION'], states: ['JURISDICTION.OK', 'JURISDICTION.EXCEPTION', 'RECEIPT.POSSIBLE_MISSING'], bindings: clientChild('Contract sheet #03 detail drawer from the map / legend.'), permissions: C_PERM(['VIEW']), inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, vault_relationship: NO_VAULT, success_condition: 'Line understood.', blocked_condition: '—', experience_refs: ['system_derivations.JURISDICTION_CLASSIFY'], cross_feature_dependencies: [] },

  {
    node_id: `${ROOM}.DOCUMENTS`, node_type: 'TAB', actor: 'CLIENT', page_family: CF, tab_id: 'DOCUMENTS', parent_node: ROOM, tab_class: 'PRIMARY',
    title: 'DOCUMENTS', purpose: 'Manage the quarter’s filing records (sprint §16): source files, receipts, mileage reports, draft return, client review copy, final return, confirmation, payment record, Vault destination, file status, version / supersession.',
    primary_object: 'THE QUARTER’S FILING RECORDS', primary_task: 'Find, view and download any record of the quarter.',
    read_contracts: ['DOCS.read.packet', 'DOCS.read.vault', 'DOCS.read.download', 'RETURN.read.summary', 'FILING.read.record', 'PAYMENT.read.record', 'FUEL.read.receipts', 'MILEAGE.read.records'],
    components: ['QUARTER_HERO', 'METRICS_RAIL', 'FILE_ROW', 'RECENT_UPLOADS', 'STATUS_CHIP', 'EMPTY_STATE', 'NEXT_ACTION_RAIL'],
    interactions: ['I.OPEN_FILE', 'I.DOWNLOAD_FILE', 'I.SHARE_FILE', 'I.OPEN_VAULT_RECORD', 'I.FILTER_SORT'],
    states: ['COLLECTING', 'FILED', 'COMPLETE', 'ARCHIVED', 'DOC.SOURCE', 'DOC.REVIEW_COPY', 'DOC.APPROVED', 'DOC.FINAL', 'DOC.SEALED', 'DOC.SUPERSEDED', 'UI.DEFAULT', 'UI.LOADING', 'UI.EMPTY', 'UI.ERROR'],
    bindings: clientTabDerived('Derived from the parent RECENT UPLOADS rows and the client desktop file table (file · date · status).'),
    resp: ['grouped file rows (sources · return · confirmation) → VIEW IN VAULT rail', 'file rows | packet status', 'file table with version + status; Vault destination line'],
    permissions: C_PERM(['VIEW', 'DOWNLOAD', 'SHARE']),
    cross_feature_dependencies: ['AIO.VAULT (destination folder)'],
    vault_relationship: VAULT_PACKET, inbox_relationship: 'IFTA_FILED carries the confirmation.', activity_relationship: 'ACT_FILED / ACT_ARCHIVED.',
    success_condition: 'All quarter records listed with status; filed return + confirmation downloadable; packet in the Vault.', blocked_condition: 'Records not stored as documents yet (packet metadata only) → shows the destination path.',
    experience_refs: ['output_artifacts.QUARTER_PACKET', 'output_artifacts.FILED_RETURN', 'output_artifacts.FILING_CONFIRMATION', 'vault_destination'],
    overrides: ['PRIMARY_TASK: records', 'PRIMARY_DATA: documents', 'CONTENT_MODULES: file rows', 'ACTIONS: view · download · share · open in Vault', 'STATES: document lifecycle'],
  },
  { node_id: `${ROOM}.DOCUMENTS.FILE_PREVIEW`, node_type: 'DRAWER', actor: 'CLIENT', page_family: CF, tab_id: 'DOCUMENTS', parent_node: `${ROOM}.DOCUMENTS`, title: 'FILE PREVIEW', purpose: 'Preview, download, share; version history (superseded versions kept).', primary_object: 'ONE DOCUMENT', primary_task: 'View or download a record.', read_contracts: ['DOCS.read.vault', 'DOCS.read.download'], components: ['DETAIL_DRAWER', 'FILE_ROW'], interactions: ['I.OPEN_FILE', 'I.DOWNLOAD_FILE', 'I.SHARE_FILE'], states: ['DOC.FINAL', 'DOC.SEALED', 'DOC.SUPERSEDED', 'UI.ERROR'], bindings: clientChild('Contract sheet #03 detail drawer from a file row.'), permissions: C_PERM(['VIEW', 'DOWNLOAD', 'SHARE']), inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, vault_relationship: 'Reads the Vault document.', success_condition: 'Document shown.', blocked_condition: 'File unavailable.', experience_refs: ['output_artifacts.FILED_RETURN'], cross_feature_dependencies: ['AIO.VAULT'] },

  {
    node_id: `${ROOM}.NOTES`, node_type: 'TAB', actor: 'CLIENT', page_family: CF, tab_id: 'NOTES', parent_node: ROOM, tab_class: 'SECONDARY_CANDIDATE',
    title: 'NOTES (candidate)', purpose: 'Notes for AIO (context such as “truck sold mid-quarter”). Shown on the client desktop reference; absent from the approved parent’s six tabs.',
    primary_object: 'NOTES FOR AIO', primary_task: 'Tell AIO context about the quarter.',
    read_contracts: ['NOTES.read', 'MSG.read.thread'], components: ['TAB_BAR', 'MESSAGE_THREAD', 'EMPTY_STATE'], interactions: ['I.SAVE_NOTE', 'I.MESSAGE_AIO'],
    states: ['UI.DEFAULT', 'UI.EMPTY'],
    bindings: [derived('Tab label only in references (no NOTES content composition); asset sheet shows the tab DISABLED.', CTD, AM, A), derived('Tab label only.', CTD, A), derived('Tab label only.', CTD, A)],
    permissions: C_PERM(['VIEW', 'MESSAGE']), cross_feature_dependencies: ['AIO.INBOX'], vault_relationship: NO_VAULT, inbox_relationship: 'Contract method for NOTES_FOR_AIO is MESSAGE (quarter thread).', activity_relationship: NO_INBOX,
    success_condition: 'Founder decides whether NOTES is a tab (D-NOTES-TAB).', blocked_condition: 'Pending founder decision; no client note model exists.',
    experience_refs: ['optional_inputs.NOTES_FOR_AIO'],
    notes: ['Not a primary tab: no contractual reason to add a seventh primary tab; NOTES_FOR_AIO maps to MESSAGE AIO.'],
  },
  { node_id: `${ROOM}.MESSAGES`, node_type: 'DRAWER', actor: 'CLIENT', page_family: CF, tab_id: null, parent_node: ROOM, title: 'MESSAGE YOUR AIO TEAM', purpose: 'Quarter request thread from the help rail (NOTES_FOR_AIO travels here).', primary_object: 'THE QUARTER THREAD', primary_task: 'Talk to AIO about this quarter.', read_contracts: ['MSG.read.thread'], components: ['DETAIL_DRAWER', 'MESSAGE_THREAD'], interactions: ['I.MESSAGE_AIO'], states: ['UI.DEFAULT', 'UI.LOADING', 'UI.EMPTY', 'UI.SUCCESS', 'UI.ERROR'], bindings: clientChild('Contract sheet #08 message team; help rail in the parent / territory board.'), permissions: C_PERM(['VIEW', 'MESSAGE']), inbox_relationship: THREAD, activity_relationship: NO_INBOX, vault_relationship: NO_VAULT, success_condition: 'Message posted to the thread.', blocked_condition: 'Send failure keeps the draft.', experience_refs: ['optional_inputs.NOTES_FOR_AIO', 'perspectives.client.project_room'], cross_feature_dependencies: ['AIO.INBOX'] },

  { node_id: `${ROOM}.FILED`, node_type: 'STATE_VIEW', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: ROOM, title: 'FILED — CONFIRMATION IN YOUR VAULT', purpose: 'Filed state: sealed quarter with confirmation, artifacts prominent, motion to the Vault; payment pending when tax is due.', primary_object: 'THE SEALED QUARTER', primary_task: 'See the filing confirmation and where the packet lives.', read_contracts: ['FILING.read.record', 'PAYMENT.read.record', 'DOCS.read.packet', 'RETURN.read.summary'], components: ['QUARTER_HERO', 'METRICS_RAIL', 'FILING_WORKFLOW', 'FILE_ROW', 'STATUS_CHIP', 'NEXT_ACTION_RAIL'], interactions: ['I.OPEN_VAULT_RECORD', 'I.DOWNLOAD_FILE'], states: ['FILED', 'PAYMENT_PENDING', 'COMPLETE', 'DOC.FINAL', 'DOC.SEALED'], bindings: clientChild('State chip FILED + workflow all complete + documents prominent — the parent composition in its success state (no dedicated seal asset).'), resp: ['hero chip FILED → confirmation # → file rows → VIEW IN VAULT rail', 'confirmation | packet files', 'confirmation | packet files | payment status'], permissions: C_PERM(['VIEW', 'DOWNLOAD']), inbox_relationship: 'IFTA_FILED resolves the quarter thread.', activity_relationship: 'ACT_FILED.', vault_relationship: VAULT_PACKET, success_condition: 'Confirmation # shown; nothing in NEEDS YOU; packet in the Vault.', blocked_condition: 'Payment pending (tax due) → PAYMENT PENDING line.', experience_refs: ['visual_relationships.FILED', 'section_overrides.CLIENT', 'cross_feature_relationships.IFTA_FILED_TO_VAULT'], cross_feature_dependencies: ['AIO.VAULT', 'AIO.ROAD_READY (IFTA item current)', 'AIO.FINANCES (service fee — separate ledger)'] },
  { node_id: `${ROOM}.ARCHIVED`, node_type: 'STATE_VIEW', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: ROOM, title: 'Q{n} {YYYY} FILED AND ARCHIVED', purpose: 'Archived quarter: read-only history in the filing room (quarter selector).', primary_object: 'A PAST QUARTER', primary_task: 'Look back at a filed quarter.', read_contracts: ['QUARTER.read.history', 'DOCS.read.packet', 'FILING.read.record'], components: ['QUARTER_HERO', 'METRICS_RAIL', 'TAB_BAR', 'FILE_ROW', 'STATUS_CHIP', 'NEXT_ACTION_RAIL'], interactions: ['I.SWITCH_QUARTER', 'I.OPEN_VAULT_RECORD', 'I.START_NEXT_QUARTER'], states: ['ARCHIVED', 'UI.READ_ONLY'], bindings: clientChild('Parent composition read-only; chip ARCHIVED (stone).'), permissions: C_PERM(['VIEW', 'DOWNLOAD']), inbox_relationship: NO_INBOX, activity_relationship: 'ACT_ARCHIVED.', vault_relationship: VAULT_PACKET, success_condition: 'History readable; next quarter one tap away.', blocked_condition: '—', experience_refs: ['visual_relationships.ARCHIVED', 'activity_events.ACT_ARCHIVED'], cross_feature_dependencies: [] },
  { node_id: `${ROOM}.NEXT_QUARTER_OPEN`, node_type: 'STATE_VIEW', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: ROOM, title: 'Q{n+1} {YYYY} IS OPEN', purpose: 'Next-quarter state: empty packet, capture methods, fleet pre-filled, due date.', primary_object: 'THE NEW QUARTER', primary_task: 'Start sending fuel and miles for the new quarter.', read_contracts: ['QUARTER.read.case', 'QUARTER.read.derived', 'VEHICLES.read.quarter'], components: ['QUARTER_HERO', 'METRICS_RAIL', 'TASK_LIST', 'UPLOAD_ZONE', 'EMPTY_STATE', 'NEXT_ACTION_RAIL'], interactions: ['I.UPLOAD_RECEIPT', 'I.TAKE_PHOTO', 'I.CHOOSE_MILEAGE_SOURCE', 'I.CONTINUE_NEXT_ACTION'], states: ['NEXT_QUARTER_OPEN', 'COLLECTING', 'UI.EMPTY'], bindings: clientChild('Parent composition in its empty state (checklist pending, metrics zero) + upload zone from the child proof.'), permissions: C_PERM(['VIEW', 'CREATE']), inbox_relationship: 'IFTA_QUARTER_OPEN.', activity_relationship: 'ACT_ARCHIVED (previous) → new quarter.', vault_relationship: NO_VAULT, success_condition: 'First record moves the quarter to COLLECTING.', blocked_condition: '—', experience_refs: ['cross_feature_relationships.IFTA_ARCHIVED_OPENS_NEXT', 'visual_relationships.QUARTER_OPEN', 'inbox_events.IFTA_QUARTER_OPEN'], cross_feature_dependencies: ['Fleet profile (pre-fill — today copied from the previous quarter)'] },
  { node_id: `${ROOM}.RETURNED`, node_type: 'STATE_VIEW', actor: 'CLIENT', page_family: CF, tab_id: 'PROGRESS', parent_node: ROOM, title: 'RETURNED BY JURISDICTION — AIO IS CORRECTING', purpose: 'Failure state: what the jurisdiction returned and what AIO is doing (no client action unless asked).', primary_object: 'THE RETURNED FILING', primary_task: 'Understand the correction and wait / answer AIO.', read_contracts: ['FILING.read.record', 'MSG.read.thread'], components: ['QUARTER_HERO', 'INSIGHTS_PANEL', 'RISK_FLAG_PANEL', 'HELP_RAIL'], interactions: ['I.MESSAGE_AIO'], states: ['FILING_REJECTED', 'UI.WARNING'], bindings: clientChild('Parent composition with the attention chip + insights line.'), permissions: C_PERM(['VIEW', 'MESSAGE']), inbox_relationship: 'Thread notice (IFTA_FILING_REJECTED type missing in AIO).', activity_relationship: 'Audited.', vault_relationship: 'Amended return supersedes; original kept.', success_condition: 'Client understands AIO is correcting.', blocked_condition: 'No rejection writer exists in AIO (scan).', experience_refs: ['visual_relationships.FILING_REJECTED', 'error_states'], cross_feature_dependencies: [] },
  { node_id: 'AIO.IFTA.CLIENT.NOT_ENROLLED', node_type: 'STATE_VIEW', actor: 'CLIENT', page_family: CF, tab_id: null, parent_node: CF, title: 'SET UP IFTA FILING', purpose: 'Threshold for a client without the service: what IFTA filing with AIO is + set up.', primary_object: 'THE IFTA FILING SERVICE', primary_task: 'Request IFTA filing.', read_contracts: ['PUBLIC.read.contract_copy', 'PUBLIC.read.availability'], components: ['QUARTER_HERO', 'EXPLAINER_BAND', 'REQUEST_FORM', 'NEXT_ACTION_RAIL'], interactions: ['I.SET_UP_FILING', 'I.START_IFTA_REGISTRATION'], states: ['NOT_ENROLLED', 'UI.DEFAULT', 'UI.SUCCESS'], bindings: clientChild('Parent hero with the explainer pattern from the public family (light).'), permissions: C_PERM(['VIEW', 'CREATE']), inbox_relationship: NO_INBOX, activity_relationship: 'Service request activity.', vault_relationship: NO_VAULT, success_condition: 'Request submitted.', blocked_condition: 'Availability truth unresolved (D-IFTA-AVAILABILITY); no IFTA account → IFTA registration.', experience_refs: ['visual_relationships.NOT_ENROLLED', 'empty_state'], cross_feature_dependencies: ['AIO.IFTA_REGISTRATION', 'service request engine'] },

  /* ═════════════════════════════ FOUNDER / STAFF ═════════════════════════════ */
  { node_id: 'AIO.IFTA.STAFF.QUEUE', node_type: 'PAGE', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: null, parent_node: SF, title: 'FUEL TAX QUEUE', purpose: 'Every client-quarter by due date × readiness, bucketed (AWAITING CLIENT · BLOCKED · NEEDS REVIEW · READY TO FILE · COMPLETE).', primary_object: 'CLIENT-QUARTERS', primary_task: 'Pick the case that needs staff now.', read_contracts: ['STAFF.read.queue', 'QUARTER.read.derived'], components: ['TOP_NAV', 'QUEUE_TABLE', 'STATUS_CHIP', 'BRAND_EXIT_BAND'], interactions: ['I.OPEN_CASE', 'I.FILTER_QUEUE'], states: ['AIO_REVIEWING', 'NEEDS_YOU', 'OVERDUE_RISK', 'APPROVED_FOR_FILING', 'COMPLETE', 'UI.DEFAULT', 'UI.LOADING', 'UI.EMPTY'], bindings: [missing('No queue reference in the package (G-STAFF-QUEUE).'), missing('No queue reference in the package.'), missing('No queue reference in the package.')], permissions: S_PERM(['VIEW']), cross_feature_dependencies: ['Office (permitting division)', 'OfficeWorkItem (none per quarter today)'], vault_relationship: NO_VAULT, inbox_relationship: 'Staff notices link here.', activity_relationship: NO_INBOX, success_condition: 'Staff open the most urgent case.', blocked_condition: 'Authority missing; no queue route.', experience_refs: ['perspectives.founder_staff.work_queue', 'perspectives.founder_staff.status_model', 'founder_staff_entry'], notes: ['Reference package gap — do not invent the queue composition.'] },
  {
    node_id: CASE, node_type: 'PAGE', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: null, parent_node: SF,
    title: 'CLIENT-QUARTER CASE FILE (root)', purpose: 'The same quarter as a case file: client identity + CLIENT HEALTH, metrics vs prior quarter, the tab family, one staff next action, the lower brand band.',
    primary_object: 'THE CLIENT-QUARTER CASE', primary_task: 'Review, reconcile, send for approval, file.',
    read_contracts: ['QUARTER.read.case', 'QUARTER.read.derived', 'STAFF.read.health', 'STAFF.read.prior_quarter', 'RETURN.read.summary'],
    components: ['TOP_NAV', 'QUARTER_HERO', 'CLIENT_HEALTH_PANEL', 'METRICS_RAIL', 'TAB_BAR', 'NEXT_ACTION_RAIL', 'BRAND_EXIT_BAND', 'STATUS_CHIP'],
    interactions: ['I.SWITCH_TAB', 'I.CONTINUE_NEXT_ACTION', 'I.EXPORT_REPORT', 'I.SEARCH', 'I.OPEN_NOTIFICATIONS'],
    states: ['COLLECTING', 'NEEDS_YOU', 'AIO_REVIEWING', 'CORRECTION_REQUIRED', 'READY_FOR_CLIENT_REVIEW', 'CLIENT_APPROVAL_PENDING', 'APPROVED_FOR_FILING', 'FILING', 'FILED', 'PAYMENT_PENDING', 'COMPLETE', 'ARCHIVED', 'OVERDUE_RISK', 'FILING_REJECTED', 'UI.LOADING', 'UI.ERROR'],
    bindings: [direct(AM), direct(STD), direct(STD)],
    resp: ['hero with dark health panel → metrics + risk chip → scrollable tabs → body → dark rail', 'hero (health panel right) → metrics → tabs → two-column body', 'wide hero (health panel top-right) → metrics with deltas → tabs + export → three-column body'],
    permissions: S_PERM(['VIEW', 'EDIT', 'VERIFY', 'OVERRIDE', 'FILE', 'MESSAGE', 'DOWNLOAD']),
    cross_feature_dependencies: ['Office (permitting)', 'AIO.INBOX (office thread)'],
    vault_relationship: VAULT_PACKET, inbox_relationship: THREAD, activity_relationship: 'Reads the quarter audit (client + team activity).',
    success_condition: 'Staff see what blocks the filing and the one next action.', blocked_condition: 'Case not found; no route registered today.',
    experience_refs: ['perspectives.founder_staff.mirror_not_copy', 'information_hierarchy.FOUNDER_STAFF', 'staff_cta', 'founder_staff_entry'],
    notes: ['Export report has no data writer (STAFF.write.exportReport MISSING).'],
  },
  {
    node_id: `${CASE}.OVERVIEW`, node_type: 'TAB', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'OVERVIEW', parent_node: CASE, tab_class: 'PRIMARY',
    title: 'OVERVIEW', purpose: 'Staff mirror of PROGRESS: filing workflow with dates, quarter tasks, important dates, mileage + fuel, vehicles, client activity, team activity, risks / flags.',
    primary_object: 'THE CASE’S STATUS', primary_task: 'See what is blocking this filing and who has to act.',
    read_contracts: ['QUARTER.read.derived', 'STAFF.read.tasks', 'STAFF.read.dates', 'STAFF.read.audit', 'STAFF.read.discrepancies', 'MILEAGE.read.records', 'FUEL.read.receipts', 'VEHICLES.read.quarter'],
    components: ['FILING_WORKFLOW', 'TASK_LIST', 'IMPORTANT_DATES', 'MILEAGE_BARS', 'FUEL_DONUT', 'VEHICLE_ROW', 'ACTIVITY_TIMELINE', 'RISK_FLAG_PANEL'],
    interactions: ['I.START_RECONCILIATION', 'I.NUDGE_CLIENT', 'I.ESCALATE', 'I.RESOLVE_DISCREPANCY', 'I.OPEN_AUDIT_TRAIL', 'I.CONTINUE_NEXT_ACTION'],
    states: ['COLLECTING', 'NEEDS_YOU', 'AIO_REVIEWING', 'CORRECTION_REQUIRED', 'READY_FOR_CLIENT_REVIEW', 'CLIENT_APPROVAL_PENDING', 'APPROVED_FOR_FILING', 'OVERDUE_RISK', 'UI.DEFAULT', 'UI.LOADING', 'UI.WARNING'],
    bindings: [direct(AM), direct(STD), direct(STD)],
    resp: ['workflow → tasks → bars + donut → activity → flags (stacked)', '(workflow | tasks) · (bars | donut) · (client activity | team activity | flags)', '(workflow | tasks | dates) · (bars | donut | vehicles) · (client activity | team activity | flags)'],
    permissions: S_PERM(['VIEW', 'EDIT', 'OVERRIDE', 'MESSAGE']),
    cross_feature_dependencies: ['Office work queue'], vault_relationship: NO_VAULT, inbox_relationship: 'Nudge / escalate notify the client.', activity_relationship: 'Reads the quarter audit split into client and team activity.',
    success_condition: 'Blockers and owners visible; the staff next action is one tap.', blocked_condition: 'Waiting on client / discrepancy / rejection.',
    experience_refs: ['perspectives.founder_staff.blockers', 'perspectives.founder_staff.operational_actions', 'section_overrides.FOUNDER_STAFF', 'perspectives.founder_staff.hub_buckets'],
    overrides: ['PRIMARY_TASK: unblock the filing', 'CONTENT_MODULES: tasks with assignees · important dates · team activity · risks', 'ACTIONS: operational', 'STATES: staff mirror'],
  },
  {
    node_id: `${CASE}.FUEL_PURCHASES`, node_type: 'TAB', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'FUEL_PURCHASES', parent_node: CASE, tab_class: 'PRIMARY',
    title: 'FUEL PURCHASES', purpose: 'Receipt classification review: verify, reclassify, request correction; heat strip of receipts per truck per month.',
    primary_object: 'THE CASE’S RECEIPTS', primary_task: 'Classify and verify every receipt.',
    read_contracts: ['FUEL.read.receipts', 'QUARTER.read.derived', 'STAFF.read.discrepancies'],
    components: ['METRICS_RAIL', 'RECEIPT_ROW', 'RECEIPT_STATUS_SUMMARY', 'FUEL_DONUT', 'RISK_FLAG_PANEL', 'EMPTY_STATE', 'NEXT_ACTION_RAIL'],
    interactions: ['I.OPEN_RECEIPT', 'I.STAFF_VERIFY_RECEIPT', 'I.REQUEST_CORRECTION', 'I.FILTER_SORT'],
    states: ['AIO_REVIEWING', 'NEEDS_YOU', 'RECEIPT.PROCESSED', 'RECEIPT.NEEDS_REVIEW', 'RECEIPT.MISSING_DETAILS', 'RECEIPT.DUPLICATE', 'RECEIPT.UNREADABLE', 'RECEIPT.POSSIBLE_MISSING', 'UI.DEFAULT', 'UI.LOADING', 'UI.EMPTY', 'UI.SUCCESS'],
    bindings: staffTabDerived('Client FUEL PURCHASES derivation rule applied to the staff case (denser table + verify actions).'),
    resp: ['status counts → receipt rows with verify action', 'counts | donut; table', 'counts | donut | heat strip; table with verify column'],
    permissions: S_PERM(['VIEW', 'VERIFY', 'EDIT', 'MESSAGE']),
    cross_feature_dependencies: [], vault_relationship: 'Receipt Vault links.', inbox_relationship: 'Correction request notifies the client.', activity_relationship: 'Verifications audited.',
    success_condition: 'No receipt left under review; flags answered or requested.', blocked_condition: 'Receipts awaiting the client.',
    experience_refs: ['perspectives.founder_staff.system_flags', 'perspectives.founder_staff.human_review', 'perspectives.founder_staff.missing_inputs'],
    overrides: ['PRIMARY_TASK: classification review', 'ACTIONS: verify · reclassify · request correction'],
  },
  { node_id: `${CASE}.FUEL_PURCHASES.RECEIPT_REVIEW`, node_type: 'DRAWER', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'FUEL_PURCHASES', parent_node: `${CASE}.FUEL_PURCHASES`, title: 'RECEIPT REVIEW', purpose: 'Verify / reclassify / edit parsed fields with an audit note.', primary_object: 'ONE RECEIPT', primary_task: 'Decide the receipt’s class.', read_contracts: ['FUEL.read.receipts', 'STAFF.read.audit'], components: ['DETAIL_DRAWER', 'STATUS_CHIP'], interactions: ['I.STAFF_VERIFY_RECEIPT', 'I.RECLASSIFY_RECEIPT'], states: ['RECEIPT.NEEDS_REVIEW', 'RECEIPT.PROCESSED', 'UI.SUCCESS'], bindings: staffChild('Contract sheet #03 / #05 drawer.'), permissions: S_PERM(['VIEW', 'VERIFY', 'EDIT']), inbox_relationship: NO_INBOX, activity_relationship: 'Audited.', vault_relationship: NO_VAULT, success_condition: 'Receipt verified or reclassified with note.', blocked_condition: 'Reclassify has no writer (STAFF.write.reclassifyReceipt MISSING).', experience_refs: ['perspectives.founder_staff.corrections'], cross_feature_dependencies: [] },
  {
    node_id: `${CASE}.MILEAGE`, node_type: 'TAB', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'MILEAGE', parent_node: CASE, tab_class: 'PRIMARY',
    title: 'MILEAGE', purpose: 'Mileage source verification; MPG outliers; estimated-only trucks.', primary_object: 'THE CASE’S MILEAGE', primary_task: 'Verify every mileage source.',
    read_contracts: ['MILEAGE.read.records', 'JURIS.read.breakdown', 'STAFF.read.discrepancies'],
    components: ['METRICS_RAIL', 'MILEAGE_ROW', 'MILEAGE_BARS', 'RISK_FLAG_PANEL', 'EMPTY_STATE', 'NEXT_ACTION_RAIL'],
    interactions: ['I.OPEN_MILEAGE_RECORD', 'I.VERIFY_MILEAGE_SOURCE', 'I.REQUEST_CORRECTION', 'I.FILTER_SORT'],
    states: ['AIO_REVIEWING', 'MILEAGE.VERIFIED', 'MILEAGE.UNVERIFIED', 'MILEAGE.ESTIMATED', 'MILEAGE.EXCEPTION', 'UI.DEFAULT', 'UI.LOADING', 'UI.WARNING'],
    bindings: staffTabDerived('Derived from the staff MILEAGE BY JURISDICTION bars + client mileage tab logic.'),
    resp: ['truck rows with VERIFY action → bars', 'rows | bars', 'truck × state table | bars | flags'],
    permissions: S_PERM(['VIEW', 'VERIFY', 'MESSAGE']), cross_feature_dependencies: [], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: 'Verifications audited.',
    success_condition: 'All sources verified; outliers resolved.', blocked_condition: 'Estimate-only truck.',
    experience_refs: ['perspectives.founder_staff.human_review', 'system_derivations.MILEAGE_QUALITY'],
  },
  { node_id: `${CASE}.MILEAGE.SOURCE_VERIFY`, node_type: 'DRAWER', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'MILEAGE', parent_node: `${CASE}.MILEAGE`, title: 'VERIFY MILEAGE SOURCE', purpose: 'Verify a manual / spreadsheet / assisted record → manual_verified.', primary_object: 'ONE MILEAGE RECORD', primary_task: 'Verify the source.', read_contracts: ['MILEAGE.read.records'], components: ['DETAIL_DRAWER', 'MILEAGE_ROW'], interactions: ['I.VERIFY_MILEAGE_SOURCE'], states: ['MILEAGE.UNVERIFIED', 'MILEAGE.VERIFIED', 'UI.SUCCESS'], bindings: staffChild('Contract sheet #05 verify record drawer.'), permissions: S_PERM(['VERIFY']), inbox_relationship: NO_INBOX, activity_relationship: 'Audited.', vault_relationship: NO_VAULT, success_condition: 'staffVerifiedAt set.', blocked_condition: 'Estimates cannot be verified.', experience_refs: ['perspectives.founder_staff.human_review'], cross_feature_dependencies: [] },
  {
    node_id: `${CASE}.VEHICLES`, node_type: 'TAB', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'VEHICLES', parent_node: CASE, tab_class: 'PRIMARY',
    title: 'VEHICLES', purpose: 'Vehicle readiness per truck; exclude a truck that did not operate (override with note).', primary_object: 'THE CASE’S VEHICLES', primary_task: 'Confirm every truck is ready or excluded.',
    read_contracts: ['VEHICLES.read.quarter', 'VEHICLES.read.fleet', 'MILEAGE.read.records'],
    components: ['VEHICLE_ROW', 'STATUS_CHIP', 'RISK_FLAG_PANEL', 'EMPTY_STATE', 'NEXT_ACTION_RAIL'],
    interactions: ['I.OPEN_VEHICLE', 'I.STAFF_MARK_NOT_OPERATED', 'I.FILTER_SORT'],
    states: ['VEHICLE.ACTIVE', 'VEHICLE.NOT_OPERATED', 'VEHICLE.MISSING_DATA', 'UI.DEFAULT', 'UI.LOADING', 'UI.WARNING'],
    bindings: staffTabDerived('Derived from the staff VEHICLES panel (Unit 101–105, view all 12).'),
    resp: ['vehicle rows', 'vehicle rows | flags', 'vehicle table with readiness + override'],
    permissions: S_PERM(['VIEW', 'OVERRIDE']), cross_feature_dependencies: ['Fleet profile'], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: 'Overrides audited.',
    success_condition: 'Every truck ready or excluded with a note.', blocked_condition: 'Truck missing data.',
    experience_refs: ['founder_override_points.ACCEPT_ESTIMATE_GAP', 'perspectives.founder_staff.overrides'],
  },
  { node_id: `${CASE}.VEHICLES.MARK_NOT_OPERATED`, node_type: 'MODAL', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'VEHICLES', parent_node: `${CASE}.VEHICLES`, title: 'MARK NOT OPERATED', purpose: 'Override: exclude a truck with a mandatory note.', primary_object: 'ONE VEHICLE', primary_task: 'Exclude a truck with a reason.', read_contracts: ['VEHICLES.read.quarter'], components: ['CONFIRM_MODAL'], interactions: ['I.STAFF_MARK_NOT_OPERATED'], states: ['VEHICLE.NOT_OPERATED', 'UI.ERROR', 'UI.SUCCESS'], bindings: staffChild('Family confirm modal with note field.'), permissions: S_PERM(['OVERRIDE']), inbox_relationship: NO_INBOX, activity_relationship: 'Audited override.', vault_relationship: NO_VAULT, success_condition: 'Excluded with note.', blocked_condition: 'No writer exists (STAFF.write.markNotOperated MISSING).', experience_refs: ['perspectives.founder_staff.overrides'], cross_feature_dependencies: [] },
  {
    node_id: `${CASE}.JURISDICTIONS`, node_type: 'TAB', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'JURISDICTIONS', parent_node: CASE, tab_class: 'PRIMARY',
    title: 'JURISDICTIONS', purpose: 'Reconciliation: jurisdiction × truck table, discrepancies (miles without fuel, MPG outliers, unverified mileage), overrides with note.', primary_object: 'THE RECONCILIATION TABLE', primary_task: 'Reconcile fuel to miles per jurisdiction.',
    read_contracts: ['JURIS.read.breakdown', 'JURIS.read.tax', 'STAFF.read.discrepancies', 'MILEAGE.read.records', 'FUEL.read.receipts'],
    components: ['MAP_PANEL', 'JURISDICTION_TABLE', 'MILEAGE_BARS', 'RISK_FLAG_PANEL', 'EMPTY_STATE', 'NEXT_ACTION_RAIL'],
    interactions: ['I.OPEN_JURISDICTION', 'I.START_RECONCILIATION', 'I.RESOLVE_DISCREPANCY', 'I.FILTER_SORT'],
    states: ['AIO_REVIEWING', 'JURISDICTION.OK', 'JURISDICTION.EXCEPTION', 'UI.DEFAULT', 'UI.LOADING', 'UI.WARNING'],
    bindings: staffTabDerived('Derived from staff RISKS / FLAGS (jurisdiction changes, review recommended) + mileage bars + client jurisdiction logic.'),
    resp: ['discrepancy rows → map', 'table | flags', 'jurisdiction × truck table | flags | map'],
    permissions: S_PERM(['VIEW', 'OVERRIDE', 'CONFIGURE']), cross_feature_dependencies: [], vault_relationship: 'Reconciliation notes are internal (DISCREPANCY_LOG).', inbox_relationship: NO_INBOX, activity_relationship: 'Overrides audited.',
    success_condition: 'No open discrepancy.', blocked_condition: 'Discrepancy only the client can answer → REQUEST CORRECTION.',
    experience_refs: ['human_review_points.STAFF_RECONCILIATION', 'output_artifacts.DISCREPANCY_LOG', 'section_overrides.FOUNDER_STAFF'],
  },
  { node_id: `${CASE}.JURISDICTIONS.DISCREPANCY`, node_type: 'DRAWER', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'JURISDICTIONS', parent_node: `${CASE}.JURISDICTIONS`, title: 'DISCREPANCY', purpose: 'Resolve a discrepancy; an override requires a note and is audited.', primary_object: 'ONE DISCREPANCY', primary_task: 'Resolve or override with note.', read_contracts: ['STAFF.read.discrepancies'], components: ['DETAIL_DRAWER', 'RISK_FLAG_PANEL'], interactions: ['I.RESOLVE_DISCREPANCY', 'I.REQUEST_CORRECTION'], states: ['JURISDICTION.EXCEPTION', 'JURISDICTION.OK', 'UI.SUCCESS', 'UI.ERROR'], bindings: staffChild('Family drawer.'), permissions: S_PERM(['OVERRIDE']), inbox_relationship: NO_INBOX, activity_relationship: 'Audited.', vault_relationship: NO_VAULT, success_condition: 'Discrepancy resolved.', blocked_condition: 'Override without note.', experience_refs: ['founder_override_points.ACCEPT_ESTIMATE_GAP'], cross_feature_dependencies: [] },
  {
    node_id: `${CASE}.DOCUMENTS`, node_type: 'TAB', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'DOCUMENTS', parent_node: CASE, tab_class: 'PRIMARY',
    title: 'DOCUMENTS', purpose: 'Packet contents, return draft, approved summary, filed return, confirmation, payment record; seal status.', primary_object: 'THE CASE RECORDS', primary_task: 'Check the packet is complete.',
    read_contracts: ['DOCS.read.packet', 'DOCS.read.vault', 'RETURN.read.summary', 'FILING.read.record', 'PAYMENT.read.record'],
    components: ['FILE_ROW', 'RECENT_UPLOADS', 'STATUS_CHIP', 'EMPTY_STATE'],
    interactions: ['I.OPEN_FILE', 'I.DOWNLOAD_FILE', 'I.OPEN_VAULT_RECORD', 'I.FILTER_SORT'],
    states: ['FILED', 'COMPLETE', 'DOC.DRAFT', 'DOC.REVIEW_COPY', 'DOC.APPROVED', 'DOC.FINAL', 'DOC.SEALED', 'DOC.SUPERSEDED', 'UI.DEFAULT', 'UI.EMPTY'],
    bindings: staffTabDerived('Derived from the client DOCUMENTS logic + staff recent client activity file rows.'),
    resp: ['file rows grouped', 'file rows | packet status', 'file table | packet status | seal'],
    permissions: S_PERM(['VIEW', 'DOWNLOAD']), cross_feature_dependencies: ['AIO.VAULT'], vault_relationship: VAULT_PACKET, inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX,
    success_condition: 'Packet sealed with every artifact.', blocked_condition: 'Artifacts not stored as documents (metadata only).',
    experience_refs: ['output_artifacts.QUARTER_PACKET', 'perspectives.founder_staff.artifact_generation'],
  },
  { node_id: `${CASE}.DOCUMENTS.FILE_PREVIEW`, node_type: 'DRAWER', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'DOCUMENTS', parent_node: `${CASE}.DOCUMENTS`, title: 'FILE PREVIEW', purpose: 'Preview / download a case record with version history.', primary_object: 'ONE DOCUMENT', primary_task: 'Check a record.', read_contracts: ['DOCS.read.vault', 'DOCS.read.download'], components: ['DETAIL_DRAWER', 'FILE_ROW'], interactions: ['I.OPEN_FILE', 'I.DOWNLOAD_FILE'], states: ['DOC.FINAL', 'DOC.SUPERSEDED', 'UI.ERROR'], bindings: staffChild('Contract sheet #03 drawer.'), permissions: S_PERM(['VIEW', 'DOWNLOAD']), inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, vault_relationship: 'Reads Vault documents.', success_condition: 'Shown.', blocked_condition: 'Unavailable.', experience_refs: ['output_artifacts.FILED_RETURN'], cross_feature_dependencies: [] },
  {
    node_id: `${CASE}.NOTES`, node_type: 'TAB', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'NOTES', parent_node: CASE, tab_class: 'SECONDARY_CANDIDATE',
    title: 'NOTES (candidate)', purpose: 'Internal notes + reconciliation notes on the case (staff-only).', primary_object: 'CASE NOTES', primary_task: 'Keep internal context on the case.',
    read_contracts: ['NOTES.read', 'STAFF.read.audit'], components: ['TAB_BAR', 'ACTIVITY_TIMELINE', 'EMPTY_STATE'], interactions: ['I.SAVE_NOTE'], states: ['UI.DEFAULT', 'UI.EMPTY'],
    bindings: [derived('Tab label only (no NOTES content composition).', AM, A), derived('Tab label only.', STD, A), derived('Tab label only.', STD, A)],
    permissions: S_PERM(['VIEW', 'EDIT']), cross_feature_dependencies: [], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: 'Internal only — must never reach client activity.',
    success_condition: 'Founder decides (D-NOTES-TAB).', blocked_condition: 'No IFTA-linked note model.', experience_refs: ['output_artifacts.DISCREPANCY_LOG'],
  },
  { node_id: `${CASE}.RETURN_DRAFT`, node_type: 'CHILD_PAGE', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'OVERVIEW', parent_node: CASE, title: 'RETURN DRAFT', purpose: 'OPEN RETURN DRAFT: enter the filing worksheet (net tax per jurisdiction), prepare the summary from verified records, send for approval.', primary_object: 'THE RETURN SUMMARY DRAFT', primary_task: 'Prepare and send the return summary.', read_contracts: ['RETURN.read.summary', 'JURIS.read.breakdown', 'QUARTER.read.derived'], components: ['QUARTER_HERO', 'METRICS_RAIL', 'RETURN_SUMMARY_SHEET', 'JURISDICTION_TABLE', 'RISK_FLAG_PANEL', 'NEXT_ACTION_RAIL'], interactions: ['I.ENTER_WORKSHEET', 'I.PREPARE_RETURN_SUMMARY', 'I.SEND_FOR_APPROVAL'], states: ['AIO_REVIEWING', 'READY_FOR_CLIENT_REVIEW', 'DOC.DRAFT', 'UI.BLOCKED', 'UI.SUCCESS', 'UI.ERROR'], bindings: staffChild('Opened from the dark OPEN RETURN DRAFT rail; derived from metrics + jurisdiction table + rail.'), resp: ['metrics → worksheet rows → SEND FOR APPROVAL rail', 'metrics → worksheet table → rail', 'metrics → worksheet table | blockers → rail'], permissions: S_PERM(['EDIT', 'VERIFY']), inbox_relationship: 'Send for approval → IFTA_APPROVAL_REQUEST.', activity_relationship: 'Audited.', vault_relationship: 'Approved summary joins the packet.', success_condition: 'Summary sent for approval.', blocked_condition: 'Open discrepancies · receipts under review · readiness below READY_FOR_REPORTING · worksheet missing (no writer today).', experience_refs: ['system_derivations.RETURN_SUMMARY', 'perspectives.founder_staff.operational_actions', 'visual_relationships.RECONCILING'], cross_feature_dependencies: [] },
  { node_id: `${CASE}.RETURN_DRAFT.SEND_CONFIRM`, node_type: 'MODAL', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: 'OVERVIEW', parent_node: `${CASE}.RETURN_DRAFT`, title: 'SEND FOR APPROVAL', purpose: 'Confirm issuing the return summary to the client.', primary_object: 'THE RETURN SUMMARY', primary_task: 'Issue the summary.', read_contracts: ['RETURN.read.summary'], components: ['CONFIRM_MODAL'], interactions: ['I.SEND_FOR_APPROVAL'], states: ['READY_FOR_CLIENT_REVIEW', 'UI.SUCCESS'], bindings: staffChild('Contract sheet #10 on the family modal.'), permissions: S_PERM(['EDIT']), inbox_relationship: 'IFTA_APPROVAL_REQUEST + notification.', activity_relationship: 'Audited.', vault_relationship: NO_VAULT, success_condition: 'AWAITING CLIENT APPROVAL.', blocked_condition: 'No draft.', experience_refs: ['interaction_grammar.SEND FOR APPROVAL'], cross_feature_dependencies: ['AIO.INBOX'] },
  { node_id: `${CASE}.REQUEST_CORRECTION`, node_type: 'MODAL', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: null, parent_node: CASE, title: 'REQUEST CORRECTION', purpose: 'Pick receipts / vehicles and send a templated correction request.', primary_object: 'ITEMS TO CORRECT', primary_task: 'Send items back to the client.', read_contracts: ['FUEL.read.receipts', 'VEHICLES.read.quarter'], components: ['CONFIRM_MODAL', 'RECEIPT_ROW'], interactions: ['I.REQUEST_CORRECTION'], states: ['CORRECTION_REQUIRED', 'UI.ERROR', 'UI.SUCCESS'], bindings: staffChild('Contract sheet #06 on the family modal.'), permissions: S_PERM(['EDIT', 'MESSAGE']), inbox_relationship: 'Client notice + thread message.', activity_relationship: 'Audited.', vault_relationship: NO_VAULT, success_condition: 'Client notified; state AWAITING CLIENT — CORRECTION REQUESTED.', blocked_condition: 'Nothing selected.', experience_refs: ['interaction_grammar.REQUEST CORRECTION', 'human_review_points.STAFF_QUARTER_REVIEW'], cross_feature_dependencies: ['AIO.INBOX'] },
  { node_id: `${CASE}.RECORD_FILING`, node_type: 'MODAL', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: null, parent_node: CASE, title: 'FILE & CONFIRM', purpose: 'Record the filing confirmation (staff file with the base jurisdiction outside AIO).', primary_object: 'THE FILING', primary_task: 'Record the confirmation number.', read_contracts: ['RETURN.read.summary', 'FILING.read.record'], components: ['CONFIRM_MODAL'], interactions: ['I.RECORD_FILING'], states: ['APPROVED_FOR_FILING', 'FILING', 'FILED', 'UI.ERROR', 'UI.SUCCESS'], bindings: staffChild('Contract sheet #11 on the family modal.'), permissions: S_PERM(['FILE']), inbox_relationship: 'IFTA_FILED resolves the thread.', activity_relationship: 'ACT_FILED.', vault_relationship: VAULT_PACKET, success_condition: 'FILED; packet sealed.', blocked_condition: 'Not approved; no confirmation number.', experience_refs: ['human_review_points.STAFF_FILE', 'interaction_grammar.FILE', 'automations.AUTO_SEAL_PACKET'], cross_feature_dependencies: ['AIO.VAULT', 'AIO.INBOX', 'AIO.ROAD_READY'] },
  { node_id: `${CASE}.RECORD_PAYMENT`, node_type: 'MODAL', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: null, parent_node: CASE, title: 'RECORD PAYMENT STATUS', purpose: 'Record the carrier’s tax payment status (PAYMENT PENDING · PAID · CREDIT CARRIED · NO TAX DUE).', primary_object: 'THE TAX PAYMENT', primary_task: 'Record payment status.', read_contracts: ['PAYMENT.read.record', 'RETURN.read.summary'], components: ['CONFIRM_MODAL'], interactions: ['I.RECORD_PAYMENT'], states: ['FILED', 'PAYMENT_PENDING', 'COMPLETE', 'ARCHIVED', 'UI.SUCCESS'], bindings: staffChild('Family confirm modal.'), permissions: S_PERM(['EDIT']), inbox_relationship: NO_INBOX, activity_relationship: 'ACT_ARCHIVED on completion.', vault_relationship: 'Completes the packet.', success_condition: 'COMPLETE → ARCHIVED → next quarter opens.', blocked_condition: 'Not FILED.', experience_refs: ['perspectives.founder_staff.completion'], cross_feature_dependencies: ['AIO.FINANCES (AIO fee is a separate ledger)'] },
  { node_id: `${CASE}.AUDIT`, node_type: 'DRAWER', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: null, parent_node: CASE, title: 'AUDIT TRAIL', purpose: 'Every classification change, override with note + staff, approval, filing, amendment.', primary_object: 'THE CASE AUDIT', primary_task: 'Check who did what.', read_contracts: ['STAFF.read.audit'], components: ['DETAIL_DRAWER', 'ACTIVITY_TIMELINE'], interactions: ['I.OPEN_AUDIT_TRAIL'], states: ['UI.DEFAULT', 'UI.READ_ONLY'], bindings: staffChild('Family drawer with activity rows.'), permissions: S_PERM(['VIEW']), inbox_relationship: NO_INBOX, activity_relationship: 'Reads q.audit.', vault_relationship: NO_VAULT, success_condition: 'Audit readable.', blocked_condition: '—', experience_refs: ['perspectives.founder_staff.audit_history'], cross_feature_dependencies: [] },
  { node_id: `${CASE}.THREAD`, node_type: 'DRAWER', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: null, parent_node: CASE, title: 'CLIENT THREAD', purpose: 'The quarter request thread from the staff side.', primary_object: 'THE QUARTER THREAD', primary_task: 'Message the client.', read_contracts: ['MSG.read.thread'], components: ['DETAIL_DRAWER', 'MESSAGE_THREAD'], interactions: ['I.MESSAGE_CLIENT'], states: ['UI.DEFAULT', 'UI.SUCCESS', 'UI.ERROR'], bindings: staffChild('Family drawer + thread.'), permissions: S_PERM(['MESSAGE']), inbox_relationship: THREAD, activity_relationship: NO_INBOX, vault_relationship: NO_VAULT, success_condition: 'Message sent.', blocked_condition: '—', experience_refs: ['perspectives.founder_staff.communication'], cross_feature_dependencies: ['AIO.INBOX'] },
  { node_id: `${CASE}.AMENDMENT`, node_type: 'FLOW', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: null, parent_node: CASE, title: 'REJECTED — AMENDMENT', purpose: 'Failure / correction flow: record the jurisdiction’s rejection and reopen reconciliation for an amended return.', primary_object: 'THE RETURNED FILING', primary_task: 'Record the rejection and correct.', read_contracts: ['FILING.read.record'], components: ['CONFIRM_MODAL', 'RISK_FLAG_PANEL'], interactions: ['I.OPEN_CORRECTION'], states: ['FILING_REJECTED', 'AIO_REVIEWING', 'UI.ERROR'], bindings: staffChild('Family modal + flags.'), permissions: S_PERM(['FILE', 'EDIT']), inbox_relationship: 'Client informed via thread.', activity_relationship: 'Audited.', vault_relationship: 'Amended return supersedes; original kept.', success_condition: 'Back to RECONCILING with the reason recorded.', blocked_condition: 'No rejection writer exists (STAFF.write.recordRejection MISSING).', experience_refs: ['error_states', 'visual_relationships.FILING_REJECTED'], cross_feature_dependencies: [] },
  { node_id: `${CASE}.REOPEN`, node_type: 'MODAL', actor: 'FOUNDER_STAFF', page_family: SF, tab_id: null, parent_node: CASE, title: 'REOPEN QUARTER', purpose: 'Founder override: reopen an archived quarter for amendment (new sealed version on completion).', primary_object: 'AN ARCHIVED QUARTER', primary_task: 'Reopen with a reason.', read_contracts: ['QUARTER.read.history'], components: ['CONFIRM_MODAL'], interactions: ['I.REOPEN_QUARTER'], states: ['ARCHIVED', 'AIO_REVIEWING', 'UI.ERROR'], bindings: staffChild('Family confirm modal.'), permissions: S_PERM(['OVERRIDE']), inbox_relationship: NO_INBOX, activity_relationship: 'Audited override.', vault_relationship: 'Produces a new sealed version.', success_condition: 'Quarter back in RECONCILING.', blocked_condition: 'No writer exists (STAFF.write.reopenQuarter MISSING).', experience_refs: ['founder_override_points.REOPEN_QUARTER'], cross_feature_dependencies: [] },

  /* ═════════════════════════════ PUBLIC ═════════════════════════════ */
  { node_id: PUB, node_type: 'PAGE', actor: 'PUBLIC', page_family: PF, tab_id: null, parent_node: PF, title: 'IFTA FILING ROOM — SERVICE (root)', purpose: 'Service experience derived from the family DNA (sprint §20): what IFTA is, who needs it, what AIO handles, what the client provides, how it works, why it is different, how to start. Never private client data.', primary_object: 'THE IFTA FILING SERVICE (SAMPLE quarter)', primary_task: 'Understand what AIO handles every quarter and request filing.', read_contracts: ['PUBLIC.read.contract_copy', 'PUBLIC.read.availability'], components: ['TOP_NAV', 'QUARTER_HERO', 'METRICS_RAIL', 'BRAND_EXIT_BAND'], interactions: ['I.PUBLIC_NAV', 'I.GET_STARTED', 'I.SEE_HOW_IT_WORKS', 'I.SEARCH'], states: ['NOT_ENROLLED', 'UI.DEFAULT'], bindings: [direct(AM), direct(PTD), direct(PTD)], resp: ['menu nav; tall hero; sections stacked', 'menu nav; sections stacked with wider tiles', 'anchor nav; wide sections'], permissions: PUB_PERM, cross_feature_dependencies: ['Services hub', 'Road Ready recommendation', 'Start-Business journey'], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, success_condition: 'Visitor understands the service and starts a request.', blocked_condition: 'Availability truth unresolved (D-IFTA-AVAILABILITY).', experience_refs: ['perspectives.public', 'public_entry', 'information_hierarchy.PUBLIC', 'emotional_target.PUBLIC'] },
  { node_id: `${PUB}.OVERVIEW`, node_type: 'SECTION', actor: 'PUBLIC', page_family: PF, tab_id: 'IFTA_FILING_ROOM', parent_node: PUB, title: 'IFTA FILING ROOM (hero)', purpose: 'Promise + SAMPLE quarter + sample metrics (workspace continuity: the same quarter object the client will live in).', primary_object: 'SAMPLE QUARTER', primary_task: 'See what the filing room looks like.', read_contracts: ['PUBLIC.read.contract_copy'], components: ['QUARTER_HERO', 'METRICS_RAIL'], interactions: ['I.SEE_HOW_IT_WORKS'], states: ['UI.DEFAULT'], bindings: [direct(AM), direct(PTD), direct(PTD)], permissions: PUB_PERM, cross_feature_dependencies: [], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, success_condition: 'Sample labelled SAMPLE.', blocked_condition: '—', experience_refs: ['perspectives.public.workspace_continuity'] },
  { node_id: `${PUB}.WHAT_IS_IFTA`, node_type: 'SECTION', actor: 'PUBLIC', page_family: PF, tab_id: 'WHAT_IS_IFTA', parent_node: PUB, title: 'WHAT IFTA IS · WHO NEEDS IT', purpose: 'IFTA is the quarterly fuel tax report for qualifying interstate carriers; due dates; who needs it (and the IFTA account prerequisite).', primary_object: 'IFTA', primary_task: 'Know whether IFTA applies to me.', read_contracts: ['PUBLIC.read.contract_copy'], components: ['EXPLAINER_BAND'], interactions: ['I.START_IFTA_REGISTRATION'], states: ['UI.DEFAULT'], bindings: [derived('Explainer copy band pattern from the public family (no dedicated section in the reference).', AM, PTD, A), derived('Explainer band pattern.', PTD, A), derived('Explainer band pattern.', PTD, A)], permissions: PUB_PERM, cross_feature_dependencies: ['AIO.IFTA_REGISTRATION'], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, success_condition: 'Visitor knows if it applies.', blocked_condition: '—', experience_refs: ['perspectives.public.must_understand', 'perspectives.public.who_its_for', 'perspectives.public.timing'] },
  { node_id: `${PUB}.HOW_IT_WORKS`, node_type: 'SECTION', actor: 'PUBLIC', page_family: PF, tab_id: 'HOW_IT_WORKS', parent_node: PUB, title: 'HOW IT WORKS — WHAT AIO HANDLES · WHAT YOU PROVIDE', purpose: 'A clear path from miles to compliance + five process steps; what AIO handles and what the client provides.', primary_object: 'THE PROCESS', primary_task: 'Understand the steps and my part.', read_contracts: ['PUBLIC.read.contract_copy'], components: ['EXPLAINER_BAND', 'PROCESS_STEPS'], interactions: ['I.GET_STARTED'], states: ['UI.DEFAULT'], bindings: [direct(AM), direct(PTD), direct(PTD)], permissions: PUB_PERM, cross_feature_dependencies: [], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, success_condition: 'Steps read truthfully (staff-prepared, client-approved, AIO-filed).', blocked_condition: 'Copy truth (D-PUBLIC-COPY-TRUTH).', experience_refs: ['perspectives.public.how_it_works', 'perspectives.public.what_we_handle', 'perspectives.public.what_client_provides'] },
  { node_id: `${PUB}.FEATURES`, node_type: 'SECTION', actor: 'PUBLIC', page_family: PF, tab_id: 'FEATURES', parent_node: PUB, title: 'WHY IT IS DIFFERENT — BUILT FOR OWNER OPERATORS AND FLEETS', purpose: 'ACCURATE · EFFICIENT · COMPLIANT — why the filing room is different (verified records, you approve before filing, the quarter lands in your Vault).', primary_object: 'THE DIFFERENCE', primary_task: 'Trust the service.', read_contracts: ['PUBLIC.read.contract_copy'], components: ['VALUE_PILLARS'], interactions: ['I.PUBLIC_NAV'], states: ['UI.DEFAULT'], bindings: [direct(AM), direct(PTD), direct(PTD)], permissions: PUB_PERM, cross_feature_dependencies: [], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, success_condition: 'Claims match the contract.', blocked_condition: '“Automated tracking” claim (D-PUBLIC-COPY-TRUTH).', experience_refs: ['perspectives.public.outcome'] },
  { node_id: `${PUB}.JURISDICTIONS`, node_type: 'SECTION', actor: 'PUBLIC', page_family: PF, tab_id: 'JURISDICTIONS', parent_node: PUB, title: 'JURISDICTIONS — ONE RETURN', purpose: 'Many jurisdictions, one return (sample map).', primary_object: 'JURISDICTION MAP (SAMPLE)', primary_task: 'See that one return covers every state driven.', read_contracts: ['PUBLIC.read.contract_copy'], components: ['MAP_PANEL'], interactions: ['I.PUBLIC_NAV'], states: ['UI.DEFAULT'], bindings: [direct(AM), direct(PTD), direct(PTD)], permissions: PUB_PERM, cross_feature_dependencies: [], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, success_condition: 'Map labelled sample.', blocked_condition: '“We track your … routes” claim (D-PUBLIC-COPY-TRUTH).', experience_refs: ['perspectives.public.must_understand'] },
  { node_id: `${PUB}.RESOURCES`, node_type: 'SECTION', actor: 'PUBLIC', page_family: PF, tab_id: 'RESOURCES', parent_node: PUB, title: 'RESOURCES', purpose: 'Due dates, what to send, pricing relationship (quote required; tax is the carrier’s liability), IFTA account help.', primary_object: 'GUIDANCE', primary_task: 'Prepare before starting.', read_contracts: ['PUBLIC.read.contract_copy'], components: ['RESOURCE_TILES'], interactions: ['I.START_IFTA_REGISTRATION'], states: ['UI.DEFAULT'], bindings: [derived('Nav item exists in the reference; section derived from the pillar tile pattern.', AM, PTD, A), derived('Pillar tile pattern.', PTD, A), derived('Pillar tile pattern.', PTD, A)], permissions: PUB_PERM, cross_feature_dependencies: ['AIO.IFTA_REGISTRATION'], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, success_condition: 'Visitor knows what to prepare.', blocked_condition: '—', experience_refs: ['perspectives.public.timing', 'perspectives.public.pricing_relationship'] },
  { node_id: `${PUB}.START`, node_type: 'SECTION', actor: 'PUBLIC', page_family: PF, tab_id: 'START', parent_node: PUB, title: 'HOW TO START', purpose: 'GET STARTED → REQUEST FILING; lower brand band.', primary_object: 'THE START ACTION', primary_task: 'Start a request.', read_contracts: ['PUBLIC.read.availability'], components: ['BRAND_EXIT_BAND', 'EXPLAINER_BAND'], interactions: ['I.GET_STARTED'], states: ['UI.DEFAULT'], bindings: [direct(AM), direct(PTD), direct(PTD)], permissions: PUB_PERM, cross_feature_dependencies: ['service request engine'], vault_relationship: NO_VAULT, inbox_relationship: NO_INBOX, activity_relationship: NO_INBOX, success_condition: 'Request flow opened.', blocked_condition: 'Availability truth unresolved.', experience_refs: ['public_cta', 'information_hierarchy.PUBLIC'] },
  { node_id: 'AIO.IFTA.PUBLIC.REQUEST_FILING', node_type: 'FLOW', actor: 'PUBLIC', page_family: PF, tab_id: null, parent_node: PUB, title: 'REQUEST FILING', purpose: 'Request flow: company, contact, fleet size, base jurisdiction, IFTA account yes / no → quote request; no account → IFTA registration.', primary_object: 'THE FILING REQUEST', primary_task: 'Request IFTA filing with AIO.', read_contracts: ['PUBLIC.read.availability'], components: ['REQUEST_FORM', 'CONFIRM_MODAL'], interactions: ['I.SUBMIT_FILING_REQUEST', 'I.START_IFTA_REGISTRATION'], states: ['NOT_ENROLLED', 'UI.DEFAULT', 'UI.LOADING', 'UI.ERROR', 'UI.SUCCESS'], bindings: [derived('Family modal / form on the dark public family.', AM, PTD, A), derived('Family modal / form.', PTD, A), derived('Family modal / form.', PTD, A)], permissions: [{ actor: 'PUBLIC', rights: ['VIEW', 'CREATE'], scope: 'anonymous visitor submitting a request (account linked by the request flow)' }], cross_feature_dependencies: ['service request engine', 'AIO.IFTA_REGISTRATION'], vault_relationship: NO_VAULT, inbox_relationship: 'Request creates the intake thread (request engine).', activity_relationship: 'Request activity.', success_condition: 'Request received; quote follows.', blocked_condition: 'Availability truth unresolved; no enrollment link from request to quarter.', experience_refs: ['public_cta', 'perspectives.public.pricing_relationship', 'transitions'] },
];

/* ─────────────────────────────── tab contracts (sprint §11–16) ─────────────────────────────── */

export type MustItemStatus = 'MODELED' | 'MODELED_DATA_PARTIAL' | 'MODELED_DATA_MISSING' | 'CONDITIONAL_NOT_SUPPORTED';
export type TabContract = {
  tab_id: string;
  sprint_section: string;
  purpose: string;
  contract_sheet: { purpose: string; key_data: string; primary_actions: string };
  client_node: string;
  staff_node: string;
  must_model: { item: string; covered_by: string[]; status: MustItemStatus; note?: string }[];
  own_logic: { data_ownership: string; mutations: string[]; validation: string[]; error_conditions: string[]; actor_rights: string; system_relationships: string[] };
};

export const AIO_IFTA_TAB_CONTRACTS: TabContract[] = [
  {
    tab_id: 'PROGRESS', sprint_section: '§11', purpose: 'SHOW END-TO-END QUARTER READINESS.',
    contract_sheet: { purpose: 'Track end-to-end filing progress', key_data: 'Workflow status, completion by step, upcoming tasks', primary_actions: 'Continue, review, submit' },
    client_node: `${ROOM}.PROGRESS`, staff_node: `${CASE}.OVERVIEW`,
    must_model: [
      { item: 'COLLECTION STATUS', covered_by: ['TASK_LIST', 'FILING_WORKFLOW', 'COLLECTING'], status: 'MODELED' },
      { item: 'AIO PREPARATION', covered_by: ['FILING_WORKFLOW', 'AIO_REVIEWING', 'INSIGHTS_PANEL'], status: 'MODELED' },
      { item: 'CLIENT REVIEW', covered_by: [`${ROOM}.PROGRESS.RETURN_REVIEW`, 'READY_FOR_CLIENT_REVIEW', 'CLIENT_APPROVAL_PENDING'], status: 'MODELED' },
      { item: 'FILING STATUS', covered_by: ['FILING_WORKFLOW', 'APPROVED_FOR_FILING', 'FILING', `${ROOM}.FILED`], status: 'MODELED_DATA_PARTIAL', note: 'No separate “filing started” marker (FILING sub-state PARTIAL).' },
      { item: 'NEXT ACTION', covered_by: ['NEXT_ACTION_RAIL', 'I.CONTINUE_NEXT_ACTION'], status: 'MODELED' },
      { item: 'BLOCKERS', covered_by: [`${ROOM}.PROGRESS.NEEDS_YOU`, 'RISK_FLAG_PANEL', 'UI.BLOCKED', 'OVERDUE_RISK'], status: 'MODELED' },
      { item: 'INSIGHTS', covered_by: ['INSIGHTS_PANEL'], status: 'MODELED' },
      { item: 'RECENT UPLOADS', covered_by: ['RECENT_UPLOADS'], status: 'MODELED_DATA_PARTIAL', note: 'Source files are names only (not stored as documents).' },
      { item: 'ACTIVITY', covered_by: ['ACTIVITY_TIMELINE', 'ACTIVITY.read.ifta_client'], status: 'MODELED' },
      { item: 'JURISDICTION OVERVIEW', covered_by: ['MAP_PANEL', 'JURIS.read.breakdown'], status: 'MODELED_DATA_PARTIAL', note: '13 US state names only.' },
      { item: 'QUARTER METRICS', covered_by: ['METRICS_RAIL'], status: 'MODELED_DATA_PARTIAL', note: 'Tax slot from the return summary only (D-TAX-FIGURES).' },
    ],
    own_logic: { data_ownership: 'Derived quarter status (no own records).', mutations: ['QUARTER.write.sendQuarterToAio', 'RETURN.write.approveReturn', 'RETURN.write.askQuestion', 'FUEL.write.resolveReceipt'], validation: ['canSendToAio()', 'approval only in AWAITING_APPROVAL'], error_conditions: ['blocking items', 'locked quarter'], actor_rights: 'Client submits / approves / asks; staff mirror in OVERVIEW.', system_relationships: ['MY_OFFICE attention', 'INBOX approval request', 'ACTIVITY milestones'] },
  },
  {
    tab_id: 'FUEL_PURCHASES', sprint_section: '§12', purpose: 'COLLECT, VERIFY, CORRECT AND RECONCILE FUEL PURCHASE RECORDS.',
    contract_sheet: { purpose: 'Manage and verify fuel receipts', key_data: 'Receipts, gallons, vendors, dates, jurisdictions', primary_actions: 'Upload, import CSV, edit, verify' },
    client_node: `${ROOM}.FUEL_PURCHASES`, staff_node: `${CASE}.FUEL_PURCHASES`,
    must_model: [
      { item: 'RECEIPT UPLOAD', covered_by: [`${ROOM}.FUEL_PURCHASES.UPLOAD`, 'UPLOAD_ZONE', 'I.UPLOAD_RECEIPT', 'I.TAKE_PHOTO'], status: 'MODELED_DATA_PARTIAL', note: 'Parser is a seeded stand-in; files not stored.' },
      { item: 'FILE IMPORT', covered_by: [`${ROOM}.FUEL_PURCHASES.CSV_IMPORT`, `${ROOM}.FUEL_PURCHASES.IMPORT_VAULT`, 'I.IMPORT_CSV', 'I.IMPORT_FROM_VAULT'], status: 'MODELED_DATA_MISSING', note: 'CSV import has no parser (FUEL.write.importCsv MISSING); Vault import exists.' },
      { item: 'RECEIPT LIST', covered_by: ['RECEIPT_ROW', 'FUEL.read.receipts'], status: 'MODELED' },
      { item: 'VENDOR', covered_by: ['RECEIPT_ROW', 'FUEL_DONUT'], status: 'MODELED', note: 'Vendor names as text.' },
      { item: 'DATE', covered_by: ['RECEIPT_ROW'], status: 'MODELED' },
      { item: 'STATE', covered_by: ['RECEIPT_ROW'], status: 'MODELED', note: 'Column added (D-FUEL-STATE-COLUMN).' },
      { item: 'GALLONS', covered_by: ['RECEIPT_ROW', 'METRICS_RAIL'], status: 'MODELED' },
      { item: 'AMOUNT', covered_by: ['RECEIPT_ROW'], status: 'MODELED' },
      { item: 'STATUS', covered_by: ['STATUS_CHIP', 'RECEIPT_STATUS_SUMMARY'], status: 'MODELED' },
      { item: 'PROCESSED', covered_by: ['RECEIPT.PROCESSED'], status: 'MODELED' },
      { item: 'NEEDS REVIEW', covered_by: ['RECEIPT.NEEDS_REVIEW'], status: 'MODELED' },
      { item: 'MISSING DETAILS', covered_by: ['RECEIPT.MISSING_DETAILS'], status: 'MODELED' },
      { item: 'DUPLICATE', covered_by: ['RECEIPT.DUPLICATE'], status: 'MODELED' },
      { item: 'UNREADABLE', covered_by: ['RECEIPT.UNREADABLE'], status: 'MODELED' },
      { item: 'DETAIL / EDIT', covered_by: [`${ROOM}.FUEL_PURCHASES.RECEIPT_DETAIL`, 'I.EDIT_RECEIPT'], status: 'MODELED_DATA_PARTIAL', note: 'Edits are resolutions; free-form field edits unsupported.' },
      { item: 'AIO REVIEW RELATIONSHIP', covered_by: [`${CASE}.FUEL_PURCHASES`, 'I.STAFF_VERIFY_RECEIPT', 'RECEIPT.NEEDS_REVIEW'], status: 'MODELED' },
      { item: 'MILEAGE / JURISDICTION RELATIONSHIP', covered_by: ['RECEIPT.POSSIBLE_MISSING', 'JURIS.read.breakdown', `${ROOM}.JURISDICTIONS`], status: 'MODELED' },
    ],
    own_logic: { data_ownership: 'Client owns receipts; staff own classification.', mutations: ['FUEL.write.captureReceipts', 'FUEL.write.resolveReceipt', 'FUEL.write.importCsv', 'STAFF.write.verifyReceipt', 'STAFF.write.reclassifyReceipt'], validation: ['date inside the quarter', 'duplicate check (station + date + gallons ± 0.5 + amount)', 'jurisdiction present', 'PDF / JPG / PNG ≤ 10MB'], error_conditions: ['unreadable file kept as UNREADABLE', 'locked quarter'], actor_rights: 'Client captures + answers; staff verify / reclassify / request correction.', system_relationships: ['VAULT tax_fuel import', 'BOOKKEEPING fuel expense'] },
  },
  {
    tab_id: 'MILEAGE', sprint_section: '§13', purpose: 'TRACK MILES BY JURISDICTION.',
    contract_sheet: { purpose: 'Track mileage by jurisdiction', key_data: 'Miles by state / province, trip data, allocation rules', primary_actions: 'Import, edit, validate, view breakdown' },
    client_node: `${ROOM}.MILEAGE`, staff_node: `${CASE}.MILEAGE`,
    must_model: [
      { item: 'ELD / GPS SOURCE IF SUPPORTED', covered_by: ['I.CONNECT_ELD', `${ROOM}.MILEAGE.SOURCE_PICKER`], status: 'CONDITIONAL_NOT_SUPPORTED', note: 'Not supported today; shown NOT LIVE with report upload.' },
      { item: 'FILE IMPORT', covered_by: [`${ROOM}.MILEAGE.REPORT_IMPORT`, 'I.IMPORT_MILEAGE_REPORT'], status: 'MODELED_DATA_PARTIAL', note: 'Report miles fabricated in demo; files not stored.' },
      { item: 'CSV / REPORT IMPORT', covered_by: ['CSV_MAPPER', 'I.IMPORT_MILEAGE_REPORT'], status: 'MODELED_DATA_PARTIAL' },
      { item: 'MANUAL ENTRY IF SUPPORTED', covered_by: [`${ROOM}.MILEAGE.MANUAL_ENTRY`, 'I.ENTER_MILEAGE_MANUAL'], status: 'MODELED' },
      { item: 'JURISDICTION BREAKDOWN', covered_by: ['MILEAGE_BARS', 'MAP_PANEL'], status: 'MODELED' },
      { item: 'MILES', covered_by: ['MILEAGE_ROW', 'METRICS_RAIL'], status: 'MODELED' },
      { item: 'SOURCE', covered_by: ['MILEAGE_ROW', 'MILEAGE.VERIFIED', 'MILEAGE.UNVERIFIED', 'MILEAGE.ESTIMATED'], status: 'MODELED' },
      { item: 'VALIDATION', covered_by: ['I.VERIFY_MILEAGE_SOURCE', 'MILEAGE.UNVERIFIED'], status: 'MODELED' },
      { item: 'EXCEPTION', covered_by: ['MILEAGE.EXCEPTION', 'UI.WARNING'], status: 'MODELED' },
      { item: 'EDIT / CORRECT', covered_by: [`${ROOM}.MILEAGE.VEHICLE_DETAIL`, 'I.ENTER_MILEAGE_MANUAL'], status: 'MODELED', note: 'A newer source supersedes.' },
      { item: 'TRIP RELATIONSHIP', covered_by: [`${ROOM}.MILEAGE.VEHICLE_DETAIL`], status: 'MODELED_DATA_MISSING', note: 'No trip records (origin / destination / odometer) in AIO.' },
      { item: 'FUEL RELATIONSHIP', covered_by: ['RECEIPT.POSSIBLE_MISSING', 'MILEAGE.EXCEPTION'], status: 'MODELED' },
    ],
    own_logic: { data_ownership: 'Client owns mileage records; staff verify.', mutations: ['MILEAGE.write.addMileage', 'STAFF.write.verifyMileage'], validation: ['every truck that ran has a source', 'assessIftaReadiness verified-source rule', 'estimates never filed'], error_conditions: ['ELD / GPS not live', 'unparseable report', 'estimate-only truck'], actor_rights: 'Client adds sources; staff verify.', system_relationships: ['DISPATCH estimates', 'ELD provider exports'] },
  },
  {
    tab_id: 'VEHICLES', sprint_section: '§14', purpose: 'MANAGE VEHICLE AND TRIP DATA RELEVANT TO THE QUARTER.',
    contract_sheet: { purpose: 'Manage vehicle and trip data', key_data: 'Vehicle list, unit numbers, configurations, active trips', primary_actions: 'Add, edit, deactivate, view history' },
    client_node: `${ROOM}.VEHICLES`, staff_node: `${CASE}.VEHICLES`,
    must_model: [
      { item: 'ACTIVE VEHICLES', covered_by: ['VEHICLE_ROW', 'VEHICLE.ACTIVE'], status: 'MODELED' },
      { item: 'UNIT NUMBER', covered_by: ['VEHICLE_ROW'], status: 'MODELED' },
      { item: 'TRIP DATA', covered_by: [`${ROOM}.VEHICLES.VEHICLE_DETAIL`], status: 'MODELED_DATA_MISSING', note: 'No trip records in AIO.' },
      { item: 'QUARTER PARTICIPATION', covered_by: [`${ROOM}.VEHICLES.CONFIRM_FLEET`, 'I.CONFIRM_VEHICLES'], status: 'MODELED' },
      { item: 'MISSING VEHICLE DATA', covered_by: ['VEHICLE.MISSING_DATA'], status: 'MODELED' },
      { item: 'VEHICLE DETAIL', covered_by: [`${ROOM}.VEHICLES.VEHICLE_DETAIL`], status: 'MODELED' },
      { item: 'DEACTIVATED / EXCLUDED VEHICLE STATE', covered_by: ['VEHICLE.NOT_OPERATED', `${CASE}.VEHICLES.MARK_NOT_OPERATED`], status: 'MODELED_DATA_PARTIAL', note: 'Client exclusion exists; staff override-with-note has no writer.' },
      { item: 'DATA VALIDATION', covered_by: ['vehicleReadiness (VEHICLES.read.quarter)'], status: 'MODELED' },
      { item: 'FILING IMPACT', covered_by: [`${ROOM}.VEHICLES.VEHICLE_DETAIL`, 'INSIGHTS_PANEL'], status: 'MODELED' },
    ],
    own_logic: { data_ownership: 'Fleet profile owns units; the quarter owns participation.', mutations: ['VEHICLES.write.confirmVehicles', 'STAFF.write.markNotOperated'], validation: ['each truck that ran has fuel + verified miles'], error_conditions: ['unconfirmed participation', 'truck missing data'], actor_rights: 'Client confirms participation; staff override with note; units managed in the fleet profile.', system_relationships: ['Fleet profile', 'ROAD_READY'] },
  },
  {
    tab_id: 'JURISDICTIONS', sprint_section: '§15', purpose: 'SHOW STATE / JURISDICTION DISTRIBUTION AND TAX RELATIONSHIP.',
    contract_sheet: { purpose: 'Configure jurisdictions and tax rules', key_data: 'State / province settings, rates, distance and fuel allocation', primary_actions: 'Review rates, manage settings' },
    client_node: `${ROOM}.JURISDICTIONS`, staff_node: `${CASE}.JURISDICTIONS`,
    must_model: [
      { item: 'JURISDICTION', covered_by: ['JURISDICTION_TABLE', 'MAP_PANEL'], status: 'MODELED_DATA_PARTIAL', note: '13 US state names; no Canada.' },
      { item: 'MILES', covered_by: ['JURISDICTION_TABLE', 'MILEAGE_BARS'], status: 'MODELED' },
      { item: 'GALLONS', covered_by: ['JURISDICTION_TABLE'], status: 'MODELED' },
      { item: 'RATE / TAX RELATIONSHIP', covered_by: ['JURIS.read.tax'], status: 'MODELED_DATA_PARTIAL', note: 'Net tax from the staff summary only; no rate data (D-TAX-FIGURES).' },
      { item: 'ALLOCATION', covered_by: ['MAP_PANEL', 'JURISDICTION_TABLE'], status: 'MODELED' },
      { item: 'EXCEPTION', covered_by: ['JURISDICTION.EXCEPTION'], status: 'MODELED' },
      { item: 'STATE DETAIL', covered_by: [`${ROOM}.JURISDICTIONS.STATE_DETAIL`], status: 'MODELED' },
      { item: 'MAP VIEW', covered_by: ['MAP_PANEL'], status: 'MODELED' },
      { item: 'DATA QUALITY', covered_by: ['JURISDICTION_TABLE', 'STATUS_CHIP'], status: 'MODELED' },
      { item: 'REVIEW STATUS', covered_by: ['JURISDICTION.OK', 'JURISDICTION.EXCEPTION', `${CASE}.JURISDICTIONS`], status: 'MODELED' },
    ],
    own_logic: { data_ownership: 'AIO derives the rollup; staff own reconciliation + worksheet.', mutations: ['STAFF.write.resolveDiscrepancy', 'STAFF.write.worksheet'], validation: ['miles without fuel', 'MPG band'], error_conditions: ['open discrepancy', 'tax pending'], actor_rights: 'Client read-only; staff reconcile / override / enter worksheet.', system_relationships: ['Base jurisdiction (filing destination)'] },
  },
  {
    tab_id: 'DOCUMENTS', sprint_section: '§16', purpose: 'MANAGE THE QUARTER’S FILING RECORDS.',
    contract_sheet: { purpose: 'Manage filing documents and records', key_data: 'Return drafts, final filings, receipts, correspondence', primary_actions: 'View, download, share, submit' },
    client_node: `${ROOM}.DOCUMENTS`, staff_node: `${CASE}.DOCUMENTS`,
    must_model: [
      { item: 'SOURCE FILES', covered_by: ['FILE_ROW', 'DOC.SOURCE'], status: 'MODELED_DATA_PARTIAL', note: 'File names only.' },
      { item: 'RECEIPTS', covered_by: ['FILE_ROW', 'FUEL.read.receipts'], status: 'MODELED' },
      { item: 'MILEAGE REPORTS', covered_by: ['FILE_ROW', 'MILEAGE.read.records'], status: 'MODELED_DATA_PARTIAL', note: 'Reports not stored.' },
      { item: 'DRAFT RETURN', covered_by: ['DOC.DRAFT'], status: 'MODELED' },
      { item: 'CLIENT REVIEW COPY', covered_by: ['DOC.REVIEW_COPY'], status: 'MODELED' },
      { item: 'FINAL RETURN', covered_by: ['DOC.FINAL'], status: 'MODELED_DATA_PARTIAL', note: 'Filed return file not uploaded.' },
      { item: 'CONFIRMATION', covered_by: ['DOC.FINAL', 'FILING.read.record'], status: 'MODELED' },
      { item: 'PAYMENT RECORD IF APPLICABLE', covered_by: ['PAYMENT.read.record', 'PAYMENT_PENDING'], status: 'MODELED' },
      { item: 'VAULT DESTINATION', covered_by: ['DOC.SEALED', 'I.OPEN_VAULT_RECORD'], status: 'MODELED_DATA_PARTIAL', note: 'Packet metadata only.' },
      { item: 'FILE STATUS', covered_by: ['STATUS_CHIP', 'FILE_ROW'], status: 'MODELED' },
      { item: 'VERSION / SUPERSESSION', covered_by: ['DOC.SUPERSEDED'], status: 'MODELED_DATA_PARTIAL' },
    ],
    own_logic: { data_ownership: 'Client owns filed records; AIO produces summary / packet.', mutations: ['DOCS.write.share', 'SYSTEM.write.sealPacket'], validation: ['packet sealed only on FILED'], error_conditions: ['file unavailable'], actor_rights: 'Client view / download / share; staff view / download.', system_relationships: ['VAULT'] },
  },
];

/* ─────────────────────────────── family inheritance (sprint §34) ─────────────────────────────── */

export const AIO_IFTA_FAMILY_INHERITANCE = {
  rule: 'Every child inherits the family DNA from its parent authority and overrides only its task, data, modules, actions and states. SHARED DESIGN ≠ SHARED LOGIC.',
  inherit: ['SHELL', 'TYPOGRAPHY', 'MATERIAL', 'COLOR_LANGUAGE', 'HERO_LOGIC', 'TAB_LOGIC', 'LOWER_BRAND_BAND', 'ICON_FAMILY', 'NAV (simple mark only)', 'PANEL_MATERIALS', 'BASE_GRID', 'CTA_LANGUAGE', 'BRAND_ENVIRONMENT'],
  override: ['PRIMARY_TASK', 'PRIMARY_DATA', 'CONTENT_MODULES', 'ACTIONS', 'STATES', 'DATA_OWNERSHIP', 'MUTATIONS', 'VALIDATION', 'CHILD_ROUTES', 'DRAWERS', 'MODALS', 'ERROR_CONDITIONS', 'ACTOR_RIGHTS', 'SYSTEM_RELATIONSHIPS'],
  never_inherit: ['LEGACY AIO VISUALS (header, nav geometry, sidebar, footer, page width, grid, card system, panel system, typography, spacing, color, responsive rules, layout, composition, visual proportion, shell architecture)'],
  parents: {
    CLIENT: { parent_authority: 'AIO.IFTA.CLIENT.PFA.v1', parent_ref: 'CLIENT_MOBILE_PARENT_AUTHORITY', derivation_proof: 'FUEL_PURCHASES_CHILD_PROOF', viewport_derivation: 'CLIENT_TABLET_DESKTOP' },
    FOUNDER_STAFF: { parent_authority: 'AIO.IFTA.FOUNDER_STAFF.PFA.v1 (derived from the client parent)', parent_ref: 'ACTOR_MODES_MOBILE (staff)', derivation_proof: 'FUEL_PURCHASES_CHILD_PROOF (rule)', viewport_derivation: 'FOUNDER_STAFF_TABLET_DESKTOP', actor_override: 'LIGHT_PRIMARY + DARK_OPERATIONAL_ACCENTS, denser; OVERVIEW replaces PROGRESS; CLIENT HEALTH + tasks + team activity + risks' },
    PUBLIC: { parent_authority: 'AIO.IFTA.PUBLIC.PFA.v1 (derived from the client parent)', parent_ref: 'ACTOR_MODES_MOBILE (public)', derivation_proof: '—', viewport_derivation: 'PUBLIC_TABLET_DESKTOP', actor_override: 'DARK_PRIMARY cinematic; sections instead of tabs; SAMPLE data only' },
  },
  derivation_conditions: ['FAMILY COMPOSITION IS CLEAR', 'COMPONENT CONTRACT IS CLEAR', 'TAB LOGIC IS CLEAR', 'ASSET FAMILY IS CLEAR'],
  child_proof_rule: 'FUEL PURCHASES proves the derivation; it is not a template copied into every tab.',
} as const;
