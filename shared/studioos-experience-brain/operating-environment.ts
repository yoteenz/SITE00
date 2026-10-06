/**
 * Operating environments, workspaces and context — the layer ABOVE feature experience contracts.
 *
 * A project's services are WORKSPACES inside an OPERATING ENVIRONMENT (an internal office, a client office, a public
 * site). Context is the tuple
 *
 *   INTERNAL office : CLIENT × WORKSPACE × SUBCONTEXT   (client and workspace switch independently)
 *   CLIENT office   : FIXED CLIENT × WORKSPACE × SUBCONTEXT   (no client switcher)
 *
 * A CASE is one service instance: PROJECT + CLIENT + WORKSPACE + CASE TYPE + SUBCONTEXT. Every actor projection and
 * every entry path resolves to the same canonical case — never a second record.
 *
 * Contextual expansion is an explainable relevance contract (rules over real signals), never generic advertising.
 * Pure functions over data; projects supply environments, workspaces, clients, cases and rules.
 */
import type { ExperienceActor } from './schema.js';

/* ─────────────────────────────── environments + switchers ─────────────────────────────── */

export type OperatingEnvironmentKind = 'INTERNAL_OFFICE' | 'CLIENT_OFFICE' | 'PUBLIC_SITE';
export type ContextDimension = 'CLIENT' | 'WORKSPACE' | 'SUBCONTEXT';
export type ContextControl = 'SWITCHABLE' | 'FIXED' | 'NONE';

export type SwitcherContract = {
  switcher_id: string;
  dimension: ContextDimension;
  label: string;
  /** What the switch keeps (where possible) and what it re-resolves. */
  preserves: ContextDimension[];
  re_resolves: ContextDimension[];
  semantics: string;
};

export type EnvironmentHub = {
  hub_id: string;
  name: string;
  scope: 'CROSS_CLIENT_CROSS_WORKSPACE' | 'ONE_CLIENT_CROSS_WORKSPACE';
  responsibilities: string[];
  /** Experience contract that already describes this hub (if any). */
  feature_ref: string | null;
};

export type OperatingEnvironment = {
  environment_id: string;
  name: string;
  kind: OperatingEnvironmentKind;
  actor: ExperienceActor;
  client: ContextControl;
  workspace: ContextControl;
  subcontext: ContextControl;
  hub: EnvironmentHub | null;
  /** What a workspace opens on when no client / case is chosen. */
  workspace_landing: 'CROSS_CLIENT_QUEUE' | 'CLIENT_WORKSPACE' | 'SERVICE_PAGE';
  switchers: SwitcherContract[];
  route_root: string;
};

/** Global navigation, workspace switcher, client switcher and subcontext selector are different controls. */
export const NAVIGATION_SEMANTICS = {
  GLOBAL_NAVIGATION: 'Moves between broad areas of the environment (hub, inbox, documents, account). Never changes client or workspace context by itself.',
  WORKSPACE_SWITCHER: 'Changes the active service workspace. Keeps the client.',
  CLIENT_SWITCHER: 'Changes the client (internal office only). Keeps the workspace.',
  SUBCONTEXT_SELECTOR: 'Changes the subcontext (quarter, policy, registration year, filing cycle …) inside one client × workspace.',
} as const;

/* ─────────────────────────────── workspaces ─────────────────────────────── */

/** Required states; the optional ones are used only when a workspace declares source data that supports them. */
export const REQUIRED_WORKSPACE_STATES = ['ACTIVE', 'AVAILABLE_NOT_ACTIVATED', 'NOT_APPLICABLE'] as const;
export const OPTIONAL_WORKSPACE_STATES = ['PENDING_SETUP', 'PAUSED', 'IN_REVIEW', 'ENDED', 'BLOCKED'] as const;
export type WorkspaceState = (typeof REQUIRED_WORKSPACE_STATES)[number] | (typeof OPTIONAL_WORKSPACE_STATES)[number];

export type SignalValue = number | boolean | string | string[] | null;
export type ClientSignals = Record<string, SignalValue>;
export type SignalCondition = { signal: string; op: 'gte' | 'eq' | 'includes' | 'truthy'; value?: number | boolean | string };

export type EligibilityRule =
  | { kind: 'ALL_CLIENTS'; explanation: string }
  | { kind: 'SIGNALS'; match: 'ALL' | 'ANY'; conditions: SignalCondition[]; explanation: string };

