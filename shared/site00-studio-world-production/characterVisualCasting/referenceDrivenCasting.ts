/**
 * P0.5E.4D — Reference-first casting regeneration + Character Bible asset pack.
 */

import { randomUUID } from 'node:crypto';
import {
  CASTING_PROMPT_AUTHORITY_LAYERS,
  CHARACTER_BIBLE_ASSET_SLOTS,
  CHARACTER_BIBLE_REVIEW_TABS,
  REFERENCE_CONTROLLED_VARIATION_SLOTS,
  REFERENCE_DRIVEN_NEGATIVE_CONSTRAINTS,
} from './constants.js';
import { compileReferenceDrivenCastingPromptContract, storePromptContractSnapshot } from './promptContract.js';
import { estimateCastingRoundCost, recommendStillImageCastingProvider } from './providerSelection.js';
import { syncPipelineState } from './stateMachine.js';
import type {
  ActiveCastingReferenceAuthority,
  CharacterBibleAssetPack,
  CharacterBibleAssetSlot,
  CharacterBibleReviewTab,
  CharacterCastingCandidate,
  CharacterCastingRound,
  CharacterReferenceDecomposition,
  CharacterTruthSnapshot,
  CharacterVisualCastingState,
  DecomposedVisualField,
  FounderCastingReference,
  FounderCastingReferenceRole,
  ReferenceDerivedCharacterSummary,
  ReferenceDrivenCastingBundle,
  VisibilityConfidence,
} from './types.js';

const ROLE_AUTHORITY_RANK: Record<FounderCastingReferenceRole, number> = {
  FULL_LOOK: 1,
  FACE: 2,
  HAIR: 3,
  WARDROBE: 4,
  PRESENCE: 5,
  MOOD: 6,
};

function field(value: string, confidence: VisibilityConfidence): DecomposedVisualField {
  return { value, confidence };
}

function inferred(value: string): DecomposedVisualField {
  return field(value, 'INFERRED');
}

function visible(value: string): DecomposedVisualField {
  return field(value, 'CLEARLY_VISIBLE');
}

function partial(value: string): DecomposedVisualField {
  return field(value, 'PARTIALLY_VISIBLE');
}

function ensureFounderReferences(state: CharacterVisualCastingState): CharacterVisualCastingState {
  if (Array.isArray(state.founderReferences)) return state;
  return { ...state, founderReferences: [] };
}

export function migrateReferenceDrivenCastingState(
  state: CharacterVisualCastingState,
): CharacterVisualCastingState {
  const next = ensureFounderReferences(state);
  return {
    ...next,
    activeReferenceAuthority: next.activeReferenceAuthority ?? null,
    promptContractSnapshots: next.promptContractSnapshots ?? {},
    referenceDrivenBundles: next.referenceDrivenBundles ?? [],
    characterBibleAssetPack: next.characterBibleAssetPack ?? null,
    referenceDerivedSummary: next.referenceDerivedSummary ?? null,
    founderReferences: next.founderReferences.map((entry) => ({
      ...entry,
      decomposition: entry.decomposition ?? null,
    })),
    rounds: next.rounds.map((round) => ({
      ...round,
      generationMode: round.generationMode ?? 'LEGACY_VARIATION',
      referenceAuthorityId: round.referenceAuthorityId ?? null,
      assetPackId: round.assetPackId ?? null,
    })),
    candidates: next.candidates.map((candidate) => ({
      ...candidate,
      assetSlot: candidate.assetSlot ?? null,
      generationMode: candidate.generationMode ?? 'LEGACY_VARIATION',
    })),
  };
}

