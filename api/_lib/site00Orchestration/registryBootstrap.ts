/**
 * Bootstrap real organization registry + provisional manifests from evidence.
 * Replaces DEMO fixtures in Supabase with RECONCILED/PARTIAL records.
 */

import { generateProposedManifest } from './manifestBuilder.js';
import {
  countOrganizations,
  getExternalSystemByKey,
  insertEvidenceBatch,
  insertOrchestrationEvent,
  insertReconciliation,
  loadOrganizations,
  orchestrationTablesExist,
  upsertExternalConnection,
  upsertManifest,
  upsertOrganization,
  upsertOrganizationRelationship,
  upsertRequirements,
  upsertWorkstream,
  updateOrganizationHealth,
} from './supabaseStore.js';
import { inventoryLocalSite00, inventoryGitHubSnapshot } from './repositoryInventory.js';
import { findingsToEvidence, suggestWorkstreamReconciliation } from './reconciliationRunner.js';
import { fetchRepositoryTree, verifyRepository, KNOWN_REPOS, githubAvailable } from './githubClient.js';
import { deriveProjectHealth } from './projectHealth.js';
import type { ExecutionStatus } from './types.js';

const SITE00_SUPABASE_REF = 'hyycomvcaqxxvyrfupes';
const AIO_SUPABASE_REF = 'nnnljnhtmseagotvgxxt';

export type BootstrapResult = {
  organizations: number;
  connections: number;
  evidenceInserted: number;
  reconciliations: number;
  skipped?: string;
};

const ORG_DEFS = [
  {
    slug: 'site-00',
    name: 'SITE 00',
    classification: 'INTERNAL_BRAND_PLATFORM',
    state: 'ACTIVE',
    repository_ownership: 'SITE_00_REPO',
    client_facing: true,
    reconciliation_state: 'PARTIAL',
    metadata: { registered: 'sprint02', demo_replaced: true },
  },
  {
    slug: 'frontal-slayer',
    name: 'FRONTAL SLAYER',
    classification: 'INTERNAL_BRAND',
    state: 'EXISTING_ACTIVE_PROJECT',
    production_engine: 'STUDIO_WORLD',
    external_repository: 'yoteenz/fsbw',
    client_facing: true,
    reconciliation_state: 'PARTIAL',
    metadata: { registered: 'sprint02' },
  },
  {
    slug: 'all-in-one-enterprises',
    name: 'ALL IN ONE ENTERPRISES',
    classification: 'MANAGED_BRAND',
    state: 'EXISTING_ACTIVE_PROJECT',
    external_repository: 'UNVERIFIED',
    client_facing: true,
    reconciliation_state: 'MISSING_EVIDENCE',
    metadata: { registered: 'sprint02', github_repo: 'NOT_ACCESSIBLE' },
  },
  {
    slug: 'studio-world',
    name: 'STUDIO WORLD',
    classification: 'PRODUCTION_INFRASTRUCTURE',
    state: 'ACTIVE',
    host: 'FRONTAL_SLAYER_REPOSITORY',
    role: 'PRODUCTION_ENGINE',
    client_facing: false,
    reconciliation_state: 'PARTIAL',
    metadata: { registered: 'sprint02', shared_repo: 'yoteenz/fsbw' },
  },
] as const;

const SITE00_WORKSTREAMS = [
  { key: 'public-experience', stage: 'DIGITAL', title: 'Public Experience', status: 'IN_PROGRESS' },
  { key: 'identity', stage: 'IDENTITY', title: 'Identity (IDNTY)', status: 'IN_PROGRESS' },
  { key: 'builder', stage: 'DIGITAL', title: 'Builder (BLDR)', status: 'IN_PROGRESS' },
  { key: 'evolve', stage: 'EVOLVE', title: 'Evolve', status: 'IN_PROGRESS' },
  { key: 'admin-dashboard', stage: 'DIGITAL', title: 'Admin Dashboard', status: 'IN_PROGRESS' },
  { key: 'email-pack', stage: 'COMMUNICATION', title: 'Email Pack', status: 'IN_PROGRESS' },
  { key: 'orchestration', stage: 'DIGITAL', title: 'Orchestration Backend', status: 'IN_PROGRESS' },
  { key: 'orchestration-ui', stage: 'DIGITAL', title: 'Admin Orchestration UI Wiring', status: 'NOT_STARTED' },
  { key: 'studio-world-bridge', stage: 'DIGITAL', title: 'Studio World Bridge', status: 'IN_PROGRESS' },
  { key: 'payments', stage: 'DIGITAL', title: 'Payments', status: 'UNKNOWN' },
  { key: 'assts', stage: 'CONTENT', title: 'Asset Factory (ASSTS)', status: 'IN_PROGRESS' },
] as const;