export type EntitlementSource = { source: string; field: string; ref: string; status: 'EXISTING' | 'PARTIAL' | 'MISSING' | 'CONFLICT'; note: string };

export type ExpansionPlacement =
  | 'WORKSPACE_SWITCHER_AVAILABLE'
  | 'EMPTY_STATE'
  | 'INSIGHT_MODULE'
  | 'WORKFLOW_BOUNDARY'
  | 'CLIENT_OFFICE_HUB'
  | 'AFTER_RELATED_COMPLETION'
  /** First office view after a client confirms activation — never inside the review steps. */
  | 'AFTER_ACTIVATION';
export const EXPANSION_PLACEMENTS: readonly ExpansionPlacement[] = ['WORKSPACE_SWITCHER_AVAILABLE', 'EMPTY_STATE', 'INSIGHT_MODULE', 'WORKFLOW_BOUNDARY', 'CLIENT_OFFICE_HUB', 'AFTER_RELATED_COMPLETION', 'AFTER_ACTIVATION'];

export type ExpansionRule = {
  rule_id: string;
  target_workspace_id: string;
  /** The client must already have at least one of these workspaces ACTIVE (the operational relationship). */
  when_active_any: string[];
  requires: SignalCondition[];
  relevance: 'HIGH' | 'MEDIUM';
  /** Explanation lines (templates with {signal} placeholders) — why this is relevant. */
  reasons: string[];
  message_key: string;
  headline: string;
  body: string;
  cta: { label: string; action: string };
  placements: ExpansionPlacement[];
  /** Grounding: the relationship / dependency this rule follows. */
  grounded_in: string;
};

export type WorkspaceDefinition = {
  workspace_id: string;
  name: string;
  category: string;
  /** Launch / catalog availability as the project's source truth states it. */
  availability: string;
  /** CONFLICT when the project's availability sources disagree — any suggestion would mislead until they are reconciled. */
  availability_truth: 'CONSISTENT' | 'CONFLICT';
  /** Can a client request it today (truthful request model)? */
  client_can_request: boolean;
  /** Can staff start the service for a client today (a real writer exists)? */
  staff_can_start: boolean;
  feature_refs: string[];
  client_eligibility_rule: EligibilityRule;
  founder_route: string | null;
  client_route: string | null;
  active_case_types: string[];
  subcontext_types: string[];
  required_permissions: string[];
  shared_dependencies: string[];
  adjacent_workspaces: string[];
  expansion_rules: ExpansionRule[];
  /** States this workspace can truthfully report (always ⊇ the required three). */
  supported_states: WorkspaceState[];
  entitlement_sources: EntitlementSource[];
  /** Architecture maturity inside the experience system. */
  workspace_state: 'TREE_PROVEN' | 'CONTRACT_ONLY' | 'REGISTERED';
  capabilities: string[];
};

/* ─────────────────────────────── clients + cases ─────────────────────────────── */

export type ClientRecord = {
  client_id: string;
  name: string;
  /** Entitlement truth per workspace (only what a source states; absent = no entitlement record). */
  entitlements: Record<string, { state: WorkspaceState; source: string }>;
  signals: ClientSignals;
};

export type CaseIdentity = { project_id: string; client_id: string; workspace_id: string; case_type: string; subcontext: string };

export type CaseRecord = {
  /** The single canonical key (see canonicalCaseKey). */
  case_key: string;
  identity: CaseIdentity;
  /** The project's record id for the same business case (one record, many projections). */
  record_id: string;
  status: string;
};

export const canonicalCaseKey = (i: CaseIdentity): string => [i.project_id, i.client_id, i.workspace_id, i.case_type, i.subcontext].join(':');

export type CaseUniqueness = { ok: boolean; duplicates: { case_key: string; record_ids: string[] }[]; mismatched: { case_key: string; record_id: string }[] };

/** One business case = one canonical identity = one record. Two records for one identity (e.g. a "client copy" and a "staff copy") is a violation. */
export function checkCaseUniqueness(cases: CaseRecord[]): CaseUniqueness {
  const by = new Map<string, string[]>();
  const mismatched: CaseUniqueness['mismatched'] = [];
  for (const c of cases) {
    if (canonicalCaseKey(c.identity) !== c.case_key) mismatched.push({ case_key: c.case_key, record_id: c.record_id });
    by.set(c.case_key, [...(by.get(c.case_key) ?? []), c.record_id]);
  }
  const duplicates = [...by.entries()].filter(([, ids]) => ids.length > 1).map(([case_key, record_ids]) => ({ case_key, record_ids }));
  return { ok: !duplicates.length && !mismatched.length, duplicates, mismatched };
}

