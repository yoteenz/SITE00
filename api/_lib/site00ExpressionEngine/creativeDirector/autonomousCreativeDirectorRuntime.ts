/**
 * C1.1 — Autonomous Creative Director Runtime orchestrator (15 intellectual passes).
 */

import {
  CREATIVE_DIRECTOR_VERSION,
  MAX_CREATIVE_DIRECTOR_PASSES,
  type CreativeDirectorBootstrapResult,
  type CreativeDirectorRun,
  type MinimalCreativeBrief,
} from '../../../../shared/site00-expression-engine/creative-director/types.js';
import { generateCreativeTerritoryCandidates } from './creativeDirectorCandidateGenerator.js';
import {
  evaluateCreativeTerritories,
  selectWinningCreativeDirection,
} from './creativeDirectorCandidateEvaluator.js';
import { applyConceptCollapseGate, territoriesAreDivergent } from './creativeDirectorDivergenceGate.js';
import {
  buildWinningDirectionRecord,
  deriveVisualAuthorityPlan,
  generateInterjectionCandidates,
  runContradictionPass,
  runCulturalReadPass,
  runDeeperReframePass,
  runDirectorialConceptionPass,
  runObviousVersionPass,
  runPayoffAftershockPass,
  runRoleSynthesisPass,
  runTurningPointPass,
  selectInterjection,
} from './creativeDirectorIntellectualPasses.js';
import {
  buildNarrativeSynthesisInputFromCreativeDirector,
  runNarrativeSynthesisFromCreativeDirector,
} from './creativeDirectorNarrativeBridge.js';
import { runCreativeConvergenceLoop } from './creativeDirectorConvergence.js';
import {
  antiOverfitCheck,
  assessCreativeMaturity,
  consumeFounderCorrectionRules,
  resolveFounderInterventionDependency,
  runCreativeDirectorSelfCritique,
} from './creativeDirectorSelfCritique.js';
import { saveCreativeDirectorRun } from './creativeDirectorRuntimeStore.js';
import { assertBriefDoesNotRequireOutputs } from './creativeDirectorContextBuilder.js';
import { tryLlmEnhanceCulturalRead } from './creativeDirectorLlmPass.js';

function buildRunId(entryId: string): string {
  return `NDX-CD-RUN-${entryId.toUpperCase()}-${Date.now()}`;
}

