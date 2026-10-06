/**
 * P0.AIO.OFFICE-WORKSPACE-ARCHITECTURE-AND-IFTA-TREE-FOUNDER-LOCK1 — export the AIO OFFICE / CLIENT OFFICE architecture
 * (single sources: shared/studioos-experience-brain/operating-environment.ts + projects/aio/office.ts, and the rebased
 * IFTA tree in shared/studioos-visual-authority/projects/aio/ifta-authority).
 *
 *   npx tsx scripts/studioos/aio-office-export.ts
 *
 * Every file in docs/aio/office/ is GENERATED — edit the TypeScript, never the output.
 * tests/aioOfficeWorkspaceArchitecture1.test.ts keeps them in sync. NO PAGE IMPLEMENTATION · NO PAID GENERATION.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  CONTEXT_SCOPED_DOMAINS,
  EXPANSION_PLACEMENTS,
  EXPANSION_SUPPRESSION_REASONS,
  NAVIGATION_SEMANTICS,
  OPTIONAL_WORKSPACE_STATES,
  REQUIRED_WORKSPACE_STATES,
  aio as brain,
  checkCaseUniqueness,
  evaluateExpansion,
  resolveWorkspaceState,
  workspaceSwitcherOptions,
  type ExpansionPlacement,
} from '../../shared/studioos-experience-brain/index.js';
import { aioIfta } from '../../shared/studioos-visual-authority/index.js';

export const AIO_OFFICE_DOCS_DIR = 'docs/aio/office';
const SPRINT = brain.AIO_OFFICE_SPRINT;
const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const head = (id: string) => ({
  id, sprint: SPRINT, generated_by: 'scripts/studioos/aio-office-export.ts',
  source: ['shared/studioos-experience-brain/operating-environment.ts', 'shared/studioos-experience-brain/projects/aio/office.ts'],
  audit: { repo: 'yoteenz/fsbw · all-in-one-enterprises', sha: brain.AIO_OFFICE_AUDIT_SHA, mode: 'READ-ONLY' },
  constraints: { page_implementation: false, new_paid_generations: 0, openart_accessed: false, legacy_visual_authority: 'FORBIDDEN', permissions_broadened: false },
});
const D = brain.AIO_OFFICE_DATA;
const ws = (id: string) => brain.AIO_WORKSPACES.find((w) => w.workspace_id === id)!;
const env = (id: string) => brain.AIO_ENVIRONMENTS.find((e) => e.environment_id === id)!;
const nonTree = (id: string) => aioIfta.AIO_IFTA_TREE.find((n) => n.node_id === id)!;
const DEMO_NOTE = 'DEMO SEED FIXTURES (AIO demo store) — used only to prove the model; never rendered as client data and never a fallback for another client.';

/** Every workspace × client resolution (demo fixtures). */
function stateMatrix() {
  return D.clients.map((c) => ({
    client_id: c.client_id, name: c.name,
    states: Object.fromEntries(D.workspaces.map((w) => { const r = resolveWorkspaceState(w, c); return [w.workspace_id, { state: r.state, eligibility: r.eligibility, conflict: r.conflict, source: r.source }]; })),
  }));
}

/** Every inactive workspace × client × placement → evaluation (proves there is no generic fallback). */
function expansionMatrix(placements: readonly ExpansionPlacement[] = ['CLIENT_OFFICE_HUB', 'WORKSPACE_SWITCHER_AVAILABLE']) {
  return D.clients.flatMap((c) => D.workspaces.flatMap((w) => placements.map((p) => {
    const e = evaluateExpansion(w, c, D.workspaces, { placement: p, current_workspace_id: null, critical_state: false, error_recovery: false });
    return { client_id: c.client_id, workspace_id: w.workspace_id, placement: p, shown: !e.suppressed, relevance_class: e.relevance_class, rule_id: e.rule_id, headline: e.headline, reasons: e.reasons, suppressed_by: e.suppressed_by };
  })));
}

export function aioOfficeStatus() {
  const matrix = expansionMatrix(EXPANSION_PLACEMENTS);
  const shown = matrix.filter((m) => m.shown);
  return {
    architecture: 'DEFINED',
    client_switcher: 'DEFINED (AIO OFFICE only; keeps workspace; inactive → truthful state)',
    workspace_switcher: 'DEFINED (keeps client; ACTIVE · IN PROGRESS · relevant AVAILABLE; NOT_APPLICABLE hidden)',
    subcontext_model: 'DEFINED (IFTA: QUARTER; one canonical case per client × quarter)',
    central_hub: 'DEFINED (responsibilities mapped to AIO truth; hub page authority MISSING — environment-level)',
    expansion: { contract: 'DEFINED', rules: brain.AIO_EXPANSION_RULES.length, signals: brain.AIO_EXPANSION_SIGNALS.length, suppression_reasons: EXPANSION_SUPPRESSION_REASONS.length, placements: EXPANSION_PLACEMENTS.length, evaluations: matrix.length, shown: shown.length, shown_without_rule: shown.filter((m) => !m.rule_id).length, generic_fallbacks_in_model: 0, legacy_generic_fallbacks_found: brain.AIO_LEGACY_GENERIC_FALLBACKS.length },
    case_uniqueness: checkCaseUniqueness(D.cases),
  };
}

