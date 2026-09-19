/**
 * P0.5E.1A — Daily Cadence Reconciliation + Second-Reel Policy Cleanup + Volume Semantics
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AUTONOMOUS_PUBLISHING_ENABLED,
  BRAND_CANON_MUTATED,
  BRAND_CHARACTER_MUTATED,
  CADENCE_FAILURE_STATES,
  PRODUCT_EXPRESSION_IMPLEMENTED,
  WORLD_FORMATION_IMPLEMENTED,
} from '../site00-studio-world-production/dailyPublishingCadence/constants.js';
import {
  cadenceDoesNotForceFiller,
  crossPlatformDoesNotMultiplyResearchPremises,
  detectForcedPremiseCreation,
  emptySecondReelSlotIsValid,
  evaluateCadenceFulfillmentDetailed,
  evaluateSecondReelEligibility,
  primaryEventTargetIsPlanningCapacity,
} from '../site00-studio-world-production/dailyPublishingCadence/contentSupply.js';
import {
  baselineCostUsesTargetReels,
  estimateWeeklyContentCost,
  optionalReelCostRequiresApproval,
} from '../site00-studio-world-production/dailyPublishingCadence/costModel.js';
import { reactivatePrimaryContentEvent, buildDailyPrimaryContentEvent } from '../site00-studio-world-production/dailyPublishingCadence/crossPlatformDerivation.js';
import {
  dailyPublishingUnitVolume,
  isBaselineVolumeLabel,
  weeklyPublishingUnitVolume,
} from '../site00-studio-world-production/dailyPublishingCadence/publishingCadencePolicy.js';
import { formatSecondReelSlotLabel } from '../site00-studio-world-production/dailyPublishingCadence/reelSlotPresentation.js';
import {
  CADENCE_DOES_NOT_FORCE_FILLER,
  CADENCE_IS_NOT_QUOTA,
  NDX_DAILY_BASELINE_PUBLISHING_UNITS,
  NDX_DAILY_MAX_NORMAL_PUBLISHING_UNITS,
  NDX_INSTAGRAM_FEED_TARGET_PER_DAY,
  NDX_INSTAGRAM_REEL_MAX_NORMAL_PER_DAY,
  NDX_INSTAGRAM_REEL_TARGET_PER_DAY,
  NDX_INSTAGRAM_STORY_TARGET_PER_DAY,
  NDX_WEEKLY_BASELINE_PUBLISHING_UNITS,
  NDX_WEEKLY_MAX_NORMAL_PUBLISHING_UNITS,
  OPTIONAL_CAPACITY_IS_NOT_TARGET,
  SECOND_REEL_OPTIONAL_POLICY_IMPLEMENTED,
  THIRD_REEL_OPTIONAL_POLICY_IMPLEMENTED,
} from './dailyPublishingCadence/constants.js';
import {
  buildNdxDailyPublishingCadencePolicy,
  ndxCadenceNotHardcodedInGenericModels,
  ndxCanonicalVolumeSemantics,
  ndxWeeklyVolumeSummary,
} from './dailyPublishingCadence/ndxDailyPublishingCadenceAdapter.js';
import {
  resetDailyPublishingCadenceMemory,
  resetDailyPublishingCadenceStoreModeCache,
} from '../../api/_lib/site00Evolve/dailyPublishingCadence/dailyPublishingCadenceStoreAdapter.js';
import { seedVitestContentOperationsPrerequisites } from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsService.js';

const DAILY_PLAN_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectContentOperationsDailyPlanPage.tsx'), 'utf8');

beforeEach(async () => {
  resetDailyPublishingCadenceMemory();
  resetDailyPublishingCadenceStoreModeCache();
  await seedVitestContentOperationsPrerequisites();
});

function ndxPolicy() {
  return buildNdxDailyPublishingCadencePolicy({ projectId: 'ndxbook', brandId: 'org' });
}

describe('P0.5E.1A Daily Cadence Reconciliation', () => {
  it('1–4. NDX Instagram feed/story/reel targets', () => {
    const policy = ndxPolicy();
    const daily = dailyPublishingUnitVolume(policy);
    expect(NDX_INSTAGRAM_FEED_TARGET_PER_DAY).toBe(3);
    expect(NDX_INSTAGRAM_STORY_TARGET_PER_DAY).toBe(4);
    expect(NDX_INSTAGRAM_REEL_TARGET_PER_DAY).toBe(1);
    expect(NDX_INSTAGRAM_REEL_MAX_NORMAL_PER_DAY).toBe(2);
    expect(daily.feedPerDay).toBe(3);
    expect(daily.storyPerDay).toBe(4);
    expect(daily.reelTargetPerDay).toBe(1);
    expect(daily.reelMaxPerDay).toBe(2);
  });

  it('5–8. Daily/weekly baseline and max-normal volumes derived from policy', () => {
    const policy = ndxPolicy();
    const weekly = weeklyPublishingUnitVolume(policy);
    const canonical = ndxCanonicalVolumeSemantics();
    expect(NDX_DAILY_BASELINE_PUBLISHING_UNITS).toBe(8);
    expect(NDX_WEEKLY_BASELINE_PUBLISHING_UNITS).toBe(56);
    expect(NDX_DAILY_MAX_NORMAL_PUBLISHING_UNITS).toBe(9);
    expect(NDX_WEEKLY_MAX_NORMAL_PUBLISHING_UNITS).toBe(63);
    expect(weekly.baselineInstagramUnits).toBe(56);
    expect(weekly.maxNormalInstagramUnits).toBe(63);
    expect(canonical.weeklyBaseline).toBe(56);
    expect(canonical.weeklyMaxNormal).toBe(63);
  });

  it('9. 63 cannot be labeled baseline', () => {
    const policy = ndxPolicy();
    expect(isBaselineVolumeLabel(63, policy)).toBe(false);
    expect(isBaselineVolumeLabel(56, policy)).toBe(true);
    const summary = ndxWeeklyVolumeSummary(policy);
    expect(summary.baselineLabel).toContain('56');
    expect(summary.maxNormalLabel).toContain('63');
    expect(summary.baselineLabel).not.toContain('63');
  });

  it('10. 56 is not a filler-enforced minimum', () => {
    expect(CADENCE_IS_NOT_QUOTA).toBe(true);
    expect(CADENCE_DOES_NOT_FORCE_FILLER).toBe(true);
    const evalResult = evaluateCadenceFulfillmentDetailed({
      policy: ndxPolicy(),
      date: '2026-08-18',
      primaryEventCount: 2,
      strongOpportunityCount: 2,
      evergreenAvailable: false,
      watchQueueTriggered: false,
      secondReelNotJustified: true,
    });
    expect(evalResult.cadenceIsNotQuota).toBe(true);
    expect(evalResult.fillerPressureDetected).toBe(false);
  });

  it('11–18. Second reel eligibility reasons', () => {
    const policy = ndxPolicy();
    const base = {
      policy,
      date: '2026-08-18',
      firstReelPlanned: true,
      strongSecondOpportunity: false,
      breakingCulturalSignal: false,
      campaignRequired: false,
      evergreenHighValue: false,
      founderRequested: false,
    };
    expect(evaluateSecondReelEligibility(base).eligibility).toBe('NOT_JUSTIFIED');
    expect(evaluateSecondReelEligibility({ ...base, strongSecondOpportunity: true }).eligibility).toBe('STRONG_OPPORTUNITY');
    expect(evaluateSecondReelEligibility({ ...base, breakingCulturalSignal: true }).eligibility).toBe('BREAKING_CULTURAL_SIGNAL');
    expect(evaluateSecondReelEligibility({ ...base, campaignRequired: true }).eligibility).toBe('CAMPAIGN_REQUIRED');
    expect(evaluateSecondReelEligibility({ ...base, evergreenHighValue: true }).eligibility).toBe('EVERGREEN_HIGH_VALUE');
    expect(evaluateSecondReelEligibility({ ...base, founderRequested: true }).eligibility).toBe('FOUNDER_REQUESTED');
    expect(evaluateSecondReelEligibility({ ...base, quotaPressure: true }).eligibility).toBe('NOT_JUSTIFIED');
    expect(SECOND_REEL_OPTIONAL_POLICY_IMPLEMENTED).toBe(true);
  });

  it('12–13. NOT_JUSTIFIED leaves slot empty without cadence failure', () => {
    const policy = ndxPolicy();
    const secondReel = evaluateSecondReelEligibility({
      policy,
      date: '2026-08-18',
      firstReelPlanned: true,
      strongSecondOpportunity: false,
      breakingCulturalSignal: false,
      campaignRequired: false,
      evergreenHighValue: false,
      founderRequested: false,
    });
    expect(emptySecondReelSlotIsValid(secondReel)).toBe(true);
    const fulfillment = evaluateCadenceFulfillmentDetailed({
      policy,
      date: '2026-08-18',
      primaryEventCount: 3,
      strongOpportunityCount: 3,
      evergreenAvailable: false,
      watchQueueTriggered: false,
      secondReelNotJustified: true,
    });
    expect(fulfillment.state).toBe('HOLD_SLOT_EMPTY');
    expect(fulfillment.healthy).toBe(true);
    expect(cadenceDoesNotForceFiller(fulfillment.state)).toBe(true);
  });

  it('20. Third reel terminology absent from current UI; compatibility alias preserved', () => {
    expect(DAILY_PLAN_PAGE).toContain('formatSecondReelSlotLabel');
    expect(DAILY_PLAN_PAGE).toContain('reelSlots.reel02');
    expect(DAILY_PLAN_PAGE).not.toMatch(/third reel|THIRD_REEL|REEL 03/i);
    const board = readFileSync(join(process.cwd(), 'shared/site00-studio-world-production/dailyPublishingCadence/reelSlotPresentation.ts'), 'utf8');
    expect(board).toContain('REEL 02 — HELD — NO STRONG OPPORTUNITY');
    expect(THIRD_REEL_OPTIONAL_POLICY_IMPLEMENTED).toBe(true);
    expect(SECOND_REEL_OPTIONAL_POLICY_IMPLEMENTED).toBe(true);
    expect(CADENCE_FAILURE_STATES).toContain('FAIL_THIRD_REEL_FORCED');
    expect(CADENCE_FAILURE_STATES).toContain('FAIL_SECOND_REEL_FORCED');
  });

  it('23–25. Cost baseline uses 7 Reels; optional cost requires approval', () => {
    const policy = ndxPolicy();
    const baselineCost = estimateWeeklyContentCost({
      primaryEventCount: 21,
      expressionCount: 42,
      policy,
      approvedSecondReelsPerWeek: 0,
    });
    expect(baselineCostUsesTargetReels(baselineCost)).toBe(true);
    expect(baselineCost.baselineReelsPerWeek).toBe(7);
    expect(baselineCost.maxNormalReelsPerWeek).toBe(14);
    expect(optionalReelCostRequiresApproval(baselineCost)).toBe(true);

    const withSecondReel = estimateWeeklyContentCost({
      primaryEventCount: 21,
      expressionCount: 42,
      policy,
      approvedSecondReelsPerWeek: 3,
    });
    expect(withSecondReel.actualPlannedWeeklyEstimateUsd).toBeGreaterThan(baselineCost.baselineWeeklyEstimateUsd);
    expect(withSecondReel.approvedSecondReelsPerWeek).toBe(3);
  });

  it('26. Campaign board / daily plan does not show unearned Reel #2 as missing', () => {
    const held = formatSecondReelSlotLabel(
      evaluateSecondReelEligibility({
        policy: ndxPolicy(),
        date: '2026-08-18',
        firstReelPlanned: true,
        strongSecondOpportunity: false,
        breakingCulturalSignal: false,
        campaignRequired: false,
        evergreenHighValue: false,
        founderRequested: false,
      }),
    );
    expect(held.reel02).toContain('HELD');
    expect(held.reel02).not.toMatch(/INCOMPLETE|MISSING|OVERDUE|1\/2/i);
    expect(DAILY_PLAN_PAGE).not.toMatch(/INCOMPLETE|MISSING|OVERDUE|1\/2 REELS/i);
  });

  it('27–28. Primary event planning capacity + forced premise guard', () => {
    expect(primaryEventTargetIsPlanningCapacity(21)).toBe(true);
    expect(detectForcedPremiseCreation({ inventedPremiseCount: 25, planningCapacityPerWeek: 21, weakPremiseRatio: 0.8 })).toBe(
      'FAIL_FORCED_PREMISE_CREATION',
    );
    expect(detectForcedPremiseCreation({ inventedPremiseCount: 10, planningCapacityPerWeek: 21, weakPremiseRatio: 0.2 })).toBeNull();
  });

  it('29. Callback/revisit via event reactivation', () => {
    const prior = buildDailyPrimaryContentEvent({
      id: 'pce-day1',
      projectId: 'ndxbook',
      date: '2026-08-18',
      planningRole: 'EVENT_A_QUICK_CULTURAL',
      primarySubject: 'WHY DOES EVERYTHING HAVE A SUBSCRIPTION NOW?',
      behavioralMode: 'OBSERVATIONAL',
      characterTemperature: 'PLAYFUL',
      lifecycleState: 'PUBLISHED',
    });
    const callback = reactivatePrimaryContentEvent({
      priorEvent: prior,
      newId: 'pce-day4-callback',
      date: '2026-08-21',
      newAngle: 'REMEMBER THIS? NEW COMPANY ANNOUNCEMENT APPEARED',
    });
    expect(callback.lifecycleState).toBe('REACTIVATED');
    expect(callback.priorEventId).toBe('pce-day1');
    expect(callback.planningRole).toBe('EVENT_C_CALLBACK_REASSESSMENT');
  });

  it('30. Cross-platform derivation does not multiply research premises', () => {
    expect(crossPlatformDoesNotMultiplyResearchPremises({ primaryEventCount: 3, intelligenceCount: 3 })).toBe(true);
    expect(crossPlatformDoesNotMultiplyResearchPremises({ primaryEventCount: 3, intelligenceCount: 6 })).toBe(false);
  });

  it('31–32. Generic cadence configurable; NDX values adapter-specific', () => {
    expect(ndxCadenceNotHardcodedInGenericModels()).toBe(true);
    expect(OPTIONAL_CAPACITY_IS_NOT_TARGET).toBe(true);
    const policy = ndxPolicy();
    const reel = policy.channelTargets.find((t) => t.surface === 'REEL');
    expect(reel?.semanticLevel).toBe('OPTIONAL_CAPACITY');
    expect(reel?.optionalSlotPolicy).toBe('SECOND_REEL_ONLY_WHEN_ELIGIBLE');
  });

  it('33. Guard flags unchanged — brand/canon/product/world/autonomous publishing', () => {
    expect(BRAND_CHARACTER_MUTATED).toBe(false);
    expect(BRAND_CANON_MUTATED).toBe(false);
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(AUTONOMOUS_PUBLISHING_ENABLED).toBe(false);
  });
});
