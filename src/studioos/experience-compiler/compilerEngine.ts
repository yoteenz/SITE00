import {
  PUBLIC_REDESIGN_AUTHORITY_RECORDS,
  WAITING_FOR_AUTHORITY_ROUTES,
} from '../../site00/authority/publicRedesignAuthorityManifest';
import { findAuthorityForRoute, ingestAuthorities, normalizeRouteForMatch } from './authorityRegistry';
import { discoverAllPageNodes } from './pageDiscovery';
import {
  isBldrIntake,
  isBuildReadyVerification,
  isIdntyEvolutionRoute,
  isPublicEvolveRoute,
} from './productFamily';
import { PAGE_ARCHETYPE_TAXONOMY } from './taxonomy';
import type {
  AuthorityRole,
  CompilerReport,
  DerivationClassification,
  FounderGate,
  InheritanceMapEntry,
  PageNode,
  ProductionBatch,
} from './types';

const GLOBAL_SHELL = 'SITE00_PUBLIC_GLOBAL';
const IDNTY_PANEL = 'IDNTY_WORKING_PANEL';
const IDNTY_TEXT = 'IDNTY_TEXT_INPUT';
const IDNTY_REVIEW = 'IDNTY_REVIEW';
const IDNTY_VERIFY = 'IDNTY_VERIFICATION';

const ALL_ROLES: AuthorityRole[] = [
  'HOST_SHELL',
  'ENVIRONMENT',
  'PAGE_GEOMETRY',
  'MACHINE_LANGUAGE',
  'WORKING_SURFACE',
  'CONTROL_GRAMMAR',
  'NAVIGATION',
  'TYPOGRAPHY',
  'REVIEW_PATTERN',
  'VERIFICATION_PATTERN',
  'TRANSACTION_PATTERN',
  'RESPONSIVE_PATTERN',
  'ASSET_LANGUAGE',
];

function familyEnv(family: string): string {
  if (family === 'IDNTY') return 'IDNTY_ATRIUM';
  if (family === 'BLDR') return 'BLDR_COMMAND_CENTER';
  if (family === 'PUBLIC_EVOLVE' || family === 'PUBLIC_EVOLVE_MARKETING') return 'EVOLVE_INTERVENTION';
  if (family === 'LOCATIONS' || family === 'LOCATIONS_CHILD') return 'LOCATIONS_ARCH';
  if (family === 'ORIGIN') return 'ORIGIN_LANDMARK';
  if (family === 'CHECKOUT') return 'NONE';
  if (family === 'AUTH') return 'NONE';
  return 'SITE00_PUBLIC_GLOBAL';
}

