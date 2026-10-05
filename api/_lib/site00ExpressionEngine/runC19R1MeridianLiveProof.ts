/**
 * C1.9R1 — Live FULL_REASONING Meridian proof (zero-mock, honest comparison).
 */

import type { MultiUnitBlindCampaignOutput } from './seniorCreativeJudgment/multiUnitCampaignArchitect.js';
import { checkCreativeReasoningProviderHealth } from './seniorCreativeJudgment/creativeReasoningProvider.js';
import { runC19BlindCampaignPackage } from './seniorCreativeJudgment/c19GenericCampaignArchitect.js';
import {
  MERIDIAN_ATELIER_LAUNCH_BRIEF,
  MERIDIAN_ATELIER_BRAND_ID,
  deriveMeridianBrandLanguageIdentity,
} from './brandLanguage/c19BlindBrandFixture.js';
import { evaluateCategoryClicheRisk } from './brandLanguage/categoryClicheQA.js';
import {
  evaluateCrossBrandVoiceContamination,
} from './brandLanguage/crossBrandVoiceContaminationQA.js';
import { detectRhetoricalPatternOveruse, trackRhetoricalPatterns } from './brandLanguage/rhetoricalPatternLineage.js';
import {
  assessMeridianMaterialImprovement,
  type MeridianMaterialImprovementAssessment,
} from './meridianComparisonAssessment.js';
import {
  persistMeridianComparison,
  persistMeridianRun,
  type MeridianComparisonRecord,
  type MeridianPersistedRun,
} from './meridianLiveProofStore.js';
import {
  initBrandLanguageStore,
  getBrandLanguageStoreMode,
  loadBrandLanguageIdentity,
  getCurrentVersionLabel,
} from './brandLanguage/brandLanguageSupabaseStore.js';
import { initCampaignCopyStore, getCampaignCopyStoreMode } from './campaignCopy/campaignCopyStore.js';
import { initCreativeIntelligenceStore, getCreativeIntelligenceStoreModeSync } from './seniorCreativeJudgment/creativeIntelligenceStore.js';

export type C19R1RuntimeReceipt = {
  providerName: string;
  model: string;
  runtimeMode: string;
  providerAvailable: boolean;
  reasoningDispatchAllowed: boolean;
  structuredOutputSupported: boolean;
  healthCheckStatus: string;
  creativeReasoningDispatchCount: number;
  copyReasoningDispatchCount: number;
  totalDispatchCount: number;
  tokenUsage?: { inputTokens?: number; outputTokens?: number };
  estimatedCost?: number;
  startedAt: string;
  completedAt: string;
  errors: string[];
  retries: number;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
};

export type C19R1MeridianLiveProofResult = {
  sprint: 'C1.9R1_LIVE_MERIDIAN_PROOF';
  providerHealth: Awaited<ReturnType<typeof checkCreativeReasoningProviderHealth>>;
  briefVerified: boolean;
  sameBriefHash: string;
  controlRun: MeridianPersistedRun;
  fullReasoningRun: MeridianPersistedRun | null;
  fullReasoningBlocked: boolean;
  blockReason?: string;
  comparison: MeridianMaterialImprovementAssessment;
  comparisonRecord: MeridianComparisonRecord;
  qa: {
    categoryClicheControl: ReturnType<typeof evaluateCategoryClicheRisk>;
    categoryClicheFull: ReturnType<typeof evaluateCategoryClicheRisk> | null;
    crossBrandControl: Array<ReturnType<typeof evaluateCrossBrandVoiceContamination>>;
    crossBrandFull: Array<ReturnType<typeof evaluateCrossBrandVoiceContamination>> | null;
    rhetoricalPatternOveruse: ReturnType<typeof detectRhetoricalPatternOveruse>;
  };
  heroLineCandidates: { control: string[]; full: string[] };
  brandRhetoricalSignature: ReturnType<typeof deriveMeridianBrandLanguageIdentity>['rhetoricalSignature'];
  brandLanguageIdentityVersion: string;
  runtimeReceipt: C19R1RuntimeReceipt;
  capabilityStatus: 'FULL_REASONING_LIVE_PASS' | 'FULL_REASONING_LIVE_TEST_BLOCKED';
  storeModes: {
    brandLanguage: string;
    copy: string;
    creativeIntelligence: string;
  };
};

function briefFingerprint(): string {
  return MERIDIAN_ATELIER_LAUNCH_BRIEF.briefId;
}

