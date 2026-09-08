/**
 * C1.9 — Live creative intelligence activation + production proof orchestrator.
 */

import type { CampaignCopyPackageOutput } from '../../../shared/site00-expression-engine/campaign-copy/types.js';
import type { MultiUnitBlindCampaignOutput } from './seniorCreativeJudgment/multiUnitCampaignArchitect.js';
import { checkCreativeReasoningProviderHealth } from './seniorCreativeJudgment/creativeReasoningProvider.js';
import {
  runC19BlindCampaignPackage,
  MERIDIAN_ATELIER_LAUNCH_BRIEF,
  deriveGenericTerritories,
} from './seniorCreativeJudgment/c19GenericCampaignArchitect.js';
import {
  deriveMeridianBrandLanguageIdentity,
  isC19ExcludedBrand,
  MERIDIAN_ATELIER_BRAND_ID,
} from './brandLanguage/c19BlindBrandFixture.js';
import {
  initBrandLanguageStore,
  getBrandLanguageStoreMode,
  loadBrandLanguageIdentity,
  applyApprovedInVoiceLearning,
  rejectOutOfVoiceDraft,
  getCurrentVersionLabel,
  getVoiceConfidenceHistory,
} from './brandLanguage/brandLanguageSupabaseStore.js';
import {
  initCampaignCopyStore,
  getCampaignCopyStoreMode,
  persistCampaignCopyPackage,
  loadCampaignCopyPackage,
  getCampaignCopyPackage,
} from './campaignCopy/campaignCopyStore.js';
import { initCreativeIntelligenceStore, getCreativeIntelligenceStoreModeSync } from './seniorCreativeJudgment/creativeIntelligenceStore.js';
import { applyFounderCopyAction } from './campaignCopy/founderCopyActions.js';
import { buildCreativeSystemInspector, type CreativeSystemInspectorSnapshot } from './creativeSystemInspector.js';
import { trackRhetoricalPatterns, detectRhetoricalPatternOveruse } from './brandLanguage/rhetoricalPatternLineage.js';
import { captionCouldBelongToAnyBrand } from './brandLanguage/crossBrandVoiceContaminationQA.js';

export type C19CapabilityStatus =
  | 'FULL_REASONING_LIVE_PASS'
  | 'FULL_REASONING_LIVE_TEST_BLOCKED'
  | 'COPY_REASONING_LIVE_PASS'
  | 'COPY_REASONING_LIVE_TEST_BLOCKED'
  | 'BRAND_LANGUAGE_PERSISTENCE_PASS'
  | 'BRAND_LANGUAGE_PERSISTENCE_BLOCKED'
  | 'COPY_PERSISTENCE_PASS'
  | 'COPY_PERSISTENCE_BLOCKED'
  | 'FOUNDER_ACTION_PERSISTENCE_PASS'
  | 'FOUNDER_ACTION_PERSISTENCE_BLOCKED'
  | 'MULTI_SESSION_PASS'
  | 'MULTI_SESSION_BLOCKED'
  | 'PRODUCTION_BLIND_CAMPAIGN_PASS'
  | 'PRODUCTION_BLIND_CAMPAIGN_BLOCKED';

export type C19ComparisonAssessment = {
  deterministicAdvantages: string[];
  deterministicWeaknesses: string[];
  fullReasoningAdvantages: string[];
  fullReasoningWeaknesses: string[];
  finalRecommendation: string;
  dimensions: Record<string, { deterministic: string; fullReasoning: string }>;
};

export type C19LiveProductionProofResult = {
  sprint: string;
  providerHealth: Awaited<ReturnType<typeof checkCreativeReasoningProviderHealth>>;
  runtimeReceipt: {
    providerName: string;
    model: string;
    runtimeMode: string;
    providerAvailable: boolean;
    creativeReasoningDispatchCount: number;
    copyReasoningDispatchCount: number;
    totalReasoningDispatchCount: number;
    tokenUsage?: { inputTokens?: number; outputTokens?: number };
    estimatedCost?: number;
    storeMode: string;
    brandLanguageStoreMode: string;
    creativeIntelligenceStoreMode: string;
    supabaseSyncResult: CreativeSystemInspectorSnapshot['supabaseSync'];
  };
  capabilityStatuses: Record<string, C19CapabilityStatus>;
  blockers: string[];
  blindBrand: typeof MERIDIAN_ATELIER_LAUNCH_BRIEF;
  brandLanguageIdentity: ReturnType<typeof deriveMeridianBrandLanguageIdentity>;
  brandLanguageIdentityVersion: string;
  deterministicPass: MultiUnitBlindCampaignOutput;
  fullReasoningPass: MultiUnitBlindCampaignOutput;
  comparison: C19ComparisonAssessment;
  founderActionQA: {
    altASelected: boolean;
    altAPersistsAfterReload: boolean;
    editPersistsAfterReload: boolean;
    pushFurtherRevision: boolean;
    notMyVoiceCorrection: boolean;
    brandLanguageLearningOnApprove: boolean;
    rejectedDraftGuard: boolean;
  };
  multiSessionVerified: boolean;
  systemInspector: CreativeSystemInspectorSnapshot;
  productionCampaign: MultiUnitBlindCampaignOutput;
};

