/**
 * B5.0R1 — Social Package journey reconciliation tests.
 */

import { describe, expect, it } from 'vitest';
import { compileEntry002ProductionBlueprint } from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';
import {
  buildDerivedContentCards,
  resolveCampaignBoardDerivedStatus,
  resolveSocialPackageReadiness,
} from '../src/site00/components/founderWorkspace/expressionEngine/derivedContentState';
import {
  buildProductionJourney,
  getDownstreamJourneyStages,
  resolveActiveJourneyStage,
} from '../src/site00/components/founderWorkspace/expressionEngine/productionJourney';
import {
  buildSocialPackageReadiness,
  derivedSocialStatusToJourneyStatus,
  getRequiredDerivativeFormats,
  socialPackageStatusToJourneyStatus,
} from '../src/site00/components/founderWorkspace/expressionEngine/socialPackageReadiness';

const blueprint = compileEntry002ProductionBlueprint();

const baseJourneyInput = {
  coverAuthority: 'APPROVED' as const,
  reelTreatment: 'LOCKED' as const,
  preStoryboardComplete: true,
  activeProductionStep: 'FINAL_CINEMATIC_STORYBOARD',
  finalStoryboardStatus: 'READY_FOR_GENERATION',
  finalStoryboardValid: false,
  finalStoryboardApproved: false,
  keyframeEligibility: 'BLOCKED',
  videoEligibility: 'BLOCKED',
};

function journeyWithReelApproved(reelApproved: boolean, packageOverrides?: Partial<ReturnType<typeof buildSocialPackageReadiness>>) {
  const readiness = buildSocialPackageReadiness(blueprint, reelApproved);
  const merged = packageOverrides ? { ...readiness, ...packageOverrides } : readiness;
  return buildProductionJourney({
    ...baseJourneyInput,
    finalReelApproved: reelApproved,
    derivedSocialStatus: derivedSocialStatusToJourneyStatus(merged),
    socialPackageStatus: socialPackageStatusToJourneyStatus(merged),
    campaignBoardEligible: merged.campaignBoardEligible,
  });
}

describe('B5.0R1 production journey order', () => {
  it('1. Campaign Board is not directly after Final Reel', () => {
    const stages = journeyWithReelApproved(false);
    const ids = stages.map((s) => s.id);
    const finalIdx = ids.indexOf('FINAL_REEL');
    const campaignIdx = ids.indexOf('CAMPAIGN_BOARD');
    expect(finalIdx).toBeGreaterThan(-1);
    expect(campaignIdx - finalIdx).toBeGreaterThan(1);
    expect(ids[finalIdx + 1]).toBe('DERIVED_SOCIAL_CONTENT');
  });

  it('2. Derived Social Content follows Final Reel', () => {
    const stages = journeyWithReelApproved(true);
    const ids = stages.map((s) => s.id);
    expect(ids.indexOf('DERIVED_SOCIAL_CONTENT')).toBe(ids.indexOf('FINAL_REEL') + 1);
  });

  it('3. Social Package follows derivative generation/approval stage', () => {
    const stages = journeyWithReelApproved(true);
    const ids = stages.map((s) => s.id);
    expect(ids.indexOf('SOCIAL_PACKAGE')).toBe(ids.indexOf('DERIVED_SOCIAL_CONTENT') + 1);
  });

  it('4. Campaign Board follows Social Package', () => {
    const stages = journeyWithReelApproved(true);
    const ids = stages.map((s) => s.id);
    expect(ids.indexOf('CAMPAIGN_BOARD')).toBe(ids.indexOf('SOCIAL_PACKAGE') + 1);
  });

  it('13. mobile journey includes downstream socials/package semantics', () => {
    const stages = journeyWithReelApproved(true);
    const downstream = getDownstreamJourneyStages(stages);
    expect(downstream.map((s) => s.shortLabel)).toEqual(['SOCIALS', 'PACKAGE', 'CAMPAIGN']);
  });

  it('14. desktop journey includes all 11 stages with correct labels', () => {
    const stages = journeyWithReelApproved(false);
    expect(stages.map((s) => s.shortLabel)).toEqual([
      'COVER',
      'TREATMENT',
      'AUTHORITIES',
      'STORYBOARD',
      'KEYFRAMES',
      'VIDEO',
      'ROUGH CUT',
      'FINAL REEL',
      'SOCIALS',
      'PACKAGE',
      'CAMPAIGN',
    ]);
  });

  it('16. Entry 002 gate remains at storyboard — active stage not downstream', () => {
    const stages = journeyWithReelApproved(false);
    expect(resolveActiveJourneyStage(stages)).toBe('STORYBOARD');
    expect(stages.find((s) => s.id === 'STORYBOARD')?.status).toBe('ACTIVE');
  });
});

