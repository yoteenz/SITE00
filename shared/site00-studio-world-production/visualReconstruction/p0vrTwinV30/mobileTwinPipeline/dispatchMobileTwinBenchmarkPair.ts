import { createHash } from 'node:crypto';
import { runTwinProviderBenchmarkFalJob } from '../../../../site00-visual-generation/twinProviderBenchmarkAdapter.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../constants.js';
import { attachMobileRenderTranslationReceipts } from './attachMobileRenderTranslationReceipts.js';
import {
  buildMobileBlueprintTwinFromCompositionFalPrompt,
  buildMobileImplementationRenderFalPrompt,
} from './buildMobileTwinFalPrompts.js';
import { REAL_PROVIDER_RENDER_MODE } from './mobileRenderClassification.js';
import { resolveMobileTwinPublicAssetUrl } from './resolveMobileTwinPublicAssetUrl.js';
import type {
  MobileBlueprintTwinVisual,
  MobileDesignReferenceAuthority,
  MobileImplementationRender,
  MobileTwinCompositionState,
} from './types.js';

const ESTIMATED_JOB_COST_USD = 0.08;

function hashFromUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

export type MobileTwinBenchmarkPairResult = {
  actual: MobileImplementationRender;
  blueprint: MobileBlueprintTwinVisual;
  actualJobRef: string;
  blueprintJobRef: string;
  model: string;
  actualCostUsd: number;
  blueprintCostUsd: number;
  actualLatencyMs: number;
  blueprintLatencyMs: number;
  providerSettings: Record<string, unknown>;
};

/** Method A only — explicit model via benchmark adapter (no silent fallback). */
export async function dispatchMobileTwinBenchmarkPair(input: {
  runPrefix: string;
  model: string;
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
  publicOrigin?: string;
  providerSettings?: Record<string, unknown>;
}): Promise<MobileTwinBenchmarkPairResult> {
  const referenceUrl = resolveMobileTwinPublicAssetUrl(input.reference.sourceImageUri, input.publicOrigin);
  const actualPrompt = buildMobileImplementationRenderFalPrompt({
    reference: input.reference,
    composition: input.composition,
  });
  const blueprintPrompt = buildMobileBlueprintTwinFromCompositionFalPrompt({
    composition: input.composition,
    siblingActualRenderId: `${input.runPrefix}-actual`,
  });

  const settings = input.providerSettings ?? {};

  const actualFal = await runTwinProviderBenchmarkFalJob({
    jobKey: `${input.runPrefix}-actual`,
    model: input.model,
    prompt: actualPrompt,
    referenceImageUrls: [referenceUrl],
    aspectRatio: '9:16',
    outputWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    outputHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    providerSettings: settings,
  });

  const actualId = `${input.runPrefix}-actual`;
  const renderImageHash = hashFromUrl(`${actualFal.url}:${actualFal.jobRef}`);
  if (renderImageHash === input.reference.sourceImageHash) {
    throw new Error('MOBILE_RENDER_PROVIDER_FAILED');
  }

  let baseRender: MobileImplementationRender = {
    id: actualId,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    referenceAuthorityId: input.reference.id,
    renderImageUri: actualFal.url,
    renderImageHash,
    widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    provider: 'FAL',
    providerJobRef: actualFal.jobRef,
    providerModel: actualFal.model,
    providerStatus: 'GENERATED',
    renderMode: REAL_PROVIDER_RENDER_MODE,
    providerArtifactType: 'REAL_VISUAL_GENERATION',
    normalizedRequest: actualFal.normalizedInput,
    parentRenderId: null,
    refinementScope: 'PROVIDER_BENCHMARK',
    founderNotes: undefined,
    providerCostUsd: ESTIMATED_JOB_COST_USD,
    status: 'FOUNDER_REVIEW',
    createdAt: new Date().toISOString(),
  };

  const withReceipts = attachMobileRenderTranslationReceipts({
    render: baseRender,
    reference: input.reference,
    composition: input.composition,
  });
  baseRender = withReceipts.render;

  const blueprintFal = await runTwinProviderBenchmarkFalJob({
    jobKey: `${input.runPrefix}-blueprint`,
    model: input.model,
    prompt: blueprintPrompt,
    referenceImageUrls: [referenceUrl],
    aspectRatio: '9:16',
    outputWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    outputHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    providerSettings: settings,
  });

  const blueprintId = `${input.runPrefix}-blueprint`;
  const twinImageHash = hashFromUrl(`${blueprintFal.url}:${blueprintFal.jobRef}`);
  const blueprint: MobileBlueprintTwinVisual = {
    id: blueprintId,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    implementationRenderId: actualId,
    twinImageUri: blueprintFal.url,
    twinImageHash,
    provider: 'FAL',
    providerJobRef: blueprintFal.jobRef,
    structuralSource: 'FROZEN_COMPOSITION_STATE',
    outputRepresentationMode: 'TECHNICAL_BLUEPRINT_RENDER',
    createdAt: new Date().toISOString(),
  };

  return {
    actual: baseRender,
    blueprint,
    actualJobRef: actualFal.jobRef,
    blueprintJobRef: blueprintFal.jobRef,
    model: input.model,
    actualCostUsd: ESTIMATED_JOB_COST_USD,
    blueprintCostUsd: ESTIMATED_JOB_COST_USD,
    actualLatencyMs: actualFal.latencyMs,
    blueprintLatencyMs: blueprintFal.latencyMs,
    providerSettings: { ...settings, benchmarkModel: input.model },
  };
}
