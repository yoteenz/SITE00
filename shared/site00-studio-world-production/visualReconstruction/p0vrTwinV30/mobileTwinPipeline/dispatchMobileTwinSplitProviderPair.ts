import { createHash } from 'node:crypto';
import { runTwinProviderBenchmarkFalJob } from '../../../../site00-visual-generation/twinProviderBenchmarkAdapter.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../constants.js';
import { attachMobileRenderTranslationReceipts } from './attachMobileRenderTranslationReceipts.js';
import { buildMobileBlueprintTwinFromCompositionFalPrompt } from './buildMobileTwinFalPrompts.js';
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

export type MobileTwinSplitProviderPairResult = {
  actual: MobileImplementationRender;
  blueprint: MobileBlueprintTwinVisual;
  actualJobRef: string;
  blueprintJobRef: string;
  actualModel: string;
  blueprintModel: string;
  actualCostUsd: number;
  blueprintCostUsd: number;
  actualLatencyMs: number;
  blueprintLatencyMs: number;
  totalLatencyMs: number;
  totalCostUsd: number;
};

/** Composition-sourced siblings — Actual and Blueprint may use different FAL models. */
export async function dispatchMobileTwinSplitProviderPair(input: {
  runPrefix: string;
  actualModel: string;
  blueprintModel: string;
  actualPrompt: string;
  blueprintPrompt?: string;
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
  publicOrigin?: string;
  actualProviderSettings?: Record<string, unknown>;
  blueprintProviderSettings?: Record<string, unknown>;
}): Promise<MobileTwinSplitProviderPairResult> {
  const referenceUrl = resolveMobileTwinPublicAssetUrl(input.reference.sourceImageUri, input.publicOrigin);
  const blueprintPrompt =
    input.blueprintPrompt ??
    buildMobileBlueprintTwinFromCompositionFalPrompt({
      composition: input.composition,
      siblingActualRenderId: `${input.runPrefix}-actual`,
    });

  const actualFal = await runTwinProviderBenchmarkFalJob({
    jobKey: `${input.runPrefix}-actual`,
    model: input.actualModel,
    prompt: input.actualPrompt,
    referenceImageUrls: [referenceUrl],
    aspectRatio: '9:16',
    outputWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    outputHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    providerSettings: input.actualProviderSettings ?? {},
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
    model: input.blueprintModel,
    prompt: blueprintPrompt,
    referenceImageUrls: [referenceUrl],
    aspectRatio: '9:16',
    outputWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    outputHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    providerSettings: input.blueprintProviderSettings ?? {},
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

  const actualCostUsd = ESTIMATED_JOB_COST_USD;
  const blueprintCostUsd = ESTIMATED_JOB_COST_USD;

  return {
    actual: baseRender,
    blueprint,
    actualJobRef: actualFal.jobRef,
    blueprintJobRef: blueprintFal.jobRef,
    actualModel: input.actualModel,
    blueprintModel: input.blueprintModel,
    actualCostUsd,
    blueprintCostUsd,
    actualLatencyMs: actualFal.latencyMs,
    blueprintLatencyMs: blueprintFal.latencyMs,
    totalLatencyMs: actualFal.latencyMs + blueprintFal.latencyMs,
    totalCostUsd: actualCostUsd + blueprintCostUsd,
  };
}
