import { describe, expect, it, beforeEach } from 'vitest';
import { resetOrchestrationStore } from './memoryStore.js';
import {
  approveManifest,
  deferRequirement,
  getReadinessForOrg,
  getOrchestrationDebugPayload,
  applyLaunchOverride,
  recordExternalEvidence,
  runReconciliation,
  decideReconciliation,
  proposeManifest,
  isParentBlockedByDependencies,
  validateManifestDependencies,
  CircularDependencyError,
} from './orchestrationService.js';
import { validateDependencyGraph } from './dependencyGraph.js';
import { calculateReadiness } from './readinessCalculator.js';
import { getRequirementsForManifest, findActiveManifest, findOrgBySlug, getOrchestrationStore } from './memoryStore.js';

beforeEach(() => {
  process.env.ORCHESTRATION_USE_MEMORY = '1';
  resetOrchestrationStore();
});

describe('orchestration — launch readiness', () => {
  it('1. A project can launch without social marketing when social is explicitly deferred', async () => {
    const readiness = await getReadinessForOrg('all-in-one-enterprises');
    expect(readiness).not.toBeNull();
    const social = (await getRequirementsForManifest(findActiveManifest(findOrgBySlug('all-in-one-enterprises')!.id)!.id)).find(
      (r) => r.requirement_key === 'social_marketing',
    );
    expect(social?.classification).toBe('DEFERRED_BY_OWNER');
    expect(readiness!.deferredItems).toBeGreaterThan(0);
  });

  it('2. Deferred items do not reduce current launch readiness', async () => {
    const org = findOrgBySlug('site-00')!;
    const manifest = findActiveManifest(org.id)!;
    const reqs = getRequirementsForManifest(manifest.id);
    const withDeferred = calculateReadiness(reqs, new Set());
    const withoutDeferred = calculateReadiness(
      reqs.filter((r) => r.classification !== 'DEFERRED_BY_OWNER'),
      new Set(),
    );
    expect(withDeferred.readinessScore).toBe(withoutDeferred.readinessScore);
  });

  it('3. Deferred items appear in EVOLVE', async () => {
    const payload = await getOrchestrationDebugPayload();
    expect(payload.evolveRoadmap.length).toBeGreaterThan(0);
  });

  it('4. Required incomplete items reduce readiness', async () => {
    const readiness = await getReadinessForOrg('site-00');
    expect(readiness!.requiredItems).toBeGreaterThan(0);
    expect(readiness!.readinessScore).toBeLessThan(100);
  });

  it('5. Blocked required items appear in the Command Queue', async () => {
    const payload = await getOrchestrationDebugPayload();
    expect(payload.commandQueue.some((q) => q.category === 'BLOCKED')).toBe(true);
  });

  it('6. An optional item does not block launch', () => {
    const store = resetOrchestrationStore();
    const optional = store.requirements.find(
      (r) => r.classification === 'OPTIONAL_POST_LAUNCH' || r.classification === 'DEFERRED_BY_OWNER',
    );
    expect(optional).toBeDefined();
    const readiness = calculateReadiness(getRequirementsForManifest(optional!.manifest_id), new Set());
    const contrib = readiness.contributingRequirements.find((c) => c.requirement_key === optional!.requirement_key);
    expect(contrib?.countsTowardReadiness).toBe(false);
  });

  it('7. An explicit launch override preserves the underlying incomplete state', async () => {
    const org = findOrgBySlug('frontal-slayer')!;
    const manifest = findActiveManifest(org.id)!;
    const analytics = getRequirementsForManifest(manifest.id).find((r) => r.requirement_key === 'analytics')!;
    const before = analytics.execution_status;
    await applyLaunchOverride(analytics.id, 'admin@test.com', 'Launch anyway', 'Acknowledged');
    expect(analytics.execution_status).toBe(before);
  });

  it('8. A dependency prevents parent completion where appropriate', async () => {
    const org = findOrgBySlug('frontal-slayer')!;
    const manifest = findActiveManifest(org.id)!;
    expect(await isParentBlockedByDependencies('payments', manifest.id)).toBe(true);
  });

  it('9. A circular dependency is rejected', () => {
    expect(() =>
      validateDependencyGraph([
        { source_requirement_id: 'a', target_requirement_id: 'b' },
        { source_requirement_id: 'b', target_requirement_id: 'c' },
        { source_requirement_id: 'c', target_requirement_id: 'a' },
      ]),
    ).toThrow(CircularDependencyError);
  });

  it('10. External evidence does not automatically mark a requirement complete', async () => {
    const org = findOrgBySlug('all-in-one-enterprises')!;
    const manifest = findActiveManifest(org.id)!;
    const reqBefore = getRequirementsForManifest(manifest.id).find((r) => r.requirement_key === 'load_board');
    expect(reqBefore).toBeDefined();
    const result = await recordExternalEvidence({
      organizationSlug: 'all-in-one-enterprises',
      requirementKey: 'load_board',
      title: 'GitHub commit affecting load-board routes',
      source: 'github',
    });
    expect(result.requirementUnchanged).toBe(true);
  });

  it('11. Reconciliation can suggest a state change without applying it', async () => {
    const org = findOrgBySlug('all-in-one-enterprises')!;
    const req = getRequirementsForManifest(findActiveManifest(org.id)!.id).find((r) => r.requirement_key === 'load_board');
    expect(req).toBeDefined();
    const record = await runReconciliation({
      organizationSlug: 'all-in-one-enterprises',
      requirementKey: 'load_board',
      declaredState: 'BUILDING',
    });
    expect(record.suggestedState ?? (record as { suggested_state?: string }).suggested_state).toBeTruthy();
    expect(req!.execution_status).toBe('IN_PROGRESS');
  });

  it('12. Studio World can exist as infrastructure without appearing as a normal managed client brand', async () => {
    const payload = await getOrchestrationDebugPayload();
    expect(payload.infrastructureOrganizations.some((o) => o.slug === 'studio-world')).toBe(true);
    expect(payload.clientFacingOrganizations.some((o) => o.slug === 'studio-world')).toBe(false);
  });

  it('13. Frontal Slayer can reference Studio World as its production engine', async () => {
    const payload = await getOrchestrationDebugPayload();
    expect(payload.relationships.some((r) => r.type === 'PRODUCTION_ENGINE')).toBe(true);
  });

  it('14. Two logical systems can reference the same physical repository', async () => {
    const payload = await getOrchestrationDebugPayload();
    expect(payload.relationships.some((r) => r.type === 'SHARED_REPOSITORY')).toBe(true);
  });

  it('15. The same methodology can support completely different launch manifests', async () => {
    const payload = await getOrchestrationDebugPayload();
    const types = new Set(payload.manifests.filter((m) => m.is_active).map((m) => m.target_type));
    expect(types.size).toBeGreaterThanOrEqual(3);
  });

  it('16. An admin can approve a proposed manifest', async () => {
    resetOrchestrationStore();
    const proposed = getOrchestrationStore().manifests.find((m) => m.approval_state === 'PENDING')!;
    const result = await approveManifest(proposed.id, 'admin@test.com');
    expect(result.ok).toBe(true);
    expect(proposed.is_active).toBe(true);
  });

  it('17. An unapproved proposed manifest cannot become authoritative', () => {
    resetOrchestrationStore();
    const proposed = getOrchestrationStore().manifests.find((m) => m.approval_state === 'PENDING')!;
    expect(proposed.is_active).toBe(false);
  });

  it('18. A deferred requirement retains audit history', async () => {
    const org = findOrgBySlug('site-00')!;
    const req = getRequirementsForManifest(findActiveManifest(org.id)!.id).find(
      (r) => r.requirement_key === 'marketing_automation',
    )!;
    const result = await deferRequirement(req.id, 'admin@test.com', 'Post-launch priority');
    expect(result.ok).toBe(true);
    expect(getOrchestrationStore().history.some((h) => h.event_type === 'REQUIREMENT_DEFERRED')).toBe(true);
  });

  it('19. A project next action can be determined from blockers/dependencies/approvals', async () => {
    const payload = await getOrchestrationDebugPayload();
    expect(payload.nextActions.length).toBeGreaterThan(0);
  });

  it('20. Readiness calculations are auditable from contributing requirements', async () => {
    const readiness = await getReadinessForOrg('all-in-one-enterprises');
    expect(readiness!.contributingRequirements.length).toBeGreaterThan(0);
    expect(readiness!.explanation.length).toBeGreaterThan(0);
  });
});