function buildInheritance(node: PageNode, directAuthorityId?: string): InheritanceMapEntry {
  const family = node.product_family;
  const roles: Partial<Record<AuthorityRole, string>> = {
    HOST_SHELL: GLOBAL_SHELL,
    TYPOGRAPHY: GLOBAL_SHELL,
    NAVIGATION: GLOBAL_SHELL,
    RESPONSIVE_PATTERN: node.primary_archetype === 'DESKTOP_BRANCH' ? 'LEGACY_DESKTOP_BRANCH' : 'MOBILE_FIRST',
    ASSET_LANGUAGE: 'GROK_SLOTS_FROM_MANIFEST',
  };

  if (family === 'CHECKOUT') {
    roles.TRANSACTION_PATTERN = 'MISSING_CHECKOUT_AUTHORITY';
    roles.ENVIRONMENT = 'MISSING';
    roles.PAGE_GEOMETRY = 'MISSING';
  } else if (family === 'AUTH') {
    roles.ENVIRONMENT = 'MISSING_AUTH_AUTHORITY';
    roles.CONTROL_GRAMMAR = 'MISSING';
  } else if (family === 'LOCATIONS_CHILD') {
    roles.ENVIRONMENT = 'LOCATIONS_ARCH';
    roles.PAGE_GEOMETRY = 'CONTENT_PAGE_GEOMETRY_MISSING';
    roles.MACHINE_LANGUAGE = 'NONE';
    roles.WORKING_SURFACE = 'CONTENT_BODY';
    roles.CONTROL_GRAMMAR = 'GLOBAL_LINKS';
  } else {
    roles.ENVIRONMENT = familyEnv(family);
    roles.PAGE_GEOMETRY = familyEnv(family);
    roles.MACHINE_LANGUAGE = family.includes('IDNTY') ? 'IDNTY_MACHINE' : `${family}_MACHINE_OR_CARD`;
  }

  if (node.primary_archetype === 'MULTI_STEP_INTAKE' || node.secondary_archetype === 'MULTI_STEP_INTAKE') {
    roles.WORKING_SURFACE = IDNTY_PANEL;
    roles.CONTROL_GRAMMAR = node.primary_archetype === 'TEXT_INPUT' ? IDNTY_TEXT : 'IDNTY_SELECT_CONTROLS';
    roles.REVIEW_PATTERN = IDNTY_REVIEW;
    roles.VERIFICATION_PATTERN = node.primary_archetype === 'VERIFICATION' ? IDNTY_VERIFY : 'INHERITED_FROM_FAMILY';
  }
  if (family === 'BLDR' && isBldrIntake(node.route)) {
    roles.ENVIRONMENT = 'BLDR_SITE';
    roles.PAGE_GEOMETRY = 'BLDR_SITE';
    roles.MACHINE_LANGUAGE = 'BLDR_SITE';
  }
  if (family === 'IDNTY' || family === 'BLDR' || family === 'PUBLIC_EVOLVE') {
    if (!roles.REVIEW_PATTERN && node.primary_archetype !== 'REVIEW') roles.REVIEW_PATTERN = IDNTY_REVIEW;
    if (node.primary_archetype === 'SINGLE_SELECT' || node.primary_archetype === 'TEXT_INPUT') {
      roles.CONTROL_GRAMMAR = roles.CONTROL_GRAMMAR ?? 'IDNTY_SELECT_CONTROLS';
      roles.WORKING_SURFACE = roles.WORKING_SURFACE ?? IDNTY_PANEL;
    }
  }
  if (node.primary_archetype === 'REVIEW') roles.REVIEW_PATTERN = IDNTY_REVIEW;
  if (node.primary_archetype === 'VERIFICATION') roles.VERIFICATION_PATTERN = IDNTY_VERIFY;
  if (node.primary_archetype === 'UPLOAD') roles.CONTROL_GRAMMAR = 'IDNTY_UPLOAD_EVIDENCE';
  if (node.primary_archetype === 'PAYMENT' || node.primary_archetype === 'CHECKOUT') {
    roles.TRANSACTION_PATTERN = 'MISSING_PAYMENT_AUTHORITY';
  }

  if (directAuthorityId) {
    roles.WORKING_SURFACE = directAuthorityId;
    roles.CONTROL_GRAMMAR = directAuthorityId;
    roles.ENVIRONMENT = directAuthorityId;
  }

  const materialRoles: AuthorityRole[] = ALL_ROLES.filter((r) => r !== 'ASSET_LANGUAGE');
  const covered_roles = materialRoles.filter((r) => {
    const v = roles[r];
    return v && !v.startsWith('MISSING') && v !== 'NONE';
  });
  const missing_roles = materialRoles.filter((r) => {
    const v = roles[r];
    return !v || v.startsWith('MISSING') || v === 'NONE';
  });

  const new_interaction_required = missing_roles.includes('TRANSACTION_PATTERN') || missing_roles.includes('CONTROL_GRAMMAR');
  const new_visual_grammar_required =
    missing_roles.includes('ENVIRONMENT') || missing_roles.includes('PAGE_GEOMETRY') || missing_roles.includes('TRANSACTION_PATTERN');
  const new_machine_required = missing_roles.includes('MACHINE_LANGUAGE') && family !== 'LOCATIONS_CHILD';

  const waiting = WAITING_FOR_AUTHORITY_ROUTES.some((w) => routeMatchesWaitingPattern(node.route, w.route));
  const hardBlockFamilies = new Set(['CHECKOUT', 'AUTH']);
  const compositeFamilies =
    family === 'IDNTY' ||
    (family === 'BLDR' && (node.route.includes('/state') || isBldrIntake(node.route))) ||
    (family === 'PUBLIC_EVOLVE' && !node.route.includes('/marketing')) ||
    family === 'ORIGIN' ||
    family === 'LOCATIONS';

  let classification: DerivationClassification = 'CREATIVE_AUTHORITY_REQUIRED';
  if (directAuthorityId) classification = 'DIRECTLY_COVERED';
  else if (hardBlockFamilies.has(family) || waiting) classification = 'CREATIVE_AUTHORITY_REQUIRED';
  else if (family === 'LOCATIONS_CHILD') classification = 'CREATIVE_AUTHORITY_REQUIRED';
  else if (node.primary_archetype === 'RESULT') classification = 'CREATIVE_AUTHORITY_REQUIRED';
  else if (compositeFamilies && covered_roles.length >= 6) classification = 'COMPOSITE_DERIVABLE';
  else if (missing_roles.length === 0) classification = 'DERIVABLE';
  else if (covered_roles.length >= 8) classification = 'DERIVABLE';
  else if (covered_roles.length >= 5 && compositeFamilies) classification = 'COMPOSITE_DERIVABLE';

  if (directAuthorityId) classification = 'DIRECTLY_COVERED';

  let derivation_confidence: InheritanceMapEntry['derivation_confidence'] = 'LOW';
  if (classification === 'DIRECTLY_COVERED') derivation_confidence = 'HIGH';
  else if (classification === 'DERIVABLE') derivation_confidence = 'HIGH';
  else if (classification === 'COMPOSITE_DERIVABLE') derivation_confidence = 'MEDIUM';
  else derivation_confidence = 'LOW';

  const founder_gate_required = classification === 'CREATIVE_AUTHORITY_REQUIRED';

  return {
    page_id: node.page_id,
    route: node.route,
    classification,
    derivation_confidence,
    roles,
    covered_roles,
    missing_roles,
    conflicting_roles: [],
    new_interaction_required,
    new_visual_grammar_required,
    new_machine_required,
    founder_gate_required,
  };
}

