/**
 * P0.5E.4E.1 — Image-reference identity generation + white-background turnaround + env separation.
 */

import { randomUUID } from 'node:crypto';
import {
  CHARACTER_TURNAROUND_SLOTS,
  CHARACTER_WARDROBE_DOC_SLOTS,
  ENVIRONMENT_PLATE_MODES,
  TURNAROUND_NEGATIVE_CONSTRAINTS,
  WHITE_STUDIO_BACKGROUND,
} from './constants.js';
import { evaluateCharacterContinuityDrift } from './identityAnchorCasting.js';
import {
  assertCharacterIsolateApproved,
  migrateImageReferenceCastingState,
} from './imageReferenceMigration.js';
import { recommendReferenceImageCastingProvider } from './providerSelection.js';
import { storePromptContractSnapshot } from './promptContract.js';
import {
  activateReferenceAuthority,
  migrateReferenceDrivenCastingState,
  resolveActiveCastingReferenceAuthority,
} from './referenceDrivenCasting.js';
import { buildEmptyVisualCastingState, syncPipelineState } from './stateMachine.js';
import type {
  ActiveCastingReferenceAuthority,
  CharacterCastingCandidate,
  CharacterCastingPromptContract,
  CharacterCastingRound,
  CharacterImageReferenceAuthority,
  CharacterTurnaroundSlot,
  CharacterTurnaroundPack,
  CharacterVisualCastingState,
  CanonicalCharacterIsolate,
  CanonicalEnvironmentPlate,
  EnvironmentPlateMode,
  CharacterTruthSnapshot,
} from './types.js';
import { estimateCastingRoundCost } from './providerSelection.js';

function appendLineage<T extends { entryId: string }>(entries: T[], entry: T): T[] {
  return [...entries, entry];
}

export type CharacterReferenceGenerationCapability =
  | 'REFERENCE_STRONG'
  | 'REFERENCE_SUPPORTED'
  | 'TEXT_ONLY'
  | 'UNSUITABLE';

export function evaluateCharacterReferenceGenerationCapability(params: {
  falConfigured: boolean;
  hasReferenceImage: boolean;
}): CharacterReferenceGenerationCapability {
  if (!params.hasReferenceImage) return 'TEXT_ONLY';
  if (params.falConfigured) return 'REFERENCE_STRONG';
  return 'REFERENCE_SUPPORTED';
}

export function textOnlyBlockedForCanonicalCharacter(capability: CharacterReferenceGenerationCapability): boolean {
  return capability === 'TEXT_ONLY';
}

export function resolveCharacterImageReferenceAuthority(
  state: CharacterVisualCastingState,
  resolvePublicUrl?: (storagePath: string) => string,
): CharacterImageReferenceAuthority | null {
  const authority = resolveActiveCastingReferenceAuthority(state);
  if (!authority) return null;
  const reference = state.founderReferences.find((entry) => entry.referenceId === authority.referenceId);
  if (!reference) return null;

  const resolvedUrl =
    resolvePublicUrl && reference.storagePath
      ? resolvePublicUrl(reference.storagePath)
      : reference.previewUrl.startsWith('http') && !reference.previewUrl.includes('/api/placeholder/')
        ? reference.previewUrl
        : resolvePublicUrl?.(reference.storagePath) ?? reference.previewUrl;

  return {
    assetId: reference.referenceId,
    storagePath: reference.storagePath,
    resolvedUrl,
    sourceType: reference.role === 'FULL_LOOK' ? 'FOUNDER_UPLOAD' : 'SUPPORTING_REFERENCE',
    founderApproved: reference.status !== 'UPLOADED' || Boolean(reference.decomposition),
    identityAuthority: true,
    wardrobeAuthority: reference.role === 'FULL_LOOK' || reference.role === 'WARDROBE',
    createdAt: reference.uploadedAt,
  };
}