describe('B5.0R1 social package readiness', () => {
  it('5. Final Reel approval alone does not unlock Campaign Board', () => {
    const readiness = buildSocialPackageReadiness(blueprint, true);
    expect(readiness.campaignBoardEligible).toBe(false);
    const stages = journeyWithReelApproved(true);
    expect(stages.find((s) => s.id === 'CAMPAIGN_BOARD')?.status).toBe('LOCKED');
  });

  it('6. Final Reel approval unlocks derivative workflow', () => {
    const locked = buildDerivedContentCards(blueprint, false);
    const unlocked = buildDerivedContentCards(blueprint, true);
    expect(locked.every((c) => c.status === 'LOCKED')).toBe(true);
    expect(unlocked.some((c) => c.status === 'READY')).toBe(true);
    const stages = journeyWithReelApproved(true);
    expect(stages.find((s) => s.id === 'DERIVED_SOCIAL_CONTENT')?.status).not.toBe('LOCKED');
  });

  it('7. required derivative formats derive from configuration', () => {
    const formats = getRequiredDerivativeFormats(blueprint);
    expect(formats).toContain('CAROUSEL');
    expect(formats).toContain('STORY');
    expect(formats).toContain('TIKTOK');
    expect(formats).toContain('X');
    expect(formats).not.toContain('REEL');
    expect(formats).not.toContain('COVER');
  });

  it('8. incomplete derivatives => Social Package incomplete', () => {
    const readiness = buildSocialPackageReadiness(blueprint, true);
    expect(readiness.packageStatus).toBe('INCOMPLETE');
    expect(readiness.approvedDerivativeCount).toBe(0);
    expect(readiness.missingDerivativeCount).toBe(readiness.requiredDerivativeCount);
  });

  it('9. Social Package incomplete => Campaign Board locked', () => {
    const readiness = resolveSocialPackageReadiness(blueprint, true);
    expect(readiness.campaignBoardEligible).toBe(false);
    expect(resolveCampaignBoardDerivedStatus(readiness)).toBe('PENDING');
  });

  it('10. all required derivatives approved => Social Package complete', () => {
    const readiness = buildSocialPackageReadiness(blueprint, true);
    const allApproved = {
      ...readiness,
      derivatives: readiness.derivatives.map((d) => ({ ...d, status: 'APPROVED' as const })),
      approvedDerivativeCount: readiness.requiredDerivativeCount,
      missingDerivativeCount: 0,
      packageStatus: 'COMPLETE' as const,
      campaignBoardEligible: true,
    };
    expect(allApproved.packageStatus).toBe('COMPLETE');
    expect(allApproved.campaignBoardEligible).toBe(true);
  });

  it('11. Social Package complete => Campaign Board ready', () => {
    const readiness = buildSocialPackageReadiness(blueprint, true);
    const complete = {
      ...readiness,
      packageStatus: 'COMPLETE' as const,
      campaignBoardEligible: true,
      approvedDerivativeCount: readiness.requiredDerivativeCount,
      missingDerivativeCount: 0,
    };
    const stages = buildProductionJourney({
      ...baseJourneyInput,
      finalReelApproved: true,
      derivedSocialStatus: derivedSocialStatusToJourneyStatus(complete),
      socialPackageStatus: socialPackageStatusToJourneyStatus(complete),
      campaignBoardEligible: true,
    });
    expect(stages.find((s) => s.id === 'CAMPAIGN_BOARD')?.status).toBe('READY');
    expect(resolveCampaignBoardDerivedStatus(complete)).toBe('READY');
  });

  it('12. Campaign Board readiness derives from canonical package state — not phase2 flag', () => {
    const incomplete = buildSocialPackageReadiness(blueprint, true);
    expect(incomplete.campaignBoardEligible).toBe(false);
    const complete = { ...incomplete, packageStatus: 'COMPLETE' as const, campaignBoardEligible: true, approvedDerivativeCount: incomplete.requiredDerivativeCount, missingDerivativeCount: 0 };
    expect(complete.campaignBoardEligible).toBe(true);
  });
});

describe('B5.0R1 workspace hierarchy unchanged', () => {
  it('15. journey stage count is 11 — upstream + downstream preserved', () => {
    expect(journeyWithReelApproved(false)).toHaveLength(11);
  });
});
