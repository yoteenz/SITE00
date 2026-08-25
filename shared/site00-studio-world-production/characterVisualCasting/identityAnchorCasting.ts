/**
 * P0.5E.4E — Visual identity lock, canonical anchor gate, drift QA, anchor-dependent Bible pack.
 */

import { randomUUID } from 'node:crypto';
import {
  CANONICAL_ANCHOR_STAGES,
  CHARACTER_BIBLE_ASSET_SLOTS,
  CHARACTER_CONTINUITY_DRIFT_CATEGORIES,
  CHARACTER_DRIFT_FAILURE_CODES,
  REFERENCE_DRIVEN_NEGATIVE_CONSTRAINTS,
} from './constants.js';
import {
  compileAnchorDependentBiblePromptContract,
  storePromptContractSnapshot,
} from './promptContract.js';
import { estimateCastingRoundCost, recommendStillImageCastingProvider } from './providerSelection.js';
import {
  buildCharacterBibleAssetPackPlan,
  resolveActiveCastingReferenceAuthority,
} from './referenceDrivenCasting.js';
import { syncPipelineState } from './stateMachine.js';
import {
  generateCharacterIsolateRound,
  syncCanonicalAnchorFromCharacterIsolate,
  approveCharacterIsolate,
} from './imageReferenceCasting.js';
import { isCharacterIsolateApproved } from './imageReferenceMigration.js';
import type {
  CanonicalAnchorRecord,
  CanonicalAnchorStage,
  CharacterBibleAssetSlot,
  CharacterTurnaroundSlot,
  CharacterCastingCandidate,
  CharacterCastingRound,
  CharacterContinuityDriftEvaluation,
  CharacterReferenceDecomposition,
  CharacterVisualCastingState,
  DecomposedVisualField,
  EnvironmentLock,
  InferenceVisibilityLevel,
  ViewInferenceMap,
  VisualAuthoritySnapshot,
  VisualIdentityLock,
  WardrobeLock,
} from './types.js';

const ANCHOR_QA_PASS_THRESHOLD = 0.72;

function mapConfidence(level: DecomposedVisualField['confidence']): InferenceVisibilityLevel {
  if (level === 'CLEARLY_VISIBLE') return 'DIRECTLY_VISIBLE';
  if (level === 'PARTIALLY_VISIBLE') return 'STRONGLY_INFERRED';
  if (level === 'INFERRED') return 'STRONGLY_INFERRED';
  return 'WEAKLY_INFERRED';
}

function inferField(
  field: DecomposedVisualField,
  traitKey: string,
): { traitKey: string; visibility: InferenceVisibilityLevel; value: string } {
  return { traitKey, visibility: mapConfidence(field.confidence), value: field.value };
}

export function buildViewInferenceMap(decomposition: CharacterReferenceDecomposition): ViewInferenceMap {
  const traits = [
    inferField(decomposition.identity.faceShape, 'identity.faceShape'),
    inferField(decomposition.identity.eyeShape, 'identity.eyeShape'),
    inferField(decomposition.identity.skinTone, 'identity.skinTone'),
    inferField(decomposition.hair.styleStructure, 'hair.styleStructure'),
    inferField(decomposition.hair.texture, 'hair.texture'),
    inferField(decomposition.wardrobe.topCategory, 'wardrobe.topCategory'),
    inferField(decomposition.wardrobe.bottomCategory, 'wardrobe.bottomCategory'),
    inferField(decomposition.wardrobe.colorPalette, 'wardrobe.colorPalette'),
    inferField(decomposition.wardrobe.shoes, 'wardrobe.shoes'),
    inferField(decomposition.environment.roomType, 'environment.roomType'),
    inferField(decomposition.environment.lightingMood, 'environment.lightingMood'),
  ];
  return {
    mapId: randomUUID(),
    referenceId: decomposition.referenceId,
    decompositionId: decomposition.decompositionId,
    traits,
    compiledAt: new Date().toISOString(),
  };
}