/* ─────────────────────────────── signals + eligibility ─────────────────────────────── */

const known = (v: SignalValue | undefined) => v !== undefined && v !== null;

export function evaluateCondition(c: SignalCondition, signals: ClientSignals): boolean | null {
  const v = signals[c.signal];
  if (!known(v)) return null;
  switch (c.op) {
    case 'gte': return typeof v === 'number' && typeof c.value === 'number' ? v >= c.value : null;
    case 'eq': return v === c.value;
    case 'includes': return Array.isArray(v) ? v.includes(String(c.value)) : null;
    case 'truthy': return Boolean(v);
  }
}

export type Eligibility = { eligibility: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'UNKNOWN'; reasons: string[] };

export function evaluateEligibility(rule: EligibilityRule, signals: ClientSignals): Eligibility {
  if (rule.kind === 'ALL_CLIENTS') return { eligibility: 'ELIGIBLE', reasons: [rule.explanation] };
  const results = rule.conditions.map((c) => evaluateCondition(c, signals));
  if (rule.match === 'ALL') {
    if (results.some((r) => r === false)) return { eligibility: 'NOT_ELIGIBLE', reasons: [rule.explanation] };
    if (results.some((r) => r === null)) return { eligibility: 'UNKNOWN', reasons: [`signal unknown: ${rule.conditions.filter((_, i) => results[i] === null).map((c) => c.signal).join(', ')}`] };
    return { eligibility: 'ELIGIBLE', reasons: [rule.explanation] };
  }
  if (results.some((r) => r === true)) return { eligibility: 'ELIGIBLE', reasons: [rule.explanation] };
  if (results.every((r) => r === false)) return { eligibility: 'NOT_ELIGIBLE', reasons: [rule.explanation] };
  return { eligibility: 'UNKNOWN', reasons: ['signal unknown'] };
}

/* ─────────────────────────────── workspace state ─────────────────────────────── */

export type WorkspaceResolution = {
  workspace_id: string;
  client_id: string;
  state: WorkspaceState;
  eligibility: Eligibility['eligibility'];
  source: string;
  reasons: string[];
  /** The entitlement record contradicts the eligibility rule (e.g. an active carrier service on a shipper) — reported, never used to ground a suggestion. */
  conflict: boolean;
};

/**
 * Entitlement truth first (only states the workspace declares it can support); otherwise eligibility decides between
 * AVAILABLE_NOT_ACTIVATED and NOT_APPLICABLE. Unknown eligibility is never upgraded to “relevant”: it stays
 * AVAILABLE_NOT_ACTIVATED with eligibility UNKNOWN (and expansion is suppressed).
 */
export function resolveWorkspaceState(ws: WorkspaceDefinition, client: ClientRecord): WorkspaceResolution {
  const ent = client.entitlements[ws.workspace_id];
  const elig = evaluateEligibility(ws.client_eligibility_rule, client.signals);
  if (ent && ws.supported_states.includes(ent.state)) {
    const conflict = elig.eligibility === 'NOT_ELIGIBLE';
    return { workspace_id: ws.workspace_id, client_id: client.client_id, state: ent.state, eligibility: elig.eligibility, source: ent.source, reasons: [`entitlement: ${ent.source}`, ...(conflict ? [`conflicts with eligibility: ${elig.reasons.join('; ')}`] : [])], conflict };
  }
  if (elig.eligibility === 'NOT_ELIGIBLE') return { workspace_id: ws.workspace_id, client_id: client.client_id, state: 'NOT_APPLICABLE', eligibility: elig.eligibility, source: 'eligibility rule', reasons: elig.reasons, conflict: false };
  return { workspace_id: ws.workspace_id, client_id: client.client_id, state: 'AVAILABLE_NOT_ACTIVATED', eligibility: elig.eligibility, source: 'eligibility rule', reasons: elig.reasons, conflict: false };
}

/* ─────────────────────────────── contextual expansion ─────────────────────────────── */

