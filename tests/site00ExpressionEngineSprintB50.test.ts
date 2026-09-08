/**
 * B5.0 — Production journey mapping tests.
 */

import { describe, expect, it } from 'vitest';
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
    expect(pct).toBeGreaterThan(20);
    expect(pct).toBeLessThan(60);
  });

  it('locks campaign board until final reel ready', () => {
    const stages = buildProductionJourney({
      coverAuthority: 'APPROVED',
      reelTreatment: 'LOCKED',
      preStoryboardComplete: true,
      activeProductionStep: 'FINAL_CINEMATIC_STORYBOARD',
      finalStoryboardStatus: 'AWAITING_FOUNDER_APPROVAL',
      finalStoryboardValid: true,
      finalStoryboardApproved: false,
      keyframeEligibility: 'BLOCKED',
      videoEligibility: 'BLOCKED',
      campaignReady: false,
    });
    expect(stages.find((s) => s.id === 'CAMPAIGN_BOARD')?.status).toBe('LOCKED');
  });
});