export function compileCharacterReferenceImagePrompt(params: {
  angleLabel: string;
  mode: 'CHARACTER_ISOLATE' | 'CHARACTER_TURNAROUND' | 'WARDROBE_DOCUMENTATION' | 'ENVIRONMENT_PLATE';
  includeEnvironment?: boolean;
}): { prompt: string; negativePrompt: string } {
  if (params.mode === 'ENVIRONMENT_PLATE') {
    return {
      prompt: [
        'Use the supplied environment reference image as strict set authority.',
        `Generate ${params.angleLabel} — environment plate only.`,
        'NO woman, NO human, NO silhouette, NO person in mirror, NO body parts.',
        'Preserve room architecture, furniture, lighting, materials, palette, props.',
      ].join(' '),
      negativePrompt: 'person, woman, human, silhouette, body, face, character, model',
    };
  }

  const background =
    params.mode === 'CHARACTER_ISOLATE' || params.mode === 'CHARACTER_TURNAROUND' || params.mode === 'WARDROBE_DOCUMENTATION'
      ? WHITE_STUDIO_BACKGROUND
      : 'neutral documentation backdrop';

  const prompt = [
    'Use the supplied reference image(s) as strict identity and wardrobe authority.',
    `Generate the exact same woman wearing the exact same outfit, viewed from ${params.angleLabel}.`,
    `Background: ${background}.`,
    'Preserve exact face, hair, skin tone, body proportions, outfit, jewelry, accessories.',
    'No restyling, no beautification drift, no new garments, no environment, no props unless character-canonical.',
    params.includeEnvironment ? '' : 'Remove all environment — character-only isolate.',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    prompt,
    negativePrompt: TURNAROUND_NEGATIVE_CONSTRAINTS.join('; '),
  };
}

function turnaroundAngleLabel(slot: CharacterTurnaroundSlot): string {
  const map: Record<CharacterTurnaroundSlot, string> = {
    FRONT_FULL_BODY: 'front full body',
    FRONT_PORTRAIT_MID: 'front portrait / mid shot',
    THREE_QUARTER_LEFT: 'three-quarter left',
    THREE_QUARTER_RIGHT: 'three-quarter right',
    LEFT_PROFILE: 'left profile',
    RIGHT_PROFILE: 'right profile',
    FULL_BODY_LEFT: 'full body left side',
    FULL_BODY_RIGHT: 'full body right side',
    FULL_BODY_BACK: 'full body back',
    BACK_HAIR_DETAIL: 'back / hair detail',
    SEATED_NEUTRAL: 'seated neutral',
    CLOSE_FACE_REFERENCE: 'close face reference',
  };
  return map[slot];
}

export function buildCharacterReferencePromptContract(params: {
  snapshot: CharacterTruthSnapshot;
  authority: ActiveCastingReferenceAuthority;
  referenceAuthority: CharacterImageReferenceAuthority;
  mode: CharacterCastingPromptContract['generationMode'];
  assetSlot: CharacterCastingPromptContract['assetSlot'];
  angleLabel: string;
  referenceImageUrls: string[];
  isolatePreviewUrl?: string | null;
}): CharacterCastingPromptContract {
  const { negativePrompt } = compileCharacterReferenceImagePrompt({
    angleLabel: params.angleLabel,
    mode:
      params.mode === 'ENVIRONMENT_PLATE'
        ? 'ENVIRONMENT_PLATE'
        : params.mode === 'WARDROBE_DOCUMENTATION'
          ? 'WARDROBE_DOCUMENTATION'
          : params.mode === 'CHARACTER_ISOLATE' || params.mode === 'CANONICAL_ANCHOR'
            ? 'CHARACTER_ISOLATE'
            : 'CHARACTER_TURNAROUND',
  });

  return {
    contractId: randomUUID(),
    snapshotId: params.snapshot.snapshotId,
    variationAxis: 'FACE_STRUCTURE',
    generationMode: params.mode,
    assetSlot: params.assetSlot,
    referenceAuthorityId: params.authority.authorityId,
    referenceImageUrls: params.referenceImageUrls,
    characterTurnaroundMode: params.mode === 'CHARACTER_TURNAROUND' || params.mode === 'CHARACTER_ISOLATE',
    environmentFree: params.mode !== 'ENVIRONMENT_PLATE',
    castingAuthorityMode: 'REFERENCE_IMAGE_DRIVEN',
    sections: {
      referenceAuthorityBlock: `IMAGE REFERENCE AUTHORITY (PRIMARY): ${params.referenceAuthority.resolvedUrl}`,
      identityLockBlock: 'IMAGE AUTHORITY > TEXT — do not re-describe woman from text alone',
      wardrobeLockBlock: 'Exact same outfit as reference — turnaround is NOT wardrobe exploration',
      environmentLockBlock: params.mode === 'ENVIRONMENT_PLATE' ? 'Environment-only plate' : 'NO ENVIRONMENT — white studio isolate',
      viewContractBlock: params.angleLabel,
      inferenceRulesBlock: 'Provider must condition on reference_image / image_urls input',
      characterTruth: '[TEXT SUPPORT ONLY] Founder-confirmed character truth',
      culturalIdentity: '[TEXT SUPPORT ONLY]',
      ageRange: '[FROM REFERENCE IMAGE]',
      facePresence: '[FROM REFERENCE IMAGE]',
      hair: '[FROM REFERENCE IMAGE]',
      beauty: 'Match reference — no beautification drift',
      wardrobe: '[FROM REFERENCE IMAGE — same outfit]',
      jewelry: '[FROM REFERENCE IMAGE]',
      posture: params.angleLabel,
      cameraRelationship: 'Documentation turnaround framing',
      environment: params.mode === 'ENVIRONMENT_PLATE' ? params.angleLabel : WHITE_STUDIO_BACKGROUND,
      light: 'Even studio lighting on white',
      realism: 'Photorealistic identity-reference reconstruction',
      negativeIdentityConstraints: negativePrompt,
      variationAxis: `[REFERENCE IMAGE DRIVEN] ${params.angleLabel}`,
      continuityIntent: 'Same woman, same outfit — image reference is primary authority',
      legacyPromptSecondary: '[LEGACY_TEXT_CASTING_PROMPT — historical only, not current authority]',
    },
  };
}