export function buildStructuredReferenceDecomposition(
  reference: FounderCastingReference,
): CharacterReferenceDecomposition {
  const label = reference.label?.trim() || 'Founder reference';
  const roleNote = reference.role.replace(/_/g, ' ').toLowerCase();
  const isFullLook = reference.role === 'FULL_LOOK';

  return {
    decompositionId: randomUUID(),
    referenceId: reference.referenceId,
    sourcePreviewUrl: reference.previewUrl,
    sourceStoragePath: reference.storagePath,
    role: reference.role,
    decomposedAt: new Date().toISOString(),
    identity: {
      ageRange: isFullLook ? visible('Mid-30s editorial presence — match reference subject') : inferred('Mid-30s editorial presence — align to reference role'),
      skinTone: visible('Match reference subject skin tone exactly — editorial realism'),
      faceShape: visible('Match reference facial bone structure and proportions'),
      browShape: partial('Match reference brow shape and density'),
      eyeShape: partial('Match reference eye shape and spacing'),
      noseProfile: partial('Match reference nose profile'),
      lipShape: partial('Match reference lip shape and fullness'),
      jawCharacter: partial('Match reference jaw and cheek character'),
      likenessAnchors: [
        visible('Same woman as founder reference — identity anchor #1'),
        visible('Facial proportions locked to uploaded reference'),
        isFullLook ? visible('Full Look reference is primary identity authority') : inferred(`Identity guided by ${roleNote} reference`),
      ],
      distinguishingProportions: visible('Preserve distinguishing facial proportions from reference — no drift'),
      presenceEnergy: isFullLook ? visible('Match reference presence energy and camera relationship') : inferred('Presence energy from reference role context'),
    },
    hair: {
      texture: isFullLook ? visible('Match reference hair texture') : inferred('Hair texture aligned to reference role'),
      density: partial('Match reference hair density'),
      length: isFullLook ? visible('Match reference hair length') : inferred('Hair length from reference context'),
      parting: partial('Match reference parting if visible'),
      styleStructure: isFullLook ? visible('Match reference hairstyle structure exactly') : inferred('Hairstyle structure from reference'),
      patternNotes: partial('Preserve curl/braid/updo pattern from reference if present'),
      color: visible('Match reference hair color'),
      hairlineBehavior: partial('Match reference hairline behavior'),
      stylingLane: isFullLook ? visible('Match reference styling lane — casual/editorial/polished as shown') : inferred('Styling lane from reference'),
    },
    wardrobe: {
      topCategory: isFullLook ? visible('Match reference top garment category') : inferred('Top category from reference role'),
      bottomCategory: isFullLook ? partial('Match or infer bottom from reference framing') : inferred('Bottom category — may be inferred if waist-up'),
      layerPieces: partial('Match visible layering from reference'),
      silhouette: isFullLook ? visible('Match reference silhouette') : inferred('Silhouette from reference'),
      fit: partial('Match reference fit impression'),
      fabricImpression: partial('Match reference fabric impression'),
      colorPalette: visible('Match reference wardrobe color palette'),
      shoes: inferred('Shoes inferred if not visible in reference — founder may confirm'),
      accessories: partial('Match visible accessories from reference'),
      jewelry: partial('Match visible jewelry from reference'),
      eyewear: partial('Eyewear if visible in reference'),
      nails: partial('Nails if visible in reference'),
      lookNaming: field(`${label} — ${roleNote} reference look`, 'CLEARLY_VISIBLE'),
    },
    presence: {
      moodEnergy: isFullLook ? visible('Match reference mood — confident/observant/soft/direct as shown') : inferred('Mood energy from reference role'),
      posture: partial('Match reference posture language'),
      poseLanguage: partial('Match reference pose language'),
      cameraRelationship: visible('Match reference camera relationship — editorial ease'),
      editorialVsEveryday: isFullLook ? visible('Match reference editorial vs everyday energy') : inferred('Energy lane from reference'),
    },
    environment: {
      roomType: isFullLook ? partial('Match or infer room type from reference background') : inferred('Environment from reference mood role'),
      setCues: partial('Desk/lounge/studio/office cues from reference if visible'),
      lightingMood: visible('Match reference lighting mood'),
      colorEnvironment: partial('Match reference environment color palette'),
      editorialObjects: partial('Props/objects visible in reference frame'),
      propSuggestions: inferred('Supporting props inferred from reference lifestyle cues'),
      realismLane: visible('Lifestyle/editorial realism — not AI fantasy luxury'),
    },
    authorityNotes: [
      `Primary authority: founder ${roleNote} reference (${reference.previewUrl})`,
      `Label: ${label}`,
      'Legacy casting prompt text is secondary context only when this decomposition is active',
      'Recreate THIS woman — not an inspired-by casting lottery',
    ],
  };
}