export const EXPANSION_SUPPRESSION_REASONS = [
  'NOT_APPLICABLE',
  'SERVICE_UNAVAILABLE',
  'ALREADY_OWNED',
  'ELIGIBILITY_UNKNOWN',
  'CRITICAL_STATE',
  'ERROR_RECOVERY',
  'CONFLICTING_SERVICE_STATE',
  'REQUIRED_DATA_MISSING',
  'MISLEADING',
  'PLACEMENT_NOT_ALLOWED',
  'NO_MATCHING_RULE',
] as const;
export type ExpansionSuppression = (typeof EXPANSION_SUPPRESSION_REASONS)[number];

export type ExpansionTrigger = {
  placement: ExpansionPlacement;
  /** The workspace the client is in when the surface renders (null on the hub). */
  current_workspace_id: string | null;
  /** True while the client is in a critical compliance / blocked state that expansion would distract from. */
  critical_state: boolean;
  /** True while the client is recovering from an error. */
  error_recovery: boolean;
};

export type ExpansionEvaluation = {
  workspace_id: string;
  client_id: string;
  eligibility: Eligibility['eligibility'];
  relevance_class: 'HIGH' | 'MEDIUM' | 'NONE';
  reasons: string[];
  current_related_workspaces: string[];
  trigger_context: ExpansionTrigger;
  placement: ExpansionPlacement;
  rule_id: string | null;
  message_key: string | null;
  headline: string | null;
  body: string | null;
  cta: { label: string; action: string } | null;
  availability_truth: string;
  suppressed: boolean;
  suppressed_by: ExpansionSuppression[];
};

const fill = (t: string, s: ClientSignals): string | null => {
  let missing = false;
  const out = t.replace(/\{([a-z_]+)\}/g, (_, k: string) => { const v = s[k]; if (!known(v)) { missing = true; return ''; } return Array.isArray(v) ? v.join(', ') : String(v); });
  return missing ? null : out;
};

/**
 * Evaluate one inactive workspace for one client at one placement. Explainable: a rule must match real signals and an
 * active related workspace; every suppression is named. No rule → no surface (there is no generic-promo fallback).
 */
export function evaluateExpansion(target: WorkspaceDefinition, client: ClientRecord, all: WorkspaceDefinition[], trigger: ExpansionTrigger, opts: { conflicting_states?: WorkspaceState[] } = {}): ExpansionEvaluation {
  const resolution = resolveWorkspaceState(target, client);
  const related = all.map((w) => resolveWorkspaceState(w, client)).filter((r) => r.state === 'ACTIVE');
  // Only clean ACTIVE workspaces ground a suggestion; an ACTIVE record that contradicts eligibility is conflicting truth.
  const activeIds = related.filter((r) => !r.conflict).map((r) => r.workspace_id);
  const conflictedIds = related.filter((r) => r.conflict).map((r) => r.workspace_id);
  const base: ExpansionEvaluation = {
    workspace_id: target.workspace_id, client_id: client.client_id, eligibility: resolution.eligibility, relevance_class: 'NONE', reasons: [],
    current_related_workspaces: [], trigger_context: trigger, placement: trigger.placement, rule_id: null, message_key: null, headline: null, body: null, cta: null,
    availability_truth: `${target.availability}${target.client_can_request ? ' · request / quote' : ' · not requestable by clients'}`,
    suppressed: true, suppressed_by: [],
  };
  const sup: ExpansionSuppression[] = [];
  if (resolution.state === 'ACTIVE') sup.push('ALREADY_OWNED');
  if (resolution.state === 'NOT_APPLICABLE') sup.push('NOT_APPLICABLE');
  if (resolution.state !== 'ACTIVE' && resolution.state !== 'AVAILABLE_NOT_ACTIVATED' && resolution.state !== 'NOT_APPLICABLE') sup.push('CONFLICTING_SERVICE_STATE');
  if ((opts.conflicting_states ?? []).includes(resolution.state)) sup.push('CONFLICTING_SERVICE_STATE');
  if (resolution.eligibility === 'UNKNOWN') sup.push('ELIGIBILITY_UNKNOWN');
  if (!target.client_can_request) sup.push('SERVICE_UNAVAILABLE');
  if (target.availability_truth === 'CONFLICT') sup.push('MISLEADING');
  if (trigger.critical_state) sup.push('CRITICAL_STATE');
  if (trigger.error_recovery) sup.push('ERROR_RECOVERY');
  const rules = target.expansion_rules.filter((r) => r.when_active_any.some((w) => activeIds.includes(w)));
  if (!rules.length) sup.push(target.expansion_rules.some((r) => r.when_active_any.some((w) => conflictedIds.includes(w))) ? 'CONFLICTING_SERVICE_STATE' : 'NO_MATCHING_RULE');
  const placed = rules.filter((r) => r.placements.includes(trigger.placement));
  if (rules.length && !placed.length) sup.push('PLACEMENT_NOT_ALLOWED');
  const usable = placed.filter((r) => r.requires.every((c) => evaluateCondition(c, client.signals) === true));
  if (placed.length && !usable.length) sup.push(placed.some((r) => r.requires.some((c) => evaluateCondition(c, client.signals) === null)) ? 'REQUIRED_DATA_MISSING' : 'NO_MATCHING_RULE');
  const rule = usable.sort((a, b) => (a.relevance === b.relevance ? 0 : a.relevance === 'HIGH' ? -1 : 1))[0];
  let headline: string | null = null;
  let body: string | null = null;
  let reasons: string[] = [];
  if (rule) {
    headline = fill(rule.headline, client.signals);
    body = fill(rule.body, client.signals);
    reasons = rule.reasons.map((r) => fill(r, client.signals)).filter((x): x is string => x !== null);
    if (headline === null || body === null || reasons.length !== rule.reasons.length) sup.push('REQUIRED_DATA_MISSING');
  }
  const suppressed_by = [...new Set(sup)];
  if (suppressed_by.length || !rule) return { ...base, suppressed_by: suppressed_by.length ? suppressed_by : ['NO_MATCHING_RULE'] };
  return {
    ...base, relevance_class: rule.relevance, reasons, current_related_workspaces: rule.when_active_any.filter((w) => activeIds.includes(w)),
    rule_id: rule.rule_id, message_key: rule.message_key, headline, body, cta: rule.cta, suppressed: false, suppressed_by: [],
  };
}