function routeMatchesWaitingPattern(route: string, pattern: string): boolean {
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2);
    return route.startsWith(prefix);
  }
  if (pattern.includes(':')) {
    const re = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '(\\/.*)?$');
    return re.test(route.split('?')[0]);
  }
  return normalizeRouteForMatch(route) === normalizeRouteForMatch(pattern);
}

export function evaluatePage(node: PageNode): PageNode {
  const auth = findAuthorityForRoute(node.route);
  if (auth) {
    node.current_authority_status = 'APPROVED_AUTHORITY';
    node.existing_design_status = 'STRUCTURE_IMPLEMENTED';
  } else if (WAITING_FOR_AUTHORITY_ROUTES.some((w) => routeMatchesWaitingPattern(node.route, w.route))) {
    node.current_authority_status = 'WAITING_FOR_AUTHORITY';
  }
  const inh = buildInheritance(node, auth?.authority_id);
  node.classification = inh.classification;
  node.derivation_confidence = inh.derivation_confidence;
  return node;
}

export function extractFounderGates(nodes: PageNode[]): FounderGate[] {
  const gates: FounderGate[] = [];
  const groups: Record<string, PageNode[]> = {};

  for (const n of nodes) {
    if (n.classification !== 'CREATIVE_AUTHORITY_REQUIRED') continue;
    let gateId = `GATE_${n.product_family}_${n.primary_archetype}`;
    if (n.product_family === 'CHECKOUT') gateId = 'GATE_CHECKOUT_COMMERCE';
    if (n.product_family === 'AUTH') gateId = 'GATE_AUTH_ACCOUNT';
    if (n.product_family === 'LOCATIONS_CHILD') gateId = 'GATE_LOCATIONS_CONTENT_REPRESENTATIVE';
    if (n.primary_archetype === 'RESULT') gateId = 'GATE_IDNTY_COMPLETION_RESULT';
    if (isBldrIntake(n.route)) gateId = 'GATE_BLDR_ASSESSMENT_REPRESENTATIVE';
    if (isPublicEvolveRoute(n.route) && !n.route.includes('/state')) gateId = 'GATE_PUBLIC_EVOLVE_ASSESSMENT';
    groups[gateId] = groups[gateId] ?? [];
    groups[gateId].push(n);
  }

  for (const [gateId, list] of Object.entries(groups)) {
    const sample = list[0];
    gates.push({
      gate_id: gateId,
      family: sample.product_family,
      archetype: sample.primary_archetype,
      routes_covered: [...new Set(list.map((n) => n.route))].slice(0, 12),
      why_insufficient: WAITING_FOR_AUTHORITY_ROUTES.find((w) => routeMatchesWaitingPattern(sample.route, w.route))?.reason ??
        'No approved authority covers required design layers for this archetype/family combination.',
      must_decide: `Approve one representative ${sample.primary_archetype} authority for ${sample.product_family}.`,
      downstream_screens_unlocked: list.length,
    });
  }

  return gates.sort((a, b) => b.downstream_screens_unlocked - a.downstream_screens_unlocked);
}