export function flattenDecompositionToSignals(decomposition: CharacterReferenceDecomposition): string[] {
  const lines: string[] = [
    ...decomposition.authorityNotes,
    `Identity: ${decomposition.identity.ageRange.value} [${decomposition.identity.ageRange.confidence}]`,
    `Face shape: ${decomposition.identity.faceShape.value}`,
    `Hair: ${decomposition.hair.styleStructure.value} — ${decomposition.hair.color.value}`,
    `Wardrobe: ${decomposition.wardrobe.lookNaming.value}`,
    `Presence: ${decomposition.presence.moodEnergy.value}`,
    `Environment: ${decomposition.environment.lightingMood.value} — ${decomposition.environment.roomType.value}`,
  ];
  for (const anchor of decomposition.identity.likenessAnchors) {
    lines.push(`${anchor.value} [${anchor.confidence}]`);
  }
  return lines;
}

export function resolveActiveCastingReferenceAuthority(
  state: CharacterVisualCastingState,
): ActiveCastingReferenceAuthority | null {
  const next = migrateReferenceDrivenCastingState(state);
  if (next.activeReferenceAuthority) {
    const stillValid = next.founderReferences.some(
      (entry) => entry.referenceId === next.activeReferenceAuthority?.referenceId && entry.decomposition,
    );
    if (stillValid) return next.activeReferenceAuthority;
  }

  const decomposed = next.founderReferences
    .filter((entry) => entry.decomposition && entry.status !== 'UPLOADED')
    .sort((a, b) => ROLE_AUTHORITY_RANK[a.role] - ROLE_AUTHORITY_RANK[b.role]);

  const primary = decomposed[0];
  if (!primary?.decomposition) return null;

  return {
    authorityId: randomUUID(),
    referenceId: primary.referenceId,
    role: primary.role,
    previewUrl: primary.previewUrl,
    storagePath: primary.storagePath,
    decompositionId: primary.decomposition.decompositionId,
    activatedAt: new Date().toISOString(),
    authorityRank: ROLE_AUTHORITY_RANK[primary.role],
  };
}

export function hasActiveReferenceAuthority(state: CharacterVisualCastingState): boolean {
  return resolveActiveCastingReferenceAuthority(state) !== null;
}

export function activateReferenceAuthority(
  state: CharacterVisualCastingState,
  referenceId: string,
): CharacterVisualCastingState {
  const next = migrateReferenceDrivenCastingState(state);
  const reference = next.founderReferences.find((entry) => entry.referenceId === referenceId);
  if (!reference?.decomposition) throw new Error('Reference must be decomposed before activating authority');

  const authority: ActiveCastingReferenceAuthority = {
    authorityId: randomUUID(),
    referenceId: reference.referenceId,
    role: reference.role,
    previewUrl: reference.previewUrl,
    storagePath: reference.storagePath,
    decompositionId: reference.decomposition.decompositionId,
    activatedAt: new Date().toISOString(),
    authorityRank: ROLE_AUTHORITY_RANK[reference.role],
  };

  return syncPipelineState({ ...next, activeReferenceAuthority: authority });
}

export function buildReferenceDerivedCharacterSummary(
  decomposition: CharacterReferenceDecomposition,
): ReferenceDerivedCharacterSummary {
  return {
    summaryId: randomUUID(),
    referenceId: decomposition.referenceId,
    decompositionId: decomposition.decompositionId,
    identityLine: `${decomposition.identity.ageRange.value}; ${decomposition.identity.faceShape.value}; ${decomposition.identity.presenceEnergy.value}`,
    hairLine: `${decomposition.hair.styleStructure.value}; ${decomposition.hair.color.value}; ${decomposition.hair.texture.value}`,
    wardrobeLine: `${decomposition.wardrobe.lookNaming.value}; ${decomposition.wardrobe.colorPalette.value}`,
    environmentLine: `${decomposition.environment.roomType.value}; ${decomposition.environment.lightingMood.value}`,
    presenceLine: `${decomposition.presence.moodEnergy.value}; ${decomposition.presence.cameraRelationship.value}`,
    compiledAt: new Date().toISOString(),
  };
}