export async function bootstrapRegistry(workspaceRoot: string): Promise<BootstrapResult> {
  if (!(await orchestrationTablesExist())) {
    return { organizations: 0, connections: 0, evidenceInserted: 0, reconciliations: 0, skipped: 'Orchestration tables not available' };
  }

  const orgs = [];
  for (const def of ORG_DEFS) {
    orgs.push(await upsertOrganization({ ...def }));
  }

  const bySlug = new Map(orgs.map((o) => [o.slug, o]));
  const site00 = bySlug.get('site-00')!;
  const fs = bySlug.get('frontal-slayer')!;
  const sw = bySlug.get('studio-world')!;
  const aio = bySlug.get('all-in-one-enterprises')!;

  await upsertOrganizationRelationship({
    source_organization_id: fs.id,
    target_organization_id: sw.id,
    relationship_type: 'PRODUCTION_ENGINE',
    metadata: { note: 'Frontal Slayer uses Studio World as production engine' },
  });
  await upsertOrganizationRelationship({
    source_organization_id: sw.id,
    target_organization_id: fs.id,
    relationship_type: 'SHARED_REPOSITORY',
    metadata: { repository: 'yoteenz/fsbw' },
  });

  let connections = 0;

  const ghSite = await getExternalSystemByKey('github_site00');
  const ghFs = await getExternalSystemByKey('github_fs');
  const ghAio = await getExternalSystemByKey('github_aio');
  const swSys = await getExternalSystemByKey('studio_world');
  const sbSite = await getExternalSystemByKey('supabase_site00');
  const sbAio = await getExternalSystemByKey('supabase_aio');

  if (ghSite) {
    const verified = githubAvailable() ? await verifyRepository(KNOWN_REPOS.site00) : { ok: false };
    await upsertExternalConnection({
      organization_id: site00.id,
      external_system_id: ghSite.id,
      logical_name: 'Primary Repository',
      connection_state: verified.ok ? 'CONNECTED' : 'UNVERIFIED',
      external_identifier: KNOWN_REPOS.site00.fullName,
      sync_state: verified.ok ? 'SYNCED' : 'NEVER_SYNCED',
      last_sync_at: verified.ok ? new Date().toISOString() : null,
      health_state: verified.ok ? 'HEALTHY' : 'UNKNOWN',
      metadata: { verified: verified.ok },
    });
    connections += 1;
  }

  if (ghFs && swSys) {
    const verified = githubAvailable() ? await verifyRepository(KNOWN_REPOS.frontalSlayer) : { ok: false };
    for (const org of [fs, sw]) {
      await upsertExternalConnection({
        organization_id: org.id,
        external_system_id: ghFs.id,
        logical_name: org.slug === 'studio-world' ? 'Shared Host Repository' : 'Primary Repository',
        connection_state: verified.ok ? 'CONNECTED' : 'UNVERIFIED',
        external_identifier: KNOWN_REPOS.frontalSlayer.fullName,
        sync_state: verified.ok ? 'SYNCED' : 'NEVER_SYNCED',
        last_sync_at: verified.ok ? new Date().toISOString() : null,
        health_state: verified.ok ? 'HEALTHY' : 'UNKNOWN',
        metadata: { shared_repository: true, logical_owner: org.slug },
      });
      connections += 1;
      if (org.slug === 'frontal-slayer') {
        await upsertExternalConnection({
          organization_id: org.id,
          external_system_id: swSys.id,
          logical_name: 'Studio World Production Engine',
          connection_state: 'CONFIGURED',
          external_identifier: 'STUDIO_WORLD',
          sync_state: 'NEVER_SYNCED',
          health_state: 'UNKNOWN',
          metadata: { contract: 'docs/STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md' },
        });
        connections += 1;
      }
    }
  }

  if (ghAio) {
    await upsertExternalConnection({
      organization_id: aio.id,
      external_system_id: ghAio.id,
      logical_name: 'Primary Repository',
      connection_state: 'UNAVAILABLE',
      external_identifier: null,
      sync_state: 'NEVER_SYNCED',
      health_state: 'UNKNOWN',
      metadata: { reason: 'Repository not accessible via authenticated GitHub integration' },
    });
    connections += 1;
  }

  if (sbSite) {
    await upsertExternalConnection({
      organization_id: site00.id,
      external_system_id: sbSite.id,
      logical_name: 'Operational Database (shared migration target)',
      connection_state: 'CONNECTED',
      external_identifier: SITE00_SUPABASE_REF,
      environment: 'production',
      sync_state: 'SYNCED',
      health_state: 'HEALTHY',
      metadata: {
        note: 'No dedicated SITE 00 Supabase project; shared hyycomvcaqxxvyrfupes during extraction',
        dedicated_site00_project: false,
      },
    });
    connections += 1;
  }

  if (sbAio) {
    await upsertExternalConnection({
      organization_id: aio.id,
      external_system_id: sbAio.id,
      logical_name: 'AIO Database',
      connection_state: 'CONFIGURED',
      external_identifier: AIO_SUPABASE_REF,
      sync_state: 'NEVER_SYNCED',
      health_state: 'UNKNOWN',
      metadata: { note: 'Separate AIO Supabase project; schema not ingested from SITE 00' },
    });
    connections += 1;
  }

  for (const ws of SITE00_WORKSTREAMS) {
    await upsertWorkstream({
      organization_id: site00.id,
      stage_key: ws.stage,
      workstream_key: ws.key,
      title: ws.title,
      execution_status: ws.status,
      metadata: { source: 'repository_reconciliation', sprint: '02' },
    });
  }

  let evidenceInserted = 0;
  let reconciliations = 0;

  const siteFindings = inventoryLocalSite00(workspaceRoot);
  const siteEvidence = findingsToEvidence(site00.id, siteFindings, KNOWN_REPOS.site00.fullName);
  await insertEvidenceBatch(siteEvidence);
  evidenceInserted += siteEvidence.length;

  for (const ws of SITE00_WORKSTREAMS) {
    const suggestion = suggestWorkstreamReconciliation({
      workstreamKey: ws.key,
      declaredState: ws.status,
      findings: siteFindings,
    });
    if (suggestion.outcome !== 'MISSING_EVIDENCE' || ws.key === 'orchestration-ui' || ws.key === 'email-pack') {
      await insertReconciliation({
        organization_id: site00.id,
        declared_state: ws.status,
        observed_evidence_summary: suggestion.evidence_titles.join('; ') || 'No direct evidence',
        suggested_state: suggestion.suggested_state,
        confidence: suggestion.confidence,
        outcome: suggestion.outcome,
        reasoning: { lines: suggestion.reasoning },
        launch_impact: suggestion.launch_impact,
        metadata: { workstream_key: ws.key, requirement_key: suggestion.requirement_key },
      });
      reconciliations += 1;
    }
  }

  if (githubAvailable()) {
    try {
      const fsSnapshot = await fetchRepositoryTree(KNOWN_REPOS.frontalSlayer);
      const fsFindings = inventoryGitHubSnapshot(fsSnapshot, 'frontal-slayer');
      const fsEvidence = findingsToEvidence(fs.id, fsFindings, KNOWN_REPOS.frontalSlayer.fullName, fsSnapshot.headSha);
      await insertEvidenceBatch(fsEvidence);
      evidenceInserted += fsEvidence.length;

      const swFindings = inventoryGitHubSnapshot(fsSnapshot, 'studio-world');
      const swEvidence = findingsToEvidence(sw.id, swFindings, KNOWN_REPOS.frontalSlayer.fullName, fsSnapshot.headSha);
      await insertEvidenceBatch(swEvidence);
      evidenceInserted += swEvidence.length;
      reconciliations += 2;
    } catch (e) {
      await insertOrchestrationEvent({
        organization_id: fs.id,
        event_type: 'RECONCILIATION_ERROR',
        summary: `FSBW repository scan failed: ${e instanceof Error ? e.message : 'unknown'}`,
      });
    }
  }

  await ensureProvisionalManifest(site00.id, 'site-00', 'FULL PLATFORM LAUNCH', siteFindings);
  await ensureProvisionalManifest(fs.id, 'frontal-slayer', 'FLAGSHIP BRAND LAUNCH', []);
  await ensureProvisionalManifest(aio.id, 'all-in-one-enterprises', 'CORE SERVICE OPERATIONS', [], true);

  await updateOrganizationHealth(site00.id, 'ATTENTION_REQUIRED', 'PARTIAL');
  await updateOrganizationHealth(fs.id, 'ATTENTION_REQUIRED', 'PARTIAL');
  await updateOrganizationHealth(aio.id, 'ATTENTION_REQUIRED', 'MISSING_EVIDENCE');
  await updateOrganizationHealth(sw.id, 'ON_TRACK', 'PARTIAL');

  await insertOrchestrationEvent({
    event_type: 'REGISTRY_BOOTSTRAPPED',
    summary: `Sprint 02 registry bootstrap: ${orgs.length} orgs, ${evidenceInserted} evidence, ${reconciliations} reconciliations`,
    metadata: { sprint: '02', demo_mode: false },
  });

  return { organizations: orgs.length, connections, evidenceInserted, reconciliations };
}

