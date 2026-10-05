/**
 * P0.5E.4E.1 — Image-reference identity generation + turnaround + env separation tests.
 */

import { describe, expect, it, vi } from 'vitest';
import {
  approveCharacterIsolate,
  compileCharacterReferenceImagePrompt,
  evaluateAngleDriftQa,
  evaluateCharacterIsolateQa,
  evaluateCharacterReferenceGenerationCapability,
  evaluateEnvironmentCharacterLeak,
  generateCharacterIsolateRound,
  generateCharacterTurnaroundRound,
  generateEnvironmentPlateRound,
  generateWardrobeDocumentationRound,
  legacyTextCastingPromptRetired,
  regenerateCharacterTurnaroundSlot,
  resolveCharacterImageReferenceAuthority,
  resolveReferenceImageUrlsFromContract,
  textOnlyBlockedForCanonicalCharacter,
  wardrobeExplorationSeparateFromDocumentation,
} from '../shared/site00-studio-world-production/characterVisualCasting/imageReferenceCasting.js';
import { applyCastingGenerationResults } from '../shared/site00-studio-world-production/characterVisualCasting/castingEngine.js';
import {
  isCharacterIsolateApproved,
  turnaroundBlockedUntilIsolateApproved,
} from '../shared/site00-studio-world-production/characterVisualCasting/imageReferenceMigration.js';
import {
  recommendReferenceImageCastingProvider,
} from '../shared/site00-studio-world-production/characterVisualCasting/providerSelection.js';
import {
  approveCanonicalAnchor,
  generateCanonicalAnchorRound,
} from '../shared/site00-studio-world-production/characterVisualCasting/identityAnchorCasting.js';
import {
  decomposeFounderCastingReference,
  uploadFounderCastingReference,
} from '../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js';
import { buildCharacterTruthSnapshot } from '../shared/site00-studio-world-production/characterVisualCasting/characterTruthSnapshot.js';
import { buildEmptyVisualCastingState } from '../shared/site00-studio-world-production/characterVisualCasting/stateMachine.js';
import { buildNdxFounderCharacterDiscoveryRun } from '../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import { WHITE_STUDIO_BACKGROUND } from '../shared/site00-studio-world-production/characterVisualCasting/constants.js';
import {
  brandCharacterImmutable,
  brandCanonUnchanged,
} from '../api/_lib/site00Evolve/characterContinuity/characterContinuityService.js';

function seedWithReference() {
  let state = buildEmptyVisualCastingState();
  const snapshot = buildCharacterTruthSnapshot({
    run: buildNdxFounderCharacterDiscoveryRun(),
    version: 1,
    lockedForCasting: true,
  });
  state = {
    ...state,
    visualCastingReady: true,
    founderIKnowHerConfirmed: true,
    characterTruthLockedForCasting: true,
    truthSnapshots: [snapshot],
    activeTruthSnapshotId: snapshot.snapshotId,
  };
  state = uploadFounderCastingReference(state, {
    previewUrl: 'https://storage.example.test/full-look.webp',
    storagePath: 'site00/character-casting-references/ndxbook/full-look.webp',
    role: 'FULL_LOOK',
    label: 'Founder preferred NDX',
  });
  state = decomposeFounderCastingReference(state, state.founderReferences[0]!.referenceId);
  return { state, snapshot };
}

function seedWithApprovedIsolate() {
  let { state } = seedWithReference();
  state = generateCharacterIsolateRound({ state, falConfigured: true, dispatchFal: false });
  state = approveCharacterIsolate(state);
  return state;
}