export function assetSlotReviewTab(slot: CharacterBibleAssetSlot): CharacterBibleReviewTab {
  if (slot.startsWith('EXPRESSION_') || slot.startsWith('PORTRAIT_')) {
    if (slot.startsWith('EXPRESSION_')) return 'PRESENCE';
    return 'PORTRAIT_ANGLES';
  }
  if (slot.startsWith('FULL_BODY_')) return 'FULL_TURNAROUND';
  if (slot === 'WARDROBE_SHEET') return 'WARDROBE';
  if (slot === 'ENVIRONMENT_SET') return 'ENVIRONMENT';
  return 'BIBLE_SUMMARY';
}

export function groupCandidatesByReviewTab(
  candidates: CharacterCastingCandidate[],
): Record<CharacterBibleReviewTab, CharacterCastingCandidate[]> {
  const groups = CHARACTER_BIBLE_REVIEW_TABS.reduce(
    (acc, tab) => {
      acc[tab] = [];
      return acc;
    },
    {} as Record<CharacterBibleReviewTab, CharacterCastingCandidate[]>,
  );
  for (const candidate of candidates) {
    if (!candidate.assetSlot) continue;
    const tab = assetSlotReviewTab(candidate.assetSlot as CharacterBibleAssetSlot);
    groups[tab].push(candidate);
  }
  return groups;
}

export function buildCharacterBibleAssetPackPlan(params: {
  referenceId: string;
  decompositionId: string;
}): CharacterBibleAssetPack {
  return {
    packId: randomUUID(),
    referenceId: params.referenceId,
    decompositionId: params.decompositionId,
    roundId: null,
    slots: [...CHARACTER_BIBLE_ASSET_SLOTS],
    lockStates: {
      faceLocked: false,
      wardrobeLocked: false,
      environmentLocked: false,
    },
    status: 'PLANNED',
    createdAt: new Date().toISOString(),
    approvedAt: null,
  };
}

export function compileReferenceDrivenCastingBundle(params: {
  state: CharacterVisualCastingState;
  snapshot: CharacterTruthSnapshot;
  assetSlot: CharacterBibleAssetSlot;
}): ReferenceDrivenCastingBundle {
  const next = migrateReferenceDrivenCastingState(params.state);
  const authority = resolveActiveCastingReferenceAuthority(next);
  if (!authority) throw new Error('Active reference authority required');

  const reference = next.founderReferences.find((entry) => entry.referenceId === authority.referenceId);
  if (!reference?.decomposition) throw new Error('Reference decomposition required');

  const contract = compileReferenceDrivenCastingPromptContract({
    snapshot: params.snapshot,
    decomposition: reference.decomposition,
    authority,
    assetSlot: params.assetSlot,
  });

  storePromptContractSnapshot(params.state, contract);

  return {
    bundleId: randomUUID(),
    referenceId: authority.referenceId,
    decompositionId: reference.decomposition.decompositionId,
    authorityOrder: [...CASTING_PROMPT_AUTHORITY_LAYERS],
    legacyPromptSecondary: true,
    compiledAt: new Date().toISOString(),
    promptSnapshotIds: [contract.contractId],
  };
}