export function groupProductionBatches(nodes: PageNode[], gates: FounderGate[]): ProductionBatch[] {
  const batches: ProductionBatch[] = [];

  const addBatch = (id: string, name: string, family: string, filter: (n: PageNode) => boolean, lineage: string[]) => {
    const matched = nodes.filter(filter);
    if (matched.length === 0) return;
    const classifications = new Set(matched.map((m) => m.classification));
    const classification: DerivationClassification = classifications.has('CREATIVE_AUTHORITY_REQUIRED')
      ? 'CREATIVE_AUTHORITY_REQUIRED'
      : classifications.has('COMPOSITE_DERIVABLE')
        ? 'COMPOSITE_DERIVABLE'
        : classifications.has('DERIVABLE')
          ? 'DERIVABLE'
          : 'DIRECTLY_COVERED';
    const gateIds = gates
      .filter((g) => matched.some((m) => g.routes_covered.includes(m.route) || g.family === m.product_family))
      .map((g) => g.gate_id);
    const founder_gate_required = classification === 'CREATIVE_AUTHORITY_REQUIRED';
    const sonnet_ready =
      !founder_gate_required &&
      (classification === 'DIRECTLY_COVERED' || classification === 'DERIVABLE' || classification === 'COMPOSITE_DERIVABLE');
    const covered = matched.filter((m) => m.classification === 'DIRECTLY_COVERED').length;
    batches.push({
      batch_id: id,
      batch_name: name,
      product_family: family,
      routes: [...new Set(matched.map((m) => m.route))],
      screen_nodes: matched.map((m) => m.page_id),
      archetypes: [...new Set(matched.flatMap((m) => [m.primary_archetype, m.secondary_archetype].filter(Boolean) as string[]))],
      authority_lineage: lineage,
      classification,
      founder_gate_required,
      founder_gate_ids: [...new Set(gateIds)],
      sonnet_ready,
      opus_strategy: 'Converge pixels against lineage authorities; no new grammar.',
      grok_asset_dependencies: ['ENV plates', 'ILLUSTRATION slots per manifest'],
      composer_dependencies: ['Preserve intake APIs', 'No route changes'],
      backend_dependencies: classification === 'CREATIVE_AUTHORITY_REQUIRED' && family === 'CHECKOUT' ? ['Payment provider'] : [],
      risk_notes: founder_gate_required ? ['Blocked until founder creative authority'] : [],
      estimated_reuse_ratio: matched.length ? covered / matched.length : 0,
    });
  };

  addBatch('ORIGIN_MOBILE', 'Origin mobile + expanded panels', 'ORIGIN', (n) => n.product_family === 'ORIGIN', ['ORIGIN_*', GLOBAL_SHELL]);
  addBatch('IDNTY_DIAGNOSTIC_AND_INTAKE', 'IDNTY diagnostic + intake flows', 'IDNTY', (n) => n.product_family === 'IDNTY', ['IDNTY_*', IDNTY_PANEL]);
  addBatch('BLDR_COMMAND_AND_PANELS', 'BLDR command center + path panels', 'BLDR', (n) => n.product_family === 'BLDR' && !isBldrIntake(n.route), ['BLDR_*']);
  addBatch('BLDR_ASSESSMENT_INTAKE', 'BLDR class assessment steps', 'BLDR', (n) => isBldrIntake(n.route), ['BLDR_SITE', IDNTY_PANEL]);
  addBatch('PUBLIC_EVOLVE_STATE', 'Public EVOLVE intervention + path panels', 'PUBLIC_EVOLVE', (n) => n.product_family === 'PUBLIC_EVOLVE' && n.route.includes('/state'), ['EVOLVE_*']);
  addBatch('PUBLIC_EVOLVE_ASSESSMENT', 'Public EVOLVE property assessment', 'PUBLIC_EVOLVE', (n) => isPublicEvolveRoute(n.route) && n.route.includes('/evolve/') && !n.route.includes('/state') && !n.route.includes('/marketing'), ['EVOLVE_*', IDNTY_PANEL]);
  addBatch('PUBLIC_EVOLVE_MARKETING', 'EVOLVE marketing services', 'PUBLIC_EVOLVE_MARKETING', (n) => n.product_family === 'PUBLIC_EVOLVE_MARKETING', ['EVOLVE_HUB', 'MISSING']);
  addBatch('LOCATIONS_DIRECTORY', 'Locations directory', 'LOCATIONS', (n) => n.route === '/origin/locations', ['LOCATIONS_MAIN']);
  addBatch('LOCATIONS_CHILD_PAGES', 'Sites / services / system / about / journal', 'LOCATIONS_CHILD', (n) => n.product_family === 'LOCATIONS_CHILD', ['LOCATIONS', 'CONTENT_REPRESENTATIVE']);
  addBatch('CHECKOUT_COMMERCE', 'Checkout + payment', 'CHECKOUT', (n) => n.product_family === 'CHECKOUT', ['MISSING']);
  addBatch('AUTH_ACCOUNT', 'Sign-in + create account', 'AUTH', (n) => n.product_family === 'AUTH', ['MISSING']);

  return batches;
}

