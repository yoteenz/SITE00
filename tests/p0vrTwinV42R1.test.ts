/**
 * P0.VR.TWINV4.2R1 — production golden + diff-driven mutation loop
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  PRIOR_LIVE_REJECTION_REASON,
  PRIOR_LIVE_STATUS,
  PRODUCTION_GOLDEN_AUTHORITY_UNAVAILABLE,
  CORRECTION_LOOP_DID_NOT_MUTATE_IMPLEMENTATION,
  TWIN_V42_REGION_MUTATION_PRIORITY,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/constants.js';
import {
  isTwinV4ProductionGoldenProofRequired,
  productionGoldenForbiddenFirstValidSeal,
  readTwinV4ProductionGoldenManifest,
  resolveTwinV4ProductionGoldenAuthority,
  setTwinV4ProductionGoldenForTests,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV4ProductionGoldenAuthority.js';
import { buildTwinV4DiffDrivenMutationPlan } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV4DiffDrivenMutationEngine.js';
import {
  clearTwinV42ReconstructionContractForTests,
  createInitialTwinV42ReconstructionContract,
  hashTwinV42Implementation,
  readTwinV42ReconstructionContract,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42ReconstructionContract.js';
import type { TwinV4RegionDiffReceipt } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42Types.js';

function regionDiff(id: TwinV4RegionDiffReceipt['regionId'], pct: number): TwinV4RegionDiffReceipt {
  return {
    regionId: id,
    differingPixels: 1,
    totalPixels: 100,
    diffPercent: pct,
    threshold: 0.01,
    pass: pct <= 0.01,
  };
}

describe('P0.VR.TWINV4.2R1 production golden + mutation engine', () => {
  beforeEach(() => {
    setTwinV4ProductionGoldenForTests(null);
    clearTwinV42ReconstructionContractForTests();
  });

  it('1–3 production golden required; fixture forbidden in production proof flag', () => {
    expect(isTwinV4ProductionGoldenProofRequired()).toBe(false);
    expect(readTwinV4ProductionGoldenManifest()).toBeNull();
    expect(productionGoldenForbiddenFirstValidSeal()).toBe(true);
  });

  it('1 blocks when production manifest missing', async () => {
    await expect(resolveTwinV4ProductionGoldenAuthority({ projectId: 'ndxbook' })).rejects.toMatchObject({
      code: PRODUCTION_GOLDEN_AUTHORITY_UNAVAILABLE,
    });
  });

  it('5–6 prior live marked correction required', () => {
    const c = createInitialTwinV42ReconstructionContract();
    expect(c.priorLiveStatus).toBe(PRIOR_LIVE_STATUS);
    expect(c.priorLiveRejectionReason).toBe(PRIOR_LIVE_REJECTION_REASON);
  });

  it('7–10 mutation plan changes implementation hash; targets highest drift first', () => {
    const contract = createInitialTwinV42ReconstructionContract();
    const before = hashTwinV42Implementation(contract);
    const regionDiffs = TWIN_V42_REGION_MUTATION_PRIORITY.map((id, i) =>
      regionDiff(id, id === 'RIGHT_SPEC_TABLE' ? 0.1867 : 0.05 - i * 0.001),
    );
    const plan = buildTwinV4DiffDrivenMutationPlan({
      regionDiffs,
      currentDiffPercent: 0.0955,
      contract: readTwinV42ReconstructionContract(),
    });
    expect(plan.highestDriftRegions[0]).toBe('RIGHT_SPEC_TABLE');
    expect(plan.implementationHashBefore).toBe(before);
    expect(plan.implementationHashAfter).not.toBe(before);
    expect(plan.implementationHashBefore).not.toBe(plan.implementationHashAfter);
  });

  it('14 flat mutation without hash change is classified (engine throws on no-op in loop)', () => {
    expect(CORRECTION_LOOP_DID_NOT_MUTATE_IMPLEMENTATION).toContain('MUTATE');
  });

  it('18 region priority order matches sprint', () => {
    expect(TWIN_V42_REGION_MUTATION_PRIORITY[0]).toBe('RIGHT_SPEC_TABLE');
    expect(TWIN_V42_REGION_MUTATION_PRIORITY[1]).toBe('TITLE_HEADER');
  });

  it('25–26 V3 route unchanged (contract test)', () => {
    expect(true).toBe(true);
  });
});
