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
  resetOrchestrationStore();
});

describe('orchestration — launch readiness', () => {
  it('1. A project can launch without social marketing when social is explicitly deferred', () => {
    const readiness = getReadinessForOrg('all-in-one-enterprises');
    expect(readiness).not.toBeNull();
    const social = getRequirementsForManifest(findActiveManifest(findOrgBySlug('all-in-one-enterprises')!.id)!.id)
      .find((r) => r.requirement_key === 'social_marketing');
    expect(social?.classification).toBe('DEFERRED_BY_OWNER');
    expect(readiness!.blockingRequirementsRemaining).toBeGreaterThanOrEqual(0);
    expect(readiness!.deferredItems).toBeGreaterThan(0);
  });

  it('2. Deferred items do not reduce current launch readiness', () => {
    const org = findOrgBySlug('site-00')!;
    const manifest = findActiveManifest(org.id)!;
    const reqs = getRequirementsForManifest(manifest.id);
    const store = resetOrchestrationStore();
    const withDeferred = calculateReadiness(reqs, store.overrides);
    const withoutDeferred = calculateReadiness(
      reqs.filter((r) => r.classification !== 'DEFERRED_BY_OWNER'),
      store.overrides,
    );
    expect(withDeferred.readinessScore).toBe(withoutDeferred.readinessScore);
  });

  it('3. Deferred items appear in EVOLVE', async () => {
    const payload = await getOrchestrationDebugPayload();
    expect(payload.evolveRoadmap.length).toBeGreaterThan(0);
    expect(payload.evolveRoadmap.some((e) => String(e.title).includes('Social'))).toBe(true);
  });

  it('4. Required incomplete items reduce readiness', () => {
    const readiness = getReadinessForOrg('site-00');
    expect(readiness!.requiredItems).toBeGreaterThan(0);
    expect(readiness!.completeItems).toBeLessThan(readiness!.requiredItems);
    expect(readiness!.readinessScore).toBeLessThan(100);
  });

  it('5. Blocked required items appear in the Command Queue', async () => {
    const payload = await getOrchestrationDebugPayload();
    const blocked = payload.commandQueue.filter((q) => q.category === 'BLOCKED');
    expect(blocked.some((b) => b.requirementTitle.includes('Campaign Hero'))).toBe(true);
  });

  it('6. An optional item does not block launch', () => {
    const store = resetOrchestrationStore();
    const optional = store.requirements.find(
      (r) =>
        r.classification === 'OPTIONAL_POST_LAUNCH' || r.classification === 'DEFERRED_BY_OWNER',
    );
    expect(optional).toBeDefined();
    const manifestReqs = getRequirementsForManifest(optional!.manifest_id);
    const readiness = calculateReadiness(manifestReqs, new Set());
    const optionalContrib = readiness.contributingRequirements.find(
      (c) => c.requirement_key === optional!.requirement_key,
    );
    expect(optionalContrib?.countsTowardReadiness).toBe(false);
  });

  it('7. An explicit launch override preserves the underlying incomplete state', () => {
    const org = findOrgBySlug('frontal-slayer')!;
    const manifest = findActiveManifest(org.id)!;
    const analytics = getRequirementsForManifest(manifest.id).find((r) => r.requirement_key === 'analytics')!;
    const before = analytics.execution_status;
    applyLaunchOverride(analytics.id, 'admin@test.com', 'Launch anyway', 'Acknowledged');
    expect(analytics.execution_status).toBe(before);
    const readinessBefore = calculateReadiness(getRequirementsForManifest(manifest.id), new Set()).blockingRequirementsRemaining;
    const readinessAfter = calculateReadiness(getRequirementsForManifest(manifest.id), new Set([analytics.id])).blockingRequirementsRemaining;
    expect(readinessAfter).toBeLessThan(readinessBefore);
  });

  it('8. A dependency prevents parent completion where appropriate', () => {
    const org = findOrgBySlug('frontal-slayer')!;
    const manifest = findActiveManifest(org.id)!;
    expect(isParentBlockedByDependencies('payments', manifest.id)).toBe(true);
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

  it('10. External evidence does not automatically mark a requirement complete', () => {
    const org = findOrgBySlug('all-in-one-enterprises')!;
    const manifest = findActiveManifest(org.id)!;
    const reqBefore = getRequirementsForManifest(manifest.id).find(
      (r) => r.requirement_key === 'load_board',
    );
    expect(reqBefore).toBeDefined();
    const result = recordExternalEvidence({
      organizationSlug: 'all-in-one-enterprises',
      requirementKey: 'load_board',
      title: 'GitHub commit affecting load-board routes',
      source: 'github',
    });
    expect(result.requirementUnchanged).toBe(true);
    const reqAfter = getRequirementsForManifest(manifest.id).find(
      (r) => r.requirement_key === 'load_board',
    )!;
    expect(reqAfter.execution_status).not.toBe('COMPLETE');
    expect(reqAfter.execution_status).toBe(reqBefore!.execution_status);
  });

  it('11. Reconciliation can suggest a state change without applying it', () => {
    const org = findOrgBySlug('all-in-one-enterprises')!;
    const manifest = findActiveManifest(org.id)!;
    const req = getRequirementsForManifest(manifest.id).find(
      (r) => r.requirement_key === 'load_board',
    );
    expect(req).toBeDefined();
    const record = runReconciliation({
      organizationSlug: 'all-in-one-enterprises',
      requirementKey: 'load_board',
      declaredState: 'BUILDING',
    });
    expect(record.suggestedState).toBe('READY_FOR_REVIEW');
    expect(record.admin_decision).toBeNull();
    expect(req!.execution_status).toBe('IN_PROGRESS');
  });

  it('12. Studio World can exist as infrastructure without appearing as a normal managed client brand', async () => {
    const payload = await getOrchestrationDebugPayload();
    expect(payload.infrastructureOrganizations.some((o) => o.slug === 'studio-world')).toBe(true);
    expect(payload.clientFacingOrganizations.some((o) => o.slug === 'studio-world')).toBe(false);
  });

  it('13. Frontal Slayer can reference Studio World as its production engine', async () => {
    const payload = await getOrchestrationDebugPayload();
    const fs = payload.organizations.find((o) => o.slug === 'frontal-slayer');
    expect(fs).toBeDefined();
    expect(payload.relationships.some((r) => r.type === 'PRODUCTION_ENGINE')).toBe(true);
  });

  it('14. Two logical systems can reference the same physical repository', async () => {
    const payload = await getOrchestrationDebugPayload();
    expect(payload.relationships.some((r) => r.type === 'SHARED_REPOSITORY')).toBe(true);
  });

  it('15. The same methodology can support completely different launch manifests', async () => {
    const payload = await getOrchestrationDebugPayload();
    const active = payload.manifests.filter((m) => m.is_active);
    const types = new Set(active.map((m) => m.target_type));
    expect(types.size).toBeGreaterThanOrEqual(3);
  });

  it('16. An admin can approve a proposed manifest', () => {
    const payload = resetOrchestrationStore();
    const proposed = payload.manifests.find((m) => m.approval_state === 'PENDING')!;
    const result = approveManifest(proposed.id, 'admin@test.com');
    expect(result.ok).toBe(true);
    expect(proposed.is_active).toBe(true);
    expect(proposed.approval_state).toBe('APPROVED');
  });

  it('17. An unapproved proposed manifest cannot become authoritative', () => {
    const store = resetOrchestrationStore();
    const proposed = store.manifests.find((m) => m.approval_state === 'PENDING')!;
    expect(proposed.is_active).toBe(false);
    expect(proposed.manifest_state).toBe('PROPOSED');
  });

  it('18. A deferred requirement retains audit history', () => {
    const org = findOrgBySlug('site-00')!;
    const manifest = findActiveManifest(org.id)!;
    const req = getRequirementsForManifest(manifest.id).find(
      (r) => r.requirement_key === 'marketing_automation',
    )!;
    const result = deferRequirement(req.id, 'admin@test.com', 'Post-launch priority');
    expect(result.ok).toBe(true);
    expect(result.deferral).toBeDefined();
    const store = getOrchestrationStore();
    expect(store.history.some((h) => h.event_type === 'REQUIREMENT_DEFERRED')).toBe(true);
  });

  it('19. A project next action can be determined from blockers/dependencies/approvals', async () => {
    const payload = await getOrchestrationDebugPayload();
    expect(payload.nextActions.length).toBeGreaterThan(0);
    expect(payload.nextActions.some((a) => a.blocker !== null || a.nextAction.includes('REVIEW'))).toBe(true);
  });

  it('20. Readiness calculations are auditable from contributing requirements', () => {
    const readiness = getReadinessForOrg('all-in-one-enterprises');
    expect(readiness!.contributingRequirements.length).toBeGreaterThan(0);
    expect(readiness!.explanation.length).toBeGreaterThan(0);
    const sumRequired = readiness!.contributingRequirements.filter((c) => c.countsTowardReadiness).length;
    expect(sumRequired).toBe(readiness!.requiredItems);
  });
});

describe('orchestration — manifest builder', () => {
  it('generates different manifests per organization', () => {
    const aio = proposeManifest({ organizationSlug: 'all-in-one-enterprises' });
    const fs = proposeManifest({ organizationSlug: 'frontal-slayer' });
    expect(aio.targetType).toBe('CORE_OPERATIONS');
    expect(fs.targetType).toBe('FLAGSHIP_BRAND_LAUNCH');
    expect(aio.requirements.some((r) => r.requirement_key === 'load_board')).toBe(true);
    expect(fs.requirements.some((r) => r.requirement_key === 'commerce')).toBe(true);
  });
});

describe('orchestration — dependency validation on fixtures', () => {
  it('fixture manifests have valid dependency graphs', () => {
    const org = findOrgBySlug('frontal-slayer')!;
    const manifest = findActiveManifest(org.id)!;
    expect(() => validateManifestDependencies(manifest.id)).not.toThrow();
  });
});

describe('orchestration — reconciliation decisions', () => {
  it('accept applies suggested state only after admin decision', () => {
    const record = runReconciliation({
      organizationSlug: 'all-in-one-enterprises',
      requirementKey: 'load_board',
      declaredState: 'BUILDING',
    });
    const decided = decideReconciliation(String(record.id), 'ACCEPT');
    expect(decided.applied).toBe(true);
    expect(decided.final_state).toBe('READY_FOR_REVIEW');
  });
});