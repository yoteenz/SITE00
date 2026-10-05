/**
 * P0.VR.7R1 — Learn repeated crop behavior across sibling assets.
 */

import type { FounderWorkflowPattern, NormalizedCropRegion, SiblingAssetSetType } from './types.js';
import { getFounderWorkflowPattern, recordPatternUsage, upsertFounderWorkflowPattern } from './founderWorkflowPatternStore.js';
import { DEFAULT_INNER_MEDIA_CROP } from './siblingGeometryTransfer.js';

const LEARNING_THRESHOLD = 2;

export function inferCropPatternFromApproval(input: {
  assetSetType: SiblingAssetSetType;
  approvedRegion: NormalizedCropRegion;
  excludesBorder: boolean;
  excludesLabel: boolean;
}): string {
  const parts: string[] = [];
  if (input.excludesBorder) parts.push('exclude card border');
  if (input.excludesLabel) parts.push('exclude label');
  parts.push('inner media region');
  if (input.approvedRegion.width < 0.9 || input.approvedRegion.height < 0.8) parts.push('similar padding');
  return parts.join(' · ');
}

export function recordApprovedCropPattern(input: {
  projectId: string;
  jobType: string;
  assetSetType: SiblingAssetSetType;
  approvedRegion: NormalizedCropRegion;
  treatmentPattern: string;
  backgroundPolicy: string;
}): FounderWorkflowPattern {
  const existing = getFounderWorkflowPattern({
    projectId: input.projectId,
    jobType: input.jobType,
    assetSetType: input.assetSetType,
  });

  const usageCount = (existing?.usageCount ?? 0) + 1;
  const successCount = (existing?.successCount ?? 0) + 1;
  const confidence = Math.min(0.95, 0.35 + successCount * 0.2);

  return upsertFounderWorkflowPattern({
    patternId: existing?.patternId ?? `pattern-${input.projectId}-${input.assetSetType}`,
    projectId: input.projectId,
    jobType: input.jobType,
    assetSetType: input.assetSetType,
    instructionIntent: 'repeated sibling crop',
    orderingRule: 'HORIZONTAL_ROW_LEFT_TO_RIGHT',
    cropPattern: input.approvedRegion,
    treatmentPattern: input.treatmentPattern,
    backgroundPolicy: input.backgroundPolicy,
    providerPolicy: 'explicit-approval-only',
    approvalPolicy: 'founder-gates',
    usageCount,
    successCount,
    founderOverrides: existing?.founderOverrides ?? 0,
    confidence,
    lastUsedAt: new Date().toISOString(),
    corrections: existing?.corrections ?? [],
  });
}

export function proposeCropFromLearnedPattern(input: {
  projectId: string;
  jobType: string;
  assetSetType: SiblingAssetSetType;
}): { region: NormalizedCropRegion; confidence: number; learned: boolean; summary: string | null } {
  const pattern = getFounderWorkflowPattern({
    projectId: input.projectId,
    jobType: input.jobType,
    assetSetType: input.assetSetType,
  });

  if (!pattern || pattern.successCount < LEARNING_THRESHOLD || !pattern.cropPattern) {
    return {
      region: DEFAULT_INNER_MEDIA_CROP,
      confidence: 0.45,
      learned: false,
      summary: null,
    };
  }

  recordPatternUsage(pattern.patternId);
  return {
    region: pattern.cropPattern,
    confidence: pattern.confidence,
    learned: true,
    summary: `You usually isolate the inner media region on repeated ${input.assetSetType.replace(/_/g, ' ').toLowerCase()} cards.`,
  };
}

export function recordFounderCropCorrection(input: {
  pattern: FounderWorkflowPattern;
  proposedPattern: NormalizedCropRegion;
  founderCorrection: NormalizedCropRegion;
  reason: string;
}): FounderWorkflowPattern {
  return upsertFounderWorkflowPattern({
    ...input.pattern,
    cropPattern: input.founderCorrection,
    founderOverrides: input.pattern.founderOverrides + 1,
    corrections: [
      ...input.pattern.corrections,
      {
        proposedPattern: input.proposedPattern,
        founderCorrection: input.founderCorrection,
        reason: input.reason,
        finalPattern: input.founderCorrection,
      },
    ],
    confidence: Math.max(0.4, input.pattern.confidence - 0.1),
    lastUsedAt: new Date().toISOString(),
  });
}
