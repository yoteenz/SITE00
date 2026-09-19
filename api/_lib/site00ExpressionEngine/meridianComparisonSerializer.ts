/**
 * C1.9R1 — Serialize Meridian comparison for founder review UI.
 */

import type { MultiUnitBlindCampaignOutput } from './seniorCreativeJudgment/multiUnitCampaignArchitect.js';
import type { C19R1MeridianLiveProofResult } from './runC19R1MeridianLiveProof.js';

export type MeridianComparisonViewPayload = {
  sprint: string;
  capabilityStatus: string;
  fullReasoningBlocked: boolean;
  blockReason?: string;
  briefVerified: boolean;
  sameBriefHash: string;
  comparison: C19R1MeridianLiveProofResult['comparison'];
  controlRun: {
    runId: string;
    label: string;
    campaign: ReturnType<typeof serializeCampaignSummary>;
  };
  fullReasoningRun: {
    runId: string;
    label: string;
    campaign: ReturnType<typeof serializeCampaignSummary>;
  } | null;
  runtimeReceipt: C19R1MeridianLiveProofResult['runtimeReceipt'];
  heroLineCandidates: C19R1MeridianLiveProofResult['heroLineCandidates'];
  brandRhetoricalSignature: C19R1MeridianLiveProofResult['brandRhetoricalSignature'];
  founderJudgment: string;
  comparisonId: string;
};

export function serializeCampaignSummary(campaign: MultiUnitBlindCampaignOutput) {
  return {
    brief: { brandName: campaign.brief.brandName, campaignObjective: campaign.brief.campaignObjective },
    campaignResponsibility: campaign.campaignResponsibility,
    initialCampaignWinner: campaign.initialCampaignWinner,
    runtimeMode: campaign.runtimeMode,
    principlesApplied: campaign.principlesApplied,
    units: campaign.units.map((u) => ({
      unitId: u.unitId,
      medium: u.medium,
      role: { campaignRole: u.role.campaignRole },
      initialDirection: u.initialDirection,
      finalDirection: u.finalDirection,
      mediumRationale: u.mediumRationale,
      heroMoment: u.heroMoment,
      handoffOut: u.handoffOut,
      qualityTier: u.qualityTier,
      founderHandholdingRisk: u.founderHandholdingRisk,
      reviewType: u.reviewType,
      judgment: {
        firstAnswerChallenge: { resolution: u.judgment.firstAnswerChallenge.resolution },
        challenger: { conceptName: u.judgment.challenger.conceptName },
      },
    })),
    packageJudgment: {
      campaignIdea: campaign.packageJudgment.campaignIdea,
      packageFirstAnswerChallenge: campaign.packageJudgment.packageFirstAnswerChallenge,
      packageChallenger: campaign.packageJudgment.packageChallenger,
      finalCampaignDirection: campaign.packageJudgment.finalCampaignDirection,
      campaignCreativeDNA: { coreTension: campaign.packageJudgment.campaignCreativeDNA.coreTension },
      packageQualityTier: campaign.packageJudgment.packageQualityTier,
      packageFounderHandholdingRisk: campaign.packageJudgment.packageFounderHandholdingRisk,
      status: campaign.packageJudgment.status,
    },
    copyPackage: campaign.copyPackage
      ? {
          packageCopyQualityTier: campaign.copyPackage.packageCopyQualityTier,
          packageCopyHandholdingRisk: campaign.copyPackage.packageCopyHandholdingRisk,
          voiceProfile: { campaignVoice: campaign.copyPackage.voiceProfile.campaignVoice },
          cohesionQA: { passed: campaign.copyPackage.cohesionQA.passed },
          unitCopyDirections: campaign.copyPackage.unitCopyDirections.map((u) => ({
            unitId: u.unitId,
            medium: u.medium,
            campaignRole: u.campaignRole,
            copyRole: u.copyRole,
            primaryCaption: u.primaryCaption,
            altCaptionA: u.altCaptionA,
            altCaptionB: u.altCaptionB,
            finalCaption: u.finalCaption,
            visualRelationship: u.visualRelationship,
            qualityTier: u.qualityTier,
            founderHandholdingRisk: u.founderHandholdingRisk,
            copyPackage: { cta: u.copyPackage.cta, ctaCopy: u.copyPackage.ctaCopy },
            mediumNecessity: { whyCopyBelongsHere: u.mediumNecessity.whyCopyBelongsHere },
            firstAnswerChallenge: { resolution: u.firstAnswerChallenge.resolution },
            challenger: { conceptName: u.challenger.conceptName },
          })),
        }
      : undefined,
  };
}

export function serializeC19R1ForComparisonView(result: C19R1MeridianLiveProofResult): MeridianComparisonViewPayload {
  return {
    sprint: result.sprint,
    capabilityStatus: result.capabilityStatus,
    fullReasoningBlocked: result.fullReasoningBlocked,
    blockReason: result.blockReason,
    briefVerified: result.briefVerified,
    sameBriefHash: result.sameBriefHash,
    comparison: result.comparison,
    controlRun: {
      runId: result.controlRun.runId,
      label: result.controlRun.label,
      campaign: serializeCampaignSummary(result.controlRun.campaign),
    },
    fullReasoningRun: result.fullReasoningRun
      ? {
          runId: result.fullReasoningRun.runId,
          label: result.fullReasoningRun.label,
          campaign: serializeCampaignSummary(result.fullReasoningRun.campaign),
        }
      : null,
    runtimeReceipt: result.runtimeReceipt,
    heroLineCandidates: result.heroLineCandidates,
    brandRhetoricalSignature: result.brandRhetoricalSignature,
    founderJudgment: result.comparisonRecord.founderJudgment,
    comparisonId: result.comparisonRecord.comparisonId,
  };
}