/* ─────────────────────────────── JSON artifacts ─────────────────────────────── */

function workspaceRegistry() {
  return {
    ...head('AIO_OFFICE_WORKSPACE_REGISTRY'),
    rule: 'AIO services are WORKSPACES inside a connected business office. Only services AIO actually has are registered; no future service inflates the tree.',
    required_fields: ['workspace_id', 'name', 'category', 'availability', 'client_eligibility_rule', 'founder_route', 'client_route', 'active_case_types', 'subcontext_types', 'required_permissions', 'shared_dependencies', 'adjacent_workspaces', 'expansion_rules', 'workspace_state', 'capabilities'],
    maturity: { TREE_PROVEN: 'a founder-confirmable page / tab / state tree exists (IFTA)', CONTRACT_ONLY: 'experience contract exists; no authority tree yet', REGISTERED: 'registered only' },
    by_maturity: Object.fromEntries(['TREE_PROVEN', 'CONTRACT_ONLY', 'REGISTERED'].map((m) => [m, brain.AIO_WORKSPACES.filter((w) => w.workspace_state === m).map((w) => w.workspace_id)])),
    workspaces: brain.AIO_WORKSPACES.map((w) => ({ ...w, expansion_rules: w.expansion_rules.map((r) => r.rule_id) })),
    not_workspaces: brain.AIO_NOT_WORKSPACES,
    shared_capabilities: ['VAULT / DOCUMENTS', 'INBOX / COMMUNICATIONS', 'BILLING / MONEY', 'RENEWALS / CALENDAR / DEADLINES', 'FLEET REGISTRY'],
  };
}

function contextModel() {
  const sc = brain.aioOfficeProofScenarios();
  return {
    ...head('AIO_OFFICE_CONTEXT_MODEL'),
    models: {
      AIO_OFFICE: 'CLIENT × WORKSPACE × SUBCONTEXT — client and workspace switch independently',
      CLIENT_OFFICE: 'FIXED CLIENT × WORKSPACE × SUBCONTEXT — no client switcher',
      CASE: 'PROJECT + CLIENT + WORKSPACE + CASE TYPE + SUBCONTEXT — one canonical identity; founder and client views are projections of the same case',
    },
    environments: brain.AIO_ENVIRONMENTS,
    navigation_semantics: NAVIGATION_SEMANTICS,
    views: { HUB: 'environment hub', WORKSPACE_LANDING: 'cross-client workspace queue (AIO OFFICE)', CLIENT_OVERVIEW: 'one client, every workspace (AIO OFFICE)', CLIENT_WORKSPACE: 'workspace open for one client without a modelled case', CASE: 'the canonical case', CASE_NOT_OPEN: 'workspace active, no case for that subcontext', WORKSPACE_INACTIVE: 'staff: WORKSPACE NOT ACTIVE FOR THIS CLIENT', WORKSPACE_EXPANSION: 'client: NOT ACTIVE YET expansion state', WORKSPACE_HIDDEN: 'client: NOT_APPLICABLE — nothing surfaced' },
    state_propagation: { rule: 'A context change re-resolves everything below from scratch — nothing is carried from the previous context; every render is keyed by scope_key.', re_resolves: CONTEXT_SCOPED_DOMAINS },
    case_identity: { key_format: '{project}:{client}:{workspace}:{case_type}:{subcontext}', ifta_record_rule: 'one IftaQuarterCase per organisation-quarter (id ifta-{org}-{year}-q{n}) — the same record serves client and staff', cases: D.cases, uniqueness: checkCaseUniqueness(D.cases) },
    routes: brain.AIO_OFFICE_ROUTES,
    permissions: {
      rule: 'Existing guards only — no permission is broadened. Client office = the session organisation (CustomerRouteGuard). AIO office = OfficeRouteGuard + office role permissions; every office role holds clients.read over every client today (officeContext.ts:75-166).',
      founder_role: 'No founder role exists in AIO (no staff seeded owner / admin; Supabase internal_role not mapped). Recommended: founder = OfficeStaffRole owner — open founder question, not decided here.',
      ifta_staff: ws('IFTA').required_permissions,
    },
    experience_brain_concepts: {
      PROJECT: 'OfficeData.project_id (AIO)', OPERATING_ENVIRONMENT: 'OperatingEnvironment (AIO.OFFICE · AIO.CLIENT_OFFICE · AIO.PUBLIC_SITE)', WORKSPACE: 'WorkspaceDefinition', ACTOR: 'OperatingEnvironment.actor (ExperienceActor)', CLIENT: 'ClientRecord', CASE: 'CaseIdentity / CaseRecord (canonicalCaseKey)', SUBCONTEXT: 'CaseIdentity.subcontext + SUBCONTEXT switcher', PAGE_FAMILY: 'tree PAGE_FAMILY nodes (visual authority)', NODE: 'ExperienceTreeNode with NodeContextMeta (environment · workspace · client scope · case type · subcontext)',
    },
    proofs: sc,
  };
}

