/**
 * THE MARKED-UP COPY — identity-native hero pilot (ONE new hero, preserves brand-native pilot for A/B).
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
import {
  compileIdentityNativeVisualBrief,
  IDENTITY_NATIVE_HERO_ASSET_ID,
} from './identityNativeVisualPromptCompiler.js';
import { generateIdentityNativeImageFromBrief } from './gptImage2VisualProviderAdapter.js';
import { inspectIdentityNativeImage } from './identityNativeVisualRawInspector.js';
import { upsertIdentityNativeVisualPilot, findBrandNativeHeroPilot } from './brandNativeVisualPilotStore.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';
import type { IdentityNativeVisualPilotRecord } from './identityNativeArtDirectionTypes.js';

export type IdentityNativeHeroPilotResult = {
  status:
    | 'PILOT_COMPLETE'
    | 'PILOT_DRY_RUN'
    | 'BLOCKED_ON_SONNET'
    | 'BLOCKED_ON_FAL'
    | 'BLOCKED_ON_EXPRESSION_SYSTEM';
  pilot: IdentityNativeVisualPilotRecord | null;
  preservedBrandNativePilotId: string | null;
  otherAssetsGenerated: 0;
  otherDirectionsGenerated: 0;
  anthropicArtDirectorRequests: number;
  credentialExposed: false;
};

async function uploadReferenceToFal(referenceUrl: string): Promise<string> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const res = await fetch(referenceUrl);
  if (!res.ok) throw new Error(`Reference fetch failed (${res.status})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const name = referenceUrl.split('/').pop()?.split('?')[0] || 'ref.webp';
  const type = name.endsWith('.png') ? 'image/png' : 'image/webp';
  return fal.storage.upload(new File([bytes], name, { type }));
}

function founderStatusFromQa(
  qa: IdentityNativeVisualPilotRecord['rawImageQa'],
): IdentityNativeVisualPilotRecord['founderPilotStatus'] {
  if (qa.result === 'ACCEPT') return 'GENERATED';
  if (qa.result === 'REJECT') return 'REJECTED';
  return 'NEEDS_HUMAN_REVIEW';
}

export async function runMarkedUpCopyIdentityNativeHeroPilot(params: {
  orgSlug?: string;
  dryRun?: boolean;
  topic?: string;
}): Promise<IdentityNativeHeroPilotResult> {
  const topic = params.topic ?? BRAND_NATIVE_PILOT_TOPIC;
  const directionId = 'marked-up-copy';
  const preserved = findBrandNativeHeroPilot();

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

  const identityBrief = compileIdentityNativeVisualBrief({
    artDirection: artDirector.artDirection,
    role: BRAND_NATIVE_PILOT_ASSET_ROLE,
    topic,
  });

  if (params.dryRun) {
    return {
      status: 'PILOT_DRY_RUN',
      pilot: null,
      preservedBrandNativePilotId: preserved?.pilotId ?? null,
      otherAssetsGenerated: 0,
      otherDirectionsGenerated: 0,
      anthropicArtDirectorRequests: artDirector.anthropicRequests,
      credentialExposed: false,
    };
  }

  if (!process.env.FAL_KEY?.trim()) {
    return {
      status: 'BLOCKED_ON_FAL',
      pilot: null,
      preservedBrandNativePilotId: preserved?.pilotId ?? null,
      otherAssetsGenerated: 0,
      otherDirectionsGenerated: 0,
      anthropicArtDirectorRequests: artDirector.anthropicRequests,
      credentialExposed: false,
    };
  }

  const generation = await generateIdentityNativeImageFromBrief({
    brief: identityBrief,
    uploadReference: uploadReferenceToFal,
  });

  const imageBuffer = await downloadUrlToBuffer(generation.url);
  const pilotId = randomUUID();
  const storagePath = `site00/assts/batches/ndxbook-identity-native-pilot/generated/${pilotId}.webp`;
  const uploaded = await uploadSite00AssetBuffer(storagePath, imageBuffer, 'image/webp', { upsert: true });

  const rawImageQa = await inspectIdentityNativeImage({
    imageUrl: uploaded.publicUrl,
    brief: identityBrief,
  });

  const record: IdentityNativeVisualPilotRecord = {
    pilotId,
    pilotKind: 'IDENTITY_NATIVE',
    assetId: IDENTITY_NATIVE_HERO_ASSET_ID,
    directionId,
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    expressionSystemId: expressionSystem.expressionSystemId,
    artDirectionId: artDirector.artDirection.artDirectionId,
    topic,
    assetRole: BRAND_NATIVE_PILOT_ASSET_ROLE,
    identityArtDirection: artDirector.artDirection,
    identityBrief,
    model: generation.model,
    provider: 'fal',
    referenceImageInputs: [],
    storagePath: uploaded.storagePath,
    publicUrl: uploaded.publicUrl,
    rawImageQa,
    founderPilotStatus: founderStatusFromQa(rawImageQa),
    founderPilotLabel: 'IDENTITY-NATIVE VISUAL PILOT',
    codeOverlaysApplied: false,
    estimatedCostUsd: generation.costEstimateUsd,
    anthropicArtDirectorRequests: artDirector.anthropicRequests,
    createdAt: new Date().toISOString(),
  };

  upsertIdentityNativeVisualPilot(record);

  return {
    status: 'PILOT_COMPLETE',
    pilot: record,
    preservedBrandNativePilotId: preserved?.pilotId ?? null,
    otherAssetsGenerated: 0,
    otherDirectionsGenerated: 0,
    anthropicArtDirectorRequests: artDirector.anthropicRequests,
    credentialExposed: false,
  };
}