export function generateCharacterBibleAssetPackRound(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
}): CharacterVisualCastingState {
  const next = migrateReferenceDrivenCastingState(params.state);
  const snapshot = next.truthSnapshots.find((entry) => entry.snapshotId === next.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Active character truth snapshot required');

  const authority = resolveActiveCastingReferenceAuthority(next);
  if (!authority) throw new Error('Upload and decompose a Full Look reference first');

  const reference = next.founderReferences.find((entry) => entry.referenceId === authority.referenceId);
  if (!reference?.decomposition) throw new Error('Reference decomposition required');

  let working = next;
  const assetPack = buildCharacterBibleAssetPackPlan({
    referenceId: authority.referenceId,
    decompositionId: reference.decomposition.decompositionId,
  });

  const contracts = CHARACTER_BIBLE_ASSET_SLOTS.map((assetSlot) =>
    compileReferenceDrivenCastingPromptContract({
      snapshot,
      decomposition: reference.decomposition!,
      authority,
      assetSlot,
    }),
  );

  for (const contract of contracts) {
    working = storePromptContractSnapshot(working, contract);
  }

  const rec = recommendStillImageCastingProvider(params.falConfigured);
  const roundId = randomUUID();
  const roundNumber = working.rounds.length + 1;

  const candidates: CharacterCastingCandidate[] = contracts.map((contract, index) => ({
    candidateId: randomUUID(),
    roundId,
    characterTruthSnapshotId: snapshot.snapshotId,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    promptSnapshotId: contract.contractId,
    variationAxis: 'FACE_STRUCTURE',
    assetSlot: contract.assetSlot ?? CHARACTER_BIBLE_ASSET_SLOTS[index]!,
    generationMode: 'CHARACTER_BIBLE_ASSET_PACK',
    outputAssetId: null,
    previewUrl: params.dispatchFal ? null : `/api/placeholder/casting/bible-${roundNumber}-${index + 1}`,
    createdAt: new Date().toISOString(),
    founderJudgment: null,
    deeperJudgment: null,
    strengths: [],
    weaknesses: [],
    castingStatus: 'UNREVIEWED',
    founderNote: contract.assetSlot ?? null,
  }));

  const bundle: ReferenceDrivenCastingBundle = {
    bundleId: randomUUID(),
    referenceId: authority.referenceId,
    decompositionId: reference.decomposition.decompositionId,
    authorityOrder: [...CASTING_PROMPT_AUTHORITY_LAYERS],
    legacyPromptSecondary: true,
    compiledAt: new Date().toISOString(),
    promptSnapshotIds: contracts.map((entry) => entry.contractId),
  };

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
    activeReferenceAuthority: authority,
    referenceDerivedSummary: buildReferenceDerivedCharacterSummary(reference.decomposition),
    characterBibleAssetPack: {
      ...assetPack,
      roundId,
      status: params.dispatchFal ? 'GENERATING' : 'REVIEW',
    },
    referenceDrivenBundles: [...working.referenceDrivenBundles, bundle],
    rounds: [
      ...working.rounds.map((entry) =>
        entry.status === 'REVIEW_READY' ? { ...entry, status: 'COMPLETE' as const } : entry,
      ),
      round,
    ],
    candidates: [...working.candidates, ...candidates],
    castingCandidatesReady: !params.dispatchFal,
    falImageRequests: working.falImageRequests + (params.dispatchFal ? candidates.length : 0),
  });
}