export type SonnetManifest = {
  batch_id: string;
  routes: string[];
  components: string[];
  archetypes: string[];
  authority_lineage_by_layer: Record<string, string>;
  shared_components_to_reuse: string[];
  new_components_allowed: string[];
  interaction_rules: string[];
  state_rules: string[];
  asset_slots: string[];
  backend_boundaries: string[];
  responsive_rules: string[];
  uppercase_contract: string;
  do_not_invent_rules: string[];
  proof_requirements: string[];
};

export function generateSonnetManifests(batches: ProductionBatch[], nodes: PageNode[]): SonnetManifest[] {
  return batches
    .filter((b) => b.sonnet_ready)
    .map((b) => {
      const sampleNodes = nodes.filter((n) => b.screen_nodes.includes(n.page_id));
      return {
        batch_id: b.batch_id,
        routes: b.routes,
        components: [...new Set(sampleNodes.map((n) => n.component))],
        archetypes: b.archetypes,
        authority_lineage_by_layer: {
          HOST_SHELL: GLOBAL_SHELL,
          ENVIRONMENT: b.authority_lineage[0] ?? familyEnv(b.product_family),
          WORKING_SURFACE: b.authority_lineage.includes(IDNTY_PANEL) ? IDNTY_PANEL : 'FAMILY_DEFAULT',
          TYPOGRAPHY: GLOBAL_SHELL,
        },
        shared_components_to_reuse: ['PublicRedesignShell', 'Site00MobileShell', 'IdentityDiagnosticFlow'],
        new_components_allowed: ['Batch-local wrappers only — no new visual grammar'],
        interaction_rules: ['Preserve existing data hooks', 'No new routes', 'Uppercase public UI'],
        state_rules: ['Persist intake state to existing storage keys', 'No fake verification submit'],
        asset_slots: ['Use manifest slot ids — placeholders until Grok'],
        backend_boundaries: ['Do not add schema', 'Call existing APIs only'],
        responsive_rules: ['Mobile authority viewport first', 'Keep desktop branches untouched unless batch says otherwise'],
        uppercase_contract: 'All public labels uppercase per SITE 00 contract',
        do_not_invent_rules: [
          'Do not invent checkout or payment UI',
          'Do not blend IDNTY evolution with public EVOLVE',
          'Do not treat Build Ready verification as BLDR intake',
        ],
        proof_requirements: ['Side-by-side authority vs render for representative screen per archetype'],
      };
    });
}

export function buildRepresentativeScreenMap(nodes: PageNode[]) {
  const families = new Map<string, PageNode[]>();
  for (const n of nodes) {
    const key = `${n.product_family}:${n.primary_archetype}`;
    families.set(key, [...(families.get(key) ?? []), n]);
  }
  return [...families.entries()].map(([family_id, list]) => {
    const [family, representative_type] = family_id.split(':');
    const auth = list.find((n) => n.current_authority_status === 'APPROVED_AUTHORITY');
    return {
      family_id: family,
      representative_type,
      authority_status: auth ? 'APPROVED' : 'MISSING_REPRESENTATIVE',
      authority_id: auth ? findAuthorityForRoute(auth.route)?.authority_id ?? null : null,
      routes_covered: [...new Set(list.map((l) => l.route))].slice(0, 20),
      screen_count: list.length,
      new_authority_required: !auth && list.some((l) => l.classification === 'CREATIVE_AUTHORITY_REQUIRED'),
      reason: auth ? 'Representative covered by approved authority route.' : 'Composite derivation possible once representative approved.',
    };
  });
}

