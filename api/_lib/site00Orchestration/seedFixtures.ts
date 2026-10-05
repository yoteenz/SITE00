import type {
  LaunchManifestRow,
  ManifestRequirementRow,
  OrganizationRow,
  RequirementDependencyRow,
  WorkstreamRow,
  LaunchTargetType,
  RequirementClassification,
  ExecutionStatus,
} from './types.js';

type OrgSeed = Omit<OrganizationRow, 'id'>;

export const FIXTURE_ORGANIZATIONS: OrgSeed[] = [
  {
    slug: 'site-00',
    name: 'SITE 00',
    classification: 'INTERNAL_BRAND_PLATFORM',
    state: 'ACTIVE',
    repository_ownership: 'SITE_00_REPO',
    production_engine: null,
    external_repository: null,
    host: null,
    role: null,
    client_facing: true,
    reconciliation_state: 'UNRECONCILED',
    metadata: { fixture: 'A' },
  },
  {
    slug: 'frontal-slayer',
    name: 'FRONTAL SLAYER',
    classification: 'INTERNAL_BRAND',
    state: 'EXISTING_ACTIVE_PROJECT',
    repository_ownership: null,
    production_engine: 'STUDIO_WORLD',
    external_repository: 'TO_BE_CONNECTED_IN_SPRINT_02',
    host: null,
    role: null,
    client_facing: true,
    reconciliation_state: 'UNRECONCILED',
    metadata: { fixture: 'B' },
  },
  {
    slug: 'all-in-one-enterprises',
    name: 'ALL IN ONE ENTERPRISES',
    classification: 'MANAGED_BRAND',
    state: 'EXISTING_ACTIVE_PROJECT',
    repository_ownership: null,
    production_engine: null,
    external_repository: 'TO_BE_CONNECTED_IN_SPRINT_02',
    host: null,
    role: null,
    client_facing: true,
    reconciliation_state: 'UNRECONCILED',
    metadata: { fixture: 'C' },
  },
  {
    slug: 'studio-world',
    name: 'STUDIO WORLD',
    classification: 'PRODUCTION_INFRASTRUCTURE',
    state: 'ACTIVE',
    repository_ownership: null,
    production_engine: null,
    external_repository: null,
    host: 'FRONTAL_SLAYER_REPOSITORY',
    role: 'PRODUCTION_ENGINE',
    client_facing: false,
    reconciliation_state: 'UNRECONCILED',
    metadata: { fixture: 'INFRA' },
  },
];

type ManifestSeed = {
  orgSlug: string;
  targetName: string;
  targetType: LaunchTargetType;
  objective: string;
  isActive: boolean;
  approvalState: 'APPROVED' | 'PENDING';
  manifestState: 'ACTIVE' | 'PROPOSED';
};

const MANIFEST_SEEDS: ManifestSeed[] = [
  {
    orgSlug: 'site-00',
    targetName: 'Full Platform Launch',
    targetType: 'FULL_PLATFORM_LAUNCH',
    objective: 'Launch SITE 00 as the complete brand + production operating system.',
    isActive: true,
    approvalState: 'APPROVED',
    manifestState: 'ACTIVE',
  },
  {
    orgSlug: 'frontal-slayer',
    targetName: 'Flagship Brand Launch',
    targetType: 'FLAGSHIP_BRAND_LAUNCH',
    objective: 'Launch Frontal Slayer as the flagship commerce and Mansion experience brand.',
    isActive: true,
    approvalState: 'APPROVED',
    manifestState: 'ACTIVE',
  },
  {
    orgSlug: 'all-in-one-enterprises',
    targetName: 'Core Service Operations',
    targetType: 'CORE_OPERATIONS',
    objective: 'Launch core trucking service operations without social or native app.',
    isActive: true,
    approvalState: 'APPROVED',
    manifestState: 'ACTIVE',
  },
  {
    orgSlug: 'site-00',
    targetName: 'Experimental Beta',
    targetType: 'PUBLIC_BETA',
    objective: 'Proposed beta manifest — not yet approved.',
    isActive: false,
    approvalState: 'PENDING',
    manifestState: 'PROPOSED',
  },
];

