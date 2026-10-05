/**
 * P0.5E.4D — Live FAL dispatch for character visual casting stills (uses stored prompt snapshots).
 */

import {
  downloadUrlToBuffer,
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
  uploadSite00AssetBuffer,
} from '../../site00Assts/storage.js';
import {
  buildFalImageInput,
  SITE00_FAL_TEXT_TO_IMAGE_MODEL,
} from '../../../../shared/site00-visual-generation/falImageModels.js';
import {
  applyCastingGenerationResults,
} from '../../../../shared/site00-studio-world-production/characterVisualCasting/castingEngine.js';
import {
  compileCastingPromptFromContract,
  compileCharacterCastingPromptContract,
  resolveStoredPromptContract,
} from '../../../../shared/site00-studio-world-production/characterVisualCasting/promptContract.js';
import { resolveReferenceImageUrlsFromContract } from '../../../../shared/site00-studio-world-production/characterVisualCasting/imageReferenceCasting.js';
import { migrateImageReferenceCastingState } from '../../../../shared/site00-studio-world-production/characterVisualCasting/imageReferenceMigration.js';
import { migrateReferenceDrivenCastingState } from '../../../../shared/site00-studio-world-production/characterVisualCasting/referenceDrivenCasting.js';
import { recommendStillImageCastingProvider } from '../../../../shared/site00-studio-world-production/characterVisualCasting/providerSelection.js';
import { projectAssetStoragePath } from '../../../../shared/site00-projects/storagePaths.js';
import type {
  CharacterCastingCandidate,
  CharacterTruthSnapshot,
  CharacterVisualCastingState,
} from '../../../../shared/site00-studio-world-production/characterVisualCasting/types.js';

export type CastingCandidateGenerationResult = {
  candidateId: string;
  previewUrl: string;
  outputAssetId: string;
  model: string;
};

function storagePathFor(projectId: string, roundId: string, candidateId: string): string {
  return projectAssetStoragePath(projectId, 'character-casting', roundId, `${candidateId}.webp`);
}

function resolveCandidatePromptContract(params: {
  state: CharacterVisualCastingState;
  candidate: CharacterCastingCandidate;
  snapshot: CharacterTruthSnapshot;
}) {
  const migrated = migrateReferenceDrivenCastingState(params.state);
  const stored = resolveStoredPromptContract(migrated, params.candidate.promptSnapshotId);
  if (stored) return stored;

  return compileCharacterCastingPromptContract({
    snapshot: params.snapshot,
    variationAxis: params.candidate.variationAxis,
  });
}

async function generateOneCastingStill(params: {
  projectId: string;
  roundId: string;
  candidate: CharacterCastingCandidate;
  snapshot: CharacterTruthSnapshot;
  state: CharacterVisualCastingState;
}): Promise<CastingCandidateGenerationResult> {
  const contract = resolveCandidatePromptContract({
    state: params.state,
    candidate: params.candidate,
    snapshot: params.snapshot,
  });
  const { prompt, negativePrompt } = compileCastingPromptFromContract(contract);
  const storagePath = storagePathFor(params.projectId, params.roundId, params.candidate.candidateId);
  const migratedState = migrateImageReferenceCastingState(params.state);
  const referenceImageUrls = resolveReferenceImageUrlsFromContract(migratedState, contract, (path) =>
    getSite00AssetPublicUrl(path),
  );

  if (process.env.VITEST === 'true') {
    return {
      candidateId: params.candidate.candidateId,
      previewUrl: `https://vitest.local/${storagePath}`,
      outputAssetId: storagePath,
      model: SITE00_FAL_TEXT_TO_IMAGE_MODEL,
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');

  if (await site00StorageObjectExists(storagePath)) {
    return {
      candidateId: params.candidate.candidateId,
      previewUrl: getSite00AssetPublicUrl(storagePath),
      outputAssetId: storagePath,
      model: SITE00_FAL_TEXT_TO_IMAGE_MODEL,
    };
  }

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const fullPrompt = `${prompt}\n\nAvoid: ${negativePrompt}`;
  const { model, input } = buildFalImageInput({
    prompt: fullPrompt,
    aspectRatio: params.candidate.assetSlot?.startsWith('FULL_BODY_') || params.candidate.assetSlot === 'FRONT_FULL_BODY' ? '3:4' : '4:5',
    outputFormat: 'webp',
    referenceImageUrls: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
  });

  const result = (await fal.subscribe(model, { input: input as never, logs: false })) as {
    data?: { images?: Array<{ url?: string }> };
  };

  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error(`FAL returned no image for candidate ${params.candidate.candidateId}`);
  }

  const buffer = await downloadUrlToBuffer(imageUrl);
  const { publicUrl } = await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp', { upsert: true });

  return {
    candidateId: params.candidate.candidateId,
    previewUrl: publicUrl,
    outputAssetId: storagePath,
    model,
  };
}

export async function dispatchCastingRoundFal(params: {
  projectId: string;
  state: CharacterVisualCastingState;
  roundId: string;
}): Promise<CharacterVisualCastingState> {
  const state = migrateReferenceDrivenCastingState(params.state);
  const round = state.rounds.find((entry) => entry.roundId === params.roundId);
  if (!round) throw new Error('Casting round not found');

  const snapshot = state.truthSnapshots.find((entry) => entry.snapshotId === round.characterTruthSnapshotId);
  if (!snapshot) throw new Error('Character truth snapshot required for casting generation');

  const candidates = state.candidates.filter((entry) => entry.roundId === params.roundId);
  const rec = recommendStillImageCastingProvider(true);

  const results = await Promise.all(
    candidates.map((candidate) =>
      generateOneCastingStill({
        projectId: params.projectId,
        roundId: params.roundId,
        candidate,
        snapshot,
        state,
      }),
    ),
  );

  return applyCastingGenerationResults({
    state,
    roundId: params.roundId,
    results,
    model: rec.model ?? SITE00_FAL_TEXT_TO_IMAGE_MODEL,
  });
}