export function runExperienceCompiler() {
  const nodes = discoverAllPageNodes().map(evaluatePage);
  const { active } = ingestAuthorities();
  const approvedCount = active.filter((a) => a.approved && !a.superseded).length;
  const inheritance: InheritanceMapEntry[] = nodes.map((n) => {
    const auth = findAuthorityForRoute(n.route);
    return buildInheritance(n, auth?.authority_id);
  });
  const gates = extractFounderGates(nodes);
  const batches = groupProductionBatches(nodes, gates);
  const sonnetManifests = generateSonnetManifests(batches, nodes);
  const representative = buildRepresentativeScreenMap(nodes);

  const classCounts = {
    DIRECTLY_COVERED: nodes.filter((n) => n.classification === 'DIRECTLY_COVERED').length,
    DERIVABLE: nodes.filter((n) => n.classification === 'DERIVABLE').length,
    COMPOSITE_DERIVABLE: nodes.filter((n) => n.classification === 'COMPOSITE_DERIVABLE').length,
    CREATIVE_AUTHORITY_REQUIRED: nodes.filter((n) => n.classification === 'CREATIVE_AUTHORITY_REQUIRED').length,
  };

  const uniqueRoutes = new Set(nodes.map((n) => normalizeRouteForMatch(n.route)));
  const archetypeSet = new Set(nodes.map((n) => n.primary_archetype));

  const report: CompilerReport = {
    total_routes: uniqueRoutes.size,
    total_meaningful_screens: nodes.length,
    total_unique_archetypes: archetypeSet.size,
    directly_covered: classCounts.DIRECTLY_COVERED,
    derivable: classCounts.DERIVABLE,
    composite_derivable: classCounts.COMPOSITE_DERIVABLE,
    creative_authority_required: classCounts.CREATIVE_AUTHORITY_REQUIRED,
    total_founder_gates: gates.length,
    representative_authorities_needed: gates.length,
    downstream_screens_unlocked_by_gates: gates.reduce((s, g) => s + g.downstream_screens_unlocked, 0),
    total_production_batches: batches.length,
    sonnet_ready_batches: batches.filter((b) => b.sonnet_ready).length,
    blocked_batches: batches.filter((b) => !b.sonnet_ready).length,
    authority_leverage_ratio: nodes.length / approvedCount,
    generated_at: new Date().toISOString(),
  };

  return {
    nodes,
    taxonomy: PAGE_ARCHETYPE_TAXONOMY,
    authorities: active,
    inheritance,
    gates,
    batches,
    sonnetManifests,
    representative,
    report,
    authorityRecords: PUBLIC_REDESIGN_AUTHORITY_RECORDS,
  };
}

/** Firewall validation for tests. */
export function validateProductFamilyFirewall(): { ok: boolean; violations: string[] } {
  const violations: string[] = [];
  for (const n of discoverAllPageNodes()) {
    if (isIdntyEvolutionRoute(n.route) && n.product_family !== 'IDNTY') {
      violations.push(`IDNTY evolution route mapped to wrong family: ${n.route}`);
    }
    if (isPublicEvolveRoute(n.route) && n.product_family === 'IDNTY') {
      violations.push(`Public EVOLVE leaked into IDNTY: ${n.route}`);
    }
    if (isBuildReadyVerification(n.route) && isBldrIntake(n.route)) {
      violations.push(`Build Ready conflated with BLDR: ${n.route}`);
    }
  }
  for (const r of PUBLIC_REDESIGN_AUTHORITY_RECORDS.filter((x) => x.family === 'EVOLVE')) {
    if (/idnty\/ready-for-evolution/.test(r.route)) {
      violations.push(`EVOLVE authority on IDNTY evolution route: ${r.id}`);
    }
  }
  return { ok: violations.length === 0, violations };
}