type ReqSeed = {
  orgSlug: string;
  key: string;
  title: string;
  classification: RequirementClassification;
  executionStatus: ExecutionStatus;
  whyRequired: string;
  canDefer?: boolean;
  wsKey?: string;
};

const SITE00_REQS: ReqSeed[] = [
  { orgSlug: 'site-00', key: 'public_website', title: 'Public Website', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Core public web presence.' },
  { orgSlug: 'site-00', key: 'identity', title: 'Brand Identity', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'COMPLETE', whyRequired: 'Approved identity for launch.' },
  { orgSlug: 'site-00', key: 'builder_flow', title: 'Builder Flow', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Client onboarding intake.' },
  { orgSlug: 'site-00', key: 'payments', title: 'Payments', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'NOT_STARTED', whyRequired: 'Revenue collection.', wsKey: 'digital' },
  { orgSlug: 'site-00', key: 'studio_workflow', title: 'Studio Workflow', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Creative production pipeline.' },
  { orgSlug: 'site-00', key: 'admin_operations', title: 'Admin Operations', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Internal operator environment.' },
  { orgSlug: 'site-00', key: 'transactional_email', title: 'Transactional Email', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'READY_FOR_REVIEW', whyRequired: 'Lifecycle email system.', wsKey: 'communication' },
  { orgSlug: 'site-00', key: 'marketing_automation', title: 'Expanded Marketing Automation', classification: 'OPTIONAL_POST_LAUNCH', executionStatus: 'NOT_STARTED', whyRequired: 'Post-launch marketing expansion.', canDefer: true },
  { orgSlug: 'site-00', key: 'social_marketing', title: 'Social Marketing', classification: 'DEFERRED_BY_OWNER', executionStatus: 'NOT_STARTED', whyRequired: 'Owner elected to launch core platform first.', canDefer: true },
];

const FS_REQS: ReqSeed[] = [
  { orgSlug: 'frontal-slayer', key: 'commerce', title: 'Commerce System', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Product catalog and purchase flows.' },
  { orgSlug: 'frontal-slayer', key: 'mansion_experience', title: 'Core Mansion Experience', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Flagship brand experience.' },
  { orgSlug: 'frontal-slayer', key: 'payments', title: 'Payments', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'NOT_STARTED', whyRequired: 'Checkout and authorized transactions.' },
  { orgSlug: 'frontal-slayer', key: 'checkout', title: 'Checkout Flow', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'NOT_STARTED', whyRequired: 'Depends on payments infrastructure.' },
  { orgSlug: 'frontal-slayer', key: 'transaction_confirmation', title: 'Transaction Confirmation', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'NOT_STARTED', whyRequired: 'Post-purchase confirmation flow.' },
  { orgSlug: 'frontal-slayer', key: 'campaign_hero', title: 'Campaign Hero Film', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'BLOCKED', whyRequired: 'Flagship campaign creative.', wsKey: 'campaign' },
  { orgSlug: 'frontal-slayer', key: 'analytics', title: 'Analytics Verification', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Launch measurement.' },
  { orgSlug: 'frontal-slayer', key: 'social_launch', title: 'Core Social Launch Assets', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'NOT_STARTED', whyRequired: 'Social launch presence.' },
  { orgSlug: 'frontal-slayer', key: 'education_expansion', title: 'Educational Expansion', classification: 'DEFERRED_BY_OWNER', executionStatus: 'NOT_STARTED', whyRequired: 'Future educational content seasons.', canDefer: true },
];

const AIO_REQS: ReqSeed[] = [
  { orgSlug: 'all-in-one-enterprises', key: 'public_website', title: 'Public Website', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'COMPLETE', whyRequired: 'Public service presence.' },
  { orgSlug: 'all-in-one-enterprises', key: 'mobile_responsive', title: 'Mobile Responsiveness', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'COMPLETE', whyRequired: 'Field client access.' },
  { orgSlug: 'all-in-one-enterprises', key: 'authentication', title: 'Authentication', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'COMPLETE', whyRequired: 'Secure client access.' },
  { orgSlug: 'all-in-one-enterprises', key: 'load_board', title: 'Load Board', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Core brokerage operations.', wsKey: 'digital' },
  { orgSlug: 'all-in-one-enterprises', key: 'smart_intake', title: 'Smart Intake', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'COMPLETE', whyRequired: 'Structured service intake.' },
  { orgSlug: 'all-in-one-enterprises', key: 'permitting', title: 'Permitting', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Regulatory workflows.' },
  { orgSlug: 'all-in-one-enterprises', key: 'brokerage', title: 'Brokerage Operations', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Core service delivery.' },
  { orgSlug: 'all-in-one-enterprises', key: 'client_portal', title: 'Client Portal', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'IN_PROGRESS', whyRequired: 'Client self-service.' },
  { orgSlug: 'all-in-one-enterprises', key: 'payments', title: 'Payments', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'NOT_STARTED', whyRequired: 'Online service payment.' },
  { orgSlug: 'all-in-one-enterprises', key: 'legal_essentials', title: 'Legal Essentials', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'COMPLETE', whyRequired: 'Compliance pages.' },
  { orgSlug: 'all-in-one-enterprises', key: 'production_validation', title: 'Production Validation', classification: 'REQUIRED_FOR_LAUNCH', executionStatus: 'NOT_STARTED', whyRequired: 'Pre-launch QA validation.' },
  { orgSlug: 'all-in-one-enterprises', key: 'social_marketing', title: 'Social Marketing', classification: 'DEFERRED_BY_OWNER', executionStatus: 'NOT_STARTED', whyRequired: 'Owner elected core operations first.', canDefer: true },
  { orgSlug: 'all-in-one-enterprises', key: 'native_app', title: 'Native Application', classification: 'DEFERRED_BY_OWNER', executionStatus: 'NOT_STARTED', whyRequired: 'Deferred to post-launch.', canDefer: true },
  { orgSlug: 'all-in-one-enterprises', key: 'load_board_intelligence', title: 'Advanced Load Board Intelligence', classification: 'DEFERRED_BY_OWNER', executionStatus: 'NOT_STARTED', whyRequired: 'Advanced features deferred.', canDefer: true },
];

const ALL_REQS = [...SITE00_REQS, ...FS_REQS, ...AIO_REQS];

function uuid(prefix: string, n: number): string {
  return `${prefix}-00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
}

export function buildFixtureWorkstreams(
  orgBySlug: Map<string, OrganizationRow>,
): WorkstreamRow[] {
  const ws: WorkstreamRow[] = [];
  let n = 1;
  for (const org of orgBySlug.values()) {
    if (org.classification === 'PRODUCTION_INFRASTRUCTURE') continue;
    for (const stage of ['DIGITAL', 'COMMUNICATION', 'CAMPAIGN']) {
      ws.push({
        id: uuid('ws', n++),
        organization_id: org.id,
        project_id: null,
        stage_key: stage,
        workstream_key: `${org.slug}-${stage.toLowerCase()}`,
        title: `${stage} — ${org.name}`,
        description: `${stage} workstream for ${org.name}`,
        owner_email: null,
        attention_state: 'NORMAL',
        execution_status: 'IN_PROGRESS',
        metadata: { fixture: true },
      });
    }
  }
  return ws;
}

export function buildFixtureManifests(
  orgBySlug: Map<string, OrganizationRow>,
): LaunchManifestRow[] {
  let n = 1;
  return MANIFEST_SEEDS.map((seed) => {
    const org = orgBySlug.get(seed.orgSlug)!;
    return {
      id: uuid('mf', n++),
      organization_id: org.id,
      project_id: null,
      target_name: seed.targetName,
      target_type: seed.targetType,
      objective: seed.objective,
      target_date: null,
      manifest_state: seed.manifestState,
      approval_state: seed.approvalState,
      is_active: seed.isActive,
      readiness_score: null,
      readiness_explanation: {},
      approved_by: seed.approvalState === 'APPROVED' ? 'admin@site00.com' : null,
      approved_at: seed.approvalState === 'APPROVED' ? new Date().toISOString() : null,
      metadata: { fixture: true, label: 'DEMO / UNRECONCILED' },
    };
  });
}

export function buildFixtureRequirements(
  manifests: LaunchManifestRow[],
  workstreams: WorkstreamRow[],
  orgBySlug: Map<string, OrganizationRow>,
): ManifestRequirementRow[] {
  const manifestByOrgId = new Map<string, LaunchManifestRow>();
  for (const m of manifests) {
    if (m.is_active) manifestByOrgId.set(m.organization_id, m);
  }

  let n = 1;
  const reqs: ManifestRequirementRow[] = [];

  for (const seed of ALL_REQS) {
    const org = orgBySlug.get(seed.orgSlug);
    if (!org) continue;
    const manifest2 = manifestByOrgId.get(org.id);
    if (!manifest2) continue;

    const wsKey = seed.wsKey?.toUpperCase();
    const ws = workstreams.find(
      (w) => w.organization_id === manifest2.organization_id && w.stage_key === wsKey,
    );

    reqs.push({
      id: uuid('req', n++),
      manifest_id: manifest2.id,
      workstream_id: ws?.id ?? null,
      requirement_key: seed.key,
      title: seed.title,
      description: seed.whyRequired,
      why_required: seed.whyRequired,
      source_of_requirement: 'debug_fixture',
      classification: seed.classification,
      execution_status: seed.executionStatus,
      priority: seed.classification === 'REQUIRED_FOR_LAUNCH' ? 'HIGH' : 'MEDIUM',
      owner_email: null,
      can_defer: seed.canDefer ?? false,
      deferred_until: null,
      target_milestone: seed.classification === 'DEFERRED_BY_OWNER' ? 'EVOLVE' : null,
      blocking_impact: seed.executionStatus === 'BLOCKED' ? 'Blocks downstream campaign assets' : null,
      admin_notes: null,
      external_source_ref: null,
      sort_order: n,
      metadata: { fixture: true },
    });
  }

  return reqs;
}

export function buildFixtureDependencies(
  requirements: ManifestRequirementRow[],
  manifests: LaunchManifestRow[],
): RequirementDependencyRow[] {
  const deps: RequirementDependencyRow[] = [];
  let n = 1;

  const fsManifest = manifests.find((m) => m.target_type === 'FLAGSHIP_BRAND_LAUNCH' && m.is_active);
  if (!fsManifest) return deps;

  const byKey = new Map(
    requirements.filter((r) => r.manifest_id === fsManifest.id).map((r) => [r.requirement_key, r]),
  );

  const chain = [
    ['payments', 'checkout'],
    ['checkout', 'transaction_confirmation'],
  ] as const;

  for (const [source, target] of chain) {
    const src = byKey.get(source);
    const tgt = byKey.get(target);
    if (src && tgt) {
      deps.push({
        id: uuid('dep', n++),
        manifest_id: fsManifest.id,
        source_requirement_id: src.id,
        target_requirement_id: tgt.id,
        dependency_type: 'blocks',
      });
    }
  }

  return deps;
}

export function getEvolveItemsFromRequirements(
  requirements: ManifestRequirementRow[],
  orgId: string,
): Array<Record<string, unknown>> {
  return requirements
    .filter(
      (r) =>
        r.classification === 'DEFERRED_BY_OWNER' ||
        r.classification === 'OPTIONAL_POST_LAUNCH',
    )
    .map((r, i) => ({
      id: uuid('evolve', i + 1),
      organization_id: orgId,
      deferred_requirement_id: r.id,
      title: r.title,
      description: r.why_required,
      category: 'EVOLVE',
      priority: 'MEDIUM',
      status: 'PLANNED',
      metadata: { source: r.requirement_key },
    }));
}