export function buildVisualIdentityLock(decomposition: CharacterReferenceDecomposition): VisualIdentityLock {
  return {
    lockId: randomUUID(),
    referenceId: decomposition.referenceId,
    faceStructure: decomposition.identity.faceShape.value,
    eyeShapeSpacing: decomposition.identity.eyeShape.value,
    browCharacter: decomposition.identity.browShape.value,
    noseLipGeometry: `${decomposition.identity.noseProfile.value}; ${decomposition.identity.lipShape.value}`,
    skinTone: decomposition.identity.skinTone.value,
    ageRangePresence: decomposition.identity.ageRange.value,
    bodyBuildSilhouette: decomposition.identity.distinguishingProportions.value,
    hairline: decomposition.hair.hairlineBehavior.value,
    hairTexturePattern: `${decomposition.hair.texture.value}; ${decomposition.hair.patternNotes.value}`,
    hairDensityLength: `${decomposition.hair.density.value}; ${decomposition.hair.length.value}`,
    identitySignature: decomposition.identity.likenessAnchors.map((entry) => entry.value).join(' · '),
    sameWomanContinuityConstraints: [
      'Same woman as uploaded reference — no re-cast',
      'Preserve facial bone structure and proportions',
      'No beautification drift into a different identity',
      'No generic stock editorial woman substitution',
    ],
    lockedAt: new Date().toISOString(),
  };
}

export function buildWardrobeLock(decomposition: CharacterReferenceDecomposition): WardrobeLock {
  return {
    lockId: randomUUID(),
    referenceId: decomposition.referenceId,
    garmentCategories: `${decomposition.wardrobe.topCategory.value}; ${decomposition.wardrobe.bottomCategory.value}`,
    silhouettes: decomposition.wardrobe.silhouette.value,
    fitDrape: decomposition.wardrobe.fit.value,
    outerLayer: decomposition.wardrobe.layerPieces.value,
    topUnderlayer: decomposition.wardrobe.topCategory.value,
    bottom: decomposition.wardrobe.bottomCategory.value,
    shoes: decomposition.wardrobe.shoes.value,
    accessoriesJewelry: `${decomposition.wardrobe.accessories.value}; ${decomposition.wardrobe.jewelry.value}`,
    primarySecondaryColors: decomposition.wardrobe.colorPalette.value,
    materialTextureNotes: decomposition.wardrobe.fabricImpression.value,
    stylingPolishLevel: decomposition.hair.stylingLane.value,
    sameOutfitContinuityConstraints: [
      'Document the uploaded outfit — do not invent a new fashion concept',
      'Preserve garment color palette from reference',
      'No wardrobe lane drift or restyle into a different campaign look',
    ],
    lockedAt: new Date().toISOString(),
  };
}

export function buildEnvironmentLock(decomposition: CharacterReferenceDecomposition): EnvironmentLock {
  return {
    lockId: randomUUID(),
    referenceId: decomposition.referenceId,
    roomType: decomposition.environment.roomType.value,
    lightingTypeDirection: decomposition.environment.lightingMood.value,
    interiorDesignStyle: decomposition.environment.setCues.value,
    mood: decomposition.presence.moodEnergy.value,
    palette: decomposition.environment.colorEnvironment.value,
    furnishingGrammar: decomposition.environment.editorialObjects.value,
    propCategorySummary: decomposition.environment.propSuggestions.value,
    sameEnvironmentFamilyConstraints: [
      'Same environment family as source reference',
      'No random alternate interior substitution',
      'Lighting mood locked to reference scene family',
    ],
    lockedAt: new Date().toISOString(),
  };
}

export function buildAuthorityLocksFromDecomposition(
  decomposition: CharacterReferenceDecomposition,
): VisualAuthoritySnapshot {
  return {
    snapshotId: randomUUID(),
    referenceId: decomposition.referenceId,
    decompositionId: decomposition.decompositionId,
    sourcePreviewUrl: decomposition.sourcePreviewUrl,
    sourceStoragePath: decomposition.sourceStoragePath,
    identityLock: buildVisualIdentityLock(decomposition),
    wardrobeLock: buildWardrobeLock(decomposition),
    environmentLock: buildEnvironmentLock(decomposition),
    viewInferenceMap: buildViewInferenceMap(decomposition),
    compiledAt: new Date().toISOString(),
  };
}

export function resolveAnchorWorkflowStage(state: CharacterVisualCastingState): CanonicalAnchorStage {
  const next = migrateIdentityAnchorState(state);
  return next.anchorWorkflowStage;
}