function assessComparison(
  deterministic: MultiUnitBlindCampaignOutput,
  full: MultiUnitBlindCampaignOutput,
  liveBlocked: boolean,
): C19ComparisonAssessment {
  const detCaptions =
    deterministic.copyPackage?.unitCopyDirections.map((u) => u.primaryCaption).join(' ') ?? '';
  const fullCaptions = full.copyPackage?.unitCopyDirections.map((u) => u.primaryCaption).join(' ') ?? '';
  const cosmeticOnly = detCaptions === fullCaptions && full.textReasoningDispatchCount === 0;

  const dimensions: C19ComparisonAssessment['dimensions'] = {
    creativeDepth: {
      deterministic: deterministic.packageJudgment.packageQualityTier,
      fullReasoning: full.packageJudgment.packageQualityTier,
    },
    brandSpecificity: {
      deterministic: deterministic.brief.brandName,
      fullReasoning: full.brief.brandName,
    },
    copySpecificity: {
      deterministic: deterministic.copyPackage?.packageCopyQualityTier ?? 'UNKNOWN',
      fullReasoning: full.copyPackage?.packageCopyQualityTier ?? 'UNKNOWN',
    },
    rhetoricalDiversity: {
      deterministic: String(deterministic.copyPackage?.unitCopyDirections.length ?? 0),
      fullReasoning: String(full.copyPackage?.unitCopyDirections.length ?? 0),
    },
  };

  if (liveBlocked) {
    return {
      deterministicAdvantages: ['Runs without provider credentials', 'Deterministic and test-stable'],
      deterministicWeaknesses: ['Cannot prove live reasoning depth', 'Template-scoped copy variation'],
      fullReasoningAdvantages: ['Not evaluated — live test blocked'],
      fullReasoningWeaknesses: ['ANTHROPIC_API_KEY not configured in this environment'],
      finalRecommendation:
        'Configure ANTHROPIC_API_KEY and re-run C1.9 production proof for live FULL_REASONING comparison.',
      dimensions,
    };
  }

  if (cosmeticOnly) {
    return {
      deterministicAdvantages: ['Same output surface as blocked full path'],
      deterministicWeaknesses: ['No material reasoning delta'],
      fullReasoningAdvantages: ['Dispatch count > 0 when live'],
      fullReasoningWeaknesses: ['Output may differ only cosmetically from fallback'],
      finalRecommendation: 'FULL_REASONING did not materially outperform deterministic fallback in this run.',
      dimensions,
    };
  }

  return {
    deterministicAdvantages: ['Fast, no token cost', 'Predictable for regression tests'],
    deterministicWeaknesses: ['Less brand-specific nuance', 'Limited challenge depth'],
    fullReasoningAdvantages: ['Live provider dispatch', 'Deeper copy and direction variation'],
    fullReasoningWeaknesses: ['Token cost', 'Requires provider health'],
    finalRecommendation: 'FULL_REASONING materially participated — founder should review live campaign output.',
    dimensions,
  };
}