describe('orchestration — manifest builder', () => {
  it('generates different manifests per organization', () => {
    const aio = proposeManifest({ organizationSlug: 'all-in-one-enterprises' });
    const fs = proposeManifest({ organizationSlug: 'frontal-slayer' });
    expect(aio.targetType).toBe('CORE_OPERATIONS');
    expect(fs.targetType).toBe('FLAGSHIP_BRAND_LAUNCH');
    expect(aio.requirements.some((r) => r.requirement_key === 'load_board')).toBe(true);
    expect(aio.requirements.some((r) => r.classification === 'DEFERRED_BY_OWNER' && r.requirement_key === 'social_marketing')).toBe(true);
  });
});

describe('orchestration — dependency validation on fixtures', () => {
  it('fixture manifests have valid dependency graphs', async () => {
    const org = findOrgBySlug('frontal-slayer')!;
    const manifest = findActiveManifest(org.id)!;
    await expect(validateManifestDependencies(manifest.id)).resolves.not.toThrow();
  });
});

describe('orchestration — reconciliation decisions', () => {
  it('accept applies suggested state only after admin decision', async () => {
    const record = await runReconciliation({
      organizationSlug: 'all-in-one-enterprises',
      requirementKey: 'load_board',
      declaredState: 'BUILDING',
    });
    const id = String(record.id);
    const decided = await decideReconciliation(id, 'ACCEPT', 'admin@test.com');
    expect(decided.admin_decision ?? decided.metadata?.final_state).toBeTruthy();
  });
});

describe('orchestration — repository inventory', () => {
  it('local SITE 00 inventory finds email pack in progress', async () => {
    const { inventoryLocalSite00 } = await import('./repositoryInventory.js');
    const findings = inventoryLocalSite00(process.cwd());
    expect(findings.some((f) => f.workstream_key === 'email-pack' && f.metadata?.not_complete)).toBe(true);
    expect(findings.some((f) => f.workstream_key === 'orchestration-ui')).toBe(true);
  });
});

describe('orchestration — evidence safety', () => {
  it('GitHub evidence does not directly mark completion', async () => {
    const result = await recordExternalEvidence({
      organizationSlug: 'site-00',
      requirementKey: 'public_website',
      title: 'Route file exists',
      source: 'github',
    });
    expect(result.requirementUnchanged).toBe(true);
  });
});