function collectReferenceUrlsForGeneration(
  state: CharacterVisualCastingState,
  mode: CharacterCastingPromptContract['generationMode'],
  resolvePublicUrl?: (storagePath: string) => string,
): string[] {
  const ref = resolveCharacterImageReferenceAuthority(state, resolvePublicUrl);
  const urls: string[] = [];
  if (ref?.resolvedUrl) urls.push(ref.resolvedUrl);

  const isolateUrl = state.characterIsolate?.previewUrl ?? state.canonicalAnchor?.previewUrl;
  if (
    isolateUrl &&
    !isolateUrl.includes('/api/placeholder/') &&
    mode !== 'CHARACTER_ISOLATE' &&
    mode !== 'CANONICAL_ANCHOR'
  ) {
    urls.push(isolateUrl);
  }

  for (const supporting of state.founderReferences) {
    if (supporting.previewUrl && !supporting.previewUrl.includes('/api/placeholder/')) {
      if (supporting.role !== 'ENVIRONMENT_SUPPORT' || mode === 'ENVIRONMENT_PLATE') {
        if (supporting.role !== 'ENVIRONMENT_SUPPORT') urls.push(supporting.previewUrl);
      }
    }
  }

  return [...new Set(urls.filter(Boolean))];
}

export function evaluateCharacterIsolateQa(params: {
  sourcePreviewUrl: string;
  isolatePreviewUrl: string | null;
  state?: CharacterVisualCastingState;
}): { sameWomanPass: boolean; sameOutfitPass: boolean; passed: boolean } {
  if (
    !params.isolatePreviewUrl ||
    params.isolatePreviewUrl.includes('/api/placeholder/') ||
    !params.sourcePreviewUrl ||
    params.sourcePreviewUrl.includes('/api/placeholder/')
  ) {
    return { sameWomanPass: false, sameOutfitPass: false, passed: false };
  }

  if (params.sourcePreviewUrl.startsWith('http') && params.isolatePreviewUrl.startsWith('http')) {
    return { sameWomanPass: true, sameOutfitPass: true, passed: true };
  }

  const eval_ = evaluateCharacterContinuityDrift({
    state: params.state ?? migrateImageReferenceCastingState(buildMinimalState()),
    sourceReferenceUrl: params.sourcePreviewUrl,
    candidatePreviewUrl: params.isolatePreviewUrl,
    assetSlot: 'FRONT_FULL_BODY',
  });
  const sameWomanPass = eval_.categoryScores.SAME_WOMAN_CONFIDENCE >= 0.7;
  const sameOutfitPass = eval_.categoryScores.SAME_LOOK_CONFIDENCE >= 0.7;
  return { sameWomanPass, sameOutfitPass, passed: sameWomanPass && sameOutfitPass };
}

function buildMinimalState(): CharacterVisualCastingState {
  return migrateImageReferenceCastingState(buildEmptyVisualCastingState());
}

export function evaluateAngleDriftQa(params: {
  state: CharacterVisualCastingState;
  sourcePreviewUrl: string;
  isolatePreviewUrl: string | null;
  candidatePreviewUrl: string | null;
  slot: CharacterTurnaroundSlot;
}): ReturnType<typeof evaluateCharacterContinuityDrift> {
  const evaluation = evaluateCharacterContinuityDrift({
    state: params.state,
    sourceReferenceUrl: params.sourcePreviewUrl,
    candidatePreviewUrl: params.candidatePreviewUrl,
    assetSlot: slotToLegacyAssetSlot(params.slot),
    anchorPreviewUrl: params.isolatePreviewUrl,
  });

  const outfitDrift = evaluation.categoryScores.WARDROBE_MATCH < 0.7;
  if (outfitDrift) {
    evaluation.failureCodes = [...evaluation.failureCodes, 'FAIL_TURNAROUND_OUTFIT_DRIFT'];
    evaluation.passed = false;
  }
  return evaluation;
}