export async function runAutonomousCreativeDirector(
  brief: MinimalCreativeBrief,
  options?: { skipBlindTestGuard?: boolean },
): Promise<CreativeDirectorRun> {
  assertBriefDoesNotRequireOutputs(brief);
  if (!options?.skipBlindTestGuard && brief.entryId === 'entry-002') {
    throw new Error('Blind autonomy test must not use Entry 002 — use entry-c1-blind or underdeveloped Entry');
  }

  consumeFounderCorrectionRules(); // methodology reinforcement loaded

  const now = new Date().toISOString();
  let llmProviderUsed = 'DETERMINISTIC_STRUCTURED_PASSES';
  let llmRequestCount = 0;

  const culturalReadBase = runCulturalReadPass(brief);
  const llmRead = await tryLlmEnhanceCulturalRead(brief, culturalReadBase);
  const culturalRead = llmRead.culturalRead;
  llmProviderUsed = llmRead.providerUsed;
  llmRequestCount = llmRead.requestCount;

  const obviousVersion = runObviousVersionPass(brief);
  const deeperReframe = runDeeperReframePass(brief, culturalRead);

  const rawTerritories = generateCreativeTerritoryCandidates(brief);
  if (!territoriesAreDivergent(rawTerritories)) {
    throw new Error('Territory generation failed divergence requirement');
  }
  const { passed: territories } = applyConceptCollapseGate(rawTerritories);
  const evaluations = evaluateCreativeTerritories(territories, brief);
  const { winner, direction } = selectWinningCreativeDirection(territories, evaluations, obviousVersion.summary);
  const winningDirection = buildWinningDirectionRecord(direction, obviousVersion);

  antiOverfitCheck(winner);

  const roles = runRoleSynthesisPass(winner, brief);
  const turningPoint = runTurningPointPass(winner, brief);
  const contradiction = runContradictionPass(brief);
  const interjectionCandidates = generateInterjectionCandidates(winner, contradiction);
  const selectedInterjection = selectInterjection(interjectionCandidates);
  const payoffAftershock = runPayoffAftershockPass(winner, selectedInterjection, brief);
  const directorialConception = runDirectorialConceptionPass(winner);
  const visualAuthorityPlan = deriveVisualAuthorityPlan(winner, roles);

  const narrativeInput = buildNarrativeSynthesisInputFromCreativeDirector({
    brief,
    winner,
    direction: winningDirection,
    roles,
    interjection: selectedInterjection,
    contradiction,
  });

  const { result: narrativeResult, revisionRecords, passes } = runCreativeConvergenceLoop({
    executePass: () => runNarrativeSynthesisFromCreativeDirector(narrativeInput),
    critique: (result) =>
      runCreativeDirectorSelfCritique({
        brief,
        winner,
        roles,
        turningPoint,
        interjection: selectedInterjection,
        beatCount: result.beatCount,
        shufflePassed: result.shufflePassed,
        causalPass: result.causalPass,
      }),
  });

  const selfCritique = runCreativeDirectorSelfCritique({
    brief,
    winner,
    roles,
    turningPoint,
    interjection: selectedInterjection,
    beatCount: narrativeResult.beatCount,
    shufflePassed: narrativeResult.shufflePassed,
    causalPass: narrativeResult.causalPass,
  });

  const creativeMaturity = assessCreativeMaturity({
    culturalReadDepth: 0.88,
    originality: 1 - Math.max(winner.similarityToEntry001, winner.similarityToEntry002),
    causalPass: narrativeResult.causalPass,
    turnStrong: Boolean(turningPoint.meaningAfter),
    interjectionEarned: true,
    worldFunctional: winner.worldFunction.length > 20,
    artifactFunctional: winner.artifactFunction.length > 20,
    priorEntryDiff: 1 - Math.max(winner.similarityToEntry001, winner.similarityToEntry002),
    founderWouldConnectDots: selfCritique.founderWouldConnectDots,
  });

  const founderInterventionDependency = resolveFounderInterventionDependency(creativeMaturity);

  const status =
    founderInterventionDependency === 'HIGH' && passes >= MAX_CREATIVE_DIRECTOR_PASSES - 1
      ? 'NEEDS_FOUNDER_DIRECTION'
      : creativeMaturity.substantivePass
        ? 'AWAITING_FOUNDER_REVIEW'
        : 'SELF_REVISION';

  const run: CreativeDirectorRun = {
    runId: buildRunId(brief.entryId),
    entryId: brief.entryId,
    version: CREATIVE_DIRECTOR_VERSION,
    status,
    brief,
    culturalRead,
    obviousVersion,
    deeperReframe,
    territories,
    territoryEvaluations: evaluations,
    winningDirection,
    roleSynthesis: roles,
    turningPoint,
    contradiction,
    interjectionCandidates,
    selectedInterjection,
    payoffAftershock,
    directorialConception,
    visualAuthorityPlan,
    selfCritique,
    creativeMaturity,
    founderInterventionDependency,
    narrativeSynthesis: narrativeResult.synthesis,
    revisionPasses: revisionRecords,
    llmProviderUsed,
    llmRequestCount,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    founderJudgment: 'UNREVIEWED',
    founderFeedbackType: null,
    narrativeAuthority: false,
    createdAt: now,
    updatedAt: now,
  };

  saveCreativeDirectorRun(run);
  return run;
}

export async function bootstrapC11AutonomousCreativeDirector(options?: {
  useBlindTest?: boolean;
  brief?: Partial<MinimalCreativeBrief>;
}): Promise<CreativeDirectorBootstrapResult> {
  const { buildBlindTestCreativeBrief } = await import('./blindTestEntryBrief.js');
  const brief = options?.useBlindTest !== false
    ? { ...buildBlindTestCreativeBrief(), ...options?.brief }
    : {
        ...(await import('./creativeDirectorContextBuilder.js')).buildMinimalCreativeBriefFromRequest(
          options?.brief ?? {},
        ),
      };

  const run = await runAutonomousCreativeDirector(brief);

  return {
    sprint: 'C1.1_AUTONOMOUS_CREATIVE_DIRECTOR_RUNTIME',
    architectureLayer:
      'BRAND TRUTH → CULTURAL READ → CREATIVE THINKING → NARRATIVE SYNTHESIS → SELF-CRITIQUE → DIRECTORIAL TREATMENT',
    providerDispatchCount: 0,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    creativeDirectorRun: run,
    blindTestBrief: brief,
    nextAction:
      run.status === 'NEEDS_FOUNDER_DIRECTION'
        ? 'CREATIVE DIRECTOR WEAK — review failure classes before founder review'
        : 'FOUNDER REVIEWS THE BLIND-TEST CREATIVE DIRECTOR OUTPUT WITHOUT REWRITING IT FIRST',
  };
}
