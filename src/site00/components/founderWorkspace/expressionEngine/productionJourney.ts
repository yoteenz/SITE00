/**
 * B5.0 — Production journey stage mapping from canonical pipeline state.
 */

export type JourneyStageId =
  | 'COVER'
  | 'REEL_TREATMENT'
  | 'VISUAL_AUTHORITIES'
  | 'STORYBOARD'
  | 'KEYFRAMES'
  | 'VIDEO'
  | 'ROUGH_CUT'
  | 'FINAL_REEL'
  | 'CAMPAIGN_BOARD';

export type JourneyStageStatus =
  | 'APPROVED'
  | 'LOCKED'
  | 'ACTIVE'
  | 'READY'
  | 'BLOCKED'
  | 'PENDING'
  | 'FAILED'
  | 'SUPERSEDED';

export type JourneyStage = {
  id: JourneyStageId;
  label: string;
  shortLabel: string;
  status: JourneyStageStatus;
};

export type PipelineJourneyInput = {
  coverAuthority: 'APPROVED' | string;
  reelTreatment: 'LOCKED' | string;
  preStoryboardComplete: boolean;
  activeProductionStep: string;
  finalStoryboardStatus: string;
  finalStoryboardValid: boolean;
  finalStoryboardApproved: boolean;
  keyframeEligibility: string;
  videoEligibility: string;
  campaignReady: boolean;
  storyboardFailed?: boolean;
};

const STAGE_DEFS: Array<{ id: JourneyStageId; label: string; shortLabel: string }> = [
  { id: 'COVER', label: 'Cover', shortLabel: 'COVER' },
  { id: 'REEL_TREATMENT', label: 'Reel Treatment', shortLabel: 'TREATMENT' },
  { id: 'VISUAL_AUTHORITIES', label: 'Visual Authorities', shortLabel: 'AUTHORITIES' },
  { id: 'STORYBOARD', label: 'Storyboard', shortLabel: 'STORYBOARD' },
  { id: 'KEYFRAMES', label: 'Keyframes', shortLabel: 'KEYFRAMES' },
  { id: 'VIDEO', label: 'Video', shortLabel: 'VIDEO' },
  { id: 'ROUGH_CUT', label: 'Rough Cut', shortLabel: 'ROUGH CUT' },
  { id: 'FINAL_REEL', label: 'Final Reel', shortLabel: 'FINAL' },
  { id: 'CAMPAIGN_BOARD', label: 'Campaign Board', shortLabel: 'CAMPAIGN' },
];

function isStoryboardActive(step: string): boolean {
  return step === 'FINAL_CINEMATIC_STORYBOARD' || step === 'FOUNDER_STORYBOARD_APPROVAL';
}

function isKeyframeActive(step: string): boolean {
  return step === 'START_MID_END_PRODUCTION_KEYFRAMES' || step === 'FOUNDER_KEYFRAME_APPROVAL';
}

export function buildProductionJourney(input: PipelineJourneyInput): JourneyStage[] {
  const {
    coverAuthority,
    reelTreatment,
    preStoryboardComplete,
    activeProductionStep,
    finalStoryboardValid,
    finalStoryboardApproved,
    keyframeEligibility,
    videoEligibility,
    campaignReady,
    storyboardFailed,
  } = input;

  const coverStatus: JourneyStageStatus = coverAuthority === 'APPROVED' ? 'APPROVED' : 'PENDING';
  const treatmentStatus: JourneyStageStatus = reelTreatment === 'LOCKED' ? 'APPROVED' : 'PENDING';

  let authoritiesStatus: JourneyStageStatus = 'PENDING';
  if (preStoryboardComplete) authoritiesStatus = 'APPROVED';
  else if (activeProductionStep.includes('PRE_STORYBOARD') || activeProductionStep.includes('AUTHORITY'))
    authoritiesStatus = 'ACTIVE';

  let storyboardStatus: JourneyStageStatus = 'LOCKED';
  if (finalStoryboardApproved) storyboardStatus = 'APPROVED';
  else if (storyboardFailed) storyboardStatus = 'FAILED';
  else if (isStoryboardActive(activeProductionStep)) storyboardStatus = 'ACTIVE';
  else if (preStoryboardComplete && !finalStoryboardValid) storyboardStatus = 'READY';
  else if (finalStoryboardValid) storyboardStatus = 'READY';

  let keyframesStatus: JourneyStageStatus = 'LOCKED';
  if (keyframeEligibility === 'READY_FOR_GENERATION') keyframesStatus = 'READY';
  else if (keyframeEligibility.includes('COMPLETE') || keyframeEligibility === 'APPROVED')
    keyframesStatus = 'APPROVED';
  else if (isKeyframeActive(activeProductionStep)) keyframesStatus = 'ACTIVE';
  else if (finalStoryboardApproved) keyframesStatus = 'BLOCKED';

  let videoStatus: JourneyStageStatus = videoEligibility === 'BLOCKED' ? 'LOCKED' : 'PENDING';
  if (videoEligibility.includes('READY')) videoStatus = 'READY';
  if (videoEligibility.includes('COMPLETE')) videoStatus = 'APPROVED';

  const roughCutStatus: JourneyStageStatus = 'LOCKED';
  const finalReelStatus: JourneyStageStatus = campaignReady ? 'APPROVED' : 'LOCKED';

  let campaignStatus: JourneyStageStatus = 'LOCKED';
  if (campaignReady) campaignStatus = 'READY';
  else if (finalReelStatus === 'APPROVED') campaignStatus = 'READY';

  const statusById: Record<JourneyStageId, JourneyStageStatus> = {
    COVER: coverStatus,
    REEL_TREATMENT: treatmentStatus,
    VISUAL_AUTHORITIES: authoritiesStatus,
    STORYBOARD: storyboardStatus,
    KEYFRAMES: keyframesStatus,
    VIDEO: videoStatus,
    ROUGH_CUT: roughCutStatus,
    FINAL_REEL: finalReelStatus,
    CAMPAIGN_BOARD: campaignStatus,
  };

  return STAGE_DEFS.map((def) => ({
    ...def,
    status: statusById[def.id],
  }));
}

export function resolveActiveJourneyStage(stages: JourneyStage[]): JourneyStageId {
  const active = stages.find((s) => s.status === 'ACTIVE');
  if (active) return active.id;
  const ready = stages.find((s) => s.status === 'READY');
  if (ready) return ready.id;
  const failed = stages.find((s) => s.status === 'FAILED');
  if (failed) return failed.id;
  const lastApproved = [...stages].reverse().find((s) => s.status === 'APPROVED');
  return lastApproved?.id ?? 'STORYBOARD';
}

export function journeyProgressPercent(stages: JourneyStage[]): number {
  const weights: Record<JourneyStageStatus, number> = {
    APPROVED: 1,
    SUPERSEDED: 1,
    ACTIVE: 0.6,
    READY: 0.5,
    FAILED: 0.4,
    PENDING: 0.15,
    BLOCKED: 0,
    LOCKED: 0,
  };
  const total = stages.length;
  const sum = stages.reduce((acc, s) => acc + weights[s.status], 0);
  return Math.round((sum / total) * 100);
}