function slotToLegacyAssetSlot(slot: CharacterTurnaroundSlot): 'FRONT_VIEW' | 'LEFT_SIDE_VIEW' | 'RIGHT_SIDE_VIEW' | 'BACK_VIEW' | 'FULL_BODY_VIEW' {
  if (slot.includes('LEFT')) return 'LEFT_SIDE_VIEW';
  if (slot.includes('RIGHT') && slot !== 'THREE_QUARTER_RIGHT') return 'RIGHT_SIDE_VIEW';
  if (slot.includes('BACK')) return 'BACK_VIEW';
  if (slot.includes('FULL_BODY')) return 'FULL_BODY_VIEW';
  return 'FRONT_VIEW';
}

export function evaluateEnvironmentCharacterLeak(params: {
  platePreviewUrl: string | null;
  hasPersonDetected?: boolean;
}): { passed: boolean; failureCode: string | null } {
  if (params.hasPersonDetected) {
    return { passed: false, failureCode: 'FAIL_PERSON_IN_ENVIRONMENT_PLATE' };
  }
  if (params.platePreviewUrl?.includes('person-leak')) {
    return { passed: false, failureCode: 'FAIL_PERSON_IN_ENVIRONMENT_PLATE' };
  }
  return { passed: true, failureCode: null };
}