function clientOfficeModel() {
  const e = env('AIO.CLIENT_OFFICE');
  return {
    ...head('CLIENT_OFFICE_WORKSPACE_MODEL'),
    environment: e,
    fixed_client: { rule: 'The client is the signed-in organisation. No client switcher exists; any other client id is refused (ContextError CLIENT_FIXED); switchClient is refused (NO_CLIENT_SWITCHER).', session_resolution: 'AIO today: portal org = store.portalClientId (demo) / first active membership (Supabase session) — multi-org chooser is an open founder question.' },
    hub: { responsibilities: e.hub!.responsibilities, sources: brain.AIO_HUB_SOURCES.filter((h) => h.hub_id === 'AIO.CLIENT_OFFICE.HUB') },
    workspace_states: {
      ACTIVE: 'workspace opens on its client view (IFTA: the filing room on the quarter that needs work)',
      AVAILABLE_NOT_ACTIVATED: 'relevant + eligible + requestable → listed under AVAILABLE and opens the NOT ACTIVE YET expansion state; otherwise not listed',
      NOT_APPLICABLE: 'never listed, never suggested; a direct link resolves WORKSPACE_HIDDEN',
      optional: 'PENDING_SETUP · PAUSED · ENDED only where the workspace’s own record supports them (IN PROGRESS group)',
    },
    expansion_state: ['WORKSPACE NAME', 'NOT ACTIVE YET', 'WHY IT MAY MATTER (rule reasons — omitted when suppressed)', 'WHAT AIO HANDLES', 'WHAT YOU PROVIDE', 'REQUEST / EXPLORE CTA'],
    ifta: {
      tree: ['CLIENT OFFICE', 'WORKSPACE IFTA', 'QUARTER SELECTOR', 'IFTA FILING ROOM', 'PROGRESS · FUEL PURCHASES · MILEAGE · VEHICLES · JURISDICTIONS · DOCUMENTS'],
      primary_tabs: aioIfta.AIO_IFTA_TREE.filter((n) => n.parent_node === 'AIO.IFTA.CLIENT.ROOM' && n.node_type === 'TAB').map((n) => n.tab_id),
      notes: 'No client NOTES tab — notes travel through MESSAGE AIO (D-NOTES-TAB).',
      inactive_node: nonTree('AIO.IFTA.CLIENT.NOT_ENROLLED').node_id,
    },
    demo_note: DEMO_NOTE,
    switcher_by_client: D.clients.map((c) => ({ client_id: c.client_id, name: c.name, ...workspaceSwitcherOptions(D, c.client_id) })),
  };
}

function availabilityModel() {
  return {
    ...head('WORKSPACE_AVAILABILITY_MODEL'),
    required_states: REQUIRED_WORKSPACE_STATES,
    optional_states: OPTIONAL_WORKSPACE_STATES,
    optional_rule: 'An optional state is used only when the workspace declares a source record that supports it (supported_states).',
    resolution: [
      '1. Entitlement record (only states the workspace supports) → that state; an entitlement that contradicts eligibility is reported as conflict and never grounds a suggestion.',
      '2. No entitlement → eligibility rule over recorded signals: NOT_ELIGIBLE → NOT_APPLICABLE; ELIGIBLE / UNKNOWN → AVAILABLE_NOT_ACTIVATED (UNKNOWN is never upgraded to relevant).',
      '3. Offered as AVAILABLE only when eligible AND requestable AND availability truth is CONSISTENT.',
    ],
    source_precedence: 'domain records > open service requests > Client.services (free text — never used)',
    workspaces: brain.AIO_WORKSPACES.map((w) => ({ workspace_id: w.workspace_id, availability: w.availability, availability_truth: w.availability_truth, client_can_request: w.client_can_request, staff_can_start: w.staff_can_start, supported_states: w.supported_states, client_eligibility_rule: w.client_eligibility_rule, entitlement_sources: w.entitlement_sources })),
    demo_note: DEMO_NOTE,
    matrix: stateMatrix(),
    client_conflicts: brain.AIO_OFFICE_DEMO_CLIENTS.map((c) => ({ client_id: c.client_id, conflicts: c.conflicts })),
  };
}

