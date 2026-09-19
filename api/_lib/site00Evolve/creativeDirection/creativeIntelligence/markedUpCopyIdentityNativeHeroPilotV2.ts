/**
 * THE MARKED-UP COPY — identity-native hero pilot V2 (creative refinement, ONE hero).
 */

import { randomUUID } from 'node:crypto';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import { resolveMarkedUpCopyBoardReferences, referenceIdsForMarkedUpCopyPilot } from './boardReferenceResolver.js';
import {
  buildMarkedUpCopyExpressionSystemFallback,
  BRAND_NATIVE_PILOT_ASSET_ROLE,
  BRAND_NATIVE_PILOT_TOPIC,
} from './markedUpCopyBrandNativeVisualPilot.js';
import { findLatestMarkedUpCopyExpressionSystem } from './directionExpressionSystemStore.js';
import { runIdentityNativeArtDirector } from './identityNativeArtDirectorService.js';
import { runCreativeExpressionDirector } from './creativeExpressionService.js';
import { runCopyQualityGate, resolveHeroConceptAfterCopyGate } from './copyQualityGate.js';
import { compileIdentityNativeV2VisualBrief } from './identityNativeVisualBriefV2Compiler.js';
import { generateIdentityNativeImageFromBrief } from './gptImage2VisualProviderAdapter.js';
import { inspectIdentityNativeV2Image } from './identityNativeVisualRawInspectorV2.js';
import {
  upsertIdentityNativeV2Pilot,
  findBrandNativeHeroPilot,
  findIdentityNativeHeroPilotV1,
} from './brandNativeVisualPilotStore.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';
import type { IdentityNativeV2PilotRecord } from './creativeExpressionTypes.js';
import { IDENTITY_NATIVE_HERO_V2_ASSET_ID } from './creativeExpressionTypes.js';

export type IdentityNativeHeroPilotV2Result = {
  status:
    | 'PILOT_COMPLETE'
    | 'PILOT_DRY_RUN'
    | 'BLOCKED_ON_SONNET'
    | 'BLOCKED_ON_FAL'
    | 'BLOCKED_ON_EXPRESSION_SYSTEM'
    | 'BLOCKED_ON_COPY_QA';
  pilot: IdentityNativeV2PilotRecord | null;
  preservedV1PilotId: string | null;
  otherAssetsGenerated: 0;
  otherDirectionsGenerated: 0;
  anthropicCreativeExpressionRequests: number;
  credentialExposed: false;
};

function founderStatusFromQa(
  qa: IdentityNativeV2PilotRecord['rawImageQa'],
): IdentityNativeV2PilotRecord['founderPilotStatus'] {
  if (qa.result === 'ACCEPT') return 'GENERATED';
  if (qa.result === 'REJECT') return 'REJECTED';
  return 'NEEDS_HUMAN_REVIEW';
}