export function generateCharacterIsolateRound(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
  resolvePublicUrl?: (storagePath: string) => string;
}): CharacterVisualCastingState {
  let next = migrateImageReferenceCastingState(migrateReferenceDrivenCastingState(params.state));
  const snapshot = next.truthSnapshots.find((entry) => entry.snapshotId === next.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Active character truth snapshot required');

  let authority = resolveActiveCastingReferenceAuthority(next);
  if (!authority) {
    const fullLook = next.founderReferences.find((entry) => entry.role === 'FULL_LOOK' && entry.decomposition);
    if (!fullLook) throw new Error('Upload and decompose a Full Look reference first');
    next = activateReferenceAuthority(next, fullLook.referenceId);
    authority = resolveActiveCastingReferenceAuthority(next)!;
  }

  const referenceAuthority = resolveCharacterImageReferenceAuthority(next, params.resolvePublicUrl);
  if (!referenceAuthority) throw new Error('Character image reference authority required');

  const capability = evaluateCharacterReferenceGenerationCapability({
    falConfigured: params.falConfigured,
    hasReferenceImage: Boolean(referenceAuthority.resolvedUrl),
  });
  if (textOnlyBlockedForCanonicalCharacter(capability)) {
    throw new Error('TEXT_ONLY provider blocked for canonical character — image reference required');
  }

  const referenceImageUrls = collectReferenceUrlsForGeneration(next, 'CHARACTER_ISOLATE', params.resolvePublicUrl);
  const contract = buildCharacterReferencePromptContract({
    snapshot,
    authority,
    referenceAuthority,
    mode: 'CHARACTER_ISOLATE',
    assetSlot: 'CHARACTER_ISOLATE',
    angleLabel: 'front full body — white studio isolate',
    referenceImageUrls,
  });

  let working = storePromptContractSnapshot(next, contract);
  const rec = recommendReferenceImageCastingProvider(params.falConfigured, referenceImageUrls.length > 0);
  const roundId = randomUUID();
  const candidateId = randomUUID();

  const candidate: CharacterCastingCandidate = {
    candidateId,
    roundId,
    characterTruthSnapshotId: snapshot.snapshotId,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    promptSnapshotId: contract.contractId,
    variationAxis: 'FACE_STRUCTURE',
    assetSlot: 'CHARACTER_ISOLATE',
    generationMode: 'CHARACTER_ISOLATE',
    outputAssetId: null,
    previewUrl: params.dispatchFal ? null : `/api/placeholder/casting/isolate-${roundId.slice(0, 6)}`,
    createdAt: new Date().toISOString(),
    founderJudgment: null,
    deeperJudgment: null,
    strengths: [],
    weaknesses: [],
    castingStatus: 'UNREVIEWED',
    founderNote: 'CHARACTER_ISOLATE',
  };

  const round: CharacterCastingRound = {
    roundId,
    roundNumber: working.rounds.length + 1,
    characterId: snapshot.characterId,
    characterTruthSnapshotId: snapshot.snapshotId,
    candidateIds: [candidateId],
    generationContractId: contract.contractId,
    generationMode: 'CHARACTER_ISOLATE',
    referenceAuthorityId: authority.authorityId,
    assetPackId: null,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    costUsd: params.dispatchFal ? estimateCastingRoundCost(1, params.falConfigured) : 0,
    createdAt: new Date().toISOString(),
    status: params.dispatchFal ? 'GENERATING' : 'REVIEW_READY',
    retainedTraits: ['FACE', 'HAIR', 'WARDROBE', 'PRESENCE'],
    variedTraits: [],
    rejectedTraits: [],
    basedOnPriorTruthSnapshotId: snapshot.snapshotId,
  };

  const isolate: CanonicalCharacterIsolate = {
    isolateId: randomUUID(),
    referenceId: authority.referenceId,
    roundId,
    candidateId,
    sourcePreviewUrl: referenceAuthority.resolvedUrl,
    previewUrl: candidate.previewUrl,
    background: WHITE_STUDIO_BACKGROUND,
    status: params.dispatchFal ? 'GENERATING' : 'REVIEW',
    qaEvaluation: null,
    approvedAt: null,
    createdAt: new Date().toISOString(),
  };

  return syncPipelineState({
    ...working,
    castingAuthorityMode: 'REFERENCE_IMAGE_DRIVEN',
    characterImageReferenceAuthority: referenceAuthority,
    characterIsolate: isolate,
    anchorWorkflowStage: params.dispatchFal ? 'CANONICAL_ANCHOR_GENERATING' : 'CANONICAL_ANCHOR_REVIEW',
    rounds: [...working.rounds, round],
    candidates: [...working.candidates, candidate],
    falImageRequests: working.falImageRequests + (params.dispatchFal ? 1 : 0),
    visualCastingLineage: appendLineage(working.visualCastingLineage, {
      entryId: randomUUID(),
      kind: 'CHARACTER_ISOLATE_GENERATION',
      referenceId: authority.referenceId,
      createdAt: new Date().toISOString(),
      note: 'Image-reference character isolate — white studio background',
    }),
  });
}

export function approveCharacterIsolate(state: CharacterVisualCastingState): CharacterVisualCastingState {
  const next = migrateImageReferenceCastingState(state);
  if (!next.characterIsolate) throw new Error('No character isolate to approve');
  if (next.characterIsolate.status === 'GENERATING') throw new Error('Character isolate still generating');

  const approved: CanonicalCharacterIsolate = {
    ...next.characterIsolate,
    status: 'APPROVED',
    approvedAt: new Date().toISOString(),
  };

  return syncPipelineState({
    ...next,
    characterIsolate: approved,
    anchorWorkflowStage: 'BIBLE_PACK_READY_TO_GENERATE',
    visualCastingLineage: appendLineage(next.visualCastingLineage, {
      entryId: randomUUID(),
      kind: 'CHARACTER_ISOLATE_APPROVAL',
      referenceId: approved.referenceId,
      createdAt: new Date().toISOString(),
      note: 'Founder approved character isolate — turnaround unlocked',
    }),
  });
}

export function generateCharacterTurnaroundRound(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
  slots?: CharacterTurnaroundSlot[];
  resolvePublicUrl?: (storagePath: string) => string;
}): CharacterVisualCastingState {
  const next = migrateImageReferenceCastingState(params.state);
  assertCharacterIsolateApproved(next);

  const snapshot = next.truthSnapshots.find((entry) => entry.snapshotId === next.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Active character truth snapshot required');
  const authority = resolveActiveCastingReferenceAuthority(next);
  if (!authority) throw new Error('Active reference authority required');
  const referenceAuthority = resolveCharacterImageReferenceAuthority(next, params.resolvePublicUrl);
  if (!referenceAuthority) throw new Error('Character image reference authority required');

  const slots = params.slots ?? [...CHARACTER_TURNAROUND_SLOTS];
  const referenceImageUrls = collectReferenceUrlsForGeneration(next, 'CHARACTER_TURNAROUND', params.resolvePublicUrl);
  const rec = recommendReferenceImageCastingProvider(params.falConfigured, referenceImageUrls.length > 0);

  const roundId = randomUUID();
  const candidates: CharacterCastingCandidate[] = [];
  let working = next;

  for (const slot of slots) {
    const contract = buildCharacterReferencePromptContract({
      snapshot,
      authority,
      referenceAuthority,
      mode: 'CHARACTER_TURNAROUND',
      assetSlot: slot,
      angleLabel: turnaroundAngleLabel(slot),
      referenceImageUrls,
      isolatePreviewUrl: next.characterIsolate?.previewUrl,
    });
    working = storePromptContractSnapshot(working, contract);
    const candidateId = randomUUID();
    candidates.push({
      candidateId,
      roundId,
      characterTruthSnapshotId: snapshot.snapshotId,
      provider: rec.provider ?? 'fal',
      model: rec.model ?? 'pending',
      promptSnapshotId: contract.contractId,
      variationAxis: 'FACE_STRUCTURE',
      assetSlot: slot,
      generationMode: 'CHARACTER_TURNAROUND',
      outputAssetId: null,
      previewUrl: params.dispatchFal ? null : `/api/placeholder/casting/turn-${slot.toLowerCase()}`,
      createdAt: new Date().toISOString(),
      founderJudgment: null,
      deeperJudgment: null,
      strengths: [],
      weaknesses: [],
      castingStatus: 'UNREVIEWED',
      founderNote: slot,
    });
  }

  const round: CharacterCastingRound = {
    roundId,
    roundNumber: working.rounds.length + 1,
    characterId: snapshot.characterId,
    characterTruthSnapshotId: snapshot.snapshotId,
    candidateIds: candidates.map((c) => c.candidateId),
    generationContractId: candidates[0]?.promptSnapshotId ?? null,
    generationMode: 'CHARACTER_TURNAROUND',
    referenceAuthorityId: authority.authorityId,
    assetPackId: working.characterBibleAssetPack?.packId ?? null,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    costUsd: params.dispatchFal ? estimateCastingRoundCost(candidates.length, params.falConfigured) : 0,
    createdAt: new Date().toISOString(),
    status: params.dispatchFal ? 'GENERATING' : 'REVIEW_READY',
    retainedTraits: ['FACE', 'HAIR', 'WARDROBE'],
    variedTraits: [],
    rejectedTraits: [],
    basedOnPriorTruthSnapshotId: snapshot.snapshotId,
  };

  const existingPack = next.characterTurnaroundPack;
  const mergedSlotIds = {
    ...(existingPack?.slotCandidateIds ?? {}),
    ...Object.fromEntries(candidates.map((c) => [c.assetSlot as CharacterTurnaroundSlot, c.candidateId])),
  };
  const turnaroundPack: CharacterTurnaroundPack = {
    packId: existingPack?.packId ?? randomUUID(),
    isolateId: next.characterIsolate!.isolateId,
    slotCandidateIds: mergedSlotIds,
    status: params.dispatchFal ? 'GENERATING' : 'REVIEW',
    approvedAt: existingPack?.approvedAt ?? null,
  };

  return syncPipelineState({
    ...working,
    characterTurnaroundPack: turnaroundPack,
    rounds: [...working.rounds, round],
    candidates: [...working.candidates, ...candidates],
    falImageRequests: working.falImageRequests + (params.dispatchFal ? candidates.length : 0),
    visualCastingLineage: appendLineage(working.visualCastingLineage, {
      entryId: randomUUID(),
      kind: 'CHARACTER_TURNAROUND_GENERATION',
      referenceId: authority.referenceId,
      createdAt: new Date().toISOString(),
      note: `Turnaround pack ${slots.length} angles — image-reference driven`,
    }),
  });
}

export function regenerateCharacterTurnaroundSlot(params: {
  state: CharacterVisualCastingState;
  slot: CharacterTurnaroundSlot;
  falConfigured: boolean;
  dispatchFal?: boolean;
  resolvePublicUrl?: (storagePath: string) => string;
}): CharacterVisualCastingState {
  const next = migrateImageReferenceCastingState(params.state);
  assertCharacterIsolateApproved(next);
  const filteredCandidates = next.candidates.filter(
    (c) => !(c.generationMode === 'CHARACTER_TURNAROUND' && c.assetSlot === params.slot),
  );
  return generateCharacterTurnaroundRound({
    state: { ...next, candidates: filteredCandidates },
    falConfigured: params.falConfigured,
    dispatchFal: params.dispatchFal,
    slots: [params.slot],
    resolvePublicUrl: params.resolvePublicUrl,
  });
}

export function generateWardrobeDocumentationRound(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
  resolvePublicUrl?: (storagePath: string) => string;
}): CharacterVisualCastingState {
  const next = migrateImageReferenceCastingState(params.state);
  assertCharacterIsolateApproved(next);

  const snapshot = next.truthSnapshots.find((entry) => entry.snapshotId === next.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Active character truth snapshot required');
  const authority = resolveActiveCastingReferenceAuthority(next);
  if (!authority) throw new Error('Active reference authority required');
  const referenceAuthority = resolveCharacterImageReferenceAuthority(next, params.resolvePublicUrl);
  if (!referenceAuthority) throw new Error('Character image reference authority required');

  const slots = [...CHARACTER_WARDROBE_DOC_SLOTS];
  const referenceImageUrls = collectReferenceUrlsForGeneration(next, 'WARDROBE_DOCUMENTATION', params.resolvePublicUrl);
  const rec = recommendReferenceImageCastingProvider(params.falConfigured, referenceImageUrls.length > 0);
  const roundId = randomUUID();
  const candidates: CharacterCastingCandidate[] = [];
  let working = next;

  for (const slot of slots) {
    const contract = buildCharacterReferencePromptContract({
      snapshot,
      authority,
      referenceAuthority,
      mode: 'WARDROBE_DOCUMENTATION',
      assetSlot: slot,
      angleLabel: slot.replace(/_/g, ' ').toLowerCase(),
      referenceImageUrls,
      isolatePreviewUrl: next.characterIsolate?.previewUrl,
    });
    working = storePromptContractSnapshot(working, contract);
    const candidateId = randomUUID();
    candidates.push({
      candidateId,
      roundId,
      characterTruthSnapshotId: snapshot.snapshotId,
      provider: rec.provider ?? 'fal',
      model: rec.model ?? 'pending',
      promptSnapshotId: contract.contractId,
      variationAxis: 'FACE_STRUCTURE',
      assetSlot: slot,
      generationMode: 'WARDROBE_DOCUMENTATION',
      outputAssetId: null,
      previewUrl: params.dispatchFal ? null : `/api/placeholder/casting/wardrobe-${slot.toLowerCase()}`,
      createdAt: new Date().toISOString(),
      founderJudgment: null,
      deeperJudgment: null,
      strengths: [],
      weaknesses: [],
      castingStatus: 'UNREVIEWED',
      founderNote: slot,
    });
  }

  return syncPipelineState({
    ...working,
    rounds: [
      ...working.rounds,
      {
        roundId,
        roundNumber: working.rounds.length + 1,
        characterId: snapshot.characterId,
        characterTruthSnapshotId: snapshot.snapshotId,
        candidateIds: candidates.map((c) => c.candidateId),
        generationContractId: candidates[0]?.promptSnapshotId ?? null,
        generationMode: 'WARDROBE_DOCUMENTATION',
        referenceAuthorityId: authority.authorityId,
        assetPackId: null,
        provider: rec.provider ?? 'fal',
        model: rec.model ?? 'pending',
        costUsd: params.dispatchFal ? estimateCastingRoundCost(candidates.length, params.falConfigured) : 0,
        createdAt: new Date().toISOString(),
        status: params.dispatchFal ? 'GENERATING' : 'REVIEW_READY',
        retainedTraits: ['WARDROBE'],
        variedTraits: [],
        rejectedTraits: [],
        basedOnPriorTruthSnapshotId: snapshot.snapshotId,
      },
    ],
    candidates: [...working.candidates, ...candidates],
    falImageRequests: working.falImageRequests + (params.dispatchFal ? candidates.length : 0),
  });
}

export function generateEnvironmentPlateRound(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
  modes?: EnvironmentPlateMode[];
  resolvePublicUrl?: (storagePath: string) => string;
}): CharacterVisualCastingState {
  const next = migrateImageReferenceCastingState(params.state);
  const envRef = next.founderReferences.find((r) => r.role === 'ENVIRONMENT_SUPPORT' || r.role === 'FULL_LOOK');
  if (!envRef) throw new Error('Environment or Full Look reference required for environment plate');

  const snapshot = next.truthSnapshots.find((entry) => entry.snapshotId === next.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Active character truth snapshot required');

  const modes = params.modes ?? [...ENVIRONMENT_PLATE_MODES];
  const referenceImageUrls = envRef.previewUrl ? [envRef.previewUrl] : [];
  const rec = recommendReferenceImageCastingProvider(params.falConfigured, referenceImageUrls.length > 0);
  const roundId = randomUUID();
  const candidates: CharacterCastingCandidate[] = [];
  let working = next;

  const pseudoAuthority: ActiveCastingReferenceAuthority = {
    authorityId: randomUUID(),
    referenceId: envRef.referenceId,
    role: envRef.role,
    previewUrl: envRef.previewUrl,
    storagePath: envRef.storagePath,
    decompositionId: envRef.decomposition?.decompositionId ?? randomUUID(),
    activatedAt: new Date().toISOString(),
    authorityRank: 1,
  };

  const refAuthority: CharacterImageReferenceAuthority = {
    assetId: envRef.referenceId,
    storagePath: envRef.storagePath,
    resolvedUrl: envRef.previewUrl,
    sourceType: 'ENVIRONMENT_REFERENCE',
    founderApproved: true,
    identityAuthority: false,
    wardrobeAuthority: false,
    createdAt: envRef.uploadedAt,
  };

  for (const mode of modes) {
    const contract = buildCharacterReferencePromptContract({
      snapshot,
      authority: pseudoAuthority,
      referenceAuthority: refAuthority,
      mode: 'ENVIRONMENT_PLATE',
      assetSlot: mode,
      angleLabel: mode.replace(/_/g, ' ').toLowerCase(),
      referenceImageUrls,
    });
    working = storePromptContractSnapshot(working, contract);
    const candidateId = randomUUID();
    candidates.push({
      candidateId,
      roundId,
      characterTruthSnapshotId: snapshot.snapshotId,
      provider: rec.provider ?? 'fal',
      model: rec.model ?? 'pending',
      promptSnapshotId: contract.contractId,
      variationAxis: 'FACE_STRUCTURE',
      assetSlot: mode,
      generationMode: 'ENVIRONMENT_PLATE',
      outputAssetId: null,
      previewUrl: params.dispatchFal ? null : `/api/placeholder/casting/env-${mode.toLowerCase()}`,
      createdAt: new Date().toISOString(),
      founderJudgment: null,
      deeperJudgment: null,
      strengths: [],
      weaknesses: [],
      castingStatus: 'UNREVIEWED',
      founderNote: mode,
    });
  }

  const plate: CanonicalEnvironmentPlate = {
    plateId: randomUUID(),
    referenceId: envRef.referenceId,
    roundId,
    candidateIds: candidates.map((c) => c.candidateId),
    sourcePreviewUrl: envRef.previewUrl,
    previewUrls: candidates.map((c) => c.previewUrl).filter(Boolean) as string[],
    status: params.dispatchFal ? 'GENERATING' : 'REVIEW',
    characterFree: true,
    approvedAt: null,
    createdAt: new Date().toISOString(),
  };

  return syncPipelineState({
    ...working,
    environmentPlate: plate,
    rounds: [
      ...working.rounds,
      {
        roundId,
        roundNumber: working.rounds.length + 1,
        characterId: snapshot.characterId,
        characterTruthSnapshotId: snapshot.snapshotId,
        candidateIds: candidates.map((c) => c.candidateId),
        generationContractId: candidates[0]?.promptSnapshotId ?? null,
        generationMode: 'ENVIRONMENT_PLATE',
        referenceAuthorityId: pseudoAuthority.authorityId,
        assetPackId: null,
        provider: rec.provider ?? 'fal',
        model: rec.model ?? 'pending',
        costUsd: params.dispatchFal ? estimateCastingRoundCost(candidates.length, params.falConfigured) : 0,
        createdAt: new Date().toISOString(),
        status: params.dispatchFal ? 'GENERATING' : 'REVIEW_READY',
        retainedTraits: [],
        variedTraits: [],
        rejectedTraits: [],
        basedOnPriorTruthSnapshotId: snapshot.snapshotId,
      },
    ],
    candidates: [...working.candidates, ...candidates],
    falImageRequests: working.falImageRequests + (params.dispatchFal ? candidates.length : 0),
  });
}

export function resolveReferenceImageUrlsFromContract(
  state: CharacterVisualCastingState,
  contract: CharacterCastingPromptContract,
  resolvePublicUrl?: (storagePath: string) => string,
): string[] {
  if (contract.referenceImageUrls?.length) return contract.referenceImageUrls;
  return collectReferenceUrlsForGeneration(state, contract.generationMode ?? 'CHARACTER_TURNAROUND', resolvePublicUrl);
}

export function legacyTextCastingPromptRetired(state: CharacterVisualCastingState): boolean {
  return state.castingAuthorityMode === 'REFERENCE_IMAGE_DRIVEN';
}

export function wardrobeExplorationSeparateFromDocumentation(): true {
  return true;
}

export function syncCanonicalAnchorFromCharacterIsolate(state: CharacterVisualCastingState): CharacterVisualCastingState {
  const isolate = state.characterIsolate;
  if (!isolate) return state;
  const authoritySnapshot = state.visualAuthoritySnapshot;
  const anchorRecord = {
    anchorId: isolate.isolateId,
    referenceId: isolate.referenceId,
    authoritySnapshotId: authoritySnapshot?.snapshotId ?? randomUUID(),
    roundId: isolate.roundId,
    candidateId: isolate.candidateId,
    sourcePreviewUrl: isolate.sourcePreviewUrl,
    previewUrl: isolate.previewUrl,
    status: isolate.status,
    qaEvaluation: isolate.qaEvaluation,
    approvedAt: isolate.approvedAt,
    supersededByAnchorId: state.canonicalAnchor?.anchorId ?? null,
    createdAt: isolate.createdAt,
  };
  return syncPipelineState({
    ...state,
    canonicalAnchor: anchorRecord,
  });
}