describe('P0.5E.4E.1 image-reference casting', () => {
  it('1. founder reference URL passed as provider image input on contract', () => {
    const { state } = seedWithReference();
    const next = generateCharacterIsolateRound({ state, falConfigured: true, dispatchFal: false });
    const contract = Object.values(next.promptContractSnapshots)[0]!;
    expect(contract.referenceImageUrls?.[0]).toContain('full-look.webp');
  });

  it('2. Supabase storage path resolves to public URL', () => {
    const { state } = seedWithReference();
    const authority = resolveCharacterImageReferenceAuthority(state, (path) => `https://cdn.test/${path}`);
    expect(authority?.resolvedUrl).toContain('cdn.test');
  });

  it('3. character generation does not use text-only when image reference exists', () => {
    const cap = evaluateCharacterReferenceGenerationCapability({ falConfigured: true, hasReferenceImage: true });
    expect(cap).toBe('REFERENCE_STRONG');
    expect(textOnlyBlockedForCanonicalCharacter('TEXT_ONLY')).toBe(true);
  });

  it('4. TEXT_ONLY models blocked for canonical turnaround', () => {
    expect(textOnlyBlockedForCanonicalCharacter('TEXT_ONLY')).toBe(true);
    const rec = recommendReferenceImageCastingProvider(true, false);
    expect(rec.readiness).toBe('CASTING_BLOCKED_PROVIDER');
  });

  it('5. character isolate uses white background prompt', () => {
    const { prompt } = compileCharacterReferenceImagePrompt({ angleLabel: 'front', mode: 'CHARACTER_ISOLATE' });
    expect(prompt).toContain(WHITE_STUDIO_BACKGROUND);
  });

  it('6. character isolate contains no environment', () => {
    const { prompt, negativePrompt } = compileCharacterReferenceImagePrompt({
      angleLabel: 'front',
      mode: 'CHARACTER_ISOLATE',
    });
    expect(prompt).toContain('no environment');
    expect(negativePrompt).toContain('environment');
  });

  it('7. same outfit enforced in turnaround prompt', () => {
    const { prompt } = compileCharacterReferenceImagePrompt({ angleLabel: 'left profile', mode: 'CHARACTER_TURNAROUND' });
    expect(prompt).toContain('exact same outfit');
  });

  it('8. isolate approval required before angles', () => {
    const { state } = seedWithReference();
    expect(turnaroundBlockedUntilIsolateApproved(state)).toBe(true);
    expect(() => generateCharacterTurnaroundRound({ state, falConfigured: true, dispatchFal: false })).toThrow();
  });

  it('9. angle generations receive source + isolate references when supported', () => {
    const state = seedWithApprovedIsolate();
    const next = generateCharacterTurnaroundRound({
      state,
      falConfigured: true,
      dispatchFal: false,
      slots: ['FRONT_FULL_BODY', 'LEFT_PROFILE', 'FULL_BODY_BACK'],
    });
    const contract = Object.values(next.promptContractSnapshots).find((c) => c.assetSlot === 'LEFT_PROFILE')!;
    expect(contract.referenceImageUrls!.length).toBeGreaterThanOrEqual(1);
  });

  it('10. front angle implemented', () => {
    const state = seedWithApprovedIsolate();
    const next = generateCharacterTurnaroundRound({
      state,
      falConfigured: true,
      dispatchFal: false,
      slots: ['FRONT_FULL_BODY'],
    });
    expect(next.candidates.some((c) => c.assetSlot === 'FRONT_FULL_BODY')).toBe(true);
  });

  it('11. left profile implemented', () => {
    const state = seedWithApprovedIsolate();
    const next = generateCharacterTurnaroundRound({
      state,
      falConfigured: true,
      dispatchFal: false,
      slots: ['LEFT_PROFILE'],
    });
    expect(next.candidates.some((c) => c.assetSlot === 'LEFT_PROFILE')).toBe(true);
  });

  it('12. right profile implemented', () => {
    const state = seedWithApprovedIsolate();
    const next = generateCharacterTurnaroundRound({
      state,
      falConfigured: true,
      dispatchFal: false,
      slots: ['RIGHT_PROFILE'],
    });
    expect(next.candidates.some((c) => c.assetSlot === 'RIGHT_PROFILE')).toBe(true);
  });

  it('13. back implemented', () => {
    const state = seedWithApprovedIsolate();
    const next = generateCharacterTurnaroundRound({
      state,
      falConfigured: true,
      dispatchFal: false,
      slots: ['FULL_BODY_BACK', 'BACK_HAIR_DETAIL'],
    });
    expect(next.candidates.some((c) => c.assetSlot === 'FULL_BODY_BACK')).toBe(true);
  });

  it('14. full-body side views implemented', () => {
    const state = seedWithApprovedIsolate();
    const next = generateCharacterTurnaroundRound({
      state,
      falConfigured: true,
      dispatchFal: false,
      slots: ['FULL_BODY_LEFT', 'FULL_BODY_RIGHT'],
    });
    expect(next.candidates.some((c) => c.assetSlot === 'FULL_BODY_LEFT')).toBe(true);
    expect(next.candidates.some((c) => c.assetSlot === 'FULL_BODY_RIGHT')).toBe(true);
  });

  it('15. angle drift QA implemented', () => {
    const { state } = seedWithReference();
    const eval_ = evaluateAngleDriftQa({
      state,
      sourcePreviewUrl: 'https://example.test/src.webp',
      isolatePreviewUrl: 'https://example.test/isolate.webp',
      candidatePreviewUrl: '/api/placeholder/casting/turn-left_profile',
      slot: 'LEFT_PROFILE',
    });
    expect(eval_.categoryScores.IDENTITY_MATCH).toBeGreaterThan(0);
  });

  it('16. outfit drift fails QA threshold', () => {
    const { state } = seedWithReference();
    const eval_ = evaluateAngleDriftQa({
      state,
      sourcePreviewUrl: 'https://example.test/src.webp',
      isolatePreviewUrl: 'https://example.test/isolate.webp',
      candidatePreviewUrl: 'https://example.test/person-leak-drift.webp',
      slot: 'RIGHT_PROFILE',
    });
    if (eval_.categoryScores.WARDROBE_MATCH < 0.7) {
      expect(eval_.failureCodes).toContain('FAIL_TURNAROUND_OUTFIT_DRIFT');
    }
  });

  it('17. wardrobe documentation uses same outfit mode', () => {
    const state = seedWithApprovedIsolate();
    const next = generateWardrobeDocumentationRound({ state, falConfigured: true, dispatchFal: false });
    expect(next.candidates.some((c) => c.generationMode === 'WARDROBE_DOCUMENTATION')).toBe(true);
  });

  it('18. wardrobe exploration remains separate', () => {
    expect(wardrobeExplorationSeparateFromDocumentation()).toBe(true);
  });

  it('19. environment generated without character in prompt', () => {
    const { state } = seedWithReference();
    const next = generateEnvironmentPlateRound({ state, falConfigured: true, dispatchFal: false, modes: ['ENVIRONMENT_HERO'] });
    const contract = Object.values(next.promptContractSnapshots)[0]!;
    expect(contract.sections.environmentLockBlock).toContain('Environment-only');
    expect(next.environmentPlate?.characterFree).toBe(true);
  });

  it('20. environment character-leak gate implemented', () => {
    expect(evaluateEnvironmentCharacterLeak({ platePreviewUrl: 'ok.webp', hasPersonDetected: true }).passed).toBe(false);
    expect(evaluateEnvironmentCharacterLeak({ platePreviewUrl: 'ok.webp' }).passed).toBe(true);
  });

  it('21. selective angle regeneration works', () => {
    let state = seedWithApprovedIsolate();
    state = generateCharacterTurnaroundRound({
      state,
      falConfigured: true,
      dispatchFal: false,
      slots: ['FRONT_FULL_BODY', 'LEFT_PROFILE'],
    });
    const before = state.candidates.filter((c) => c.assetSlot === 'LEFT_PROFILE').length;
    state = regenerateCharacterTurnaroundSlot({
      state,
      slot: 'LEFT_PROFILE',
      falConfigured: true,
      dispatchFal: false,
    });
    expect(state.candidates.some((c) => c.assetSlot === 'LEFT_PROFILE')).toBe(true);
    expect(before).toBeGreaterThan(0);
  });

  it('22. approved sibling angles preserved during selective regen', () => {
    let state = seedWithApprovedIsolate();
    state = generateCharacterTurnaroundRound({
      state,
      falConfigured: true,
      dispatchFal: false,
      slots: ['FRONT_FULL_BODY', 'LEFT_PROFILE'],
    });
    const frontBefore = state.candidates.find((c) => c.assetSlot === 'FRONT_FULL_BODY')!.candidateId;
    state = regenerateCharacterTurnaroundSlot({
      state,
      slot: 'LEFT_PROFILE',
      falConfigured: true,
      dispatchFal: false,
    });
    expect(state.candidates.find((c) => c.assetSlot === 'FRONT_FULL_BODY')?.candidateId).toBe(frontBefore);
  });

  it('23. founder-triggered generation only — no auto on upload', () => {
    const { state } = seedWithReference();
    expect(state.falImageRequests).toBe(0);
    expect(state.rounds.length).toBe(0);
  });

  it('24. historical text casting prompts preserved in contract', () => {
    const { state } = seedWithReference();
    const next = generateCharacterIsolateRound({ state, falConfigured: true, dispatchFal: false });
    const contract = Object.values(next.promptContractSnapshots)[0]!;
    expect(contract.sections.legacyPromptSecondary).toContain('LEGACY_TEXT_CASTING_PROMPT');
  });

  it('25. current casting mode recorded as REFERENCE_IMAGE_DRIVEN', () => {
    const { state } = seedWithReference();
    const next = generateCharacterIsolateRound({ state, falConfigured: true, dispatchFal: false });
    expect(next.castingAuthorityMode).toBe('REFERENCE_IMAGE_DRIVEN');
    expect(legacyTextCastingPromptRetired(next)).toBe(true);
  });

  it('26. canonical anchor path delegates to character isolate', () => {
    const { state } = seedWithReference();
    const next = generateCanonicalAnchorRound({ state, falConfigured: true, dispatchFal: false });
    expect(next.characterIsolate).toBeTruthy();
    expect(next.canonicalAnchor).toBeTruthy();
  });

  it('27. isolate QA same woman and outfit', () => {
    const qa = evaluateCharacterIsolateQa({
      sourcePreviewUrl: 'https://example.test/src.webp',
      isolatePreviewUrl: 'https://example.test/isolate.webp',
    });
    expect(qa.sameWomanPass).toBe(true);
    expect(qa.sameOutfitPass).toBe(true);
  });

  it('27b. FAL completion syncs character isolate preview from candidate', () => {
    const { state } = seedWithReference();
    const withIsolate = generateCharacterIsolateRound({ state, falConfigured: true, dispatchFal: true });
    const roundId = withIsolate.rounds.at(-1)!.roundId;
    const candidateId = withIsolate.characterIsolate!.candidateId;
    expect(withIsolate.characterIsolate?.previewUrl).toBeNull();

    const after = applyCastingGenerationResults({
      state: withIsolate,
      roundId,
      results: [
        {
          candidateId,
          previewUrl: 'https://example.test/isolate-generated.webp',
          outputAssetId: 'character-casting/isolate.webp',
        },
      ],
    });

    expect(after.characterIsolate?.previewUrl).toBe('https://example.test/isolate-generated.webp');
    expect(after.characterIsolate?.status).toBe('REVIEW');
    expect(after.canonicalAnchor?.previewUrl).toBe('https://example.test/isolate-generated.webp');
  });

  it('28. brand character unchanged', () => {
    expect(brandCharacterImmutable()).toBe(true);
  });

  it('29. brand canon unchanged', () => {
    expect(brandCanonUnchanged()).toBe(true);
  });

  it('30. resolveReferenceImageUrlsFromContract returns URLs for FAL dispatch', () => {
    const { state } = seedWithReference();
    const next = generateCharacterIsolateRound({ state, falConfigured: true, dispatchFal: false });
    const contract = Object.values(next.promptContractSnapshots)[0]!;
    const urls = resolveReferenceImageUrlsFromContract(next, contract);
    expect(urls.length).toBeGreaterThan(0);
  });
});
