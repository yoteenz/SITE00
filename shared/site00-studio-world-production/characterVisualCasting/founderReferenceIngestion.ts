/**
 * P0.5E.4D — Founder-uploaded character references for casting + bible authority.
 */

import { randomUUID } from 'node:crypto';
import {
  buildStructuredReferenceDecomposition,
  flattenDecompositionToSignals,
  migrateReferenceDrivenCastingState,
  activateReferenceAuthority,
} from './referenceDrivenCasting.js';
import { ensureVisualAuthoritySnapshot } from './identityAnchorCasting.js';
import { syncPipelineState } from './stateMachine.js';
import type {
  CharacterCastingAuthority,
  CharacterVisualCastingState,
  FounderCastingReference,
  FounderCastingReferenceRole,
} from './types.js';

export function migrateCastingStateFounderReferences(
  state: CharacterVisualCastingState,
): CharacterVisualCastingState {
  return migrateReferenceDrivenCastingState(state);
}

export function uploadFounderCastingReference(
  state: CharacterVisualCastingState,
  params: {
    previewUrl: string;
    storagePath: string;
    role: FounderCastingReferenceRole;
    label?: string | null;
  },
): CharacterVisualCastingState {
  const next = migrateCastingStateFounderReferences(state);
  const reference: FounderCastingReference = {
    referenceId: randomUUID(),
    previewUrl: params.previewUrl,
    storagePath: params.storagePath,
    role: params.role,
    label: params.label?.trim() || null,
    decomposedSignals: [],
    decomposition: null,
    decomposedAt: null,
    storedInBible: false,
    bibleReceiptId: null,
    uploadedAt: new Date().toISOString(),
    status: 'UPLOADED',
  };
  return syncPipelineState({
    ...next,
    founderReferences: [...next.founderReferences, reference],
  });
}

export function decomposeFounderCastingReference(
  state: CharacterVisualCastingState,
  referenceId: string,
): CharacterVisualCastingState {
  const next = migrateCastingStateFounderReferences(state);
  const target = next.founderReferences.find((entry) => entry.referenceId === referenceId);
  if (!target) throw new Error('Founder casting reference not found');

  const decomposition = buildStructuredReferenceDecomposition(target);
  const signals = flattenDecompositionToSignals(decomposition);

  const founderReferences = next.founderReferences.map((entry) =>
    entry.referenceId === referenceId
      ? {
          ...entry,
          decomposition,
          decomposedSignals: signals,
          decomposedAt: decomposition.decomposedAt,
          status: 'DECOMPOSED' as const,
        }
      : entry,
  );

  const authority = mergeReferenceSignalsIntoAuthority(next.castingAuthority, target, signals);
  let updated = syncPipelineState({
    ...next,
    founderReferences,
    castingAuthority: authority,
  });

  if (target.role === 'FULL_LOOK') {
    updated = activateReferenceAuthority(updated, referenceId);
    updated = ensureVisualAuthoritySnapshot(updated);
  }

  return updated;
}

export function storeFounderCastingReferenceInBible(
  state: CharacterVisualCastingState,
  referenceId: string,
  bibleReceiptId: string,
): CharacterVisualCastingState {
  const next = migrateCastingStateFounderReferences(state);
  const target = next.founderReferences.find((entry) => entry.referenceId === referenceId);
  if (!target) throw new Error('Founder casting reference not found');
  if (!target.decomposition && target.decomposedSignals.length === 0) {
    throw new Error('Decompose reference before storing in bible');
  }

  const founderReferences = next.founderReferences.map((entry) =>
    entry.referenceId === referenceId
      ? {
          ...entry,
          storedInBible: true,
          bibleReceiptId,
          status: 'BIBLE_STORED' as const,
        }
      : entry,
  );

  const stored = founderReferences.filter((entry) => entry.storedInBible);
  const faceAnchors = stored.filter((entry) => entry.role === 'FACE' || entry.role === 'FULL_LOOK').length;
  const hairAnchors = stored.filter((entry) => entry.role === 'HAIR' || entry.role === 'FULL_LOOK').length;
  const wardrobeAnchors = stored.filter((entry) => entry.role === 'WARDROBE' || entry.role === 'FULL_LOOK').length;

  return syncPipelineState({
    ...next,
    founderReferences,
    referencePackSummary: {
      ...next.referencePackSummary,
      packId: next.referencePackSummary.packId ?? randomUUID(),
      faceAnchors: Math.max(next.referencePackSummary.faceAnchors, faceAnchors),
      hairAnchors: Math.max(next.referencePackSummary.hairAnchors, hairAnchors),
      wardrobeAnchors: Math.max(next.referencePackSummary.wardrobeAnchors, wardrobeAnchors),
      expressionAnchors: Math.max(
        next.referencePackSummary.expressionAnchors,
        stored.filter((entry) => entry.role === 'PRESENCE' || entry.role === 'MOOD').length,
      ),
    },
  });
}

export function founderReferencePromptNotes(state: CharacterVisualCastingState): string[] {
  const next = migrateCastingStateFounderReferences(state);
  const authority = next.activeReferenceAuthority;
  if (authority) {
    const reference = next.founderReferences.find((entry) => entry.referenceId === authority.referenceId);
    if (reference?.decomposition) {
      return flattenDecompositionToSignals(reference.decomposition);
    }
  }
  return next.founderReferences
    .filter((entry) => entry.storedInBible || entry.status === 'DECOMPOSED')
    .flatMap((entry) => [
      `Founder reference (${entry.role}): ${entry.previewUrl}`,
      ...entry.decomposedSignals,
    ]);
}

export function hasFounderReferencesReadyForRegeneration(state: CharacterVisualCastingState): boolean {
  const next = migrateCastingStateFounderReferences(state);
  return next.founderReferences.some(
    (entry) =>
      entry.role === 'FULL_LOOK' &&
      (entry.decomposition || entry.decomposedSignals.length > 0 || entry.storedInBible),
  );
}

function mergeReferenceSignalsIntoAuthority(
  authority: CharacterCastingAuthority | null,
  reference: FounderCastingReference,
  signals: string[],
): CharacterCastingAuthority {
  const base: CharacterCastingAuthority = authority ?? {
    authorityId: randomUUID(),
    snapshotId: '',
    visualHypothesisEvidence: [],
    visualTendencyEvidence: [],
    projectVisualCanonNotes: [],
    continuityArchitectureNotes: [],
  };
  const note = `[${reference.role}] ${reference.label ?? reference.previewUrl} — ${signals.slice(0, 3).join(' · ')}`;
  return {
    ...base,
    projectVisualCanonNotes: [...base.projectVisualCanonNotes, note],
    continuityArchitectureNotes: [
      ...base.continuityArchitectureNotes,
      `Founder reference stored for casting: ${reference.storagePath}`,
      reference.role === 'FULL_LOOK' ? 'FULL_LOOK reference is active casting authority when decomposed' : '',
    ].filter(Boolean),
  };
}

export type { FounderCastingReferenceRole };
