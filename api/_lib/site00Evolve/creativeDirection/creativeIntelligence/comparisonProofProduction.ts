/**
 * Six-direction Stage A visual proof production — FAL + code-native routing.
 */

import { CREATIVE_DIRECTION_FAL_MODEL } from '../assetGeneration.js';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import {
  assessDirectionProductionCompleteness,
  normalizeFormedDirection,
} from './directionFieldContract.js';
import {
  buildComparisonProofJobKey,
  compileComparisonProofPrompt,
  resolveProofMedium,
} from './comparisonProofPromptCompiler.js';
import {
  comparisonSetKeyFor,
  createComparisonProofAssetId,
  findComparisonProofAsset,
  groupProofAssetsByDirection,
  loadComparisonProofManifest,
  storagePathForComparisonProof,
  upsertComparisonProofAsset,
} from './comparisonProofStore.js';
import { compareCousinDistinctiveness, inspectComparisonProof } from './comparisonProofInspector.js';
import type {
  ComparisonDistinctivenessResult,
  ComparisonProofAsset,
  ComparisonProofProductionPlan,
  ComparisonProofType,
  ComparisonVisualProofPlan,
  FounderComparisonSet,
  type CoreDirectionFormationInput,
  FormedCoreDirection,
  SixDirectionProductionResult,
} from './types.js';

const BIREFNET_MODEL = 'fal-ai/birefnet/v2';
const FAL_COST_ESTIMATE_USD = 0.04;
const BIREFNET_COST_ESTIMATE_USD = 0.02;
const MAX_REGENERATION_ITERATIONS = 2;

const PRIMARY_PROOF_TYPES: ComparisonProofType[] = [
  'heroWorld',
  'primaryArtifact',
  'socialExpression',
];

const ALL_PROOF_TYPES: ComparisonProofType[] = [
  'heroWorld',
  'primaryArtifact',
  'materialObject',
  'typographicGraphic',
  'socialExpression',
  'motionSeed',
];

function isCodeNativeProof(proofType: ComparisonProofType, medium: string): boolean {
  return (
    medium === 'CODE_NATIVE' ||
    medium === 'SVG_NATIVE' ||
    proofType === 'typographicGraphic' ||
    proofType === 'motionSeed'
  );
}