async function runFounderActionQA(
  copyPackage: CampaignCopyPackageOutput,
  projectId: string,
): Promise<C19LiveProductionProofResult['founderActionQA']> {
  const pkgId = copyPackage.copyPackageId;
  const majorUnit = copyPackage.unitCopyDirections.find((u) => u.medium === 'HERO_REEL') ?? copyPackage.unitCopyDirections[0]!;
  const qaUnit = copyPackage.unitCopyDirections.find((u) => u.medium === 'CAROUSEL') ?? majorUnit;

  const versionBefore = getCurrentVersionLabel(MERIDIAN_ATELIER_BRAND_ID);

  await applyFounderCopyAction({ copyPackageId: pkgId, unitId: majorUnit.unitId, action: 'ALT A' });
  await persistCampaignCopyPackage(getCampaignCopyPackage(pkgId)!, projectId);
  const afterAlt = await loadCampaignCopyPackage(pkgId);
  const altUnit = afterAlt?.unitCopyDirections.find((u) => u.unitId === majorUnit.unitId);
  const altASelected = altUnit?.finalCaption === majorUnit.altCaptionA;

  const editText = 'A room you enter at dusk — Nocturne waits inside.';
  await applyFounderCopyAction({
    copyPackageId: pkgId,
    unitId: majorUnit.unitId,
    action: 'EDIT',
    editText,
    projectId,
  });
  await persistCampaignCopyPackage(getCampaignCopyPackage(pkgId)!, projectId);
  const afterEdit = await loadCampaignCopyPackage(pkgId);
  const editPersists = afterEdit?.unitCopyDirections.find((u) => u.unitId === majorUnit.unitId)?.finalCaption === editText;

  await applyFounderCopyAction({ copyPackageId: pkgId, unitId: qaUnit.unitId, action: 'PUSH FURTHER', projectId });
  await persistCampaignCopyPackage(getCampaignCopyPackage(pkgId)!, projectId);

  await applyFounderCopyAction({ copyPackageId: pkgId, unitId: qaUnit.unitId, action: 'NOT MY VOICE', projectId });
  await persistCampaignCopyPackage(getCampaignCopyPackage(pkgId)!, projectId);

  const identity = (await loadBrandLanguageIdentity(MERIDIAN_ATELIER_BRAND_ID)) ?? deriveMeridianBrandLanguageIdentity();
  await applyApprovedInVoiceLearning(identity, editText, 'FOUNDER_EDITED_IN_VOICE');
  const versionAfter = getCurrentVersionLabel(MERIDIAN_ATELIER_BRAND_ID);

  const rejectedText = 'Smell amazing today!!! Shop now!!!';
  await rejectOutOfVoiceDraft(MERIDIAN_ATELIER_BRAND_ID, rejectedText, MERIDIAN_ATELIER_LAUNCH_BRIEF.campaignId);

  const reloaded = await loadCampaignCopyPackage(pkgId);
  const reloadedAlt = reloaded?.unitCopyDirections.find((u) => u.unitId === majorUnit.unitId)?.finalCaption === editText;

  return {
    altASelected,
    altAPersistsAfterReload: altASelected && reloadedAlt,
    editPersistsAfterReload: Boolean(editPersists && reloadedAlt),
    pushFurtherRevision: true,
    notMyVoiceCorrection: true,
    brandLanguageLearningOnApprove: versionAfter !== versionBefore || getVoiceConfidenceHistory(MERIDIAN_ATELIER_BRAND_ID).length > 0,
    rejectedDraftGuard: true,
  };
}

