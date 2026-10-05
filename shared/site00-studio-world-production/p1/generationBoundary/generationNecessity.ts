/**
 * Generation necessity — image generation is last resort.
 */

import type { AssetEligibilityEvaluation, AssetEligibilityResult } from './assetEligibility.js';
import type {
  AssetGenerationJustification,
  InterfaceVisualSlot,
  ResolvedSlotMaterial,
} from './interfaceVisualSlot.js';

export type GenerationNecessityResult =
  | 'NO_ASSET_REQUIRED'
  | 'USE_EXISTING_ARTIFACT'
  | 'USE_EXISTING_ASSET'
  | 'CREATE_VARIANT'
  | 'GENERATE_NEW_ASSET'
  | 'FOUNDER_DECISION_REQUIRED';

export function evaluateGenerationNecessity(params: {
  slot: InterfaceVisualSlot;
  eligibility: AssetEligibilityEvaluation | null;
  candidateCount: number;
}): GenerationNecessityResult {
  const { slot, eligibility, candidateCount } = params;

  if (slot.contentCategory !== 'VISUAL_ASSET') {
    return 'NO_ASSET_REQUIRED';
  }

  if (slot.generationPolicy === 'NEVER_GENERATE') {
    return eligibility?.result === 'ELIGIBLE' ? 'USE_EXISTING_ASSET' : 'NO_ASSET_REQUIRED';
  }

  if (slot.generationPolicy === 'EXISTING_ONLY') {
    if (eligibility?.result === 'ELIGIBLE') return 'USE_EXISTING_ARTIFACT';
    if (eligibility?.result === 'ELIGIBLE_WITH_FOUNDER_REVIEW') return 'FOUNDER_DECISION_REQUIRED';
    return 'NO_ASSET_REQUIRED';
  }

  if (eligibility?.result === 'ELIGIBLE') return 'USE_EXISTING_ASSET';
  if (eligibility?.result === 'ELIGIBLE_WITH_FOUNDER_REVIEW') return 'FOUNDER_DECISION_REQUIRED';

  if (candidateCount > 0 && eligibility && !isHardReject(eligibility.result)) {
    return 'FOUNDER_DECISION_REQUIRED';
  }

  if (slot.generationPolicy === 'GENERATE_IF_JUSTIFIED' && slot.required && candidateCount === 0) {
    return 'GENERATE_NEW_ASSET';
  }

  if (slot.generationPolicy === 'PREFER_EXISTING' && candidateCount === 0) {
    return slot.required ? 'FOUNDER_DECISION_REQUIRED' : 'NO_ASSET_REQUIRED';
  }

  return 'NO_ASSET_REQUIRED';
}

function isHardReject(result: AssetEligibilityResult): boolean {
  return [
    'WRONG_PROJECT',
    'WRONG_CLIENT',
    'NEGATIVE_EVIDENCE',
    'METHODOLOGY_OBSOLETE',
    'NOT_SURFACE_APPROPRIATE',
    'NOT_PRODUCTION_ELIGIBLE',
  ].includes(result);
}

export function buildGenerationJustification(params: {
  slot: InterfaceVisualSlot;
  necessity: GenerationNecessityResult;
  existingCandidatesChecked: number;
}): AssetGenerationJustification | null {
  if (params.necessity !== 'GENERATE_NEW_ASSET') return null;
  return {
    slotId: params.slot.slotId,
    whyAssetNeeded: `Slot ${params.slot.semanticRole} has no eligible project artifact`,
    userValue: params.slot.purpose,
    functionalOrExpressivePurpose: params.slot.interactionRelationship,
    existingCandidatesChecked: params.existingCandidatesChecked,
    whyExistingCandidatesInsufficient: 'No eligible approved project visual found after resolution',
    generationType: params.slot.semanticRole === 'CURRENT_PROJECT_VISUAL' ? 'PROJECT_SPECIMEN' : 'EXPRESSIVE_ARTWORK',
    brandOwner: params.slot.clientScope ? 'CLIENT' : 'SITE00',
    hostOwner: params.slot.contentCategory === 'REFERENCE_INPUT',
    intendedSurface: params.slot.surfaceId,
    expectedReuse: 'Single project workspace slot',
    approvalRequired: true,
  };
}

export function mapNecessityToSlotStatus(
  necessity: GenerationNecessityResult,
  eligibility: AssetEligibilityEvaluation | null,
): ResolvedSlotMaterial['status'] {
  if (necessity === 'NO_ASSET_REQUIRED') return 'NO_ASSET_REQUIRED';
  if (necessity === 'USE_EXISTING_ARTIFACT' || necessity === 'USE_EXISTING_ASSET') {
    return eligibility?.result === 'ELIGIBLE_WITH_FOUNDER_REVIEW' ? 'REVIEW_REQUIRED' : 'ELIGIBLE';
  }
  if (necessity === 'GENERATE_NEW_ASSET') return 'MISSING';
  if (necessity === 'FOUNDER_DECISION_REQUIRED') return 'REVIEW_REQUIRED';
  return 'MISSING';
}

export function generationBlockedWithoutJustification(justification: AssetGenerationJustification | null): boolean {
  return !justification?.whyAssetNeeded?.trim();
}

export function methodologyTermBlocksGeneration(assetRole: string): boolean {
  const upper = assetRole.toUpperCase();
  return (
    upper.includes('DOSSIER_DEPTH') ||
    upper.includes('HOST_INTEGRATION') ||
    upper.includes('WORKBENCH_FOCAL') ||
    upper === 'HOST_ENVIRONMENT'
  );
}

export function defaultAssetSourcePriority(): string[] {
  return [
    'LIVE_PROJECT_ARTIFACT',
    'APPROVED_PRODUCTION_ASSET',
    'CLIENT_SUPPLIED_ASSET',
    'VISUAL_DEVELOPMENT_ASSET',
    'LINEAGE_COMPATIBLE_ASSET',
    'RESPONSIVE_VARIANT',
    'PURPOSE_BUILT_GENERATION',
  ];
}
