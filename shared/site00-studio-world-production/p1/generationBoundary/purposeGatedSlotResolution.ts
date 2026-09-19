/**
 * Purpose-gated asset resolution — real project artifacts before generation.
 */

import type { CreativeAssetRecord } from '../../../site00-brand-lore/creativeLineage/types.js';
import {
  evaluateCreativeAssetEligibility,
  evaluateVisualDevelopmentAssetEligibility,
  classifyObsoleteMethodologyAssets,
  type AssetEligibilityEvaluation,
  type VisualDevelopmentGeneratedAsset,
} from './assetEligibility.js';
import {
  buildGenerationJustification,
  evaluateGenerationNecessity,
  generationBlockedWithoutJustification,
  mapNecessityToSlotStatus,
  methodologyTermBlocksGeneration,
} from './generationNecessity.js';
import {
  compileProjectsWorkspaceVisualSlots,
  type InterfaceSlotResolutionResult,
  type InterfaceSlotResolutionSummary,
  type InterfaceVisualSlot,
  type ObsoleteAssetClassification,
  type ResolvedSlotMaterial,
} from './interfaceVisualSlot.js';

export type ProjectVisualEvidenceCandidate = {
  candidateId: string;
  sourceType: ResolvedSlotMaterial['sourceType'];
  asset: CreativeAssetRecord | null;
  visualDevAsset: VisualDevelopmentGeneratedAsset | null;
  publicUrl: string | null;
  storagePath: string | null;
  projectSlug: string | null;
  rank: number;
};

export type ResolveProjectVisualEvidenceInput = {
  projectSlug: string;
  surfaceRole: InterfaceVisualSlot['semanticRole'];
  slot: InterfaceVisualSlot;
  creativeAssets: CreativeAssetRecord[];
  visualDevAssets: VisualDevelopmentGeneratedAsset[];
  requiredApprovalState?: CreativeAssetRecord['reviewState'];
};

export function resolveProjectVisualEvidence(
  input: ResolveProjectVisualEvidenceInput,
): ProjectVisualEvidenceCandidate[] {
  const candidates: ProjectVisualEvidenceCandidate[] = [];
  let rank = 0;

  for (const asset of input.creativeAssets) {
    if (input.projectSlug && asset.brandSlug !== input.projectSlug) continue;
    rank += 1;
    candidates.push({
      candidateId: asset.assetId,
      sourceType: asset.productionState === 'PUBLISHED' || asset.productionState === 'CANONICAL'
        ? 'APPROVED_PRODUCTION_ASSET'
        : 'PROJECT_ARTIFACT',
      asset,
      visualDevAsset: null,
      publicUrl: null,
      storagePath: asset.generationLineage?.storagePath ?? null,
      projectSlug: asset.brandSlug,
      rank,
    });
  }

  for (const vd of input.visualDevAssets) {
    rank += 1;
    candidates.push({
      candidateId: vd.requirementId,
      sourceType: 'VISUAL_DEVELOPMENT_ASSET',
      asset: null,
      visualDevAsset: vd,
      publicUrl: vd.publicUrl,
      storagePath: vd.storagePath,
      projectSlug: input.projectSlug,
      rank,
    });
  }

  return candidates.sort((a, b) => a.rank - b.rank);
}

export function compilePurposeGatedSlotResolution(params: {
  projectSlug?: string;
  creativeAssets?: CreativeAssetRecord[];
  existingGeneratedAssets?: VisualDevelopmentGeneratedAsset[];
}): InterfaceSlotResolutionResult {
  const projectSlug = params.projectSlug ?? 'ndxbook';
  const slots = compileProjectsWorkspaceVisualSlots(projectSlug);
  const creativeAssets = params.creativeAssets ?? [];
  const visualDevAssets = params.existingGeneratedAssets ?? [];

  const obsoleteGeneratedAssets: ObsoleteAssetClassification[] = classifyObsoleteMethodologyAssets(
    visualDevAssets,
  )
    .filter((o: { result: string }) => o.result !== 'ELIGIBLE')
    .map(({ asset }: { asset: VisualDevelopmentGeneratedAsset }) => ({
      requirementId: asset.requirementId,
      storagePath: asset.storagePath,
      classification:
        asset.assetRole.includes('HOST') || asset.assetRole.includes('WORKBENCH')
          ? ('METHODOLOGY_OBSOLETE' as const)
          : ('NOT_SURFACE_APPROPRIATE' as const),
      productionEligible: false,
      reusable: false,
      preserved: true,
    }));

  const resolved: ResolvedSlotMaterial[] = slots.map((slot) =>
    resolveSingleSlot({
      slot,
      projectSlug,
      creativeAssets,
      visualDevAssets,
    }),
  );

  const summary: InterfaceSlotResolutionSummary = {
    slotCount: slots.length,
    found: resolved.filter((r) =>
      ['FOUND', 'ELIGIBLE', 'REVIEW_REQUIRED', 'REJECTED'].includes(r.status),
    ).length,
    eligible: resolved.filter((r) => r.status === 'ELIGIBLE').length,
    reviewRequired: resolved.filter((r) => r.status === 'REVIEW_REQUIRED').length,
    rejected: resolved.filter((r) => r.status === 'REJECTED').length,
    missing: resolved.filter((r) => r.status === 'MISSING').length,
    generationRequired: resolved.filter((r) => r.generationRequired).length,
    estimatedFalCalls: resolved.filter((r) => r.generationRequired).length,
    estimatedCostUsd: resolved.filter((r) => r.generationRequired).length * 0.05,
  };

  return { slots, resolved, summary, obsoleteGeneratedAssets };
}

