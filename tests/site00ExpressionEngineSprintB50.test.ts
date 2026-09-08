/**
 * Reference-fidelity + journey tests.
 */

import { describe, expect, it } from 'vitest';
import {
  buildDerivedContentCards,
  resolveSocialPackageStatus,
} from '../src/site00/components/founderWorkspace/expressionEngine/derivedContentState';
import {
  buildProductionJourney,
  journeyProgressPercent,
  resolveActiveJourneyStage,
} from '../src/site00/components/founderWorkspace/expressionEngine/productionJourney';

describe('B5.0 production journey', () => {
  it('marks cover and treatment approved when canonical state says so', () => {
    const stages = buildProductionJourney({
      coverAuthority: 'APPROVED',
      reelTreatment: 'LOCKED',
      preStoryboardComplete: true,
      activeProductionStep: 'FINAL_CINEMATIC_STORYBOARD',
      finalStoryboardStatus: 'REVISION_REQUIRED',
      finalStoryboardValid: false,
      finalStoryboardApproved: false,
      keyframeEligibility: 'BLOCKED',
      videoEligibility: 'BLOCKED',
      campaignReady: false,
    });
    expect(stages.find((s) => s.id === 'COVER')?.status).toBe('APPROVED');
    expect(stages.find((s) => s.id === 'REEL_TREATMENT')?.status).toBe('APPROVED');
    expect(stages.find((s) => s.id === 'VISUAL_AUTHORITIES')?.status).toBe('APPROVED');
    expect(stages.find((s) => s.id === 'STORYBOARD')?.status).toBe('ACTIVE');
  });

  it('includes SOCIAL PACKAGE between FINAL REEL and CAMPAIGN BOARD', () => {
    const stages = buildProductionJourney({
      coverAuthority: 'APPROVED',
      reelTreatment: 'LOCKED',
      preStoryboardComplete: true,
      activeProductionStep: 'FINAL_CINEMATIC_STORYBOARD',
      finalStoryboardStatus: 'READY_FOR_GENERATION',
      finalStoryboardValid: false,
      finalStoryboardApproved: false,
      keyframeEligibility: 'BLOCKED',
      videoEligibility: 'BLOCKED',
      campaignReady: false,
      finalReelApproved: false,
      socialPackageStatus: 'LOCKED',
    });
    const ids = stages.map((s) => s.id);
    expect(ids).toEqual([
      'COVER',
      'REEL_TREATMENT',
      'VISUAL_AUTHORITIES',
      'STORYBOARD',
      'KEYFRAMES',
      'VIDEO',
      'ROUGH_CUT',
      'FINAL_REEL',
      'SOCIAL_PACKAGE',
      'CAMPAIGN_BOARD',
    ]);
    expect(stages.find((s) => s.id === 'SOCIAL_PACKAGE')?.status).toBe('LOCKED');
    expect(stages.find((s) => s.id === 'CAMPAIGN_BOARD')?.status).toBe('LOCKED');
  });

  it('resolves active stage from journey', () => {
    const stages = buildProductionJourney({
      coverAuthority: 'APPROVED',
      reelTreatment: 'LOCKED',
      preStoryboardComplete: true,
      activeProductionStep: 'FINAL_CINEMATIC_STORYBOARD',
      finalStoryboardStatus: 'READY_FOR_GENERATION',
      finalStoryboardValid: false,
      finalStoryboardApproved: false,
      keyframeEligibility: 'BLOCKED',
      videoEligibility: 'BLOCKED',
      campaignReady: false,
    });
    expect(resolveActiveJourneyStage(stages)).toBe('STORYBOARD');
  });

  it('computes campaign progress percent', () => {
    const stages = buildProductionJourney({
      coverAuthority: 'APPROVED',
      reelTreatment: 'LOCKED',
      preStoryboardComplete: true,
      activeProductionStep: 'FINAL_CINEMATIC_STORYBOARD',
      finalStoryboardStatus: 'REVISION_REQUIRED',
      finalStoryboardValid: false,
      finalStoryboardApproved: false,
      keyframeEligibility: 'BLOCKED',
      videoEligibility: 'BLOCKED',
      campaignReady: false,
    });
    const pct = journeyProgressPercent(stages);
    expect(pct).toBeGreaterThan(15);
    expect(pct).toBeLessThan(55);
  });
});

describe('derived content state', () => {
  const blueprint = {
    formatExpressions: [
      { format: 'CAROUSEL', status: 'PLANNED' },
      { format: 'STORY', status: 'PLANNED' },
      { format: 'TIKTOK', status: 'PLANNED' },
    ],
    platformTranslations: [{ platform: 'X', sourceFormat: 'REEL', status: 'PLANNED' }],
  } as never;

  it('locks derived formats until final reel approved', () => {
    const cards = buildDerivedContentCards(blueprint, false);
    expect(cards.every((c) => c.status === 'LOCKED')).toBe(true);
  });

  it('unlocks to pending when final reel approved', () => {
    const cards = buildDerivedContentCards(blueprint, true);
    expect(cards.some((c) => c.status === 'PENDING')).toBe(true);
    expect(resolveSocialPackageStatus(cards, true)).toBe('PENDING');
  });
});