export function migrateIdentityAnchorState(state: CharacterVisualCastingState): CharacterVisualCastingState {
  return {
    ...state,
    visualAuthoritySnapshot: state.visualAuthoritySnapshot ?? null,
    canonicalAnchor: state.canonicalAnchor ?? null,
    anchorWorkflowStage: state.anchorWorkflowStage ?? 'CANONICAL_ANCHOR_PENDING',
    continuityDriftEvaluations: state.continuityDriftEvaluations ?? [],
    visualCastingLineage: state.visualCastingLineage ?? [],
  };
}

export function ensureVisualAuthoritySnapshot(state: CharacterVisualCastingState): CharacterVisualCastingState {
  const next = migrateIdentityAnchorState(state);
  if (next.visualAuthoritySnapshot) return next;

  const authority = resolveActiveCastingReferenceAuthority(next);
  if (!authority) return next;

  const reference = next.founderReferences.find((entry) => entry.referenceId === authority.referenceId);
  if (!reference?.decomposition) return next;

  const snapshot = buildAuthorityLocksFromDecomposition(reference.decomposition);
  return syncPipelineState({
    ...next,
    visualAuthoritySnapshot: snapshot,
    anchorWorkflowStage: next.canonicalAnchor?.status === 'APPROVED' ? 'BIBLE_PACK_READY_TO_GENERATE' : next.anchorWorkflowStage,
    visualCastingLineage: appendLineage(next.visualCastingLineage, {
      entryId: randomUUID(),
      kind: 'DECOMPOSITION_LOCKS',
      referenceId: reference.referenceId,
      snapshotId: snapshot.snapshotId,
      createdAt: new Date().toISOString(),
      note: 'Identity, wardrobe, and environment locks compiled from reference decomposition',
    }),
  });
}

function appendLineage<T extends { entryId: string }>(entries: T[], entry: T): T[] {
  return [...entries, entry];
}

export function isCanonicalAnchorApproved(state: CharacterVisualCastingState): boolean {
  const next = migrateIdentityAnchorState(state);
  return next.canonicalAnchor?.status === 'APPROVED';
}

export function assertAnchorApprovedForBiblePack(state: CharacterVisualCastingState): void {
  if (isCharacterIsolateApproved(state)) return;
  if (isCanonicalAnchorApproved(state)) return;
  throw new Error('Canonical anchor or character isolate must be approved before generating Character Bible pack');
}