function resolveSingleSlot(params: {
  slot: InterfaceVisualSlot;
  projectSlug: string;
  creativeAssets: CreativeAssetRecord[];
  visualDevAssets: VisualDevelopmentGeneratedAsset[];
}): ResolvedSlotMaterial {
  const { slot } = params;

  if (slot.contentCategory !== 'VISUAL_ASSET') {
    return {
      slotId: slot.slotId,
      status: 'NO_ASSET_REQUIRED',
      sourceType: slot.contentCategory === 'REFERENCE_INPUT' ? 'HOST_CANON' : 'NONE',
      assetId: null,
      storagePath: null,
      publicUrl: null,
      projectSlug: null,
      eligibilityReason: `${slot.contentCategory} — not sent to FAL`,
      rejectionReason: null,
      generationRequired: false,
      generationJustification: null,
    };
  }

  const candidates = resolveProjectVisualEvidence({
    projectSlug: slot.projectScope ?? params.projectSlug,
    surfaceRole: slot.semanticRole,
    slot,
    creativeAssets: params.creativeAssets,
    visualDevAssets: params.visualDevAssets,
  });

  let bestEligibility: AssetEligibilityEvaluation | null = null;
  let bestCandidate: ProjectVisualEvidenceCandidate | null = null;

  for (const candidate of candidates) {
    const eligibility = candidate.asset
      ? evaluateCreativeAssetEligibility({
          asset: candidate.asset,
          slot,
          targetProjectSlug: params.projectSlug,
        })
      : candidate.visualDevAsset
        ? evaluateVisualDevelopmentAssetEligibility({ asset: candidate.visualDevAsset, slot })
        : null;

    if (!eligibility) continue;
    if (eligibility.result === 'ELIGIBLE' || eligibility.result === 'ELIGIBLE_WITH_FOUNDER_REVIEW') {
      bestEligibility = eligibility;
      bestCandidate = candidate;
      break;
    }
    if (!bestEligibility) {
      bestEligibility = eligibility;
      bestCandidate = candidate;
    }
  }

  const necessity = evaluateGenerationNecessity({
    slot,
    eligibility: bestEligibility,
    candidateCount: candidates.length,
  });

  const status = mapNecessityToSlotStatus(necessity, bestEligibility);
  const generationRequired =
    necessity === 'GENERATE_NEW_ASSET' &&
    !generationBlockedWithoutJustification(
      buildGenerationJustification({
        slot,
        necessity,
        existingCandidatesChecked: candidates.length,
      }),
    );

  const justification = generationRequired
    ? buildGenerationJustification({
        slot,
        necessity,
        existingCandidatesChecked: candidates.length,
      })
    : null;

  if (bestEligibility && ['WRONG_PROJECT', 'WRONG_CLIENT', 'NEGATIVE_EVIDENCE', 'METHODOLOGY_OBSOLETE', 'NOT_SURFACE_APPROPRIATE'].includes(bestEligibility.result)) {
    return {
      slotId: slot.slotId,
      status: 'REJECTED',
      sourceType: bestCandidate?.sourceType ?? 'NONE',
      assetId: bestCandidate?.candidateId ?? null,
      storagePath: bestCandidate?.storagePath ?? null,
      publicUrl: bestCandidate?.publicUrl ?? null,
      projectSlug: bestCandidate?.projectSlug ?? null,
      eligibilityReason: null,
      rejectionReason: bestEligibility.reason,
      generationRequired: false,
      generationJustification: null,
    };
  }

  return {
    slotId: slot.slotId,
    status,
    sourceType: bestCandidate?.sourceType ?? (status === 'MISSING' ? 'NONE' : 'EMPTY_STATE'),
    assetId: bestCandidate?.candidateId ?? null,
    storagePath: bestCandidate?.storagePath ?? null,
    publicUrl: bestCandidate?.publicUrl ?? null,
    projectSlug: bestCandidate?.projectSlug ?? slot.projectScope,
    eligibilityReason: bestEligibility?.reason ?? null,
    rejectionReason: null,
    generationRequired,
    generationJustification: justification,
  };
}

export function compileAssetPromptFromPurpose(params: {
  slot: InterfaceVisualSlot;
  projectName: string;
  justification: NonNullable<ResolvedSlotMaterial['generationJustification']>;
}): string {
  return [
    `Create visual material for ${params.projectName}.`,
    params.justification.userValue,
    params.justification.functionalOrExpressivePurpose,
    'Use approved project expression evidence and attached visual references.',
    'Output artwork only — no page UI, no SITE 00 shell.',
  ].join(' ');
}

export function slotResolutionBlocksMethodologyGeneration(assetRole: string): boolean {
  return methodologyTermBlocksGeneration(assetRole);
}