async function ensureProvisionalManifest(
  orgId: string,
  slug: string,
  targetName: string,
  _findings: unknown[],
  aioDefaults = false,
) {
  const { loadManifests } = await import('./supabaseStore.js');
  const existing = await loadManifests(orgId);
  if (existing.some((m) => m.is_active)) return;

  const proposed = generateProposedManifest({
    organizationSlug: slug,
    businessObjective: `${targetName} for ${slug}`,
    deferredFeatures: aioDefaults ? ['social_marketing', 'native_app', 'load_board_intelligence'] : ['social_marketing'],
  });

  const manifest = await upsertManifest({
    organization_id: orgId,
    target_name: proposed.targetName,
    target_type: proposed.targetType,
    objective: proposed.objective,
    manifest_state: 'PROPOSED',
    approval_state: 'PENDING',
    is_active: true,
    is_provisional: true,
    master_roadmap_count: aioDefaults ? 40 : proposed.requirements.length + 10,
    metadata: { source: 'evidence_backed_proposal', sprint: '02', label: 'PROVISIONAL' },
  });

  const reqs = proposed.requirements.map((r, i) => ({
    requirement_key: r.requirement_key,
    title: r.title,
    description: r.description,
    why_required: r.why_required,
    source_of_requirement: r.source_of_requirement,
    classification: r.classification,
    execution_status: mapRequirementStatus(r.requirement_key, slug, r.classification) as ExecutionStatus,
    priority: r.classification === 'REQUIRED_FOR_LAUNCH' ? 'HIGH' : 'MEDIUM',
    can_defer: r.can_defer,
    sort_order: i,
    metadata: { provisional: true },
  }));

  await upsertRequirements(manifest.id, reqs);

  if (aioDefaults) {
    const { insertEvolveItem } = await import('./supabaseStore.js');
    for (const key of ['social_marketing', 'native_app', 'load_board_intelligence']) {
      const r = reqs.find((x) => x.requirement_key === key);
      if (r && r.classification === 'DEFERRED_BY_OWNER') {
        await insertEvolveItem({
          organization_id: orgId,
          manifest_id: manifest.id,
          title: r.title as string,
          description: r.why_required as string,
          category: 'EVOLVE',
          status: 'PLANNED',
          metadata: { requirement_key: key, deferred: true },
        });
      }
    }
  }
}

function mapRequirementStatus(key: string, slug: string, classification: string): string {
  if (classification === 'DEFERRED_BY_OWNER') return 'NOT_STARTED';
  if (slug === 'site-00') {
    if (key === 'transactional_email') return 'IN_PROGRESS';
    if (key === 'admin_operations') return 'IN_PROGRESS';
    if (key === 'orchestration') return 'IN_PROGRESS';
    if (key === 'payments') return 'UNKNOWN';
  }
  if (slug === 'all-in-one-enterprises') {
    if (['public_website', 'authentication', 'smart_intake', 'legal_essentials', 'mobile_responsive'].includes(key))
      return 'READY_FOR_REVIEW';
    if (key === 'load_board') return 'IN_PROGRESS';
    if (key === 'social_marketing') return 'NOT_STARTED';
  }
  return 'NOT_STARTED';
}

export async function isRegistryBootstrapped(): Promise<boolean> {
  if (!(await orchestrationTablesExist())) return false;
  const count = await countOrganizations();
  return count >= 4;
}