/* ─────────────────────────────── context resolution + switching ─────────────────────────────── */

export type OfficeContext = { environment_id: string; client_id: string | null; workspace_id: string | null; subcontext: string | null };

export type ContextView = 'HUB' | 'WORKSPACE_LANDING' | 'CLIENT_OVERVIEW' | 'CLIENT_WORKSPACE' | 'CASE' | 'CASE_NOT_OPEN' | 'WORKSPACE_INACTIVE' | 'WORKSPACE_EXPANSION' | 'WORKSPACE_HIDDEN';

/** Everything that MUST re-resolve when context changes (no stale state). */
export const CONTEXT_SCOPED_DOMAINS = ['ACTIVE_CASE', 'TABS', 'COUNTS', 'ALERTS', 'TASKS', 'DOCUMENTS', 'MESSAGES', 'ACTIVITY', 'DEADLINES', 'AVAILABLE_ACTIONS', 'EXPANSION_SUGGESTIONS', 'PERMISSIONS', 'SUBCONTEXT_SELECTOR'] as const;

export type OfficeData = {
  project_id: string;
  environments: OperatingEnvironment[];
  workspaces: WorkspaceDefinition[];
  clients: ClientRecord[];
  cases: CaseRecord[];
  /** Case type a workspace opens by default (e.g. the quarterly filing). */
  defaultCaseType: (workspace_id: string) => string | null;
  /** Subcontext a workspace opens on for a client when none is chosen (e.g. the current open quarter). */
  defaultSubcontext: (workspace_id: string, client_id: string) => string | null;
  /** Internal access rule (role / assignment truth). Clients only ever see their own organisation. */
  internalCanAccess: (client_id: string) => boolean;
};

export type ResolvedContext = {
  environment_id: string;
  kind: OperatingEnvironmentKind;
  client_id: string | null;
  client_fixed: boolean;
  workspace_id: string | null;
  subcontext: string | null;
  view: ContextView;
  workspace_state: WorkspaceState | null;
  case_key: string | null;
  record_id: string | null;
  /** Everything rendered in this context is keyed by scope_key; a context change always yields a new key. */
  scope_key: string;
  re_resolves: readonly string[];
  switchers: { client: boolean; workspace: boolean; subcontext: boolean };
};

export class ContextError extends Error {
  constructor(public code: 'CLIENT_FIXED' | 'NO_CLIENT_SWITCHER' | 'UNKNOWN_ENVIRONMENT' | 'UNKNOWN_CLIENT' | 'UNKNOWN_WORKSPACE' | 'ACCESS_DENIED' | 'NO_CLIENT' | 'NO_WORKSPACE', message: string) { super(message); }
}