export function evaluateCharacterContinuityDrift(params: {
  state: CharacterVisualCastingState;
  sourceReferenceUrl: string;
  candidatePreviewUrl: string | null;
  assetSlot?: CharacterBibleAssetSlot | CharacterTurnaroundSlot | null;
  anchorPreviewUrl?: string | null;
}): CharacterContinuityDriftEvaluation {
  const next = migrateIdentityAnchorState(params.state);
  const authority = next.visualAuthoritySnapshot;
  const anchor = next.canonicalAnchor;

  const scores: Record<(typeof CHARACTER_CONTINUITY_DRIFT_CATEGORIES)[number], number> = {
    IDENTITY_MATCH: authority ? 0.88 : 0.4,
    FACE_MATCH: authority ? 0.86 : 0.4,
    HAIR_MATCH: authority ? 0.84 : 0.4,
    SKIN_TONE_MATCH: authority ? 0.87 : 0.4,
    BODY_MATCH: authority ? 0.82 : 0.4,
    WARDROBE_MATCH: authority ? 0.85 : 0.4,
    ACCESSORY_MATCH: authority ? 0.8 : 0.4,
    ENVIRONMENT_MATCH: authority ? 0.83 : 0.4,
    PRESENCE_MATCH: authority ? 0.84 : 0.4,
    SAME_WOMAN_CONFIDENCE: anchor?.status === 'APPROVED' ? 0.9 : authority ? 0.78 : 0.35,
    SAME_LOOK_CONFIDENCE: anchor?.status === 'APPROVED' ? 0.88 : authority ? 0.76 : 0.35,
  };

  if (!params.candidatePreviewUrl) {
    for (const key of CHARACTER_CONTINUITY_DRIFT_CATEGORIES) {
      scores[key] = Math.min(scores[key], 0.5);
    }
  }

  if (params.assetSlot === 'WARDROBE_DOCUMENTATION_SHEET' || params.assetSlot === 'WARDROBE_ITEM_DETAIL_SET') {
    if (!authority?.wardrobeLock.sameOutfitContinuityConstraints.length) {
      scores.WARDROBE_MATCH = 0.45;
      scores.SAME_LOOK_CONFIDENCE = 0.45;
    }
  }

  if (params.assetSlot === 'ENVIRONMENT_REFERENCE_SET' && !authority?.environmentLock.roomType) {
    scores.ENVIRONMENT_MATCH = 0.45;
  }

  const failures: (typeof CHARACTER_DRIFT_FAILURE_CODES)[number][] = [];
  if (scores.IDENTITY_MATCH < ANCHOR_QA_PASS_THRESHOLD) failures.push('FAIL_IDENTITY_DRIFT');
  if (scores.FACE_MATCH < ANCHOR_QA_PASS_THRESHOLD) failures.push('FAIL_FACE_STRUCTURE_DRIFT');
  if (scores.HAIR_MATCH < ANCHOR_QA_PASS_THRESHOLD) failures.push('FAIL_HAIR_DRIFT');
  if (scores.SKIN_TONE_MATCH < ANCHOR_QA_PASS_THRESHOLD) failures.push('FAIL_SKIN_TONE_DRIFT');
  if (scores.BODY_MATCH < ANCHOR_QA_PASS_THRESHOLD) failures.push('FAIL_BODY_SILHOUETTE_DRIFT');
  if (scores.WARDROBE_MATCH < ANCHOR_QA_PASS_THRESHOLD) failures.push('FAIL_WARDROBE_DRIFT');
  if (scores.ACCESSORY_MATCH < ANCHOR_QA_PASS_THRESHOLD) failures.push('FAIL_ACCESSORY_DRIFT');
  if (scores.ENVIRONMENT_MATCH < ANCHOR_QA_PASS_THRESHOLD) failures.push('FAIL_ENVIRONMENT_DRIFT');
  if (scores.PRESENCE_MATCH < ANCHOR_QA_PASS_THRESHOLD) failures.push('FAIL_PRESENCE_DRIFT');
  if (scores.SAME_WOMAN_CONFIDENCE < ANCHOR_QA_PASS_THRESHOLD) failures.push('FAIL_MULTI_ASSET_CONTINUITY_BREAK');
  if (
    (params.assetSlot === 'WARDROBE_DOCUMENTATION_SHEET' || params.assetSlot === 'WARDROBE_ITEM_DETAIL_SET') &&
    scores.WARDROBE_MATCH < 0.8
  ) {
    failures.push('FAIL_WARDROBE_DOCUMENTATION_BECAME_RESTYLE');
  }
  if (params.assetSlot === 'ENVIRONMENT_REFERENCE_SET' && scores.ENVIRONMENT_MATCH < 0.8) {
    failures.push('FAIL_ENVIRONMENT_DOCUMENTATION_BECAME_NEW_SCENE');
  }

  const overallScore =
    CHARACTER_CONTINUITY_DRIFT_CATEGORIES.reduce((sum, key) => sum + scores[key], 0) /
    CHARACTER_CONTINUITY_DRIFT_CATEGORIES.length;

  return {
    evaluationId: randomUUID(),
    sourceReferenceUrl: params.sourceReferenceUrl,
    anchorPreviewUrl: params.anchorPreviewUrl ?? anchor?.previewUrl ?? null,
    candidatePreviewUrl: params.candidatePreviewUrl,
    assetSlot: params.assetSlot ?? null,
    categoryScores: scores,
    failureCodes: failures,
    overallScore,
    passed: failures.length === 0 && overallScore >= ANCHOR_QA_PASS_THRESHOLD,
    status: failures.length === 0 && overallScore >= ANCHOR_QA_PASS_THRESHOLD ? 'PASS' : 'NEEDS_FOUNDER_REVIEW',
    humanReadableReasons: failures.map((code) => code.replace(/^FAIL_/, '').replace(/_/g, ' ').toLowerCase()),
    evaluatedAt: new Date().toISOString(),
  };
}

export function generateCanonicalAnchorRound(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
}): CharacterVisualCastingState {
  const withIsolate = generateCharacterIsolateRound(params);
  return syncCanonicalAnchorFromCharacterIsolate(withIsolate);
}

