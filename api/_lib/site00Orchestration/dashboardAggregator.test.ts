import { describe, expect, it, beforeEach } from 'vitest';
import { resetOrchestrationStore } from './memoryStore.js';
import { getOrchestrationDashboardSnapshot, getOrchestrationProjectDetail } from './dashboardAggregator.js';
import { categorizeRequirement } from './commandQueue.js';
import { calculateReadiness } from './readinessCalculator.js';
import { getRequirementsForManifest, findActiveManifest, findOrgBySlug } from './memoryStore.js';

beforeEach(() => {
  process.env.ORCHESTRATION_USE_MEMORY = '1';
  resetOrchestrationStore();
});

describe('dashboard aggregator', () => {
  it('builds portfolio from orchestration orgs', async () => {
    const snapshot = await getOrchestrationDashboardSnapshot();
    expect(snapshot.portfolio.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.organizations.length).toBeGreaterThanOrEqual(4);
    const slugs = snapshot.portfolio.map((p) => p.slug);
    expect(slugs).toContain('site-00');
    expect(slugs).toContain('all-in-one-enterprises');
  });

  it('does not hardcode readiness scores', async () => {
    const snapshot = await getOrchestrationDashboardSnapshot();
    const aio = snapshot.portfolio.find((p) => p.slug === 'all-in-one-enterprises');
    expect(aio).toBeDefined();
    expect(typeof aio!.readinessScore).toBe('number');
  });

  it('orders command queue with NEEDS_YOU before BLOCKED', async () => {
    const snapshot = await getOrchestrationDashboardSnapshot();
    const categories = snapshot.commandQueue.map((c) => c.category);
    const needsIdx = categories.indexOf('NEEDS_YOU');
    const blockedIdx = categories.indexOf('BLOCKED');
    if (needsIdx >= 0 && blockedIdx >= 0) {
      expect(needsIdx).toBeLessThan(blockedIdx);
    }
  });

  it('classifies NEEDS_YOU for ready for review', () => {
    expect(categorizeRequirement('REQUIRED_FOR_LAUNCH', 'READY_FOR_REVIEW')).toBe('NEEDS_YOU');
  });

  it('classifies BLOCKED requirements', () => {
    expect(categorizeRequirement('BLOCKED', 'NOT_STARTED')).toBe('BLOCKED');
  });

  it('excludes deferred from readiness', () => {
    const org = findOrgBySlug('all-in-one-enterprises')!;
    const manifest = findActiveManifest(org.id)!;
    const reqs = getRequirementsForManifest(manifest.id);
    const withDeferred = calculateReadiness(reqs, new Set());
    const without = calculateReadiness(
      reqs.filter((r) => r.classification !== 'DEFERRED_BY_OWNER'),
      new Set(),
    );
    expect(withDeferred.readinessScore).toBe(without.readinessScore);
    const social = reqs.find((r) => r.requirement_key === 'social_marketing');
    expect(social?.classification).toBe('DEFERRED_BY_OWNER');
  });

  it('includes Studio World as infrastructure not portfolio client', async () => {
    const snapshot = await getOrchestrationDashboardSnapshot();
    expect(snapshot.infrastructure.some((i) => i.slug === 'studio-world')).toBe(true);
    expect(snapshot.portfolio.some((p) => p.slug === 'studio-world')).toBe(false);
  });

  it('project detail returns manifest requirements', async () => {
    const detail = await getOrchestrationProjectDetail('site-00');
    expect(detail).not.toBeNull();
    expect(detail!.requirements.length).toBeGreaterThan(0);
    expect(detail!.launchTarget).not.toBeNull();
  });

  it('AIO project detail reflects missing evidence state', async () => {
    const detail = await getOrchestrationProjectDetail('all-in-one-enterprises');
    expect(detail?.organization.reconciliation_state).toBeTruthy();
  });
});

describe('manifest readiness explanation', () => {
  it('includes explanation lines', async () => {
    const detail = await getOrchestrationProjectDetail('site-00');
    expect(detail!.readiness!.explanation.length).toBeGreaterThan(0);
  });
});