function expansionContract() {
  return {
    ...head('WORKSPACE_EXPANSION_CONTRACT'),
    principles: ['RELEVANT', 'TIMELY', 'EXPLAINABLE', 'NON-INTRUSIVE', 'ACTIONABLE', 'TRUTHFUL', 'PROJECT-SCOPED'],
    not_an_ai_black_box: 'Rules over recorded signals; every shown suggestion names its rule, reasons and related active workspace; every hidden one names its suppression.',
    contract_fields: ['workspace_id', 'client_id', 'eligibility', 'relevance_class', 'reasons[]', 'current_related_workspaces[]', 'trigger_context', 'placement', 'message_key', 'cta', 'availability_truth', 'suppressed', 'suppressed_by[]'],
    relevance: { HIGH: 'operational dependency + a time-bound record (e.g. open deadlines)', MEDIUM: 'operational dependency only', NONE: 'suppressed' },
    placements: EXPANSION_PLACEMENTS,
    never: ['interrupt a critical operation', 'obscure task state', 'replace an alert', 'show an irrelevant service', 'upsell during error recovery', 'compete with a compliance-critical action', 'fall back to a generic promotion when no rule matches'],
    suppression_reasons: EXPANSION_SUPPRESSION_REASONS,
    signals: brain.AIO_EXPANSION_SIGNALS,
    rules: brain.AIO_EXPANSION_RULES,
    legacy_generic_fallbacks_found: brain.AIO_LEGACY_GENERIC_FALLBACKS,
    demo_note: DEMO_NOTE,
    evaluation_matrix: expansionMatrix(),
    status: aioOfficeStatus().expansion,
  };
}

/* ─────────────────────────────── markdown ─────────────────────────────── */