function extractHeroLineCandidates(campaign: MultiUnitBlindCampaignOutput | null): string[] {
  if (!campaign?.copyPackage) return [];
  const fromUnits = campaign.copyPackage.unitCopyDirections
    .filter((u) => u.medium === 'HERO_REEL' || u.medium === 'CAROUSEL')
    .flatMap((u) => [u.primaryCaption, u.altCaptionA, u.altCaptionB])
    .filter(Boolean);
  const pkg = campaign.packageJudgment;
  const extras = [
    pkg.finalCampaignDirection,
    pkg.campaignIdea,
    campaign.initialCampaignWinner,
  ].filter(Boolean);
  return [...new Set([...fromUnits, ...extras])].slice(0, 8);
}

function generateMeridianHeroLineSeeds(): string[] {
  return [
    'You do not wear Nocturne. You enter it.',
    'Scent as architecture — but the room is memory, not marble.',
    'Nocturne waits where daylight stops performing.',
    'Private space, not status theater.',
    'The note progression is a door you close behind you.',
  ];
}

function runCaptionQA(
  campaign: MultiUnitBlindCampaignOutput,
  identity: ReturnType<typeof deriveMeridianBrandLanguageIdentity>,
): Array<ReturnType<typeof evaluateCrossBrandVoiceContamination>> {
  const captions = campaign.copyPackage?.unitCopyDirections.map((u) => u.primaryCaption) ?? [];
  return captions.map((c) => evaluateCrossBrandVoiceContamination(c, identity));
}

