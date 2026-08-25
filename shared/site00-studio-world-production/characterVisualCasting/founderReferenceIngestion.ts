/**
 * P0.5E.4C — Founder-uploaded character references for casting + bible authority.
 */

import { randomUUID } from 'node:crypto';
import { syncPipelineState } from './stateMachine.js';
import type {
  CharacterCastingAuthority,
  CharacterVisualCastingState,
  FounderCastingReference,
  FounderCastingReferenceRole,
} from './types.js';

const ROLE_DECOMPOSITION: Record<FounderCastingReferenceRole, string[]> = {
  FACE: [
    'Facial structure and bone geometry anchor',
    'Skin tone and texture reference — editorial realism',
    'Identity-defining features — not costume or glam overlay',
  ],
  HAIR: [
    'Hair texture, protective style, or natural pattern reference',
    'Hairline and silhouette anchor for continuity',
  ],
  WARDROBE: [
    'Wardrobe palette and styling reference',
    'Personal taste signal — not uniform or costume',
  ],
  PRESENCE: [
    'Camera relationship and bodily ease reference',
    'Energy and posture — how she occupies space',
  ],
  FULL_LOOK: [
    'Full editorial look reference — face, hair, wardrobe together',
    'Holistic casting direction — same woman end-to-end',
  ],
  MOOD: [
    'Mood and atmosphere reference — light, environment, tone',
    'Emotional temperature — not a different character',
  ],
};

export function migrateCastingStateFounderReferences(
  state: CharacterVisualCastingState,
): CharacterVisualCastingState {
  if (Array.isArray(state.founderReferences)) return state;
  return { ...state, founderReferences: [] };
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

  const signals = [
    ...ROLE_DECOMPOSITION[target.role],
    target.label ? `Founder label: ${target.label}` : null,
    `Reference role: ${target.role.replace(/_/g, ' ')}`,
  ].filter(Boolean) as string[];

  const founderReferences = next.founderReferences.map((entry) =>
    entry.referenceId === referenceId
      ? {
          ...entry,
          decomposedSignals: signals,
          decomposedAt: new Date().toISOString(),
          status: 'DECOMPOSED' as const,
        }
      : entry,
  );

  const authority = mergeReferenceSignalsIntoAuthority(next.castingAuthority, target, signals);

  return syncPipelineState({
    ...next,
    founderReferences,
    castingAuthority: authority,
  });
}

export function storeFounderCastingReferenceInBible(
  state: CharacterVisualCastingState,
  referenceId: string,
  bibleReceiptId: string,
): CharacterVisualCastingState {
  const next = migrateCastingStateFounderReferences(state);
  const target = next.founderReferences.find((entry) => entry.referenceId === referenceId);
  if (!target) throw new Error('Founder casting reference not found');
  if (target.decomposedSignals.length === 0) {
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
  return next.founderReferences
    .filter((entry) => entry.storedInBible || entry.status === 'DECOMPOSED')
    .flatMap((entry) => [
      `Founder reference (${entry.role}): ${entry.previewUrl}`,
      ...entry.decomposedSignals,
    ]);
}

export function hasFounderReferencesReadyForRegeneration(state: CharacterVisualCastingState): boolean {
  const next = migrateCastingStateFounderReferences(state);
  return next.founderReferences.some((entry) => entry.storedInBible || entry.decomposedSignals.length > 0);
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
  const note = `[${reference.role}] ${reference.label ?? reference.previewUrl} — ${signals.join(' · ')}`;
  return {
    ...base,
    projectVisualCanonNotes: [...base.projectVisualCanonNotes, note],
    continuityArchitectureNotes: [
      ...base.continuityArchitectureNotes,
      `Founder reference stored for casting: ${reference.storagePath}`,
    ],
  };
}