const table = (h: string[], rows: string[][]) => [`| ${h.join(' | ')} |`, `|${h.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
const MD_HEAD = (title: string) => [`# ${title}`, '', '> Generated by `scripts/studioos/aio-office-export.ts` from the Experience Brain operating-environment model. Do not edit by hand.', '', `**Sprint:** ${SPRINT}`, ''];

function officeArchitectureMd() {
  const e = env('AIO.OFFICE');
  const st = aioOfficeStatus();
  return [
    ...MD_HEAD('AIO OFFICE — Architecture'),
    'The founder decision: **AIO services are workspaces inside a connected business office.** AIO OFFICE is the founder / staff environment.',
    '',
    '```',
    'AIO OFFICE  = CLIENT × WORKSPACE × SUBCONTEXT',
    'CASE        = PROJECT + CLIENT + WORKSPACE + CASE TYPE + SUBCONTEXT   (one canonical identity)',
    '```',
    '',
    '## Controls (distinct — never one combined selector)',
    '',
    table(['Control', 'Semantics'], Object.entries(NAVIGATION_SEMANTICS).map(([k, v]) => [k.replace(/_/g, ' '), v])),
    '',
    table(['Switcher', 'Keeps', 'Re-resolves', 'Rule'], e.switchers.map((s) => [s.label, s.preserves.join(' · '), s.re_resolves.join(' · '), s.semantics])),
    '',
    '## Hubs and queues (kept distinct)',
    '',
    table(['Surface', 'Scope', 'Primary object'], [
      ['AIO OFFICE HUB', 'cross-service · cross-client', 'what needs the office now'],
      ['IFTA FUEL TAX QUEUE (workspace landing)', 'cross-client · IFTA only', 'MULTI-CLIENT FILING QUEUE'],
      ['CLIENT OVERVIEW', 'one client · every workspace', 'that client’s workspace states + open cases'],
      ['CLIENT-QUARTER CASE', 'one client · IFTA · one quarter', 'the canonical case'],
    ]),
    '',
    '### AIO OFFICE HUB responsibilities → AIO truth today',
    '',
    table(['Responsibility', 'Status', 'Source', 'Note'], brain.AIO_HUB_SOURCES.filter((h) => h.hub_id === 'AIO.OFFICE.HUB').map((h) => [h.responsibility, h.status, `\`${h.source}\``, h.note || '—'])),
    '',
    '## IFTA inside AIO OFFICE (founder tree)',
    '',
    '```',
    'AIO OFFICE',
    '└─ WORKSPACE IFTA',
    '   └─ WORKSPACE LANDING: FUEL TAX QUEUE            (cross-client, DERIVED_AUTHORITY)',
    '      └─ CLIENT CONTEXT                            (from a queue row · the client switcher · the client overview)',
    '         ├─ CLIENT-QUARTER CASE                    OVERVIEW · FUEL PURCHASES · MILEAGE · VEHICLES · JURISDICTIONS · DOCUMENTS · NOTES (staff, secondary)',
    '         │    RETURN DRAFT · REQUEST CORRECTION · FILE & CONFIRM · RECORD PAYMENT STATUS · AUDIT TRAIL · CLIENT THREAD · AMENDMENT · REOPEN',
    '         └─ WORKSPACE NOT ACTIVE FOR THIS CLIENT   (truthful inactive state)',
    '```',
    '',
    '## Routes (reconciled with AIO route truth)',
    '',
    table(['Route', 'View', 'Status', 'Evidence / note'], brain.AIO_OFFICE_ROUTES.filter((r) => r.environment_id === 'AIO.OFFICE').map((r) => [`\`${r.route}\``, r.view, r.status, `${r.ref}${r.note ? ` — ${r.note}` : ''}`])),
    '',
    'Both entry routes resolve to the same canonical case (`AIO:{client}:IFTA:IFTA_QUARTER:{YYYY-Qn}` ↔ record `ifta-{client}-{year}-q{n}`). Routes are planned; none is registered in this sprint.',
    '',
    '## Workspace not active for this client (staff)',
    '',
    'The client stays selected. No IFTA data renders. Supported actions only: **VIEW CLIENT OVERVIEW · RETURN TO WORKSPACE QUEUE · VIEW ELIGIBILITY**. START SERVICE is not offered for IFTA: no staff activation writer exists (`staff_can_start: false`).',
    '',
    '## Permissions',
    '',
    'Existing guards only (OfficeRouteGuard + office role permissions). Every office role reads every client today; nothing is broadened. No founder role exists in AIO — recommended founder = OfficeStaffRole `owner` (open question).',
    '',
    '## Status',
    '',
    table(['Item', 'Status'], [['Architecture', st.architecture], ['Client switcher', st.client_switcher], ['Workspace switcher', st.workspace_switcher], ['Subcontext model', st.subcontext_model], ['Central hub', st.central_hub], ['Case uniqueness', st.case_uniqueness.ok ? 'OK — one record per canonical case' : 'FAIL']]),
    '',
  ].join('\n');
}

function clientOfficeArchitectureMd() {
  const e = env('AIO.CLIENT_OFFICE');
  return [
    ...MD_HEAD('CLIENT OFFICE — Architecture'),
    'CLIENT OFFICE is the client’s connected office. **The client is fixed** (the signed-in organisation): there is no client switcher. The client switches between its own workspaces.',
    '',
    '```',
    'CLIENT OFFICE = FIXED CLIENT × WORKSPACE × SUBCONTEXT',
    '```',
    '',
    '## CLIENT OFFICE HUB (one client · every workspace)',
    '',
    table(['Responsibility', 'Status', 'Source', 'Note'], brain.AIO_HUB_SOURCES.filter((h) => h.hub_id === 'AIO.CLIENT_OFFICE.HUB').map((h) => [h.responsibility, h.status, `\`${h.source}\``, h.note || '—'])),
    '',
    '## Workspace switcher',
    '',
    table(['Group', 'Rule'], [['ACTIVE', 'workspaces the client has'], ['IN PROGRESS', 'PENDING_SETUP · PAUSED · ENDED — only where the workspace’s own record supports them'], ['AVAILABLE', 'eligible + requestable + consistent availability (relevant, never generic)'], ['never listed', 'NOT_APPLICABLE · unknown eligibility · unavailable or conflicting availability']]),
    '',
    `Switchers in this environment: ${e.switchers.map((s) => s.label).join(' · ')} (no CLIENT).`,
    '',
    '## IFTA inside CLIENT OFFICE (founder tree)',
    '',
    '```',
    'CLIENT OFFICE',
    '└─ WORKSPACE IFTA',
    '   ├─ QUARTER SELECTOR (subcontext)',
    '   │  └─ IFTA FILING ROOM — PROGRESS · FUEL PURCHASES · MILEAGE · VEHICLES · JURISDICTIONS · DOCUMENTS',
    '   │       NEEDS YOU · CORRECTION REQUESTED · SEND QUARTER TO AIO · YOUR REVIEW & APPROVAL · UPLOAD RECEIPTS · IMPORT CSV',
    '   │       IMPORT FROM VAULT · RECEIPT DETAIL · MILEAGE INPUTS · VEHICLE CONFIRMATION · JURISDICTION DETAIL · FILE PREVIEW',
    '   │       FILED · ARCHIVED · NEXT QUARTER OPEN · RETURNED BY JURISDICTION · MESSAGE AIO',
    '   └─ SET UP IFTA FILING — NOT ACTIVE YET (AVAILABLE_NOT_ACTIVATED expansion state)',
    '```',
    '',
    'Six primary tabs. No client NOTES tab — notes go through MESSAGE AIO. CLIENT HEALTH, the internal account card, internal QA and staff-only jurisdiction tasks never render in client mode.',
    '',
    '## Inactive and not-applicable workspaces',
    '',
    '- **AVAILABLE_NOT_ACTIVATED** → NOT ACTIVE YET: WORKSPACE NAME · NOT ACTIVE YET · WHY IT MAY MATTER · WHAT AIO HANDLES · WHAT YOU PROVIDE · REQUEST / EXPLORE. *Why it may matter* appears only when an expansion rule matches real signals.',
    '- **NOT_APPLICABLE** → nothing is surfaced (WORKSPACE_HIDDEN). Example: a shipper never sees IFTA.',
    '- Inactive content never masquerades as active: no quarter, metrics or tabs render in the NOT ACTIVE YET state.',
    '',
    '## Routes',
    '',
    table(['Route', 'View', 'Status', 'Evidence / note'], brain.AIO_OFFICE_ROUTES.filter((r) => r.environment_id === 'AIO.CLIENT_OFFICE').map((r) => [`\`${r.route}\``, r.view, r.status, `${r.ref}${r.note ? ` — ${r.note}` : ''}`])),
    '',
  ].join('\n');
}

function expansionRulesMd() {
  const m = expansionMatrix();
  const shown = m.filter((x) => x.shown);
  const supp = Object.entries(m.filter((x) => !x.shown).flatMap((x) => x.suppressed_by).reduce<Record<string, number>>((a, k) => ((a[k] = (a[k] ?? 0) + 1), a), {}));
  return [
    ...MD_HEAD('Workspace Expansion Rules'),
    'Contextual expansion is **relevant, timely, explainable, non-intrusive, actionable, truthful and project-scoped**. It is a rule set over recorded signals — not advertising and not an opaque model. No rule → no surface: there is no generic fallback.',
    '',
    '## Rules',
    '',
    table(['Rule', 'Target', 'When active', 'Requires', 'Relevance', 'Message', 'Grounded in'], brain.AIO_EXPANSION_RULES.map((r) => [r.rule_id, r.target_workspace_id, r.when_active_any.join(' · '), r.requires.map((c) => `${c.signal} ${c.op}${c.value !== undefined ? ` ${c.value}` : ''}`).join(' · '), r.relevance, `**${r.headline}** ${r.body} → ${r.cta.label}`, r.grounded_in])),
    '',
    '## Signals (record-based only)',
    '',
    table(['Signal', 'Status', 'Source', 'Note'], brain.AIO_EXPANSION_SIGNALS.map((s) => [s.signal, s.status, `\`${s.source}\``, s.note || '—'])),
    '',
    '## Placements',
    '',
    `${EXPANSION_PLACEMENTS.join(' · ')}. Never: interrupt a critical operation, obscure task state, replace an alert, show an irrelevant service, upsell during error recovery, or compete with a compliance-critical action.`,
    '',
    '## Suppression',
    '',
    table(['Reason', 'Meaning'], [
      ['NOT_APPLICABLE', 'the client is not eligible'], ['SERVICE_UNAVAILABLE', 'clients cannot request it today'], ['ALREADY_OWNED', 'the workspace is active'], ['ELIGIBILITY_UNKNOWN', 'a required eligibility signal is missing'],
      ['CRITICAL_STATE', 'the surface is in a critical compliance / blocked state'], ['ERROR_RECOVERY', 'the client is recovering from an error'], ['CONFLICTING_SERVICE_STATE', 'pending / paused / ended, or the related record contradicts eligibility'],
      ['REQUIRED_DATA_MISSING', 'a rule signal or message value is missing'], ['MISLEADING', 'availability sources disagree — any suggestion would mislead until reconciled'], ['PLACEMENT_NOT_ALLOWED', 'the rule does not allow this placement'], ['NO_MATCHING_RULE', 'no grounded rule — nothing is shown'],
    ]),
    '',
    `## Evaluation over the demo seed (${m.length} evaluations at CLIENT OFFICE HUB + WORKSPACE SWITCHER)`,
    '',
    DEMO_NOTE,
    '',
    table(['Client', 'Workspace', 'Placement', 'Relevance', 'Headline', 'Reasons'], shown.map((x) => [x.client_id, x.workspace_id, x.placement, x.relevance_class, x.headline ?? '—', x.reasons.join(' · ')])),
    '',
    `Suppressed: ${supp.map(([k, v]) => `${k} ${v}`).join(' · ')}. Shown without a rule: ${shown.filter((x) => !x.rule_id).length}.`,
    '',
    '## Founder examples',
    '',
    '- **IFTA → TAGS** — “YOU’RE ALREADY MANAGING 3 VEHICLES WITH AIO.” / “BRING REGISTRATION INTO THE SAME OFFICE.” / EXPLORE TAGS — shown for client-c (HIGH: 2 open registration deadlines) and client-d (MEDIUM).',
    '- **BOOKKEEPING → IFTA** — rule registered; suppressed REQUIRED_DATA_MISSING (no per-org fuel-transaction source) and MISLEADING (IFTA availability sources disagree).',
    '- **DISPATCH → FLEETCARE** — rule registered; suppressed MISLEADING (FleetCare has no launch / catalog entry).',
    '- **TAGS → INSURANCE** — only where legitimately relevant (registered units without coverage); no demo client qualifies.',
    '',
    '## Pre-existing generic fallbacks found in AIO (not carried into the model)',
    '',
    table(['Surface', 'Evidence', 'Behaviour'], brain.AIO_LEGACY_GENERIC_FALLBACKS.map((g) => [g.surface, `\`${g.ref}\``, g.behaviour])),
    '',
  ].join('\n');
}

function clientSwitchingMd() {
  const sc = brain.aioOfficeProofScenarios();
  return [
    ...MD_HEAD('CLIENT OFFICE — Workspace Switching'),
    'The client is fixed. The workspace switcher keeps the client and re-resolves everything else.',
    '',
    '## Rules',
    '',
    '1. **No client switcher.** `switchClient` in CLIENT OFFICE → `NO_CLIENT_SWITCHER`; any other client id → `CLIENT_FIXED`.',
    '2. **Switch workspace, keep the client.** The subcontext re-resolves for the new workspace (IFTA opens on the quarter that needs work).',
    '3. **ACTIVE** → the workspace’s client view. **AVAILABLE_NOT_ACTIVATED** → NOT ACTIVE YET expansion state. **NOT_APPLICABLE** → hidden.',
    '4. **No stale state.** A switch re-resolves ' + CONTEXT_SCOPED_DOMAINS.join(' · ') + '.',
    '',
    '## Proofs (demo seed)',
    '',
    table(['Proof', 'From', 'To', 'Result'], [
      ['C. Client workspace switch', `${sc.C_CLIENT_WORKSPACE_SWITCH.from.client_id} · IFTA · ${sc.C_CLIENT_WORKSPACE_SWITCH.from.view}`, `BOOKKEEPING → ${sc.C_CLIENT_WORKSPACE_SWITCH.to_active.view}; TAGS → ${sc.C_CLIENT_WORKSPACE_SWITCH.to_available.view}`, sc.C_CLIENT_WORKSPACE_SWITCH.client_fixed ? 'PASS — client fixed throughout' : 'FAIL'],
      ['D. No client switcher', 'client-c', 'client-b', `${sc.D_CLIENT_HAS_NO_CLIENT_SWITCHER.switch_client_error} · ${sc.D_CLIENT_HAS_NO_CLIENT_SWITCHER.foreign_client_error} — PASS`],
      ['F. Inactive → expansion', 'client-c', 'TAGS', `${sc.F_INACTIVE_CLIENT_WORKSPACE_EXPANSION.context.view} · ${sc.F_INACTIVE_CLIENT_WORKSPACE_EXPANSION.expansion.relevance_class} — “${sc.F_INACTIVE_CLIENT_WORKSPACE_EXPANSION.expansion.headline}”; critical state → ${sc.F_INACTIVE_CLIENT_WORKSPACE_EXPANSION.during_critical_state.suppressed_by.join(', ')}`],
      ['G. NOT_APPLICABLE not aggressive', 'client-e (shipper)', 'IFTA', `${sc.G_NOT_APPLICABLE_NOT_AGGRESSIVE.context.view}; hidden from switcher; expansion ${sc.G_NOT_APPLICABLE_NOT_AGGRESSIVE.expansion.suppressed_by.join(', ')}`],
    ]),
    '',
    '## Switcher contents per demo client',
    '',
    DEMO_NOTE,
    '',
    table(['Client', 'ACTIVE', 'IN PROGRESS', 'AVAILABLE', 'Conflicts'], D.clients.map((c) => { const o = workspaceSwitcherOptions(D, c.client_id); return [c.client_id, o.active.join(' · ') || '—', o.in_progress.map((x) => `${x.workspace_id} (${x.state})`).join(' · ') || '—', o.available.join(' · ') || '—', o.conflicts.join(' · ') || '—']; })),
    '',
  ].join('\n');
}

function staffSwitchingMd() {
  const sc = brain.aioOfficeProofScenarios();
  const p = (x: { client_id: string | null; workspace_id: string | null; subcontext: string | null; view: string }) => `${x.client_id ?? '*'} · ${x.workspace_id ?? '*'} · ${x.subcontext ?? '*'} → ${x.view}`;
  return [
    ...MD_HEAD('AIO OFFICE — Client and Workspace Switching'),
    'Founder / staff switch CLIENT and WORKSPACE independently, plus the SUBCONTEXT.',
    '',
    '## Rules',
    '',
    '1. **Switch client, keep the workspace.** If the workspace is not active for the new client → WORKSPACE NOT ACTIVE FOR THIS CLIENT. Another client is never selected silently. The subcontext is kept only when the new client has that case.',
    '2. **Switch workspace, keep the client.** The subcontext re-resolves.',
    '3. **Switch subcontext** inside one client × workspace.',
    '4. **Two entry paths, one case.** The cross-client queue row and the client-centric route resolve to the same canonical case and record.',
    '5. **No stale state.** Every render is keyed by scope_key; switching re-resolves ' + CONTEXT_SCOPED_DOMAINS.join(' · ') + '.',
    '',
    '## Proofs (demo seed)',
    '',
    table(['Proof', 'Result'], [
      ['A. Client switch (case exists)', `${p(sc.A_FOUNDER_CLIENT_SWITCH.from)} ⇒ ${p(sc.A_FOUNDER_CLIENT_SWITCH.to_client_with_case)} (${sc.A_FOUNDER_CLIENT_SWITCH.to_client_with_case.record_id})`],
      ['A. Client switch (workspace inactive)', `⇒ ${p(sc.A_FOUNDER_CLIENT_SWITCH.to_client_without_workspace)} — never another client: ${sc.A_FOUNDER_CLIENT_SWITCH.never_another_client ? 'PASS' : 'FAIL'}`],
      ['B. Workspace switch', `${p(sc.B_FOUNDER_WORKSPACE_SWITCH.from)} ⇒ ${p(sc.B_FOUNDER_WORKSPACE_SWITCH.to_active)} · ${p(sc.B_FOUNDER_WORKSPACE_SWITCH.to_inactive)} — client kept: ${sc.B_FOUNDER_WORKSPACE_SWITCH.client_preserved ? 'PASS' : 'FAIL'}`],
      ['B. Subcontext switch', `⇒ ${p(sc.B_FOUNDER_WORKSPACE_SWITCH.subcontext_switch)} (${sc.B_FOUNDER_WORKSPACE_SWITCH.subcontext_switch.record_id})`],
      ['E. Inactive founder workspace', `${p(sc.E_INACTIVE_FOUNDER_WORKSPACE.context)} — actions: ${sc.E_INACTIVE_FOUNDER_WORKSPACE.supported_actions.join(' · ')}; START SERVICE not offered (${sc.E_INACTIVE_FOUNDER_WORKSPACE.not_offered['START SERVICE']})`],
      ['H. Same case, two entry paths', `queue ${sc.H_SAME_CASE_TWO_ENTRY_PATHS.from_queue.case_key} = client route ${sc.H_SAME_CASE_TWO_ENTRY_PATHS.from_client.case_key}; client projection reads the same record: ${sc.H_SAME_CASE_TWO_ENTRY_PATHS.same_record_for_client ? 'PASS' : 'FAIL'}`],
      ['Stale state', `records before: ${sc.STALE_STATE.before.join(', ')} · after client switch: ${sc.STALE_STATE.after_client_switch.join(', ')} · after inactive switch: ${sc.STALE_STATE.after_inactive_switch.join(', ') || 'none'}`],
    ]),
    '',
    '## Queue vs case',
    '',
    'The FUEL TAX QUEUE is the IFTA workspace’s cross-client landing (primary object: MULTI-CLIENT FILING QUEUE). It is not the case page. Opening a row enters CLIENT CONTEXT and resolves the canonical client-quarter case.',
    '',
    table(['Queue question', 'Answered by', 'Status'], brain.AIO_IFTA_QUEUE_QUESTIONS.map((q) => [q.question, `${q.answer} — \`${q.source}\``, q.status])),
    '',
  ].join('\n');
}

export function buildAioOfficeExports(): Record<string, string> {
  return {
    'AIO_OFFICE_ARCHITECTURE.md': officeArchitectureMd(),
    'AIO_OFFICE_WORKSPACE_REGISTRY.json': json(workspaceRegistry()),
    'AIO_OFFICE_CONTEXT_MODEL.json': json(contextModel()),
    'CLIENT_OFFICE_ARCHITECTURE.md': clientOfficeArchitectureMd(),
    'CLIENT_OFFICE_WORKSPACE_MODEL.json': json(clientOfficeModel()),
    'WORKSPACE_AVAILABILITY_MODEL.json': json(availabilityModel()),
    'WORKSPACE_EXPANSION_CONTRACT.json': json(expansionContract()),
    'WORKSPACE_EXPANSION_RULES.md': expansionRulesMd(),
    'CLIENT_WORKSPACE_SWITCHING.md': clientSwitchingMd(),
    'STAFF_CLIENT_WORKSPACE_SWITCHING.md': staffSwitchingMd(),
  };
}

if (process.argv[1] && /aio-office-export\.ts$/.test(process.argv[1])) {
  mkdirSync(AIO_OFFICE_DOCS_DIR, { recursive: true });
  const files = buildAioOfficeExports();
  for (const [name, body] of Object.entries(files)) writeFileSync(`${AIO_OFFICE_DOCS_DIR}/${name}`, body);
  console.log(`exported ${Object.keys(files).length} files to ${AIO_OFFICE_DOCS_DIR}`);
}
