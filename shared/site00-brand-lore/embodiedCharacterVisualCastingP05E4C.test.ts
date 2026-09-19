/**
 * P0.5E.4C — I KNOW HER state transition + visual casting tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildNdxFounderCharacterDiscoveryRun } from './ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import { ndxApplyCalibrationReaction, ndxGetHumanReadableSynthesis } from './ndxEmbodiedCharacterFounderDiscovery/ndxCalibrationAdapter.js';
import { evaluateNdxFounderCharacterCastingReadiness } from './ndxEmbodiedCharacterFounderDiscovery/ndxCastingReadinessBridge.js';
import { evaluateExtendedHumanity } from '../site00-studio-world-production/embodiedCharacterFounderDiscovery/humanityEvaluation.js';
import {
  buildCharacterTruthSnapshot,
  founderConfirmedDistinctFromInference,
  promoteFounderRecognition,
  generateCastingRoundPlaceholders,
  applyCastingJudgment,
  createCastingMergeRequest,
  deriveNextRoundTraitsFromFeedback,
  generateNextCastingRoundFromFeedback,
  generateFinalIdentityConfirmationRound,
  lockFinalVisualIdentity,
  mergeDoesNotBlindlyAverageFaces,
  buildInitialCastingPromptMatrix,
  promptContractsShareCharacterTruth,
  compileCastingPromptFromContract,
  applyCastingGenerationResults,
  applyCastingGenerationFailure,
  prepareCastingRoundForFalRetry,
  buildEmptyVisualCastingState,
  discoveryShouldShowRecognizedNotCalibration,
  DEFAULT_CASTING_CANDIDATE_COUNT,
} from '../site00-studio-world-production/characterVisualCasting/index.js';
import {
  initializeFounderCharacterDiscoveryRoom,
  saveFounderCharacterRecognition,
  getFounderCharacterDiscoveryState,
  getFounderCharacterCalibrationSynthesis,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';
import {
  resetFounderCharacterDiscoveryMemory,
  resetFounderCharacterDiscoveryStoreModeCache,
  saveFounderCharacterDiscoveryRun,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js';
import { generateVisualCastingRound, retryVisualCastingRoundFal } from '../../api/_lib/site00Evolve/characterVisualCasting/characterVisualCastingService.js';
import {
  castingRoundNeedsFalRetry,
  isCastingPlaceholderPreviewUrl,
  castingFalGenerationInProgress,
  castingFalGenerationFailed,
} from '../site00-studio-world-production/characterVisualCasting/client.js';

const ROOT = join(process.cwd());

function humanityFor(run: ReturnType<typeof buildNdxFounderCharacterDiscoveryRun>) {
  return evaluateExtendedHumanity({
    contradictions: run.contradictions,
    flawProfile: run.flawProfile,
    intelligenceMap: run.intelligenceMap,
    relationships: run.relationships,
    culturalBoundaries: run.culturalBoundaries,
    publicPrivate: run.publicPrivate,
    privateHumanityPresent: run.flawProfile.procrastinates.length > 0,
  });
}

const CALIBRATION_GATE_INTERACTION_IDS = [
  'cal-scenario-ndx-wrong-receipt',
  'cal-contradiction-nosy-respectful',
  'cal-flaw-confirmation-bias',
  'cal-intelligence-cultural-memory',
  'cal-voice-misleading-viral',
  'cal-book-not-finished',
  'cal-visual-cluster',
] as const;

async function completeCalibration(run: ReturnType<typeof buildNdxFounderCharacterDiscoveryRun>) {
  let next = run;
  for (const interactionId of CALIBRATION_GATE_INTERACTION_IDS) {
    ({ run: next } = ndxApplyCalibrationReaction(next, { interactionId, reaction: 'YES_THATS_HER' }));
  }
  return next;
}

describe('P0.5E.4C visual casting + I KNOW HER transition', () => {
  beforeEach(() => {
    resetFounderCharacterDiscoveryStoreModeCache();
    resetFounderCharacterDiscoveryMemory();
  });

  it('synthesis readiness no longer requires YES I KNOW HER pre-synthesis', async () => {
    let run = buildNdxFounderCharacterDiscoveryRun();
    run = await completeCalibration(run);
    const readiness = evaluateNdxFounderCharacterCastingReadiness({ run, humanityEvaluation: humanityFor(run) });
    expect(readiness.readyForCharacterSynthesis).toBe(true);
    expect(readiness.founderKnowsHer).toBe(false);
    expect(readiness.blockingGates).not.toContain('founder_i_know_her');
  });

  it('YES I KNOW HER with character read promotes to visual casting (not calibration loop)', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    let run = (await getFounderCharacterDiscoveryState({ projectId: 'ndxbook' }))!;
    run = await completeCalibration(run);
    run = {
      ...run,
      humanReadableSynthesis: ndxGetHumanReadableSynthesis(run),
    };
    await saveFounderCharacterDiscoveryRun(run);

    const result = await saveFounderCharacterRecognition({
      projectId: 'ndxbook',
      response: 'YES_I_KNOW_HER',
      sourceRoute: '/projects/ndxbook/character/discovery',
    });

    expect(result.run.founderRecognition.response).toBe('YES_I_KNOW_HER');
    expect(result.run.visualCastingState?.founderIKnowHerConfirmed).toBe(true);
    expect(result.run.visualCastingState?.characterTruthLockedForCasting).toBe(true);
    expect(result.redirectToCasting).toBe(true);
    expect(result.run.visualCastingState?.truthSnapshots.length).toBe(1);

    const reloaded = await getFounderCharacterDiscoveryState({ projectId: 'ndxbook' });
    expect(reloaded?.visualCastingState?.recognitionConfirmed?.founderAction).toBe('YES_I_KNOW_HER');
  });

  it('CharacterTruthSnapshot separates founder-confirmed and inferred truth', async () => {
    let run = buildNdxFounderCharacterDiscoveryRun();
    run = await completeCalibration(run);
    const snapshot = buildCharacterTruthSnapshot({ run, version: 1 });
    expect(founderConfirmedDistinctFromInference(snapshot)).toBe(true);
    expect(snapshot.founderConfirmedTruths.length).toBeGreaterThan(0);
    expect(snapshot.systemInferences.length).toBeGreaterThan(0);
  });

  it('casting page route exists and discovery recognition navigates to casting path in code', () => {
    const routes = readFileSync(join(ROOT, 'src/site00/config/routes.ts'), 'utf8');
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectFounderCharacterDiscoveryPage.tsx'), 'utf8');
    expect(routes).toContain('projectCharacterCasting');
    expect(routes).toContain('/character/casting');
    expect(page).toContain('redirectToCasting');
    expect(page).toContain('site00ProjectCharacterCastingPath');
    expect(page).not.toContain("goToSection: 'CASTING'");
  });

  it('casting generation is founder-triggered only — not on load', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectCharacterCastingPage.tsx'), 'utf8');
    const mountBlock = page.match(/useEffect\(\(\) => \{[\s\S]*?\}, \[reload\]\);/)?.[0] ?? '';
    expect(mountBlock).not.toMatch(/characterVisualCastingGenerate/);
    expect(page).toContain('GENERATE FIRST CASTING ROUND');
    expect(page).not.toMatch(/characterVisualCastingGenerate\(projectSlug,\s*false\)/);
  });

  it('initial casting round supports six candidates with shared truth prompt matrix', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const snapshot = buildCharacterTruthSnapshot({ run, version: 1, lockedForCasting: true });
    const matrix = buildInitialCastingPromptMatrix(snapshot);
    expect(matrix).toHaveLength(6);
    expect(promptContractsShareCharacterTruth(matrix)).toBe(true);

    let state = buildEmptyVisualCastingState();
    state = {
      ...state,
      visualCastingReady: true,
      truthSnapshots: [snapshot],
      activeTruthSnapshotId: snapshot.snapshotId,
    };
    const after = generateCastingRoundPlaceholders({ state, falConfigured: false, dispatchFal: false });
    expect(after.candidates.filter((c) => c.roundId === after.rounds.at(-1)!.roundId)).toHaveLength(
      DEFAULT_CASTING_CANDIDATE_COUNT,
    );
    expect(after.falVideoRequests).toBe(0);
  });

  it('founder judgments refine next round and merge preserves traits', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const snapshot = buildCharacterTruthSnapshot({ run, version: 1, lockedForCasting: true });
    let state = buildEmptyVisualCastingState();
    state = {
      ...state,
      visualCastingReady: true,
      truthSnapshots: [snapshot],
      activeTruthSnapshotId: snapshot.snapshotId,
    };
    state = generateCastingRoundPlaceholders({ state, falConfigured: false });
    const first = state.candidates[0]!;
    state = applyCastingJudgment({ state, candidateId: first.candidateId, judgment: 'RIGHT_FACE_WRONG_ENERGY' });
    const feedback = deriveNextRoundTraitsFromFeedback(state);
    expect(feedback.retainedTraits).toContain('FACE');
    expect(feedback.variedTraits.length).toBeGreaterThan(0);

    state = createCastingMergeRequest({
      state,
      candidateIds: state.candidates.slice(0, 2).map((c) => c.candidateId),
      retainFromEach: {
        [state.candidates[0]!.candidateId]: ['FACE'],
        [state.candidates[1]!.candidateId]: ['PRESENCE'],
      },
    });
    const merge = state.mergeRequests.at(-1)!;
    expect(mergeDoesNotBlindlyAverageFaces(merge)).toBe(true);

    state = generateNextCastingRoundFromFeedback({ state, falConfigured: false });
    expect(state.rounds.length).toBe(2);
  });

  it('THATS HER triggers final identity confirmation and LOCK HER sets reference pack ready', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const snapshot = buildCharacterTruthSnapshot({ run, version: 1, lockedForCasting: true });
    let state = buildEmptyVisualCastingState();
    state = {
      ...state,
      visualCastingReady: true,
      truthSnapshots: [snapshot],
      activeTruthSnapshotId: snapshot.snapshotId,
    };
    state = generateCastingRoundPlaceholders({ state, falConfigured: false });
    const candidateId = state.candidates[0]!.candidateId;
    state = applyCastingJudgment({ state, candidateId, judgment: 'THATS_HER' });
    expect(state.selectedCandidateId).toBe(candidateId);
    state = generateFinalIdentityConfirmationRound(state);
    expect(state.finalIdentityConfirmationRoundId).toBeTruthy();
    state = lockFinalVisualIdentity(state);
    expect(state.finalVisualIdentityApproved).toBe(true);
    expect(state.characterReferencePackReady).toBe(true);
    expect(state.continuityTestReady).toBe(true);
  });

  it('returning after confirmation shows recognized state not calibration restart', () => {
    const state = {
      ...buildEmptyVisualCastingState(),
      founderIKnowHerConfirmed: true,
      reopenCalibrationAcknowledged: false,
    };
    expect(discoveryShouldShowRecognizedNotCalibration(state)).toBe(true);
  });

  it('voice state preserved on visual casting promotion', async () => {
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    let run = (await getFounderCharacterDiscoveryState({ projectId: 'ndxbook' }))!;
    const voiceBefore = run.voiceCalibrationState;
    run = { ...run, humanReadableSynthesis: ndxGetHumanReadableSynthesis(run) };
    const promoted = promoteFounderRecognition({
      run,
      response: 'YES_I_KNOW_HER',
      sourceRoute: '/test',
      falConfigured: false,
    });
    expect(promoted.run.voiceCalibrationState).toEqual(voiceBefore);
  });

  it('compileCastingPromptFromContract produces provider-ready prompt text', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const snapshot = buildCharacterTruthSnapshot({ run, version: 1, lockedForCasting: true });
    const contract = buildInitialCastingPromptMatrix(snapshot)[0]!;
    const compiled = compileCastingPromptFromContract(contract);
    expect(compiled.prompt.length).toBeGreaterThan(100);
    expect(compiled.negativePrompt).toContain('generic AI influencer');
  });

  it('applyCastingGenerationResults marks round review-ready with preview URLs', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const snapshot = buildCharacterTruthSnapshot({ run, version: 1, lockedForCasting: true });
    let state = buildEmptyVisualCastingState();
    state = {
      ...state,
      visualCastingReady: true,
      truthSnapshots: [snapshot],
      activeTruthSnapshotId: snapshot.snapshotId,
    };
    state = generateCastingRoundPlaceholders({ state, falConfigured: true, dispatchFal: true });
    const roundId = state.rounds.at(-1)!.roundId;
    const candidates = state.candidates.filter((c) => c.roundId === roundId);
    expect(state.castingCandidatesReady).toBe(false);

    state = applyCastingGenerationResults({
      state,
      roundId,
      results: candidates.map((candidate, index) => ({
        candidateId: candidate.candidateId,
        previewUrl: `https://example.test/candidate-${index + 1}.webp`,
        outputAssetId: `site00/character-casting/test/${candidate.candidateId}.webp`,
        model: 'openai/gpt-image-2',
      })),
      model: 'openai/gpt-image-2',
    });

    expect(state.castingCandidatesReady).toBe(true);
    expect(state.rounds.at(-1)?.status).toBe('REVIEW_READY');
    expect(state.candidates.filter((c) => c.roundId === roundId).every((c) => c.previewUrl?.startsWith('https://'))).toBe(true);
  });

  it('generateVisualCastingRound dispatches FAL when configured (vitest mock)', async () => {
    process.env.FAL_KEY = 'vitest-key';
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    let run = (await getFounderCharacterDiscoveryState({ projectId: 'ndxbook' }))!;
    run = await completeCalibration(run);
    run = { ...run, humanReadableSynthesis: ndxGetHumanReadableSynthesis(run) };
    run = promoteFounderRecognition({
      run,
      response: 'YES_I_KNOW_HER',
      sourceRoute: '/test',
      falConfigured: true,
    }).run;
    await saveFounderCharacterDiscoveryRun(run);

    run = await generateVisualCastingRound({ projectId: 'ndxbook', dispatchFal: true });
    expect(run.visualCastingState?.castingCandidatesReady).toBe(true);
    const latest = run.visualCastingState?.candidates.filter(
      (c) => c.roundId === run.visualCastingState?.rounds.at(-1)?.roundId,
    );
    expect(latest?.every((c) => c.previewUrl?.includes('vitest.local'))).toBe(true);
  });

  it('detects placeholder rounds and retries FAL dispatch for existing candidates', async () => {
    process.env.FAL_KEY = 'vitest-key';
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    let run = (await getFounderCharacterDiscoveryState({ projectId: 'ndxbook' }))!;
    run = await completeCalibration(run);
    run = { ...run, humanReadableSynthesis: ndxGetHumanReadableSynthesis(run) };
    run = promoteFounderRecognition({
      run,
      response: 'YES_I_KNOW_HER',
      sourceRoute: '/test',
      falConfigured: false,
    }).run;
    await saveFounderCharacterDiscoveryRun(run);
    run = await generateVisualCastingRound({ projectId: 'ndxbook', dispatchFal: false });
    const roundId = run.visualCastingState?.rounds.at(-1)?.roundId;
    expect(roundId).toBeTruthy();
    expect(castingRoundNeedsFalRetry(run.visualCastingState!, roundId)).toBe(true);
    expect(isCastingPlaceholderPreviewUrl(run.visualCastingState?.candidates[0]?.previewUrl)).toBe(true);

    run = await retryVisualCastingRoundFal({ projectId: 'ndxbook', roundId });
    expect(run.visualCastingState?.castingCandidatesReady).toBe(true);
    const latest = run.visualCastingState?.candidates.filter((c) => c.roundId === roundId);
    expect(latest?.every((c) => c.previewUrl?.includes('vitest.local'))).toBe(true);
    expect(castingRoundNeedsFalRetry(run.visualCastingState!, roundId)).toBe(false);
  });

  it('prepareCastingRoundForFalRetry clears placeholders and marks round generating', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const snapshot = buildCharacterTruthSnapshot({ run, version: 1, lockedForCasting: true });
    let state = buildEmptyVisualCastingState();
    state = {
      ...state,
      visualCastingReady: true,
      truthSnapshots: [snapshot],
      activeTruthSnapshotId: snapshot.snapshotId,
    };
    state = generateCastingRoundPlaceholders({ state, falConfigured: false, dispatchFal: false });
    const roundId = state.rounds.at(-1)!.roundId;
    state = prepareCastingRoundForFalRetry({ state, roundId, falConfigured: true });
    expect(state.castingCandidatesReady).toBe(false);
    expect(state.rounds.at(-1)?.status).toBe('GENERATING');
    expect(state.candidates.filter((c) => c.roundId === roundId).every((c) => c.previewUrl === null)).toBe(true);
  });

  it('castingFalGenerationInProgress tracks generating rounds and failures', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const snapshot = buildCharacterTruthSnapshot({ run, version: 1, lockedForCasting: true });
    let state = buildEmptyVisualCastingState();
    state = {
      ...state,
      visualCastingReady: true,
      truthSnapshots: [snapshot],
      activeTruthSnapshotId: snapshot.snapshotId,
    };
    state = generateCastingRoundPlaceholders({ state, falConfigured: true, dispatchFal: true });
    expect(castingFalGenerationInProgress(state)).toBe(true);

    state = applyCastingGenerationFailure({
      state,
      roundId: state.rounds.at(-1)!.roundId,
      errorMessage: 'tunnel dropped',
    });
    expect(castingFalGenerationFailed(state)).toBe(true);
    expect(castingFalGenerationInProgress(state)).toBe(false);
  });
});
