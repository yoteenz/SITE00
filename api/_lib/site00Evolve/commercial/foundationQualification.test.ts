import { beforeEach, describe, expect, it } from 'vitest';
import { resetEvolveStore } from '../memoryStore.js';
import { runNdxbookLegacyImport, resetNdxbookImportMemory } from '../providers/ndxbookLegacyImportService.js';
import { resolveEvolveFoundationQualification } from './foundationQualification.js';
import { setEvolveCommercialPlan, markEvolveFoundationCompleted } from './governedActions.js';

describe('EVOLVE Foundation qualification', () => {
  beforeEach(() => {
    resetEvolveStore();
    resetNdxbookImportMemory();
  });

  it('a standalone client with partial marketing intelligence still requires Foundation', async () => {
    // AIO seed has audience + primary_objective but no positioning_summary and no brand_voice canon entry.
    const result = await resolveEvolveFoundationQualification('all-in-one-enterprises');
    expect(result.status).toBe('FOUNDATION_REQUIRED');
    expect(result.missing).toEqual(expect.arrayContaining(['Positioning', 'Brand voice']));
    expect(result.satisfiedBy).toBe('NONE');
  });

  it('never falsely reports complete when intelligence is only partially present', async () => {
    const result = await resolveEvolveFoundationQualification('unknown-org-slug-xyz');
    expect(result.status).toBe('FOUNDATION_REQUIRED');
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.satisfiedBy).toBe('NONE');
  });

  it('NDXBOOK has imported canonical intelligence (positioning, audience, voice, objectives) and Foundation is waived', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const result = await resolveEvolveFoundationQualification('ndxbook');
    expect(result.status).toBe('FOUNDATION_WAIVED_WITH_CANONICAL_INTELLIGENCE');
    expect(result.missing).toEqual([]);
    expect(result.satisfiedBy).toBe('CONTENT_BRAIN_CANONICAL_INTELLIGENCE');
  });

  it('before legacy import, NDXBOOK truthfully requires Foundation (no canonical intelligence indexed yet)', async () => {
    const result = await resolveEvolveFoundationQualification('ndxbook');
    expect(result.status).toBe('FOUNDATION_REQUIRED');
  });

  it('explicit Foundation completion marks FOUNDATION_COMPLETED without touching canonical intelligence', async () => {
    await markEvolveFoundationCompleted('all-in-one-enterprises', 'founder@site00.com');
    const result = await resolveEvolveFoundationQualification('all-in-one-enterprises');
    expect(result.status).toBe('FOUNDATION_COMPLETED');
    expect(result.satisfiedBy).toBe('EXPLICIT_FOUNDATION_COMPLETION');
  });

  it('setting a commercial plan never mutates Foundation status', async () => {
    const before = await resolveEvolveFoundationQualification('all-in-one-enterprises');
    await setEvolveCommercialPlan('all-in-one-enterprises', 'evolve_growth', 'founder@site00.com');
    const after = await resolveEvolveFoundationQualification('all-in-one-enterprises');
    expect(after.status).toBe(before.status);
  });
});