export async function runMarkedUpCopyIdentityNativeHeroPilotV2(params: {
  orgSlug?: string;
  dryRun?: boolean;
  topic?: string;
}): Promise<IdentityNativeHeroPilotV2Result> {
  const topic = params.topic ?? BRAND_NATIVE_PILOT_TOPIC;
  const directionId = 'marked-up-copy';
  const v1Pilot = findIdentityNativeHeroPilotV1();

  let expressionSystem = findLatestMarkedUpCopyExpressionSystem();
  if (!expressionSystem) {
    expressionSystem = buildMarkedUpCopyExpressionSystemFallback({ directionId });
  }

  const refResolution = await resolveMarkedUpCopyBoardReferences({
    referenceIds: referenceIdsForMarkedUpCopyPilot(),
    orgSlug: params.orgSlug ?? 'ndxbook',
  });

  const artDirector = await runIdentityNativeArtDirector({
    expressionSystem,
    directionId,
    topic,
    references: refResolution.resolved,
  });

  const creative = await runCreativeExpressionDirector({
    expressionSystem,
    artDirection: artDirector.artDirection,
    v1Pilot,
    topic,
  });

  let heroConcept = creative.heroConcept;
  const copyGate = await runCopyQualityGate({
    heroConcept,
    creativeExpression: creative.creativeExpression,
  });

  heroConcept = resolveHeroConceptAfterCopyGate(heroConcept, copyGate);

  const copyScores = copyGate.revisedCopy && !copyGate.scores.pass
    ? { ...copyGate.scores, pass: true, reasons: [...copyGate.scores.reasons, 'Copy revised before generation'] }
    : copyGate.scores;

  if (!copyScores.pass && params.dryRun !== true) {
    return {
      status: 'BLOCKED_ON_COPY_QA',
      pilot: null,
      preservedV1PilotId: v1Pilot?.pilotId ?? null,
      otherAssetsGenerated: 0,
      otherDirectionsGenerated: 0,
      anthropicCreativeExpressionRequests: creative.anthropicRequests + (copyGate.revisionRounds > 0 ? 1 : 0),
      credentialExposed: false,
    };
  }

  const identityBrief = compileIdentityNativeV2VisualBrief({
    artDirection: artDirector.artDirection,
    creativeExpression: creative.creativeExpression,
    heroConcept,
    copyQualityScores: copyScores,
    role: BRAND_NATIVE_PILOT_ASSET_ROLE,
    topic,
  });

  if (params.dryRun) {
    return {
      status: 'PILOT_DRY_RUN',
      pilot: null,
      preservedV1PilotId: v1Pilot?.pilotId ?? null,
      otherAssetsGenerated: 0,
      otherDirectionsGenerated: 0,
      anthropicCreativeExpressionRequests: creative.anthropicRequests,
      credentialExposed: false,
    };
  }

  if (!process.env.FAL_KEY?.trim()) {
    return {
      status: 'BLOCKED_ON_FAL',
      pilot: null,
      preservedV1PilotId: v1Pilot?.pilotId ?? null,
      otherAssetsGenerated: 0,
      otherDirectionsGenerated: 0,
      anthropicCreativeExpressionRequests: creative.anthropicRequests,
      credentialExposed: false,
    };
  }

  const generation = await generateIdentityNativeImageFromBrief({
    brief: identityBrief,
  });

  const imageBuffer = await downloadUrlToBuffer(generation.url);
  const pilotId = randomUUID();
  const storagePath = `site00/assts/batches/ndxbook-identity-native-v2-pilot/generated/${pilotId}.webp`;
  const uploaded = await uploadSite00AssetBuffer(storagePath, imageBuffer, 'image/webp', { upsert: true });

  const rawImageQa = await inspectIdentityNativeV2Image({
    imageUrl: uploaded.publicUrl,
    brief: identityBrief,
  });

  const record: IdentityNativeV2PilotRecord = {
    pilotId,
    pilotKind: 'IDENTITY_NATIVE_V2',
    assetId: IDENTITY_NATIVE_HERO_V2_ASSET_ID,
    directionId,
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    expressionSystemId: expressionSystem.expressionSystemId,
    artDirectionId: artDirector.artDirection.artDirectionId,
    topic,
    assetRole: BRAND_NATIVE_PILOT_ASSET_ROLE,
    identityArtDirection: artDirector.artDirection,
    creativeExpression: creative.creativeExpression,
    heroCreativeConcept: heroConcept,
    copyQualityGate: copyGate,
    identityBrief,
    v1PilotId: v1Pilot?.pilotId ?? null,
    model: generation.model,
    provider: 'fal',
    referenceImageInputs: [],
    storagePath: uploaded.storagePath,
    publicUrl: uploaded.publicUrl,
    rawImageQa,
    founderPilotStatus: founderStatusFromQa(rawImageQa),
    founderPilotLabel: 'CREATIVE-REFINED IDENTITY PILOT',
    codeOverlaysApplied: false,
    estimatedCostUsd: generation.costEstimateUsd,
    anthropicCreativeExpressionRequests: creative.anthropicRequests + (copyGate.visionInspected ? 1 : 0),
    createdAt: new Date().toISOString(),
  };

  upsertIdentityNativeV2Pilot(record);

  return {
    status: 'PILOT_COMPLETE',
    pilot: record,
    preservedV1PilotId: v1Pilot?.pilotId ?? null,
    otherAssetsGenerated: 0,
    otherDirectionsGenerated: 0,
    anthropicCreativeExpressionRequests: record.anthropicCreativeExpressionRequests,
    credentialExposed: false,
  };
}