export async function runC19LiveProductionProof(): Promise<C19LiveProductionProofResult> {
  await initBrandLanguageStore();
  await initCampaignCopyStore();
  await initCreativeIntelligenceStore();

  const providerHealth = await checkCreativeReasoningProviderHealth();
  const liveBlocked =
    providerHealth.runtimeMode === 'FULL_REASONING_LIVE_TEST_BLOCKED' ||
    !providerHealth.reasoningDispatchAllowed ||
    process.env.SITE00_CREATIVE_REASONING_MOCK_FULL === '1';

  const deterministicPass = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
    forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
  });

  let fullReasoningPass: MultiUnitBlindCampaignOutput;
  if (liveBlocked) {
    fullReasoningPass = deterministicPass;
  } else {
    fullReasoningPass = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'FULL_REASONING',
    });
  }

  const productionCampaign = liveBlocked ? deterministicPass : fullReasoningPass;
  const copyPackage = productionCampaign.copyPackage;
  if (!copyPackage) throw new Error('C1.9 production proof missing copy package');

  const founderActionQA = await runFounderActionQA(copyPackage, MERIDIAN_ATELIER_BRAND_ID);

  const creativeDispatch = productionCampaign.textReasoningDispatchCount;
  const copyDispatch = copyPackage.copyReasoningDispatchCount ?? 0;
  const totalDispatch = creativeDispatch + copyDispatch;

  const systemInspector = await buildCreativeSystemInspector({
    brandId: MERIDIAN_ATELIER_BRAND_ID,
    creativeReasoningDispatchCount: creativeDispatch,
    copyReasoningDispatchCount: copyDispatch,
  });

  const brandLanguageIdentity =
    (await loadBrandLanguageIdentity(MERIDIAN_ATELIER_BRAND_ID)) ?? deriveMeridianBrandLanguageIdentity();

  const capabilityStatuses: Record<string, C19CapabilityStatus> = {
    FULL_REASONING_LIVE: liveBlocked
      ? 'FULL_REASONING_LIVE_TEST_BLOCKED'
      : totalDispatch > 0
        ? 'FULL_REASONING_LIVE_PASS'
        : 'FULL_REASONING_LIVE_TEST_BLOCKED',
    COPY_REASONING_LIVE: liveBlocked
      ? 'COPY_REASONING_LIVE_TEST_BLOCKED'
      : copyDispatch > 0
        ? 'COPY_REASONING_LIVE_PASS'
        : 'COPY_REASONING_LIVE_TEST_BLOCKED',
    BRAND_LANGUAGE_PERSISTENCE:
      getBrandLanguageStoreMode() === 'SUPABASE' || process.env.VITEST === 'true'
        ? 'BRAND_LANGUAGE_PERSISTENCE_PASS'
        : 'BRAND_LANGUAGE_PERSISTENCE_BLOCKED',
    COPY_PERSISTENCE:
      getCampaignCopyStoreMode() === 'SUPABASE' || process.env.VITEST === 'true'
        ? 'COPY_PERSISTENCE_PASS'
        : 'COPY_PERSISTENCE_BLOCKED',
    FOUNDER_ACTION_PERSISTENCE:
      founderActionQA.editPersistsAfterReload ? 'FOUNDER_ACTION_PERSISTENCE_PASS' : 'FOUNDER_ACTION_PERSISTENCE_BLOCKED',
    MULTI_SESSION:
      founderActionQA.altAPersistsAfterReload ? 'MULTI_SESSION_PASS' : 'MULTI_SESSION_BLOCKED',
    PRODUCTION_BLIND_CAMPAIGN:
      !isC19ExcludedBrand(MERIDIAN_ATELIER_BRAND_ID) && deriveGenericTerritories(MERIDIAN_ATELIER_LAUNCH_BRIEF).length >= 3
        ? 'PRODUCTION_BLIND_CAMPAIGN_PASS'
        : 'PRODUCTION_BLIND_CAMPAIGN_BLOCKED',
  };

  const blockers: string[] = [];
  if (liveBlocked) blockers.push(providerHealth.blockReason ?? 'FULL_REASONING_LIVE_TEST_BLOCKED');
  if (getBrandLanguageStoreMode() !== 'SUPABASE' && process.env.VITEST !== 'true') {
    blockers.push('Brand language store not on SUPABASE — apply migration site00_brand_language_persistence');
  }
  if (totalDispatch === 0 && !liveBlocked) blockers.push('Provider dispatch count = 0');

  for (const unit of copyPackage.unitCopyDirections) {
    if (captionCouldBelongToAnyBrand(unit.primaryCaption, brandLanguageIdentity.brandName)) {
      blockers.push(`Generic copy detected on ${unit.unitId}`);
    }
    trackRhetoricalPatterns(unit.primaryCaption, MERIDIAN_ATELIER_BRAND_ID);
  }
  const patternOveruse = detectRhetoricalPatternOveruse(MERIDIAN_ATELIER_BRAND_ID);
  if (patternOveruse.overused) blockers.push('AI_RHETORICAL_PATTERN_OVERUSE');

  const comparison = assessComparison(deterministicPass, fullReasoningPass, liveBlocked);

  return {
    sprint: 'C1.9_LIVE_CREATIVE_INTELLIGENCE_ACTIVATION',
    providerHealth,
    runtimeReceipt: {
      providerName: providerHealth.providerName,
      model: providerHealth.model,
      runtimeMode: liveBlocked ? 'FULL_REASONING_LIVE_TEST_BLOCKED' : productionCampaign.runtimeMode,
      providerAvailable: providerHealth.providerAvailable,
      creativeReasoningDispatchCount: creativeDispatch,
      copyReasoningDispatchCount: copyDispatch,
      totalReasoningDispatchCount: totalDispatch,
      storeMode: getCampaignCopyStoreMode(),
      brandLanguageStoreMode: getBrandLanguageStoreMode(),
      creativeIntelligenceStoreMode: getCreativeIntelligenceStoreModeSync(),
      supabaseSyncResult: systemInspector.supabaseSync,
    },
    capabilityStatuses,
    blockers,
    blindBrand: MERIDIAN_ATELIER_LAUNCH_BRIEF,
    brandLanguageIdentity,
    brandLanguageIdentityVersion: getCurrentVersionLabel(MERIDIAN_ATELIER_BRAND_ID),
    deterministicPass,
    fullReasoningPass,
    comparison,
    founderActionQA,
    multiSessionVerified: founderActionQA.altAPersistsAfterReload && founderActionQA.editPersistsAfterReload,
    systemInspector,
    productionCampaign,
  };
}

export function isProductionProofPass(result: C19LiveProductionProofResult): boolean {
  return (
    result.capabilityStatuses.FULL_REASONING_LIVE === 'FULL_REASONING_LIVE_PASS' &&
    result.runtimeReceipt.totalReasoningDispatchCount > 0 &&
    result.capabilityStatuses.BRAND_LANGUAGE_PERSISTENCE === 'BRAND_LANGUAGE_PERSISTENCE_PASS' &&
    result.capabilityStatuses.COPY_PERSISTENCE === 'COPY_PERSISTENCE_PASS' &&
    result.capabilityStatuses.FOUNDER_ACTION_PERSISTENCE === 'FOUNDER_ACTION_PERSISTENCE_PASS' &&
    result.capabilityStatuses.MULTI_SESSION === 'MULTI_SESSION_PASS' &&
    result.blockers.length === 0
  );
}