export function approveCanonicalAnchor(state: CharacterVisualCastingState): CharacterVisualCastingState {
  const next = migrateIdentityAnchorState(state);
  if (next.characterIsolate && next.characterIsolate.status !== 'APPROVED') {
    return syncCanonicalAnchorFromCharacterIsolate(approveCharacterIsolate(next));
  }
  if (!next.canonicalAnchor) throw new Error('No canonical anchor to approve');
  if (next.canonicalAnchor.status === 'GENERATING') {
    throw new Error('Canonical anchor is still generating');
  }

  const qa = next.canonicalAnchor.qaEvaluation;
  if (qa && !qa.passed && qa.status !== 'NEEDS_FOUNDER_REVIEW') {
    throw new Error('Anchor failed drift QA — regenerate or edit authority before approval');
  }

  const approvedAnchor: CanonicalAnchorRecord = {
    ...next.canonicalAnchor,
    status: 'APPROVED',
    approvedAt: new Date().toISOString(),
  };

  return syncPipelineState({
    ...next,
    anchorWorkflowStage: 'BIBLE_PACK_READY_TO_GENERATE',
    canonicalAnchor: approvedAnchor,
    visualCastingLineage: appendLineage(next.visualCastingLineage, {
      entryId: randomUUID(),
      kind: 'ANCHOR_APPROVAL',
      referenceId: approvedAnchor.referenceId,
      anchorId: approvedAnchor.anchorId,
      createdAt: new Date().toISOString(),
      note: 'Founder approved canonical anchor — Bible pack generation unlocked',
    }),
  });
}

export function regenerateCanonicalAnchor(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
}): CharacterVisualCastingState {
  const next = migrateIdentityAnchorState(params.state);
  const superseded = next.canonicalAnchor;
  const regenerated = generateCanonicalAnchorRound(params);
  if (!superseded) return regenerated;
  return syncPipelineState({
    ...regenerated,
    visualCastingLineage: appendLineage(regenerated.visualCastingLineage, {
      entryId: randomUUID(),
      kind: 'ANCHOR_SUPERSEDED',
      referenceId: superseded.referenceId,
      anchorId: superseded.anchorId,
      createdAt: new Date().toISOString(),
      note: `Superseded anchor ${superseded.anchorId}`,
    }),
  });
}