export function generateReferenceControlledCandidateRound(params: {
  state: CharacterVisualCastingState;
  falConfigured: boolean;
  dispatchFal?: boolean;
}): CharacterVisualCastingState {
  const next = migrateReferenceDrivenCastingState(params.state);
  const snapshot = next.truthSnapshots.find((entry) => entry.snapshotId === next.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Active character truth snapshot required');

  const authority = resolveActiveCastingReferenceAuthority(next);
  if (!authority) throw new Error('Active reference authority required');

  const reference = next.founderReferences.find((entry) => entry.referenceId === authority.referenceId);
  if (!reference?.decomposition) throw new Error('Reference decomposition required');

  let working = next;
  const rec = recommendStillImageCastingProvider(params.falConfigured);
  const roundId = randomUUID();
  const roundNumber = working.rounds.length + 1;

  const contracts = REFERENCE_CONTROLLED_VARIATION_SLOTS.map((slot) =>
    compileReferenceDrivenCastingPromptContract({
      snapshot,
      decomposition: reference.decomposition!,
      authority,
      controlledVariationSlot: slot,
    }),
  );

  for (const contract of contracts) {
    working = storePromptContractSnapshot(working, contract);
  }

  const candidates: CharacterCastingCandidate[] = contracts.map((contract, index) => ({
    candidateId: randomUUID(),
    roundId,
    characterTruthSnapshotId: snapshot.snapshotId,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    promptSnapshotId: contract.contractId,
    variationAxis: 'FACE_STRUCTURE',
    assetSlot: contract.controlledVariationSlot ?? REFERENCE_CONTROLLED_VARIATION_SLOTS[index]!,
    generationMode: 'REFERENCE_DRIVEN',
    outputAssetId: null,
    previewUrl: params.dispatchFal ? null : `/api/placeholder/casting/ref-${roundNumber}-${index + 1}`,
    createdAt: new Date().toISOString(),
    founderJudgment: null,
    deeperJudgment: null,
    strengths: [],
    weaknesses: [],
    castingStatus: 'UNREVIEWED',
    founderNote: contract.controlledVariationSlot ?? null,
  }));

  const round: CharacterCastingRound = {
    roundId,
    roundNumber,
    characterId: snapshot.characterId,
    characterTruthSnapshotId: snapshot.snapshotId,
    candidateIds: candidates.map((entry) => entry.candidateId),
    generationContractId: contracts[0]?.contractId ?? null,
    generationMode: 'REFERENCE_DRIVEN',
    referenceAuthorityId: authority.authorityId,
    assetPackId: null,
    provider: rec.provider ?? 'fal',
    model: rec.model ?? 'pending',
    costUsd: params.dispatchFal ? estimateCastingRoundCost(candidates.length, params.falConfigured) : 0,
    createdAt: new Date().toISOString(),
    status: params.dispatchFal ? 'GENERATING' : 'REVIEW_READY',
    retainedTraits: ['FACE', 'PRESENCE'],
    variedTraits: [],
    rejectedTraits: [],
    basedOnPriorTruthSnapshotId: snapshot.snapshotId,
  };

  return syncPipelineState({
    ...working,
    rounds: [...working.rounds, round],
    candidates: [...working.candidates, ...candidates],
    castingCandidatesReady: !params.dispatchFal,
    falImageRequests: working.falImageRequests + (params.dispatchFal ? candidates.length : 0),
  });
}

export function updateCharacterBibleLockState(
  state: CharacterVisualCastingState,
  lock: 'faceLocked' | 'wardrobeLocked' | 'environmentLocked',
  value: boolean,
): CharacterVisualCastingState {
  const next = migrateReferenceDrivenCastingState(state);
  if (!next.characterBibleAssetPack) throw new Error('Character Bible asset pack not initialized');
  return syncPipelineState({
    ...next,
    characterBibleAssetPack: {
      ...next.characterBibleAssetPack,
      lockStates: {
        ...next.characterBibleAssetPack.lockStates,
        [lock]: value,
      },
    },
  });
}

export function approveCharacterBibleAssetPack(state: CharacterVisualCastingState): CharacterVisualCastingState {
  const next = migrateReferenceDrivenCastingState(state);
  if (!next.characterBibleAssetPack) throw new Error('Character Bible asset pack not initialized');
  return syncPipelineState({
    ...next,
    characterReferencePackReady: true,
    characterBibleAssetPack: {
      ...next.characterBibleAssetPack,
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
    },
    referencePackSummary: {
      ...next.referencePackSummary,
      packId: next.characterBibleAssetPack.packId,
      faceAnchors: next.characterBibleAssetPack.slots.filter((slot) => slot.startsWith('PORTRAIT_')).length,
      expressionAnchors: next.characterBibleAssetPack.slots.filter((slot) => slot.startsWith('EXPRESSION_')).length,
      hairAnchors: 1,
      wardrobeAnchors: 1,
      negativeConstraints: REFERENCE_DRIVEN_NEGATIVE_CONSTRAINTS.length,
    },
  });
}

export function legacyPromptDominatesRegeneration(state: CharacterVisualCastingState): boolean {
  return !hasActiveReferenceAuthority(state);
}