const envOf = (data: OfficeData, id: string) => {
  const e = data.environments.find((x) => x.environment_id === id);
  if (!e) throw new ContextError('UNKNOWN_ENVIRONMENT', id);
  return e;
};
const wsOf = (data: OfficeData, id: string) => {
  const w = data.workspaces.find((x) => x.workspace_id === id);
  if (!w) throw new ContextError('UNKNOWN_WORKSPACE', id);
  return w;
};
const clientOf = (data: OfficeData, id: string) => {
  const c = data.clients.find((x) => x.client_id === id);
  if (!c) throw new ContextError('UNKNOWN_CLIENT', id);
  return c;
};

/**
 * Resolve a context from scratch. Nothing is carried over from a previous context except what the caller passes in —
 * so a client switch can never retain the previous client's case, counts, documents or messages.
 */
export function resolveContext(data: OfficeData, ctx: OfficeContext, sessionClientId: string | null = null): ResolvedContext {
  const env = envOf(data, ctx.environment_id);
  const fixed = env.client === 'FIXED';
  if (fixed && (!sessionClientId || (ctx.client_id && ctx.client_id !== sessionClientId))) throw new ContextError('CLIENT_FIXED', 'client office context is the session organisation only');
  const client_id = fixed ? sessionClientId : ctx.client_id;
  if (!fixed && client_id && !data.internalCanAccess(client_id)) throw new ContextError('ACCESS_DENIED', client_id);
  const switchers = { client: env.client === 'SWITCHABLE', workspace: env.workspace === 'SWITCHABLE', subcontext: env.subcontext === 'SWITCHABLE' };
  const out = (view: ContextView, extra: Partial<ResolvedContext> = {}): ResolvedContext => {
    const r: ResolvedContext = {
      environment_id: env.environment_id, kind: env.kind, client_id: client_id ?? null, client_fixed: fixed, workspace_id: ctx.workspace_id, subcontext: null,
      view, workspace_state: null, case_key: null, record_id: null, scope_key: '', re_resolves: CONTEXT_SCOPED_DOMAINS, switchers, ...extra,
    };
    r.scope_key = [r.environment_id, r.client_id ?? '*', r.workspace_id ?? '*', r.subcontext ?? '*', r.view].join('|');
    return r;
  };

  if (!ctx.workspace_id) return out(client_id && !fixed ? 'CLIENT_OVERVIEW' : 'HUB');
  const ws = wsOf(data, ctx.workspace_id);
  if (!client_id) return out(env.workspace_landing === 'CROSS_CLIENT_QUEUE' ? 'WORKSPACE_LANDING' : 'HUB');
  const client = clientOf(data, client_id);
  const res = resolveWorkspaceState(ws, client);
  if (res.state !== 'ACTIVE') {
    const view: ContextView = fixed ? (res.state === 'NOT_APPLICABLE' ? 'WORKSPACE_HIDDEN' : 'WORKSPACE_EXPANSION') : 'WORKSPACE_INACTIVE';
    return out(view, { workspace_state: res.state });
  }
  const case_type = data.defaultCaseType(ws.workspace_id);
  // A workspace whose case model is not described here opens on the client's workspace view (no case invented).
  if (!case_type) return out('CLIENT_WORKSPACE', { workspace_state: res.state });
  const sub = ctx.subcontext ?? data.defaultSubcontext(ws.workspace_id, client_id);
  if (!sub) return out('CASE_NOT_OPEN', { workspace_state: res.state });
  const key = canonicalCaseKey({ project_id: data.project_id, client_id, workspace_id: ws.workspace_id, case_type, subcontext: sub });
  const found = data.cases.find((c) => c.case_key === key);
  return out(found ? 'CASE' : 'CASE_NOT_OPEN', { workspace_state: res.state, subcontext: sub, case_key: key, record_id: found?.record_id ?? null });
}

/** Internal office: change CLIENT, keep WORKSPACE; keep the subcontext only if the new client has that case. */
export function switchClient(data: OfficeData, current: ResolvedContext, client_id: string): ResolvedContext {
  const env = envOf(data, current.environment_id);
  if (env.client !== 'SWITCHABLE') throw new ContextError('NO_CLIENT_SWITCHER', `${env.environment_id} has no client switcher`);
  let subcontext: string | null = null;
  if (current.workspace_id && current.subcontext) {
    const case_type = data.defaultCaseType(current.workspace_id);
    const key = case_type ? canonicalCaseKey({ project_id: data.project_id, client_id, workspace_id: current.workspace_id, case_type, subcontext: current.subcontext }) : null;
    if (key && data.cases.some((c) => c.case_key === key)) subcontext = current.subcontext;
  }
  return resolveContext(data, { environment_id: env.environment_id, client_id, workspace_id: current.workspace_id, subcontext });
}