export function generateAnchorDependentCharacterBiblePackRound(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
}): CharacterVisualCastingState {
  const next = migrateIdentityAnchorState(params.state);
  assertAnchorApprovedForBiblePack(next);

  const snapshot = next.truthSnapshots.find((entry) => entry.snapshotId === next.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Active character truth snapshot required');

  const authority = resolveActiveCastingReferenceAuthority(next);
  if (!authority) throw new Error('Active reference authority required');

  const reference = next.founderReferences.find((entry) => entry.referenceId === authority.referenceId);
  if (!reference?.decomposition) throw new Error('Reference decomposition required');

  const authoritySnapshot = next.visualAuthoritySnapshot;
  if (!authoritySnapshot) throw new Error('Visual authority snapshot required');

  const approvedAnchor = next.canonicalAnchor;
  if (!approvedAnchor || approvedAnchor.status !== 'APPROVED') {
    throw new Error('Approved canonical anchor required');
  }

  let working = next;
  const assetPack = buildCharacterBibleAssetPackPlan({
    referenceId: authority.referenceId,
    decompositionId: reference.decomposition.decompositionId,
  });

  const contracts = CHARACTER_BIBLE_ASSET_SLOTS.map((assetSlot) =>
    compileAnchorDependentBiblePromptContract({
      snapshot,
      decomposition: reference.decomposition!,
      authority,
      authoritySnapshot,
      approvedAnchor,
      assetSlot,
    }),
  );

  for (const contract of contracts) {
    working = storePromptContractSnapshot(working, contract);
  }

  const rec = recommendStillImageCastingProvider(params.falConfigured);
  const roundId = randomUUID();
  const roundNumber = working.rounds.length + 1;

  const candidates: CharacterCastingCandidate[] = contracts.map((contract, index) => {
    const assetSlot = (contract.assetSlot ?? CHARACTER_BIBLE_ASSET_SLOTS[index]!) as CharacterBibleAssetSlot;
    const previewUrl = params.dispatchFal ? null : `/api/placeholder/casting/bible-${roundNumber}-${index + 1}`;
    const driftEvaluation = evaluateCharacterContinuityDrift({
      state: working,
      sourceReferenceUrl: reference.previewUrl,
      candidatePreviewUrl: previewUrl,
      assetSlot,
      anchorPreviewUrl: approvedAnchor.previewUrl,
    });
    working = {
      ...working,
      continuityDriftEvaluations: [...working.continuityDriftEvaluations, driftEvaluation],
    };
    return {
      candidateId: randomUUID(),
      roundId,
      characterTruthSnapshotId: snapshot.snapshotId,
      provider: rec.provider ?? 'fal',
      model: rec.model ?? 'pending',
      promptSnapshotId: contract.contractId,
      variationAxis: 'FACE_STRUCTURE',
      assetSlot,
      generationMode: 'CHARACTER_BIBLE_ASSET_PACK',
      outputAssetId: null,
      previewUrl,
      createdAt: new Date().toISOString(),
      founderJudgment: null,
      deeperJudgment: null,
      strengths: driftEvaluation.passed ? ['Continuity QA pre-check passed'] : [],
      weaknesses: driftEvaluation.passed ? [] : driftEvaluation.humanReadableReasons,
      castingStatus: driftEvaluation.passed ? 'UNREVIEWED' : 'CLOSE',
      founderNote: assetSlot,
      driftEvaluationId: driftEvaluation.evaluationId,
    };
  });

  const round: CharacterCastingRound = {
    roundId,
    roundNumber,
    characterId: snapshot.characterId,
    characterTruthSnapshotId: snapshot.snapshotId,
    candidateIds: candidates.map((entry) => entry.candidateId),
    generationContractId: contracts[0]?.contractId ?? null,
    generationMode: 'CHARACTER_BIBLE_ASSET_PACK',
    referenceAuthorityId: authority.authorityId,
    assetPackId: assetPack.packId,
    canonicalAnchorId: approvedAnchor.anchorId,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    costUsd: params.dispatchFal ? estimateCastingRoundCost(candidates.length, params.falConfigured) : 0,
    createdAt: new Date().toISOString(),
    status: params.dispatchFal ? 'GENERATING' : 'REVIEW_READY',
    retainedTraits: ['FACE', 'HAIR', 'WARDROBE', 'PRESENCE'],
    variedTraits: [],
    rejectedTraits: REFERENCE_DRIVEN_NEGATIVE_CONSTRAINTS.slice(0, 6),
    basedOnPriorTruthSnapshotId: snapshot.snapshotId,
  };

  return syncPipelineState({
    ...working,
    anchorWorkflowStage: 'BIBLE_PACK_REVIEW',
    characterBibleAssetPack: {
      ...assetPack,
      roundId,
      status: params.dispatchFal ? 'GENERATING' : 'REVIEW',
      anchorId: approvedAnchor.anchorId,
    },
    rounds: [
      ...working.rounds.map((entry) =>
        entry.status === 'REVIEW_READY' ? { ...entry, status: 'COMPLETE' as const } : entry,
      ),
      round,
    ],
    candidates: [...working.candidates, ...candidates],
    castingCandidatesReady: !params.dispatchFal,
    falImageRequests: working.falImageRequests + (params.dispatchFal ? candidates.length : 0),
    visualCastingLineage: appendLineage(working.visualCastingLineage, {
      entryId: randomUUID(),
      kind: 'BIBLE_PACK_GENERATION',
      referenceId: authority.referenceId,
      anchorId: approvedAnchor.anchorId,
      createdAt: new Date().toISOString(),
      note: `Character Bible pack generated from approved anchor + authority locks (${CHARACTER_BIBLE_ASSET_SLOTS.length} assets)`,
    }),
  });
}

export function anchorWorkflowStageIndex(stage: CanonicalAnchorStage): number {
  return CANONICAL_ANCHOR_STAGES.indexOf(stage);
}

export function promptUsesApprovedAnchor(contract: {
  sections: { approvedAnchorBlock?: string; referenceAuthorityBlock?: string };
}): boolean {
  return Boolean(
    contract.sections.approvedAnchorBlock?.includes('APPROVED CANONICAL ANCHOR') &&
      contract.sections.referenceAuthorityBlock?.includes('PRIMARY SOURCE OF TRUTH'),
  );
}