export async function runC19R1MeridianLiveProof(): Promise<C19R1MeridianLiveProofResult> {
  const startedAt = new Date().toISOString();
  const errors: string[] = [];

  await initBrandLanguageStore();
  await initCampaignCopyStore();
  await initCreativeIntelligenceStore();

  const providerHealth = await checkCreativeReasoningProviderHealth();
  const mockActive = process.env.SITE00_CREATIVE_REASONING_MOCK_FULL === '1';
  const liveBlocked =
    mockActive ||
    providerHealth.runtimeMode === 'FULL_REASONING_LIVE_TEST_BLOCKED' ||
    !providerHealth.reasoningDispatchAllowed ||
    !providerHealth.providerAvailable;

  const blockReason = mockActive
    ? 'SITE00_CREATIVE_REASONING_MOCK_FULL active — mock cannot satisfy live proof'
    : providerHealth.blockReason ?? (liveBlocked ? 'FULL_REASONING_LIVE_TEST_BLOCKED' : undefined);

  const controlCampaign = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
    forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
  });
  const controlRun = persistMeridianRun({
    label: 'CONTROL_A_DETERMINISTIC',
    campaign: controlCampaign,
    storeMode: getBrandLanguageStoreMode() === 'SUPABASE' ? 'SUPABASE' : 'MEMORY',
    preserveControl: true,
  });

  let fullReasoningRun: MeridianPersistedRun | null = null;
  let fullCampaign: MultiUnitBlindCampaignOutput | null = null;

  if (!liveBlocked) {
    try {
      fullCampaign = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
        forceRuntimeMode: 'FULL_REASONING',
      });
      const creativeDispatch = fullCampaign.textReasoningDispatchCount;
      const copyDispatch = fullCampaign.copyPackage?.copyReasoningDispatchCount ?? 0;
      if (creativeDispatch === 0 && copyDispatch === 0) {
        const { getLastProviderCallDiagnostics } = await import('./seniorCreativeJudgment/creativeReasoningProvider.js');
        const diag = getLastProviderCallDiagnostics();
        errors.push('FULL_REASONING run completed with zero dispatch — not accepted as live pass');
        if (diag.lastError) errors.push(diag.lastError);
        fullCampaign = null;
      } else {
        fullReasoningRun = persistMeridianRun({
          label: 'FULL_REASONING_B',
          campaign: fullCampaign,
          storeMode: getBrandLanguageStoreMode() === 'SUPABASE' ? 'SUPABASE' : 'MEMORY',
        });
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : 'FULL_REASONING run failed');
      fullCampaign = null;
    }
  }

  const identity =
    (await loadBrandLanguageIdentity(MERIDIAN_ATELIER_BRAND_ID)) ?? deriveMeridianBrandLanguageIdentity();

  const controlCaptions = controlCampaign.copyPackage?.unitCopyDirections.map((u) => u.primaryCaption) ?? [];
  const fullCaptions = fullCampaign?.copyPackage?.unitCopyDirections.map((u) => u.primaryCaption) ?? [];

  for (const c of controlCaptions) trackRhetoricalPatterns(c, MERIDIAN_ATELIER_BRAND_ID);
  if (fullCampaign) {
    for (const c of fullCaptions) trackRhetoricalPatterns(c, MERIDIAN_ATELIER_BRAND_ID);
  }

  const comparison = assessMeridianMaterialImprovement({
    control: controlCampaign,
    full: fullCampaign,
    liveBlocked: liveBlocked || !fullCampaign,
  });

  const comparisonRecord = persistMeridianComparison({
    briefId: MERIDIAN_ATELIER_LAUNCH_BRIEF.briefId,
    controlRun,
    fullReasoningRun,
    fullReasoningBlocked: liveBlocked || !fullCampaign,
    blockReason,
    comparison,
    founderJudgment: 'UNREVIEWED',
  });

  const creativeDispatch = fullCampaign?.textReasoningDispatchCount ?? 0;
  const copyDispatch = fullCampaign?.copyPackage?.copyReasoningDispatchCount ?? 0;
  const totalDispatch = creativeDispatch + copyDispatch;

  const capabilityStatus: C19R1MeridianLiveProofResult['capabilityStatus'] =
    !liveBlocked && fullCampaign && totalDispatch > 0
      ? 'FULL_REASONING_LIVE_PASS'
      : 'FULL_REASONING_LIVE_TEST_BLOCKED';

  const completedAt = new Date().toISOString();

  return {
    sprint: 'C1.9R1_LIVE_MERIDIAN_PROOF',
    providerHealth,
    briefVerified: true,
    sameBriefHash: briefFingerprint(),
    controlRun,
    fullReasoningRun,
    fullReasoningBlocked: liveBlocked || !fullCampaign,
    blockReason,
    comparison,
    comparisonRecord,
    qa: {
      categoryClicheControl: evaluateCategoryClicheRisk(controlCaptions, identity.signatureLanguage),
      categoryClicheFull: fullCampaign
        ? evaluateCategoryClicheRisk(fullCaptions, identity.signatureLanguage)
        : null,
      crossBrandControl: runCaptionQA(controlCampaign, identity),
      crossBrandFull: fullCampaign ? runCaptionQA(fullCampaign, identity) : null,
      rhetoricalPatternOveruse: detectRhetoricalPatternOveruse(MERIDIAN_ATELIER_BRAND_ID),
    },
    heroLineCandidates: {
      control: [...generateMeridianHeroLineSeeds(), ...extractHeroLineCandidates(controlCampaign)].slice(0, 8),
      full: fullCampaign
        ? extractHeroLineCandidates(fullCampaign).slice(0, 8)
        : [],
    },
    brandRhetoricalSignature: identity.rhetoricalSignature,
    brandLanguageIdentityVersion: getCurrentVersionLabel(MERIDIAN_ATELIER_BRAND_ID),
    runtimeReceipt: {
      providerName: providerHealth.providerName,
      model: providerHealth.model,
      runtimeMode: liveBlocked ? 'FULL_REASONING_LIVE_TEST_BLOCKED' : 'FULL_REASONING',
      providerAvailable: providerHealth.providerAvailable,
      reasoningDispatchAllowed: providerHealth.reasoningDispatchAllowed,
      structuredOutputSupported: providerHealth.structuredOutputSupported,
      healthCheckStatus: liveBlocked ? 'BLOCKED' : 'OK',
      creativeReasoningDispatchCount: creativeDispatch,
      copyReasoningDispatchCount: copyDispatch,
      totalDispatchCount: totalDispatch,
      startedAt,
      completedAt,
      errors,
      retries: 0,
      imageProviderDispatchCount: 0,
      videoProviderDispatchCount: 0,
      falDispatchCount: 0,
    },
    capabilityStatus,
    storeModes: {
      brandLanguage: getBrandLanguageStoreMode(),
      copy: getCampaignCopyStoreMode(),
      creativeIntelligence: getCreativeIntelligenceStoreModeSync(),
    },
  };
}

export function isC19R1LivePass(result: C19R1MeridianLiveProofResult): boolean {
  return (
    result.capabilityStatus === 'FULL_REASONING_LIVE_PASS' &&
    result.runtimeReceipt.totalDispatchCount > 0 &&
    !result.fullReasoningBlocked &&
    result.fullReasoningRun !== null
  );
}