function buildTypographicSvg(direction: FormedCoreDirection): Buffer {
  const thesis = direction.oneLineThesis.replace(/[<>&"]/g, '');
  const name = direction.directionName.replace(/[<>&"]/g, '');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#f7f5f0"/>
  <text x="60" y="80" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#c41e3a" letter-spacing="4">NDX BOOK</text>
  <text x="60" y="160" font-family="Georgia, serif" font-size="48" fill="#111">${name}</text>
  <text x="60" y="260" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#333">${thesis}</text>
  <text x="60" y="340" font-family="Helvetica, Arial, sans-serif" font-size="16" fill="#666">${direction.typographicAttitude.slice(0, 120)}</text>
</svg>`;
  return Buffer.from(svg, 'utf8');
}

function buildMotionSeedSvg(direction: FormedCoreDirection): Buffer {
  const name = direction.directionName.replace(/[<>&"]/g, '');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="400" viewBox="0 0 1600 400">
  <rect width="1600" height="400" fill="#111"/>
  <text x="40" y="50" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#c41e3a">MOTION SEED · ${name}</text>
  ${[0, 1, 2, 3, 4]
    .map(
      (i) => `
  <rect x="${40 + i * 300}" y="80" width="260" height="280" fill="#222" stroke="#444"/>
  <text x="${60 + i * 300}" y="220" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#eee">FRAME ${i + 1}</text>`,
    )
    .join('')}
</svg>`;
  return Buffer.from(svg, 'utf8');
}

async function removeBackground(imageUrl: string): Promise<string> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured for background removal');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const result = (await fal.subscribe(BIREFNET_MODEL, {
    input: { image_url: imageUrl },
    logs: false,
  })) as { data?: { image?: { url?: string } } };

  const url = result?.data?.image?.url;
  if (!url) throw new Error('BiRefNet returned no isolated image');
  return url;
}

async function generateFalImage(params: {
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
}): Promise<{ url: string; model: string }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const result = (await fal.subscribe(CREATIVE_DIRECTION_FAL_MODEL, {
    input: {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      aspect_ratio: params.aspectRatio,
      output_format: 'webp',
      resolution: '2K',
      num_images: 1,
    },
    logs: false,
  })) as { data?: { images?: Array<{ url?: string }> } };

  const url = result?.data?.images?.[0]?.url;
  if (!url) throw new Error('FAL returned no image URL');
  return { url, model: CREATIVE_DIRECTION_FAL_MODEL };
}

export function estimateComparisonProofProduction(
  comparisonSet: FounderComparisonSet,
  options: { includeAllProofTypes?: boolean } = {},
): ComparisonProofProductionPlan {
  const proofTypes = options.includeAllProofTypes ? ALL_PROOF_TYPES : PRIMARY_PROOF_TYPES;
  let plannedFalCalls = 0;
  let backgroundRemovalCalls = 0;
  let codeNativeProofs = 0;
  const proofTypesByDirection: Record<string, ComparisonProofType[]> = {};

  for (const direction of comparisonSet.directions) {
    if (!direction.fieldCompleteness.complete) continue;
    const plan = comparisonSet.visualProofPlans.find((p) => p.directionId === direction.directionId);
    if (!plan) continue;

    const input = comparisonSet.directions[0]?.sourceFormationId
      ? null
      : null;

    proofTypesByDirection[direction.directionId] = [];
    for (const proofType of proofTypes) {
      proofTypesByDirection[direction.directionId]!.push(proofType);
      const medium = resolveProofMedium(proofType, plan);
      if (isCodeNativeProof(proofType, medium)) {
        codeNativeProofs += 1;
      } else {
        plannedFalCalls += 1;
        if (
          proofType === 'primaryArtifact' ||
          medium === 'FAL_GENERATED_AND_ISOLATED' ||
          proofType === 'materialObject'
        ) {
          backgroundRemovalCalls += 1;
        }
      }
    }
  }

  const estimatedCostUsd =
    plannedFalCalls * FAL_COST_ESTIMATE_USD + backgroundRemovalCalls * BIREFNET_COST_ESTIMATE_USD;

  return {
    plannedFalCalls,
    backgroundRemovalCalls,
    codeNativeProofs,
    motionVideoCalls: 0,
    estimatedCostUsd,
    proofTypesByDirection,
  };
}

async function produceOneProof(params: {
  comparisonSetKey: string;
  direction: FormedCoreDirection & { comparisonIndex: number; sourceFormationId: string; sourceFormationVersion: number };
  proofType: ComparisonProofType;
  plan: ComparisonVisualProofPlan;
  formationInput: CoreDirectionFormationInput;
  iteration?: number;
  dryRun?: boolean;
}): Promise<{ asset: ComparisonProofAsset | null; falCalls: number; bgCalls: number; costUsd: number; reused: boolean }> {
  const iteration = params.iteration ?? 0;
  const compiled = compileComparisonProofPrompt({
    direction: params.direction,
    proofType: params.proofType,
    input: params.formationInput,
    plan: params.plan,
  });

  const model = isCodeNativeProof(params.proofType, compiled.medium) ? 'code-native' : CREATIVE_DIRECTION_FAL_MODEL;
  const jobKey = buildComparisonProofJobKey({
    comparisonSetKey: params.comparisonSetKey,
    directionId: params.direction.directionId,
    proofType: params.proofType,
    promptHash: compiled.promptHash,
    model,
    referenceHash: compiled.referenceHash,
  });

  const existing = findComparisonProofAsset({ jobKey });
  if (existing && existing.qaState === 'ACCEPT') {
    return { asset: existing, falCalls: 0, bgCalls: 0, costUsd: 0, reused: true };
  }

  if (params.dryRun) {
    return { asset: null, falCalls: 0, bgCalls: 0, costUsd: 0, reused: false };
  }

  let falCalls = 0;
  let bgCalls = 0;
  let costUsd = 0;
  let url = '';
  let storagePath = '';
  let sourceGenerationUrl: string | undefined;
  let generationSucceeded = false;
  let errorMessage: string | undefined;

  try {
    if (isCodeNativeProof(params.proofType, compiled.medium)) {
      const buffer =
        params.proofType === 'motionSeed'
          ? buildMotionSeedSvg(params.direction)
          : buildTypographicSvg(params.direction);
      storagePath = storagePathForComparisonProof({
        comparisonIndex: params.direction.comparisonIndex,
        proofType: params.proofType,
        iteration,
      }).replace('.webp', '.svg');
      const uploaded = await uploadSite00AssetBuffer(storagePath, buffer, 'image/svg+xml');
      url = uploaded.publicUrl;
      generationSucceeded = true;
    } else {
      const falResult = await generateFalImage({
        prompt: compiled.prompt,
        negativePrompt: compiled.negativePrompt,
        aspectRatio: compiled.aspectRatio,
      });
      falCalls += 1;
      costUsd += FAL_COST_ESTIMATE_USD;
      sourceGenerationUrl = falResult.url;

      let finalUrl = falResult.url;
      if (compiled.backgroundRemovalRequired) {
        finalUrl = await removeBackground(falResult.url);
        bgCalls += 1;
        costUsd += BIREFNET_COST_ESTIMATE_USD;
      }

      const buffer = await downloadUrlToBuffer(finalUrl);
      storagePath = storagePathForComparisonProof({
        comparisonIndex: params.direction.comparisonIndex,
        proofType: params.proofType,
        iteration,
      });
      const uploaded = await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp');
      url = uploaded.publicUrl;
      generationSucceeded = true;
    }
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : 'Proof generation failed';
  }

  const inspection = inspectComparisonProof({
    direction: params.direction,
    proofType: params.proofType,
    prompt: compiled.prompt,
    generationSucceeded,
    errorMessage,
    medium: compiled.medium,
  });

  if (inspection.outcome === 'REJECT' && iteration < MAX_REGENERATION_ITERATIONS) {
    return produceOneProof({ ...params, iteration: iteration + 1 });
  }

  const asset: ComparisonProofAsset = {
    assetId: createComparisonProofAssetId(),
    comparisonSetKey: params.comparisonSetKey,
    comparisonIndex: params.direction.comparisonIndex,
    directionId: params.direction.directionId,
    directionName: params.direction.directionName,
    sourceFormationId: params.direction.sourceFormationId,
    sourceFormationVersion: params.direction.sourceFormationVersion,
    proofType: params.proofType,
    url,
    storagePath,
    medium: compiled.medium,
    model,
    promptHash: compiled.promptHash,
    referenceHash: compiled.referenceHash,
    qaState: inspection.outcome,
    productionState:
      inspection.outcome === 'ACCEPT'
        ? 'READY'
        : inspection.outcome === 'REJECT'
          ? 'FAILED'
          : 'NEEDS_REVIEW',
    backgroundRemovalRequired: compiled.backgroundRemovalRequired,
    edgeTreatment: compiled.edgeTreatment,
    shadowOwner: compiled.shadowOwner,
    compositeMaps: [
      {
        canvasWidth: 390,
        canvasHeight: 520,
        x: 0,
        y: 0,
        width: 390,
        height: 520,
        rotation: 0,
        zIndex: 1,
        anchor: 'center',
        shadowOwner: compiled.shadowOwner,
        breakpoint: 'MOBILE',
      },
      {
        canvasWidth: 1440,
        canvasHeight: 900,
        x: 720,
        y: 0,
        width: 680,
        height: 900,
        rotation: 0,
        zIndex: 1,
        anchor: 'right',
        shadowOwner: compiled.shadowOwner,
        breakpoint: 'DESKTOP',
      },
    ],
    sourceGenerationUrl,
    iteration,
    inspectionNotes: inspection.notes,
    createdAt: new Date().toISOString(),
  };

  if (generationSucceeded && url) {
    upsertComparisonProofAsset(asset);
  }

  return { asset, falCalls, bgCalls, costUsd, reused: false };
}

export async function runSixDirectionProofProduction(params: {
  comparisonSet: FounderComparisonSet;
  formationInputByFormationId: Record<string, CoreDirectionFormationInput>;
  proofTypes?: ComparisonProofType[];
  dryRun?: boolean;
  skipIncompleteDirections?: boolean;
}): Promise<SixDirectionProductionResult> {
  const comparisonSetKey = comparisonSetKeyFor(
    params.comparisonSet.brandLoreFingerprint,
    params.comparisonSet.brandLoreProfileVersion,
  );
  const proofTypes = params.proofTypes ?? PRIMARY_PROOF_TYPES;
  const falKey = process.env.FAL_KEY?.trim();
  const skipped = !falKey && proofTypes.some((pt) => pt !== 'typographicGraphic' && pt !== 'motionSeed');

  let falRequestCount = 0;
  let backgroundRemovalCount = 0;
  let codeNativeCount = 0;
  let actualCostUsd = 0;
  let assetsAccepted = 0;
  let assetsRejected = 0;
  let assetsNeedReview = 0;
  const producedAssets: ComparisonProofAsset[] = [];

  const estimate = estimateComparisonProofProduction(params.comparisonSet, {
    includeAllProofTypes: proofTypes.length === ALL_PROOF_TYPES.length,
  });

  for (const direction of params.comparisonSet.directions) {
    const merged = normalizeFormedDirection(direction);
    const completeness = assessDirectionProductionCompleteness(merged);
    if (params.skipIncompleteDirections !== false && !completeness.complete) {
      continue;
    }

    const plan = params.comparisonSet.visualProofPlans.find((p) => p.directionId === direction.directionId);
    if (!plan) continue;

    const formationInput = params.formationInputByFormationId[direction.sourceFormationId];
    if (!formationInput) continue;

    for (const proofType of proofTypes) {
      const result = await produceOneProof({
        comparisonSetKey,
        direction: direction as FormedCoreDirection & {
          comparisonIndex: number;
          sourceFormationId: string;
          sourceFormationVersion: number;
        },
        proofType,
        plan,
        formationInput,
        dryRun: params.dryRun || skipped,
      });

      falRequestCount += result.falCalls;
      backgroundRemovalCount += result.bgCalls;
      actualCostUsd += result.costUsd;
      if (result.asset) {
        if (isCodeNativeProof(proofType, result.asset.medium)) codeNativeCount += 1;
        producedAssets.push(result.asset);
        if (result.asset.qaState === 'ACCEPT') assetsAccepted += 1;
        else if (result.asset.qaState === 'REJECT') assetsRejected += 1;
        else assetsNeedReview += 1;
      }
    }
  }

  const allAssets = loadComparisonProofManifest().filter((a) => a.comparisonSetKey === comparisonSetKey);
  const distinctiveness: ComparisonDistinctivenessResult[] = [];
  for (const pair of params.comparisonSet.distinctivenessPairs) {
    const [nameA, nameB] = pair.pair;
    const dirA = params.comparisonSet.directions.find((d) => d.directionName === nameA);
    const dirB = params.comparisonSet.directions.find((d) => d.directionName === nameB);
    const assetsA = allAssets.filter((a) => a.directionId === dirA?.directionId);
    const assetsB = allAssets.filter((a) => a.directionId === dirB?.directionId);
    const cmp = compareCousinDistinctiveness({
      directionA: nameA,
      directionB: nameB,
      assetsA,
      assetsB,
    });
    distinctiveness.push({ pair: pair.pair, result: cmp.result, notes: cmp.notes });
  }

  const tooSimilar = distinctiveness.some((d) => d.result === 'TOO_SIMILAR');
  const needsReview = distinctiveness.some((d) => d.result === 'NEEDS_HUMAN_REVIEW');
  const sixWorldGate: SixDirectionProductionResult['sixWorldGate'] = tooSimilar
    ? 'FAIL'
    : needsReview
      ? 'NEEDS_HUMAN_REVIEW'
      : 'PASS';

  return {
    v1Completion: { anthropicRequestCount: 0, directionsCompleted: 0 },
    production: {
      skipped,
      falRequestCount,
      backgroundRemovalCount,
      codeNativeCount,
      estimatedCostUsd: estimate.estimatedCostUsd,
      actualCostUsd,
      assetsAccepted,
      assetsRejected,
      assetsNeedReview,
    },
    distinctiveness,
    sixWorldGate,
    assets: producedAssets,
  };
}

export function attachProofAssetsToComparisonSet(
  comparisonSet: FounderComparisonSet,
): FounderComparisonSet {
  const key = comparisonSetKeyFor(
    comparisonSet.brandLoreFingerprint,
    comparisonSet.brandLoreProfileVersion,
  );
  const assets = loadComparisonProofManifest();
  return {
    ...comparisonSet,
    proofAssetsByDirection: groupProofAssetsByDirection(assets, key),
    productionSummary: estimateComparisonProofProduction(comparisonSet, { includeAllProofTypes: true }),
  };
}
