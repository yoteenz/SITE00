/**
 * P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1R1 — Composer contract regeneration.
 *
 * Applies the FD-01..FD-09 resolutions from
 * docs/design-workspace/08-FOUNDER-DECISION-RESOLUTIONS.md to the contract,
 * clears every unresolved marker, and adds the eleven sections the freeze
 * requires. Idempotent: re-running produces the same file.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'docs/design-workspace/composer-contract.json';
const contract = JSON.parse(readFileSync(PATH, 'utf8'));

contract.version = '2.0.0';
contract.sprint = 'P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1R1';
contract.supersedes = 'P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1';
contract.status = 'FOUNDER_APPROVAL_PENDING';
contract.COMPOSER_CONTRACT_STATUS = 'FOUNDER_APPROVAL_PENDING';
contract.resolutionsDocument = 'docs/design-workspace/08-FOUNDER-DECISION-RESOLUTIONS.md';
contract.implementationAuthority =
  'Composer implements this contract plus the approved visual contract. Every FD-01..FD-09 decision is resolved; no product decision is left for Composer to invent. Where this contract and a mock string disagree, this contract wins.';

contract.founderDecisions = [
  {
    id: 'FD-01',
    element: 'DW-HDR-008',
    question: 'header overflow menu contents',
    decision: 'two page-scoped diagnostic items backed by existing data',
    menuItems: [
      { label: 'READINESS RECEIPT', opens: 'DRAWER', data: 'CompilerReadinessReceipt: gate, scope, result, blockers, generatedAt' },
      { label: 'CONTRACT VERSIONS', opens: 'DRAWER', data: 'featureManifestVersion, projectCreativeContextVersion, pairChecksum, buildRef' },
    ],
    excluded: {
      'export / share / print': 'no export capability exists',
      'keyboard help': 'no shortcut layer exists on this page',
      'project switching': 'host-header scope, covered by FD-02',
      'view technical details': 'already a secondary action in the pipeline panel',
      'review authority': 'already a rail control, see FD-06',
    },
    duplicationCheck: 'PASS — neither item appears in primary nav, dock, rail or pipeline panel',
    newRoutes: 0,
  },
  {
    id: 'FD-02',
    element: 'DW-NAV-001',
    question: 'hamburger versus the visible nav',
    decision: 'host-level drawer listing the project modules',
    hamburgerRole: 'SITE 00 workspace navigation — modules beyond DESIGN',
    visibleNavRelationship: 'disjoint: the drawer never lists a DESIGN section, the strip never lists a module',
    mobileBehavior: 'identical at every width — one semantic role across viewports',
    contents: 'only modules that already have routes',
    newRoutes: 0,
  },
  {
    id: 'FD-03',
    element: 'DW-CTX-003',
    question: 'is PROJECT CREATIVE CONTEXT a destination',
    decision: 'read-only drawer',
    interactive: true,
    destinationType: 'DRAWER',
    destination: 'OV-CREATIVE-CONTEXT',
    content: 'pinned projectCreativeContextVersion, loadProjectCreativeContextPackage summary, version delta when stale',
    reason: 'DESIGN_AUTHORITY_CONTEXT_STALE can block the lock; the founder needs the reason',
    rejected: { 'link to /projects/:projectSlug/creative-direction': 'different surface, different meaning — conflating them makes the stale gate unexplainable' },
    newRoutes: 0,
  },
  {
    id: 'FD-04',
    element: 'DW-TGT-002..004',
    question: 'is TARGET navigable or readonly context',
    decision: 'readonly current-context display',
    targetRole: 'READONLY_DATA',
    interactive: false,
    destination: null,
    targetSwitchingHappensIn: 'the PAGES section of the primary nav, which exists',
    reason: 'active_design_target says "clear active artifact/page/stage context" — context, not navigation',
    newRoutes: 0,
  },
  {
    id: 'FD-05',
    element: 'DW-VP-003',
    question: 'TABLET has no authority slot',
    decision: 'OPTION A — MOBILE and DESKTOP are the only approved authorities; TABLET is a derived preview viewport',
    stateModelChange: 'none — DesignWorkspaceViewport stays MOBILE | DESKTOP. UI viewport state keeps three values because it is presentation, not authority.',
    uiContractChange: 'while viewport = TABLET the authority controls are disabled with the named reason AUTHORITY_NOT_APPLICABLE_FOR_DERIVED_VIEWPORT; inspection, gallery, readiness and record stay live',
    reason: 'two-ness is load-bearing in computePairChecksum, founderReview flags, the eight readiness gate codes, master version chains and every PAIR label. The RESPONSIVE CONTRACT gate already asserts correspondence between two authorities, which only coheres if intermediate widths are derived.',
    rejected: {
      'third authority slot': 'converts a pair into a triple, invalidates every written checksum, and multiplies founder approval work by 1.5 per page',
      'exception override when interpolation fails': 'makes authority arity conditional, which no checksum, gate or status union can express; no interpolation-failure detector exists to trigger it',
      'remove TABLET': 'visual change, out of scope',
    },
    composerImpact: 'never emit VIEWPORT_MASTER_PROMOTED with viewport TABLET; never include TABLET in authorityPair, pairChecksum or founderReview',
  },
  {
    id: 'FD-06',
    element: 'DW-AUTH-016/017/018',
    question: 'REVIEW AUTHORITY semantics and the permission model',
    decision: 'OPTION B — the three controls are distinct; REVIEW AUTHORITY is the missing pre-commit surface, not a duplicate',
    pairReview: { element: 'DW-AUTH-016', treatment: 'INLINE_DISCLOSURE', purpose: 'visual comparison of the two masters', stateChange: false, event: null, precondition: 'both masters PROMOTED' },
    reviewAuthority: { element: 'DW-AUTH-017', treatment: 'DRAWER', purpose: 'provenance audit: shows what the lock will check before it is committed', shows: ['authorityImageHash per master', 'projectCreativeContextVersion', 'featureManifestVersion', 'groundingManifestId', 'coverage receipt', 'live pass/fail of each readiness gate'], stateChange: false, event: null, reusesContentOf: 'OV-TECHNICAL' },
    lockAuthority: { element: 'DW-AUTH-018', treatment: 'CONFIRMED_ACTION', purpose: 'the only committing action of the three', event: 'PAIR_LOCKED', unlock: 'does not exist; no role may unlock; superseding is the only forward path' },
    reason: 'the lock gate checks eight conditions before an action with no undo, and the founder has no surface showing them beforehand',
  },
  {
    id: 'FD-07',
    element: 'DW-PIPE-003/004/015/016',
    question: 'the readiness percentage and the status counts',
    decision: 'OPTION B — passed gates over applicable gates, computed from the CompilerReadinessReceipt that already exists',
    preserves82: false,
    reason: 'no computation produces 82%, and compiler_readiness forbids fake metrics',
  },
  {
    id: 'FD-08',
    element: 'DW-PIPE-022',
    question: 'what MOVE TO BUILD does on success, and its event type',
    decision: 'OPTION A — state only, plus a typed event; the founder stays on the route',
    rejected: {
      'navigate to a build surface': 'the surface does not exist; inventing a route family for a button is the mistake FD-09 also rejects',
      'hand off to Composer': 'founderApprovalTriggersComposerAutomatically() returns false; inverting it is a founder policy decision about autonomy, not a wiring detail',
    },
  },
  {
    id: 'FD-09',
    element: 'DW-REC-014',
    question: 'where SOURCE resolves',
    decision: 'provenance drawer, shared with the REVIEW AUTHORITY panel',
    sourceSemantics: 'the originating campaign/archive record from which this entry grounding manifest was derived — entry lineage, not an asset collection, not an external import',
    interactive: true,
    destinationType: 'DRAWER',
    destination: 'OV-PROVENANCE',
    entryPoints: ['DW-REC-014', 'DW-AUTH-017'],
    rejected: { 'campaign archive route': 'a route family is not created for one link' },
    newRoutes: 0,
  },
];

contract.authorityModel = {
  approvedViewports: ['MOBILE', 'DESKTOP'],
  derivedViewports: ['TABLET'],
  viewportUnion: 'DesignWorkspaceViewport = MOBILE | DESKTOP — unchanged',
  presentationViewportUnion: 'MOBILE | TABLET | DESKTOP — presentation only',
  arity: 'PAIR — fixed at two, never conditional',
  derivedViewportContract: {
    authorityControlsDisabled: ['DW-AUTH-001', 'DW-AUTH-003', 'DW-AUTH-013', 'DW-AUTH-014', 'DW-AUTH-015'],
    disabledReasonCode: 'AUTHORITY_NOT_APPLICABLE_FOR_DERIVED_VIEWPORT',
    surfacesThatStayLive: ['inspection drawers', 'gallery browsing', 'readiness', 'concept record', 'view mode', 'history'],
  },
  statusUnions: {
    pair: ['DRAFT', 'MOBILE_ONLY', 'DESKTOP_ONLY', 'PAIR_READY', 'PAIR_LOCKED', 'DERIVATION_READY', 'SUPERSEDED'],
    master: ['PROMOTED', 'PAIR_LOCKED', 'SUPERSEDED'],
    candidate: ['GENERATED', 'NOT_SELECTED', 'SELECTED', 'PROMOTED', 'SUPERSEDED', 'REJECTED'],
  },
  unlock: 'does not exist',
};

contract.readinessModel = {
  source: 'buildScopedCompilerReadinessReceipt in designWorkspaceDerivation/scopedCompilerReadiness.ts',
  gateCount: { total: 23, derivation: 8, review: 14, build: 1 },
  formula: 'readinessPercent = round(100 * passedGates / applicableGates)',
  applicableGates: "checks where result !== 'NOT_APPLICABLE'",
  passedGates: "applicable checks where result === 'PASS'",
  percentageIsAGate: false,
  percentageNote: 'progress indicator only; no action may be predicated on it crossing a number',
  currentComputedValues: { withTranslationApproved: 95, withoutTranslationApproved: 91, mockValueRejected: 82 },
  blockingChecks: "result === 'FAIL' in any scope, or result === 'BLOCKED' in BUILD scope — the existing blockers computation, adopted unchanged",
  warningOnlyChecks: ["derivationStatus === 'STALE'", 'projectCreativeContextVersion mismatch', 'featureManifestVersion mismatch'],
  readyLabelRule: 'blockers.length === 0 AND every DERIVATION and REVIEW gate is PASS',
  readyThreshold: null,
  buildEligibilityRule: [
    "pair.status === 'PAIR_LOCKED'",
    'translationApproved === true',
    "implementationPackage.status === 'BUILD_REVIEW_READY'",
    'blockers contains nothing except the BUILD ACTION STATUS gate itself',
  ],
  countDefinitions: {
    'APPROVED ELEMENTS': "count of applicable gates with result === 'PASS'",
    'PENDING DECISIONS': "gates with result === 'BLOCKED' outside BUILD scope, plus founder decisions still open against this page",
    BLOCKERS: 'receipt.blockers.length — already real, unchanged',
    WARNINGS: 'count of warningOnlyChecks currently true',
  },
  absentReceiptBehaviour: 'render UNKNOWN — never a placeholder percentage',
};

contract.buildTransition = {
  buildIs: ['WORKFLOW_STAGE', 'PACKAGE_STATUS'],
  buildIsNot: ['ROUTE'],
  workflowStageSource: "'BUILD' in DESIGN_PAGE_V3_WORKFLOW_PHASES",
  packageStatusSource: "'APPROVED_FOR_BUILD' in ImplementationPackageStatus",
  preconditions: [
    'actor is FOUNDER',
    "pair.status === 'PAIR_LOCKED'",
    'translationApproved === true',
    "implementationPackage.status === 'BUILD_REVIEW_READY'",
    'readinessModel.buildEligibilityRule holds',
  ],
  eventType: 'MOVED_TO_BUILD',
  featureId: 'move_to_build',
  stateTransition: {
    "implementationPackage.status": "BUILD_REVIEW_READY -> APPROVED_FOR_BUILD",
    readinessBuildStage: 'BUILD_REVIEW_READY -> BUILD_READY',
    buildPass: 'stops being hardcoded false; becomes readinessModel.buildEligibilityRule',
  },
  destination: null,
  navigates: false,
  frozenArtifacts: ['implementation package (packageChecksum)', 'pairChecksum', 'featureManifestVersion', 'projectCreativeContextVersion', 'canonical asset manifest id', 'compiler readiness receipt id'],
  remainsEditable: 'nothing in the pair — the masters were already immutable at PAIR_LOCKED',
  rollback: 'none. Forward-only, consistent with the lock having no unlock. Recovery is superseding the package via priorImplementationPackageId.',
  historyEntry: 'one MOVED_TO_BUILD event — the second auditable commitment on the page after PAIR_LOCKED',
  triggeredBy: 'FOUNDER',
  triggersComposerAutomatically: false,
};

contract.permissionModel = {
  authorization: 'server-authoritative',
  uxContextIsAuthoritative: false,
  uxContextNote: 'isExperienceContextAuthoritative() returns false by design',
  roles: {
    FOUNDER: 'isFounderPrivilegedAccount(email)',
    ADMIN: "resolvePlatformRole(email) === 'ADMIN'",
    PROJECT_OWNER: 'canAccessProjectAsOwner(email, slug, userId, studioProject)',
    CLIENT: 'client room membership',
    COLLABORATOR: 'project membership',
    REVIEWER: 'project membership, read-only',
  },
  rolesNotAdopted: { EDITOR: 'appears in no code', VIEWER: 'appears in no code' },
  founderOnlyActions: [
    'select candidate', 'unselect candidate', 'promote mobile', 'promote desktop',
    'replace master', 'lock authority pair', 'refine concept', 'regenerate concept',
    'move to build', 'create amendment',
  ],
  anyProjectMemberActions: [
    'read', 'focus', 'view mode', 'viewport', 'gallery browsing', 'pair review',
    'review authority', 'inspection drawers', 'history',
  ],
  nonFounderTreatment: 'DISABLED_WITH_REASON, not hidden',
  nonFounderTreatmentReason: 'a workflow the viewer cannot see is a workflow they cannot learn',
  unlockPermission: 'no role may unlock a pair; unlocking does not exist',
};

contract.navigationModel = {
  hamburger: { element: 'DW-NAV-001', role: 'HOST_WORKSPACE_NAV', treatment: 'DRAWER', lists: 'project modules that already have routes', listsDesignSections: false },
  visibleNav: { elements: 'DW-NAV-002..007', scope: 'DESIGN sections', items: ['REFERENCES', 'ASSETS', 'PAGES', 'SKINS', 'HISTORY', 'MORE'] },
  overflowMenu: { element: 'DW-HDR-008', treatment: 'MENU', items: ['READINESS RECEIPT', 'CONTRACT VERSIONS'] },
  disjointnessRule: 'the host drawer and the DESIGN strip never list the same destination',
  newRoutesRequired: 0,
};

contract.targetSemantics = {
  elements: ['DW-TGT-002', 'DW-TGT-003', 'DW-TGT-004'],
  role: 'READONLY_DATA',
  interactive: false,
  focusable: false,
  accessibilityRole: null,
  appearsInRouteMap: false,
  targetSwitchingHappensIn: 'PAGES section of the primary nav',
};

contract.sourceResolution = {
  element: 'DW-REC-014',
  value: 'ENTRY001-CAMPAIGN-ARCHIVE',
  semantics: 'originating campaign/archive record from which groundingManifestId was derived — entry lineage',
  interactive: true,
  destinationType: 'DRAWER',
  destination: 'OV-PROVENANCE',
  sharedWith: 'DW-AUTH-017 REVIEW AUTHORITY',
  entryPoints: ['DW-REC-014', 'DW-AUTH-017'],
  content: ['source archive record', 'grounding manifest derived from it'],
  newRoutesRequired: 0,
};

contract.spendGuard = {
  defect: 'the server guard is real (SPEND_GUARD: founderConfirmedSpend required) but ten client call sites pass founderConfirmedSpend: true unconditionally, so the flag asserts a confirmation that never happened',
  costBearingElements: ['DW-CAND-001', 'DW-CAND-002'],
  shapeReusedFrom: 'P0.VR.OPUS-NATIVE1 native runtime — estimate, confirmation, ceiling, receipt',
  required: {
    estimate: 'server returns an estimate with an id before dispatch; REFINE and REGENERATE both show cost before the founder commits',
    confirmation: 'founderConfirmedSpend must travel with spendConfirmationId matching an estimate the founder was shown; the server rejects a confirmation with no matching estimate',
    hardcodingForbidden: 'Composer must never hardcode founderConfirmedSpend: true',
    refineConfirmsIn: 'OV-REFINE, beside the bounded input',
    regenerateConfirmsIn: 'MODAL — it has no input surface of its own',
    perRunLimit: 'maxRunCostUsd, rejected before dispatch',
    projectBudget: 'optional projectMonthlyBudgetUsd: warn at 80%, block at 100%',
    cancel: 'in-flight runs are cancellable; a cancelled run records what was actually spent',
    providerFailure: 'no cost recorded, run marked FAILED',
    receipt: 'runId, action, tokens or provider units, estimatedUsd, actualUsd, projectId, pageId',
    concurrency: 'both actions disable while a generation is in flight',
  },
};

contract.eventTaxonomy = {
  union: [
    'VIEWPORT_SELECTED', 'VIEWPORT_UNSELECTED', 'VIEWPORT_MASTER_PROMOTED',
    'VIEWPORT_MASTER_SUPERSEDED', 'PAIR_LOCKED', 'PAIR_SUPERSEDED',
    'DERIVATION_MARKED_STALE', 'FOUNDER_AUTHORITY_INJECTION',
    'MOVED_TO_BUILD', 'CANDIDATE_REFINED', 'CANDIDATE_REGENERATED',
  ],
  added: {
    MOVED_TO_BUILD: ['packageId', 'packageChecksum', 'pairId', 'pairChecksum', 'readinessReceiptId', 'movedBy', 'movedAt'],
    CANDIDATE_REFINED: ['candidateId', 'parentCandidateId', 'viewport', 'notes', 'runId', 'spendConfirmationId', 'costUsd', 'refinedBy', 'refinedAt'],
    CANDIDATE_REGENERATED: ['candidateId', 'siblingOfCandidateId', 'viewport', 'runId', 'spendConfirmationId', 'costUsd', 'regeneratedBy', 'regeneratedAt'],
  },
  lineageRule: 'refine descends from a parent; regenerate produces a sibling. The payloads carry that distinction so lineage is queryable without re-deriving it.',
  notEvents: ['gallery candidate focus', 'pair review', 'review authority'],
  rule: 'use these eleven names exactly; add none without a further schema decision',
};

contract.persistenceContract = {
  today: 'browser localStorage, key site00:design-page-v3-authority:v1 — no Supabase table, no endpoint',
  implementedInThisSprint: false,
  canonicalStore: 'server, project-scoped row keyed by (projectId, pageId) holding the DesignWorkspaceAuthoritySession',
  identity: 'authority ids unchanged — vma-<viewport>-v<n>-<ts> is already unique and carries lineage',
  versioning: 'monotonic session version column for optimistic concurrency; a write carrying a stale version is rejected, never merged',
  history: 'append-only event log, one row per emitted event, using the eleven-member union; the session row is a projection of the log',
  localCache: 'localStorage becomes an optimistic cache only, invalidated when the server version differs or buildRef differs — the rule recoverDesignPageAuthorityGallery already applies',
  cacheMayNeverBeAuthority: 'for a locked pair',
  migration: 'first server read adopts the local session if the server has none; thereafter the server wins permanently',
};

// Clear the stale in-place markers now that each has an answer.
delete contract.STATE_MODEL.keys.viewport.unresolved;
contract.STATE_MODEL.keys.viewport.resolution = 'FD-05 — three presentation values, two authority values';
contract.STATE_MODEL.keys.statusCounts.note = 'all four counts defined in readinessModel.countDefinitions (FD-07)';

for (const row of contract.INTERACTION_INVENTORY?.mockStringsThatContradictArchitecture ?? []) {
  if (row.decision === 'FD-07') row.decision = 'RESOLVED FD-07 — bind to readinessModel; render the computed value, not 82%';
}
for (const row of contract.ROUTE_MAP.entries) {
  if (row.decision === 'FD-09') {
    row.decision = 'RESOLVED FD-09 — OV-PROVENANCE drawer';
    row.destination = 'OV-PROVENANCE';
    row.type = 'DRAWER';
    row.exists = false;
  }
}
delete contract.PERMISSIONS.unresolved;
contract.PERMISSIONS.resolution = 'FD-06 — see permissionModel';
delete contract.COST_GUARDS.unresolved;
contract.COST_GUARDS.resolution = 'see spendGuard — per-run ceiling required, project budget optional with a defined mechanism';
contract.HISTORY_EVENTS.missingMembers = [];
contract.HISTORY_EVENTS.missingMembersDecision = 'RESOLVED FD-08 — see eventTaxonomy.added';
contract.HISTORY_EVENTS.existingUnion = contract.eventTaxonomy.union;
contract.HISTORY_EVENTS.rule = 'use these eleven names exactly; add none without a further schema decision';
if (contract.CHILD_PAGE_MAP.assessed) contract.CHILD_PAGE_MAP.assessed.build = 'NOT_A_ROUTE — FD-08 resolves BUILD as a workflow stage and package status';

contract.UNRESOLVED_DECISIONS = [];
contract.COMPOSER_PRECONDITIONS = [
  'founder approval of this contract',
  'FD-01 through FD-09 are resolved in founderDecisions — Composer must not reopen them',
  'do not create routes for any surface marked DRAWER_DETAIL or MODAL_DETAIL',
  'do not invent state values outside the unions recorded in STATE_MODEL and authorityModel',
  'do not invent event types outside eventTaxonomy.union',
  'do not render a value that has no computation behind it — readiness renders the computed percentage or UNKNOWN',
  'do not hardcode founderConfirmedSpend: true',
  'do not add a third authority slot',
  'implement every action once in the shared workspace hook so canonical and list cannot diverge',
];

writeFileSync(PATH, `${JSON.stringify(contract, null, 2)}\n`);
console.log(`regenerated ${PATH} at version ${contract.version}`);
