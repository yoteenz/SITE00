/**
 * P0.5E.4E — Visual identity lock + canonical anchor + drift QA tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  decomposeFounderCastingReference,
  uploadFounderCastingReference,
} from '../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js';
import {
  assertAnchorApprovedForBiblePack,
  approveCanonicalAnchor,
  buildAuthorityLocksFromDecomposition,
  buildVisualIdentityLock,
  buildWardrobeLock,
  buildEnvironmentLock,
  buildViewInferenceMap,
  evaluateCharacterContinuityDrift,
  generateAnchorDependentCharacterBiblePackRound,
  generateCanonicalAnchorRound,
  isCanonicalAnchorApproved,
  migrateIdentityAnchorState,
  promptUsesApprovedAnchor,
} from '../shared/site00-studio-world-production/characterVisualCasting/identityAnchorCasting.js';
import {
  generateCharacterBibleAssetPackRound,
  legacyPromptDominatesRegeneration,
  resolveActiveCastingReferenceAuthority,
} from '../shared/site00-studio-world-production/characterVisualCasting/referenceDrivenCasting.js';
import {
  compileAnchorDependentBiblePromptContract,
  legacyPromptWouldDominate,
  resolveStoredPromptContract,
} from '../shared/site00-studio-world-production/characterVisualCasting/promptContract.js';
import { buildCharacterBibleViewContract } from '../shared/site00-studio-world-production/characterVisualCasting/viewContracts.js';
import {
  CHARACTER_BIBLE_ASSET_SLOTS,
  OPTIONAL_SUPPORTING_REFERENCE_ROLES,
} from '../shared/site00-studio-world-production/characterVisualCasting/constants.js';
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

function seedWithApprovedAnchor() {
  const { state, snapshot } = seedCastingStateWithFullLook();
  let working = generateCanonicalAnchorRound({ state, falConfigured: false, dispatchFal: false });
  working = approveCanonicalAnchor(working);
  return { state: working, snapshot };
}

describe('P0.5E.4E identity lock + anchor-first Bible generation', () => {
  it('uploaded full-look reference becomes dominant casting authority with locks', () => {
    const { state } = seedCastingStateWithFullLook();
    const authority = resolveActiveCastingReferenceAuthority(state);
    expect(authority?.role).toBe('FULL_LOOK');
    expect(state.visualAuthoritySnapshot?.identityLock).toBeTruthy();
    expect(state.visualAuthoritySnapshot?.wardrobeLock).toBeTruthy();
    expect(state.visualAuthoritySnapshot?.environmentLock).toBeTruthy();
    expect(legacyPromptDominatesRegeneration(state)).toBe(false);
  });

  it('builds structured authority locks and view inference map', () => {
    const { state } = seedCastingStateWithFullLook();
    const decomposition = state.founderReferences[0]!.decomposition!;
    const identity = buildVisualIdentityLock(decomposition);
    const wardrobe = buildWardrobeLock(decomposition);
    const environment = buildEnvironmentLock(decomposition);
    const inferenceMap = buildViewInferenceMap(decomposition);
    expect(identity.sameWomanContinuityConstraints.length).toBeGreaterThan(0);
    expect(wardrobe.sameOutfitContinuityConstraints.length).toBeGreaterThan(0);
    expect(environment.sameEnvironmentFamilyConstraints.length).toBeGreaterThan(0);
    expect(inferenceMap.traits.some((trait) => trait.visibility === 'DIRECTLY_VISIBLE')).toBe(true);
    expect(inferenceMap.traits.some((trait) => trait.visibility === 'STRONGLY_INFERRED')).toBe(true);
  });

  it('identity wardrobe and environment locks persist in authority snapshot', () => {
    const { state } = seedCastingStateWithFullLook();
    const snapshot = buildAuthorityLocksFromDecomposition(state.founderReferences[0]!.decomposition!);
    expect(snapshot.identityLock.faceStructure).toContain('Match reference');
    expect(snapshot.wardrobeLock.garmentCategories).toBeTruthy();
    expect(snapshot.environmentLock.roomType).toBeTruthy();
  });

  it('canonical anchor required before Bible pack generation', () => {
    const { state } = seedCastingStateWithFullLook();
    expect(isCanonicalAnchorApproved(state)).toBe(false);
    expect(() => assertAnchorApprovedForBiblePack(state)).toThrow(/Canonical anchor must be approved/);
    expect(() => generateCharacterBibleAssetPackRound({ state, falConfigured: false })).toThrow();
  });

  it('failed anchor gate blocks downstream pack until approval', () => {
    const { state } = seedCastingStateWithFullLook();
    const withAnchor = generateCanonicalAnchorRound({ state, falConfigured: false, dispatchFal: false });
    expect(withAnchor.canonicalAnchor?.status).toBe('REVIEW');
    expect(() => generateCharacterBibleAssetPackRound({ state: withAnchor, falConfigured: false })).toThrow();
  });

  it('downstream generations use approved anchor in prompt compilation', () => {
    const { state, snapshot } = seedWithApprovedAnchor();
    const authority = resolveActiveCastingReferenceAuthority(state)!;
    const contract = compileAnchorDependentBiblePromptContract({
      snapshot,
      decomposition: state.founderReferences[0]!.decomposition!,
      authority,
      authoritySnapshot: state.visualAuthoritySnapshot!,
      approvedAnchor: state.canonicalAnchor!,
      assetSlot: 'FRONT_VIEW',
    });
    expect(promptUsesApprovedAnchor(contract)).toBe(true);
    expect(contract.sections.approvedAnchorBlock).toContain('APPROVED CANONICAL ANCHOR');
    expect(legacyPromptWouldDominate(contract)).toBe(false);
  });

  it('generates anchor-dependent Bible pack with all required view slots', () => {
    const { state } = seedWithApprovedAnchor();
    const next = generateAnchorDependentCharacterBiblePackRound({ state, falConfigured: false, dispatchFal: false });
    const round = next.rounds.at(-1)!;
    expect(round.generationMode).toBe('CHARACTER_BIBLE_ASSET_PACK');
    expect(round.canonicalAnchorId).toBe(next.canonicalAnchor?.anchorId);
    const roundCandidates = next.candidates.filter((entry) => entry.roundId === round.roundId);
    expect(roundCandidates.length).toBe(CHARACTER_BIBLE_ASSET_SLOTS.length);
    expect(roundCandidates.some((entry) => entry.assetSlot === 'FRONT_VIEW')).toBe(true);
    expect(roundCandidates.some((entry) => entry.assetSlot === 'WARDROBE_DOCUMENTATION_SHEET')).toBe(true);
    expect(roundCandidates.some((entry) => entry.assetSlot === 'ENVIRONMENT_REFERENCE_SET')).toBe(true);
  });

  it('drift QA evaluates identity and wardrobe continuity categories', () => {
    const { state } = seedWithApprovedAnchor();
    const evaluation = evaluateCharacterContinuityDrift({
      state,
      sourceReferenceUrl: 'https://example.test/full-look.webp',
      candidatePreviewUrl: '/api/placeholder/casting/bible-1',
      assetSlot: 'WARDROBE_DOCUMENTATION_SHEET',
      anchorPreviewUrl: state.canonicalAnchor?.previewUrl,
    });
    expect(evaluation.categoryScores.IDENTITY_MATCH).toBeGreaterThan(0.7);
    expect(evaluation.categoryScores.WARDROBE_MATCH).toBeGreaterThan(0.7);
    expect(evaluation.categoryScores.SAME_WOMAN_CONFIDENCE).toBeGreaterThan(0.7);
  });

  it('wardrobe sheet view contract is documentation-first not restyle', () => {
    const contract = buildCharacterBibleViewContract('WARDROBE_DOCUMENTATION_SHEET');
    expect(contract.sameOutfitRule).toContain('Document actual uploaded outfit');
    expect(contract.negativeConstraints.some((entry) => entry.includes('new fashion concept'))).toBe(true);
  });

  it('environment set remains within same environment family contract', () => {
    const contract = buildCharacterBibleViewContract('ENVIRONMENT_REFERENCE_SET');
    expect(contract.sameEnvironmentFamilyRule).toContain('EnvironmentLock');
    expect(contract.negativeConstraints.some((entry) => entry.includes('different environment'))).toBe(true);
  });

  it('optional supporting references are supported but not required', () => {
    let state = buildEmptyVisualCastingState();
    for (const role of OPTIONAL_SUPPORTING_REFERENCE_ROLES) {
      state = uploadFounderCastingReference(state, {
        previewUrl: `https://example.test/${role}.webp`,
        storagePath: `${role}.webp`,
        role,
      });
    }
    expect(state.founderReferences.length).toBe(OPTIONAL_SUPPORTING_REFERENCE_ROLES.length);
    const { state: fullLookOnly } = seedCastingStateWithFullLook();
    expect(fullLookOnly.founderReferences.some((entry) => entry.role === 'FULL_LOOK')).toBe(true);
  });

  it('preserves source anchor pack lineage non-destructively', () => {
    const { state } = seedWithApprovedAnchor();
    const withPack = generateAnchorDependentCharacterBiblePackRound({ state, falConfigured: false, dispatchFal: false });
    expect(withPack.visualCastingLineage.some((entry) => entry.kind === 'DECOMPOSITION_LOCKS')).toBe(true);
    expect(withPack.visualCastingLineage.some((entry) => entry.kind === 'CANONICAL_ANCHOR_GENERATION')).toBe(true);
    expect(withPack.visualCastingLineage.some((entry) => entry.kind === 'ANCHOR_APPROVAL')).toBe(true);
    expect(withPack.visualCastingLineage.some((entry) => entry.kind === 'BIBLE_PACK_GENERATION')).toBe(true);
  });

  it('prior casting history and brand canon remain intact', () => {
    const { state } = seedCastingStateWithFullLook();
    const withAnchor = generateCanonicalAnchorRound({ state, falConfigured: false, dispatchFal: false });
    expect(withAnchor.rounds.length).toBeGreaterThan(0);
    expect(brandCharacterImmutable()).toBe(true);
    expect(brandCanonUnchanged()).toBe(true);
  });

  it('migrates legacy state without identity anchor fields', () => {
    const legacy = buildEmptyVisualCastingState();
    const migrated = migrateIdentityAnchorState(legacy);
    expect(migrated.anchorWorkflowStage).toBe('CANONICAL_ANCHOR_PENDING');
    expect(migrated.continuityDriftEvaluations).toEqual([]);
  });

  it('stores anchor-dependent prompt snapshots for downstream assets', () => {
    const { state } = seedWithApprovedAnchor();
    const next = generateAnchorDependentCharacterBiblePackRound({ state, falConfigured: false, dispatchFal: false });
    const candidate = next.candidates.at(-1)!;
    const stored = resolveStoredPromptContract(next, candidate.promptSnapshotId);
    expect(stored?.sections.identityLockBlock).toContain('IDENTITY LOCK');
    expect(stored?.sections.approvedAnchorBlock).toContain('APPROVED CANONICAL ANCHOR');
  });

  it('casting page exposes anchor-first workflow UI', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectCharacterCastingPage.tsx'), 'utf8');
    expect(page).toContain('GENERATE CANONICAL ANCHOR');
    expect(page).toContain('APPROVE ANCHOR');
    expect(page).toContain('GENERATE CHARACTER BIBLE PACK');
    expect(page).toContain('AUTHORITY LOCKS');
    expect(page).toContain('ANCHOR REVIEW');
  });
});