/** Either office: change WORKSPACE, keep CLIENT; the subcontext re-resolves for the new workspace. */
export function switchWorkspace(data: OfficeData, current: ResolvedContext, workspace_id: string): ResolvedContext {
  const env = envOf(data, current.environment_id);
  if (env.workspace !== 'SWITCHABLE') throw new ContextError('NO_WORKSPACE', `${env.environment_id} has no workspace switcher`);
  return resolveContext(data, { environment_id: env.environment_id, client_id: current.client_fixed ? null : current.client_id, workspace_id, subcontext: null }, current.client_fixed ? current.client_id : null);
}

/** Change SUBCONTEXT inside one client × workspace. */
export function switchSubcontext(data: OfficeData, current: ResolvedContext, subcontext: string): ResolvedContext {
  if (!current.client_id) throw new ContextError('NO_CLIENT', 'subcontext needs a client');
  if (!current.workspace_id) throw new ContextError('NO_WORKSPACE', 'subcontext needs a workspace');
  return resolveContext(data, { environment_id: current.environment_id, client_id: current.client_fixed ? null : current.client_id, workspace_id: current.workspace_id, subcontext }, current.client_fixed ? current.client_id : null);
}

/** Entry from a cross-client workspace queue row. */
export const enterFromWorkspaceQueue = (data: OfficeData, environment_id: string, workspace_id: string, client_id: string, subcontext: string | null) =>
  resolveContext(data, { environment_id, client_id, workspace_id, subcontext });

/** Entry from the client-centric route (client overview → workspace). */
export const enterFromClient = (data: OfficeData, environment_id: string, client_id: string, workspace_id: string, subcontext: string | null) =>
  resolveContext(data, { environment_id, client_id, workspace_id, subcontext });

/** Open the client office for the signed-in organisation (identity fixed). */
export const openClientOffice = (data: OfficeData, environment_id: string, session_client_id: string, workspace_id: string | null = null, subcontext: string | null = null) =>
  resolveContext(data, { environment_id, client_id: null, workspace_id, subcontext }, session_client_id);

/** Records visible in a resolved context: only the context's client (and case when one is open). */
export function scopeRecords<T extends { client_id: string; case_key?: string | null }>(ctx: ResolvedContext, records: T[]): T[] {
  return records.filter((r) => r.client_id === ctx.client_id && (!ctx.case_key || !r.case_key || r.case_key === ctx.case_key));
}

/**
 * Workspace switcher contents for a client: ACTIVE first, IN PROGRESS second, AVAILABLE only when the client is eligible
 * AND the service is truthfully requestable (requestable + consistent availability). NOT_APPLICABLE, unknown-eligibility
 * and unavailable workspaces are never listed. Conflicting records are listed in their state and reported.
 */
export function workspaceSwitcherOptions(data: OfficeData, client_id: string) {
  const client = clientOf(data, client_id);
  const rows = data.workspaces.map((w) => ({ w, r: resolveWorkspaceState(w, client) }));
  const offerable = ({ w, r }: (typeof rows)[number]) => r.state === 'AVAILABLE_NOT_ACTIVATED' && r.eligibility === 'ELIGIBLE' && w.client_can_request && w.availability_truth === 'CONSISTENT';
  return {
    active: rows.filter(({ r }) => r.state === 'ACTIVE').map(({ r }) => r.workspace_id),
    in_progress: rows.filter(({ r }) => (OPTIONAL_WORKSPACE_STATES as readonly string[]).includes(r.state)).map(({ r }) => ({ workspace_id: r.workspace_id, state: r.state })),
    available: rows.filter(offerable).map(({ r }) => r.workspace_id),
    hidden: rows.filter((x) => x.r.state === 'NOT_APPLICABLE' || (x.r.state === 'AVAILABLE_NOT_ACTIVATED' && !offerable(x))).map(({ r }) => r.workspace_id),
    conflicts: rows.filter(({ r }) => r.conflict).map(({ r }) => r.workspace_id),
  };
}
