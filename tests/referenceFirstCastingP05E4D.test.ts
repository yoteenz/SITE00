/**
 * P0.5E.4D — Reference-first casting regeneration + Character Bible asset pack tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  decomposeFounderCastingReference,
  hasFounderReferencesReadyForRegeneration,
  uploadFounderCastingReference,
} from '../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js';
import {
  generateCharacterBibleAssetPackRound,
  hasActiveReferenceAuthority,
  legacyPromptDominatesRegeneration,
  migrateReferenceDrivenCastingState,
  resolveActiveCastingReferenceAuthority,
} from '../shared/site00-studio-world-production/characterVisualCasting/referenceDrivenCasting.js';
import {
  compileReferenceDrivenCastingPromptContract,
  legacyPromptWouldDominate,
  resolveStoredPromptContract,
} from '../shared/site00-studio-world-production/characterVisualCasting/promptContract.js';
import { generateNextCastingRoundFromFeedback } from '../shared/site00-studio-world-production/characterVisualCasting/castingEngine.js';
import { CHARACTER_BIBLE_ASSET_SLOTS } from '../shared/site00-studio-world-production/characterVisualCasting/constants.js';
import { buildEmptyVisualCastingState } from '../shared/site00-studio-world-production/characterVisualCasting/stateMachine.js';
import { buildCharacterTruthSnapshot } from '../shared/site00-studio-world-production/characterVisualCasting/characterTruthSnapshot.js';
import { buildNdxFounderCharacterDiscoveryRun } from '../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import {
  brandCharacterImmutable,
  brandCanonUnchanged,
} from '../api/_lib/site00Evolve/characterContinuity/characterContinuityService.js';

const ROOT = join(process.cwd());

function seedCastingStateWithFullLook() {
  let state = buildEmptyVisualCastingState();
  const snapshot = buildCharacterTruthSnapshot({
    run: buildNdxFounderCharacterDiscoveryRun(),
    version: 1,
    lockedForCasting: true,
  });
  state = {
    ...state,
    visualCastingReady: true,
    truthSnapshots: [snapshot],
    activeTruthSnapshotId: snapshot.snapshotId,
  };
  state = uploadFounderCastingReference(state, {
    previewUrl: 'https://example.test/full-look.webp',
    storagePath: 'site00/character-casting-references/ndxbook/full-look.webp',
    role: 'FULL_LOOK',
    label: 'North star full look',
  });
  state = decomposeFounderCastingReference(state, state.founderReferences[0]!.referenceId);
  return { state, snapshot };
}

describe('P0.5E.4D reference-first casting regeneration', () => {
  it('uploaded Full Look becomes active casting authority', () => {
    const { state } = seedCastingStateWithFullLook();
    expect(hasActiveReferenceAuthority(state)).toBe(true);
    const authority = resolveActiveCastingReferenceAuthority(state);
    expect(authority?.role).toBe('FULL_LOOK');
    expect(state.founderReferences[0]?.decomposition).toBeTruthy();
    expect(state.founderReferences[0]?.decomposition?.wardrobe.bottomCategory.confidence).toBe('PARTIALLY_VISIBLE');
  });

  it('structured decomposition marks inferred fields', () => {
    const { state } = seedCastingStateWithFullLook();
    const decomposition = state.founderReferences[0]?.decomposition;
    expect(decomposition?.identity.faceShape.confidence).toBe('CLEARLY_VISIBLE');
    expect(decomposition?.wardrobe.shoes.confidence).toBe('INFERRED');
  });

  it('legacy prompt does not dominate when reference authority is active', () => {
    const { state, snapshot } = seedCastingStateWithFullLook();
    const authority = resolveActiveCastingReferenceAuthority(state)!;
    const contract = compileReferenceDrivenCastingPromptContract({
      snapshot,
      decomposition: state.founderReferences[0]!.decomposition!,
      authority,
      assetSlot: 'PORTRAIT_FRONT',
    });
    expect(legacyPromptWouldDominate(contract)).toBe(false);
    expect(contract.sections.referenceAuthorityBlock).toContain('PRIMARY SOURCE OF TRUTH');
    expect(contract.sections.characterTruth).toContain('[SECONDARY]');
    expect(legacyPromptDominatesRegeneration(state)).toBe(false);
  });

  it('regenerate-from-reference compiles fresh reference-driven bible asset pack', () => {
    const { state } = seedCastingStateWithFullLook();
    const priorRoundCount = state.rounds.length;
    const next = generateNextCastingRoundFromFeedback({
      state,
      falConfigured: false,
      dispatchFal: false,
    });
    expect(next.rounds.length).toBe(priorRoundCount + 1);
    const round = next.rounds.at(-1)!;
    expect(round.generationMode).toBe('CHARACTER_BIBLE_ASSET_PACK');
    const roundCandidates = next.candidates.filter((entry) => entry.roundId === round.roundId);
    expect(roundCandidates.length).toBe(CHARACTER_BIBLE_ASSET_SLOTS.length);
    expect(roundCandidates.some((entry) => entry.assetSlot === 'PORTRAIT_FRONT')).toBe(true);
    expect(roundCandidates.some((entry) => entry.assetSlot === 'FULL_BODY_BACK')).toBe(true);
    expect(roundCandidates.some((entry) => entry.assetSlot === 'WARDROBE_SHEET')).toBe(true);
    expect(roundCandidates.some((entry) => entry.assetSlot === 'ENVIRONMENT_SET')).toBe(true);
    expect(roundCandidates.every((entry) => entry.generationMode === 'CHARACTER_BIBLE_ASSET_PACK')).toBe(true);
    expect(next.characterBibleAssetPack?.status).toBe('REVIEW');
    expect(next.promptContractSnapshots[roundCandidates[0]!.promptSnapshotId]).toBeTruthy();
    const stored = resolveStoredPromptContract(next, roundCandidates[0]!.promptSnapshotId);
    expect(stored?.generationMode).toBe('CHARACTER_BIBLE_ASSET_PACK');
    expect(legacyPromptWouldDominate(stored!)).toBe(false);
  });

  it('generateCharacterBibleAssetPackRound stores prompt snapshots for FAL dispatch', () => {
    const { state } = seedCastingStateWithFullLook();
    const next = generateCharacterBibleAssetPackRound({ state, falConfigured: false, dispatchFal: false });
    const candidate = next.candidates.at(-1)!;
    expect(resolveStoredPromptContract(next, candidate.promptSnapshotId)?.assetSlot).toBeTruthy();
  });

  it('hasFounderReferencesReadyForRegeneration requires Full Look reference', () => {
    let state = buildEmptyVisualCastingState();
    state = uploadFounderCastingReference(state, {
      previewUrl: 'https://example.test/face.webp',
      storagePath: 'face.webp',
      role: 'FACE',
    });
    state = decomposeFounderCastingReference(state, state.founderReferences[0]!.referenceId);
    expect(hasFounderReferencesReadyForRegeneration(state)).toBe(false);
    expect(hasFounderReferencesReadyForRegeneration(seedCastingStateWithFullLook().state)).toBe(true);
  });

  it('preserves prior casting history and brand canon immutability', () => {
    const { state } = seedCastingStateWithFullLook();
    const withLegacyRound = generateNextCastingRoundFromFeedback({
      state: {
        ...state,
        activeReferenceAuthority: null,
        founderReferences: state.founderReferences.map((entry) => ({
          ...entry,
          decomposition: null,
          decomposedSignals: [],
          status: 'UPLOADED' as const,
        })),
      },
      falConfigured: false,
    });
    expect(withLegacyRound.rounds.length).toBeGreaterThan(0);
    expect(brandCharacterImmutable()).toBe(true);
    expect(brandCanonUnchanged()).toBe(true);
  });

  it('migrates legacy casting state without reference-driven fields', () => {
    const legacy = {
      ...buildEmptyVisualCastingState(),
      founderReferences: [
        {
          referenceId: 'legacy-ref',
          previewUrl: 'https://example.test/legacy.webp',
          storagePath: 'legacy.webp',
          role: 'FULL_LOOK' as const,
          label: null,
          decomposedSignals: ['legacy signal'],
          decomposedAt: new Date().toISOString(),
          storedInBible: false,
          bibleReceiptId: null,
          uploadedAt: new Date().toISOString(),
          status: 'DECOMPOSED' as const,
        },
      ],
    };
    const migrated = migrateReferenceDrivenCastingState(legacy as never);
    expect(migrated.promptContractSnapshots).toEqual({});
    expect(migrated.activeReferenceAuthority).toBeNull();
  });

  it('casting page exposes reference-first workflow UI', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectCharacterCastingPage.tsx'), 'utf8');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-character-casting.css'), 'utf8');
    expect(page).toContain('GENERATE CHARACTER BIBLE FROM REFERENCE');
    expect(page).toContain('DECOMPOSITION REVIEW');
    expect(page).toContain('CHARACTER BIBLE REVIEW');
    expect(page).toContain('REGENERATE CASTING FROM REFERENCES');
    expect(css).toContain('decomp-grid');
  });
});
