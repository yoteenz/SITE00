import { describe, expect, it } from 'vitest';
import { toClientBlueprintEstimate } from './clientContract';
import { estimateProject } from './engine';
import {
  FIXTURE_ADVANCED_COMMERCE,
  FIXTURE_LARGE_PRODUCT,
  FIXTURE_PORTAL_SYSTEM,
  FIXTURE_SIMPLE_SERVICE,
  FIXTURE_SPATIAL_WORLD,
  FIXTURE_STANDARD_EDITORIAL,
  FIXTURE_ZERO_FAMILIES,
} from './fixtures';
import { appendCalibration, createEstimateRecord } from './persistence';
import type { ProjectEstimateConfig, ProjectEstimateResult } from './types';
import { ESTIMATOR_VERSION } from './version';

function must(config: ProjectEstimateConfig): ProjectEstimateResult {
  const outcome = estimateProject(config);
  if (!outcome.ok) throw new Error(outcome.errors.join(' '));
  return outcome.result;
}

describe('scope estimation engine', () => {
  it('orders fixtures by complexity', () => {
    const simple = must(FIXTURE_SIMPLE_SERVICE).expectedWeeks;
    const standard = must(FIXTURE_STANDARD_EDITORIAL).expectedWeeks;
    const advanced = must(FIXTURE_ADVANCED_COMMERCE).expectedWeeks;
    const large = must(FIXTURE_LARGE_PRODUCT).expectedWeeks;
    const world = must(FIXTURE_SPATIAL_WORLD).expectedWeeks;
    const portal = must(FIXTURE_PORTAL_SYSTEM).expectedWeeks;
    expect(simple).toBeLessThan(standard);
    expect(standard).toBeLessThan(advanced);
    expect(advanced).toBeLessThan(large);
    expect(large).toBeLessThan(world);
    expect(large).toBeLessThan(portal);
  });

  it('derives a 16-family calendar below raw effort and above a blind half', () => {
    const result = must(FIXTURE_LARGE_PRODUCT);
    expect(result.breakdown).toHaveLength(16);
    expect(result.familyUnits).toBeGreaterThan(20);
    expect(result.familyUnits).toBeLessThan(32);
    expect(result.rawProductionWeeks).toBeGreaterThan(40);
    expect(result.rawProductionWeeks).toBeLessThan(64);
    expect(result.expectedWeeks).toBeLessThan(result.rawProductionWeeks * 0.75);
    expect(result.expectedWeeks).toBeGreaterThan(result.rawProductionWeeks * 0.5);
    expect(result.effectiveLanes).toBe(2);
  });

  it('compresses priority without halving time or dropping serial work', () => {
    const standard = must(FIXTURE_LARGE_PRODUCT);
    const priority = must({ ...FIXTURE_LARGE_PRODUCT, deliveryMode: 'PRIORITY' });
    const ratio = priority.expectedWeeks / standard.expectedWeeks;
    expect(ratio).toBeGreaterThan(0.55);
    expect(ratio).toBeLessThan(0.8);
    expect(priority.serialWeeks).toBe(standard.serialWeeks);
    expect(priority.effectiveLanes).toBeGreaterThan(standard.effectiveLanes);
    expect(priority.investmentExpected).toBeGreaterThan(standard.investmentExpected * 1.7);
    expect(priority.priorityFeasible).toBe(true);
  });

  it('refuses priority compression when the founder marks it infeasible', () => {
    const blocked = must({
      ...FIXTURE_LARGE_PRODUCT,
      deliveryMode: 'PRIORITY',
      manualModifiers: [
        {
          id: 'ov1',
          field: 'priorityFeasible',
          value: false,
          reason: 'Brand lock is still open.',
          author: 'founder',
          timestamp: '2026-10-08T00:00:00.000Z',
        },
      ],
    });
    expect(blocked.priorityFeasible).toBe(false);
    expect(blocked.effectiveLanes).toBe(2);
  });

  it('widens the range when risks are present', () => {
    const calm = must(FIXTURE_STANDARD_EDITORIAL);
    const risky = must({
      ...FIXTURE_STANDARD_EDITORIAL,
      riskFlags: ['CLIENT_CONTENT_PENDING', 'BRAND_NOT_FINAL'],
    });
    const calmSpread = calm.highWeeks - calm.lowWeeks;
    const riskySpread = risky.highWeeks - risky.lowWeeks;
    expect(riskySpread).toBeGreaterThan(calmSpread);
    expect(risky.highWeeks).toBeGreaterThan(calm.highWeeks);
  });

  it('adds client review time without hiding it inside studio lanes', () => {
    const two = must(FIXTURE_SIMPLE_SERVICE);
    const four = must({ ...FIXTURE_SIMPLE_SERVICE, reviewRounds: 4 });
    expect(four.reviewBufferWeeks).toBeGreaterThan(two.reviewBufferWeeks);
    expect(four.expectedWeeks - two.expectedWeeks).toBeCloseTo(four.reviewBufferWeeks - two.reviewBufferWeeks, 1);
  });

  it('keeps a founder override beside the calculated value', () => {
    const result = must({
      ...FIXTURE_SIMPLE_SERVICE,
      manualModifiers: [
        {
          id: 'ov-weeks',
          field: 'timelineWeeks',
          value: 12,
          reason: 'Client is away in November.',
          author: 'founder',
          timestamp: '2026-10-08T00:00:00.000Z',
        },
      ],
    });
    expect(result.expectedWeeks).toBe(12);
    expect(result.overridesApplied).toHaveLength(1);
    expect(result.calculatedFamilyUnits).toBeGreaterThan(0);
  });

  it('rejects an override with no reason and a negative descendant count', () => {
    const missingReason = estimateProject({
      ...FIXTURE_SIMPLE_SERVICE,
      manualModifiers: [
        { id: 'x', field: 'familyUnits', value: 4, reason: ' ', author: 'founder', timestamp: '2026-10-08T00:00:00.000Z' },
      ],
    });
    expect(missingReason.ok).toBe(false);
    const negative = estimateProject({
      ...FIXTURE_SIMPLE_SERVICE,
      families: [{ id: 'bad', label: 'Bad', familyClass: 'LIGHT', descendantCount: -1 }],
    });
    expect(negative.ok).toBe(false);
  });

  it('marks a tree past 35 descendants as custom scope', () => {
    const result = must({
      ...FIXTURE_SIMPLE_SERVICE,
      families: [{ id: 'wide', label: 'Wide', familyClass: 'STANDARD', descendantCount: 40 }],
    });
    expect(result.customScopeRequired).toBe(true);
    expect(result.riskFlags).toContain('LARGE_DESCENDANT_TREE');
  });

  it('estimates a world with no page families and a system with no site families', () => {
    const world = must(FIXTURE_SPATIAL_WORLD);
    const system = must({ ...FIXTURE_PORTAL_SYSTEM, families: [], systems: ['ops', 'roles', 'audit'] });
    const empty = must(FIXTURE_ZERO_FAMILIES);
    expect(world.familyUnits).toBeGreaterThan(10);
    expect(world.worldCalibrationNeeded).toBe(true);
    expect(world.breakdown).toHaveLength(0);
    expect(system.familyUnits).toBeGreaterThan(0);
    expect(empty.familyUnits).toBe(0);
    expect(empty.expectedWeeks).toBeGreaterThan(0);
  });

  it('versions the snapshot and does not change coefficients when calibration is stored', () => {
    const result = must(FIXTURE_SIMPLE_SERVICE);
    const record = createEstimateRecord(FIXTURE_SIMPLE_SERVICE, result, '2026-10-08T12:00:00.000Z');
    expect(record.estimatorVersion).toBe(ESTIMATOR_VERSION);
    expect(record.result.estimatorVersion).toBe(ESTIMATOR_VERSION);
    expect(record.config).toEqual(FIXTURE_SIMPLE_SERVICE);
    const before = result.familyUnits;
    const store = appendCalibration([], {
      estimateId: 'est-1',
      estimatedFu: result.familyUnits,
      actualProductionWeeks: 7,
      estimatedWeeks: result.expectedWeeks,
      actualWeeks: 9,
      estimatedCost: result.investmentExpected,
      actualInternalCost: 4000,
      revisionCount: 2,
      delayCauses: ['client review'],
      recordedAt: '2026-10-08T12:00:00.000Z',
    });
    expect(store).toHaveLength(1);
    expect(must(FIXTURE_SIMPLE_SERVICE).familyUnits).toBe(before);
  });

  it('speaks in ranges and does not issue a binding quote', () => {
    const result = must(FIXTURE_ADVANCED_COMMERCE);
    const client = toClientBlueprintEstimate(FIXTURE_ADVANCED_COMMERCE, result);
    expect(client.document).toBe('PROJECTED ESTIMATE');
    expect(client.binding).toBe(false);
    expect(result.bindingQuote).toBe(false);
    expect(result.approvals.quoteApproved).toBe(false);
    expect(result.approvals.foundationApproved).toBe(false);
    expect(result.approvals.clientAccepted).toBe(false);
    expect(result.approvals.timelineLocked).toBe(false);
    expect(client.productionWindow).toBe('6–8 MONTHS');
    const portal = toClientBlueprintEstimate(FIXTURE_PORTAL_SYSTEM, must(FIXTURE_PORTAL_SYSTEM));
    expect(portal.productionWindow).toBe('10–12 MONTHS');
    expect(client.investmentRange).toMatch(/^\$\d+K–\$\d+K$/);
    expect(client.productionWindow.includes('.')).toBe(false);
    expect(JSON.stringify(client).includes('familyUnits')).toBe(false);
    expect(result.lowWeeks).toBeLessThan(result.expectedWeeks);
    expect(result.expectedWeeks).toBeLessThan(result.highWeeks);
  });
});
