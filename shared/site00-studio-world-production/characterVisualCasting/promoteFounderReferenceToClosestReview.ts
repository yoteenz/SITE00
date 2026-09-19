/**
 * Promote a founder-uploaded reference into WHO FEELS CLOSEST? review.
 * Reference image is the candidate — no FAL spend until founder confirms.
 */

import { randomUUID } from 'node:crypto';
import { activateReferenceAuthority, migrateReferenceDrivenCastingState } from './referenceDrivenCasting.js';
import { ensureVisualAuthoritySnapshot } from './identityAnchorCasting.js';
import { syncPipelineState } from './stateMachine.js';
import type {
  CharacterCastingCandidate,
  CharacterCastingRound,
  CharacterVisualCastingState,
} from './types.js';

export function promoteFounderReferenceToClosestReview(
  state: CharacterVisualCastingState,
  referenceId: string,
): CharacterVisualCastingState {
  let next = migrateReferenceDrivenCastingState(state);
  const reference = next.founderReferences.find((entry) => entry.referenceId === referenceId);
  if (!reference) throw new Error('Founder casting reference not found');
  if (!reference.decomposition) throw new Error('Decompose reference before promoting to review');

  next = activateReferenceAuthority(next, referenceId);
  next = ensureVisualAuthoritySnapshot(next);

  const snapshot = next.truthSnapshots.find((entry) => entry.snapshotId === next.activeTruthSnapshotId);
  if (!snapshot) throw new Error('Active character truth snapshot required');

  const roundId = randomUUID();
  const candidateId = randomUUID();
  const roundNumber = next.rounds.length + 1;

  const candidate: CharacterCastingCandidate = {
    candidateId,
    roundId,
    characterTruthSnapshotId: snapshot.snapshotId,
    provider: 'founder_upload',
    model: 'reference_image',
    promptSnapshotId: `founder-ref-${referenceId}`,
    variationAxis: 'INTELLECTUAL_PRESENCE',
    assetSlot: null,
    generationMode: 'FOUNDER_REFERENCE_REVIEW',
    outputAssetId: reference.referenceId,
    previewUrl: reference.previewUrl,
    createdAt: new Date().toISOString(),
    founderJudgment: null,
    deeperJudgment: null,
    strengths: [],
    weaknesses: [],
    castingStatus: 'UNREVIEWED',
    founderNote: reference.label,
    founderReferenceId: reference.referenceId,
  };

  const round: CharacterCastingRound = {
    roundId,
    roundNumber,
    characterId: snapshot.characterId,
    characterTruthSnapshotId: snapshot.snapshotId,
    candidateIds: [candidateId],
    generationContractId: null,
    generationMode: 'FOUNDER_REFERENCE_REVIEW',
    referenceAuthorityId: next.activeReferenceAuthority?.authorityId ?? null,
    assetPackId: null,
    provider: 'founder_upload',
    model: 'reference_image',
    costUsd: 0,
    createdAt: new Date().toISOString(),
    status: 'REVIEW_READY',
    retainedTraits: [],
    variedTraits: [],
    rejectedTraits: [],
    basedOnPriorTruthSnapshotId: null,
    founderReferenceId: reference.referenceId,
  };

  return syncPipelineState({
    ...next,
    rounds: [...next.rounds, round],
    candidates: [...next.candidates, candidate],
    castingCandidatesReady: true,
    selectedCandidateId: null,
    characterIsolate: null,
    canonicalAnchor: null,
    anchorWorkflowStage: 'CANONICAL_ANCHOR_PENDING',
  });
}

export function isFounderReferenceReviewRound(round: CharacterCastingRound | null | undefined): boolean {
  return round?.generationMode === 'FOUNDER_REFERENCE_REVIEW';
}
